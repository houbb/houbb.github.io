---
layout: post
title: Git 服务器上的 Git 之守护进程-4.5
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, sh]
published: true
excerpt: Git 服务器上的 Git 之守护进程-4.5
---

# Git 服务器上的 Git 之守护进程-4.5

接下来我们将通过 “Git” 协议建立一个基于守护进程的仓库。 对于快速且无需授权的 Git 数据访问，这是一个理想之选。 请注意，因为其不包含授权服务，任何通过该协议管理的内容将在其网络上公开。

如果运行在防火墙之外的服务器上，它应该只对那些公开的只读项目服务。 如果运行在防火墙之内的服务器上，它可用于支撑大量参与人员或自动系统（用于持续集成或编译的主机）只读访问的项目，这样可以省去逐一配置 SSH 公钥的麻烦。

无论何时，该 Git 协议都是相对容易设定的。 通常，你只需要以守护进程的形式运行该命令：

```
git daemon --reuseaddr --base-path=/opt/git/ /opt/git/
```

`--reuseaddr` 允许服务器在无需等待旧连接超时的情况下重启，--base-path 选项允许用户在未完全指定路径的条件下克隆项目，结尾的路径将告诉 Git 守护进程从何处寻找仓库来导出。 如果有防火墙正在运行，你需要开放端口 9418 的通信权限。

你可以通过许多方式将该进程以守护进程的方式运行，这主要取决于你所使用的操作系统。 

在一台 Ubuntu 机器上，你可以使用一份 Upstart 脚本。 因此，找到如下文件：

```
/etc/event.d/local-git-daemon
```

并添加下列脚本内容：

```
start on startup
stop on shutdown
exec /usr/bin/git daemon \
    --user=git --group=git \
    --reuseaddr \
    --base-path=/opt/git/ \
    /opt/git/
respawn
```

出于安全考虑，强烈建议使用一个对仓库拥有只读权限的用户身份来运行该守护进程 - 你可以创建一个新用户 git-ro 并且以该用户身份来运行守护进程。 为简便起见，我们将像 git-shell 一样，同样使用 git 用户来运行它。

当你重启机器时，你的 Git 守护进程将会自动启动，并且如果进程被意外结束它会自动重新运行。 为了在不重启的情况下直接运行，你可以运行以下命令：

```
initctl start local-git-daemon
```

在其他系统中，你可以使用 sysvinit 系统中的 xinetd 脚本，或者另外的方式来实现 - 只要你能够将其命令守护进程化并实现监控。

接下来，你需要告诉 Git 哪些仓库允许基于服务器的无授权访问。 你可以在每个仓库下创建一个名为 git-daemon-export-ok 的文件来实现。

```
$ cd /path/to/project.git
$ touch git-daemon-export-ok
```

该文件将允许 Git 提供无需授权的项目访问服务。


# 参考资料

[4.5 服务器上的 Git - Git 守护进程](https://git-scm.com/book/zh/v2/%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B8%8A%E7%9A%84-Git-Git-%E5%AE%88%E6%8A%A4%E8%BF%9B%E7%A8%8B)

* any list
{:toc}

