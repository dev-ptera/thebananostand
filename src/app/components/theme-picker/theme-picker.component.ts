import { Component, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-theme-picker',
    template: `
        <blui-user-menu class="app-theme-picker" menuTitle="Theme" [(open)]="userMenuOpen">
            <mat-icon blui-avatar>palette</mat-icon>
            <mat-nav-list blui-menu-body [style.paddingTop.px]="0">
                <blui-info-list-item [dense]="true" (click)="toggleJungleGreenTheme()">
                    <mat-icon blui-icon>light_mode</mat-icon>
                    <div blui-title>Jungle Green</div>
                </blui-info-list-item>
                <blui-info-list-item [dense]="true" (click)="toggleNanoBlueTheme()">
                    <mat-icon blui-icon>light_mode</mat-icon>
                    <div blui-title>Nano Blue</div>
                </blui-info-list-item>
                <blui-info-list-item [dense]="true" (click)="toggleBananoYellowTheme()">
                    <mat-icon blui-icon>dark_mode</mat-icon>
                    <div blui-title>Banano Yellow</div>
                </blui-info-list-item>
            </mat-nav-list>
        </blui-user-menu>
    `,
    styleUrls: ['./theme-picker.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppThemePickerComponent {
    userMenuOpen = false;

    constructor(private readonly _theme: ThemeService) {}

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
}
