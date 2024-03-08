---
layout: post
title: Git 开源的版本控制系统-04-branch manage 分支管理
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


# 分支管理

- 查看分支

> 本地

```
$   git branch
```

> 远程

```
$   git branch -r
```

> 所有

```
$   git branch -a
```


- 创建与切换

```
houbinbindeMacBook-Pro:git-demo houbinbin$ git branch git_demo_1.1
houbinbindeMacBook-Pro:git-demo houbinbin$ git branch
  git_demo_1.1
* master
houbinbindeMacBook-Pro:git-demo houbinbin$ git checkout git_demo_1.1
切换到分支 'git_demo_1.1'
houbinbindeMacBook-Pro:git-demo houbinbin$
```

与以下命令相同

```
$   git checkout -b <name>
```

- 推送分支到 Github

```
$   git push origin [分支名]
```

- 删除分支

本地

```
$   git branch -d [分支名]
```

Github 远程

```
$   git push origin --delete <分支名>
```


- [合并分支](http://blog.csdn.net/syc434432458/article/details/51861483)

> [git wiki](https://github.com/Kunena/Kunena-Forum/wiki/Create-a-new-branch-with-git-and-manage-branches)

![idea](https://raw.githubusercontent.com/houbb/resource/master/img/git/2016-09-02-git-merge.png)

```

$ git checkout master

$ git pull

$ git checkout 分支

$ git rebase master     (用rebase合并主干的修改，如果有冲突在此时解决)

$ git checkout master

$ git merge 分支

$ git push

```

- 推送

注意，合并后它没有暂存区，所以，提交会告诉你没有变化。

您应该使用 ```git push origin master```

```
$   git push    //推送到当前分支
$   git push origin master  //推送到主分支
```

- 分支合并提示

通常，当合并时，git 会使用 ```Fast Forward``` 模式，我们可以使用 ```--no-ff``` 进行合并。

```
houbinbindeMacBook-Pro:git-demo houbinbin$ git checkout -b git_demo_1.2
切换到一个新分支 'git_demo_1.2'

houbinbindeMacBook-Pro:git-demo houbinbin$ git add README.md
houbinbindeMacBook-Pro:git-demo houbinbin$ git commit -m "change git_demo_1.2"
[git_demo_1.2 8983fd1] change git_demo_1.2
 1 file changed, 2 insertions(+), 1 deletion(-)

houbinbindeMacBook-Pro:git-demo houbinbin$ git checkout master
切换到分支 'master'
您的分支与 'origin/master' 一致。
houbinbindeMacBook-Pro:git-demo houbinbin$ git merge --no-ff -m "merge with --no-ff" git_demo_1.2
合并分支 'git_demo_1.2' 到 'master'
Fast-forward
 README.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

现在，查看日志

```
houbinbindeMacBook-Pro:git-demo houbinbin$ git log --graph --pretty=oneline --abbrev-commit
*   0d899d1 merge with --no-ff
|\
| * 8983fd1 change git_demo_1.2
|/
* d696904 add pom.xml
* cd84e27 git diff
* 9f18a0c add readme
* 965cf5d first commit
```


- 删除本地分支

```
$   git branch -d xxxxx
```

## Bug 分支

如果在工作的过程中，您必须解决其他问题。

例如，您在分支 ```1.2``` 上编写了一些东西，但是有一个 bug 需要修复，我们应该如何处理？

- git stash

这个命令可以保存当前的工作状态。

```
houbinbindeMacBook-Pro:git-demo houbinbin$ git status
在分支 master
您的分支领先 'origin/master' 2 个提交。
  （使用 "git push" 来发布您的本地提交）
未暂存的变更：
  （使用 "git add <file>..." 更新要提交的内容）
  （使用 "git checkout -- <file>..." 丢弃工作区的更改）

        修改：     README.md

没有要提交的变更（使用 "git add" 和/或 "git commit -a"）
```

现在，我们可以切换到 master 分支并解决 bug。

```
houbinbindeMacBook-Pro:git-demo houbinbin$ git checkout master
已经位于 'master'
您的分支领先 'origin/master' 2 个提交。
  （使用 "git push" 来发布您的本地提交）
houbinbindeMacBook-Pro:git-demo houbinbin$ git checkout -b git_demo_bug_001
切换到一个新分支 'git_demo_bug_001'
houbinbindeMacBook-Pro:git-demo houbinbin$ git add README.md
houbinbindeMacBook-Pro:git-demo houbinbin$ git commit -m "fix the bug"
[git_demo_bug_001 4069a0c] 修复 bug
 1 file changed, 2 insertions(+), 1 deletion(-)

houbinbindeMacBook-Pro:git-demo houbinbin$ git checkout master
切换到分支 'master'
您的分支领先 'origin/master' 2 个提交。
  （使用 "git push" 来发布您的本地提交）
houbinbindeMacBook-Pro:git-demo houbinbin$ git merge git_demo_bug_001
更新 0d899d1..4069a0c
Fast-forward
 README.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

```

修复了 bug 后，我们可以切换到 ```1.2``` 分支，继续工作

```
houbinbindeMacBook-Pro:git-demo houbinbin$ git stash list
stash@{0}: 在 master 上 WIP： 0d899d1 merge

 with --no-ff
houbinbindeMacBook-Pro:git-demo houbinbin$ git stash pop
切换到分支 'git_demo_1.2'
未暂存的变更：
  （使用 "git add <file>..." 更新要提交的内容）
  （使用 "git checkout -- <file>..." 丢弃工作区的更改）

        修改：     README.md

没有要提交的变更（使用 "git add" 和/或 "git commit -a"）
Dropped refs/stash@{0} (9cd4d92f41db2cdb1b8e15ffde7c73c4fd6ef83c)
houbinbindeMacBook-Pro:git-demo houbinbin$ git stash list
```


* any list
{:toc}


