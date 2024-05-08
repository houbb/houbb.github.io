---
layout: post
title: Naive Ui-01-overview 概览 一个 Vue 3 组件库 / 比较完整，主题可调，使用 TypeScript，快 / 有点意思
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, admin, sh]
published: true
---

# Naive Ui 

## 特性

### 比较完整

有超过 90 个组件，希望能帮你少写点代码。

顺便一提，它们全都可以 treeshaking。

### 主题可调

我们提供了一个使用 TypeScript 构建的先进的类型安全主题系统。你只需要提供一个样式覆盖的对象，剩下的都交给我们。

顺便一提，不用 less、sass、css 变量，也不用 webpack 的 loaders。以及你可以试试右下角的主题编辑器。

### 使用 TypeScript

Naive UI 全量使用 TypeScript 编写，和你的 TypeScript 项目无缝衔接。

顺便一提，你不需要导入任何 CSS 就能让组件正常工作。

### 快

我尽力让它不要太慢。至少 select、tree、transfer、table、cascader 都可以用虚拟列表。

顺便一提，...，没有顺便了。祝你使用愉快。

# 安装

## npm

使用 npm 安装。

```
npm i -D naive-ui
```

## 字体

```
npm i -D vfonts
```

## 图标

naive-ui 建议使用 xicons 作为图标库。

## 设计资源

[Naive UI (Sketch)](https://naive-ui.oss-accelerate.aliyuncs.com/NaiveUI-Design-Library-zh-CN.sketch)

# chat

## 详细介绍一下 naive ui

Naive UI 是一个流行的 Vue 3 组件库，它提供了一套风格一致、功能丰富的 UI 组件，用于构建高质量的 web 用户界面。Naive UI 以其易用性、性能和美观的设计受到开发者的喜爱。

以下是 Naive UI 的一些核心特性：

1. **基于 Vue 3**：Naive UI 专为 Vue 3 设计，充分利用了 Vue 3 的新特性和性能优势。

2. **响应式设计**：Naive UI 的组件是响应式的，能够根据屏幕大小自动调整布局。

3. **自定义主题**：Naive UI 允许开发者自定义组件的主题，包括颜色、字体和其他样式，以适应不同的设计需求。

4. **类型安全**：Naive UI 与 TypeScript 兼容，提供了类型定义文件，使得开发者可以享受到类型检查带来的优势。

5. **无依赖**：Naive UI 不依赖于任何其他 UI 库或框架，只依赖 Vue 3。

6. **丰富的组件**：提供了一套全面的组件，包括按钮、输入框、选择器、对话框、布局工具等。

7. **可访问性**：Naive UI 的组件考虑了可访问性，支持键盘操作和辅助技术。

8. **国际化支持**：Naive UI 的组件支持国际化，可以根据不同的语言环境显示相应的文本。

9. **文档和社区**：Naive UI 有详细的文档和活跃的社区，为开发者提供了丰富的学习资源和问题解答。

10. **遵循设计规范**：Naive UI 的组件设计遵循了常见的设计规范，易于集成到各种设计系统中。

11. **可扩展性**：Naive UI 的组件设计考虑了可扩展性，允许开发者根据需要进行扩展和定制。

使用 Naive UI 的基本步骤通常包括：

1. **安装**：通过 npm 或 yarn 安装 Naive UI。

   ```bash
   npm install naive-ui --save
   ```

2. **引入 Naive UI**：在你的 Vue 3 项目中引入 Naive UI，并全局注册所需的组件。

   ```javascript
   import { createApp } from 'vue';
   import NaiveUi from 'naive-ui';
   import 'naive-ui/dist/style.css';

   const app = createApp();
   app.use(NaiveUi);
   app.mount('#app');
   ```

3. **使用组件**：在 Vue 组件中使用 Naive UI 提供的标签来引入 UI 组件。

   ```vue
   <template>
     <n-button>Click Me</n-button>
   </template>
   ```

4. **自定义主题**：如果需要自定义主题，可以创建一个主题文件并按需修改样式。

5. **构建和预览**：构建你的 Vue 应用并在浏览器中预览，查看 Naive UI 组件的效果。

Naive UI 是构建现代 Vue 3 应用的优秀选择，它提供了高性能和高质量的 UI 组件，帮助开发者快速构建用户界面。

## 类似 naive ui 的组件还有哪些？

类似于 Naive UI 的前端 UI 组件库有很多，它们提供了丰富的组件和样式，以帮助开发者快速构建用户界面。以下是一些流行的 Vue 组件库，以及一些适用于 React 和通用的前端框架的组件库：

### Vue 组件库：
1. **Element UI**：一套为开发者、设计师和产品经理准备的基于 Vue 2.0 的桌面端组件库。
2. **Vuetify**：基于 Vue 的 Material Design 组件框架。
3. **Ant Design Vue**：Ant Design 的 Vue 实现，提供了一套企业级的高质量 Vue 组件。
4. **Quasar Framework**：一个基于 Vue 的全栈框架，支持构建响应式网站、移动应用和 Electron 应用。
5. **BootstrapVue**：Bootstrap 组件的 Vue 版本，用于快速构建响应式布局。
6. **Vue Material**：基于 Vue 的 Material Design 组件库。

### React 组件库：
1. **Material-UI**：基于 Google 的 Material Design 设计语言的 React 组件库。
2. **Ant Design**：一套企业级的 React UI 设计语言和 React 组件库。
3. **Semantic UI React**：Semantic 组件的官方 React 集成。
4. **Blueprint**：基于 Blueprint JS 的 React 组件库，用于构建复杂的 web 应用。
5. **Chakra UI**：一个简单、模块化且易于访问的 React 组件库。

### 通用前端框架组件库：
1. **Bootstrap**：一个流行的前端开源工具包，用于开发响应式和移动优先的 web 项目。
2. **Foundation**：由 ZURB 创建的响应式前端框架，包含 HTML、CSS 和 JavaScript 组件。
3. **Tailwind CSS**：一个实用性优先的 CSS 框架，用于快速构建自定义设计。
4. **Bulma**：一个基于 Flexbox 的开源 CSS 框架，用于构建响应式 web 界面。
5. **Materialize**：一个基于 Material Design 的现代响应式前端框架。

每个组件库都有其独特的设计风格、性能特点和易用性。

开发者可以根据项目需求、团队熟悉度以及对特定特性的偏好来选择合适的组件库。

## 给出上述 vue 组件库的对比表格，包含 naive-ui

以下是一些流行的 Vue UI 组件库的对比表格，包括 Naive UI 在内：

| 特性/组件库      | Naive UI | Element UI | Vuetify | Ant Design Vue | Quasar | BootstrapVue | Vue Material |
|-----------------|----------|------------|---------|----------------|--------|--------------|-------------|
| **Vue 版本**     | Vue 3    | Vue 2      | Vue 2    | Vue 2          | Vue 2  | Vue 2        | Vue 2       |
| **响应式**       | 是       | 是         | 是       | 是             | 是      | 是            | 是          |
| **定制主题**     | 是       | 是         | 是       | 是             | 是      | 是            | 是          |
| **类型支持**     | 是       | 否         | 是       | 否              | 否      | 否            | 是          |
| **组件数量**     | 中       | 多         | 多       | 多             | 中      | 中            | 中          |
| **国际化**       | 是       | 是         | 是       | 是             | 是      | 是            | 是          |
| **社区活跃度**   | 活跃     | 高         | 高       | 高             | 高      | 中            | 中          |
| **可访问性**     | 是       | 是         | 是       | 是             | 是      | 是            | 是          |
| **价格**         | 免费     | 免费       | 免费     | 免费/付费     | 免费    | 免费         | 免费/付费   |
| **文档完善度**   | 好       | 非常好     | 非常好   | 非常好         | 好      | 好            | 好          |
| **设计理念**     | 简洁     | 功能丰富   | 优雅     | 企业级         | 通用    | 基于 Bootstrap | Material Design |
| **维护状态**     | 活跃     | 活跃       | 活跃     | 活跃           | 活跃    | 活跃         | 活跃        |

请注意，这个表格是基于每个组件库的公共知识制作的，并且可能不包含所有细节。

每个组件库都有其特定的使用场景和优势，选择哪个库取决于项目需求、团队熟悉度以及对特定特性的偏好。

此外，随着开源社区的发展，这些库的特性和状态可能会发生变化。


# 参考资料

https://www.naiveui.com/zh-CN/light/docs/introduction

* any list
{:toc}
