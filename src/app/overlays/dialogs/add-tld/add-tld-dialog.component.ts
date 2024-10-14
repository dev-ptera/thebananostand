import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-add-tld-dialog',
    template: ` <app-add-tld-overlay (close)="closeDialog()"></app-add-tld-overlay> `,
})
export class AddTldDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<AddTldDialogComponent>) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
