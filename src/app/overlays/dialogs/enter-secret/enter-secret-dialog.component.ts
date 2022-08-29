import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-enter-secret-dialog',
    template: ` <app-enter-secret-overlay (close)="closeDialog()"></app-enter-secret-overlay> `,
})
export class EnterSecretDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<EnterSecretDialogComponent>) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
