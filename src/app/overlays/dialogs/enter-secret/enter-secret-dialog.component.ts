import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-enter-secret-dialog',
    template: ` <app-enter-secret-overlay (closeWithNewWallet)="closeDialog($event)"></app-enter-secret-overlay> `,
})
export class EnterSecretDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<EnterSecretDialogComponent>) {}

    closeDialog(hasCreatedNewWallet: boolean): void {
        this._dialogRef.close(hasCreatedNewWallet);
    }
}
