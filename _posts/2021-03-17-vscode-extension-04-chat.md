---
layout: post
title:  vscode extension 插件开发-04-chat
date:  2021-3-09 16:52:15 +0800
categories: [Web]
tags: [web, vscode, plugin, sh]
published: true
---

# Q1-vscode 插件如何编写？

编写 VSCode 插件需要使用 TypeScript 编程语言和 VSCode 插件 API。以下是编写 VSCode 插件的基本步骤：

1. 确保你已安装 Node.js 和 npm（Node.js 包管理器）。
2. 打开终端或命令提示符，创建一个新的空文件夹作为你的插件项目。
3. 在终端中导航到插件项目文件夹，并执行以下命令来初始化一个新的 npm 项目：

```
npm init -y
```

4. 安装  `vscode`  模块作为开发依赖项：

```
npm install vscode --save-dev
```

5. 创建一个新的 TypeScript 文件，例如  `extension.ts` ，并编写你的插件代码。
6. 在  `extension.ts`  中导入  `vscode`  模块并使用其提供的 API 来实现你的插件功能。
7. 在  `extension.ts`  中定义和导出一个函数，该函数将作为插件的激活函数。
8. 在  `extension.ts`  中使用  `vscode.extensions.registerCommand`  方法注册你的插件命令。
9. 在  `package.json`  文件中的  `scripts`  部分添加一个  `vscode:prepublish`  脚本，用于编译 TypeScript 代码到 JavaScript。

```js
"scripts": {
       "vscode:prepublish": "tsc -p ./",
       ...
   }
```

10. 使用以下命令将你的插件发布到 VSCode Marketplace：

```
npx vsce publish
```

这只是一个简单的概述，你可以查阅 VSCode 官方文档以获取更详细的指南和示例代码。祝你编写出优秀的 VSCode 插件！

# 参考资料

chat

* any list
{:toc}