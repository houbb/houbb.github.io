---
layout: post
title:  Eslint JS 语法报告
date:  2018-07-06 14:04:56 +0800
categories: [Web]
tags: [web, js, qa, style-check, lint]
published: true
---

# Eslint

[Eslint](https://eslint.org/) is the pluggable linting utility for JavaScript and JSX.

# 开始使用ESLint

ESLint是一个用于识别和报告ECMAScript/JavaScript代码中的模式的工具，其目标是使代码更加一致并避免错误。
在许多方面，它类似于JSLint和JSHint，但有几个例外:

- ESLint使用Espree进行JavaScript解析。

- ESLint使用AST来评估代码中的模式。

- ESLint是完全可插拔的，每个规则都是一个插件，您可以在运行时添加更多。

## 本地安装

如果您想将ESLint作为项目构建系统的一部分，我们建议您在本地安装它。

- 本地安装

你可以使用npm:

```
$ npm install eslint --save-dev
```

- 设置配置文件

```
$ ./node_modules/.bin/eslint --init
```

- 运行

```
$ ./node_modules/.bin/eslint yourfile.js
```

您所使用的任何插件或可共享的configs也必须安装在本地，以使用本地安装的ESLint。

## 全局安装

如果您想让ESLint可以用于贯穿您所有项目的工具，我们建议在全局安装ESLint。

- 安装

你可以使用npm:

```
$ npm install -g eslint
```

- 设置配置文件

```
$ eslint --init
```

- 测试

```
$ eslint yourfile.js
```

您使用的任何插件或可共享配置都必须在全球安装才能使用全球安装的ESLint。

> 注意

`eslint——init` 用于在每个项目的基础上设置和配置eslint，并将在运行eslint的目录中执行eslint及其插件的本地安装。
如果您喜欢使用ESLint的全局安装，那么您的配置中使用的任何插件也必须是全局安装的。

# 配置

在执行 `eslint——init` 你可以看到 `.eslintrc` 配置。

你可以看到以下规则如下：

```js
{
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["error", "double"]
    }
}
```

“semi”和“quotes”是ESLint中规则的名称。
第一个值是规则的错误级别，可以是以下值之一:

- “off”或0 -关闭规则

- “warn”或1——将规则作为警告打开(不影响退出代码)

- “error”或2——将规则作为错误打开(退出代码为1)

这三个错误级别允许您细粒度地控制ESLint如何应用规则(更多配置选项和细节，请参见配置文档)。

您的 `.eslintrc` 配置文件还将包括以下内容:

```js
"extends": "eslint:recommended"
```

由于这一行，规则页面上标有 `√` 的所有[规则](https://eslint.org/docs/rules/)都将被打开。
或者，您可以使用其他人通过在 [npmjs.com](https://www.npmjs.com/search?q=eslint-config) 上搜索 `eslin -config` 创建的配置。
除非从共享配置扩展，或者在配置中显式地打开规则，否则ESLint不会连接您的代码。

* any list
{:toc}