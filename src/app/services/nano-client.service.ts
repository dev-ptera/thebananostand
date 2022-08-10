import { NanoClient } from '@dev-ptera/nano-node-rpc';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})

/** NanoClientService manages the RPC data source for the app.  If one datasource is unavailable, a backup node is available.
 * Currently defaults to use the Kalium node for all RPC requests.
 * Backup is the Batman node. */
export class NanoClientService {
    private readonly booster = 'https://booster.dev-ptera.com/banano-rpc';
    private readonly kalium = 'https://kaliumapi.appditto.com/api';

    private RpcNode: NanoClient;
    private readonly activeDataSources = [];
    private readonly knownDataSources = [this.booster, this.kalium];

    constructor(http: HttpClient) {
        this.knownDataSources.map((source) => {
            http.post(source, { action: 'block_count' })
                .toPromise()
                .then(() => {
                    this.activeDataSources.push(source);

                    // Defaults to choosing Kalium as the datasource.
                    if (source === this.kalium || (source !== this.kalium && !this.RpcNode)) {
                        this.RpcNode = new NanoClient({
                            url: source,
                        });
                    }
                })
                .catch((err) => {
                    console.error(`${source} is inaccessible as a datasource, ignoring it.`);
                    console.error(err);
                });
        });
    }

    /** Returns a NanoClient that can be used to fetch or submit network data via RPC commands. */
    getRpcNode(): any {
        if (this.RpcNode) {
            return this.RpcNode;
        }
        return new NanoClient({
            url: this.knownDataSources[0],
        });
    }
}
