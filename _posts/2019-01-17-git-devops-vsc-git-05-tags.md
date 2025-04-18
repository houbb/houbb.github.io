---
layout: post
title: Git 开源的版本控制系统-05-tags 标签管理
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, git-learn, git-topic, gitlab, sh]
published: true
---

# 标签

- 创建标签

```git tag <标签名> [提交ID]```

- 显示标签

```git tag```

- 显示标签详细信息

```git show <标签名>```


```
houbinbindeMacBook-Pro:git-demo houbinbin$ git branch
  git_demo_1.1
  git_demo_1.2
  git_demo_bug_001
* master
houbinbindeMacBook-Pro:git-demo houbinbin$ git tag v1.0
houbinbindeMacBook-Pro:git-demo houbinbin$ git tag
v1.0
houbinbindeMacBook-Pro:git-demo houbinbin$ git show v1.0
commit 4069a0cc54ee97993850419a09b62023ee3fa711
Author: “houbb” <“1060732496@qq.com”>
Date:   Mon Oct 10 22:48:07 2016 +0800

    fix the bug

diff --git a/README.md b/README.md
index 5664a33..98be30e 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
 > Hello Git
 - git diff
-- git_demo_1.2
\ No newline at end of file
+- git_demo_1.2
+fix the bug
\ No newline at end of file

houbinbindeMacBook-Pro:git-demo houbinbin$ git log --pretty=oneline --abbrev-commit
4069a0c fix the bug
0d899d1 merge with --no-ff
8983fd1 change git_demo_1.2
d696904 add pom.xml
cd84e27 git diff
9f18a0c add readme
965cf5d first commit
houbinbindeMacBook-Pro:git-demo houbinbin$ git tag v0.9 0d899d1
houbinbindeMacBook-Pro:git-demo houbinbin$ git tag
v0.9
v1.0
houbinbindeMacBook-Pro:git-demo houbinbin$ git show tag v0.9
fatal: ambiguous argument 'tag': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
houbinbindeMacBook-Pro:git-demo houbinbin$ git show v0.9
commit 0d899d1e9fa22bc3d8092d4a709abc0174186f79
Merge: d696904 8983fd1
Author: “houbb” <“1060732496@qq.com”>
Date:   Mon Oct 10 22:29:49 2016 +0800

    merge with --no-ff
```


- 添加包含信息的标签

```git tag -a <标签名> -m "信息"``` <提交ID>

```
houbinbindeMacBook-Pro:git-demo houbinbin$ git tag -a v0.1 -m "首次提交标签" 965cf5d
houbinbindeMacBook-Pro:git-demo houbinbin$ git show v0.1
tag v0.1
Tagger: “houbb” <“1060732496@qq.com”>
Date:   Mon Oct 10 23:11:05 2016 +0800

首次提交标签

commit 965cf5db0b2ca8b062d2cd895b7431d37e11a23f
Author: houbinbin <1060732496@qq.com>
Date:   Mon Oct 10 18:05:43 2016 +0800

    first commit
```

- 添加带有 PGP 签名的标签

```git tag -s <标签名> -m "签名"```

> 管理标签


```
houbinbindeMacBook-Pro:git-demo houbinbin$ git tag
v0.1
v0.9
v1.0
houbinbindeMacBook-Pro:git-demo houbinbin$ git tag -d v0.1
Deleted tag 'v0.1' (was 0fc098a)
houbinbindeMacBook-Pro:git-demo houbinbin$ git push origin v0.9
计数对象: 4, 完成。
压缩对象中: 100% (3/3), 完成。
写入对象中: 100% (4/4), 442 bytes | 0 bytes/s, 完成。
总共 4 (delta 1)，复用 0 (delta 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/houbb/git-demo.git
 * [new tag]         v0.9 -> v0.9
houbinbindeMacBook-Pro:git-demo houbinbin$ git push origin --tags
计数对象: 3, 完成。
压缩对象中: 100% (2/2), 完成。
写入对象中: 100% (3/3), 361 bytes | 0 bytes/s, 完成。
总共 3 (delta 0)，复用 0 (delta 0)
To https://github.com/houbb/git-demo.git
 * [new tag]         v1.0 -> v1.0

```

- 移除本地标签

```git tag -d <标签名>```

- 移除远程标签

```git push origin :refs/tags/<标签名>```


* any list
{:toc}


