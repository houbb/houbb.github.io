---
layout: post
title:  Electron-02-我的第一个应用
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, electron, sh]
published: true
---

# 快速入门

本指南将会通过使用Electron创建一个极简的 Hello World 应用一步步的带你了解，该应用与electron/electron-quick-start类似。

通过这个教程，你的app将会打开一个浏览器窗口，来展示包含当前正在运行的 Chromium, Node.js, and Electronweb等版本信息的web界面

# 前提条件

在使用Electron进行开发之前，您需要安装 Node.js。 我们建议您使用最新的LTS版本。

请使用为你平台预构建的 Node.js 安装器来进行安装， 否则，您可能会遇到与不同开发工具不兼容的问题。

要检查 Node.js 是否正确安装，请在您的终端输入以下命令：

```
node -v
v12.16.2

npm -v
6.14.4
```

这两个命令应输出了 Node.js 和 npm 的版本信息。

注意：因为 Electron 将 Node.js 嵌入到其二进制文件中，你应用运行时的 Node.js 版本与你系统中运行的 Node.js 版本无关。

# 创建你的应用程序

## 使用脚手架创建

Electron 应用程序遵循与其他 Node.js 项目相同的结构。 首先创建一个文件夹并初始化 npm 包。

```
mkdir my-electron-app && cd my-electron-app
npm init
```

init初始化命令会提示您在项目初始化配置中设置一些值。

为本教程的目的，有几条规则需要遵循：

（1）entry point 应为 main.js.

（2）author 与 description 可为任意值，但对于应用打包是必填项。

你的 package.json 文件应该像这样：

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js",
  "author": "Jane Doe",
  "license": "MIT"
}
```

ps: npm init 命令就是为了生成上面的 package.json 文件，我们直接复制修改即可。

## 添加依赖

然后，将 electron 包安装到应用的开发依赖中。

```
$ npm install --save-dev electron
```

这个时候我们的 package.json 会变成：

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js",
  "author": "Jane Doe",
  "license": "MIT",
  "devDependencies": {
    "electron": "^13.1.4"
  }
}
```

## 执行命令

最后，您希望能够执行 Electron 如下所示，在您的 package.json配置文件中的scripts字段下增加一条start命令：

```json
{
  "scripts": {
    "start": "electron ."
  }
}
```

start命令能让您在开发模式下打开您的应用

```
npm start
```

注意：此脚本将告诉 Electron 在您项目根目录运行此时，您的应用将立即抛出一个错误提示您它无法找到要运行的应用。

报错日志如下：

```
> my-electron-app@1.0.0 start D:\github\my-electron-app
> electron .


npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! my-electron-app@1.0.0 start: `electron .`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the my-electron-app@1.0.0 start script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\xxx\AppData\Roaming\npm-cache\_logs\2021-06-29T07_42_45_362Z-debug.log
```

## 运行主进程

任何 Electron 应用程序的入口都是 main 文件。 

这个文件控制了主进程，它运行在一个完整的Node.js环境中，负责控制您应用的生命周期，显示原生界面，执行特殊操作并管理渲染器进程(稍后详细介绍)。

执行期间，Electron 将依据应用中 package.json 配置下main字段中配置的值查找此文件，您应该已在应用脚手架步骤中配置。

要初始化这个main文件，需要在您项目的根目录下创建一个名为main.js的空文件。

注意：如果您此时再次运行start命令，您的应用将不再抛出任何错误！ 然而，它不会做任何事因为我们还没有在main.js中添加任何代码。

## 创建页面

在可以为我们的应用创建窗口前，我们需要先创建加载进该窗口的内容。 

在 Electron 中，每个窗口中无论是本地的HTML文件还是远程URL都可以被加载显示。

此教程中，您将采用本地HTML的方式。 

在您的项目根目录下创建一个名为index.html的文件

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <meta http-equiv="X-Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using Node.js <span id="node-version"></span>,
    Chromium <span id="chrome-version"></span>,
    and Electron <span id="electron-version"></span>.
  </body>
</html>
```

注意：在这个HTML文本中，您会发现主体文本中丢失了版本编号。 稍后我们将使用 JavaScript 动态插入它们。

## 在窗口中打开您的页面

现在您有了一个页面，将它加载进应用窗口中。 要做到这一点，你需要两个 Electron 模块：

- app 模块，它控制应用程序的事件生命周期。

- BrowserWindow 模块，它创建和管理应用程序窗口。

因为主进程运行着Node.js，您可以在文件头部将他们导入作为公共JS模块：

- main.js

main.js 中插入如下内容：

```js
const { app, BrowserWindow } = require('electron')
```

然后，添加一个createWindow()方法来将index.html加载进一个新的BrowserWindow实例。

```js
function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('index.html')
}
```

接着，调用createWindow()函数来打开您的窗口。

在 Electron 中，只有在 app 模块的 ready 事件被激发后才能创建浏览器窗口。 

您可以通过使用 app.whenReady() API来监听此事件。 

在whenReady()成功后调用createWindow()。

```js
app.whenReady().then(() => {
  createWindow()
})
```

注意：此时，您的电子应用程序应当成功 打开显示您页面的窗口！

# 管理窗口的生命周期

虽然你现在可以打开一个浏览器窗口，但你还需要一些额外的模板代码使其看起来更像是各平台原生的。 

应用程序窗口在每个OS下有不同的行为，Electron将在app中实现这些约定的责任交给开发者们。

一般而言，你可以使用进程全局的 platform 属性来专门为某些操作系统运行代码。

## 关闭所有窗口时退出应用 (Windows & Linux)

在Windows和Linux上，关闭所有窗口通常会完全退出一个应用程序。

为了实现这一点，监听 app 模块的 'window-all-closed' 事件，并在用户不是在 macOS (darwin) 上运行时调用 [app.quit()][app-quit]

```js
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
```

## 如果没有窗口打开则打开一个窗口 (macOS)

当 Linux 和 Windows 应用在没有窗口打开时退出了，macOS 应用通常即使在没有打开任何窗口的情况下也继续运行，并且在没有窗口可用的情况下激活应用时会打开新的窗口。

为了实现这一特性，监听 app 模块的 activate 事件，并在没有浏览器窗口打开的情况下调用你仅存的 createWindow() 方法。

因为窗口无法在 ready 事件前创建，你应当在你的应用初始化后仅监听 activate 事件。 

通过在您现有的 whenReady() 回调中附上您的事件监听器来完成这个操作。

```js
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
```

## 通过预加载脚本从渲染器访问Node.js。

现在，最后要做的是输出Electron的版本号和它的依赖项到你的web页面上。

在主进程通过Node的全局 process 对象访问这个信息是微不足道的。 

然而，你不能直接在主进程中编辑DOM，因为它无法访问渲染器文档上下文。 

它们存在于完全不同的进程！

注意：如果您需要更深入地查看Electron进程，请参阅进程模型文档。

这是将预加载脚本连接到渲染器时派上用场的地方。 

预加载脚本在渲染器进程加载之前加载，并有权访问两个渲染器全局 (例如 window 和 document) 和 Node.js 环境。

创建一个名为 preload.js 的新脚本如下：

```js
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
```

上面的代码访问 Node.js process.versions 对象，并运行一个基本的 replaceText 辅助函数将版本号插入到 HTML 文档中。

要将此脚本附加到渲染器流程，请在你现有的 BrowserWindow 构造器中将路径中的预加载脚本传入 webPreferences.preload 选项。

```js
// 在文件头部引入 Node.js 中的 path 模块
const path = require('path')

// 修改现有的 createWindow() 函数
function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}
// ...
```

这里使用了两个Node.js概念：

__dirname 字符串指向当前正在执行脚本的路径 (本例中，你的项目的根文件夹)。

path.join API 将多个路径段联结在一起，创建一个跨平台的组合路径字符串。

我们使用一个相对当前正在执行JavaScript文件的路径，这样您的相对路径将在开发模式和打包模式中都将有效。

## 额外：将功能添加到您的网页内容

此刻，您可能想知道如何为您的应用程序添加更多功能。

对于与您的网页内容的任何交互，您想要将脚本添加到您的渲染器进程中。 

由于渲染器运行在正常的 Web 环境中，因此您可以在 index.html 文件关闭 `</body>` 标签之前添加一个 `<script>` 标签，来包括您想要的任意脚本：

```js
<script src="./renderer.js"></script>
```

renderer.js 中包含的代码接下来可以使用与前端开发相同的 JavaScript API 和工具，例如使用 webpack 打包并最小化您的代码或 React 来管理您的用户界面。

## 测试验证

我们运行 npm start，可以看到对应的版本号信息：

```
We are using Node.js 14.16.0, Chromium 91.0.4472.106, and Electron 13.1.4.
```

# 打包并分发您的应用程序

最快捷的打包方式是使用 Electron Forge。

## 添加依赖

将 Electron Forge 添加到您应用的开发依赖中，并使用其"import"命令设置 Forge 的脚手架：


```
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

日志如下：

```
√ Checking your system
√ Initializing Git Repository
√ Writing modified package.json file
√ Installing dependencies
√ Writing modified package.json file
√ Fixing .gitignore


We have ATTEMPTED to convert your app to be in a format that electron-forge understands.

Thanks for using "electron-forge"!!!
```

说明我们添加成功。

## 使用 Forge 的 make 命令来创建可分发的应用程序：

```
npm run make
```

日志如下：

```
> my-electron-app@1.0.0 make D:\github\my-electron-app
> electron-forge make

√ Checking your system
√ Resolving Forge Config
We need to package your application before we can make it
√ Preparing to Package Application for arch: x64
√ Preparing native dependencies
√ Packaging Application
Making for the following targets: squirrel
√ Making for target: squirrel - On platform: win32 - For arch: x64
```

生成的文件在 out 目录下：

```
D:\github\my-electron-app\out (master)
λ ls
make/  my-electron-app-win32-x64/
```

运行 `out\my-electron-app-win32-x64\`
# 参考资料

[Electron 文档](https://www.electronjs.org/docs/tutorial/quick-start)

* any list
{:toc}