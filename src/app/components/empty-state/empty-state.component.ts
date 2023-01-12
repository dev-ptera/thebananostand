import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    host: {
        class: 'app-empty-state',
    },
    selector: 'app-empty-state',
    styleUrls: ['./empty-state.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="empty-state-content">
            <div class="icon-wrapper">
                <ng-content select="mat-icon"></ng-content>
            </div>
            <div class="mat-headline-6 title">
                <ng-content select="[title]"></ng-content>
            </div>
            <div class="mat-body-2 description">
                <ng-content select="[description]"></ng-content>
            </div>
            <div class="actions-wrapper">
                <ng-content select="button"></ng-content>
            </div>
        </div>
    `,
})
export class EmptyStateComponent {}
