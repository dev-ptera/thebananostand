import { ProcessBody } from '@dev-ptera/nano-node-rpc';

export type TransactionBlock = ProcessBody['block'] & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    do_work?: string;
};
