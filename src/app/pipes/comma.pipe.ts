import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appComma' })
export class CommaPipe implements PipeTransform {
    transform(value: any): string {
        let adjustedValue = value;
        if (!value) {
            adjustedValue = 0;
        }

        return this.numberWithCommas(this.removeInsigFigs(Number(adjustedValue)));
    }

    removeInsigFigs(x: number): number {
        if (x > 100_000) {
            return Number(x.toFixed(2));
        }
        if (x > 1_000) {
            return Number(x.toFixed(2));
        }
        if (x > 100) {
            return Number(x.toFixed(4));
        }
        if (x > 1) {
            return Number(x.toFixed(5));
        }
        return Number(x.toFixed(6));
    }

    numberWithCommas(x: number): string {
        return x.toLocaleString('en');
    }
}
