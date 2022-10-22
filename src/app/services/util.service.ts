import { Injectable } from '@angular/core';

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
        window.focus();
        setTimeout(() => {
            try {
                // Attempt 1
                void navigator.clipboard.writeText(text);
            } catch (err1) {
                // Attempt 2
                try {
                    console.error(err1);
                    const el = document.createElement('textarea');
                    el.value = text;
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                } catch (err2) {
                    console.error(err2);
                }
            }
        });
    }
}
