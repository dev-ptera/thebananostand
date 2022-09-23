import { Injectable } from '@angular/core';
import { ACTIVE_WALLET_ID } from '@app/services/transaction.service';

export type LocalStorageWallet = {
    encryptedSeed: string;
    walletId: number;
    name: string;
};

@Injectable({
    providedIn: 'root',
})

/** Responsible for managing anything stored in localstorage -
 * wallet names, wallet ids, active wallet id, account indexes per wallet */
export class WalletStorageService {
    private readonly ENCRYPTED_WALLETS = 'bananostand_encryptedWallets';

    setActiveWalletId(id: number): void {
        window.localStorage.setItem(ACTIVE_WALLET_ID, String(id));
    }

    getActiveWalletId(): number {
        return Number(window.localStorage.getItem(ACTIVE_WALLET_ID));
    }

    getNumberOfWallets(): number {
        try {
            const encryptedWallets = JSON.parse(window.localStorage.getItem(this.ENCRYPTED_WALLETS));
            return Number(encryptedWallets.length) + 1;
        } catch (err) {
            console.error(err);
            return 0;
        }
    }

    getWallets(): LocalStorageWallet[] {
        try {
            const encryptedWallets = JSON.parse(
                window.localStorage.getItem(this.ENCRYPTED_WALLETS)
            ) as LocalStorageWallet[];
            return encryptedWallets;
        } catch (err) {
            return [];
        }
    }

    getActiveWallet(): LocalStorageWallet {
        const id = this.getActiveWalletId();
        return this.getWalletFromId(id);
    }

    getWalletFromId(id: number): LocalStorageWallet {
        for (const wallet of this.getWallets()) {
            if (Number(wallet.walletId) === id) {
                return wallet;
            }
        }
    }

    storeWalletDetails(wallet: LocalStorageWallet): void {
        try {
            const encryptedWallets = JSON.parse(window.localStorage.getItem(this.ENCRYPTED_WALLETS));
            encryptedWallets.push(wallet);
            window.localStorage.setItem(this.ENCRYPTED_WALLETS, JSON.stringify(encryptedWallets));
        } catch (err) {
            window.localStorage.setItem(this.ENCRYPTED_WALLETS, JSON.stringify([wallet]));
        }
    }
}
