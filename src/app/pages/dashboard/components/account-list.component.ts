import { Component, Input } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';
import * as Colors from '@brightlayer-ui/colors';
import { COPY_ADDRESS_TO_CLIPBOARD, REMOVE_ACCOUNTS_BY_INDEX } from '@app/services/wallet-events.service';
import { ViewportService } from '@app/services/viewport.service';
import { Router } from '@angular/router';
import { UtilService } from '@app/services/util.service';
import { ThemeService } from '@app/services/theme.service';
import { AccountService } from '@app/services/account.service';
import { AppStateService } from '@app/services/app-state.service';

@Component({
    selector: 'app-account-list',
    styleUrls: ['accounts-list.component.scss'],
    template: `
        <!-- Account-specific actions. -->
        <ng-template #accountMoreOptions let-account="account">
            <ng-template #accountMoreOptionsTrigger>
                <button
                    mat-icon-button
                    style="margin-left: 8px"
                    [style.marginRight.px]="vp.sm ? -24 : -8"
                    (click)="account.moreOptionsOpen = !account.moreOptionsOpen; $event.stopPropagation()"
                >
                    <mat-icon>more_vert</mat-icon>
                </button>
            </ng-template>
            <ng-template #accountMoreOptionsMenu>
                <button mat-menu-item (click)="copyAccountAddressMobile(account); account.moreOptionsOpen = false">
                    Copy Address
                </button>
                <button mat-menu-item (click)="hideAccount(account)">Hide Account</button>
                <!--
                <button mat-menu-item (click)="openRenameWalletOverlay()">
                    Rename Account
                </button>
                -->
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
            <blui-list-item-tag
                responsive
                label="Unopened Account"
                class="unopened-account-tag"
                [fontColor]="colors.black[500]"
                [backgroundColor]="colors.gray[100]"
            >
            </blui-list-item-tag>
        </ng-template>

        <!-- Statuses that are shown beneath an address.  Includes "Rep Offline" & "Has Receivable" information. -->
        <ng-template #statusBadges let-account="account">
            <div style="display: flex; align-items: center">
                <blui-list-item-tag
                    *ngIf="account.pending.length > 0"
                    [label]="vp.sm ? 'Receivable' : 'Has Receivable'"
                    class="receivable-tag"
                    style="margin-right: 16px"
                    [backgroundColor]="colors.orange[500]"
                >
                </blui-list-item-tag>
                <blui-list-item-tag
                    *ngIf="showRepresentativeOffline(account.representative)"
                    label="Rep Offline"
                    class="rep-offline-tag"
                    [backgroundColor]="colors.red[500]"
                    style="margin-right: 16px"
                ></blui-list-item-tag>
            </div>
        </ng-template>

        <mat-nav-list
            responsive
            *ngIf="accounts.length > 0"
            data-cy="dashboard-account-list"
            class="dashboard-account-list fade"
            [disableRipple]="true"
        >
            <blui-info-list-item
                *ngFor="
                    let account of accounts | sort: sortDirection:accounts.length;
                    let i = index;
                    let even = even;
                    let last = last;
                    trackBy: markUniqueAccount
                "
                (mouseenter)="hoverRowNumber = i"
                (mouseleave)="hoverRowNumber = undefined"
                [class.hovered]="hoverRowNumber === i"
                [divider]="last ? undefined : 'full'"
                [style.backgroundColor]="getItemBackgroundColor(even)"
                (click)="openAccount(account.fullAddress)"
            >
                <div
                    blui-left-content
                    style="display: flex; align-items: center; min-width: 72px;"
                    [style.marginLeft.px]="vp.sm ? -8 : 0"
                >
                    <img [src]="getMonkeyUrl(account.fullAddress)" loading="lazy" [height]="72" />
                    <div class="account-number mat-hint" [class.primary]="hoverRowNumber === i">
                        #{{ _util.numberWithCommas(account.index) }}
                    </div>
                </div>
                <div
                    blui-title
                    class="mono"
                    [class.primary]="hoverRowNumber === i"
                    style="padding: 1px 0; z-index: 2"
                    [style.fontSize.px]="vp.sm ? 15 : 'inherit'"
                >
                    {{ account.shortAddress }}
                </div>
                <div blui-subtitle style="padding: 1px 0; display: flex; align-items: center">
                    <ng-container *ngIf="!vp.sm && account.representative">
                        represented by {{ formatRepresentative(account.representative) }}
                    </ng-container>

                    <ng-container *ngIf="vp.sm">
                        <ng-container *ngIf="account.representative; else unopenedAccountTag">
                            <span> {{ account.formattedBalance }} BAN </span>
                        </ng-container>
                    </ng-container>
                </div>
                <div blui-info *ngIf="vp.sm" style="margin-top: 4px">
                    <div style="display: flex">
                        <ng-template *ngTemplateOutlet="statusBadges; context: { account: this.account }"></ng-template>
                    </div>
                </div>
                <div blui-right-content>
                    <ng-container *ngIf="!vp.sm">
                        <ng-template *ngTemplateOutlet="statusBadges; context: { account: this.account }"></ng-template>
                        <ng-container *ngIf="account.representative; else unopenedAccountTag">
                            <span> {{ account.formattedBalance }} BAN </span>
                        </ng-container>
                    </ng-container>
                    <ng-template
                        *ngTemplateOutlet="accountMoreOptions; context: { account: this.account }"
                    ></ng-template>
                </div>
            </blui-info-list-item>
        </mat-nav-list>
    `,
})
export class AccountListComponent {
    colors = Colors;
    hoverRowNumber: number;

    @Input() accounts: AccountOverview[] = [];
    @Input() sortDirection: 'none' | 'asc' | 'desc';

    constructor(
        public vp: ViewportService,
        private readonly _router: Router,
        private readonly _util: UtilService,
        private readonly _themeService: ThemeService,
        private readonly _accountService: AccountService,
        private readonly _appStateService: AppStateService
    ) {}

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
        if (even) {
            return this._themeService.isDark() ? this.colors.darkBlack[300] : this.colors.white[100];
        }
        return this._themeService.isDark() ? this.colors.darkBlack[200] : this.colors.white[50];
    }

    openAccount(address: string): void {
        void this._router.navigate([`/account/${address}`]);
    }

    getMonkeyUrl(address: string): string {
        return this._accountService.createMonKeyUrl(address);
    }
}
