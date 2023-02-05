import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyConversionService } from '@app/services/currency-conversion.service';

@Pipe({ name: 'conversionToBAN', pure: true })
export class ConversionToBANPipe implements PipeTransform {
    constructor(private readonly _currencyConversionService: CurrencyConversionService) {}

    transform(sendAmount: number | string): string {
        const converted = Number(sendAmount);
        if (isNaN(converted)) {
            return '0';
        }
        return this._currencyConversionService.convertLocalCurrencyToBAN(converted);
    }
}
