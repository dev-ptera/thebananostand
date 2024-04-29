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
                <div class="prank-panel panel-9"></div>
                <div class="prank-panel panel-10"></div>
                <div class="prank-panel panel-11"></div>
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

    isAprilFoolsDay(): boolean {
        const today = new Date();
        const month = today.getMonth(); // getMonth() returns 0-indexed months (0 for January, 1 for February, etc.)
        const day = today.getDate();

        return month === 3 && day === 1; // April is the 4th month, but 0-indexed, so April is represented as 3
    }

    ngOnInit(): void {
        this.showPrank = this.isAprilFoolsDay();
    }
}
