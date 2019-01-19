---
layout: post
title: Git 基础之别名-2.7
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, sh]
published: true
excerpt: Git 基础之别名-2.7
---

# 2.7 Git 基础 - Git 别名

在我们结束本章 Git 基础之前，正好有一个小技巧可以使你的 Git 体验更简单、容易、熟悉：别名。 

我们不会在之后的章节中引用到或假定你使用过它们，但是你大概应该知道如何使用它们。

Git 并不会在你输入部分命令时自动推断出你想要的命令。 

如果不想每次都输入完整的 Git 命令，可以通过 git config 文件来轻松地为每一个命令设置一个别名。 

这里有一些例子你可以试试：

```
$ git config --global alias.co checkout
$ git config --global alias.br branch
$ git config --global alias.ci commit
$ git config --global alias.st status
```

这意味着，当要输入 git commit 时，只需要输入 git ci。 随着你继续不断地使用 Git，可能也会经常使用其他命令，所以创建别名时不要犹豫。

在创建你认为应该存在的命令时这个技术会很有用。 

例如，为了解决取消暂存文件的易用性问题，可以向 Git 中添加你自己的取消暂存别名：

```
$ git config --global alias.unstage 'reset HEAD --'
```

这会使下面的两个命令等价：

```
$ git unstage fileA
$ git reset HEAD -- fileA
```

这样看起来更清楚一些。 通常也会添加一个 last 命令，像这样：

```
$ git config --global alias.last 'log -1 HEAD'
```

这样，可以轻松地看到最后一次提交：

```
$ git last
commit 66938dae3329c7aebe598c2246a8e6af90d04646
Author: Josh Goebel <dreamer3@example.com>
Date:   Tue Aug 26 19:48:51 2008 +0800

    test for current head

    Signed-off-by: Scott Chacon <schacon@example.com>
```

可以看出，Git 只是简单地将别名替换为对应的命令。 

然而，你可能想要执行外部命令，而不是一个 Git 子命令。 

如果是那样的话，可以在命令前面加入 `!` 符号。 如果你自己要写一些与 Git 仓库协作的工具的话，那会很有用。 

我们现在演示将 git visual 定义为 gitk 的别名：

```
$ git config --global alias.visual '!gitk'
```




# 参考资料

[git 官方 pro git](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%85%B3%E4%BA%8E%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6)

* any list
{:toc}

