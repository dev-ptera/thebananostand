import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/** Seed Service stores and encrypts a user's seed or mnemonic phrase. */
export class SeedService {
    seed: string;

    storeSeed(seed: string): void {
        this.seed = seed;
    }
}
