import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LedgerService } from '@app/services/ledger.service';
import { AccountService } from '@app/services/account.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { UtilService } from '@app/services/util.service';

@Component({
    selector: 'app-seed-dialog',
    styleUrls: ['seed-dialog.component.scss'],
    template: `
        <div class="seed-dialog">
            <h1 mat-dialog-title>Enter Seed / Mnemonic</h1>
            <div mat-dialog-content style="margin-bottom: 16px; display: flex; flex: 1 1 0px; flex-direction: column">
                <div style="margin-bottom: 8px">Your secret phrase never leaves this website.</div>
                <mat-form-field appearance="fill">
                    <mat-label>Seed or Mnemonic</mat-label>
                    <textarea matInput placeholder="Ex. It makes me feel..."></textarea>
                </mat-form-field>
                <blui-spacer></blui-spacer>
                <div style="display: flex; justify-content: space-between">
                    <button color="primary" mat-stroked-button (click)="closeDialog()">Close</button>
                    <button
                        color="primary"
                        mat-flat-button
                        (click)="addSeed()"
                    >
                        Enter
                    </button>
                </div>
            </div>
        </div>
    `,
})
export class SeedDialogComponent {

    constructor(
        public util: UtilService,
        public dialogRef: MatDialogRef<SeedDialogComponent>,
        private readonly _apiService: SpyglassService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService
    ) {}

    closeDialog(): void {
        this.dialogRef.close();
    }

    addSeed(): void {
        // TODO
    }
}
