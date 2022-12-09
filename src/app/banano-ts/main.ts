import * as index from './index';
import * as httpsRateLimit from 'https-rate-limit';

const bananodeUrl = 'https://kaliumapi.appditto.com/api';

export const commands = new Map<string, (arg0: string, arg1: string, arg2: string, arg3: string) => Promise<string>>();

commands.set('getseed', async (arg0: string, arg1: string, arg2: string, arg3: string): Promise<string> => {
    const response = index.getSeed();
    console.log('getseed response', response);
    return response;
});

commands.set('bgetprivatekey', async (arg0: string, arg1: string, arg2: string, arg3: string): Promise<string> => {
    const response = index.getPrivateKeyFromSeed(arg0, Number(arg1));
    console.log('banano getprivatekey response', response);
    return response;
});

commands.set('bgetaccount', async (arg0: string, arg1: string, arg2: string, arg3: string): Promise<string> => {
    const publicKey = await index.getPublicKeyFromPrivateKey(arg0);
    console.log('banano getaccount publicKey', publicKey);
    const account = index.getAccountFromPublicKey(publicKey);
    console.log('banano getaccount account', account);
    return account;
});

commands.set('bcheckpending', async (arg0: string, arg1: string, arg2: string, arg3: string): Promise<string> => {
    let account = arg0;
    let countStr: string = arg1;
    if (countStr == undefined) {
        countStr = '1';
    }
    const count = parseInt(countStr, 10);
    const accounts = [account];
    // https://docs.nano.org/commands/rpc-protocol/#accounts_pending
    const formData = {
        action: 'accounts_pending',
        accounts: accounts,
        count: count,
        threshold: 1,
    };
    httpsRateLimit.setUrl(bananodeUrl);
    console.log('formData', formData);
    const pending = await httpsRateLimit.sendRequest(formData);
    console.log('banano checkpending response', pending);
    return pending;
});

commands.set('breceive', async (arg0: string, arg1: string, arg2: string, arg3: string): Promise<string> => {
    const privateKey = arg0;
    const hash = arg1;
    const publicKey = await index.getPublicKeyFromPrivateKey(privateKey);
    const account = index.getAccountFromPublicKey(publicKey);

    httpsRateLimit.setUrl(bananodeUrl);
    const repReq = {
        action: 'account_representative',
        accounts: account,
    };
    const repResp = await httpsRateLimit.sendRequest(repReq);
    let representative = repResp.representative;
    if (!representative) {
        representative = account;
    }

    const historyReq = {
        action: 'account_history',
        account: account,
        count: 1,
    };
    const historyResp = await httpsRateLimit.sendRequest(historyReq);
    const historyHistory = historyResp.history;
    const pendingReq = {
        action: 'accounts_pending',
        accounts: [account],
        count: 1,
        threshold: 1,
    };
    const pendingResp = await httpsRateLimit.sendRequest(pendingReq);
    let badPendingResponse: string = '';
    if (pendingResp.blocks == undefined) {
        badPendingResponse = 'pendingResp.blocks == undefined';
    } else if (pendingResp.blocks[account] == undefined) {
        badPendingResponse = 'pendingResp.blocks[account] == undefined';
    } else if (pendingResp.blocks[account][hash] == undefined) {
        badPendingResponse = 'pendingResp.blocks[account][hash] == undefined';
    }
    if (badPendingResponse.length != 0) {
        console.log('banano breceive badPendingResponse', badPendingResponse, pendingResp);
        return '';
    }
    const pendingValueRaw = pendingResp.blocks[account][hash];

    if (historyHistory.length == 0) {
        const block: index.Block = {
            type: 'state',
            account: account,
            previous: '0000000000000000000000000000000000000000000000000000000000000000',
            representative: representative,
            balance: pendingValueRaw,
            link: hash,
            signature: '',
        };
        block.signature = await index.signBlock(privateKey, block);

        const processReq = {
            action: 'process',
            json_block: 'true',
            subtype: 'open',
            block: block,
            do_work: false,
        };

        // kalium API specific code.
        if (block.work == undefined) {
            processReq.do_work = true;
        }
        console.log('banano receive processReq', processReq);
        const processResp = await httpsRateLimit.sendRequest(processReq);
        console.log('banano receive processResp', processResp);
        return processResp;
    } else {
        const accountInfoReq = {
            action: 'account_info',
            account: account,
            count: 1,
        };
        const accountInfoResp = await httpsRateLimit.sendRequest(accountInfoReq);
        const previous = accountInfoResp.frontier;
        const accountBalanceRaw = accountInfoResp.balance;

        const valueRaw = (BigInt(pendingValueRaw) + BigInt(accountBalanceRaw)).toString();

        const block: index.Block = {
            type: 'state',
            account: account,
            previous: previous,
            representative: representative,
            balance: valueRaw,
            link: hash,
            signature: '',
        };
        block.signature = await index.signBlock(privateKey, block);

        const processReq = {
            action: 'process',
            json_block: 'true',
            subtype: 'receive',
            block: block,
            do_work: false,
        };
        if (block.work == undefined) {
            processReq.do_work = true;
        }
        console.log('banano receive processReq', processReq);
        const processResp = await httpsRateLimit.sendRequest(processReq);
        console.log('banano receive processResp', processResp);
        return processResp;
    }
});

commands.set('bsendraw', async (arg0: string, arg1: string, arg2: string, arg3: string): Promise<string> => {
    const privateKey = arg0;
    const destAccount = arg1;
    const amountRaw = arg2;

    httpsRateLimit.setUrl(bananodeUrl);

    const publicKey = await index.getPublicKeyFromPrivateKey(privateKey);
    const accountAddress = index.getAccountFromPublicKey(publicKey);
    const accountInfoReq = {
        action: 'account_info',
        account: accountAddress,
        count: 1,
        representative: true,
    };
    const accountInfoResp = await httpsRateLimit.sendRequest(accountInfoReq);
    if (accountInfoResp == undefined) {
        throw Error(`The server's account info cannot be retrieved, please try again.`);
    }
    const previous = accountInfoResp.frontier;
    const balanceRaw = accountInfoResp.balance;
    const representative = accountInfoResp.representative;

    if (balanceRaw == undefined) {
        throw Error(`The server's account balance cannot be retrieved, please try again.`);
    }

    if (BigInt(balanceRaw) < BigInt(amountRaw)) {
        const balance = index.getAmountPartsFromRaw(balanceRaw);
        const amount = index.getAmountPartsFromRaw(amountRaw);
        const balanceMajorAmount = balance.banano;
        const amountMajorAmount = amount.banano;
        throw Error(`The server's account balance of ${balanceMajorAmount} banano is too small, cannot withdraw ${amountMajorAmount} banano. In raw ${balanceRaw} < ${amountRaw}.`);
    }
    const remaining = BigInt(balanceRaw) - BigInt(amountRaw);

    const remainingDecimal = remaining.toString(10);
    const remainingPadded = remaining.toString(16).padStart(32, '0');

    const destPublicKey = index.getPublicKeyFromAccount(destAccount);

    const block: index.Block = {
        type: 'state',
        account: accountAddress,
        previous: previous,
        representative: representative,
        balance: remainingDecimal,
        link: destPublicKey,
        signature: '',
    };
    block.signature = await index.signBlock(privateKey, block);

    const processReq = {
        action: 'process',
        json_block: 'true',
        subtype: 'send',
        block: block,
        do_work: false,
    };
    if (block.work == undefined) {
        processReq.do_work = true;
    }

    console.log('banano send processReq', processReq);
    const processResp = await httpsRateLimit.sendRequest(processReq);
    console.log('banano send processResp', processResp);
    return processResp;
});

