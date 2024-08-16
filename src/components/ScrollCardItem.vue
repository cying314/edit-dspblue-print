<template>
  <!-- 滚动卡片 -->
  <div class="scrollCardItem" v-show="!hide">
    <el-card class="cardItem" :class="{'fold':isFold_}">
      <div slot="header" class="cardHeader">
        <div class="title" :class="{'canFold':canFold}" @click="clickTitle">
          <span class="foldIcon" v-if="canFold">
            <i :class="isFold_?'el-icon-arrow-right':'el-icon-arrow-down'"></i>
          </span>
          <slot name="title">{{name}}</slot>
        </div>
        <div class="topRight">
          <slot name="topRight"></slot>
        </div>
      </div>
      <slot></slot>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "ScrollCardItem",
  props: {
    name: {
      type: String,
    },
    canFold: {
      // 是否可折叠
      type: Boolean,
      default: true,
    },
    hide: {
      type: Boolean,
      default: false,
    },
    isFold: {
      // 默认是否折叠，仅canFold为true时使用
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isFold_: false,
    };
  },
  watch: {
    isFold: {
      handler(val) {
        if (!!val !== this.isFold_) {
          this.isFold_ = !!val;
        }
      },
      immediate: true,
    },
    name(val, oldVal) {
      if (val != oldVal) {
        // 更新tab标签名
        if (!this.checkParent()) return;
        if (this.$parent.resetTabName?.constructor === Function) {
          this.$parent.resetTabName();
        }
      }
    },
    hide(val, oldVal) {
      if (val != oldVal) {
        this.resetParentCache();
      }
    },
  },
  mounted() {
    this.resetParentCache();
  },
  destroyed() {
    this.resetParentCache();
  },
  methods: {
    clickTitle() {
      if (!this.canFold) return;
      this.isFold_ = !this.isFold_;
    },
    show() {
      this.isFold_ = false;
    },
    fold() {
      this.isFold_ = true;
    },
    resetParentCache() {
      // 更新父级的子级缓存
      if (!this.checkParent()) return;
      if (this.$parent.resetCardItemRef?.constructor === Function) {
        this.$parent.resetCardItemRef();
      }
    },
    checkParent() {
      // 校验父级是不是ScrollCard
      return ["ScrollCard", "scroll-card"].includes(this.$parent?.$options._componentTag);
    },
  },
};
</script>

<style lang="scss" scoped>
.scrollCardItem {
  .cardHeader {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      display: flex;
      align-items: center;
      user-select: none;
      .foldIcon {
        font-size: 16px;
        color: #888;
        margin-right: 5px;
      }
      &.canFold {
        cursor: pointer;
      }
      &.canFold:hover {
        color: #409eff;
        .foldIcon {
          color: #409eff;
        }
      }
    }
  }
  .cardItem {
    & > ::v-deep .el-card__header {
      padding: 10px 20px;
      height: 30px;
      line-height: 30px;
      box-sizing: content-box;
    }
    & > ::v-deep .el-card__body {
      height: auto;
      overflow: hidden;
      opacity: 1;
      transition: 0.2s padding ease, 0.2s opacity ease;
    }
    &.fold > ::v-deep .el-card__body {
      height: 0;
      padding: 0;
      opacity: 0;
    }
  }
}
</style>