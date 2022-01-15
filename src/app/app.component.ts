import { Component } from '@angular/core';
import {Data, RouterOutlet} from "@angular/router";
import {slideInAnimation} from "./animation";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations: [ slideInAnimation ]
})
export class AppComponent {
    prepareRoute(outlet: RouterOutlet): Data {
        return outlet?.activatedRouteData?.['animation'];
    }
}
