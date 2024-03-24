---
layout: post
title: Gitlab
date:  2017-01-14 02:17:01 +0800
categories: [Devops]
tags: [gitlab, git, devops, vcs]
published: true
---

# 前言

个人是个开源主义者。

但是有时不是涉及到个人利益而是公司利益时。。。

还是选择```Gitlab```放一下自己写的小DEMO。

以后将使用自己搭建的 phabricator。

# GitLab

[GitLab](https://about.gitlab.com/) 将问题、代码审查、CI 和 CD 统一到单一的用户界面中。

顺便一提，此作者在项目管理方面做得不错。

有时间可以看看。

- 也可以直接使用 GitHub 通过 ```OAuth``` 登录。很方便。

# 快速入门

- 新建组

```
https://gitlab.com/think-less
```

- 新建项目

```
https://gitlab.com/think-less/script-generator.git
```

- 添加 SSH

```
$ pwd
/Users/houbinbin/.ssh
$ ls
id_rsa		id_rsa.pub	known_hosts
```

上传 ```id_rsa.pub``` 就可以了。

- 使用

命令行指令

Git 全局设置

```
git config --global user.name "houbb"
git config --global user.email "1060732496@qq.com"
```

创建一个新的仓库

```
git clone git@gitlab.com:think-less/script-generator.git
cd script-generator
touch README.md
git add README.md
git commit -m "add README"
git push -u origin master
```

现有文件夹或 Git 仓库

```
cd existing_folder
git init
git remote add origin git@gitlab.com:think-less/script-generator.git
git add .
git commit
git push -u origin master
```

# wiki

> [wiki](http://www.cnblogs.com/moshang-zjn/p/5757430.html)


# Jenkins 整合

> [Jenkins 整合](https://docs.gitlab.com/ee/integration/jenkins.html)

# 参考资料

> [wiki](http://www.cnblogs.com/moshang-zjn/p/5757430.html)

> [manage blog](http://blog.csdn.net/huaishu/article/details/50475175)

> [Group & Project & User](http://comedsh.iteye.com/blog/2238338)

* any list
{:toc}