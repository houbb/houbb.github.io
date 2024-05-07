---
layout: post
title:  Babel-03-配置
date:  2018-07-06 11:15:29 +0800
categories: [Web]
tags: [web, babel, js]
published: true
---

# 配置 Babel

Babel 也由配置文件！

许多其他工具都有类似的配置文件：ESLint (.eslintrc)、Prettier (.prettierrc)。

所有 Babel API 参数 都可以被配置。然而，如果该参数需要用到 JavaScript 代码，你可能需要使用 JavaScript 代码版的 配置文件。

# 你的使用场景是什么？

你是否采用的是单一仓库（monorepo）模式？

你是否需要编译 node_modules？

那么 babel.config.json 文件可以满足你的的需求！

你的配置文件是否仅适用于项目的某个部分？

那么 .babelrc.json 文件适合你！

Guy Fieri is your hero?

我们建议使用 babel.config.json 格式的配置文件。 Babel 自身使用的就是这种。

## babel.config.json

在项目的根目录（package.json 文件所在的目录）下创建一个名为 babel.config.json 的文件，并输入如下内容。

```js
{
  "presets": [...],
  "plugins": [...]
}
```

```js
module.exports = function (api) {
  api.cache(true);

  const presets = [ ... ];
  const plugins = [ ... ];

  return {
    presets,
    plugins
  };
}
```

## .babelrc.json

在你的项目中创建名为 .babelrc.json 的文件，并输入以下内容。

```js
{
  "presets": [...],
  "plugins": [...]
}
```

## package.json

或者，还可以选择将 .babelrc.json 中的配置信息作为 babel 键（key）的值添加到 package.json 文件中，如下所示：

```js
{
  "name": "my-package",
  "version": "1.0.0",
  "babel": {
    "presets": [ ... ],
    "plugins": [ ... ],
  }
}
```

## 用 JavaScript 编写配置文件

你还可以用 JavaScript 编写 babel.config.json 和 .babelrc.json文件：

```js
const presets = [ ... ];
const plugins = [ ... ];

module.exports = { presets, plugins };
```

你还可以调用 Node.js 的任何 API，例如基于进程环境进行动态配置：

```js
const presets = [ ... ];
const plugins = [ ... ];

if (process.env["ENV"] === "prod") {
  plugins.push(...);
}

module.exports = { presets, plugins };
```

# 使用 CLI (@babel/cli)

```
babel --plugins @babel/plugin-transform-arrow-functions script.js
```

请参阅 babel-cli 文档 以了解更多关于配置参数的信息。

# 使用 API (@babel/core)

```js
require("@babel/core").transformSync("code", {
  plugins: ["@babel/plugin-transform-arrow-functions"]
});
```


# 参考资料

https://www.babeljs.cn/docs/configuration

* any list
{:toc}