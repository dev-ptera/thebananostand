import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
import { RepScore } from '../pages/account/dialogs/change-rep/change-rep-dialog.component';
import { UtilService } from './util.service';
import { KnownAccount } from '@app/types/KnownAccount';
import { FilterDialogData } from '@app/pages/account/dialogs/filter/filter-dialog.component';
import {Subject} from "rxjs";

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

    httpApi: string;
    api1 = 'https://api.spyglass.pw/banano';
    api2 = 'https://api.creeper.banano.cc/banano';
    apiToUseSubject = new Subject<string>();

    constructor(private readonly _http: HttpClient, private readonly _util: UtilService) {
        this.apiToUseSubject.subscribe((fastestApi) => {
            this.httpApi = fastestApi;
        });
        this._pingServers();
    }

    /** On app load, pings 2 separate APIs to see which one is faster.  Use that one for this session. */
    private _pingServers(): void {
        const req1 = new Promise((resolve) => {
            this._http
                .get<any>(`${this.api1}/v1/representatives/online`)
                .toPromise()
                .then(() => resolve(this.api1))
                .catch((err) => {
                    console.error('Spyglass API is inaccessible, using Creeper instead.');
                    console.error(err);
                    resolve(this.api2); // If error, resolve the opposite api.
                });
        });

        // REQ 2 not included for now; api.creeper is not returning correct timestmaps.
        Promise.race([req1])
            .then((faster: string) => {
                this.apiToUseSubject.next(faster);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /** Resolves after the API to use has been set. */
    private _hasPingedApi(): Promise<void> {
        return new Promise((resolve) => {
            if (this.httpApi) {
                resolve();
            } else {
                this.apiToUseSubject.subscribe((fastestApi) => {
                    this.httpApi = fastestApi;
                    resolve();
                });
            }
        });
    }

    async getConfirmedTransactions(
        address: string,
        size: number,
        offset: number,
        filters?: FilterDialogData
    ): Promise<ConfirmedTx[]> {
        await this._hasPingedApi();
        const url = `${this.httpApi}/v1/account/confirmed-transactions`;
        const filterAddresses =
            filters && filters.filterAddresses ? filters.filterAddresses.split(',').map((x) => x.trim()) : [];
        return this._http.post<ConfirmedTx[]>(url, { address, size, offset, ...filters, filterAddresses }).toPromise();
    }

    async getRepresentativeAliases(): Promise<KnownAccount[]> {
        await this._hasPingedApi();
        const url = `${this.httpApi}/v1/representatives/aliases`;
        return this._http.get<KnownAccount[]>(url).toPromise();
    }

    async getAllKnownAccounts(): Promise<KnownAccount[]> {
        await this._hasPingedApi();
        const url = `${this.httpApi}/v1/known/accounts`;
        return this._http.post<KnownAccount[]>(url, {}).toPromise();
    }

    async getOnlineReps(): Promise<string[]> {
        await this._hasPingedApi();
        const url = `${this.httpApi}/v1/representatives/online`;
        return this._http.get<string[]>(url).toPromise();
    }

    async getRepresentativeScores(): Promise<RepScore[]> {
        await this._hasPingedApi();
        const url = `${this.httpApi}/v1/representatives/scores`;
        return this._http.get<RepScore[]>(url).toPromise();
    }
}
