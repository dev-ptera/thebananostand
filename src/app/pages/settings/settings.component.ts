import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Datasource, DatasourceService } from '@app/services/datasource.service';
import { ChangePasswordBottomSheetComponent } from '@app/overlays/bottom-sheet/change-password/change-password-bottom-sheet.component';
import { ChangePasswordDialogComponent } from '@app/overlays/dialogs/change-password/change-password-dialog.component';
import { ViewportService } from '@app/services/viewport.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import {
    EDIT_MINIMUM_INCOMING_THRESHOLD,
    REMOVE_ALL_WALLET_DATA,
    REMOVE_CUSTOM_RPC_NODE_BY_INDEX,
    REMOVE_CUSTOM_SPYGLASS_API_BY_INDEX,
    REMOVE_TLD_BY_NAME,
    SELECT_LOCALIZATION_CURRENCY,
    SELECTED_RPC_DATASOURCE_CHANGE,
    SELECTED_SPYGLASS_API_DATASOURCE_CHANGE,
    USER_TOGGLE_AUTO_RECEIVE,
} from '@app/services/wallet-events.service';
import { MatRadioChange } from '@angular/material/radio';
import { CurrencyConversionService } from '@app/services/currency-conversion.service';
import { AppStateService } from '@app/services/app-state.service';
import { BnsService } from '@app/services/bns.service';
import { MatSelectChange } from '@angular/material/select';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AddRpcBottomSheetComponent } from '@app/overlays/bottom-sheet/add-rpc/add-rpc-bottom-sheet.component';
import { AddRpcDialogComponent } from '@app/overlays/dialogs/add-rpc/add-rpc-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BLUIColors } from '@brightlayer-ui/colors';
import { AddSpyglassBottomSheetComponent } from '@app/overlays/bottom-sheet/add-spyglass/add-spyglass-bottom-sheet.component';
import { AddSpyglassDialogComponent } from '@app/overlays/dialogs/add-spyglass/add-spyglass-dialog.component';
import { AddTldBottomSheetComponent } from '@app/overlays/bottom-sheet/add-tld/add-tld-bottom-sheet.component';
import { AddTldDialogComponent } from '@app/overlays/dialogs/add-tld/add-tld-dialog.component';

@UntilDestroy()
@Component({
    selector: 'app-settings-page',
    template: `
        <ng-template #radioData let-source="source">
            <div [class.primary]="source.isSelected" [style.fontWeight]="source.isSelected ? 600 : 400">
                {{ source.alias }}
            </div>
            <div class="mono datasource-url" style="margin-top: 4px">{{ source.url }}</div>
            <div style="margin-top: 4px">
                <list-item-tag
                    *ngIf="source.isAccessible === true"
                    style="display: flex"
                    label="Online"
                    variant="online"
                    [outline]="true"
                ></list-item-tag>
                <list-item-tag
                    *ngIf="source.isAccessible === false"
                    style="display: flex"
                    label="Offline"
                    variant="offline"
                    [outline]="true"
                ></list-item-tag>
                <list-item-tag
                    *ngIf="source.isAccessible === undefined"
                    style="display: flex"
                    label="Loading"
                    variant="loading"
                    [outline]="true"
                ></list-item-tag>
            </div>
        </ng-template>

        <div class="app-root app-settings-page" responsive>
            <mat-toolbar color="primary" class="app-toolbar" responsive [class.mat-elevation-z2]="!vp.sm">
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
                                longPress
                                (mouseLongPress)="clearStorage()"
                                data-cy="clear-storage-button"
                            >
                                <mat-icon>delete_outline</mat-icon>
                                <span>Remove</span>
                            </button>
                        </div>
                    </mat-card>
                    <mat-card appearance="outlined" style="margin-bottom: 32px">
                        <div class="mat-headline-6">Data Sources</div>
                        <mat-divider></mat-divider>
                        <div class="account-security-option" responsive style="margin-bottom: 0">
                            <div style="padding-top: 16px; flex: 1">
                                <div class="mat-overline">Node RPC Datasource</div>
                                <div class="mat-body-2">
                                    The node which broadcasts send, receive and change transactions.
                                </div>
                            </div>
                            <button
                                mat-stroked-button
                                blui-inline
                                color="primary"
                                (click)="openAddRpcOverlay()"
                                data-cy="add-new-rpc-node-button"
                            >
                                <mat-icon>control_point</mat-icon>
                                <span>Add New</span>
                            </button>
                        </div>
                        <mat-radio-group
                            style="margin-bottom: 8px; display: inline-block"
                            aria-label="Select a RPC source"
                            [(ngModel)]="selectedRpcSource"
                            (change)="selectRpc($event)"
                        >
                            <mat-radio-button
                                *ngFor="let source of datasourceService.availableRpcDataSources"
                                [value]="source"
                                [aria-label]="source.alias"
                                [disabled]="!source.isAccessible"
                            >
                                <ng-template *ngTemplateOutlet="radioData; context: { source }"></ng-template>
                            </mat-radio-button>
                            <div *ngIf="datasourceService.customRpcDataSources.length > 0" class="mat-overline">
                                Custom Entries
                            </div>
                            <div
                                *ngFor="let source of datasourceService.customRpcDataSources; let i = index"
                                style="display: flex; align-items: center; justify-content: space-between"
                            >
                                <mat-radio-button
                                    [value]="source"
                                    [aria-label]="'Custom Source ' + i"
                                    [disabled]="!source.isAccessible"
                                >
                                    <ng-template *ngTemplateOutlet="radioData; context: { source }"></ng-template>
                                </mat-radio-button>
                                <button
                                    mat-icon-button
                                    [matTooltip]="'Remove ' + source.alias"
                                    color="warn"
                                    (click)="removeCustomRpcNode(i)"
                                >
                                    <mat-icon color="warn">clear</mat-icon>
                                </button>
                            </div>
                        </mat-radio-group>
                        <mat-divider></mat-divider>
                        <div class="account-security-option" responsive style="margin-bottom: 0">
                            <div style="padding-top: 16px; flex: 1">
                                <div class="mat-overline" style="margin-top: 16px">Spyglass API Datasource</div>
                                <div class="mat-body-2" style="margin-bottom: 8px">
                                    Provides a filtered transaction history, fetches representative scores and account
                                    aliases.
                                </div>
                            </div>
                            <button
                                mat-stroked-button
                                blui-inline
                                color="primary"
                                (click)="openAddSpyglassOverlay()"
                                data-cy="add-new-spyglass-node-button"
                            >
                                <mat-icon>control_point</mat-icon>
                                <span>Add New</span>
                            </button>
                        </div>
                        <mat-radio-group
                            aria-label="Select a Spyglass API source"
                            [(ngModel)]="selectedSpyglassApi"
                            (change)="selectSpyglassApi($event)"
                        >
                            <mat-radio-button
                                *ngFor="let source of datasourceService.availableSpyglassApiSources"
                                [value]="source"
                                [aria-label]="source.alias"
                                [disabled]="!source.isAccessible"
                            >
                                <ng-template *ngTemplateOutlet="radioData; context: { source }"></ng-template>
                            </mat-radio-button>
                            <div *ngIf="datasourceService.customSpyglassSources.length > 0" class="mat-overline">
                                Custom Entries
                            </div>
                            <div
                                *ngFor="let source of datasourceService.customSpyglassSources; let i = index"
                                style="display: flex; align-items: center; justify-content: space-between"
                            >
                                <mat-radio-button
                                    [value]="source"
                                    [aria-label]="'Custom Source ' + i"
                                    [disabled]="!source.isAccessible"
                                >
                                    <ng-template *ngTemplateOutlet="radioData; context: { source }"></ng-template>
                                </mat-radio-button>
                                <button
                                    mat-icon-button
                                    [matTooltip]="'Remove ' + source.alias"
                                    color="warn"
                                    (click)="removeSpyglassApiSource(i)"
                                >
                                    <mat-icon color="warn">clear</mat-icon>
                                </button>
                            </div>
                        </mat-radio-group>
                        <mat-divider></mat-divider>
                        <div class="account-security-option" responsive style="margin-bottom: 0">
                            <div style="padding-top: 16px; flex: 1">
                                <div class="mat-overline">BNS TLDs</div>
                                <div class="mat-body-2">
                                    Which BNS domain TLDs to recognize and resolve. BNS is a protocol to turn human
                                    readable names like "nishina247.mictest" into Banano addresses.
                                </div>
                            </div>
                            <button
                                mat-stroked-button
                                blui-inline
                                color="primary"
                                (click)="openAddTldOverlay()"
                                data-cy="add-new-tld-button"
                            >
                                <mat-icon>control_point</mat-icon>
                                <span>Add New</span>
                            </button>
                        </div>
                        <mat-list>
                            <div
                                *ngFor="let tld of tlds | keyvalue"
                                style="display: flex; align-items: center; justify-content: space-between"
                            >
                                <mat-list-item> {{ tld.key }}: {{ tld.value }} </mat-list-item>
                                <button
                                    mat-icon-button
                                    [matTooltip]="'Remove ' + tld.key"
                                    color="warn"
                                    (click)="removeTld(tld.key)"
                                    *ngIf="isNotDefaultBnsTld(tld.key)"
                                >
                                    <mat-icon color="warn">clear</mat-icon>
                                </button>
                            </div>
                        </mat-list>
                    </mat-card>

                    <mat-card appearance="outlined" style="margin-bottom: 32px">
                        <div class="mat-headline-6">Wallet Settings</div>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 16px">Local Currency Display</div>
                        <div class="mat-body-2">The currency used to display account balances and send amounts.</div>
                        <mat-form-field
                            appearance="fill"
                            style="margin-top: 24px;"
                            [style.maxWidth.px]="vp.sm ? 'unset' : 400"
                        >
                            <mat-label>Currency</mat-label>
                            <mat-select [value]="selectedCurrencyCode" (selectionChange)="changeCurrencySelect($event)">
                                <mat-option
                                    *ngFor="let currency of currencyConversionService.exchangeRates"
                                    [value]="currency.id"
                                >
                                    <div style="display: flex; justify-content: space-between; align-items: center">
                                        <div>
                                            {{ currency.desc }}
                                        </div>
                                        <div>{{ currency.id }}</div>
                                    </div>
                                </mat-option>
                            </mat-select>
                        </mat-form-field>
                        <mat-divider></mat-divider>
                        <div class="mat-overline" style="margin-top: 16px">Minimum Incoming Transaction Limit</div>
                        <div class="mat-body-2" style="margin-bottom: 24px">
                            Incoming transactions under this value will be ignored.
                        </div>
                        <mat-form-field style="max-width: 320px">
                            <mat-label>Minimum BAN threshold</mat-label>
                            <input
                                matInput
                                placeholder="example: 0.1"
                                [(ngModel)]="minimumThreshold"
                                (ngModelChange)="updateMinimumIncoming()"
                                type="number"
                            />
                        </mat-form-field>
                        <ng-container *ngIf="showAutoReceiveToggle()">
                            <mat-divider></mat-divider>
                            <div class="mat-overline" style="margin-top: 16px">Auto-Receive Incoming Transactions</div>
                            <div class="mat-body-2" style="margin-bottom: 24px">
                                Incoming transactions will be automatically received when the wallet is unlocked.
                            </div>
                            <mat-slide-toggle
                                (change)="toggleAutoReceiveIncomingTransactions($event)"
                                [checked]="isEnableAutoReceiveFeature"
                                >Enable</mat-slide-toggle
                            >
                        </ng-container>
                    </mat-card>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./settings.component.scss'],
})
export class SettingsPageComponent implements OnInit {
    selectedRpcSource: Datasource;
    selectedSpyglassApi: Datasource;
    selectedCurrencyCode: string;
    minimumThreshold: number;
    isEnableAutoReceiveFeature: boolean;
    colors = BLUIColors;

    constructor(
        public vp: ViewportService,
        private readonly _router: Router,
        private readonly _dialog: MatDialog,
        private readonly _location: Location,
        private readonly _sheet: MatBottomSheet,
        private readonly _appStateService: AppStateService,
        private readonly _bnsService: BnsService,
        public datasourceService: DatasourceService,
        public currencyConversionService: CurrencyConversionService
    ) {
        this._appStateService.store.subscribe((data) => {
            this.selectedCurrencyCode = data.localCurrencyCode;
            this.isEnableAutoReceiveFeature = data.isEnableAutoReceiveFeature;
        });
        SELECTED_RPC_DATASOURCE_CHANGE.subscribe((source) => {
            this.selectedRpcSource = source;
        });
        SELECTED_SPYGLASS_API_DATASOURCE_CHANGE.subscribe((source) => {
            this.selectedSpyglassApi = source;
        });
    }

    async ngOnInit(): Promise<void> {
        this.selectedSpyglassApi = await this.datasourceService.getSpyglassApiSource();
        this.selectedRpcSource = await this.datasourceService.getRpcSource();
        this.minimumThreshold = this._appStateService.store.getValue().minimumBananoThreshold;
    }

    get tlds(): Record<string, string> {
        return this._appStateService.store.getValue().tlds;
    }

    showAutoReceiveToggle(): boolean {
        return this._appStateService.store.getValue().hasUnlockedSecret;
    }
    back(): void {
        this._location.back();
    }

    isNotDefaultBnsTld(tld: string): boolean {
        return this._bnsService.getDefaultTlds()[tld] === undefined;
    }

    openChangePasswordOverlay(): void {
        if (this.vp.sm) {
            this._sheet.open(ChangePasswordBottomSheetComponent);
        } else {
            this._dialog.open(ChangePasswordDialogComponent);
        }
    }

    openAddRpcOverlay(): void {
        if (this.vp.sm) {
            this._sheet.open(AddRpcBottomSheetComponent);
        } else {
            this._dialog.open(AddRpcDialogComponent);
        }
    }

    openAddSpyglassOverlay(): void {
        if (this.vp.sm) {
            this._sheet.open(AddSpyglassBottomSheetComponent);
        } else {
            this._dialog.open(AddSpyglassDialogComponent);
        }
    }

    openAddTldOverlay(): void {
        if (this.vp.sm) {
            this._sheet.open(AddTldBottomSheetComponent);
        } else {
            this._dialog.open(AddTldDialogComponent);
        }
    }

    removeCustomRpcNode(index: number): void {
        REMOVE_CUSTOM_RPC_NODE_BY_INDEX.next(index);
    }

    removeSpyglassApiSource(index: number): void {
        REMOVE_CUSTOM_SPYGLASS_API_BY_INDEX.next(index);
    }

    removeTld(name: string): void {
        REMOVE_TLD_BY_NAME.next(name);
    }

    toggleAutoReceiveIncomingTransactions(e: MatSlideToggleChange): void {
        USER_TOGGLE_AUTO_RECEIVE.next(e.checked);
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

    updateMinimumIncoming(): void {
        EDIT_MINIMUM_INCOMING_THRESHOLD.next(this.minimumThreshold);
    }
}
