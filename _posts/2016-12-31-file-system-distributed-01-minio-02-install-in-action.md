---
layout: post
title: 分布式存储系统-01-minio windows10 exe 安装+实际验证笔记
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, file]
published: true
---

## window10 安装笔记

## 下载

要在64位Windows主机上运行MinIO，请从以下URL下载MinIO可执行文件：

[https://dl.min.io/server/minio/release/windows-amd64/minio.exe](https://dl.min.io/server/minio/release/windows-amd64/minio.exe)

使用以下命令在Windows主机上运行独立的MinIO服务器。

下载后我们将其放在 `d:\file\mini\bin` 目录下：

```
D:.
└─minio
    ├─bin
    │      minio.exe
    │      start.cmd
    │
    └─data
```

## 运行

启动脚本

```sh
.\minio.exe server D:\file\minio\data --console-address "127.0.0.1:9001" --address "127.0.0.1:9000"
```

我们指定 data 目录为 `D:\file\minio\data`

启动日志：

```
D:\file\minio\bin>.\minio.exe server D:\file\minio\data --console-address "127.0.0.1:9001" --address "127.0.0.1:9000"
INFO: Formatting 1st pool, 1 set(s), 1 drives per set.
INFO: WARNING: Host local has more than 0 drives of set. A host failure will result in data becoming unavailable.
MinIO Object Storage Server
Copyright: 2015-2024 MinIO, Inc.
License: GNU AGPLv3 - https://www.gnu.org/licenses/agpl-3.0.html
Version: RELEASE.2024-12-13T22-19-12Z (go1.23.4 windows/amd64)

API: http://127.0.0.1:9000
   RootUser: minioadmin
   RootPass: minioadmin

WebUI: http://127.0.0.1:9001
   RootUser: minioadmin
   RootPass: minioadmin

CLI: https://min.io/docs/minio/linux/reference/minio-mc.html#quickstart
   $ mc alias set 'myminio' 'http://127.0.0.1:9000' 'minioadmin' 'minioadmin'

Docs: https://docs.min.io
WARN: Detected default credentials 'minioadmin:minioadmin', we recommend that you change these values with 'MINIO_ROOT_USER' and 'MINIO_ROOT_PASSWORD' environment variables
```

## 登录

根据提示，ui 可以访问 http://127.0.0.1:9001

MinIO部署将使用默认的根凭据 minioadmin/minioadmin 启动。

您可以使用MinIO Console进行部署测试，这是MinIO服务器内置的嵌入式基于Web的对象浏览器。

# 小结

s3 协议是一个好东西，可以让很多非标的东西标准化起来。

文件服务器发展到今天，如果从头开始创建成本比较高，直接这种基于成熟的工具部署，然后通过 java client 访问的方式还是很方便的。

# 参考资料

https://blog.csdn.net/cocoliu2004/article/details/135669786

https://openatomworkshop.csdn.net/673fef172db35d11950fa708.html







* any list
{:toc}