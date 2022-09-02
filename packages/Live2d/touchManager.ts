export class TouchManager {
    private _startY
    private _startX
    private _lastX
    private _lastY
    private _lastX1
    private _lastY1
    private _lastX2
    private _lastY2
    private _lastTouchDistance
    private _deltaX
    private _deltaY
    private _scale

    private _touchSingle: boolean
    private _flipAvailable: boolean

    constructor() {
        this._startX = 0.0
        this._startY = 0.0
        this._lastX = 0.0
        this._lastY = 0.0
        this._lastX1 = 0.0
        this._lastY1 = 0.0
        this._lastX2 = 0.0
        this._lastY2 = 0.0
        this._lastTouchDistance = 0.0
        this._deltaX = 0.0
        this._deltaY = 0.0
        this._scale = 1.0
        this._touchSingle = false
        this._flipAvailable = false
    }

    public getCenterX() {
        return this._lastX
    }

    public getCenterY() {
        return this._lastY
    }

    public getDeltaX() {
        return this._deltaX
    }

    public getDeltaY() {
        return this._deltaY
    }

    public getStartX() {
        return this._startX
    }

    public getStartY() {
        return this._startY
    }

    public getScale() {
        return this._scale
    }

    public getX() {
        return this._lastX
    }

    public getY() {
        return this._lastY
    }

    public getX1() {
        return this._lastX1
    }

    public getY1() {
        return this._lastY1
    }

    public getX2() {
        return this._lastX2
    }

    public getY2() {
        return this._lastY2
    }

    public isSingleTouch() {
        return this._touchSingle
    }

    public isFlickAvailable() {
        return this._flipAvailable
    }

    public disableFlick() {
        this._flipAvailable = false
    }

    public touchesBegan(deviceX: number, deviceY: number) {
        this._lastX = deviceX
        this._lastY = deviceY
        this._startX = deviceX
        this._startY = deviceY
        this._lastTouchDistance = -1.0
        this._flipAvailable = true
        this._touchSingle = true
    }

    public touchesMoved(deviceX: number, deviceY: number) {
        this._lastX = deviceX
        this._lastY = deviceY
        this._lastTouchDistance = -1.0
        this._touchSingle = true
    }

    public getFlickDistance() {
        return this.calculateDistance(this._startX, this._startY, this._lastX, this._lastY)
    }

    public calculateDistance(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
    }

    public calculateMovingAmount(v1: number, v2: number) {
        if (v1 > 0.0 !== v2 > 0.0) {
            return 0.0
        }

        const sign = v1 > 0.0 ? 1.0 : -1.0
        const absoluteValue1 = Math.abs(v1)
        const absoluteValue2 = Math.abs(v2)
        return (sign * (absoluteValue1 < absoluteValue2 ? absoluteValue1 : absoluteValue2))
    }
}
