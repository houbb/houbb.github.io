---
layout: post
title: logstack 日志技术栈-05-windows10 elk install
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, elk, sh]
published: true
---

# 



# 拓展

docker 安装？

# chat

## Q: ELK 技术栈 windows 如何安装？

在Windows上安装ELK（Elasticsearch, Logstash, Kibana）技术栈可以相对复杂，但以下是基本步骤，你可以按照这些步骤进行安装：

1. **安装 Java：**
   - ELK 技术栈的核心组件 Elasticsearch 和 Logstash 都需要 Java 运行环境。你可以从 Oracle 或 OpenJDK 下载并安装 Java。

2. **安装 Elasticsearch：**
   - 访问 [Elasticsearch 下载页面](https://www.elastic.co/downloads/elasticsearch)。
   - 下载适用于 Windows 的 Elasticsearch 安装包。
   - 解压下载的压缩文件到你选择的目录。
   - 进入 Elasticsearch 目录，运行 `bin/elasticsearch.bat` 启动 Elasticsearch。

3. **安装 Kibana：**
   - 访问 [Kibana 下载页面](https://www.elastic.co/downloads/kibana)。
   - 下载适用于 Windows 的 Kibana 压缩文件。
   - 解压下载的文件到你选择的目录。
   - 进入 Kibana 目录，编辑 `config/kibana.yml` 文件，确保 `elasticsearch.hosts` 配置正确，指向你的 Elasticsearch 实例。
   - 运行 `bin/kibana.bat` 启动 Kibana。

4. **安装 Logstash：**
   - 访问 [Logstash 下载页面](https://www.elastic.co/downloads/logstash)。
   - 下载适用于 Windows 的 Logstash 压缩文件。
   - 解压下载的文件到你选择的目录。
   - 进入 Logstash 目录，创建一个配置文件，例如 `logstash.conf`，配置 Logstash 的输入、过滤和输出。
   - 运行 `bin/logstash.bat -f logstash.conf` 启动 Logstash。

请注意，以上步骤提供了一个基本的安装和启动流程，你可能需要根据你的具体需求进行一些额外的配置。此外，确保你的系统符合 ELK 技术栈的版本要求，并在安装前检查相应的文档获取最新的信息。

此外，Windows 上还可以考虑使用 Elastic 提供的 MSI 安装程序，它提供了更便捷的安装过程。你可以在 Elastic 的官方网站上找到相应的 MSI 安装包。



# 参考资料

chat
* any list
{:toc}