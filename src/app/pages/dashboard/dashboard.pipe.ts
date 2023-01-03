import { Pipe, PipeTransform } from '@angular/core';
import { AccountOverview } from '@app/types/AccountOverview';

@Pipe({
    name: 'sort',
    pure: true,
})
export class DashboardPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform(accounts: AccountOverview[], sortDirection: 'asc' | 'desc' | 'none', size: number): AccountOverview[] {
        const clonedArray = accounts.map((a) => ({ ...a }));
        return clonedArray.sort((a, b) => {
            if (sortDirection === 'none') {
                return a.index > b.index ? 1 : -1;
            }
            if (!a.representative || !b.representative) {
                return 1;
            }

            if (sortDirection === 'asc') {
                return a.balance < b.balance ? -1 : 1;
            }
            return a.balance < b.balance ? 1 : -1;
        });
    }
}
