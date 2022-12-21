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
    async convertRawToBan(raw: string): Promise<number> {
        // @ts-ignore
        const bananoJs = window.bananocoinBananojs;
        const balanceParts = await bananoJs.getBananoPartsFromRaw(raw);
        if (balanceParts.raw === '0') {
            delete balanceParts.raw;
        }
        return await bananoJs.getBananoPartsAsDecimal(balanceParts);
    }

    convertBanToRaw(ban: number): string {
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

    matches(a: number, b: number): boolean {
        return Number(a) === Number(b);
    }

    clipboardCopy(text: string): void {
        copy(text);
    }
}
