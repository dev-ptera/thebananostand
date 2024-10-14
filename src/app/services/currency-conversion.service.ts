import { Injectable } from '@angular/core';
import { ExchangeRate } from '@app/types/ExchangeRate';
import { SpyglassService } from '@app/services/spyglass.service';

@Injectable({
    providedIn: 'root',
})
/** Responsible for converting one currency to another.  */
export class CurrencyConversionService {
    exchangeRates: ExchangeRate[] = [];

    constructor(private readonly _spyglassService: SpyglassService) {
        void this._getExchangeRates();
    }

    private async _getExchangeRates(): Promise<void> {
        try {
            this.exchangeRates = await this._spyglassService.getExchangeRates();
        } catch (error) {
            console.error('Unable to fetch exchange rate data from Spyglass API Data Source:');
            console.error(error);
        }
    }

    convertToUSD(symbol: string): number {
        for (const exchangeRate of this.exchangeRates) {
            if (exchangeRate.id === symbol) {
                return exchangeRate.rate;
            }
        }
        return 0;
    }

    convertBanAmountToLocalCurrency(bananoAmount: number, conversionRate: number, bananoPriceUSD: number): string {
        if (!bananoAmount || !bananoPriceUSD || !conversionRate) {
            return '0';
        }
        return this._adjust(bananoPriceUSD * conversionRate * bananoAmount);
    }

    convertLocalCurrencyToBAN(localCurrencyAmount: number, conversionRate: number, bananoPriceUSD: number): string {
        if (!localCurrencyAmount || !bananoPriceUSD || !conversionRate) {
            return '0';
        }
        return this._adjust(localCurrencyAmount * (conversionRate / bananoPriceUSD));
    }

    private _adjust(converted: number): string {
        if (converted > 1) {
            return converted.toFixed(2);
        }
        return converted.toFixed(4);
    }
}
