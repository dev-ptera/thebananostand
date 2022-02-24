import { Component } from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animation';
import { ViewportService } from '@app/services/viewport.service';
import { AccountService } from '@app/services/account.service';
import { SeedService } from '@app/services/seed.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations: [slideInAnimation],
})
export class AppComponent {
    constructor(private readonly _vp: ViewportService, private readonly _seedService: SeedService) {}

    showBanana(): boolean {
        const unlocked = this._seedService.isLocalSeedUnlocked() || this._seedService.isLocalLedgerUnlocked();
        const isBigScreen = !this._vp.isSmall() && !this._vp.isMedium();
        return !unlocked && isBigScreen;
    }

    prepareRoute(outlet: RouterOutlet): Data {
        return outlet?.activatedRouteData?.['animation'];
    }
}
