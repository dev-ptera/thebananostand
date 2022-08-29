import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-add-index-dialog',
    template: ` <app-add-index-overlay (close)="closeDialog()"></app-add-index-overlay> `,
})
export class AddIndexDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<AddIndexDialogComponent>) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
