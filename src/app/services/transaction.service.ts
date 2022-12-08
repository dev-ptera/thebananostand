import { Injectable } from '@angular/core';
import { DatasourceService } from '@app/services/datasource.service';
import { AppStateService } from '@app/services/app-state.service';
import { SignerService } from '@app/services/signer.service';

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

type ReceiveBlock = {
    receiveBlocks: string[];
};

// eslint-disable-next-line no-console
const log = (msg: string): void => console.log(msg);

@Injectable({
    providedIn: 'root',
})
/** Services that handle send, receive, change transactions. */
export class TransactionService {
    constructor(
        private readonly _signerService: SignerService,
        private readonly _datasource: DatasourceService,
        private readonly _appStateService: AppStateService
    ) {}

    private async _configApi(bananodeApi): Promise<void> {
        const client = await this._datasource.getRpcClient();
        const sleep = (milliseconds): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));
        bananodeApi.setUrl(client.nodeAddress);
        while (window.isClientActivelyGeneratingWork) {
            log('I am not doing anything until the client stops trying to do work...');
            // eslint-disable-next-line no-await-in-loop
            await sleep(100);
        }
    }

    /** Attempts a withdrawal.  On success, returns transaction hash. */
    async withdraw(recipientAddress: string, withdrawAmount: number, accountIndex: number): Promise<string> {
        log('** Begin Send Transaction **');
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        await this._configApi(bananodeApi);
        const accountSigner = await this._signerService.getAccountSigner(accountIndex);
        const config = window.bananocoinBananojsHw.bananoConfig;

        try {
            const amountRaw = window.bananocoinBananojs.getBananoDecimalAmountAsRaw(withdrawAmount);
            const send = async (): Promise<string> =>
                await window.bananocoinBananojs.bananoUtil.sendFromPrivateKey(
                    bananodeApi,
                    accountSigner,
                    recipientAddress,
                    amountRaw,
                    config.prefix
                );

            const clientPowSend = send;
            const serverPowSend = send;
            window.shouldHaltClientSideWorkGeneration = false;
            return Promise.any([clientPowSend(), serverPowSend()]).then((sentHash: string) => {
                window.shouldHaltClientSideWorkGeneration = true;
                log(`Work Completed for Tx ${sentHash}.\n`);
                return Promise.resolve(sentHash);
            });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Attempts to receive funds.  Returns the hash of the received block. */
    async receive(account: string, index: number, hash: string): Promise<string> {
        log('** Begin Receive Transaction **');
        const config = window.bananocoinBananojsHw.bananoConfig;
        const accountSigner = await this._signerService.getAccountSigner(index);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        await this._configApi(bananodeApi);

        try {
            let representative = await bananodeApi.getAccountRepresentative(account);
            if (!representative) {
                representative = 'ban_3batmanuenphd7osrez9c45b3uqw9d9u81ne8xa6m43e1py56y9p48ap69zg';
            }

            const receive = async (): Promise<string> => {
                const receiveResponse = (await window.bananocoinBananojs.depositUtil.receive(
                    window.bananocoinBananojs.loggingUtil,
                    bananodeApi,
                    account,
                    accountSigner,
                    representative,
                    hash,
                    config.prefix
                )) as string | ReceiveBlock;

                if (typeof receiveResponse === 'string') {
                    return receiveResponse;
                }
                return receiveResponse.receiveBlocks[0];
            };

            const clientPowReceive = receive;
            const serverPowReceive = receive;
            window.shouldHaltClientSideWorkGeneration = false;
            return Promise.any([clientPowReceive(), serverPowReceive()]).then((receiveHash: string) => {
                window.shouldHaltClientSideWorkGeneration = true;
                log(`Work Completed for Tx ${receiveHash}.\n`);
                return Promise.resolve(receiveHash);
            });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /** Attempts a change block.  On success, returns transaction hash. */
    async changeRepresentative(newRep: string, address: string, accountIndex: number): Promise<string> {
        const accountSigner = await this._signerService.getAccountSigner(accountIndex);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        await this._configApi(bananodeApi);
        const bananoUtil = window.bananocoinBananojs.bananoUtil;
        const config = window.bananocoinBananojsHw.bananoConfig;
        try {
            const response = await bananoUtil.change(bananodeApi, accountSigner, newRep, config.prefix);
            return Promise.resolve(response);
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }
}
