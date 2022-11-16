import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import { AccountInfoResponse } from '@dev-ptera/nano-node-rpc';
import { TransactionService } from '@app/services/./transaction.service';
import { AccountOverview } from '@app/types/AccountOverview';
import { DatasourceService } from '@app/services/datasource.service';

const LOG_ERR = (err: any): any => {
    console.error(`ERROR: Issue fetching RPC data.  ${err}`);
    return err;
};

type UnopenedAccountResponse = {
    unopenedAccount: true;
};

@Injectable({
    providedIn: 'root',
})
/** RPC calls using the nano RPC and the @dev-ptera/nano-node-rpc client.
 *
 *  All functions in this service can have its NanoClient datasource switched without any issues.
 * */
export class RpcService {
    constructor(
        private readonly _transactionService: TransactionService,
        private readonly _datasourceService: DatasourceService,
        private readonly _util: UtilService
    ) {}

    /** Given raw, converts BAN to a decimal. */
    private async _convertRawToBan(raw: string): Promise<number> {
        // @ts-ignore
        const bananoJs = window.bananocoinBananojs;
        const balanceParts = await bananoJs.getBananoPartsFromRaw(raw);
        if (balanceParts.raw === '0') {
            delete balanceParts.raw;
        }
        return await bananoJs.getBananoPartsAsDecimal(balanceParts);
    }

    /** Returns number of confirmed transactions an account has. */
    async getAccountHeight(address: string): Promise<number> {
        const client = await this._datasourceService.getRpcNode();
        const accountInfo = await client.account_info(address).catch((err) => Promise.reject(LOG_ERR(err)));
        return Number(accountInfo.confirmation_height);
    }

    /** Returns array of receivable transactions, sorted by balance descending. */
    async getReceivable(address: string): Promise<string[]> {
        const MAX_PENDING = 100;
        const client = await this._datasourceService.getRpcNode();
        const pendingRpcData = await client.accounts_pending([address], MAX_PENDING, { sorting: true }).catch((err) => {
            LOG_ERR(err);
            return Promise.resolve({
                blocks: '',
            });
        });
        const pendingBlocks = pendingRpcData.blocks[address];
        if (!pendingBlocks) {
            return [];
        }
        const hashes = [...Object.keys(pendingBlocks)];
        return hashes;
    }

    /** Returns a modified account info object, given an index. */
    async getAccountInfo(index: number): Promise<AccountOverview> {
        const address = await this._transactionService.getAccountFromIndex(index);
        const client = await this._datasourceService.getRpcNode();
        const [pending, accountInfoRpc] = await Promise.all([
            this.getReceivable(address),
            client.account_info(address, { representative: true }).catch((err) => {
                if (err.error === 'Account not found') {
                    return Promise.resolve({
                        unopenedAccount: true,
                    } as UnopenedAccountResponse);
                }
                LOG_ERR(err);
            }),
        ]);
        const accountOverview = await this._formatAccountInfoResponse(index, address, pending, accountInfoRpc);
        return accountOverview;
    }

    /** Handles some data formatting; transforms account_info rpc data into some formatted dashboard data. */
    private async _formatAccountInfoResponse(
        index: number,
        address: string,
        pending: string[],
        rpcData: AccountInfoResponse | UnopenedAccountResponse
    ): Promise<AccountOverview> {
        // If account is not opened, return a placeholder account.
        if ((rpcData as UnopenedAccountResponse).unopenedAccount) {
            return {
                index,
                shortAddress: this._util.shortenAddress(address),
                fullAddress: address,
                formattedBalance: '0',
                balance: 0,
                representative: undefined,
                pending: pending,
            };
        }

        const accountInfo = rpcData as AccountInfoResponse;
        const balance = await this._convertRawToBan(accountInfo.balance);
        return {
            index,
            pending,
            balance: Number(balance),
            fullAddress: address,
            shortAddress: this._util.shortenAddress(address),
            formattedBalance: this._util.numberWithCommas(balance, 6),
            representative: accountInfo.representative,
        };
    }

    /** Given a hash, tells our RPC datasource to stop calculating work to process a transaction. */
    async cancelWorkGenerate(hash: string): Promise<void> {
        const client = await this._datasourceService.getRpcNode();
        // eslint-disable-next-line no-console
        console.log('Canceling server-side work generate request');
        return new Promise((resolve) => {
            // @ts-ignore
            client._send('work_cancel', { hash }).then(resolve).catch(resolve);
        });
    }
}
