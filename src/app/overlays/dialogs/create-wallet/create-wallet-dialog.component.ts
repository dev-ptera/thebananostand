import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-create-wallet-dialog',
    template: ` <app-create-wallet-overlay (close)="closeDialog()"></app-create-wallet-overlay> `,
})
export class CreateWalletDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<CreateWalletDialogComponent>) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
