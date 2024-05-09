---
layout: post
title: vite2.0 vue 打包工具 下一代的前端工具链
date: 2024-05-07 21:01:55 +0800
categories: [Web]
tags: [web, vue, vite, sh]
published: true
---

# 为什么选 Vite

## 现实问题

在浏览器支持 ES 模块之前，JavaScript 并没有提供原生机制让开发者以模块化的方式进行开发。

这也正是我们对 “打包” 这个概念熟悉的原因：使用工具抓取、处理并将我们的源码模块串联成可以在浏览器中运行的文件。

时过境迁，我们见证了诸如 webpack、Rollup 和 Parcel 等工具的变迁，它们极大地改善了前端开发者的开发体验。

然而，当我们开始构建越来越大型的应用时，需要处理的 JavaScript 代码量也呈指数级增长。

包含数千个模块的大型项目相当普遍。基于 JavaScript 开发的工具就会开始遇到性能瓶颈：通常需要很长时间（甚至是几分钟！）才能启动开发服务器，即使使用模块热替换（HMR），文件修改后的效果也需要几秒钟才能在浏览器中反映出来。

如此循环往复，迟钝的反馈会极大地影响开发者的开发效率和幸福感。

Vite 旨在利用生态系统中的新进展解决上述问题：浏览器开始原生支持 ES 模块，且越来越多 JavaScript 工具使用编译型语言编写。

## 缓慢的服务器启动

当冷启动开发服务器时，基于打包器的方式启动必须优先抓取并构建你的整个应用，然后才能提供服务。

Vite 通过在一开始将应用中的模块区分为 依赖 和 源码 两类，改进了开发服务器启动时间。

依赖 大多为在开发时不会变动的纯 JavaScript。一些较大的依赖（例如有上百个模块的组件库）处理的代价也很高。依赖也通常会存在多种模块化格式（例如 ESM 或者 CommonJS）。

Vite 将会使用 esbuild 预构建依赖。esbuild 使用 Go 编写，并且比以 JavaScript 编写的打包器预构建依赖快 10-100 倍。

源码 通常包含一些并非直接是 JavaScript 的文件，需要转换（例如 JSX，CSS 或者 Vue/Svelte 组件），时常会被编辑。同时，并不是所有的源码都需要同时被加载（例如基于路由拆分的代码模块）。

Vite 以 原生 ESM 方式提供源码。这实际上是让浏览器接管了打包程序的部分工作：Vite 只需要在浏览器请求源码时进行转换并按需提供源码。根据情景动态导入代码，即只在当前屏幕上实际使用时才会被处理。

![](https://gitee.com/houbinbin/imgbed/raw/master/img/20240508153311.png)

![](https://gitee.com/houbinbin/imgbed/raw/master/img/20240508153358.png)

## 缓慢的更新

基于打包器启动时，重建整个包的效率很低。

原因显而易见：因为这样更新速度会随着应用体积增长而直线下降。

一些打包器的开发服务器将构建内容存入内存，这样它们只需要在文件更改时使模块图的一部分失活[1]，但它也仍需要整个重新构建并重载页面。这样代价很高，并且重新加载页面会消除应用的当前状态，所以打包器支持了动态模块热替换（HMR）：允许一个模块 “热替换” 它自己，而不会影响页面其余部分。这大大改进了开发体验 —— 然而，在实践中我们发现，即使采用了 HMR 模式，其热更新速度也会随着应用规模的增长而显著下降。

在 Vite 中，HMR 是在原生 ESM 上执行的。当编辑一个文件时，Vite 只需要精确地使已编辑的模块与其最近的 HMR 边界之间的链失活[1]（大多数时候只是模块本身），使得无论应用大小如何，HMR 始终能保持快速更新。

Vite 同时利用 HTTP 头来加速整个页面的重新加载（再次让浏览器为我们做更多事情）：源码模块的请求会根据 304 Not Modified 进行协商缓存，而依赖模块请求则会通过 Cache-Control: max-age=31536000,immutable 进行强缓存，因此一旦被缓存它们将不需要再次请求。

一旦你体验到 Vite 的神速，你是否愿意再忍受像曾经那样使用打包器开发就要打上一个大大的问号了。


# 为什么生产环境仍需打包

尽管原生 ESM 现在得到了广泛支持，但由于嵌套导入会导致额外的网络往返，在生产环境中发布未打包的 ESM 仍然效率低下（即使使用 HTTP/2）。为了在生产环境中获得最佳的加载性能，最好还是将代码进行 tree-shaking、懒加载和 chunk 分割（以获得更好的缓存）。

要确保开发服务器和生产环境构建之间的最优输出和行为一致并不容易。所以 Vite 附带了一套 构建优化 的 构建命令，开箱即用。

## 为何不用 ESBuild 打包？

Vite 目前的插件 API 与使用 esbuild 作为打包器并不兼容。尽管 esbuild 速度更快，但 Vite 采用了 Rollup 灵活的插件 API 和基础建设，这对 Vite 在生态中的成功起到了重要作用。目前来看，我们认为 Rollup 提供了更好的性能与灵活性方面的权衡。

Rollup 已经开始着手改进性能，在 v4 中将其解析器切换到 SWC。

同时还有一个正在进行中的工作，即构建一个名为 Rolldown 的 Rust 版本的 Rollup。

一旦 Rolldown 准备就绪，它就可以在 Vite 中取代 Rollup 和 esbuild，显著提高构建性能，并消除开发和构建之间的不一致性。

你可以观看 Evan You 在 ViteConf 2023 的主题演讲 了解更多细节。

# Vite 与 X 的区别是？

你可以查看 比较 章节获取更多细节，了解 Vite 与同类工具的异同。

## WMR

Preact 团队的 WMR 提供了类似的特性集，而 Vite 2.0 对 Rollup 插件接口的支持正是受到了它的启发。

WMR 主要是为了 Preact 项目而设计，并为其提供了集成度更高的功能，比如预渲染。就使用范围而言，它更加贴合于 Preact 框架，与 Preact 本身一样强调紧凑的大小。如果你正在使用 Preact，那么 WMR 可能会提供更好的体验。

## @web/dev-server

@web/dev-server（曾经是 es-dev-server）是一个伟大的项目，基于 koa 的 Vite 1.0 开发服务器就是受到了它的启发。

@web/dev-server 适用范围不是很广。它并未提供官方的框架集成，并且需要为生产构建手动设置 Rollup 配置。

总的来说，与 @web/dev-server 相比，Vite 是一个更有主见、集成度更高的工具，旨在提供开箱即用的工作流。话虽如此，但 @web 这个项目群包含了许多其他的优秀工具，也可以使 Vite 用户受益。

## Snowpack

Snowpack 也是一个与 Vite 十分类似的非构建式原生 ESM 开发服务器。该项目已经不维护了。

团队目前正在开发 Astro，一个由 Vite 驱动的静态站点构建工具。Astro 团队目前是我们生态中非常活跃的成员，他们帮助 Vite 进益良多。

除了不同的实现细节外，这两个项目在技术上比传统工具有很多共同优势。

Vite 的依赖预构建也受到了 Snowpack v1（现在是 esinstall）的启发。

若想了解 Vite 同这两个项目之间的一些主要区别，可以查看 Vite v2 比较指南。

# 入门例子

## 安装

```bash
npm create vite@latest
```

然后按照提示选择。

```
D:\js\vite>npm create vite@latest
Need to install the following packages:
create-vite@5.2.3
Ok to proceed? (y) y
√ Project name: ... vite-project
√ Select a framework: » Vue
√ Select a variant: » TypeScript

Scaffolding project in D:\js\vite\vite-project...

Done. Now run:

  cd vite-project
  npm install
  npm run dev
```

我们按照提示，直接可以启动：

```
 VITE v5.2.11  ready in 276 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```


## 内容效果

默认的文件如下：

```
│  .gitignore
│  index.html
│  package-lock.json
│  package.json
│  README.md
│  tsconfig.json
│  tsconfig.node.json
│  vite.config.ts
│
├─public
│      vite.svg
│
└─src
    │  App.vue
    │  main.ts
    │  style.css
    │  vite-env.d.ts
    │
    ├─assets
    │      vue.svg
    │
    └─components
            HelloWorld.vue
```


-----------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 vite

Vite 是一种新型的前端构建工具，由 Vue.js 创始人 Evan You 开发。

它旨在提供快速的冷启动和即时的模块热更新（HMR），从而显著提高开发体验。

Vite 在开发阶段使用原生的 ES 模块导入（ESM）来服务文件，这使得它能够避免打包操作，从而加快开发速度。以下是 Vite 的一些核心特性：

1. **快速重载**：Vite 利用浏览器的原生 ES 模块导入特性，在开发中实现快速重载，无需传统的打包和重编译过程。

2. **无需打包**：在开发阶段，Vite 通过 ESM 直接从服务器提供每个文件，避免了打包操作，加快了开发速度。

3. **构建优化**：Vite 在生产环境下使用 Rollup 进行打包，利用 Rollup 的各种插件和优化，确保生成最小的 bundle。

4. **支持 TypeScript 和 JSX**：Vite 提供了对 TypeScript 和 JSX 的内建支持，无需额外配置。

5. **CSS 预处理器支持**：Vite 支持各种 CSS 预处理器，如 Sass、Less 等。

6. **Vue 和 React 支持**：Vite 可以与 Vue 3 和 React 17+ 无缝配合使用。

7. **静态资源处理**：Vite 提供了静态资源的高效处理方式。

8. **构建时按需编译**：Vite 允许在构建时按需编译，而不是在开发时预先编译所有内容。

9. **插件系统**：Vite 拥有一个插件系统，允许开发者扩展 Vite 的功能。

10. **SSR 支持**：Vite 提供了对服务器端渲染（SSR）的支持。

11. **环境变量**：Vite 支持在开发和生产环境中使用环境变量。

12. **自定义模式**：Vite 允许开发者自定义开发服务器，以适应特定的开发需求。

使用 Vite 的基本步骤通常包括：

1. **创建项目**：使用 Vite 提供的脚手架工具创建新项目。

   ```bash
   npm create vite@latest my-project
   ```

2. **安装依赖**：安装项目所需的依赖。

   ```bash
   cd my-project
   npm install
   ```

3. **运行开发服务器**：使用 Vite 启动本地开发服务器。

   ```bash
   npm run dev
   ```

4. **构建应用**：为生产环境构建应用。

   ```bash
   npm run build
   ```

5. **预览生产构建**：在本地预览生产构建。

   ```bash
   npm run serve
   ```

Vite 通过其现代化的开发服务器和优化的生产构建流程，为前端开发提供了一个快速、灵活且功能丰富的工具。

它特别适合希望加快开发速度和改善开发体验的开发者。



# 参考资料

https://github.com/jekip/naive-ui-admin

* any list
{:toc}
