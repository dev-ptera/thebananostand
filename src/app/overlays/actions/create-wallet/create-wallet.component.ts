import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { COPY_MNEMONIC_TO_CLIPBOARD, COPY_SEED_TO_CLIPBOARD } from '@app/services/wallet-events.service';
import { EnterSecretBottomSheetComponent } from '@app/overlays/bottom-sheet/enter-secret/enter-secret-bottom-sheet.component';
import { EnterSecretDialogComponent } from '@app/overlays/dialogs/enter-secret/enter-secret-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ViewportService } from '@app/services/viewport.service';
import { SecretService } from '@app/services/secret.service';

@Component({
    selector: 'app-create-wallet-overlay',
    styleUrls: ['create-wallet.component.scss'],
    template: `
        <div class="create-wallet-overlay overlay-action-container">
            <div class="overlay-header">Create a new wallet?</div>
            <div class="overlay-body">
                <mat-accordion style="margin-bottom: 24px">
                    <mat-expansion-panel [expanded]="true" class="mat-elevation-z0 divider-border">
                        <mat-expansion-panel-header>
                            <mat-panel-title>
                                <div class="title-row">
                                    <div class="mat-headline-6 primary">Seed</div>
                                    <button mat-icon-button (click)="copySeed(); $event.stopPropagation()">
                                        <mat-icon>{{
                                            hasRecentlyCopiedSeed ? 'check_circle' : 'content_copy'
                                            }}</mat-icon>
                                    </button>
                                </div>
                            </mat-panel-title>
                        </mat-expansion-panel-header>
                        <div style="word-break: break-all">{{ seed }}</div>
                    </mat-expansion-panel>
                    <mat-expansion-panel class="mat-elevation-z0 divider-border">
                        <mat-expansion-panel-header>
                            <mat-panel-title>
                                <div class="title-row">
                                    <div class="mat-headline-6 primary">Mnemonic Phrase</div>
                                    <button mat-icon-button (click)="copyMnemonic(); $event.stopPropagation()">
                                        <mat-icon>{{
                                            hasRecentlyCopiedMnemonic ? 'check_circle' : 'content_copy'
                                            }}</mat-icon>
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
                <div class="mat-body-2" style="margin-top: 24px">
                    This secret text allows you to access your Banano using any wallet, such as
                    <a href="https://kalium.banano.cc/" target="_blank" class="link">Kalium</a> or
                    <a href="https://vault.banano.cc/" target="_blank" class="link">Banano Vault</a>. Losing this secret
                    means losing access to your accounts.
                    <strong>Save your secret phrase in a secure place & don't lose it!</strong>
                </div>
                <mat-checkbox style="margin: 16px 0" [(ngModel)]="hasConfirmedBackup">
                    I have saved my secret
                </mat-checkbox>
            </div>
            <div class="overlay-footer">
                <button
                    mat-stroked-button
                    mat-dialog-close
                    style="width: 100px"
                    color="primary"
                    (click)="close.emit()"
                >
                    Close
                </button>
                <button
                    data-cy="create-wallet-overlay-button"
                    mat-flat-button
                    style="width: 100px"
                    color="primary"
                    [disabled]="!hasConfirmedBackup"
                    (click)="createWallet()"
                >
                    Create
                </button>
            </div>
        </div>
    `,
})
export class CreateWalletOverlayComponent implements OnInit {
    @Output() close = new EventEmitter<void>();

    hasConfirmedBackup = false;
    hasRecentlyCopiedSeed = false;
    hasRecentlyCopiedMnemonic = false;

    iconSwapTimeMs = 1500;

    seed: string;
    mnemonic: string;
    mnemonicWords: string[] = [];

    constructor(
        public vp: ViewportService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _secretService: SecretService
    ) {}

    ngOnInit(): void {
        const newWalletSecret = this._secretService.createNewSecretWallet();
        this.seed = newWalletSecret.seed;
        this.mnemonic = newWalletSecret.mnemonic;
        this.mnemonicWords = newWalletSecret.mnemonic.split(' ');
    }

    copySeed(): void {
        COPY_SEED_TO_CLIPBOARD.next({ seed: this.seed, openSnackbar: false });
        this.hasRecentlyCopiedSeed = true;
        setTimeout(() => {
            this.hasRecentlyCopiedSeed = false;
        }, this.iconSwapTimeMs);
    }

    copyMnemonic(): void {
        COPY_MNEMONIC_TO_CLIPBOARD.next({ mnemonic: this.mnemonic, openSnackbar: false });
        this.hasRecentlyCopiedMnemonic = true;
        setTimeout(() => {
            this.hasRecentlyCopiedMnemonic = false;
        }, this.iconSwapTimeMs);
    }

    createWallet(): void {
        this.close.emit();
        if (this.vp.sm) {
            this._sheet.open(EnterSecretBottomSheetComponent);
        } else {
            this._dialog.open(EnterSecretDialogComponent);
        }
    }
}
