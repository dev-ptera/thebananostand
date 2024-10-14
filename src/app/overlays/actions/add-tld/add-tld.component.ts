import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ADD_TLD } from '@app/services/wallet-events.service';
import { UtilService } from '@app/services/util.service';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
    selector: 'app-add-tld-overlay',
    styleUrls: ['add-tld.component.scss'],
    template: `
        <div class="add-tld-overlay overlay-action-container">
            <div class="overlay-header">Add TLD</div>
            <div class="overlay-body">
                <div style="display: flex; align-items: center">
                    <mat-icon class="secondary-text" style="overflow: visible">info</mat-icon>
                    <span style="margin-left: 16px" class="mat-body-1"
                        >Be wary of what name you give the TLD! If the TLD name is widely used by the community, make
                        sure the Banano address for it is the widely agreed upon address. Otherwise, sends to that TLD
                        might go to the wrong Banano address.</span
                    >
                </div>
                <form style="margin-top: 32px">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>TLD Name</mat-label>
                        <input
                            matInput
                            name="password"
                            type="text"
                            [formControl]="tldNameFormControl"
                            data-cy="tld-name-input"
                        />
                    </mat-form-field>

                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>TLD Banano Address</mat-label>
                        <input matInput type="text" [formControl]="tldAccountFormControl" data-cy="tld-address-input" />
                    </mat-form-field>
                </form>
            </div>
            <div class="overlay-footer">
                <button mat-stroked-button color="primary" (click)="close.emit()" style="width: 100px;">Close</button>
                <button
                    data-cy="confirm-add-tld-button"
                    mat-flat-button
                    color="primary"
                    style="width: 100px;"
                    [disabled]="isDisabled()"
                    (click)="addTld()"
                >
                    Add
                </button>
            </div>
        </div>
    `,
})
export class AddTldOverlayComponent {
    tldNameFormControl = new FormControl('');
    tldAccountFormControl = new FormControl('');

    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    constructor(public util: UtilService) {}

    isDisabled(): boolean {
        return (
            !this.tldNameFormControl.value ||
            !this.util.isValidAddress(this.tldAccountFormControl.value) ||
            this.tldNameFormControl.value.includes('.')
        );
    }

    addTld(): void {
        if (this.isDisabled()) {
            return;
        }

        ADD_TLD.next({
            name: this.tldNameFormControl.value,
            account: this.tldAccountFormControl.value,
        });
        this.close.emit();
    }
}
