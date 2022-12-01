import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SecretService } from '@app/services/secret.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-change-password-overlay',
    styleUrls: ['change-password.component.scss'],
    template: `
        <div class="change-password-overlay">
            <h1 mat-dialog-title>Change Password</h1>
            <div mat-dialog-content style="margin-bottom: 32px;">
                <div style="display: flex; align-items: center">
                    <mat-icon class="secondary-text" style="padding-right: 16px">info</mat-icon>
                    <span style="margin-left: 16px">You will be logged out after changing your password.</span>
                </div>
                <form style="margin-top: 32px">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>Current Password</mat-label>
                        <input
                            matInput
                            name="password"
                            autocomplete="off"
                            [type]="isCurrentPasswordVisible ? 'text' : 'password'"
                            [formControl]="currentPasswordFormControl"
                            data-cy="current-password-input"
                        />
                        <button
                            type="button"
                            mat-icon-button
                            matSuffix
                            (click)="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                        >
                            <mat-icon>{{ isCurrentPasswordVisible ? 'visibility' : 'visibility_off' }}</mat-icon>
                        </button>
                    </mat-form-field>

                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>New Password</mat-label>
                        <input
                            type="text"
                            matInput
                            [type]="isNewPasswordVisible ? 'text' : 'password'"
                            [formControl]="newPasswordFormControl"
                            data-cy="new-password-input"
                        />
                        <button
                            type="button"
                            mat-icon-button
                            matSuffix
                            (click)="isNewPasswordVisible = !isNewPasswordVisible"
                        >
                            <mat-icon>{{ isNewPasswordVisible ? 'visibility' : 'visibility_off' }}</mat-icon>
                        </button>
                    </mat-form-field>
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>Confirm Password</mat-label>
                        <input
                            type="text"
                            matInput
                            (keyup.enter)="changePassword()"
                            [type]="isConfirmPasswordVisible ? 'text' : 'password'"
                            [formControl]="confirmPasswordFormControl"
                            data-cy="confirm-password-input"
                        />
                        <button
                            type="button"
                            mat-icon-button
                            matSuffix
                            (click)="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                        >
                            <mat-icon>{{ isConfirmPasswordVisible ? 'visibility' : 'visibility_off' }}</mat-icon>
                        </button>
                    </mat-form-field>
                </form>
                <div class="error-row mat-hint" *ngIf="currentPasswordMismatch()">
                    <mat-icon color="warn" class="indicator-icon">error</mat-icon>
                    Current password does not match.
                </div>
                <div class="error-row mat-hint" *ngIf="newPasswordMismatch()">
                    <mat-icon color="warn" class="indicator-icon">error</mat-icon>
                    Passwords do not match.
                </div>
                <div class="error-row mat-hint" *ngIf="uncaughtError">
                    <mat-icon color="warn" class="indicator-icon">error</mat-icon>
                    {{ uncaughtError }}
                </div>
            </div>
            <blui-spacer></blui-spacer>
            <mat-divider style="margin-left: -48px; margin-right: -48px"></mat-divider>
            <div
                mat-dialog-actions
                style="display: flex; justify-content: space-between; margin-bottom: 0; padding: 8px 0"
            >
                <button
                    mat-stroked-button
                    mat-dialog-close
                    color="primary"
                    (click)="close.emit()"
                    style="width: 100px;"
                >
                    Close
                </button>
                <button
                    data-cy="confirm-change-password-button"
                    mat-flat-button
                    color="primary"
                    style="width: 100px;"
                    [disabled]="newPasswordMismatch()"
                    (click)="changePassword()"
                >
                    Change
                </button>
            </div>
        </div>
    `,
})
export class ChangePasswordOverlayComponent {
    newPasswordFormControl = new FormControl('');
    currentPasswordFormControl = new FormControl('');
    confirmPasswordFormControl = new FormControl('');

    isNewPasswordVisible: boolean;
    isConfirmPasswordVisible: boolean;
    isCurrentPasswordVisible: boolean;

    uncaughtError: string;

    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    constructor(private readonly _router: Router, private readonly _secretService: SecretService) {}

    newPasswordMismatch(): boolean {
        return this.newPasswordFormControl.value !== this.confirmPasswordFormControl.value;
    }

    currentPasswordMismatch(): boolean {
        return !this._secretService.matchesCurrentPassword(this.currentPasswordFormControl.value);
    }

    changePassword(): void {
        if (this.newPasswordMismatch()) {
            return;
        }
        const currentPassword = this.currentPasswordFormControl.value;
        const newPassword = this.confirmPasswordFormControl.value;
        this._secretService
            .changePassword(currentPassword, newPassword)
            .then(() => {
                this.close.emit();
                void this._router.navigate(['/']);
            })
            .catch((err) => {
                console.error(err);
                this.uncaughtError = err;
            });
    }
}
