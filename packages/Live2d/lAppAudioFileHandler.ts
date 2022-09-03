/**
 * https://segmentfault.com/a/1190000041523667?utm_source=sf-similar-article
 * https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/AudioWorkletProcessor
 */ 

 const rmsProcessor = `
 const SMOOTHING_FACTOR = 0.8
 const FRAME_PER_SECOND = 60
 const FRAME_INTERVAL = 1 / FRAME_PER_SECOND
 
 class RmsProcessor extends AudioWorkletProcessor {
    constructor() {
        super()
 
        this._lastUpdate = Date.now()
        this._volume = 0
    }
 
    calculateRms(inputChannelData) {
        let total = 0
        for (let i = 0; i < inputChannelData.length; i++) {
            total += inputChannelData[i] * inputChannelData[i]
        }
 
        const rms = Math.sqrt(total / inputChannelData.length)
        this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR)
    }
 
    process(inputs, outputs, parameters) {
        const inputChannelData = inputs[0][0]
        
        if (inputChannelData) {
            const currentTime = Date.now()
            if (currentTime - this._lastUpdate > FRAME_INTERVAL) {
                this.calculateRms(inputChannelData)
                this.port.postMessage(this._volume)
                this._lastUpdate = currentTime
            }
        } else {
            this.port.postMessage(0.0)
        }
 
        return true
    }
 }
 registerProcessor("rms-processor", RmsProcessor)
 `

export class LAppAudioFileHandler {
    private static instance: LAppAudioFileHandler | null = null

    public static getInstance() {
        if (this.instance === null) {
            this.instance = new LAppAudioFileHandler()
        }
        return this.instance
    }

    public static releaseInstance() {
        if (this.instance !== null) {
            this.instance = null
        }
    }

    private _audioContext: AudioContext | null
    private _audioWorkletNode: AudioWorkletNode | null
    private _audioSource: AudioBufferSourceNode | null
    private _volume: number

    constructor() {
        this._audioContext = null
        this._audioWorkletNode = null
        this._audioSource = null

        this._volume = 0.0
    }

    public loadAudioFile(filePath: string, onFinishedAudioHandler?: () => void) {
        (async () => {
            const arrayBuffer = await fetch(filePath).then(response => response.arrayBuffer())

            if (!this._audioContext) {
                this._audioContext = new AudioContext()

                // 如果浏览器出现崩溃现象 那么开启下面这行代码
                // this._audioContext.resume()

                await this._audioContext.audioWorklet.addModule(URL.createObjectURL(new Blob([rmsProcessor], { type: 'application/javascript' })))
            }

            const audioBuffer = await this._audioContext.decodeAudioData(arrayBuffer)

            this._audioWorkletNode = new AudioWorkletNode(this._audioContext, 'rms-processor')

            this._audioWorkletNode.port.onmessage = (e) => {
                this._volume = e.data
            }

            this._audioSource = this._audioContext.createBufferSource()

            this._audioSource.connect(this._audioWorkletNode)
            this._audioSource.connect(this._audioContext.destination)
            this._audioWorkletNode.connect(this._audioContext.destination)
            this._audioSource.buffer = audioBuffer
            this._audioSource.start()

            if (onFinishedAudioHandler) { onFinishedAudioHandler() }
        })()
    }

    public getVolume() {
        return this._volume
    }

    public release() {
        if (this._audioContext) {
            this._audioContext.close()

            this._audioContext = null
        }
    }
}
