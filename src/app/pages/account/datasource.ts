/* eslint-disable @typescript-eslint/naming-convention */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SpyglassService } from '@app/services/spyglass.service';
import { ChangeDetectorRef } from '@angular/core';
import { UtilService } from '@app/services/util.service';
import { debounceTime } from 'rxjs/operators';
import { FilterOverlayData } from '@app/overlays/actions/filter/filter.component';
import { ReceivableTx } from '@app/types/ReceivableTx';

export class ConfirmedTxDataSource extends DataSource<ConfirmedTx | undefined> {
    _blockCount: number;
    _address: string;
    _pageSize = 200; // Update this to test out pagination, incremental loading.
    _cachedData: Array<ConfirmedTx | undefined>;
    _fetchedPages: Set<number>;
    _dataStream: BehaviorSubject<Array<ConfirmedTx | undefined>>;
    _subscription: Subscription;
    _lowestLoadedHeight: number;

    reachedLastPage: boolean;
    firstPageLoaded = false;
    filteredTransactions: ConfirmedTx[] = [];

    constructor(
        address: string,
        blockCount: number,
        private readonly _apiService: SpyglassService,
        private readonly _ref: ChangeDetectorRef,
        private readonly _util: UtilService,
        private readonly _filters: FilterOverlayData,
        private readonly _isFilterApplied: boolean
    ) {
        super();
        this._address = address;
        this._blockCount = blockCount;
        this._lowestLoadedHeight = undefined;
        this._cachedData = new Array(blockCount);
        this._fetchedPages = new Set<number>();
        this._dataStream = new BehaviorSubject<Array<ConfirmedTx | undefined>>(this._cachedData);
        this._subscription = new Subscription();
        this._fetchedPages.clear();
        this._fetchPage(0);
    }

    connect(collectionViewer: CollectionViewer): Observable<Array<ConfirmedTx | undefined>> {
        this._subscription.add(
            collectionViewer.viewChange.pipe(debounceTime(100)).subscribe((range) => {
                const startPage = this._getPageForIndex(range.start);
                const endPage = this._getPageForIndex(range.end - 1);
                for (let i = startPage; i <= endPage; i++) {
                    this._fetchPage(i);
                }
            })
        );
        return this._dataStream;
    }

    disconnect(): void {
        this._subscription.unsubscribe();
    }

    private _getPageForIndex(index: number): number {
        return Math.floor(index / this._pageSize);
    }

    private _fetchPage(page: number): void {
        const bufferEl = 20;
        if (this._fetchedPages.has(page)) {
            return;
        }

        //        console.info(`INFO: Fetching page #${page}`);
        this._fetchedPages.add(page);
        const offset = this._isFilterApplied
            ? this._lowestLoadedHeight
                ? this._blockCount - (this._lowestLoadedHeight - 1)
                : 0
            : page * this._pageSize;

        // const offset = page * this._pageSize;
        void this._apiService
            .getConfirmedTransactions(this._address, this._pageSize, offset, this._filters)
            .then((data: ConfirmedTx[]) => {
                this.firstPageLoaded = true;
                data.map((tx) => {
                    tx.amount = this._util.numberWithCommas(tx.amount, 6);
                    this._lowestLoadedHeight = tx.height;
                    if (this._isFilterApplied) {
                        this.filteredTransactions.push(tx);
                    }
                });

                // TODO: Remove the double mem requirement; do not need filterTransactions to be saved in a separate array.
                if (this._isFilterApplied) {
                    this._cachedData = [];
                    this._cachedData.push(...this.filteredTransactions);
                    this.reachedLastPage = data.length !== this._pageSize;
                    if (!this.reachedLastPage) {
                        this._cachedData.push(...new Array(bufferEl));
                    }
                } else {
                    this._cachedData.splice(page * this._pageSize, this._pageSize, ...Array.from(data));
                }
                this._dataStream.next(this._cachedData);
                this._ref.detectChanges();
            });
    }
}

export class ReceivableTxDataSource extends DataSource<ReceivableTx | undefined> {
    _address: string;
    _maxSize = 500; // Update this to test out pagination, incremental loading.
    _cachedData: Array<ReceivableTx | undefined>;
    _dataStream: BehaviorSubject<Array<ReceivableTx | undefined>>;
    _subscription: Subscription;

    reachedLastPage: boolean;
    firstPageLoaded = false;
    filteredTransactions: ReceivableTx[] = [];

    constructor(
        address: string,
        private readonly _apiService: SpyglassService,
        private readonly _ref: ChangeDetectorRef,
        private readonly _util: UtilService
    ) {
        super();
        this._address = address;
        this._cachedData = [];
        this._dataStream = new BehaviorSubject<Array<ReceivableTx | undefined>>(this._cachedData);
        this._subscription = new Subscription();
        this._fetchPageRecursive(0);
    }

    connect(collectionViewer: CollectionViewer): Observable<Array<ReceivableTx | undefined>> {
        this._subscription.add(
            collectionViewer.viewChange.pipe(debounceTime(100)).subscribe(() => {
                this._cachedData = [];
                this._fetchPageRecursive(0);
            })
        );
        return this._dataStream;
    }

    disconnect(): void {
        this._subscription.unsubscribe();
    }

    private _fetchPageRecursive(offset: number): void {
        void this._apiService
            .getReceivableTransactions(this._address, this._maxSize, offset)
            .then((receivables: ReceivableTx[]) => {
                this.firstPageLoaded = true;
                //can this be condensed into one statement? sorry, I don't know angular
                const cachedData = [...this._cachedData];
                cachedData.push(...receivables);
                //includes case where receivables.length === 0
                if (receivables.length < 500) {
                    this._dataStream.next(cachedData);
                    this._cachedData = cachedData;
                    return void this._ref.detectChanges();
                }
                void this._fetchPageRecursive(offset + this._maxSize);
            });
    }
}
