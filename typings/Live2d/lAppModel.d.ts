import type { FinishedMotionCallback } from '../Framework/src/motion/acubismmotion';
import { CubismMatrix44 } from '../Framework/src/math/cubismmatrix44';
import { CubismUserModel } from '../Framework/src/model/cubismusermodel';
export declare class LAppModel extends CubismUserModel {
    private _state;
    private _motionCount;
    private _allMotionCount;
    private _expressionCount;
    private _textureCount;
    private _dir;
    private _canvas;
    private _gl;
    private _frameBuffer;
    private _modelSetting;
    private _motions;
    private _expressions;
    private _paramMapper;
    private _textureManager;
    private _audioFileHandler;
    private _eyeBlinkIds;
    private _lipSyncIds;
    private _cubismOption;
    constructor(canvas: HTMLCanvasElement);
    /**
     * .model3.json 文件中提取模型所需的信息
     * @param dir model3.json 文件夹路径
     * @param fileName .model3.json 文件名称
     */
    loadAssets(dir: string, fileName: string): void;
    private setupModel;
    private loadCubismExpression;
    private loadCubismPhysics;
    private loadCubismPose;
    private setupEyeBlink;
    private loadParamMapper;
    private setupBreath;
    private loadCubismUserData;
    private setupEyeBlinkIds;
    private setupLipSyncIds;
    private setupLayout;
    private loadCubismMotion;
    private setupTextures;
    private preLoadMotionGroup;
    update(): void;
    startRandomMotion(group: string, priority: number, onFinishedMotionHandler?: FinishedMotionCallback): any;
    startMotion(group: string, no: number, priority: number, onFinishedMotionHandler?: FinishedMotionCallback): any;
    setExpression(expressionId: string): void;
    setRandomExpression(): void;
    hitAreaMotion(x: number, y: number): string | undefined;
    reloadRenderer(): void;
    release(): void;
    releaseExpressions(): void;
    doDraw(): void;
    draw(matrix: CubismMatrix44): void;
}
