---
layout: post
title:  WebPack-07-configration 配置
date:  2018-04-23 21:59:43 +0800
categories: [WebPack]
tags: [js, webpack]
published: true
---

# 配置（Configuration）

你可能已经注意到，很少有 webpack 配置看起来完全相同。

这是因为 webpack 的配置文件是 JavaScript 文件，文件内导出了一个 webpack 配置的对象。 

webpack 会根据该配置定义的属性进行处理。

由于 webpack 遵循 CommonJS 模块规范，因此，你可以在配置中使用：

- 通过 require(...) 引入其他文件

- 通过 require(...) 使用 npm 下载的工具函数

- 使用 JavaScript 控制流表达式，例如 ?: 操作符

- 对 value 使用常量或变量赋值

- 编写并执行函数，生成部分配置

请在合适的场景，使用这些功能。

虽然技术上可行，但还是应避免如下操作：

- 当使用 webpack CLI 工具时，访问 CLI 参数（应编写自己的 CLI 工具替代，或者使用 --env）

- 导出不确定的结果（两次调用 webpack 应产生相同的输出文件）

- 编写超长的配置（应将配置文件拆分成多个）

此文档中得出最重要的结论是，webpack 的配置可以有许多不同的样式和风格。关键在于，为了易于维护和理解这些配置，需要在团队内部保证一致。

# 基本配置

- webpack.config.js

```js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './foo.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'foo.bundle.js',
  },
};
```

# 多个 target

除了可以将单个配置导出为 object，function 或 Promise 以外，还可以将其导出为多个配置。

查看：[导出多个配置](https://webpack.docschina.org/configuration/configuration-types/#exporting-multiple-configurations)

# 使用其它配置语言

webpack 支持由多种编程和数据语言编写的配置文件。

查看：[配置语言](https://webpack.docschina.org/configuration/configuration-languages/)

# 参考资料

https://webpack.docschina.org/concepts/plugins/

* any list
{:toc}