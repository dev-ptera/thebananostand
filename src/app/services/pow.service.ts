import { Injectable } from '@angular/core';
import { DatasourceService } from '@app/services/datasource.service';

const USE_CLIENT_POW_LOCALSTORAGE_KEY = 'bananostand_useClientPow';

// eslint-disable-next-line no-console
const log = (msg: string): void => console.log(msg);

/** Responsible for remembering use settings & executing client-side pow via webgl or cpu when requested. */
@Injectable({
    providedIn: 'root',
})
export class PowService {
    webGLAvailable: boolean;
    defaultBananoJsGetGeneratedWork: any;

    private useClientSidePow: boolean;

    constructor(private readonly _datasourceService: DatasourceService) {}

    /** This will use client-side pow if the user has asked to use it, otherwise defaults to server-side pow (original implementation) */
    overrideDefaultBananoJSPowSource(): void {
        // @ts-ignore
        try {
            this._testWebGLSupport();
            // @ts-ignore
            this.defaultBananoJsGetGeneratedWork = window.bananocoinBananojs.bananodeApi.getGeneratedWork;
            // @ts-ignore
            window.bananocoinBananojs.bananodeApi.getGeneratedWork = this.getGeneratedWork.bind(this);
            const localStorageValue = window.localStorage.getItem(USE_CLIENT_POW_LOCALSTORAGE_KEY);
            this.setUseClientSidePow(localStorageValue === 'enabled');

            /*  If this is the first time using Bananostand & your browser supports WebGL,
                it's probably faster than server-side rendered pow. */
            const isFirstTimeUsingApp = Boolean(!localStorageValue);
            if (isFirstTimeUsingApp && this.webGLAvailable) {
                this.setUseClientSidePow(true);
            }

            log('Pow Service Initialized');
        } catch (err) {
            console.error(err);
        }
    }

    getUseClientSidePow(): boolean {
        return this.useClientSidePow;
    }

    setUseClientSidePow(useClient: boolean): void {
        window.localStorage.setItem(USE_CLIENT_POW_LOCALSTORAGE_KEY, useClient ? 'enabled' : 'disabled');
        this.useClientSidePow = useClient;
    }

    private _testWebGLSupport(): void {
        try {
            const canvas = document.createElement('canvas');
            const webGL =
                !!window['WebGLRenderingContext'] &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            this.webGLAvailable = !!webGL;
        } catch (e) {
            this.webGLAvailable = false;
        }
    }

    /** Generate PoW using WebGL */
    private _getHashWebGL(hash): Promise<string> {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            try {
                window['BananoWebglPow'](hash, (work, n) => {
                    log(
                        `WebGL Worker: Found work (${work}) for ${hash} after ${
                            (Date.now() - start) / 1000
                        } seconds [${n} iterations]`
                    );
                    resolve(work);
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    /** Generate PoW using Client CPU (slow as shit) */
    private _getJsBlakeWork(hash): string {
        const start = new Date().getTime();
        // @ts-ignore
        const workBytes = window.bananocoinBananojs.getZeroedWorkBytes();
        // @ts-ignore
        const work = window.bananocoinBananojs.getWorkUsingCpu(hash, workBytes);
        const end = new Date().getTime();
        const time = end - start;
        log(`Client POW generation time was ${time / 1000} seconds.`);
        return work;
    }

    /** This function is invoked by BananoJs when attempting to provide work for transactions. */
    async getGeneratedWork(hash: string): Promise<string> {
        /** Client side POW */
        if (this.useClientSidePow) {
            log('Performing Client-side POW');
            if (this.webGLAvailable) {
                try {
                    return await this._getHashWebGL(hash);
                } catch (err) {
                    console.error(err);
                    return this._getJsBlakeWork(hash);
                }
            } else {
                return this._getJsBlakeWork(hash);
            }
        }

        /** Server side POW */
        const rpc = await this._datasourceService.getRpcSource();
        log(`Performing Server-side POW, using ${rpc.alias} node.`);
        return new Promise((resolve, reject) => {
            this.defaultBananoJsGetGeneratedWork(hash)
                .then((work) => {
                    work ? resolve(work) : reject(new Error(`${rpc.alias} node did not generate work.`));
                })
                .catch((err) => {
                    console.error(err);
                    reject(new Error(`${rpc.alias} node ran into an unknown error processing work.`));
                });
        });
    }
}
