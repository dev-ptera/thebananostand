import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatasourceService } from '@app/services/datasource.service';

type SymbolsResponse = {
    symbols: {
        [symbol: string]: Currency;
    };
};

type Currency = {
    description: string;
    code: string;
};

@Injectable({
    providedIn: 'root',
})

/** Responsible for converting one currency to another.
 * Primarily uses this API for conversions: https://exchangerate.host/#/
 * */
export class CurrencyConversionService {
    currencies: Currency[] = [];

    constructor(private readonly _http: HttpClient, private readonly _datasource: DatasourceService) {
        this.getSymbols();
    }

    getSymbols(): void {
        const url = 'https://api.exchangerate.host/symbols';
        this._http.get<SymbolsResponse>(url).subscribe((data) => {
            for (const key in data.symbols) {
                this.currencies.push({
                    description: data.symbols[key].description,
                    code: data.symbols[key].code,
                });
            }
        });
    }

    convertToUSD(symbol: string): Promise<number> {
        const url = `https://api.exchangerate.host/convert?from=${symbol}&to=USD`;
        return new Promise((resolve) => {
            this._http.get<{ info: { rate: number } }>(url).subscribe((data) => {
                resolve(data.info.rate);
            });
        });
    }

    private _adjust(converted: number): string {
        if (converted > 1) {
            return converted.toFixed(2);
        }
        return converted.toFixed(4);
    }

    convertBanAmountToLocalCurrency(bananoAmount: number, bananoPriceUSD: number, conversionRate: number): string {
        if (!bananoAmount || !bananoPriceUSD || !conversionRate) {
            return '0';
        }
        return this._adjust((bananoPriceUSD / conversionRate) * bananoAmount);
    }

    convertLocalCurrencyToBAN(localCurrencyAmount: number, bananoPriceUSD: number, conversionRate: number): string {
        if (!localCurrencyAmount || !bananoPriceUSD || !conversionRate) {
            return '0';
        }
        return this._adjust(localCurrencyAmount * (conversionRate / bananoPriceUSD));
    }
}
