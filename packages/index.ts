import type { Emitter } from 'mitt'
import type { Events } from './Live2d/emitter'

import { emitter } from './Live2d/emitter'
import { LAppDefine } from './Live2d/lAppDefine'
import { LAppDelegate } from './Live2d/lAppDelegate'
import { LAppLive2DManager } from './Live2d/lAppLive2dManager'
import { LAppAudioFileHandler } from './Live2d/lAppAudioFileHandler'


export interface Live2dOptions {
    canvas: HTMLCanvasElement
    models: string[]
    scale?: number
    centerPosition?: [number, number]
}

export interface Live2dReturn {
    emitter: Emitter<Events>
    nextModel: () => void
    nextRandomModel: () => void
    onResize: () => void
    setScale: (scale: number) => void
    release: () => void
}

export default (options: Live2dOptions): Live2dReturn => {
    const { canvas, models, scale: viewScale, centerPosition } = options

    LAppDefine.Canvas = canvas
    LAppDefine.Models = models
    LAppDefine.ViewScale = viewScale ?? 1
    LAppDefine.CenterPosition = centerPosition ?? []

    const lAppLive2DManager = LAppLive2DManager.getInstance()
    const lAppDelegate = LAppDelegate.getInstance()

    return {
        emitter,
        nextModel: lAppLive2DManager.nextModel.bind(lAppLive2DManager),
        nextRandomModel: lAppLive2DManager.nextRandomModel.bind(lAppLive2DManager),
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
