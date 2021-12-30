export type BlockTx = {
    amount: number;
    amountRaw: string;
    balance: string;
    blockAccount: string;
    confirmed: boolean;
    link: string;
    linkAsAccount: string;
    previous: string;
    contents: {
        representative: string;
    };
    signature: string;
    type: string;
    work: string;
    height: number;
    sourceAccount: string;
    subtype: string;
    timestamp: number;
};
