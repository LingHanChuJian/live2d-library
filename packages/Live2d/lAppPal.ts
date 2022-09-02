export class LAppPal {
    private static _deltaTime = 0.0
    private static _currentFrame = 0.0
    private static _lastFrame = 0.0

    public static lastUpdate = Date.now()

    public static printMessage(msg: string) {
        console.log(msg)
    }

    public static getDeltaTime() {
        return this._deltaTime
    }

    public static updateTime() {
        this._currentFrame = Date.now()
        this._deltaTime = (this._currentFrame - this._lastFrame) / 1000
        this._lastFrame = this._currentFrame
    }
}
