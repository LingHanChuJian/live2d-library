import { csmVector } from '../Framework/src/type/csmvector'
import { CubismMatrix44 } from '../Framework/src/math/cubismmatrix44'
import { ACubismMotion } from '../Framework/src/motion/acubismmotion'

import { LAppPal } from './lAppPal'
import { LAppModel } from './lAppModel'
import { LAppDefine } from './lAppDefine'

let finishedMotion = true
const ModelJsonRe = /[^\/]*\.json/

export const setFinishedMotion = (value: boolean) => {
    finishedMotion = value
}

export const getFinishedMotion = () => {
    return finishedMotion
}

export class LAppLive2DManager {
    private static instance: LAppLive2DManager | null = null

    public static getInstance() {
        if (this.instance === null) {
            this.instance = new LAppLive2DManager()
        }
        return this.instance
    }

    public static releaseInstance() {
        if (this.instance !== null) {
            this.instance = null
        }
    }

    private _modelsIndex: number

    private _models: csmVector<LAppModel>
    private _viewMatrix: CubismMatrix44

    private _canvas: HTMLCanvasElement

    constructor() {
        this._canvas = LAppDefine.Canvas

        this._models = new csmVector<LAppModel>()
        this._viewMatrix = new CubismMatrix44()

        this._modelsIndex = 0

        this.loadModel(this._modelsIndex)
    }

    /**
     *  加载模型
     * @param index 模型数组下标
     */
    public loadModel(index: number) {
        this._modelsIndex = index

        if (LAppDefine.DebugLogEnable) {
            LAppPal.printMessage(`[APP] model index: ${this._modelsIndex}`)
        }

        const filePath = LAppDefine.Models[this._modelsIndex]
        const match = filePath.match(ModelJsonRe)
        if (!match) {
            throw new Error("Can't match json file")
        }

        this.releaseAllModel()
        this._models.pushBack(new LAppModel(this._canvas))
        this._models.at(0).loadAssets(filePath.replace(ModelJsonRe, ''), match[0])
    }

    // 加载下一个模型
    public nextModel() {
        this.loadModel((this._modelsIndex + 1) % LAppDefine.Models.length)
    }

    // 加载随机模型
    public nextRandomModel() {
        let random: number
        while(true) {
            random = Math.floor(Math.random() * LAppDefine.Models.length)
            if (random !== this._modelsIndex) { break }
        }
        this.loadModel(random)
    }

    public onUpdate() {
        const { width, height } = this._canvas

        for (let i = 0; i < this._models.getSize(); ++i) {
            const projection = new CubismMatrix44()
            const model = this.getModel(i)

            if (model && model.getModel()) {
                if (model.getModel().getCanvasWidth() > 1.0 && width < height) {
                    model.getModelMatrix().setWidth(2.0)
                    projection.scale(1.0, width / height)
                } else {
                    projection.scale(height / width, 1.0)
                }

                if (this._viewMatrix !== null) {
                    projection.multiplyByMatrix(this._viewMatrix)
                }

                model.update()
                model.draw(projection)
            }
        }
    }

    public onDrag(x: number, y: number) {
        for (let i = 0; i < this._models.getSize(); i++) {
            const model = this.getModel(i)
            if (model) {
                model.setDragging(x, y)
            }
        }
    }

    public onTap(x: number, y: number) {
        if (LAppDefine.DebugLogEnable) {
            LAppPal.printMessage(`[APP] tap point: {x: ${x.toFixed(2)} y: ${y.toFixed(2)}}`)
        }

        for (let i = 0; i < this._models.getSize(); i++) {
            const model = this.getModel(i)

            if (!model) { continue }

            const motion = model.hitAreaMotion(x, y)
            if (motion) {
                model.startRandomMotion(motion, LAppDefine.PriorityNormal, this.finishedMotion)
            }
        }
    }

    public releaseAllModel() {
        for (let i = 0; i < this._models.getSize(); i++) {
            this._models.at(i).release()
            this._models.set(i, null as any)
        }
        this._models.clear()
    }

    public getModel(index: number) {
        if (index < this._models.getSize()) {
            return this._models.at(index)
        }
    }

    public finishedMotion(self: ACubismMotion) {
        // LAppPal.printMessage('Motion Finished:')
        // console.log(self)
        setFinishedMotion(true)
    }

    public setViewMatrix(m: CubismMatrix44) {
        for (let i = 0; i < 16; i++) {
            this._viewMatrix.getArray()[i] = m.getArray()[i]
        }
    }
}
