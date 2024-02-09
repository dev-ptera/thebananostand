import {Injectable} from "@angular/core";
import {REFRESH_DASHBOARD_ACCOUNTS, TRANSACTION_COMPLETED_SUCCESS} from "@app/services/wallet-events.service";
import {ReceivableTx} from "@app/types/ReceivableTx";
import {TransactionService} from "@app/services/transaction.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
    providedIn: 'root',
})
export class ReceiveService {

    constructor(private readonly _transactionService: TransactionService, private readonly _snackbar: MatSnackBar) {
    }

    /** Iterates through each pending transaction block and receives them. */
    async receiveTransaction(blocks: (ReceivableTx & {accountIndex: number})[]): Promise<boolean> {

        /* Some external APIs have rate limits in place, this a dummy time padding to help avoid rate limits.
         E.g. Kalium API has a rate limit of 100 calls per minute, each receive transaction in thebanostand potentially does 6x calls, which means this wallet should enable 16 transactions per minute.
         */
        const addBulkReceivePadding = Boolean(blocks.length >= 16);
        for (let i = 0; i < blocks.length; i++) {

            const receivableBlock = blocks[i];

            try {
                // eslint-disable-next-line no-await-in-loop
                const receivedHash = await this._transactionService.receive(
                    receivableBlock.accountIndex,
                    receivableBlock
                );
                console.log("Received transaction: ", receivedHash);
                this._snackbar.open(`Received transaction #${i}`, "CLOSE");

                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, addBulkReceivePadding ? 2500 : 500));
            } catch (err) {
                console.error(err);
                return;
            }
        }
        TRANSACTION_COMPLETED_SUCCESS.next(undefined);
        REFRESH_DASHBOARD_ACCOUNTS.next();
    }
}
