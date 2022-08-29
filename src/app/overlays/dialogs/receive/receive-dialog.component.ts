import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReceiveOverlayData } from '@app/overlays/actions/receive/receive.component';

@Component({
    selector: 'app-receive-dialog',
    template: ` <app-receive-overlay [data]="data" (closeWithHash)="closeDialog($event)"></app-receive-overlay> `,
})
export class ReceiveDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ReceiveOverlayData,
        private readonly _dialogRef: MatDialogRef<ReceiveDialogComponent>
    ) {}

    closeDialog(hash: string): void {
        this._dialogRef.close(hash);
    }
}
