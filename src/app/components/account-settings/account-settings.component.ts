import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SecretService } from '@app/services/secret.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ChangePasswordDialogComponent } from '@app/overlays/dialogs/change-password/change-password-dialog.component';
import { ViewportService } from '@app/services/viewport.service';
import { ChangePasswordBottomSheetComponent } from '@app/overlays/bottom-sheet/change-password/change-password-bottom-sheet.component';

@Component({
    selector: 'app-account-settings',
    template: `
        <blui-user-menu *ngIf="show()" data-cy="account-settings" menuTitle="Account" [(open)]="userMenuOpen">
            <mat-icon blui-avatar>settings</mat-icon>
            <mat-nav-list blui-menu-body [style.paddingTop.px]="0">
                <blui-info-list-item
                    [dense]="true"
                    (click)="openChangePasswordOverlay()"
                    data-cy="change-password-button"
                >
                    <mat-icon blui-icon>lock</mat-icon>
                    <div blui-title>Change Password</div>
                </blui-info-list-item>
            </mat-nav-list>
        </blui-user-menu>
    `,
    styleUrls: ['./account-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppAccountSettingsComponent {
    userMenuOpen = false;
    bottomSheetOpenDelayMs = 250;

    constructor(
        private readonly _router: Router,
        public vp: ViewportService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _secretService: SecretService
    ) {}

    openChangePasswordOverlay(): void {
        this.userMenuOpen = false;
        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(ChangePasswordBottomSheetComponent);
            }, this.bottomSheetOpenDelayMs);
        } else {
            this._dialog.open(ChangePasswordDialogComponent);
        }
    }

    show(): boolean {
        return this._secretService.hasSecret() && this._secretService.isLocalSecretUnlocked();
    }
}
