import { CubismIdHandle } from '../Framework/src/id/cubismid';
export declare class ParamMapperJson {
    private _json;
    constructor(buffer: ArrayBuffer, size: number);
    getParamMapperCount(): number;
    getParamMapperId(index: number): string;
    getParamMapperValue(index: number): string;
    release(): void;
}
export declare class ParamMapper {
    idParamAngleX: CubismIdHandle | null;
    idParamAngleY: CubismIdHandle | null;
    idParamAngleZ: CubismIdHandle | null;
    idParamEyeBallX: CubismIdHandle | null;
    idParamEyeBallY: CubismIdHandle | null;
    idParamBodyAngleX: CubismIdHandle | null;
    private _idParamAngleX;
    private _idParamAngleY;
    private _idParamAngleZ;
    private _idParamEyeBallX;
    private _idParamEyeBallY;
    private _idParamBodyAngleX;
    private _paramMapperJson;
    constructor();
    loadParamMapper(buffer: ArrayBuffer, size: number): void;
    setupParamMapper(): void;
    registerParamMapperId(): void;
}
