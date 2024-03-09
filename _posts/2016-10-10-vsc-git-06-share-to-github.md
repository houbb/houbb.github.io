---
layout: post
title: Git 开源的版本控制系统-06-share to github 如何把项目代码共享到 github
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


# 将项目分享到 GitHub

- 初始化 Git

```
git init
```

- 添加文件

```
git add .
```

- 提交文件

```
git commit -m "提交描述"
```

- 在 [GitHub](https://github.com) 上创建仓库

- 将本地仓库添加到远程仓库

```
git remote add origin https://github.com/houbb/mybatisNet.git
```

- 推送

```
git push -u origin master
```

# 常见错误

1、fatal: remote origin already exists.

```
$   git remote rm origin
```

然后重新添加：

```
$   git remote add origin https://github.com/houbb/mybatisNet.git
```

2、[由于当前分支的顶部落后，因此更新被拒绝](http://blog.csdn.net/shiren1118/article/details/7761203)

```
$   git push -u origin master -f 
```

这会导致强制覆盖，可能会导致数据丢失。

# git 初始化 & 导入到 Github

1、如果你使用的是 **IntelliJ IDEA**，你可以使用这种方式：

```
VCS -> 导入版本控制 -> 在 Github 上共享项目
```

2、通用方法

- 在命令行上创建一个新的仓库

```sh
echo "# git-demo" >> README.md
git init
git add README.md
git commit -m "首次提交"
git remote add origin https://github.com/houbb/git-demo.git
git push -u origin master
```

- 将现有仓库推送到 Github（通过命令行）

```sh
git remote add origin https://github.com/houbb/git-demo.git
git push -u origin master
```

请注意，以上命令中的 `master` 分支可能在较新版本的 Git 中被 `main` 分支替代，这取决于你的 Git 配置和 Git 服务提供商（如 Github）的默认设置。

如果提示分支不存在，你可能需要改用 `main` 分支或者检查你的远程仓库使用的默认分支名。

# Share to Github 分享到 github

或者，在命令行上创建一个新的仓库：

```bash
echo "# quartz-book" >> README.md
git init
git add README.md
git commit -m "首次提交"
git remote add origin https://github.com/houbb/quartz-book.git
git push -u origin master
```

或者，将现有仓库推送到 Github（通过命令行）：

```bash
git remote add origin https://github.com/houbb/quartz-book.git
git push -u origin master
```

同样需要注意的是，如果你的仓库使用 `main` 分支作为默认分支（这在较新版本的 Git 仓库中更为常见），你需要将上述命令中的 `master` 替换为 `main`。

否则，你可能会遇到找不到分支的错误。如果仓库中已经存在 `master` 分支，则可以继续使用 `master`。

在推送之前，请确保你已经设置了正确的远程仓库地址，并且你有权限向该仓库推送代码。如果仓库是私有的，你还需要确保你有访问该仓库的权限。

另外，如果你正在推送一个已经存在的本地仓库，那么在你执行 `git push` 命令之前，你应该已经在本地执行了 `git add` 和 `git commit` 命令来暂存并提交你的更改。

上述第二个命令块假设你已经完成了这些步骤，并且只是将本地仓库与远程仓库关联起来并推送更改。

# 参考资料

> [如何上传本地代码到github上](http://www.jianshu.com/p/08656eb84974)

> [常见错误](http://blog.163.com/023_dns/blog/static/1187273662013111301046930/)

* any list
{:toc}


