import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TransactionService } from '@app/services/transaction.service';
import { AppStateService } from '@app/services/app-state.service';
import { REFRESH_DASHBOARD_ACCOUNTS, TRANSACTION_COMPLETED_SUCCESS } from '@app/services/wallet-events.service';
import { ReceivableTx } from '@app/types/ReceivableTx';
import { UtilService } from '@app/services/util.service';
import * as Colors from '@brightlayer-ui/colors';
import {ReceiveService} from "@app/services/receive.service";

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
                        <div
                            style="overflow: auto; max-height: 300px; padding: 8px 16px; margin: 24px 0; border-radius: .5rem"
                            class="divider-border"
                        >
                            <div *ngFor="let block of data.blocks; let last = last; let i = index">
                                <div
                                    style="display: flex; justify-content: space-between; align-items: center; height: 88px"
                                >
                                    <mat-checkbox
                                        [checked]="true"
                                        (change)="toggleTx(i)"
                                        [disabled]="isReceivingTx"
                                    ></mat-checkbox>
                                    <div style="width: 100%; margin-left: 16px">
                                        <div>
                                            <strong>{{ block.amount | appComma }}</strong> BAN
                                        </div>
                                        <div class="mat-body-2">
                                            from {{ getAlias(block.address) || util.shortenAddress(block.address) }}
                                        </div>
                                        <div class="mat-body-2">{{ util.getRelativeTime(block.timestamp) }}</div>
                                    </div>
                                </div>
                                <mat-divider *ngIf="!last" style="width: 100%; margin: 0"></mat-divider>
                            </div>
                        </div>
                    </div>
                    <spacer></spacer>
                    <div style="margin-bottom: 16px; margin-top: 16px" class="mat-body-1">
                        <strong>{{ maxSteps - activeStep }}</strong> receivable transaction(s) remaining.
                    </div>
                    <mat-progress-bar
                        *ngIf="maxSteps !== 1"
                        mode="determinate"
                        [value]="bufferValue"
                        style="position: absolute; bottom: -1px; left: 0px;"
                    ></mat-progress-bar>
                </div>

                <div class="overlay-footer">
                    <mobile-stepper [activeStep]="activeStep" [steps]="maxSteps" variant="none">
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
                            [disabled]="maxSteps === 0"
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
    maxSteps: number;

    txHash: string;
    hasErrorReceiving: boolean;
    hasSuccess: boolean;
    isLedger: boolean;
    isReceivingTx: boolean;

    colors = Colors;
    bufferValue = 0;

    selectedIndexesToReceive: Set<number> = new Set();

    constructor(
        public util: UtilService,
        private readonly _appStateService: AppStateService,
        private readonly _transactionService: TransactionService
    ) {}

    ngOnInit(): void {
        this.isLedger = this._appStateService.store.getValue().hasUnlockedLedger;
        this.data.blocks.forEach((x, i) => this.selectedIndexesToReceive.add(i));
        this.maxSteps = this.selectedIndexesToReceive.size;
    }

    closeDialog(): void {
        this.closeWithHash.emit(this.txHash);
    }

    getAlias(address: string): string {
        return this._appStateService.knownAccounts.get(address);
    }

    toggleTx(index: number): void {
        this.selectedIndexesToReceive.has(index)
            ? this.selectedIndexesToReceive.delete(index)
            : this.selectedIndexesToReceive.add(index);
        this.maxSteps = this.selectedIndexesToReceive.size;
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
        for (let i = 0; i < this.data.blocks.length; i++) {
            if (!this.selectedIndexesToReceive.has(i)) {
                continue;
            }

            const receivableBlock = this.data.blocks[i];

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
