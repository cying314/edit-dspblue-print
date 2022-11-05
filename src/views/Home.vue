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
            <el-menu-item index="-2">
              <span slot="title">查看更新(当前版本：v4.2)</span>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </div>
      <div class="scrollWrap">
        <el-scrollbar class="scrollContent" :vertical="false" style="height: 100%">
          <el-collapse style="padding-bottom: 20px">
            <el-card name="1">
              <div slot="header" class="card_header">
                <span class="title">导入蓝图</span>
                <div class="btnWrap">
                  <el-upload action="" :auto-upload="false" :limit="1" :file-list="fileList" :accept="formInline.dataType=='blueprint'?'.txt':formInline.dataType=='json'?'.txt,.json':'.txt,.json'" :on-change="uploadChange">
                    <el-button plain size="small" slot="trigger" icon="el-icon-folder-opened">导入{{formInline.dataType=='blueprint'?'蓝图':formInline.dataType=='json'?'JSON':''}}文件</el-button>
                  </el-upload>
                  <el-button style="margin-left: 10px;" type="primary" plain size="small" @click="inputFromClipboard" icon="el-icon-document-copy">粘贴</el-button>
                  <template v-if="formInline.inputData.trim() && formInline.inputData.trim()!=formInline.importData">
                    <el-divider direction="vertical"></el-divider>
                    <el-button size="small" type="primary" @click="render">确定导入</el-button>
                  </template>
                </div>
              </div>
              <div class="card_content">
                <el-form :model="formInline" ref="importForm" @submit.native.prevent>
                  <el-form-item>
                    <el-radio-group v-model="formInline.dataType">
                      <el-radio label="blueprint">导入蓝图</el-radio>
                      <el-radio label="json">导入JSON</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item prop="inputData" :rules="rules.notNull">
                    <el-input type="textarea" v-model="formInline.inputData" :rows="5" ref="inputDataRef"></el-input>
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
                        <img class="icon" :src="getIcon(item)">
                        <div class="count">{{item.count}}</div>
                      </div>
                    </el-tooltip>
                  </div>
                </template>
              </div>
            </el-card>
            <el-card name="2">
              <div slot="header" class="card_header">
                <span class="title">生成配置</span>
                <div class="btnWrap">
                  <el-button size="small" type="primary" @click="output" v-if="formInline.blueprintData || formInline.paramType == '4'">输出</el-button>
                </div>
              </div>
              <div class="card_content">
                <el-form label-width="120px" :model="formInline" ref="paramForm" @submit.native.prevent :rules="rules">
                  <el-form-item label="转换类型：">
                    <el-radio-group v-model="formInline.paramType">
                      <el-radio label="0">垂直叠加</el-radio>
                      <el-radio label="1">坐标偏移</el-radio>
                      <el-radio label="2">水平翻转</el-radio>
                      <el-radio label="3">线性变换</el-radio>
                      <el-radio label="4">无中生有(无需导入)</el-radio>
                      <el-radio label="5">无带流</el-radio>
                      <el-radio label="6">清空标记</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <template v-if="formInline.paramType=='0'">
                    <!-- 垂直叠加 -->
                    <div class="flex">
                      <el-form-item label="生成层数：" prop="params.floors">
                        <el-input type="numberx" v-model="formInline.params.floors">
                        </el-input>
                      </el-form-item>
                      <el-form-item label="垂直间隔：" prop="params.spacing">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>常见物品的单层高度：</p>
                              <p>四向分流器：2</p>
                              <p>自动集装器：2</p>
                              <p>小型储物仓：2</p>
                              <p>大型储物仓：3</p>
                              <p>储液罐：3</p>
                              <p>矩阵研究站：3</p>
                              <p>制造台：4</p>
                            </template>
                            <span>垂直间隔<i class="el-icon-question "></i>：</span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.spacing">
                        </el-input>
                      </el-form-item>
                    </div>
                    <div class="flex">
                      <el-form-item label="各层关系：" prop="params.isPile" :rules="rules.selectNotNull">
                        <el-radio-group v-model="formInline.params.isPile">
                          <el-radio :label="true">
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template slot="content">
                                <p>*叠加后可堆叠的建筑将建立游戏内的堆叠关系，如箱子将互通</p>
                                <p>可堆叠物品：四向分流器、自动集装器、小型储物仓、大型储物仓、储液罐、矩阵研究站、喷涂机</p>
                              </template>
                              <span>堆叠<i class="el-icon-question "></i></span>
                            </el-tooltip>
                          </el-radio>
                          <el-radio :label="false">
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template slot="content">
                                <p>*叠加后每层独立运作</p>
                              </template>
                              <span>独立<i class="el-icon-question "></i></span>
                            </el-tooltip>
                          </el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </div>
                  </template>
                  <template v-if="formInline.paramType=='1'">
                    <!-- 坐标偏移 -->
                    <div class="flex">
                      <el-form-item label="偏移方向：" prop="params.offsetType" key="offsetType" :rules="rules.selectNotNull">
                        <el-radio-group v-model="formInline.params.offsetType">
                          <el-radio label="vertical">
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template slot="content">
                                <p>*悬空建筑重新框选复制后会提示“无地基支撑”，将无地基支撑蓝图重新导入，垂直偏移0单位导出可修正</p>
                              </template>
                              <span>垂直偏移<i class="el-icon-question "></i></span>
                            </el-tooltip>
                          </el-radio>
                          <el-radio label="horizontal">水平偏移</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </div>
                    <div class="flex">
                      <template v-if="formInline.params.offsetType=='vertical'">
                        <el-form-item label="垂直偏移量：" prop="params.offsetZ" key="offsetZ">
                          <template slot="label">
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template slot="content">
                                <p>基于0相对偏移</p>
                              </template>
                              <span>垂直偏移量<i class="el-icon-question "></i>：</span>
                            </el-tooltip>
                          </template>
                          <el-input type="number" v-model="formInline.params.offsetZ">
                          </el-input>
                        </el-form-item>
                      </template>
                      <template v-if="formInline.params.offsetType=='horizontal'">
                        <el-form-item label="横向偏移量：" prop="params.offsetX" key="offsetX">
                          <template slot="label">
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template slot="content">
                                <p>基于0相对偏移</p>
                              </template>
                              <span>横向偏移量<i class="el-icon-question "></i>：</span>
                            </el-tooltip>
                          </template>
                          <el-input type="number" v-model="formInline.params.offsetX">
                          </el-input>
                        </el-form-item>
                        <el-form-item label="纵向偏移量：" prop="params.offsetY" key="offsetY">
                          <template slot="label">
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template slot="content">
                                <p>基于0相对偏移</p>
                              </template>
                              <span>纵向偏移量<i class="el-icon-question "></i>：</span>
                            </el-tooltip>
                          </template>
                          <el-input type="number" v-model="formInline.params.offsetY">
                          </el-input>
                        </el-form-item>
                      </template>
                    </div>
                  </template>
                  <template v-if="formInline.paramType=='2'">
                    <!-- 水平翻转 -->
                    <div class="flex">
                      <el-form-item label="翻转方向：" prop="params.overturnType" key="overturnType" :rules="rules.selectNotNull">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>火力发电厂、微型聚变发电站的分拣器接口不对称，翻转后不对称的那个接口会无法连接</p>
                            </template>
                            <span>翻转方向<i class="el-icon-question "></i>：</span>
                          </el-tooltip>
                        </template>
                        <el-radio-group v-model="formInline.params.overturnType">
                          <el-radio label="x">横向翻转</el-radio>
                          <el-radio label="y">纵向翻转</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </div>
                  </template>
                  <template v-if="formInline.paramType=='3'">
                    <!-- 线性变换 -->
                    <div class="flex">
                      <el-form-item label="横向放缩量：" prop="params.zoomX" key="zoomX">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>基于1缩放</p>
                              <p>输入负数可横向翻转</p>
                              <p>*高纬度过密建筑提示建筑碰撞的蓝图，可用1.1放大蓝图间隙解决</p>
                            </template>
                            <span>横向放缩量<i class="el-icon-question "></i>：</span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.zoomX">
                        </el-input>
                      </el-form-item>
                      <el-form-item label="纵向放缩量：" prop="params.zoomY" key="zoomY">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>基于1缩放</p>
                              <p>输入负数可纵向翻转</p>
                              <p>*高纬度过密建筑提示建筑碰撞的蓝图，可用1.1放大蓝图间隙解决</p>
                            </template>
                            <span>纵向放缩量<i class="el-icon-question "></i>：</span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.zoomY">
                        </el-input>
                      </el-form-item>
                      <el-form-item label="旋转角度：" prop="params.rotate" key="rotate">
                        <template slot="label">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>-360至360</p>
                            </template>
                            <span>旋转角度<i class="el-icon-question "></i>：</span>
                          </el-tooltip>
                        </template>
                        <el-input type="number" v-model="formInline.params.rotate">
                        </el-input>
                      </el-form-item>
                    </div>
                  </template>
                  <template v-if="formInline.paramType=='4'">
                    <!-- 无中生有 -->
                    <div class="flex">
                      <el-form-item label="生成内容：" prop="params.createType" :rules="rules.selectNotNull">
                        <el-radio-group v-model="formInline.params.createType">
                          <el-radio label="0">
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template slot="content">
                                <p>调换起终点高度可更改传送带方向</p>
                              </template>
                              <span>无褶皱垂直传送带<i class="el-icon-question "></i></span>
                            </el-tooltip>
                          </el-radio>
                          <el-radio label="1">
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template slot="content">
                                <p>可实现超远距离无带传输的分拣器</p>
                                <p>生成的传送带两端将会有随机编码对应，可直接用传送带连接端点使用</p>
                              </template>
                              <span>虫洞分拣器<i class="el-icon-question "></i></span>
                            </el-tooltip>
                          </el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </div>
                    <template v-if="formInline.params.createType=='0'">
                      <div class="flex">
                        <!-- 无褶皱垂直传送带 -->
                        <el-form-item label="起点高度：" prop="params.startZ" key="startZ">
                          <el-input type="number" v-model="formInline.params.startZ">
                          </el-input>
                        </el-form-item>
                        <el-form-item label="终点高度：" prop="params.endZ" key="endZ">
                          <el-input type="number" v-model="formInline.params.endZ">
                          </el-input>
                        </el-form-item>
                      </div>
                    </template>
                    <template v-if="formInline.params.createType=='1'">
                      <!-- 虫洞分拣器 -->
                      <div class="flex">
                        <el-form-item label="起点相对坐标X：" prop="params.startPoint.X" key="startPoint.X">
                          <el-input type="number" v-model="formInline.params.startPoint.X">
                          </el-input>
                        </el-form-item>
                        <el-form-item label="起点相对坐标Y：" prop="params.startPoint.Y" key="startPoint.Y">
                          <el-input type="number" v-model="formInline.params.startPoint.Y">
                          </el-input>
                        </el-form-item>
                        <el-form-item label="起点相对坐标Z：" prop="params.startPoint.Z" key="startPoint.Z">
                          <el-input type="number" v-model="formInline.params.startPoint.Z">
                          </el-input>
                        </el-form-item>
                      </div>
                      <div class="flex">
                        <el-form-item label="终点相对坐标X：" prop="params.endPoint.X" key="endPoint.X">
                          <el-input type="number" v-model="formInline.params.endPoint.X">
                          </el-input>
                        </el-form-item>
                        <el-form-item label="终点相对坐标Y：" prop="params.endPoint.Y" key="endPoint.Y">
                          <el-input type="number" v-model="formInline.params.endPoint.Y">
                          </el-input>
                        </el-form-item>
                        <el-form-item label="终点相对坐标Z：" prop="params.endPoint.Z" key="endPoint.Z">
                          <el-input type="number" v-model="formInline.params.endPoint.Z">
                          </el-input>
                        </el-form-item>
                      </div>
                      <div class="flex">
                        <el-form-item label="分拣器方向：" prop="params.WinserterDir" key="WinserterDir">
                          <el-select v-model="formInline.params.WinserterDir">
                            <el-option value="left" label="向左"></el-option>
                            <el-option value="right" label="向右"></el-option>
                            <el-option value="top" label="向上"></el-option>
                            <el-option value="bottom" label="向下"></el-option>
                          </el-select>
                        </el-form-item>
                      </div>
                    </template>
                  </template>
                  <template v-if="formInline.paramType=='5'">
                    <!-- 无带流 -->
                    <el-form-item label="输出标记数：" prop="params.outputCountMode" key="outputCountMode" :rules="rules.selectNotNull">
                      <template slot="label">
                        <el-tooltip class="item" effect="dark" placement="top">
                          <template slot="content">
                            <p>输出后更改传送带图标下的标记数</p>
                            <p>*只会影响到带图标且标记数不为0的传送带节点</p>
                          </template>
                          <span>输出标记数<i class="el-icon-question "></i>：</span>
                        </el-tooltip>
                      </template>
                      <el-radio-group v-model="formInline.params.outputCountMode">
                        <el-radio label="none">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>原来输入什么数就输出什么数</p>
                            </template>
                            <span>原标记数<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </el-radio>
                        <el-radio label="speed">最终匹配的分拣器速度</el-radio>
                        <el-radio label="num">最终匹配的分拣器数量</el-radio>
                        <el-radio label="clear">
                          <el-tooltip class="item" effect="dark" placement="top">
                            <template slot="content">
                              <p>*只清除匹配上的传送带标记和分拣器过滤</p>
                              <p>清除所有请到“清空标记”功能输出</p>
                            </template>
                            <span>清除标记<i class="el-icon-question "></i></span>
                          </el-tooltip>
                        </el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                      <el-collapse>
                        <el-collapse-item>
                          <template slot="title">
                            操作步骤<i class="header-icon el-icon-info"></i>
                          </template>
                          <div class="line">
                            <b>步骤①、</b>拆掉分拣器下的传送带，让分拣器输入/输出端失效；
                          </div>
                          <div class="line">
                            <b>步骤②、</b>给失效的分拣器设置过滤物品（假设物品为A）；
                          </div>
                          <div class="line">
                            <b>步骤③、</b>给需要对接的传送带节点打上物品A的图标，并在图标下输入标记数（正数匹配输出端；负数匹配输入端）；
                          </div>
                          <div class="line">
                            <b>步骤④、</b>将传送带节点和分拣器（连带着建筑）复制进蓝图工具，使用“无带流”一键输出即可。
                          </div>
                        </el-collapse-item>
                        <el-collapse-item>
                          <template slot="title">
                            注意要点<i class="header-icon el-icon-info"></i>
                          </template>
                          <div class="line">
                            <b>要点①、</b>传送带图标下的<b>标记数必须为正数或负数</b>，不匹配0。
                          </div>
                          <div class="line">
                            <div>
                              <b>要点②、</b>标记数的<b>正负</b>用于控制分拣器是从传送带上<b>放入还是取出</b>。
                            </div>
                            <div>
                              （正数匹配分拣器失效的输出端；负数匹配分拣器失效的输入端）
                            </div>
                          </div>
                          <div class="line">
                            <div>
                              <b>要点③、</b>标记数的<b>数值</b>用于控制可接入的<b>分拣器总速度上限</b>。
                            </div>
                            <div>
                              （分拣器速度计算长度影响，长度1格时速度为：蓝6/绿3/黄1.5，具体看游戏内分拣器属性）
                            </div>
                            <div>
                              【如：“-30”可匹配5个蓝爪的输入端——从带上取走，“9”可匹配1个蓝爪+1个绿爪的输出端——往带上放置】
                            </div>
                          </div>
                          <div class="line">
                            <b>要点④、</b>一个传送带节点匹配满上限，才会匹配下一个符合条件的节点。（匹配顺序按建筑顺序）
                          </div>
                          <div class="line">
                            <b>要点⑤、</b>导入时传送带上已有的分拣器链接也会计入总速度。
                          </div>
                          <div class="line" style="color: red">
                            <b>要点⑥、</b>*一个传送带节点最多可链接8个分拣器。（官方限制，输入端和输出端合计）
                          </div>
                          <div class="line" style="color: red">
                            <b>要点⑦、</b>*蓝图每次复制后负数标记数会+1，因此粘贴进工具的蓝图会默认-1修正。（官方BUG）
                          </div>
                        </el-collapse-item>
                      </el-collapse>
                    </el-form-item>
                    <div style="text-align: center;line-height:50px">
                      <el-button type="warning" round @click="openUrl('https://www.bilibili.com/video/BV138411x7Sn')">操作视频教程</el-button>
                    </div>
                  </template>
                  <template v-if="formInline.paramType=='6'">
                    <!-- 清空标记 -->
                    <div class="flex">
                      <el-form-item label="清空选项：">
                        <el-checkbox v-model="formInline.params.clearBelt">清空传送带图标</el-checkbox>
                        <el-checkbox v-model="formInline.params.clearInserter">清空分拣器过滤</el-checkbox>
                      </el-form-item>
                    </div>

                  </template>
                </el-form>
              </div>
            </el-card>
            <el-card name="3">
              <div slot="header" class="card_header">
                <span class="title">输出结果</span>
                <div class="btnWrap" v-if="formInline.resData.trim() || formInline.resJSON.trim()">
                  <el-button plain size="small" @click="saveFile" icon="el-icon-folder-opened">导出{{formInline.resType=='blueprint'?'蓝图':formInline.resType=='json'?'JSON':''}}文件</el-button>
                  <el-button type="primary" plain size="small" @click="outToClipboard" icon="el-icon-document-copy">复制</el-button>
                  <el-divider direction="vertical"></el-divider>
                  <el-button type="primary" size="small" @click="outToInput">将结果重新导入</el-button>
                </div>
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
                    <el-input type="textarea" v-model="formInline.resData" :rows="5" readonly ref="resDataRef">
                    </el-input>
                  </el-form-item>
                  <el-form-item v-if="formInline.resType=='json'">
                    <el-input type="textarea" v-model="formInline.resJSON" :rows="5" readonly ref="resJSONRef">
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
                        <img class="icon" :src="getIcon(item)">
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
    <el-dialog title="匹配结果" :visible.sync="NBM_dia">
      <template v-if="NBM_failMap.length==0">
        <div>成功新增匹配分拣器端口数：{{NBM_successNum}}</div>
        <br>
        <div style="color: green">带过滤器的分拣器端口已全部匹配成功！</div>
      </template>
      <template v-else>
        <div>成功新增匹配分拣器端口数：{{NBM_successNum}}</div>
        <br>
        <div style="color: red">存在未匹配上的分拣器端口，如下：</div>
        <el-tree :data="NBM_failMap" :props="NBM_props" default-expand-all></el-tree>
      </template>
    </el-dialog>
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
          isPile: true,
          offsetType: "vertical",
          offsetX: 0.5,
          offsetY: 0.5,
          offsetZ: 0.5,
          overturnType: "x",
          zoomX: 1.1,
          zoomY: 1.1,
          rotate: 0,
          createType: "0",
          startZ: 0,
          endZ: 10,
          startPoint: {
            X: 0,
            Y: 0,
            Z: 0,
          },
          endPoint: {
            X: -6,
            Y: 4,
            Z: 0,
          },
          WinserterDir: "left",
          outputCountMode: "none",
          clearBelt: true,
          clearInserter: true,
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
        selectNotNull: [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0 && value !== false) {
                return callback(new Error("请选择"));
              }
              callback();
            },
            trigger: "change",
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
        "params.startZ": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入起点高度"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.endZ": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入终点高度"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.startPoint.X": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入起点相对坐标X"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.startPoint.Y": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入起点相对坐标Y"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.startPoint.Z": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入起点相对坐标Z"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.endPoint.X": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入终点相对坐标X"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.endPoint.Y": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入终点相对坐标Y"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.endPoint.Z": [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                return callback(new Error("请输入终点相对坐标Z"));
              }
              callback();
            },
            trigger: "blur",
          },
        ],
        "params.WinserterDir": [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error("请输入选择分拣器方向"));
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
      // 无带流匹配结果弹窗
      NBM_failMap: [],
      NBM_successNum: 0,
      NBM_dia: false,
      NBM_props: {
        children: "children",
        label: "label",
      },
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
    outToInput() {
      if (this.formInline.resType == "blueprint") {
        if (!this.formInline.resData){
          this.warning("请先生成数据");
          return;
        }
        this.$set(this.formInline, 'dataType', 'blueprint');
        this.$set(this.formInline, 'inputData', this.formInline.resData);
        this.render();
      } else if (this.formInline.resType == "json") {
        if (!this.formInline.resJSON){
          this.warning("请先生成数据");
          return;
        }
        this.$set(this.formInline, 'dataType', 'json');
        this.$set(this.formInline, 'inputData', this.formInline.resJSON);
        this.formInline.dataType = "json";
        this.render();
      }
    },
    async outToClipboard() {
      const Clipboard = navigator?.clipboard;
      let typeName;
      let text;
      let textRef;
      if (this.formInline.resType == "blueprint") {
        if (!this.formInline.resData){
          return this.warning("请先生成数据");
        }
        typeName = '蓝图';
        text = this.formInline.resData;
        textRef = this.$refs?.resDataRef;
      } else if (this.formInline.resType == "json") {
        if (!this.formInline.resJSON){
          return this.warning("请先生成数据");
        }
        typeName = 'JSON';
        text = this.formInline.resJSON;
        textRef = this.$refs?.resJSONRef;
      }
      if (!text || !textRef) {
        return this.warning("数据错误，复制失败！");
      }
      textRef.select();

      if(Clipboard) {
        try {
          await navigator.clipboard.writeText(text);
          this.success(`已将${typeName}复制到剪贴板！`);
        } catch(e){
          console.log('未授权复制权限');
          // 降级尝试使用execCommand复制
          document.execCommand('copy');
          this.success(`已将${typeName}复制到剪贴板！`);
        }
      } else {
        console.log('浏览器不支持navigator.clipboard');
        // 降级尝试使用execCommand复制
        document.execCommand('copy');
        this.success(`已将${typeName}复制到剪贴板！`);
      }
    },
    async inputFromClipboard() {
      const Clipboard = navigator?.clipboard;
      if(Clipboard) {
        try {
          const text = await navigator.clipboard.readText();
          this.$set(this.formInline, 'inputData', text);
          this.success(`已将剪贴板内容粘贴到输入框！`);
        } catch(e){
          console.log('未授权粘贴权限');
          this.inputFromClipboard_execCommand();
        }
      } else {
        console.log('浏览器不支持navigator.clipboard');
        this.inputFromClipboard_execCommand();
      }
    },
    inputFromClipboard_execCommand() {
      // 降级尝试使用execCommand粘贴
      let inputDataRef = this.$refs?.inputDataRef;
      if (!inputDataRef) {
        return this.warning("数据错误，粘贴失败！");
      }
      inputDataRef.focus();
      if(document.execCommand('paste')) {
        this.success(`已将剪贴板内容粘贴到输入框！`);
      } else {
        // chrome 执行返回 false 因为读取剪切板涉及用户隐私安全，必须的用户允许的情况下可以进行访问
        this.warning(`浏览器未授权读取剪贴板，粘贴失败！`);
      }
    },
    getIcon(item) {
      let icon = item?.icon;
      if (!icon) return null;
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
          icon: itemInfo?.icon,
          name: itemInfo?.name || `未知物品_${k}`,
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
    clearIcon(blueprintData, clearBelt, clearInserter) {
      // 清空标记
      let res = this.verticalOffset(blueprintData, 0); // 深拷贝，并处理悬空建筑
      if (clearBelt || clearInserter) {
        res.buildings.forEach((v) => {
          switch (v.itemId) {
            case 2001: // 传送带
            case 2002: // 高速传送带
            case 2003: // 极速传送带
              if (clearBelt && v.parameters?.iconId) {
                v.parameters.iconId = 0;
                v.parameters.count = 0;
              }
              break;
            case 2011: // 分拣器
            case 2012: // 高速分拣器
            case 2013: // 极速分拣器
              if (clearInserter && v.filterId) {
                v.filterId = 0;
              }
              break;
          }
        });
      }
      return res;
    },
    noBeltMethod(blueprintData, outputCountMode) {
      // 无带流（根据标记匹配分拣器输入输出端）
      let res = this.verticalOffset(blueprintData, 0); // 深拷贝，并处理悬空建筑
      // 带标记且conut不为0的传送带Map
      const beltMap = {
        // 传送带index:{
        //   传送带标记数count,
        //   已链接速度linkSpeed,
        //   已链接端口数linkNum,
        //   传送带对象beltItem,
        // }
      };
      // 所有分拣器对象
      const inserterList = [];
      this.NBM_failMap = []; // 未匹配上的分拣器端口
      this.NBM_successNum = 0;
      let addFail = (filterId, itemId, type) => {
        let filterName = itemsData.find((d) => d.id == filterId)?.name || `未知物品_${filterId}`;
        let itemName =
          itemId == 2011
            ? "分拣器(黄爪)"
            : itemId == 2012
            ? "高速分拣器(绿爪)"
            : "极速分拣器(蓝爪)";
        let item1 = this.NBM_failMap.find((item) => item.label == filterName);
        if (!item1) {
          item1 = {
            label: filterName,
            itemId: filterId,
            children: [],
          };
          this.NBM_failMap.push(item1);
        }
        let item2 = item1.children.find((item) => item.label == itemName);
        if (!item2) {
          item2 = {
            label: itemName,
            itemId: itemId,
            children: [],
          };
          item1.children.push(item2);
        }
        let item3 = item2.children.find((item) => item.type == type);
        if (!item3) {
          item3 = {
            label: type + "：1",
            type: type,
            num: 1,
          };
          item2.children.push(item3);
        } else {
          item3.num += 1;
          item3.label = `${item3.type}：${item3.num}`;
        }
      };

      res.buildings.forEach((v) => {
        switch (v.itemId) {
          case 2001: // 传送带
          case 2002: // 高速传送带
          case 2003: // 极速传送带
            var count = v.parameters?.count;
            var iconId = v.parameters?.iconId;
            // 保存带标记且conut不为0的传送带
            if (count && iconId) {
              if (count < 0) {
                // 解决官方负数标记数复制后会+1的bug
                count -= 1;
                v.parameters.count = count;
              }
              beltMap[v.index] = {
                count: +count,
                iconId: iconId,
                linkSpeed: 0,
                linkNum: 0,
                beltItem: v,
              };

              if (outputCountMode == "speed") {
                // 输出已匹配速度
                v.parameters.count = beltMap[v.index].linkSpeed;
              } else if (outputCountMode == "num") {
                // 输出已匹配数量
                v.parameters.count = beltMap[v.index].linkNum;
              } else if (outputCountMode == "clear") {
                // 清除标记
                v.parameters.count = 0;
                v.parameters.iconId = 0;
              }
            }
            break;
          case 2011: // 分拣器
          case 2012: // 高速分拣器
          case 2013: // 极速分拣器
            // 保存所有分拣器对象
            inserterList.push(v);
            break;
        }
      });

      // 计算已链接在传送带上的分拣器数量和速度
      inserterList.forEach((v) => {
        var Speed = v.itemId == 2011 ? 1.5 : v.itemId == 2012 ? 3 : 6;
        Speed /= v.parameters.length || 1; // 计入分拣器长度

        // 输出端不为空 且为 Map中的传送带
        if (v.outputObjIdx != -1 && beltMap[v.outputObjIdx]) {
          let beltObj = beltMap[v.outputObjIdx];
          beltObj.linkSpeed += Speed;
          beltObj.linkNum++;

          if (outputCountMode == "speed") {
            // 输出已匹配速度
            beltObj.beltItem.parameters.count = beltObj.linkSpeed;
          } else if (outputCountMode == "num") {
            // 输出已匹配数量
            beltObj.beltItem.parameters.count = beltObj.linkNum;
          }
        }

        // 输入端不为空 且为 Map中的传送带
        if (v.inputObjIdx != -1 && beltMap[v.inputObjIdx]) {
          let beltObj = beltMap[v.inputObjIdx];
          beltObj.linkSpeed -= Speed;
          beltObj.linkNum++;

          if (outputCountMode == "speed") {
            // 输出已匹配速度
            beltObj.beltItem.parameters.count = beltObj.linkSpeed;
          } else if (outputCountMode == "num") {
            // 输出已匹配数量
            beltObj.beltItem.parameters.count = beltObj.linkNum;
          }
        }
      });

      inserterList.forEach((v) => {
        var Speed = v.itemId == 2011 ? 1.5 : v.itemId == 2012 ? 3 : 6;
        Speed /= v.parameters.length || 1; // 计入分拣器长度

        // 带过滤条件的失效 输出端
        if (v.filterId && v.outputObjIdx == -1) {
          // *同一传送带节点链接数不能超过8个
          var index = Object.keys(beltMap).find(
            (idx) =>
              beltMap[idx].count > 0 &&
              beltMap[idx].iconId == v.filterId &&
              beltMap[idx].beltItem &&
              beltMap[idx].linkSpeed + Speed <= beltMap[idx].count &&
              beltMap[idx].linkNum < 8
          );
          if (index || index === 0) {
            v.outputObjIdx = +index;
            v.outputToSlot = -1; // 传送带接口为-1
            beltMap[index].linkSpeed += Speed;
            beltMap[index].linkNum++; // 节点链接数+1

            if (outputCountMode == "speed") {
              // 输出已匹配速度
              beltMap[index].beltItem.parameters.count = beltMap[index].linkSpeed;
            } else if (outputCountMode == "num") {
              // 输出已匹配数量
              beltMap[index].beltItem.parameters.count = beltMap[index].linkNum;
            } else if (outputCountMode == "clear") {
              // 清除标记
              beltMap[index].beltItem.parameters.count = 0;
              beltMap[index].beltItem.parameters.iconId = 0;
              v.filterId = 0;
            }

            this.NBM_successNum += 1;
          } else {
            addFail(v.filterId, v.itemId, "输出端");
          }
        }

        // 带过滤条件的失效 输入端
        if (v.filterId && v.inputObjIdx == -1) {
          // *同一传送带节点链接数不能超过8个
          let index = Object.keys(beltMap).find(
            (idx) =>
              beltMap[idx].count < 0 &&
              beltMap[idx].iconId == v.filterId &&
              beltMap[idx].beltItem &&
              beltMap[idx].linkSpeed - Speed >= beltMap[idx].count &&
              beltMap[idx].linkNum < 8
          );
          if (index || index === 0) {
            v.inputObjIdx = +index;
            v.inputFromSlot = -1; // 传送带接口为-1
            beltMap[index].linkSpeed -= Speed;
            beltMap[index].linkNum++; // 节点链接数+1

            if (outputCountMode == "speed") {
              // 输出已匹配速度
              beltMap[index].beltItem.parameters.count = beltMap[index].linkSpeed;
            } else if (outputCountMode == "num") {
              // 输出已匹配数量
              beltMap[index].beltItem.parameters.count = beltMap[index].linkNum;
            } else if (outputCountMode == "clear") {
              // 清除标记
              beltMap[index].beltItem.parameters.count = 0;
              beltMap[index].beltItem.parameters.iconId = 0;
              v.filterId = 0;
            }

            this.NBM_successNum += 1;
          } else {
            addFail(v.filterId, v.itemId, "输入端");
          }
        }
      });
      console.log(beltMap, "beltMap");
      this.NBM_dia = true;
      return res;
    },
    newBlueprint(name) {
      return {
        header: {
          layout: 10,
          icons: [0, 0, 0, 0, 0],
          time: new Date(),
          gameVersion: "0.9.26.13026",
          shortDesc: name,
          desc: "",
        },
        version: 1,
        cursorOffset: {
          x: 0,
          y: 0,
        },
        cursorTargetArea: 0,
        dragBoxSize: {
          x: 1,
          y: 1,
        },
        primaryAreaIdx: 0,
        areas: [
          {
            index: 0,
            parentIndex: -1,
            tropicAnchor: 0,
            areaSegments: 200,
            anchorLocalOffset: {
              x: 0,
              y: 0,
            },
            size: {
              x: 1,
              y: 1,
            },
          },
        ],
        buildings: [],
      };
    },
    createBelt({
      index = 0,
      itemId = 2003,
      x = 0,
      y = 0,
      z = 0,
      yaw = 180,
      outputObjIdx = -1,
      parameters = null,
    }) {
      return {
        index: index,
        areaIndex: 0,
        localOffset: [
          { x: x, y: y, z: z },
          { x: x, y: y, z: z },
        ],
        yaw: [yaw, yaw],
        itemId: itemId,
        modelIndex: 37,
        outputObjIdx: outputObjIdx,
        inputObjIdx: -1,
        outputToSlot: outputObjIdx == -1 ? 0 : 1,
        inputFromSlot: 0,
        outputFromSlot: 0,
        inputToSlot: 1,
        outputOffset: 0,
        inputOffset: 0,
        recipeId: 0,
        filterId: 0,
        parameters: parameters,
      };
    },
    createVbelt(startZ, endZ) {
      // 生成垂直传送带
      startZ = +startZ;
      endZ = +endZ;
      let res = this.newBlueprint("无褶皱垂直传送带-" + startZ + "-" + endZ);
      let isUp = startZ <= endZ;
      const skewX = 0.0002;
      let curX = 0;
      res.buildings.push(
        this.createBelt({
          index: 0,
          itemId: 2003,
          z: endZ,
          x: (curX += skewX),
        })
      );
      let prevZ = endZ;
      let end = Math[isUp ? "floor" : "ceil"](endZ * 2) / 2;
      let start = Math[isUp ? "ceil" : "floor"](startZ * 2) / 2;
      for (let z = end; isUp ? z > start : z < start; isUp ? (z -= 0.5) : (z += 0.5)) {
        if (z != prevZ) {
          prevZ = z;
          let len = res.buildings.length;
          res.buildings.push(
            this.createBelt({
              index: len,
              itemId: 2003,
              z: prevZ,
              outputObjIdx: len - 1,
              x: (curX += skewX),
            })
          );
        }
      }
      let len = res.buildings.length;
      res.buildings.push(
        this.createBelt({
          index: len,
          itemId: 2003,
          z: startZ,
          outputObjIdx: len - 1,
          x: (curX += skewX),
        })
      );
      return res;
    },
    createWinserter(startPoint, endPoint, WinserterDir) {
      // 虫洞分拣器
      const startPointX = +startPoint.X;
      const startPointY = +startPoint.Y;
      const startPointZ = +startPoint.Z;
      const endPointX = +endPoint.X;
      const endPointY = +endPoint.Y;
      const endPointZ = +endPoint.Z;
      let count = ~~(Math.random() * 999999);
      let res = this.newBlueprint(
        `虫洞分拣器-(${startPointX},${startPointY},${startPointZ})-(${endPointX},${endPointY},${endPointZ})-${count}`
      );
      // 目标传送带
      res.buildings.push(
        this.createBelt({
          index: 0,
          itemId: 2003,
          x: endPointX,
          y: endPointY,
          z: endPointZ,
          parameters: {
            iconId: 43501,
            count: count,
          },
        })
      );
      // 起始传送带
      res.buildings.push(
        this.createBelt({
          index: 1,
          itemId: 2003,
          x: startPointX,
          y: startPointY,
          z: startPointZ,
          parameters: {
            iconId: 507,
            count: count,
          },
        })
      );
      // 分拣器
      let offsetObj = { x: startPointX - 1, y: startPointY, z: startPointZ };
      let yaw = [270, 270];
      switch (WinserterDir) {
        case "left":
          offsetObj = { x: startPointX - 1, y: startPointY, z: startPointZ };
          yaw = [270, 270];
          break;
        case "right":
          offsetObj = { x: startPointX + 1, y: startPointY, z: startPointZ };
          yaw = [90, 90];
          break;
        case "top":
          offsetObj = { x: startPointX, y: startPointY + 1, z: startPointZ };
          yaw = [0, 0];
          break;
        case "bottom":
          offsetObj = { x: startPointX, y: startPointY - 1, z: startPointZ };
          yaw = [180, 180];
          break;
      }
      res.buildings.push({
        index: 2,
        areaIndex: 0,
        localOffset: [{ x: startPointX, y: startPointY, z: startPointZ }, offsetObj],
        yaw: yaw,
        itemId: 2013,
        modelIndex: 43,
        outputObjIdx: 0,
        inputObjIdx: 1,
        outputToSlot: -1,
        inputFromSlot: -1,
        outputFromSlot: 0,
        inputToSlot: 1,
        outputOffset: 0,
        inputOffset: 0,
        recipeId: 0,
        filterId: 0,
        parameters: {
          length: 1,
        },
      });
      return res;
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

      let overturnX = zoomX < 0; // x翻转
      let overturnY = zoomY < 0; // y翻转
      // 传送带接口建筑
      let beltSlotBuilds = [
        {
          itemId: 2020, // 四向分流器
          modelIndex: 38, // 十字单层
          indexs: [],
          axis: "x", // 模型yaw=0时对称方向(对称轴的垂直方向)
          alterSlot: {
            x: { 1: 3, 3: 1 },
            y: { 0: 2, 2: 0 },
          },
        },
        {
          itemId: 2020, // 四向分流器
          modelIndex: 39, // 一字双层
          indexs: [],
          axis: "x",
          alterSlot: {
            x: {},
            y: { 0: 2, 1: 3, 2: 0, 3: 1 },
          },
        },
        {
          itemId: 2020, // 四向分流器
          modelIndex: 40, // 十字双层
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 1: 3, 3: 1 },
            y: { 0: 2, 2: 0 },
          },
        },
      ];
      // 分拣器接口建筑
      let inserterSlotBuilds = [
        {
          itemId: 2101, // 小型储物仓
          indexs: [],
          axis: "x", // 模型yaw=0时对称方向(对称轴的垂直方向)
          alterSlot: {
            x: { 0: 2, 2: 0, 3: 11, 4: 10, 5: 9, 6: 8, 8: 6, 9: 5, 10: 4, 11: 3 },
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0, 9: 11, 11: 9 },
          },
        },
        {
          itemId: 2102, // 大型储物仓
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 2, 2: 0, 3: 11, 4: 10, 5: 9, 6: 8, 8: 6, 9: 5, 10: 4, 11: 3 },
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0, 9: 11, 11: 9 },
          },
        },
        {
          itemId: 2204, // 火力发电厂
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 4, 1: 3, 3: 1, 4: 0 }, // 2不对称
            y: { 0: 1, 1: 0, 3: 4, 4: 3 }, // 2不对称
          },
        },
        {
          itemId: 2211, // 微型聚变发电站
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 4, 1: 3, 3: 1, 4: 0 }, // 2不对称
            y: { 0: 1, 1: 0, 3: 4, 4: 3 }, // 2不对称
          },
        },
        {
          itemId: 2302, // 电弧熔炉
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 2, 2: 0, 3: 11, 4: 10, 5: 9, 6: 8, 8: 6, 9: 5, 10: 4, 11: 3 },
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0, 9: 11, 11: 9 },
          },
        },
        {
          itemId: 2315, // 位面熔炉
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 2, 2: 0, 3: 11, 4: 10, 5: 9, 6: 8, 8: 6, 9: 5, 10: 4, 11: 3 },
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0, 9: 11, 11: 9 },
          },
        },
        {
          itemId: 2303, // 制造台 Mk.I
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 2, 2: 0, 3: 11, 4: 10, 5: 9, 6: 8, 8: 6, 9: 5, 10: 4, 11: 3 },
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0, 9: 11, 11: 9 },
          },
        },
        {
          itemId: 2304, // 制造台 Mk.II
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 2, 2: 0, 3: 11, 4: 10, 5: 9, 6: 8, 8: 6, 9: 5, 10: 4, 11: 3 },
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0, 9: 11, 11: 9 },
          },
        },
        {
          itemId: 2305, // 制造台 Mk.III
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 2, 2: 0, 3: 11, 4: 10, 5: 9, 6: 8, 8: 6, 9: 5, 10: 4, 11: 3 },
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0, 9: 11, 11: 9 },
          },
        },
        {
          itemId: 2308, // 原油精炼厂
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 0, 6: 8, 8: 6 },
            y: { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 0, 6: 8, 8: 6 },
          },
        },
        {
          itemId: 2309, // 化工厂
          indexs: [],
          axis: "y",
          alterSlot: {
            x: { 0: 7, 1: 2, 2: 1, 3: 6, 4: 5, 5: 4, 6: 3, 7: 0 },
            y: { 0: 6, 1: 5, 2: 4, 3: 7, 4: 2, 5: 1, 6: 0, 7: 3 },
          },
        },
        {
          itemId: 2317, // 量子化工厂
          indexs: [],
          axis: "y",
          alterSlot: {
            x: { 0: 7, 1: 2, 2: 1, 3: 6, 4: 5, 5: 4, 6: 3, 7: 0 },
            y: { 0: 6, 1: 5, 2: 4, 3: 7, 4: 2, 5: 1, 6: 0, 7: 3 },
          },
        },
        {
          itemId: 2310, // 微型粒子对撞机
          indexs: [],
          axis: "y",
          alterSlot: {
            x: {}, // 不对称
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0 },
          },
        },
        {
          itemId: 2311, // 电磁轨道弹射器
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 1, 1: 0 },
            y: { 2: 3, 3: 2 },
          },
        },
        {
          itemId: 2210, // 人造恒星
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 1: 3, 3: 1 },
            y: { 1: 2, 2: 1 },
          },
        },
        {
          itemId: 2312, // 垂直发射井
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 1: 2, 2: 1 },
            y: {}, // 不对称
          },
        },
        {
          itemId: 2901, // 矩阵研究站
          indexs: [],
          axis: "x",
          alterSlot: {
            x: { 0: 2, 2: 0, 3: 11, 4: 10, 5: 9, 6: 8, 8: 6, 9: 5, 10: 4, 11: 3 },
            y: { 0: 8, 1: 7, 2: 6, 3: 5, 5: 3, 6: 2, 7: 1, 8: 0, 9: 11, 11: 9 },
          },
        },
      ];
      if (zoomX * zoomY < 0) {
        res.buildings.forEach((v) => {
          beltSlotBuilds.forEach((build) => {
            if (
              build.itemId == v.itemId &&
              (!build.modelIndex || build.modelIndex == v.modelIndex)
            ) {
              if (overturnX) {
                if (build.axis == "y") {
                  v.yaw[0] -= 180;
                  v.yaw[1] -= 180;
                }
              }
              if (overturnY) {
                if (build.axis == "y") {
                  v.yaw[0] -= 180;
                  v.yaw[1] -= 180;
                }
              }
              // 四向过滤接口单独处理翻转 1->3 0->2
              if (v.itemId == 2020 && v.parameters.priority) {
                const orginPriority = this.deepCopy(v.parameters.priority);
                v.parameters.priority.forEach((b, i) => {
                  if (overturnX) {
                    const targetIndex = build.alterSlot[build.axis][i];
                    if (targetIndex != null) v.parameters.priority[i] = orginPriority[targetIndex];
                  }
                  if (overturnY) {
                    const targetIndex = build.alterSlot[build.axis][i];
                    if (targetIndex != null) v.parameters.priority[i] = orginPriority[targetIndex];
                  }
                });
              }
              build.indexs.push(v.index);
            }
          });
          inserterSlotBuilds.forEach((build) => {
            if (build.itemId == v.itemId) {
              if (overturnX) {
                if (build.axis == "y") {
                  v.yaw[0] -= 180;
                  v.yaw[1] -= 180;
                }
              }
              if (overturnY) {
                if (build.axis == "y") {
                  v.yaw[0] -= 180;
                  v.yaw[1] -= 180;
                }
              }
              build.indexs.push(v.index);
            }
          });
        });
      }

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
        if (overturnX) {
          v.yaw[0] = -v.yaw[0];
          v.yaw[1] = -v.yaw[1];
        }
        if (overturnY) {
          v.yaw[0] = 180 - v.yaw[0];
          v.yaw[1] = 180 - v.yaw[1];
        }

        v.yaw[0] -= rotate;
        v.yaw[1] -= rotate;

        // 翻转接口
        if (zoomX * zoomY < 0) {
          if (v.itemId == 2204 || v.itemId == 2211) {
            // 火力发电厂、微型聚变发电站翻转偏移
            v.localOffset[0].x += 1 * Math.cos((v.yaw[0] * Math.PI) / 180);
            v.localOffset[1].x += 1 * Math.cos((v.yaw[1] * Math.PI) / 180);
            v.localOffset[0].y -= 1 * Math.sin((v.yaw[0] * Math.PI) / 180);
            v.localOffset[1].y -= 1 * Math.sin((v.yaw[1] * Math.PI) / 180);
          }
          if (v.itemId == 2309 || v.itemId == 2317) {
            // 化工厂、量子化工厂翻转偏移
            v.localOffset[0].x -= 1 * Math.sin((v.yaw[0] * Math.PI) / 180);
            v.localOffset[1].x -= 1 * Math.sin((v.yaw[1] * Math.PI) / 180);
            v.localOffset[0].y -= 1 * Math.cos((v.yaw[0] * Math.PI) / 180);
            v.localOffset[1].y -= 1 * Math.cos((v.yaw[1] * Math.PI) / 180);
          }
          switch (v.itemId) {
            case 2001: // 传送带
            case 2002: // 高速传送带
            case 2003: // 极速传送带
              beltSlotBuilds.forEach((build) => {
                build.indexs.forEach((index) => {
                  if (v.inputObjIdx == index) {
                    const orginInputFromSlot = v.inputFromSlot;
                    if (overturnX) {
                      const inputSlot = build.alterSlot[build.axis][+orginInputFromSlot];
                      if (inputSlot != null) v.inputFromSlot = inputSlot;
                    }
                    if (overturnY) {
                      const inputSlot = build.alterSlot[build.axis][+orginInputFromSlot];
                      if (inputSlot != null) v.inputFromSlot = inputSlot;
                    }
                  }
                  if (v.outputObjIdx == index) {
                    const orginOutputToSlot = v.outputToSlot;
                    if (overturnX) {
                      const outputSlot = build.alterSlot[build.axis][+orginOutputToSlot];
                      if (outputSlot != null) v.outputToSlot = outputSlot;
                    }
                    if (overturnY) {
                      const outputSlot = build.alterSlot[build.axis][+orginOutputToSlot];
                      if (outputSlot != null) v.outputToSlot = outputSlot;
                    }
                  }
                });
              });
              break;
            case 2011: // 分拣器
            case 2012: // 高速分拣器
            case 2013: // 极速分拣器
              inserterSlotBuilds.forEach((build) => {
                build.indexs.forEach((index) => {
                  if (v.inputObjIdx == index) {
                    const orginInputFromSlot = v.inputFromSlot;
                    if (overturnX) {
                      const inputSlot = build.alterSlot[build.axis][+orginInputFromSlot];
                      if (inputSlot != null) v.inputFromSlot = inputSlot;
                    }
                    if (overturnY) {
                      const inputSlot = build.alterSlot[build.axis][+orginInputFromSlot];
                      if (inputSlot != null) v.inputFromSlot = inputSlot;
                    }
                  }
                  if (v.outputObjIdx == index) {
                    const orginOutputToSlot = v.outputToSlot;
                    if (overturnX) {
                      const outputSlot = build.alterSlot[build.axis][+orginOutputToSlot];
                      if (outputSlot != null) v.outputToSlot = outputSlot;
                    }
                    if (overturnY) {
                      const outputSlot = build.alterSlot[build.axis][+orginOutputToSlot];
                      if (outputSlot != null) v.outputToSlot = outputSlot;
                    }
                  }
                });
              });
              break;
          }
        }
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
      let needBase = false; // 是否卡地基浮空
      let changIndex = false; // 是否变更index顺序
      let inserterList = []; // 分拣器集合
      let newBuildings = [];
      res.buildings.forEach((v) => {
        v.localOffset[0].z += +offsetZ;
        v.localOffset[1].z += +offsetZ;
        switch (v.itemId) {
          case 2020: // 四向分流器
          case 2040: // 自动集装器
          case 2106: // 储液罐
            // 可堆叠建筑
            if ((v.localOffset[0].z > 1 || v.localOffset[1].z > 1) && v.inputObjIdx == -1) {
              v.inputObjIdx = res.buildings.length;
              needBase = true;
            }
            newBuildings.push(v);
            break;
          case 2101: // 小型储物仓
          case 2102: // 大型储物仓
          case 2901: // 矩阵研究站
            // 带分拣器的可堆叠建筑
            if ((v.localOffset[0].z > 1 || v.localOffset[1].z > 1) && v.inputObjIdx == -1) {
              v.inputObjIdx = res.buildings.length;
              needBase = true;
              // 悬空建筑如果先建分拣器会导致输出端链接失效，判断建筑为悬空建筑时挪到最前面
              newBuildings.unshift(v);
              changIndex = true;
            } else {
              newBuildings.push(v);
            }
            break;
          case 2001: // 传送带
          case 2002: // 高速传送带
          case 2003: // 极速传送带
          case 2030: // 流速监测器
            newBuildings.push(v);
            break;
          case 2011: // 分拣器
          case 2012: // 高速分拣器
          case 2013: // 极速分拣器
            inserterList.push(v);
            newBuildings.push(v);
            break;
          case 2313: // 喷涂机
            // 不能用地基当底
            newBuildings.push(v);
            break;
          case 1131: // 地基
            v.localOffset[0].z = -10;
            v.localOffset[1].z = -10;
            newBuildings.push(v);
            break;
          default:
            if ((v.localOffset[0].z > 1 || v.localOffset[1].z > 1) && v.inputObjIdx == -1) {
              v.inputObjIdx = res.buildings.length;
              needBase = true;
              // 悬空建筑如果先建分拣器会导致输出端链接失效，判断建筑为悬空建筑时挪到最前面
              newBuildings.unshift(v);
              changIndex = true;
            } else {
              newBuildings.push(v);
            }
            break;
        }
      });
      if (needBase) {
        newBuildings.push({
          index: newBuildings.length,
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
      if (changIndex) {
        this.formatIndex(newBuildings);
      }
      res.buildings = newBuildings;
      console.log(res.buildings);
      return res;
    },
    formatIndex(buildings) {
      // 重排index顺序
      let indexMap = {};
      buildings.forEach((v, index) => {
        indexMap[v.index] = index;
      });
      buildings.forEach((v) => {
        v.index = indexMap[v.index];
        if (v.outputObjIdx != -1) v.outputObjIdx = indexMap[v.outputObjIdx];
        if (v.inputObjIdx != -1) v.inputObjIdx = indexMap[v.inputObjIdx];
      });
    },
    verticalCopy(blueprintData, floors, spacing, isPile = true) {
      // 垂直叠加
      let res = this.deepCopy(blueprintData); // 深拷贝
      let buildings = res.buildings;
      let prevFloor = buildings;
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
              if (v.outputObjIdx != -1) {
                newItem.outputObjIdx = v.outputObjIdx + prevFloor.length;
              }
              if (v.inputObjIdx != -1) {
                newItem.inputObjIdx = v.inputObjIdx + prevFloor.length;
              } else {
                if (isPile) {
                  // 堆叠,递归找到可叠加节点的最高层
                  newItem.inputObjIdx = this.findUppermost(prevFloor, v.itemId, v.index);
                }
              }
              nextFloor.push(newItem);
              break;
            case 2001: // 传送带
            case 2002: // 高速传送带
            case 2003: // 极速传送带
            case 2011: // 分拣器
            case 2012: // 高速分拣器
            case 2013: // 极速分拣器
            case 2030: // 流速监测器
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
              nextFloor.push(newItem);
              break;
          }
        });
        prevFloor = nextFloor;
        res.buildings.push(...nextFloor);
      }
      res = this.verticalOffset(res, 0); // 给悬空建筑建地基底
      return res;
    },
    output() {
      if (!this.formInline.blueprintData && this.formInline.paramType != "4") {
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
              // 垂直叠加
              this.formInline.resBlueprintData = this.verticalCopy(
                this.formInline.blueprintData,
                +this.formInline.params.floors,
                +this.formInline.params.spacing,
                this.formInline.params.isPile
              );
              break;
            case "1":
              // 坐标偏移
              if (this.formInline.params.offsetType == "vertical") {
                // 垂直偏移
                this.formInline.resBlueprintData = this.verticalOffset(
                  this.formInline.blueprintData,
                  +this.formInline.params.offsetZ
                );
              } else if (this.formInline.params.offsetType == "horizontal") {
                // 水平偏移
                this.formInline.resBlueprintData = this.horizontalOffset(
                  this.formInline.blueprintData,
                  +this.formInline.params.offsetX,
                  +this.formInline.params.offsetY
                );
              }
              break;
            case "2":
              // 水平翻转
              if (this.formInline.params.overturnType == "x") {
                // 横向翻转
                this.formInline.resBlueprintData = this.linearTransformation(
                  this.formInline.blueprintData,
                  -1,
                  1,
                  0
                );
              } else if (this.formInline.params.overturnType == "y") {
                // 纵向翻转
                this.formInline.resBlueprintData = this.linearTransformation(
                  this.formInline.blueprintData,
                  1,
                  -1,
                  0
                );
              }
              break;
            case "3":
              // 线性变换
              this.formInline.resBlueprintData = this.linearTransformation(
                this.formInline.blueprintData,
                +this.formInline.params.zoomX,
                +this.formInline.params.zoomY,
                +this.formInline.params.rotate
              );
              break;
            case "4":
              // 无中生有
              switch (this.formInline.params.createType) {
                case "0":
                  // 无褶皱垂直传送带
                  this.formInline.resBlueprintData = this.createVbelt(
                    this.formInline.params.startZ,
                    this.formInline.params.endZ
                  );
                  break;
                case "1":
                  // 虫洞分拣器
                  this.formInline.resBlueprintData = this.createWinserter(
                    this.formInline.params.startPoint,
                    this.formInline.params.endPoint,
                    this.formInline.params.WinserterDir
                  );
                  break;
              }
              break;
            case "5":
              // 无带流
              this.formInline.resBlueprintData = this.noBeltMethod(
                this.formInline.blueprintData,
                this.formInline.params.outputCountMode
              );
              break;
            case "6":
              // 清空图标
              this.formInline.resBlueprintData = this.clearIcon(
                this.formInline.blueprintData,
                this.formInline.params.clearBelt,
                this.formInline.params.clearInserter
              );
              break;
            default:
              this.warning("错误的转换类型！");
              return;
          }
          this.success("输出成功！");
          console.log(this.formInline.resBlueprintData);
          this.$set(this.formInline, "resData", PARSER.toStr(this.formInline.resBlueprintData));
          this.$set(this.formInline, "resJSON", JSON.stringify(this.formInline.resBlueprintData));
        }
      });
    },
    saveFile() {
      if (!this.formInline.resType) {
        this.warning("请选择导出类型");
        return;
      }
      let typeName;
      let fileName;
      let blob;
      if (this.formInline.resType == "blueprint") {
        if (!this.formInline.resData){
          return this.warning("请先生成数据");
        }
        typeName = "蓝图";
        fileName = this.formInline.resType + Date.now() + ".txt";
        blob = new Blob(
          [this.formInline.resData],
          { type: "text/plain;charset=utf-8" }
        );
      }
      if (this.formInline.resType == "json") {
        if (!this.formInline.resJSON){
          return this.warning("请先生成数据");
        }
        typeName = "JSON";
        fileName = this.formInline.resType + Date.now() + ".json";
        blob = new Blob(
          [this.formInline.resJSON],
          { type: "text/plain;charset=utf-8" }
        );
      }
      if (!fileName || !blob) {
        return this.warning(`数据错误，导出${typeName}文件失败！`);
      }
      saveAs(blob, fileName);
      this.success(`导出${typeName}文件成功！`);
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
              this.warning("导入的蓝图数据有误");
              return;
            }
            console.log(blueprintData);
            this.$set(this.formInline, "importData", inputData);
            this.$set(this.formInline, "blueprintData", blueprintData);
            this.success("导入蓝图成功！");
          } else if (this.formInline.dataType == "json") {
            try {
              blueprintData = JSON.parse(inputData);
              PARSER.toStr(blueprintData);
            } catch (e) {
              this.warning("导入的JSON数据有误");
              return;
            }
            console.log(blueprintData);
            this.$set(this.formInline, "importData", inputData);
            this.$set(this.formInline, "blueprintData", blueprintData);
            this.success("导入JSON成功！");
          }
        }
      });
    },
    success(msg){
      this.$message({
        showClose: true,
        message: msg,
        type: "success",
        duration: 1000,
      });
    },
    warning(msg) {
      this.$message({
        showClose: true,
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
        // window.open("https://space.bilibili.com/34117233");
        window.open("https://www.bilibili.com/video/BV1kr4y1V73y");
        return;
      }
      if (index == "-2") {
        window.open("https://pan.baidu.com/s/1kE3t7FUhvCSBbPczvVupvw?pwd=6666");
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
    openUrl(url) {
      window.open(url);
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
          // min-width: 330px;
          .card_header {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            .title{
              flex-shrink: 0;
            }
            .btnWrap{
              margin-left: auto;
              display: flex;
              justify-content: flex-end;
              flex-wrap: wrap;
              align-items: center;
            }
          }
        }
        .el-form {
          // min-width: 330px;
          /deep/.el-form-item__error {
            position: unset;
          }
          /deep/ .el-collapse-item__header {
            font-size: 14px;
            color: #606266;
          }
          /deep/ .el-collapse-item__content {
            font-size: 14px;
            text-indent: 2em;
            color: #606266;
            .line {
              margin-top: 10px;
            }
          }
          .flex {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            .el-input {
              min-width: 60px;
            }
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