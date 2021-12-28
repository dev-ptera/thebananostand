import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { ViewportService } from '../../services/viewport.service';
import { ApiService } from '../../services/api.service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { UtilService } from '../../services/util.service';
import { Router } from '@angular/router';
import { AccountOverview } from '../../services/banano.service';

export type KnownAccount = {
    address: string;
    alias: string;
};

export type ConfirmedTx = {
    address?: string;
    amount?: number;
    amountRaw?: string;
    date: string;
    hash: string;
    height: number;
    newRepresentative?: string;
    timestamp: number;
    type: string;
};

export class MyDataSource extends DataSource<ConfirmedTx | undefined> {
    _length: number;
    _address: string;
    _pageSize = 200;
    _cachedData;
    _fetchedPages: Set<number>;
    _dataStream: BehaviorSubject<(ConfirmedTx | undefined)[]>;
    _subscription: Subscription;

    constructor(
        blockCount: number,
        private readonly _apiService: ApiService,
        address: string,
        private ref: ChangeDetectorRef
    ) {
        super();
        this._address = address;
        this._length = blockCount;
        this._cachedData = new Array(blockCount);
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
        console.log('fetching page');
        void this._apiService.getConfirmedTransactions(this._address, page).then((data: ConfirmedTx[]) => {
            this._cachedData.splice(page * this._pageSize, this._pageSize, ...Array.from(data));
            this._dataStream.next(this._cachedData);
            this.ref.detectChanges();
        });
    }
}

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
    colors = Colors;
    address: string;
    blockCount: number;
    ds: MyDataSource;
    loading = false;
    overview: AccountOverview;

    constructor(
        private readonly _ref: ChangeDetectorRef,
        private readonly _router: Router,
        private readonly _viewportService: ViewportService,
        private readonly _apiService: ApiService,
        private readonly _util: UtilService,
        private readonly _accountService: AccountService
    ) {}

    ngOnInit(): void {
        this.findAccount();
        this.search();
        if (this._accountService.knownAccounts.size === 0) {
            this._accountService.fetchKnownAccounts();
        }
    }

    ngOnDestroy(): void {
        if (this.ds) {
            this.ds.disconnect();
        }
    }

    findAccount(): void {
        this.address = window.location.pathname.replace('/', '');
        this._accountService.accounts.map((account) => {
            if (this.address === account.fullAddress) {
                this.overview = account;
            }
        });

        if (this.overview === undefined) {
            void this._router.navigate(['/']);
        }
    }

    back(): void {
        void this._router.navigate(['/']);
    }

    isSmall(): boolean {
        return this._viewportService.isSmall();
    }

    search(): void {
        this.loading = true;
        if (this.ds) {
            this.ds.disconnect();
            this.ds = undefined;
        }
        void this._apiService.getBlockCount(this.address).then((data) => {
            this.blockCount = data.blockCount;
            setTimeout(() => {});
            this._ref.detectChanges();
            this.loading = false;
            this.ds = new MyDataSource(data.blockCount, this._apiService, this.address, this._ref);
        });
    }

    formatAddress(address: string): string {
        return this._accountService.knownAccounts.get(address) || this._util.shortenAddress(address);
    }

    numberWithCommas(x: number | string): string {
        if (!x && x !== 0) {
            return '';
        }
        const parts = x.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }
}
