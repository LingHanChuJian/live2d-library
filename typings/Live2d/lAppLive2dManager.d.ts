import { CubismMatrix44 } from '../Framework/src/math/cubismmatrix44';
import { ACubismMotion } from '../Framework/src/motion/acubismmotion';
import { LAppModel } from './lAppModel';
export declare const setFinishedMotion: (value: boolean) => void;
export declare const getFinishedMotion: () => boolean;
export declare class LAppLive2DManager {
    private static instance;
    static getInstance(): LAppLive2DManager;
    static releaseInstance(): void;
    private _modelsIndex;
    private _models;
    private _viewMatrix;
    private _canvas;
    constructor();
    /**
     *  加载模型
     * @param index 模型数组下标
     */
    loadModel(index: number): void;
    nextModel(): void;
    onUpdate(): void;
    onDrag(x: number, y: number): void;
    onTap(x: number, y: number): void;
    releaseAllModel(): void;
    getModel(index: number): LAppModel | undefined;
    finishedMotion(self: ACubismMotion): void;
    setViewMatrix(m: CubismMatrix44): void;
}
