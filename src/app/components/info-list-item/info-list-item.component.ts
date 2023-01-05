import {ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild, ViewEncapsulation,} from '@angular/core';

type IconAlignType = 'left' | 'center' | 'right' | undefined;
type DividerType = 'full' | 'partial' | undefined;

/**
 * [InfoListItem Component](https://brightlayer-ui-components.github.io/angular/?path=/info/components-info-list-item--readme)
 *
 * The `<blui-info-list-item>` is intended to be used in List views.
 * It positions a title as well as optional subtitle(s), icon, and status stripe.
 */
@Component({
    selector: 'blui-info-list-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    template: `
        <mat-list-item
            class="blui-info-list-item-content"
            [class.blui-info-list-item-wrap]="wrapSubtitle || wrapTitle || wrapInfo"
            [class.blui-info-list-item-dense]="dense"
            [class.blui-info-list-item-status]="statusColor"
            [style.border-left-color]="statusColor"
            [style.border-right-color]="statusColor"
            [disabled]="disabled"
        >
            <div
                mat-list-icon
                class="blui-info-list-item-icon-wrapper"
                [class.blui-info-list-item-hide-padding]="hidePadding"
                [class.blui-info-list-item-avatar]="avatar"
                [style.justify-content]="
                    iconAlign === 'right' ? 'flex-end' : iconAlign === 'center' ? 'center' : 'flex-start'
                "
            >
                <ng-content select="[blui-icon]"></ng-content>
            </div>
            <div class="blui-info-list-item-left-content-wrapper">
                <ng-content select="[blui-left-content]"></ng-content>
            </div>
            <div
                class="mat-body-2 blui-info-list-item-title-wrapper"
                matLine
                [class.blui-info-list-item-wrap]="wrapTitle"
                #title
            >
                <ng-content select="[blui-title]"></ng-content>
            </div>
            <div
                class="mat-subtitle-2 blui-info-list-item-subtitle-wrapper"
                matLine
                [class.blui-info-list-item-wrap]="wrapSubtitle"
            >
                <ng-content select="[blui-subtitle]"></ng-content>
            </div>
            <div
                class="mat-subtitle-2 blui-info-list-item-info-wrapper"
                matLine
                [class.blui-info-list-item-wrap]="wrapInfo"
            >
                <ng-content select="[blui-info]"></ng-content>
            </div>
            <blui-spacer class="blui-info-list-item-spacer"></blui-spacer>
            <div class="blui-info-list-item-right-content">
                <div #right class="blui-info-list-item-right-content-wrapper">
                    <ng-content select="[blui-right-content]"></ng-content>
                </div>
            </div>
        </mat-list-item>
        <mat-divider
            *ngIf="divider"
            class="blui-info-list-item-divider"
            [class.blui-info-list-item-partial-divider]="divider === 'partial'"
        >
        </mat-divider>
    `,
    styleUrls: ['./info-list-item.component.scss'],
    host: {
        class: 'blui-info-list-item',
    },
})
export class InfoListItemComponent {
    /** Show a colored background for the icon
     *
     * @default false
     * */
    @Input() avatar = false;
    /** Smaller height row with less padding
     *
     * @default false
     * */
    @Input() dense = false;
    /** Show a row separator below the row.  Can be `partial` | `full`
     *
     * `partial` - Divider does not expand full width of the ListItem
     *
     * `full`- Divider spans full width of the ListItem
     * */
    @Input() divider: DividerType;
    /** Disable the list item
     *
     * @default false
     * */
    @Input() disabled = false;
    /** Remove left padding if no icon is used */
    @Input() hidePadding = false;
    /** Icon alignment when avatar is set to false. Can be `left` | `right` | `center`
     *
     * `left` - Icon appears at the `flex-start` of the icon container.
     *
     * `right` - Icon appears at the `flex-end` of the icon container.
     *
     * `center` - Icon appears at the center of the icon container.
     *
     * @default left
     * */
    @Input() iconAlign: IconAlignType = 'left';
    /** Left border color */
    @Input() statusColor: string;
    /** When true, 3rd-line text overflow breaks onto the next line instead of using an ellipsis
     *
     * @default false
     * */
    @Input() wrapInfo = false;
    /** When true, 2nd-line text overflow breaks onto the next line instead of using an ellipsis
     *
     * @default false
     * */
    @Input() wrapSubtitle = false;
    /** When true, 1st-line text overflow breaks onto the next line instead of using an ellipsis
     *
     * @default false
     * */
    @Input() wrapTitle = false;

    @ViewChild('title') titleEl: ElementRef;
    @ViewChild('right') rightEl: ElementRef;
}
