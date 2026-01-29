---
layout: post
title: milvus-03-管理控台可视化 Attu
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

# 安装

```
docker run -d --name attu -p 13000:3000 -e MILVUS_URL=localhost:19530 zilliz/attu:latest
```

因为我本地 3000 已经被 memgraph-lab 占用，所以这里调整一下端口号。

## ip 查看

```
>docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" milvus-standalone
172.18.0.4
```

## 检查服务

```
docker ps
CONTAINER ID   IMAGE                                      COMMAND                   CREATED       STATUS                             PORTS                                                                                          NAMES
adaf15c2e48a   milvusdb/milvus:v2.6.9                     "/tini -- milvus run…"   6 hours ago   Up 17 seconds (health: starting)   0.0.0.0:9091->9091/tcp, [::]:9091->9091/tcp, 0.0.0.0:19530->19530/tcp, [::]:19530->19530/tcp   milvus-standalone
9c64aea0f953   minio/minio:RELEASE.2024-12-18T13-15-44Z   "/usr/bin/docker-ent…"   6 hours ago   Up 17 seconds (health: starting)   0.0.0.0:9000-9001->9000-9001/tcp, [::]:9000-9001->9000-9001/tcp                                milvus-minio
1d41338fe36a   quay.io/coreos/etcd:v3.5.25                "etcd -advertise-cli…"   6 hours ago   Up 17 seconds (health: starting)   2379-2380/tcp                                                                                  milvus-etcd
```

## 登录

http://localhost:13000/#/connect

默认账密

```
用户名：root
密码：Milvus
```

实际上默认配置应该是没启动的，参考 https://github.com/zilliztech/attu/issues/161


```yaml
version: '3.5'

services:
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.25
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://etcd:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 30s
      timeout: 20s
      retries: 3

  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "9001:9001"
      - "9000:9000"
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data
    command: minio server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.6.9
    command: ["milvus", "run", "standalone"]
    security_opt:
    - seccomp:unconfined
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
      MQ_TYPE: woodpecker
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      start_period: 90s
      timeout: 20s
      retries: 3
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - "etcd"
      - "minio"

networks:
  default:
    name: milvus
```



搞了半天还是不行。于是决定降低版本


# 降低版本


```
docker run -d --name attu -p 13000:3000 -e MILVUS_URL=localhost:19530 zilliz/attu:latest
```


# 参考资料

https://milvus.io/docs/zh/install_standalone-docker.md

* any list
{:toc}