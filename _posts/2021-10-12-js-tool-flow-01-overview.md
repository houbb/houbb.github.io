---
layout: post
title: JavaScript 代码的静态类型检查器 Flow 使用入门介绍
date: 2021-10-12 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, tool, web, sh]
published: true
---

# Flow

[Flow](https://flow.org/en/docs/getting-started/) 是 JavaScript 代码的静态类型检查器。 

它做了很多工作来提高你的工作效率。 

让您的编码更快、更智能、更自信、规模更大。

Flow 通过静态类型注释检查您的代码是否有错误。 

这些类型允许你告诉 Flow 你希望你的代码如何工作，Flow 将确保它以这种方式工作。

## 类型检查

所谓类型检查，就是在编译期尽早发现（由类型错误引起的）bug，又不影响代码运行（不需要运行时动态检查类型），使编写js具有和编写Java等强类型语言相近的体验。

它可以：

1. 使得大型项目可维护

2. 增加代码的可读性

3. 通常会有更好的IDE支持

## 为什么会诞生

Flow这类解决方案的出现，是因为JavaScript是一种弱(动态)数据类型的语言，弱(动态)数据类型代表在代码中，变量或常量会自动依照赋值变更数据类型，而且类型种类也很少，这是直译式脚本语言的常见特性，但有可能是优点也是很大的缺点。

优点是容易学习与使用，缺点是像开发者经常会因为赋值或传值的类型错误，造成不如预期的结果。

并且，在一个较大的项目中就会发现这其实是一件挺糟糕的特性，因为和你协作的程序员往往不太清楚你所写的代码到底哪种类型才是正确的，一般都是用详尽的文字说明，来降低这个问题的发生，但JS语言本身无法有效阻止这些问题，而且编写文字说明这个本身就很耗时间，对于阅读者也一样。

# 快速开始

```js
// @flow
function square(n: number): number {
  return n * n;
}

square("2"); // Error!
```

因为 Flow 非常了解 JavaScript，所以它不需要很多这些类型。 

你应该只需要做最少量的工作来向 Flow 描述你的代码，它会推断其余的。 

很多时候，Flow 可以在没有任何类型的情况下理解您的代码。

```js
// @flow
function square(n) {
  return n * n; // Error!
}

square("2");
```

您还可以逐步采用 Flow 并随时轻松删除它，这样您就可以在任何代码库上试用 Flow，看看您喜欢它。

# 安装

## 安装编译器

首先，您需要设置一个编译器来去除 Flow 类型。 

您可以在 Babel 和 flow-remove-types 之间进行选择。

Babel 是一个支持 Flow 的 JavaScript 代码编译器。 

Babel 将获取您的 Flow 代码并去除任何类型注释。

首先使用 Yarn 或 npm 安装 @babel/core、@babel/cli 和 @babel/preset-flow。

```
npm install --save-dev @babel/core @babel/cli @babel/preset-flow
```

接下来，您需要在 “presets” 中使用“@babel/preset-flow”在项目的根目录下创建一个 .babelrc 文件。

```js
{
  "presets": ["@babel/preset-flow"]
}
```

如果然后将所有源文件放在 src 目录中，则可以通过运行将它们编译到另一个目录：

```
./node_modules/.bin/babel src/ -d lib/
```

您可以轻松地将其添加到您的 package.json 脚本中。

```json
{
  "name": "my-project",
  "main": "lib/index.js",
  "scripts": {
    "build": "babel src/ -d lib/",
    "prepublish": "npm run build"
  }
}
```

## 设置 flow

Flow 在按项目安装时使用显式版本控制而不是全局安装时效果最佳。

幸运的是，如果您已经熟悉 npm 或 yarn，那么这个过程应该非常熟悉！

在 flow-bin npm 包上添加 devDependency：

```
npm install --save-dev flow-bin
```

将 “flow” 脚本添加到您的 package.json：

```json
{
  "name": "my-flow-project",
  "version": "1.0.0",
  "devDependencies": {
    "flow-bin": "^0.161.1"
  },
  "scripts": {
    "flow": "flow"
  }
}
```

### 运行

```
npm run flow init
```

```
> my-flow-project@1.0.0 flow /Users/Projects/my-flow-project
> flow "init"
```

第一次使用 init 运行 flow 后，运行：

```
npm run flow
```

日志：

```
> my-flow-project@1.0.0 flow /Users/Projects/my-flow-project
> flow

No errors!
```

# 使用

安装 Flow 后，您将希望了解如何在最基本的级别使用 Flow。

对于大多数新的 Flow 项目，您将遵循以下一般模式：

- 使用 flow init 初始化您的项目。

- 使用 flow 启动 Flow 后台进程。

- 使用 // @flow 确定 Flow 将监视哪些文件。

- 为您的项目编写 Flow 代码。

- 检查您的代码是否存在类型错误。

## 初始化你的项目

为 Flow 准备一个项目只需要一个命令：

```
flow init
```

在项目的顶层运行此命令以创建一个名为 .flowconfig 的空文件。 

在最基本的层面上，.flowconfig 告诉 Flow 后台进程从哪里开始检查 Flow 代码是否有错误的根源。

就是这样。 您的项目现在已启用 Flow。

您的项目通常有一个空的 .flowconfig 文件。 但是，您可以通过可添加到 .flowconfig 的选项以多种方式配置和自定义 Flow。


## 运行 FLOW 后台进程

Flow 的核心好处是它能够快速检查代码是否有错误。 

一旦您为 Flow 启用了您的项目，您就可以开始允许 Flow 以极快的速度增量检查您的代码的过程。

```
flow status
```

此命令首先启动一个后台进程，该进程将检查所有 Flow 文件是否有错误。 

后台进程继续运行，监视对代码的更改并逐步检查这些更改是否有错误。

您还可以键入 flow 来实现相同的效果，因为 status 是流二进制文件的默认标志。

在任何给定时间只会运行一个后台进程，因此如果您多次运行 `flow status`，它将使用相同的进程。

要停止后台进程，请运行 `flow stop`。

## 为 FLOW 准备代码

Flow 后台进程监控所有 Flow 文件。 

但是，它如何知道哪些文件是 Flow 文件，因此应该检查哪些文件？ 

将以下内容放在 JavaScript 文件中的任何代码之前是进程用来回答该问题的标志。

```js
// @flow
```

此标志采用带有 `@flow` 注释的普通 JavaScript 注释的形式。 

Flow 后台进程收集所有带有此标志的文件，并使用所有这些文件中可用的类型信息来确保一致性和无错误编程。

您也可以使用 `/* @flow */` 形式作为标志。

对于你项目中没有这个标志的文件，Flow 后台进程会跳过并忽略代码（除非你调用 `flow check --all`，这超出了基本使用的范围）。

## 编写 FLOW 代码

现在所有设置和初始化都已完成，您可以编写实际的 Flow 代码了。 

对于您使用 `//@flow` 标记的每个文件，您现在可以使用 Flow 的全部功能及其类型检查。 

这是一个示例流文件：

```js
// @flow

function foo(x: ?number): string {
  if (x) {
    return x;
  }
  return "default string";
}
```

注意添加到函数参数的类型以及函数末尾的返回类型。 

您也许可以通过查看此代码看出返回类型中存在错误，因为该函数还可以返回 int。 

但是，您不需要目视检查代码，因为 Flow 后台进程可以在您检查代码时为您捕获此错误。

## 检查您的代码

Flow 的伟大之处在于您可以获得关于代码状态的近乎实时的反馈。

在您想要检查错误的任何时候，只需运行：

```
# equivalent to `flow status`
flow
```

第一次运行时，将生成 Flow 后台进程并检查您的所有 Flow 文件。 

然后，当您继续迭代您的项目时，后台进程将持续监控您的代码，这样当您再次运行 flow 时，更新的结果将几乎是即时的。

对于上面的代码，运行流程将产生：

```
test.js:5
  5:     return x;
                ^ number. This type is incompatible with the expected return type of
  3: function foo(x: ?number): string {
                               ^^^^^^ string
```

# 参考资料

https://www.kancloud.cn/sllyli/flow/1141888

* any list
{:toc}