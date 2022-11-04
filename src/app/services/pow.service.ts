import { Injectable } from '@angular/core';

const USE_CLIENT_POW_LOCALSTORAGE_KEY = 'bananostand_useClientPow';

// @ts-ignore
const defaultBananoJsGetGeneratedWork = window.bananocoinBananojs.bananodeApi.getGeneratedWork;

// eslint-disable-next-line no-console
const log = (msg: string): void => console.log(msg);

/** Responsible for remembering use settings & executing client-side pow via webgl or cpu when requested. */
@Injectable({
    providedIn: 'root',
})
export class PowService {
    webGLAvailable: boolean;

    private useClientSidePow: boolean;

    constructor() {
        log('Pow Service Initialized');
        this._testWebGLSupport();
        // @ts-ignore
        window.bananocoinBananojs.bananodeApi.getGeneratedWork = this.getGeneratedWork.bind(this);
        this.setUseClientSidePow(window.localStorage.getItem(USE_CLIENT_POW_LOCALSTORAGE_KEY) === 'enabled');
        console.log(this.useClientSidePow);
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

    private _getDeferredPromise(): { promise: any; resolve: any; reject: any } {
        const defer = {
            promise: null,
            resolve: null,
            reject: null,
        };

        defer.promise = new Promise((resolve, reject) => {
            defer.resolve = resolve;
            defer.reject = reject;
        });

        return defer;
    }

    /** Generate PoW using WebGL */
    private _getHashWebGL(hash): Promise<string> {
        const response = this._getDeferredPromise();

        const start = Date.now();
        try {
            window['BananoWebglPow'](
                hash,
                (work, n) => {
                    log(
                        `WebGL Worker: Found work (${work}) for ${hash} after ${
                            (Date.now() - start) / 1000
                        } seconds [${n} iterations]`
                    );
                    response.resolve(work);
                },
                (n) => {}
            );
        } catch (error) {
            console.error(error);
            if (error.message === 'webgl2_required') {
            }
            response.resolve(null);
        }

        return response.promise;
    }

    /** Generate PoW using Client CPU (slow as shit) */
    private _getJsBlakeWork(hash): Promise<string> {
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
        log('The generated work override is called.');
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
        log('Performing Server-side POW');
        return defaultBananoJsGetGeneratedWork(hash);
    }
}
