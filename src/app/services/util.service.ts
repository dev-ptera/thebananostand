import { Injectable } from '@angular/core';

export type BananoifiedWindow = {
    clipboardData: any;
} & Window;
declare let window: BananoifiedWindow;

@Injectable({
    providedIn: 'root',
})
/**
 * This a generic utilities service.  Any one-off functions can be found here.
 * */
export class UtilService {
    numberWithCommas(x: number | string, precision = 6): string {
        if (!x && x !== 0) {
            return '';
        }

        const fixed = Number(Number(x).toFixed(precision));
        const parts = fixed.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    shortenAddress(addr: string): string {
        if (!addr) {
            return undefined;
        }
        return `${addr.substr(0, 12)}...${addr.substr(addr.length - 6, addr.length)}`;
    }

    formatHtmlAddress(addr: string): string {
        const ban = addr.substring(0, 4);
        const first7 = addr.substring(4, 12);
        const middle = addr.substring(12, addr.length - 7);
        const last6 = addr.substring(addr.length - 7, addr.length);
        return `${ban}<strong class="primary">${first7}</strong>${middle}<strong class="primary">${last6}</strong>`;
    }

    isValidAddress(address: string): boolean {
        return address && address.length === 64 && address.startsWith('ban_');
    }

    matches(a: number, b: number): boolean {
        return Number(a) === Number(b);
    }

    clipboardCopy(text: string): void {
        console.log('requesting ' + text + ' to be copied to clipboard');
        /* https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript */
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            return window.clipboardData.setData('Text', text);
        } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
            const textarea = document.createElement('textarea');
            textarea.textContent = text;
            textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy'); // Security exception may be thrown by some browsers.
            } catch (ex) {
                console.error(ex);
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }
}
