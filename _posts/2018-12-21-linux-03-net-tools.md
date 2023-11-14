---
layout: post
title: linux apt install net-tools 提供基本网络工具的包
date:  2018-12-21 +0800
categories: [Linux]
tags: [linux, topics, overview, sh]
published: true
---

# 安装

```
sudo apt install net-tools
```

日志：

```
[sudo] password for dh:
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following NEW packages will be installed:
  net-tools
0 upgraded, 1 newly installed, 0 to remove and 105 not upgraded.
Need to get 204 kB of archives.
After this operation, 819 kB of additional disk space will be used.
Get:1 http://archive.ubuntu.com/ubuntu jammy/main amd64 net-tools amd64 1.60+git20181103.0eebece-1ubuntu5 [204 kB]
Fetched 204 kB in 2s (99.4 kB/s)
Selecting previously unselected package net-tools.
(Reading database ... 24211 files and directories currently installed.)
Preparing to unpack .../net-tools_1.60+git20181103.0eebece-1ubuntu5_amd64.deb ...
Unpacking net-tools (1.60+git20181103.0eebece-1ubuntu5) ...
Setting up net-tools (1.60+git20181103.0eebece-1ubuntu5) ...
Processing triggers for man-db (2.10.2-1) ...
```

# chat

## Q2: apt install net-tools 会安装哪些 linux 命令？

在过去，`net-tools`软件包是用于提供基本网络工具的包。

然而，现代的Linux系统通常使用新的工具和命令来替代`net-tools`，因此在一些新的发行版中，`net-tools`可能已经不再是默认安装的一部分。

在`net-tools`中，一些常见的命令包括：

1. **ifconfig**：用于配置和显示系统的网络接口信息。
2. **route**：用于查看和操作内核中的IP路由表。
3. **netstat**：用于显示网络连接、路由表、接口统计、masquerade 连接等信息。
4. **arp**：用于显示和修改系统的ARP缓存表。

如果你使用的是较新的发行版，它可能会使用`iproute2`工具集来替代`net-tools`中的一些命令。

例如，`ip`命令替代了`ifconfig`和`route`。

如果你仍然需要使用`net-tools`中的这些命令，你可以使用以下命令安装它：

```bash
sudo apt-get update
sudo apt-get install net-tools
```

这将安装`net-tools`软件包，并使其中的命令可用。

但请注意，推荐使用`iproute2`工具集中的命令，因为它们提供更多的功能，并且在许多新的Linux系统中是首选工具。

## Q3: iproute2 工具集如何安装和使用？

`iproute2` 是一个强大的网络工具集，用于配置网络接口、查看路由表、设置策略路由等。以下是在Linux系统上安装和使用`iproute2`的基本步骤：

### 安装 `iproute2`

在大多数Linux系统中，`iproute2`通常已经预装。但如果没有，你可以使用包管理器进行安装。

在Debian或Ubuntu系统上，可以使用`apt`：

```bash
sudo apt update
sudo apt install iproute2
```

在Red Hat或CentOS系统上，可以使用`yum`：

```bash
sudo yum install iproute2
```

### 使用 `iproute2`

以下是一些常见的 `iproute2` 命令示例：

1. **显示网络接口信息**：

    ```bash
    ip link show
    ```

2. **配置网络接口**：

    ```bash
    # 将 eth0 设置为启用状态
    ip link set dev eth0 up
    
    # 将 eth1 设置为禁用状态
    ip link set dev eth1 down
    ```

3. **显示路由表**：

    ```bash
    ip route show
    ```

4. **添加路由**：

    ```bash
    # 添加到目标网络的路由
    ip route add 192.168.1.0/24 via 192.168.0.1 dev eth0
    ```

5. **删除路由**：

    ```bash
    # 删除到目标网络的路由
    ip route del 192.168.1.0/24
    ```

6. **显示ARP缓存**：

    ```bash
    ip neigh show
    ```

7. **显示IP地址**：

    ```bash
    ip addr show
    ```

8. **添加IP地址**：

    ```bash
    ip addr add 192.168.0.2/24 dev eth0
    ```

9. **删除IP地址**：

    ```bash
    ip addr del 192.168.0.2/24 dev eth0
    ```

这些命令只是`iproute2`中的一部分，该工具集提供了丰富的功能，可以用于更复杂的网络配置和管理。

你可以查阅`iproute2`的手册页 (`man ip`) 以获取更多详细的信息和选项。

# 参考资料


* any list
{:toc}