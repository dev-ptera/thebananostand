import { ReceivableHash } from '@app/types/ReceivableHash';

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
    pending: ReceivableHash[];
    frontier: string;
    moreOptionsOpen?: boolean;
};
