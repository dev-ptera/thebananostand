import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyConversionService } from '@app/services/currency-conversion.service';

@Pipe({ name: 'conversionFromBAN', pure: true })
export class ConversionFromBANPipe implements PipeTransform {
    constructor(private readonly _currencyConversionService: CurrencyConversionService) {}

    transform(amount: number | string, conversionRate: number, bananoPriceUSD: number): string {
        const converted = Number(amount);
        if (isNaN(converted)) {
            return '0';
        }
        return this._currencyConversionService.convertBanAmountToLocalCurrency(
            converted,
            conversionRate,
            bananoPriceUSD
        );
    }
}
