import { ReceivableTx } from '@app/types/ReceivableTx';

export type AccountOverview = {
    index: number;
    fullAddress: string;
    shortAddress: string;
    balance: number;
    balanceRaw: string;
    formattedBalance: string;
    representative: string;
    lastUpdatedTimestamp: string;
    blockCount: number;
    pending: ReceivableTx[];
    frontier: string;
    moreOptionsOpen?: boolean;
};
