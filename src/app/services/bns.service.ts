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

    getDefaultTlds(): Record<string, `ban_${string}`> {
        return {
            mictest: 'ban_1dzpfrgi8t4byzmdeidh57p14h5jwbursf1t3ztbmeqnqqdcbpgp9x8j3cw6',
            jtv: 'ban_3gipeswotbnyemcc1dejyhy5a1zfgj35kw356dommbx4rdochiteajcsay56',
            ban: 'ban_1fdo6b4bqm6pp1w55duuqw5ebz455975o4qcp8of85fjcdw9qhuzxsd3tjb9',
        };
    }
}
