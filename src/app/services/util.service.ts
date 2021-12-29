import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilService {
    numberWithCommas(x: number | string, precision: number): string {
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
        return `${ban}<strong>${first7}</strong>${middle}<strong>${last6}</strong>`;
    }

    isValidAddress(address: string): boolean {
        return address && address.length === 64 && address.startsWith('ban_');
    }
}
