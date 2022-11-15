import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { DatasourceService } from '@app/services/datasource.service';
import { ChangePasswordBottomSheetComponent } from '@app/overlays/bottom-sheet/change-password/change-password-bottom-sheet.component';
import { ChangePasswordDialogComponent } from '@app/overlays/dialogs/change-password/change-password-dialog.component';
import { ViewportService } from '@app/services/viewport.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { PowService } from '@app/services/pow.service';

@Component({
    selector: 'app-settings-page',
    template: `
        <div class="app-root app-settings-page" responsive>
            <mat-toolbar color="primary" class="mat-elevation-z2 app-toolbar" responsive>
                <div style="display: flex; align-items: center">
                    <button mat-icon-button (click)="back()">
                        <mat-icon>close</mat-icon>
                    </button>
                    <span style="margin-left: 12px">Settings</span>
                </div>
            </mat-toolbar>

            <div class="app-body" responsive>
                <div class="app-body-content">
                    <mat-card style="margin-bottom: 32px">
                        <div class="mat-title">Account Security</div>
                        <mat-divider></mat-divider>
                        <div class="account-security-option" responsive>
                            <div style="padding-top: 16px; flex: 1">
                                <div class="mat-overline">Account Password</div>
                                <div class="mat-body-1">The password used to access all encrypted wallets.</div>
                            </div>
                            <button
                                mat-stroked-button
                                blui-inline
                                color="primary"
                                (click)="openChangePasswordOverlay()"
                                data-cy="change-password-button"
                            >
                                <mat-icon>edit</mat-icon>
                                <span>Change Password</span>
                            </button>
                        </div>
                        <mat-divider></mat-divider>
                        <div class="account-security-option" responsive style="margin-bottom: 0">
                            <div style="padding-top: 16px; flex: 1">
                                <div class="mat-overline">Clear Local Storage</div>
                                <div class="mat-body-1">
                                    Press & hold to remove all encrypted wallets and preferences from this browser.
                                </div>
                            </div>
                            <button
                                mat-stroked-button
                                blui-inline
                                color="warn"
                                longPress
                                (mouseLongPress)="clearStorage()"
                                data-cy="clear-storage-button"
                            >
                                <mat-icon>delete_outline</mat-icon>
                                <span>Remove</span>
                            </button>
                        </div>
                    </mat-card>
                    <!--
                    <mat-card style="margin-bottom: 32px; padding-bottom: 24px">
                        <div class="mat-title">Proof-of-Work</div>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 16px">Use Client-Side POW</div>
                        <div class="mat-body-1" style="margin-bottom: 8px">
                            Your local computer will perform the computation required when sending or receiving
                            transactions.
                        </div>
                        <mat-checkbox
                            [checked]="powService.getUseClientSidePow()"
                            (change)="powService.setUseClientSidePow($event.checked)"
                        >
                            Enable local proof-of-work
                        </mat-checkbox>
                        <div *ngIf="!powService.isWebGLAvailable" style="margin-top: 8px">
                            <strong>Warning:</strong> This may be very slow on your browser; it is advised to disable
                            this feature & offload this work to a remote server.
                        </div>
                    </mat-card>
                    -->
                    <mat-card style="margin-bottom: 32px">
                        <div class="mat-title">Data Sources</div>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 16px">Node RPC Datasource</div>
                        <div class="mat-body-1" style="margin-bottom: 8px">
                            The node which broadcasts send, receive and change transactions.
                        </div>
                        <div style="margin-bottom: 16px;">
                            <div *ngFor="let source of datasourceService.availableRpcDataSources">
                                <mat-checkbox
                                    *ngIf="source.isAccessible"
                                    [checked]="source.isSelected"
                                    (change)="datasourceService.setRpcSource(source)"
                                >
                                    <div
                                        [style.fontWeight]="source.isSelected ? 600 : 400"
                                        [class.primary]="source.isSelected"
                                    >
                                        {{ source.alias }}
                                    </div>
                                    <div class="mono">{{ source.url }}</div>
                                </mat-checkbox>
                            </div>
                        </div>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 16px">Spyglass API Datasource</div>
                        <div class="mat-body-1" style="margin-bottom: 8px">
                            Provides a filtered transaction history, fetches representative scores and account aliases.
                        </div>
                        <div *ngFor="let source of datasourceService.availableSpyglassApiSources">
                            <mat-checkbox
                                *ngIf="source.isAccessible"
                                [checked]="source.isSelected"
                                (change)="datasourceService.setSpyglassApiSource(source)"
                            >
                                <div
                                    [style.fontWeight]="source.isSelected ? 600 : 400"
                                    [class.primary]="source.isSelected"
                                >
                                    {{ source.alias }}
                                </div>
                                <div class="mono">{{ source.url }}</div>
                            </mat-checkbox>
                        </div>
                    </mat-card>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./settings.component.scss'],
})
export class SettingsPageComponent {
    bottomSheetOpenDelayMs = 250;

    constructor(
        public vp: ViewportService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _location: Location,
        private readonly _walletEventService: WalletEventsService,
        private readonly _router: Router,
        public powService: PowService,
        public datasourceService: DatasourceService
    ) {}

    back(): void {
        this._location.back();
    }

    openChangePasswordOverlay(): void {
        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(ChangePasswordBottomSheetComponent);
            }, this.bottomSheetOpenDelayMs);
        } else {
            this._dialog.open(ChangePasswordDialogComponent);
        }
    }

    clearStorage(): void {
        this._walletEventService.clearLocalStorage.next();
        void this._router.navigate(['/']);
    }
}
