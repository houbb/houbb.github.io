---
layout: post
title: docker memgraph 镜像本地如何启动？（公司内部断网的情况下，如何加载镜像文件）
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


## 命令拉取

```sh
docker pull memgraph/memgraph-mage:3.7.1
```

另外下载一下 lab 控台 

```sh
docker pull memgraph/lab:3.7.1
```

## 保存

```
docker save memgraph/memgraph-mage:3.7.1 -o memgraph-mage.tar
docker save memgraph/lab:3.7.1 -o memgraph-lab.tar
```

## 导入

适合场景：公司内部网络存在限制时

```
docker load -i memgraph-mage.tar
docker load -i memgraph-lab.tar
```

### 验证

本地验证加载效果

```
# 查看所有镜像
docker images

# 或搜索特定镜像
docker images | grep memgraph
```

## 后台运行运行

```sh
docker run -d -p 7687:7687 -p 7444:7444 --name memgraph memgraph/memgraph-mage:3.7.1
docker run -d -p 3000:3000 --name lab memgraph/lab:3.7.1
```

本次测试删除数据重启的脚本

```sh
docker rm -f memgraph
docker run -d -p 7687:7687 -p 7444:7444 --name memgraph memgraph/memgraph-mage:3.7.1
```

# lab 打开空白

chrome 浏览器版本太低问题，要升级到 100 以上才行。

# 本地 lab 无法访问

场景：使用 windows docker 启动上述命令，但是 lab 直接访问配置 memgraph host=127.0.0.1 报错

报错信息：

```
Unable to connect to Memgraph. 

Please check whether host and port parameters are correct and make sure Memgraph is running.
```

解决方案：

```
docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" memgraph
172.17.0.2
```

使用这个 ip 访问即可。

# 初步验证

给一个 memgraph 简单的插入验证语句



# 参考资料

https://github.com/tree-sitter/tree-sitter

* any list
{:toc}