import {Component, ViewChild} from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animation';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { PowService } from '@app/services/pow.service';
import { AppStateService } from '@app/services/app-state.service';
import { environment } from '../environments/environment';
import { TimeoutService } from '@app/services/timeout.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations: [slideInAnimation],
})
export class AppComponent {

    @ViewChild('action') action;

    constructor(
        private readonly _powService: PowService,
        private readonly _appStoreService: AppStateService,
        private readonly _walletEventService: WalletEventsService, // Required to listen to app events; don't remove.
        private readonly _timeoutService: TimeoutService // Listens for user idle
    ) {
        const appHeight = (): void => {
            const doc = document.documentElement;
            doc.style.setProperty(`--app-height`, `${window.innerHeight}px`);
        };
        window.addEventListener(`resize`, appHeight);
        appHeight();

        this._appStoreService.store.subscribe((data) => {
            if (!environment.production) {
                // eslint-disable-next-line no-console
                console.log(data);
            }
        });
    }

    ngOnInit(): void {
        this._powService.initializePowService();
    }

    ngAfterViewInit(): void {
        console.log(this.action);
        this.action.deviceIndexActive = 1;
        console.log(this.action.devices.getValue());
        this.action.devices.subscribe((data) => {
            console.log(this.action.devices.getValue());
            console.log(data);
        })
    }

    prepareRoute(outlet: RouterOutlet): Data {
        return outlet?.activatedRouteData?.['animation'];
    }
}
