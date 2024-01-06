import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppStateService } from '@app/services/app-state.service';
import { UPDATE_ADDRESS_BOOK } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-rename-address-overlay',
    styleUrls: ['rename-address.component.scss'],
    template: `
        <div class="rename-address-overlay overlay-action-container" [class.shorter]="addressOrNickname">
            <div class="overlay-header">{{ address ? 'Rename' : 'Add' }} Address</div>
            <div class="overlay-body mat-body-1">
                <div *ngIf="address">
                    Rename "<span style="word-break: break-all; font-weight: 600">{{ addressOrNickname }}</span
                    >" to something else?
                </div>
                <div *ngIf="!address">Add a new entry to your local address book.</div>
                <form style="margin: 32px 0">
                    <mat-form-field *ngIf="!address" style="width: 100%" appearance="fill">
                        <mat-label>Address</mat-label>
                        <textarea
                            placeholder="ban_123"
                            style="height:80px"
                            type="text"
                            matInput
                            [formControl]="addressFormControl"
                            (keyup.enter)="rename.focus()"
                        ></textarea>
                    </mat-form-field>
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>Alias</mat-label>
                        <input
                            #rename
                            type="text"
                            matInput
                            [formControl]="addressNameFormControl"
                            (keyup.enter)="renameAddress()"
                            data-cy="rename-address-input"
                        />
                    </mat-form-field>
                    <div
                        *ngIf="getKnownAddressAlias(addressFormControl.value)"
                        style="display: flex; align-items: center"
                    >
                        <mat-icon class="hint" style="min-width: 40px">info</mat-icon>
                        <div class="mat-body-2">
                            "{{ getKnownAddressAlias(addressFormControl.value) }}" is a publicly known address already
                            but your new alias will be used instead.
                        </div>
                    </div>
                </form>
            </div>
            <div class="overlay-footer">
                <button mat-stroked-button color="primary" (click)="close.emit()">Close</button>
                <button
                    data-cy="rename-address-overlay-button"
                    mat-flat-button
                    color="primary"
                    (click)="renameAddress()"
                >
                    Rename
                    <!--   {{ addressNameFormControl.value ? 'Rename' : 'Clear' }} -->
                </button>
            </div>
        </div>
    `,
})
export class RenameAddressComponent implements OnInit {
    @Input() address: string;
    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    /** Aliases are optional, if there's no alias for an entry in the address book this value will default to the address. */
    addressOrNickname: string;

    addressFormControl = new FormControl('');
    addressNameFormControl = new FormControl('');

    constructor(private readonly _appStateService: AppStateService) {}

    ngOnInit(): void {
        this.addressOrNickname = this._appStateService.store.getValue().addressBook.get(this.address) || this.address;
    }

    renameAddress(): void {
        const newName = this.addressNameFormControl.value || this.address;
        const account = this.address || this.addressFormControl.value;
        UPDATE_ADDRESS_BOOK.next({ name: newName, account });
        this.close.emit();
    }

    getKnownAddressAlias(address: string): string {
        return this._appStateService.knownAccounts.get(address);
    }
}
