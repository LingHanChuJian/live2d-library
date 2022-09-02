/**
 * https://segmentfault.com/a/1190000041523667?utm_source=sf-similar-article
 * https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/AudioWorkletProcessor
 */
export declare class LAppAudioFileHandler {
    private static instance;
    static getInstance(): LAppAudioFileHandler;
    static releaseInstance(): void;
    private _audioContext;
    private _audioWorkletNode;
    private _audioSource;
    private _volume;
    constructor();
    loadAudioFile(filePath: string): void;
    getVolume(): number;
    release(): void;
}
