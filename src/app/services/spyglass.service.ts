import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
import { KnownAccount } from '@app/types/KnownAccount';
import { RepScore } from '@app/overlays/actions/change-rep/change-rep.component';
import { FilterOverlayData } from '@app/overlays/actions/filter/filter.component';
import { DatasourceService } from '@app/services/datasource.service';
import { PriceData } from '@app/types/PriceData';
import { ExchangeRate } from '@app/types/ExchangeRate';
import { ReceivableTx } from '@app/types/ReceivableTx';
import { lastValueFrom, take } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

/**
 * SpyglassService is a supplemental service that provides a filtered transaction history, online representatives, aliases, known accounts, & representative scores.
 *
 *  Basically any functionality that an RPC call cannot provide will be provided by this service.
 *
 *  Documentation for interacting with Spyglass API can be found here: https://spyglass-api.web.app/
 * */
export class SpyglassService {
    constructor(private readonly _http: HttpClient, private readonly _datasource: DatasourceService) {}

    async getConfirmedTransactions(
        address: string,
        size: number,
        offset: number,
        filters?: FilterOverlayData
    ): Promise<ConfirmedTx[]> {
        const source = await this._datasource.getSpyglassApiSource();
        const url = `${source.url}/v1/account/confirmed-transactions`;
        const filterAddresses =
            filters && filters.filterAddresses ? filters.filterAddresses.split(',').map((x) => x.trim()) : [];
        const req$ = this._http
            .post<ConfirmedTx[]>(url, { address, size, offset, ...filters, filterAddresses })
            .pipe(take(1));
        return await lastValueFrom(req$);
    }

    async getReceivableTransactions(address: string, size: number): Promise<ReceivableTx[]> {
        const source = await this._datasource.getSpyglassApiSource();
        const url = `${source.url}/v1/account/receivable-transactions`;
        const req$ = this._http.post<ReceivableTx[]>(url, { address, size }).pipe(take(1));
        return await lastValueFrom(req$);
    }

    async getAllKnownAccounts(): Promise<KnownAccount[]> {
        const source = await this._datasource.getSpyglassApiSource();
        const url = `${source.url}/v1/known/accounts`;
        const req$ = this._http.post<KnownAccount[]>(url, {}).pipe(take(1));
        return await lastValueFrom(req$);
    }

    async getOnlineReps(): Promise<string[]> {
        const source = await this._datasource.getSpyglassApiSource();
        const url = `${source.url}/v1/representatives/online`;
        const req$ = this._http.get<string[]>(url).pipe(take(1));
        return await lastValueFrom(req$);
    }

    async getRepresentativeScores(): Promise<RepScore[]> {
        const source = await this._datasource.getSpyglassApiSource();
        const url = `${source.url}/v1/representatives/scores`;
        const req$ = this._http.get<RepScore[]>(url).pipe(take(1));
        return await lastValueFrom(req$);
    }

    async getBananoPriceRelativeToBitcoin(): Promise<PriceData> {
        const source = await this._datasource.getSpyglassApiSource();
        const url = `${source.url}/v1/price`;
        const req$ = this._http.get<PriceData>(url).pipe(take(1));
        return await lastValueFrom(req$);
    }

    async getExchangeRates(): Promise<ExchangeRate[]> {
        const source = await this._datasource.getSpyglassApiSource();
        const url = `${source.url}/v1/price/exchange-rates`;
        const req$ = this._http.get<ExchangeRate[]>(url).pipe(take(1));
        return await lastValueFrom(req$);
    }
}
