import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-address-wallet-dialog',
    template: `
        <app-rename-address-overlay [address]="data.address" (close)="closeDialog()"></app-rename-address-overlay>
    `,
})
export class RenameAddressDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { address: string },
        private readonly _dialogRef: MatDialogRef<RenameAddressDialogComponent>
    ) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
