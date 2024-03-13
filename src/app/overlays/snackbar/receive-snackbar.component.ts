import { Component } from '@angular/core';
import { ReceiveService } from '@app/services/receive.service';
import { scan, takeWhile, tap, timer } from 'rxjs';
import { AppStateService } from '@app/services/app-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    REFRESH_DASHBOARD_ACCOUNTS,
    SNACKBAR_CLOSE_ACTION_TEXT,
    SNACKBAR_DURATION,
    USER_CANCEL_AUTO_RECEIVE,
} from '@app/services/wallet-events.service';

@Component({
    selector: 'app-receive-snackbar',
    styleUrls: [`receive-snackbar.component.scss`],
    template: `
        <ng-template #closeButton>
            <button mat-button (click)="close()" style="margin-right: -8px;" color="primary">
                {{ isCompleted || showError ? closeText : 'Cancel' }}
            </button>
        </ng-template>

        <div *ngIf="showError" class="container">
            <div>An auto-receiving error occurred.</div>
            <ng-template [ngTemplateOutlet]="closeButton"></ng-template>
        </div>
        <ng-container *ngIf="!showError">
            <div *ngIf="isCompleted" class="container">
                <div style="display: flex; align-items: center">
                    <div class="info-icon-container">
                        <mat-icon class="info-icon">verified</mat-icon>
                    </div>
                    <div>{{ receivedAmount | appComma }} BAN received!</div>
                </div>
                <ng-template [ngTemplateOutlet]="closeButton"></ng-template>
            </div>
            <ng-container *ngIf="!isCompleted">
                <div *ngIf="timeUntilAutoReceiveStarts !== 0" class="container">
                    <div style="display: flex; align-items: center">
                        <div class="info-icon-container">
                            <mat-icon class="info-icon">download</mat-icon>
                        </div>
                        <div>Auto-receiving in {{ timer$ | async }}...</div>
                    </div>
                    <ng-template [ngTemplateOutlet]="closeButton"></ng-template>
                </div>
                <div *ngIf="timeUntilAutoReceiveStarts === 0" class="container">
                    <div style="display: flex; align-items: center;">
                        <div class="info-icon-container">
                            <mat-spinner diameter="22"></mat-spinner>
                        </div>
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
    showError = false;
    isCompleted = false;
    closeText = SNACKBAR_CLOSE_ACTION_TEXT;

    constructor(
        private readonly _snackbar: MatSnackBar,
        private readonly _receiveService: ReceiveService,
        private readonly _appStateService: AppStateService
    ) {}

    ngOnInit(): void {
        this.blocks = this._appStateService.getAllReceivableBlocks();
        if (this.blocks.length === 0) {
            return;
        }
    }

    close(): void {
        USER_CANCEL_AUTO_RECEIVE.next();
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
        // eslint-disable-next-line no-param-reassign
        scan((acc) => --acc, this.timeUntilAutoReceiveStarts),
        tap((x) => {
            this.timeUntilAutoReceiveStarts = x;
            if (this.timeUntilAutoReceiveStarts === 0) {
                this._receiveService
                    .receiveTransaction(this.blocks)
                    .catch(() => {
                        this.showError = true;
                    })
                    .finally(() => {
                        this.isCompleted = true;
                        REFRESH_DASHBOARD_ACCOUNTS.next();
                        setTimeout(() => {
                            this._snackbar.dismiss();
                        }, SNACKBAR_DURATION);
                    });
            }
        }),
        takeWhile((x) => x >= 0)
    );
}
