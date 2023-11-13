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

# Q2-如何实现 vscode 插件

实现 Visual Studio Code (VSCode) 插件通常需要使用 TypeScript 或 JavaScript 编写，因为 VSCode 是使用这两种语言的。

以下是一个简单的步骤，帮助你入门 VSCode 插件的开发：

1. **安装 Node.js 和 npm：** 在开始之前，请确保你的计算机上安装了 Node.js 和 npm（Node 包管理器）。

你可以从 [Node.js 官方网站](https://nodejs.org/) 下载并安装。

2. **安装 Yeoman 和 VSCode 插件生成器：** Yeoman 是一个用于生成项目模板的工具。通过在命令行中运行以下命令，你可以安装 Yeoman 和 VSCode 插件生成器：

    ```bash
    npm install -g yo generator-code
    ```

3. **创建插件项目：** 在命令行中，使用以下命令生成一个新的插件项目：

    ```bash
    yo code
    ```

    在生成器提示你进行配置时，选择适当的选项。这将创建一个基本的插件项目结构。



构建：

```
D:\github>yo code

     _-----_     ╭──────────────────────────╮
    |       |    │   Welcome to the Visual  │
    |--(o)--|    │   Studio Code Extension  │
   `---------´   │        generator!        │
    ( _´U`_ )    ╰──────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

Unable to evaluate the latest vscode version: Error:  {
  responseText: 'Unable to connect to https://update.code.visualstudio.com/api/releases/stable. Error: read ECONNRESET',
  body: <Buffer >,
  status: 404,
  headers: {}
}
Falling back to: ^1.54.0
? What type of extension do you want to create? New Extension (TypeScript)
? What's the name of your extension? first-vscode
? What's the identifier of your extension? first-vscode
? What's the description of your extension? my first vscode
? Initialize a git repository? Yes
? Bundle the source code with webpack? Yes
? Which package manager to use? npm

Writing in D:\github\first-vscode...
   create first-vscode\.vscode\extensions.json
   create first-vscode\.vscode\launch.json
   create first-vscode\.vscode\settings.json
   create first-vscode\.vscode\tasks.json
   create first-vscode\package.json
   create first-vscode\tsconfig.json
   create first-vscode\.vscodeignore
   create first-vscode\webpack.config.js
   create first-vscode\vsc-extension-quickstart.md
   create first-vscode\.gitignore
   create first-vscode\README.md
   create first-vscode\CHANGELOG.md
   create first-vscode\src\extension.ts
   create first-vscode\src\test\runTest.ts
   create first-vscode\src\test\suite\extension.test.ts
   create first-vscode\src\test\suite\index.ts
   create first-vscode\.eslintrc.json
   Changes to package.json were detected.

Running npm install for you to install the required dependencies.
npm WARN config global `--global`, `--local` are deprecated. Use `--location=global` instead.

added 316 packages, and audited 317 packages in 2m

66 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

Your extension first-vscode has been created!

To start editing with Visual Studio Code, use the following commands:

     code first-vscode

Open vsc-extension-quickstart.md inside the new extension for further instructions
on how to modify, test and publish your extension.

To run the extension you need to install the recommended extension 'amodio.tsl-problem-matcher'.

For more information, also visit http://code.visualstudio.com and follow us @code.


? Do you want to open the new folder with Visual Studio Code? (Use arrow keys)
> Open with `code`
  Skip
```

## Q3-To run the extension you need to install the recommended extension 'amodio.tsl-problem-matcher'. 这个如何安装？

该提示表明你的插件项目依赖于 `amodio.tsl-problem-matcher` 扩展。

这个扩展用于在运行 TypeScript 构建时捕获和显示 TypeScript 编译器的错误和警告。

你可以通过以下步骤安装该推荐扩展：

1. 打开你的 Visual Studio Code。

2. 在侧边栏中选择 "Extensions"（或使用快捷键 `Ctrl + Shift + X`）。

3. 在搜索框中输入 `amodio.tsl-problem-matcher`。

4. 在搜索结果中找到 `TSL Problem Matcher` 扩展，并点击安装按钮。

5. 安装完成后，你可能需要重新启动 Visual Studio Code。

完成以上步骤后，你的插件应该能够正常运行，并使用 `TSL Problem Matcher` 扩展来捕获和显示 TypeScript 编译器的错误和警告信息。

这有助于更好地调试和查看你的 TypeScript 代码中的问题。


4. **编辑插件代码：** 打开生成的插件项目文件夹，并编辑 `src/extension.ts` 文件。这是你的插件的主要代码文件。

5. **调试插件：** 在 VSCode 中打开你的插件项目文件夹，并按 `F5` 键启动调试。这会打开一个新的 VSCode 实例，并加载你的插件。你可以在新的实例中测试和调试你的插件。

6. **发布插件：** 如果你满意插件的功能并想要分享它，可以发布到 [VSCode Marketplace](https://marketplace.visualstudio.com/)。在发布之前，请确保阅读并遵循 [官方文档](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) 中的发布指南。

这是一个简单的起步指南。对于更详细和复杂的插件开发，你可能需要查阅 [VSCode API 文档](https://code.visualstudio.com/api) 以获取更多信息。此外，你还可以在 [VSCode 插件示例库](https://github.com/microsoft/vscode-extension-samples) 中找到各种示例，了解不同类型的插件如何实现。



# 参考资料

chat

* any list
{:toc}