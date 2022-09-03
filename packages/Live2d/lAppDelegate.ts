import { LAppPal } from './lAppPal'
import { LAppView } from './lAppView'
import { LAppDefine } from './lAppDefine'
import { getFinishedMotion } from './lAppLive2dManager'

let Live2dInitialize = false

export const getLive2dInitialize = () => {
    return Live2dInitialize
}

export const setLive2dInitialize = (value: boolean) => {
    Live2dInitialize = value
}

export class LAppDelegate {
    private static instance: LAppDelegate | null = null

    public static getInstance() {
        if (this.instance === null) {
            this.instance = new LAppDelegate()
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

    private _view: LAppView
    private _captured: boolean

    constructor() {
        this._canvas = LAppDefine.Canvas
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl') as WebGLRenderingContext
        if (!this._gl) {
            throw new Error('Cannot initialize WebGL. This browser does not support.')
        }

        this._view = LAppView.getInstance()

        this._captured = false

        this.initialize()
        this.run()
    }

    public initialize() {
        this._gl.enable(this._gl.BLEND)
        this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA)

        const supportTouch = 'ontouchend' in document
        if (supportTouch) {
            this._canvas.addEventListener('touchstart', (e) => this.onTouchBegan(e))
            this._canvas.addEventListener('touchmove', (e) => this.onTouchMoved(e))
            this._canvas.addEventListener('touchend', (e) => this.onTouchEnded(e))
            this._canvas.addEventListener('touchcancel', (e) => this.onTouchCancel(e))
        } else {
            this._canvas.addEventListener('mousedown', (e) => this.onClickBegan(e))
            document.addEventListener('mousemove', (e) => this.onMouseMoved(e))
            document.addEventListener('mouseout', () => this.onMouseOut())
            this._canvas.addEventListener('mouseup', (e) => this.onClickEnded(e))
        }

        this._view.initialize()
        this.initializeCubism()
    }

    public initializeCubism() {
        LAppPal.updateTime()
        this._view.initializeSprite()
    }

    public run() {
        const loop = () => {
            LAppPal.updateTime()
            // this._gl.clearColor(0.0, 0.0, 0.0, 1.0)
            this._gl.enable(this._gl.DEPTH_TEST)
            this._gl.depthFunc(this._gl.LEQUAL)
            this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT)
            this._gl.clearDepth(1.0)
            this._gl.enable(this._gl.BLEND)
            this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA)
            this._view.render()
            requestAnimationFrame(loop)
        }

        loop()
    }

    public onResize() {
        this._view.initialize()
        this._view.initializeSprite()
    }

    public release() {
        this._view.release()
    }

    private onClickBegan(e: MouseEvent) {
        const posX = e.pageX
        const posY = e.pageY

        this._view.onTouchesBegan(posX, posY)
    }

    private onMouseMoved(e: MouseEvent) {
        if (!getFinishedMotion()) { return }

        const rect = this._canvas.getBoundingClientRect()
        const posX = e.clientX - rect.left
        const posY = e.clientY - rect.top

        this._view.onTouchesMoved(posX, posY)
    }

    private onMouseOut() {
        this._view.onRecover()
    }

    private onClickEnded(e: MouseEvent) {
        if (!getLive2dInitialize()) { return }
        if (!getFinishedMotion()) { return }

        const rect = (e.target as Element).getBoundingClientRect()
        const posX = e.clientX - rect.left
        const posY = e.clientY - rect.top

        this._view.onTouchesEnded(posX, posY)
    }

    private onTouchBegan(e: TouchEvent) {
        this._captured = true
        
        const posX = e.changedTouches[0].pageX
        const posY = e.changedTouches[0].pageY

        this._view.onTouchesBegan(posX, posY)
    }

    private onTouchMoved(e: TouchEvent) {
        if (!this._captured) {
            return
        }

        const rect = (e.target as Element).getBoundingClientRect()
        const posX = e.changedTouches[0].clientX - rect.left
        const posY = e.changedTouches[0].clientY - rect.top

        this._view.onTouchesMoved(posX, posY)
    }

    private onTouchEnded(e: TouchEvent) {
        this._captured = false

        const rect = (e.target as Element).getBoundingClientRect()
        const posX = e.changedTouches[0].clientX - rect.left
        const posY = e.changedTouches[0].clientY - rect.top

        this._view.onTouchesEnded(posX, posY)
    }

    private onTouchCancel(e: TouchEvent) {
        this._captured = false

        const rect = (e.target as Element).getBoundingClientRect()

        const posX = e.changedTouches[0].clientX - rect.left
        const posY = e.changedTouches[0].clientY - rect.top

        this._view.onTouchesEnded(posX, posY)
    }
}
