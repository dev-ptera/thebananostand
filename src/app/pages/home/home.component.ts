import { Component, Inject, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { AccountService } from '@app/services/account.service';
import { ViewportService } from '@app/services/viewport.service';
import { TransactionService } from '@app/services/transaction.service';
import { MatDialog } from '@angular/material/dialog';
import { animate, style, transition, trigger } from '@angular/animations';
import { SecretService } from '@app/services/secret.service';
import { EnterSecretDialogComponent } from '@app/pages/home/enter-secret/enter-secret-dialog.component';
import { NewSeedDialogComponent } from '@app/pages/home/new-seed/new-seed-dialog.component';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
    selector: 'ledger-snack-bar',
    template: `<div style="display: flex; justify-content: space-between; align-items: center">
        <mat-icon>error_outline</mat-icon>
        <span style="margin-right: 48px; margin-left: 12px">{{ data }}</span>
        <button mat-button color="accent" style="width: 130px" #action (click)="snackBar.dismissWithAction()">
            Troubleshoot
        </button>
    </div>`,
})
export class LedgerSnackbarErrorComponent {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: string,
        public snackBar: MatSnackBarRef<LedgerSnackbarErrorComponent>
    ) {}
}

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
export class HomeComponent implements OnInit {
    colors = Colors;

    isLoading = false;
    isLoggedIn = false;
    isCancelLogin = false;
    isLedgerLoaded = false;
    isShowLedgerLoadHelperText = false;

    constructor(
        private readonly _dialog: MatDialog,
        private readonly _snackBar: MatSnackBar,
        private readonly _transactionService: TransactionService,
        private readonly _accountService: AccountService,
        private readonly _viewportService: ViewportService,
        private readonly _secretService: SecretService
    ) {}

    ngOnInit(): void {
        this.isLoggedIn = this._secretService.isLocalSecretUnlocked();
        if (this._accountService.accounts.length > 0) {
            this.isLedgerLoaded = true;
        }
    }

    isSmall(): boolean {
        return this._viewportService.isSmall();
    }

    openLedgerHomePage(): void {
        window.open('https://www.ledger.com/');
    }

    openEnterSeedDialog(): void {
        const ref = this._dialog.open(EnterSecretDialogComponent);
        ref.afterClosed().subscribe((isNewWalletImported) => {
            this.isLoggedIn = isNewWalletImported;
        });
    }

    connectLedger(): void {
        this._transactionService
            .checkLedgerOrError()
            .then(() => {
                this.isLedgerLoaded = true;
                this._secretService.unlockedLocalLedger = true;
            })
            .catch((err) => {
                const snack = this._snackBar.openFromComponent(LedgerSnackbarErrorComponent, {
                    data: err,
                    duration: 5000,
                });
                snack.onAction().subscribe(() => {
                    this.isShowLedgerLoadHelperText = true;
                });
            });
    }

    showDashboard(): boolean {
        return !this.showLogin() && (this.isLedgerLoaded || this.isLoggedIn);
    }

    showLogin(): boolean {
        return !this.isLedgerLoaded && this._secretService.hasSecret() && !this.isLoggedIn && !this.isCancelLogin;
    }

    showHome(): boolean {
        return !this.showLogin() && !this.showDashboard();
    }

    openNewWalletDialog(): void {
        const ref = this._dialog.open(NewSeedDialogComponent);
        ref.afterClosed().subscribe((isNewWalletCreated) => {
            this.isLoggedIn = isNewWalletCreated;
        });
    }
}
