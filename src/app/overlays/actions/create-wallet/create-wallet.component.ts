import {Component, EventEmitter, Input, Output} from '@angular/core';
import { WalletEventsService } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-create-wallet-overlay',
    styleUrls: ['create-wallet.component.scss'],
    template: `
        <div class="create-wallet-overlay">
            <h1 mat-dialog-title>New Wallet</h1>
            <div mat-dialog-content style="margin-bottom: 32px;">
                <div class="mat-body-2">Be sure to backup your secret!
                    This secret allows you to access your Banano using any wallet.
                    Losing this secret means losing access to your accounts.
                </div>
                <mat-checkbox style="margin: 16px 0" [(ngModel)]="hasConfirmedBackup">I saved my secret</mat-checkbox>
                <mat-divider style="margin: 16px 0"></mat-divider>
                <div class="mat-title">Seed</div>
                <div style="word-break: break-all">{{ data.seed }}</div>

                <mat-divider style="margin: 16px 0"></mat-divider>

                <div class="mat-title">Mnemonic Phrase</div>
                <div style="display: flex; flex-wrap: wrap">
                    <div *ngFor="let word of mnemonicWords; let i = index" style="width: 50%">
                        #{{ i+1 }} - {{ word }}
                    </div>
                </div>
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
                    style="width: 130px;"
                >
                    Close
                </button>
                <button
                    data-cy="add-account-overlay-button"
                    mat-flat-button
                    color="primary"
                    style="width: 130px;"
                    [disabled]="!hasConfirmedBackup"
                    (click)="addAccounts()"
                >
                    Load
                </button>
            </div>
        </div>
    `,
})
export class CreateWalletOverlayComponent {
    @Input() data: { seed: string, mnemonic: string };
    @Output() close = new EventEmitter<void>();

    hasConfirmedBackup = false;

    mnemonicWords: string[] = [];

    constructor(private readonly _walletEventService: WalletEventsService) {}

    ngOnInit(): void {
        this.data.mnemonic.split(' ').map((word) => this.mnemonicWords.push(word));
    }


    addAccounts(): void {
        this.close.emit();
    }
}
