import { Component } from '@angular/core';
import { ViewportService } from '@app/services/viewport.service';
import { Location } from '@angular/common';
import { WalletStorageService } from '@app/services/wallet-storage.service';
import { AddressBookEntry } from '@app/types/AddressBookEntry';

import { saveAs } from 'file-saver';
import { REMOVE_ADDRESS_BOOK_ENTRY } from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';

@Component({
    selector: 'app-address-book',
    template: ` <div class="app-root app-settings-page" responsive>
        <mat-toolbar color="primary" class="mat-elevation-z2 app-toolbar" responsive>
            <div style="display: flex; align-items: center">
                <button mat-icon-button (click)="back()">
                    <mat-icon style="color: var(--text-contrast)">close</mat-icon>
                </button>
                <span style="margin-left: 12px; color: var(--text-contrast)">Address Book</span>
            </div>
        </mat-toolbar>

        <div class="app-body" responsive>
            <div class="app-body-content">
                <mat-card appearance="outlined" style="margin: 32px 0; padding: 0; width: 100%">
                    <div style="padding: 24px 24px; display: flex; justify-content: space-between; align-items: center">
                        <div class="mat-headline-6">Entries</div>
                        <div *ngIf="!vp.sm">
                            <button mat-stroked-button color="primary" style="margin-right: 16px;">
                                <mat-icon>add_circle_outline</mat-icon>
                                <span>Add</span>
                            </button>
                            <button mat-stroked-button color="primary" style="margin-right: 16px;">
                                <mat-icon>bookmarks</mat-icon>
                                <span>Import</span>
                            </button>
                            <button
                                mat-stroked-button
                                color="primary"
                                (click)="downloadAddressesAsJSON()"
                                [disabled]="addressBook.length === 0"
                            >
                                <mat-icon>download</mat-icon>
                                <span>Export</span>
                            </button>
                        </div>
                        <div *ngIf="vp.sm">
                            <button mat-icon-button color="primary">
                                <mat-icon>add_circle_outline</mat-icon>
                            </button>
                            <button mat-icon-button color="primary">
                                <mat-icon>bookmarks</mat-icon>
                            </button>
                            <button
                                mat-icon-button
                                color="primary"
                                (click)="downloadAddressesAsJSON()"
                                [disabled]="addressBook.length === 0"
                            >
                                <mat-icon>download</mat-icon>
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
                        <div *ngFor="let entry of addressBook; let i = index">
                            <div style="display: flex; align-items: center; justify-content: space-between">
                                <div style="display: flex; align-items: center">
                                    <div class="mat-body-1 hint" style="padding-right: 24px">#{{ i + 1 }}</div>
                                    <div style="display: flex; flex-direction: column; padding: 16px 0">
                                        <div class="mat-body-1" style="font-weight: 600">{{ entry.name }}</div>
                                        <div class="mono mat-body-2">{{ entry.account }}</div>
                                    </div>
                                </div>
                                <div>
                                    <button mat-icon-button (click)="remove(entry)">
                                        <mat-icon color="warn">close</mat-icon>
                                    </button>
                                </div>
                            </div>
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
        private readonly _location: Location,
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

    remove(entry: AddressBookEntry): void {
        REMOVE_ADDRESS_BOOK_ENTRY.next(entry);
    }
}
