---
layout: post
title:  WebPack-20-配置 loader
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

# loader

在第 1 小节，我们提到过，webpack 的 loader 用于处理不同的文件类型，在日常的项目中使用 loader 时，可能会遇到比较复杂的情况，本小节我们来深入探讨 loader 的一些配置细节。

# loader 匹配规则

当我们需要配置 loader 时，都是在 module.rules 中添加新的配置项，在该字段中，每一项被视为一条匹配使用 loader 的规则。

先来看一个基础的例子：

```js
module.exports = {
  // ...
  module: {
    rules: [ 
      {
        test: /\.jsx?/, // 条件
        include: [ 
          path.resolve(__dirname, 'src'),
        ], // 条件
        use: 'babel-loader', // 规则应用结果
      }, // 一个 object 即一条规则
      // ...
    ],
  },
}
```

loader 的匹配规则中有两个最关键的因素：一个是匹配条件，一个是匹配规则后的应用。

匹配条件通常都使用请求资源文件的绝对路径来进行匹配，在官方文档中称为 resource，除此之外还有比较少用到的 issuer，则是声明依赖请求的源文件的绝对路径。

举个例子：在 /path/to/app.js 中声明引入 import './src/style.scss'，resource 是 /path/to/src/style.scss，issuer 是 /path/to/app.js，规则条件会对这两个值来尝试匹配。

上述代码中的 test 和 include 都用于匹配 resource 路径，是 resource.test 和 resource.include 的简写，你也可以这么配置：

```js
module.exports = {
  // ...
  rules: [ 
      {
        resource: { // resource 的匹配条件
          test: /\.jsx?/, 
          include: [ 
            path.resolve(__dirname, 'src'),
          ],
        },
        // 如果要使用 issuer 匹配，便是 issuer: { test: ... }
        use: 'babel-loader',
      },
      // ...
    ], 
}
```

> issuer 规则匹配的场景比较少见，你可以用它来尝试约束某些类型的文件中只能引用某些类型的文件。

当规则的条件匹配时，便会使用对应的 loader 配置，如上述例子中的 babel-loader。

关于 loader 配置后面再详细介绍，这里先来看看如何配置更加复杂的规则匹配条件。

# 规则条件配置

大多数情况下，配置 loader 的匹配条件时，只要使用 test 字段就好了，很多时候都只需要匹配文件后缀名来决定使用什么 loader，但也不排除在某些特殊场景下，我们需要配置比较复杂的匹配条件。

webpack 的规则提供了多种配置形式：

```
{ test: ... } 匹配特定条件
{ include: ... } 匹配特定路径
{ exclude: ... } 排除特定路径
{ and: [...] }必须匹配数组中所有条件
{ or: [...] } 匹配数组中任意一个条件
{ not: [...] } 排除匹配数组中所有条件
```

上述的所谓条件的值可以是：

字符串：必须以提供的字符串开始，所以是字符串的话，这里我们需要提供绝对路径

正则表达式：调用正则的 test 方法来判断匹配

函数：(path) => boolean，返回 true 表示匹配

数组：至少包含一个条件的数组

对象：匹配所有属性值的条件

通过例子来帮助理解：

```js
rules: [
  {
    test: /\.jsx?/, // 正则
    include: [
      path.resolve(__dirname, 'src'), // 字符串，注意是绝对路径
    ], // 数组
    // ...
  },
  {
    test: {
      js: /\.js/,
      jsx: /\.jsx/,
    }, // 对象，不建议使用
    not: [
      (value) => { /* ... */ return true; }, // 函数，通常需要高度自定义时才会使用
    ],
  },
],
```

上述多个配置形式结合起来就能够基本满足各种各样的构建场景了，通常我们会结合使用 test/and 和 include&exclude 来配置条件，如上述那个简单的例子。


# module type

webpack 4.x 版本强化了 module type，即模块类型的概念，不同的模块类型类似于配置了不同的 loader，webpack 会有针对性地进行处理，现阶段实现了以下 5 种模块类型。

javascript/auto：即 webpack 3 默认的类型，支持现有的各种 JS 代码模块类型 —— CommonJS、AMD、ESM

javascript/esm：ECMAScript modules，其他模块系统，例如 CommonJS 或者 AMD 等不支持，是 .mjs 文件的默认类型

javascript/dynamic：CommonJS 和 AMD，排除 ESM

javascript/json：JSON 格式数据，require 或者 import 都可以引入，是 .json 文件的默认类型

webassembly/experimental：WebAssembly modules，当前还处于试验阶段，是 .wasm 文件的默认类型

如果不希望使用默认的类型的话，在确定好匹配规则条件时，我们可以使用 type 字段来指定模块类型，例如把所有的 JS 代码文件都设置为强制使用 ESM 类型：

```js
{
  test: /\.js/,
  include: [
    path.resolve(__dirname, 'src'),
  ],
  type: 'javascript/esm', // 这里指定模块类型
},
```

上述做法是可以帮助你规范整个项目的模块系统，但是如果遗留太多不同类型的模块代码时，建议还是直接使用默认的 javascript/auto。

webpack 后续的开发计划会增加对更多模块类型的支持，例如极其常见的 CSS 和 HTML 模块类型，这个特性值得我们期待一下。

# 使用 loader 配置

当然，在当前版本的 webpack 中，module.rules 的匹配规则最重要的还是用于配置 loader，我们可以使用 use 字段：

```js
rules: [
  {
    test: /\.less/,
    use: [
      'style-loader', // 直接使用字符串表示 loader
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1
        },
      }, // 用对象表示 loader，可以传递 loader 配置等
      {
        loader: 'less-loader',
        options: {
          noIeCompat: true
        }, // 传递 loader 配置
      },
    ],
  },
],
```

我们看下上述的例子，先忽略 loader 的使用情况，单纯看看如何配置。

use 字段可以是一个数组，也可以是一个字符串或者表示 loader 的对象。

如果只需要一个 loader，也可以这样：`use: { loader: 'babel-loader', options: { ... } }`。

我们还可以使用 options 给对应的 loader 传递一些配置项，这里不再展开。

当你使用一些 loader 时，loader 的说明一般都有相关配置的描述。

# loader 应用顺序

前面提到，一个匹配规则中可以配置使用多个 loader，即一个模块文件可以经过多个 loader 的转换处理，执行顺序是从最后配置的 loader 开始，一步步往前。

例如，对于上面的 less 规则配置，一个 style.less 文件会途径 less-loader、css-loader、style-loader 处理，成为一个可以打包的模块。

loader 的应用顺序在配置多个 loader 一起工作时很重要，通常会使用在 CSS 配置上，除了 style-loader 和 css-loader，你可能还要配置 less-loader 然后再加个 postcss 的 autoprefixer 等。

上述从后到前的顺序是在同一个 rule 中进行的，那如果多个 rule 匹配了同一个模块文件，loader 的应用顺序又是怎样的呢？

看一份这样的配置：

```js
rules: [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "eslint-loader",
  },
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "babel-loader",
  },
],
```

这样无法法保证 eslint-loader 在 babel-loader 应用前执行。

webpack 在 rules 中提供了一个 enforce 的字段来配置当前 rule 的 loader 类型，没配置的话是普通类型，我们可以配置 pre 或 post，分别对应前置类型或后置类型的 loader。

eslint-loader 要检查的是人工编写的代码，如果在 babel-loader 之后使用，那么检查的是 Babel 转换后的代码，所以必须在 babel-loader 处理之前使用。

还有一种行内 loader，即我们在应用代码中引用依赖时直接声明使用的 loader，如 const json = require('json-loader!./file.json') 这种。不建议在应用开发中使用这种 loader，后续我们还会再提到。

顾名思义，所有的 loader 按照前置 -> 行内 -> 普通 -> 后置的顺序执行。所以当我们要确保 eslint-loader 在 babel-loader 之前执行时，可以如下添加 enforce 配置：

```js
rules: [
  {
    enforce: 'pre', // 指定为前置类型
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "eslint-loader",
  },
]
```

当项目文件类型和应用的 loader 不是特别复杂的时候，通常建议把要应用的同一类型 loader 都写在同一个匹配规则中，这样更好维护和控制。

# 使用 noParse

在 webpack 中，我们需要使用的 loader 是在 module.rules 下配置的，webpack 配置中的 module 用于控制如何处理项目中不同类型的模块。

除了 module.rules 字段用于配置 loader 之外，还有一个 module.noParse 字段，可以用于配置哪些模块文件的内容不需要进行解析。

对于一些不需要解析依赖（即无依赖） 的第三方大型类库等，可以通过这个字段来配置，以提高整体的构建速度。

使用 noParse 进行忽略的模块文件中不能使用 import、require、define 等导入机制。

```js
module.exports = {
  // ...
  module: {
    noParse: /jquery|lodash/, // 正则表达式

    // 或者使用 function
    noParse(content) {
      return /jquery|lodash/.test(content)
    },
  }
}
```

noParse 从某种程度上说是个优化配置项，日常也可以不去使用。

# 小结

webpack 的 loader 相关配置都在 module.rules 字段下，我们需要通过 test、include、exclude 等配置好应用 loader 的条件规则，然后使用 use 来指定需要用到的 loader，配置应用的 loader 时还需要注意一下 loader 的执行顺序。

除此之外，webpack 4.x 版本新增了模块类型的概念，相当于 webpack 内置一个更加底层的文件类型处理，暂时只有 JS 相关的支持，后续会再添加 HTML 和 CSS 等类型。

# 参考资料

https://www.kancloud.cn/sllyli/webpack/1242349

* any list
{:toc}