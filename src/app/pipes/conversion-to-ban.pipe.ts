import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyConversionService } from '@app/services/currency-conversion.service';

@Pipe({ name: 'conversionToBAN', pure: true })
export class ConversionToBANPipe implements PipeTransform {
    constructor(private readonly _currencyConversionService: CurrencyConversionService) {}

    transform(sendAmount: number): string {
        return this._currencyConversionService.convertLocalCurrencyToBAN(sendAmount);
    }
}
