import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';
import { COPY_ADDRESS_TO_CLIPBOARD, REMOVE_ACCOUNTS_BY_INDEX } from '@app/services/wallet-events.service';
import { RenameAddressBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-address/rename-address-bottom-sheet.component';
import { RenameAddressDialogComponent } from '@app/overlays/dialogs/rename-address/rename-address-dialog.component';
import { ViewportService } from '@app/services/viewport.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-account-actions',
    encapsulation: ViewEncapsulation.None,
    template: `
        <ng-template #trigger>
            <button
                mat-icon-button
                (click)="account.moreOptionsOpen = !account.moreOptionsOpen; $event.stopPropagation()"
            >
                <mat-icon class="icon-secondary">more_vert</mat-icon>
            </button>
        </ng-template>

        <ng-template #menu>
            <button mat-menu-item (click)="copyAccountAddressMobile(account); account.moreOptionsOpen = false">
                Copy Address
            </button>
            <button mat-menu-item (click)="hideAccount(account)">Hide Account</button>
            <button mat-menu-item (click)="openRenameWalletOverlay(account)">Rename Account</button>
        </ng-template>

        <responsive-menu
            menuTitle="Account"
            [(open)]="account.moreOptionsOpen"
            [menu]="menu"
            [desktopTrigger]="trigger"
            [mobileTrigger]="trigger"
        >
        </responsive-menu>
    `,
})
export class AccountActionsComponent {
    bottomSheetOpenDelayMs = 250;

    @Input() account: AccountOverview;

    constructor(
        public vp: ViewportService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet
    ) {}

    copyAccountAddressMobile(account: AccountOverview): void {
        COPY_ADDRESS_TO_CLIPBOARD.next({ address: account.fullAddress });
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

    hideAccount(account: AccountOverview): void {
        // Dismiss sheet and then hide account.
        account.moreOptionsOpen = false;
        setTimeout(() => {
            REMOVE_ACCOUNTS_BY_INDEX.next([account.index]);
        }, 100);
    }
}
