import { Component } from '@angular/core';
import { ViewportService } from '@app/services/viewport.service';
import { Location } from '@angular/common';

@Component({
    selector: 'app-address-book',
    template: `<div class="app-root app-settings-page" responsive>
        <mat-toolbar color="primary" class="mat-elevation-z2 app-toolbar" responsive>
            <div style="display: flex; align-items: center">
                <button mat-icon-button (click)="back()">
                    <mat-icon>close</mat-icon>
                </button>
                <span style="margin-left: 12px">Address Book</span>
            </div>
        </mat-toolbar>

        <div class="app-body" responsive>
            <div class="app-body-content">
                <mat-card style="margin-bottom: 32px">
                    <div class="mat-title">Account Security</div>
                    <mat-divider></mat-divider>
                    <div class="mat-body-2">Bookmarks go here.</div>
                </mat-card>
            </div>
        </div>
    </div>`,
})
export class AddressBookComponent {
    constructor(public vp: ViewportService, private readonly _location: Location) {}

    back(): void {
        this._location.back();
    }
}
