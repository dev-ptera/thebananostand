import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TransactionService} from '@app/services/transaction.service';
import {AppStateService} from '@app/services/app-state.service';
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-api-request-overlay',
    styleUrls: ['api-request.component.scss'],
    template: `
        <div class="api-request-overlay overlay-action-container">
            <div class="overlay-header">{{ requestType }} Request </div>
            <div class="overlay-body">
                Hello, do the thing here.
            </div>
        </div>
    `,
})
export class ApiRequestComponent implements OnInit {
    @Output() closeWithHash: EventEmitter<string> = new EventEmitter<string>();

    txHash: string;
    isLedger: boolean;
    requestType: 'Send' | 'Change';


    constructor(
        private readonly _route: ActivatedRoute,
        private readonly _appStateService: AppStateService,
        private readonly _transactionService: TransactionService
    ) {
        this._route.queryParams.subscribe((params) => {
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
