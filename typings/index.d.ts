export interface Live2dOptions {
    canvas: HTMLCanvasElement;
    models: string[];
    scale?: number;
}
export interface Live2dReturn {
    nextModel: () => void;
    onResize: () => void;
    setScale: (scale: number) => void;
    release: () => void;
}
declare const _default: (options: Live2dOptions) => Live2dReturn;
export default _default;
