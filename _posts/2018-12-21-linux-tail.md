---
layout: post
title: linux tail, linux head
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
excerpt: linux tail, linux head 命令
---

# linux head/tail

head 与 tail 就像它的名字一样的浅显易懂，它是用来显示开头或结尾某个数量的文字区块，head 用来显示档案的开头至标准输出中，而 tail 想当然就是看档案的结尾。

# tail

## 实时查看日志

默认查看最后 10 行

```
tail -f 1.log
```

## 实时查看末尾的100行

```
tail -100f 1.log
```

# 参考资料

[Linux tail 命令详解](https://www.cnblogs.com/fps2tao/p/7698224.html)

* any list
{:toc}