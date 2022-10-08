---
layout: post
title:  Can't find Python executable "python", you can set the PYTHON env variable.
date:  2022-10-01 09:22:02 +0800
categories: [JS]
tags: [js, error, npm, sh]
published: true
---
# python 报错

## 报错信息

```
gyp ERR! stack Error: Can't find Python executable "python", you can set the PYTHON env variable.
gyp ERR! stack     at PythonFinder.failNoPython (C:\Users\dh\Downloads\gobang-master\node_modules\_node-gyp@3.8.0@node-gyp\lib\configure.js:484:19)
gyp ERR! stack     at PythonFinder.<anonymous> (C:\Users\dh\Downloads\gobang-master\node_modules\_node-gyp@3.8.0@node-gyp\lib\configure.js:509:16)
gyp ERR! stack     at callback (C:\Users\dh\Downloads\gobang-master\node_modules\_graceful-fs@4.2.10@graceful-fs\polyfills.js:306:20)
gyp ERR! stack     at FSReqCallback.oncom
```

## 原因

猜测是缺少 python 的信息。

安装对应的 python 包。

此处为从 windows 商店下载，指定一下安装位置：

```
npm config set python C:\Users\dh\AppData\Local\Microsoft\WindowsApps\python.exe
```

## 重新执行

```
cnpm install
```

还是报错。

## 安装

执行命令，这个命令需要管理员权限。

```
cnpm install --global --production windows-build-tools
```

安装的过程会比较漫长，耐心等待即可。

# 参考资料

[npm报错Can‘t find Python executable “python“, you can set the PYTHON env variable.](https://blog.csdn.net/u012069313/article/details/122734723)

https://blog.csdn.net/hzxOnlineOk/article/details/78284161

https://blog.csdn.net/gxgalaxy/article/details/105200828

* any list
{:toc}