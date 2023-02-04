import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';
import { Datasource, DatasourceService } from '@app/services/datasource.service';
import { ChangePasswordBottomSheetComponent } from '@app/overlays/bottom-sheet/change-password/change-password-bottom-sheet.component';
import { ChangePasswordDialogComponent } from '@app/overlays/dialogs/change-password/change-password-dialog.component';
import { ViewportService } from '@app/services/viewport.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { REMOVE_ALL_WALLET_DATA, SELECT_LOCALIZATION_CURRENCY } from '@app/services/wallet-events.service';
import { MatRadioChange } from '@angular/material/radio';
import { CurrencyConversionService } from '@app/services/currency-conversion.service';
import { AppStateService } from '@app/services/app-state.service';
import { MatSelectChange } from '@angular/material/select';
import { UntilDestroy } from '@ngneat/until-destroy';

@Pipe({ name: 'available' })
export class DatasourceAvailablePipe implements PipeTransform {
    transform(items: Datasource[]): Datasource[] {
        return items.filter((item) => item.isAccessible === true);
    }
}

@UntilDestroy()
@Component({
    selector: 'app-settings-page',
    template: `
        <ng-template #radioData let-source="source">
            <div [class.primary]="source.isSelected" [style.fontWeight]="source.isSelected ? 600 : 400">
                {{ source.alias }}
            </div>
            <div class="mono">{{ source.url }}</div>
        </ng-template>

        <div class="app-root app-settings-page" responsive>
            <mat-toolbar color="primary" class="mat-elevation-z2 app-toolbar" responsive>
                <div style="display: flex; align-items: center">
                    <button mat-icon-button (click)="back()">
                        <mat-icon style="color: var(--text-contrast)">close</mat-icon>
                    </button>
                    <span style="margin-left: 12px; color: var(--text-contrast)">Settings</span>
                </div>
            </mat-toolbar>

            <div class="app-body" responsive>
                <div class="app-body-content">
                    <mat-card appearance="outlined" style="margin-bottom: 32px">
                        <div class="mat-headline-6">Account Security</div>
                        <mat-divider></mat-divider>
                        <div class="account-security-option" responsive>
                            <div style="padding-top: 16px; flex: 1">
                                <div class="mat-overline">Account Password</div>
                                <div class="mat-body-2">The password used to access all encrypted wallets.</div>
                            </div>
                            <button
                                mat-stroked-button
                                blui-inline
                                color="primary"
                                class="preserve-non-mobile"
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
                                <div class="mat-body-2">
                                    Press & hold to remove all encrypted wallets and preferences from this browser.
                                </div>
                            </div>
                            <button
                                mat-stroked-button
                                blui-inline
                                color="warn"
                                class="preserve-non-mobile"
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
                    <mat-card appearance="outlined" style="margin-bottom: 32px">
                        <div class="mat-headline-6">Data Sources</div>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 16px">Node RPC Datasource</div>
                        <div class="mat-body-2">The node which broadcasts send, receive and change transactions.</div>
                        <mat-radio-group
                            style="margin-bottom: 8px; display: inline-block"
                            aria-label="Select a RPC source"
                            [(ngModel)]="selectedRpcSource"
                            (change)="selectRpc($event)"
                        >
                            <mat-radio-button
                                *ngFor="let source of datasourceService.availableRpcDataSources | available"
                                [value]="source"
                                [aria-label]="source.alias"
                            >
                                <ng-template *ngTemplateOutlet="radioData; context: { source }"></ng-template>
                            </mat-radio-button>
                        </mat-radio-group>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 16px">Spyglass API Datasource</div>
                        <div class="mat-body-2" style="margin-bottom: 8px">
                            Provides a filtered transaction history, fetches representative scores and account aliases.
                        </div>
                        <mat-radio-group
                            aria-label="Select a Spyglass API source"
                            [(ngModel)]="selectedSpyglassApi"
                            (change)="selectSpyglassApi($event)"
                        >
                            <mat-radio-button
                                *ngFor="let source of datasourceService.availableSpyglassApiSources | available"
                                [value]="source"
                                [aria-label]="source.alias"
                            >
                                <ng-template *ngTemplateOutlet="radioData; context: { source }"></ng-template>
                            </mat-radio-button>
                        </mat-radio-group>
                    </mat-card>

                    <mat-card appearance="outlined" style="margin-bottom: 32px">
                        <div class="mat-headline-6">Localization</div>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 16px">Local Currency</div>
                        <div class="mat-body-2">The currency used to display account balances and send amounts.</div>
                        <mat-form-field
                            appearance="fill"
                            style="margin-top: 24px;"
                            [style.maxWidth.px]="vp.sm ? 'unset' : 400"
                        >
                            <mat-label>Currency</mat-label>
                            <mat-select [value]="selectedCurrencyCode" (selectionChange)="changeCurrencySelect($event)">
                                <mat-option
                                    *ngFor="let currency of currencyConversionService.currencies"
                                    [value]="currency.code"
                                >
                                    <div style="display: flex; justify-content: space-between; align-items: center">
                                        <div>
                                            {{ currency.description }}
                                        </div>
                                        <div>{{ currency.code }}</div>
                                    </div>
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                    </mat-card>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./settings.component.scss'],
})
export class SettingsPageComponent implements OnInit {
    selectedRpcSource: any;
    selectedSpyglassApi: any;
    selectedCurrencyCode: string;

    constructor(
        public vp: ViewportService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _location: Location,
        private readonly _sheet: MatBottomSheet,
        private readonly _appStateService: AppStateService,
        public datasourceService: DatasourceService,
        public currencyConversionService: CurrencyConversionService
    ) {
        this._appStateService.store.subscribe((data) => {
            this.selectedCurrencyCode = data.localCurrencyCode;
        });
    }

    async ngOnInit(): Promise<void> {
        this.selectedSpyglassApi = await this.datasourceService.getSpyglassApiSource();
        this.selectedRpcSource = await this.datasourceService.getRpcSource();
    }

    back(): void {
        this._location.back();
    }

    openChangePasswordOverlay(): void {
        if (this.vp.sm) {
            this._sheet.open(ChangePasswordBottomSheetComponent);
        } else {
            this._dialog.open(ChangePasswordDialogComponent);
        }
    }

    clearStorage(): void {
        REMOVE_ALL_WALLET_DATA.next();
        void this._router.navigate(['/']);
    }

    selectRpc(e: MatRadioChange): void {
        this.datasourceService.setRpcSource(e.value);
    }

    selectSpyglassApi(e: MatRadioChange): void {
        this.datasourceService.setSpyglassApiSource(e.value);
    }

    changeCurrencySelect(event: MatSelectChange): void {
        SELECT_LOCALIZATION_CURRENCY.next(event.value);
    }
}
