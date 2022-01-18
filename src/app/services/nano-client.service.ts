import { NanoClient } from '@dev-ptera/nano-node-rpc';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class NanoClientService {
    private batman = 'https://node.dev-ptera.com/banano-rpc';
    private kalium = 'https://kaliumapi.appditto.com/api';

    private RpcNode: NanoClient;
    private activeDatasources = [];
    private knownDatasources = [this.batman, this.kalium];

    constructor(http: HttpClient) {
        this.knownDatasources.map((source) => {
            http.post(source, { action: 'block_count' })
                .toPromise()
                .then(() => {
                    this.activeDatasources.push(source);

                    // Defaults to choosing Kalium as the datasource.
                    if (source === this.kalium || (source !== this.kalium && !this.RpcNode)) {
                        this.RpcNode = new NanoClient({
                            url: source,
                            requestHeaders: {
                                authorization: environment.token,
                            },
                        });
                    }
                })
                .catch((err) => {
                    console.error(`${source} is inaccessible as a datasource, ignoring it.`);
                    console.error(err);
                });
        });
    }

    getRpcNode(): any {
        if (this.RpcNode) {
            return this.RpcNode;
        }
        return new NanoClient({
            url: this.knownDatasources[0],
            requestHeaders: {
                authorization: environment.token,
            },
        });
    }
}
