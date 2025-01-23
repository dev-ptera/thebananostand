import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { UtilService } from '@app/services/util.service';
import { AccountService } from '@app/services/account.service';
import { TransactionService } from '@app/services/transaction.service';
import { TRANSACTION_COMPLETED_SUCCESS } from '@app/services/wallet-events.service';
import { CurrencyConversionService } from '@app/services/currency-conversion.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { ViewportService } from '@app/services/viewport.service';
import { BnsService } from '@app/services/bns.service';

export type SendOverlayData = {
    address: string;
    index: number;
    maxSendAmount: number;
    maxSendAmountRaw: string;
    localCurrencySymbol: string;
};

@Component({
    selector: 'app-send-overlay',
    styleUrls: ['send.component.scss'],
    template: `
        <div
            class="send-overlay overlay-action-container"
            [style.height.vh]="scanner?.isStart || scanner?.isLoading ? 80 : 0"
        >
            <div *ngIf="hasSuccess === true" class="overlay-body">
                <app-empty-state data-cy="send-success-state">
                    <mat-icon empty-icon> check_circle</mat-icon>
                    <div title>Transaction Sent</div>
                    <div description>
                        Your transaction has been successfully sent and can be viewed
                        <span class="link" (click)="openLink()">here</span>. You can now close this window.
                    </div>
                    <button mat-flat-button color="primary" (click)="closeDialog()">Close</button>
                </app-empty-state>
            </div>

            <div *ngIf="hasSuccess === false" class="overlay-body">
                <app-empty-state>
                    <mat-icon empty-icon> error</mat-icon>
                    <div title>Transaction Failed</div>
                    <div description>Your transaction could not be completed.</div>
                    <button mat-flat-button color="primary" (click)="closeDialog()">Close</button>
                </app-empty-state>
            </div>

            <ng-container *ngIf="hasSuccess === undefined">
                <div class="overlay-header" style="display: flex; justify-content: space-between; align-items: center">
                    <div>Send Transaction</div>
                    <!-- TODO: Replace with ng device detector -->
                    <button
                        *ngIf="vp.sm && activeStep === 2"
                        (click)="scanner?.isStart ? scanner?.stop() : scanner?.start(); subscribeForScanData()"
                        mat-mini-fab
                        back-button
                        color="primary"
                        data-cy="send-close-button"
                    >
                        <mat-icon class="text-contrast">
                            {{ scanner?.isStart ? 'videocam_off' : 'qr_code_scanner' }}
                        </mat-icon>
                    </button>
                </div>
                <div class="overlay-body">
                    <ng-container *ngIf="activeStep === 0">
                        <div class="mat-body-1" style="margin-bottom: 8px">
                            You are attempting to withdraw funds from:
                        </div>
                        <div
                            class="mono mat-body-1"
                            style="word-break: break-all"
                            [innerHTML]="util.formatHtmlAddress(data.address)"
                        ></div>
                    </ng-container>

                    <ng-container *ngIf="activeStep === 1">
                        <div class="mat-body-1" style="margin-bottom: 16px">Please enter the amount to transfer.</div>
                        <mat-form-field style="width: 100%;" appearance="fill">
                            <mat-label
                                >{{ swapToLocalCurrencyInput ? data.localCurrencySymbol : 'BAN' }} Amount
                            </mat-label>
                            <input
                                matInput
                                type="number"
                                data-cy="send-amount-input"
                                [max]="swapToLocalCurrencyInput ? maxSendLocalCurrency : data.maxSendAmount"
                                [(ngModel)]="sendAmount"
                                (ngModelChange)="checkIfSendingAll($event)"
                            />
                            <button matSuffix mat-icon-button aria-label="Send All" (click)="swapInputs()">
                                <mat-icon>currency_exchange</mat-icon>
                            </button>
                        </mat-form-field>
                        <!--
                            *ngIf="sendAmountBAN > data.maxSendAmount"-->
                        <div
                            class="mat-caption"
                            style="margin-top: -16px; margin-bottom: 24px; display: flex"
                            [class.warn]="sendAmount && !_hasUserEnteredValidSendAmount()"
                        >
                            Max transferable amount is
                            {{ (swapToLocalCurrencyInput ? maxSendLocalCurrency : data.maxSendAmount) | number }}
                            {{ swapToLocalCurrencyInput ? data.localCurrencySymbol : 'BAN' }}.
                        </div>
                        <div class="mat-hint mat-body-1" style="margin-bottom: 16px">
                            <ng-container *ngIf="isSendingAll">
                                ~{{ (swapToLocalCurrencyInput ? data.maxSendAmount : maxSendLocalCurrency) | number }}
                                {{ swapToLocalCurrencyInput ? 'BAN' : data.localCurrencySymbol }}
                            </ng-container>

                            <ng-container *ngIf="!isSendingAll">
                                <ng-container *ngIf="swapToLocalCurrencyInput">
                                    ~{{
                                        sendAmount
                                            | conversionToBAN
                                                : store.localCurrencyConversionRate
                                                : store.priceDataUSD.bananoPriceUsd
                                            | number
                                    }}
                                    BAN
                                </ng-container>
                                <ng-container *ngIf="!swapToLocalCurrencyInput">
                                    ~{{
                                        sendAmount
                                            | conversionFromBAN
                                                : store.localCurrencyConversionRate
                                                : store.priceDataUSD.bananoPriceUsd
                                            | number
                                    }}
                                    {{ data.localCurrencySymbol }}
                                </ng-container>
                            </ng-container>
                        </div>
                        <mat-checkbox [(ngModel)]="isSendingAll" (change)="toggleSendAll()">Send All</mat-checkbox>
                    </ng-container>

                    <ng-container *ngIf="activeStep === 2">
                        <ng-container *ngIf="!action.isStart">
                            <div class="mat-body-1" style="margin-bottom: 16px;">
                                Please enter the recipient address or BNS domain.
                            </div>
                            <mat-form-field appearance="fill" class="address-input">
                                <mat-label>Recipient Address or BNS domain</mat-label>
                                <textarea
                                    matInput
                                    data-cy="send-recipient-input"
                                    type="value"
                                    [(ngModel)]="recipient"
                                ></textarea>
                            </mat-form-field>
                            <div *ngIf="getAccountAlias(recipient)">
                                <div style="display: flex; align-items: center" class="mat-body-1">
                                    Known as "{{ getAccountAlias(recipient) }}"
                                    <a
                                        class="link"
                                        style="margin-left: 4px"
                                        [href]="'https://creeper.banano.cc/known-accounts#' + recipient"
                                        target="_blank"
                                    >
                                        on Creeper</a
                                    >
                                    <mat-icon style="font-size: 14px; height: 14px; width: 14px; margin-left: 4px"
                                        >open_in_new</mat-icon
                                    >
                                </div>
                            </div>
                            <div *ngIf="_bnsService.isBns(recipient)">
                                <div style="display: flex; align-items: center" class="mat-body-1">
                                    Is this a BNS domain?
                                    <button
                                        (click)="getDomainResolvedAddress(recipient)"
                                        mat-mini-fab
                                        back-button
                                        color="primary"
                                        data-cy="bns-resolve-button"
                                        style="margin-left: 4px"
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        </ng-container>

                        <select
                            #select1
                            (change)="action.playDevice(select1.value)"
                            class="form-select form-select-sm"
                            style="margin-bottom: 8px"
                            *ngIf="action.isStart"
                        >
                            <option [value]="null" selected>Select device</option>
                            <option
                                *ngFor="let c of action.devices.value; let i = index"
                                [value]="c.deviceId"
                                [selected]="i == action.deviceIndexActive"
                            >
                                {{ c.label }}
                            </option>
                        </select>

                        <ngx-scanner-qrcode
                            #action="scanner"
                            style="margin-bottom: 16px"
                            [style.display]="action.isStart ? 'flex' : 'none'"
                        ></ngx-scanner-qrcode>

                        <div *ngIf="action.isLoading" class="mat-body-1" style="margin-top: 8px">Loading camera...</div>
                    </ng-container>

                    <div *ngIf="activeStep === 3" class="mat-body-1">
                        <div style="margin-bottom: 16px">Please confirm the transaction details below:</div>
                        <div style="font-weight: 600">Send</div>
                        <div style="margin-bottom: 16px;">{{ confirmedSendAmount | number }} BAN</div>
                        <div style="font-weight: 600">To</div>
                        <div
                            style="word-break: break-all; font-family: monospace"
                            [innerHTML]="util.formatHtmlAddress(recipient)"
                        ></div>
                        <ng-container *ngIf="getAccountAlias(recipient)">
                            <div style="font-weight: 600; margin-top: 16px">Known as</div>
                            <div style="margin-bottom: 16px;">{{ getAccountAlias(recipient) }}</div>
                        </ng-container>
                    </div>
                </div>
                <div class="overlay-footer">
                    <mobile-stepper [activeStep]="activeStep" [steps]="maxSteps">
                        <button
                            mat-stroked-button
                            back-button
                            color="primary"
                            (click)="back()"
                            data-cy="send-close-button"
                        >
                            <ng-container *ngIf="activeStep === 0">Close</ng-container>
                            <ng-container *ngIf="activeStep > 0">Back</ng-container>
                        </button>
                        <button
                            mat-flat-button
                            next-button
                            color="primary"
                            (click)="next()"
                            class="loading-button"
                            data-cy="send-next-button"
                            [disabled]="!canContinue()"
                        >
                            <ng-container *ngIf="activeStep < lastStep">Next</ng-container>
                            <ng-container *ngIf="activeStep === lastStep">
                                <div
                                    class="spinner-container"
                                    [class.isLoading]="isProcessingTx"
                                    data-cy="send-loading"
                                >
                                    <mat-spinner class="primary-spinner" diameter="20"></mat-spinner>
                                </div>
                                <span *ngIf="!isProcessingTx"> Send </span>
                            </ng-container>
                        </button>
                    </mobile-stepper>
                </div>
            </ng-container>
        </div>
    `,
})
export class SendComponent implements OnInit, OnDestroy {
    @Input() data: SendOverlayData;
    @Output() closeWithHash: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild('action') scanner;

    activeStep = 0;
    maxSteps = 4;
    lastStep = this.maxSteps - 1;
    sendAmount: number;

    isSendingAll: boolean;

    txHash: string;
    recipient: string;
    confirmedSendAmount: string; // The number that users see on the last screen, which is used to send funds.

    hasSuccess: boolean;
    isProcessingTx: boolean;

    colors = Colors;

    swapToLocalCurrencyInput: boolean;
    maxSendLocalCurrency: number;

    store: AppStore;
    constructor(
        public util: UtilService,
        private readonly _accountService: AccountService,
        private readonly _transactionService: TransactionService,
        private readonly _currencyConversionService: CurrencyConversionService,
        private readonly _bnsService: BnsService,
        public vp: ViewportService,
        private readonly _appStateService: AppStateService
    ) {
        this.store = this._appStateService.store.getValue();
    }

    ngOnInit(): void {
        this.maxSendLocalCurrency = Number(
            this._currencyConversionService.convertBanAmountToLocalCurrency(
                this.data.maxSendAmount,
                this.store.localCurrencyConversionRate,
                this.store.priceDataUSD.bananoPriceUsd
            )
        );
    }

    ngOnDestroy(): void {
        if (this.scanner?.isStart) {
            this.scanner.stop();
        }
    }

    back(): void {
        if (this.scanner?.isStart) {
            this.scanner.stop();
        }
        if (this.activeStep === 0) {
            return this.closeDialog();
        }
        this.activeStep--;
    }

    next(): void {
        if (this.activeStep === this.lastStep) {
            return this.withdraw();
        }
        if (this.activeStep === 1) {
            if (this.swapToLocalCurrencyInput) {
                const convertedBanAmount = this._currencyConversionService.convertLocalCurrencyToBAN(
                    this.sendAmount,
                    this.store.localCurrencyConversionRate,
                    this.store.priceDataUSD.bananoPriceUsd
                );
                this.confirmedSendAmount = this.isSendingAll
                    ? this.util.removeExponents(this.util.convertRawToBan(this.data.maxSendAmountRaw))
                    : this.util.removeExponents(convertedBanAmount);
            } else {
                this.confirmedSendAmount = this.isSendingAll
                    ? this.util.removeExponents(this.util.convertRawToBan(this.data.maxSendAmountRaw))
                    : this.util.removeExponents(this.sendAmount);
            }
        }
        this.activeStep++;
    }

    canContinue(): boolean {
        if (this.activeStep === 1) {
            return this._hasUserEnteredValidSendAmount();
        }
        if (this.activeStep === 2) {
            return this.util.isValidAddress(this.recipient);
        }
        return true;
    }

    closeDialog(): void {
        this.closeWithHash.emit(this.txHash);
    }

    toggleSendAll(): void {
        if (this.isSendingAll) {
            if (this.swapToLocalCurrencyInput) {
                this.sendAmount = this.maxSendLocalCurrency;
            } else {
                this.sendAmount = this.data.maxSendAmount;
            }
        } else {
            this.sendAmount = undefined;
        }
    }

    openLink(): void {
        this._accountService.showBlockInExplorer(this.txHash);
    }

    subscribeForScanData(): void {
        this.scanner.isBeep = false;
        this.scanner.devices.subscribe((devices) => {
            for (const device of devices) {
                if (device.label.toLowerCase().includes('back')) {
                    this.scanner.playDevice(device.value);
                    break;
                }
            }
        });
        this.scanner.data.subscribe((scannedData) => {
            this.recipient = scannedData[0]?.value;
            this.scanner.stop();
        });
    }

    withdraw(): void {
        if (this.isProcessingTx) {
            return;
        }

        this.isProcessingTx = true;
        this._transactionService
            .withdraw(this.recipient, this.util.convertBanToRaw(this.confirmedSendAmount), this.data.index)
            .then((hash) => {
                this.txHash = hash;
                this.hasSuccess = true;
                this.isProcessingTx = false;
                TRANSACTION_COMPLETED_SUCCESS.next({
                    txHash: hash,
                    accountIndex: this.data.index,
                    recipient: this.recipient,
                });
            })
            .catch(() => {
                this.hasSuccess = false;
                this.isProcessingTx = false;
            });
    }

    swapInputs(): void {
        this.swapToLocalCurrencyInput = !this.swapToLocalCurrencyInput;
        this.sendAmount = 0;
        this.checkIfSendingAll(this.sendAmount);
    }

    checkIfSendingAll(amount: number): void {
        if (this.swapToLocalCurrencyInput) {
            this.isSendingAll = amount === this.maxSendLocalCurrency;
        } else {
            this.isSendingAll = amount === this.data.maxSendAmount;
        }
    }

    getAccountAlias(address: string): string {
        if (address) {
            return this._appStateService.knownAccounts.get(address);
        }
    }

    async getDomainResolvedAddress(domain_and_tld: string): Promise<void> {
        const components = this._bnsService.getDomainComponents(domain_and_tld);
        if (components) {
            const [domain, tld] = components;
            //if tld is in mapping
            if (this._appStateService.store.getValue().tlds[tld]) {
                const resolved = await this._bnsService.resolve(domain, tld);
                if (resolved?.resolved_address) {
                    this.recipient = resolved?.resolved_address;
                }
            }
        }
    }

    private _hasUserEnteredValidSendAmount(): boolean {
        if (!this.sendAmount) {
            return false;
        }
        if (this.swapToLocalCurrencyInput) {
            return this.sendAmount <= this.maxSendLocalCurrency;
        }
        return this.sendAmount <= this.data.maxSendAmount;
    }
}
