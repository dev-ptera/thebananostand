// @ts-nocheck
import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import { environment } from '../../environments/environment';
import { SecretService } from '@app/services/secret.service';
import { WalletStorageService } from '@app/services/wallet-storage.service';
import { DatasourceService } from '@app/services/datasource.service';


const getDeferredPromise = () => {
    const defer = {
        promise: null,
        resolve: null,
        reject: null,
    };

    defer.promise = new Promise((resolve, reject) => {
        defer.resolve = resolve;
        defer.reject = reject;
    });

    return defer;
}
/**
 * Generate PoW using WebGL
 */
const getHashWebGL = (hash) => {
    const response = getDeferredPromise();

    const start = Date.now();
    try {
        window['BananoWebglPow'](hash, (work, n) => {
                console.log(`WebGL Worker: Found work (${work}) for ${hash} after ${(Date.now() - start) / 1000} seconds [${n} iterations]`);
                response.resolve(work);
            },
            n => {}
        );
    } catch(error) {
        console.error(error);
        if (error.message === 'webgl2_required') {
        }
        response.resolve(null);
    }

    return response.promise;
}


const defaultBananoJsGetGeneratedWork = window.bananocoinBananojs.bananodeApi.getGeneratedWork;
const getGeneratedWork = async (hash) => {
    console.log("The generated work override is called.");
    const doClientSidePow = true;
    if (doClientSidePow) {
        console.log('Performing Client-side POW');
        const start = new Date().getTime();
        let work = '';
        const doBlakeHashing = false;
        if (doBlakeHashing) {
            const workBytes = window.bananocoinBananojs.getZeroedWorkBytes();
            work = window.bananocoinBananojs.getWorkUsingCpu(hash, workBytes);
        } else {
            work = await getHashWebGL(hash);
        }
        const end = new Date().getTime();
        const time = end - start;
        console.log('Pow generation time was ' + time / 1000 + ' seconds');
        return work;

        // TODO
    } else {
        console.log('Performing Server-side POW');
        return defaultBananoJsGetGeneratedWork(hash);
    }
};

@Injectable({
    providedIn: 'root',
})
/** Services that handle send, receive, change transactions. */
export class TransactionService {
    constructor(
        private readonly _util: UtilService,
        private readonly _secretService: SecretService,
        private readonly _walletStorageService: WalletStorageService,
        private readonly _datasource: DatasourceService
    ) {
        console.log('setting it');
        console.log(this.hasWebGLSupport());
        window.bananocoinBananojs.bananodeApi.getGeneratedWork = getGeneratedWork;
    }


    private async _configApi(bananodeApi): Promise<void> {
        const client = await this._datasource.getRpcNode();
        bananodeApi.setUrl(client.nodeAddress);
        bananodeApi.setAuth(environment.token);
    }

    /** Attempts a withdrawal.  On success, returns transaction hash. */
    async withdraw(recipient: string, withdrawAmount: number, accountIndex: number): Promise<string> {
        const accountSigner = await this.getAccountSigner(accountIndex);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        await this._configApi(bananodeApi);
        const bananoUtil = window.bananocoinBananojs.bananoUtil;
        const config = window.bananocoinBananojsHw.bananoConfig;
        try {
            const amountRaw = window.bananocoinBananojs.getBananoDecimalAmountAsRaw(withdrawAmount);
            const response = await bananoUtil.sendFromPrivateKey(
                bananodeApi,
                accountSigner,
                recipient,
                amountRaw,
                config.prefix
            );
            return Promise.resolve(response);
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    /** Attempts to receive funds. */
    async receive(account: string, index: number, hash: string): Promise<string> {
        const config = window.bananocoinBananojsHw.bananoConfig;
        const accountSigner = await this.getAccountSigner(index);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        await this._configApi(bananodeApi);
        let representative = await bananodeApi.getAccountRepresentative(account);
        if (!representative) {
            // TODO populate this via the rep scores API. For now default to batman
            representative = 'ban_3batmanuenphd7osrez9c45b3uqw9d9u81ne8xa6m43e1py56y9p48ap69zg';
        }
        const loggingUtil = window.bananocoinBananojs.loggingUtil;
        const depositUtil = window.bananocoinBananojs.depositUtil;
        const receiveResponse =
            ((await depositUtil.receive(
                loggingUtil,
                bananodeApi,
                account,
                accountSigner,
                representative,
                hash,
                config.prefix
            )) as string) || ReceiveResponse;

        if (typeof receiveResponse === 'string') {
            return receiveResponse;
        }
        return receiveResponse.receiveBlocks[0];
    }


    public hasWebGLSupport() {
        if (this.webGLTested) return this.webGLAvailable;

        this.webGLTested = true;

        try {
            const canvas = document.createElement( 'canvas' );
            const webGL = !! window['WebGLRenderingContext'] && (canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ));
            this.webGLAvailable = !!webGL;
            return this.webGLAvailable;
        } catch (e) {
            this.webGLAvailable = false;
            return false;
        }
    };

    /** Attempts a change block.  On success, returns transaction hash. */
    async changeRepresentative(newRep: string, address: string, accountIndex: number): Promise<string> {
        const accountSigner = await this.getAccountSigner(accountIndex);
        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        await this._configApi(bananodeApi);
        const bananoUtil = window.bananocoinBananojs.bananoUtil;
        const config = window.bananocoinBananojsHw.bananoConfig;
        try {
            const response = await bananoUtil.change(bananodeApi, accountSigner, newRep, config.prefix);
            return Promise.resolve(response);
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async checkLedgerOrError(): Promise<void> {
        const config = window.bananocoinBananojsHw.bananoConfig;
        window.bananocoinBananojs.setBananodeApiUrl(config.bananodeUrl);
        const TransportWebUSB = window.TransportWebUSB;
        try {
            const isSupportedFlag = await TransportWebUSB.isSupported();
            // eslint-disable-next-line no-console
            console.info('connectLedger', 'isSupportedFlag', isSupportedFlag);
            // Check Ledger is connected & app is open:
            await this.getAccountFromIndex(0);
            return Promise.resolve();
        } catch (err) {
            console.error(err);
            if (err.message) {
                if (err.message.includes('No device selected')) {
                    return Promise.reject('No ledger device connected.');
                }
            }

            return Promise.reject('Error connecting ledger.');
        }
    }

    /** Given an index, reads ledger device & returns an address. */
    async getAccountFromIndex(accountIndex: number): Promise<string> {
        if (this._secretService.isLocalSecretUnlocked()) {
            const seed = await this._secretService.getSecret(this.getActiveWalletId());
            /** LocalMobile **/
            // const seed = '727A5E960F6189BBF196D84A6B7715D0A78DE82AC15BBDB340540076768CDB31'; // Low Fund Seed
            const privateKey = await window.bananocoinBananojs.getPrivateKey(seed, accountIndex);
            const publicKey = await window.bananocoinBananojs.getPublicKey(privateKey);
            const account = window.bananocoinBananojs.getBananoAccount(publicKey);
            return account;
        }
        const accountData = await window.bananocoin.bananojsHw.getLedgerAccountData(accountIndex);
        const account = accountData.account;
        return account;
    }

    getActiveWalletId(): number {
        return this._walletStorageService.getActiveWalletId();
    }

    async getAccountSigner(index: number): any {
        if (this._secretService.isLocalSecretUnlocked()) {
            const seed = await this._secretService.getSecret(this.getActiveWalletId());
            return await window.bananocoinBananojs.getPrivateKey(seed, index);
        }
        return await window.bananocoin.bananojsHw.getLedgerAccountSigner(index);
    }
}
