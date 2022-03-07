import { Component } from '@angular/core';
import { AccountService } from '@app/services/account.service';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-add-index-dialog',
    styleUrls: ['add-index.component.scss'],
    template: `
        <div class="add-index-dialog">
            <h1 mat-dialog-title>Add Accounts</h1>
            <div mat-dialog-content style="margin-bottom: 32px;">
                <div>Use the input field below to manually add accounts by their index number. e.g:</div>
                <span style="font-family: monospace; background: #dedede">1028, 1029, 1030</span>
                <form style="margin-top: 32px">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>Indexes</mat-label>
                        <input type="text" matInput [formControl]="indexFormControl" />
                    </mat-form-field>
                </form>
            </div>
            {{ errorMessage }}
            <blui-spacer></blui-spacer>
            <mat-divider style="margin-left: -24px; margin-right: -24px"></mat-divider>
            <div mat-dialog-actions style="display: flex; justify-content: space-between; margin-bottom: 0">
                <button mat-stroked-button mat-dialog-close color="primary">Close</button>
                <button
                    mat-flat-button
                    color="primary"
                    [disabled]="loading || !indexFormControl.value"
                    (click)="addAccounts()"
                >
                    Add Accounts
                </button>
            </div>
        </div>
    `,
})
export class AddIndexDialogComponent {
    loading: boolean;
    indexFormControl = new FormControl('');
    errorMessage: string;

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
    }
}
