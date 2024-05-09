---
layout: post
title: Element Ui-01-一套为开发者、设计师和产品经理准备的基于 Vue 2.0 的桌面端组件库
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, vue-ui, ui, sh]
published: true
---

# 设计原则

## 一致性 Consistency

与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；
在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。

## 反馈 Feedback

控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；
页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。

## 效率 Efficiency

简化流程：设计简洁直观的操作流程；
清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；
帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。

## 可控 Controllability

用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；
结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。

# 安装

## npm 安装

推荐使用 npm 的方式安装，它能更好地和 webpack 打包工具配合使用。

```
npm i element-ui -S
```

## CDN

目前可以通过 unpkg.com/element-ui 获取到最新版本的资源，在页面上引入 js 和 css 文件即可开始使用。

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
```

# Hello world

通过 CDN 的方式我们可以很容易地使用 Element 写出一个 Hello world 页面。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <!-- import CSS -->
  <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
</head>
<body>
  <div id="app">
    <el-button @click="visible = true">Button</el-button>
    <el-dialog :visible.sync="visible" title="Hello world">
      <p>Try Element</p>
    </el-dialog>
  </div>
</body>
  <!-- import Vue before Element -->
  <script src="https://unpkg.com/vue@2/dist/vue.js"></script>
  <!-- import JavaScript -->
  <script src="https://unpkg.com/element-ui/lib/index.js"></script>
  <script>
    new Vue({
      el: '#app',
      data: function() {
        return { visible: false }
      }
    })
  </script>
</html>
```

# 快速上手

## 使用 vue-cli@3

我们为新版的 vue-cli 准备了相应的 Element 插件，你可以用它们快速地搭建一个基于 Element 的项目。

## 使用 Starter Kit

我们提供了通用的项目模板，你可以直接使用。对于 Laravel 用户，我们也准备了相应的模板，同样可以直接下载使用。

如果不希望使用我们提供的模板，请继续阅读。

## 引入 Element

你可以引入整个 Element，或是根据需要仅引入部分组件。我们先介绍如何引入完整的 Element。

### 完整引入

在 main.js 中写入以下内容：

```js
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';

Vue.use(ElementUI);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

以上代码便完成了 Element 的引入。需要注意的是，样式文件需要单独引入。

### 按需引入

借助 babel-plugin-component，我们可以只引入需要的组件，以达到减小项目体积的目的。

首先，安装 babel-plugin-component：


------------------------ 

# chat

## 对比一下 element-ui 和 naive-ui

Element UI 和 Naive UI 都是基于 Vue.js 的前端 UI 组件库，它们提供了丰富的组件和工具来帮助开发者快速构建用户界面。以下是两者的对比：

1. **Vue 版本支持**：
   - Element UI：最初是为 Vue 2 设计的，但后来推出了 Element Plus 以支持 Vue 3。
   - Naive UI：专为 Vue 3 设计，充分利用了 Vue 3 的新特性和性能优势。

2. **设计理念**：
   - Element UI：提供了一套功能丰富的桌面端组件库，设计上更为成熟和稳重。
   - Naive UI：追求简洁和优雅，组件设计上更为现代和清新。

3. **响应式设计**：
   - 两者都提供了响应式设计的组件，能够根据屏幕大小自动调整布局。

4. **定制主题**：
   - Element UI：允许开发者自定义组件的主题，包括颜色、字体和其他样式。
   - Naive UI：提供了一个使用 TypeScript 构建的先进的类型安全主题系统，允许通过样式覆盖对象来定制主题。

5. **类型支持**：
   - Element UI：没有原生的 TypeScript 支持。
   - Naive UI：全量使用 TypeScript 编写，提供了类型定义文件，与 TypeScript 项目无缝衔接。

6. **组件数量**：
   - Element UI：提供了大量的组件，适合需要大量不同组件的项目。
   - Naive UI：组件数量中等，但每个组件都支持 Tree-shaking，有助于减少最终应用的体积。

7. **社区活跃度**：
   - Element UI：由于较早推出并且广泛使用，社区活跃度较高。
   - Naive UI：作为一个较新的库，社区活跃度也在逐渐增长，但可能还不如 Element UI 那么高。

8. **维护状态**：
   - Element UI：Element Plus 作为 Vue 3 的版本，维护活跃。
   - Naive UI：由个人开发者维护，但得到了社区的广泛认可和使用。

9. **文档和学习资源**：
   - Element UI：有详细的文档和较多的学习资源。
   - Naive UI：文档质量良好，提供了丰富的使用示例和指南。

10. **国际化和可访问性**：
    - 两者都支持国际化和可访问性，允许开发者根据不同的语言环境和无障碍需求进行适配。

11. **价格**：
    - Element UI：Element Plus 是免费使用的。
    - Naive UI：也是免费提供给开发者使用的。

12. **性能**：
    - Element UI：性能稳定，适用于大型项目。
    - Naive UI：注重性能优化，特别是在选择器、树形控件、传输列表、表格和级联选择器等组件上使用了虚拟列表。

13. **设计理念和组件风格**：
    - Element UI：组件风格较为传统，更符合一些企业级应用的需求。
    - Naive UI：设计上更为现代，可能更受追求简洁风格的开发者喜爱。

选择哪个组件库，最终取决于项目的具体需求、团队的技术栈以及对组件库特性的偏好。



# 参考资料

https://element.eleme.io/#/zh-CN

* any list
{:toc}
 