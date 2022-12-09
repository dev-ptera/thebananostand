// @ts-nocheck
import * as crypto from 'crypto';
import * as bananojs from '@bananocoin/bananojs';

const BANANO_PREFIX = bananojs.Main.BANANO_PREFIX;

type Block = bananojs.Block;

type BananoParts = bananojs.BananoParts;

const getSeed = (): string => {
    return crypto.randomBytes(32).toString('hex').toUpperCase();
};

const setUrl = (url: string) => {
    bananojs.Main.setBananodeApiUrl(url);
};

const getAccountsBalances = async (accounts: string[]): Promise<object> => {
    return bananojs.BananodeApi.getAccountsBalances(accounts);
};

const getPrivateKeyFromSeed = (seed: string, seedIx: number): string => {
    return bananojs.BananoUtil.getPrivateKey(seed, seedIx);
};

const getPublicKeyFromPrivateKey = (privateKey: string): Promise<string> => {
    return bananojs.BananoUtil.getPublicKey(privateKey);
};

const getAccountFromPublicKey = (publicKey: string): string => {
    return bananojs.BananoUtil.getAccount(publicKey, BANANO_PREFIX);
};

const getPublicKeyFromAccount = (privateKey: string): string => {
    return bananojs.BananoUtil.getAccountPublicKey(privateKey);
};

const getAccountFromSeed = async (seed: string, seedIx: number): Promise<string> => {
    const privateKey = getPrivateKeyFromSeed(seed, seedIx);
    const publicKey = await getPublicKeyFromPrivateKey(privateKey);
    const account = getAccountFromPublicKey(publicKey);
    return account;
};

const signBlock = async (privateKey: string, block: Block): Promise<string> => {
    // console.log('bananojs', bananojs);
    return bananojs.BananoUtil.sign(privateKey, block);
};

const getAmountPartsFromRaw = (amountRawStr: string): BananoParts => {
    return bananojs.BananoUtil.getAmountPartsFromRaw(amountRawStr, BANANO_PREFIX);
};

export {
    signBlock,
    getSeed,
    getPrivateKeyFromSeed,
    getPublicKeyFromPrivateKey,
    getAccountFromPublicKey,
    getPublicKeyFromAccount,
    getAccountFromSeed,
    getAmountPartsFromRaw,
    getAccountsBalances,
    setUrl,
    BANANO_PREFIX,
    type Block,
    type BananoParts,
};
