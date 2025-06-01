---
layout: post
title: 工作流引擎-04-流程引擎（Process Engine）activiti 优秀开源项目
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



# activiyi

[Spring平台整合activiti工作流引擎实例](https://github.com/shenzhanwang/Spring-activiti)

[activiti-demo 多实例会签、子流程并行审批、动态设置下一节点执行人员、任务超时自动完成](https://github.com/guolf/activiti-demo)

[spring boot 1.5.8整合Activiti6.0及其Activiti-modeler(web版流程设计器)demo](https://github.com/search?q=activiti&type=repositories&p=2)

[基于Vue3.x + Vite + bpmn-js + element-plus + tsx 实现的Activiti流程设计器(Activiti process designer based on Vue3.x + Vite + BPMN-JS + Element-Plus + TSX implementation)](https://github.com/Yiuman/bpmn-vue-activiti)

[spring-boot-with-activiti-example](https://github.com/jbarrez/spring-boot-with-activiti-example)

# chat

## 是什么？

## 配套 UI 和我们的 activiti 配套的前端ui 绘制一般用什么？最好是开源vue

### 基于Vue的Activiti流程设计器完整技术方案

与Activiti工作流引擎配套的前端UI绘制，目前主流开源方案主要围绕**BPMN 2.0标准**和**Vue.js生态**展开，结合可视化建模、流程交互、属性配置等核心需求，以下提供完整技术选型与实践指南：

---

#### 一、核心工具链选择
**1. 基础库：bpmn-js + Vue**
- **bpmn-js**：由Camunda团队维护的BPMN 2.0渲染与建模库，支持流程图的绘制、编辑、属性配置，与Activiti原生兼容。
- **Vue集成**：通过Vue封装bpmn-js组件，实现响应式数据绑定与组件化开发，典型项目结构如下：
  ```bash
  npm install bpmn-js @bpmn-io/properties-panel 
  npm install bpmn-js-properties-panel-activiti  # Activiti属性扩展
  ```


**2. 增强工具链**
- **activiti-bpmn-moddle**：扩展Activiti特有属性（如候选组、监听器配置）的语义化支持。
- **Element-UI/Ant Design Vue**：用于构建辅助UI控件（如工具栏、表单）。
- **ECharts/Vue Flow**：可选方案，用于辅助展示流程统计或拓扑关系。

---

#### 二、完整实现步骤（以请假审批流程为例）
**1. 环境搭建**
```vue
<!-- 容器组件 -->
<template>
  <div class="bpmn-container" ref="container"></div>
</template>

<script>
import BpmnModeler from 'bpmn-js/lib/Modeler';
import activitiModdleDescriptor from './activiti.json';

export default {
  mounted() {
    this.modeler = new BpmnModeler({
      container: this.$refs.container,
      additionalModules: [activitiPropertiesProvider],  // 集成Activiti属性面板
      moddleExtensions: { activiti: activitiModdleDescriptor }  // 扩展Activiti语义
    });
    this.loadDiagram('leaveProcess.bpmn');
  },
  methods: {
    async loadDiagram(xml) {
      const { xml: currentXML } = await this.modeler.saveXML({ format: true });
      if (currentXML === xml) return;
      await this.modeler.importXML(xml);
    }
  }
}
</script>
```


**2. 自定义属性配置**
在`activiti.json`中定义用户任务的自定义属性（如节点类型`nodeType`）：
```json
{
  "name": "Activiti",
  "prefix": "activiti",
  "xml": { "tagAlias": "lowerCase" },
  "types": [
    {
      "name": "UserTask",
      "extends": ["bpmn:UserTask"],
      "properties": [
        { "name": "nodeType", "isAttr": true, "type": "String" }
      ]
    }
  ]
}
```

通过`CustomPalette.js`扩展左侧工具栏，支持拖拽带有自定义属性的节点。

**3. 与后端交互**
- **流程部署**：通过Axios将BPMN XML上传至Activiti REST API `/repository/deployments`。
- **任务处理**：调用`RuntimeService`接口驱动流程实例，例如：
  ```javascript
  // 启动流程实例
  axios.post('/process/start', { 
    processDefinitionKey: 'leaveProcess',
    variables: { applicant: 'user1', days: 3 }
  });

  // 审批任务
  axios.post('/task/complete', { 
    taskId: 'task123',
    variables: { approvalResult: true }
  });
  ```


**4. 高级功能扩展**
- **汉化方案**：通过`customTranslate`模块覆盖bpmn-js的i18n字典。
- **版本对比**：集成`bpmn-js-differ`实现流程版本差异可视化。
- **历史轨迹**：结合Activiti History表数据，用ECharts渲染流程耗时统计。

---

#### 三、开源项目参考
1. **vue-activiti-demo**  
   GitHub地址：[https://github.com/griabcrh/vue-activiti-demo ](https://github.com/griabcrh/vue-activiti-demo ) 
   特性：
   - 完整实现Activiti属性面板与工具栏扩展
   - 支持会签、动态候选人的高级配置
   - 提供流程实例状态监控组件

2. **jeecg-boot-activiti**  
   Gitee地址：[https://gitee.com/youarebetterman/jeecg-boot-activiti ](https://gitee.com/youarebetterman/jeecg-boot-activiti ) 
   特性：
   - 基于Ant Design Vue的企业级低代码平台
   - 集成表单设计器与流程设计器联动
   - 支持在线调试与流程版本回滚

---

#### 四、选型对比与建议

| 方案                | 优点                          | 缺点                          | 适用场景               |
|---------------------|-------------------------------|-------------------------------|-----------------------|
| **原生bpmn-js**     | 官方维护、功能全面            | 需自行实现Activiti属性扩展    | 深度定制化项目        |
| **vue-bpmn**        | 开箱即用的Vue封装             | 社区版功能受限                | 快速验证型项目        |
| **Flowable-Vue**    | 支持CMMN/DMN模型              | 文档较少                      | 多模型协同场景        |

**推荐策略**：
- **快速落地**：直接使用`vue-activiti-demo`模板，减少底层开发。
- **深度定制**：基于bpmn-js二次开发，结合`activiti-bpmn-moddle`扩展业务属性。
- **企业级需求**：采用Jeecg Boot等低代码平台，加速审批类系统开发。

---

#### 五、性能优化关键点
1. **异步渲染**：将流程图渲染逻辑放入Web Worker，避免主线程阻塞。
2. **缓存策略**：对频繁访问的流程定义XML启用LocalStorage缓存。
3. **按需加载**：通过动态导入（Dynamic Import）拆分bpmn-js核心模块与扩展包。
4. **服务端渲染**：对静态流程图预览采用SSR生成SVG，减少客户端计算。

---

### 总结
与Activiti配套的Vue流程设计器开发，**bpmn-js + 自定义扩展**是当前最成熟的开源方案，既能满足BPMN 2.0标准兼容性，又可通过Vue生态实现高效交互。建议优先参考`vue-activiti-demo`项目搭建基础框架，再根据业务需求扩展属性面板、历史追踪等高级功能，最终形成符合企业特色的流程管理平台。


# 参考资料

> [https://github.com/search?q=activiti&type=repositories&p=1](https://github.com/search?q=activiti&type=repositories&p=1)

* any list
{:toc}