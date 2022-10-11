---
layout: post
title:  Can't find Python executable python you can set the PYTHON env variable.
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

## 安装

执行命令，这个命令需要管理员权限。

```
npm install -g node-gyp
```

`node-gyp` 已经安装的可以忽略。

然后安装构建工具。

```
cnpm install --global --production windows-build-tools
```

安装的过程会比较漫长，耐心等待即可。

一直等待到 ALL DONE! 其实才是真正的安装完成。

## 卡主的问题

以前安装过windows-build-tools，很顺利的，没想到最近在别的机器上安装，出现了卡住不动的情况，就是如题的问题。

其实这个问题出现在执行vs_BuildTools.exe安装问题上。而这个问题的本质就是visual studio installer启动程序的安装，为什么失败，网络问题。它要下载的资源没办法下载。

问题可以通过最新的临时文件C:\Users\admin\AppData\Local\Temp\dd_bootstrapper_20210420103743.log来定位。这个文件在每个人的电脑上名字会因为时间不一样而有差异。

ps: 我的是 `C:\Users\dh\AppData\Local\Temp\dd_bootstrapper_20221008135947.log`

### aka 下载失败

这个文件里面可能会提示https://aka.ms/vs/15/release/installer这个地址请求失败。解决办法就是在C:\Windows\System32\drivers\etc\hosts中添加aka.ms对应的主机。

可以试着用浏览器打开这个地址，如果能直接下载一个文件，那表示网络没问题。

有的添加了主机，可能会出现访问拒绝的问题，我在虚拟机中就遇到过，这是防火墙拦截了，我直接关闭防火墙，问题变成了访问无响应，后来设置了静态IP，设置了dns 8.8.8.8 dns2 4.4.4.4，就成功了。

网络问题有时候太讨厌了。

### 卡在  Still waiting for installer log file...

```
---------- Visual Studio Build Tools ----------
Still waiting for installer log file...
------------------- Python --------------------
Still waiting for installer log file...
```

既然不能自动安装，那我们就手动安装；

进入这两个的保存地址。

1.python直接安装就好，没什么说的。

2.vs_BuildTools 操作如下

直接打开，进入之后选择->单个组件->勾选Node.js MSBuild 支持，下载，解决。

浪费了我一天半时间，终于解决了，感觉自己是个废物，需要学的内容还是非常多的。

到 `C:\Users\dh\.windows-build-tools` 目录下，管理员身份安装。提示重启计算机。

重启之后，再次双击，就会发现已经安装。重新执行安装命令：

```
cnpm install --global --production windows-build-tools
```

### 正常

我看了下我的日志是正常的。

我的情况是，系统已经安装了python,msbuild环境，甚至windows10 sdk都安装完成，命令行界面还卡住，但是其实已经安装完成了，只不过系统环境变量里面没有python可执行路径，自行添加就可以了。

如果临时文件里面出现了如下图所示的日志文件，表示windows-build-tools已经安装完成：

![VM](https://img-blog.csdnimg.cn/20210426150100350.png)

### 配置 python 系统环境变量

修改系统变量 path，新增一个：

```
C:\Users\dh\.windows-build-tools\python27
```

测试 

```
D:\tool\cmder_mini
λ python
Python 2.7.15 (v2.7.15:ca079a3ea3, Apr 30 2018, 16:30:26) [MSC v.1500 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

# 参考资料

[npm报错Can‘t find Python executable “python“, you can set the PYTHON env variable.](https://blog.csdn.net/u012069313/article/details/122734723)

https://blog.csdn.net/hzxOnlineOk/article/details/78284161

https://blog.csdn.net/gxgalaxy/article/details/105200828

[npm安装windows-build-tools一直卡在successfully installed python2.7不动](https://blog.csdn.net/feinifi/article/details/116155651)

[安装windows-build-tools，卡在Still waiting for installer log file... 这里一动不动的问题及解决办法，实测有效。](https://blog.csdn.net/originalzzZ/article/details/119612887)

[Win10如何配置Python环境变量](https://m.php.cn/article/471645.html)

[C:\Windows\Microsoft.NET\Framework\v4.0.30319\msbuild.exe` failed with exit code: 1](https://blog.csdn.net/BADAO_LIUMANG_QIZHI/article/details/83617235)

* any list
{:toc}