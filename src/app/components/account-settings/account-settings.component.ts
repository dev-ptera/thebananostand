import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SecretService } from '@app/services/secret.service';

@Component({
    selector: 'app-account-settings',
    template: `
        <blui-user-menu
            data-cy="account-settings"
            class="app-theme-picker"
            menuTitle="Account"
            [(open)]="userMenuOpen"
            *ngIf="show()"
        >
            <mat-icon blui-avatar>settings</mat-icon>
            <mat-nav-list blui-menu-body [style.paddingTop.px]="0">
                <blui-info-list-item [dense]="true" (click)="clearData()" data-cy="clear-data-button">
                    <mat-icon blui-icon>delete</mat-icon>
                    <div blui-title>Clear Local Data</div>
                </blui-info-list-item>
            </mat-nav-list>
        </blui-user-menu>
    `,
    styleUrls: ['./account-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppAccountSettingsComponent {
    userMenuOpen = false;
    hasRecentlyClearedSeed = false;

    constructor(private readonly _router: Router, private readonly _secretService: SecretService) {}

    clearData(): void {
        //this._secretService.clearSeed(); // TODO FIX
        this.userMenuOpen = false;
        this.hasRecentlyClearedSeed = true;
        setTimeout(() => {
            this.hasRecentlyClearedSeed = false;
        }, 50);
        void this._router.navigate(['']);
    }

    show(): boolean {
        return this._secretService.hasSecret() || this.hasRecentlyClearedSeed;
    }
}
