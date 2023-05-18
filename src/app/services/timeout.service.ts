import { Injectable } from '@angular/core';
import { AppStateService } from '@app/services/app-state.service';
import { LOCK_WALLET } from '@app/services/wallet-events.service';
import { UserIdleService } from 'angular-user-idle';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class TimeoutService {
    constructor(
        private readonly _userIdle: UserIdleService,
        private readonly _appState: AppStateService,
        private readonly _snackbar: MatSnackBar
    ) {
        this._userIdle.onIdleStatusChanged().subscribe((isIdle) => {
        //    console.log('User is considered idle now?', isIdle);
        });

        // Start watch when time is up.
        this._userIdle.onTimeout().subscribe(() => {
            this._snackbar.open('Automatically logged you out...', 'Dismiss');
            LOCK_WALLET.next();
        });

        // Listen for app state changes, restart app timeout.
        this._appState.store.subscribe((state) => {
            if (state.hasUnlockedSecret || state.hasUnlockedLedger) {
                this._userIdle.stopWatching();
                this._userIdle.setConfigValues({ idle: state.idleTimeoutMinutes * 60 });
                this._userIdle.startWatching();
            } else {
                this._userIdle.stopWatching();
            }
        });
    }
}
