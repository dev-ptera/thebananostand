import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmedTx, KnownAccount } from '../pages/home/home.component';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private readonly _http: HttpClient) {}

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
}
