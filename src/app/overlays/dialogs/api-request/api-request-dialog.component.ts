import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-api-request-dialog',
    template: ` <app-api-request-overlay (close)="closeDialog()"></app-api-request-overlay> `,
})
export class ApiRequestDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<ApiRequestDialogComponent>) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}

