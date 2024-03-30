import { Component } from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animation';

@Component({
    selector: 'app-root',
    template: `
        <div [@routeAnimations]="prepareRoute(outlet)" class="app-root-component" [class.isPranked]="showPrank">
            <router-outlet #outlet="outlet"></router-outlet>
            <div *ngIf="showPrank" class="prank-container">
                <div class="prank-panel panel-1"></div>
                <div class="prank-panel panel-2"></div>
                <div class="prank-panel panel-3"></div>
                <div class="prank-panel panel-4"></div>
                <div class="prank-panel panel-5"></div>
                <div class="prank-panel panel-6"></div>
                <div class="prank-panel panel-7"></div>
                <div class="prank-panel panel-8"></div>
            </div>
        </div>
    `,
    animations: [slideInAnimation],
})
export class AppComponent {
    showPrank = false;

    prepareRoute(outlet: RouterOutlet): Data {
        return outlet?.activatedRouteData?.['animation'];
    }

    isBetweenApril1And2(): boolean {
        const today = new Date();
        const april1 = new Date(today.getFullYear(), 3, 1); // April is 3 (zero-based index)
        const april2 = new Date(today.getFullYear(), 3, 2);
        const currentDate = today.getDate();
        return currentDate >= april1.getDate() && currentDate <= april2.getDate();
    }

    ngOnInit(): void {
        this.showPrank = this.isBetweenApril1And2(); // TODO: TURN THIS OFF AFTER
    }
}
