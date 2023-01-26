import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppStateService } from '@app/services/app-state.service';
import { UPDATE_ADDRESS_BOOK } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-rename-address-overlay',
    styleUrls: ['rename-address.component.scss'],
    template: `
        <div class="rename-address-overlay overlay-action-container">
            <div class="overlay-header">{{ addressOrNickname ? 'Rename' : 'Add' }} Address</div>
            <div class="overlay-body mat-body-1">
                <div *ngIf="addressOrNickname">
                    Rename "<span style="word-break: break-all">{{ addressOrNickname }}</span
                    >" to something else?
                </div>
                <div *ngIf="!addressOrNickname">Add a new entry to your local address book.</div>
                <form style="margin: 32px 0">
                    <mat-form-field *ngIf="!addressOrNickname" style="width: 100%" appearance="fill">
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

    addressOrNickname: string;

    addressFormControl = new FormControl('');
    addressNameFormControl = new FormControl('');

    constructor(private readonly _appStateService: AppStateService) {}

    ngOnInit(): void {
        this.addressOrNickname = this._appStateService.store.getValue().addressBook.get(this.address);
        if (!this.addressOrNickname) {
            this.addressOrNickname = this.address;
        }
    }

    renameAddress(): void {
        const newName = this.addressNameFormControl.value || this.address;
        const account = this.address || this.addressFormControl.value;
        UPDATE_ADDRESS_BOOK.next({ name: newName, account });
        this.close.emit();
    }
}
