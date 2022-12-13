import { Injectable } from '@angular/core';
import { DatasourceService } from '@app/services/datasource.service';
import { AppStateService } from '@app/services/app-state.service';
import { SignerService } from '@app/services/signer.service';
import { RpcService } from '@app/services/rpc.service';
import { PowService } from '@app/services/pow.service';
import { ReceivableHash } from '@app/types/ReceivableHash';
import { AccountOverview } from '@app/types/AccountOverview';

export type BananoifiedWindow = {
    bananocoin: any;
    bananocoinBananojs: any;
    bananocoinBananojsHw: any;
    TransportWebUSB: any;
    banotils: any;
    shouldHaltClientSideWorkGeneration: boolean;
    isClientActivelyGeneratingWork: boolean;
} & Window;
declare let window: BananoifiedWindow;

declare type Block = {
    type: string;
    account: string;
    previous: string;
    representative: string;
    balance: string;
    link: string;
    signature: string;
    work?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    do_work?: string;
};

const getAmountPartsFromRaw = (amountRawStr: string): any =>
    window.bananocoinBananojs.BananoUtil.getAmountPartsFromRaw(amountRawStr, window.bananocoinBananojs.BANANO_PREFIX);

const signBlock = async (privateKey: string, block: Block): Promise<string> =>
    await window.bananocoinBananojs.BananoUtil.sign(privateKey, block);

const getPublicKeyFromPrivateKey = (privateKey: string): Promise<string> =>
    window.bananocoinBananojs.BananoUtil.getPublicKey(privateKey);

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
/** Services that handle send, receive, change transactions. */
export class TransactionService {
    constructor(
        private readonly _powService: PowService,
        private readonly _signerService: SignerService,
        private readonly _datasource: DatasourceService,
        private readonly _appStateService: AppStateService,
        private readonly _rpcService: RpcService
    ) {}

    private async _configApi(bananodeApi): Promise<void> {
        const client = await this._datasource.getRpcClient();
        bananodeApi.setUrl(client.nodeAddress);
        while (window.isClientActivelyGeneratingWork) {
            log('I am not doing anything until the client stops trying to do work...');
            // eslint-disable-next-line no-await-in-loop
            await sleep(100);
        }
    }

    private async _getEssentials(
        accountIndex
    ): Promise<{ privateKey: string; publicKey: string; publicAddress: string; accountInfo: AccountOverview }> {
        const privateKey = await this._signerService.getAccountSigner(accountIndex);
        const publicKey = await getPublicKeyFromPrivateKey(privateKey);
        const publicAddress = await getAddressFromPublicKey(publicKey);
        const accountInfo = await this._rpcService.getAccountInfoFromIndex(accountIndex, publicAddress);
        return { privateKey, publicKey, publicAddress, accountInfo };
    }

    /** Attempts a withdrawal.  On success, returns transaction hash. */
    async withdraw(recipientAddress: string, withdrawAmount: number, accountIndex: number): Promise<string> {
        log('** Begin Send Transaction **');
        await this._configApi(window.bananocoinBananojs.bananodeApi);
        const { privateKey, accountInfo } = await this._getEssentials(accountIndex);
        const balanceRaw = accountInfo.balanceRaw;
        const amountRaw = window.bananocoinBananojs.getBananoDecimalAmountAsRaw(withdrawAmount);

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
        const block: Block = {
            type: 'state',
            account: accountInfo.fullAddress,
            previous: accountInfo.frontier,
            representative: accountInfo.representative,
            balance: remainingDecimal,
            link: destPublicKey,
            signature: '',
        };
        block.signature = await signBlock(privateKey, block);

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
            return Promise.any([sendUsingClientPow()]).then((sentHash: string) => {
                window.shouldHaltClientSideWorkGeneration = true;
                log(`Completed TX ${sentHash}.\n`);
                return Promise.resolve(sentHash);
            });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Attempts to receive funds.  Returns the hash of the received block. */
    async receive(accountIndex: number, incoming: ReceivableHash): Promise<string> {
        log('** Begin Receive Transaction **');
        await this._configApi(window.bananocoinBananojs.bananodeApi);
        const { privateKey, publicKey, accountInfo } = await this._getEssentials(accountIndex);
        const accountBalanceRaw = accountInfo.balanceRaw;
        const valueRaw = (BigInt(incoming.receivableRaw) + BigInt(accountBalanceRaw)).toString();
        const isOpeningAccount = !accountInfo.representative;

        // TODO - Get this from the rep list, top rep please.
        const representative = isOpeningAccount
            ? 'ban_3batmanuenphd7osrez9c45b3uqw9d9u81ne8xa6m43e1py56y9p48ap69zg'
            : accountInfo.representative;
        const previous = isOpeningAccount
            ? '0000000000000000000000000000000000000000000000000000000000000000'
            : accountInfo.frontier;
        const subtype = isOpeningAccount ? 'open' : 'receive';
        const block: Block = {
            type: 'state',
            account: accountInfo.fullAddress,
            previous,
            representative,
            balance: valueRaw,
            link: incoming.hash,
            signature: '',
        };
        block.signature = await signBlock(privateKey, block);

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
                window.shouldHaltClientSideWorkGeneration = true;
                log(`Completed TX ${sentHash}.\n`);
                return Promise.resolve(sentHash);
            });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Attempts a change block.  On success, returns transaction hash. */
    async changeRepresentative(newRep: string, address: string, accountIndex: number): Promise<string> {
        log('** Begin Change Transaction **');
        await this._configApi(window.bananocoinBananojs.bananodeApi);
        const { privateKey, accountInfo } = await this._getEssentials(accountIndex);
        const block: Block = {
            type: 'state',
            account: accountInfo.fullAddress,
            previous: accountInfo.frontier,
            representative: accountInfo.representative,
            balance: accountInfo.balanceRaw,
            link: '0000000000000000000000000000000000000000000000000000000000000000',
            signature: '',
        };
        block.signature = await signBlock(privateKey, block);

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
                window.shouldHaltClientSideWorkGeneration = true;
                log(`Completed TX ${changeHash}.\n`);
                return Promise.resolve(changeHash);
            });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }
}
