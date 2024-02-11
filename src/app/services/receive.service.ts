import { Injectable } from '@angular/core';
import { ReceivableTx } from '@app/types/ReceivableTx';
import { TransactionService } from '@app/services/transaction.service';

@Injectable({
    providedIn: 'root',
})
export class ReceiveService {
    maxBlocks: number;
    currentBlockNumberReceiving: number;
    isStopReceive: boolean;
    receivedAmount = 0;

    constructor(private readonly _transactionService: TransactionService) {}

    stopReceive(): void {
        this.isStopReceive = true;
    }

    /** Iterates through each pending transaction block and receives them. */
    async receiveTransaction(blocks: Array<ReceivableTx & { accountIndex: number }>): Promise<boolean> {
        this.isStopReceive = false;
        this.receivedAmount = 0;

        this.maxBlocks = blocks.length;

        /* Some external APIs have rate limits in place, this a dummy time padding to help avoid rate limits.
         E.g. Kalium API has a rate limit of 100 calls per minute, each receive transaction in thebanostand potentially does 6x calls, which means this wallet should enable 16 transactions per minute.
         */
        const addBulkReceivePadding = Boolean(blocks.length >= 16);
        for (let i = 0; i < blocks.length; i++) {
            if (this.isStopReceive) {
                return;
            }

            const receivableBlock = blocks[i];
            this.currentBlockNumberReceiving = i + 1;

            try {
                // eslint-disable-next-line no-await-in-loop
                await this._transactionService.receive(receivableBlock.accountIndex, receivableBlock);
                this.receivedAmount += receivableBlock.amount;

                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, addBulkReceivePadding ? 2500 : 500));
            } catch (err) {
                console.error(err);
                return;
            }
        }
    }
}
