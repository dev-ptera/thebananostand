import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ViewportService } from '@app/services/viewport.service';
import { Location } from '@angular/common';
import { UtilService } from '@app/services/util.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '@app/services/transaction.service';
import { AccountOverview } from '@app/types/AccountOverview';

const HEX_PATTERN = /^[a-fA-F0-9]{32}$/;
const URL_PATTERN = /^https:\/\/.+$/;

@UntilDestroy()
@Component({
    selector: 'app-sign-message-page',
    templateUrl: './sign-message.component.html',
    styleUrls: ['./sign-message.component.scss'],
})
export class SignMessageComponent {
    store: AppStore;
    transactionService: TransactionService;

    messageFormControl = new FormControl('', [
        (control: AbstractControl): ValidationErrors | null => {
            const forbidden = HEX_PATTERN.test(control.value);
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        },
    ]);
    urlFormControl = new FormControl('', [
        (control: AbstractControl): ValidationErrors | null => {
            const forbidden = URL_PATTERN.test(control.value);
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        },
    ]);
    addressFormControl = new FormControl(0);
    messageSignature = '';
    hasCopiedMessageSignature = false;
    messageFromFragment: string;
    hasMessageFromFragment = false;
    urlFromFragment: string;
    hasUrlFromFragment = false;
    submitRequested = false;
    successfulSubmit: boolean;
    submitHostname: string;
    submitResponse = '';
    responseExpand = true;
    signatureExpand = false;

    constructor(
        public vp: ViewportService,
        public util: UtilService,
        private readonly _location: Location,
        private readonly _transactionService: TransactionService,
        private readonly _appStateService: AppStateService,
        private readonly _route: ActivatedRoute,
        private readonly _http: HttpClient
    ) {
        this.transactionService = _transactionService;
        _appStateService.store.pipe(untilDestroyed(this)).subscribe((store) => {
            this.store = store;
            this._route.fragment.subscribe((fragment: string) => {
                if (fragment) {
                    const params = new URLSearchParams(fragment);
                    this.messageFromFragment = params.get('message');
                    this.urlFromFragment = params.get('url');
                    const address = params.get('address');

                    if (address) {
                        const foundAccount: AccountOverview = this.store.accounts.find(
                            (account) => account.fullAddress === address
                        );
                        if (foundAccount) {
                            this.addressFormControl.setValue(foundAccount.index);
                        }
                    }
                    if (this.messageFromFragment) {
                        this.messageFormControl.setValue(this.messageFromFragment);
                        this.messageFormControl.disable();
                        this.hasMessageFromFragment = true;
                    }
                    if (this.urlFromFragment) {
                        try {
                            const url = new URL(this.urlFromFragment);
                            this.urlFormControl.setValue(this.urlFromFragment);
                            this.urlFormControl.disable();
                            this.hasUrlFromFragment = true;
                            this.submitHostname = url.hostname;
                        } catch (error) {
                            console.log('invalid url in fragment');
                        }
                    }
                }
            });
        });
    }

    // TODO: display informative error messages in the UI in place of console.error
    async goSignMessage(): Promise<void> {
        if (this.submitRequested) {
            return;
        } // submit only once
        const message: string = this.messageFormControl.value;
        const accountIndex: number = this.addressFormControl.value;
        const submitUrl: string = this.urlFormControl.value;

        let banano_address;
        try {
            this.messageSignature = await this.transactionService.messageSign(message, accountIndex);
            const { publicAddress } = await this.transactionService.getSigningEssentials(accountIndex);
            banano_address = publicAddress;
        } catch (error) {
            console.error(error);
            this.successfulSubmit = false;
            return;
        }

        const params = {
            signature: this.messageSignature,
            banano_address: banano_address,
            message: message,
        };

        if (!URL_PATTERN.test(submitUrl)) {
            this.successfulSubmit = false;
            console.error(`error submitting data, invalid url: ${submitUrl}`);
            return;
        }
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        this.submitRequested = true;
        this._http.put(submitUrl, params, { headers: headers }).subscribe(
            (data) => {
                if (typeof data !== 'object') {
                    this.successfulSubmit = false;
                    console.error(`unexpected type for response data: ${typeof data}`);
                    return;
                }

                this.successfulSubmit = data['success'] === true;
                if (typeof data['message'] === 'string') {
                    this.submitResponse = data['message'];
                }
            },
            (error) => {
                this.successfulSubmit = false;
                console.error('error submitting data');
                console.error(error);
            }
        );
    }

    toggleResponseExpand(): void {
        this.responseExpand = !this.responseExpand;
    }

    toggleSignatureExpand(): void {
        this.signatureExpand = !this.signatureExpand;
    }

    copyMessageSignature(): void {
        this.util.clipboardCopy(this.messageSignature);
        this.hasCopiedMessageSignature = true;
        setTimeout(() => {
            this.hasCopiedMessageSignature = false;
        }, 690);
    }

    back(): void {
        this._location.back();
    }
}
