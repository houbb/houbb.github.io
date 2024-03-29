---
layout: post
title:  WebPack-23-env differ 开发和生产环境的构建配置差异
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

# 开发和生产环境的构建配置差异

我们在日常的前端开发工作中，一般都会有两套构建环境：一套开发时使用，构建结果用于本地开发调试，不进行代码压缩，打印 debug 信息，包含 sourcemap 文件；另外一套构建后的结果是直接应用于线上的，即代码都是压缩后，运行时不打印 debug 信息，静态文件不包括 sourcemap 的。有的时候可能还需要多一套测试环境，在运行时直接进行请求 mock 等工作。

webpack 4.x 版本引入了 mode 的概念，在运行 webpack 时需要指定使用 production 或 development 两个 mode 其中一个，这个功能也就是我们所需要的运行两套构建环境的能力。

当你指定使用 production mode 时，默认会启用各种性能优化的功能，包括构建结果优化以及 webpack 运行性能优化，而如果是 development mode 的话，则会开启 debug 工具，运行时打印详细的错误信息，以及更加快速的增量编译构建。关于这两个 mode 的更详细区别，可以查阅 webpack 作者的这篇文章：webpack 4: mode and optimization。

虽然 webpack 的 mode 参数已经给我们带来了一些很方便的环境差异化配置，但是针对一些项目情况，例如使用 css-loader 或者 url-loader 等，不同环境传入 loader 的配置也不一样，而 mode 并没有帮助我们做这些事情，因此有些配置还是需要手动区分环境后来进行调整。

# 在配置文件中区分 mode

之前我们的配置文件都是直接对外暴露一个 JS 对象，这种方式暂时没有办法获取到 webpack 的 mode 参数，我们需要更换一种方式来处理配置。

根据官方的文档多种配置类型，配置文件可以对外暴露一个函数，因此我们可以这样做：

```js
module.exports = (env, argv) => ({
  // ... 其他配置
  optimization: {
    minimize: false,
    // 使用 argv 来获取 mode 参数的值
    minimizer: argv.mode === 'production' ? [
      new UglifyJsPlugin({ /* 你自己的配置 */ }), 
      // 仅在我们要自定义压缩配置时才需要这么做
      // mode 为 production 时 webpack 会默认使用压缩 JS 的 plugin
    ] : [],
  },
})
```

这样获取 mode 之后，我们就能够区分不同的构建环境，然后根据不同环境再对特殊的 loader 或 plugin 做额外的配置就可以了。

以上是 webpack 4.x 的做法，由于有了 mode 参数，区分环境变得简单了。不过在当前业界，估计还是使用 webpack 3.x 版本的居多，所以这里也简单介绍一下 3.x 如何区分环境。

webpack 的运行时环境是 Node.js，我们可以通过 Node.js 提供的机制给要运行的 webpack 程序传递环境变量，来控制不同环境下的构建行为。

例如，我们在 npm 中的 scripts 字段添加一个用于生产环境的构建命令：

```js
{
  "scripts": {
    "build": "NODE_ENV=production webpack",
    "develop": "NODE_ENV=development webpack-dev-server"
  }
}
```

然后在 webpack.config.js 文件中可以通过 `process.env.NODE_ENV` 来获取命令传入的环境变量：

```js
const config = {
  // ... webpack 配置
}

if (process.env.NODE_ENV === 'production') {
  // 生产环境需要做的事情，如使用代码压缩插件等
  config.plugins.push(new UglifyJsPlugin())
}

module.exports = config
```

# 运行时的环境变量

我们使用 webpack 时传递的 mode 参数，是可以在我们的应用代码运行时，通过 process.env.NODE_ENV 这个变量获取的。

这样方便我们在运行时判断当前执行的构建环境，使用最多的场景莫过于控制是否打印 debug 信息。

下面这个简单的例子，在应用开发的代码中实现一个简单的 console 打印封装：

```js
export default function log(...args) {
  if (process.env.NODE_ENV === 'development' && console && console.log) {
    console.log.apply(console, args)
  }
}
```

同样，以上是 webpack 4.x 的做法，下面简单介绍一下 3.x 版本应该如何实现。

这里需要用到 DefinePlugin 插件，它可以帮助我们在构建时给运行时定义变量，那么我们只要在前面 webpack 3.x 版本区分构建环境的例子的基础上，再使用 DefinePlugin 添加环境变量即可影响到运行时的代码。

在 webpack 的配置中添加 DefinePlugin 插件：

```js
module.exports = {
  // ...
  // webpack 的配置

  plugins: [
    new webpack.DefinePlugin({
      // webpack 3.x 的 process.env.NODE_ENV 是通过手动在命令行中指定 NODE_ENV=... 的方式来传递的
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
}
```

# 常见的环境差异配置

前面提及的使用环境变量的方式可以让我们在不同的构建环境中完成不同的构建需求，这里列举一下常见的 webpack 构建差异配置：

- 生产环境可能需要分离 CSS 成单独的文件，以便多个页面共享同一个 CSS 文件

- 生产环境需要压缩 HTML/CSS/JS 代码

- 生产环境需要压缩图片

- 开发环境需要生成 sourcemap 文件

- 开发环境需要打印 debug 信息

- 开发环境需要 live reload 或者 hot reload 的功能


以上是常见的构建环境需求差异，可能更加复杂的项目中会有更多的构建需求（如划分静态域名等），但是我们都可以通过判断环境变量来实现这些有环境差异的构建需求。

webpack 4.x 的 mode 已经提供了上述差异配置的大部分功能，mode 为 production 时默认使用 JS 代码压缩，而 mode 为 development 时默认启用 hot reload，等等。这样让我们的配置更为简洁，我们只需要针对特别使用的 loader 和 plugin 做区分配置就可以了。

webpack 3.x 版本还是只能自己动手修改配置来满足大部分环境差异需求，所以如果你要开始一个新的项目，建议直接使用 webpack 4.x 版本。

# 拆分配置

前面我们列出了几个环境差异配置，可能这些构建需求就已经有点多了，会让整个 webpack 的配置变得复杂，尤其是有着大量环境变量判断的配置。

我们可以把 webpack 的配置按照不同的环境拆分成多个文件，运行时直接根据环境变量加载对应的配置即可。基本的划分如下：

- webpack.base.js：基础部分，即多个文件中共享的配置

- webpack.development.js：开发环境使用的配置

- webpack.production.js：生产环境使用的配置

- webpack.test.js：测试环境使用的配置

一些复杂的项目可能会有更多配置。这里介绍一下如何处理这样的配置拆分。

首先我们要明白，对于 webpack 的配置，其实是对外暴露一个 JS 对象，所以对于这个对象，我们都可以用 JS 代码来修改它，例如：

```js
const config = {
  // ... webpack 配置
}

// 我们可以修改这个 config 来调整配置，例如添加一个新的插件
config.plugins.push(new YourPlugin());

module.exports = config;
```

当然，如果是对外暴露一个 JS 函数的话，像本小节第一个例子那样，那么修改配置就更加容易了，这里不再举例说明。

因此，只要有一个工具能比较智能地合并多个配置对象，我们就可以很轻松地拆分 webpack 配置，然后通过判断环境变量，使用工具将对应环境的多个配置对象整合后提供给 webpack 使用。

这个工具就是 [webpack-merge](https://github.com/survivejs/webpack-merge)。

我们的 webpack 配置基础部分，即 webpack.base.js 应该大致是这样的：


```js
module.exports = {
  entry: '...',
  output: {
    // ...
  },
  resolve: {
    // ...
  },
  module: {
    // 这里是一个简单的例子，后面介绍 API 时会用到
    rules: [
      {
        test: /\.js$/, 
        use: ['babel'],
      },
    ],
    // ...
  },
  plugins: [
    // ...
  ],
}
```

然后 webpack.development.js 需要添加 loader 或 plugin，就可以使用 webpack-merge 的 API，例如：

```js
const { smart } = require('webpack-merge')
const webpack = require('webpack')
const base = require('./webpack.base.js')

module.exports = smart(base, {
  module: {
    rules: [
      // 用 smart API，当这里的匹配规则相同且 use 值都是数组时，smart 会识别后处理
      // 和上述 base 配置合并后，这里会是 { test: /\.js$/, use: ['babel', 'coffee'] }
      // 如果这里 use 的值用的是字符串或者对象的话，那么会替换掉原本的规则 use 的值
      {
        test: /\.js$/,
        use: ['coffee'],
      },
      // ...
    ],
  },
  plugins: [
    // plugins 这里的数组会和 base 中的 plugins 数组进行合并
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
})
```

可见 webpack-merge 提供的 smart 方法，可以帮助我们更加轻松地处理 loader 配置的合并。

webpack-merge 还有其他 API 可以用于自定义合并行为，这里就不详细介绍了，需要深入了解的同学可以查阅官方文档 webpack-merge。

# 小结

本小节介绍了 webpack 4.x 和 3.x 如何在配置文件中区分环境来应用不同的配置选项（4.x 使用 mode 参数，3.x 使用 Node.js 的 process.env.NODE_ENV），如何在应用代码运行时携带当前构建环境的相关信息，以及如何利用 webpack-merge 这个工具来更好地维护不同构建环境中对应的构建需求配置。

# 参考资料

https://www.kancloud.cn/sllyli/webpack/1242352

* any list
{:toc}