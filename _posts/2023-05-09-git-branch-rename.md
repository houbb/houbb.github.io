---
layout: post
title: git 如何修改分支名称？
date:  2023-05-09 +0800
categories: [GIT]
tags: [tool, git, sh]
published: true
---

# 说明

有时候想修改一下分支名称，然后发现以前没记录过。

此处整理一下，便于以后查阅。


# 常见方法

## 方法一：使用git命令操作修改本地分支名称

1) 修改本地分支名称

```sh
git branch -m oldBranchName newBranchName
```

2) 使用git命令操作修改远程分支名称

将本地分支的远程分支删除

```
git push origin :oldBranchName
```

将改名后的本地分支推送到远程，并将本地分支与之关联

```
git push --set-upstream origin newBranchName
```

## 方法二：IDEA中直接操作

1、修改本地分支名称

![修改本地分支名称](https://img.php.cn/upload/image/441/895/981/1655373071262560.png)

2、将本地分支的远程分支删除

![将本地分支的远程分支删除](https://img.php.cn/upload/image/427/709/314/1655373078858513.png)

3、将改名后的本地分支推送到远程，并将本地分支与之关联

![将改名后的本地分支推送到远程，并将本地分支与之关联](https://img.php.cn/upload/image/456/958/404/1655373085829789.png)

# 小结

实现起来还是不难，主要是对于场景方法封装的思想。

# 参考资料

https://www.php.cn/tool/git/492998.html

* any list
{:toc}