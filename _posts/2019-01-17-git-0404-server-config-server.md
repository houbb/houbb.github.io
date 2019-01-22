---
layout: post
title: Git 服务器上的 Git 之配置服务器-4.4
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, sh]
published: true
excerpt: Git 服务器上的 Git 之配置服务器-4.4
---

# 4.4 服务器上的 Git - 配置服务器

我们来看看如何配置服务器端的 SSH 访问。 

本例中，我们将使用 authorized_keys 方法来对用户进行认证。 

同时我们假设你使用的操作系统是标准的 Linux 发行版，比如 Ubuntu。 

## 创建用户

首先，创建一个操作系统用户 git，并为其建立一个 .ssh 目录。

```
$ sudo adduser git
$ su git
$ cd
$ mkdir .ssh && chmod 700 .ssh
$ touch .ssh/authorized_keys && chmod 600 .ssh/authorized_keys
```

## 添加公钥

接着，我们需要为系统用户 git 的 authorized_keys 文件添加一些开发者 SSH 公钥。 

假设我们已经获得了若干受信任的公钥，并将它们保存在临时文件中。 与前文类似，这些公钥看起来是这样的：

```
$ cat /tmp/id_rsa.john.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCB007n/ww+ouN4gSLKssMxXnBOvf9LGt4L
ojG6rs6hPB09j9R/T17/x4lhJA0F3FR1rP6kYBRsWj2aThGw6HXLm9/5zytK6Ztg3RPKK+4k
Yjh6541NYsnEAZuXz0jTTyAUfrtU3Z5E003C4oxOj6H0rfIF1kKI9MAQLMdpGW1GYEIgS9Ez
Sdfd8AcCIicTDWbqLAcU4UpkaX8KyGlLwsNuuGztobF8m72ALC/nLF6JLtPofwFBlgc+myiv
O7TCUSBdLQlgMVOFq1I2uPWQOkOWQAHukEOmfjy2jctxSDBQ220ymjaNsHT4kgtZg2AYYgPq
dAv8JggJICUvax2T9va5 gsg-keypair
```

将这些公钥加入系统用户 git 的 .ssh 目录下 authorized_keys 文件的末尾：

```
$ cat /tmp/id_rsa.john.pub >> ~/.ssh/authorized_keys
$ cat /tmp/id_rsa.josie.pub >> ~/.ssh/authorized_keys
$ cat /tmp/id_rsa.jessica.pub >> ~/.ssh/authorized_keys
```

## 新建空仓库

现在我们来为开发者新建一个空仓库。可以借助带 --bare 选项的 git init 命令来做到这一点，该命令在初始化仓库时不会创建工作目录：

```
$ cd /opt/git
$ mkdir project.git
$ cd project.git
$ git init --bare
Initialized empty Git repository in /opt/git/project.git/
```

接着，John、Josie 或者 Jessica 中的任意一人可以将他们项目的最初版本推送到这个仓库中，他只需将此仓库设置为项目的远程仓库并向其推送分支。 请注意，每添加一个新项目，都需要有人登录服务器取得 shell，并创建一个裸仓库。 我们假定这个设置了 git 用户和 Git 仓库的服务器使用 gitserver 作为主机名。 同时，假设该服务器运行在内网，并且你已在 DNS 配置中将 gitserver 指向此服务器。那么我们可以运行如下命令（假定 myproject 是已有项目且其中已包含文件）：

```
# on John's computer
$ cd myproject
$ git init
$ git add .
$ git commit -m 'initial commit'
$ git remote add origin git@gitserver:/opt/git/project.git
$ git push origin master
```

此时，其他开发者可以克隆此仓库，并推回各自的改动，步骤很简单：

```
$ git clone git@gitserver:/opt/git/project.git
$ cd project
$ vim README
$ git commit -am 'fix for the README file'
$ git push origin master
```

通过这种方法，你可以快速搭建一个具有读写权限、面向多个开发者的 Git 服务器。

需要注意的是，目前所有（获得授权的）开发者用户都能以系统用户 git 的身份登录服务器从而获得一个普通 shell。 如果你想对此加以限制，则需要修改 passwd 文件中（git 用户所对应）的 shell 值。

借助一个名为 git-shell 的受限 shell 工具，你可以方便地将用户 git 的活动限制在与 Git 相关的范围内。该工具随 Git 软件包一同提供。 如果将 git-shell 设置为用户 git 的登录 shell（login shell），那么用户 git 便不能获得此服务器的普通 shell 访问权限。 若要使用 git-shell，需要用它替换掉 bash 或 csh，使其成为系统用户的登录 shell。 

为进行上述操作，首先你必须确保 git-shell 已存在于 /etc/shells 文件中：

```
$ cat /etc/shells   # see if `git-shell` is already in there.  If not...
$ which git-shell   # make sure git-shell is installed on your system.
$ sudo vim /etc/shells  # and add the path to git-shell from last command
```

现在你可以使用 `chsh <username>` 命令修改任一系统用户的 shell：

```
$ sudo chsh git  # and enter the path to git-shell, usually: /usr/bin/git-shell
```

这样，用户 git 就只能利用 SSH 连接对 Git 仓库进行推送和拉取操作，而不能登录机器并取得普通 shell。 

如果试图登录，你会发现尝试被拒绝，像这样：

```
$ ssh git@gitserver
fatal: Interactive git shell is not enabled.
hint: ~/git-shell-commands should exist and have read and execute access.
Connection to gitserver closed.
```

现在，网络相关的 Git 命令依然能够正常工作，但是开发者用户已经无法得到一个普通 shell 了。 正如输出信息所提示的，你也可以在 git 用户的家目录下建立一个目录，来对 git-shell 命令进行一定程度的自定义。 比如，你可以限制掉某些本应被服务器接受的 Git 命令，或者对刚才的 SSH 拒绝登录信息进行自定义，这样，当有开发者用户以类似方式尝试登录时，便会看到你的信息。 

要了解更多有关自定义 shell 的信息，请运行 `git help shell`。

# 参考资料

[4.4 服务器上的 Git - 配置服务器](https://git-scm.com/book/zh/v2/%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B8%8A%E7%9A%84-Git-%E9%85%8D%E7%BD%AE%E6%9C%8D%E5%8A%A1%E5%99%A8)

* any list
{:toc}

