import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppStateService } from '@app/services/app-state.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
    private preservedRoute = '';

    constructor(public appStateService: AppStateService, public router: Router) {}

    canActivate(): boolean {
        const store = this.appStateService.store.getValue();
        if (store.hasUnlockedLedger || store.hasUnlockedSecret) {
            return true;
        }
        //preserve path and query string
        this.preservedRoute = window.location.pathname + window.location.search;
        void this.router.navigate(['']);
        return false;
    }

    get originalRoute(): string {
        return this.preservedRoute;
    }
}
