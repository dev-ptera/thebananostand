import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChangeRepOverlayData } from '@app/overlays/actions/change-rep/change-rep.component';

@Component({
    selector: 'app-change-password-dialog',
    template: ` <app-change-password-overlay (close)="closeDialog()"></app-change-password-overlay> `,
})
export class ChangePasswordDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ChangeRepOverlayData,
        private readonly _dialogRef: MatDialogRef<ChangePasswordDialogComponent>
    ) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
