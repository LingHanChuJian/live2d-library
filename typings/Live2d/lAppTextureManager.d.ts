export interface TextureInfo {
    id: WebGLTexture;
    img: HTMLImageElement;
    width: number;
    height: number;
    usePremultply: boolean;
    fileName: string;
}
export declare class LAppTextureManager {
    private _canvas;
    private _gl;
    private _textures;
    constructor(canvas: HTMLCanvasElement);
    createTextureFromPngFile(fileName: string, usePremultiply: boolean, callback: (textureInfo: TextureInfo) => void): void;
    release(): void;
}
