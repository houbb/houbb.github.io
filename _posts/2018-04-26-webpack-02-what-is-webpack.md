---
layout: post
title:  WebPack-02-什么是 webpack 及基本概念
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

# 概念

本质上，webpack 是一个用于现代 JavaScript 应用程序的 静态模块打包工具。

当 webpack 处理应用程序时，它会在内部从一个或多个入口点构建一个 依赖图(dependency graph)，然后将你项目中所需的每一个模块组合成一个或多个 bundles，它们均为静态资源，用于展示你的内容。

从 v4.0.0 开始，webpack 可以不用再引入一个配置文件来打包项目，然而，它仍然有着 高度可配置性，可以很好满足你的需求。

在开始前你需要先理解一些核心概念：

- 入口(entry)

- 输出(output)

- loader

- 插件(plugin)

- 模式(mode)

- 浏览器兼容性(browser compatibility)

- 环境(environment)

本文档旨在给出这些概念的高度概述，同时提供具体概念的详尽相关用例的链接。

为了更好地理解模块打包工具背后的理念，以及在底层它们是如何运作的，请参考以下资源：

- 手动打包一个应用程序

- 实时创建一个简单打包工具

- 一个简单打包工具的详细说明

# 入口(entry)

入口起点(entry point) 指示 webpack 应该使用哪个模块，来作为构建其内部 依赖图(dependency graph) 的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。

默认值是 `./src/index.js`，但你可以通过在 webpack configuration 中配置 entry 属性，来指定一个（或多个）不同的入口起点。

例如：

- webpack.config.js

```js
module.exports = {
  entry: './path/to/my/entry/file.js',
};
```

# 输出(output)

output 属性告诉 webpack 在哪里输出它所创建的 bundle，以及如何命名这些文件。

主要输出文件的默认值是 ./dist/main.js，其他生成文件默认放置在 ./dist 文件夹中。

你可以通过在配置中指定一个 output 字段，来配置这些处理过程：

- webpack.config.js

```js
const path = require('path');

module.exports = {
  entry: './path/to/my/entry/file.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js',
  },
};
```

在上面的示例中，我们通过 output.filename 和 output.path 属性，来告诉 webpack bundle 的名称，以及我们想要 bundle 生成(emit)到哪里。

可能你想要了解在代码最上面导入的 path 模块是什么，它是一个 Node.js 核心模块，用于操作文件路径。

# loader

webpack 只能理解 JavaScript 和 JSON 文件，这是 webpack 开箱可用的自带能力。

loader 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 模块，以供应用程序使用，以及被添加到依赖图中。

> webpack 的其中一个强大的特性就是能通过 import 导入任何类型的模块（例如 .css 文件），其他打包程序或任务执行器的可能并不支持。我们认为这种语言扩展是很有必要的，因为这可以使开发人员创建出更准确的依赖关系图。

在更高层面，在 webpack 的配置中，loader 有两个属性：

（1）test 属性，识别出哪些文件会被转换。

（2）use 属性，定义出在进行转换时，应该使用哪个 loader。

- webpack.config.js

```js
const path = require('path');

module.exports = {
  output: {
    filename: 'my-first-webpack.bundle.js',
  },
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
};
```

以上配置中，对一个单独的 module 对象定义了 rules 属性，里面包含两个必须属性：test 和 use。

这告诉 webpack 编译器(compiler) 如下信息：

“嘿，webpack 编译器，当你碰到「在 require()/import 语句中被解析为 '.txt' 的路径」时，在你对它打包之前，先 use(使用) raw-loader 转换一下。”

# 插件(plugin)

loader 用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。

包括：打包优化，资源管理，注入环境变量。

想要使用一个插件，你只需要 require() 它，然后把它添加到 plugins 数组中。多数插件可以通过选项(option)自定义。

你也可以在一个配置文件中因为不同目的而多次使用同一个插件，这时需要通过使用 new 操作符来创建一个插件实例。

- webpack.config.js

```js
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 通过 npm 安装
const webpack = require('webpack'); // 用于访问内置插件

module.exports = {
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
};
```

在上面的示例中，html-webpack-plugin 为应用程序生成一个 HTML 文件，并自动将生成的所有 bundle 注入到此文件中。

# 模式(mode)

通过选择 development, production 或 none 之中的一个，来设置 mode 参数，你可以启用 webpack 内置在相应环境下的优化。

其默认值为 production。

```js
module.exports = {
  mode: 'production',
};
```

# 浏览器兼容性(browser compatibility)

webpack 支持所有符合 ES5 标准 的浏览器（不支持 IE8 及以下版本）。

webpack 的 import() 和 require.ensure() 需要 Promise。

如果你想要支持旧版本浏览器，在使用这些表达式之前，还需要 提前加载 polyfill。

# 环境(environment)

webpack 5 运行于 Node.js v10.13.0+ 的版本。

# 参考资料

https://webpack.docschina.org/concepts/

* any list
{:toc}