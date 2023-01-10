import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ADD_SPECIFIC_ACCOUNTS_BY_INDEX } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-add-index-overlay',
    styleUrls: ['add-index.component.scss'],
    template: `
        <div class="add-index-overlay overlay-action-container">
            <div class="overlay-header">Add Accounts</div>
            <div class="overlay-body">
                <div class="mat-body-1">
                    Use the input field below to manually add accounts by their index number. e.g:
                    <span class="add-accounts-example mat-body-1" style="margin-left: 4px">1028, 1029, 1030</span>
                </div>
                <form style="margin: 32px 0 16px 0">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>Indexes</mat-label>
                        <input
                            type="text"
                            matInput
                            (keyup.enter)="addAccounts()"
                            [formControl]="indexFormControl"
                            data-cy="add-specific-account-input"
                        />
                    </mat-form-field>
                </form>
                {{ errorMessage }}
            </div>
            <div class="overlay-footer">
                <button mat-stroked-button mat-dialog-close color="primary" (click)="close.emit()">Close</button>
                <button
                    data-cy="add-account-overlay-button"
                    mat-flat-button
                    color="primary"
                    [disabled]="isDisabled()"
                    (click)="addAccounts()"
                >
                    Add
                </button>
            </div>
        </div>
    `,
})
export class AddIndexOverlayComponent {
    indexFormControl = new FormControl('');
    errorMessage: string;

    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    isDisabled(): boolean {
        return !this.indexFormControl.value;
    }

    addAccounts(): void {
        if (this.isDisabled()) {
            return;
        }

        this.errorMessage = undefined;
        const stringIndexes = this.indexFormControl.value.split(',');
        const numberIndexes = [];

        for (const index of stringIndexes) {
            numberIndexes.push(Number(index));
        }
        ADD_SPECIFIC_ACCOUNTS_BY_INDEX.next(numberIndexes);
        this.close.emit();
    }
}
