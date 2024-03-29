---
layout: post
title:  WebPack-18-搭建基本的前端开发环境
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

# 需求

我们日常使用的前端开发环境应该是怎样的？我们可以尝试着把基本前端开发环境的需求列一下：

- 构建我们发布需要的 HTML、CSS、JS 文件

- 使用 CSS 预处理器来编写样式

- 处理和压缩图片

- 使用 Babel 来支持 ES 新特性

- 本地提供静态服务以方便开发调试


上述几项应该可以满足比较简单的前端项目开发环境需求了，下面会一一介绍如何配置 webpack 来满足这些需求。

# 关联 HTML

webpack 默认从作为入口的 .js 文件进行构建（更多是基于 SPA 去考虑），但通常一个前端项目都是从一个页面（即 HTML）出发的，最简单的方法是，创建一个 HTML 文件，使用 script 标签直接引用构建好的 JS 文件，如：

```html
<script src="./dist/bundle.js"></script>
```

但是，如果我们的文件名或者路径会变化，例如使用 [hash] 来进行命名，那么最好是将 HTML 引用路径和我们的构建结果关联起来，这个时候我们可以使用 html-webpack-plugin。

html-webpack-plugin 是一个独立的 node package，所以在使用之前我们需要先安装它，把它安装到项目的开发依赖中：

```html
npm install html-webpack-plugin -D 

# 或者
yarn add html-webpack-plugin -D
```

然后在 webpack 配置中，将 html-webpack-plugin 添加到 plugins 列表中：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin(),
  ],
}
```

这样配置好之后，构建时 html-webpack-plugin 会为我们创建一个 HTML 文件，其中会引用构建出来的 JS 文件。

实际项目中，默认创建的 HTML 文件并没有什么用，我们需要自己来写 HTML 文件，可以通过 html-webpack-plugin 的配置，传递一个写好的 HTML 模板：

```js
module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html', // 配置输出文件名和路径
      template: 'assets/index.html', // 配置文件模板
    }),
  ],
}
```

这样，通过 html-webpack-plugin 就可以将我们的页面和构建 JS 关联起来，回归日常，从页面开始开发。

如果需要添加多个页面关联，那么实例化多个 html-webpack-plugin， 并将它们都放到 plugins 字段数组中就可以了。

更多配置这里就不展开讲解了，参考文档 html-webpack-plugin 以及官方提供的例子 html-webpack-plugin/examples。

# 构建 CSS

我们编写 CSS，并且希望使用 webpack 来进行构建，为此，需要在配置中引入 loader 来解析和处理 CSS 文件：

```js
module.exports = {
  module: {
    rules: [
      // ...
      {
        test: /\.css/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  }
}
```

style-loader 和 css-loader 都是单独的 node package，需要安装。

我们创建一个 index.css 文件，并在 index.js 中引用它，然后进行构建。

```js
import "./index.css"
```

可以发现，构建出来的文件并没有 CSS，先来看一下新增两个 loader 的作用：

css-loader 负责解析 CSS 代码，主要是为了处理 CSS 中的依赖，例如 @import 和 url() 等引用外部文件的声明；

style-loader 会将 css-loader 解析的结果转变成 JS 代码，运行时动态插入 style 标签来让 CSS 代码生效。

经由上述两个 loader 的处理后，CSS 代码会转变为 JS，和 index.js 一起打包了。如果需要单独把 CSS 文件分离出来，我们需要使用 extract-text-webpack-plugin 插件。

extract-text-webpack-plugin 这个插件在笔者写作时并未发布支持 webpack 4.x 的正式版本，所以安装的时候需要指定使用它的 alpha 版本：npm install extract-text-webpack-plugin@next -D 或者 yarn add extract-text-webpack-plugin@next -D。如果你用的是 webpack 3.x 版本，直接用 extract-text-webpack-plugin 现有的版本即可。

看一个简单的例子：

```js
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.css$/,
        // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
        use: ExtractTextPlugin.extract({ 
          fallback: 'style-loader',
          use: 'css-loader',
        }), 
      },
    ],
  },
  plugins: [
    // 引入插件，配置文件名，这里同样可以使用 [hash]
    new ExtractTextPlugin('index.css'),
  ],
}
```

# CSS 预处理器

在上述使用 CSS 的基础上，通常我们会使用 Less/Sass 等 CSS 预处理器，webpack 可以通过添加对应的 loader 来支持，以使用 Less 为例，我们可以在官方文档中找到对应的 loader。

我们需要在上面的 webpack 配置中，添加一个配置来支持解析后缀为 .less 的文件：

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.less$/,
        // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
        use: ExtractTextPlugin.extract({ 
          fallback: 'style-loader',
          use: [
            'css-loader', 
            'less-loader',
          ],
        }), 
      },
    ],
  },
  // ...
}
```

# 处理图片文件

在前端项目的样式中总会使用到图片，虽然我们已经提到 css-loader 会解析样式中用 url() 引用的文件路径，但是图片对应的 jpg/png/gif 等文件格式，webpack 处理不了。

是的，我们只要添加一个处理图片的 loader 配置就可以了，现有的 file-loader 就是个不错的选择。

file-loader 可以用于处理很多类型的文件，它的主要作用是直接输出文件，把构建后的文件路径返回。

配置很简单，在 rules中添加一个字段，增加图片类型文件的解析配置：

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
    ],
  },
}
```

更多关于 file-loader 的配置可以参考官方文档 file-loader。

# 使用 Babel

Babel 是一个让我们能够使用 ES 新特性的 JS 编译工具，我们可以在 webpack 中配置 Babel，以便使用 ES6、ES7 标准来编写 JS 代码。

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.jsx?/, // 支持 js 和 jsx
        include: [
          path.resolve(__dirname, 'src'), // src 目录下的才需要经过 babel-loader 处理
        ],
        loader: 'babel-loader',
      },
    ],
  },
}
```

Babel 的相关配置可以在目录下使用 .babelrc 文件来处理，详细参考 Babel 官方文档 .babelrc。

# 启动静态服务

至此，我们完成了处理多种文件类型的 webpack 配置。

我们可以使用 webpack-dev-server 在本地开启一个简单的静态服务来进行开发。

在项目下安装 webpack-dev-server，然后添加启动命令到 package.json 中：

```js
"scripts": {
  "build": "webpack --mode production",
  "start": "webpack-dev-server --mode development"
}
```

也可以全局安装 webpack-dev-server，但通常建议以项目开发依赖的方式进行安装，然后在 npm package 中添加启动脚本。

尝试着运行 npm run start 或者 yarn start，然后就可以访问 http://localhost:8080/ 来查看你的页面了。

默认是访问 index.html，如果是其他页面要注意访问的 URL 是否正确。

# 小结

我们现在已经可以使用 webpack 来完成日常中需要的基础前端构建需求：构建 HTML、CSS、JS 文件、使用 CSS 预处理器来编写样式、处理和压缩图片、使用 Babel、方便开发调试的静态服务，接下来的小节会在这个基础上，深入 webpack 配置细节，结合实际工作中的一些需要，更进一步地了解 webpack 的使用。

# 参考资料

https://www.kancloud.cn/sllyli/webpack/1242347

* any list
{:toc}