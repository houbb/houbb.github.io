---
layout: post
title: Git rollback 回滚到指定版本的内容 + git revert 撤销操作  + git cherry-pick 当前分支上选择性地应用另一个分支上的一个或多个提交
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, git-learn, git-topic, sh]
published: true
---

# 回滚方式

分成两步：

```
$   git log
```

查看历史提交记录，每一个记录都有 HASH 值。

```
$   git reset #{HASH}
```

可以回滚到对应哈希值的提交。

# git reset 用法详解

git reset 命令用于回退版本，可以指定退回某一次提交的版本。

用法介绍

```
git reset [--soft | --mixed | --hard] [HEAD]
```

`--mixed` 为默认，可以不用带该参数，用于重置暂存区的文件与上一次的提交(commit)保持一致，工作区文件内容保持不变。

```
$ git reset HEAD^ # 回退所有内容到上一个版本
$ git reset HEAD^ hello.php # 回退 hello.php 文件的版本到上一个版本
$ git reset 052e
```

`--soft` 参数用于回退到某个版本：

```
$ git reset --soft HEAD
$ git reset --soft HEAD~3 # 回退上上上一个版本
```

`-–hard` 参数撤销工作区中所有未提交的修改内容，将暂存区与工作区都回到上一次版本，并删除之前的所有信息提交：

```
$ git reset --hard HEAD
```

实例：

```
$ git reset --hard HEAD~3 # 回退上上上一个版本
$ git reset --hard bae128 # 回退到某个版本回退点之前的所有信息。
$ git reset --hard origin/master # 将本地的状态回退到和远程的一样
```

HEAD 说明：

```
• HEAD 表示当前版本
• HEAD^ 上一个版本
• HEAD^^ 上上一个版本
• HEAD^^^ 上上上一个版本
• 以此类推…
```

可以使用 ～数字表示

• HEAD~0 表示当前版本
• HEAD~1 上一个版本
• HEAD^2 上上一个版本
• HEAD^3 上上上一个版本
• 以此类推…

```
$ git reset HEAD
$ git reset HEAD 命令用于取消已缓存的内容。
```

# chat 详细介绍

## git 查看历史的提交记录，回滚到指定版本

要查看 Git 历史的提交记录并回滚到指定版本，可以按照以下步骤进行操作：

1. **查看提交历史记录：** 使用 `git log` 命令查看提交历史记录，以便确定要回滚到的目标版本的哈希值（commit hash）。在命令行中输入：

   ```bash
   git log
   ```

   这将显示你的提交历史，每个提交都有一个唯一的哈希值。

2. **找到目标版本的哈希值：** 在提交历史中找到你想要回滚到的目标版本的哈希值。复制这个哈希值，以备后用。

3. **回滚到指定版本：** 使用 `git reset` 命令将 HEAD 指针移动到目标版本，同时也可以选择更新工作目录以匹配这个提交。在命令行中输入：

   ```bash
   git reset --hard <目标版本的哈希值>
   ```

   替换 `<目标版本的哈希值>` 为你复制的目标版本的实际哈希值。
   
   这会将 HEAD 指针移动到目标版本，并更新你的工作目录以与该版本相匹配。

4. **强制推送更改（可选）：** 如果你是在一个共享的远程仓库上工作，且你已经回滚到本地仓库中的某个提交，你可能需要将这些更改推送到远程仓库。

这是一个潜在的破坏性操作，因为它会覆盖远程仓库中的历史。在执行之前，请确保你理解这个操作的影响。要强制推送，可以使用以下命令：

   ```bash
   git push origin HEAD --force
   ```

   这将把本地的 HEAD 强制推送到远程仓库。

请注意，回滚操作可能会永久性地删除你的历史提交，因此在执行之前请务必备份重要数据或确保你了解操作的后果。


## git reset --hard 中的 hard 是什么意思？可以不指定吗

在 Git 中，`git reset` 命令用于将分支的 HEAD 指针移动到不同的提交，从而影响工作目录和索引（暂存区）的状态。

`--hard` 是 `git reset` 命令的一个选项，用于指定重置模式。不同的重置模式会影响工作目录、暂存区和提交历史的状态。

`--hard` 模式意味着重置模式是“硬重置”，它会强制将工作目录、暂存区和提交历史都重置到指定的提交，从而丢弃了当前分支在目标提交之后的所有更改。这是一个比较激进的操作，因为它会永久性地删除更改。

如果不指定重置模式，`git reset` 默认将使用 `--mixed` 模式。

在 `--mixed` 模式下，HEAD 指针会被移动到指定的提交，但工作目录的文件不会受到影响，暂存区会被重置为目标提交，这意味着你可以重新选择哪些更改要暂存。不过，这些更改不会被永久性地删除。

另外，还有一个 `--soft` 重置模式，它会将 HEAD 指针移动到指定的提交，但工作目录和暂存区都不会受到影响。这个模式适用于你希望重新提交之前的更改，或者将一系列提交合并成一个提交。

总之，`--hard` 是一种较为激进的重置模式，它会彻底丢弃当前分支在目标提交之后的所有更改。

如果你不确定是否要使用 `--hard`，可以在操作前备份你的重要数据或者使用其他模式进行试验。

# 实战测试记录

## 提交记录

```
$ git log

commit 6823b87d2114f2ad81abae866237e4ad1b198ee7 (HEAD -> master, origin/master, origin/HEAD)
Author: binbin.hou <binbin.hou@xx.com>
Date:   Wed Aug 16 09:35:36 2023 +0800

    v2

commit c828db9916bd7c7378b699659b55fca009edf6a8
Author: binbin.hou <binbin.hou@xx.com>
Date:   Wed Aug 16 09:35:17 2023 +0800

    v1

commit edabef1a3db13fd2390e352dfd74d5c091852643
Author: binbin.hou <binbin.hou@xx.com>
Date:   Fri Jul 21 09:05:59 2023 +0800

    add test code
```

## 回滚到指定版本

我们先回滚到 v1 试一下，哈希 c828db9916bd7c7378b699659b55fca009edf6a8

```
$   git reset c828db9916bd7c7378b699659b55fca009edf6a8
```

内容：

```
> git reset c828db9916bd7c7378b699659b55fca009edf6a8
Unstaged changes after reset:
M       version.txt
```

这个时候，version.txt 就会变成一个变更，但是没有提交的文件内容。此时 version.txt 内容是 v2。

但是这里只是保存当时提交的变更内容，如果**我们想直接回滚对应的代码，这种好像不是很好用**。

# git revert

## 一、初级用法

git revert 撤销某次操作，此次操作之前和之后的commit和history都会保留，并且把这次撤销，作为一次最新的提交。 

```
git revert HEAD                  撤销前一次 commit
git revert HEAD^               撤销前前一次 commit    
git revert commit_id （比如:fa042ce57ebbe5bb9c8db709f719cec2c58ee7ff）
```

git revert是提交一个新的版本，将需要revert的版本的内容再反向修改回去，版本会递增，不影响之前提交的内容.

Tip: 通常情况下，上面这条revert命令会让程序员修改注释，这时候程序员应该标注revert的原因，假设程序员就想使用默认的注释，可以在命令中加上-n或者--no-commit，应用这个参数会让revert 改动只限于程序员的本地仓库，而不自动进行commit，如果程序员想在revert之前进行更多的改动，或者想要revert多个commit。


## 二、进阶用法

当有多个commit需要撤销，有可能是连续的，或是不连续的，那该怎么操作？

### 1.连续

```
git revert -n commit_id_start..commit_id_end
```

使用该命令可以将提交撤回到commit_id_start的位置

### 2.不连续

```
git revert -n commit_id_1
git revert -n commit_id_3
```

使用该命令可以撤回到commit_id_1和commit_id_3的提交

## idea 用法

idea 可以选中提交记录，然后点击 revert commits。

这时会把选中的提交记录，都声称对应的 revert 操作，我们最后做一次 push 即可。

# git cheery pick

`git cherry-pick` 是 Git 提供的一个命令，用于在当前分支上选择性地应用另一个分支上的一个或多个提交。这个命令允许你从其他分支中挑选单个提交并将它们应用到当前分支，而无需合并整个分支的更改。

使用 `git cherry-pick` 的基本语法如下：

```bash
git cherry-pick <commit-hash>
```

其中，`<commit-hash>` 是要应用的目标提交的哈希值。

你可以在一个分支上使用 `git cherry-pick` 来选择性地应用另一个分支上的提交。这在以下情况下可能会很有用：

1. **单独应用特定的修复或功能提交：** 如果你在一个分支上工作，但需要在另一个分支上应用某些修复或功能，可以使用 `git cherry-pick` 将这些提交应用到你的分支。

2. **从一个分支中获取一部分更改：** 有时候你可能只需要另一个分支上的某个提交，而不想合并整个分支。这时可以使用 `git cherry-pick` 来选择性地获取这些更改。

3. **解决冲突：** 如果在合并或 rebase 过程中发生冲突，你可以使用 `git cherry-pick` 来选择性地应用某些提交，并解决冲突。

需要注意的是，`git cherry-pick` 可能会引起冲突，特别是如果你选择的提交在当前分支的上下文中无法简单地应用。在这种情况下，你需要解决冲突，然后使用 `git cherry-pick --continue` 完成操作。

总之，`git cherry-pick` 是一个强大的命令，可以在不合并整个分支的情况下选择性地应用提交，但在使用时要小心处理可能出现的冲突情况。


# 参考资料

chat

[git reset 用法详解](https://blog.csdn.net/weixin_41044151/article/details/113994950)

[git revert 用法](https://blog.csdn.net/shenfengchen/article/details/109336486)

* any list
{:toc}

