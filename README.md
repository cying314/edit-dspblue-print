# DSP蓝图变换工具

### -  戴森球计划蓝图仙术工具

基于对戴森球计划游戏蓝图数据的解析与处理，实现对蓝图进行“垂直叠加”、“坐标偏移”、“水平翻转”、“线性变换”、“无带流”等转换的实用功能，并提供快捷、界面化的蓝图数据与JSON间的转换功能。

- 项目框架：Vue2

- 蓝图数据解析参考：

> https://github.com/Wesmania/dspbp

> https://github.com/huww98/dsp_blueprint_editor

- 在线访问地址：

> https://cying.xyz/DSP/editBluePrint/

- b站演示视频：

> https://www.bilibili.com/video/BV138411x7Sn/

> https://www.bilibili.com/video/BV1kr4y1V73y/

- 页面截图：

## ![页面截图](https://gitee.com/cying314/edit-dspblue-print/raw/master/README.assets/index.png)



### <span id="蓝图数据字典">蓝图数据字典</span>

> **数据主体**

| 字段                    | 字段类型                      | 索引/长度                   | 备注                                                         |
| ----------------------- | ----------------------------- | --------------------------- | ------------------------------------------------------------ |
|                         |                               | *cells* **数组索引**        | 截取从 `BLUEPRINT:` 后到首个 `"` 间的字符串<br />逗号分割为数组*cells* |
| header                  | Object                        |                             | 蓝图文件头部信息                                             |
| -	layout             | Number                        | *cells[1]*                  | 蓝图图标布局                                                 |
| -	icons              | Array(5)                      |                             | 蓝图图标                                                     |
| -	-	*_array_item* | Number                        | *cells[2 - 6]*              |                                                              |
| -	time               | Date                          | *cells[8]*                  | 创建时间                                                     |
| -	gameVersion        | String                        | *cells[9]*                  | 游戏版本号                                                   |
| -	shortDesc          | String                        | *cells[10]*                 | 缩略图文字                                                   |
| -	desc               | String                        | *cells[11]*                 | 蓝图介绍                                                     |
|                         |                               | **长度(字节)**              | 首个 `"` 到第二个 `"` 间的字符串解析为字节流<br />**以下按蓝图数据按字节流从左到右排列** |
| version                 | Number                        | 4                           | 一般为1                                                      |
| cursorOffset            | Object                        |                             | 预览蓝图时的鼠标锚点偏移                                     |
| -	x                  | Number                        | 4                           |                                                              |
| -	y                  | Number                        | 4                           |                                                              |
| cursorTargetArea        | Number                        | 4                           | 对应areas索引，一般为0                                       |
| dragBoxSize             | Object                        |                             | 长按鼠标拖拽复制建筑时，间隔的长宽<br />一般与*areas.size*相同 |
| -	x                  | Number                        | 4                           |                                                              |
| -	y                  | Number                        | 4                           |                                                              |
| primaryAreaIdx          | Number                        | 4                           | 对应areas索引，一般为0                                       |
| numAreas                | -                             | 1                           | areas数组长度（仅读取），一般为1                             |
| areas                   | Array(*numAreas*)             |                             |                                                              |
| -	*_array_item*      | **[AREA](#area对象)**         | 14                          |                                                              |
| numBuildings            | -                             | 4                           | buildings数组长度（仅读取）                                  |
| buildings               | Array(*numBuildings*)         |                             | 建筑信息                                                     |
| -	*_array_item*      | **[BUILDING](#building对象)** | 61 + *_parameterLength* * 4 |                                                              |



#### <span id="area对象">**AREA对象**</span>

| 字段              | 字段类型 | 长度(字节) | 备注                 |
| ----------------- | -------- | ---------- | -------------------- |
| index             | Number   | 1          | 数组索引             |
| parentIndex       | Number   | 1          |                      |
| tropicAnchor      | Number   | 2          |                      |
| areaSegments      | Number   | 2          |                      |
| anchorLocalOffset | Object   |            |                      |
| -	x            | Number   | 2          |                      |
| -	y            | Number   | 2          |                      |
| size              | Object   |            | 所有建筑的包围盒长宽 |
| -	x            | Number   | 2          |                      |
| -	y            | Number   | 2          |                      |



#### <span id="building对象">**BUILDING对象**</span>

##### [2024/11/30后]：游戏版本V0.10.31.24646简化蓝图结构

> 变化描述：

1. 版本标识`num`改为-101
2. 移动`itemId`、`modelIndex`顺序
3. `localOffset[1]`、`yaw[1]`改为分拣器独有
4. `tilt`改为分拣器和传送带独有
5. 分拣器建筑增加`pitch`、`tilt2`、`pitch2`属性

| 字段             | 字段类型                | 长度(字节)            | 备注                                                         |
| ---------------- | ----------------------- | --------------------- | ------------------------------------------------------------ |
| num              | Number                  | 4                     | 固定值-101，用以标识蓝图版本[V0.10.31.24646后蓝图版本标识]   |
| index            | Number                  | 4                     | 数组索引                                                     |
| itemId           | Number                  | 2                     | 建筑id                                                       |
| itemName         | String                  | -                     | 建筑名称                                                     |
| modelIndex       | Number                  | 2                     | 模型id                                                       |
| areaIndex        | Number                  | 1                     | 对应areas索引，一般为0                                       |
| localOffset[0].x | Number                  | 4                     | 建筑物相对坐标x                                              |
| localOffset[0].y | Number                  | 4                     | 建筑物相对坐标y                                              |
| localOffset[0].z | Number                  | 4                     | 建筑物相对坐标z                                              |
| yaw[0]           | Number                  | 4                     | 建筑物旋转角度（单位：角度）                                 |
| tilt             | Number                  | 4                     | 建筑物倾斜角度（单位：角度）<br />*传送带建筑`(2000<itemId<2010)`、分拣器建筑`(2010<itemId<2020)`独有 |
| pitch            | Number                  | 4                     | 分拣器起始点朝向（单位：角度）[V0.10.31.24646版本新增]<br />*分拣器建筑`(2010<itemId<2020)`独有 |
| localOffset[1].x | Number                  | 4                     | 分拣器目标点相对坐标x<br />*分拣器建筑`(2010<itemId<2020)`独有 |
| localOffset[1].y | Number                  | 4                     | 分拣器目标点相对坐标y<br />*分拣器建筑`(2010<itemId<2020)`独有 |
| localOffset[1].z | Number                  | 4                     | 分拣器目标点相对坐标z<br />*分拣器建筑`(2010<itemId<2020)`独有 |
| yaw[1]           | Number                  | 4                     | 分拣器目标点旋转角度（单位：角度）<br />*分拣器建筑`(2010<itemId<2020)`独有 |
| tilt2            | Number                  | 4                     | 分拣器目标点倾斜角度（单位：角度）[V0.10.31.24646版本新增]<br />*分拣器建筑`(2010<itemId<2020)`独有 |
| pitch2           | Number                  | 4                     | 分拣器目标点朝向（单位：角度）[V0.10.31.24646版本新增]<br />*分拣器建筑`(2010<itemId<2020)`独有 |
| outputObjIdx     | Number                  | 4                     | 输出端目标建筑索引                                           |
| inputObjIdx      | Number                  | 4                     | 输入端目标建筑索引                                           |
| outputToSlot     | Number                  | 1                     | 输出端绑定到目标建筑的插槽索引                               |
| inputFromSlot    | Number                  | 1                     | 输入端绑定到目标建筑的插槽索引                               |
| outputFromSlot   | Number                  | 1                     | (建筑物自身属性)                                             |
| inputToSlot      | Number                  | 1                     | (建筑物自身属性)                                             |
| outputOffset     | Number                  | 1                     | 输出端插槽偏移，常见于分拣器                                 |
| inputOffset      | Number                  | 1                     | 输入端插槽偏移，常见于分拣器                                 |
| recipeId         | Number                  | 2                     | 配方id，常见于制造厂类建筑                                   |
| filterId         | Number                  | 2                     | 过滤物品id，常见于分拣器、四向                               |
| parameterLength  | -                       | 2                     | parameters长度（每单位：4字节）                              |
| parameters       | **[PARAM](#param对象)** | *parameterLength* * 4 | 建筑配置参数                                                 |



##### [2024/05/29后]：游戏版本V0.10.30.22239新增倾斜字段

> 变化描述：

1. 增加版本标识`num`，固定值-100
2. 建筑增加`tilt`属性

| 字段               | 字段类型                | 长度(字节)            | 备注                                                 |
| ------------------ | ----------------------- | --------------------- | ---------------------------------------------------- |
| num                | Number                  | 4                     | 固定值-100，用以标识蓝图版本[V0.10.30.22239版本新增] |
| index              | Number                  | 4                     | 数组索引                                             |
| areaIndex          | Number                  | 1                     | 对应areas索引，一般为0                               |
| localOffset        | Array(2)                |                       | 建筑物相对坐标                                       |
| -	*_array_item* | Object                  |                       |                                                      |
| -	-	x        | Number                  | 4                     |                                                      |
| -	-	y        | Number                  | 4                     |                                                      |
| -	-	z        | Number                  | 4                     |                                                      |
| yaw                | Array(2)                |                       | 建筑物旋转角度（单位：角度）                         |
| -	*_array_item* | Number                  | 4                     |                                                      |
| tilt               | Number                  | 4                     | 建筑物倾斜角度（单位：角度）[V0.10.30.22239版本新增] |
| itemId             | Number                  | 2                     | 建筑id                                               |
| itemName           | String                  | -                     | 建筑名称                                             |
| modelIndex         | Number                  | 2                     | 模型id                                               |
| outputObjIdx       | Number                  | 4                     | 输出端目标建筑索引                                   |
| inputObjIdx        | Number                  | 4                     | 输入端目标建筑索引                                   |
| outputToSlot       | Number                  | 1                     | 输出端绑定到目标建筑的插槽索引                       |
| inputFromSlot      | Number                  | 1                     | 输入端绑定到目标建筑的插槽索引                       |
| outputFromSlot     | Number                  | 1                     | (建筑物自身属性)                                     |
| inputToSlot        | Number                  | 1                     | (建筑物自身属性)                                     |
| outputOffset       | Number                  | 1                     | 输出端插槽偏移，常见于分拣器                         |
| inputOffset        | Number                  | 1                     | 输入端插槽偏移，常见于分拣器                         |
| recipeId           | Number                  | 2                     | 配方id，常见于制造厂类建筑                           |
| filterId           | Number                  | 2                     | 过滤物品id，常见于分拣器、四向                       |
| parameterLength    | -                       | 2                     | parameters长度（每单位：4字节）                      |
| parameters         | **[PARAM](#param对象)** | *parameterLength* * 4 | 建筑配置参数                                         |



##### [2024/05/29前]：早期蓝图版本

| 字段               | 字段类型                | 长度(字节)            | 备注                            |
| ------------------ | ----------------------- | --------------------- | ------------------------------- |
| index              | Number                  | 4                     | 数组索引                        |
| areaIndex          | Number                  | 1                     | 对应areas索引，一般为0          |
| localOffset        | Array(2)                |                       | 建筑物相对坐标                  |
| -	*_array_item* | Object                  |                       |                                 |
| -	-	x        | Number                  | 4                     |                                 |
| -	-	y        | Number                  | 4                     |                                 |
| -	-	z        | Number                  | 4                     |                                 |
| yaw                | Array(2)                |                       | 建筑物旋转角度（单位：角度）    |
| -	*_array_item* | Number                  | 4                     |                                 |
| itemId             | Number                  | 2                     | 建筑id                          |
| itemName           | String                  | -                     | 建筑名称                        |
| modelIndex         | Number                  | 2                     | 模型id                          |
| outputObjIdx       | Number                  | 4                     | 输出端目标建筑索引              |
| inputObjIdx        | Number                  | 4                     | 输入端目标建筑索引              |
| outputToSlot       | Number                  | 1                     | 输出端绑定到目标建筑的插槽索引  |
| inputFromSlot      | Number                  | 1                     | 输入端绑定到目标建筑的插槽索引  |
| outputFromSlot     | Number                  | 1                     | (建筑物自身属性)                |
| inputToSlot        | Number                  | 1                     | (建筑物自身属性)                |
| outputOffset       | Number                  | 1                     | 输出端插槽偏移，常见于分拣器    |
| inputOffset        | Number                  | 1                     | 输入端插槽偏移，常见于分拣器    |
| recipeId           | Number                  | 2                     | 配方id，常见于制造厂类建筑      |
| filterId           | Number                  | 2                     | 过滤物品id，常见于分拣器、四向  |
| parameterLength    | -                       | 2                     | parameters长度（每单位：4字节） |
| parameters         | **[PARAM](#param对象)** | *parameterLength* * 4 | 建筑配置参数                    |



#### <span id="param对象">**PARAM对象**</span>

##### 传送带配置参数

> [^2001, 2002, 2003]: 传送带, 高速传送带, 极速传送带

| 字段        | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注             |
| ----------- | -------- | ------------- | ----------- | ---------------- |
| _parameters | Object   |               | 2           |                  |
| -	iconId | Number   | 0             | 1           | 图标标签物品id   |
| -	count  | Number   | 1             | 1           | 图标标签下的数字 |



##### 分拣器配置参数

> [^2011, 2012, 2013, 2014]: 分拣器, 高速分拣器, 极速分拣器, 集装分拣器

| 字段        | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                      |
| ----------- | -------- | ------------- | ----------- | ------------------------- |
| _parameters | Object   |               | 1           |                           |
| -	length | Number   | 0             | 1           | 分拣器长度 <br />-> 1 - 3 |



##### 四向分流器配置参数

> [^2020]: 四向分流器

| 字段                    | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                 |
| ----------------------- | -------- | ------------- | ----------- | -------------------- |
| _parameters             | Object   |               | 6           |                      |
| -	priority           | Array(4) | 0             | 4           | 四向四个接口的优先级 |
| -	-	*_array_item* | Boolean  | *i*           | 1           | 是否优先             |



##### 制造厂类建筑配置参数

> [^2303, 2304, 2305, 2318, 2302, 2315, 2319, 2308, 2309, 2317, 2310]:制造台 Mk.I, 制造台 Mk.II, 制造台 Mk.III, 重组式制造台, 电弧熔炉, 位面熔炉, 负熵熔炉, 原油精炼厂, 化工厂, 量子化工厂, 微型粒子对撞机

| 字段                 | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                                    |
| -------------------- | -------- | ------------- | ----------- | --------------------------------------- |
| _parameters          | Object   |               | 1           |                                         |
| -	acceleratorMode | Number   | 0             | 1           | 增产效果 <br />-> 0:额外产出 1:生产加速 |



##### 研究站配置参数

> [^2901, 2902]: 矩阵研究站, 自演化研究站

| 字段                 | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                                             |
| -------------------- | -------- | ------------- | ----------- | ------------------------------------------------ |
| _parameters          | Object   |               | 2           |                                                  |
| -	researchMode    | Number   | 0             | 1           | 研究模式 <br />-> 0:未选择 1:矩阵合成 2:科研模式 |
| -	acceleratorMode | Number   | 1             | 1           | 增产效果 <br />-> 0:额外产出 1:生产加速          |



##### 储物仓配置参数

> [^2101, 2102]: 小型储物仓, 大型储物仓

| 字段                    | 字段类型         | 偏移量(Int32) | 长度(Int32) | 备注                                              |
| ----------------------- | ---------------- | ------------- | ----------- | ------------------------------------------------- |
| _parameters             | Object           |               | 110         |                                                   |
| -	bans               | Number           | 0             | 1           | 限制不可自动放入的格子数                          |
| -	storageType        | Number           | 1             | 1           | 储物仓类型<br />-> 0:不过滤 9:存在过滤器          |
| -	filters            | Array(*gridNum*) | 10            | *gridNum*   | 储物仓物品过滤器<br />*gridNum*: 建筑储物格子数目 |
| -	-	*_array_item* | Number           | 10 + *i*      | 1           | 过滤物品id                                        |



##### 储液罐配置参数

> [^2106]: 储液罐

| 字段        | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注     |
| ----------- | -------- | ------------- | ----------- | -------- |
| _parameters | Object   |               | 2           |          |
| -	output | Boolean  | 0             | 1           | 是否输出 |
| -	input  | Boolean  | 1             | 1           | 是否输入 |



##### 物流配送器配置参数

> [^2107]: 物流配送器

| 字段                      | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                                                         |
| ------------------------- | -------- | ------------- | ----------- | ------------------------------------------------------------ |
| _parameters               | Object   |               | 128         |                                                              |
| -	playerMode           | Number   | 0             | 1           | 机甲供需模式<br />-> 1:从伊卡洛斯回收<br />2:向伊卡洛斯供应和回收<br />3:向伊卡洛斯供应 |
| -	storageMode          | Number   | 1             | 1           | 配送器间模式<br />-> 0:不勾选 1:向其他配送器供应 2:向其他配送器需求 |
| -	workEnergyPerTick    | Number   | 2             | 1           | 最大充能功率(单位：MW)<br />-> 0.9 - 9                       |
| -	courierAutoReplenish | Boolean  | 3             | 1           | 是否自动补充运输单位                                         |



##### 运输站类建筑配置参数

> [^2103, 2104, 2316]: 行星内物流运输站, 星际物流运输站, 大型采矿机

| 字段                        | 字段类型            | 偏移量(Int32)       | 长度(Int32) | 备注                                                         |
| --------------------------- | ------------------- | ------------------- | ----------- | ------------------------------------------------------------ |
| _parameters                 | Object              |                     | 2048        |                                                              |
| -	storage                | Array(*storageNum*) | 0                   | 192         | 物品栏位参数<br />*storageNum*: 建筑栏位数目                 |
| -	-	*_array_item*     | Object              | *_L* = *i* * 6      | 6           |                                                              |
| -	-	-	itemId       | Number              | *_L* + 0            | 1           | 物品id                                                       |
| -	-	-	localRole    | Number              | *_L* + 1            | 1           | 本地供需配置<br />-> 0:本地仓储 1:本地供应 2:本地需求        |
| -	-	-	remoteRole   | Number              | *_L* + 2            | 1           | 星际供需配置<br />-> 0:星际仓储 1:星际供应 2:星际需求        |
| -	-	-	max          | Number              | *_L* + 3            | 1           | 物品上限                                                     |
| -	-	-	lockAmount   | Number              | *_L* + 4            | 1           | 是否锁定数量<br />-> 0:不锁定 1:锁定满仓 2:锁定半仓          |
| -	slots                  | Array(*slotsNum*)   | 192                 | 320         | 传送带插槽参数<br />*slotsNum*: 建筑传送带插槽数目           |
| -	-	*_array_item*     | Object              | *_L* =192 + *i* * 4 | 4           |                                                              |
| -	-	-	dir          | Number              | *_L* + 0            | 1           | 传送带接入方向<br />-> 0:未接入 1:输出 2:输入                |
| -	-	-	storageIdx   | Number              | *_L* + 1            | 1           | 输出货物对应物品栏索引<br />-> 0:不输出 1-5:物品栏索引 6:翘曲器 |
| -	workEnergyPerTick      | Number              | 320                 | 1           | 最大充能功率(单位：MW) <br />-> 30 - 300                     |
| -	tripRangeOfDrones      | Number              | 321                 | 1           | 运输机最远路程(单位：度) <br />-> 20 - 180                   |
| -	tripRangeOfShips       | Number              | 322                 | 1           | 运输船最远路程<br />-> 1-60:有限路程(单位：ly) 10000:无限    |
| -	includeOrbitCollector  | Boolean             | 323                 | 1           | 是否会去轨道采集器取货                                       |
| -	warpEnableDistance     | Number              | 324                 | 1           | 曲速启用路程(单位：AU)<br />-> 0.5 - 60                      |
| -	warperNecessary        | Boolean             | 325                 | 1           | 是否翘曲器必备                                               |
| -	deliveryAmountOfDrones | Number              | 326                 | 1           | 运输机起送量(单位：%)<br />-> 1 - 100                        |
| -	deliveryAmountOfShips  | Number              | 327                 | 1           | 运输船起送量(单位：%)<br />-> 1-100                          |
| -	pilerCount             | Number              | 328                 | 1           | 输出货物集装数量<br />-> 0:使用科技上限 1-4:指定数量         |
| -	miningSpeed            | Number              | 329                 | 1           | 开采速度                                                     |
| -	droneAutoReplenish     | Boolean             | 330                 | 1           | 是否自动补充运输机                                           |
| -	shipAutoReplenish      | Boolean             | 331                 | 1           | 是否自动补充运输船                                           |



##### 流速监测器配置参数

> [^2030]: 流速监测器

| 字段                      | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                                                         |
| ------------------------- | -------- | ------------- | ----------- | ------------------------------------------------------------ |
| _parameters               | Object   |               | 128         |                                                              |
| -	targetBeltId         | Number   | 0             | 1           | 绑定的传送带节点ID<br />（实际id，不是蓝图index，疑似无效参数） |
| -	offset               | Number   | 1             | 1           | ?                                                            |
| -	targetCargoAmount    | Number   | 2             | 1           | 目标流量(单位：0.1个)                                        |
| -	periodTicksCount     | Number   | 3             | 1           | 监测周期(单位：秒)                                           |
| -	passOperator         | Number   | 4             | 1           | 监测条件<br />-> 0:等于 1:不等于 2:大于等于 3:大于 4:小于等于 5:小于 |
| -	passColorId          | Number   | 5             | 1           | 满足条件颜色索引<br />-> 0 - 255                             |
| -	failColorId          | Number   | 6             | 1           | 不满足条件颜色索引<br />-> 0 - 255                           |
| -	tone                 | Number   | 7             | 1           | 声音警报-音色<br />-> 20-24:警报 1-2:钢琴 3-4:贝斯<br />5-6:风琴 7-9:铺底 10:铜管乐<br />11:梦铃 12:玻璃 13:吉他<br />14:音乐盒 15:电子琴 16:小号<br />17:小提琴 18:低音贝斯 19:鼓 |
| -	volume               | Number   | 8             | 1           | 声音警报-音量<br />-> 0 - 100                                |
| -	pitch                | Number   | 9             | 1           | 声音警报-音阶<br />-> 例：25: C2   26: C#2   27: D2 ...      |
| -	systemWarningMode    | Number   | 10            | 1           | 系统警报模式<br />-> 0:无 1:未满足条件 2:满足条件<br />3:有货物响 4:无货物响<br />5:未满足且有货物 6:未满足且无货物 |
| -	repeat               | Boolean  | 11            | 1           | 声音警报-是否循环                                            |
| -	alarmMode            | Number   | 12            | 1           | 声音警报模式<br />-> 0:无 1:未满足条件 2:满足条件<br />3:有货物响 4:无货物响<br />5:未满足且有货物 6:未满足且无货物 |
| -	length               | Number   | 13            | 1           | 声音警报-时长(只有音色为警报时有该参数)<br />-> 0.1 - 20     |
| -	cargoFilter          | Number   | 14            | 1           | 货物过滤物品id<br />-> 0:不过滤 物品id->过滤                 |
| -	systemWarningIconId  | Number   | 17            | 1           | 系统警报图标id                                               |
| -	falloffRadius        | Array(2) |               |             | 声音警报-声音衰减范围                                        |
| -	-	*_array_item_1* | Number   | 18            | 1           | 开始衰减距离(单位：米)<br />-> 默认为 (*衰减为0距离* / 3)（0-133） |
| -	-	*_array_item_2* | Number   | 19            | 1           | 衰减为0距离(单位：米)<br />-> 1-400                          |
| -	spawnItemOperator    | Number   | 20            | 1           | 生成/消耗货物模式<br />-> 0:不勾选 1:生成货物 2:消耗货物     |



##### 射线接收站配置参数

> [^2208]: 射线接收站

| 字段           | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                                  |
| -------------- | -------- | ------------- | ----------- | ------------------------------------- |
| _parameters    | Object   |               | 1           |                                       |
| -	productId | Number   | 0             | 1           | 模式<br />-> 0:直接发电 1208:光子生成 |



##### 能量枢纽配置参数

> [^2209]: 能量枢纽

| 字段        | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                               |
| ----------- | -------- | ------------- | ----------- | ---------------------------------- |
| _parameters | Object   |               | 1           |                                    |
| -	mode   | Number   | 0             | 1           | 模式<br />-> -1:放电 0:待机 1:充电 |



##### 电磁轨道弹射器配置参数

> [^2311]: 电磁轨道弹射器

| 字段              | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                                        |
| ----------------- | -------- | ------------- | ----------- | ------------------------------------------- |
| _parameters       | Object   |               | 2           |                                             |
| -	orbitId      | Number   | 0             | 1           | 送入轨道编号<br />-> 0:无 1-20:轨道列表编号 |
| -	tenfoldSpeed | Boolean  | 1             | 1           | 是否开启十倍射速                            |



##### 垂直发射井配置参数

> [^2312]: 垂直发射井

| 字段              | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注             |
| ----------------- | -------- | ------------- | ----------- | ---------------- |
| _parameters       | Object   |               | 1           |                  |
| -	tenfoldSpeed | Boolean  | 0             | 1           | 是否开启十倍射速 |



##### 战场分析基站配置参数

> [^3009]: 战场分析基站

| 字段                    | 字段类型  | 偏移量(Int32)   | 长度(Int32)                        | 备注                                                     |
| ----------------------- | --------- | --------------- | ---------------------------------- | -------------------------------------------------------- |
| _parameters             | Object    |                 | 110                                |                                                          |
| -	bans               | Number    | 0               | 1                                  | 限制不可自动放入的格子数                                 |
| -	storageType        | Number    | 1               | 1                                  | 储物仓类型<br />-> 0:不过滤 9:存在过滤器                 |
| -	filters            | Array(60) | 10              | *_L* = *storageType* == 0 ? 0 : 60 | 储物仓物品过滤器<br />*storageType*为0时忽略，不占偏移量 |
| -	-	*_array_item* | Number    | 10 + *i*        | 1                                  | 过滤物品id                                               |
| -	workEnergyPerTick  | Number    | *_L* + 10       | 1                                  | 最大充能功率(单位：MW)<br />-> 30 - 300                  |
| -	autoPickEnabled    | Boolean   | *_L* + 11       | 1                                  | 是否自动拾取                                             |
| -	autoReplenishFleet | Boolean   | *_L* + 12       | 1                                  | 是否自动补充编队                                         |
| -	moduleEnabled      | Boolean   | *_L* + 13       | 1                                  | 是否开启战斗无人机                                       |
| -	autoReconstruct    | Boolean   | *_L* + 14       | 1                                  | 是否自动标记重建                                         |
| -	droneEnabled       | Boolean   | *_L* + 15       | 1                                  | 是否开启建设无人机                                       |
| -	dronesPriority     | Number    | *_L* + 16       | 1                                  | 建设无人机模式<br />-> 0:优先修理 1:均衡模式 2:优先建造  |
| -	fighters           | Array(12) | *_L* + 17       | 12                                 | 战斗无人机编队                                           |
| -	-	*_array_item* | Number    | *_L* + 17 + *i* | 1                                  | 无人机物品id                                             |



##### 炮台类建筑配置参数

> [^3001, 3002, 3003, 3004, 3005, 3006, 3010]: 高斯机枪塔, 高频激光塔, 聚爆加农炮, 磁化电浆炮, 导弹防御塔, 干扰塔, 近程电浆塔

| 字段                      | 字段类型 | 偏移量(Int32) | 长度(Int32) | 备注                                               |
| ------------------------- | -------- | ------------- | ----------- | -------------------------------------------------- |
| _parameters               | Object   |               | 128         |                                                    |
| -	group                | Number   | 1             | 1           | 分组编号<br />-> 0:不分组 1-5:分组                 |
| -	vsSettings           | Array(4) | 2             | 1           | 攻击设置优先级                                     |
| -	-	*_array_item_1* | Number   |               |             | 地面优先级<br />-> 0:关闭 1:低优先 2:均衡 3:高优先 |
| -	-	*_array_item_2* | Number   |               |             | 低空优先级<br />-> 0:关闭 1:低优先 2:均衡 3:高优先 |
| -	-	*_array_item_3* | Number   |               |             | 高空优先级<br />-> 0:关闭 1:低优先 2:均衡 3:高优先 |
| -	-	*_array_item_4* | Number   |               |             | 太空优先级<br />-> 0:关闭 1:低优先 2:均衡 3:高优先 |
| -	phasePos             | Number   | 3             | 1           | 干扰塔相位偏移(单位：秒) -> 0-5                    |



##### 默认配置参数解析（未知建筑参数）

| 字段                | 字段类型                      | 偏移量(Int32) | 长度(Int32)       | 备注 |
| ------------------- | ----------------------------- | ------------- | ----------------- | ---- |
| _parameters         | Object                        |               | *parameterLength* |      |
| -	_defaultParams | Int32Array(*parameterLength*) | 0             | *parameterLength* |      |





### 安装依赖

```shell
cnpm install
```

### 运行测试服务

```shell
npm run serve
```

### 构建打包

```shell
npm run build
# 打包后可删除dist文件夹中的css及js文件夹(打包流冗余文件，所有代码已打包进html)，仅保留index.html
```
