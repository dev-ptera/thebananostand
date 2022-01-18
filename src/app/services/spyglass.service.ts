import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
import { RepScore } from '../pages/account/dialogs/change-rep/change-rep-dialog.component';
import { UtilService } from './util.service';
import { KnownAccount } from '@app/types/KnownAccount';
import { AccountInsights } from '@app/types/AccountInsights';
import { FilterDialogData } from '@app/pages/account/dialogs/filter/filter-dialog.component';

@Injectable({
    providedIn: 'root',
})

/**
 * SpyglassService is a supplemental service that provides a filtered transaction history, online representatives, aliases, known accounts, scores, etc.
 *
 *  Basically any functionality that a RPC call cannot provide will be provided by this service.
 *
 *  Documentation for interacting with Spyglass API can be found here: https://spyglass-api.web.app/
 * */
export class SpyglassService {
    constructor(private readonly _http: HttpClient, private readonly _util: UtilService) {}

    getConfirmedTransactions(
        address: string,
        size: number,
        offset: number,
        filters?: FilterDialogData
    ): Promise<ConfirmedTx[]> {
        const url = 'https://api.spyglass.pw/banano/v1/account/confirmed-transactions';
        const filterAddresses = (filters && filters.filterAddresses) ? filters.filterAddresses.split(',').map((x) => x.trim()) : [];
        return this._http.post<ConfirmedTx[]>(url, { address, size, offset, ...filters, filterAddresses }).toPromise();
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
