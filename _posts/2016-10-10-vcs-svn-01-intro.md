---
layout: post
title: Subversion svn 开源的版本控制系统入门介绍 VCS
date:  2016-10-10 16:09:36 +0800
categories: [VCS]
tags: [svn, vcs]
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

# Subversion

Subversion 是一个开源的版本控制系统。

> [subversion](https://subversion.apache.org/)

## 锁定模式

- 严格锁定

    一个文件只能被一个人编辑。
    
- 乐观锁定（推荐）
    
    一个文件可以被不同的人编辑，但有时需要处理冲突。

## 命令

- svn --version

## 问题

无法运行程序 "svn"

```
Cannot load supported formats: Cannot run program "svn": CreateProcess error=2
```

### 解决方法

- 安装 SVN 客户端，选择 **命令行**，因为 SVN 使用命令行工具。

- 设置 IDEA，使用 crtl+alt+s，选择 Version Control -> Subversion -> General。

![subversion](https://raw.githubusercontent.com/houbb/resource/master/img/2016-05-17-subversion.jpg)

# SVN 代码合并

## 主分支

可以直接使用小乌龟找到对应的主分支。

然后这里不建议直接使用 svn 的工具去合并

## compare

beyond compare 工具来处理。

选择一个文件夹和目标文件夹。

然后选择指定的两边文件夹=》【二进制比较】+【显示比较结果】

可以手动根据两边的差异进行处理。

# svn 报错

## 报错信息

svn在commit后报错：is scheduled for addition, but is missing

## 原因

之前用SVN提交过的文件/文件夹，被标记为”add”状态，等待被加入到仓库。

若此时你把这个文件删除了，SVN提交的时候还是会尝试提交这个文件，虽然它的状态已经是 “missing”了。

## 解决方式

直接在报错的文件夹首先 revert，然后选择 all。

将原始的文件全部下载下来，然后再做对应的处理。

再次重新提交。

# 常见命令

仓库信息

```sh
$ svn info
```


# chat

## 详细介绍一下 svn

Subversion（SVN）是一个用于版本控制的开源软件，它可以帮助团队协作开发和管理文件的历史记录。

下面是对SVN的详细介绍：

### 版本控制系统
版本控制系统是一种工具，用于管理文件和代码的不同版本。它们允许用户跟踪文件的变化，回溯到先前的版本，以及在多个用户之间协作开发。

### SVN的特点：
1. **集中式版本控制系统**：与分布式版本控制系统（如Git）不同，SVN采用集中式结构。这意味着它有一个中央服务器，所有的文件版本和历史记录都存储在该服务器上。

2. **稳定性和成熟度**：SVN已经存在很长一段时间，并且经过了广泛的测试和使用。因此，它被认为是非常稳定和成熟的版本控制系统之一。

3. **易于使用**：相对于一些其他版本控制系统，SVN被认为更易于使用和理解，特别是对于那些熟悉传统版本控制系统的开发者。

4. **强大的分支和合并功能**：SVN提供了强大的分支和合并功能，允许团队在不同的开发线上工作，并在需要时将它们合并在一起。

5. **权限控制**：SVN允许管理员设置不同用户或用户组的权限，以控制对存储库中文件和目录的访问。

6. **文件完整性**：SVN确保存储在版本库中的文件完整性，通过使用哈希值来验证文件内容的一致性。

### SVN的基本工作流程：
1. **检出（Checkout）**：从服务器上获取一个工作副本，使您可以在本地进行修改和开发。

2. **更新（Update）**：将服务器上的最新更改应用于您的工作副本，以确保您始终与团队的最新版本保持同步。

3. **提交（Commit）**：将您在本地所做的更改上传到服务器，以便它们成为存储库的一部分。

4. **添加、删除和移动文件**：向存储库添加新文件、删除不再需要的文件，或者移动文件的位置。

5. **分支和合并**：创建新的开发线（分支），在其中进行修改，然后将这些更改合并回主线。

6. **解决冲突**：当多个人同时修改同一文件时，可能会产生冲突。SVN提供工具来解决这些冲突，以确保合并的顺利进行。

### SVN与Git的比较：
- **分布式 vs 集中式**：Git是一种分布式版本控制系统，每个开发者都拥有完整的存储库副本，而SVN是集中式的，依赖于中央服务器。
- **性能**：Git通常在性能上比SVN更快，尤其是在处理大型存储库和分支时。
- **分支和合并**：Git的分支和合并功能通常被认为比SVN更强大和灵活。
- **学习曲线**：SVN通常被认为更容易上手，而Git可能需要更多的学习和理解。

### 结论

SVN是一个功能强大且稳定的版本控制系统，特别适用于那些更喜欢集中式工作流程或对版本控制系统不太熟悉的团队。

然而，随着分布式版本控制系统的兴起，如Git，人们也越来越倾向于使用更灵活和强大的工具。

* any list
{:toc}