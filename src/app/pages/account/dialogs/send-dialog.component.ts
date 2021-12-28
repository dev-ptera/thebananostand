import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilService } from '../../../services/util.service';
import { BananoService } from '../../../services/banano.service';
import { AccountService } from '../../../services/account.service';
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
            <ng-container *ngIf="sent">
                <div mat-dialog-content style="display: flex; justify-content: center; flex:  1 1 0px; padding-bottom: 16px;">
                    <blui-empty-state>
                        <mat-icon blui-empty-icon>
                            check_circle
                        </mat-icon>
                        <div blui-title>
                            Transaction Sent
                        </div>
                        <div blui-description>
                            Your transaction has been successfully sent and can be viewed
                            <span class="link" [style.color]="colors.blue[500]" (click)="openLink()">here.</span>
                            You can now close this window.
                        </div>
                        <div blui-actions>
                            <button mat-flat-button color="primary" style="width: 100px; display: flex; justify-content: center" (click)="closeDialog();">Close</button>
                        </div>
                    </blui-empty-state>
                </div>
            </ng-container>
            <ng-container *ngIf="!sent">
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
                            <input matInput type="number" [(ngModel)]="sendAmount" />
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
                    <button mat-flat-button blui-next-button color="primary" (click)="next()">
                        <ng-container *ngIf="activeStep < lastStep">Next</ng-container>
                        <ng-container *ngIf="activeStep === lastStep">Send</ng-container>
                    </button>
                </blui-mobile-stepper>
            </ng-container>
        </div>
    `,
})
export class SendDialogComponent {
    activeStep = 0;
    sendAmount: number;
    recipient: string;
    maxSteps = 4;
    lastStep = this.maxSteps - 1;
    sent: boolean;
    txHash: string;
    colors = Colors;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: SendDialogData,
        private readonly _bananoService: BananoService,
        private readonly _accountService: AccountService,
        public dialogRef: MatDialogRef<SendDialogComponent>,
        public util: UtilService
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

    openLink(): void {
        this._accountService.openLink(this.txHash);
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    withdraw(): void {
        this._bananoService
            .withdraw(this.recipient, this.sendAmount, this.data.index)
            .then((response) => {
                this.txHash = response;
                this.sent = true;
            })
            .catch((err) => {
                console.error(err);
            });
    }
}
