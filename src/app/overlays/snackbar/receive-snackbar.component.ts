import { Component } from '@angular/core';
import { ReceiveService } from '@app/services/receive.service';
import { scan, takeWhile, tap, timer } from 'rxjs';
import { AppStateService } from '@app/services/app-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { REFRESH_DASHBOARD_ACCOUNTS } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-receive-snackbar',
    styleUrls: [`app-receive-snackbar.component.scss`],
    template: `
        <ng-template #closeButton>
            <button mat-icon-button (click)="close()" style="margin-right: -8px;">
                <mat-icon color="primary">close</mat-icon>
            </button>
        </ng-template>

        <div *ngIf="showError" class="container">
            <div>An error occurred while auto-receiving.</div>
            <ng-template [ngTemplateOutlet]="closeButton"></ng-template>
        </div>
        <ng-container *ngIf="!showError">
            <div *ngIf="isCompleted" class="container">
                <div style="display: flex; align-items: center">
                    <mat-icon class="info-icon">verified</mat-icon>
                    <div>{{ receivedAmount | appComma }} BAN received!</div>
                </div>
                <ng-template [ngTemplateOutlet]="closeButton"></ng-template>
            </div>
            <ng-container *ngIf="!isCompleted">
                <div *ngIf="timeUntilAutoReceiveStarts !== 0" class="container">
                    <div style="display: flex; align-items: center">
                        <mat-icon class="info-icon">download</mat-icon>
                        <div>Auto-receiving in {{ timer$ | async }}...</div>
                    </div>
                    <ng-template [ngTemplateOutlet]="closeButton"></ng-template>
                </div>
                <div *ngIf="timeUntilAutoReceiveStarts === 0" class="container">
                    <div style="display: flex; align-items: center;">
                        <mat-spinner diameter="20" class="info-icon"></mat-spinner>
                        <div>Receiving block No. {{ currentBlockNumberReceiving }} of {{ maxBlocks }}...</div>
                    </div>
                    <ng-template [ngTemplateOutlet]="closeButton"></ng-template>
                </div>
            </ng-container>
        </ng-container>
    `,
})
export class ReceiveSnackbarComponent {
    timeBetweenTicks = 1000;
    timeUntilAutoReceiveStarts = 5;
    blocks = [];
    dismissTime = 3_000;
    showError = false;
    isCompleted = false;

    constructor(
        private readonly _receiveService: ReceiveService,
        private readonly _snackbar: MatSnackBar,
        private readonly _appStateService: AppStateService
    ) {}

    ngOnInit(): void {
        this.blocks = this._appStateService.getAllReceivableBlocks();
        if (this.blocks.length === 0) {
            return;
        }
    }

    close(): void {
        this._receiveService.stopReceive();
        this._snackbar.dismiss();
    }

    get maxBlocks(): number {
        return this._receiveService.maxBlocks;
    }

    get currentBlockNumberReceiving(): number {
        return this._receiveService.currentBlockNumberReceiving;
    }

    get receivedAmount(): number {
        return this._receiveService.receivedAmount;
    }

    timer$ = timer(0, this.timeBetweenTicks).pipe(
        scan((acc) => --acc, this.timeUntilAutoReceiveStarts),
        tap((x) => {
            this.timeUntilAutoReceiveStarts = x;
            if (this.timeUntilAutoReceiveStarts === 0) {
                this._receiveService
                    .receiveTransaction(this.blocks)
                    .catch((err) => {
                        this.showError = true;
                    })
                    .finally(() => {
                        this.isCompleted = true;
                        REFRESH_DASHBOARD_ACCOUNTS.next();
                        setTimeout(() => {
                            this._snackbar.dismiss();
                        }, this.dismissTime);
                    });
            }
        }),
        takeWhile((x) => x >= 0)
    );
}
