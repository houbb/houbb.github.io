---
layout: post
title: docker 如何安装 milvus 向量数据库
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

# 参考资料


https://milvus.io/docs/zh/install_standalone-docker.md

# windows 安装记录

下载安装脚本

```
Invoke-WebRequest https://raw.githubusercontent.com/milvus-io/milvus/refs/heads/master/scripts/standalone_embed.bat -OutFile standalone.bat
```

运行启动

```
standalone.bat start
```

## 配置说明

运行安装脚本后

名为Milvus-standalone的 docker 容器已在19530 端口启动。

嵌入式 etcd 与 Milvus 安装在同一个容器中，服务端口为2379。其配置文件被映射到当前文件夹中的embedEtcd.yaml。

Milvus 数据卷映射到当前文件夹中的volumes/milvus。


## 数据管理

```
# Stop Milvus
C:\>standalone.bat stop
Stop successfully.

# Delete Milvus container
C:\>standalone.bat delete
Delete Milvus container successfully. # Container has been removed.
Delete successfully. # Data has been removed.
```




# 参考资料

https://milvus.io/docs/zh/install_standalone-docker.md

https://milvus.io/docs/zh/install_standalone-windows.md

* any list
{:toc}