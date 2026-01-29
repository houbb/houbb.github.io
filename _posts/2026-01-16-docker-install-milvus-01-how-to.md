---
layout: post
title: docker 如何安装 milvus 向量数据库
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---


# 要求

https://milvus.io/docs/zh/prerequisite-docker.md


# compose 模式启动


## 安装

Milvus 在 Milvus 资源库中提供了 Docker Compose 配置文件。

要使用 Docker Compose 安装 Milvus，只需运行

```
wget https://github.com/milvus-io/milvus/releases/download/v2.6.9/milvus-standalone-docker-compose.yml -O docker-compose.yml

sudo docker compose up -d

Creating milvus-etcd  ... done
Creating milvus-minio ... done
Creating milvus-standalone ... done
```

### windows

windows 下面没有这个命令，可以访问 https://github.com/milvus-io/milvus/releases/download/v2.6.9/milvus-standalone-docker-compose.yml 直接下载得到这个文件

```
D:\_docker\milvus 的目录

2026/01/29  10:47    <DIR>          .
2026/01/29  10:47    <DIR>          ..
2026/01/29  10:46             1,788 milvus-standalone-docker-compose.yml
```

然后把名字改为 `docker-compose.yml`

然后执行命令 `docker compose up -d`

会进入拉取模式：

```
docker compose up -d
time="2026-01-29T10:52:37+08:00" level=warning msg="D:\\_docker\\milvus\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
[+] Running 4/33
 - standalone [⣿⣿⣿⣿⡀⠀⠀] Pulling                                                                                                                      152.7s
 - etcd [⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀] Pulling                                                                                                                     152.7s
 - minio [⠀⠀⠀⠀⠀⠀⠀⠀⠀] Pulling                                                                                                                         152.7s
```

## 启动成功日志

```
docker compose up -d
time="2026-01-29T10:52:37+08:00" level=warning msg="D:\\_docker\\milvus\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"

[+] Running 4/4
 ✔ Network milvus               Created                                                                                                                0.2s
 ✔ Container milvus-etcd        Started                                                                                                                1.6s
 ✔ Container milvus-minio       Started                                                                                                                1.6s
 ✔ Container milvus-standalone  Started                                                                                                                1.8s
```

## 入门测试





# docker-compose.yml

```yaml
version: '3.5'                 # Docker Compose 文件版本，3.x 系列常用于 Docker Engine

services:                       # 定义所有要启动的服务（容器）

  etcd:                         # etcd 服务，用作 Milvus 的元数据存储
    container_name: milvus-etcd # 指定容器名称，方便 docker ps / docker logs 操作
    image: quay.io/coreos/etcd:v3.5.25  # 使用指定版本的 etcd 官方镜像

    environment:                # etcd 运行时环境变量
      - ETCD_AUTO_COMPACTION_MODE=revision       # 自动压缩模式：按 revision（版本号）
      - ETCD_AUTO_COMPACTION_RETENTION=1000      # 保留最近 1000 个 revision
      - ETCD_QUOTA_BACKEND_BYTES=4294967296      # etcd 后端存储最大 4GB
      - ETCD_SNAPSHOT_COUNT=50000                # 多少次写操作触发一次快照

    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
        # 将宿主机目录挂载到容器内 /etcd，用于持久化 etcd 数据
        # DOCKER_VOLUME_DIRECTORY 未定义时，默认使用当前目录 .

    command: >
      etcd
      -advertise-client-urls=http://etcd:2379    # 向集群/客户端声明的访问地址
      -listen-client-urls http://0.0.0.0:2379   # 监听所有网卡的 2379 端口
      --data-dir /etcd                           # 指定数据存储目录（对应上面的 volume）

    healthcheck:               # 容器健康检查配置
      test: ["CMD", "etcdctl", "endpoint", "health"] # 使用 etcdctl 检查 etcd 是否健康
      interval: 30s            # 每 30 秒检查一次
      timeout: 20s             # 单次检查超时时间 20 秒
      retries: 3               # 连续失败 3 次则判定为 unhealthy


  minio:                       # MinIO 服务，用作 Milvus 的对象存储（替代 S3）
    container_name: milvus-minio  # 指定容器名称
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z # 指定 MinIO 版本（固定版本，避免升级风险）

    environment:               # MinIO 访问凭证
      MINIO_ACCESS_KEY: minioadmin  # Access Key（用户名）
      MINIO_SECRET_KEY: minioadmin  # Secret Key（密码）

    ports:
      - "9001:9001"            # 映射控制台端口（Web UI）
      - "9000:9000"            # 映射对象存储服务端口（S3 API）

    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data
        # 持久化 MinIO 存储的数据

    command: >
      minio server /minio_data
      --console-address ":9001" # 指定 Web 控制台端口

    healthcheck:               # MinIO 健康检查
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
        # 访问 MinIO 内置健康检查接口
      interval: 30s
      timeout: 20s
      retries: 3


  standalone:                  # Milvus 单机版（standalone 模式）
    container_name: milvus-standalone  # 容器名称
    image: milvusdb/milvus:v2.6.9      # Milvus 官方镜像（指定版本）

    command: ["milvus", "run", "standalone"]
      # 以 standalone 模式启动 Milvus（etcd + storage + query 全部在一个进程中）

    security_opt:
      - seccomp:unconfined     # 关闭 seccomp 限制，避免某些系统调用被拦截

    environment:               # Milvus 运行所需的环境变量
      ETCD_ENDPOINTS: etcd:2379  # 指定 etcd 服务地址（使用 Docker 内部 DNS）
      MINIO_ADDRESS: minio:9000 # 指定 MinIO 地址
      MQ_TYPE: woodpecker       # Milvus 内部消息队列类型（standalone 推荐）

    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
        # 持久化 Milvus 的数据（索引、segment 等）

    healthcheck:               # Milvus 健康检查
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
        # Milvus 自带健康检查接口
      interval: 30s
      start_period: 90s        # 容器启动后，等待 90 秒再开始健康检查
      timeout: 20s
      retries: 3

    ports:
      - "19530:19530"          # Milvus gRPC 服务端口（SDK 连接用）
      - "9091:9091"            # Milvus HTTP 管理 / 健康检查端口

    depends_on:
      - "etcd"                 # 依赖 etcd 服务先启动
      - "minio"                # 依赖 MinIO 服务先启动


networks:
  default:                     # 使用默认网络
    name: milvus               # 显式指定 Docker 网络名称，方便复用和排查
```
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


https://milvus.io/docs/zh/install_standalone-docker-compose.md

https://milvus.io/docs/zh/install_standalone-windows.md

* any list
{:toc}