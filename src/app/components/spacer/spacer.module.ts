import { Component, HostBinding, Input, NgModule, OnChanges, OnInit } from '@angular/core';

/**
 * [Spacer Component](https://brightlayer-ui-components.github.io/angular/?path=/info/components-spacer--readme)
 *
 * An invisible utility component that acts as a spacer element in various layouts.
 * It works with flexbox sizing or fixed sizing.
 */
@Component({
    selector: 'blui-spacer',
    template: ` <ng-content></ng-content> `,
})
export class SpacerComponent implements OnChanges, OnInit {
    /** Flex grow/shrink value for use in flex layouts
     *
     * @default 1
     * */
    @Input() flex = 1;
    /** Height (in px) for static layouts */
    @HostBinding('style.height.px') @Input() height: number;
    /** Width (in px) for static layouts */
    @HostBinding('style.width.px') @Input() width: number;
    @HostBinding('style.flex') grow: string;
    @HostBinding('style.display') display = 'flex';

    ngOnInit(): void {
        this.calcGrow();
    }

    ngOnChanges(): void {
        this.calcGrow();
    }

    calcGrow(): void {
        this.grow = undefined;
        if (!this.height && !this.width) {
            this.grow = `${this.flex} ${this.flex} ${this.flex === 0 ? 'auto' : '0px'}`;
        }
    }
}

@NgModule({
    declarations: [SpacerComponent],
    exports: [SpacerComponent],
})
export class SpacerModule {}
