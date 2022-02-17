import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LedgerService } from '@app/services/ledger.service';
import { AccountService } from '@app/services/account.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { UtilService } from '@app/services/util.service';
import { SeedService } from '@app/services/seed.service';

@Component({
    selector: 'app-seed-dialog',
    styleUrls: ['seed-dialog.component.scss'],
    template: `
        <div class="seed-dialog">
            <h1 mat-dialog-title>Enter Seed / Mnemonic</h1>
            <div mat-dialog-content style="margin-bottom: 16px; display: flex; flex: 1 1 0px; flex-direction: column">
                <div style="margin-bottom: 16px">
                    Your secret phrase never leaves this website.
                    <span class="mat-subheading-1">Only seed working for now.</span>
                </div>
                <mat-form-field appearance="fill">
                    <mat-label>Seed or Mnemonic</mat-label>
                    <textarea
                        matInput
                        placeholder="Secret Phrase"
                        [(ngModel)]="secret"
                        style="min-height: 120px"
                    ></textarea>
                </mat-form-field>
                <mat-form-field appearance="fill">
                    <mat-label>Password (optional)</mat-label>
                    <textarea
                        matInput
                        placeholder="Password"
                        [(ngModel)]="password"
                        style="min-height: 40px"
                    ></textarea>
                </mat-form-field>
                <blui-spacer></blui-spacer>
                <mat-divider style="margin-left: -24px; margin-right: -24px"></mat-divider>
                <div style="display: flex; justify-content: space-between; margin-top: 16px;">
                    <button color="primary" mat-stroked-button (click)="closeDialog()">Close</button>
                    <button color="primary" mat-flat-button (click)="addSeed()">New Seed</button>
                    <button color="primary" mat-flat-button (click)="addPassword()">Old Seed</button>
                </div>
            </div>
        </div>
    `,
})
export class SeedDialogComponent {
    secret = '';
    password = '';

    constructor(
        public util: UtilService,
        public dialogRef: MatDialogRef<SeedDialogComponent>,
        private readonly _apiService: SpyglassService,
        private readonly _ledgerService: LedgerService,
        private readonly _accountService: AccountService,
        private readonly _seedService: SeedService
    ) {}

    closeDialog(): void {
        this.dialogRef.close();
    }

    async addPassword(): Promise<void> {
        await this._seedService.storePassword(this.password);
        // TODO: Make sure seed is...legit?  Password protected, etc.
        this.dialogRef.close(true);
    }

    async addSeed(): Promise<void> {
        await this._seedService.storeSeed(this.secret, this.password);
        // TODO: Make sure seed is...legit?  Password protected, etc.
        this.dialogRef.close(true);
    }
}
