---
layout: post
title: Ant Design of Vue-01-这里是 Ant Design 的 Vue 实现，开发和服务于企业级后台产品。
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, vue-ui, ui, sh]
published: true
---


# Ant Design Vue：企业级中后台产品的完美解决方案

特性：
- 提炼自企业级中后台产品的交互语言和视觉风格。
- 开箱即用的高质量 Vue 组件。
- 共享Ant Design of React设计工具体系。

支持环境：
- 现代浏览器，如果需要支持IE9，可选择使用1.x版本。
- 支持服务端渲染。
- 支持Electron。
- 支持IE / Edge、Firefox、Chrome、Safari、Opera。

版本：
- 稳定版：npm package
- 订阅发布通知：https://github.com/vueComponent/ant-design-vue/releases.atom

# 关于 ant-design-vue 

众所周知，Ant Design 作为一门设计语言面世，经历过多年的迭代和积累，它对 UI 的设计思想已经成为一套事实标准，受到众多前端开发者及企业的追捧和喜爱，也是 React 开发者手中的神兵利器。

希望 ant-design-vue 能够让 Vue 开发者也享受到 Ant Design 的优秀设计。

ant-design-vue 是 Ant Design 的 Vue 实现，组件的风格与 Ant Design 保持同步，组件的 html 结构和 css 样式也保持一致，真正做到了样式 0 修改，组件 API 也尽量保持了一致。

Ant Design Vue 致力于提供给程序员愉悦的开发体验。

标题：Ant Design Vue 安装指南

使用 npm 或 yarn 安装：
```bash
$ npm install ant-design-vue@4.x --save
$ yarn add ant-design-vue@4.x
```

浏览器引入：
在浏览器中使用 script 和 link 标签直接引入文件，并使用全局变量 antd。你可以在 npm 发布包内的 ant-design-vue/dist 目录下找到 antd.js、antd.min.js 和 reset.css。你也可以通过 jsdelivr 或 UNPKG 进行下载。

注意：引入 antd.js 前你需要自行引入 vue、dayjs 及其相关插件。

示例：
```html
<script src="https://unpkg.com/dayjs/dayjs.min.js"></script>
<script src="https://unpkg.com/dayjs/plugin/customParseFormat.js"></script>
<!-- 其他插件 -->
<script src="https://unpkg.com/ant-design-vue/dist/antd.min.js"></script>
```

按需加载：
ant-design-vue 默认支持基于 ES modules 的 tree shaking。

自动按需引入组件：
如果你使用的是 Vite，推荐使用 unplugin-vue-components 插件。

```bash
$ npm install unplugin-vue-components -D
```

然后在 vite.config.js 中配置插件，插件会自动将代码转化为 `import { Button } from 'ant-design-vue'` 的形式。

```javascript
import { defineConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    // ...
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
});
```

现在你可以在代码中直接引入 ant-design-vue 的组件，例如：
```javascript
import { Button } from 'ant-design-vue';
```

# 快速上手：

Ant Design Vue 旨在为程序员提供愉悦的开发体验。

在开始之前，建议您先学习 Vue 和 ES2015，并确保已正确安装和配置了 Node.js v8.9 或更高版本。

官方指南假设您已经掌握了关于 HTML、CSS 和 JavaScript 的中级知识，并且已经完全掌握了 Vue 的正确开发方式。

如果您刚开始学习前端或 Vue，将 UI 框架作为您的第一步可能不是最佳选择。

在线演示：

您可以通过以下 CodeSandbox 演示来最简单地了解 Ant Design Vue 的使用方式，也建议 Fork 本例来进行 Bug 报告。

[Vue Antd Template](https://codesandbox.io/s/antd-vue-template-nuhfc)

引入 Ant Design Vue：

1. 安装脚手架工具：
```bash
$ npm install -g @vue/cli
# 或者
$ yarn global add @vue/cli
```

2. 创建一个项目：
使用命令行进行初始化。
```bash
$ vue create antd-demo
```
并按照提示配置项目。如果安装缓慢报错，您可以尝试用 cnpm 或别的镜像源自行安装：
```bash
rm -rf node_modules && cnpm install
```

3. 使用组件：

- 安装：
```bash
$ npm i --save ant-design-vue@4.x
```

- 注册：

全局完整注册：
```javascript
import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.use(Antd).mount('#app');
```

全局部分注册：
```javascript
import { createApp } from 'vue';
import { Button, message } from 'ant-design-vue';
import App from './App';

const app = createApp(App);

/* 会自动注册 Button 下的子组件, 例如 Button.Group */
app.use(Button).mount('#app');

app.config.globalProperties.$message = message;
```

局部注册组件：

```vue
<template>
  <a-button>Add</a-button>
</template>
<script>
  import { Button } from 'ant-design-vue';
  const ButtonGroup = Button.Group;

  export default {
    components: {
      AButton: Button,
      AButtonGroup: ButtonGroup,
    },
  };
</script>
```

按需加载：

Ant Design Vue 默认支持基于 ES modules 的 tree shaking，直接引入 `import { Button } from 'ant-design-vue';` 就会有按需加载的效果。

## 配置主题和字体：

[改变主题](https://antdv.com/docs/vue/customize-theme-cn)

# 参考资料

https://element.eleme.io/#/zh-CN

* any list
{:toc}
 