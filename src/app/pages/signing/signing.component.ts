import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ViewportService } from '@app/services/viewport.service';
import { Location } from '@angular/common';
import { UtilService } from '@app/services/util.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '@app/services/transaction.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { TransactionBlock } from '@app/types/TransactionBlock';

@UntilDestroy()
@Component({
    selector: 'app-signing-page',
    templateUrl: './signing.component.html',
    styleUrls: ['./signing.component.scss'],
})
export class SigningComponent {
    store: AppStore;
    transactionService: TransactionService;

    messageFormControl = new FormControl('');
    addressFormControl = new FormControl(0);

    signerFormControl = new FormControl('', [
        (control: AbstractControl): ValidationErrors | null => {
            const forbidden = !this.util.isValidAddress(control.value);
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        },
    ]);
    verifyMessageFormControl = new FormControl('');
    verifySignFormControl = new FormControl('');
    verifyButtonText = 'Verify';
    verifyButtonColor = 'primary';

    addressBlockFormControl = new FormControl(0);
    previousFormControl = new FormControl('', [
        (control: AbstractControl): ValidationErrors | null => {
            const forbidden = control.value.length !== 64 || !this.util.isValidHex(control.value);
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        },
    ]);
    representativeFormControl = new FormControl('', [
        (control: AbstractControl): ValidationErrors | null => {
            const forbidden = !this.util.isValidAddress(control.value);
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        },
    ]);
    balanceFormControl = new FormControl('', [
        (control: AbstractControl): ValidationErrors | null => {
            const forbidden = isNaN(Number(control.value));
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        },
    ]);
    linkFormControl = new FormControl('', [
        (control: AbstractControl): ValidationErrors | null => {
            const forbidden = control.value.length !== 64 || !this.util.isValidHex(control.value);
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        },
    ]);

    messageSignExpand = false;
    messageVerifyExpand = false;
    blockSignExpand = false;
    hasCopiedMessageSignature = false;
    messageSignature = '';
    blockSignature = '';
    hasCopiedBlockSignature = false;

    constructor(
        public vp: ViewportService,
        public util: UtilService,
        private readonly _location: Location,
        private readonly _transactionService: TransactionService,
        private readonly _appStateService: AppStateService,
        private readonly _route: ActivatedRoute
    ) {
        this.transactionService = _transactionService;
        _appStateService.store.pipe(untilDestroyed(this)).subscribe((store) => {
            this.store = store;
            this._route.queryParams.subscribe((params) => {
                if (params.type === 'message_sign') {
                    if (params.address) {
                        const foundAccount: AccountOverview[] = this.store.accounts.filter(
                            (account) => account.fullAddress === params.address
                        );
                        if (foundAccount[0]) {
                            this.addressFormControl.setValue(foundAccount[0].index);
                        }
                    }
                    this.messageFormControl.setValue(params.message);
                    this.messageSignExpand = true;
                } else if (params.type === 'block_sign') {
                    if (params.address) {
                        const foundAccount: AccountOverview[] = this.store.accounts.filter(
                            (account) => account.fullAddress === params.address
                        );
                        if (foundAccount[0]) {
                            this.addressFormControl.setValue(foundAccount[0].index);
                        }
                    }
                    //must be valid 32 byte hex
                    if (params.previous && params.previous.length === 64 && this.util.isValidHex(params.previous)) {
                        this.previousFormControl.setValue(params.previous);
                    }
                    //rep must be a valid banano address
                    if (params.representative && this.util.isValidAddress(params.representative)) {
                        this.representativeFormControl.setValue(params.representative);
                    }
                    //balance must be a valid number, in raw
                    if (params.balance && !isNaN(Number(params.balance))) {
                        this.balanceFormControl.setValue(params.balance);
                    }
                    //must be valid 32 byte hex
                    if (params.link && params.link.length === 64 && this.util.isValidHex(params.link)) {
                        this.linkFormControl.setValue(params.link);
                    }
                    this.blockSignExpand = true;
                }
            });
        });
    }

    async goSignMessage(): Promise<void> {
        const message: string = this.messageFormControl.value;
        const accountIndex: number = this.addressFormControl.value;
        this.messageSignature = await this.transactionService.messageSign(message, accountIndex);
    }

    copyMessageSignature(): void {
        this.util.clipboardCopy(this.messageSignature);
        this.hasCopiedMessageSignature = true;
        setTimeout(() => {
            this.hasCopiedMessageSignature = false;
        }, 690);
    }

    copyBlockSignature(): void {
        this.util.clipboardCopy(this.blockSignature);
        this.hasCopiedBlockSignature = true;
        setTimeout(() => {
            this.hasCopiedBlockSignature = false;
        }, 690);
    }

    verifySign(): void {
        const signerAddress = this.signerFormControl.value;
        if (!this.util.isValidAddress(signerAddress)) return;
        const message = this.verifyMessageFormControl.value;
        const sign = this.verifySignFormControl.value;
        if (signerAddress === '' || message === '' || sign === '') return;
        let valid: boolean;
        try {
            valid = this.transactionService.verifySign(signerAddress, message, sign);
        } catch (e) {
            valid = false;
        }
        if (valid) {
            this.verifyButtonText = 'Valid';
            this.verifyButtonColor = 'accent';
        } else {
            this.verifyButtonText = 'Invalid';
            this.verifyButtonColor = 'warn';
        }
        setTimeout(() => {
            this.verifyButtonText = 'Verify';
            this.verifyButtonColor = 'primary';
        }, 1200);
    }

    async goSignBlock(): Promise<void> {
        const accountIndex: number = this.addressBlockFormControl.value;
        const previous: string = this.previousFormControl.value;
        if (previous.length !== 64 || !this.util.isValidHex(previous)) return;
        const representative: string = this.representativeFormControl.value;
        if (!this.util.isValidAddress(representative)) return;
        const rawBalance: string = this.balanceFormControl.value;
        if (isNaN(Number(rawBalance))) return;
        const link: string = this.linkFormControl.value;
        if (link.length !== 64 || !this.util.isValidHex(link)) return;
        const block: TransactionBlock = {
            type: 'state',
            account: this.store.accounts.find((item) => item.index === accountIndex).fullAddress,
            previous,
            representative,
            balance: rawBalance,
            link,
            signature: '',
            work: undefined,
        };
        this.blockSignature = await this.transactionService.blockSign(block, accountIndex);
    }

    toggleMessageSignExpand(): void {
        this.messageSignExpand = this.messageSignExpand ? false : true;
    }

    toggleMessageVerifyExpand(): void {
        this.messageVerifyExpand = this.messageVerifyExpand ? false : true;
    }

    toggleBlockSignExpand(): void {
        this.blockSignExpand = this.blockSignExpand ? false : true;
    }

    back(): void {
        this._location.back();
    }
}
