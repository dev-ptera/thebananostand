import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { ViewportService } from '@app/services/viewport.service';
import { MatMenuTrigger } from '@angular/material/menu';

/**
 * [UserMenu Component](https://brightlayer-ui-components.github.io/angular/?path=/info/components-menu--readme)
 *
 * The `<responsive-menu>` is an Avatar that opens a Menu when clicked.
 * It is typically used in the top-right corner of an application and indicates who is logged in.
 */
@Component({
    selector: 'responsive-menu',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['responsive-menu.component.scss'],
    template: `
        <div (click)="triggerChange()" class="responsive-menu-trigger-wrapper">
            <ng-template
                *ngIf="shouldUseBottomSheet(); else menuTrigger"
                [ngTemplateOutlet]="bottomSheetTrigger"
            ></ng-template>
        </div>

        <ng-template #menuTrigger>
            <ng-template *ngIf="disabled" [ngTemplateOutlet]="desktopTrigger"></ng-template>
            <div
                *ngIf="!disabled"
                [matMenuTriggerFor]="menuOverlay"
                #responsiveMenuTrigger="matMenuTrigger"
                (onMenuClose)="checkCloseMenu()"
            >
                <ng-template [ngTemplateOutlet]="desktopTrigger"></ng-template>
            </div>
        </ng-template>

        <ng-template #bottomSheetTrigger>
            <ng-template [ngTemplateOutlet]="mobileTrigger"></ng-template>
        </ng-template>

        <mat-menu #menuOverlay="matMenu">
            <div class="responsive-menu-overlay">
                <ng-template [ngTemplateOutlet]="menu"></ng-template>
            </div>
        </mat-menu>

        <ng-template #bottomSheetOverlay>
            <div class="mat-title" style="padding: .5rem 1rem">{{ menuTitle }}</div>
            <mat-divider></mat-divider>
            <div class="responsive-menu-overlay responsive-menu-bottomsheet">
                <ng-template [ngTemplateOutlet]="menu"></ng-template>
            </div>
        </ng-template>
    `,
    host: {
        class: 'responsive-menu',
    },
})
export class ResponsiveMenuComponent implements OnInit, OnChanges, OnDestroy {
    /** Image source for avatar */
    @Input() avatarImage: string;

    /** Title shown when menu is open */
    @Input() menuTitle: string;

    /** Whether the menu overlay appears on screen. */
    @Input() open;

    /** Emits event when backdrop is clicked */
    @Output() backdropClick: EventEmitter<void> = new EventEmitter<void>();

    /** Emits an event when the open prop changes */
    @Output() openChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() desktopTrigger: TemplateRef<any>;
    @Input() mobileTrigger: TemplateRef<any>;
    @Input() menu: TemplateRef<any>;
    @Input() disabled: boolean;

    @ViewChild('bottomSheetOverlay') bottomSheetOverlay: TemplateRef<any>;
    @ViewChild('responsiveMenuTrigger') menuTrigger: MatMenuTrigger;

    viewportChangeListener: Subscription;

    isActivelyUsingBottomSheet: boolean;
    isMenuOpen: boolean;
    isBottomSheetOpen: boolean;
    isBottomSheetDismissing: boolean;

    shouldUseBottomSheet = (): boolean => this._vp.sm;

    constructor(
        private readonly _bottomSheet: MatBottomSheet,
        private readonly _ref: ChangeDetectorRef,
        private readonly _vp: ViewportService
    ) {}

    ngOnInit(): void {
        this.viewportChangeListener = this._vp.vpChange.subscribe(() => {
            setTimeout(() => {
                // Transition from Desktop to Mobile
                if (this.isMenuOpen && this.shouldUseBottomSheet() && !this.isActivelyUsingBottomSheet) {
                    this._openBottomSheet();
                    this._ref.detectChanges();
                }
                // Transition from Mobile to Desktop
                else if (this.isBottomSheetOpen && !this.shouldUseBottomSheet() && this.isActivelyUsingBottomSheet) {
                    this._bottomSheet.dismiss(true);
                }
            });
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Set state and dismiss bottom sheet when open() changes.
        if (changes.open) {
            // State changes from closed to open.
            const openState = changes.open;
            if (
                openState.currentValue === true &&
                (Boolean(openState.previousValue) === false || openState.isFirstChange())
            ) {
                this.shouldUseBottomSheet() ? this._openBottomSheet() : this._openMenu();
            }
            // State changes from open to closed.
            if (openState.currentValue === false && (openState.previousValue === true || openState.isFirstChange())) {
                this.isMenuOpen = false;
                if (this.menuTrigger) {
                    this.menuTrigger.closeMenu();
                }
                this.isBottomSheetOpen = false;
                this._bottomSheet.dismiss(false);
            }
        }
    }

    ngOnDestroy(): void {
        if (this.viewportChangeListener) {
            this.viewportChangeListener.unsubscribe();
        }
    }

    triggerChange(): void {
        if (!this.disabled) {
            this.openChange.emit(!this.open);
        }
    }

    checkCloseMenu(): void {
        // Indicates a menu -> bottomsheet transition will occur.
        if (this.shouldUseBottomSheet()) {
            return;
        }
        this._emitCloseOverlay();
    }

    private _openMenu(): void {
        if (this.isMenuOpen) {
            return;
        }
        this._openOverlay();
        this.isActivelyUsingBottomSheet = false;
        setTimeout(() => {
            if (!this.menuTrigger.menuOpen) {
                this.menuTrigger.openMenu();
            }
        });
    }

    private _openBottomSheet(): void {
        if (this.isBottomSheetOpen) {
            return;
        }

        this._openOverlay();
        this.isActivelyUsingBottomSheet = true;

        const bottomSheetRef = this._bottomSheet.open(this.bottomSheetOverlay, {
            backdropClass: 'responsive-menu-bottomsheet-backdrop',
            panelClass: 'responsive-menu-bottomsheet',
            hasBackdrop: true,
        });

        bottomSheetRef.backdropClick().subscribe(() => {
            this.openChange.emit(false);
            this.backdropClick.emit();
        });

        bottomSheetRef.afterDismissed().subscribe((shouldOpenMenuOverlay: boolean | undefined) => {
            if (shouldOpenMenuOverlay) {
                this._openMenu();
            }
        });

        bottomSheetRef.keydownEvents().subscribe((key: KeyboardEvent) => {
            this._dismissViaEscape(key);
        });
    }

    private _dismissViaEscape(e: KeyboardEvent): void {
        if (e && e.key && e.key.toLowerCase() === 'escape') {
            this._emitCloseOverlay();
        }
    }

    /** Open events respond to on changes already, no need to re-emit these events. */
    private _openOverlay(): void {
        this.open = true;
        this.isBottomSheetOpen = this.shouldUseBottomSheet();
        this.isMenuOpen = !this.shouldUseBottomSheet();
    }

    private _emitCloseOverlay(): void {
        this.open = false;
        this.isBottomSheetOpen = false;
        this.isMenuOpen = false;
        this.openChange.emit(false);
    }
}
