import { Component, Input, ViewEncapsulation } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { ReceivableTx } from '@app/types/ReceivableTx';
import { UtilService } from '@app/services/util.service';
import { ViewportService } from '@app/services/viewport.service';
import { ThemeService } from '@app/services/theme.service';
import { AccountService } from '@app/services/account.service';
import { TransactionService } from '@app/services/transaction.service';
import { AppStateService } from '@app/services/app-state.service';
import { REFRESH_DASHBOARD_ACCOUNTS, TRANSACTION_COMPLETED_SUCCESS } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-receivable',
    template: `
        <div class="receivable-row-wrapper" [style.height.px]="transactionRowHeight">
            <div class="receivable-row" [class.divider-border]="vp.sm" [style.backgroundColor]="getRowBgColor(even)">
                <div *ngIf="!item">
                    <!--Left Content -->
                    <div>
                        <div class="receivable-icon">
                            <mat-icon icon>sync</mat-icon>
                        </div>
                        <div class="mat-body-1">Loading</div>
                    </div>

                    <!--Right Content -->
                    <div>
                        <span *ngIf="!vp.sm" [style.marginLeft.px]="32" class="mat-body-1"> tx # </span>
                    </div>
                </div>

                <div *ngIf="item">
                    <!--Left Content -->
                    <div>
                        <div class="receivable-icon">
                            <mat-icon class="receive">pending</mat-icon>
                        </div>
                        <div style="flex-direction: column; align-items: flex-start">
                            <div class="mat-body-1">{{ item.amount }}</div>
                        </div>
                    </div>

                    <!--Right Content -->
                    <div>
                        <div
                            (mouseenter)="item.hover = true"
                            (mouseleave)="item.hover = false"
                            [class.mat-body-1]="!vp.sm"
                            [class.mat-body-2]="vp.sm"
                        >
                            <ng-container *ngIf="!vp.sm">
                                <span>from </span>
                            </ng-container>
                            <div
                                class="link accounts-hash-link"
                                [style.marginLeft.px]="8"
                                (click)="openLink(item.hash)"
                            >
                                <ng-container>
                                    {{ formatAddress(item.address) }}
                                </ng-container>
                            </div>
                            <div class="copy-address-button">
                                <button mat-icon-button *ngIf="item.hover" (click)="copyTransactionAddress(item)">
                                    <mat-icon style="font-size: 16px">{{
                                        item.showCopiedIcon ? 'check_circle' : 'content_copy'
                                    }}</mat-icon>
                                </button>
                            </div>
                        </div>
                        <span *ngIf="!vp.sm" [style.marginLeft.px]="32" class="mat-body-1">
                            {{ util.timestampToRelative(item.timestamp) }}
                        </span>
                        <button mat-icon-button [style.marginLeft.px]="32" (click)="receiveThis()">
                            <mat-icon class="icon-secondary">download</mat-icon>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./receivable.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ReceivableComponent {
    @Input() item: ReceivableTx;
    @Input() even: boolean;
    @Input() transactionRowHeight: number;
    @Input() index: number;

    colors = Colors;

    constructor(
        public util: UtilService,
        public vp: ViewportService,
        private readonly _themeService: ThemeService,
        private readonly _accountService: AccountService,
        private readonly _appStateService: AppStateService,
        private readonly _transactionService: TransactionService
    ) {}

    /** Copies transaction sender, recipient, or new representative to clipboard. */
    copyTransactionAddress(item: ReceivableTx): void {
        this.util.clipboardCopy(item.address);
        item.showCopiedIcon = true;
        setTimeout(() => {
            item.showCopiedIcon = false;
        }, 700);
    }

    /** Shows alias (if exists) or shortened address. */
    formatAddress(address: string): string {
        return (
            this._appStateService.store.getValue().addressBook.get(address) ||
            this._appStateService.knownAccounts.get(address) ||
            this.util.shortenAddress(address)
        );
    }

    /** Open link in an explorer, defaults to YellowSpyglass. */
    openLink(hash: string): void {
        this._accountService.showBlockInExplorer(hash);
    }

    /** Useful for alternating row colors. */
    isDark(): boolean {
        return this._themeService.isDark();
    }

    getRowBgColor(even: boolean): string {
        return even || this.vp.sm
            ? this.isDark()
                ? this.colors.darkBlack[300]
                : this.colors.white[100]
            : this.isDark()
            ? this.colors.darkBlack[200]
            : this.colors.white[50];
    }

    async receiveThis(): Promise<void> {
        await this._transactionService.receive(this.index, {
            hash: this.item.hash,
            receivableRaw: this.item.amountRaw,
        });
        TRANSACTION_COMPLETED_SUCCESS.next(undefined);
        REFRESH_DASHBOARD_ACCOUNTS.next();
    }
}
