import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilService } from '../../../../services/util.service';
import { BananoService } from '../../../../services/banano.service';
import { AccountService } from '../../../../services/account.service';
import * as Colors from '@brightlayer-ui/colors';

export type SendDialogData = {
    address: string;
    index: number;
    maxSendAmount: number;
};

@Component({
    selector: 'app-send-dialog',
    styleUrls: ['send-dialog.component.scss'],
    template: `
        <div class="send-dialog">
            <div
                *ngIf="success === true"
                mat-dialog-content
                style="display: flex; justify-content: center; flex:  1 1 0px; padding-bottom: 16px;"
            >
                <blui-empty-state>
                    <mat-icon blui-empty-icon> check_circle </mat-icon>
                    <div blui-title>Transaction Sent</div>
                    <div blui-description>
                        Your transaction has been successfully sent and can be viewed
                        <span class="link" [style.color]="colors.blue[500]" (click)="openLink()">here.</span>
                        You can now close this window.
                    </div>
                    <div blui-actions>
                        <button mat-flat-button color="primary" class="close-button" (click)="closeDialog()">
                            Close
                        </button>
                    </div>
                </blui-empty-state>
            </div>

            <div
                *ngIf="success === false"
                mat-dialog-content
                class="dialog-content"
                style="display: flex; justify-content: center; flex:  1 1 0px; padding-bottom: 16px;"
            >
                <blui-empty-state>
                    <mat-icon blui-empty-icon> error </mat-icon>
                    <div blui-title>Transaction Failed</div>
                    <div blui-description>Your transaction could not be completed. {{ errorMessage }}</div>
                    <div blui-actions>
                        <button mat-flat-button color="primary" class="close-button" (click)="closeDialog()">
                            Close
                        </button>
                    </div>
                </blui-empty-state>
            </div>

            <ng-container *ngIf="success === undefined">
                <h1 mat-dialog-title>Send Amount</h1>
                <div mat-dialog-content style="margin-bottom: 32px;">
                    <ng-container *ngIf="activeStep === 0">
                        <div style="margin-bottom: 8px">You are attempting to withdraw funds from:</div>
                        <div
                            style="word-break: break-all; font-family: monospace"
                            [innerHTML]="util.formatHtmlAddress(data.address)"
                        ></div>
                    </ng-container>

                    <ng-container *ngIf="activeStep === 1">
                        <div style="margin-bottom: 24px">Please enter the amount to transfer.</div>
                        <mat-form-field style="width: 100%;" appearance="fill">
                            <mat-label>Amount</mat-label>
                            <input matInput type="number" [max]="data.maxSendAmount" [(ngModel)]="sendAmount" />
                            <button
                                matSuffix
                                mat-icon-button
                                aria-label="Send All"
                                (click)="sendAmount = data.maxSendAmount"
                            >
                                <mat-icon>account_balance_wallet</mat-icon>
                            </button>
                        </mat-form-field>
                    </ng-container>

                    <ng-container *ngIf="activeStep === 2">
                        <div style="margin-bottom: 24px">Please enter the recipient address.</div>
                        <mat-form-field style="width: 100%;" appearance="fill">
                            <mat-label>Recipient Address</mat-label>
                            <input matInput type="value" [(ngModel)]="recipient" />
                        </mat-form-field>
                    </ng-container>

                    <ng-container *ngIf="activeStep === 3">
                        <div style="margin-bottom: 24px">Please confirm the transaction details below:</div>
                        <div style="font-weight: 600">Send</div>
                        <div style="margin-bottom: 16px;">{{ util.numberWithCommas(sendAmount, 10) }}</div>
                        <div style="font-weight: 600">To</div>
                        <div
                            style="word-break: break-all; font-family: monospace"
                            [innerHTML]="util.formatHtmlAddress(recipient)"
                        ></div>
                    </ng-container>
                </div>

                <blui-spacer></blui-spacer>
                <mat-divider></mat-divider>
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
                        class="send-button"
                        [disabled]="!canContinue()"
                    >
                        <ng-container *ngIf="activeStep < lastStep">Next</ng-container>
                        <ng-container *ngIf="activeStep === lastStep">
                            <div class="spinner-container" [class.isLoading]="loading">
                                <mat-spinner class="primary-spinner" diameter="20"></mat-spinner>
                            </div>
                            <span *ngIf="!loading"> Send </span>
                        </ng-container>
                    </button>
                </blui-mobile-stepper>
            </ng-container>
        </div>
    `,
})
export class SendDialogComponent {
    activeStep = 0;
    maxSteps = 4;
    lastStep = this.maxSteps - 1;
    sendAmount: number;

    txHash: string;
    recipient: string;
    errorMessage: string;

    success: boolean;
    loading: boolean;

    colors = Colors;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: SendDialogData,
        public util: UtilService,
        private readonly _bananoService: BananoService,
        private readonly _accountService: AccountService,
        public dialogRef: MatDialogRef<SendDialogComponent>
    ) {}

    back(): void {
        if (this.activeStep === 0) {
            return this.closeDialog();
        }
        this.activeStep--;
    }

    next(): void {
        if (this.activeStep === this.lastStep) {
            return this.withdraw();
        }
        this.activeStep++;
    }

    canContinue(): boolean {
        if (this.activeStep === 1) {
            return Boolean(this.sendAmount && this.sendAmount > 0 && this.sendAmount <= this.data.maxSendAmount);
        }
        if (this.activeStep === 2) {
            return this.util.isValidAddress(this.recipient);
        }
        return true;
    }

    closeDialog(): void {
        this.dialogRef.close(this.txHash);
    }

    openLink(): void {
        this._accountService.showBlockInExplorer(this.txHash);
    }

    withdraw(): void {
        this.loading = true;
        this._bananoService
            .withdraw(this.recipient, this.sendAmount, this.data.index)
            .then((hash) => {
                this.txHash = hash;
                this.success = true;
            })
            .catch((err) => {
                console.error(err);
                this.errorMessage = err;
                this.success = false;
            });
    }
}
