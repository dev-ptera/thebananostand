import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SendOverlayData } from '@app/overlays/actions/send/send.component';

@Component({
    selector: 'app-change-rep-dialog',
    template: ` <app-send-overlay [data]="data" (closeWithHash)="closeDialog($event)"></app-send-overlay> `,
})
export class SendDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: SendOverlayData,
        private readonly _dialogRef: MatDialogRef<SendDialogComponent>
    ) {}

    closeDialog(hash: string): void {
        this._dialogRef.close(hash);
    }
}
