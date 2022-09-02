import { LAppDelegate } from './Live2d/lAppDelegate'
import { LAppLive2DManager } from './Live2d/lAppLive2dManager'
import { LAppAudioFileHandler } from './Live2d/lAppAudioFileHandler'
import { LAppDefine } from './Live2d/lAppDefine'

export interface Live2dOptions {
    canvas: HTMLCanvasElement
    models: string[]
    scale?: number
}

export interface Live2dReturn {
    nextModel: () => void
    onResize: () => void
    setScale: (scale: number) => void
    release: () => void
}

export default (options: Live2dOptions): Live2dReturn => {
    const { canvas, models, scale: viewScale } = options

    LAppDefine.Canvas = canvas
    LAppDefine.Models = models
    LAppDefine.ViewScale = viewScale ?? 1

    const lAppLive2DManager = LAppLive2DManager.getInstance()
    const lAppDelegate = LAppDelegate.getInstance()

    return {
        nextModel: lAppLive2DManager.nextModel.bind(lAppLive2DManager),
        onResize: lAppDelegate.onResize.bind(lAppDelegate),
        setScale: (scale: number) => {
            LAppDefine.ViewScale = scale
            lAppDelegate.onResize()
        },
        release: () => {
            LAppAudioFileHandler.getInstance().release()
            lAppDelegate.release()
        }
    }
}
