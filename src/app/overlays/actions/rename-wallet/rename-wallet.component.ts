import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RENAME_ACTIVE_WALLET } from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';

@Component({
    selector: 'app-rename-wallet-overlay',
    styleUrls: ['rename-wallet.component.scss'],
    template: `
        <div class="rename-wallet-overlay">
            <h1 mat-dialog-title>Rename Wallet</h1>
            <div mat-dialog-content style="margin-bottom: 32px;">
                <div>Rename "{{ currentWalletName }}" to something else?</div>
                <form style="margin-top: 32px">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>New Wallet Name</mat-label>
                        <input
                            type="text"
                            matInput
                            [formControl]="walletNameFormControl"
                            (keyup.enter)="renameWallet()"
                            data-cy="rename-wallet-input"
                        />
                    </mat-form-field>
                </form>
            </div>
            <spacer></spacer>
            <mat-divider style="margin-left: -48px; margin-right: -48px"></mat-divider>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0; padding: 16px 0">
                <button mat-stroked-button color="primary" (click)="close.emit()" style="width: 100px;">Close</button>
                <button
                    data-cy="rename-wallet-overlay-button"
                    mat-flat-button
                    color="primary"
                    style="width: 100px;"
                    [disabled]="isDisabled()"
                    (click)="renameWallet()"
                >
                    Rename
                </button>
            </div>
        </div>
    `,
})
export class RenameWalletComponent implements OnInit {
    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    currentWalletName: string;
    walletNameFormControl = new FormControl('');

    constructor(private readonly _appStateService: AppStateService) {}

    ngOnInit(): void {
        this.currentWalletName = this._appStateService.store.getValue().activeWallet.name;
    }

    isDisabled(): boolean {
        return !this.walletNameFormControl.value;
    }

    renameWallet(): void {
        if (this.isDisabled()) {
            return;
        }
        const newName = this.walletNameFormControl.value;
        RENAME_ACTIVE_WALLET.next(newName);
        this.close.emit();
    }
}
