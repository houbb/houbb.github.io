---
layout: post
title:  Nginx R31 doc 官方文档-01-nginx 如何安装
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# nginx

### 安装 NGINX Open Source

安装 NGINX Open Source 可以选择预构建包或从源代码安装，在所有支持的 Linux 发行版上按步骤进行。

本文介绍了如何安装 NGINX Open Source。

### 选择稳定版或主线版

NGINX Open Source 有两个版本可供选择：

- **主线版**：包含最新功能和 bug 修复，始终保持更新。它是可靠的，但可能包含一些实验性模块，并且可能会有一些新的错误。

- **稳定版**：不包含所有最新功能，但具有始终被反向移植到主线版本的关键 bug 修复。我们建议在生产服务器上使用稳定版。

### 选择预构建包还是从源代码编译

NGINX Open Source 主线版和稳定版均可通过两种方式安装：

- 作为预构建的二进制包。这是安装 NGINX Open Source 的一种快速简便的方式。该包包含几乎所有官方 NGINX 模块，并且适用于大多数流行的操作系统。请参阅[安装预构建包](#)。
- 作为您从源代码编译的二进制文件。这种方式更灵活：您可以添加特定的模块，包括第三方模块，或应用最新的安全补丁。有关详细信息，请参阅[编译和从源代码安装](#)。

### 安装预构建包

从包中安装 NGINX Open Source 比从源代码构建要简单快速得多，但从源代码构建使您能够编译非标准模块。预构建包适用于大多数流行的 Linux 发行版，包括 CentOS、Debian、Red Hat Enterprise Linux (RHEL)、SUSE Linux Enterprise Server (SLES) 和 Ubuntu。请查看 nginx.org 上的 Linux 包以获取当前支持的操作系统列表。

### 预构建包中包含的模块

请查看 nginx.org 上的源代码包，以获取每个预构建包中包含的模块列表。

### 安装预构建的 RHEL、CentOS、Oracle Linux、AlmaLinux、Rocky Linux 包

NGINX, Inc. 为以下 CentOS、Oracle Linux、RHEL、AlmaLinux 和 Rocky Linux 版本提供包：

| 版本   | 支持的平台                   |
|--------|------------------------------|
| 7.4+   | x86_64, aarch64/arm64        |
| 8x     | x86_64, aarch64/arm64, s390x |
| 9x     | x86_64, aarch64/arm64, s390x |

可以从以下位置安装该包：

- 默认的 RHEL / CentOS / Oracle Linux / AlmaLinux / Rocky Linux 存储库。这是最快的方法，但通常提供的包已过时。
- nginx.org 上的官方存储库。第一次必须设置 yum 存储库，但之后提供的包始终是最新的。

#### 从操作系统存储库安装预构建的 CentOS/RHEL/Oracle Linux/AlmaLinux/Rocky Linux 包

1. 安装 EPEL 存储库：

```bash
sudo yum install epel-release
```

2. 更新存储库：

```bash
sudo yum update
```

3. 安装 NGINX Open Source：

```bash
sudo yum install nginx
```

4. 验证安装：

```bash
sudo nginx -v
```

#### 从官方 NGINX 存储库安装预构建的 RHEL/CentOS/Oracle Linux/AlmaLinux/Rocky Linux 包

1. 安装前提条件：

```bash
sudo yum install yum-utils
```

2. 通过在 /etc/yum.repos.d 中创建文件 nginx.repo 来为 RHEL/CentOS/Oracle Linux/AlmaLinux/Rocky Linux 设置 yum 存储库，例如使用 vi：

```bash
sudo vi /etc/yum.repos.d/nginx.repo
```

3. 将以下行添加到 nginx.repo：

```bash
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
```

其中 stable 或 mainline 元素指向 NGINX Open Source 的最新稳定或主线版本。默认情况下，使用稳定的 nginx 包存储库。如果想要使用主线 nginx 包，运行以下命令：

```bash
sudo yum-config-manager --enable nginx-mainline
```

4. 保存更改并退出 vi（按 ESC 键，然后在 : 提示符处键入 wq）。

5. 更新存储库：

```bash
sudo yum update
```

6. 安装 NGINX Open Source 包：

```bash
sudo yum install nginx
```

7. 在提示时接受 GPG 密钥，请验证指纹是否匹配 573B FD6B 3D8F BC64 1079 A6AB ABF5 BD82 7BD9 BF62，然后接受。

8. 启动 NGINX Open Source：

```bash
sudo nginx
```

9. 验证 NGINX Open Source 是否已启动：

```bash
curl -I 127.0.0.1
HTTP/1.1 200 OK
Server: nginx/1.25.1
```


### 安装预构建的 Ubuntu 包

NGINX 为以下 Ubuntu 操作系统提供包：

| 版本   | 代号     | 支持的平台                   |
|--------|----------|------------------------------|
| 20.04  | focal    | x86_64, aarch64/arm64, s390x |
| 22.04  | jammy    | x86_64, aarch64/arm64, s390x |
| 22.10  | kinetic  | x86_64, aarch64/arm64        |
| 23.04  | lunar    | x86_64, aarch64/arm64        |

可以从以下位置安装该包：

- 默认的 Ubuntu 存储库。这是最快的方法，但通常提供的包已过时。
- nginx.org 上的官方存储库。第一次必须设置 apt-get 存储库，但之后提供的包始终是最新的。

#### 从 Ubuntu 存储库安装预构建的 Ubuntu 包

1. 更新 Ubuntu 存储库信息：

```bash
sudo apt-get update
```

2. 安装包：

```bash
sudo apt-get install nginx
```

3. 验证安装：

```bash
sudo nginx -v
```


# 参考资料

https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/

* any list
{:toc}