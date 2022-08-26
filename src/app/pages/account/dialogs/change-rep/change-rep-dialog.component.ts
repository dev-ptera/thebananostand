import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChangeRepOverlayData } from '@app/pages/account/actions/change-rep/change-rep.component';

@Component({
    selector: 'app-change-rep-dialog',
    template: ` <app-change-rep-overlay [data]="data" (closeWithHash)="closeDialog($event)"></app-change-rep-overlay> `,
})
export class ChangeRepDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ChangeRepOverlayData,
        private readonly _dialogRef: MatDialogRef<ChangeRepDialogComponent>
    ) {}

    closeDialog(hash: string): void {
        this._dialogRef.close(hash);
    }
}
