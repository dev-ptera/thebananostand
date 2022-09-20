import { Component } from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animation';
import { ViewportService } from '@app/services/viewport.service';
import { SecretService } from '@app/services/secret.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations: [slideInAnimation],
})
export class AppComponent {
    constructor(private readonly _vp: ViewportService, private readonly _secretService: SecretService) {
        const appHeight = (): void => {
            const doc = document.documentElement;
            doc.style.setProperty(`--app-height`, `${window.innerHeight}px`);
        };
        window.addEventListener(`resize`, appHeight);
        appHeight();
    }

    showBanana(): boolean {
        const unlocked = this._secretService.isLocalSecretUnlocked() || this._secretService.isLocalLedgerUnlocked();
        const isBigScreen = !this._vp.isSmall() && !this._vp.isMedium();
        //  return !unlocked && isBigScreen;
        return false;
    }

    prepareRoute(outlet: RouterOutlet): Data {
        return outlet?.activatedRouteData?.['animation'];
    }
}
