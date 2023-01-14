'use strict';

const bananojs = require('@bananocoin/bananojs');
const indexUtil = require('./index.js');
const bananoUtil = bananojs.bananoUtil;
const bananodeApi = bananojs.bananodeApi;
const loggingUtil = bananojs.loggingUtil;
const depositUtil = bananojs.depositUtil;

const commands = {};

commands['ledgerinfo'] = async () => {
  const info = await indexUtil.getLedgerInfo();
  console.log('ledger info', info);
};

commands['blgetaccount'] = async (index) => {
  if (index == undefined) {
    throw Error('index is a required parameter');
  }
  const config = indexUtil.getConfig();
  bananodeApi.setUrl(config.bananodeUrl);
  const accountData = await indexUtil.getLedgerAccountData(index);
  console.log('banano getaccount publicKey', accountData.publicKey);
  console.log('banano getaccount account', accountData.account);
};

commands['blcheckpending'] = async (index, count) => {
  if (index == undefined) {
    throw Error('index is a required parameter');
  }
  if (count == undefined) {
    throw Error('count is a required parameter');
  }
  const config = indexUtil.getConfig();
  bananodeApi.setUrl(config.bananodeUrl);
  const accountData = await indexUtil.getLedgerAccountData(index);
  const account = accountData.account;
  console.log('banano checkpending accountData', account);
  const pending = await bananodeApi.getAccountsPending(
      [account],
      parseInt(count),
  );
  console.log('banano checkpending response', pending);
};

commands['blreceive'] = async (index, specificPendingBlockHash) => {
  const config = indexUtil.getConfig();
  bananodeApi.setUrl(config.bananodeUrl);
  const accountSigner = await indexUtil.getLedgerAccountSigner(index);
  const account = accountSigner.getAccount();
  let representative = await bananodeApi.getAccountRepresentative(account);
  if (!representative) {
    representative = account;
  }
  try {
    const response = await depositUtil.receive(
        loggingUtil,
        bananodeApi,
        account,
        accountSigner,
        representative,
        specificPendingBlockHash,
        config.prefix,
    );
    console.log('banano receive response', response);
  } catch (error) {
    console.trace(error);
  }
};

commands['blsendraw'] = async (index, destAccount, amountRaw) => {
  const config = indexUtil.getConfig();
  bananodeApi.setUrl(config.bananodeUrl);
  const accountSigner = await indexUtil.getLedgerAccountSigner(index);
  try {
    const response = await bananoUtil.sendFromPrivateKey(
        bananodeApi,
        accountSigner,
        destAccount,
        amountRaw,
        config.prefix,
    );
    console.log('banano sendbanano response', response);
  } catch (error) {
    console.log('banano sendbanano error', error.message);
  }
};

commands['bamountraw'] = async (amount) => {
  const response = bananojs.getBananoDecimalAmountAsRaw(amount);
  console.log('bamountraw response', response);
};

commands['baccountinfo'] = async (account) => {
  const config = indexUtil.getConfig();
  bananodeApi.setUrl(config.bananodeUrl);
  const response = await bananodeApi.getAccountInfo(account, true);
  response.balanceParts = await bananoUtil.getAmountPartsFromRaw(
      response.balance,
      config.prefix,
  );
  response.balanceDescription = await bananojs.getBananoPartsDescription(
      response.balanceParts,
  );
  response.balanceDecimal = await bananojs.getBananoPartsAsDecimal(
      response.balanceParts,
  );
  console.log('banano accountinfo response', response);
};

const run = async () => {
  console.log('bananojs-hw');
  if (process.argv.length < 3) {
    console.log('#usage:');
    console.log(
        'https://github.com/BananoCoin/bananojs-hw/blob/master/docs/banano-cli.md',
    );
  } else {
    const command = process.argv[2];
    const arg0 = process.argv[3];
    const arg1 = process.argv[4];
    const arg2 = process.argv[5];
    const arg3 = process.argv[6];

    const fn = commands[command];
    if (fn == undefined) {
      console.log('unknown command', command);
    } else {
      await fn(arg0, arg1, arg2, arg3);
    }
  }
};

run();
