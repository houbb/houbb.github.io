---
layout: post
title: Git 开源的版本控制系统-07-gitignore 指定忽略版本管理的文件
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


# Git ignore 

## 基本例子


- ```.gitignore``` 忽略文件

这个文件可以配置你不想提交的文件类型。

```
# maven ignore
target/
*.jar
*.war
*.zip
*.tar
*.tar.gz

# eclipse ignore
.settings/
.project
.classpath

# idea ignore
.idea/
*.ipr
*.iml
*.iws
```



## 可以自动生成的网址

众所周知，`.gitignore` 文件用起来很方便。但是却需要我们手动去编写，

[gitignore.io](https://www.gitignore.io/) 可以通过我们的勾选，生成对应的忽略文件。

# Git 子模块

> [gitmodules](https://git-scm.com/docs/gitmodules)

> [Git Submodule使用完整教程](http://www.kafeitu.me/git/2012/03/27/git-submodule.html)

# 参考资料

> [如何上传本地代码到github上](http://www.jianshu.com/p/08656eb84974)

* any list
{:toc}


