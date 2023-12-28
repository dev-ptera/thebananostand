import { Component } from '@angular/core';
import { ViewportService } from '@app/services/viewport.service';
import { Location } from '@angular/common';
import { WalletStorageService } from '@app/services/wallet-storage.service';
import { AddressBookEntry } from '@app/types/AddressBookEntry';

import { saveAs } from 'file-saver';
import {
    COPY_ADDRESS_TO_CLIPBOARD,
    REMOVE_ADDRESS_BOOK_ENTRY,
    UPDATE_ADDRESS_BOOK,
} from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { RenameAddressBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-address/rename-address-bottom-sheet.component';
import { RenameAddressDialogComponent } from '@app/overlays/dialogs/rename-address/rename-address-dialog.component';
import { UtilService } from '@app/services/util.service';

@Component({
    selector: 'app-address-book',
    template: ` <div class="app-root app-settings-page" responsive>
        <mat-toolbar color="primary" class="app-toolbar" responsive [class.mat-elevation-z2]="!vp.sm">
            <div style="display: flex; align-items: center">
                <button mat-icon-button (click)="back()">
                    <mat-icon style="color: var(--text-contrast)">close</mat-icon>
                </button>
                <span style="margin-left: 12px; color: var(--text-contrast)">Address Book</span>
            </div>
        </mat-toolbar>

        <div class="app-body" responsive>
            <div class="app-body-content">
                <input
                    style="display: none"
                    type="file"
                    #addressImport
                    id="address-import"
                    name="Address Import"
                    (change)="onFileSelected($event)"
                    accept="application/JSON"
                />
                <mat-card
                    appearance="outlined"
                    style="margin: 32px 0; padding: 0; width: 100%"
                    [style.borderRadius.px]="vp.sm ? 0 : 16"
                    [style.marginTop.px]="vp.sm ? 0 : 32"
                >
                    <div style="padding: 24px 24px; display: flex; justify-content: space-between; align-items: center">
                        <div *ngIf="!vp.sm" class="mat-headline-6">Entries</div>
                        <div
                            style="display: flex; justify-content: space-between"
                            [style.width.%]="vp.sm ? 100 : undefined"
                        >
                            <button
                                mat-flat-button
                                color="primary"
                                style="margin-right: 16px;"
                                (click)="openRenameWalletOverlay(undefined)"
                                matTooltip="Add a new address alias"
                            >
                                <mat-icon>add_circle_outline</mat-icon>
                                <span>Add</span>
                            </button>
                            <button
                                mat-flat-button
                                style="margin-right: 16px;"
                                (click)="addressImport.click()"
                                matTooltip="Import from Banano Vault"
                            >
                                <mat-icon>import_contacts</mat-icon>
                                <span>Import</span>
                            </button>
                            <button
                                mat-flat-button
                                (click)="downloadAddressesAsJSON()"
                                [disabled]="addressBook.length === 0"
                                matTooltip="Download a local copy"
                            >
                                <mat-icon>install_desktop</mat-icon>
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                    <mat-divider></mat-divider>

                    <div
                        *ngIf="addressBook.length === 0"
                        style="display: flex; justify-content: center; align-items: center; padding: 64px"
                    >
                        <app-empty-state>
                            <mat-icon>badge</mat-icon>
                            <div title>No Bookmarks</div>
                            <div description>
                                Use the buttons above to add new entries, or import a Banano Vault address book.
                            </div>
                        </app-empty-state>
                    </div>

                    <div *ngIf="addressBook.length > 0" style="padding: 24px">
                        <div *ngFor="let entry of addressBook; let i = index; let last = last">
                            <div
                                style="display: flex; align-items: center; justify-content: space-between"
                                [style.paddingTop.px]="vp.sm ? 16 : 8"
                                [style.paddingBottom.px]="vp.sm ? 16 : 8"
                            >
                                <div style="display: flex; align-items: center">
                                    <div *ngIf="!vp.sm" class="mat-body-1 hint" style="width: 56px">#{{ i + 1 }}</div>
                                    <div style="display: flex; flex-direction: column; padding: 16px 0">
                                        <div class="mat-body-1" style="font-weight: 600">{{ entry.name }}</div>
                                        <div class="mono mat-body-2 hint">
                                            {{ vp.sm ? util.shortenAddress(entry.account) : entry.account }}
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex">
                                    <button mat-icon-button (click)="copy(entry)" matTooltip="Copy address">
                                        <mat-icon class="icon-secondary">content_copy</mat-icon>
                                    </button>
                                    <button
                                        mat-icon-button
                                        (click)="openRenameWalletOverlay(entry)"
                                        matTooltip="Edit alias"
                                    >
                                        <mat-icon class="icon-secondary">edit</mat-icon>
                                    </button>
                                    <button mat-icon-button (click)="remove(entry)" matTooltip="Remove entry">
                                        <mat-icon color="warn">close</mat-icon>
                                    </button>
                                </div>
                            </div>
                            <mat-divider *ngIf="!last"></mat-divider>
                        </div>
                    </div>
                </mat-card>
            </div>
        </div>
    </div>`,
})
export class AddressBookComponent {
    addressBook: AddressBookEntry[] = [];

    constructor(
        public vp: ViewportService,
        public util: UtilService,
        private readonly _dialog: MatDialog,
        private readonly _location: Location,
        private readonly _sheet: MatBottomSheet,
        private readonly _appStoreService: AppStateService,
        private readonly _walletStoreService: WalletStorageService
    ) {}

    ngOnInit(): void {
        this._appStoreService.store.subscribe((data) => {
            this.addressBook = [];
            for (const account of data.addressBook.keys()) {
                this.addressBook.push({ account, name: data.addressBook.get(account) });
            }
        });
    }

    downloadAddressesAsJSON(): void {
        const data = JSON.stringify(this.addressBook);
        const fileName = 'thebananostand_addressbook.json';
        const blob = new Blob([data], { type: 'application/text' });
        saveAs(blob, fileName);
    }

    back(): void {
        this._location.back();
    }

    copy(entry: AddressBookEntry): void {
        COPY_ADDRESS_TO_CLIPBOARD.next({ address: entry.account });
    }

    remove(entry: AddressBookEntry): void {
        REMOVE_ADDRESS_BOOK_ENTRY.next(entry);
    }

    async onFileSelected(fileEvent: any): Promise<void> {
        function parseJsonFile(file: Blob): Promise<AddressBookEntry[]> {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.onload = (event): any => resolve(JSON.parse(event.target.result as string));
                fileReader.onerror = (error): any => reject(error);
                fileReader.readAsText(file);
            });
        }

        const file: File = fileEvent.target.files[0];
        if (file) {
            const entries = await parseJsonFile(file);
            for (const entry of entries) {
                UPDATE_ADDRESS_BOOK.next({ account: entry.account, name: entry.name });
            }
        }
    }

    openRenameWalletOverlay(entry: AddressBookEntry): void {
        const data = {
            data: {
                address: entry?.account,
            },
        };

        if (this.vp.sm) {
            setTimeout(() => {
                this._sheet.open(RenameAddressBottomSheetComponent, data);
            }, 250);
        } else {
            this._dialog.open(RenameAddressDialogComponent, data);
        }
    }
}
