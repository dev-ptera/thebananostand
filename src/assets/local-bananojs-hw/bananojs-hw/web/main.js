const MAX_PENDING = 10;

const ACCOUNT_INDEX = 0;

const RAND_SEED_ARRAY_LENGTH = 3;

let accountSignerArray = [];
let accountDataArray = [];
let ledgerInUse = false;
const config = window.bananocoinBananojsHw.bananoConfig;

window.onLoad = async () => {
  await synchUI();
};

window.checkLedger = async () => {
  try {
    await checkLedgerOrError();
  } catch (error) {
    console.trace(error);
  }
};

const clearAllPasswordInfo = () => {
  clearAllSeedPasswordInfo();
  clearAllMnemonicPasswordInfo();
  clearAllSeedArrayPasswordInfo();
  clearAllPrivateKeyPasswordInfo();
};

const clearAllSeedPasswordInfo = () => {
  clearNewSeedPasswordInfo();
  document.getElementById('oldSeedPassword').value = '';
};

const clearNewSeedPasswordInfo = () => {
  document.getElementById('newSeed').value = '';
  document.getElementById('newSeedPassword').value = '';
};

const clearAllMnemonicPasswordInfo = () => {
  clearNewMnemonicPasswordInfo();
  document.getElementById('oldMnemonicPassword').value = '';
};

const clearNewMnemonicPasswordInfo = () => {
  document.getElementById('newMnemonic').value = '';
  document.getElementById('newMnemonicPassword').value = '';
};

const clearAllSeedArrayPasswordInfo = () => {
  clearNewSeedArrayPasswordInfo();
  document.getElementById('oldSeedArrayPassword').value = '';
};

const clearNewSeedArrayPasswordInfo = () => {
  document.getElementById('newSeedArray').value = '';
  document.getElementById('newSeedArrayPassword').value = '';
};

const clearAllPrivateKeyPasswordInfo = () => {
  clearNewPrivateKeyPasswordInfo();
  document.getElementById('oldPrivateKeyPassword').value = '';
};

const clearNewPrivateKeyPasswordInfo = () => {
  document.getElementById('newPrivateKey').value = '';
  document.getElementById('newPrivateKeyPassword').value = '';
};

const clearAccountInfo = async () => {
  accountSignerArray = [];
  accountDataArray = [];
  document.getElementById('accountInfo').innerText = '';
  document.getElementById('withdrawAmount').value = '';
  document.getElementById('withdrawAccount').value = '';
  await synchUI();
};

const getAccountInfo = async () => {
  window.bananocoinBananojs.setBananodeApiUrl(config.bananodeUrl);
  const accountDataArrayElt = document.getElementById('accountDataArray');
  const accountInfoElt = document.getElementById('accountInfo');
  let innerText = '';
  let accountDataArrayInnerHtml = '';
  for (let accountDataIx = 0; accountDataIx < accountDataArray.length; accountDataIx++) {
    const accountData = accountDataArray[accountDataIx];
    const account = accountData.account;
    const accountSigner = accountSignerArray[accountDataIx];
    console.log('accountSigner', accountSigner);

    innerText += `${account}\n`;

    const accountInfo = await window.bananocoinBananojs.getAccountInfo(
        account,
        true,
    );
    // console.log('getAccountInfo', 'accountInfo', accountInfo);
    if (accountInfo.error !== undefined) {
      innerText += `${accountInfo.error}\n`;
      accountDataArrayInnerHtml += `<option value="${accountDataIx}">${account} (${accountInfo.error})</option>`;
    } else {
      const balanceParts = await window.bananocoinBananojs.getBananoPartsFromRaw(
          accountInfo.balance,
      );
      const balanceDescription =
        await window.bananocoinBananojs.getBananoPartsDescription(balanceParts);
      innerText += `Balance ${balanceDescription}\n`;

      if (balanceParts.raw == '0') {
        delete balanceParts.raw;
      }

      const bananoDecimal =
        await window.bananocoinBananojs.getBananoPartsAsDecimal(balanceParts);

      accountDataArrayInnerHtml += `<option value="${accountDataIx}">${account} (${bananoDecimal} BAN)</option>`;

      const withdrawAmountElt = document.getElementById('withdrawAmount');
      withdrawAmountElt.value = bananoDecimal;
      const withdrawAccountElt = document.getElementById('withdrawAccount');
      withdrawAccountElt.value = account;
    }
    // console.log('banano checkpending accountData', account);

    const pendingResponse = await window.bananocoinBananojs.getAccountsPending(
        [account],
        MAX_PENDING,
        true,
    );
    console.log('banano checkpending pendingResponse', pendingResponse);
    const pendingBlocks = pendingResponse.blocks[account];

    if (pendingBlocks !== undefined) {
      const hashes = [...Object.keys(pendingBlocks)];
      if (hashes.length !== 0) {
        const specificPendingBlockHash = hashes[0];

        innerText += '\n';
        innerText += `Receiving hash 1 of ${hashes.length}\n`;

        const bananodeApi = window.bananocoinBananojs.bananodeApi;
        let representative = await bananodeApi.getAccountRepresentative(account);
        if (!representative) {
          representative = account;
        }
        // console.log('banano checkpending config', config);

        const loggingUtil = window.bananocoinBananojs.loggingUtil;
        const depositUtil = window.bananocoinBananojs.depositUtil;

        if (ledgerInUse) {
          innerText += `CHECK LEDGER FOR BLOCK ${specificPendingBlockHash}\n`;
        } else {
          innerText += `RECEIVING BLOCK ${specificPendingBlockHash}\n`;
        }
        accountInfoElt.innerText = innerText;

        console.log('banano checkpending account', account);
        console.log('banano checkpending accountSignerArray', accountSignerArray);
        console.log('banano checkpending representative', representative);
        console.log(
            'banano checkpending specificPendingBlockHash',
            specificPendingBlockHash,
        );
        console.log('accountSigner', accountSigner);

        const receiveResponse = await depositUtil.receive(
            loggingUtil,
            bananodeApi,
            account,
            accountSigner,
            representative,
            specificPendingBlockHash,
            config.prefix,
        );

        innerText += `${receiveResponse.receiveMessage}\n`;
        innerText += `${receiveResponse.pendingMessage}\n`;
      }
    }
  }
  accountInfoElt.innerText = innerText;
  accountDataArrayElt.innerHTML = accountDataArrayInnerHtml;
  await synchUI();
};

window.checkLedgerOrError = async () => {
  clearAllPasswordInfo();
  clearAccountInfo();
  window.bananocoinBananojs.setBananodeApiUrl(config.bananodeUrl);
  const TransportWebUSB = window.TransportWebUSB;
  const isSupportedFlag = await TransportWebUSB.isSupported();
  console.log('connectLedger', 'isSupportedFlag', isSupportedFlag);
  if (isSupportedFlag) {
    const accountSigner = await window.bananocoin.bananojsHw.getLedgerAccountSigner(
        ACCOUNT_INDEX,
    );
    accountSignerArray = [accountSigner];
    accountDataArray = [{
      publicKey: accountSigner.getPublicKey(),
      account: accountSigner.getAccount(),
    }];
    ledgerInUse = true;
    clearAllPasswordInfo();
    await synchUI();
    console.log('connectLedger', 'accountDataArray', accountDataArray);
    await getAccountInfo();
  }
};

window.withdraw = async () => {
  const withdrawAccountElt = document.querySelector('#withdrawAccount');
  const withdrawAmountElt = document.querySelector('#withdrawAmount');
  const withdrawResponseElt = document.querySelector('#withdrawResponse');
  const withdrawAccount = withdrawAccountElt.value;
  const withdrawAmount = withdrawAmountElt.value;
  const bananodeApi = window.bananocoinBananojs.bananodeApi;
  const bananoUtil = window.bananocoinBananojs.bananoUtil;
  const config = window.bananocoinBananojsHw.bananoConfig;


  const accountDataArrayElt = document.getElementById('accountDataArray');
  const accountIx = accountDataArrayElt.options[accountDataArrayElt.selectedIndex].value;

  const accountSigner = accountSignerArray[accountIx];
  const accountData = accountDataArray[accountIx];
  const account = accountData.account;
  if (!confirm(`withdraw '${withdrawAmount}' BAN from  account '${account}' at index ${accountIx}?`)) {
    return;
  }

  try {
    const amountRaw =
      window.bananocoinBananojs.getBananoDecimalAmountAsRaw(withdrawAmount);
    if (ledgerInUse) {
      withdrawResponseElt.innerText = 'CHECK LEDGER FOR SEND BLOCK APPROVAL\n';
    }
    const response = await bananoUtil.sendFromPrivateKey(
        bananodeApi,
        accountSigner,
        withdrawAccount,
        amountRaw,
        config.prefix,
    );
    console.log('withdraw', 'response', response);
    withdrawResponseElt.innerText = 'Response' + JSON.stringify(response);
  } catch (error) {
    console.log('withdraw', 'error', error);
    withdrawResponseElt.innerText = 'Error:' + error.message;
  }
};

const setAccountSignerDataFromPrivateKey = async (privateKey) => {
  accountDataArray = [];
  accountSignerArray = [];
  const seedArrayIx = 0;
  const publicKey = await window.bananocoinBananojs.getPublicKey(privateKey);
  const account = window.bananocoinBananojs.getBananoAccount(publicKey);
  accountDataArray[seedArrayIx] = {
    publicKey: publicKey,
    account: account,
  };
  accountSignerArray[seedArrayIx] = privateKey;
  await getAccountInfo();
};

const setAccountSignerDataFromSeedArray = async (seedArrayStr) => {
  const seedArray = JSON.parse(seedArrayStr);
  accountDataArray = [];
  accountSignerArray = [];
  for (let seedArrayIx = 0; seedArrayIx < seedArray.length; seedArrayIx++) {
    const seed = seedArray[seedArrayIx];
    const privateKey = await window.bananocoinBananojs.getPrivateKey(seed, 0);
    const publicKey = await window.bananocoinBananojs.getPublicKey(privateKey);
    const account = window.bananocoinBananojs.getBananoAccount(publicKey);
    accountDataArray[seedArrayIx] = {
      publicKey: publicKey,
      account: account,
    };
    accountSignerArray[seedArrayIx] = privateKey;
  }
  await getAccountInfo();
};

const setAccountSignerDataFromSeed = async (seed) => {
  try {
    const privateKey = await window.bananocoinBananojs.getPrivateKey(seed, 0);
    const publicKey = await window.bananocoinBananojs.getPublicKey(privateKey);
    const account = window.bananocoinBananojs.getBananoAccount(publicKey);
    accountSignerArray = [privateKey];
    accountDataArray = [{
      publicKey: publicKey,
      account: account,
    }];
    await getAccountInfo();
  } catch (error) {
    console.trace(error);
    alert(error.message);
  }
};

const setAccountSignerDataFromMnemonic = async (mnemonic) => {
  const seed = window.bip39.mnemonicToEntropy(mnemonic);
  await setAccountSignerDataFromSeed(seed);
};

window.checkOldPrivateKey = async () => {
  clearAccountInfo();
  clearNewPrivateKeyPasswordInfo();
  const encryptedPrivateKey = window.localStorage.getItem('encryptedPrivateKey');
  if (encryptedPrivateKey == undefined) {
    alert('no PrivateKey found in local storage');
  } else {
    const oldPrivateKeyPassword = document.getElementById('oldPrivateKeyPassword').value;
    console.log('checkOldPrivateKey', 'encryptedPrivateKey', encryptedPrivateKey);
    console.log('checkOldPrivateKey', 'oldPrivateKeyPassword', oldPrivateKeyPassword);
    try {
      const unencryptedPrivateKey = await window.bananocoin.passwordUtils.decryptData(
          encryptedPrivateKey,
          oldPrivateKeyPassword,
      );
      console.log('checkOldPrivateKey', 'unencryptedPrivateKey', unencryptedPrivateKey);
      // alert(unencryptedPrivateKey);
      await setAccountSignerDataFromPrivateKey(unencryptedPrivateKey);
    } catch (error) {
      console.trace('checkOldPrivateKey', 'error', error);
      alert(error.message);
    }
  }
};

window.checkOldSeed = async () => {
  clearAccountInfo();
  clearNewSeedPasswordInfo();
  const encryptedSeed = window.localStorage.getItem('encryptedSeed');
  if (encryptedSeed == undefined) {
    alert('no seed found in local storage');
  } else {
    const oldSeedPassword = document.getElementById('oldSeedPassword').value;
    console.log('checkOldSeed', 'encryptedSeed', encryptedSeed);
    console.log('checkOldSeed', 'oldSeedPassword', oldSeedPassword);
    try {
      const unencryptedSeed = await window.bananocoin.passwordUtils.decryptData(
          encryptedSeed,
          oldSeedPassword,
      );
      console.log('checkOldSeed', 'unencryptedSeed', unencryptedSeed);
      // alert(unencryptedSeed);
      await setAccountSignerDataFromSeed(unencryptedSeed);
    } catch (error) {
      console.trace('checkOldSeed', 'error', error);
      alert(error.message);
    }
  }
};

window.clearOldSeed = async () => {
  const encryptedSeed = window.localStorage.getItem('encryptedSeed');
  if (encryptedSeed == undefined) {
    alert('no seed found in local storage');
  } else {
    if (confirm('Clear saved seed, are you sure? This is not reversible.')) {
      window.localStorage.removeItem('encryptedSeed');
    }
  }
  clearAllSeedPasswordInfo();
  clearAccountInfo();
};

window.newRandomSeed = async () => {
  const seedBytes = new Uint8Array(32);
  window.crypto.getRandomValues(seedBytes);
  const seed = window.bananocoinBananojs.bananoUtil.bytesToHex(seedBytes);
  document.getElementById('newSeed').value = seed;
};

window.newRandomPrivateKey = async () => {
  const seedBytes = new Uint8Array(32);
  window.crypto.getRandomValues(seedBytes);
  const seed = window.bananocoinBananojs.bananoUtil.bytesToHex(seedBytes);
  document.getElementById('newPrivateKey').value = seed;
};

window.checkNewPrivateKey = async () => {
  clearAccountInfo();
  const newPrivateKey = document.getElementById('newPrivateKey').value;
  const newPrivateKeyPassword = document.getElementById('newPrivateKeyPassword').value;
  console.log('checkNewPrivateKey', 'newPrivateKey', newPrivateKey);
  console.log('checkNewPrivateKey', 'newPrivateKeyPassword', newPrivateKeyPassword);
  const encryptedPrivateKey = await window.bananocoin.passwordUtils.encryptData(
      newPrivateKey,
      newPrivateKeyPassword,
  );
  window.localStorage.setItem('encryptedPrivateKey', encryptedPrivateKey);
  console.log('checkNewPrivateKey', 'encryptedPrivateKey', encryptedPrivateKey);
  console.log(
      'checkNewPrivateKey',
      'localStorage.encryptedPrivateKey',
      window.localStorage.getItem('encryptedPrivateKey'),
  );
  const unencryptedPrivateKey = await window.bananocoin.passwordUtils.decryptData(
      encryptedPrivateKey,
      newPrivateKeyPassword,
  );
  console.log('checkNewPrivateKey', 'unencryptedPrivateKey', unencryptedPrivateKey);
  // alert(unencryptedSeed);
  document.getElementById('oldPrivateKeyPassword').value = newPrivateKeyPassword;
  clearNewPrivateKeyPasswordInfo();
  await setAccountSignerDataFromPrivateKey(unencryptedPrivateKey);
};

window.checkNewSeed = async () => {
  clearAccountInfo();
  const newSeed = document.getElementById('newSeed').value;
  const newSeedPassword = document.getElementById('newSeedPassword').value;
  console.log('checkNewSeed', 'newSeed', newSeed);
  console.log('checkNewSeed', 'newSeedPassword', newSeedPassword);
  const encryptedSeed = await window.bananocoin.passwordUtils.encryptData(
      newSeed,
      newSeedPassword,
  );
  window.localStorage.setItem('encryptedSeed', encryptedSeed);
  console.log('checkNewSeed', 'encryptedSeed', encryptedSeed);
  console.log(
      'checkNewSeed',
      'localStorage.encryptedSeed',
      window.localStorage.getItem('encryptedSeed'),
  );
  const unencryptedSeed = await window.bananocoin.passwordUtils.decryptData(
      encryptedSeed,
      newSeedPassword,
  );
  console.log('checkNewSeed', 'unencryptedSeed', unencryptedSeed);
  // alert(unencryptedSeed);
  document.getElementById('oldSeedPassword').value = newSeedPassword;
  clearNewSeedPasswordInfo();
  await setAccountSignerDataFromSeed(unencryptedSeed);
};

window.checkOldMnemonic = async () => {
  clearAccountInfo();
  clearNewMnemonicPasswordInfo();
  const encryptedMnemonic = window.localStorage.getItem('encryptedMnemonic');
  if (encryptedMnemonic == undefined) {
    alert('no mnemonic found in local storage');
  } else {
    const oldMnemonicPassword = document.getElementById('oldMnemonicPassword').value;
    console.log('checkOldMnemonic', 'encryptedMnemonic', encryptedMnemonic);
    console.log('checkOldMnemonic', 'oldMnemonicPassword', oldMnemonicPassword);
    try {
      const unencryptedMnemonic = await window.bananocoin.passwordUtils.decryptData(
          encryptedMnemonic,
          oldMnemonicPassword,
      );
      console.log('checkOldMnemonic', 'unencryptedMnemonic', unencryptedMnemonic);
      // alert(unencryptedMnemonic);
      await setAccountSignerDataFromMnemonic(unencryptedMnemonic);
    } catch (error) {
      console.trace('checkOldMnemonic', 'error', error);
      alert(error.message);
    }
  }
};

window.clearOldMnemonic = async () => {
  const encryptedMnemonic = window.localStorage.getItem('encryptedMnemonic');
  if (encryptedMnemonic == undefined) {
    alert('no mnemonic found in local storage');
  } else {
    if (confirm('Clear saved mnemonic, are you sure? This is not reversible.')) {
      window.localStorage.removeItem('encryptedMnemonic');
    }
  }
  clearAllMnemonicPasswordInfo();
  clearAccountInfo();
};

window.newRandomMnemonic = async () => {
  const seedBytes = new Uint8Array(32);
  window.crypto.getRandomValues(seedBytes);
  const seed = window.bananocoinBananojs.bananoUtil.bytesToHex(seedBytes);
  const mnemonic = window.bip39.entropyToMnemonic(seed);
  document.getElementById('newMnemonic').value = mnemonic;
};

window.checkNewMnemonic = async () => {
  clearAccountInfo();
  const newMnemonic = document.getElementById('newMnemonic').value;
  const newMnemonicPassword = document.getElementById('newMnemonicPassword').value;
  console.log('checkNewMnemonic', 'newMnemonic', newMnemonic);
  console.log('checkNewMnemonic', 'newMnemonicPassword', newMnemonicPassword);
  const encryptedMnemonic = await window.bananocoin.passwordUtils.encryptData(
      newMnemonic,
      newMnemonicPassword,
  );
  window.localStorage.setItem('encryptedMnemonic', encryptedMnemonic);
  console.log('checkNewMnemonic', 'encryptedMnemonic', encryptedMnemonic);
  console.log(
      'checkNewMnemonic',
      'localStorage.encryptedMnemonic',
      window.localStorage.getItem('encryptedMnemonic'),
  );
  const unencryptedMnemonic = await window.bananocoin.passwordUtils.decryptData(
      encryptedMnemonic,
      newMnemonicPassword,
  );
  console.log('checkNewMnemonic', 'unencryptedMnemonic', unencryptedMnemonic);
  // alert(unencryptedMnemonic);
  document.getElementById('oldMnemonicPassword').value = newMnemonicPassword;
  clearNewMnemonicPasswordInfo();
  await setAccountSignerDataFromMnemonic(unencryptedMnemonic);
};

window.checkOldSeedArray = async () => {
  clearAccountInfo();
  clearNewSeedArrayPasswordInfo();
  const encryptedSeedArray = window.localStorage.getItem('encryptedSeedArray');
  if (encryptedSeedArray == undefined) {
    alert('no seed found in local storage');
  } else {
    const oldSeedArrayPassword = document.getElementById('oldSeedArrayPassword').value;
    console.log('checkOldSeedArray', 'encryptedSeedArray', encryptedSeedArray);
    console.log('checkOldSeedArray', 'oldSeedArrayPassword', oldSeedArrayPassword);
    try {
      const unencryptedSeedArray = await window.bananocoin.passwordUtils.decryptData(
          encryptedSeedArray,
          oldSeedArrayPassword,
      );
      console.log('checkOldSeedArray', 'unencryptedSeedArray', unencryptedSeedArray);
      // alert(unencryptedSeedArray);
      await setAccountSignerDataFromSeedArray(unencryptedSeedArray);
    } catch (error) {
      console.trace('checkOldSeedArray', 'error', error);
      alert(error.message);
    }
  }
};

window.clearOldSeedArray = async () => {
  const encryptedSeedArray = window.localStorage.getItem('encryptedSeedArray');
  if (encryptedSeedArray == undefined) {
    alert('no seed found in local storage');
  } else {
    if (confirm('Clear saved seed, are you sure? This is not reversible.')) {
      window.localStorage.removeItem('encryptedSeedArray');
    }
  }
  clearAllSeedArrayPasswordInfo();
  clearAccountInfo();
};

window.newRandomSeedArray = async () => {
  const seedArray = [];
  for (let ix = 0; ix < RAND_SEED_ARRAY_LENGTH; ix++) {
    const seedBytes = new Uint8Array(32);
    window.crypto.getRandomValues(seedBytes);
    const seed = window.bananocoinBananojs.bananoUtil.bytesToHex(seedBytes);
    seedArray.push(seed);
  }

  document.getElementById('newSeedArray').value = JSON.stringify(seedArray, null, 2);
};

window.checkNewSeedArray = async () => {
  clearAccountInfo();
  const newSeedArray = document.getElementById('newSeedArray').value;
  const newSeedArrayPassword = document.getElementById('newSeedArrayPassword').value;
  console.log('checkNewSeedArray', 'newSeedArray', newSeedArray);
  console.log('checkNewSeedArray', 'newSeedArrayPassword', newSeedArrayPassword);
  const encryptedSeedArray = await window.bananocoin.passwordUtils.encryptData(
      newSeedArray,
      newSeedArrayPassword,
  );
  window.localStorage.setItem('encryptedSeedArray', encryptedSeedArray);
  console.log('checkNewSeedArray', 'encryptedSeedArray', encryptedSeedArray);
  console.log(
      'checkNewSeedArray',
      'localStorage.encryptedSeedArray',
      window.localStorage.getItem('encryptedSeedArray'),
  );
  unencryptedSeedArray = await window.bananocoin.passwordUtils.decryptData(
      encryptedSeedArray,
      newSeedArrayPassword,
  );
  console.log('checkNewSeedArray', 'unencryptedSeedArray', unencryptedSeedArray);
  // alert(unencryptedSeedArray);
  document.getElementById('oldSeedArrayPassword').value = newSeedArrayPassword;
  clearNewSeedArrayPasswordInfo();
  await setAccountSignerDataFromSeedArray(unencryptedSeedArray);
};

const synchUI = async () => {
  const hide = (id) => {
    document
        .getElementById(id)
        .setAttribute('class', 'border_black display_none');
  };
  const show = (id) => {
    document.getElementById(id).setAttribute('class', 'border_black');
  };
  hide('unsupportedLedger');
  hide('unsupportedCrypto');
  hide('checkLedger');
  hide('checkOldSeed');
  hide('clearOldSeed');
  hide('checkNewSeed');
  hide('checkOldMnemonic');
  hide('clearOldMnemonic');
  hide('checkNewMnemonic');
  hide('checkOldSeedArray');
  hide('clearOldSeedArray');
  hide('checkNewSeedArray');
  hide('checkOldPrivateKey');
  hide('clearOldPrivateKey');
  hide('checkNewPrivateKey');
  hide('accountData');
  const isSupportedFlag = await window.TransportWebUSB.isSupported();
  if (isSupportedFlag) {
    show('checkLedger');
  } else {
    show('unsupportedLedger');
  }

  if (window.bananocoin.passwordUtils.enabled()) {
    const encryptedSeed = window.localStorage.getItem('encryptedSeed');
    console.log('synchUI', 'encryptedSeed', encryptedSeed);
    if (encryptedSeed == undefined) {
      show('checkNewSeed');
    } else {
      show('checkOldSeed');
      show('clearOldSeed');
    }
    const encryptedMnemonic = window.localStorage.getItem('encryptedMnemonic');
    console.log('synchUI', 'encryptedMnemonic', encryptedMnemonic);
    if (encryptedMnemonic == undefined) {
      show('checkNewMnemonic');
    } else {
      show('checkOldMnemonic');
      show('clearOldMnemonic');
    }
    const encryptedSeedArray = window.localStorage.getItem('encryptedSeedArray');
    console.log('synchUI', 'encryptedSeedArray', encryptedSeedArray);
    if (encryptedSeedArray == undefined) {
      show('checkNewSeedArray');
    } else {
      show('checkOldSeedArray');
      show('clearOldSeedArray');
    }
    const encryptedPrivateKey = window.localStorage.getItem('encryptedPrivateKey');
    console.log('synchUI', 'encryptedPrivateKey', encryptedPrivateKey);
    if (encryptedPrivateKey == undefined) {
      show('checkNewPrivateKey');
    } else {
      show('checkOldPrivateKey');
      show('clearOldPrivateKey');
    }
  } else {
    show('unsupportedCrypto');
  }

  if (accountData !== undefined) {
    show('accountData');
  }
};
