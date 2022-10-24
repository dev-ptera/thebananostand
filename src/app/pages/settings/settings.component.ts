import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { DatasourceService } from '@app/services/datasource.service';
import { ChangePasswordBottomSheetComponent } from '@app/overlays/bottom-sheet/change-password/change-password-bottom-sheet.component';
import { ChangePasswordDialogComponent } from '@app/overlays/dialogs/change-password/change-password-dialog.component';
import { ViewportService } from '@app/services/viewport.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

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
                        <div style="display: flex; align-items: center; justify-content: space-between">
                            <div style="padding-top: 16px; flex: 1">
                                <div class="mat-overline">Account Password</div>
                                <div class="mat-body-1">The password used to access all encrypted wallets.</div>
                            </div>
                            <button
                                mat-stroked-button
                                color="primary"
                                (click)="openChangePasswordOverlay()"
                                data-cy="change-password-button"
                                style="min-width: 160px; margin-left: 16px"
                            >
                                Change Password
                            </button>
                        </div>
                    </mat-card>
                    <mat-card>
                        <div class="mat-title">Data Sources</div>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 32px">Node RPC Datasource</div>
                        <div class="mat-body-1" style="margin-bottom: 16px">
                            This is used for send/receive/change actions and fetching account balances.
                        </div>
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
                        <div class="mat-overline" style="margin-top: 32px">Spyglass API Datasource</div>
                        <div class="mat-body-1" style="margin-bottom: 16px">
                            This is used to show filtered transaction history, fetch representative scores and account
                            aliases.
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
}
