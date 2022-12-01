import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { SecretService } from '@app/services/secret.service';
import { FormControl } from '@angular/forms';
import { WalletEventsService } from '@app/services/wallet-events.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    isMobileView: boolean;
    passwordVisible = false;
    hasIncorrectPassword: boolean;

    password = new FormControl('', []);
    passwordInput: HTMLElement;

    incorrectPassword$: Subscription;

    constructor(
        private readonly _breakpointObserver: BreakpointObserver,
        private readonly _walletEventService: WalletEventsService
    ) {}

    ngOnInit(): void {
        this.incorrectPassword$ = this._walletEventService.passwordIncorrect.subscribe(() => {
            this.hasIncorrectPassword = true;
            this.password.setErrors({ password: 'incorrect' });
            this.passwordInput.focus();
            this.password.markAsTouched();
        });

        this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((state: BreakpointState) => {
            this.isMobileView = !state.matches;
        });
    }

    ngAfterViewInit(): void {
        this.passwordInput = document.getElementById('active-wallet-password-input');
        setTimeout(() => {
            this.passwordInput.focus();
        });
    }

    ngOnDestroy(): void {
        if (this.incorrectPassword$) {
            this.incorrectPassword$.unsubscribe();
        }
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

    enter(e: Event): void {
        e.stopImmediatePropagation();
        this.login();
    }

    login(): void {
        this._walletEventService.attemptUnlockSecretWallet.next({ password: this.password.value });
    }
}
