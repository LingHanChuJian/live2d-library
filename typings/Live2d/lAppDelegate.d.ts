export declare const getLive2dInitialize: () => boolean;
export declare const setLive2dInitialize: (value: boolean) => void;
export declare class LAppDelegate {
    private static instance;
    static getInstance(): LAppDelegate;
    static releaseInstance(): void;
    private _canvas;
    private _gl;
    private _view;
    private _captured;
    constructor();
    initialize(): void;
    initializeCubism(): void;
    run(): void;
    onResize(): void;
    release(): void;
    private onClickBegan;
    private onMouseMoved;
    private onMouseOut;
    private onClickEnded;
    private onTouchBegan;
    private onTouchMoved;
    private onTouchEnded;
    private onTouchCancel;
}
