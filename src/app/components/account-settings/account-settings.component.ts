import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ViewportService } from '@app/services/viewport.service';
import { ThemeService } from '@app/services/theme.service';
import { AppStateService } from '@app/services/app-state.service';

@Component({
    selector: 'app-account-settings',
    template: `
        <ng-template #accountActionsMenu>
            <div class="mat-overline category-separator">Themes</div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="toggleJungleGreenTheme()">
                <mat-icon>light_mode</mat-icon>
                <span>Jungle Green</span>
            </button>
            <button mat-menu-item (click)="toggleNanoBlueTheme()">
                <mat-icon>light_mode</mat-icon>
                <span>Nano Blue</span>
            </button>
            <button mat-menu-item (click)="toggleBananoYellowTheme()">
                <mat-icon>dark_mode</mat-icon>
                <span>Banano Yellow</span>
            </button>

            <ng-container *ngIf="isUserLoggedIn()">
                <div class="mat-overline category-separator" style="margin-top: 24px">Advanced</div>
                <button mat-menu-item (click)="navigateToAddressBook()">
                    <mat-icon>import_contacts</mat-icon>
                    <span>Address Book</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="navigateToSigning()">
                    <mat-icon>edit_note</mat-icon>
                    <span>Signing</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="navigateToSettingsPage()" data-cy="more-settings">
                    <mat-icon>open_in_new</mat-icon>
                    <span>More</span>
                </button>
            </ng-container>
        </ng-template>
        <ng-template #desktopTrigger>
            <button mat-icon-button>
                <mat-icon class="account-settings-icon-trigger">settings</mat-icon>
            </button>
        </ng-template>
        <ng-template #mobileTrigger>
            <mat-icon class="account-settings-icon-trigger">settings</mat-icon>
        </ng-template>
        <responsive-menu
            menuTitle="Settings"
            [(open)]="userMenuOpen"
            [menu]="accountActionsMenu"
            [desktopTrigger]="desktopTrigger"
            [mobileTrigger]="mobileTrigger"
            data-cy="settings-button"
        >
        </responsive-menu>
    `,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['account-settings.component.scss'],
})
export class AppAccountSettingsComponent {
    userMenuOpen = false;

    constructor(
        private readonly _router: Router,
        public vp: ViewportService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _appStateService: AppStateService,
        private readonly _theme: ThemeService
    ) {}

    toggleJungleGreenTheme(): void {
        this.userMenuOpen = false;
        this._theme.setTheme('jungle-green');
    }

    toggleBananoYellowTheme(): void {
        this.userMenuOpen = false;
        this._theme.setTheme('banano-yellow');
    }

    toggleNanoBlueTheme(): void {
        this.userMenuOpen = false;
        this._theme.setTheme('nano-blue');
    }

    navigateToSettingsPage(): void {
        this.userMenuOpen = false;
        setTimeout(() => {
            void this._router.navigate(['/settings']);
        }, 100);
    }

    navigateToAddressBook(): void {
        this.userMenuOpen = false;
        setTimeout(() => {
            void this._router.navigate(['/address-book']);
        }, 100);
    }

    navigateToSigning(): void {
        this.userMenuOpen = false;
        setTimeout(() => {
            void this._router.navigate(['/signing']);
        }, 100);
    }

    navigateToSignMessage(): void {
        this.userMenuOpen = false;
        setTimeout(() => {
            void this._router.navigate(['/signmessage']);
        }, 100);
    }

    isUserLoggedIn(): boolean {
        return (
            this._appStateService.store.getValue().hasUnlockedSecret ||
            this._appStateService.store.getValue().hasUnlockedLedger
        );
    }
}
