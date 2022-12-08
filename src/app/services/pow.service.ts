import { Injectable } from '@angular/core';
import { DatasourceService } from '@app/services/datasource.service';
import { RpcService } from '@app/services/rpc.service';

export type BananoifiedWindow = {
    bananocoinBananojs: any;
    shouldHaltClientSideWorkGeneration: boolean;
    isClientActivelyGeneratingWork: boolean;
} & Window;

declare let window: BananoifiedWindow;

// eslint-disable-next-line no-console
const log = (msg: string): void => console.log(msg);

/** Responsible for remembering use settings & executing client-side pow via webgl or cpu when requested. */
@Injectable({
    providedIn: 'root',
})
export class PowService {
    isWebGLAvailable: boolean;
    defaultBananoJsGetGeneratedWork: any;
    timesCalled = 0;

    constructor(private readonly _datasourceService: DatasourceService, private readonly _rpcService: RpcService) {}

    /** This will use client-side pow if the user has asked to use it, otherwise defaults to server-side pow (original implementation) */
    overrideDefaultBananoJSPowSource(): void {
        // @ts-ignore
        try {
            this._testWebGLSupport();
            this.defaultBananoJsGetGeneratedWork = window.bananocoinBananojs.bananodeApi.getGeneratedWork;
            window.bananocoinBananojs.bananodeApi.getGeneratedWork = this.getGeneratedWork.bind(this);
            log('Pow Service Initialized');
        } catch (err) {
            console.error(err);
        }
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
        window.isClientActivelyGeneratingWork = true;
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
                        window.isClientActivelyGeneratingWork = false;
                        resolve(work);
                    },
                    () => {
                        if (window.shouldHaltClientSideWorkGeneration) {
                            window.isClientActivelyGeneratingWork = false;
                            log('Terminating client pow generate; server pow generated faster.');
                            return true;
                        }
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

    /** This function is invoked by BananoJs when attempting to provide work for transactions. */
    async getGeneratedWork(hash: string): Promise<string> {
        const generatePowFromClient = async (): Promise<string> => {
            log('Racing Client-side PoW.');
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
                if (serverWork) {
                    log(`${rpc.alias} node generated work via 'work_generate'.`);
                    return serverWork;
                }
                log(
                    `${rpc.alias} node did NOT generate work via 'work_generate', continuing BananoJS default behavior.`
                );
                return Promise.resolve(undefined);
            } catch (err) {
                log(`${rpc.alias} node ran into an unknown error processing work.`);
                return Promise.reject();
            }
        };

        /* This is extremely hacky but is intended as a temporarily solution...
           Every other call to generate work will alternate between using client & server-side.
           This allows the client to broadcast 2 transactions, but with alternate pow-sources so that the fastest pow source broadcasts first.  */
        if (this.timesCalled++ % 2 === 0) {
            return generatePowFromClient();
        }
        return generatePowFromServer();
    }
}
