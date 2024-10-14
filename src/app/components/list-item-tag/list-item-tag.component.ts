import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    host: {
        class: 'list-item-tag',
    },
    selector: 'list-item-tag',
    template: `
        <div
            *ngIf="!variant"
            class="list-item-tag-content mat-caption"
            [style.backgroundColor]="backgroundColor"
            [style.color]="fontColor"
        >
            {{ label }}
        </div>
        <div *ngIf="variant" class="list-item-tag-content mat-caption" [ngClass]="variant" [class.outline]="outline">
            {{ label }}
        </div>
    `,
    styleUrls: ['list-item-tag.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemTagComponent {
    /** Color of the label background */
    @Input() backgroundColor: string;
    /** Color of the label text */
    @Input() fontColor: string;
    /** The label text */
    @Input() label: string;
    /** Common variants. */
    @Input() variant: 'online' | 'offline' | 'loading' = undefined;
    /** Style variant. */
    @Input() outline = false;
}
