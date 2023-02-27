import { CubismIdHandle } from '@Framework/id/cubismid'
import { CubismJson } from '@Framework/utils/cubismjson'
import { CubismFramework } from '@Framework/live2dcubismframework'
import { CubismDefaultParameterId } from '@Framework/cubismdefaultparameterid'

const Meta = 'Meta'
const MapperCount = 'MapperCount'
const Mapper = 'Mapper'
const Id = 'Id'
const Value = 'Value'

export class ParamMapperJson {
    private _json: CubismJson | null

    constructor(buffer: ArrayBuffer, size: number) {
        this._json = CubismJson.create(buffer, size)
    }

    public getParamMapperCount() {
        return this._json!.getRoot().getValueByString(Meta).getValueByString(MapperCount).toInt()
    }

    public getParamMapperId(index: number) {
        return this._json!.getRoot().getValueByString(Mapper).getValueByIndex(index).getValueByString(Id).getRawString()
    }

    public getParamMapperValue(index: number) {
        return this._json!.getRoot().getValueByString(Mapper).getValueByIndex(index).getValueByString(Value).getRawString()
    }

    public release() {
        if (this._json) { CubismJson.delete(this._json) }
    }
}

export class ParamMapper {
    public idParamAngleX: CubismIdHandle | null
    public idParamAngleY: CubismIdHandle | null
    public idParamAngleZ: CubismIdHandle | null
    public idParamEyeBallX: CubismIdHandle | null
    public idParamEyeBallY: CubismIdHandle | null
    public idParamBodyAngleX: CubismIdHandle | null

    private _idParamAngleX: string
    private _idParamAngleY: string
    private _idParamAngleZ: string
    private _idParamEyeBallX: string
    private _idParamEyeBallY: string
    private _idParamBodyAngleX: string

    private _paramMapperJson: ParamMapperJson | null

    constructor() {
        this._paramMapperJson = null

        this.idParamAngleX = null
        this.idParamAngleY = null
        this.idParamAngleZ = null
        this.idParamEyeBallX = null
        this.idParamEyeBallY = null
        this.idParamBodyAngleX = null

        this._idParamAngleX = CubismDefaultParameterId.ParamAngleX
        this._idParamAngleY = CubismDefaultParameterId.ParamAngleY
        this._idParamAngleZ = CubismDefaultParameterId.ParamAngleZ
        this._idParamEyeBallX = CubismDefaultParameterId.ParamEyeBallX
        this._idParamEyeBallY = CubismDefaultParameterId.ParamEyeBallY
        this._idParamBodyAngleX = CubismDefaultParameterId.ParamBodyAngleX
    }

    public loadParamMapper(buffer: ArrayBuffer, size: number) {
        this._paramMapperJson = new ParamMapperJson(buffer, size)
        this.setupParamMapper()
    }

    public setupParamMapper() {
        const map = new Map()
        for (let i = 0; i < this._paramMapperJson!.getParamMapperCount(); i++) {
            const id = this._paramMapperJson!.getParamMapperId(i)
            const value = this._paramMapperJson!.getParamMapperValue(i)
            map.set(id, value)
        }

        this._idParamAngleX = map.get(CubismDefaultParameterId.ParamAngleX)
        this._idParamAngleY = map.get(CubismDefaultParameterId.ParamAngleY)
        this._idParamAngleZ = map.get(CubismDefaultParameterId.ParamAngleZ)
        this._idParamEyeBallX = map.get(CubismDefaultParameterId.ParamEyeBallX)
        this._idParamEyeBallY = map.get(CubismDefaultParameterId.ParamEyeBallY)
        this._idParamBodyAngleX = map.get(CubismDefaultParameterId.ParamBodyAngleX)

        map.clear()
    }

    public registerParamMapperId() {
        this.idParamAngleX = CubismFramework.getIdManager().getId(this._idParamAngleX)
        this.idParamAngleY = CubismFramework.getIdManager().getId(this._idParamAngleY)
        this.idParamAngleZ = CubismFramework.getIdManager().getId(this._idParamAngleZ)
        this.idParamEyeBallX = CubismFramework.getIdManager().getId(this._idParamEyeBallX)
        this.idParamEyeBallY = CubismFramework.getIdManager().getId(this._idParamEyeBallY)
        this.idParamBodyAngleX = CubismFramework.getIdManager().getId(this._idParamBodyAngleX)
    }

}
