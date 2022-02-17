// @ts-nocheck
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/** Seed Service stores and encrypts a user's seed or mnemonic phrase. */
export class SeedService {
    password: string;

    async storePassword(password: string): Promise<void> {
        this.password = password;
        console.log('storePassword', 'password', password);
    }

    async storeSeed(seed: string, password: string): Promise<void> {
        this.password = password;
        const encryptedSeed = await window.bananocoin.passwordUtils.encryptData(seed, password);
        window.localStorage.setItem('encryptedSeed', encryptedSeed);
        console.log('storeSeed', 'encryptedSeed', encryptedSeed);
    }

    async getSeed(): string {
        const encryptedSeed = window.localStorage.getItem('encryptedSeed')
        console.log('getSeed', 'encryptedSeed', encryptedSeed);
        const seed = await window.bananocoin.passwordUtils.decryptData(encryptedSeed, this.password);
        console.log('getSeed', 'seed', seed);
        return seed;
    }
}
