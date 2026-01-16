---
layout: post
title: 如何使用 k8s 启动下载 docker memgraph 镜像？
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

# 参考资料

https://memgraph.com/docs/getting-started/install-memgraph/docker

# 直接启动

```sh
docker run -p 7687:7687 -p 7444:7444 --name memgraph memgraph/memgraph-mage
```

## 核心镜像

```
Core images
Image	Includes
memgraph/memgraph-mage	Memgraph DB + CLI + MAGE library
memgraph/memgraph	Memgraph DB + CLI (no graph algorithms)
```

Use memgraph/memgraph-mage unless you have a reason to use the slim or separate components.

这里还是使用有图算法的镜像 `memgraph/memgraph-mage`

# 下载镜像的方式


## 直接下载

https://memgraph.com/download 

镜像仓库地址：https://hub.docker.com/u/memgraph

## docker 下载

```sh
docker pull memgraph/memgraph-mage:3.7.1
```

另外下载一下 lab 控台 

```sh
docker pull memgraph/lab:3.7.1
```

### 保存

```
docker save memgraph/memgraph-mage:3.7.1 -o memgraph-mage.tar
docker save memgraph/lab:3.7.1 -o memgraph-lab.tar
```

## 把镜像安装到 docker

使用类似如下的方式：

```sh
docker load -i memgraph-3.2.0-docker.tar.gz
```

## 保存

```sh
docker save memgraph/memgraph-mage:3.7.1 -o memgraph-mage.tar
docker save memgraph/lab:3.7.1 -o memgraph-lab.tar
```

## 运行

```sh
docker run -p 7687:7687 -p 7444:7444 --name memgraph memgraph/memgraph-mage:3.7.1
docker run -d -p 3000:3000 --name lab memgraph/lab:3.7.1
```

如果 linux 服务器操作失败，需要通过 `--privileged` 参数

官方网站：https://memgraph.com/docs/getting-started/install-memgraph/docker




# 参考资料

https://github.com/tree-sitter/tree-sitter

* any list
{:toc}