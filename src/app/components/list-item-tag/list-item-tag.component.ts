import { ChangeDetectionStrategy, Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';

/**
 * [ListItemTag Component](https://brightlayer-ui-components.github.io/angular/?path=/info/components-list-item-tag--readme)
 *
 * The `<blui-list-item-tag>` is a text item with a colored background and rounded corners that is used to tag lists.
 */
@Component({
    selector: 'blui-list-item-tag',
    templateUrl: './list-item-tag.component.html',
    styleUrls: ['./list-item-tag.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'blui-list-item-tag',
    },
})
export class ListItemTagComponent {
    /** Color of the label background */
    @Input() backgroundColor: string;
    /** Color of the label text */
    @Input() fontColor: string;
    /** The label text */
    @Input() label: string;
}
