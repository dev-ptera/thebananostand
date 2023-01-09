import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-change-password-bottom-sheet',
    template: ` <app-change-password-overlay (close)="close()"></app-change-password-overlay> `,
})
export class ChangePasswordBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<ChangePasswordBottomSheetComponent>) {}

    close(): void {
        this._sheet.dismiss();
    }
}
