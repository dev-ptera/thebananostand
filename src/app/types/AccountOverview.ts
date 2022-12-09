export type AccountOverview = {
    index: number;
    fullAddress: string;
    shortAddress: string;
    balance: number;
    balanceRaw: string;
    formattedBalance: string;
    representative: string;
    pending: string[];
    frontier: string;
};
