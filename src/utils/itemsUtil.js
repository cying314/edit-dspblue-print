import { items } from "@/data/itemsData";
export const itemsMap = new Map();
for (const i of items) {
    itemsMap.set(i.id, i);
}
/** 是否 传送带 */
export function isBelt(id) { return id >= 2001 && id <= 2003; }

/** 是否 分拣器 */
export function isInserter(id) { return id >= 2011 && id <= 2013; }

/** 制造厂类建筑(需指定制造配方的建筑) */
export const allAssemblers = new Set([
    2303, // 制造台 Mk.I
    2304, // 制造台 Mk.II
    2305, // 制造台 Mk.III
    2302, // 电弧熔炉
    2315, // 位面熔炉
    2308, // 原油精炼厂
    2309, // 化工厂
    2317, // 量子化工厂
    2310, // 微型粒子对撞机
]);

/** 是否 制造厂类建筑(需指定制造配方的建筑) */
export function isAssemble(id) { return allAssemblers.has(id); }

/** 是否 储物仓 */
export function isStorage(id) { return id === 2101 || id === 2102; }

/** 是否 矩阵研究站 */
export function isLab(id) { return id === 2901 || id === 2902; }

/** 是否 运输站类建筑（物流运输站、大型采矿机） */
export function isStation(id) { return id === 2103 || id === 2104 || id === 2316; }

/** 是否 四向分流器 */
export function isSplitter(id) { return id === 2020; }



/** 是否 储液罐 */
export function isTank(id) {
    return id === 2106;
}
/** 是否 电磁轨道弹射器 */
export function isEjector(id) {
    return id === 2311;
}
/** 是否 射线接收站 */
export function isRayReciver(id) {
    return id === 2208;
}
/** 是否 能量枢纽 */
export function isEnergyExchanger(id) {
    return id === 2209;
}
/** 是否 流速监测器 */
export function isMonitor(id) {
    return id === 2030;
}
/** 是否 物流配送器 */
export function isDistributor(id) {
    return id === 2107;
}
