import {Component} from "@angular/core";
import { Location } from '@angular/common'

@Component({
    selector: 'app-settings-page',
    template: `
        <div class="app-root">
            <mat-toolbar color="primary" class="mat-elevation-z2 app-toolbar" responsive>

                <div style="display: flex; align-items: center">
                    <button mat-icon-button (click)="back()">
                        <mat-icon>arrow_back</mat-icon>
                    </button>
                    <span style="margin-left: 12px">Settings</span>
                </div>
            </mat-toolbar>

            <div class="app-body" responsive>
                <div class="app-body-content">
                    <mat-card>
                        <div class="mat-title">Data Sources</div>
                        <mat-divider></mat-divider>
                        <div class="mat-overline">
                            Spyglass API Datasource
                        </div>
                        <div class="mat-body-1">Used to show filtered transaction history,
                            fetch representative scores, and aliases.</div>
                        <div class="mat-overline">
                            Node RPC Datasource
                        </div>
                        <div class="mat-body-1">Used for send/receive/change actions
                            and fetching account balances. </div>
                    </mat-card>
                </div>
            </div>
        </div>

    `,
    styleUrls: ['./settings.component.scss'],
})
export class SettingsPageComponent {

    constructor(private _location: Location) {
    }

    back(): void {
        this._location.back()
    }
}
