import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RENAME_ACTIVE_WALLET } from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';
import { FilterOverlayData } from '@app/overlays/actions/filter/filter.component';

@Component({
    selector: 'app-rename-address-overlay',
    styleUrls: ['rename-address.component.scss'],
    template: `
        <div class="rename-address-overlay overlay-action-container">
            <div class="overlay-header">Rename Address</div>
            <div class="overlay-body mat-body-1">
                <div>Rename "{{ address }}" to something else?</div>
                <form style="margin: 32px 0 16px 0">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>New Address Name</mat-label>
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
                    [disabled]="isDisabled()"
                    (click)="renameAddress()"
                >
                    Rename
                </button>
            </div>
        </div>
    `,
})
export class RenameAddressComponent implements OnInit {
    @Input() address: string;
    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    currentWalletName: string;
    addressNameFormControl = new FormControl('');

    constructor(private readonly _appStateService: AppStateService) {}

    ngOnInit(): void {}

    isDisabled(): boolean {
        return !this.addressNameFormControl.value;
    }

    renameAddress(): void {
        if (this.isDisabled()) {
            return;
        }
        const newName = this.addressNameFormControl.value;
        //  RENAME_ACTIVE_WALLET.next(newName);
        this.close.emit();
    }
}
