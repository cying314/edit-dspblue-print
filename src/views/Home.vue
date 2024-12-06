<template>
  <div class="main">
    <div class="wrap">
      <ScrollCard
        :otherLinks="[
        {name:'数据字典', url: 'https://gitee.com/cying314/edit-dspblue-print#蓝图数据字典'},
        {name:'查看更新(当前版本：v5.8)', url: 'https://pan.baidu.com/s/1kE3t7FUhvCSBbPczvVupvw?pwd=6666'},
      ]"
      >
        <template #navRight>
          <div class="navRight">
            <a class="item hover" href="https://github.com/cying314/edit-dspblue-print" target="_blank">
              <img :src="require('@/assets/images/github.png')" />
              <span style="width:40px">Github</span>
            </a>
            <a class="item hover" href="https://gitee.com/cying314/edit-dspblue-print" target="_blank">
              <img :src="require('@/assets/images/gitee.png')" />
              <span style="width:31px">Gitee</span>
            </a>
            <a class="item" href="https://space.bilibili.com/34117233" target="_blank" title="跳转作者B站主页">
              <img :src="require('@/assets/images/bilibili.png')" />
              <span>晨隐_</span>
            </a>
          </div>
        </template>
        <ScrollCardItem name="导入蓝图" v-if="formInline.paramType != '无中生有'">
          <template #topRight>
            <el-upload
              style="display:inline-block"
              action
              :auto-upload="false"
              multiple
              :file-list="fileList"
              :accept="formInline.dataType=='blueprint'?'.txt':formInline.dataType=='json'?'.txt,.json':'.txt,.json'"
              :on-change="uploadChange_batchConvert"
            >
              <el-button plain size="small" slot="trigger" icon="el-icon-sort">批量转换{{formInline.dataType=='blueprint'?'蓝图为JSON':formInline.dataType=='json'?'JSON为蓝图':''}}文件</el-button>
            </el-upload>
            <el-upload
              style="display:inline-block"
              action
              :auto-upload="false"
              :file-list="fileList"
              :accept="formInline.dataType=='blueprint'?'.txt':formInline.dataType=='json'?'.txt,.json':'.txt,.json'"
              :on-change="uploadChange_import"
            >
              <el-button style="margin-left: 10px;" plain size="small" slot="trigger" icon="el-icon-folder-opened">导入{{formInline.dataType=='blueprint'?'蓝图':formInline.dataType=='json'?'JSON':''}}文件</el-button>
            </el-upload>
            <el-button style="margin-left: 10px;" type="primary" plain size="small" @click="inputFromClipboard" icon="el-icon-document-copy">粘贴</el-button>
            <template v-if="formInline.inputData.trim() && formInline.inputData.trim()!=formInline.importData">
              <el-divider direction="vertical"></el-divider>
              <el-button size="small" type="primary" @click="render">确定导入</el-button>
            </template>
          </template>
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
                  <img class="icon" :src="getIcon(item)" />
                  <div class="count">{{item.count}}</div>
                </div>
              </el-tooltip>
            </div>
          </template>
        </ScrollCardItem>
        <ScrollCardItem name="生成配置">
          <template #topRight>
            <el-button size="small" type="primary" @click="output" v-if="formInline.blueprintData || formInline.paramType == '无中生有'">输出</el-button>
          </template>
          <el-form label-width="120px" :model="formInline" ref="paramForm" @submit.native.prevent :rules="rules">
            <el-form-item label="转换类型：">
              <el-radio-group v-model="formInline.paramType">
                <el-radio label="默认转换">默认转换</el-radio>
                <el-radio label="垂直叠加">垂直叠加</el-radio>
                <el-radio label="坐标偏移">坐标偏移</el-radio>
                <el-radio label="水平翻转">水平翻转</el-radio>
                <el-radio label="线性变换">线性变换</el-radio>
                <el-radio label="无中生有">无中生有(无需导入)</el-radio>
                <el-radio label="无带流">
                  无带流
                  <el-tooltip class="item" effect="dark" placement="top">
                    <template slot="content">
                      <p>p.s.无带流在2023/01/05的官方更新后，直接粘贴无带蓝图将出现分拣器输入输出端失效</p>
                      <p>解决方法：粘贴蓝图后删除分拣器失效的输入/输出端对应的传送带，同位置再次粘贴蓝图，[Shift+Enter]强制建造，即可连接失效端</p>
                    </template>
                    <span>
                      <i class="el-icon-question"></i>
                    </span>
                  </el-tooltip>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <!-- 默认转换 -->
            <template v-if="formInline.paramType=='默认转换'">
              <div class="flex">
                <el-form-item label="转换选项：">
                  <el-checkbox v-model="formInline.params.addBase">
                    <el-tooltip class="item" effect="dark" placement="top">
                      <template slot="content">
                        <p>悬空建筑重新框选复制后会提示“无地基支撑”，可通过此项修正</p>
                      </template>
                      <span>
                        悬空建筑增加地基
                        <i class="el-icon-question"></i>
                      </span>
                    </el-tooltip>
                  </el-checkbox>
                  <el-checkbox v-model="formInline.params.clearBelt">清空传送带图标</el-checkbox>
                  <el-checkbox v-model="formInline.params.clearInserter">清空分拣器过滤</el-checkbox>
                  <el-checkbox v-model="formInline.params.stationUnlockAmount">关闭沙盒模式物流塔槽位锁</el-checkbox>
                </el-form-item>
              </div>
            </template>
            <!-- 垂直叠加 -->
            <template v-else-if="formInline.paramType=='垂直叠加'">
              <div class="flex">
                <el-form-item label="生成层数：" prop="params.floors">
                  <el-input type="numberx" v-model="formInline.params.floors"></el-input>
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
                      <span>
                        垂直间隔
                        <i class="el-icon-question"></i>：
                      </span>
                    </el-tooltip>
                  </template>
                  <el-input type="number" v-model="formInline.params.spacing"></el-input>
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
                        <span>
                          堆叠
                          <i class="el-icon-question"></i>
                        </span>
                      </el-tooltip>
                    </el-radio>
                    <el-radio :label="false">
                      <el-tooltip class="item" effect="dark" placement="top">
                        <template slot="content">
                          <p>*叠加后每层独立运作</p>
                        </template>
                        <span>
                          独立
                          <i class="el-icon-question"></i>
                        </span>
                      </el-tooltip>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </template>
            <!-- 坐标偏移 -->
            <template v-else-if="formInline.paramType=='坐标偏移'">
              <div class="flex">
                <el-form-item label="偏移方向：" prop="params.offsetType" key="offsetType" :rules="rules.selectNotNull">
                  <el-radio-group v-model="formInline.params.offsetType">
                    <el-radio label="vertical">垂直偏移</el-radio>
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
                        <span>
                          垂直偏移量
                          <i class="el-icon-question"></i>：
                        </span>
                      </el-tooltip>
                    </template>
                    <el-input type="number" v-model="formInline.params.offsetZ"></el-input>
                  </el-form-item>
                </template>
                <template v-if="formInline.params.offsetType=='horizontal'">
                  <el-form-item label="横向偏移量：" prop="params.offsetX" key="offsetX">
                    <template slot="label">
                      <el-tooltip class="item" effect="dark" placement="top">
                        <template slot="content">
                          <p>基于0相对偏移</p>
                        </template>
                        <span>
                          横向偏移量
                          <i class="el-icon-question"></i>：
                        </span>
                      </el-tooltip>
                    </template>
                    <el-input type="number" v-model="formInline.params.offsetX"></el-input>
                  </el-form-item>
                  <el-form-item label="纵向偏移量：" prop="params.offsetY" key="offsetY">
                    <template slot="label">
                      <el-tooltip class="item" effect="dark" placement="top">
                        <template slot="content">
                          <p>基于0相对偏移</p>
                        </template>
                        <span>
                          纵向偏移量
                          <i class="el-icon-question"></i>：
                        </span>
                      </el-tooltip>
                    </template>
                    <el-input type="number" v-model="formInline.params.offsetY"></el-input>
                  </el-form-item>
                </template>
              </div>
            </template>
            <!-- 水平翻转 -->
            <template v-else-if="formInline.paramType=='水平翻转'">
              <div class="flex">
                <el-form-item label="翻转方向：" prop="params.overturnType" key="overturnType" :rules="rules.selectNotNull">
                  <template slot="label">
                    <el-tooltip class="item" effect="dark" placement="top">
                      <template slot="content">
                        <p>火力发电厂、微型聚变发电站的分拣器接口不对称，翻转后不对称的那个接口会无法连接</p>
                      </template>
                      <span>
                        翻转方向
                        <i class="el-icon-question"></i>：
                      </span>
                    </el-tooltip>
                  </template>
                  <el-radio-group v-model="formInline.params.overturnType">
                    <el-radio label="x">横向翻转</el-radio>
                    <el-radio label="y">纵向翻转</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </template>
            <!-- 线性变换 -->
            <template v-else-if="formInline.paramType=='线性变换'">
              <div class="flex">
                <el-form-item label="横向放缩量：" prop="params.zoomX" key="zoomX">
                  <template slot="label">
                    <el-tooltip class="item" effect="dark" placement="top">
                      <template slot="content">
                        <p>基于1缩放</p>
                        <p>输入负数可横向翻转</p>
                        <p>*高纬度过密建筑提示建筑碰撞的蓝图，可用1.1放大蓝图间隙解决</p>
                      </template>
                      <span>
                        横向放缩量
                        <i class="el-icon-question"></i>：
                      </span>
                    </el-tooltip>
                  </template>
                  <el-input type="number" v-model="formInline.params.zoomX"></el-input>
                </el-form-item>
                <el-form-item label="纵向放缩量：" prop="params.zoomY" key="zoomY">
                  <template slot="label">
                    <el-tooltip class="item" effect="dark" placement="top">
                      <template slot="content">
                        <p>基于1缩放</p>
                        <p>输入负数可纵向翻转</p>
                        <p>*高纬度过密建筑提示建筑碰撞的蓝图，可用1.1放大蓝图间隙解决</p>
                      </template>
                      <span>
                        纵向放缩量
                        <i class="el-icon-question"></i>：
                      </span>
                    </el-tooltip>
                  </template>
                  <el-input type="number" v-model="formInline.params.zoomY"></el-input>
                </el-form-item>
                <el-form-item label="旋转角度：" prop="params.rotate" key="rotate">
                  <template slot="label">
                    <el-tooltip class="item" effect="dark" placement="top">
                      <template slot="content">
                        <p>-360至360</p>
                      </template>
                      <span>
                        旋转角度
                        <i class="el-icon-question"></i>：
                      </span>
                    </el-tooltip>
                  </template>
                  <el-input type="number" v-model="formInline.params.rotate"></el-input>
                </el-form-item>
              </div>
            </template>
            <!-- 无中生有 -->
            <template v-else-if="formInline.paramType=='无中生有'">
              <div class="flex">
                <el-form-item label="生成内容：" prop="params.createType" :rules="rules.selectNotNull">
                  <el-radio-group v-model="formInline.params.createType">
                    <el-radio label="0">
                      <el-tooltip class="item" effect="dark" placement="top">
                        <template slot="content">
                          <p>调换起终点高度可更改传送带方向</p>
                        </template>
                        <span>
                          无褶皱垂直传送带
                          <i class="el-icon-question"></i>
                        </span>
                      </el-tooltip>
                    </el-radio>
                    <el-radio label="1">
                      <el-tooltip class="item" effect="dark" placement="top">
                        <template slot="content">
                          <p>可实现超远距离无带传输的分拣器</p>
                          <p>生成的传送带两端将会有随机编码对应，可直接用传送带连接端点使用</p>
                          <br />
                          <p>p.s.无带流在2023/01/05的官方更新后，直接粘贴无带蓝图将出现分拣器输入输出端失效</p>
                          <p>解决方法：粘贴蓝图后删除分拣器失效的输入/输出端对应的传送带，同位置再次粘贴蓝图，[Shift+Enter]强制建造，即可连接失效端</p>
                        </template>
                        <span>
                          虫洞分拣器
                          <i class="el-icon-question"></i>
                        </span>
                      </el-tooltip>
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <template v-if="formInline.params.createType=='0'">
                <div class="flex">
                  <!-- 无褶皱垂直传送带 -->
                  <el-form-item label="起点高度：" prop="params.startZ" key="startZ">
                    <el-input type="number" v-model="formInline.params.startZ"></el-input>
                  </el-form-item>
                  <el-form-item label="终点高度：" prop="params.endZ" key="endZ">
                    <el-input type="number" v-model="formInline.params.endZ"></el-input>
                  </el-form-item>
                </div>
              </template>
              <template v-if="formInline.params.createType=='1'">
                <!-- 虫洞分拣器 -->
                <div class="flex">
                  <el-form-item label="起点相对坐标X：" prop="params.startPoint.X" key="startPoint.X">
                    <el-input type="number" v-model="formInline.params.startPoint.X"></el-input>
                  </el-form-item>
                  <el-form-item label="起点相对坐标Y：" prop="params.startPoint.Y" key="startPoint.Y">
                    <el-input type="number" v-model="formInline.params.startPoint.Y"></el-input>
                  </el-form-item>
                  <el-form-item label="起点相对坐标Z：" prop="params.startPoint.Z" key="startPoint.Z">
                    <el-input type="number" v-model="formInline.params.startPoint.Z"></el-input>
                  </el-form-item>
                </div>
                <div class="flex">
                  <el-form-item label="终点相对坐标X：" prop="params.endPoint.X" key="endPoint.X">
                    <el-input type="number" v-model="formInline.params.endPoint.X"></el-input>
                  </el-form-item>
                  <el-form-item label="终点相对坐标Y：" prop="params.endPoint.Y" key="endPoint.Y">
                    <el-input type="number" v-model="formInline.params.endPoint.Y"></el-input>
                  </el-form-item>
                  <el-form-item label="终点相对坐标Z：" prop="params.endPoint.Z" key="endPoint.Z">
                    <el-input type="number" v-model="formInline.params.endPoint.Z"></el-input>
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
            <!-- 无带流 -->
            <template v-else-if="formInline.paramType=='无带流'">
              <el-form-item label="替代负数：" prop="params.negativeMode" key="negativeMode">
                <el-radio-group v-model="formInline.params.negativeMode">
                  <el-radio label="-1">仍输入负数</el-radio>
                  <el-radio label="7">
                    <el-tooltip class="item" effect="dark" placement="top">
                      <template slot="content">
                        <p>2023/12/21更新后游戏内输入负数显示为0，实际仍可输入负数但可读性不佳，使用7代替符号，如:7999=-999</p>
                      </template>
                      <span>
                        使用7代替负号
                        <i class="el-icon-question"></i>
                      </span>
                    </el-tooltip>
                  </el-radio>
                </el-radio-group>
                <div class="testNumWrap" v-if="formInline.params.negativeMode=='7'">
                  测试数字：
                  <el-input-number class="ipt" :controls="false" size="small" v-model="formInline.params.testNum" :max="999999" :min="0" :precision="0"></el-input-number>
                  = {{formatNum_sevenToNegative(formInline.params.testNum)}}
                </div>
              </el-form-item>
              <el-form-item label="输出标记数：" prop="params.outputCountMode" key="outputCountMode" :rules="rules.selectNotNull">
                <template slot="label">
                  <el-tooltip class="item" effect="dark" placement="top">
                    <template slot="content">
                      <p>输出后更改传送带图标下的标记数</p>
                      <p>*只会影响到带图标且标记数不为0的传送带节点</p>
                    </template>
                    <span>
                      输出标记数
                      <i class="el-icon-question"></i>：
                    </span>
                  </el-tooltip>
                </template>
                <el-radio-group v-model="formInline.params.outputCountMode">
                  <el-radio label="none">原标记数</el-radio>
                  <el-radio label="speed">匹配分拣器速度</el-radio>
                  <el-radio label="num">匹配分拣器数量</el-radio>
                  <el-radio label="clear">
                    <el-tooltip class="item" effect="dark" placement="top">
                      <template slot="content">
                        <p>*只清除匹配上的传送带图标及标记数</p>
                        <p>清除所有请到“默认转换”功能输出</p>
                      </template>
                      <span>
                        清除标记
                        <i class="el-icon-question"></i>
                      </span>
                    </el-tooltip>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-collapse>
                  <el-collapse-item>
                    <template slot="title">
                      操作步骤
                      <i class="header-icon el-icon-info"></i>
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
                      <b>步骤④、</b>将传送带节点和分拣器（连带着建筑）复制进蓝图工具，使用“无带流”一键输出；
                    </div>
                    <div class="line">
                      <b>步骤⑤、</b>粘贴蓝图后删除分拣器失效的输入/输出端对应的传送带，同位置再次粘贴蓝图，[Shift+Enter]强制建造，即可连接失效端。
                    </div>
                  </el-collapse-item>
                  <el-collapse-item>
                    <template slot="title">
                      注意要点
                      <i class="header-icon el-icon-info"></i>
                    </template>
                    <div class="line">
                      <b>要点①、</b>传送带图标下的
                      <b>标记数必须为正数或负数</b>，不匹配0。
                    </div>
                    <div class="line">
                      <div>
                        <b>要点②、</b>标记数的
                        <b>正负</b>用于控制分拣器是从传送带上
                        <b>放入还是取出</b>。
                      </div>
                      <div>（正数匹配分拣器失效的输出端；负数匹配分拣器失效的输入端）</div>
                    </div>
                    <div class="line">
                      <div>
                        <b>要点③、</b>标记数的
                        <b>数值</b>用于控制可接入的
                        <b>分拣器总速度上限</b>。
                      </div>
                      <div>
                        <span>（除白爪外的分拣器速度计算长度影响，</span>
                        <span style="color:#E6A23C">长度1格时速度为：白30/蓝6/绿3/黄1.5</span>
                        <span>，具体见游戏内分拣器属性）</span>
                      </div>
                      <div>【如：“-30”可匹配5个蓝爪的输入端——从带上取走，“9”可匹配1个蓝爪+1个绿爪的输出端——往带上放置】</div>
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
                    <div class="line" style="color: red">
                      <b>要点⑧、</b>*无带流在2023/01/05的官方更新后，直接粘贴无带蓝图将出现分拣器输入输出端失效
                      <div>解决方法：粘贴蓝图后删除分拣器失效的输入/输出端对应的传送带，同位置再次粘贴蓝图，[Shift+Enter]强制建造，即可连接失效端</div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-form-item>
              <div style="text-align: center;line-height:50px">
                <el-button type="warning" round @click="openUrl('https://www.bilibili.com/video/BV138411x7Sn')">操作视频教程</el-button>
              </div>
            </template>
          </el-form>
        </ScrollCardItem>
        <ScrollCardItem name="输出结果">
          <template #topRight v-if="formInline.resData.trim() || formInline.resJSON.trim()">
            <el-button plain size="small" @click="saveFile" icon="el-icon-folder-opened">导出{{formInline.resType=='blueprint'?'蓝图':formInline.resType=='json'?'JSON':''}}文件</el-button>
            <el-button type="primary" plain size="small" @click="outToClipboard" icon="el-icon-document-copy">复制</el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button type="primary" size="small" @click="outToInput">将结果重新导入</el-button>
          </template>
          <div class="resConfigMsg" v-if="formInline.resConfigMsg">当前输出配置：{{formInline.resConfigMsg}}</div>
          <el-form :model="formInline" @submit.native.prevent>
            <el-form-item>
              <el-radio-group v-model="formInline.resType">
                <el-radio label="blueprint">输出蓝图</el-radio>
                <el-radio label="json">输出JSON</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="formInline.resType=='blueprint'">
              <el-input type="textarea" v-model="formInline.resData" :rows="5" readonly ref="resDataRef"></el-input>
            </el-form-item>
            <el-form-item v-if="formInline.resType=='json'">
              <el-input type="textarea" v-model="formInline.resJSON" :rows="5" readonly ref="resJSONRef"></el-input>
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
                  <img class="icon" :src="getIcon(item)" />
                  <div class="count">{{item.count}}</div>
                </div>
              </el-tooltip>
            </div>
          </template>
        </ScrollCardItem>
      </ScrollCard>
    </div>
    <el-dialog title="匹配结果" :visible.sync="NBM_dia">
      <template v-if="NBM_failMap.length==0">
        <div>成功新增匹配分拣器端口数：{{NBM_successNum}}</div>
        <br />
        <div style="color: green">带过滤器的分拣器端口已全部匹配成功！</div>
      </template>
      <template v-else>
        <div>成功新增匹配分拣器端口数：{{NBM_successNum}}</div>
        <br />
        <div style="color: red">存在未匹配上的分拣器端口，如下：</div>
        <el-tree :data="NBM_failMap" :props="NBM_props" default-expand-all></el-tree>
      </template>
    </el-dialog>
    <div class="loading-mask" v-if="fullscreenLoading">
      <div class="loading-spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path" />
        </svg>
        <el-progress v-if="showLoadingBar" :text-inside="true" :stroke-width="22" :percentage="loadingNow" class="progress"></el-progress>
      </div>
    </div>
  </div>
</template>

<script>
import ScrollCard from "@/components/ScrollCard.vue";
import ScrollCardItem from "@/components/ScrollCardItem.vue";
import * as PARSER from "@/utils/parser";
import * as itemsUtil from "@/utils/itemsUtil";
import { saveAs } from "file-saver";
export default {
  name: "Home",
  components: {
    ScrollCard,
    ScrollCardItem,
  },
  data() {
    return {
      formInline: {
        dataType: "blueprint",
        importData: "",
        inputData: "",
        blueprintData: null,
        paramType: "默认转换",
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
          negativeMode: "-1",
          testNum: "7999",
          clearBelt: false,
          clearInserter: false,
          stationUnlockAmount: false,
          addBase: false,
        },
        resBlueprintData: null,
        resConfigMsg: null,
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
  methods: {
    formatNum_sevenToNegative(num) {
      // 前缀7的数字，7转为负号
      if (isNaN(num)) return 0;
      num = String(num);
      if (num.length <= 1 || num.charAt(0) != "7") return +num;
      return +("-" + num.slice(1));
    },
    formatNum_negativeToSeven(num) {
      // 负数，负号转为7
      if (isNaN(num)) return 0;
      if (num < 0) {
        return "7" + -num;
      }
      return num;
    },
    outToInput() {
      if (this.formInline.resType == "blueprint") {
        if (!this.formInline.resData) {
          this.warning("请先生成数据");
          return;
        }
        this.$set(this.formInline, "dataType", "blueprint");
        this.$set(this.formInline, "inputData", this.formInline.resData);
      } else if (this.formInline.resType == "json") {
        if (!this.formInline.resJSON) {
          this.warning("请先生成数据");
          return;
        }
        this.$set(this.formInline, "dataType", "json");
        this.$set(this.formInline, "inputData", this.formInline.resJSON);
        this.formInline.dataType = "json";
      } else {
        return;
      }
      if (this.formInline.paramType == "无中生有") {
        this.$set(this.formInline, "paramType", "默认转换");
        this.$nextTick(() => {
          this.render();
        });
      } else {
        this.render();
      }
    },
    async outToClipboard() {
      const Clipboard = navigator?.clipboard;
      let typeName;
      let text;
      let textRef;
      if (this.formInline.resType == "blueprint") {
        if (!this.formInline.resData) {
          return this.warning("请先生成数据");
        }
        typeName = "蓝图";
        text = this.formInline.resData;
        textRef = this.$refs?.resDataRef;
      } else if (this.formInline.resType == "json") {
        if (!this.formInline.resJSON) {
          return this.warning("请先生成数据");
        }
        typeName = "JSON";
        text = this.formInline.resJSON;
        textRef = this.$refs?.resJSONRef;
      }
      if (!text || !textRef) {
        return this.warning("数据错误，复制失败！");
      }
      textRef.select();

      if (Clipboard) {
        try {
          await navigator.clipboard.writeText(text);
          this.success(`已将${typeName}复制到剪贴板！`);
        } catch (e) {
          console.log("未授权复制权限");
          // 降级尝试使用execCommand复制
          document.execCommand("copy");
          this.success(`已将${typeName}复制到剪贴板！`);
        }
      } else {
        console.log("浏览器不支持navigator.clipboard");
        // 降级尝试使用execCommand复制
        document.execCommand("copy");
        this.success(`已将${typeName}复制到剪贴板！`);
      }
    },
    async inputFromClipboard() {
      const Clipboard = navigator?.clipboard;
      if (Clipboard) {
        try {
          const text = await navigator.clipboard.readText();
          this.$set(this.formInline, "inputData", text);
          this.success(`已将剪贴板内容粘贴到输入框！`);
          setTimeout(() => {
            this.render();
          }, 0);
        } catch (e) {
          this.warning(`浏览器未授权读取剪贴板，粘贴失败！`);
        }
      } else {
        this.warning(`浏览器不支持剪贴板，粘贴失败！`);
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
      let itemsCount = {};
      blueprintData.buildings.forEach((v) => {
        itemsCount[v.itemId] = (itemsCount[v.itemId] || 0) + 1;
      });
      let itemList = Object.keys(itemsCount).map((itemId) => {
        const itemInfo = itemsUtil.itemsMap.get(+itemId);
        return {
          itemId: itemId,
          count: itemsCount[itemId],
          icon: itemInfo?.icon,
          name: itemInfo?.name || `未知物品_${itemId}`,
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
    // deepCopy(obj) {
    //   return JSON.parse(JSON.stringify(obj));
    // },
    deepCopy(obj) {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (obj instanceof Date) {
        return new Date(obj);
      }
      var clone;
      if (obj instanceof Int32Array) {
        clone = new Int32Array(obj.length);
      } else if (Array.isArray(obj)) {
        clone = [];
      } else {
        clone = {};
      }
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clone[key] = this.deepCopy(obj[key]);
        }
      }
      return clone;
    },
    handleStationUnlockAmount(blueprintData) {
      blueprintData.buildings.forEach((v) => {
        if (itemsUtil.isStation(v.itemId)) {
          // 运输站类建筑
          v.parameters.storage?.forEach((s) => {
            s.lockAmount = 0;
          });
        }
      });
      return blueprintData;
    },
    clearIcon(blueprintData, clearBelt, clearInserter) {
      // 清空标记
      if (clearBelt || clearInserter) {
        blueprintData.buildings.forEach((v) => {
          if (itemsUtil.isBelt(v.itemId)) {
            // 传送带
            if (clearBelt && v.parameters?.iconId) {
              v.parameters.iconId = 0;
              v.parameters.count = 0;
            }
          } else if (itemsUtil.isInserter(v.itemId)) {
            // 分拣器
            if (clearInserter && v.filterId) {
              v.filterId = 0;
            }
          }
        });
      }
      return blueprintData;
    },
    noBeltMethod(blueprintData, outputCountMode, negativeMode = "-1") {
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
        let filterName = itemsUtil.itemsMap.get(filterId)?.name || `未知物品_${filterId}`;
        const inserterItem = itemsUtil.itemsMap.get(itemId);
        let itemName = `${inserterItem.name}(${inserterItem.alias})`;
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
        if (itemsUtil.isBelt(v.itemId)) {
          // 传送带
          var count = v.parameters?.count;
          var iconId = v.parameters?.iconId;
          // 保存带标记且conut不为0的传送带
          if (count && iconId) {
            if (negativeMode == "7") {
              // 使用7代替负号
              count = this.formatNum_sevenToNegative(count);
            } else {
              // 仍输入负数
              if (count < 0) {
                // 解决官方负数标记数复制后会+1的bug
                count -= 1;
                v.parameters.count = count;
              }
            }
            beltMap[v.index] = {
              count: +count,
              iconId: iconId,
              linkSpeed: 0,
              linkNum: 0,
              beltItem: v,
            };
          }
        } else if (itemsUtil.isInserter(v.itemId)) {
          // 分拣器
          // 保存所有分拣器对象
          inserterList.push(v);
        }
      });

      // 计算已链接在传送带上的分拣器数量和速度
      inserterList.forEach((v) => {
        var Speed = itemsUtil.getInserterSpeed(v.itemId, v.parameters.length);

        // 输出端不为空 且为 Map中的传送带
        if (v.outputObjIdx != -1 && beltMap[v.outputObjIdx]) {
          let beltObj = beltMap[v.outputObjIdx];
          beltObj.linkSpeed += Speed;
          beltObj.linkNum++;
        }

        // 输入端不为空 且为 Map中的传送带
        if (v.inputObjIdx != -1 && beltMap[v.inputObjIdx]) {
          let beltObj = beltMap[v.inputObjIdx];
          beltObj.linkSpeed -= Speed;
          beltObj.linkNum++;
        }
      });

      inserterList.forEach((v) => {
        var Speed = itemsUtil.getInserterSpeed(v.itemId, v.parameters.length);

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
            this.NBM_successNum += 1;
          } else {
            addFail(v.filterId, v.itemId, "输入端");
          }
        }
      });

      // 处理输出标记数
      Object.keys(beltMap).forEach((index) => {
        const beltObj = beltMap[index];
        const v = beltObj.beltItem;
        if (outputCountMode == "speed") {
          // 输出已匹配速度
          let linkSpeed = beltObj.linkSpeed;
          if (negativeMode == "7") {
            // 负数转7前缀
            linkSpeed = this.formatNum_negativeToSeven(linkSpeed);
          }
          v.parameters.count = linkSpeed;
        } else if (outputCountMode == "num") {
          // 输出已匹配数量
          v.parameters.count = beltObj.linkNum;
        } else if (outputCountMode == "clear") {
          // 清除标记
          v.parameters.count = 0;
          v.parameters.iconId = 0;
        }
      });

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
        tilt: 0,
        tilt2: 0,
        pitch: 0,
        pitch2: 0,
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
        tilt: 0,
        tilt2: 0,
        pitch: 0,
        pitch2: 0,
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

      let overturnX = zoomX < 0; // x是否翻转
      let overturnY = zoomY < 0; // y是否翻转
      let isOverturn = overturnX ^ overturnY; // 是否存在翻转
      // 带分拣器插槽的建筑索引
      const beltSlotBuildIndexs = new Set();
      // 带分拣器插槽的建筑索引
      const inserterSlotBuildIndexs = new Set();
      // 存在翻转时
      if (isOverturn) {
        res.buildings.forEach((v) => {
          // 带传送带插槽的建筑
          if (itemsUtil.isBeltSlotBuild(v.itemId)) {
            // x轴对称模型旋转180度
            if (itemsUtil.getBeltSlotBuildAxis(v.itemId, v.modelIndex) == "x") {
              v.yaw[0] -= 180;
              v.yaw[1] -= 180;
            }

            // 翻转时调换传送带插槽相关参数
            let _slots;
            if (v.itemId == 2020 && v.parameters.priority) {
              // 四向优先输入输出参数
              _slots = v.parameters.priority;
            }
            if (itemsUtil.isStation(v.itemId) && v.parameters.slots) {
              // 运输站类建筑传送带插槽参数
              _slots = v.parameters.slots;
            }

            if (_slots) {
              const alterSlot = itemsUtil.getBeltSlotBuildInfo(v.itemId, v.modelIndex)?.alterSlot;
              if (alterSlot) {
                for (let [idx1, idx2] of alterSlot) {
                  [_slots[idx1], _slots[idx2]] = [_slots[idx2], _slots[idx1]];
                }
              }
            }
            beltSlotBuildIndexs.add(v.index);
          }

          // 带分拣器插槽的建筑
          if (itemsUtil.isInserterSlotBuild(v.itemId)) {
            // 存在翻转时，x轴对称模型旋转180度
            if (isOverturn && itemsUtil.getInserterSlotBuildAxis(v.itemId) == "x") {
              v.yaw[0] -= 180;
              v.yaw[1] -= 180;
            }
            inserterSlotBuildIndexs.add(v.index);
          }
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

        // 存在翻转时
        if (isOverturn) {
          if (v.itemId == 2204 || v.itemId == 2211) {
            // 火力发电厂、微型聚变发电站翻转偏移
            const offsetX = 1; // 偏移量x
            const offsetY = -1; // 偏移量y
            v.localOffset[0].x += offsetX * Math.cos((v.yaw[0] * Math.PI) / 180);
            v.localOffset[1].x += offsetX * Math.cos((v.yaw[1] * Math.PI) / 180);
            v.localOffset[0].y += offsetY * Math.sin((v.yaw[0] * Math.PI) / 180);
            v.localOffset[1].y += offsetY * Math.sin((v.yaw[1] * Math.PI) / 180);
          } else if (v.itemId == 2309 || v.itemId == 2317) {
            // 化工厂、量子化工厂翻转偏移
            const offsetX = -1; // 偏移量x
            const offsetY = -1; // 偏移量y
            v.localOffset[0].x += offsetX * Math.sin((v.yaw[0] * Math.PI) / 180);
            v.localOffset[1].x += offsetX * Math.sin((v.yaw[1] * Math.PI) / 180);
            v.localOffset[0].y += offsetY * Math.cos((v.yaw[0] * Math.PI) / 180);
            v.localOffset[1].y += offsetY * Math.cos((v.yaw[1] * Math.PI) / 180);
          } else if (itemsUtil.isBelt(v.itemId)) {
            // 翻转传送带倾斜角度
            v.tilt = -v.tilt;
            v.tilt2 = -v.tilt2;
            // 传送带 调换接到建筑上的插槽索引
            if (beltSlotBuildIndexs.has(v.inputObjIdx)) {
              // 输入端
              const inputBuild = res.buildings[v.inputObjIdx];
              const newInputSlot = itemsUtil.alterBeltSlot(
                inputBuild.itemId,
                inputBuild.modelIndex,
                v.inputFromSlot
              );
              if (newInputSlot != null) v.inputFromSlot = newInputSlot;
            }
            if (beltSlotBuildIndexs.has(v.outputObjIdx)) {
              // 输出端
              const outputBuild = res.buildings[v.outputObjIdx];
              const newOutputSlot = itemsUtil.alterBeltSlot(
                outputBuild.itemId,
                outputBuild.modelIndex,
                v.outputToSlot
              );
              if (newOutputSlot != null) v.outputToSlot = newOutputSlot;
            }
          } else if (itemsUtil.isInserter(v.itemId)) {
            // 分拣器 调换接到建筑上的插槽索引
            if (inserterSlotBuildIndexs.has(v.inputObjIdx)) {
              // 输入端
              const inputBuildItemId = res.buildings[v.inputObjIdx]?.itemId;
              const newInputSlot = itemsUtil.alterInserterSlot(inputBuildItemId, v.inputFromSlot);
              if (newInputSlot != null) v.inputFromSlot = newInputSlot;
            }
            if (inserterSlotBuildIndexs.has(v.outputObjIdx)) {
              // 输出端
              const outputBuildItemId = res.buildings[v.outputObjIdx]?.itemId;
              const newOutputSlot = itemsUtil.alterInserterSlot(outputBuildItemId, v.outputToSlot);
              if (newOutputSlot != null) v.outputToSlot = newOutputSlot;
            }
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
      let newBuildings = [];
      res.buildings.forEach((v) => {
        v.localOffset[0].z += +offsetZ;
        v.localOffset[1].z += +offsetZ;
        if (v.itemId == 1131) {
          // 地基
          v.localOffset[0].z = -10;
          v.localOffset[1].z = -10;
        } else if (
          (v.localOffset[0].z > 0.22 || v.localOffset[1].z > 0.22) &&
          v.inputObjIdx == -1 &&
          !itemsUtil.isHanging(v.itemId)
        ) {
          // 浮空且没底的不可悬空建筑（悬空阈值0.22）
          v.inputObjIdx = res.buildings.length; // 卡浮空，底指向地基
          needBase = true;
          // 带分拣器插槽的建筑
          if (itemsUtil.isInserterSlotBuild(v.itemId)) {
            // 卡浮空的建筑 如果先建分拣器 会导致输出端链接失效，挪到最前面确保比分拣器先创建
            newBuildings.unshift(v);
            changIndex = true;
            return;
          }
        }
        newBuildings.push(v);
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
          tilt: 0,
          tilt2: 0,
          pitch: 0,
          pitch2: 0,
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
          if (v.itemId === 1131) {
            // 地基
            newItem.localOffset[0].z = -10;
            newItem.localOffset[1].z = -10;
          } else {
            if (v.outputObjIdx != -1) {
              newItem.outputObjIdx = v.outputObjIdx + prevFloor.length;
            }
            if (v.inputObjIdx != -1) {
              newItem.inputObjIdx = v.inputObjIdx + prevFloor.length;
            } else {
              // 没有底 且为 可堆叠建造建筑
              if (isPile && itemsUtil.isStackable(v.itemId)) {
                // 堆叠,递归找到可叠加节点的最高层
                newItem.inputObjIdx = this.findUppermost(prevFloor, v.itemId, v.index);
              }
            }
          }
          nextFloor.push(newItem);
        });
        prevFloor = nextFloor;
        res.buildings.push(...nextFloor);
      }
      res = this.verticalOffset(res, 0); // 给悬空建筑建地基底
      return res;
    },
    output() {
      if (!this.formInline.blueprintData && this.formInline.paramType != "无中生有") {
        this.warning("请先导入数据");
        return;
      }
      this.$refs.paramForm.validate((valid) => {
        if (valid) {
          if (!this.formInline.paramType) {
            this.warning("请选择转换类型");
            return;
          }
          let res;
          let msg = "";
          const params = this.formInline.params;
          switch (this.formInline.paramType) {
            case "默认转换":
              msg += "[默认转换]";
              if (params.addBase) {
                // 悬空建筑增加地基
                msg += " | 悬空建筑增加地基";
                res = this.verticalOffset(this.formInline.blueprintData, 0); // 深拷贝，并处理悬空建筑
              } else {
                res = this.deepCopy(this.formInline.blueprintData); // 深拷贝
              }
              if (params.clearBelt || params.clearInserter) {
                // 清空标记
                if (params.clearBelt) {
                  msg += " | 清空传送带图标";
                }
                if (params.clearInserter) {
                  msg += " | 清空分拣器过滤";
                }
                res = this.clearIcon(res, params.clearBelt, params.clearInserter);
              }
              if (params.stationUnlockAmount) {
                msg += " | 关闭沙盒模式物流塔槽位锁";
                res = this.handleStationUnlockAmount(res);
              }
              break;
            case "垂直叠加":
              msg = `[垂直叠加] | 层数:${+params.floors} | 间隔:${+params.spacing} | 各层关系:${
                params.isPile ? "堆叠" : "独立"
              }`;
              res = this.verticalCopy(
                this.formInline.blueprintData,
                +params.floors,
                +params.spacing,
                params.isPile
              );
              break;
            case "坐标偏移":
              msg += "[坐标偏移]";
              if (params.offsetType == "vertical") {
                // 垂直偏移
                msg += ` | 垂直偏移:${+params.offsetZ}`;
                res = this.verticalOffset(this.formInline.blueprintData, +params.offsetZ);
              } else if (params.offsetType == "horizontal") {
                // 水平偏移
                msg += ` | 水平偏移:${+params.offsetX}, ${+params.offsetY}`;
                res = this.horizontalOffset(
                  this.formInline.blueprintData,
                  +params.offsetX,
                  +params.offsetY
                );
              }
              break;
            case "水平翻转":
              msg += "[水平翻转]";
              if (params.overturnType == "x") {
                // 横向翻转
                msg += " | 横向翻转";
                res = this.linearTransformation(this.formInline.blueprintData, -1, 1, 0);
              } else if (params.overturnType == "y") {
                // 纵向翻转
                msg += " | 纵向翻转";
                res = this.linearTransformation(this.formInline.blueprintData, 1, -1, 0);
              }
              break;
            case "线性变换":
              msg = `[线性变换] | 横向放缩:${+params.zoomX} | 纵向放缩:${+params.zoomY} | 旋转:${+params.rotate}°`;
              res = this.linearTransformation(
                this.formInline.blueprintData,
                +params.zoomX,
                +params.zoomY,
                +params.rotate
              );
              break;
            case "无中生有":
              msg += "[无中生有]";
              switch (params.createType) {
                case "0":
                  // 无褶皱垂直传送带
                  msg += ` | 无褶皱垂直传送带 | 起点:${params.startZ} | 终点:${params.endZ}`;
                  res = this.createVbelt(params.startZ, params.endZ);
                  break;
                case "1":
                  // 虫洞分拣器
                  msg += ` | 虫洞分拣器 | 起点X:${+params.startPoint.X}, Y:${+params.startPoint
                    .Y}, Z:${+params.startPoint.Z} | 终点X:${+params.endPoint.X}, Y:${+params
                    .endPoint.Y}, Z:${+params.endPoint.Z} | 分拣器方向:${new Map([
                    ["left", "向左"],
                    ["right", "向右"],
                    ["top", "向上"],
                    ["bottom", "向下"],
                  ]).get(params.WinserterDir)}`;
                  res = this.createWinserter(
                    params.startPoint,
                    params.endPoint,
                    params.WinserterDir
                  );
                  break;
              }
              break;
            case "无带流":
              msg = `[无带流] | ${
                params.negativeMode == "7" ? "7代替负号" : "仍输入负数"
              } | ${new Map([
                ["none", "输出原标记数"],
                ["speed", "输出匹配分拣器速度"],
                ["num", "输出匹配分拣器数量"],
                ["clear", "清除标记"],
              ]).get(params.outputCountMode)}`;
              res = this.noBeltMethod(
                this.formInline.blueprintData,
                params.outputCountMode,
                params.negativeMode
              );
              break;
            default:
              this.warning("错误的转换类型！");
              return;
          }
          this.formInline.resBlueprintData = res;
          this.formInline.resConfigMsg = msg;
          console.log(this.formInline.resBlueprintData);
          try {
            this.$set(this.formInline, "resData", PARSER.toStr(this.formInline.resBlueprintData));
            this.$set(this.formInline, "resJSON", JSON.stringify(this.formInline.resBlueprintData));
            this.success("输出成功！");
          } catch (e) {
            this.error("输出失败：" + e);
          }
        }
      });
    },
    saveFile() {
      if (!this.formInline.resType) {
        this.warning("请选择导出类型");
        return;
      }
      if (this.formInline.resType == "blueprint") {
        if (!this.formInline.resData) {
          return this.warning("请先生成数据");
        }
        this.toTxt(this.formInline.resData, this.formInline.resType + Date.now() + ".txt");
        this.success("导出蓝图文件成功！");
      } else if (this.formInline.resType == "json") {
        if (!this.formInline.resJSON) {
          return this.warning("请先生成数据");
        }
        this.toTxt(this.formInline.resJSON, this.formInline.resType + Date.now() + ".json");
        this.success("导出JSON文件成功！");
      } else {
        return this.warning(`数据错误，导出文件失败！`);
      }
    },
    toTxt(str, fileName) {
      try {
        saveAs(new Blob([str], { type: "text/plain;charset=utf-8" }), fileName);
      } catch {
        this.error("导出文件失败！");
        throw "导出文件失败！";
      }
    },
    render() {
      this.$refs.importForm.validate((valid) => {
        if (valid) {
          let inputData = this.formInline.inputData.trim();
          // 自动判断文本是蓝图还是json
          if (inputData.startsWith("BLUEPRINT:")) {
            this.$set(this.formInline, "dataType", "blueprint");
          } else if (inputData.startsWith("{")) {
            this.$set(this.formInline, "dataType", "json");
          }
          if (!this.formInline.dataType) {
            this.warning("请选择导入类型");
            return;
          }
          let blueprintData;
          if (this.formInline.dataType == "blueprint") {
            try {
              blueprintData = PARSER.fromStr(inputData);
            } catch (e) {
              let msg = "导入的蓝图数据有误";
              console.error(msg, e);
              this.warning(msg);
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
    success(msg) {
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
    error(msg) {
      this.$message({
        showClose: true,
        message: msg,
        type: "error",
      });
    },
    uploadChange_batchConvert(file, fileList) {
      let len = fileList.length;
      let fullFileName = file.name;
      let dotIdx = fullFileName.lastIndexOf(".");
      let fileName = fullFileName;
      if (dotIdx != -1) {
        fileName = fullFileName.slice(0, dotIdx);
      }
      this.uploadChange(file, (e) => {
        let inputData = e.target.result.trim();
        let blueprintData;
        if (this.formInline.dataType == "blueprint") {
          let resJSON;
          try {
            blueprintData = PARSER.fromStr(inputData);
            resJSON = JSON.stringify(blueprintData);
          } catch (e) {
            let msg = `导入的蓝图数据有误[${fullFileName}](${len})...`;
            console.error(msg, e);
            this.warning(msg);
            return;
          }
          this.toTxt(resJSON, `${fileName}_to_json.json`);
          this.success(`转换JSON成功[${fullFileName}](${len})...`);
        } else if (this.formInline.dataType == "json") {
          let resData;
          try {
            blueprintData = JSON.parse(inputData);
            resData = PARSER.toStr(blueprintData);
          } catch (e) {
            this.warning(`导入的JSON数据有误[${fullFileName}](${len})...`);
            return;
          }
          this.toTxt(resData, `${fileName}_to_blueprint.txt`);
          this.success(`转换蓝图成功[${fullFileName}](${len})...`);
        }
      });
    },
    uploadChange_import(file) {
      this.uploadChange(file, (e) => {
        this.$set(this.formInline, "inputData", e.target.result);
        this.render();
      });
    },
    uploadChange(file, onLoadCallback) {
      this.fileList = [];
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
      reader.onload = onLoadCallback;
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
  .navRight {
    display: flex;
    align-items: center;
    margin-right: 5px;
    .item {
      font-size: 12px;
      color: #999;
      text-decoration: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 5px;
      img {
        width: 16px;
        height: 16px;
      }
      span {
        margin-left: 5px;
      }
      &.hover span {
        display: inline-block;
        overflow: hidden;
        transition: width 0.2s ease-in-out;
      }
      &.hover:not(:hover) span {
        width: 0 !important;
      }
    }
    .item:hover {
      color: #3a8ee6;
      text-decoration: underline;
    }
  }
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
        ::v-deep .el-progress-bar__outer {
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
    .el-form {
      // min-width: 330px;
      ::v-deep .el-form-item__error {
        position: unset;
      }
      ::v-deep .el-collapse-item__header {
        font-size: 14px;
        color: #606266;
      }
      ::v-deep .el-collapse-item__content {
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
      ::v-deep .el-tree-node {
        white-space: pre-wrap;
        word-break: break-all;
      }
      ::v-deep .el-tree-node__content {
        height: auto;
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
  .resConfigMsg {
    margin-bottom: 10px;
    font-size: 12px;
    color: #636363;
  }
  .testNumWrap {
    display: inline-block;
    margin-left: 20px;
    font-size: 13px;
    .ipt {
      width: 60px;
      ::v-deep .el-input__inner {
        padding: 0;
        border-width: 0 0 1px 0;
        border-radius: 0;
      }
    }
  }
}
</style>