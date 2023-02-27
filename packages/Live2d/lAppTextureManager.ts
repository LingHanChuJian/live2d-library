import { csmVector } from '@Framework/type/csmvector'

export interface TextureInfo {
    id: WebGLTexture
    img: HTMLImageElement
    width: number
    height: number
    usePremultply: boolean
    fileName: string
}

export class LAppTextureManager {
    private _canvas: HTMLCanvasElement
    private _gl: WebGLRenderingContext

    private _textures: csmVector<TextureInfo> | null

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl') as WebGLRenderingContext
        if (!this._gl) {
            throw new Error('Cannot initialize WebGL. This browser does not support.')
        }

        this._textures = new csmVector<TextureInfo>()
    }

    public createTextureFromPngFile(
        fileName: string,
        usePremultiply: boolean,
        callback: (textureInfo: TextureInfo) => void
    ) {
        for (let ite = this._textures!.begin(); ite.notEqual(this._textures!.end()); ite.preIncrement()) {
            if (ite.ptr().fileName == fileName && ite.ptr().usePremultply == usePremultiply) {
                ite.ptr().img = new Image()
                ite.ptr().img.onload = (): void => callback(ite.ptr())
                ite.ptr().img.src = fileName
                return
            }
        }

        const img = new Image()
        img.onload = () => {
            const tex = this._gl.createTexture()
            if (!tex) {
                throw new Error('Cannot initialize WebGLTexture')
            }
            this._gl.bindTexture(this._gl.TEXTURE_2D, tex)
            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR_MIPMAP_LINEAR)
            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR)

            if (usePremultiply) {
                this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
            }

            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, img)
            this._gl.generateMipmap(this._gl.TEXTURE_2D)
            this._gl.bindTexture(this._gl.TEXTURE_2D, null)

            const textureInfo: TextureInfo = {
                fileName,
                width: img.width,
                height: img.height,
                id: tex,
                img,
                usePremultply: usePremultiply
            }
            this._textures!.pushBack(textureInfo)
            callback(textureInfo)
        }
        img.src = fileName
    }

    public release() {
        for (let ite = this._textures!.begin(); ite.notEqual(this._textures!.end()); ite.preIncrement()) {
            this._gl.deleteTexture(ite.ptr().id)
        }
        this._textures = null
    }
}