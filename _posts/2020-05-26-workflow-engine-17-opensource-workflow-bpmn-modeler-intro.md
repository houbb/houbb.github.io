---
layout: post
title: 工作流引擎-17-开源审批流项目之 flowable workflow designer based on vue and bpmn.io
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [engine, workflow-engine, workflow, bpm, flow]
published: true
---


## 工作流引擎系列

[工作流引擎-00-流程引擎概览](https://houbb.github.io/2020/05/26/workflow-engine-00-overview)

[工作流引擎-01-Activiti 是领先的轻量级、以 Java 为中心的开源 BPMN 引擎，支持现实世界的流程自动化需求](https://houbb.github.io/2020/05/26/workflow-engine-01-activiti)

[工作流引擎-02-BPM OA ERP 区别和联系](https://houbb.github.io/2020/05/26/workflow-engine-02-bpm-oa-erp)

[工作流引擎-03-聊一聊流程引擎](https://houbb.github.io/2020/05/26/workflow-engine-03-chat-what-is-flow)

[工作流引擎-04-流程引擎 activiti 优秀开源项目](https://houbb.github.io/2020/05/26/workflow-engine-04-activiti-opensource)

[工作流引擎-05-流程引擎 Camunda 8 协调跨人、系统和设备的复杂业务流程](https://houbb.github.io/2020/05/26/workflow-engine-05-camunda-intro)

[工作流引擎-06-流程引擎 Flowable、Activiti 与 Camunda 全维度对比分析](https://houbb.github.io/2020/05/26/workflow-engine-06-compare)

[工作流引擎-07-流程引擎 flowable-engine 入门介绍](https://houbb.github.io/2020/05/26/workflow-engine-07-flowable-intro)

[工作流引擎-08-流程引擎 flowable-engine 优秀开源项目](https://houbb.github.io/2020/05/26/workflow-engine-08-flowable-opensource)

[工作流引擎-09-XState 是一个 JavaScript 和 TypeScript 的状态管理库，它使用状态机和状态图来建模逻辑](https://houbb.github.io/2020/05/26/workflow-engine-09-xstate-intro)

[工作流引擎-10-什么是 BPM?](https://houbb.github.io/2020/05/26/workflow-engine-10-bpm-intro)

[工作流引擎-11-开源 BPM 项目 jbpm](https://houbb.github.io/2020/05/26/workflow-engine-11-opensource-bpm-jbpm-intro)

[工作流引擎-12-开源 BPM 项目 foxbpm](https://houbb.github.io/2020/05/26/workflow-engine-12-opensource-bpm-foxbpm-intro)

[工作流引擎-13-开源 BPM 项目 UFLO2](https://houbb.github.io/2020/05/26/workflow-engine-13-opensource-bpm-uflo-intro)

[工作流引擎-14-开源审批流项目之 RuoYi-vue + flowable 6.7.2 的工作流管理](https://houbb.github.io/2020/05/26/workflow-engine-14-opensource-ruoyi-flowable-intro)

[工作流引擎-15-开源审批流项目之 RuoYi-Vue-Plus 进行二次开发扩展Flowable工作流功能](https://houbb.github.io/2020/05/26/workflow-engine-15-opensource-ruoyi-flowable-plus-intro)

[工作流引擎-16-开源审批流项目之 整合Flowable官方的Rest包](https://houbb.github.io/2020/05/26/workflow-engine-16-opensource-flowable-ui-intro)

[工作流引擎-17-开源审批流项目之 flowable workflow designer based on vue and bpmn.io](https://houbb.github.io/2020/05/26/workflow-engine-17-opensource-workflow-bpmn-modeler-intro)

[工作流引擎-18-开源审批流项目之 plumdo-work 工作流，表单，报表结合的多模块系统](https://houbb.github.io/2020/05/26/workflow-engine-18-opensource-plumdo-work-intro)

# workflow-bpmn-modeler

🔥 本项目基于 `vue` 和 `bpmn.io@7.0` ，实现 flowable 的工作流设计器

## 预览 📟

![20200930030243](https://cdn.jsdelivr.net/gh/nayacco/cdn@master/blog/20200930030243.png)

## 在线 demo 📢

👉 https://nayacco.github.io/workflow-bpmn-modeler/demo/

## 安装 ⏳

```bash
# 安装
yarn add workflow-bpmn-modeler
```

## 使用说明 👣

```vue
<template>
  <div>
    <bpmn-modeler
      ref="refNode"
      :xml="xml"
      :users="users"
      :groups="groups"
      :categorys="categorys"
      :is-view="false"
      @save="save"
    />
  </div>
</template>

<script>
import bpmnModeler from "workflow-bpmn-modeler";

export default {
  components: {
    bpmnModeler,
  },
  data() {
    return {
      xml: "", // 后端查询到的xml
      users: [
        { name: "披头士", id: "1" },
        { name: "滚石乐队", id: "2" },
        { name: "平克·佛洛伊德", id: "3" },
      ],
      groups: [
        { name: "web", id: "4" },
        { name: "java", id: "5" },
        { name: "python", id: "6" },
      ],
      categorys: [
        { name: "音乐", id: "7" },
        { name: "文章", id: "8" },
      ],
    };
  },
  methods: {
    getModelDetail() {
      // 发送请求，获取xml
      // this.xml = response.xml
    },
    save(data) {
      console.log(data);  // { process: {...}, xml: '...', svg: '...' }
    },
  },
};
</script>
```

## iframe 部署 🎪

如果你的项目是 jquery 或 react 类项目，可以通过 iframe 的方式集成该流程设计器

本仓库通过 github pages 部署了静态页面，使用 jsdelivr 做 cdn ，国内访问也非常快速，所以你可以直接集成本仓库的页面，因为全部白嫖了 github 的资源，没有自己建服务器维护，所以不用担心资源失效问题。

当然你也可以在 `docs/lib` 文件夹下下载对应的版本，进行本地部署。

集成方式如下（ps：可直接拷贝以下代码到一个html文件中试一下）：

```html
<!DOCTYPE html>
<html lang="en">
  <body>
    <iframe
      src="https://nayacco.github.io/workflow-bpmn-modeler/cdn/0.2.8/"
      id="myFrame"
      frameborder="0"
      width="100%"
      height="800px">
    </iframe>

    <script>
      let myFrame = document.getElementById("myFrame");
      // 获取到流程详情
      window.addEventListener("message", (event) => {
        console.log(event.data); // { xml: 'xxx', img: 'xxx', process: {} }
      });
      myFrame.onload = () => {
        let postMsg = {
          xml: "", // 后端查询到的xml，新建则为空串
          users: [
            { name: "张三1", id: "zhangsan" },
            { name: "李四1", id: "lisi" },
            { name: "王五1", id: "wangwu" },
          ],
          groups: [
            { name: "web组1", id: "web" },
            { name: "java组1", id: "java" },
            { name: "python组1", id: "python" },
          ],
          categorys: [
            { name: "OA1", id: "oa" },
            { name: "财务1", id: "finance" },
          ],
          isView: false
        }
        // 设置初始化值
        myFrame.contentWindow.postMessage(postMsg, "*")
      }
    </script>
  </body>
</html>
```

## 关于定制 🛠

本组件对标的是 flowable 官方设计器，也就是实现 flowable 的 xml 规则标准，里面所用名词也都是官方文档中的专业术语。

所以这个组件只是程序员在开发阶段，自己建模导出 xml 的工具，试图定制该建模器的行为都是不对的，不要把业务带到建模器中来！

自己的业务应该另行开发增删改查来实现。

该组件未来也不会升级 UI 库和 vue。不管库是否兼容，通过 iframe 的方式集成建模器才是最简单正确的方式。


## License 📄

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present, charles

# 参考资料

https://github.com/Nayacco/workflow-bpmn-modeler

* any list
{:toc}