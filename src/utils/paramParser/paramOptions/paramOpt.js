/**
 * 建筑参数配置
 */
export default class ParamOpt {
    /**
     * @param {Number} pos 参数相对位置（在DataView中的字节偏移量/4）
     */
    constructor(pos) {
        this.pos = pos;
    }
    /**
     * @param {Number} pos 参数相对位置（在DataView中的字节偏移量/4）
     */
    static of(pos) {
        return new ParamOpt(pos);
    }
    /**
     * @param {DataView} v 
     * @param value 属性值
     */
    setParam(v, value) {
        setParam(v, this.pos, value);
    }
    /**
     * @param {DataView} v 
     */
    getParam(v) {
        return getParam(v, this.pos);
    }
}

export function setParam(v, pos, value) {
    v.setInt32(pos * Int32Array.BYTES_PER_ELEMENT, value, true);
}

export function getParam(v, pos) {
    return v.getInt32(pos * Int32Array.BYTES_PER_ELEMENT, true);
}