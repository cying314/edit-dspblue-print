/**
 * 默认建筑参数解析器
 */
export default class DefaultParamParser {
    /**
     * 获取参数长度（每单位：4字节）
     * @param {Object} p 建筑参数
     */
    getLength(p) {
        if (typeof p._defaultParamsBase64 == 'string' && p._defaultParamsBase64) {
            return base64ToInt32Array(p._defaultParamsBase64).length;
        } else if (p._defaultParams instanceof Int32Array) {
            return p._defaultParams.length;
        } else if (p._defaultParams) {
            return Object.keys(p._defaultParams).length;
        } else {
            return 0;
        }
    }
    /**
     * @param {Object} p 建筑参数
     * @param {DataView} v 
     */
    encode(p, v) {
        if (typeof p._defaultParamsBase64 == 'string' && p._defaultParamsBase64) {
            const arr = base64ToInt32Array(p._defaultParamsBase64);
            for (let i = 0; i < arr.length; i++) {
                setParam(v, i, arr[i]);
            }
        } else {
            for (let i = 0; i < this.getLength(p); i++) {
                setParam(v, i, p._defaultParams[i]);
            }
        }
    }
    /**
     * @param {DataView} v 
     * @return {Object} 建筑参数
     */
    decode(v) {
        const _defaultParams = this.decodeInt32Array(v);
        const p = {
            // _defaultParams,
            _defaultParamsBase64: int32ArrayToBase64(_defaultParams),
        };
        return p;
    }
    /**
     * @param {DataView} v 
     * @return {Object} 建筑参数
     */
    decodeInt32Array(v) {
        const arr = new Int32Array(v.byteLength / Int32Array.BYTES_PER_ELEMENT);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = getParam(v, i);
        }
        return arr;
    }
}

export function setParam(v, pos, value) {
    v.setInt32(pos * Int32Array.BYTES_PER_ELEMENT, value, true);
}

export function getParam(v, pos) {
    return v.getInt32(pos * Int32Array.BYTES_PER_ELEMENT, true);
}

export function int32ArrayToBase64(arr) {
    const u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    return btoa(String.fromCharCode.apply(null, u8));
}

export function base64ToInt32Array(b64) {
    const binary = atob(b64);
    const u8 = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new Int32Array(u8.buffer, u8.byteOffset, Math.floor(u8.byteLength / Int32Array.BYTES_PER_ELEMENT));
}