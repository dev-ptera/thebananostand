import { NanoClient } from '@dev-ptera/nano-node-rpc';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export let RpcNode: NanoClient;

@Injectable({
    providedIn: 'root',
})
export class NanoClientService {
    batman = 'https://node.dev-ptera.com/banano-rpc';
    kalium = 'https://kaliumapi.appditto.com/api';

    activeDatasources = [];
    knownDatasources = [this.batman, this.kalium];

    constructor(http: HttpClient) {
        this.knownDatasources.map((source) => {
            http.post(source, { action: 'block_count' })
                .toPromise()
                .then(() => {
                    this.activeDatasources.push(source);

                    // Defaults to choosing Kalium as the datasource.
                    if (source === this.kalium || (source !== this.kalium && !RpcNode)) {
                        RpcNode = new NanoClient({
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
}
