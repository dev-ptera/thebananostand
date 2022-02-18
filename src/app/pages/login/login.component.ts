import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { SeedService } from '@app/services/seed.service';

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

    password: string;

    constructor(
        private readonly _breakpointObserver: BreakpointObserver,
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private readonly _seedService: SeedService
    ) {}

    ngOnInit(): void {
        this._breakpointObserver.observe([Breakpoints.XSmall]).subscribe((state: BreakpointState) => {
            this.useCard = !state.matches;
            this._changeDetectorRef.detectChanges();
        });
    }

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    login(): void {
        this._seedService
            .unlockWallet(this.password)
            .then(() => {
                this.unlocked.emit();
            })
            .catch((err) => {
                console.error(err);
            });
    }
}
