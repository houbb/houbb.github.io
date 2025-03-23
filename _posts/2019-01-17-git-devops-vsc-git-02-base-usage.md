---
layout: post
title: Git 开源的版本控制系统-02-base usage 基本用法
date:  2016-10-10 16:09:36 +0800
categories: [VCS]
tags: [git]
published: true
---

# 拓展阅读

[Subversion 开源的版本控制系统入门介绍 VCS](https://houbb.github.io/2016/09/02/vcs-svn-01-intro)

[Git 开源的版本控制系统-01-入门使用介绍](https://houbb.github.io/2016/10/10/vsc-git-01-intro)

[Git 开源的版本控制系统-02-base usage 基本用法](https://houbb.github.io/2016/10/10/vsc-git-02-base-usage)

[Git 开源的版本控制系统-03-时间数据回溯](https://houbb.github.io/2016/10/10/vsc-git-03-time-data-back)

[Git 开源的版本控制系统-04-branch manage 分支管理](https://houbb.github.io/2016/10/10/vsc-git-04-branch-manage)

[Git 开源的版本控制系统-05-tags 标签管理](https://houbb.github.io/2016/10/10/vsc-git-05-tags)

[Git 开源的版本控制系统-06-share to github 如何把项目代码共享到 github](https://houbb.github.io/2016/10/10/vsc-git-06-share-to-github)

[Git 开源的版本控制系统-07-gitignore 指定忽略版本管理的文件](https://houbb.github.io/2016/10/10/vsc-git-07-gitignore)


# Base usage 基本用法 

## git status

显示 Git 文件的状态；

这条命令用于查看工作目录和暂存区的状态。它会列出哪些文件已经被修改、哪些文件被添加到暂存区、哪些文件尚未被跟踪等。

这有助于你了解当前仓库的状态，从而决定下一步的操作，比如提交更改或撤销更改。

```
$   git status

On branch master

Initial commit

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        .gitignore
        pom.xml

nothing added to commit but untracked files present (use "git add" to track)
```

## git add

将文件添加到本地仓库的暂存区。

```bash
$ git add .gitignore
```

上面的命令将 `.gitignore` 文件添加到暂存区，准备进行提交。

## git commit

将暂存区的文件提交到本地仓库的历史记录中。

在使用 `git commit` 命令时，通常会附加一条消息来描述此次提交的更改内容，这有助于其他开发者理解你所做的更改。

```bash
$ git commit -m "Add .gitignore file to ignore unnecessary files"
```

上面的命令将暂存区中的文件提交到本地仓库，并附加了一条消息说明此次提交的内容是添加了 `.gitignore` 文件以忽略不必要的文件。

```
$   git commit -m "first commit"

[master (root-commit) 965cf5d] first commit
 1 file changed, 6 insertions(+)
 create mode 100644 .gitignore
```

## git push

将文件推送到远程仓库

```
$   git push

fatal: The current branch master has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin master
```

```
$   git push --set-upstream origin master

Counting objects: 3, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 258 bytes | 0 bytes/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To https://github.com/houbb/git-demo.git
 * [new branch]      master -> master
Branch master set up to track remote branch master from origin.
```

这样，我们可以将另一个文件`README.md`添加到仓库中进行测试，内容为：

```
> Hello Git
```

现在，我们将文件`README.md`编辑为以下内容：

```
> Hello Git
- git diff
```

## git diff

查看本地与仓库之间的差异

```
$   git diff README.md
diff --git a/README.md b/README.md
index adb219f..e5a680e 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,2 @@
-> Hello Git
\ No newline at end of file
```

## git log

显示 git 的提交记录日志

```
$   git log

commit cd84e273e5ac1d42d08090d013696a237b120751
Author: houbinbin <1060732496@qq.com>
Date:   Mon Oct 10 18:43:33 2016 +0800

    git diff

commit 9f18a0cd10ac0eb661ab1a9bf056398c5e6fe6f3
Author: houbinbin <1060732496@qq.com>
Date:   Mon Oct 10 18:14:38 2016 +0800

    add readme

```

`cd84e273e5ac1d42d08090d013696a237b120751` 是 `commit_id`，即提交的唯一标识符。



* any list
{:toc}


