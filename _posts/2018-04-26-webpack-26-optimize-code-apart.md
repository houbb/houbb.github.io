---
layout: post
title:  WebPack-26-优化前端资源加载 2 - 分离代码文件
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

上一小节介绍了如何做图片加载相关的优化以及压缩代码，这一部分内容会稍微深入点，讲解如何利用浏览器的缓存以及在 webpack 中实现按需加载代码。

# 分离代码文件

关于分离 CSS 文件这个主题，之前在介绍如何搭建基本的前端开发环境时有提及，在 webpack 中使用 extract-text-webpack-plugin 插件即可。

先简单解释一下为何要把 CSS 文件分离出来，而不是直接一起打包在 JS 中。最主要的原因是我们希望更好地利用缓存。

假设我们原本页面的静态资源都打包成一个 JS 文件，加载页面时虽然只需要加载一个 JS 文件，但是我们的代码一旦改变了，用户访问新的页面时就需要重新加载一个新的 JS 文件。有些情况下，我们只是单独修改了样式，这样也要重新加载整个应用的 JS 文件，相当不划算。

还有一种情况是我们有多个页面，它们都可以共用一部分样式（这是很常见的，CSS Reset、基础组件样式等基本都是跨页面通用），如果每个页面都单独打包一个 JS 文件，那么每次访问页面都会重复加载原本可以共享的那些 CSS 代码。

如果分离开来，第二个页面就有了 CSS 文件的缓存，访问速度自然会加快。

虽然对第一个页面来说多了一个请求，但是对随后的页面来说，缓存带来的速度提升相对更加可观。

因此当我们考虑更好地利用缓存来加速静态资源访问时，会尝试把一些公共资源单独分离开来，利用缓存加速，以避免重复的加载。除了公共的 CSS 文件或者图片资源等，当我们的 JS 代码文件过大的时候，也可以用代码文件拆分的办法来进行优化。

那么，如何使用 webpack 来把代码中公共使用的部分分离成为独立的文件呢？

由于 webpack 4.x 和 webpack 3.x 在代码分离这一块的内容差别比较大，因而我们分别都介绍一下。

3.x 以前的版本是使用 CommonsChunkPlugin 来做代码分离的，而 webpack 4.x 则是把相关的功能包到了 optimize.splitChunks 中，直接使用该配置就可以实现代码分离。

我们先介绍在 webpack 4.x 中如何使用这个配置来实现代码分离。

# webpack 4.x 的 optimization

webpack 的作者推荐直接这样简单地配置：

```js
module.exports = {
  // ... webpack 配置

  optimization: {
    splitChunks: {
      chunks: "all", // 所有的 chunks 代码公共的部分分离出来成为一个单独的文件
    },
  },
}
```

我们需要在 HTML 中引用两个构建出来的 JS 文件，并且 commons.js 需要在入口代码之前。下面是个简单的例子：

```js
<script src="commons.js" charset="utf-8"></script>
<script src="entry.bundle.js" charset="utf-8"></script>
```

如果你使用了 html-webpack-plugin，那么对应需要的 JS 文件都会在 HTML 文件中正确引用，不用担心。如果没有使用，那么你需要从 stats 的 entrypoints 属性来获取入口应该引用哪些 JS 文件，可以参考 Node API 了解如何从 stats 中获取信息，或者开发一个 plugin 来处理正确引用 JS 文件这个问题。第 15 小节会介绍如何开发 webpack plugin，plugin 提供的 API 也可以正确获取到 stats 中的数据。

之前我们提到拆分文件是为了更好地利用缓存，分离公共类库很大程度上是为了让多页面利用缓存，从而减少下载的代码量，同时，也有代码变更时可以利用缓存减少下载代码量的好处。从这个角度出发，笔者建议将公共使用的第三方类库显式地配置为公共的部分，而不是 webpack 自己去判断处理。因为公共的第三方类库通常升级频率相对低一些，这样可以避免因公共 chunk 的频繁变更而导致缓存失效。

显式配置共享类库可以这么操作：

```js
module.exports = {
  entry: {
    vendor: ["react", "lodash", "angular", ...], // 指定公共使用的第三方类库
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: "initial",
          test: "vendor",
          name: "vendor", // 使用 vendor 入口作为公共部分
          enforce: true,
        },
      },
    },
  },
  // ... 其他配置
}

// 或者
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /react|angluar|lodash/, // 直接使用 test 来做路径匹配
          chunks: "initial",
          name: "vendor",
          enforce: true,
        },
      },
    },
  },
}

// 或者
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: "initial",
          test: path.resolve(__dirname, "node_modules") // 路径在 node_modules 目录下的都作为公共部分
          name: "vendor", // 使用 vendor 入口作为公共部分
          enforce: true,
        },
      },
    },
  },
}
```

上述第一种做法是显示指定哪些类库作为公共部分，第二种做法实现的功能差不多，只是利用了 test 来做模块路径的匹配，第三种做法是把所有在 node_modules 下的模块，即作为依赖安装的，都作为公共部分。你可以针对项目情况，选择最合适的做法。

# webpack 3.x 的 CommonsChunkPlugin

下面我们简单介绍一下在 webpack 3.x 中如何配置代码分离。webpack 3.x 以下的版本需要用到 webpack 自身提供的 CommonsChunkPlugin 插件。

我们先来看一个最简单的例子：

```js
module.exports = {
  // ...
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "commons", // 公共使用的 chunk 的名称
      filename: "commons.js", // 公共 chunk 的生成文件名
      minChunks: 3, // 公共的部分必须被 3 个 chunk 共享
    }),
  ],
}
```

chunk 在这里是构建的主干，可以简单理解为一个入口对应一个 chunk。

以上插件配置在构建后会生成一个 commons.js 文件，该文件就是代码中的公共部分。

上面的配置中 minChunks 字段为 3，该字段的意思是当一个模块被 3 个以上的 chunk 依赖时，这个模块就会被划分到 commons chunk 中去。单从这个配置的角度上讲，这种方式并没有 4.x 的 chunks: "all" 那么方便。

CommonsChunkPlugin 也是支持显式配置共享类库的：

```js
module.exports = {
  entry: {
    vendor: ['react', 'react-redux'], // 指定公共使用的第三方类库
    app: './src/entry',
    // ...
  },
  // ...
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor' // 使用 vendor 入口作为公共部分
      filename: "vendor.js", 
      minChunks: Infinity, // 这个配置会让 webpack 不再自动抽离公共模块
    }),
  ],
}
```

上述配置会生成一个名为 vendor.js 的共享代码文件，里面包含了 React 和 React-Redux 库的代码，可以提供给多个不同的入口代码使用。

这里的 minChunks 字段的配置，我们使用了 Infinity，可以理解为 webpack 不自动抽离公共模块。

如果这里和之前一样依旧设置为 3，那么被 3 个以上的 chunk 依赖的模块会和 React、React-Redux 一同打包进 vendor，这样就失去显式指定的意义了。

minChunks 其实还可以是一个函数，如：

```js
minChunks: (module, count) => {
  console.log(module, count);
  return true;
},
```

该函数在分析每一个依赖的时候会被调用，传入当前依赖模块的信息 module，以及已经被作为公共模块的数量 count，你可以在函数中针对每一个模块做更加精细化的控制。看一个简单的例子：

```js
minChunks: (module, count) => {
  return module.context && module.context.includes("node_modules"); 
  // node_modules 目录下的模块都作为公共部分，效果就如同 webpack 4.x 中的 test: path.resolve(__dirname, "node_modules")
},
```

更多使用 CommonsChunkPlugin 的配置参考官方文档 [commons-chunk-plugin](https://doc.webpack-china.org/plugins/commons-chunk-plugin/#-)。

而关于 webpack 4.x 的 splitChunks 配置，笔者写这一部分的时候官方文档还没有更新出来，上述配置预估可以满足大部分项目的需求，更加详细的内容还请等待官方文档更新后查阅。

# 小结

本小节是优化前端资源加载这个主题的第二部分，主要分别介绍了在 webpack 4.x 版本和 3.x 版本中，如何配置分离代码文件来更加高效地利用浏览器缓存。

webpack 两个版本关于分离代码这一块的使用差异比较大，笔者还是推荐使用 4.x 版本，因为它的配置相对来说要更加简单一些。

接下来第 11 小节会介绍优化前端资源加载的最后一个部分的内容。


# 参考资料

https://www.kancloud.cn/sllyli/webpack/1242352

* any list
{:toc}