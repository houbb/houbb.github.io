---
layout: post
title:  Electron-00-Electron 入门及打包实战笔记
date:  2018-07-05 21:01:28 +0800
categories: [Tool]
tags: [tool, electron, sh]
published: true
---

# 简介

个人看法，Electron.js是一个非常伟大的技术，可以让你通过简单的HTML，CSS，JavaScript就可以开发跨平台的桌面应用程序（Windows，Linux，Mac）

相关技术文档是这样解释Electron.js的：

Electron 框架的前身是 Atom Shell，可以让你写使用 JavaScript，HTML 和 CSS 构建跨平台的桌面应用程序。它是基于io.js 和 Chromium 开源项目，并用于在 Atom 编辑器中。Electron 是开源的，由 GitHub 维护，有一个活跃的社区。最重要的是，Electron 应用服务构建和运行在 Mac，Windows 和 Linux。

还有一点需要说明的是，Electron.js并不是唯一一个可以通过HTML，CSS，JavaScript就可以开发跨平台桌面应用程序的技术，还有一个node-webkit.js（简称nw.js）也是可以做到的，而且nw.js推出的时间还比Electron.js早。

很多朋友会问，为什么不选择比较早出的nw.js，而选择晚出的Electron.js呢？理由非常简单，Electron.js有非常成熟的产品了，比如Atom，Visual Studio Code，WordPress.com等等都是基于Electron.js开发的。而且Electron.js比nw.js文档更加齐全，更加明了。

最重要的还是有大量已经使用Electron.js开发的桌面应用程序。

最后，Electron.js的官方网址：http://electron.atom.io/

特别注意：由于我使用的是Windows 10 X64位操作系统，所以后续的所有教程或者代码都是是Window平台下的！

# 环境准备

## node.js 安装

其实Electron.js就是基于Node.js开发的桌面应用程序，支持Node.js所有的语法，所以Node.js安装是必备的。

npm 是可以快速的找到你的包并载入你的Node.js环境中。

```
λ node -v
v12.16.2

λ npm  -v
7.21.0
```

## Electron.js 安装

安装Electron.js有以下步骤：

**必须启动以管理员运行的命令行**

在命令行中输入 `npm install -g electron-prebuilt` 回车，即可安装Electron.js

```
cnpm install -g electron-prebuilt
Downloading electron-prebuilt to C:\Users\Administrator\AppData\Roaming\npm\node_modules\electron-prebuilt_tmp
Copying C:\Users\Administrator\AppData\Roaming\npm\node_modules\electron-prebuilt_tmp\_electron-prebuilt@1.4.13@electron-prebuilt to C:\Users\Administrator\AppData\Roaming\npm\node_modules\electron-prebuilt
Installing electron-prebuilt's dependencies to C:\Users\Administrator\AppData\Roaming\npm\node_modules\electron-prebuilt/node_modules
[1/2] extract-zip@^1.0.3 installed at node_modules\_extract-zip@1.7.0@extract-zip
[2/2] electron-download@^3.0.1 installed at node_modules\_electron-download@3.3.0@electron-download
execute post install 1 scripts...
[1/1] scripts.postinstall electron-prebuilt@1.4.13 run "node install.js", root: "C:\\Users\\Administrator\\AppData\\Roaming\\npm\\node_modules\\electron-prebuilt"
Downloading SHASUMS256.txt
[============================================>] 100.0% of 2.88 kB (2.88 kB/s)
[1/1] scripts.postinstall electron-prebuilt@1.4.13 finished in 13s
deprecate electron-download@3.3.0 › nugget@2.0.1 › request@^2.45.0 request has been deprecated, see https://github.com/request/request/issues/3142
deprecate electron-download@3.3.0 › nugget@2.0.1 › request@2.88.2 › har-validator@~5.1.3 this library is no longer supported
deprecate electron-download@3.3.0 › nugget@2.0.1 › request@2.88.2 › uuid@^3.3.2 Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
Recently updated (since 2021-11-09): 1 packages (detail see file C:\Users\Administrator\AppData\Roaming\npm\node_modules\electron-prebuilt\node_modules\.recently_updates.txt)
  2021-11-15
    → electron-download@3.3.0 › nugget@2.0.1 › pretty-bytes@1.0.4 › meow@3.7.0 › normalize-package-data@2.5.0 › validate-npm-package-license@3.0.4 › spdx-correct@3.1.1 › spdx-license-ids@^3.0.0(3.0.11) (04:46:47)
All packages installed (153 packages installed from npm registry, used 16s(network 3s), speed 567.48KB/s, json 147(287.77KB), tarball 1.57MB)
[electron-prebuilt@1.4.13] link C:\Users\Administrator\AppData\Roaming\npm\electron@ -> C:\Users\Administrator\AppData\Roaming\npm\node_modules\electron-prebuilt\cli.js
```

ps: 国内网速问题，使用 cnpm 代替 npm 

等待安装完成之后，在命令行输入 electron -v 能够显示Electron.js版本号代表安装成功。

```
electron -v

v1.4.13
```

# hello world

我们直接以官方例子开始。

```
# 克隆示例项目的仓库
$ git clone https://github.com/electron/electron-quick-start

# 进入这个仓库
$ cd electron-quick-start

# 安装依赖并运行
$ npm install && npm start
```

ps: 最后一步如果网速不好，可以拆分为2步：

```
cnpm install
npm start
```

可以启动一个基本应用。窗口内容如下：

```
Hello World!
We are using Node.js 16.5.0, Chromium 94.0.4606.81, and Electron 15.3.2.
```

# 源码分析

## 文件

```
index.html  LICENSE.md  main.js  node_modules/  package.json  package-lock.json  preload.js  README.md  renderer.js  styles.css
```

## md 文本

LICENSE.md 对应开源协议

README.md 对应使用说明

此处暂时跳过。

## package.json

最核心的部分。

```json
{
  "name": "electron-quick-start",  //应用名称
  "version": "1.0.0", //版本
  "description": "A minimal Electron application", //描述
  "main": "main.js",  // 指定程序入口
  "scripts": {
    "start": "electron ."       // 启动命令
  },
  "repository": "https://github.com/electron/electron-quick-start",
  "keywords": [
    "Electron",
    "quick",
    "start",
    "tutorial",
    "demo"
  ],
  "author": "GitHub",
  "license": "CC0-1.0",
  "devDependencies": {
    "electron": "^15.3.1"   // 版本依赖
  }
}
```

### 入口

- main.js

```js
// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
```

理解起来也不难，app 准备完成之后，回调用 createWindow() 创建一个窗口。

窗口创建指定了大小，以及加载前的准备脚本 `preload.js`。

主窗口对应的页面为 `index.html`

- preload.js

```js
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
```

- index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <link href="./styles.css" rel="stylesheet">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using Node.js <span id="node-version"></span>,
    Chromium <span id="chrome-version"></span>,
    and Electron <span id="electron-version"></span>.

    <!-- You can also require other files to run in this process -->
    <script src="./renderer.js"></script>
  </body>
</html>
```

我们前面看到的内容是：

```
Hello World!
We are using Node.js 16.5.0, Chromium 94.0.4606.81, and Electron 15.3.2.
```

可见如 `<span id="node-version"></span>` 的内容，在 `preload.js` 文件中已经被替换掉了。

- renderer.js

目前这个文件是空的。

```js
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
```

- styles.css

这个就是 css 样式文件，内容默认也是空的。

```css
/* styles.css */

/* Add styles here to customize the appearance of your app */
```

# electron-packager 打包

我们如何对上面的程序进行打包呢？

## 特点

1、支持平台有：Windows (32/64 bit)、OS X (also known as macOS)、Linux (x86/x86_64);

2、进行应用更新时，使用electron内置的autoUpdate进行更新

3、支持CLI和JS API两种使用方式；

## 安装 electron-packager

```
cnpm install --save-dev electron-packager
```

完成后，package.json 变化如下：

```js
"devDependencies": {
    "electron": "^15.3.1",
    "electron-packager": "^15.4.0"
  }
```

ps: 当然，这里也可以手动修改。

## 打包命令

```
electron-packager <sourcedir> <appname> <platform> <architecture> <electron version> <optional options>
```

参数说明：

sourcedir：项目所在路径
appname：应用名称
platform：确定了你要构建哪个平台的应用（Windows、Mac 还是 Linux）
architecture：决定了使用 x86 还是 x64 还是两个架构都用
electron version：electron 的版本
optional options：可选选项

### 构建打包命令

我们可以针对 windows 专门指定一个打包命令：

```js
"scripts": {
    "start": "electron .",
	"package": "electron-packager ./ myapp --win --platform=win32 --arch=x64"
  },
```

运行打包：

```
cnpm run package
```

此时可能会比较慢：

```
λ cnpm run package

> electron-quick-start@1.0.0 package D:\code\electron-quick-start
> electron-packager ./ myapp --win --platform=win32 --arch=x64

Downloading electron-v15.3.2-win32-x64.zip: [==--------------------------------------------------------------------------------------------------] 2% ETA: 3568.4 seconds
```

### 全平台命令

当然，我们一次可以把 windows/mac/linux 的包都给打了。

```
electron-packager . App名称 --all -all --version=1.1.0
```

这个没成功，估计是网络问题。

# electron-builder

## 介绍

[electron-builder](https://www.electron.build/) is A complete solution to package and build a ready for distribution Electron app for macOS, Windows and Linux with “auto update” support out of the box.

简单的说，electron-builder就是有比electron-packager有更丰富的的功能，支持更多的平台，同时也支持了自动更新。

除了这几点之外，由electron-builder打出的包更为轻量，并且可以打包出不暴露源码的setup安装程序。

## 特点：

1、electron-builder 可以打包成msi、exe、dmg文件，macOS系统，只能打包dmg文件，window系统才能打包exe，msi文件；

2、几乎支持了所有平台的所有格式；

3、支持Auto Update；

4、支持CLI和JS API两种使用方式；


## 安装依赖

```
$   cnpm install --save-dev electron-builder
```

or 官方推荐的 yarn 也类似：

```
yarn add electron-builder --save-dev
```

## 修改 package.json 

在 package.json 中做如下配置

```json
"build": {
    "appId": "com.xxx.app",
    "mac": {
      "target": ["dmg","zip"]
    },
    "win": {
      "target": ["nsis","zip"]
    }
},
"scripts": {
    "dist": "electron-builder --win --x64"
},
```

## 打包

执行打包命令：

```
cnpm run dist
```

报错：

```
> electron-builder --win --x64

Error: Cannot find module 'fs/promises'
Require stack:
- D:\code\electron-quick-start\node_modules\_builder-util@22.13.1@builder-util\out\fs.js
- D:\code\electron-quick-start\node_modules\_builder-util@22.13.1@builder-util\out\util.js
- D:\code\electron-quick-start\node_modules\_electron-builder@22.13.1@electron-builder\out\cli\cli.js
- D:\code\electron-quick-start\node_modules\_electron-builder@22.13.1@electron-builder\cli.js
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:980:15)
```

### 原因

这是nodejs版本太低导致的，查看 electron-builder 的代码可以发现，里面都是require("fs/promises")

这样的引用，但是旧版nodejs是require("fs").promises的引用方式

### 解决方案

（1）可以通过升级nodejs的方式解决，本人在win10系统下升级为nodejs14，可以正常打包。

（2）降低 electron-builder 的版本

控制在 v22.10.X 以内 v22.11.x以上的版本就会出现该问题

### 个人实战

卸载重装了一下 node

```
node -v
v16.13.0
```

重新安装依赖包。

```
λ cnpm run dist

> electron-quick-start@1.0.0 dist D:\code\electron-quick-start
> electron-builder --win --x64

  • electron-builder  version=22.13.1 os=10.0.19042
  • loaded configuration  file=package.json ("build" field)
  • writing effective config  file=dist\builder-effective-config.yaml
  • packaging       platform=win32 arch=x64 electron=15.3.2 appOutDir=dist\win-unpacked
  ⨯ Get "https://github.com/electron/electron/releases/download/v15.3.2/electron-v15.3.2-win32-x64.zip": dial tcp 20.205.243.166:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
```

依然报错，这个应该是网络问题。

`https://github.com/electron/electron/releases/download/v15.3.2/electron-v15.3.2-win32-x64.zip` 这个压缩包。

### 包下载慢的问题

下载的很慢，经常失败。

（1）修改配置

执行命令

```
cnpm config edit
```

在打开的文件中增加下面一行配置，然后保存关闭

···
electron_mirror=https://npm.taobao.org/mirrors/electron/
···

（2）或者手动下载

打包过程中很明显有需要包的网络下载地址：
https://github.com/electron/electron/releases/download/v8.2.0/electron-v8.2.0-win32-x64.zip

下载 electron-v8.2.0-win32-x64.zip 这个包，那只能通过离线下载，然后放到对应的目录里面

```
macOS: ~/Library/Caches/electron
Linux: ~/.cache/electron
windows: %LOCALAPPDATA%\electron\cache
```

需要注意的是，除了这个压缩包以外，还要把对应的SHASUMS256.txt-文件也下载下来放进去；（PS：txt文件需要按照截图格式命名才会生效，且里面只保留对应版本的编码）

-------

重新安装：

```
λ cnpm run dist

> electron-quick-start@1.0.0 dist D:\code\electron-quick-start
> electron-builder --win --x64

  • electron-builder  version=22.13.1 os=10.0.19042
  • loaded configuration  file=package.json ("build" field)
  • writing effective config  file=dist\builder-effective-config.yaml
  • packaging       platform=win32 arch=x64 electron=15.3.1 appOutDir=dist\win-unpacked
  • downloading     url=https://npm.taobao.org/mirrors/electron/15.3.1/electron-v15.3.1-win32-x64.zip size=86 MB parts=8
  • downloaded      url=https://npm.taobao.org/mirrors/electron/15.3.1/electron-v15.3.1-win32-x64.zip duration=19.236s
  • default Electron icon is used  reason=application icon is not set
  • downloading     url=https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z size=5.6 MB parts=1
```

### 类似的报错

下载

```
https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z

https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.2/nsis-3.0.4.2.7z"
```

依然会报错。

真的很麻烦，淦~

镜像的话，可以参考 [https://npm.taobao.org/mirrors](https://npm.taobao.org/mirrors)


类似上面，通过 `cnpm config edit` 修改一下镜像。

```
ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
```

重新执行命令：

```
λ cnpm run dist

> electron-quick-start@1.0.0 dist D:\code\electron-quick-start
> electron-builder --win --x64

  • electron-builder  version=22.13.1 os=10.0.19042
  • loaded configuration  file=package.json ("build" field)
  • writing effective config  file=dist\builder-effective-config.yaml
  • packaging       platform=win32 arch=x64 electron=15.3.1 appOutDir=dist\win-unpacked
  • default Electron icon is used  reason=application icon is not set
  • building        target=zip arch=x64 file=dist\electron-quick-start-1.0.0-win.zip
  • building        target=nsis file=dist\electron-quick-start Setup 1.0.0.exe archs=x64 oneClick=true perMachine=false
  • downloading     url=http://npm.taobao.org/mirrors/electron-builder-binaries/nsis-3.0.4.2/nsis-3.0.4.2.7z size=1.4 MB parts=1
  • downloaded      url=http://npm.taobao.org/mirrors/electron-builder-binaries/nsis-3.0.4.2/nsis-3.0.4.2.7z duration=1.055s
  • downloading     url=http://npm.taobao.org/mirrors/electron-builder-binaries/nsis-resources-3.4.1/nsis-resources-3.4.1.7z size=731 kB parts=1
  • downloaded      url=http://npm.taobao.org/mirrors/electron-builder-binaries/nsis-resources-3.4.1/nsis-resources-3.4.1.7z duration=723ms
  • building block map  blockMapFile=dist\electron-quick-start Setup 1.0.0.exe.blockmap
```

这次成功了。

## 打包结果

打包的内容都在 dist 文件夹。

```
$   cd dist && ls

builder-debug.yml   
builder-effective-config.yaml  
'electron-quick-start Setup 1.0.0.exe'     # 安装文件，默认在 C 盘
'electron-quick-start Setup 1.0.0.exe.blockmap'  
electron-quick-start-1.0.0-win.zip   # 压缩包，解压可以直接使用。
latest.yml     #更新相关的文件
win-unpacked
```

# 坑

研究electron打包的过程中踩了不少坑，打包涉及到不少系统级别的问题，从最初的选型到最后的成功打包，看似是个简单的过程，但其中仍有一些需要注意到的地方，我在这里分两点说明：

## devDependencies与dependencies的区别

dependencies 表示我们要在生产环境下使用该依赖，devDependencies 则表示我们仅在开发环境使用该依赖。

在打包时，一定要分清哪些包属于生产依赖，哪些属于开发依赖，尤其是在项目较大，依赖包较多的情况下。

若在生产环境下错应或者少引依赖包，即便是成功打包，但在使用应用程序期间也会报错，导致打包好的程序无法正常运行。W

## npm与cnpm的区别

说到npm与cnpm的区别，可能大家都知道，但大家容易忽视的一点，是cnpm装的各种node_module，这种方式下所有的包都是扁平化的安装。

一下子node_modules展开后有非常多的文件。导致了在打包的过程中非常慢。

但是如果改用npm来安装node_modules的话，所有的包都是树状结构的，层级变深。

由于这个不同，对一些项目比较大的应用，很容易出现打包过程慢且node内存溢出的问题（这也是在解决electron打包过程中困扰我比较久的问题，最后想到了npm与cnpm的这点不同，解决了node打包内存溢出的问题，从打包一次一小时优化到打包一次一分钟，极大的提高了效率）。

所以**建议大家在打包前，将使用 cnpm 安装的依赖包删除，替换成npm安装的依赖包。**

# 参考资料

https://www.npmjs.com/package/electron-packager

https://www.kancloud.cn/winu/electron/154345

[electron将vue项目打包成桌面应用（.dmg/.exe）](https://www.jianshu.com/p/d8f3942d5efc)

[Electron 应用程序打包](https://www.jianshu.com/p/63a9ff0941b6)

[electron应用生成exe程序并打包过程记录](https://www.cnblogs.com/webhmy/p/11561406.html)

[electron打包：electron-packager及electron-builder两种方式实现（for Windows）](https://segmentfault.com/a/1190000013924153)

[Electron-builder打包安装程序遇到的问题解决方案](https://blog.csdn.net/weixin_30780221/article/details/97057499)

[electron-builder 打包出现 cannot find module fs/promises](https://blog.csdn.net/qq_32337279/article/details/118328202)

[electron-v8.2.1-win32-x64.zip 下载失败（npm install electron 安装失败）](https://blog.csdn.net/dling8/article/details/105434000)

[如何解决Electron安装包下载慢的问题](https://www.jianshu.com/p/d4a8768e0617)

[electron-builder打包过程中报错——网络下载篇](https://blog.csdn.net/qq_32682301/article/details/105234408)

* any list
{:toc}