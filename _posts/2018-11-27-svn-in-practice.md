---
layout: post
title: SVN in Practice
date: 2018-11-27 09:14:43 +0800
categories: [Devops]
tags: [devops, in-practice, sh]
published: true
excerpt: SVN 实战使用
---

# svn在commit后报错：is scheduled for addition, but is missing

## 原因

之前用SVN提交过的文件/文件夹，被标记为"add"状态，等待被加入到仓库。

若此时你把这个文件删除了，SVN提交的时候还是会尝试提交这个文件，虽然它的状态已经是 "missing"了。

## 解决方式

直接在报错的文件夹首先 revert，然后选择 all。

将原始的文件全部下载下来，然后再做对应的处理。

再次重新提交。

# 常见命令

## 仓库信息

```
$   svn info
```

# 参考资料

* any list
{:toc}