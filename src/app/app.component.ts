import { Component } from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animation';
import { ViewportService } from '@app/services/viewport.service';
import { SecretService } from '@app/services/secret.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations: [slideInAnimation],
})
export class AppComponent {
    constructor(
        private readonly _vp: ViewportService,
        private readonly _secretService: SecretService,
        private readonly _snackbar: MatSnackBar,
        private readonly _walletEventService: WalletEventsService
    ) {
        const appHeight = (): void => {
            const doc = document.documentElement;
            doc.style.setProperty(`--app-height`, `${window.innerHeight}px`);
        };
        window.addEventListener(`resize`, appHeight);
        appHeight();

        this._walletEventService.removeWallet.subscribe(() => {
            this._snackbar.open('Removed Wallet', 'Dismiss', { duration: 5000 });
        });

        this._walletEventService.backupSeed.subscribe((data: { seed: string; openSnackbar: boolean }) => {
            this._copyToClipboard(data.seed);
            if (data.openSnackbar) {
                this._snackbar.open('Wallet Seed Copied!', 'Dismiss', { duration: 5000 });
            }
        });

        this._walletEventService.backupMnemonic.subscribe((data: { mnemonic: string; openSnackbar: boolean }) => {
            this._copyToClipboard(data.mnemonic);
            if (data.openSnackbar) {
                this._snackbar.open('Wallet Mnemonic Phrase Copied!', 'Dismiss', { duration: 5000 });
            }
        });
    }

    private _copyToClipboard(text: string): void {
        window.focus();
        setTimeout(() => {
            try {
               void navigator.clipboard.writeText(text)
            } catch (err) {
                const el = document.createElement('textarea');
                el.value = text;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            }
        });
    }

    showBanana(): boolean {
        // const unlocked = this._secretService.isLocalSecretUnlocked() || this._secretService.isLocalLedgerUnlocked();
        // const isBigScreen = !this._vp.isSmall() && !this._vp.isMedium();
        //  return !unlocked && isBigScreen;
        return false;
    }

    prepareRoute(outlet: RouterOutlet): Data {
        return outlet?.activatedRouteData?.['animation'];
    }
}
