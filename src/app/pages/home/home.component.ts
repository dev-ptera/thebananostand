import { Component } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { ViewportService } from '@app/services/viewport.service';
import { MatDialog } from '@angular/material/dialog';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnterSecretDialogComponent } from '@app/overlays/dialogs/enter-secret/enter-secret-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { EnterSecretBottomSheetComponent } from '@app/overlays/bottom-sheet/enter-secret/enter-secret-bottom-sheet.component';
import { CreateWalletBottomSheetComponent } from '@app/overlays/bottom-sheet/create-wallet/create-wallet-bottom-sheet.component';
import { CreateWalletDialogComponent } from '@app/overlays/dialogs/create-wallet/create-wallet-dialog.component';
import { ATTEMPT_UNLOCK_LEDGER_WALLET, EMIT_LEDGER_CONNECTION_ERROR } from '@app/services/wallet-events.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { LedgerSnackbarErrorComponent } from '@app/pages/home/ledger-error-snackbar.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('fade', [
            transition('void => active', [
                // using status here for transition
                style({ opacity: 0 }),
                animate(120, style({ opacity: 1 })),
            ]),
            transition('* => void', [animate(120, style({ opacity: 0 }))]),
        ]),
    ],
})
export class HomeComponent {
    colors = Colors;
    store: AppStore;

    hasCanceledLogin = false;
    showLedgerTroubleshootText = false;

    ledgerUrl = 'https://www.ledger.com/';
    githubUrl = 'https://github.com/dev-ptera/thebananostand';

    constructor(
        public vp: ViewportService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _snackBar: MatSnackBar,
        private readonly _viewportService: ViewportService,
        private readonly _appStateService: AppStateService
    ) {
        this._appStateService.store.pipe(untilDestroyed(this)).subscribe((store) => {
            this.store = store;
        });

        EMIT_LEDGER_CONNECTION_ERROR.pipe(untilDestroyed(this)).subscribe((data) => {
            this._showLedgerConnectionErrorSnackbar(data.error);
        });
    }

    connectLedger(): void {
        ATTEMPT_UNLOCK_LEDGER_WALLET.next();
    }

    openEnterSeedDialog(): void {
        if (this.vp.sm) {
            this._sheet.open(EnterSecretBottomSheetComponent);
        } else {
            this._dialog.open(EnterSecretDialogComponent);
        }
    }

    openNewWalletDialog(): void {
        if (this.vp.sm) {
            this._sheet.open(CreateWalletBottomSheetComponent);
        } else {
            this._dialog.open(CreateWalletDialogComponent);
        }
    }

    showDashboard(): boolean {
        return this.store.hasUnlockedLedger || this.store.hasUnlockedSecret;
    }

    showLogin(): boolean {
        return this.store.hasSecret && !this.hasCanceledLogin && !this.showDashboard();
    }

    showHome(): boolean {
        return !this.showLogin() && !this.showDashboard();
    }

    private _showLedgerConnectionErrorSnackbar(err: string): void {
        const snack = this._snackBar.openFromComponent(LedgerSnackbarErrorComponent, {
            data: err,
            duration: 5000,
        });
        snack.onAction().subscribe(() => {
            this.showLedgerTroubleshootText = true;
        });
    }
}
