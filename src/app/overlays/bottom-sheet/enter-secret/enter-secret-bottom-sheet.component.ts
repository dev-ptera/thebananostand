import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-enter-secret-bottom-sheet',
    template: ` <app-enter-secret-overlay (close)="closeSheet()"></app-enter-secret-overlay> `,
    styleUrls: ['enter-secret-bottom-sheet.component.scss'],
    host: { class: 'app-enter-secret-bottom-sheet' },
})
export class EnterSecretBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<EnterSecretBottomSheetComponent>) {}

    closeSheet(): void {
        this._sheet.dismiss();
    }
}
