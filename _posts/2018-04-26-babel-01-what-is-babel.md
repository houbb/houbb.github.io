---
layout: post
title:  Babel-01-什么是 babel？
date:  2018-07-06 11:15:29 +0800
categories: [Web]
tags: [web, babel, js]
published: true
---

# Babel 是什么？

## Babel 是一个 JavaScript 编译器

Babel 是一个工具链，主要用于将采用 ECMAScript 2015+ 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。

下面列出的是 Babel 能为你做的事情：

- 语法转换

- 通过 Polyfill 方式在目标环境中添加缺失的特性（通过第三方 polyfill 模块，例如 core-js，实现）

- 源码转换 (codemods)

```js
// Babel 输入： ES2015 箭头函数
[1, 2, 3].map((n) => n + 1);

// Babel 输出： ES5 语法实现的同等功能
[1, 2, 3].map(function(n) {
  return n + 1;
});
```

# ES2015 及更新版本

Babel 通过语法转换器来支持新版本的 JavaScript 语法。

这些 [插件](https://www.babeljs.cn/docs/plugins) 让你现在就能使用新的语法，无需等待浏览器的支持。

查看 使用指南 开始入门吧。

# JSX 与 React

Babel 能够转换 JSX 语法！查看 React preset 了解更多信息。

通过和 babel-sublime 一起使用还可以把语法高亮的功能提升到一个新的水平。

通过以下命令安装此 preset

```
npm install --save-dev @babel/preset-react
```

并将 @babel/preset-react 添加到你的 Babel 配置文件中。

```js
export default React.createClass({
  getInitialState() {
    return { num: this.getRandomNumber() };
  },

  getRandomNumber() {
    return Math.ceil(Math.random() * 6);
  },

  render() {
    return <div>
      Your dice roll:
      {this.state.num}
    </div>;
  }
});
```

# 类型注释 (Flow 和 TypeScript)

Babel 可以删除类型注释！

查看 Flow preset 或 TypeScript preset 了解如何使用。

务必牢记 Babel 不做类型检查，你仍然需要安装 Flow 或 TypeScript 来执行类型检查的工作。

通过以下命令安装 flow preset

```
npm install --save-dev @babel/preset-flow
```

```js
// @flow
function square(n: number): number {
  return n * n;
}
```

或通过以下命令安装 typescript preset

```
npm install --save-dev @babel/preset-typescript
```

```
function Greeter(greeting: string) {
    this.greeting = greeting;
}
```

# 插件化

Babel 构建在插件之上。使用现有的或者自己编写的插件可以组成一个转换管道。通过使用或创建一个 preset 即可轻松使用一组插件。 

利用 astexplorer.net 可以立即创建一个插件，或者使用 generator-babel-plugin 生成一个插件模板。

```js
// 一个插件就是一个函数
export default function ({types: t}) {
  return {
    visitor: {
      Identifier(path) {
        let name = path.node.name; // reverse the name: JavaScript -> tpircSavaJ
        path.node.name = name.split('').reverse().join('');
      }
    }
  };
}
```

# 可调试

由于 Babel 支持 Source map，因此你可以轻松调试编译后的代码。

# 符合规范

Babel 尽最大可能遵循 ECMAScript 标准。不过，Babel 还提供了特定的选项来对标准和性能做权衡。

# 代码紧凑

Babel 尽可能用最少的代码并且不依赖太大量的运行环境。

有些情况是很难达成的这一愿望的，因此 Babel 提供了 "loose" 选项，用以在特定的转换情况下在符合规范、文件大小和速度之间做折中。

# 参考资料

[Babel 中文教程](https://www.babeljs.cn/docs/index.html)

* any list
{:toc}