import { CubismMatrix44 } from '../Framework/src/math/cubismmatrix44'
import { CubismViewMatrix } from '../Framework/src/math/cubismviewmatrix'

import { LAppPal } from './lAppPal'
import { LAppDefine } from './lAppDefine'
import { TouchManager } from './touchManager'
import { LAppLive2DManager } from './lAppLive2dManager'

export class LAppView {
    private static instance: LAppView | null = null

    public static getInstance() {
        if (this.instance === null) {
            this.instance = new LAppView()
        }
        return this.instance
    }

    public static releaseInstance() {
        if (this.instance !== null) {
            this.instance = null
        }
    }

    private _canvas: HTMLCanvasElement
    private _gl: WebGLRenderingContext

    private _programId: WebGLProgram | null

    private _live2DManager: LAppLive2DManager
    private _touchManager: TouchManager

    private _deviceToScreen: CubismMatrix44 | null
    private _viewMatrix: CubismViewMatrix | null

    constructor() {
        this._canvas = LAppDefine.Canvas
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl') as WebGLRenderingContext
        if (!this._gl) {
            throw new Error('Cannot initialize WebGL. This browser does not support.')
        }

        this._programId = null

        this._live2DManager = LAppLive2DManager.getInstance()
        this._touchManager = new TouchManager()

        this._deviceToScreen = new CubismMatrix44()
        this._viewMatrix = new CubismViewMatrix()
    }

    public initialize() {
        const { width, height } = this._canvas

        const ratio = width / height
        const left = -ratio
        const right = ratio
        const bottom = LAppDefine.ViewLogicalLeft
        const top = LAppDefine.ViewLogicalRight

        this._viewMatrix?.setScreenRect(left, right, bottom, top)
        this._viewMatrix?.scale(LAppDefine.ViewScale, LAppDefine.ViewScale)

        this._deviceToScreen?.loadIdentity()
        if (width > height) {
            const screenW = Math.abs(right - left)
            this._deviceToScreen?.scaleRelative(screenW / width, -screenW / width)
        } else {
            const screenH = Math.abs(top - bottom)
            this._deviceToScreen?.scaleRelative(screenH / height, -screenH / height)
        }

        this._deviceToScreen?.translateRelative(-width * 0.5, -height * 0.5)

        this._viewMatrix?.setMaxScale(LAppDefine.ViewMaxScale)
        this._viewMatrix?.setMinScale(LAppDefine.ViewMinScale)

        this._viewMatrix?.setMaxScreenRect(
            LAppDefine.ViewLogicalMaxLeft,
            LAppDefine.ViewLogicalMaxRight,
            LAppDefine.ViewLogicalMaxBottom,
            LAppDefine.ViewLogicalMaxTop
        )
    }

    public initializeSprite() {
        if (this._programId === null) {
            this._programId = this.createShader()
        }
    }

    public createShader() {
        const vertexShaderId = this._gl.createShader(this._gl.VERTEX_SHADER)
        if (vertexShaderId === null) {
            LAppPal.printMessage('failed to create vertexShader')
            return null
        }

        const vertexShader = 
            'precision mediump float;' +
            'attribute vec3 position;' +
            'attribute vec2 uv;' +
            'varying vec2 vuv;' +
            'void main(void)' +
            '{' +
            '   gl_Position = vec4(position, 1.0);' +
            '   vuv = uv;' +
            '}'
        this._gl.shaderSource(vertexShaderId, vertexShader)
        this._gl.compileShader(vertexShaderId)


        const fragmentShaderId = this._gl.createShader(this._gl.FRAGMENT_SHADER)

        if (fragmentShaderId === null) {
            LAppPal.printMessage('failed to create fragmentShader')
            return null
        }

        const fragmentShader = 
            'precision mediump float;' +
            'varying vec2 vuv;' +
            'uniform sampler2D texture;' +
            'void main(void)' +
            '{' +
            '   gl_FragColor = texture2D(texture, vuv);' +
            '}'
        
        this._gl.shaderSource(fragmentShaderId, fragmentShader)
        this._gl.compileShader(fragmentShaderId)

        const programId = this._gl.createProgram()

        this._gl.attachShader(programId!, vertexShaderId)
        this._gl.attachShader(programId!, fragmentShaderId)

        this._gl.deleteShader(vertexShaderId)
        this._gl.deleteShader(fragmentShaderId)

        this._gl.linkProgram(programId!)
        this._gl.useProgram(programId)

        return programId
    }

    public render() {
        this._gl.useProgram(this._programId)

        this._gl.flush()

        if (this._viewMatrix) {
            this._live2DManager.setViewMatrix(this._viewMatrix!)
            this._live2DManager.onUpdate()
        }
    }

    public onTouchesBegan(pointX: number, pointY: number) {
        this._touchManager.touchesBegan(pointX, pointY)
    }

    public onTouchesMoved(pointX: number, pointY: number) {
        const viewX = this.transformViewX(this._touchManager.getX())
        const viewY = this.transformViewY(this._touchManager.getY())
        if (viewX && viewY) {
            this._touchManager.touchesMoved(pointX, pointY)
            this._live2DManager.onDrag(viewX, viewY)
        }
    }

    public onRecover() {
        this._live2DManager.onDrag(0.0, 0.0)
    }

    public onTouchesEnded(pointX: number, pointY: number) {
        this._live2DManager.onDrag(0.0, 0.0)

        {
            const x = this._deviceToScreen?.transformX(this._touchManager.getX())
            const y = this._deviceToScreen?.transformY(this._touchManager.getY())
            
            if (LAppDefine.DebugLogEnable) {
                LAppPal.printMessage(`[APP]touchesEnded x: ${x} y: ${y}`)
            }
            if (!x || !y) { return }

            this._live2DManager.onTap(x, y)
        }
    }

    public transformViewX(deviceX: number) {
        const screenX = this._deviceToScreen?.transformX(deviceX)
        if (!screenX) { return }
        return this._viewMatrix?.invertTransformX(screenX)
    }

    public transformViewY(deviceY: number) {
        const screenY = this._deviceToScreen?.transformY(deviceY)
        if (!screenY) { return }
        return this._viewMatrix?.invertTransformY(screenY)
    }

    public transformScreenX(deviceX: number) {
        return this._deviceToScreen?.transformX(deviceX)
    }

    public transformScreenY(deviceY: number) {
        return this._deviceToScreen?.transformY(deviceY)
    }

    public release() {
        this._viewMatrix = null
        this._deviceToScreen = null

        this._gl.deleteProgram(this._programId)
        this._programId = null
    }
}
