import { AppStateService } from '@app/services/app-state.service';
import { SecretService } from '@app/services/secret.service';
import { Injectable } from '@angular/core';
import { Banano } from 'hw-app-nano';
import TransportU2F from '@ledgerhq/hw-transport-u2f';

export type BananoifiedWindow = {
    bananocoin: any;
    bananocoinBananojs: any;
    bananocoinBananojsHw: any;
    TransportWebUSB: any;
    banotils: any;
} & Window;

declare let window: BananoifiedWindow;

@Injectable({
    providedIn: 'root',
})
export class SignerService {
    supportsWebUSB = false;
    u2fLoader;

    constructor(private readonly _secretService: SecretService, private readonly _appStateService: AppStateService) {}

    /** Checks if ledger is connected via USB & is unlocked, ready to use. */
    async checkLedgerOrError(): Promise<void> {
        const TransportWebUSB = window.TransportWebUSB;
        try {
            this.supportsWebUSB = await TransportWebUSB.isSupported();
            // eslint-disable-next-line no-console
            console.info('connectLedger', 'supportsWebUSB', this.supportsWebUSB);

            if (!this.supportsWebUSB) {
                await this.createU2FLoader();
                console.log('attempting to make U2F Loader');
                console.log(this.u2fLoader);
            }

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

    /** Returns a public address associated with the active wallet's index number. */
    async getAccountFromIndex(accountIndex: number): Promise<string> {
        if (this._appStateService.store.getValue().hasUnlockedSecret) {
            const seed = await this._secretService.getActiveWalletSeed();
            const privateKey = await window.bananocoinBananojs.getPrivateKey(seed, accountIndex);
            const publicKey = await window.bananocoinBananojs.getPublicKey(privateKey);
            const account = window.bananocoinBananojs.getBananoAccount(publicKey);
            return account;
        }

        if (this.supportsWebUSB) {
            const accountData = await window.bananocoin.bananojsHw.getLedgerAccountData(accountIndex);
            return accountData.account;
        }

        if (this.u2fLoader) {
            const accountData = await this.getLedgerAccountWebViaU2F(accountIndex);
            return accountData.address;
        }
    }

    async getAccountSigner(index: number): Promise<string> {
        if (this._appStateService.store.getValue().hasUnlockedSecret) {
            const seed = await this._secretService.getActiveWalletSeed();
            return await window.bananocoinBananojs.getPrivateKey(seed, index);
        }

        if (this.supportsWebUSB) {
            return await window.bananocoin.bananojsHw.getLedgerAccountSigner(index);
        }

        if (this.u2fLoader) {
            // TODO: get this out of here, MOVE TO BANANO JS HW.
            const getU2fSign = async (accountIx) => {
                const bananoConfig = {} as any;
                const bananodeApi = window.bananocoinBananojs.bananodeApi;

                bananoConfig.walletPrefix = `44'/198'/`;
                bananoConfig.prefix = window.bananocoinBananojs.BANANO_PREFIX;
                bananoConfig.bananodeUrl = 'https://kaliumapi.appditto.com/api';
                let accountData = await this.getLedgerAccountWebViaU2F(accountIx);
                const signer = {} as any;
                signer.getPublicKey = () => {
                    return accountData.publicKey;
                };
                signer.getAccount = () => {
                    return accountData.address;
                };
                signer.signBlock = async (blockData) => {
                    try {
                        // console.log('signer.signBlock', 'blockData', blockData);
                        const hwBlockData = {} as any;
                        if (blockData.previous == '0000000000000000000000000000000000000000000000000000000000000000') {
                            hwBlockData.representative = blockData.representative;
                            hwBlockData.balance = blockData.balance;
                            hwBlockData.sourceBlock = blockData.link;
                        } else {
                            hwBlockData.previousBlock = blockData.previous;
                            hwBlockData.representative = blockData.representative;
                            hwBlockData.balance = blockData.balance;
                            hwBlockData.recipient = window.bananocoinBananojs.getBananoAccount(blockData.link);

                            const cacheBlockData = {} as any;
                            const cacheBlocks = await bananodeApi.getBlocks([blockData.previous], true);
                            // console.log('signer.signBlock', 'cacheBlocks', cacheBlocks);
                            const cacheBlock = cacheBlocks.blocks[blockData.previous];
                            // console.log('signer.signBlock', 'cacheBlock', cacheBlock);
                            cacheBlockData.previousBlock = cacheBlock.previous;
                            cacheBlockData.representative = cacheBlock.representative;
                            cacheBlockData.balance = cacheBlock.balance;
                            cacheBlockData.recipient = window.bananocoinBananojs.getBananoAccount(cacheBlock.link);
                            // console.log('signer.signBlock', 'cacheBlockData', cacheBlockData);
                            try {
                                // const cacheResponse =
                                await this.u2fLoader.cacheBlock(
                                    this.getBananoLedgerPath(accountIx),
                                    cacheBlockData,
                                    cacheBlock.signature
                                );
                                // console.log('signer.signBlock', 'cacheResponse', cacheResponse);
                            } catch (error) {
                                console.log('signer.signBlock', 'error', error.message);
                                console.trace(error);
                            }
                        }

                        console.log('signer.signBlock', 'hwBlockData', hwBlockData);
                        const results = await this.u2fLoader.signBlock(
                            this.getBananoLedgerPath(accountIx),
                            hwBlockData
                        );
                        debugger;
                        return results;
                    } finally {
                        // .....
                    }
                };
                return signer;
            };

            return await getU2fSign(index);
        }
    }

    // TODO: Remove me, duplicate of bananojs hw
    private async getLedgerAccountWebViaU2F(accountIndex: number) {
        try {
            return await this.u2fLoader.getAddress(this.getBananoLedgerPath(accountIndex));
        } catch (err) {
            throw err;
        }
    }

    // TODO: Remove me, duplicate of bananojs hw
    private getBananoLedgerPath(accountIndex: number) {
        const walletPrefix = `44'/198'/`;
        return `${walletPrefix}${accountIndex}'`;
    }

    // TODO: Remove me, move this logic to bananojs hw
    /** https://github.com/Nault/Nault/blob/cd6d388e60ce84affaa813991445734cdf64c49f/src/app/services/ledger.service.ts#L268 */
    /** Creates alternative method for reading from USB, used in Firefox. Legacy technology; desperately want to remove this but people keep asking for Firefox support. */
    async createU2FLoader(): Promise<void> {
        return new Promise((resolve, reject) => {
            TransportU2F.create()
                .then((trans) => {
                    this.u2fLoader = new Banano(trans);
                    resolve();
                })
                .catch(reject);
        });
    }
}
