import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as Colors from '@brightlayer-ui/colors';
import { AccountService } from '@app/services/account.service';
import { TransactionService } from '@app/services/transaction.service';

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
                    <mat-icon blui-empty-icon> check_circle </mat-icon>
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
                *ngIf="errorMessage"
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

            <ng-container *ngIf="!success && !errorMessage">
                <h1 mat-dialog-title>Receive Transaction</h1>
                <div mat-dialog-content style="margin-bottom: 32px;">
                    <ng-container>
                        <div style="margin-bottom: 8px">
                            You are attempting to receive incoming transaction(s). Use the button below and your ledger
                            device to manually receive each block.
                        </div>
                        <div *ngIf="activeStep === 0" style="margin-bottom: 8px">
                            There are <strong>{{ data.blocks.length }}</strong> total transaction(s) to receive.
                        </div>
                        <div *ngIf="activeStep > 0">
                            Transaction #{{ activeStep }} received.
                            <span class="link" (click)="openLink()">View Hash</span>
                        </div>
                    </ng-container>
                </div>

                <blui-spacer></blui-spacer>
                <mat-divider style="margin-left: -24px; margin-right: -24px"></mat-divider>
                <blui-mobile-stepper [activeStep]="activeStep" [steps]="maxSteps" variant="text">
                    <button mat-stroked-button blui-back-button color="primary" (click)="closeDialog()">Close</button>
                    <button
                        mat-flat-button
                        blui-next-button
                        color="primary"
                        class="loading-button"
                        (click)="receiveTransaction()"
                    >
                        <div class="spinner-container" [class.isLoading]="loading">
                            <mat-spinner class="primary-spinner" diameter="20"></mat-spinner>
                        </div>
                        <span *ngIf="!loading"> Receive </span>
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
    errorMessage: string;
    success: boolean;

    loading: boolean;

    colors = Colors;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ReceiveDialogData,
        public dialogRef: MatDialogRef<ReceiveDialogComponent>,
        private readonly _transactionService: TransactionService,
        private readonly _accountService: AccountService
    ) {}

    ngOnInit(): void {
        this.maxSteps = this.data.blocks.length;
        this.lastStep = this.maxSteps - 1;
    }

    closeDialog(): void {
        this.dialogRef.close(this.txHash);
    }

    openLink(): void {
        this._accountService.showBlockInExplorer(this.txHash);
    }

    /** Iterates through each pending transaction block and receives them. */
    receiveTransaction(): void {
        this.loading = true;
        const pendingHash = this.data.blocks[this.activeStep];
        this._transactionService
            .receive(this.data.address, this.data.index, pendingHash)
            .then((receivedHash) => {
                this.loading = false;
                this.txHash = receivedHash;
                this.activeStep++;
                this.success = this.maxSteps === this.activeStep;
            })
            .catch((err) => {
                this.errorMessage = err;
            });
    }
}
