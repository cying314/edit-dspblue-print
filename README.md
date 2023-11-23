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
