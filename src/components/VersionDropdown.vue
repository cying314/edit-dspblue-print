<template>
  <div class="version-dropdown">
    <span v-if="latestVersion && !isLatest" class="update-indicator">有更新*</span>
    <el-dropdown @visible-change="handleVisibleChange" trigger="click" placement="bottom-start">
      <el-button type="text" class="version-btn">
        <span>当前版本：{{ versionLabel }}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown" class="version-menu">
        <template>
          <div v-if="versionLoading" class="loading-item">
            <i class="el-icon-loading"></i>
            <span class="loading-text">加载中...</span>
          </div>
          <div v-else>
            <div class="list-wrap">
              <el-dropdown-item v-for="(item, idx) in versions" :key="idx" class="version-item" @click.native.stop="goToVersion(item.version)">
                <span class="ver">
                  <span>{{ item.version }}</span>
                  <el-tag v-if="idx===0" class="ver-tag" size="mini" type="success">最新</el-tag>
                  <el-tag v-else-if="item.version==versionLabel" class="ver-tag" size="mini" type="warning">当前</el-tag>
                </span>
                <span class="time">{{ item.time }}</span>
              </el-dropdown-item>
              <el-dropdown-item v-if="versions.length===0">
                <div style="color:#999; padding:6px 12px">暂无版本信息</div>
              </el-dropdown-item>
            </div>
            <el-dropdown-item v-if="versions.length>0" class="footer-item" @click.native.stop.prevent="openHistoryDialog">
              <div class="footer-content">查看更新记录</div>
            </el-dropdown-item>
          </div>
        </template>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dialog title="更新记录" :visible.sync="versionDialogVisible" width="60%" append-to-body>
      <div v-if="versions && versions.length" class="version-dialog-content">
        <div v-for="(item, index) in versions" :key="index" class="version-item-wrap">
          <div class="version-item-header">
            <div class="version-item-title">
              <a class="version-link" :href="getVersionUrl(item.version)">{{ item.version }}</a>
              <el-tag v-if="index===0" class="version-tag" size="mini" type="success">最新</el-tag>
              <el-tag v-else-if="item.version==versionLabel" class="version-tag" size="mini" type="warning">当前</el-tag>
            </div>
            <div class="version-item-time">{{ item.time }}</div>
          </div>
          <div class="version-item-body">
            <div v-for="(desc, descIndex) in (item.desc || [])" :key="descIndex" class="version-item-desc">
              <template v-if="desc && desc.tag">
                <el-tag size="mini" class="desc-tag">{{ desc.tag }}</el-tag>
                <span>{{ desc.text }}</span>
              </template>
              <template v-else>
                <span>{{ typeof desc === 'string' ? desc : (desc && desc.text) }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-updates">暂无更新内容</div>

      <span slot="footer" class="dialog-footer">
        <a class="download-link" :href="downloadUrl" target="_blank" rel="noopener noreferrer">
          <el-button size="small" type="primary">下载历史版本</el-button>
        </a>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "VersionDropdown",
  data() {
    return {
      versionLabel: process.env.VUE_APP_VERSION,
      versionInfo: null,
      versionLoading: false,
      versionDialogVisible: false,
      downloadUrl: "https://pan.baidu.com/s/1kE3t7FUhvCSBbPczvVupvw?pwd=6666",
    };
  },
  computed: {
    latest() {
      if (this.versions && this.versions.length) return this.versions[0];
      return null;
    },
    latestVersion() {
      return this.latest ? this.latest.version : null;
    },
    isLatest() {
      if (!this.latestVersion) return true;
      return this.versionLabel == this.latestVersion;
    },
    // 统一返回数组格式的版本列表
    versions() {
      if (!this.versionInfo) return [];
      if (Array.isArray(this.versionInfo)) return this.versionInfo;
      return [];
    },
  },
  mounted() {
    this.getVersionData();
  },
  methods: {
    async getVersionData() {
      if (!this.fetchVersionJsonPromise) {
        this.fetchVersionJsonPromise = this.fetchVersionJsonAsync();
      }
      await this.fetchVersionJsonPromise;
    },
    async fetchVersionJsonAsync() {
      this.versionLoading = true;
      try {
        const now = new Date();
        const yyyy = now.getFullYear();
        const MM = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        // const ss = String(now.getSeconds()).padStart(2, "0");
        const t = yyyy + MM + dd + hh + mm.slice(0, 1); // 版本信息请求的时间戳，格式为yyyyMMddhhm，确保每10分钟更新一次
        const l = this.isLatest ? 1 : 0;

        const url = this.getUrl(`/version.json?t=${t}&l=${l}`);
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error("加载失败");
        const json = await res.json();
        this.versionInfo = Array.isArray(json) ? json : null;
      } catch (e) {
        console.error("加载version.json失败", e);
        // this.$message.error("加载历史版本信息失败");
      } finally {
        this.versionLoading = false;
        this.fetchVersionJsonPromise = null;
      }
    },
    handleVisibleChange(visible) {
      if (!visible) return;
      this.getVersionData();
    },
    openHistoryDialog() {
      if (!this.versionInfo) {
        this.getVersionData().then(() => {
          this.versionDialogVisible = true;
        });
      } else {
        this.versionDialogVisible = true;
      }
    },
    getVersionUrl(version) {
      if (!version) return "";
      return this.getUrl(`/versions/${encodeURIComponent(version)}/`);
    },
    goToVersion(version) {
      if (!version) return;
      window.location.pathname = this.getVersionUrl(version);
    },
    // 获取相对url
    getUrl(url) {
      const publicPath = location.pathname.replace(/\/versions\/.+/, "").replace(/\/$/, "");
      return publicPath + url;
    },
  },
};
</script>

<style lang="scss" scoped>
.update-indicator {
  color: #e6a23c;
  font-size: 12px;
}
.version-btn {
  color: #999;
  padding: 5px;
}
.loading-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #606266;
  padding: 0 20px;
  .loading-text {
    margin-left: 8px;
  }
}
.list-wrap {
  max-height: 220px;
  overflow-y: auto;
  display: block;
}
.version-item {
  padding: 6px 12px !important;
  line-height: 18px !important;
  font-size: 13px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  .ver {
    font-weight: 600;
    .ver-tag {
      margin-left: 3px;
      transform: scale(0.8);
      transform-origin: left;
    }
  }
  .time {
    color: #888;
    font-size: 12px;
    margin-left: 10px;
  }
}
.footer-item {
  padding: 0 12px !important;
  line-height: 30px !important;
  cursor: pointer;
  .footer-content {
    text-align: center;
    color: #409eff;
    width: 100%;
  }
}
.footer-item:hover,
.version-item:hover {
  background: #f5f7fa !important;
}
.version-dialog-content {
  max-height: 60vh;
  padding-right: 5px;
  margin-right: -5px;
  overflow-y: auto;
  .version-item-wrap {
    margin-bottom: 10px;
    .version-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .version-item-title {
        .version-link {
          cursor: pointer;
          font-weight: bold;
          color: #303133;
          text-decoration: none;
          &:hover {
            color: #409eff;
            text-decoration: underline;
          }
        }
        .version-tag {
          margin-left: 5px;
        }
      }
      .version-item-time {
        font-size: 12px;
        color: #999;
      }
    }

    .version-item-body {
      background: #f5f7fa;
      padding: 10px;
      border-radius: 4px;
      margin-top: 6px;
      .version-item-desc {
        margin-bottom: 5px;
        .desc-tag {
          margin-right: 5px;
        }
      }
    }
  }
}
.no-updates {
  text-align: center;
  color: #999;
  padding: 20px;
}
.dialog-footer {
  text-align: right;
  .download-link {
    display: inline-block;
    text-decoration: none;
  }
}
</style>
