import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SecretService } from '@app/services/secret.service';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ViewportService } from '@app/services/viewport.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-account-settings',
    template: `
        <ng-template #accountActionsMenu>
            <div class="mat-overline" style="padding-left: 16px">Themes</div>
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
                <div class="mat-overline" style="margin-top: 24px; padding-left: 16px">Advanced</div>
                <button mat-menu-item (click)="navigateToSettingsPage()" data-cy="more-settings">
                    <mat-icon>open_in_new</mat-icon>
                    <span>More</span>
                </button>
            </ng-container>
        </ng-template>
        <ng-template #desktopTrigger>
            <button mat-icon-button>
                <mat-icon>settings</mat-icon>
            </button>
        </ng-template>
        <ng-template #mobileTrigger>
            <mat-icon>settings</mat-icon>
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
    styleUrls: ['./account-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppAccountSettingsComponent {
    userMenuOpen = false;

    constructor(
        private readonly _router: Router,
        public vp: ViewportService,
        private readonly _dialog: MatDialog,
        private readonly _sheet: MatBottomSheet,
        private readonly _secretService: SecretService,
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

    isUserLoggedIn(): boolean {
        return (
            (this._secretService.hasSecret() && this._secretService.isLocalSecretUnlocked()) ||
            this._secretService.isLocalLedgerUnlocked()
        );
    }
}
