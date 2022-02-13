import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LedgerService } from '@app/services/ledger.service';
import { AccountService } from '@app/services/account.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { UtilService } from '@app/services/util.service';
import {SeedService} from "@app/services/seed.service";

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
                    <textarea matInput placeholder="Secret Phrase" [(value)]="secret"></textarea>
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

    secret: string;

    constructor(
        public util: UtilService,
        public dialogRef: MatDialogRef<SeedDialogComponent>,
        private readonly _apiService: SpyglassService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService,
        private readonly _seedService: SeedService,
    ) {}

    closeDialog(): void {
        this.dialogRef.close();
    }

    addSeed(): void {
        this._seedService.storeSeed(this.secret);
        this.dialogRef.close();
    }
}
