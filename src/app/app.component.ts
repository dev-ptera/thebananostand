import { Component } from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animation';

@Component({
    selector: 'app-root',
    template: `
        <div [@routeAnimations]="prepareRoute(outlet)">
            <router-outlet #outlet="outlet"></router-outlet>
        </div>
    `,
    animations: [slideInAnimation],
})
export class AppComponent {
    prepareRoute(outlet: RouterOutlet): Data {
        return outlet?.activatedRouteData?.['animation'];
    }
}
