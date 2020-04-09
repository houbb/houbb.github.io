---
layout: post
title: Git Clone 失败
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, sh]
published: true
---

# 报错

## 报错

```
Cloning into 'tts-data'...
remote: Enumerating objects: 29693, done.
error: RPC failed; curl 18 transfer closed with outstanding read data remaining
fatal: the remote end hung up unexpectedly
fatal: early EOF
fatal: index-pack failed
```

## 原因

究其原因是因为curl的postBuffer的默认值太小，我们需要调整它的大小，在终端重新配置大小

在这里，笔者把postBuffer的值配置成500M，对笔者来说已经够了。

## 解决方案

可以根据你需要下载的文件大小，将postBuffer值配置成合适的大小。

```
git config --global http.postBuffer 524288000
```

这样已经配置好了，如果你不确定，可以根据以下命令查看postBuffer。

```
git config --list
```

信息列表

```
http.postbuffer=524288000
```

# 参考资料

[git clone 失败](https://blog.csdn.net/dzhongjie/article/details/81152983)

* any list
{:toc}

