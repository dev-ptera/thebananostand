import { Component } from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animation';
import { ViewportService } from '@app/services/viewport.service';
import { SecretService } from '@app/services/secret.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilService } from '@app/services/util.service';
import { PowService } from '@app/services/pow.service';
import { ListenerService } from '@app/services/listener.service';
import { AppStateService } from '@app/services/app-state.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations: [slideInAnimation],
})
export class AppComponent {
    constructor(
        private readonly _vp: ViewportService,
        private readonly _secretService: SecretService,
        private readonly _walletEventService: WalletEventsService,
        private readonly _powService: PowService,
        private readonly _listenerService: ListenerService,
        private readonly _appStoreService: AppStateService
    ) {
        const appHeight = (): void => {
            const doc = document.documentElement;
            doc.style.setProperty(`--app-height`, `${window.innerHeight}px`);
        };
        window.addEventListener(`resize`, appHeight);
        appHeight();

        this._appStoreService.store.subscribe((data) => {
            console.log(data);
        });
    }

    ngOnInit(): void {
        this.initializePowService();
    }

    initializePowService(): void {
        this._powService.overrideDefaultBananoJSPowSource();
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
