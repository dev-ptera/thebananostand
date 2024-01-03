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

    timestampToRelative(timestamp: number): string {
        const timeDiff: number = Math.floor(Date.now() / 1000) - timestamp;
        let ago: number;
        let unit: string;
        if (timeDiff < 60 * 60) {
            ago = timeDiff / 60;
            unit = 'minute';
        } else if (timeDiff < 24 * 60 * 60) {
            ago = timeDiff / (60 * 60);
            unit = 'hour';
        } else if (timeDiff < 30 * 24 * 60 * 60) {
            ago = timeDiff / (24 * 60 * 60);
            unit = 'day';
        } else if (timeDiff < 12 * 30 * 24 * 60 * 60) {
            ago = timeDiff / (30 * 24 * 60 * 60);
            unit = 'month';
        } else {
            ago = timeDiff / (12 * 30 * 24 * 60 * 60);
            unit = 'year';
        }
        ago = Math.round(ago);
        return `${ago} ${unit}${ago !== 1 ? 's' : ''} ago`;
    }
}
