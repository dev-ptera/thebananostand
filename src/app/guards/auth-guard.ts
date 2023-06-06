import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppStateService } from '@app/services/app-state.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardService implements CanActivate {

    private _originalRoute = '';

    constructor(public appStateService: AppStateService, public router: Router) {}

    canActivate(): boolean {
        const store = this.appStateService.store.getValue();
        if (store.hasUnlockedLedger || store.hasUnlockedSecret) {
            return true;
        }
        this._originalRoute = window.location.pathname;
        void this.router.navigate(['']);
        return false;
    }

    get originalRoute() {
        return this._originalRoute;
    }
}
