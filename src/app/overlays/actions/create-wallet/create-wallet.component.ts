import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { EnterSecretBottomSheetComponent } from '@app/overlays/bottom-sheet/enter-secret/enter-secret-bottom-sheet.component';
import { EnterSecretDialogComponent } from '@app/overlays/dialogs/enter-secret/enter-secret-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ViewportService } from '@app/services/viewport.service';

@Component({
    selector: 'app-create-wallet-overlay',
    styleUrls: ['create-wallet.component.scss'],
    template: `
        <div class="create-wallet-overlay">
            <div mat-dialog-title>
                <h1>Create a new wallet?</h1>
                <mat-divider></mat-divider>
            </div>
            <div mat-dialog-content style="margin-bottom: 16px; overflow: auto">
                <mat-accordion>
                    <mat-expansion-panel [expanded]="true">
                        <mat-expansion-panel-header>
                            <mat-panel-title>
                                <div class="title-row">
                                    <div class="mat-title">Seed</div>
                                    <button mat-icon-button (click)="copySeed(); $event.stopPropagation()">
                                        <mat-icon>{{ copiedSeed ? 'check_circle' : 'content_copy' }}</mat-icon>
                                    </button>
                                </div>
                            </mat-panel-title>
                        </mat-expansion-panel-header>
                        <div style="word-break: break-all">{{ data.seed }}</div>
                    </mat-expansion-panel>
                    <mat-expansion-panel>
                        <mat-expansion-panel-header>
                            <mat-panel-title>
                                <div class="title-row">
                                    <div class="mat-title">Mnemonic Phrase</div>
                                    <button mat-icon-button (click)="copyMnemonic(); $event.stopPropagation()">
                                        <mat-icon>{{ copiedMnemonic ? 'check_circle' : 'content_copy' }}</mat-icon>
                                    </button>
                                </div>
                            </mat-panel-title>
                        </mat-expansion-panel-header>
                        <div style="display: flex; flex-wrap: wrap">
                            <div *ngFor="let word of mnemonicWords; let i = index" style="width: 50%">
                                #{{ i + 1 }} - {{ word }}
                            </div>
                        </div>
                    </mat-expansion-panel>
                </mat-accordion>

                <mat-divider style="margin: 16px 0"></mat-divider>
                <div class="mat-body-2">
                    This secret text allows you to access your Banano using any wallet, such as
                    <a href="https://kalium.banano.cc/" target="_blank">Kalium</a> or
                    <a href="https://vault.banano.cc/" target="_blank">Banano Vault</a>. Losing this secret means losing
                    access to your accounts.
                    <strong>Save your secret phrase in a secure place & don't lose it!</strong>
                </div>
                <mat-checkbox style="margin: 16px 0" [(ngModel)]="hasConfirmedBackup">
                    I have saved my secret
                </mat-checkbox>
            </div>
            <blui-spacer></blui-spacer>
            <mat-divider style="margin-left: -48px; margin-right: -48px"></mat-divider>
            <div
                mat-dialog-actions
                style="display: flex; justify-content: space-between; margin-bottom: 0; padding: 8px 0"
            >
                <button mat-stroked-button mat-dialog-close style="width: 100px" color="primary" (click)="close.emit()">
                    Close
                </button>
                <button
                    data-cy="add-account-overlay-button"
                    mat-flat-button
                    style="width: 100px"
                    color="primary"
                    [disabled]="!hasConfirmedBackup"
                    (click)="addAccounts()"
                >
                    Create
                </button>
            </div>
        </div>
    `,
})
export class CreateWalletOverlayComponent {
    @Input() data: { seed: string; mnemonic: string };
    @Output() close = new EventEmitter<void>();

    hasConfirmedBackup = false;
    copiedSeed: boolean;
    copiedMnemonic: boolean;
    iconSwapTimeMs = 1500;

    mnemonicWords: string[] = [];

    constructor(
        private readonly _walletEventService: WalletEventsService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        public vp: ViewportService
    ) {}

    ngOnInit(): void {
        this.data.mnemonic.split(' ').map((word) => this.mnemonicWords.push(word));
    }

    copySeed(): void {
        this._walletEventService.backupSeed.next({ seed: this.data.seed, openSnackbar: false });
        this.copiedSeed = true;
        setTimeout(() => {
            this.copiedSeed = false;
        }, this.iconSwapTimeMs);
    }

    copyMnemonic(): void {
        this._walletEventService.backupMnemonic.next({ mnemonic: this.data.mnemonic, openSnackbar: false });
        this.copiedMnemonic = true;
        setTimeout(() => {
            this.copiedMnemonic = false;
        }, this.iconSwapTimeMs);
    }

    addAccounts(): void {
        this.close.emit();
        if (this.vp.sm) {
            this._sheet.open(EnterSecretBottomSheetComponent);
        } else {
            this._dialog.open(EnterSecretDialogComponent);
        }
    }
}
