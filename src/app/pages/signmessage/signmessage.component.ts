import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
//import { animate, style, transition, trigger } from '@angular/animations';
import { ViewportService } from '@app/services/viewport.service';
import { Location } from '@angular/common';
import { UtilService } from '@app/services/util.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '@app/services/transaction.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { TransactionBlock } from '@app/types/TransactionBlock';

const HEX_PATTERN = /^[a-fA-F0-9]{32}$/;
const URL_PATTERN = /^https:\/\/.+$/;

@UntilDestroy()
@Component({
    selector: 'app-sign-message-page',
    templateUrl: './signmessage.component.html',
    styleUrls: ['./signmessage.component.scss'],
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
    hasMessageFromFragment: boolean = false;
    urlFromFragment: string;
    hasUrlFromFragment: boolean = false;
    successfulSubmit: boolean = false;

    constructor(
        public vp: ViewportService,
        public util: UtilService,
        private readonly _location: Location,
        private readonly _transactionService: TransactionService,
        private readonly _appStateService: AppStateService,
        private readonly _route: ActivatedRoute,
        private http: HttpClient
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

                    }
                    this.messageFormControl.setValue(params.message);
                }
            });
        });
    }

    ngOnInit() {
        this._route.fragment.subscribe((fragment: string) => {
            if (fragment) {
                const params = new URLSearchParams(fragment);
                this.messageFromFragment = params.get('message');
                this.urlFromFragment = params.get('url');

                if (this.messageFromFragment) {
                    this.messageFormControl.setValue(this.messageFromFragment);
                    this.messageFormControl.disable();
                    this.hasMessageFromFragment = true;
                }
                if (this.urlFromFragment) {
                    this.urlFormControl.setValue(this.urlFromFragment);
                    this.urlFormControl.disable();
                    this.hasUrlFromFragment = true;
                }
            }
        });
    }

    async goSignMessage(): Promise<void> {
        const message: string = this.messageFormControl.value;
        //if (HEX_PATTERN.test(message)) return;
        const accountIndex: number = this.addressFormControl.value;
        this.messageSignature = await this.transactionService.messageSign(message, accountIndex);
        let { publicAddress } = await this.transactionService._getBareEssentials(accountIndex);
        let params = new HttpParams()
            .set('signature', this.messageSignature)
            .set('banano_address', publicAddress)
            .set('message', message);

        let submitUrl = this.urlFormControl.value;

        if (URL_PATTERN.test(submitUrl)) {
            this.http.get(submitUrl, { params }).subscribe((data) => {
                this.successfulSubmit = true;
                console.log(data);
            }, (error) => {
                // TODO: display "error submitting data" message for user
                console.log("error submitting data");
            });
        } else {
            // TODO: display an "invalid url" message
        }
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
