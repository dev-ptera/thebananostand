import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as Colors from '@brightlayer-ui/colors';
import { AccountService } from '@app/services/account.service';
import { TransactionService } from '@app/services/transaction.service';
import { SecretService } from '@app/services/secret.service';

export type ReceiveDialogData = {
    address: string;
    index: number;
    blocks: string[];
};

@Component({
    selector: 'app-receive-dialog',
    styleUrls: ['receive-dialog.component.scss'],
    template: `
        <div class="receive-dialog">
            <div
                *ngIf="success"
                mat-dialog-content
                style="display: flex; justify-content: center; flex:  1 1 0px; padding-bottom: 16px;"
            >
                <blui-empty-state>
                    <mat-icon blui-empty-icon> check_circle</mat-icon>
                    <div blui-title>Received Successfully</div>
                    <div blui-description>
                        All transactions have been successfully received. You can now close this window.
                    </div>
                    <div blui-actions>
                        <button mat-flat-button color="primary" class="close-button" (click)="closeDialog()">
                            Close
                        </button>
                    </div>
                </blui-empty-state>
            </div>

            <div
                *ngIf="hasErrorReceiving"
                mat-dialog-content
                class="dialog-content"
                style="display: flex; justify-content: center; flex:  1 1 0px; padding-bottom: 16px;"
            >
                <blui-empty-state>
                    <mat-icon blui-empty-icon> error</mat-icon>
                    <div blui-title>Transaction Failed</div>
                    <div blui-description>Your transaction could not be completed.</div>
                    <div blui-actions>
                        <button mat-flat-button color="primary" class="close-button" (click)="closeDialog()">
                            Close
                        </button>
                    </div>
                </blui-empty-state>
            </div>

            <ng-container *ngIf="!success && !hasErrorReceiving">
                <h1 mat-dialog-title>Receive Transaction</h1>
                <div mat-dialog-content style="margin-bottom: 32px;">
                    <ng-container>
                        <div style="margin-bottom: 8px">
                            You are attempting to receive an incoming transaction(s).
                            <ng-container *ngIf="secretService.isLocalSecretUnlocked()">
                                Use the button below to receive each block.
                            </ng-container>
                            <ng-container *ngIf="secretService.isLocalLedgerUnlocked()">
                                Use the button below and your ledger device to manually receive each block.
                            </ng-container>
                        </div>
                        <div style="margin-bottom: 8px">
                            <strong>{{ data.blocks.length - activeStep }}</strong> receivable transaction(s) remaining.
                        </div>
                    </ng-container>
                </div>

                <blui-spacer></blui-spacer>
                <mat-progress-bar
                    *ngIf="maxSteps !== 1"
                    mode="determinate"
                    [value]="bufferValue"
                    style="margin-left: -24px; margin-right: -24px; width: unset;"
                ></mat-progress-bar>
                <mat-divider *ngIf="maxSteps === 1" style="margin-left: -24px; margin-right: -24px"></mat-divider>
                <blui-mobile-stepper [activeStep]="activeStep" [steps]="maxSteps" variant="text">
                    <button mat-stroked-button blui-back-button color="primary" (click)="closeDialog()">Close</button>
                    <button
                        mat-flat-button
                        blui-next-button
                        color="primary"
                        class="loading-button"
                        (click)="receiveTransaction()"
                    >
                        <div class="spinner-container" [class.isLoading]="isReceivingTx">
                            <mat-spinner class="primary-spinner" diameter="20"></mat-spinner>
                        </div>
                        <span *ngIf="!isReceivingTx">Receive</span>
                    </button>
                </blui-mobile-stepper>
            </ng-container>
        </div>
    `,
})
export class ReceiveDialogComponent implements OnInit {
    activeStep = 0;
    maxSteps;
    lastStep;

    txHash: string;
    hasErrorReceiving: boolean;
    success: boolean;

    isReceivingTx: boolean;

    colors = Colors;
    bufferValue = 0;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ReceiveDialogData,
        public dialogRef: MatDialogRef<ReceiveDialogComponent>,
        private readonly _transactionService: TransactionService,
        private readonly _accountService: AccountService,
        public secretService: SecretService
    ) {}

    ngOnInit(): void {
        this.maxSteps = this.data.blocks.length;
        this.lastStep = this.maxSteps - 1;
    }

    closeDialog(): void {
        this.dialogRef.close(this.txHash);
    }

    /** Iterates through each pending transaction block and receives them. */
    async receiveTransaction(): Promise<void> {
        this.bufferValue = 0;

        if (this.isReceivingTx) {
            return;
        }

        this.isReceivingTx = true;
        for (const receivableBlock of this.data.blocks) {
            try {
                const receivedHash = await this._transactionService.receive(
                    this.data.address,
                    this.data.index,
                    receivableBlock
                );
                this.txHash = receivedHash;
                this.activeStep++;
                this.bufferValue = (100 / this.maxSteps) * this.activeStep;
                this.success = this.maxSteps === this.activeStep;
            } catch (err) {
                console.error(err);
                this.hasErrorReceiving = true;
                this.isReceivingTx = false;
                return;
            }
        }
    }
}
