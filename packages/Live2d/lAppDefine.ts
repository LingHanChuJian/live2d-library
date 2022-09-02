import { LogLevel } from '../Framework/src/live2dcubismframework'

export class LAppDefine {
    public static ViewScale = 1.0
    public static ViewMaxScale = 4.0
    public static ViewMinScale = 0.1
    
    public static ViewLogicalLeft = -1.0
    public static ViewLogicalRight = 1.0
    public static ViewLogicalBottom = -1.0
    public static ViewLogicalTop = 1.0

    public static ViewLogicalMaxLeft = -2.0
    public static ViewLogicalMaxRight = 2.0
    public static ViewLogicalMaxBottom = -2.0
    public static ViewLogicalMaxTop = 2.0

    public static MotionGroupIdle = 'Idle'

    public static PriorityNone = 0
    public static PriorityIdle = 1
    public static PriorityNormal = 2
    public static PriorityForce = 3

    public static DebugLogEnable = false
    public static DebugTouchLogEnable = false

    public static CubismLoggingLevel = LogLevel.LogLevel_Verbose

    public static Canvas = document.createElement('canvas')
    public static Models: string[] = []
}
