# Live2d + TypeScript + Vite

基于 Live2d SDK 4.x 实现, 在官方给的 demo 上修改

# 视线跟踪设定

在 Model3.json 增加参数映射 Mapper 字段

```Json
{
    "Version": 3,
    "FileReferences": {
        "Moc": "FileReferences_Moc_0.moc3",
        "Textures": [
            "FileReferences_Textures_0_0.png",
        ],
        "Physics": "FileReferences_Physics_0.json",
        "Mapper": "Param_Mapper.json",
        "Motions": {
            "Idle": [
                {
                    "File": "FileReferences_Motions_Idle_0_File_0.json"
                }
            ],
            ...
        }
    },
    ...
}
```

Param_Mapper.json 参数映射文件实现, 文件中 Id 不用修改, 改 Value 为对应的参数即可,
如果没有实现 Param_Mapper.json 那么 id 值就是默认参数

```Json
{
  "Meta": {
    "MapperCount": 6
  },
  "Mapper": [
    {
      "Value": "PARAM_ANGLE_X",
      "Id": "ParamAngleX"
    },
    {
      "Value": "PARAM_ANGLE_Y",
      "Id": "ParamAngleY"
    },
    {
      "Value": "PARAM_ANGLE_Z",
      "Id": "ParamAngleZ"
    },
    {
      "Value": "PARAM_BODY_ANGLE_X",
      "Id": "ParamBodyAngleX"
    },
    {
      "Value": "PARAM_EYE_BALL_X",
      "Id": "ParamEyeBallX"
    },
    {
      "Value": "PARAM_EYE_BALL_Y",
      "Id": "ParamEyeBallY"
    }
  ]
}
```

# 模型命中检测

在 Model3.json 中 HitAreas 里面添加 Motion 字段, 点击 HitAreas  Name 区域, 将自动获取 Motions 字段下对应的 Motion, 并执行

```Json
{
    "Version": 3,
    "FileReferences": {
        "Moc": "FileReferences_Moc_0.moc3",
        "Textures": [
            "FileReferences_Textures_0_0.png",
        ],
        "Physics": "FileReferences_Physics_0.json",
        "Mapper": "Param_Mapper.json",
        "Motions": {
            "Idle": [
                {
                    "File": "FileReferences_Motions_Idle_0_File_0.json"
                }
            ],
            "1": [
                {
                    "File": "FileReferences_Motions_Id_favor1_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_1_0_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor1_2_0_File_0.json",
                    "Sound": "FileReferences_Motions_1_1_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor1_3_0_File_0.json",
                    "Sound": "FileReferences_Motions_1_2_Sound_0.mp3"
                }
            ],
            "2": [
                {
                    "File": "FileReferences_Motions_Id_favor2_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_2_0_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor3_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_2_1_Sound_0.mp3"
                }
            ],
            "3": [
                {
                    "File": "FileReferences_Motions_Id_favor4_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_3_0_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor5_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_3_1_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor6_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_3_2_Sound_0.mp3"
                }
            ]
        }
    },
    "HitAreas": [
        {
            "Name": "head",
            "Id": "HitArea",
            "Motion": "1"
        },
        {
            "Name": "body",
            "Id": "HitArea2",
            "Motion": "2"
        },
        {
            "Name": "tui",
            "Id": "HitArea3",
            "Motion": "3"
        }
    ]
}
```

# 口形同步

在 Model3.json 文件中 Motions 字段下对应动作, 添加 Sound 字段, 以及 Groups 字段
Motions 还可以添加字幕 Text 通过 emitter.on('message', (text: string) => {}) 监听

```Json
{
    "Version": 3,
    "FileReferences": {
        ...
        "Motions": {
            "Idle": [
                {
                    "File": "FileReferences_Motions_Idle_0_File_0.json"
                }
            ],
            "1": [
                {
                    "File": "FileReferences_Motions_Id_favor1_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_1_0_Sound_0.mp3",
                    "Text": "这是一段字幕"
                },
                {
                    "File": "FileReferences_Motions_Id_favor1_2_0_File_0.json",
                    "Sound": "FileReferences_Motions_1_1_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor1_3_0_File_0.json",
                    "Sound": "FileReferences_Motions_1_2_Sound_0.mp3"
                }
            ],
            "2": [
                {
                    "File": "FileReferences_Motions_Id_favor2_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_2_0_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor3_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_2_1_Sound_0.mp3"
                }
            ],
            "3": [
                {
                    "File": "FileReferences_Motions_Id_favor4_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_3_0_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor5_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_3_1_Sound_0.mp3"
                },
                {
                    "File": "FileReferences_Motions_Id_favor6_1_0_File_0.json",
                    "Sound": "FileReferences_Motions_3_2_Sound_0.mp3"
                }
            ]
        }
    },
    "Groups": [
        {
            "Target": "Parameter",
            "Name": "LipSync",
            "Ids": [
                "PARAM_MOUTH_OPEN_Y"
            ]
        },
        {
            "Target": "Parameter",
            "Name": "EyeBlink",
            "Ids": [
                "PARAM_EYE_L_OPEN",
                "PARAM_EYE_R_OPEN"
            ]
        }
    ]
    ...
}
```

# 教程

在HTML文档中引用官方 [Cubism Core for Web](https://www.live2d.com/download/cubism-sdk/download-web/) 

```Html
<script src="./Core/live2dcubismcore.min.js"></script>
```

安装

```Cmd
npm install live2d-library

yarn add live2d-library
```

使用 [demo](https://live2d-library-dome.vercel.app) 查看 demo 需要翻墙  [Github demo](https://github.com/LingHanChuJian/live2d-library-dome)

```TypeScript
import live2d from 'live2d-library'

interface Live2dOptions {
    canvas: HTMLCanvasElement
    models: string[]
    scale?: number
    centerPosition?: [number, number]
}

interface Live2dReturn {
    emitter: Emitter<Events>
    nextModel: () => void
    nextRandomModel: () => void
    onResize: () => void
    setScale: (scale: number) => void
    release: () => void
}

live2d(options: Live2dOptions)
```

## 浏览器支持列表

| 平台 | 浏览器 | 版本号 |
| --- | --- | --- |
| Android | Google Chrome | 90.0.4430.210 |
| Android | Microsoft Edge | 46.04.4.5157 |
| Android | Mozilla Firefox | 88.1.4 |
| iOS / iPadOS | Google Chrome | 90.0.4430.216 |
| iOS / iPadOS | Microsoft Edge | 46.3.13 |
| iOS / iPadOS | Mozilla Firefox | 33.1 |
| iOS / iPadOS | Safari | 14.1 |
| macOS | Google Chrome | 91.0.4472.77 |
| macOS | Microsoft Edge | 90.0.818.66 |
| macOS | Mozilla Firefox | 88.0.1 |
| macOS | Safari | 14.1 |
| Windows | Google Chrome | 91.0.4472.77 |
| Windows | Internet Explorer 11 | 19041.928 |
| Windows | Microsoft Edge | 90.0.818.66 |
| Windows | Mozilla Firefox | 88.0.1 |
