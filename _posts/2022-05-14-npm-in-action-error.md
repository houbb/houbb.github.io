---
layout: post
title:  NPM install error Can't find Python executable python, you can set the PYTHON env variable.
date:  2022-05-10 09:22:02 +0800
categories: [Work]
tags: [work, part-time, sh]
published: true
---

# 报错


```
λ cnpm install
...

D:\Downloads\idcard_generator-master\idcard_generator-master\node_modules\_sharp@0.22.1@sharp>node "C:\Users\Administrator\AppData\Roaming\npm\node_modules\cnpm\node_modules\npminstall\node-gyp-bin\\node-gyp.js" rebuild
gyp ERR! configure error
gyp ERR! stack Error: Can't find Python executable "python", you can set the PYTHON env variable.
gyp ERR! stack     at PythonFinder.failNoPython (C:\Users\Administrator\AppData\Roaming\npm\node_modules\cnpm\node_modules\node-gyp\lib\configure.js:484:19)
gyp ERR! stack     at PythonFinder.<anonymous> (C:\Users\Administrator\AppData\Roaming\npm\node_modules\cnpm\node_modules\node-gyp\lib\configure.js:509:16)
gyp ERR! stack     at callback (C:\Users\Administrator\AppData\Roaming\npm\node_modules\cnpm\node_modules\graceful-fs\polyfills.js:299:20)
gyp ERR! stack     at FSReqCallback.oncomplete (node:fs:198:21)
gyp ERR! System Windows_NT 10.0.19042
gyp ERR! command "C:\\Program Files\\nodejs\\node.exe" "C:\\Users\\Administrator\\AppData\\Roaming\\npm\\node_modules\\cnpm\\node_modules\\npminstall\\node-gyp-bin\\node-gyp.js" "rebuild"
gyp ERR! cwd D:\Downloads\idcard_generator-master\idcard_generator-master\node_modules\_sharp@0.22.1@sharp
gyp ERR! node -v v16.13.0
gyp ERR! node-gyp -v v4.0.0
gyp ERR! not ok
[npminstall:runscript:error] sharp@^0.22.1 scripts.install run "(node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)" error: Error [RunScriptError]: Run "C:\WINDOWS\system32\cmd.exe /d /s /c (node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)" error, exit code 1
    at ChildProcess.<anonymous> (C:\Users\Administrator\AppData\Roaming\npm\node_modules\cnpm\node_modules\runscript\index.js:96:21)
    at ChildProcess.emit (node:events:390:28)
    at maybeClose (node:internal/child_process:1064:16)
    at Process.ChildProcess._handle.onexit (node:internal/child_process:301:5) {
  stdio: [Object],
  exitcode: 1
}
× Install fail! RunScriptError: post install error, please remove node_modules before retry!
Run "C:\WINDOWS\system32\cmd.exe /d /s /c (node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)" error, exit code 1
RunScriptError: Run "C:\WINDOWS\system32\cmd.exe /d /s /c (node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)" error, exit code 1
    at ChildProcess.<anonymous> (C:\Users\Administrator\AppData\Roaming\npm\node_modules\cnpm\node_modules\runscript\index.js:96:21)
    at ChildProcess.emit (node:events:390:28)
    at maybeClose (node:internal/child_process:1064:16)
    at Process.ChildProcess._handle.onexit (node:internal/child_process:301:5)
npminstall version: 5.0.2
npminstall args: C:\Program Files\nodejs\node.exe C:\Users\Administrator\AppData\Roaming\npm\node_modules\cnpm\node_modules\npminstall\bin\install.js --fix-bug-versions --china --userconfig=C:\Users\Administrator\.cnpmrc --disturl=https://npm.taobao.org/mirrors/node --registry=https://registry.nlark.com
```

# 解决方案

看了一下异常

> [npm - "Can't find Python executable "python", you can set the PYTHON env variable."](https://stackoverflow.com/questions/34372618/npm-cant-find-python-executable-python-you-can-set-the-python-env-variabl)

## 方案 1

```
npm install -g windows-build-tools
```

实际尝试之后好像无效。

## 方案 2

```
npm config set python D:\Library\Python\Python27\python.exe
```

首先我们需要安装一下 python

官网： [https://www.python.org/downloads/release/python-2718/](https://www.python.org/downloads/release/python-2718/)，选择 python 2.7.18 版本，尝试进行安装。

我的安装路径 `C:\Python27`

执行命令：

```
cnpm config set python C:\Python27\python.exe
```


# 报错2

然后又开始另一个报错

```
MSBUILD : error MSB3428: 未能加载 Visual C++ 组件“VCBuild.exe”。要解决此问题，1) 安装 .NET Framework 2.0 SDK；2) 安装 Microsoft Visual Studio 2005；或 3) 如果将该组件安装到了其他位置，请将其位置添加到系统路径中。 [D:\Downloads\idcard_ge
nerator-master\idcard_generator-master\node_modules
\_sharp@0.22.1@sharp\build\binding.sln]
```

## 解决方案

以管理员身份运行：

```
cnpm install --global --production windows-build-tools 
```

这个安装时间可能比较长，需要耐心等待。



# 参考资料

https://blog.csdn.net/liwan09/article/details/106975194


https://stackoverflow.com/questions/34372618/npm-cant-find-python-executable-python-you-can-set-the-python-env-variabl

https://www.jianshu.com/p/422dac764832

* any list
{:toc}