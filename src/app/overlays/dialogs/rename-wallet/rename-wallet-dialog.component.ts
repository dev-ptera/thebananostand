import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-rename-wallet-dialog',
    template: ` <app-rename-wallet-overlay (close)="closeDialog()"></app-rename-wallet-overlay> `,
})
export class RenameWalletDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<RenameWalletDialogComponent>) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
