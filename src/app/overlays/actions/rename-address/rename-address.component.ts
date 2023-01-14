import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppStateService } from '@app/services/app-state.service';
import { RENAME_ADDRESS } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-rename-address-overlay',
    styleUrls: ['rename-address.component.scss'],
    template: `
        <div class="rename-address-overlay overlay-action-container">
            <div class="overlay-header">Rename Address</div>
            <div class="overlay-body mat-body-1">
                <div style="word-break: break-all">Rename "{{ currentNickName }}" to something else?</div>
                <form style="margin: 32px 0 16px 0">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>New Address Alias</mat-label>
                        <input
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

    currentNickName: string;

    addressNameFormControl = new FormControl('');

    constructor(private readonly _appStateService: AppStateService) {}

    ngOnInit(): void {
        this.currentNickName = this._appStateService.store.getValue().addressBook.get(this.address);
        if (!this.currentNickName) {
            this.currentNickName = this.address;
        }
    }

    renameAddress(): void {
        const newName = this.addressNameFormControl.value || this.address;
        RENAME_ADDRESS.next({ name: newName, account: this.address });
        this.close.emit();
    }
}
