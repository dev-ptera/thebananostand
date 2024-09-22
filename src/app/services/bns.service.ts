import { Injectable } from '@angular/core';
import { AppStateService } from '@app/services/app-state.service';
import { DatasourceService } from '@app/services/datasource.service';

import type { Domain } from 'banani-bns';

type BnsifiedWindow = {
    bns: any;
} & Window;

declare let window: BnsifiedWindow;

@Injectable({
    providedIn: 'root',
})
export class BnsService {
    constructor(
        private readonly _datasourceService: DatasourceService,
        private readonly _appStateService: AppStateService
    ) {}

    async resolve(domain: string, tld: string): Promise<Domain | undefined> {
        const rpc = new window.bns.banani.RPC((await this._datasourceService.getRpcSource()).url);
        //getRpcSource
        const resolver = new window.bns.Resolver(rpc, this._appStateService.store.getValue().tlds);
        try {
            return await resolver.resolve(domain, tld);
        } catch (err) {
            console.error(err);
            return;
        }
    }
}
