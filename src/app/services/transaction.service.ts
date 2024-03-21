import { Injectable } from '@angular/core';
import { DatasourceService } from '@app/services/datasource.service';
import { AppStateService } from '@app/services/app-state.service';
import { SignerService } from '@app/services/signer.service';
import { RpcService } from '@app/services/rpc.service';
import { PowService } from '@app/services/pow.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { TransactionBlock } from '@app/types/TransactionBlock';
import { ReceivableTx } from '@app/types/ReceivableTx';
import { UtilService } from '@app/services/util.service';

type BananoifiedWindow = {
    bananocoinBananojs: any;
    shouldHaltClientSideWorkGeneration: boolean;
    isClientActivelyGeneratingWork: boolean;
} & Window;
declare let window: BananoifiedWindow;

const getAmountPartsFromRaw = (amountRawStr: string): any =>
    window.bananocoinBananojs.BananoUtil.getAmountPartsFromRaw(amountRawStr, window.bananocoinBananojs.BANANO_PREFIX);

const signBlock = async (privateKeyOrSigner: string | object, block: TransactionBlock): Promise<string> =>
    await window.bananocoinBananojs.BananoUtil.sign(privateKeyOrSigner, block);

const signMessage = (privateKeyOrSigner: string | object, message: string): string =>
    window.bananocoinBananojs.BananoUtil.signMessage(privateKeyOrSigner, message);

const verifyMessage = (publicKey: string, message: string, signature: string): boolean =>
    window.bananocoinBananojs.BananoUtil.verifyMessage(publicKey, message, signature);

const getPublicKeyFromPrivateKeyOrSigner = (privateKeyOrSigner: string | object): Promise<string> =>
    window.bananocoinBananojs.BananoUtil.getPublicKey(privateKeyOrSigner);

const getPublicKeyFromAccount = (privateKey: string): string =>
    window.bananocoinBananojs.BananoUtil.getAccountPublicKey(privateKey);

const getAddressFromPublicKey = async (publicKey: string): Promise<string> =>
    await window.bananocoinBananojs.getBananoAccount(publicKey);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line no-console
const log = (msg: string): void => console.log(msg);

@Injectable({
    providedIn: 'root',
})
/** Handles send, receive, & change transactions.
 *  Each transaction that is processed has to perform a Proof-of-Work (PoW) before the transaction is valid & broadcasted.
 *
 *  Each transaction attempts to generate PoW, in a race, via RPC node (server-side) & locally (client-side).
 *  The faster proof-of-work provider returns the work which is used to send the transaction.
 * */
export class TransactionService {
    constructor(
        private readonly _powService: PowService,
        private readonly _signerService: SignerService,
        private readonly _datasource: DatasourceService,
        private readonly _appStateService: AppStateService,
        private readonly _rpcService: RpcService,
        private readonly _util: UtilService
    ) {}

    private async _configApi(bananodeApi): Promise<void> {
        const client = await this._datasource.getRpcClient();
        bananodeApi.setUrl(client.nodeAddress);

        // Waits for the client to stop attempting to process work before continuing onto the next transaction.
        while (window.isClientActivelyGeneratingWork) {
            log('I am not doing anything until the client stops trying to do work...');
            // eslint-disable-next-line no-await-in-loop
            await sleep(100);
        }
    }

    private async _getTransactionEssentials(accountIndex): Promise<{
        privateKeyOrSigner: string | object;
        publicKey: string;
        publicAddress: string;
        accountInfo: AccountOverview;
    }> {
        const { privateKeyOrSigner, publicKey, publicAddress } = await this.getSigningEssentials(accountIndex);
        const accountInfo = await this._rpcService.getAccountInfoFromIndex(accountIndex, publicAddress);
        return { privateKeyOrSigner, publicKey, publicAddress, accountInfo };
    }

    async getSigningEssentials(
        accountIndex: number
    ): Promise<{ privateKeyOrSigner: string | object; publicKey: string; publicAddress: string }> {
        const privateKeyOrSigner = await this._signerService.getAccountSigner(accountIndex);
        const publicKey = await getPublicKeyFromPrivateKeyOrSigner(privateKeyOrSigner);
        const publicAddress = await getAddressFromPublicKey(publicKey);
        return { privateKeyOrSigner, publicKey, publicAddress };
    }

    async dummyBlockSign(message: string, accountIndex: number): Promise<string> {
        log('** Begin Dummy Block Sign **');

        await this._configApi(window.bananocoinBananojs.bananodeApi);
        const { privateKeyOrSigner, publicAddress } = await this.getSigningEssentials(accountIndex);
        // TODO:
        const messageRepresentative = '';

        const block: TransactionBlock = {
            type: 'state',
            account: publicAddress,
            previous: '0000000000000000000000000000000000000000000000000000000000000000',
            representative: messageRepresentative,
            balance: '0',
            link: '0000000000000000000000000000000000000000000000000000000000000000',
            signature: '',
            work: undefined,
        };

        const signature = await signBlock(privateKeyOrSigner, block);

        return signature;
    }

    /** Attempts a withdrawal.  On success, returns transaction hash. */
    async withdraw(recipientAddress: string, amountRaw: string, accountIndex: number): Promise<string> {
        log('** Begin Send Transaction **');
        await this._configApi(window.bananocoinBananojs.bananodeApi);
        const { privateKeyOrSigner, accountInfo } = await this._getTransactionEssentials(accountIndex);
        const balanceRaw = accountInfo.balanceRaw;

        if (BigInt(balanceRaw) < BigInt(amountRaw)) {
            const balance = getAmountPartsFromRaw(balanceRaw);
            const amount = getAmountPartsFromRaw(amountRaw);
            const balanceMajorAmount = balance.banano;
            const amountMajorAmount = amount.banano;
            throw Error(`The server's account balance of ${balanceMajorAmount} banano is too small,
            cannot withdraw ${amountMajorAmount} banano. In raw ${balanceRaw} < ${amountRaw}.`);
        }

        const remaining = BigInt(balanceRaw) - BigInt(amountRaw);
        const remainingDecimal = remaining.toString(10);
        const destPublicKey = getPublicKeyFromAccount(recipientAddress);
        const block: TransactionBlock = {
            type: 'state',
            account: accountInfo.fullAddress,
            previous: accountInfo.frontier,
            representative: accountInfo.representative,
            balance: remainingDecimal,
            link: destPublicKey,
            signature: '',
            work: undefined,
        };
        block.signature = await signBlock(privateKeyOrSigner, block);

        const sendUsingServerPow = async (): Promise<string> => {
            block.work = await this._powService.generateRemoteWork(accountInfo.frontier);
            return await this._rpcService.process(block, 'send');
        };
        const sendUsingClientPow = async (): Promise<string> => {
            window.shouldHaltClientSideWorkGeneration = false;
            block.work = await this._powService.generateLocalWork(accountInfo.frontier);
            return await this._rpcService.process(block, 'send');
        };

        try {
            return Promise.any([sendUsingClientPow(), sendUsingServerPow()]).then((sentHash: string) => {
                this._powService.terminateClientSidePow();
                log(`Completed TX ${sentHash}.\n`);
                return Promise.resolve(sentHash);
            });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Attempts to receive funds.  Returns the hash of the received block. */
    async receive(accountIndex: number, incoming: ReceivableTx): Promise<string> {
        log('** Begin Receive Transaction **');
        await this._configApi(window.bananocoinBananojs.bananodeApi);
        const { privateKeyOrSigner, publicKey, accountInfo } = await this._getTransactionEssentials(accountIndex);
        const accountBalanceRaw = accountInfo.balanceRaw;
        const valueRaw = (BigInt(incoming.amountRaw) + BigInt(accountBalanceRaw)).toString();
        const isOpeningAccount = !accountInfo.representative;

        const beforeTxBan = this._util.convertRawToBan(accountBalanceRaw);
        const afterTxBan = this._util.convertRawToBan(valueRaw);
        if (afterTxBan < beforeTxBan) {
            console.error('Receivable block lowers account balance, rejecting block.', beforeTxBan, afterTxBan);
            return undefined;
        }

        // TODO - Get this from the rep list, top rep please.
        const representative = isOpeningAccount
            ? 'ban_3batmanuenphd7osrez9c45b3uqw9d9u81ne8xa6m43e1py56y9p48ap69zg'
            : accountInfo.representative;
        const previous = isOpeningAccount
            ? '0000000000000000000000000000000000000000000000000000000000000000'
            : accountInfo.frontier;
        const subtype = isOpeningAccount ? 'open' : 'receive';
        const block: TransactionBlock = {
            type: 'state',
            account: accountInfo.fullAddress,
            previous,
            representative,
            balance: valueRaw,
            link: incoming.hash,
            signature: '',
            work: undefined,
        };
        block.signature = await signBlock(privateKeyOrSigner, block);

        const workHash = isOpeningAccount ? publicKey : accountInfo.frontier;
        const receiveUsingServerPow = async (): Promise<string> => {
            block.work = await this._powService.generateRemoteWork(workHash);
            return await this._rpcService.process(block, subtype);
        };
        const receiveUsingClientPow = async (): Promise<string> => {
            window.shouldHaltClientSideWorkGeneration = false;
            block.work = await this._powService.generateLocalWork(workHash);
            return await this._rpcService.process(block, subtype);
        };

        try {
            return Promise.any([receiveUsingServerPow(), receiveUsingClientPow()]).then((sentHash: string) => {
                this._powService.terminateClientSidePow();
                log(`Completed TX ${sentHash}.\n`);
                return Promise.resolve(sentHash);
            });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Attempts a change block.  On success, returns transaction hash. */
    async changeRepresentative(newRep: string, accountIndex: number): Promise<string> {
        log('** Begin Change Transaction **');
        await this._configApi(window.bananocoinBananojs.bananodeApi);
        const { privateKeyOrSigner, accountInfo } = await this._getTransactionEssentials(accountIndex);
        const block: TransactionBlock = {
            type: 'state',
            account: accountInfo.fullAddress,
            previous: accountInfo.frontier,
            representative: newRep,
            balance: accountInfo.balanceRaw,
            link: '0000000000000000000000000000000000000000000000000000000000000000',
            signature: '',
            work: undefined,
        };
        block.signature = await signBlock(privateKeyOrSigner, block);

        const changeUsingServerPow = async (): Promise<string> => {
            block.work = await this._powService.generateRemoteWork(accountInfo.frontier);
            return await this._rpcService.process(block, 'change');
        };
        const changeUsingClientPow = async (): Promise<string> => {
            window.shouldHaltClientSideWorkGeneration = false;
            block.work = await this._powService.generateLocalWork(accountInfo.frontier);
            return await this._rpcService.process(block, 'change');
        };

        try {
            return Promise.any([changeUsingServerPow(), changeUsingClientPow()]).then((changeHash: string) => {
                this._powService.terminateClientSidePow();
                log(`Completed TX ${changeHash}.\n`);
                return Promise.resolve(changeHash);
            });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Not transaction, but signs block */
    async blockSign(block: TransactionBlock, accountIndex: number): Promise<string> {
        const { privateKeyOrSigner, accountInfo } = await this._getTransactionEssentials(accountIndex);
        //we are getting the signature, but signature is required, so block.signature === ""
        //fill in defaults
        if (!block.account) {
            block.account = accountInfo.fullAddress;
        }
        if (!block.previous) {
            block.previous = accountInfo.frontier;
        }
        if (!block.representative) {
            block.representative = accountInfo.representative;
        }
        return await signBlock(privateKeyOrSigner, block);
    }

    /** Not transaction, but signs message */
    async messageSign(message: string, accountIndex: number): Promise<string> {
        const { privateKeyOrSigner } = await this.getSigningEssentials(accountIndex);
        return signMessage(privateKeyOrSigner, message);
    }

    /** Verify signature is valid */
    verifySign(address: string, message: string, sign: string): boolean {
        const publicKey = getPublicKeyFromAccount(address);
        return verifyMessage(publicKey, message, sign);
    }
}
