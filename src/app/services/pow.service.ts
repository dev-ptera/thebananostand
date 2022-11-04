import { Injectable } from '@angular/core';
import { DatasourceService } from '@app/services/datasource.service';

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
        const generatePowFromClient = async (): Promise<string> => {
            log('Performing Client-side PoW');
            if (this.isWebGLAvailable) {
                try {
                    return await this._getHashWebGL(hash);
                } catch (err) {
                    console.error(err);
                    return this._getJsBlakeWork(hash);
                }
            } else {
                return this._getJsBlakeWork(hash);
            }
        };

        const generatePowFromServer = async (): Promise<string> => {
            const rpc = await this._datasourceService.getRpcSource();
            log(`Performing Server-side PoW, using ${rpc.alias} node.`);
            return new Promise((resolve, reject) => {
                this.defaultBananoJsGetGeneratedWork(hash)
                    .then((serverWork) => {
                        if (serverWork) {
                            resolve(serverWork);
                        } else {
                            throw new Error(`${rpc.alias} node did not generate work.`);
                        }
                    })
                    .catch(async (err) => {
                        console.error(err);
                        if (this.isWebGLAvailable) {
                            log(`Server-side PoW generation failed, defaulting to client using WebGL`);
                            const clientWork = await generatePowFromClient();
                            resolve(clientWork);
                        } else {
                            reject(new Error(`${rpc.alias} node ran into an unknown error processing work.`));
                        }
                    });
            });
        };

        return this.useClientSidePow ? await generatePowFromClient() : await generatePowFromServer();
    }
}
