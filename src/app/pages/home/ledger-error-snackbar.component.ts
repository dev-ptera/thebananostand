import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
    selector: 'ledger-snack-bar',
    template: `<div style="display: flex; justify-content: space-between; align-items: center">
        <mat-icon>error_outline</mat-icon>
        <span style="margin-right: 48px; margin-left: 12px">{{ data }}</span>
        <button mat-button color="accent" style="width: 130px" #action (click)="snackBar.dismissWithAction()">
            Troubleshoot
        </button>
    </div>`,
})
export class LedgerSnackbarErrorComponent {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: string,
        public snackBar: MatSnackBarRef<LedgerSnackbarErrorComponent>
    ) {}
}
