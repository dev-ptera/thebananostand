import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { SecretService } from '@app/services/secret.service';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    @Output() unlocked: EventEmitter<void> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    useCard: boolean;
    passwordVisible = false;
    hasIncorrectPassword: boolean;

    password = new FormControl('', []);
    passwordInput;

    constructor(
        private readonly _breakpointObserver: BreakpointObserver,
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _seedService: SecretService
    ) {}

    ngOnInit(): void {
        this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((state: BreakpointState) => {
            this.useCard = !state.matches;
            this._changeDetectorRef.detectChanges();
        });
    }

    ngAfterViewInit(): void {
        this.passwordInput = document.getElementById('password');
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
        this._seedService
            .unlockWallet(this.password.value)
            .then(() => {
                this.unlocked.emit();
            })
            .catch((err) => {
                console.error(err);
                this.hasIncorrectPassword = true;
                this.password.setErrors({ password: 'incorrect' });
                this.passwordInput.focus();
                this.password.markAsTouched();
            });
    }
}
