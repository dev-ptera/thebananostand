import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';

@Component({
    selector: 'app-rename-wallet-overlay',
    styleUrls: ['rename-wallet.component.scss'],
    template: `
        <div class="add-index-overlay">
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
                            data-cy="add-rename-wallet-input"
                        />
                    </mat-form-field>
                </form>
            </div>
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
                    style="width: 100px;"
                >
                    Close
                </button>
                <button
                    data-cy="add-account-overlay-button"
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

    constructor(
        private readonly _appStateService: AppStateService,
        private readonly _walletEventService: WalletEventsService
    ) {}

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
        this._walletEventService.renameWallet.next(newName);
        this.close.emit();
    }
}
