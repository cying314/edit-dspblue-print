import DefaultParamParser from "./defaultParamParser";
import BoolParamOpt from "./paramOptions/boolParamOpt";
import FunParamOpt from "./paramOptions/funParamOpt";
import ParamOpt from "./paramOptions/paramOpt";
import ParamParser from "./paramParser";
import * as itemUtil from "../itemsUtil";

export function getParamParser(itemId) {
    if (itemUtil.isBelt(itemId)) {
        // 传送带
        return beltParamParser;
    } else if (itemUtil.isInserter(itemId)) {
        // 分拣器
        return inserterParamParser;
    } else if (itemUtil.isAssemble(itemId)) {
        // 制造厂类建筑(需指定制造配方的建筑)
        return assembleParamParser;
    } else if (itemUtil.isStorage(itemId)) {
        // 储物仓
        return storageParamParser;
    } else if (itemUtil.isLab(itemId)) {
        // 研究站
        return labParamParser;
    } else {
        const parameterParsers = new Map([
            [2103, logisticStationParamParser], // 行星内物流运输站
            [2104, interstellarStationParamParser], // 星际物流运输站
            [2316, advancedMiningMachineParamParser], // 大型采矿机
            [2020, splitterParamParser], // 四向分流器
            [2106, tankParamParser], // 储液罐
            [2311, ejectorParamParser], // 电磁轨道弹射器
            [2208, powerGeneratorParamParser], // 射线接收站
            [2209, energyExchangerParamParser], // 能量枢纽
            [2312, verticalLaunchingSiloParamParser], // 垂直发射井
            [2030, MonitorParamParser], // 流速监测器
            [2107, distributorParser], // 物流配送器
        ]);
        const parser = parameterParsers.get(itemId);
        if (parser !== undefined) return parser;
    }
    // 无匹配特定解析器，使用默认
    return unknownParamParser;
}

// 最大充能功率 MW -> 原始值
function workEnergyPerTickEncode(pv) { return Math.round(pv * 50000 / 3) }
// 最大充能功率 原始值 -> MW
function workEnergyPerTickDecode(ov) { return Math.round(ov / 5000 * 3) / 10 }

// 运输站类建筑 数据参数
const StationParamsMeta = {
    size: 2048, // 总长度
    base: 320, // 主参数偏移量
    storage: { base: 0, stride: 6 }, // 物品栏列表参数（首行偏移量，每行长度）
    slots: { base: 192, stride: 4 }, // 传送带接口列表参数（首行偏移量，每行长度）
};
/**
 * 获取 运输站类建筑 参数模板
 * @param {Object} desc {
 *   @param maxItemKind 最大物品栏位 
 *   @param numSlots 建筑传送带接口数目
 * }
 */
function getStationParamsOptions(desc) {
    const base = StationParamsMeta.base;
    const result = {
        storage: [], // 运输站物品栏位
        slots: [], // 传送带接口
        workEnergyPerTick: FunParamOpt.of(base + 0, workEnergyPerTickEncode, workEnergyPerTickDecode), // 最大充能功率(单位：MW) -> 30-300
        tripRangeOfDrones: FunParamOpt.of(base + 1, (pv) => {
            return Math.round(Math.sin((90 - pv) * Math.PI / 180) * 100000000);
        }, (ov) => {
            return 90 - Math.round(Math.asin(ov / 100000000) * 180 / Math.PI);
        }), // 运输机最远路程(单位：弧度) -> 20-180
        tripRangeOfShips: FunParamOpt.of(base + 2, (pv) => pv * 24000, (ov) => ov / 24000), // 运输船最远路程 -> 1-60:有限路程(单位：ly) 10000:无限
        includeOrbitCollector: BoolParamOpt.of(base + 3), // 是否会去轨道采集器取货 Boolean
        warpEnableDistance: FunParamOpt.of(base + 4, (pv) => pv * 40000, (ov) => ov / 40000), // 曲速启用路程(单位：AU) -> 0.5-60
        warperNecessary: BoolParamOpt.of(base + 5), // 是否翘曲器必备 Boolean
        deliveryAmountOfDrones: ParamOpt.of(base + 6), // 运输机起送量(单位：%) -> 1-100
        deliveryAmountOfShips: ParamOpt.of(base + 7), // 运输船起送量(单位：%) -> 1-100
        pilerCount: ParamOpt.of(base + 8), // 输出货物集装数量 -> 0:使用科技上限 1-4:指定数量
        miningSpeed: ParamOpt.of(base + 9), // 开采速度
        autoFillOfDrones: BoolParamOpt.of(base + 10, 1, 0), // 是否自动补充运输机 Boolean_1_0
        autoFillOfShips: BoolParamOpt.of(base + 11, 1, 0), // 是否自动补充运输船 Boolean_1_0
    };
    {
        const { base, stride } = StationParamsMeta.storage;
        for (let i = 0; i < desc.maxItemKind; i++) {
            result.storage.push({ // 运输站物品栏位
                itemId: ParamOpt.of(base + i * stride + 0), // 物品id
                localRole: ParamOpt.of(base + i * stride + 1), // 本地供需配置 -> 0:本地仓储 1:本地供应 2:本地需求
                remoteRole: ParamOpt.of(base + i * stride + 2), // 星际供需配置 -> 0:星际仓储 1:星际供应 2:星际需求
                max: ParamOpt.of(base + i * stride + 3), // 物品上限
                lockAmount: BoolParamOpt.of(base + i * stride + 4, 1, 0), // 锁定数量 Boolean_1_0
            });
        }
    }
    {
        const { base, stride } = StationParamsMeta.slots;
        for (let i = 0; i < desc.numSlots; i++) {
            result.slots.push({ // 传送带接口
                dir: ParamOpt.of(base + i * stride + 0), // 传送带接入方向 -> 0:未接入 1:输出 2:输入
                storageIdx: ParamOpt.of(base + i * stride + 1), // 输出货物对应物品栏索引 -> 0:不输出 1-5:物品栏索引 6:翘曲器
            });
        }
    }
    return result;
}

// 行星内物流运输站 ParamParser
export const logisticStationParamParser = new ParamParser(StationParamsMeta.size, getStationParamsOptions({
    maxItemKind: 4,
    numSlots: 12,
}));

// 星际物流运输站 ParamParser
export const interstellarStationParamParser = new ParamParser(StationParamsMeta.size, getStationParamsOptions({
    maxItemKind: 5,
    numSlots: 12,
}));

// 大型采矿机 ParamParser
export const advancedMiningMachineParamParser = new ParamParser(StationParamsMeta.size, getStationParamsOptions({
    maxItemKind: 1,
    numSlots: 9,
}));

const splitterPriority = [];
for (let i = 0; i < 4; i++) {
    splitterPriority[i] = BoolParamOpt.of(i, 1, 0); // 四向接口是否优先 Boolean_1_0
}
// 四向分流器 ParamParser
export const splitterParamParser = new ParamParser(6, {
    priority: splitterPriority,
});

// 矩阵研究站 ParamParser
export const labParamParser = new ParamParser(2, {
    researchMode: ParamOpt.of(0), // 研究模式 -> 0:未选择 1:矩阵合成 2:科研模式
    acceleratorMode: ParamOpt.of(1), // 增产效果 -> 0:额外产出 1:生产加速
});

// 制造厂类建筑(需指定制造配方的建筑) ParamParser
export const assembleParamParser = new ParamParser(1, {
    acceleratorMode: ParamOpt.of(0), // 增产效果 -> 0:额外产出 1:生产加速
});

// 传送带 ParamParser
export const beltParamParser = new ParamParser(2, {
    iconId: ParamOpt.of(0), // 图标标签物品id
    count: ParamOpt.of(1), // 图标标签下的数字
});

// 分拣器 ParamParser
export const inserterParamParser = new ParamParser(1, {
    length: ParamOpt.of(0), // 分拣器长度 -> 1-3
});

// 储液罐 ParamParser
export const tankParamParser = new ParamParser(2, {
    output: BoolParamOpt.of(0), // 是否输出 Boolean
    input: BoolParamOpt.of(1), // 是否输入 Boolean
});

// 储物仓 ParamParser
export const storageParamParser = new ParamParser(1, {
    automationLimit: ParamOpt.of(0), // 限制不可自动放入的格子数
});

// 电磁轨道弹射器 ParamParser
export const ejectorParamParser = new ParamParser(2, {
    orbitId: ParamOpt.of(0), // 送入轨道编号 -> 0:无 1-20:轨道列表编号
    tenfoldSpeed: BoolParamOpt.of(1, 1, 0), // 是否开启十倍射速 Boolean_1_0
});

// 射线接收站 ParamParser
export const powerGeneratorParamParser = new ParamParser(1, {
    productId: ParamOpt.of(0), // 模式 -> 0:直接发电 1208:光子生成
});

// 能量枢纽 ParamParser
export const energyExchangerParamParser = new ParamParser(1, {
    mode: ParamOpt.of(0), // 模式 -> -1:放电 0:待机 1:充电
});

// 垂直发射井 ParamParser
export const verticalLaunchingSiloParamParser = new ParamParser(1, {
    tenfoldSpeed: BoolParamOpt.of(0, 1, 0), // 是否开启十倍射速 Boolean_1_0
});

// 流速监测器 ParamParser
export const MonitorParamParser = new ParamParser(128, {
    targetBeltId: ParamOpt.of(0), // 绑定的传送带节点ID（实际id，不是蓝图index，疑似无效参数）
    offset: ParamOpt.of(1), // ?

    targetCargoAmount: ParamOpt.of(2), // 目标流量(单位：0.1个)
    periodTicksCount: ParamOpt.of(3), // 监测周期(单位：秒)
    passOperator: ParamOpt.of(4), // 监测条件 -> 0:等于 1:不等于 2:大于等于 3:大于 4:小于等于 5:小于
    passColorId: ParamOpt.of(5), // 满足条件颜色索引 -> 0-255
    failColorId: ParamOpt.of(6), // 不满足条件颜色索引 -> 0-255
    cargoFilter: ParamOpt.of(14), // 货物过滤物品id -> 0:不过滤 物品id->过滤
    spawnItemOperator: ParamOpt.of(20), // 生成/消耗货物模式 -> 0:不勾选 1:生成货物 2:消耗货物

    systemWarningMode: ParamOpt.of(10), // 系统警报模式 -> 0:无 1:未满足条件 2:满足条件 3:有货物响 4:无货物响 5:未满足且有货物 6:未满足且无货物
    systemWarningIconId: ParamOpt.of(17), // 系统警报图标id

    alarmMode: ParamOpt.of(12), // 声音警报模式 -> 0:无 1:未满足条件 2:满足条件 3:有货物响 4:无货物响 5:未满足且有货物 6:未满足且无货物
    tone: ParamOpt.of(7), // 声音警报-音色 -> 20-24:警报 1-2:钢琴 3-4:贝斯 5-6:风琴 7-9:铺底 10:铜管乐 11:梦铃 12:玻璃 13:吉他 14:音乐盒 15:电子琴 16:小号 17:小提琴 18:低音贝斯 19:鼓
    falloffRadius: [ // 声音警报-声音衰减范围
        FunParamOpt.of(18, (pv) => pv * 10, (ov) => ov / 10), // 开始衰减距离(单位：米) -> 默认为 衰减为0距离/3（0-133）
        FunParamOpt.of(19, (pv) => pv * 10, (ov) => ov / 10), // 衰减为0距离(单位：米) -> 1-400
    ],
    repeat: BoolParamOpt.of(11, 1, 0), // 声音警报-是否循环 Boolean_1_0
    pitch: ParamOpt.of(9), // 声音警报-音阶 -> 例：25:C2 26:C#2 27:D2 ...
    volume: ParamOpt.of(8), // 声音警报-音量 -> 0-100
    length: FunParamOpt.of(13, (pv) => pv * 10000, (ov) => ov / 10000), // 声音警报-时长(只有音色为警报时有该参数) -> 0.1-20
});

// 物流配送器 ParamParser
export const distributorParser = new ParamParser(128, {
    fromMyselfMode: ParamOpt.of(0), // 机甲供需模式 -> 1:从伊卡洛斯回收 2:向伊卡洛斯供应和回收 3:向伊卡洛斯供应
    fromOtherMode: ParamOpt.of(1), // 配送器间模式 -> 0:不勾选 1:向其他配送器供应 2:向其他配送器需求
    workEnergyPerTick: FunParamOpt.of(2, workEnergyPerTickEncode, workEnergyPerTickDecode), // 最大充能功率(单位：MW) -> 0.9-9
    autoFill: BoolParamOpt.of(3, 1, 0), // 是否自动补充运输单位 Boolean_1_0
});

// 默认 ParamParser
export const unknownParamParser = new DefaultParamParser();