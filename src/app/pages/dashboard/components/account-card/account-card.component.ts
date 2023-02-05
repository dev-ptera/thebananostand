import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';
import * as Colors from '@brightlayer-ui/colors';
import { COPY_ADDRESS_TO_CLIPBOARD, REMOVE_ACCOUNTS_BY_INDEX } from '@app/services/wallet-events.service';
import { ViewportService } from '@app/services/viewport.service';
import { Router } from '@angular/router';
import { UtilService } from '@app/services/util.service';
import { ThemeService } from '@app/services/theme.service';
import { AccountService } from '@app/services/account.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { RenameAddressDialogComponent } from '@app/overlays/dialogs/rename-address/rename-address-dialog.component';
import { RenameAddressBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-address/rename-address-bottom-sheet.component';

@Component({
    selector: 'app-account-card',
    styleUrls: ['account-card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    template: `
        <!-- Account-specific actions. -->
        <ng-template #accountMoreOptions let-account="account">
            <ng-template #accountMoreOptionsTrigger>
                <button
                    mat-icon-button
                    (click)="account.moreOptionsOpen = !account.moreOptionsOpen; $event.stopPropagation()"
                >
                    <mat-icon class="icon-secondary">more_vert</mat-icon>
                </button>
            </ng-template>
            <ng-template #accountMoreOptionsMenu>
                <button mat-menu-item (click)="copyAccountAddressMobile(account); account.moreOptionsOpen = false">
                    Copy Address
                </button>
                <button mat-menu-item (click)="hideAccount(account)">Hide Account</button>
                <button mat-menu-item (click)="openRenameWalletOverlay(account)">Rename Account</button>
            </ng-template>
            <responsive-menu
                menuTitle="Account"
                [(open)]="account.moreOptionsOpen"
                [menu]="accountMoreOptionsMenu"
                [desktopTrigger]="accountMoreOptionsTrigger"
                [mobileTrigger]="accountMoreOptionsTrigger"
            >
            </responsive-menu>
        </ng-template>

        <!-- Indicates an account has not yet received any transactions -->
        <ng-template #unopenedAccountTag>
            <list-item-tag
                responsive
                label="Unopened Account"
                class="unopened-account-tag"
                [fontColor]="colors.black[500]"
                [backgroundColor]="colors.gray[100]"
            >
            </list-item-tag>
        </ng-template>

        <!-- Statuses that are shown beneath an address.  Includes "Rep Offline" & "Has Receivable" information. -->
        <ng-template #statusBadges let-account="account">
            <div
                class="detail-row"
                *ngIf="account.pending.length > 0 || showRepresentativeOffline(account.representative)"
                style="display: flex; align-items: center"
                [style.marginTop.px]="vp.sm ? 8 : 4"
            >
                <list-item-tag
                    *ngIf="account.pending.length > 0"
                    label="Has Receivable"
                    class="receivable-tag"
                    style="margin-right: 16px"
                    [backgroundColor]="colors.orange[500]"
                    [fontColor]="colors.white[50]"
                >
                </list-item-tag>
                <list-item-tag
                    *ngIf="showRepresentativeOffline(account.representative)"
                    label="Representative Offline"
                    class="rep-offline-tag"
                    [backgroundColor]="colors.red[500]"
                    [fontColor]="colors.white[50]"
                    style="margin-right: 16px"
                ></list-item-tag>
            </div>
        </ng-template>

        <div class="account-card-container" responsive data-cy="dashboard-account-cards-container">
            <mat-card
                data-cy="dashboard-account-card"
                *ngFor="let account of accounts | sort : sortDirection : accounts.length; trackBy: markUniqueAccount"
                class="account-card divider-border"
            >
                <div data-cy="account-number" class="card-account-number mat-caption">
                    #{{ _util.numberWithCommas(account.index) }}
                </div>
                <div style="display: flex; align-items: center; height: 100%">
                    <div style="display: flex; justify-content: center; flex: 1; flex-direction: column; height: 100%">
                        <div style="display: flex; align-items: center">
                            <div [style.width.px]="vp.sm ? 80 : 124" style="aspect-ratio: 1 / 1">
                                <img [src]="getMonkeyUrl(account.fullAddress)" loading="lazy" style="height: 100%" />
                            </div>
                            <div [style.paddingLeft.px]="vp.sm ? 8 : 24" style="padding-top: 8px; padding-bottom: 8px">
                                <div class="mono mat-body-1">
                                    {{ account.shortAddress }}
                                </div>
                                <div
                                    [style.marginTop.px]="vp.sm ? 8 : 16"
                                    [class.mat-headline-5]="!vp.sm"
                                    [class.mat-headline-6]="vp.sm"
                                >
                                    {{ account.formattedBalance }} <span style="font-weight: 400">BAN</span>
                                </div>
                                <div class="hint mat-caption">
                                    ~{{ account.balance | conversionFromBAN | number }}
                                    {{ store.localCurrencyCode }}
                                </div>
                            </div>
                        </div>
                        <mat-divider></mat-divider>
                        <div style="flex: 1">
                            <div class="mat-body-2" style="padding: 16px 0" *ngIf="account.representative">
                                <div class="detail-row" *ngIf="getAccountNickname(account)">
                                    <mat-icon>star</mat-icon>
                                    <div>
                                        Also known as <strong>{{ getAccountNickname(account) }}</strong>
                                    </div>
                                </div>
                                <div class="detail-row">
                                    <mat-icon>how_to_vote</mat-icon>
                                    <div>
                                        Represented by
                                        <strong>{{ formatRepresentative(account.representative) }}</strong>
                                    </div>
                                </div>
                                <div class="detail-row">
                                    <mat-icon>receipt_long</mat-icon>
                                    <div>
                                        Processed <strong>{{ account.blockCount }}</strong> transactions
                                    </div>
                                </div>
                                <div class="detail-row">
                                    <mat-icon>schedule</mat-icon>
                                    <div>
                                        Last used on
                                        <strong>{{ convertUnixToDate(account.lastUpdatedTimestamp) }}</strong>
                                    </div>
                                </div>

                                <ng-template
                                    *ngTemplateOutlet="statusBadges; context: { account: this.account }"
                                ></ng-template>
                            </div>
                            <div *ngIf="!account.representative" style="padding: 16px 8px">
                                <div class="mat-headline-5 hint">Unopened Account</div>
                            </div>
                        </div>
                        <mat-divider> </mat-divider>
                        <div
                            data-cy="dashboard-account-card-footer"
                            class="card-footer"
                            (click)="openAccount(account.fullAddress)"
                        >
                            <div class="mat-body-1">View Account</div>
                            <mat-icon>chevron_right</mat-icon>
                        </div>
                    </div>

                    <div style="position: absolute; top: 8px; right: 8px">
                        <ng-template
                            *ngTemplateOutlet="accountMoreOptions; context: { account: this.account }"
                        ></ng-template>
                    </div>
                </div>
            </mat-card>
        </div>
    `,
})
export class AccountCardComponent {
    colors = Colors;
    hoverRowNumber: number;
    bottomSheetOpenDelayMs = 250;

    store: AppStore;
    @Input() accounts: AccountOverview[] = [];
    @Input() sortDirection: 'none' | 'asc' | 'desc';

    constructor(
        public vp: ViewportService,
        private readonly _router: Router,
        private readonly _util: UtilService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _themeService: ThemeService,
        private readonly _accountService: AccountService,
        private readonly _appStateService: AppStateService
    ) {}

    ngOnInit(): void {
        this.store = this._appStateService.store.getValue();
    }

    markUniqueAccount(index: number, item: AccountOverview): any {
        return item.shortAddress;
    }

    showRepresentativeOffline(address: string): boolean {
        return !this._accountService.isRepOnline(address);
    }

    hideAccount(account: AccountOverview): void {
        // Dismiss sheet and then hide account.
        account.moreOptionsOpen = false;
        setTimeout(() => {
            REMOVE_ACCOUNTS_BY_INDEX.next([account.index]);
        }, 100);
    }

    copyAccountAddressMobile(account: AccountOverview): void {
        COPY_ADDRESS_TO_CLIPBOARD.next({ address: account.fullAddress });
    }

    formatRepresentative(rep: string): string {
        return this._appStateService.knownAccounts.get(rep) || this._util.shortenAddress(rep);
    }

    getItemBackgroundColor(even: boolean): string {
        if (even || this.vp.sm) {
            return this._themeService.isDark() ? this.colors.darkBlack[300] : this.colors.white[100];
        }
        return this._themeService.isDark() ? this.colors.darkBlack[200] : this.colors.white[50];
    }

    openAccount(address: string): void {
        void this._router.navigate([`/account/${address}`]);
    }

    openRenameWalletOverlay(account: AccountOverview): void {
        const data = {
            data: {
                address: account.fullAddress,
            },
        };

        if (this.vp.sm) {
            setTimeout(() => {
                const ref = this._sheet.open(RenameAddressBottomSheetComponent, data);
                ref.afterDismissed().subscribe(() => {
                    account.moreOptionsOpen = false;
                });
            }, this.bottomSheetOpenDelayMs);
        } else {
            const ref = this._dialog.open(RenameAddressDialogComponent, data);
            ref.afterClosed().subscribe(() => {
                account.moreOptionsOpen = false;
            });
        }
    }

    convertUnixToDate(timestamp: string): string {
        const ts = Number(timestamp);
        if (ts === 0) {
            return 'Unknown';
        }

        const date = `${new Date(ts * 1000).toLocaleDateString()}`;
        // const timeLocal = `${new Date(ts * 1000).toLocaleTimeString()}`;
        return date;
    }

    getAccountNickname(account: AccountOverview): string {
        return this._appStateService.store.getValue().addressBook.get(account.fullAddress);
    }

    getMonkeyUrl(address: string): string {
        return this._accountService.createMonKeyUrl(address);
    }
}
