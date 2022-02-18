// @ts-nocheck
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/** Seed Service stores and encrypts a user's seed or mnemonic phrase. */
export class SeedService {

    // TODO: Fix EMPTY password scenario.


    /** The password used to unlock the wallet. */
    password: string;

    readonly localStorageSeedId = 'encryptedSeed';

    hasSecret(): boolean {
        return Boolean(window.localStorage.getItem(this.localStorageSeedId));
    }

    async storePassword(password: string): Promise<void> {
        this.password = password;
        console.log('storePassword', 'password', password);
    }

    async storeSeed(seed: string, password: string): Promise<void> {
        this.password = password;
        const encryptedSeed = await window.bananocoin.passwordUtils.encryptData(seed, password);
        window.localStorage.setItem(this.localStorageSeedId, encryptedSeed);
        console.log('storeSeed', 'encryptedSeed', encryptedSeed);
    }

    async getSeed(): string {
        const encryptedSeed = window.localStorage.getItem(this.localStorageSeedId);
        console.log('getSeed', 'encryptedSeed', encryptedSeed);
        const seed = await window.bananocoin.passwordUtils.decryptData(encryptedSeed, this.password);
        console.log('getSeed', 'seed', seed);
        return seed;
    }

    // Throws an error if the login attempt fails.
    async unlockWallet(password: string): Promise<void> {
        const encryptedSeed = window.localStorage.getItem(this.localStorageSeedId);
        await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password);
        this.password = password;
    }

    isUnlocked(): boolean {
        return Boolean(this.password);
    }

    clearSeed(): void {
        window.localStorage.removeItem(this.localStorageSeedId);
        this.password = undefined;
    }
}
