import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-create-wallet-dialog',
    template: ` <app-create-wallet-overlay (close)="closeDialog()" [data]="data"></app-create-wallet-overlay> `,
})
export class CreateWalletDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private readonly _dialogRef: MatDialogRef<CreateWalletDialogComponent>
    ) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
