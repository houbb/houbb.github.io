---
layout: post
title: milvus-03-管理控台可视化 Attu 入门介绍
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

## 📌 Attu — Milvus 最佳图形化管理界面（GUI）

**Attu** 是 Milvus 向量数据库的旗舰管理工具，通过 **可视化界面** 让你轻松管理 Milvus，从架构设计到运维监控都支持。

## ⭐ 功能亮点

### 🗂 全面的数据与模式管理

* **可视化模式设计器**
  通过直观 UI 设计、查看和修改集合（Collection）模式，支持快速预览字段细节。

* **生命周期控制**
  轻松管理多个数据库、集合及其属性，支持克隆、配置和批量操作。

* **智能数据操作**
  强大的数据管理功能：智能过滤、语法高亮、完整数据视图、内联编辑，以及导入/导出能力。

---

### 🧰 交互式开发工具

* **向量相似度搜索可视化**
  支持以可视方式执行向量搜索并查看结果。

* **基于表达式的快速数据查询**
  提供高级查询表达式支持，提高数据检索效率。

* **REST API 编辑器内置**
  方便调试和调用 Milvus REST 接口。

---

### 🔐 企业级安全与监控

* **可视化 RBAC（角色访问控制）与权限组管理**
  让权限策略一目了然。

* **实时系统监控**
  节点（Node）、段（Segment）、任务（Task）等状态实时展示。

* **慢查询分析 & 系统诊断**
  内置性能分析工具帮助优化数据库表现。

* **详细段查询与检查**
  对每个向量段提供深入查询结果分析。

---

## 📋 目录结构（README 内容概览）

* 功能特性（Features）
* 系统要求（System Requirements）
* 快速开始（Quick Start）
* 安装指南（Installation Guides）

  * 兼容性说明
  * Docker 运行方式
  * Kubernetes 部署方式
  * Nginx 反向代理配置
  * 桌面应用安装
* 开发指南
* 贡献说明
* 常见问题（FAQ）
* 更多截图
* 示例与实用教程
* Milvus 相关链接
* 社区与支持信息
  

---

## 🧠 系统要求

* **Docker** 20.10.0 或更新版本
* **Kubernetes** 1.19 或更新版本（如采用 K8s 部署）
* 现代浏览器（Chrome / Firefox / Safari / Edge）
* 桌面版（可选）支持：

  * Windows 10/11
  * macOS 10.15+
  * Linux Ubuntu 20.04+ 

---

## 🚀 快速开始

1. 启动 Milvus 服务器（如果尚未运行）：

```bash
docker run -d --name milvus_standalone -p 19530:19530 -p 9091:9091 milvusdb/milvus:v2.6.9
```


```sh
curl -s https://registry.hub.docker.com/v2/repositories/milvusdb/milvus/tags?page_size=10 grep '"name"' | head -n 10
```

2. 启动 Attu：

```bash
docker run -p 8000:3000 -e MILVUS_URL=localhost:19530 zilliz/attu:v2.6.3
```

3. 在浏览器中访问：

````
http://localhost:8000
``` :contentReference[oaicite:14]{index=14}

---

## 🛠 安装指南

### 📌 兼容性对照

| Milvus 版本 | 推荐 Attu 版本 |
|-------------|----------------|
| 2.6.x | v2.6.3 |
| 2.5.x | v2.5.10 |
| 2.4.x | v2.4.12 |
| 2.3.x | v2.3.5 |
| 2.2.x | v2.2.8 |
| 2.1.x | v2.2.2 | :contentReference[oaicite:15]{index=15}

---

### 🐳 Docker 运行方式

启动 Attu 容器：

```bash
docker run -p 8000:3000 \
  -e MILVUS_URL={Milvus 服务地址}:19530 \
  zilliz/attu:v2.6
````

注意：容器内部必须能够访问 Milvus 服务地址，否则无法登录。

---

#### 🍃 可选环境变量示例

| 环境变量             | 示例                   | 描述           |               |
| ---------------- | -------------------- | ------------ | ------------- |
| MILVUS_URL       | 192.168.0.1:19530    | Milvus 服务器地址 |               |
| DATABASE         | your database        | 默认数据库        |               |
| ATTU_LOG_LEVEL   | info                 | 日志级别         |               |
| ROOT_CERT_PATH   | /path/to/root/cert   | TLS 根证书      |               |
| PRIVATE_KEY_PATH | /path/to/private/key | 客户端私钥        |               |
| CERT_CHAIN_PATH  | /path/to/cert/chain  | TLS 证书链      |               |
| SERVER_NAME      | your_server_name     | 服务器名称        |               |
| SERVER_PORT      | 端口号（默认 3000）         | 监听端口         |  |

---

### 🚢 Kubernetes 部署

确保你的 Milvus 已经运行在 Kubernetes 集群中，然后执行：

```bash
kubectl apply -f \
  https://raw.githubusercontent.com/zilliztech/attu/main/attu-k8s-deploy.yaml
```

确保 Attu Pod 能访问 Milvus 服务。

---

### 📦 桌面应用

Attu 提供跨平台桌面应用（Windows / macOS / Linux）。下载并安装对应平台的安装包即可。

**注意：** macOS M系列芯片安装包可能报“损坏”错误，需要移除隔离标记才能打开。

---

## ❓ 常见问题（FAQ）

* **无法登录？**
  确认 Milvus 服务地址在 Attu 容器/机器中是可访问的（localhost 在容器中不适用）。

* **如何更新 Attu？**
  Docker 用户只需拉取最新镜像并重启。桌面版用户下载最新发布版本即可。

* **如何备份配置？**
  Attu 的配置存储在浏览器本地存储中，可以从设置界面导出。

---

## 🔗 相关资源

* Milvus 官方文档
* Milvus Python / Java / Go / Node SDK
* 向量搜索可视化工具和示例实用工具（如 Feder） 

---

## 📜 关于许可证

从 **v2.6.0 版本起，Attu 不再是开源软件**（采用专有许可）。**v2.5.x 及之前版本仍遵循 Apache 2.0 许可**。

---

如果你需要，我也可以 **逐段翻译 README_CN.md**（项目自带的中文 README），并帮你整理成更易懂的中文文档。

[1]: https://github.com/zilliztech/attu?tab=readme-ov-file "GitHub - zilliztech/attu: The Best GUI for Milvus"

# 参考资料

https://github.com/zilliztech/attu?tab=readme-ov-file#attu

* any list
{:toc}