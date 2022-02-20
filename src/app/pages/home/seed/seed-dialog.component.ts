import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TransactionService } from '@app/services/transaction.service';
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
            <div mat-dialog-content style="display: flex; flex: 1 1 0px; flex-direction: column">

                <ng-container *ngIf="activeStep === 0">
                    <div style="margin-bottom: 24px">
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
                </ng-container>

                <ng-container *ngIf="activeStep === 1">
                    <div style="margin-bottom: 24px">
                        Enter a password to secure your wallet.  This is optional but encouraged.
                    </div>

                    <mat-form-field style="width: 100%;" appearance="fill">
                        <mat-label>Password (optional)</mat-label>
                        <input matInput
                               [type]="passwordVisible ? 'text' : 'password'"
                               [(ngModel)]="password" />
                        <button mat-icon-button matSuffix (click)="togglePasswordVisibility()">
                            <mat-icon>{{ passwordVisible ? 'visibility' : 'visibility_off' }}</mat-icon>
                        </button>
                    </mat-form-field>
                </ng-container>

                <blui-spacer></blui-spacer>
                <mat-divider style="margin-left: -24px; margin-right: -24px"></mat-divider>
                <blui-mobile-stepper [activeStep]="activeStep" [steps]="maxSteps">
                    <button mat-stroked-button blui-back-button color="primary" (click)="back()">
                        <ng-container *ngIf="activeStep === 0">Close</ng-container>
                        <ng-container *ngIf="activeStep > 0">Back</ng-container>
                    </button>
                    <button
                        mat-flat-button
                        blui-next-button
                        color="primary"
                        (click)="next()"
                        class="loading-button"
                        [disabled]="!isValidSeed()"
                    >
                        <ng-container *ngIf="activeStep < lastStep">Next</ng-container>
                        <ng-container *ngIf="activeStep === lastStep">Load</ng-container>
                    </button>
                </blui-mobile-stepper>
            </div>
        </div>
    `,
})
export class SeedDialogComponent {
    secret = '';
    password = '';
    activeStep = 0;
    maxSteps = 2;
    lastStep = this.maxSteps - 1;

    hasCreatedNewWallet = false;
    passwordVisible = false;

    constructor(
        public util: UtilService,
        public dialogRef: MatDialogRef<SeedDialogComponent>,
        private readonly _apiService: SpyglassService,
        private readonly _transactionService: TransactionService,
        private readonly _accountService: AccountService,
        private readonly _seedService: SeedService
    ) {}

    closeDialog(): void {
        this.dialogRef.close(this.hasCreatedNewWallet);
    }

    isValidSeed(): boolean {
        return true;
    }

    next(): void {
        if (this.activeStep === this.lastStep) {
            void this.addSeed();
        } else {
            this.activeStep++;
        }
    }

    back(): void {
        if (this.activeStep === 0) {
            this.closeDialog();
        } else {
            this.activeStep--;
        }
    }

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    async addSeed(): Promise<void> {
        await this._seedService.storeSeed(this.secret, this.password);
        this.hasCreatedNewWallet = true;
        this.dialogRef.close(this.hasCreatedNewWallet);
    }
}
