import { Injectable } from '@angular/core';
import * as copy from 'copy-to-clipboard';

@Injectable({
    providedIn: 'root',
})
/**
 * This a generic utilities service.  Any one-off functions can be found here.
 * */
export class UtilService {
    /* eslint-disable */
    removeExponents(n) {
        let sign = +n < 0 ? '-' : '',
            toStr = n.toString();
        if (!/e/i.test(toStr)) {
            return n;
        }
        let [lead, decimal, pow] = n
            .toString()
            .replace(/^-/, '')
            .replace(/^([0-9]+)(e.*)/, '$1.$2')
            .split(/e|\./);
        return +pow < 0
            ? sign + '0.' + '0'.repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) + lead + decimal
            : sign +
                  lead +
                  (+pow >= decimal.length
                      ? decimal + '0'.repeat(Math.max(+pow - decimal.length || 0, 0))
                      : decimal.slice(0, +pow) + '.' + decimal.slice(+pow));
    }
    /* eslint-enable */

    /** Given raw, converts BAN to a decimal. */
    convertRawToBan(raw: string): number {
        // @ts-ignore
        const bananoJs = window.bananocoinBananojs;
        const balanceParts = bananoJs.getBananoPartsFromRaw(raw);
        if (balanceParts.raw === '0') {
            delete balanceParts.raw;
        }
        return bananoJs.getBananoPartsAsDecimal(balanceParts);
    }

    convertBanToRaw(ban: number | string): string {
        // @ts-ignore
        return window.bananocoinBananojs.getBananoDecimalAmountAsRaw(ban);
    }

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

    isValidHex(hex: string): boolean {
        const validHexChars: string[] = [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
        ];
        return hex.split('').every((value) => validHexChars.includes(value.toUpperCase()));
    }

    matches(a: number, b: number): boolean {
        return Number(a) === Number(b);
    }

    clipboardCopy(text: string): void {
        copy(text);
    }

    /** Given a number of days, returns a string representation of time (e.g 3 weeks ago). */
    getRelativeTime(timestamp: number): string {
        const currentDate = new Date().getTime() / 1000;
        const oneDay = 24 * 60 * 60; // hours*minutes*seconds*milliseconds
        const days = timestamp ? (currentDate - timestamp) / oneDay : undefined;
        if (!days) {
            return '';
        }

        if (days > 365) {
            const years = Math.round(days / 365);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
        if (days > 30) {
            const months = Math.round(days / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        if (days > 7) {
            const weeks = Math.round(days / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        }
        if (days >= 1) {
            const rounded = Math.round(days);
            return `${rounded} day${rounded > 1 ? 's' : ''} ago`;
        }
        if (days < 1) {
            const hours = days * 24;
            if (hours > 1) {
                const roundedHours = Math.round(hours);
                return `${roundedHours} hour${roundedHours > 1 ? 's' : ''} ago`;
            }
            const roundedMinutes = Math.round(hours * 60);
            if (roundedMinutes >= 1) {
                return `${roundedMinutes} min${roundedMinutes > 1 ? 's' : ''} ago`;
            }
            const seconds = Math.round(days * 24 * 60 * 60);
            return `${seconds} sec ago`;
        }
    }
}
