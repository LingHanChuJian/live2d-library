export declare class LAppView {
    private static instance;
    static getInstance(): LAppView;
    static releaseInstance(): void;
    private _canvas;
    private _gl;
    private _programId;
    private _live2DManager;
    private _touchManager;
    private _deviceToScreen;
    private _viewMatrix;
    constructor();
    initialize(): void;
    initializeSprite(): void;
    createShader(): WebGLProgram | null;
    render(): void;
    onTouchesBegan(pointX: number, pointY: number): void;
    onTouchesMoved(pointX: number, pointY: number): void;
    onRecover(): void;
    onTouchesEnded(pointX: number, pointY: number): void;
    transformViewX(deviceX: number): number | undefined;
    transformViewY(deviceY: number): number | undefined;
    transformScreenX(deviceX: number): number | undefined;
    transformScreenY(deviceY: number): number | undefined;
    release(): void;
}
