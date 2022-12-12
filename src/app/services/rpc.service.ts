import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import { AccountInfoResponse } from '@dev-ptera/nano-node-rpc';
import { AccountOverview } from '@app/types/AccountOverview';
import { DatasourceService } from '@app/services/datasource.service';
import { SignerService } from '@app/services/signer.service';
import { ReceivableHash } from '@app/types/ReceivableHash';

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
        private readonly _util: UtilService,
        private readonly _datasourceService: DatasourceService,
        private readonly _signerService: SignerService
    ) {}

    /** Returns number of confirmed transactions an account has. */
    async getAccountHeight(address: string): Promise<number> {
        const client = await this._datasourceService.getRpcClient();
        const accountInfo = await client.account_info(address).catch((err) => Promise.reject(LOG_ERR(err)));
        return Number(accountInfo.confirmation_height);
    }

    /** Returns array of receivable transactions, sorted by balance descending. */
    async getReceivable(address: string): Promise<ReceivableHash[]> {
        const MAX_PENDING = 100;
        const client = await this._datasourceService.getRpcClient();
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
        const receivables = [];
        const hashes = [...Object.keys(pendingBlocks)];
        for (const hash of hashes) {
            receivables.push({ hash, receivableRaw: pendingBlocks[hash] });
        }
        return receivables;
    }

    /** Returns a modified account info object, given an index. */
    // Make this accept a public address, yeah? // TODO
    async getAccountInfoFromIndex(index: number, address?: string): Promise<AccountOverview> {
        let publicAddress = address;
        if (!publicAddress) {
            publicAddress = await this._signerService.getAccountFromIndex(index);
        }
        const client = await this._datasourceService.getRpcClient();
        const [pending, accountInfoRpc] = await Promise.all([
            this.getReceivable(publicAddress),
            client.account_info(publicAddress, { representative: true }).catch((err) => {
                if (err.error === 'Account not found') {
                    return Promise.resolve({
                        unopenedAccount: true,
                    } as UnopenedAccountResponse);
                }
                LOG_ERR(err);
            }),
        ]);
        const accountOverview = await this._formatAccountInfoResponse(index, publicAddress, pending, accountInfoRpc);
        return accountOverview;
    }

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

    /** Handles some data formatting; transforms account_info rpc data into some formatted dashboard data. */
    private async _formatAccountInfoResponse(
        index: number,
        address: string,
        pending: ReceivableHash[],
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
                balanceRaw: '0',
                frontier: undefined,
                representative: undefined,
                pending,
            };
        }

        const accountInfo = rpcData as AccountInfoResponse;
        const balance = await this._convertRawToBan(accountInfo.balance);

        return {
            index,
            pending,
            balance: Number(balance),
            balanceRaw: accountInfo.balance,
            fullAddress: address,
            shortAddress: this._util.shortenAddress(address),
            formattedBalance: this._util.numberWithCommas(balance, 6),
            representative: accountInfo.representative,
            frontier: accountInfo.frontier,
        };
    }

    /** Given a hash, tells our RPC datasource to stop calculating work to process a transaction. */
    async cancelWorkGenerate(hash: string): Promise<void> {
        const client = await this._datasourceService.getRpcClient();
        // eslint-disable-next-line no-console
        console.log('Canceling server-side work generate request');
        return new Promise((resolve) => {
            // @ts-ignore
            client._send('work_cancel', { hash }).then(resolve).catch(resolve);
        });
    }

    async generateWork(hash: string): Promise<string> {
        const client = await this._datasourceService.getRpcClient();
        const response = await client['_send']('work_generate', { hash });
        return response.work;
    }

    async process(block: any, type: 'send' | 'receive' | 'change' | 'open'): Promise<string> {
        const client = await this._datasourceService.getRpcClient();
        const datasource = await this._datasourceService.getRpcSource();
        const processReq = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            json_block: 'true',
            subtype: type,
            block: block,
        };

        // Kalium specific.
        if (block.work === undefined && datasource.alias === 'Kalium') {
            processReq['do_work'] = true;
        }
        const response = await client['_send']('process', processReq);
        return response.hash;
    }

    /*
    async getPending(account: string): Promise<any> {
        const client = await this._datasourceService.getRpcClient();
        const response = await client.accounts_pending([account], 1);
        return response.blocks;
    } */
}
