export type ConfirmedTx = {
    address?: string;
    amount?: string;
    amountRaw?: string;
    date: string;
    hash: string;
    height: number;
    newRepresentative?: string;
    timestamp: number;
    type: string;
    hover: boolean;
    showCopiedIcon: boolean;
    relativeTime?: string;
};
