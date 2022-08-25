import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TransactionService } from '@app/services/transaction.service';
import { AccountService } from '@app/services/account.service';
import { SpyglassService } from '@app/services/spyglass.service';
import { UtilService } from '@app/services/util.service';
import { SecretService } from '@app/services/secret.service';

@Component({
    selector: 'app-enter-secret-dialog',
    styleUrls: ['enter-secret-dialog.component.scss'],
    template: `
        <div class="secret-dialog">
            <h1 mat-dialog-title>Enter Seed / Mnemonic</h1>
            <div mat-dialog-content style="display: flex; flex: 1 1 0px; flex-direction: column">
                <ng-container *ngIf="activeStep === 0">
                    <div style="margin-bottom: 24px">Your secret phrase never leaves this website.</div>
                    <mat-form-field appearance="fill">
                        <mat-label>Seed or Mnemonic</mat-label>
                        <textarea
                            data-cy="secret-input"
                            matInput
                            placeholder="Secret Phrase"
                            [(ngModel)]="secret"
                            style="min-height: 120px; resize: none"
                        ></textarea>
                    </mat-form-field>
                </ng-container>

                <ng-container *ngIf="activeStep === 1">
                    <div style="margin-bottom: 24px">
                        Enter a password to secure your wallet. This is optional but encouraged.
                    </div>

                    <mat-form-field style="width: 100%;" appearance="fill" (keyup.enter)="next()">
                        <mat-label>Password (optional)</mat-label>
                        <input
                            matInput
                            [type]="passwordVisible ? 'text' : 'password'"
                            [(ngModel)]="password"
                            data-cy="password-input"
                        />
                        <button mat-icon-button matSuffix (click)="togglePasswordVisibility()">
                            <mat-icon>{{ passwordVisible ? 'visibility' : 'visibility_off' }}</mat-icon>
                        </button>
                    </mat-form-field>
                </ng-container>

                <div *ngIf="error" style="display: flex; align-items: center;">
                    <mat-icon color="warn">error</mat-icon>
                    <span style="margin-left: 8px">{{ error }}</span>
                </div>
                <blui-spacer></blui-spacer>
                <mat-divider style="margin-left: -24px; margin-right: -24px"></mat-divider>
                <blui-mobile-stepper [activeStep]="activeStep" [steps]="maxSteps">
                    <button mat-stroked-button blui-back-button color="primary" (click)="back()">
                        <ng-container *ngIf="activeStep === 0">Close</ng-container>
                        <ng-container *ngIf="activeStep > 0">Back</ng-container>
                    </button>
                    <button
                        data-cy="secret-next"
                        mat-flat-button
                        blui-next-button
                        color="primary"
                        (click)="next()"
                        class="loading-button"
                        [disabled]="!isValidSecret()"
                    >
                        <ng-container *ngIf="activeStep < lastStep">Next</ng-container>
                        <ng-container *ngIf="activeStep === lastStep">Load</ng-container>
                    </button>
                </blui-mobile-stepper>
            </div>
        </div>
    `,
})
export class EnterSecretDialogComponent {
    secret = '';
    password = '';
    activeStep = 0;
    maxSteps = 2;
    lastStep = this.maxSteps - 1;

    hasCreatedNewWallet = false;
    passwordVisible = false;

    error: string;

    constructor(
        public util: UtilService,
        public dialogRef: MatDialogRef<EnterSecretDialogComponent>,
        private readonly _apiService: SpyglassService,
        private readonly _transactionService: TransactionService,
        private readonly _accountService: AccountService,
        private readonly _secretService: SecretService
    ) {}

    closeDialog(): void {
        this.dialogRef.close(this.hasCreatedNewWallet);
    }

    isValidSecret(): boolean {
        if (!this.secret) {
            return false;
        }
        return this.secret.trim().length === 64 || this.secret.trim().split(' ').length === 24;
    }

    next(): void {
        if (this.activeStep === this.lastStep) {
            void this.addSeed();
        } else {
            this.activeStep++;
        }
    }

    back(): void {
        this.error = undefined;
        if (this.activeStep === 0) {
            this.closeDialog();
        } else {
            this.activeStep--;
        }
    }

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    addSeed(): void {
        this.error = undefined;
        this._secretService
            .storeSecret(this.secret, this.password)
            .then(() => {
                this.hasCreatedNewWallet = true;
                this.dialogRef.close(this.hasCreatedNewWallet);
            })
            .catch((err) => {
                console.error(err);
                this.error = err;
            });
    }
}
