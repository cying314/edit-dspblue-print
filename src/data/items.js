import { items } from './itemsData';
export const itemsMap = new Map();
for (const i of items) {
    itemsMap.set(i.id, i);
}
export function isBelt(id) {
    return id >= 2001 && id <= 2003;
}
export function isInserter(id) {
    return id >= 2011 && id <= 2013;
}
export function isStation(id) {
    return id === 2103 || id === 2104 || id === 2316;
}
export function isInterstellarStation(id) {
    return id === 2104;
}
export function isSplitter(id) {
    return id === 2020;
}
export function isLab(id) {
    return id === 2901;
}
export function isStorage(id) {
    return id === 2101 || id === 2102;
}
export function isTank(id) {
    return id === 2106;
}
export function isEjector(id) {
    return id === 2311;
}
export function isRayReciver(id) {
    return id === 2208;
}
export function isEnergyExchanger(id) {
    return id === 2209;
}
export function isAdvancedMiningMachine(id) {
    return id === 2316;
}
export function isMonitor(id) {
    return id === 2030;
}
export const allAssemblers = new Set([
    2303, // 制造台
    2304,
    2305,
    2302, // 电弧熔炉
    2315, // 位面熔炉
    2308, // 原油精炼厂
    2309, // 化工厂
    2310, // 对撞机
    2312, // 垂直发射井
]);