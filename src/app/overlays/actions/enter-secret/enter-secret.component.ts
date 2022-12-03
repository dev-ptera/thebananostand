import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AppStateService } from '@app/services/app-state.service';
import { IMPORT_NEW_WALLET_FROM_SECRET } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-enter-secret-overlay',
    styleUrls: ['enter-secret.component.scss'],
    template: `
        <div class="enter-secret-overlay">
            <h1 mat-dialog-title>Enter Seed or Mnemonic</h1>
            <div mat-dialog-content style="display: flex; flex: 1 1 0px; flex-direction: column">
                <ng-container *ngIf="activeStep === 0">
                    <div style="margin-bottom: 24px">Your secret phrase never leaves this website.</div>
                    <mat-form-field appearance="fill">
                        <mat-label>Seed or Mnemonic</mat-label>
                        <textarea
                            data-cy="secret-input"
                            matInput
                            placeholder="Secret Phrase"
                            [(ngModel)]="secret"
                            (keyup.enter)="next()"
                            style="min-height: 120px; resize: none"
                        ></textarea>
                    </mat-form-field>
                </ng-container>

                <ng-container *ngIf="activeStep === 1">
                    <div style="margin-bottom: 24px">
                        Enter a password to secure your wallet. This is optional but encouraged.
                    </div>

                    <mat-form-field style="width: 100%;" appearance="fill" (keyup.enter)="next()">
                        <mat-label>Password (optional)</mat-label>
                        <input
                            #passwordInput
                            matInput
                            [type]="passwordVisible ? 'text' : 'password'"
                            [(ngModel)]="password"
                            (keyup.enter)="next()"
                            data-cy="password-input"
                        />
                        <button mat-icon-button matSuffix (click)="togglePasswordVisibility()">
                            <mat-icon>{{ passwordVisible ? 'visibility' : 'visibility_off' }}</mat-icon>
                        </button>
                    </mat-form-field>
                </ng-container>

                <div *ngIf="error" style="display: flex; align-items: center;">
                    <mat-icon color="warn">error</mat-icon>
                    <span style="margin-left: 8px">{{ error }}</span>
                </div>
                <blui-spacer></blui-spacer>
                <mat-divider style="margin-left: -24px; margin-right: -24px"></mat-divider>
                <blui-mobile-stepper [activeStep]="activeStep" [steps]="maxSteps">
                    <button mat-stroked-button blui-back-button color="primary" (click)="back()">
                        <ng-container *ngIf="activeStep === 0">Close</ng-container>
                        <ng-container *ngIf="activeStep > 0">Back</ng-container>
                    </button>
                    <button
                        data-cy="secret-next"
                        mat-flat-button
                        blui-next-button
                        color="primary"
                        (click)="next()"
                        class="loading-button"
                        [disabled]="!isValidSecret()"
                    >
                        <ng-container *ngIf="activeStep < lastStep">Next</ng-container>
                        <ng-container *ngIf="activeStep === lastStep">Load</ng-container>
                    </button>
                </blui-mobile-stepper>
            </div>
        </div>
    `,
})
export class EnterSecretComponent implements OnInit {
    @Output() close = new EventEmitter<void>();

    @ViewChild('passwordInput') passwordInput: ElementRef;

    secret = '';
    password = '';
    activeStep = 0;
    maxSteps: number;
    lastStep: number;
    passwordVisible = false;

    error: string;

    constructor(private readonly _ref: ChangeDetectorRef, private readonly _appStateService: AppStateService) {}

    ngOnInit(): void {
        this.maxSteps = this._appStateService.store.getValue().hasUnlockedSecret ? 1 : 2;
        this.lastStep = this.maxSteps - 1;
    }

    closeOverlay(): void {
        this.close.emit();
    }

    isValidSecret(): boolean {
        if (!this.secret) {
            return false;
        }
        return this.secret.trim().length === 64 || this.secret.trim().split(' ').length === 24;
    }

    next(): void {
        if (this.activeStep === this.lastStep) {
            void this.addSeed();
        } else {
            this.activeStep++;
            this._ref.detectChanges();
            this.passwordInput.nativeElement.focus();
        }
    }

    back(): void {
        this.error = undefined;
        if (this.activeStep === 0) {
            this.closeOverlay();
        } else {
            this.activeStep--;
        }
    }

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    addSeed(): void {
        this.error = undefined;
        this.secret = this.secret.trim();
        IMPORT_NEW_WALLET_FROM_SECRET.next({ secret: this.secret, password: this.password });
        this.close.emit();
    }
}
