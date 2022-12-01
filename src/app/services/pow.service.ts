import { Injectable } from '@angular/core';
import { DatasourceService } from '@app/services/datasource.service';
import { RpcService } from '@app/services/rpc.service';

// eslint-disable-next-line no-console
const log = (msg: string): void => console.log(msg);

/** Responsible for remembering use settings & executing client-side pow via webgl or cpu when requested. */
@Injectable({
    providedIn: 'root',
})
export class PowService {
    isWebGLAvailable: boolean;
    defaultBananoJsGetGeneratedWork: any;

    private useClientSidePow: boolean;

    constructor(private readonly _datasourceService: DatasourceService, private readonly _rpcService: RpcService) {}

    /** This will use client-side pow if the user has asked to use it, otherwise defaults to server-side pow (original implementation) */
    overrideDefaultBananoJSPowSource(): void {
        // @ts-ignore
        try {
            this._testWebGLSupport();
            // @ts-ignore
            window.bananocoinBananojs.hashWorkMap = new Map<string, string>();
            // @ts-ignore
            this.defaultBananoJsGetGeneratedWork = window.bananocoinBananojs.bananodeApi.getGeneratedWork;
            // @ts-ignore
            // window.bananocoinBananojs.bananodeApi.getGeneratedWork = this.getGeneratedWork.bind(this);

            /* If we have webgl available, default to using that. */
            this.setUseClientSidePow(this.isWebGLAvailable);
            log('Pow Service Initialized');
        } catch (err) {
            console.error(err);
        }
    }

    getUseClientSidePow(): boolean {
        return this.useClientSidePow;
    }

    setUseClientSidePow(useClient: boolean): void {
        this.useClientSidePow = useClient;
    }

    private _testWebGLSupport(): void {
        try {
            const canvas = document.createElement('canvas');
            const webGL =
                !!window['WebGLRenderingContext'] &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            this.isWebGLAvailable = !!webGL;
        } catch (e) {
            this.isWebGLAvailable = false;
        }
    }

    /** Generate PoW using WebGL */
    private _getHashWebGL(hash): Promise<string> {
        return new Promise((resolve, reject) => {
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
                        resolve(work);
                    },
                    () => {
                        // @ts-ignore
                        const completedWork = window.bananocoinBananojs.hashWorkMap.has(hash);
                        if (completedWork) {
                            log('Terminating client pow generate; server pow generated faster.');
                        }
                        return completedWork;
                    }
                );
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

    private _hasClientGeneratedWork(hash: string): boolean {
        // @ts-ignore
        return window.bananocoinBananojs.hashWorkMap.has(hash);
    }

    /** This function is invoked by BananoJs when attempting to provide work for transactions. */
    getGeneratedWork(hash: string): Promise<string> {
        const generatePowFromClient = async (): Promise<string> => {
            log('Racing Client-side PoW');
            try {
                if (this.isWebGLAvailable) {
                    const clientWork = await this._getHashWebGL(hash);
                    void this._rpcService.cancelWorkGenerate(hash);
                    return clientWork;
                }
                log(`Client does not have support for webgl.`);
                return Promise.reject();
            } catch (err) {
                console.error(err);
                log(`Error using webgl to generate local work.`);
                return Promise.reject();
            }
        };

        const generatePowFromServer = async (): Promise<string> => {
            const rpc = await this._datasourceService.getRpcSource();
            log(`Racing Server-side PoW, using ${rpc.alias} node.`);
            try {
                const serverWork = await this.defaultBananoJsGetGeneratedWork(hash);
                if (this._hasClientGeneratedWork(hash)) {
                    log('Terminating server pow generate; client pow generated faster.');
                    return Promise.reject();
                } else if (serverWork) {
                    // Terminates the client pow, see assets/pow/banano-webgl-pow.js
                    // @ts-ignore
                    window.bananocoinBananojs.hashWorkMap.set(hash, serverWork);
                    return serverWork;
                }
                log(`${rpc.alias} node did not generate work.`);
                return Promise.reject();
            } catch (err) {
                log(`${rpc.alias} node ran into an unknown error processing work.`);
                return Promise.reject();
            }
        };

        return Promise.any([generatePowFromClient(), generatePowFromServer()])
            .then((work: string) => Promise.resolve(work))
            .catch((err) => {
                console.error(err);
                return Promise.resolve('');
            });
    }
}
