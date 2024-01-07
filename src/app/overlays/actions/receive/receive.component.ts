import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { TransactionService } from '@app/services/transaction.service';
import { AppStateService } from '@app/services/app-state.service';
import { ReceivableHash } from '@app/types/ReceivableHash';
import { REFRESH_DASHBOARD_ACCOUNTS, TRANSACTION_COMPLETED_SUCCESS } from '@app/services/wallet-events.service';
import { ReceivableTx } from '@app/types/ReceivableTx';
import { UtilService } from '@app/services/util.service';

export type ReceiveOverlayData = {
    // This type requires accountIndex per-receivable block since this wallet supports a Receive All wallet-level feature.
    blocks: Array<ReceivableTx & { accountIndex: number }>; // do not change.
    refreshDashboard?: boolean;
};

@Component({
    selector: 'app-receive-overlay',
    styleUrls: ['receive.component.scss'],
    template: `
        <div class="receive-overlay overlay-action-container">
            <div *ngIf="hasSuccess" class="overlay-body">
                <app-empty-state data-cy="receive-success-state">
                    <mat-icon empty-icon>check_circle</mat-icon>
                    <div title>Received Successfully</div>
                    <div description>
                        All transactions have been successfully received. You can now close this window.
                    </div>
                    <button mat-flat-button color="primary" class="close-button" (click)="closeDialog()">Close</button>
                </app-empty-state>
            </div>

            <div *ngIf="hasErrorReceiving" class="overlay-body">
                <app-empty-state>
                    <mat-icon empty-icon>error</mat-icon>
                    <div title>Transaction Failed</div>
                    <div description>Your transaction could not be completed.</div>
                    <button mat-flat-button color="primary" class="close-button" (click)="closeDialog()">Close</button>
                </app-empty-state>
            </div>

            <ng-container *ngIf="!hasSuccess && !hasErrorReceiving">
                <div class="overlay-header">Receive Transaction</div>
                <div class="overlay-body" style="position: relative; overflow: hidden; flex: 1">
                    <div style="margin-bottom: 8px" class="mat-body-1">
                        You are attempting to receive an incoming transaction(s).

                        <ng-container *ngIf="!isLedger"> Use the button below to receive each block.</ng-container>
                        <ng-container *ngIf="isLedger">
                            Use the button below and your ledger device to manually receive each block.
                        </ng-container>
                        <mat-expansion-panel class="mat-elevation-z0 divider-border" style="margin: 16px 0">
                            <mat-expansion-panel-header>
                                <mat-panel-title> Incoming transaction details </mat-panel-title>
                            </mat-expansion-panel-header>

                            <div style="overflow: auto; max-height: 300px">
                                <div *ngFor="let block of data.blocks; let last = last">
                                    <div
                                        style="display: flex; justify-content: space-between; align-items: center; height: 88px"
                                    >
                                        <mat-checkbox [checked]="true"></mat-checkbox>
                                        <div>
                                            <div>
                                                <strong>{{ block.amount | appComma }}</strong> BAN
                                            </div>
                                            <div>from {{ util.shortenAddress(block.address) }}</div>
                                            <div class="mat-hint">{{ util.timestampToRelative(block.timestamp) }}</div>
                                        </div>
                                    </div>
                                    <mat-divider *ngIf="!last" style="width: 100%; margin: 0"></mat-divider>
                                </div>
                            </div>
                        </mat-expansion-panel>
                    </div>
                    <spacer></spacer>
                    <div style="margin-bottom: 8px" class="mat-body-1">
                        <strong>{{ data.blocks.length - activeStep }}</strong> receivable transaction(s) remaining.
                    </div>
                    <mat-progress-bar
                        *ngIf="maxSteps !== 1"
                        mode="determinate"
                        [value]="bufferValue"
                        style="position: absolute; bottom: -1px; left: 0px;"
                    ></mat-progress-bar>
                </div>

                <div class="overlay-footer">
                    <mobile-stepper [activeStep]="activeStep" [steps]="maxSteps" variant="text">
                        <button
                            mat-stroked-button
                            back-button
                            color="primary"
                            data-cy="receive-close-button"
                            (click)="closeDialog()"
                        >
                            Close
                        </button>
                        <button
                            mat-flat-button
                            next-button
                            color="primary"
                            class="loading-button"
                            data-cy="receive-button"
                            (click)="receiveTransaction()"
                        >
                            <div class="spinner-container" data-cy="receive-loading" [class.isLoading]="isReceivingTx">
                                <mat-spinner class="primary-spinner" diameter="20"></mat-spinner>
                            </div>
                            <span *ngIf="!isReceivingTx">Receive</span>
                        </button>
                    </mobile-stepper>
                </div>
            </ng-container>
        </div>
    `,
})
export class ReceiveComponent implements OnInit {
    @Input() data: ReceiveOverlayData;
    @Output() closeWithHash: EventEmitter<string> = new EventEmitter<string>();

    activeStep = 0;
    maxSteps;
    lastStep;

    txHash: string;
    hasErrorReceiving: boolean;
    hasSuccess: boolean;
    isLedger: boolean;
    isReceivingTx: boolean;
    showReceiveDetails: boolean;

    colors = Colors;
    bufferValue = 0;

    constructor(
        public util: UtilService,
        private readonly _appStateService: AppStateService,
        private readonly _transactionService: TransactionService
    ) {}

    ngOnInit(): void {
        this.isLedger = this._appStateService.store.getValue().hasUnlockedLedger;
        this.maxSteps = this.data.blocks.length;
        this.lastStep = this.maxSteps - 1;
    }

    closeDialog(): void {
        this.closeWithHash.emit(this.txHash);
    }

    getAlias(address: string): string {
        return 'ha';
    }

    /** Iterates through each pending transaction block and receives them. */
    async receiveTransaction(): Promise<void> {
        this.bufferValue = 0;

        if (this.isReceivingTx) {
            return;
        }

        this.isReceivingTx = true;

        /* Some external APIs have rate limits in place, this a dummy time padding to help avoid rate limits.
         E.g. Kalium API has a rate limit of 100 calls per minute, each receive transaction in thebanostand potentially does 6x calls, which means this wallet should enable 16 transactions per minute.
         */
        const addBulkReceivePadding = Boolean(this.data.blocks.length >= 16);
        for (const receivableBlock of this.data.blocks) {
            try {
                // eslint-disable-next-line no-await-in-loop
                const receivedHash = await this._transactionService.receive(
                    receivableBlock.accountIndex,
                    receivableBlock
                );

                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, addBulkReceivePadding ? 2500 : 500));

                this.txHash = receivedHash;
                this.activeStep++;
                this.bufferValue = (100 / this.maxSteps) * this.activeStep;
                this.hasSuccess = this.maxSteps === this.activeStep;
            } catch (err) {
                console.error(err);
                this.hasErrorReceiving = true;
                this.isReceivingTx = false;
                return;
            }
        }
        TRANSACTION_COMPLETED_SUCCESS.next(undefined);
        if (this.data.refreshDashboard) {
            REFRESH_DASHBOARD_ACCOUNTS.next();
        }
    }
}
