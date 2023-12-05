import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-add-rpc-dialog',
    template: ` <app-add-rpc-overlay (close)="closeDialog()"></app-add-rpc-overlay> `,
})
export class AddRpcDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<AddRpcDialogComponent>) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
