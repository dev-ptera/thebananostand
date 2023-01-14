'use strict';

// STARTED TOP nodejs/browser hack
(function() {
  // FINISHED TOP nodejs/browser hack

  const bananojs = require('@bananocoin/bananojs');
  const index = bananojs;
  const bananodeApi = bananojs.bananodeApi;
  const BananoHwApp = require('hw-app-nano').Banano;
  const transportNodeHid = require('@ledgerhq/hw-transport-node-hid');

  const bananoConfig = {};
  bananoConfig.walletPrefix = `44'/198'/`;
  bananoConfig.prefix = index.BANANO_PREFIX;
  bananoConfig.bananodeUrl = 'https://kaliumapi.appditto.com/api';

  let config = bananoConfig;

  const setConfig = (_config) => {
    config = _config;
  };

  const getConfig = () => {
    return config;
  };

  const getLedgerPath = (accountIndex) => {
    return `${config.walletPrefix}${accountIndex}'`;
  };

  const getLedgerInfo = async () => {
    const paths = await transportNodeHid.default.list();
    const retval = {};
    retval.pathCount = paths.length;
    retval.found = retval.pathCount > 0;
    if (retval.found) {
      const path = paths[0];
      const transport = await transportNodeHid.default.open(path);
      try {
        retval.supported = await transportNodeHid.default.isSupported();
        if (retval.supported) {
          const banHwAppInst = new BananoHwApp(transport);
          try {
            retval.config = await banHwAppInst.getAppConfiguration();
          } catch (error) {
            retval.error = error.message;
          }
        }
      } finally {
        await transport.close();
      }
    }
    return retval;
  };

  const getLedgerAccountData = async (index) => {
    // https://github.com/BananoCoin/bananovault/blob/master/src/app/services/ledger.service.ts#L128
    try {
      const paths = await transportNodeHid.default.list();
      const path = paths[0];
      const transport = await transportNodeHid.default.open(path);
      try {
        const banHwAppInst = new BananoHwApp(transport);
        const accountData = await banHwAppInst.getAddress(getLedgerPath(index));
        accountData.account = accountData.address;
        delete accountData.address;
        return accountData;
      } finally {
        await transport.close();
      }
    } catch (error) {
      console.trace('banano getaccount error', error);
    }
  };

  const getLedgerAccountSigner = async (accountIx) => {
    /* istanbul ignore if */
    if (config === undefined) {
      throw Error('config is a required parameter.');
    }
    /* istanbul ignore if */
    if (accountIx === undefined) {
      throw Error('accountIx is a required parameter.');
    }
    // https://github.com/BananoCoin/bananovault/blob/master/src/app/services/ledger.service.ts#L379
    const paths = await transportNodeHid.default.list();
    const path = paths[0];
    const transport = await transportNodeHid.default.open(path);
    let accountData;
    try {
      const banHwAppInst = new BananoHwApp(transport);
      const ledgerPath = getLedgerPath(accountIx);
      accountData = await banHwAppInst.getAddress(ledgerPath);
    } finally {
      transport.close();
    }
    const signer = {};
    signer.getPublicKey = () => {
      return accountData.publicKey;
    };
    signer.getAccount = () => {
      return accountData.address;
    };
    signer.signBlock = async (blockData) => {
      const transport = await transportNodeHid.default.open(path);
      try {
        const banHwAppInst = new BananoHwApp(transport);
        const ledgerPath = getLedgerPath(accountIx);

        // console.log('signer.signBlock', 'blockData', blockData);
        const hwBlockData = {};
        if (
          blockData.previous ==
          '0000000000000000000000000000000000000000000000000000000000000000'
        ) {
          hwBlockData.representative = blockData.representative;
          hwBlockData.balance = blockData.balance;
          hwBlockData.sourceBlock = blockData.link;
        } else {
          hwBlockData.previousBlock = blockData.previous;
          hwBlockData.representative = blockData.representative;
          hwBlockData.balance = blockData.balance;
          hwBlockData.recipient = index.getBananoAccount(blockData.link);

          const cacheBlockData = {};
          const cacheBlocks = await bananodeApi.getBlocks(
              [blockData.previous],
              true,
          );
          // console.log('signer.signBlock', 'cacheBlocks', cacheBlocks);
          const cacheBlock = cacheBlocks.blocks[blockData.previous];
          // console.log('signer.signBlock', 'cacheBlock', cacheBlock);
          cacheBlockData.previousBlock = cacheBlock.previous;
          cacheBlockData.representative = cacheBlock.representative;
          cacheBlockData.balance = cacheBlock.balance;
          cacheBlockData.recipient = index.getBananoAccount(cacheBlock.link);
          // console.log('signer.signBlock', 'cacheBlockData', cacheBlockData);
          try {
            // const cacheResponse =
            await banHwAppInst.cacheBlock(
                ledgerPath,
                cacheBlockData,
                cacheBlock.signature,
            );
            // console.log('signer.signBlock', 'cacheResponse', cacheResponse);
          } catch (error) {
            console.log('signer.signBlock', 'error', error.message);
            console.trace(error);
          }
        }

        // console.log('signer.signBlock', 'hwBlockData', hwBlockData);
        return await banHwAppInst.signBlock(ledgerPath, hwBlockData);
      } finally {
        transport.close();
      }
    };
    return signer;
  };

  // STARTED BOTTOM nodejs/browser hack
  const exports = (() => {
    // istanbul ignore if
    if (typeof BigInt === 'undefined') {
      return;
    }
    const exports = {};
    exports.bananoConfig = bananoConfig;
    exports.bananojs = bananojs;
    exports.getLedgerInfo = getLedgerInfo;
    exports.setConfig = setConfig;
    exports.getConfig = getConfig;
    exports.getLedgerPath = getLedgerPath;
    exports.getLedgerAccountData = getLedgerAccountData;
    exports.getLedgerAccountSigner = getLedgerAccountSigner;

    return exports;
  })();

  // istanbul ignore else
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = exports;
  } else {
    window.bananocoinBananojsHw = exports;
  }
})();
// FINISHED BOTTOM nodejs/browser hack
