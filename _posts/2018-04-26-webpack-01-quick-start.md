---
layout: post
title:  WebPack-01-Quick Start
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

# WebPack

[Webpack](https://webpack.js.org/)  是一个用于现代 JavaScript 应用程序的 静态模块打包工具。

当 webpack 处理应用程序时，它会在内部从一个或多个入口点构建一个依赖图(dependency graph)，然后将你项目中所需的每一个模块组合成一个或多个 bundles，它们均为静态资源，用于展示你的内容。

## 教程

[webpack-4](https://wanago.io/2018/07/16/webpack-4-course-part-one-entry-output-and-es6-modules/)

[https://github.com/dabit3/beginning-webpack](https://github.com/dabit3/beginning-webpack)

# 入门例子

我们先说一个最基本的例子，后面会逐步优化。

## 安装 webpack

为了演示方便，这里全局安装。

```
npm install webpack -g
```

发现安装很慢，一直卡主，可以尝试调整 npm 为国内源。

```
npm config set registry https://registry.npm.taobao.org
```

## 最基本的构建

在你的根目录里创建两个文件 index.html app.js

- app.js

```js
document.write('welcome to my app');
console.log('app loaded')
```

- index.html

```html
<html> 
  <body> 
  <script src="bundle.js"></script> 
  </body>
</html>
```

## js 重命名

打开你的控制台，运行：

```
webpack ./app.js bundle.js
```

这个命令可以把你的 app.js 重新打包为 bundle.js。

你可能觉得这有什么用？

当你的 app.js 引用了其他的js 或者 css 时，webpack 就会将他们统统打包甚至压缩成一个文件。 

怎么样？是不是再也不用在html里写冗长的scrpit 标签了？

### cli 的安装

会提示你安装：

```
λ webpack ./app.js bundle.js
CLI for webpack must be installed.
  webpack-cli (https://github.com/webpack/webpack-cli)

We will use "npm" to install the CLI via "npm install -D webpack-cli".
Do you want to install 'webpack-cli' (yes/no): yes
Installing 'webpack-cli' (running 'npm install -D webpack-cli')...

added 121 packages in 9s
Error: Cannot find module 'webpack-cli/package.json'
Require stack:
- ....
```

安装报错，有点尴尬。

直接全局安装即可：

```
npm install webpack-cli -g
```

发现执行还是报错，我们还是使用配置的方式。

## 定义一个配置文件

Webpack 里的配置文件是一个基本的commonJs 模块。

这个配置文件包含了项目里所有的配置 ， loaders(稍后解释)， 以及其他项目相关信息

在你的根目录里创建 一个 webpack.config.js 文件 ，加上如下代码

- webpack.config.js

```js
module.exports = { 
  entry: "./app.js", 
  output: { filename: "bundle.js" }
}
```

entry-- 指向项目里最顶层的 一个文件 或者 一组文件，在这个项目里我们只用了 app.js

output-- 包括输出配置的一个对象。 在我们的项目中，我们只给filename 关键字 指定了 bundle.js, 即webpack 将会构建的输出文件

现在 打开命令行开始运行我们的app吧！

```
webpack
```

执行之后会在 dist 目录下看到 bundle.js 文件，内容如下：

```js
document.write("welcome to my app"),console.log("app loaded");
```

看的出来，这里是做了压缩。

# 快速开始

## 起步

webpack 用于编译 JavaScript 模块。

比如很多 ES6 的语法，但是浏览器是 ES5 的，就可以通过打包，让语法变成兼容 ES5 的。

一旦完成[安装](https://doc.webpack-china.org/guides/installation)，你就可以通过 webpack 的 [CLI](https://doc.webpack-china.org/api/cli)
或 [API](https://doc.webpack-china.org/api/node) 与其配合交互。

## 基本安装

-g 的方式是全局安装，这并不够优雅，因为并不是所有的项目都需要webpack的。

通常我们会将 Webpack 安装到项目的依赖中，这样就可以使用项目本地版本的 Webpack。

首先我们创建一个目录，初始化 npm，以及在本地安装 webpack：

```
mkdir webpack-demo && cd webpack-demo
npm init -y
npm install --save-dev webpack
```

### 指令差异

`--save` 和 `--save-dev` 下载标签

他们表面上的区别是–save 会把依赖包名称添加到 package.json 文件 dependencies 键下，–save-dev 则添加到 package.json 文件 devDependencies 键下.
dependencies是运行时依赖，devDependencies是开发时的依赖。

即devDependencies 下列出的模块，是我们开发时用的。

- 实际操作日志

webpack 本地安装时间可能较长，耐心等待...

```
$ mkdir webpack-demo && cd webpack-demo
houbinbindeMacBook-Pro:webpack-demo houbinbin$ pwd
/Users/houbinbin/it/learn/webpack/webpack-demo
houbinbindeMacBook-Pro:webpack-demo houbinbin$ npm init -y
npm install --save-dev webpackWrote to /Users/houbinbin/IT/learn/webpack/webpack-demo/package.json:

{
  "name": "webpack-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}


houbinbindeMacBook-Pro:webpack-demo houbinbin$ npm install --save-dev webpack
⸨░░░░░░░░░░░░░░░░░░⸩ ⠇ fetchMetadata: sill resolveWithNewModule webpack@4.6.0 checking installable status

> fsevents@1.2.0 install /Users/houbinbin/IT/learn/webpack/webpack-demo/node_modules/fsevents
> node install

[fsevents] Success: "/Users/houbinbin/IT/learn/webpack/webpack-demo/node_modules/fsevents/lib/binding/Release/node-v59-darwin-x64/fse.node" is installed via remote
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN webpack-demo@1.0.0 No description
npm WARN webpack-demo@1.0.0 No repository field.

+ webpack@4.6.0
added 424 packages in 242.797s
houbinbindeMacBook-Pro:webpack-demo houbinbin$ npm install --save-dev webpack
npm WARN webpack-demo@1.0.0 No description
npm WARN webpack-demo@1.0.0 No repository field.

+ webpack@4.6.0
updated 1 package in 29.785s
```

## 目录结构

```
├── node_modules
├── package-lock.json
├── package.json
├── index.html
└── src
    └── index.js
```

其中 `index.html`、`src/index.js` 为我们手动创建。其他为自动生成：

- index.html

```html
<!doctype html>
<html>
  <head>
    <title>Getting Started</title>
    <script src="https://unpkg.com/lodash@4.16.6"></script>
  </head>
  <body>
    <script src="./src/index.js"></script>
  </body>
</html>
```

- index.js

```js
function component() {
    var element = document.createElement('div');

    // Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
}

document.body.appendChild(component());
```

在此示例中，`<script>` 标签之间存在隐式依赖关系。`index.js` 文件执行之前，还依赖于页面中引入的 `lodash`。
之所以说是隐式的是因为 `index.js` 并未显式声明需要引入 `lodash`，只是假定推测已经存在一个全局变量 `_`。

使用这种方式去管理 JavaScript 项目会有一些问题：

- 无法立即体现，脚本的执行依赖于外部扩展库(external library)。

- 如果依赖不存在，或者引入顺序错误，应用程序将无法正常运行。

- 如果依赖被引入但是并没有使用，浏览器将被迫下载无用代码。

让我们使用 webpack 来管理这些脚本。

## 创建一个 bundle 文件

首先，我们稍微调整下目录结构，将“源”代码(/src)从我们的“分发”代码(/dist)中分离出来。
“源”代码是用于书写和编辑的代码。“分发”代码是构建过程产生的代码最小化和优化后的“输出”目录，最终将在浏览器中加载：

- 目录结构调整成为：

```
  webpack-demo
  |- package.json
+ |- /dist
+   |- index.html
- |- index.html
  |- /src
    |- index.js
```

### lodash 安装

- lodash 安装

要在 index.js 中打包 lodash 依赖，首先我们需要在本地安装 library。

```
$   npm install --save lodash
```

- 脚本中引入

**src/index.js** 内容调整为：

```js
+ import _ from 'lodash';
+
  function component() {
    var element = document.createElement('div');

-   // Lodash, currently included via a script, is required for this line to work
+   // Lodash, now imported by this script
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
  }

  document.body.appendChild(component());
```

- index.html 调整

现在，由于通过打包来合成脚本，我们必须更新 index.html 文件。
因为现在是通过 import 引入 lodash，所以将 lodash `<script>` 删除，然后修改另一个 `<script>` 标签来加载 bundle，而不是原始的 /src 文件：

```html
  <!doctype html>
  <html>
   <head>
     <title>Getting Started</title>
-    <script src="https://unpkg.com/lodash@4.16.6"></script>
   </head>
   <body>
-    <script src="./src/index.js"></script>
+    <script src="bundle.js"></script>
   </body>
  </html>
```

在这个设置中，index.js 显式要求引入的 lodash 必须存在，然后将它绑定为 _（没有全局作用域污染）。
通过声明模块所需的依赖，webpack 能够利用这些信息去构建依赖图，然后使用图生成一个优化过的，会以正确顺序执行的 bundle。

- 运行

可以这样说，执行 `npx webpack`，会将我们的脚本作为[入口起点](https://doc.webpack-china.org/concepts/entry-points)，
然后[输出](https://doc.webpack-china.org/concepts/output)为 bundle.js。

Node 8.2+ 版本提供的 npx 命令，可以运行在初始安装的 webpack 包(package)的 webpack 二进制文件（./node_modules/.bin/webpack）：

```
$   npx webpack src/index.js --output dist/bundle.js
```

日志如下：

```
houbinbindeMacBook-Pro:webpack-demo houbinbin$ npx webpack src/index.js --output dist/bundle.js
The CLI moved into a separate package: webpack-cli
Would you like to install webpack-cli? (That will run npm install -D webpack-cli) (yes/NO)yes
npm WARN deprecated nomnom@1.8.1: Package no longer supported. Contact support@npmjs.com for more info.
npm WARN deprecated babel-preset-es2015@6.24.1: 🙌  Thanks for using Babel: we recommend using babel-preset-env now: please read babeljs.io/env to update!
npm WARN webpack-demo@1.0.0 No description
npm WARN webpack-demo@1.0.0 No repository field.

+ webpack-cli@2.0.15
added 440 packages in 63.892s
Hash: 085fb40796350163fc71
Version: webpack 4.6.0
Time: 2932ms
Built at: 2018-04-23 22:34:17
    Asset      Size  Chunks             Chunk Names
bundle.js  69.9 KiB       0  [emitted]  main
Entrypoint main = bundle.js
[1] (webpack)/buildin/module.js 497 bytes {0} [built]
[2] (webpack)/buildin/global.js 489 bytes {0} [built]
[3] ./src/index.js 273 bytes {0} [built]
    + 1 hidden module

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/concepts/mode/
```

直接打开 **dist/index.html**，不出意外，你可以正常看到如下文本： "Hello webpack"

# 配置文件

大部分的项目都十分复杂。

这就是为什么 webpack 要支持[配置文件](https://doc.webpack-china.org/concepts/configuration)。
这比在终端(terminal)中输入大量命令要高效的多，所以让我们创建一个取代以上使用 CLI 选项方式的配置文件：

## 目录结构调整

```
  webpack-demo
  |- package.json
+ |- webpack.config.js
  |- /dist
    |- index.html
  |- /src
    |- index.js
```

## webpack.config.js

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

## 再次构建

```
$   npx webpack --config webpack.config.js
```

日志如下：

```
$ npx webpack --config webpack.config.js
Hash: 085fb40796350163fc71
Version: webpack 4.6.0Time: 320ms
Built at: 2018-04-23 22:42:12
    Asset      Size  Chunks             Chunk Names
bundle.js  69.9 KiB       0  [emitted]  main
Entrypoint main = bundle.js
[1] (webpack)/buildin/module.js 497 bytes {0} [built]
[2] (webpack)/buildin/global.js 489 bytes {0} [built]
[3] ./src/index.js 273 bytes {0} [built]
    + 1 hidden module

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production
' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/concepts/mode/
```

效果同上

# NPM 脚本(NPM Scripts)

考虑到用 CLI 这种方式来运行本地的 webpack 不是特别方便，我们可以设置一个快捷方式。

- 新增构建方式

在 `package.json` 添加一个 [npm 脚本](https://docs.npmjs.com/misc/scripts)：

```json
{
  ...
  "scripts": {
    "build": "webpack"
  },
  ...
}
```

全文件如下：

```json
{
  "name": "webpack-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^4.6.0",
    "webpack-cli": "^2.0.15"
  },
  "dependencies": {
    "lodash": "^4.17.5"
  }
}
```

- 执行

```
$   npm run build
```

日志如下：

```
> webpack-demo@1.0.0 build /Users/houbinbin/IT/learn/webpack/webpack-demo
> webpack

Hash: 085fb40796350163fc71
Version: webpack 4.6.0
Time: 329ms
Built at: 2018-04-23 22:46:49
    Asset      Size  Chunks             Chunk Names
bundle.js  69.9 KiB       0  [emitted]  main
Entrypoint main = bundle.js
[1] (webpack)/buildin/module.js 497 bytes {0} [built]
[2] (webpack)/buildin/global.js 489 bytes {0} [built]
[3] ./src/index.js 273 bytes {0} [built]
    + 1 hidden module

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/concepts/mode/
```

# 拓展阅读

和 vue-cli-service 的区别？

和 vite 对比？

# 其他

> [打包器对比](https://doc.webpack-china.org/comparison)

[【译】Webpack新手入门](https://www.jianshu.com/p/61fdbe909e11)

https://www.cnblogs.com/nickbai/articles/6249239.html

* any list
{:toc}