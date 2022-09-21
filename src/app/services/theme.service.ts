import { Injectable } from '@angular/core';

export type Theme = 'jungle-green' | 'banano-yellow' | 'nano-blue';

const JUNGLE_GREEN = 'jungle-green';
const BANANO_YELLOW = 'banano-yellow';
const NANO_BLUE = 'nano-blue';

@Injectable({
    providedIn: 'root',
})
/**
 * Theme service manages the on-screen palette.
 *
 * User's theme selection is stored in local_storage.
 *
 * Supports 3 themes - Green, Blue & Yellow; Green is default.
 * */
export class ThemeService {
    currentTheme: Theme;
    themeLocalStorageId = 'THEBANANOSTAND_THEME';

    constructor() {
        this.currentTheme = localStorage.getItem(this.themeLocalStorageId) as Theme;

        // Use dark theme by default.
        if (!this.currentTheme) {
            this.currentTheme = BANANO_YELLOW;
        }
        this.setTheme(this.currentTheme);
    }

    setTheme(newTheme: Theme): void {
        this.currentTheme = newTheme;

        document.body.classList.remove(BANANO_YELLOW);
        document.body.classList.remove(JUNGLE_GREEN);
        document.body.classList.remove(NANO_BLUE);
        document.body.classList.add(newTheme);
        setTimeout(() => {
            localStorage.setItem(this.themeLocalStorageId, newTheme);
        });
    }

    isDark(): boolean {
        return this.currentTheme === BANANO_YELLOW;
    }
}
