import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    host: {
        class: 'app-empty-state',
    },
    selector: 'app-empty-state',
    styleUrls: ['./empty-state.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="content">
            <div class="icon-wrapper">
                <ng-content select="mat-icon"></ng-content>
            </div>
            <div class="mat-headline-5 title">
                <ng-content select="[title]"></ng-content>
            </div>
            <p class="mat-subtitle-2 description">
                <ng-content select="[description]"></ng-content>
            </p>
            <div class="actions-wrapper">
                <ng-content select="button"></ng-content>
            </div>
        </div>
    `,
})
export class EmptyStateComponent {}
