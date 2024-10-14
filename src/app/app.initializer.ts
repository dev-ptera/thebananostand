import { inject } from '@angular/core';
import { PowService } from '@app/services/pow.service';
import { TimeoutService } from '@app/services/timeout.service';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { AppStateService } from '@app/services/app-state.service';
import { environment } from '../environments/environment';
import { DatasourceService } from '@app/services/datasource.service';

function appHeight(): void {
    const doc = document.documentElement;
    doc.style.setProperty(`--app-height`, `${window.innerHeight}px`);
}

export function initializeApp(): void {
    const powService = inject(PowService);
    const timeoutService = inject(TimeoutService);
    const walletEventService = inject(WalletEventsService);
    const appStateService = inject(AppStateService);
    const dataSourceService = inject(DatasourceService);

    powService.init();
    walletEventService.init();
    timeoutService.init();
    appStateService.store.subscribe((data) => {
        if (!environment.production) {
            // eslint-disable-next-line no-console
            console.log(data);
        }
    });

    dataSourceService.init();

    // Respond to window height change events.
    window.addEventListener(`resize`, appHeight);
    appHeight();
}
