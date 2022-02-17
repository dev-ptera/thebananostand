import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { Breakpoint, ViewportService } from '@app/services/viewport.service';

@Directive({
    selector: '[responsive]',
})
export class ResponsiveDirective implements OnInit, OnDestroy {
    domElement: Element;
    vpSubscription: Subscription;

    constructor(
        private readonly _renderer: Renderer2,
        private readonly _vp: ViewportService,
        private readonly _elementRef: ElementRef
    ) {
        this.domElement = this._elementRef.nativeElement;
        this.applyResponsiveClasses(this._vp.breakpoint);
    }

    ngOnInit(): void {
        this.vpSubscription = this._vp.vpChange.subscribe((breakpoint: Breakpoint) => {
            this.applyResponsiveClasses(breakpoint);
        });
    }

    applyResponsiveClasses(breakpoint: Breakpoint): void {
        if (breakpoint === 'sm') {
            this._renderer.addClass(this.domElement, 'sm');
            this._renderer.addClass(this.domElement, 'md');
        }
        if (breakpoint === 'md') {
            this._renderer.removeClass(this.domElement, 'sm');
            this._renderer.addClass(this.domElement, 'md');
        }
        if (!breakpoint) {
            this._renderer.removeClass(this.domElement, 'sm');
            this._renderer.removeClass(this.domElement, 'md');
        }
    }

    ngOnDestroy(): void {
        if (this.vpSubscription) {
            this.vpSubscription.unsubscribe();
        }
    }
}
