import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-add-index-bottom-sheet',
    template: ` <app-add-index-overlay (close)="closeDialog()"></app-add-index-overlay> `,
    styleUrls: ['add-index-bottom-sheet.component.scss'],
    host: { class: 'app-add-index-bottom-sheet' },
})
export class AddIndexBottomSheetComponent {
    constructor(private readonly _sheet: MatBottomSheetRef<AddIndexBottomSheetComponent>) {}

    closeDialog(): void {
        this._sheet.dismiss();
    }
}
