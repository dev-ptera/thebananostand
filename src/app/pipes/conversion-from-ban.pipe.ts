import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyConversionService } from '@app/services/currency-conversion.service';

@Pipe({ name: 'conversionFromBAN', pure: true })
export class ConversionFromBANPipe implements PipeTransform {
    constructor(private readonly _currencyConversionService: CurrencyConversionService) {}

    transform(sendAmount: number, bananoPriceUSD: number, localCurrencyConversionRate: number): string {
        return this._currencyConversionService.convertBanAmountToLocalCurrency(
            sendAmount,
            bananoPriceUSD,
            localCurrencyConversionRate
        );
    }
}
