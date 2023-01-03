import {Injectable} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {BehaviorSubject} from 'rxjs';

export type Breakpoint = 'sm' | 'md' | undefined;

const SMALL = 600;
const MID = 900;

@Injectable({
    providedIn: 'root',
})
/** Use this service to get screen size; can be used to trigger conditional styles. */
@Injectable({
    providedIn: 'root',
})
export class ViewportService {
    breakpoint: Breakpoint;
    breakpointSubscription: any;
    md: boolean;
    sm: boolean;

    private readonly _getInitialVp = (): Breakpoint => {
        if (window.outerWidth > MID) {
            return undefined;
        }
        if (window.outerWidth > SMALL) {
            return 'md';
        }
        return 'sm';
    };

    vpChange = new BehaviorSubject<Breakpoint>(this._getInitialVp());

    // Viewports are treated as mutually exclusive; a viewpoint cannot be 'sm' and 'md' at the same time.
    constructor(private readonly _breakpointObserver: BreakpointObserver) {
        this.breakpointSubscription = this._breakpointObserver
            .observe([`(max-width: ${MID}px)`, `(max-width: ${SMALL}px)`])
            .subscribe((result) => {
                const md = Object.keys(result.breakpoints)[0];
                const sm = Object.keys(result.breakpoints)[1];
                this.sm = result.breakpoints[sm];
                this.md = result.breakpoints[md] && !this.sm;
                this.breakpoint = this.sm ? 'sm' : this.md ? 'md' : undefined;
                this.vpChange.next(this.breakpoint);
            });

        this.vpChange.subscribe((breakpoint) => {
            document.body.classList.remove('sm');
            document.body.classList.remove('md');
            document.body.classList.add(breakpoint);
        });
    }
}
