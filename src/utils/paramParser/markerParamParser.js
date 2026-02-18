import DefaultParamParser, { setParam, int32ArrayToBase64 } from "./defaultParamParser";

/**
 * 信标参数解析器
 */
export default class MarkerParamParser extends DefaultParamParser {
    /**
     * 获取参数长度（每单位：4字节）
     * @param {Object} p 建筑参数
     */
    getLength() {
        return 2048; // 信标参数固定2048长度
    }
    /**
     * @param {Object} p 建筑参数
     * @param {DataView} v 
     */
    encode(p, v) {
        super.encode(p, v);
        setParam(v, 0, p.color);
        setParam(v, 1, p.height * 100);
        setParam(v, 2, p.radius * 100);
        setParam(v, 3, p.visibility);
        setParam(v, 4, p.detailLevel);
        setParam(v, 5, p.icon);
        setParam(v, 6, p.ipAddress ?? 0);
    }
    /**
     * @param {DataView} v 
     * @return {Object} 建筑参数
     */
    decode(v) {
        const _defaultParams = super.decodeInt32Array(v);
        const p = {
            // _defaultParams,
            _defaultParamsBase64: int32ArrayToBase64(_defaultParams),
        };
        p.color = _defaultParams[0]; // 颜色索引
        p.height = _defaultParams[1] / 100; // 投影高度
        p.radius = _defaultParams[2] / 100; // 投影半径
        p.visibility = _defaultParams[3]; // 标记等级 -> 0:离线 1:视野范围内 2:本地星球 3:本地星系 4:全星区
        p.detailLevel = _defaultParams[4]; // 信息等级 -> 0:不常显信息 1:常显图标 2:常显标题 3:常显待办事项
        p.icon = _defaultParams[5]; // 图标ID
        return p;
    }
}
