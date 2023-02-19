import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';
import * as Colors from '@brightlayer-ui/colors';
import { ViewportService } from '@app/services/viewport.service';
import { Router } from '@angular/router';
import { UtilService } from '@app/services/util.service';
import { AccountService } from '@app/services/account.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';

@Component({
    selector: 'app-account-card',
    styleUrls: ['account-card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    template: `
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
                    [backgroundColor]="colors.orange[100]"
                    [fontColor]="colors.black[500]"
                >
                </list-item-tag>
                <list-item-tag
                    *ngIf="showRepresentativeOffline(account.representative)"
                    label="Representative Offline"
                    class="rep-offline-tag"
                    [backgroundColor]="colors.red[100]"
                    [fontColor]="colors.black[500]"
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
                            <div [style.width.px]="vp.sm ? 80 : 124" style="aspect-ratio: 1 / 1;">
                                <img [src]="getMonkeyUrl(account.fullAddress)" loading="lazy" style="height: 100%" />
                            </div>
                            <div [style.paddingLeft.px]="vp.sm ? 8 : 8" style="padding-top: 8px; padding-bottom: 8px">
                                <div class="mono" [class.mat-body-2]="vp.sm" [class.mat-body-1]="!vp.sm">
                                    {{ account.shortAddress }}
                                </div>
                                <div
                                    [style.marginTop.px]="vp.sm ? 4 : 16"
                                    [class.mat-headline-5]="!vp.sm"
                                    [class.mat-headline-6]="vp.sm"
                                >
                                    {{ account.formattedBalance }} <span style="font-weight: 400">BAN</span>
                                </div>
                                <div class="hint mat-caption" [style.marginTop.px]="vp.sm ? -4 : 0">
                                    ~{{
                                        account.balance
                                            | conversionFromBAN
                                                : store.localCurrencyConversionRate
                                                : store.priceDataUSD.bananoPriceUsd
                                            | number
                                    }}
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
                                <div class="mat-body-1 hint">Unopened Account</div>
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
                        <app-account-actions [account]="account"></app-account-actions>
                    </div>
                </div>
            </mat-card>
        </div>
    `,
})
export class AccountCardComponent {
    store: AppStore;
    colors = Colors;

    @Input() accounts: AccountOverview[] = [];
    @Input() sortDirection: 'none' | 'asc' | 'desc';

    constructor(
        public vp: ViewportService,
        private readonly _router: Router,
        private readonly _util: UtilService,
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

    formatRepresentative(rep: string): string {
        return this._appStateService.knownAccounts.get(rep) || this._util.shortenAddress(rep);
    }

    openAccount(address: string): void {
        void this._router.navigate([`/account/${address}`]);
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
        return this.store.addressBook.get(account.fullAddress);
    }

    getMonkeyUrl(address: string): string {
        return this._accountService.createMonKeyUrl(address);
    }
}
