import { csmVector } from '@Framework/type/csmvector';
import { Value } from '@Framework/utils/cubismjson';
import { CubismModelSettingJson } from '@Framework/cubismmodelsettingjson'

// JSON Keys
const FileReferences = 'FileReferences'
const HitAreas = 'HitAreas'
const Mapper = 'Mapper'
const Motions = 'Motions'
const Motion = 'Motion'
const Text = 'Text'

enum FrequestNode {
    FrequestNode_Motions,
    FrequestNode_HitAreas,
    FrequestNode_Mapper // getRoot().getValueByString(FileReferences).getValueByString(Mapper)
}

export class CubismModelSettingJsonExtension extends CubismModelSettingJson {
    private _settingJson
    private _settingJsonValue
    constructor(buffer: ArrayBuffer, size: number) {
        super(buffer, size)

        this._settingJson = this.GetJson()

        if (this._settingJson) {
            this._settingJsonValue = new csmVector<Value>();

            this._settingJsonValue.pushBack(
                this._settingJson
                  .getRoot()
                  .getValueByString(FileReferences)
                  .getValueByString(Motions)
            );

            this._settingJsonValue.pushBack(this._settingJson.getRoot().getValueByString(HitAreas));

            this._settingJsonValue.pushBack(
                this._settingJson
                    .getRoot()
                    .getValueByString(FileReferences)
                    .getValueByString(Mapper)
            )
        }
    }

    private isExisMapperFile(): boolean {
        const node: Value = this._settingJsonValue!.at(FrequestNode.FrequestNode_Mapper);
        return !node.isNull() && !node.isError()
    }

    private isExistMotionGroupName2(groupName: string): boolean {
        const node: Value = this._settingJsonValue!
            .at(FrequestNode.FrequestNode_Motions)
            .getValueByString(groupName);
        return !node.isNull() && !node.isError();
    }

    public getMapperFileName(): string {
        if (!this.isExisMapperFile()) {
          return '';
        }
        return this._settingJsonValue!.at(FrequestNode.FrequestNode_Mapper).getRawString()
    }

    /**
     * 获取 HitArea 下的 Motion
     * @param index HitArea 列表下标
     * @returns Motion 
     */
    public getHitAreaMotion(index: number): string {
        return this._settingJsonValue!
          .at(FrequestNode.FrequestNode_HitAreas)
          .getValueByIndex(index)
          .getValueByString(Motion)
          .getRawString();
    }


    /**
     * 获取 motion 下的 Text
     * @param groupName motion group 名称
     * @param index motion 下标
     * @returns Text
     */
    public getMotionText(groupName: string, index: number): string {
        if (!this.isExistMotionGroupName2(groupName)) {
            return '';
        }

        return this._settingJsonValue!
        .at(FrequestNode.FrequestNode_Motions)
        .getValueByString(groupName)
        .getValueByIndex(index)
        .getValueByString(Text)
        .getRawString();
    }
}
