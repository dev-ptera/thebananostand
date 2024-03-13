import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-add-spyglass-dialog',
    template: ` <app-add-spyglass-overlay (close)="closeDialog()"></app-add-spyglass-overlay> `,
})
export class AddSpyglassDialogComponent {
    constructor(private readonly _dialogRef: MatDialogRef<AddSpyglassDialogComponent>) {}

    closeDialog(): void {
        this._dialogRef.close();
    }
}
