---
layout: post
title: 从零开始的 windows 开发环境搭建-01-git
date:  2019-9-26 22:35:36 +0800
categories: [Windows]
tags: [windows, git, sf]
published: true
---

# GIT 拉取报错

## 报错信息

```
$ git clone https://github.com/houbb/houbb.github.io.git
Cloning into 'houbb.github.io'...
remote: Enumerating objects: 138, done.
remote: Counting objects: 100% (138/138), done.
remote: Compressing objects: 100% (115/115), done.
error: RPC failed; curl 56 OpenSSL SSL_read: SSL_ERROR_SYSCALL, errno 10054
fatal: the remote end hung up unexpectedly
fatal: early EOF
fatal: index-pack failed
```

## 分析过程

一开始以为是网络太慢了，文件又太多导致的。

后来发现不是，就查了下对应的 error 信息

```
error: RPC failed; curl 56 OpenSSL SSL_read: SSL_ERROR_SYSCALL, errno 10054
```

## 解决方案

设置一下安全模式即可。

```
$ git config  --global  http.sslVerify "false"
```

# 参考资料

[git 报错问题](https://www.cnblogs.com/emmetyang/p/10620819.html)

* any list
{:toc}
