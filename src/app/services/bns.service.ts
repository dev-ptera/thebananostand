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

    isBns(domain_and_tld: string): boolean {
        if (!domain_and_tld) return false;
        const domain_split = domain_and_tld.split('.');
        if (domain_split.length === 2) {
            const tld = domain_split[1];
            return this._appStateService.store.getValue().tlds[tld] !== undefined;
        }
        return false;
    }

    getDomainComponents(domain_and_tld: string): [string, string] | undefined {
        const domain_split = domain_and_tld.split('.');
        if (domain_split.length === 2) {
            const domain = domain_split[0];
            const tld = domain_split[1];
            return [domain, tld];
        }
    }
}
