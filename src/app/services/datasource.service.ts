import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Subject, take } from 'rxjs';
import { NanoClient } from '@dev-ptera/nano-node-rpc';
import { AppStateService } from '@app/services/app-state.service';
import {
    SELECTED_RPC_DATASOURCE_CHANGE,
    SELECTED_SPYGLASS_API_DATASOURCE_CHANGE,
} from '@app/services/wallet-events.service';

export type Datasource = {
    alias: 'Batman' | 'Creeper' | 'Jungle Tv' | 'Booster' | 'Kalium' | 'Rain City' | string;
    url: string;
    isAccessible: boolean;
    isSelected: boolean;
    isAddedByUser?: boolean;
};

@Injectable({
    providedIn: 'root',
})

/** Returns which datasource we should use, for RPC nodes & Spyglass API. */
export class DatasourceService {
    availableSpyglassApiSources: Datasource[] = [
        {
            alias: 'Batman',
            url: 'https://api.spyglass.pw/banano',
            isAccessible: undefined,
            isSelected: false,
        },
        {
            alias: 'Creeper',
            url: 'https://api.creeper.banano.cc/banano',
            isAccessible: undefined,
            isSelected: false,
        },
    ];

    availableRpcDataSources: Datasource[] = [
        /* { alias: 'Vault', url: 'https://vault.banano.cc/api/node-api', isAccessible: false, isSelected: false }, */ // CORS error
        /* { alias: 'Jungle TV', url: 'https://public.node.jungletv.live/rpc', isAccessible: false, isSelected: false }, */ // Can't do work_generate
        { alias: 'Booster', url: 'https://booster.dev-ptera.com/banano-rpc', isAccessible: false, isSelected: false },
        { alias: 'Kalium', url: 'https://kaliumapi.appditto.com/api', isAccessible: false, isSelected: false },
        // { alias: 'Rain City', url: 'https://rainstorm.city/api', isAccessible: false, isSelected: false } // Nano node, but can generate work (?)
    ];

    defaultRpcDataSource: Datasource;
    customRpcDataSources: Datasource[] = [];

    defaultSpyglassSource: Datasource;
    customSpyglassSources: Datasource[] = [];

    private rpcNode: NanoClient;
    private rpcSource: Datasource;
    private readonly rpcSourceLoadedSubject = new Subject<Datasource>();

    private spyglassApiSource: Datasource;
    private readonly spyglassSourceLoadedSubject = new Subject<Datasource>();

    handleError = (err: any, url: string): void => {
        console.error(`${url} is inaccessible as a datasource, ignoring it.`);
        console.error(err);
    };

    constructor(private readonly _http: HttpClient, private readonly _state: AppStateService) {}

    init(): void {
        // eslint-disable-next-line no-console
        console.info('Datasource Service Initialized');
        const store = this._state.store.getValue();

        // Ping available RPC Sources
        store.customRpcNodeSources.map((url) => {
            this.addCustomDatasource('rpc', url, false);
        });
        [...this.availableRpcDataSources, ...this.customRpcDataSources].map((source: Datasource) => {
            this._checkRpcSourceOnline(source);
        });

        // Ping available Spyglass API sources
        store.customSpyglassApiSources.map((url) => {
            this.addCustomDatasource('spyglass', url, false);
        });
        [...this.availableSpyglassApiSources, ...this.customSpyglassSources].map((source: Datasource) => {
            this._checkSpyglassSourceOnline(source);
        });
    }

    private _isCustomSource(source: Datasource): boolean {
        return source && source.alias.includes('Custom');
    }

    setRpcSource(source: Datasource): void {
        if (this.rpcSource) {
            this.rpcSource.isSelected = false;
        }
        source.isSelected = true;
        this.rpcSource = source;
        this.rpcNode = new NanoClient({
            url: source.url,
        });
        SELECTED_RPC_DATASOURCE_CHANGE.next(this.rpcSource);
    }

    setSpyglassApiSource(source: Datasource): void {
        if (this.spyglassApiSource) {
            this.spyglassApiSource.isSelected = false;
        }
        source.isSelected = true;
        this.spyglassApiSource = source;
        SELECTED_SPYGLASS_API_DATASOURCE_CHANGE.next(this.spyglassApiSource);
    }

    async getRpcClient(): Promise<NanoClient> {
        if (this.rpcNode) {
            return Promise.resolve(this.rpcNode);
        }
        const source = await this.getRpcSource();
        return new NanoClient({
            url: source.url,
        });
    }

    /** The source is only known once one of the servers respond. */
    getSpyglassApiSource(): Promise<Datasource> {
        return new Promise((resolve) => {
            if (this.spyglassApiSource) {
                resolve(this.spyglassApiSource);
            } else {
                this.spyglassSourceLoadedSubject.subscribe((source) => {
                    resolve(source);
                });
            }
        });
    }

    /** The source is only known once one of the servers respond. */
    getRpcSource(): Promise<Datasource> {
        return new Promise((resolve) => {
            if (this.rpcSource) {
                resolve(this.rpcSource);
            } else {
                this.rpcSourceLoadedSubject.subscribe((source) => {
                    resolve(source);
                });
            }
        });
    }

    private _checkRpcSourceOnline(source: Datasource): void {
        const req$ = this._http.post(source.url, { action: 'block_count' }).pipe(take(1));
        lastValueFrom(req$)
            .then(() => {
                source.isAccessible = true;
                /** RPC Priority order:
                 *  1. Custom sources
                 *  2. Kalium (enables Boom-PoW)
                 *  3. Booster
                 */
                if (!this._isCustomSource(source)) {
                    if (!this.defaultRpcDataSource || source.alias === 'Kalium') {
                        this.defaultRpcDataSource = source; // Default needs to be one that can't be removed.
                    }
                }

                if (!this._isCustomSource(source) && this.rpcSource && this._isCustomSource(this.rpcSource)) {
                    return;
                }

                if (!this.rpcSource || source.alias === 'Kalium' || this._isCustomSource(source)) {
                    // eslint-disable-next-line no-console
                    console.log(`Using ${source.alias} as RPC source.`);
                    this.setRpcSource(source);
                    this.rpcSourceLoadedSubject.next(source);
                }
            })
            .catch((err) => {
                source.isAccessible = false;
                this.handleError(err, source.url);
            });
    }

    private _checkSpyglassSourceOnline(source: Datasource): void {
        const req$ = this._http.get<any>(`${source.url}/v1/representatives/online`).pipe(take(1));
        lastValueFrom(req$)
            .then(() => {
                source.isAccessible = true;
                /** Spyglass Priority order:
                 *  1. Custom sources
                 *  2. Batman || Creeper
                 */
                if (!this._isCustomSource(source)) {
                    this.defaultSpyglassSource = source; // Default needs to be one that can't be removed.
                }
                if (!this.spyglassApiSource || this._isCustomSource(source)) {
                    // eslint-disable-next-line no-console
                    console.log(`Using ${source.alias} as Spyglass API source.`);
                    this.setSpyglassApiSource(source);
                    this.spyglassSourceLoadedSubject.next(source);
                }
            })
            .catch((err) => {
                source.isAccessible = false;
                this.handleError(err, source.url);
            });
    }

    addCustomDatasource(type: 'spyglass' | 'rpc', customSourceUrl: string, checkIfOnline = true): void {
        const alias = `Custom node #${
            type === 'rpc' ? this.customRpcDataSources.length + 1 : this.customSpyglassSources.length + 1
        }`;
        const datasource = {
            isSelected: false,
            isAccessible: undefined,
            isAddedByUser: true,
            alias: alias,
            url: customSourceUrl,
        };
        if (type === 'spyglass') {
            this.customSpyglassSources.push(datasource);
        } else {
            this.customRpcDataSources.push(datasource);
        }

        /** When a custom datasource is added, we will set it as the selected data source. */
        if (checkIfOnline) {
            if (type === 'spyglass') {
                this._checkSpyglassSourceOnline(datasource);
            } else {
                this._checkRpcSourceOnline(datasource);
            }
        }
    }

    removeCustomRpcSource(index: number): string[] {
        this.customRpcDataSources.splice(index, 1);
        this.setRpcSource(this.defaultRpcDataSource);
        return this.customRpcDataSources.map((source) => source.url);
    }

    removeCustomSpyglassSource(index: number): string[] {
        this.customSpyglassSources.splice(index, 1);
        this.setSpyglassApiSource(this.defaultSpyglassSource);
        return this.customSpyglassSources.map((source) => source.url);
    }
}
