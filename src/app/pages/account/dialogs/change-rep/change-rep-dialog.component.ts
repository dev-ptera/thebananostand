import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilService } from '../../../../services/util.service';
import { BananoService } from '../../../../services/banano.service';
import { AccountService } from '../../../../services/account.service';
import * as Colors from '@brightlayer-ui/colors';
import { ApiService } from '../../../../services/api.service';

export type RepScore = {
    address: string;
    alias?: string;
    online: boolean;
    principal: boolean;
    score: number;
    weightPercentage: number;
};

export type ChangeRepDialogData = {
    address: string;
    index: number;
    currentRep: string;
};

@Component({
    selector: 'app-change-rep-dialog',
    styleUrls: ['change-rep-dialog.component.scss'],
    template: `
        <div class="change-rep-dialog">
            <ng-container *ngIf="success === true">
                <div
                    mat-dialog-content
                    style="display: flex; justify-content: center; flex:  1 1 0px; padding-bottom: 16px;"
                >
                    <blui-empty-state>
                        <mat-icon blui-empty-icon> check_circle </mat-icon>
                        <div blui-title>Representative Changed</div>
                        <div blui-description>
                            Your representative has been successfully updated and can be viewed
                            <span class="link" [style.color]="colors.blue[500]" (click)="openLink()">here.</span>
                            You can now close this window.
                        </div>
                        <div blui-actions>
                            <button mat-flat-button color="primary" class="close-button" (click)="closeDialog()">
                                Close
                            </button>
                        </div>
                    </blui-empty-state>
                </div>
            </ng-container>

            <ng-container *ngIf="success === false">
                <div
                    mat-dialog-content
                    class="dialog-content"
                    style="display: flex; justify-content: center; flex:  1 1 0px; padding-bottom: 16px;"
                >
                    <blui-empty-state>
                        <mat-icon blui-empty-icon> error </mat-icon>
                        <div blui-title>Representative Change Failed</div>
                        <div blui-description>Your representative could not be changed. {{ errorMessage }}</div>
                        <div blui-actions>
                            <button mat-flat-button color="primary" class="close-button" (click)="closeDialog()">
                                Close
                            </button>
                        </div>
                    </blui-empty-state>
                </div>
            </ng-container>

            <ng-container *ngIf="success === undefined">
                <h1 mat-dialog-title>Change Representative</h1>
                <div mat-dialog-content style="margin-bottom: 32px;">
                    <ng-container *ngIf="activeStep === 0">
                        <div style="margin-bottom: 8px">Your current representative is:</div>
                        <div
                            style="word-break: break-all; font-family: monospace"
                            [innerHTML]="util.formatHtmlAddress(data.currentRep)"
                        ></div>
                    </ng-container>

                    <ng-container *ngIf="activeStep === 1">
                        <div style="margin-bottom: 24px">Please enter the new representative address.</div>
                        <mat-form-field style="width: 100%;" appearance="fill">
                            <mat-label>Representative Address</mat-label>
                            <input matInput type="value" [(ngModel)]="newRepresentative" />
                        </mat-form-field>
                    </ng-container>

                    <ng-container *ngIf="activeStep === 2">
                        <div style="margin-bottom: 24px">Please confirm the transaction details below:</div>
                        <div style="font-weight: 600">Change Representative to</div>
                        <div
                            style="word-break: break-all; font-family: monospace"
                            [innerHTML]="util.formatHtmlAddress(newRepresentative)"
                        ></div>
                        <ng-container *ngIf="newRepresentativeMetaData">
                            <ng-container *ngIf="newRepresentativeMetaData.alias">
                                <div style="font-weight: 600; margin-top: 24px">Alias</div>
                                <div>{{ newRepresentativeMetaData.alias }}</div>
                            </ng-container>
                            <ng-container *ngIf="newRepresentativeMetaData.score">
                                <div style="font-weight: 600; margin-top: 24px">Score</div>
                                <div style="display: flex; align-items: center">
                                    <strong>{{ newRepresentativeMetaData.score }}</strong
                                    >/100
                                    <blui-list-item-tag
                                        *ngIf="newRepresentativeMetaData.score > 80"
                                        [label]="newRepresentativeMetaData.score < 90 ? 'Good' : 'Excellent'"
                                        [backgroundColor]="colors.green[500]"
                                        style="margin-left: 16px"
                                    >
                                    </blui-list-item-tag>
                                    <blui-list-item-tag
                                        *ngIf="newRepresentativeMetaData.score < 60"
                                        [label]="'Not Recommended'"
                                        [backgroundColor]="colors.red[500]"
                                        style="margin-left: 16px"
                                    >
                                    </blui-list-item-tag>
                                </div>
                            </ng-container>
                        </ng-container>
                    </ng-container>
                </div>

                <blui-spacer></blui-spacer>
                <mat-divider></mat-divider>
                <blui-mobile-stepper [activeStep]="activeStep" [steps]="maxSteps">
                    <button mat-stroked-button blui-back-button color="primary" (click)="back()">
                        <ng-container *ngIf="activeStep === 0">Close</ng-container>
                        <ng-container *ngIf="activeStep > 0">Back</ng-container>
                    </button>
                    <button
                        class="change-button"
                        mat-flat-button
                        blui-next-button
                        color="primary"
                        (click)="next()"
                        [disabled]="!canContinue()"
                    >
                        <ng-container *ngIf="activeStep < lastStep">Next</ng-container>
                        <ng-container *ngIf="activeStep === lastStep">
                            <div class="spinner-container" [class.isLoading]="loading">
                                <mat-spinner class="primary-spinner" diameter="20"></mat-spinner>
                            </div>
                            <span *ngIf="!loading"> Change </span>
                        </ng-container>
                    </button>
                </blui-mobile-stepper>
            </ng-container>
        </div>
    `,
})
export class ChangeRepDialogComponent implements OnInit {
    activeStep = 0;
    sendAmount: number;
    newRepresentative: string;
    maxSteps = 3;
    loading: boolean;
    success: boolean;
    lastStep = this.maxSteps - 1;
    sent: boolean;
    txHash: string;
    colors = Colors;
    repScores: RepScore[];
    errorMessage: string;
    newRepresentativeMetaData: RepScore;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ChangeRepDialogData,
        private readonly _bananoService: BananoService,
        private readonly _accountService: AccountService,
        private readonly _apiService: ApiService,
        public dialogRef: MatDialogRef<ChangeRepDialogComponent>,
        public util: UtilService
    ) {}

    ngOnInit(): void {
        this._apiService
            .getRepresentativeScores()
            .then((data) => {
                this.repScores = data;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    canContinue(): boolean {
        if (this.activeStep === 1) {
            return this.util.isValidAddress(this.newRepresentative);
        }
        return true;
    }

    back(): void {
        if (this.activeStep === 0) {
            return this.closeDialog();
        }
        this.activeStep--;
    }

    next(): void {
        if (this.activeStep === this.lastStep) {
            return this.changeRepresentative();
        }
        if (this.activeStep === 1) {
            this.newRepresentativeMetaData = undefined;
            this.repScores.map((rep) => {
                if (rep.address === this.newRepresentative) {
                    this.newRepresentativeMetaData = rep;
                }
            });
        }
        this.activeStep++;
    }

    openLink(): void {
        this._accountService.openLink(this.txHash);
    }

    closeDialog(): void {
        this.dialogRef.close(this.txHash);
    }

    changeRepresentative(): void {
        this.loading = true;
        this._bananoService
            .changeRepresentative(this.newRepresentative, this.data.address, this.data.index)
            .then((response) => {
                this.txHash = response;
                this.success = true;
            })
            .catch((err) => {
                console.error(err);
                this.errorMessage = err;
                this.success = false;
            });
    }
}
