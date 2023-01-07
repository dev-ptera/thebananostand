import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    host: {
        class: 'list-item-tag',
    },
    selector: 'list-item-tag',
    template: `
        <div class="list-item-tag-content" [style.backgroundColor]="backgroundColor" [style.color]="fontColor">
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
}
