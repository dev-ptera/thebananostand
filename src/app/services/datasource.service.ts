import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { NanoClient } from '@dev-ptera/nano-node-rpc';

export type Datasource = {
    // alias: 'Batman' | 'Creeper' | 'Jungle Tv' | 'Booster' | 'Kalium';
    alias: string;
    url: string;
    isAccessible?: boolean;
    isSelected: boolean;
};

@Injectable({
    providedIn: 'root',
})

/** Which datasource should we use? RPC nodes & Spyglass API. */
export class DatasourceService {
    availableSpyglassApiSources: Datasource[] = [
        {
            alias: 'Batman',
            url: 'https://api.spyglass.pw/banano',
            isAccessible: false,
            isSelected: false,
        },
        {
            alias: 'Creeper',
            url: 'https://api.creeper.banano.cc/banano',
            isAccessible: false,
            isSelected: false,
        },
    ];

    availableRpcDataSources = [
        /* { alias: 'Vault', url: 'https://vault.banano.cc/api/node-api', isAccessible: false, isSelected: false }, */ // CORS error
        /* { alias: 'Jungle TV', url: 'https://public.node.jungletv.live/rpc', isAccessible: false, isSelected: false }, */ // Can't do work_generate
        { alias: 'Booster', url: 'https://booster.dev-ptera.com/banano-rpc', isAccessible: false, isSelected: false },
        { alias: 'Kalium', url: 'https://kaliumapi.appditto.com/api', isAccessible: false, isSelected: false },
    ];

    private rpcNode: NanoClient;
    private rpcSource: Datasource;
    private readonly rpcSourceLoadedSubject = new Subject<Datasource>();

    private spyglassApiSource: Datasource;
    private readonly spyglassSourceLoadedSubject = new Subject<Datasource>();

    constructor(http: HttpClient) {
        const handleError = (err, url): void => {
            console.error(`${url} is inaccessible as a datasource, ignoring it.`);
            console.error(err);
        };

        // Ping available RPC Sources
        this.availableRpcDataSources.map((source) => {
            http.post(source.url, { action: 'block_count' })
                .toPromise()
                .then(() => {
                    source.isAccessible = true;
                    if (!this.rpcSource) {
                        // eslint-disable-next-line no-console
                        console.log(`Using ${source.alias} as RPC source.`);
                        this.setRpcSource(source);
                        this.rpcSourceLoadedSubject.next(source);
                    }
                    // DEFAULT TO KALIUM FOR NOW.
                    if (source.alias === 'Kalium') {
                        // eslint-disable-next-line no-console
                        console.log(`Using ${source.alias} as RPC source; this is the default source.`);
                        this.setRpcSource(source);
                        this.rpcSourceLoadedSubject.next(source);
                    }
                })
                .catch((err) => handleError(err, source.url));
        });

        // Ping available Spyglass API sources
        this.availableSpyglassApiSources.map((source) => {
            http.get<any>(`${source.url}/v1/representatives/online`)
                .toPromise()
                .then(() => {
                    source.isAccessible = true;
                    if (!this.spyglassApiSource) {
                        // eslint-disable-next-line no-console
                        console.log(`Using ${source.alias} as Spyglass API source.`);
                        this.setSpyglassApiSource(source);
                        this.spyglassSourceLoadedSubject.next(source);
                    }
                })
                .catch((err) => handleError(err, source.url));
        });
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
    }

    setSpyglassApiSource(source: Datasource): void {
        if (this.spyglassApiSource) {
            this.spyglassApiSource.isSelected = false;
        }
        source.isSelected = true;
        this.spyglassApiSource = source;
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
}
