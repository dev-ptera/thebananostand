import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import { AccountInfoResponse, NanoClient } from '@dev-ptera/nano-node-rpc';
import { LedgerService } from '@app/services/ledger.service';
import { AccountOverview } from '@app/types/AccountOverview';
import {apiToken} from "../../environments/api-token";

const MAX_PENDING = 100;
// @ts-ignore
const bananoJs = window.bananocoinBananojs;

// https://banano-api.mynano.ninja/rpc
// //https://kaliumapi.appditto.com/api
export const RPC_URL = 'https://node.dev-ptera.com/banano-rpc'

export const Node = new NanoClient({ url: RPC_URL,
requestHeaders: {
    authorization: apiToken
}});

const LOG_ERR = (err: any): any => {
    console.error(`ERROR: Issue fetching RPC data.  ${err}`);
    return err;
};

@Injectable({
    providedIn: 'root',
})
/** RPC calls using the nano RPC and the @dev-ptera/nano-node-rpc client.
 *
 *  All functions in this service can have its NanoClient datasource switched without any issues.
 * */
export class RpcService {
    constructor(private readonly _ledgerService: LedgerService, private readonly _util: UtilService) {}

    private async _convertRawToBan(raw: string): Promise<number> {
        const balanceParts = await bananoJs.getBananoPartsFromRaw(raw);
        if (balanceParts.raw === '0') {
            delete balanceParts.raw;
        }
        return await bananoJs.getBananoPartsAsDecimal(balanceParts);
    }

    /** Returns number of confirmed transactions an account has. */
    async getAccountHeight(address: string): Promise<number> {
        const accountInfo = await Node.account_info(address).catch((err) => Promise.reject(LOG_ERR(err)));
        return Number(accountInfo.confirmation_height);
    }

    /** Returns array of receivable transactions, sorted by balance descending. */
    async getReceivable(address: string): Promise<string[]> {
        const pendingRpcData = await Node.accounts_pending([address], MAX_PENDING, { sorting: true }).catch((err) =>
            Promise.reject(LOG_ERR(err))
        );
        const pendingBlocks = pendingRpcData.blocks[address];
        if (!pendingBlocks) {
            return [];
        }
        const hashes = [...Object.keys(pendingBlocks)];
        return hashes;
    }

    /** Returns a modified account info object, given an index. */
    async getAccountInfo(index: number): Promise<AccountOverview> {
        const address = await this._ledgerService.getLedgerAccount(index);
        const pending = await this.getReceivable(address);
        const accountInfoRpc = await Node.account_info(address, { representative: true }).catch((err) => {
            if (err.error === 'Account not found') {
                return Promise.resolve({
                    unopenedAccount: true,
                } as UnopenedAccountResponse);
            }
            LOG_ERR(err);
        });
        const accountOverview = await this._formatAccountInfoResponse(index, address, pending, accountInfoRpc);
        return accountOverview;
    }

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
}

type UnopenedAccountResponse = {
    unopenedAccount: true;
};
