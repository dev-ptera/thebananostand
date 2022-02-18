import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/** Seed Service stores and encrypts a user's seed or mnemonic phrase. */
export class SeedService {

    /** The password used to unlock the wallet. */
    password: string;

    unlockedLocalSeed = false;
    unlockedLocalLedger = false;

    readonly localStorageSeedId = 'encryptedSeed';

    async storeSeed(seed: string, password: string): Promise<void> {
        this.password = password;
        this.unlockedLocalSeed = true;
        // @ts-ignore
        const encryptedSeed = await window.bananocoin.passwordUtils.encryptData(seed, password);
        window.localStorage.setItem(this.localStorageSeedId, encryptedSeed);
    }

    async getSeed(): Promise<string>  {
        const encryptedSeed = window.localStorage.getItem(this.localStorageSeedId);
        // @ts-ignore
        const seed = await window.bananocoin.passwordUtils.decryptData(encryptedSeed, this.password);
        return seed;
    }

    // Throws an error if the login attempt fails.
    async unlockWallet(password: string): Promise<void> {
        const encryptedSeed = window.localStorage.getItem(this.localStorageSeedId);
        // @ts-ignore
        await window.bananocoin.passwordUtils.decryptData(encryptedSeed, password);
        this.password = password;
        this.unlockedLocalSeed = true;
    }

    isLocalSeedUnlocked(): boolean {
        return this.unlockedLocalSeed;
    }

    isLocalLedgerUnlocked(): boolean {
        return this.unlockedLocalLedger;
    }

    hasSecret(): boolean {
        const secret = window.localStorage.getItem(this.localStorageSeedId);
        return Boolean(secret);
    }

    clearSeed(): void {
        window.localStorage.removeItem(this.localStorageSeedId);
        this.password = undefined;
    }
}
