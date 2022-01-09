import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
import { RepScore } from '../pages/account/dialogs/change-rep/change-rep-dialog.component';
import { UtilService } from './util.service';
import { KnownAccount } from '@app/types/KnownAccount';
import {AccountInsights} from "@app/types/AccountInsights";

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private readonly _http: HttpClient, private readonly _util: UtilService) {}

    // TODO: All RPC-supported api calls should use RPC, not spyglass-api.   Split SpyglassAPI into own service?

    getConfirmedTransactions(address: string, size: number, offset: number, filters: { includeChange?: boolean, includeReceive?: boolean, includeSend?: boolean}): Promise<ConfirmedTx[]> {
        const url = 'https://api.spyglass.pw/banano/v1/account/confirmed-transactions';
        return this._http.post<ConfirmedTx[]>(url, { address, size, offset, ...filters }).toPromise();
    }

    getBlockCount(address: string): Promise<any> {
        const url = `https://api.spyglass.pw/banano/v1/account/overview/${address}`;
        return this._http.get<void>(url).toPromise();
    }

    getAccountInsights(address: string): Promise<AccountInsights> {
        const url = `https://api.spyglass.pw/banano/v1/account/insights`;
        return this._http.post<AccountInsights>(url, { address }).toPromise();
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
}
