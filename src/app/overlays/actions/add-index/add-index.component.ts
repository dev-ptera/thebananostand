import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AccountService } from '@app/services/account.service';

@Component({
    selector: 'app-add-index-overlay',
    styleUrls: ['add-index.component.scss'],
    template: `
        <div class="add-index-overlay">
            <h1 mat-dialog-title>Add Accounts</h1>
            <div mat-dialog-content style="margin-bottom: 32px;">
                <div>Use the input field below to manually add accounts by their index number. e.g:</div>
                <span class="add-accounts-example">1028, 1029, 1030</span>
                <form style="margin-top: 32px">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>Indexes</mat-label>
                        <input
                            type="text"
                            matInput
                            [formControl]="indexFormControl"
                            data-cy="add-specific-account-input"
                        />
                    </mat-form-field>
                </form>
            </div>
            {{ errorMessage }}
            <blui-spacer></blui-spacer>
            <mat-divider style="margin-left: -48px; margin-right: -48px"></mat-divider>
            <div
                mat-dialog-actions
                style="display: flex; justify-content: space-between; margin-bottom: 0; padding: 8px 0"
            >
                <button
                    mat-stroked-button
                    mat-dialog-close
                    color="primary"
                    (click)="close.emit()"
                    style="width: 130px;"
                >
                    Close
                </button>
                <button
                    data-cy="add-account-overlay-button"
                    mat-flat-button
                    color="primary"
                    style="width: 130px;"
                    [disabled]="loading || !indexFormControl.value"
                    (click)="addAccounts()"
                >
                    Add Accounts
                </button>
            </div>
        </div>
    `,
})
export class AddIndexOverlayComponent {
    loading: boolean;
    indexFormControl = new FormControl('');
    errorMessage: string;

    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    constructor(private readonly _accountService: AccountService) {}

    async addAccounts(): Promise<void> {
        this.loading = true;
        this.errorMessage = undefined;
        const indexes = this.indexFormControl.value.split(',');
        for await (const index of indexes) {
            await this._accountService.fetchAccount(Number(index)).catch((err) => {
                console.error(err);
                this.errorMessage = err;
            });
        }
        this.loading = false;
        this.close.emit();
    }
}