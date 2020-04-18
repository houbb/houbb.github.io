---
layout: post
title: Github-11-ssh key
date:  2019-2-25 14:33:11 +0800
categories: [Tool]
tags: [github, pic, sh]
published: true
---

# 背景

有时候想通过 ssh 直接访问 github，那么就需要将 ssh key 上传到 github。

# ssh key 生成

## 一、检查本地是否有SSH Key存在

在终端输入

```
ls -al ~/.ssh
```

如果终端输出的是：


```
No such file or directory
```

那么就说明本地没有SSH key

如果已存在SSH key那么就会显示 id_rsa 和 id_rsa.pub文件的存在以及它的创建日期。

我本地这个目录下没有对应的文件信息。

## 二、生成新的SSH key

首先在终端输入

```
ssh-keygen -t rsa -C "xxx@yy.com"
```

xxx@yy.com 是 github 注册对应的邮箱。

回车后提示

```
Generating public/private rsa key pair.

Enter file in which to save the key (/Users/xxx/.ssh/id_rsa):
```

提示你保存 .ssh/id_rsa 的路径是/Users/xxx/.ssh/id_rsa，直接按回车。

这里有一点，如果已经存在SSH key你想要使用以上操作重新生成的话会提示一你不是要重新生成，直接输入y并按回车。

最后会提示你生成成功。

```
Your identification has been saved in /c/Users/xxx/.ssh/id_rsa.
Your public key has been saved in /c/Users/xxx/.ssh/id_rsa.pub.
```

## 三、查看

直接执行下面的命令可以拿到公匙。 

```
cat /c/Users/xxx/.ssh/id_rsa.pub
```

## 上传到 github

点击 github [https://github.com/settings/keys](https://github.com/settings/keys) 进行个人设置。

选择【New SSH Key】然后将刚才获取的公匙复制保存。


# git 配置查看

## 查看配置信息

```
git config --list
```

这样就能够查看配置的信息了

## 查看邮箱和用户

```
git config user.name

git config user.email
```

## 修改配置

```
git config --global user.name "这个地方写名字"

git config --global user.email "这个地方写邮箱"
```

# 参考资料

[如何生成SSH KEY及查看SSH KEY](https://www.cnblogs.com/zheng577564429/p/8317524.html)

* any list
{:toc}