import type { TextureInfo } from './lAppTextureManager'
import type { FinishedMotionCallback } from '../Framework/src/motion/acubismmotion'

import { csmMap } from '../Framework/src/type/csmmap'
import { csmVector } from '../Framework/src/type/csmvector'
import { CubismIdHandle } from '../Framework/src/id/cubismid'
import { CubismMotion } from '../framework/src/motion/cubismmotion'
import { ACubismMotion } from '../Framework/src/motion/acubismmotion'
import { CubismMatrix44 } from '../Framework/src/math/cubismmatrix44'
import { CubismEyeBlink } from '../Framework/src/effect/cubismeyeblink'
import { CubismUserModel } from '../Framework/src/model/cubismusermodel'
import { ICubismModelSetting } from '../Framework/src/icubismmodelsetting'
import { CubismModelSettingJson } from '../Framework/src/cubismmodelsettingjson'
import { CubismFramework, Option } from '../Framework/src/live2dcubismframework'
import { CubismDefaultParameterId } from '../Framework/src/cubismdefaultparameterid'
import { CubismBreath, BreathParameterData } from '../Framework/src/effect/cubismbreath'
import { InvalidMotionQueueEntryHandleValue } from '../Framework/src/motion/cubismmotionqueuemanager'

import { emitter } from './emitter'
import { LAppPal } from './lAppPal'
import { LAppDefine } from './lAppDefine'
import { ParamMapper } from './paramMapper'
import { setLive2dInitialize } from './lAppDelegate'
import { setFinishedMotion } from './lAppLive2dManager'
import { LAppTextureManager } from './lAppTextureManager'
import { LAppAudioFileHandler } from './lAppAudioFileHandler'

enum LoadStep {
    LoadAssets,
    LoadModel,
    WaitLoadModel,
    LoadExpression,
    WaitLoadExpression,
    LoadPhysics,
    WaitLoadPhysics,
    LoadPose,
    WaitLoadPose,
    SetupEyeBlink,
    SetupBreath,
    LoadUserData,
    WaitLoadUserData,
    SetupEyeBlinkIds,
    SetupLipSyncIds,
    SetupLayout,
    LoadMotion,
    WaitLoadMotion,
    CompleteInitialize,
    CompleteSetupModel,
    LoadTexture,
    WaitLoadTexture,
    CompleteSetup
}

export class LAppModel extends CubismUserModel {
    private _state: number
    private _motionCount: number
    private _allMotionCount: number
    private _expressionCount: number
    private _textureCount: number

    private _dir: string

    private _canvas: HTMLCanvasElement
    private _gl: WebGLRenderingContext
    private _frameBuffer: WebGLFramebuffer

    private _modelSetting: ICubismModelSetting | null
    
    private _motions: csmMap<string, ACubismMotion>
    private _expressions: csmMap<string, ACubismMotion | null>

    private _paramMapper: ParamMapper
    private _textureManager: LAppTextureManager
    private _audioFileHandler: LAppAudioFileHandler

    private _eyeBlinkIds: csmVector<CubismIdHandle>
    private _lipSyncIds: csmVector<CubismIdHandle>

    private _cubismOption: Option

    constructor(canvas: HTMLCanvasElement) {
        super()

        this._canvas = canvas
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl') as WebGLRenderingContext
        if (!this._gl) {
            throw new Error('Cannot initialize WebGL. This browser does not support.')
        }
        this._frameBuffer = this._gl.getParameter(this._gl.FRAMEBUFFER_BINDING)

        this._cubismOption = new Option()
        CubismFramework.startUp(this._cubismOption)
        CubismFramework.initialize()

        this._dir = ''
        this._modelSetting = null
        this._state = LoadStep.LoadAssets

        this._paramMapper = new ParamMapper()
        this._textureManager = new LAppTextureManager(canvas)
        this._audioFileHandler = LAppAudioFileHandler.getInstance()

        this._motions = new csmMap<string, ACubismMotion>()
        this._expressions = new csmMap<string, ACubismMotion>()

        this._eyeBlinkIds = new csmVector<CubismIdHandle>()
        this._lipSyncIds = new csmVector<CubismIdHandle>()

        this._motionCount = 0
        this._allMotionCount = 0
        this._expressionCount = 0
        this._textureCount = 0

        this._cubismOption.logFunction = LAppPal.printMessage
        this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel

        this._state = LoadStep.LoadAssets
    }

    /**
     * .model3.json 文件中提取模型所需的信息
     * @param dir model3.json 文件夹路径
     * @param fileName .model3.json 文件名称
     */
    public loadAssets(dir: string, fileName: string) {
        this._dir = dir

        fetch(`${this._dir}${fileName}`)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                const setting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength)
                this._state = LoadStep.LoadModel
                this.setupModel(setting)
            })
    }

    private setupModel(setting: ICubismModelSetting) {
        this._updating = true
        this._initialized = false

        this._modelSetting = setting

        const modelFileName = this._modelSetting.getModelFileName()
        if (modelFileName !== '') {
            fetch(`${this._dir}${modelFileName}`)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    this.loadModel(arrayBuffer)
                    this._state = LoadStep.LoadExpression

                    this.loadCubismExpression()
                })
            this._state = LoadStep.WaitLoadModel
        } else {
            LAppPal.printMessage('Model data does not exist.')
        }
    }

    private loadCubismExpression() {
        const count = this._modelSetting!.getExpressionCount()
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const expressionName = this._modelSetting!.getExpressionName(i)
                const expressionFileName = this._modelSetting!.getExpressionFileName(i)

                fetch(`${this._dir}${expressionFileName}`)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => {
                        const motion = this.loadExpression(arrayBuffer, arrayBuffer.byteLength, expressionName)

                        if (this._expressions.getValue(expressionName) != null) {
                            ACubismMotion.delete(this._expressions.getValue(expressionName) as ACubismMotion)
                            this._expressions.setValue(expressionName, null)
                        }

                        this._expressions.setValue(expressionName, motion)

                        this._expressionCount++

                        if (this._expressionCount >= count) {
                            this._state = LoadStep.LoadPhysics

                            this.loadCubismPhysics()
                        }

                    })

            }
        } else {
            this._state = LoadStep.LoadPhysics
            this.loadCubismPhysics()
        }
    }

    private loadCubismPhysics() {
        const physicsFileName = this._modelSetting!.getPhysicsFileName()
        if (physicsFileName !== '') {
            fetch(`${this._dir}${physicsFileName}`)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    this.loadPhysics(arrayBuffer, arrayBuffer.byteLength)
                    this._state = LoadStep.LoadPose
                    this.loadCubismPose()
                })

            this._state = LoadStep.WaitLoadPhysics
        } else {
            this._state = LoadStep.LoadPose
            this.loadCubismPose()
        }
    }

    private loadCubismPose() {
        const poseFileName = this._modelSetting!.getPoseFileName()

        if (poseFileName !== '') {
            fetch(`${this._dir}${poseFileName}`)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    this.loadPose(arrayBuffer, arrayBuffer.byteLength)

                    this._state = LoadStep.SetupEyeBlink
                    this.setupEyeBlink()
                })
            this._state = LoadStep.WaitLoadPose
        } else {
            this._state = LoadStep.SetupEyeBlink
            this.setupEyeBlink()
        }
    }

    private setupEyeBlink() {
        if (this._modelSetting!.getEyeBlinkParameterCount() > 0) {
            this._eyeBlink = CubismEyeBlink.create(this._modelSetting!)
            this._state = LoadStep.SetupBreath
        }

        // 加载 ParamMapper
        this.loadParamMapper()
    }

    private loadParamMapper() {
        const mapperName = this._modelSetting!.getMapperFileName()
        if (mapperName !== '') {
            fetch(`${this._dir}${mapperName}`)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                this._paramMapper.loadParamMapper(arrayBuffer, arrayBuffer.byteLength)
                this._paramMapper.registerParamMapperId()
                this.setupBreath()
            })
        } else {
            this._paramMapper.registerParamMapperId()
            this.setupBreath()
        }
    }

    private setupBreath() {
        this._breath = CubismBreath.create()

        const breathParameters: csmVector<BreathParameterData> = new csmVector()

        breathParameters.pushBack(
            new BreathParameterData(this._paramMapper.idParamAngleX!, 0.0, 15.0, 6.5345, 0.5)
        )
        
        breathParameters.pushBack(
            new BreathParameterData(this._paramMapper.idParamAngleY!, 0.0, 8.0, 3.5345, 0.5)
        )

        breathParameters.pushBack(
            new BreathParameterData(this._paramMapper.idParamAngleZ!, 0.0, 10.0, 5.5345, 0.5)
        )

        breathParameters.pushBack(
            new BreathParameterData(this._paramMapper.idParamBodyAngleX!, 0.0, 4.0, 15.5345, 0.5)
        )

        breathParameters.pushBack(
            new BreathParameterData(
                CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBreath),
                0.5, 0.5, 3.2345, 1
            )
        )

        this._breath.setParameters(breathParameters)

        this._state = LoadStep.LoadUserData

        this.loadCubismUserData()
    }

    private loadCubismUserData() {
        const userDataFile = this._modelSetting!.getUserDataFile()

        if (userDataFile !== '') {
            fetch(`${this._dir}${userDataFile}`)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    this.loadUserData(arrayBuffer, arrayBuffer.byteLength)

                    this._state = LoadStep.SetupEyeBlinkIds
                    this.setupEyeBlinkIds()
                })
            this._state = LoadStep.WaitLoadUserData
        } else {
            this._state = LoadStep.SetupEyeBlinkIds
            this.setupEyeBlinkIds()
        }
    }

    private setupEyeBlinkIds() {
        const eyeBlinkIdCount = this._modelSetting!.getEyeBlinkParameterCount()

        for (let i = 0; i < eyeBlinkIdCount; i++) {
            this._eyeBlinkIds.pushBack(
                this._modelSetting!.getEyeBlinkParameterId(i)
            )
        }

        this._state = LoadStep.SetupLipSyncIds
        this.setupLipSyncIds()
    }

    private setupLipSyncIds() {
        const lipSyncIdCount = this._modelSetting!.getLipSyncParameterCount()

        for (let i = 0; i < lipSyncIdCount; i++) {
            this._lipSyncIds.pushBack(
                this._modelSetting!.getLipSyncParameterId(i)
            )
        }

        this._state = LoadStep.SetupLayout
        this.setupLayout()
    }

    private setupLayout() {
        const layout: csmMap<string, number> = new csmMap<string, number>()
        this._modelSetting!.getLayoutMap(layout)
        this._modelMatrix.setupFromLayout(layout)
        
        this._state = LoadStep.LoadMotion
        this.loadCubismMotion()
    }

    private loadCubismMotion() {
        this._state = LoadStep.WaitLoadMotion
        this._model.saveParameters()
        this._allMotionCount = 0
        this._motionCount = 0

        const group: string[] = []
        const motionGroupCount = this._modelSetting!.getMotionGroupCount()

        for (let i = 0; i < motionGroupCount; i++) {
            group[i] = this._modelSetting!.getMotionGroupName(i)
            this._allMotionCount += this._modelSetting!.getMotionCount(group[i])
        }

        for (let i = 0; i < motionGroupCount; i++) {
            this.preLoadMotionGroup(group[i])
        }

        if (motionGroupCount === 0) {
            this._state = LoadStep.LoadTexture

            this._motionManager.stopAllMotions()

            this._updating = false
            this._initialized = true

            this.createRenderer()
            this.setupTextures()
            this.getRenderer().startUp(this._gl)
        }
    }

    private setupTextures() {
        const usePremultiply = true

        if (this._state === LoadStep.LoadTexture) {
            const textureCount: number = this._modelSetting!.getTextureCount()

            for (let i = 0; i < textureCount; i++) {
                const textureFileName = this._modelSetting!.getTextureFileName(i)

                if (textureFileName === '') {
                    console.log('getTextureFileName null')
                    continue
                }

                const texturePath = this._dir + textureFileName
                const onLoad = (textureInfo: TextureInfo) => {
                    this.getRenderer().bindTexture(i, textureInfo.id)
                    this._textureCount++

                    if (this._textureCount >= textureCount) {
                        this._state = LoadStep.CompleteSetup
                    }
                }

                this._textureManager.createTextureFromPngFile(texturePath, usePremultiply, onLoad)
                this.getRenderer().setIsPremultipliedAlpha(usePremultiply)
            }

            this._state = LoadStep.WaitLoadTexture
        }

        setLive2dInitialize(true)
    }

    private preLoadMotionGroup(group: string) {
        for (let i = 0; i < this._modelSetting!.getMotionCount(group); i++) {
            const motionFileName = this._modelSetting!.getMotionFileName(group, i)

            const name = `${group}_${i}`
            if (this._debugMode) {
                LAppPal.printMessage(`[APP] load motion: ${motionFileName} => [${name}]`)
            }

            fetch(`${this._dir}${motionFileName}`)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    const tmpMotion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, name)
                    let fadeTime = this._modelSetting!.getMotionFadeInTimeValue(group, i)
                    
                    if (fadeTime > 0.0) {
                        tmpMotion.setFadeInTime(fadeTime)
                    }
                    
                    fadeTime = this._modelSetting!.getMotionFadeOutTimeValue(group, i)
                    
                    if (fadeTime >= 0.0) {
                        tmpMotion.setFadeOutTime(fadeTime)
                    }

                    tmpMotion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds)

                    if (this._motions.getValue(name) != null) {
                        ACubismMotion.delete(this._motions.getValue(name))
                    }

                    this._motions.setValue(name, tmpMotion)

                    this._motionCount++
                    if (this._motionCount >= this._allMotionCount) {
                        this._state = LoadStep.LoadTexture

                        this._motionManager.stopAllMotions()
                        this._updating = false
                        this._initialized = true

                        this.createRenderer()
                        this.setupTextures()
                        this.getRenderer().startUp(this._gl)
                    }
                })
        }
    }

    public update() {
        if (this._state != LoadStep.CompleteSetup) { return }

        const deltaTimeSeconds = LAppPal.getDeltaTime()

        this._dragManager.update(deltaTimeSeconds)
        this._dragX = this._dragManager.getX()
        this._dragY = this._dragManager.getY()

        let motionUpdated = false
        this._model.loadParameters()

        this._motionManager.isFinished() ? this.startRandomMotion(LAppDefine.MotionGroupIdle, LAppDefine.PriorityIdle) : this._motionManager.updateMotion(this._model, deltaTimeSeconds)

        this._model.saveParameters()

        if (!motionUpdated) {
            if (this._eyeBlink !== null) {
                this._eyeBlink.updateParameters(this._model, deltaTimeSeconds)
            }
        }

        if (this._expressionManager !== null) {
            this._expressionManager.updateMotion(this._model, deltaTimeSeconds)
        }

        this._model.addParameterValueById(this._paramMapper.idParamAngleX, this._dragX * 30)
        this._model.addParameterValueById(this._paramMapper.idParamAngleY, this._dragY * 30)
        this._model.addParameterValueById(this._paramMapper.idParamAngleZ, this._dragX * this._dragY * -30)
        this._model.addParameterValueById(this._paramMapper.idParamBodyAngleX, this._dragX * 10)
        this._model.addParameterValueById(this._paramMapper.idParamEyeBallX, this._dragX)
        this._model.addParameterValueById(this._paramMapper.idParamEyeBallY, this._dragY)

        if (this._breath !== null) {
            this._breath.updateParameters(this._model, deltaTimeSeconds)
        }

        if (this._physics !== null) {
            this._physics.evaluate(this._model, deltaTimeSeconds)
        }

        if (this._lipsync) {
            const value = this._audioFileHandler.getVolume()
            for (let i = 0; i < this._lipSyncIds.getSize(); ++i) {
                this._model.addParameterValueById(this._lipSyncIds.at(i), value, 0.8)
            }
        }

        if (this._pose !== null) {
            this._pose.updateParameters(this._model, deltaTimeSeconds)
        }

        this._model.update()
    }

    public startRandomMotion(group: string,  priority: number, onFinishedMotionHandler?: FinishedMotionCallback) {
        const motionCount = this._modelSetting!.getMotionCount(group)
        if (motionCount === 0) {
            return InvalidMotionQueueEntryHandleValue
        }

        const no = Math.floor(Math.random() * this._modelSetting!.getMotionCount(group))
        return this.startAudio(group, no, priority, onFinishedMotionHandler)
    }

    public startAudio(group: string, no: number, priority: number, onFinishedMotionHandler?: FinishedMotionCallback) {
        if (priority === LAppDefine.PriorityForce) {
            this._motionManager.setReservePriority(priority)
        } else if (!this._motionManager.reserveMotion(priority)) {
            if (this._debugMode) {
                LAppPal.printMessage("[APP] can't start motion.")
            }
            return InvalidMotionQueueEntryHandleValue
        }

        const voice = this._modelSetting!.getMotionSoundFileName(group, no)
        if (voice.localeCompare('') !== 0) {
            this._audioFileHandler.loadAudioFile(this._dir + voice, () => this.startMotion(group, no, priority, onFinishedMotionHandler))
            return
        }

        return this.startMotion(group, no, priority, onFinishedMotionHandler)
    }

    public startMotion(group: string, no: number, priority: number, onFinishedMotionHandler?: FinishedMotionCallback) {
        const motionFileName = this._modelSetting!.getMotionFileName(group, no)

        const name = `${group}_${no}`
        let motion = this._motions.getValue(name) as CubismMotion
        let autoDelete = false

        if (motion === null) {
            fetch(`${this._dir}${motionFileName}`)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, '', onFinishedMotionHandler)
                    let fadeTime: number = this._modelSetting!.getMotionFadeInTimeValue(group, no)
                    if (fadeTime >= 0.0) {
                        motion.setFadeInTime(fadeTime)
                    }

                    fadeTime = this._modelSetting!.getMotionFadeOutTimeValue(group, no)
                    if (fadeTime >= 0.0) {
                        motion.setFadeOutTime(fadeTime)
                    }

                    motion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds)
                    autoDelete = true
                })
        } else {
            if (onFinishedMotionHandler) { motion.setFinishedMotionHandler(onFinishedMotionHandler) }
        }

        if (this._debugMode) {
            LAppPal.printMessage(`[APP] start motion: [${group}_${no}`)
        }

        return this._motionManager.startMotionPriority(motion, autoDelete, priority)
    }

    public setExpression(expressionId: string) {
        const motion = this._expressions.getValue(expressionId)
        if (this._debugMode) {
            LAppPal.printMessage(`[APP] expression: [${expressionId}]`)
        }

        if (motion !== null) {
            this._expressionManager.startMotionPriority(motion, false, LAppDefine.PriorityForce)
        } else {
            if (this._debugMode) {
                LAppPal.printMessage(`[APP] expression[${expressionId}] is null`)
            }
        }
    }

    public setRandomExpression() {
        if (this._expressions.getSize() === 0) {
            return
        }

        const no = Math.floor(Math.random() * this._expressions.getSize())
        for (let i = 0; i < this._expressions.getSize(); i++) {
            if (i === no) {
                const name = this._expressions._keyValues[i].first
                this.setExpression(name)
                return
            }
        }
    }

    public hitAreaMotion(x: number, y: number) {
        if (this._opacity < 1) {
            return
        }

        const count = this._modelSetting!.getHitAreasCount()
        for (let i = 0; i < count; i++) {
            const drawId = this._modelSetting!.getHitAreaId(i)
            if (this.isHit(drawId, x, y)) {
                setFinishedMotion(false)
                const message = this._modelSetting!.getHitAreaText(i)
                if (message) { emitter.emit('message', message) }
                return this._modelSetting!.getHitAreaMotion(i)
            }
        }
        setFinishedMotion(true)
        return
    }

    public reloadRenderer() {
        this.deleteRenderer()
        this.createRenderer()
        this.setupTextures()
    }

    public release() {
        this._motions.clear()
        this._textureManager.release()
    }

    public releaseExpressions() {
        this._expressions.clear()
    }

    public doDraw() {
        if (this._model == null) { return }
        const viewport = [0, 0, this._canvas.width, this._canvas.height]

        this.getRenderer().setRenderState(this._frameBuffer, viewport)
        this.getRenderer().drawModel()
    }

    public draw(matrix: CubismMatrix44) {
        if (this._model == null) { return }

        if (this._state == LoadStep.CompleteSetup) {
            matrix.multiplyByMatrix(this._modelMatrix)

            this.getRenderer().setMvpMatrix(matrix)
            this.doDraw()
        }
    }
}