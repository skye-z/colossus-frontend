<template>
  <n-drawer class="no-select no-drag" v-model:show="form.show" :mask-closable="false" :close-on-esc="false" :width="350"
    placement="right">
    <div class="form-head pa-10 flex justify-between border-bottom">
      <div>{{ form.edit ? "编辑主机" : "新建主机" }}</div>
      <n-button quaternary circle size="small" @click="close" :disabled="loading">
        <template #icon>
          <n-icon>
            <CloseRound />
          </n-icon>
        </template>
      </n-button>
    </div>
    <n-scrollbar style="max-height: calc(100vh - 105px)">
      <n-form ref="formRef" class="pa-20 pb-0" :model="form" :rules="rules" :disabled="loading" label-placement="left"
        label-width="auto" require-mark-placement="right-hanging">
        <n-form-item v-if="form.edit" label="编号" path="id">
          <n-input v-model:value="form.id" disabled style="width: 110px" />
        </n-form-item>
        <n-form-item label="主机名" path="name">
          <n-input v-model:value="form.name" placeholder="便于记忆与识别的主机名称" />
        </n-form-item>
        <n-form-item label="访问地址" path="address">
          <n-input v-model:value="form.address" placeholder="主机网络地址(支持IP或域名)" />
        </n-form-item>
        <n-form-item label="连接端口" path="port">
          <n-input v-model:value="form.port" placeholder="SSH连接端口(默认22)" clearable style="width: 180px" />
        </n-form-item>
        <n-form-item label="登录用户" path="user">
          <n-input v-model:value="form.user" placeholder="主机登录用户名(默认root)" clearable />
        </n-form-item>
        <n-form-item label="授权方式" path="type">
          <n-radio-group v-model:value="form.type" name="type">
            <n-space>
              <n-radio value="cert"> 数字证书 </n-radio>
              <n-radio value="pwd"> 账户密码 </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="数字证书" path="cert" v-if="form.type === 'cert'">
          <div class="full-width">
            <n-select v-model:value="form.cert" placeholder="选择凭证" :options="options.certs" />
          </div>
        </n-form-item>
        <n-form-item label="登录密码" path="secret" v-if="form.type === 'pwd'">
          <n-input v-model:value="form.secret" type="password" clearable show-password-on="mousedown"
            :placeholder="form.edit ? '留空即不做修改' : '登录主机的用户密码'" />
        </n-form-item>

        <n-form-item label="运行平台" path="platform">
          <n-select v-model:value="form.platform" placeholder="系统平台" :options="options.platform" style="width: 110px" />
        </n-form-item>
        <n-form-item label="操作系统" path="system">
          <n-select v-model:value="form.system" placeholder="连接成功后可自动获取" :options="options.system" style="width: 190px" />
        </n-form-item>
        <n-form-item label="所在地区" path="region">
          <n-select v-model:value="form.region" placeholder="主机的网络地区" clearable :options="options.region"
            style="width: 150px" />
        </n-form-item>
        <n-form-item label="主要用途" path="usage">
          <n-select v-model:value="form.usage" placeholder="主机的使用场景" clearable :options="options.usage"
            style="width: 150px" />
        </n-form-item>
        <n-form-item label="有效期限" path="period">
          <n-date-picker v-model:value="form.period" type="date" placeholder="可使用的最后期限" clearable style="width: 170px" />
        </n-form-item>
      </n-form>
    </n-scrollbar>
    <div class="pa-10 flex justify-between border-top">
      <n-button @click="close" :disabled="loading">取消</n-button>
      <n-popconfirm @positive-click="submit">
        <template #trigger>
          <n-button type="primary" :loading="loading">保存</n-button>
        </template>
        确认要保存吗?
      </n-popconfirm>
    </div>
  </n-drawer>
</template>
<script>
import { CloseRound } from "@vicons/material";
import { host, cert } from "../plugins/api";
import options from "../plugins/options"

export default {
  name: "HostForm",
  components: { CloseRound },
  data: () => ({
    loading: false,
    form: {
      show: false,
      edit: false,

      name: null,
      address: null,
      port: null,
      type: "pwd",
      user: null,
      cert: null,
      secret: null,
      platform: null,
      system: null,
      region: null,
      usage: null,
      period: null,
    },
    options: {},
    rules: {},
    certs: [],
  }),
  methods: {
    open(type, old) {
      this.form.show = true;
      this.form.edit = type == "edit";
      let rules = {
        name: {
          required: true,
          message: "请输入主机名",
          trigger: "blur",
        },
        address: {
          required: true,
          message: "请输入主机访问地址",
          trigger: "blur",
        },
        platform: {
          required: true,
          message: "请选择主机运行平台",
          trigger: "blur",
        },
      };
      if (!this.form.edit) {
        rules["cert"] = {
          required: true,
          message: "请选择数字证书",
          trigger: "blur",
        };
        rules["secret"] = {
          required: true,
          message: "请输入主机登录用户密码",
          trigger: "blur",
        };
      }
      this.rules = rules;
      if (old) {
        if (old.period) old.period = parseInt(old.period);
        if (old.cert) old.cert = ""+old.cert;
        for (let key in old) {
          if (typeof old[key] == "string" && old[key] != "") this.form[key] = old[key];
          else if (typeof old[key] == "number") this.form[key] = old[key];
        }
      }

      setTimeout(() => this.initCert(), 500)
    },
    initCert() {
      cert.getAllList().then((res) => {
        if (res.state) {
          let list = [];
          for (let i in res.data) {
            list.push({
              label: res.data[i].name,
              value: ""+res.data[i].id
            })
          }
          this.options.certs = list
        } else {
          window.$message.warning(
            res.message ? res.message : "获取凭证失败, 发生意料之外的错误"
          );
        }
      })
        .catch((err) => {
          console.log(err);
          window.$message.warning("获取凭证失败, 发生意料之外的错误");
        });
    },
    close() {
      this.form = {
        show: false,
        edit: false,

        name: null,
        address: null,
        port: null,
        type: "cert",
        user: null,
        cert: null,
        secret: null,
        platform: null,
        system: null,
        region: null,
        usage: null,
        period: null,
      };
    },
    submit() {
      this.$refs.formRef.validate((errors) => {
        if (errors) return false;
        this.loading = true;
        let form = JSON.parse(JSON.stringify(this.form));

        if (form.port == null || form.port == "") form.port = 22;
        else form.port = parseInt(form.port);
        if (form.user == null || form.user == "") form.user = "root";
        if (form.cert != null && form.cert != "") form.cert = parseInt(form.cert);

        if (typeof form.period == "string") form.period = parseInt(form.period);

        if (this.form.edit) this.updateHost(form);
        else this.addHost(form);
      });
    },
    addHost(form) {
      host
        .add(form)
        .then((res) => {
          setTimeout(() => {
            this.loading = false;
            if (res.state) {
              window.$message.success("保存成功");
              this.$emit("update");
              this.close();
            } else {
              window.$message.warning(
                res.message ? res.message : "保存失败, 发生意料之外的错误"
              );
            }
          }, 500);
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
          window.$message.warning("保存失败, 发生意料之外的错误");
        });
    },
    updateHost(form) {
      host
        .edit(form.id, form)
        .then((res) => {
          setTimeout(() => {
            this.loading = false;
            if (res.state) {
              window.$message.success("保存成功");
              this.$emit("update");
              this.close();
            } else {
              window.$message.warning(
                res.message ? res.message : "保存失败, 发生意料之外的错误"
              );
            }
          }, 500);
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
          window.$message.warning("保存失败, 发生意料之外的错误");
        });
    },
  },
  mounted() {
        this.options = options(["platform","system","region","usage","period"])
        this.options.certs = []
  }
};
</script>
<style scoped>
.form-head {
  font-size: 18px;
}
</style>
