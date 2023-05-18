import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TransactionService} from '@app/services/transaction.service';
import {AppStateService, AppStore} from '@app/services/app-state.service';
import {ActivatedRoute} from "@angular/router";
import {FormControl} from "@angular/forms";
import {UtilService} from "@app/services/util.service";

@Component({
    selector: 'app-api-request-overlay',
    styleUrls: ['api-request.component.scss'],
    template: `
        <div class="api-request-overlay overlay-action-container">
            <div class="overlay-header">{{ requestType }} Request</div>
            <div class="overlay-body mat-body-1" >
                <mat-divider></mat-divider>
                <div style="margin-bottom: 8px">You have been requested to send:</div>
                <div style="margin-bottom: 24px">{{ amountBan }} BAN</div>
                <div style="margin-bottom: 8px">To:</div>
                <div  style="margin-bottom: 8px; word-break: break-all" [innerHTML]="util.formatHtmlAddress(recipientAddress)"></div>
                <div class="mat-body-1" style="margin-bottom: 16px;">Choose which account to send Banano from.</div>
                <mat-form-field appearance="fill">
                    <mat-label>Address</mat-label>
                    <mat-select [formControl]="senderAddress">
                        <mat-option *ngFor="let account of (state.store | async).accounts" [value]="account">
                            {{account.shortAddress}}
                        </mat-option>
                    </mat-select>
                </mat-form-field>
            </div>
        </div>
    `,
})
export class ApiRequestComponent implements OnInit {
    @Output() closeWithHash: EventEmitter<string> = new EventEmitter<string>();

    txHash: string;
    recipientAddress: string;
    isLedger: boolean;
    amountBan: number;
    requestType: 'Send' | 'Change';
    senderAddress = new FormControl('');


    constructor(
        public util: UtilService,
        private readonly _route: ActivatedRoute,
        public state: AppStateService,
        private readonly _transactionService: TransactionService
    ) {
        this._route.queryParams.subscribe((params) => {
            this.recipientAddress = params.address.toLowerCase();
            this.amountBan = params.amount;
            switch (params.request.toLowerCase()) {
                case 'send':
                    this.requestType = 'Send';
                    break;
                case 'change':
                    this.requestType = 'Change';
                    break;
                default:
                    this.closeDialog();
            }
        });
    }

    ngOnInit(): void {
    }

    closeDialog(): void {
        this.closeWithHash.emit(this.txHash);
    }

    async receiveTransaction(): Promise<void> {
    }
}
