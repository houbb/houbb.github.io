---
layout: post
title: Consul-02-windows10 docker 部署实战
date:  2018-11-01 06:48:58 +0800
categories: [Distributed]
tags: [distributed, service-mesh, sh]
published: true
excerpt: 分布式服务发现框架 Consul
---

# Q1-consul 配置控台的部署入门例子，详细

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

# 参考资料

* any list
{:toc}