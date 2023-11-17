---
layout: post
title: Consul-02-windows10 docker 部署实战
date:  2018-11-01 06:48:58 +0800
categories: [Distributed]
tags: [distributed, service-mesh, sh]
published: true
excerpt: 分布式服务发现框架 Consul
---


# windows 安装笔记

## 1、Consul 的简介

Consul 是由 HashiCorp 公司推出的一款开源工具，用于实现分布式系统的服务发现与服务配置。

它内置了服务注册与发现框架、分布一致性协议实现、健康检查、Key-Value 存储、多数据中心方案。

Consul 使用 GO 语言编写，因此天然具有可移植性（支持 Linux、Windows 和 Mac OS X）。

其安装包仅包含一个可执行文件，方便部署，可与 Docker 等轻量级容器无缝配合。

## 2、Consul的安装

要实现 Consul “服务中心” 功能，需要先安装 Consul 。具体步骤如下。

（1）来到 Consul 官方网站，根据提示下载与系统匹配的服务器端。

    Consul 官方网站：https://www.consul.io/downloads.html

（2）下载后解压缩。

直接得到一个 exe 可执行文件。

## 3. 运行

（1）用命令启动 Consul。在 DOS 窗口中进入 Consul 的解压缩目录，然后输入以下命令：

```
# -dev 表示以开发模式运行。如果使用“-server”，则表示以服务器模式运行
> .\consul.exe agent -dev
```

启动结果：

```
==> Starting Consul agent...
               Version: '1.17.0'
            Build Date: '2023-11-03 14:56:56 +0000 UTC'
               Node ID: 'a4ed9e5a-d116-8df7-9227-caf739ae4260'
             Node name: 'd'
            Datacenter: 'dc1' (Segment: '<all>')
                Server: true (Bootstrap: false)
           Client Addr: [127.0.0.1] (HTTP: 8500, HTTPS: -1, gRPC: 8502, gRPC-TLS: 8503, DNS: 8600)
          Cluster Addr: 127.0.0.1 (LAN: 8301, WAN: 8302)
     Gossip Encryption: false
      Auto-Encrypt-TLS: false
           ACL Enabled: false
     Reporting Enabled: false
    ACL Default Policy: allow
             HTTPS TLS: Verify Incoming: false, Verify Outgoing: false, Min Version: TLSv1_2
              gRPC TLS: Verify Incoming: false, Min Version: TLSv1_2
      Internal RPC TLS: Verify Incoming: false, Verify Outgoing: false (Verify Hostname: false), Min Version: TLSv1_2

==> Log data will now stream in as it occurs:

......
2023-11-17T17:15:14.388+0800 [DEBUG] agent: Skipping remote check since it is managed automatically: check=serfHealth
2023-11-17T17:15:14.388+0800 [DEBUG] agent: Node info in sync
```

（2）访问 http://127.0.0.1:8500 即可进入 Consul 的管理界面。

 Agent 可以在服务器或客户端模式下运行。

每个数据中心都必须至少有一台 Agent（Server 模式），但推荐使用 3~5 台。

控台还是非常漂亮的。

![hello-world-view](https://img-blog.csdnimg.cn/b9a91458cf254bec827d3264a85dad3e.png#pic_center)


# Q1-consul 配置控台的部署入门例子，详细（失败的，无法拉取镜像）

在这个例子中，我将向您展示如何部署 Consul 配置控制台，并进行基本的配置。请注意，为了简化示例，我们将使用 Docker 来部署 Consul 和配置控制台。

## 步骤 1: 安装 Docker

确保您的系统上已经安装了 Docker。

您可以访问 Docker 官方网站（https://www.docker.com/）获取安装指南。

### 验证

```
> docker version
error during connect: this error may indicate that the docker daemon is not running: Get "http://%2F%2F.%2Fpipe%2Fdocker_engine/v1.24/version": open //./pipe/docker_engine: The system cannot find the file specified.
Client:
 Cloud integration: v1.0.35+desktop.4
 Version:           24.0.6
 API version:       1.43
 Go version:        go1.20.7
 Git commit:        ed223bc
 Built:             Mon Sep  4 12:32:48 2023
 OS/Arch:           windows/amd64
 Context:           default
```

### 步骤 2: 启动 Consul Server

首先，我们将启动一个 Consul 服务器。

在终端中运行以下命令：

```bash
docker run -d --name=consul-server -p 8500:8500 consul agent -server -bootstrap-expect=1 -ui -client=0.0.0.0
```

这个命令会在后台运行一个 Consul 服务器，并将其绑定到本地的 8500 端口。

参数 `-ui` 启用了 Consul 的 Web UI，您可以通过浏览器访问 `http://localhost:8500` 来查看配置控制台。

### 步骤 3: 启动 Consul Agent

现在，我们将启动一个 Consul 代理，用于模拟一个运行在 Consul 上的服务。在另一个终端窗口中运行以下命令：

```bash
docker run -d --name=consul-agent consul agent -client=0.0.0.0 -join=<Consul服务器的IP地址>
```

请将 `<Consul服务器的IP地址>` 替换为您实际 Consul 服务器的 IP 地址。这个代理将连接到 Consul 服务器。

### 步骤 4: 访问配置控制台

现在，您可以打开浏览器，访问 `http://localhost:8500`，您将看到 Consul 的 Web UI。在这个界面上，您可以查看注册的服务、配置项等信息。

### 步骤 5: 添加配置项

在 Consul 的 Web UI 中，点击左侧的 "Key/Value" 标签，然后点击 "Create" 按钮。在 "Key" 栏中输入配置项的键，例如 `example/config/key`，在 "Value" 栏中输入相应的值，然后点击 "Save" 按钮。

### 步骤 6: 查询配置项

您可以使用 Consul 的 HTTP API 或客户端库来查询配置项。例如，使用 curl 命令可以查询配置项的值：

```bash
curl http://localhost:8500/v1/kv/example/config/key
```

这将返回包含配置项值的 JSON 数据。

这只是一个简单的入门例子，演示了如何启动 Consul 服务器、代理，并在配置控制台中添加和查询配置项。在实际应用中，您可能需要更复杂的配置和安全设置，但这个例子应该能够帮助您入门 Consul 的基本用法。

# 实战

## 运行

```
docker run -d --name=consul-server -p 8500:8500 consul agent -server -bootstrap-expect=1 -ui -client=0.0.0.0
```

报错：

```
Unable to find image 'consul:latest' locally
docker: Error response from daemon: manifest for consul:latest not found: manifest unknown: manifest unknown.
See 'docker run --help'.
```

> [https://github.com/hashicorp/consul/issues/17973](https://github.com/hashicorp/consul/issues/17973)

github 上说，使用 hashicorp/consul:latest instead


改为：

```
docker run -d --name=consul-server -p 8500:8500 hashicorp/consul:latest agent -server -bootstrap-expect=1 -ui -client=0.0.0.0
```

拉取日志：

```
> docker run -d --name=consul-server -p 8500:8500 hashicorp/consul:latest agent -server -bootstrap-expect=1 -ui -client=0.0.0.0
Unable to find image 'hashicorp/consul:latest' locally
latest: Pulling from hashicorp/consul
96526aa774ef: Pull complete
8a755a53c1aa: Pull complete
fd305fe2d878: Pull complete
01d12fe0b370: Pull complete
cbc103c13062: Pull complete
4f4fb700ef54: Pull complete
3a5b5f5fe822: Pull complete
Digest: sha256:712fe02d2f847b6a28f4834f3dd4095edb50f9eee136621575a1e837334aaf09
Status: Downloaded newer image for hashicorp/consul:latest
b442b1a6c2a15ed1a580364e9598d927956964c41e18f48c4841bbd10f734a06
```

启动了？但是没有效果？

# 参考资料

https://coding.imooc.com/learn/questiondetail/NAr19YnwgApXLBEz.html

* any list
{:toc}