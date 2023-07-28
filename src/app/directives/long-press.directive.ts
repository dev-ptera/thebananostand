/* https://stackblitz.com/edit/long-press-click?embed=1&file=src/app/long-press.directive.ts */
import { Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';
import { fromEvent, merge, of, Subscription, timer } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

@Directive({
    selector: '[longPress]',
})
export class LongPressDirective implements OnDestroy {
    private readonly eventSubscribe: Subscription;
    threshold = 0;

    @Output()
    mouseLongPress = new EventEmitter();

    constructor(private readonly _elementRef: ElementRef) {
        const mousedown = fromEvent<MouseEvent>(_elementRef.nativeElement, 'mousedown').pipe(
            filter((event) => event.button === 0), // Only allow left button (Primary button)
            map(() => true) // turn on threshold counter
        );
        const touchstart = fromEvent(_elementRef.nativeElement, 'touchstart').pipe(map(() => true));
        const touchEnd = fromEvent(_elementRef.nativeElement, 'touchend').pipe(map(() => false));
        const mouseup = fromEvent<MouseEvent>(window, 'mouseup').pipe(
            filter((event) => event.button === 0), // Only allow left button (Primary button)
            map(() => false) // reset threshold counter
        );
        this.eventSubscribe = merge(mousedown, mouseup, touchstart, touchEnd)
            .pipe(
                switchMap((state) => (state ? timer(this.threshold, 1000) : of(null))),
                filter((value) => !!value)
            )
            .subscribe(() => this.mouseLongPress.emit());
    }

    ngOnDestroy(): void {
        if (this.eventSubscribe) {
            this.eventSubscribe.unsubscribe();
        }
    }
}
