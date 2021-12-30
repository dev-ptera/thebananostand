import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ConfirmedTx} from "@app/types/ConfirmedTx";
import { RepScore } from '../pages/account/dialogs/change-rep/change-rep-dialog.component';
import { UtilService } from './util.service';
import {BlockTx} from "@app/types/BlockTx";
import {KnownAccount} from "@app/types/KnownAccount";

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private readonly _http: HttpClient, private readonly _util: UtilService) {}

    getConfirmedTransactions(address: string, page: number): Promise<ConfirmedTx[]> {
        const url = 'https://api.spyglass.pw/banano/v1/account/confirmed-transactions';
        const pageSize = 200;
        return this._http.post<ConfirmedTx[]>(url, { address, size: pageSize, offset: page * pageSize }).toPromise();
    }

    getBlockCount(address: string): Promise<any> {
        const url = `https://api.spyglass.pw/banano/v1/account/overview/${address}`;
        return this._http.get<void>(url).toPromise();
    }

    getRepresentativeAliases(): Promise<KnownAccount[]> {
        const url = `https://api.spyglass.pw/banano/v1/representatives/aliases`;
        return this._http.get<KnownAccount[]>(url).toPromise();
    }

    getAllKnownAccounts(): Promise<KnownAccount[]> {
        const url = `https://api.spyglass.pw/banano/v1/known/accounts`;
        return this._http.post<KnownAccount[]>(url, {}).toPromise();
    }

    getOnlineReps(): Promise<string[]> {
        const url = `https://api.spyglass.pw/banano/v1/representatives/online`;
        return this._http.get<string[]>(url).toPromise();
    }

    getRepresentativeScores(): Promise<RepScore[]> {
        const url = `https://api.spyglass.pw/banano/v1/representatives/scores`;
        return this._http.get<RepScore[]>(url).toPromise();
    }

    getBlock(hash: string): Promise<ConfirmedTx> {
        const url = `https://api.spyglass.pw/banano/v1/block/${hash}`;
        return new Promise((resolve, reject) => {
            this._http
                .get<BlockTx>(url)
                .toPromise()
                .then((data) => {
                    resolve({
                        address: data.sourceAccount,
                        amount: this._util.numberWithCommas(data.amount, 6),
                        amountRaw: data.amountRaw,
                        date: new Date(data.timestamp).toLocaleDateString(),
                        hash,
                        height: data.height,
                        newRepresentative: data.contents.representative,
                        timestamp: data.timestamp,
                        type: data.type,
                    });
                })
                .catch(reject);
        });
    }
}
