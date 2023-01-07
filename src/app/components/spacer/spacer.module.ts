import { Component, HostBinding, Input, NgModule, OnChanges, OnInit } from '@angular/core';

@Component({
    selector: 'spacer',
    template: ` <ng-content></ng-content> `,
})
export class SpacerComponent implements OnChanges, OnInit {
    /** Flex grow/shrink value for use in flex layouts
     *
     * @default 1
     * */
    @Input() flex = 1;
    @HostBinding('style.flex') grow: string;
    @HostBinding('style.display') display = 'flex';

    ngOnInit(): void {
        this.calcGrow();
    }

    ngOnChanges(): void {
        this.calcGrow();
    }

    calcGrow(): void {
        this.grow = `${this.flex} ${this.flex} ${this.flex === 0 ? 'auto' : '0px'}`;
    }
}

@NgModule({
    declarations: [SpacerComponent],
    exports: [SpacerComponent],
})
export class SpacerModule {}
