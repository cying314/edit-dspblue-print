<template>
  <!-- 滚动卡片外层导航 -->
  <div class="scrollCard">
    <div class="navScrollBar" v-show="!hideBar && (!hideBarWhenOnlyOne || menuNames.length>1)">
      <!--导航选择事件-->
      <el-scrollbar ref="scrollBarRef" :vertical="false">
        <el-menu class="menuBar" :default-active="activeStep" @select="jump" mode="horizontal">
          <el-menu-item v-for="(item, index) in menuNames" :index="''+index" :key="index">
            <span slot="title">{{ item }}</span>
          </el-menu-item>
          <el-menu-item v-for="(item, index) in otherLinks" :index="''+(menuNames.length+index)" :key="menuNames.length+index" @click="openLink(item.url)">
            <span slot="title">{{ item.name }}</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
      <div class="navRight">
        <slot name="navRight"></slot>
      </div>
    </div>
    <div ref="scrollWrap" class="scrollWrap" @scroll="onScroll">
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { elementScrollTo } from "@/utils/index.js";
export default {
  name: "ScrollCard",
  props: {
    // 隐藏导航条
    hideBar: {
      type: Boolean,
      default: false,
    },
    // 只有一个导航时隐藏导航条
    hideBarWhenOnlyOne: {
      type: Boolean,
      default: false,
    },
    otherLinks: {
      type: Array,
    },
  },
  data() {
    return {
      activeStep: "0", //默认选中项
      cardItemRefs: [],
      menuNames: [],
      animation_: false, // 是否滚动中
      animationBind_: null, // 动画帧定时器绑定对象
    };
  },
  methods: {
    openLink(url) {
      window.open(url);
    },
    // 从默认插槽中获取插入的ScrollCardItem组件vue实例
    resetCardItemRef() {
      // 10ms防抖
      clearTimeout(this.resetCardItemTimer_);
      this.resetCardItemTimer_ = setTimeout(() => {
        if (this.$scopedSlots.default) {
          let menuNames = [];
          this.cardItemRefs = this.$scopedSlots
            .default()
            .filter((vnode) => {
              const tag = vnode.componentOptions?.tag;
              const ref = vnode.componentInstance;
              return (tag === "ScrollCardItem" || tag === "scroll-card-item") && ref;
            })
            .map((vnode, index) => {
              const ref = vnode.componentInstance;
              if (ref.hide) return;
              menuNames.push(ref.$options?.propsData?.name || "Item" + (index + 1));
              return ref;
            });
          this.menuNames = menuNames;
        } else {
          this.cardItemRefs = [];
          this.menuNames = [];
        }
        // 导航项变化时，更新导航滚动条
        this.$nextTick(() => {
          this.$refs.scrollBarRef?.update();
        });
      }, 10);
    },
    resetTabName() {
      this.menuNames = this.cardItemRefs.map((ref, index) => {
        return ref.$options?.propsData?.name || "Item" + (index + 1);
      });
    },
    onScroll(e) {
      // 执行动画滚动时不触发滚动事件
      if (!this.animation_) {
        // 100ms防抖
        clearTimeout(this.onScrollTimer_);
        this.onScrollTimer_ = setTimeout(() => {
          const firstEl = this.cardItemRefs[0].$el;
          if (!firstEl) return;
          for (let i = this.cardItemRefs.length - 1; i >= 0; i--) {
            const el = this.cardItemRefs[i]?.$el;
            if (!el) continue;
            // 判断滚动条滚动距离是否大于当前滚动项可滚动距离
            if (e.target.scrollTop >= el.offsetTop - firstEl.offsetTop - 40) {
              this.activeStep = "" + i;
              break;
            }
          }
        }, 100);
      }
    },
    jumpByName(tabName) {
      let idx = this.menuNames.findIndex((name) => name === tabName);
      if (idx != -1) {
        this.jump(idx);
      }
    },
    jump(index) {
      if (index >= this.menuNames.length) return;
      if (this.animationBind_) {
        // 停止正在滚动的动画
        this.animationBind_.stop();
        this.animationBind_ = null;
      }
      this.animation_ = true; // 标记滚动动画开始
      this.activeStep = "" + index;

      const firstEl = this.cardItemRefs[0].$el;
      const targetEl = this.cardItemRefs[index].$el;
      const scrollWrapEl = this.$refs.scrollWrap;
      if (!firstEl || !targetEl || !scrollWrapEl) return;

      let targetScrollTop = targetEl.offsetTop - firstEl.offsetTop; // 滚动目标scrollTop
      this.animationBind_ = elementScrollTo(scrollWrapEl, targetScrollTop, () => {
        this.animation_ = false; // 标记滚动动画结束
        this.animationBind_ = null;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.scrollCard {
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .navScrollBar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .menuBar {
      display: flex;
      user-select: none;
      border-bottom-width: 1.5px;
      .el-menu-item {
        height: 50px;
        line-height: 45px;
      }
      .title {
        user-select: none;
      }
    }
    .navRight {
      flex-shrink: 0;
    }
  }
  .scrollWrap {
    flex: 1;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      background-color: transparent;
    }
    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
      background-color: #f1f1f1;
      -webkit-border-radius: 2px;
      -moz-border-radius: 2px;
      border-radius: 2px;
    }
    &::-webkit-scrollbar-thumb {
      -webkit-border-radius: 2em;
      -moz-border-radius: 2em;
      border-radius: 2em;
      background-color: #c1c1c1;
    }
    &::-webkit-scrollbar-corner {
      background: #eff1f4;
    }
    .content {
      padding-bottom: 20px;
    }
  }
}
</style>