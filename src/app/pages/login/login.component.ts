import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { FormControl } from '@angular/forms';
import {
    ATTEMPT_UNLOCK_WALLET_WITH_PASSWORD,
    PROVIDED_INCORRECT_PASSWORD,
    WalletEventsService,
} from '@app/services/wallet-events.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit {
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    isMobileView: boolean;
    passwordVisible = false;
    hasIncorrectPassword = false;

    password = new FormControl('', []);
    passwordInput: HTMLElement;

    constructor(
        private readonly _breakpointObserver: BreakpointObserver,
        private readonly _walletEventService: WalletEventsService
    ) {
        PROVIDED_INCORRECT_PASSWORD.pipe(untilDestroyed(this)).subscribe(() => {
            this.hasIncorrectPassword = true;
            this.password.setErrors({ password: 'incorrect' });
            this.passwordInput.focus();
            this.password.markAsTouched();
        });

        this._breakpointObserver
            .observe([Breakpoints.XSmall])
            .pipe(untilDestroyed(this))
            .subscribe((state: BreakpointState) => {
                this.isMobileView = !state.matches;
            });
    }

    ngAfterViewInit(): void {
        this.passwordInput = document.getElementById('active-wallet-password-input');
        setTimeout(() => {
            this.passwordInput.focus();
        });
    }

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    getErrorMessage(): string {
        if (this.hasIncorrectPassword) {
            return 'Incorrect password';
        }
        return undefined;
    }

    pressEnterKey(e: Event): void {
        e.stopImmediatePropagation();
        this.login();
    }

    login(): void {
        ATTEMPT_UNLOCK_WALLET_WITH_PASSWORD.next({ password: this.password.value });
    }
}
