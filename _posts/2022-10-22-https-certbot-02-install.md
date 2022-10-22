---
layout: post
title: Let’s Encrypt 证书免费 HTTPS 部署工具 Certbot 介绍-02-获取安装 certbot
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, maven, sh]
published: true
---


# 系统要求

1. Linux、macOS、BSD 和 Windows

2. Linux/BSD 上的推荐 root 访问权限/Windows 上所需的管理员访问权限

3. 端口 80 打开

- NOTE

Certbot 在以 root 权限运行时最有用，因为它能够自动为 Apache 和 nginx 配置 TLS/SSL。

Certbot 旨在直接在 Web 服务器上运行，通常由系统管理员运行。 

在大多数情况下，在您的个人计算机上运行 Certbot 并不是一个有用的选择。

以下说明与在服务器上安装和运行 Certbot 有关。

## 安装

除非您有非常具体的要求，否则我们建议您使用 https://certbot.eff.org/instructions 上的系统安装说明。

比如我们选择的是 WEB 容器（比如 tomcat），系统是 centos 7。

[https://certbot.eff.org/instructions?ws=webproduct&os=centosrhel7](https://certbot.eff.org/instructions?ws=webproduct&os=centosrhel7)

上面的网站会给出一系列的操作流程。

### SNAP 快照（推荐）

我们的说明在所有使用 Snap 的系统中都是相同的。

您可以在 https://certbot.eff.org/instructions 找到通过 Snap 安装 Certbot 的说明，方法是选择您的服务器软件，然后在“系统”下拉菜单中选择“snapd”。

大多数现代 Linux 发行版（基本上任何使用 systemd 的发行版）都可以安装打包为 snap 包的 Certbot。

快照可用于 x86_64、ARMv7 和 ARMv8 架构。 Certbot snap 提供了一种简单的方法来确保您拥有最新版本的 Certbot，并具有预配置的自动证书更新等功能。

如果您无法使用 snap，您可以使用另一种方法来安装 certbot。

### 备选方案 1：Docker

Docker 是一种非常简单快捷的获取证书的方法。

但是，这种操作模式无法安装证书或配置您的网络服务器，因为我们的安装程序插件无法从 Docker 容器内部访问您的网络服务器。

大多数用户应该使用 certbot.eff.org 上的说明。只有在确定自己知道自己在做什么并且有充分理由这样做的情况下，才应该使用 Docker。

您绝对应该阅读我的证书在哪里？部分，以便了解如何手动管理证书。我们的密码套件页面提供了一些有关推荐密码套件的信息。如果这些对您没有多大意义，您绝对应该使用 certbot.eff.org 为您的系统推荐的安装方法，这使您能够使用涵盖这两个难题的安装程序插件。

如果您仍然不相信并决定使用此方法，请从您请求证书的域解析到的服务器，安装 Docker，然后发出如下所示的命令。

如果您将 Certbot 与独立插件一起使用，则需要通过在 certbot/certbot 之前的命令行中包含 -p 80:80 或 -p 443:443 之类的内容，使其使用的端口可从容器外部访问。

```
sudo docker run -it --rm --name certbot \
            -v "/etc/letsencrypt:/etc/letsencrypt" \
            -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
            certbot/certbot certonly
```

使用 certonly 命令运行 Certbot 将获得一个证书并将其放置在您系统上的目录 /etc/letsencrypt/live 中。 

由于 Certonly 无法从 Docker 中安装证书，因此您必须按照 Web 服务器提供商推荐的程序手动安装证书。

在 https://hub.docker.com/u/certbot 上还提供了适用于 Certbot 的每个 DNS 插件的 Docker 映像，它们可以自动为流行的提供商通过 DNS 进行域验证。 

要使用其中一个，只需将上面命令中的 certbot/certbot 替换为您要使用的图像的名称。 

例如，要使用 Certbot 的 Amazon Route 53 插件，您可以使用 certbot/dns-route53。 您可能还需要向 Certbot 添加标志和/或挂载其他目录，以提供对 DNS 插件文档中指定的 DNS API 凭据的访问权限。

有关 /etc/letsencrypt 目录布局的更多信息，请参阅我的证书在哪里？。

### 备选方案 2：PIP 点

仅在尽力而为和使用虚拟环境时才支持通过 pip 安装 Certbot。 

可以在 https://certbot.eff.org/instructions 找到通过 pip 安装 Certbot 的说明，方法是选择您的服务器软件，然后在“系统”下拉菜单中选择“pip”。

### 备选方案 3：Third Party Distributions 第三方分发

存在第三方分发以满足其他特定需求。 

它们通常由 Certbot 之外的这些方维护，并且往往在 LTS 风格的发行版中迅速过时。

# 参考资料

https://eff-certbot.readthedocs.io/en/stable/install.html

* any list
{:toc}