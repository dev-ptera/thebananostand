import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { ConfirmedTx } from '@app/types/ConfirmedTx';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ApiService } from '@app/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { UtilService } from '@app/services/util.service';
import { debounceTime } from 'rxjs/operators';

export class MyDataSource extends DataSource<ConfirmedTx | undefined> {
    _lowestHLoadedHeight: number;
    _length: number;
    _blockCount: number;
    _address: string;
    _pageSize = 200;
    _cachedData;
    _fetchedPages: Set<number>;
    _dataStream: BehaviorSubject<(ConfirmedTx | undefined)[]>;
    _subscription: Subscription;

    constructor(
        address: string,
        length: number,
        blockCount: number,
        private readonly _apiService: ApiService,
        private readonly _ref: ChangeDetectorRef,
        private readonly _util: UtilService,
        private readonly _filters: { includeChange?: boolean; includeReceive?: boolean; includeSend?: boolean }
    ) {
        super();
        this._lowestHLoadedHeight;
        this._address = address;
        this._length = length;
        this._blockCount = blockCount;
        this._cachedData = new Array(length);
        this._fetchedPages = new Set<number>();
        this._dataStream = new BehaviorSubject<(ConfirmedTx | undefined)[]>(this._cachedData);
        this._subscription = new Subscription();
    }

    connect(collectionViewer: CollectionViewer): Observable<(ConfirmedTx | undefined)[]> {
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
        if (this._fetchedPages.has(page)) {
            return;
        }
        this._fetchedPages.add(page);
        console.info(`INFO: Fetching page #${page}`);

        // TODO make this readable.
        const offset =
            this._filters.includeChange && this._filters.includeReceive && this._filters.includeSend
                ? page * this._pageSize
                : this._lowestHLoadedHeight
                ? this._blockCount - (this._lowestHLoadedHeight - 1)
                : 0;

        void this._apiService
            .getConfirmedTransactions(this._address, this._pageSize, offset, this._filters)
            .then((data: ConfirmedTx[]) => {
                data.map((tx) => {
                    if (!this._lowestHLoadedHeight) {
                        this._lowestHLoadedHeight = tx.height;
                    }
                    tx.amount = this._util.numberWithCommas(tx.amount, 6);
                    this._lowestHLoadedHeight = Math.min(this._lowestHLoadedHeight, tx.height);
                });
                this._cachedData.splice(page * this._pageSize, this._pageSize, ...Array.from(data));
                this._dataStream.next(this._cachedData);
                this._ref.detectChanges();
            });
    }
}
