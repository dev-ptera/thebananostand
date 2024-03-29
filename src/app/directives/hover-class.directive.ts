import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[hover-class]',
})
export class HoverClassDirective {
    constructor(public elementRef: ElementRef) {}
    @Input('hover-class') hoverClass: string;

    @HostListener('mouseenter') onMouseEnter(): void {
        for (const className of this.hoverClass.split(' ')) {
            this.elementRef.nativeElement.classList.add(className);
        }
    }

    @HostListener('mouseleave') onMouseLeave(): void {
        for (const className of this.hoverClass.split(' ')) {
            this.elementRef.nativeElement.classList.remove(className);
        }
    }
}
