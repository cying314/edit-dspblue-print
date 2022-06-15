<template>
  <div class="main">
    <div class="wrap">
      <div class="navScrollBar">
        <el-scrollbar :vertical="false">
          <el-menu :default-active="activeStep" @select="jump" mode="horizontal">
            <el-menu-item v-for="(item, index) in menuData" :index="`${index}`" :key="index">
              <span slot="title">{{ item.menuName }}</span>
            </el-menu-item>
            <el-menu-item index="-1">
              <span slot="title">联系作者</span>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </div>
      <div class="scrollWrap">
        <el-scrollbar class="scrollContent" :vertical="false" style="height: 100%">
          <el-collapse style="padding-bottom: 20px">
            <el-card name="1">
              <div slot="header" class="card_header">
                <span>导入蓝图</span>
                <el-button size="small" type="primary" @click="render" v-if="formInline.inputData.trim()!=formInline.importData">确定</el-button>
              </div>
              <div class="card_content">
                <el-form :model="formInline" ref="importForm" @submit.native.prevent>
                  <el-form-item prop="inputData" :rules="rules.notNull">
                    <div class="el-input el-input-group el-input-group--append el-input-group--prepend el-input--suffix">
                      <div class="el-input-group__prepend">
                        <el-select v-model="formInline.dataType" slot="prepend" placeholder="请选择" style="width:130px">
                          <el-option label="导入原生蓝图" value="blueprint"></el-option>
                          <el-option label="导入JSON" value="json"></el-option>
                        </el-select>
                      </div>
                      <el-input type="textarea" rows="3" v-model="formInline.inputData" clearable></el-input>
                      <div class="el-input-group__append">
                        <el-upload action="" :auto-upload="false" :limit="1" :file-list="fileList" accept=".txt,.json" :on-change="uploadChange">
                          <el-button slot="trigger" icon="el-icon-folder-opened">导入文件</el-button>
                        </el-upload>
                      </div>
                    </div>
                  </el-form-item>
                </el-form>
                <template v-if="formInline.blueprintData">
                  <el-divider></el-divider>
                  <div>包含设施</div>
                  <div class="itemList">
                    <el-tooltip class="itemWrap" effect="dark" placement="top" v-for="item,index in getItemList(formInline.blueprintData)" :key="index">
                      <template slot="content">
                        <p>{{item.name}}</p>
                      </template>
                      <div class="item">
                        <img class="icon" :src="getIcon(item.icon)">
                        <div class="count">{{item.count}}</div>
                      </div>
                    </el-tooltip>
                  </div>
                </template>
              </div>
            </el-card>
            <el-card name="2">
              <div slot="header" class="card_header">
                <span>生成配置</span>
                <el-button size="small" type="primary" @click="output" v-if="formInline.blueprintData">输出</el-button>
              </div>
              <div class="card_content">
                <el-form label-width="120px" :model="formInline" ref="paramForm" @submit.native.prevent :rules="rules">
                  <el-form-item label="转换类型：">
                    <el-radio-group v-model="formInline.paramType">
                      <el-radio label="0">垂直叠加</el-radio>
                      <el-radio label="1">垂直偏移</el-radio>
                      <el-radio label="2">水平偏移</el-radio>
                      <el-radio label="3">线性变换</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <template v-if="formInline.paramType=='0'">
                    <div class="flex">
                      <el-form-item label="生成层数：" prop="params.floors">
                        <el-input type="numberx" v-model="formInline.params.floors">
                        </el-input>
                      </el-form-item>
                      <el-form-item label="垂直间隔：" prop="params.spacing">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>常见可叠加物品的单层高度：</p>
                              <p>四向分流器：2</p>
                              <p>自动集装器：2</p>
                              <p>小型储物仓：2</p>
                              <p>大型储物仓：3</p>
                              <p>储液罐：3</p>
                              <p>矩阵研究站：3</p>
                            </template>
                            <span>垂直间隔：<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.spacing">
                        </el-input>
                      </el-form-item>
                    </div>
                  </template>
                  <template v-if="formInline.paramType=='1'">
                    <div class="flex">
                      <el-form-item label="垂直偏移量：" prop="params.offsetZ">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>基于0相对偏移</p>
                              <p>垂直偏移产生的悬空地面建筑不可再复制</p>
                            </template>
                            <span>垂直偏移量：<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.offsetZ">
                        </el-input>
                      </el-form-item>
                    </div>
                  </template>
                  <template v-if="formInline.paramType=='2'">
                    <div class="flex">
                      <el-form-item label="横向偏移量：" prop="params.offsetX">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>基于0相对偏移</p>
                            </template>
                            <span>横向偏移量：<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.offsetX">
                        </el-input>
                      </el-form-item>
                      <el-form-item label="纵向偏移量：" prop="params.offsetY">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>基于0相对偏移</p>
                            </template>
                            <span>纵向偏移量：<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.offsetY">
                        </el-input>
                      </el-form-item>
                    </div>
                  </template>
                  <template v-if="formInline.paramType=='3'">
                    <div class="flex">
                      <el-form-item label="横向放缩量：" prop="params.zoomX">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>基于1缩放</p>
                              <p>输入负数可翻转，翻转后部分连接可能存在问题，如分拣器</p>
                            </template>
                            <span>横向放缩量：<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.zoomX">
                        </el-input>
                      </el-form-item>
                      <el-form-item label="纵向放缩量：" prop="params.zoomY">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>基于1缩放</p>
                              <p>输入负数可翻转，翻转后部分连接可能存在问题，如分拣器</p>
                            </template>
                            <span>纵向放缩量：<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.zoomY">
                        </el-input>
                      </el-form-item>
                      <el-form-item label="旋转角度：" prop="params.rotate">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>-360至360</p>
                            </template>
                            <span>旋转角度：<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.rotate">
                        </el-input>
                      </el-form-item>
                    </div>
                  </template>
                </el-form>
              </div>
            </el-card>
            <el-card name="3">
              <div slot="header" class="card_header">
                <span>输出结果</span>
                <el-button size="small" type="primary" @click="saveFile">保存文件</el-button>
              </div>
              <div class="card_content">
                <el-form :model="formInline" @submit.native.prevent>
                  <el-form-item>
                    <el-radio-group v-model="formInline.resType">
                      <el-radio label="blueprint">输出蓝图</el-radio>
                      <el-radio label="json">输出JSON</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item v-if="formInline.resType=='blueprint'">
                    <el-input type="textarea" v-model="formInline.resData" :rows="5" readonly>
                    </el-input>
                  </el-form-item>
                  <el-form-item v-if="formInline.resType=='json'">
                    <el-input type="textarea" v-model="formInline.resJSON" :rows="5" readonly>
                    </el-input>
                  </el-form-item>
                </el-form>
                <template v-if="formInline.resBlueprintData">
                  <el-divider></el-divider>
                  <div>包含设施</div>
                  <div class="itemList">
                    <el-tooltip class="itemWrap" effect="dark" placement="top" v-for="item,index in getItemList(formInline.resBlueprintData)" :key="index">
                      <template slot="content">
                        <p>{{item.name}}</p>
                      </template>
                      <div class="item">
                        <img class="icon" :src="getIcon(item.icon)">
                        <div class="count">{{item.count}}</div>
                      </div>
                    </el-tooltip>
                  </div>
                </template>
              </div>
            </el-card>
          </el-collapse>
        </el-scrollbar>
      </div>
    </div>
    <div class="loading-mask" v-if="fullscreenLoading">
      <div class="loading-spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
        </svg>
        <el-progress v-if="showLoadingBar" :text-inside="true" :stroke-width="22" :percentage="loadingNow" class="progress"></el-progress>
      </div>
    </div>
  </div>
</template>

<script>
import * as PARSER from "../utils/parser";
import { items as itemsData } from "../data/itemsData";
import { saveAs } from "file-saver";
export default {
  name: "Home",
  data() {
    return {
      activeStep: "0",
      menuData: [
        {
          menuName: "导入蓝图",
        },
        {
          menuName: "生成配置",
        },
        {
          menuName: "输出结果",
        },
      ],
      formInline: {
        dataType: "blueprint",
        importData: "",
        inputData: "",
        blueprintData: null,
        paramType: "0",
        params: {
          floors: 2,
          spacing: 2,
          offsetX: 0.5,
          offsetY: 0.5,
          offsetZ: 0.5,
          zoomX: 2,
          zoomY: 2,
          rotate: 45,
        },
        resBlueprintData: null,
        resType: "blueprint",
        resData: "",
        resJSON: "",
      },
      rules: {
        notNull: [
          {
            required: true,
            message: "不能为空",
            trigger: "blur",
          },
        ],
        "params.floors": [
          {
            validator: (rule, value, callback) => {
              if (!(value >= 1) || ~~value != value) {
                return callback(new Error("请输入正确的生成层数"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.spacing": [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error("请输入正确的垂直间隔"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.offsetX": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入横向偏移量"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.offsetY": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入纵向偏移量"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.offsetZ": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入垂直偏移量"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.zoomX": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入横向放缩量"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.zoomY": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入纵向放缩量"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.rotate": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入旋转角度"));
              } else if (value > 360 || value < -360) {
                return callback(new Error("请输入正确的旋转角度"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
      },
      fullscreenLoading: false,
      showLoadingBar: false,
      loadingNow: 0,
      fileList: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener("scroll", this.onScroll);
      document
        .querySelector(".scrollContent .el-scrollbar__wrap")
        .addEventListener("scroll", this.onScroll);
    });
  },
  methods: {
    getIcon(icon) {
      try {
        return require("@/assets/images/" + icon + ".png");
      } catch (e) {
        return null;
      }
    },
    getItemList(blueprintData) {
      if (!blueprintData || !blueprintData.buildings) return [];
      let tmpObj = {};
      blueprintData.buildings.forEach((v) => {
        tmpObj[v.itemId] = (tmpObj[v.itemId] || 0) + 1;
      });
      let itemList = Object.keys(tmpObj).map((k) => {
        let itemInfo = itemsData.find((item) => item.id == k);
        return {
          itemId: k,
          count: tmpObj[k],
          icon: itemInfo.icon,
          name: itemInfo.name,
        };
      });
      return itemList;
    },
    findUppermost(buildings, itemId, index) {
      // 递归找到可叠加节点的最高层
      let item = buildings.find((v) => v.inputObjIdx == index && v.itemId == itemId);
      if (!item) return index;
      else {
        return this.findUppermost(buildings, itemId, item.index);
      }
    },
    deepCopy(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    linearTransformation(blueprintData, zoomX, zoomY, rotate) {
      // 线性变换
      let res = this.deepCopy(blueprintData);
      let w = res.areas[0].size.x * Math.abs(zoomX);
      let h = res.areas[0].size.y * Math.abs(zoomY);
      let W = Math.ceil(
        w * Math.cos((Math.abs(rotate) * Math.PI) / 180) +
          h * Math.sin((Math.abs(rotate) * Math.PI) / 180)
      );
      let H = Math.ceil(
        w * Math.sin((Math.abs(rotate) * Math.PI) / 180) +
          h * Math.cos((Math.abs(rotate) * Math.PI) / 180)
      );
      res.areas[0].size.x = W;
      res.areas[0].size.y = H;
      res.dragBoxSize.x = W;
      res.dragBoxSize.y = H;
      res.cursorOffset.x = ~~(W / 2);
      res.cursorOffset.y = ~~(H / 2);

      res.buildings.forEach((v) => {
        let x = zoomX * v.localOffset[0].x;
        let x2 = zoomX * v.localOffset[1].x;
        let y = zoomY * v.localOffset[0].y;
        let y2 = zoomY * v.localOffset[1].y;
        v.localOffset[0].x =
          x * Math.cos((rotate * Math.PI) / 180) - y * Math.sin((rotate * Math.PI) / 180);
        v.localOffset[1].x =
          x2 * Math.cos((rotate * Math.PI) / 180) - y2 * Math.sin((rotate * Math.PI) / 180);
        v.localOffset[0].y =
          x * Math.sin((rotate * Math.PI) / 180) + y * Math.cos((rotate * Math.PI) / 180);
        v.localOffset[1].y =
          x2 * Math.sin((rotate * Math.PI) / 180) + y2 * Math.cos((rotate * Math.PI) / 180);
        v.yaw[0] -= rotate;
        v.yaw[1] -= rotate;
      });
      return res;
    },
    horizontalOffset(blueprintData, offsetX, offsetY) {
      // 水平偏移
      let res = this.deepCopy(blueprintData);
      res.buildings.forEach((v) => {
        v.localOffset[0].x += +offsetX;
        v.localOffset[1].x += +offsetX;
        v.localOffset[0].y += +offsetY;
        v.localOffset[1].y += +offsetY;
      });
      return res;
    },
    verticalOffset(blueprintData, offsetZ) {
      // 垂直偏移
      let res = this.deepCopy(blueprintData);
      let needBase = false;
      res.buildings.forEach((v) => {
        v.localOffset[0].z += +offsetZ;
        v.localOffset[1].z += +offsetZ;
        switch (v.itemId) {
          case 2020: // 四向分流器
          case 2040: // 自动集装器
          case 2101: // 小型储物仓
          case 2102: // 大型储物仓
          case 2106: // 储液罐
          case 2901: // 矩阵研究站
            if (v.inputObjIdx == -1) {
              v.inputObjIdx = res.buildings.length;
              needBase = true;
            }
            break;
          case 2001: // 低速传送带
          case 2002: // 高速传送带
          case 2003: // 极速传送带
          case 2011: // 低速分拣器
          case 2012: // 高速分拣器
          case 2013: // 极速分拣器
          case 2030: // 流速器
            break;
          case 2313: // 喷涂机
            // 不能用地基当底
            break;
          default:
            if (v.inputObjIdx == -1) {
              v.inputObjIdx = res.buildings.length;
              needBase = true;
            }
            break;
        }
      });
      if(needBase){
        res.buildings.push({
          index: res.buildings.length,
          areaIndex: 0,
          localOffset: [
            { x: 0, y: 0, z: -10 },
            { x: 0, y: 0, z: -10 },
          ],
          yaw: [0, 0],
          itemId: 1131,
          modelIndex: 37,
          outputObjIdx: -1,
          inputObjIdx: -1,
          outputToSlot: 0,
          inputFromSlot: 0,
          outputFromSlot: 0,
          inputToSlot: 1,
          outputOffset: 0,
          inputOffset: 0,
          recipeId: 0,
          filterId: 0,
          parameters: null,
        });
      }
      return res;
    },
    verticalCopy(blueprintData, floors, spacing) {
      // 垂直复制
      let res = this.verticalOffset(blueprintData, 0); // 深拷贝，并给悬空建筑建地基底
      let buildings = res.buildings;
      let prevFloor = buildings;
      let needBase = false;
      for (let i = 2; i <= floors; i++) {
        let nextFloor = [];
        prevFloor.forEach((v) => {
          let newItem = this.deepCopy(v);
          newItem.index = v.index + prevFloor.length;
          newItem.localOffset[0].z += +spacing;
          newItem.localOffset[1].z += +spacing;
          switch (v.itemId) {
            case 2020: // 四向分流器
            case 2040: // 自动集装器
            case 2101: // 小型储物仓
            case 2102: // 大型储物仓
            case 2106: // 储液罐
            case 2901: // 矩阵研究站
            case 2313: // 喷涂机
              if (v.inputObjIdx == -1) {
                newItem.inputObjIdx = this.findUppermost(prevFloor, v.itemId, v.index);
              } else {
                newItem.inputObjIdx = v.inputObjIdx + prevFloor.length;
              }
              nextFloor.push(newItem);
              break;
            case 2001: // 低速传送带
            case 2002: // 高速传送带
            case 2003: // 极速传送带
            case 2011: // 低速分拣器
            case 2012: // 高速分拣器
            case 2013: // 极速分拣器
            case 2030: // 流速器
              if (v.outputObjIdx != -1) {
                newItem.outputObjIdx = v.outputObjIdx + prevFloor.length;
              }
              if (v.inputObjIdx != -1) {
                newItem.inputObjIdx = v.inputObjIdx + prevFloor.length;
              }
              nextFloor.push(newItem);
            break;
            case 1131: // 地基
              newItem.localOffset[0].z = -10;
              newItem.localOffset[1].z = -10;
              nextFloor.push(newItem);
              break;
            default:
              if (v.outputObjIdx != -1) {
                newItem.outputObjIdx = v.outputObjIdx + prevFloor.length;
              }
              if (v.inputObjIdx != -1) {
                newItem.inputObjIdx = v.inputObjIdx + prevFloor.length;
              }
              if (v.inputObjIdx == -1) {
                newItem.inputObjIdx = prevFloor.length * floors;
                needBase = true;
              }
              nextFloor.push(newItem);
              break;
          }
        });
        prevFloor = nextFloor;
        res.buildings.push(...nextFloor);
        if(needBase){
          res.buildings.push({
            index: res.buildings.length,
            areaIndex: 0,
            localOffset: [
              { x: 0, y: 0, z: -10 },
              { x: 0, y: 0, z: -10 },
            ],
            yaw: [0, 0],
            itemId: 1131,
            modelIndex: 37,
            outputObjIdx: -1,
            inputObjIdx: -1,
            outputToSlot: 0,
            inputFromSlot: 0,
            outputFromSlot: 0,
            inputToSlot: 1,
            outputOffset: 0,
            inputOffset: 0,
            recipeId: 0,
            filterId: 0,
            parameters: null,
          });
        }
      }
      return res;
    },
    output() {
      if (!this.formInline.blueprintData) {
        this.warning("请先导入数据");
        return;
      }
      this.$refs.paramForm.validate((valid) => {
        if (valid) {
          let paramType = this.formInline.paramType;
          if (!paramType) {
            this.warning("请选择转换类型");
            return;
          }
          switch (paramType) {
            case "0":
              // 垂直复制
              this.formInline.resBlueprintData = this.verticalCopy(
                this.formInline.blueprintData,
                +this.formInline.params.floors,
                +this.formInline.params.spacing
              );
              this.$set(this.formInline, "resData", PARSER.toStr(this.formInline.resBlueprintData));
              this.$set(
                this.formInline,
                "resJSON",
                JSON.stringify(this.formInline.resBlueprintData)
              );
              console.log(this.formInline.resBlueprintData);
              break;
            case "1":
              // 垂直偏移
              this.formInline.resBlueprintData = this.verticalOffset(
                this.formInline.blueprintData,
                +this.formInline.params.offsetZ
              );
              this.$set(this.formInline, "resData", PARSER.toStr(this.formInline.resBlueprintData));
              this.$set(
                this.formInline,
                "resJSON",
                JSON.stringify(this.formInline.resBlueprintData)
              );
              console.log(this.formInline.resBlueprintData);
              break;
            case "2":
              // 水平偏移
              this.formInline.resBlueprintData = this.horizontalOffset(
                this.formInline.blueprintData,
                +this.formInline.params.offsetX,
                +this.formInline.params.offsetY
              );
              this.$set(this.formInline, "resData", PARSER.toStr(this.formInline.resBlueprintData));
              this.$set(
                this.formInline,
                "resJSON",
                JSON.stringify(this.formInline.resBlueprintData)
              );
              console.log(this.formInline.resBlueprintData);
              break;
            case "3":
              // 线性变换
              this.formInline.resBlueprintData = this.linearTransformation(
                this.formInline.blueprintData,
                +this.formInline.params.zoomX,
                +this.formInline.params.zoomY,
                +this.formInline.params.rotate
              );
              this.$set(this.formInline, "resData", PARSER.toStr(this.formInline.resBlueprintData));
              this.$set(
                this.formInline,
                "resJSON",
                JSON.stringify(this.formInline.resBlueprintData)
              );
              console.log(this.formInline.resBlueprintData);
              break;
          }
        }
      });
    },
    saveFile() {
      if (!this.formInline.resType) {
        this.warning("请选择导出类型");
        return;
      }
      if (this.formInline.resType == "blueprint" && !this.formInline.resData) {
        this.warning("请先生成数据");
        return;
      }
      if (this.formInline.resType == "json" && !this.formInline.resJSON) {
        this.warning("请先生成数据");
        return;
      }
      var blob = new Blob(
        [
          this.formInline.resType == "blueprint"
            ? this.formInline.resData
            : this.formInline.resJSON,
        ],
        { type: "text/plain;charset=utf-8" }
      );
      saveAs(blob, this.formInline.resType + Date.now() + ".txt");
    },
    render() {
      this.$refs.importForm.validate((valid) => {
        if (valid) {
          if (!this.formInline.dataType) {
            this.warning("请选择导入类型");
            return;
          }
          let inputData = this.formInline.inputData.trim();
          let blueprintData;
          if (this.formInline.dataType == "blueprint") {
            try {
              blueprintData = PARSER.fromStr(inputData);
            } catch (e) {
              this.warning("导入的数据有误");
              return;
            }
            console.log(blueprintData);
            this.$set(this.formInline, "importData", inputData);
            this.$set(this.formInline, "blueprintData", blueprintData);
          } else if (this.formInline.dataType == "json") {
            try {
              blueprintData = JSON.parse(inputData);
              PARSER.toStr(blueprintData);
            } catch (e) {
              this.warning("导入的数据有误");
              return;
            }
            console.log(blueprintData);
            this.$set(this.formInline, "importData", inputData);
            this.$set(this.formInline, "blueprintData", blueprintData);
          }
        }
      });
    },
    warning(msg) {
      this.$notify({
        title: "警告",
        message: msg,
        type: "warning",
      });
    },
    uploadChange(file) {
      this.fileList = [];
      console.log(file, "file");
      if (["application/json", "text/plain"].indexOf(file.raw.type) == -1) {
        this.warning("导入失败，请上传txt或json格式的文件");
        return;
      }
      if (typeof FileReader === "undefined") {
        this.warning("导入失败，您的浏览器不支持FileReader接口");
        return;
      }
      let reader = new FileReader();
      reader.readAsText(file.raw, "UTF-8");
      reader.onload = (e) => {
        this.$set(this.formInline, "inputData", e.target.result);
        this.render();
      };
    },
    onScroll(e) {
      let scrollItems = document.querySelectorAll(".el-card__header");
      for (let i = scrollItems.length - 1; i >= 0; i--) {
        if (!this.click) {
          let judge = e.target.scrollTop >= scrollItems[i].offsetTop - scrollItems[0].offsetTop;
          if (judge) {
            this.activeStep = i.toString();
            break;
          }
        }
      }
    },
    jump(index) {
      if (index == "-1") {
        window.open("https://space.bilibili.com/34117233");
        return;
      }
      let _this = this;
      this.click = true;
      let target = document.querySelector(".scrollContent .el-scrollbar__wrap");
      let scrollItems = document.querySelectorAll(".el-card__header");
      if (target.scrollHeight <= target.scrollTop + target.clientHeight) {
        this.activeStep = index;
      }
      let total = scrollItems[index].offsetTop - scrollItems[0].offsetTop;
      let distance = target.scrollTop;
      let step = total / 50;
      if (total > distance) {
        smoothDown(target);
      } else {
        let newTotal = distance - total;
        step = newTotal / 50;
        smoothUp(target);
      }
      function smoothDown(element) {
        if (distance < total) {
          distance += step;
          element.scrollTop = distance;
          setTimeout(smoothDown.bind(this, element), 10);
        } else {
          element.scrollTop = total;
          setTimeout(() => {
            _this.click = false;
          }, 10);
        }
      }
      function smoothUp(element) {
        if (distance > total) {
          distance -= step;
          element.scrollTop = distance;
          setTimeout(smoothUp.bind(this, element), 10);
        } else {
          element.scrollTop = total;
          setTimeout(() => {
            _this.click = false;
          }, 10);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.main {
  background: #f0f2f5;
  .loading-mask {
    position: fixed;
    z-index: 2000;
    background-color: hsla(0, 0%, 100%, 0.6);
    margin: 0;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transition: opacity 0.3s;
    .loading-spinner {
      text-align: center;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .circular {
        height: 42px;
        width: 42px;
        animation: loading-rotate 2s linear infinite;
        @keyframes loading-rotate {
          to {
            transform: rotate(1turn);
          }
        }
        .path {
          animation: loading-dash 1.5s ease-in-out infinite;
          stroke-dasharray: 90, 150;
          stroke-dashoffset: 0;
          stroke-width: 2;
          stroke: #409eff;
          stroke-linecap: round;
          @keyframes loading-dash {
            0% {
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -40px;
            }
            to {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -120px;
            }
          }
        }
      }
      .progress {
        margin-top: 50px;
        /deep/.el-progress-bar__outer {
          width: 60vw;
          .el-progress-bar__inner {
            transition: unset;
          }
        }
      }
    }
  }
  .wrap {
    max-width: 1000px;
    margin: auto;
    background: #fff;
    box-shadow: 0 0 20px 15px #fff;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 10;
    .navScrollBar {
      .el-menu {
        display: flex;
        user-select: none;
      }
    }
    .scrollWrap {
      height: 0;
      flex: 1;
      .scrollContent {
        /deep/.el-scrollbar__wrap {
          margin-bottom: 0 !important;
          margin-right: 0 !important;
          &::-webkit-scrollbar {
            display: none;
          }
        }
        /deep/.el-card__header {
          line-height: 32px;
          padding: 12px 20px;
          min-width: 330px;
          .card_header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
        .el-form {
          min-width: 330px;
          /deep/.el-form-item__error {
            position: unset;
          }
          .flex {
            display: flex;
            justify-content: space-between;
            .el-icon-link {
              width: 3%;
              margin-left: 3%;
              margin-right: -3%;
              font-size: 20px;
              color: #666;
              text-align: center;
              line-height: 40px;
            }
            .el-form-item {
              flex: 1;
            }
          }
        }
        .el-tree {
          /deep/.el-tree-node {
            white-space: pre-wrap;
            word-break: break-all;
          }
          /deep/.el-tree-node__content {
            height: auto;
          }
        }
      }
    }
  }
  .itemList {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
    .item {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      position: relative;
      margin: 0 10px 10px 0;
      padding: 5px;
      background: #f9fafc;
      border-radius: 5px;
      box-shadow: 0 0 7px 1px #d3cfe5;
      &:hover {
        background: #d0d3d9;
      }
      .icon {
        width: 100%;
        width: 100%;
      }
      .count {
        font-size: 12px;
        position: absolute;
        bottom: 2px;
        right: 2px;
        color: #20fafa;
        text-shadow: 0 0 2px #000;
      }
    }
  }
}
</style>