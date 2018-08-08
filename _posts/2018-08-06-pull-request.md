---
layout: post
title:  Pull Request
date:  2018-08-06 21:39:30 +0800
categories: [Devops]
tags: [devops, git]
published: true
---

# Pull Request

## 概念

Pull Request 是一种通知机制。你修改了他人的代码，将你的修改通知原来的作者，希望他合并你的修改，这就是 Pull Request。

Pull Request 本质上是一种软件的合作方式，是将涉及不同功能的代码，纳入主干的一种流程。这个过程中，还可以进行讨论、审核和修改代码。

## 流程

第一步，你需要把别人的代码，克隆到你自己的仓库，Github 的术语叫做 fork。

第二步，在你仓库的修改后的分支上，按下 【New pull request】按钮。

这时，会进入一个新页面，有Base 和 Head 两个选项。Base 是你希望提交变更的目标，Head 是目前包含你的变更的那个分支或仓库。

第三步，填写说明，帮助别人理解你的提交，然后按下【create pull request】按钮即可。

最后，PR 创建后，管理者就要决定是否接受该 PR。

对于非代码变更（比如文档），单单使用 Web 界面就足够了。

但是，对于代码变更，Web 界面可能不够用，需要命令行验证是否可以运行。

# 实战

## Fork

首先 fork 项目，比如

```
http://192.168.3.253/i2_trade.git
```

fork 之后

```sh
http://192.168.3.253/bbhou/i2_trade.git
```

## Clone

项目 Clone 到本地

```sh
git clone http://192.168.3.253/bbhou/i2_trade.git
```

## 添加同步

为了需要和远程中心仓库更新和同步代码,需要在添加一个原始远程地址;

```sh
git remote add upstream http://192.168.3.253/hy_i2_trade/i2_trade.git
```

- 删除

```
git remote remove upstream
```

- 查看

```
$ git remote -v
origin  http://192.168.3.253/bbhou/i2_trade.git (fetch)
origin  http://192.168.3.253/bbhou/i2_trade.git (push)
upstream        http://192.168.3.253/hy_i2_trade/i2_trade.git (fetch)
upstream        http://192.168.3.253/hy_i2_trade/i2_trade.git (push)
```

## Feach & Merge

远程代码的更新拉取到本地并且合并

```sh
git fetch --all
git merge upstream/master
```

# 参考资料

https://help.github.com/articles/about-pull-requests/

https://www.zhihu.com/question/21682976

http://www.ruanyifeng.com/blog/2017/07/pull_request.html

* any list
{:toc}