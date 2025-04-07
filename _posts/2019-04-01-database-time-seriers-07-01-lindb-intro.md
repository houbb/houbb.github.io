---
layout: post
title: 时序数据库-07-01-lindb 入门介绍
date:  2019-4-1 19:24:57 +0800
categories: [Database]
tags: [database, dis-database, distributed, time-series, sf]
published: true
---

# 时序数据库系列

[时序数据库-01-时序数据库有哪些？为什么要使用](https://houbb.github.io/2019/04/01/database-time-seriers-01-overview)

[时序数据库-02-聊一聊时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-02-chat)

[时序数据库-03-opentsdb-分布式时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-03-opentsdb)

[时序数据库-04-InfluxData-分布式时序数据库](https://houbb.github.io/2019/04/01/database-time-seriers-04-influxdb)

[时序数据库-05-TDengine 是一款开源、高性能、云原生的时序数据库 (Time-Series Database, TSDB)](https://houbb.github.io/2019/04/01/database-time-seriers-05-00-tdengine-overview)

[时序数据库-05-TDengine Time-Series Database, TSDB](https://houbb.github.io/2019/04/01/database-time-seriers-05-01-tdengine-chat)

[时序数据库-05-TDengine windows11 WSL 安装实战笔记 docker](https://houbb.github.io/2019/04/01/database-time-seriers-05-02-windows-wls-install)

[时序数据库-06-01-vm VictoriaMetrics 快速、经济高效的监控解决方案和时间序列数据库](https://houbb.github.io/2019/04/01/database-time-seriers-06-01-vm-intro)

[时序数据库-06-02-vm VictoriaMetrics install on docker 安装 vm](https://houbb.github.io/2019/04/01/database-time-seriers-06-02-vm-install-docker)

[时序数据库-06-03-vm VictoriaMetrics java 整合](https://houbb.github.io/2019/04/01/database-time-seriers-06-03-vm-java-integration)

[时序数据库-06-04-vm VictoriaMetrics storage 存储原理简介](https://houbb.github.io/2019/04/01/database-time-seriers-06-04-vm-storage)

[时序数据库-06-05-vm VictoriaMetrics cluster 集群原理](https://houbb.github.io/2019/04/01/database-time-seriers-06-05-vm-cluster)

[时序数据库-06-06-vm VictoriaMetrics cluster 集群访问方式](https://houbb.github.io/2019/04/01/database-time-seriers-06-06-vm-cluster-access)



# lindb

<p align="left">
    <img width="400" src="https://github.com/lindb/lindb/wiki/images/readme/lindb_logo.png">
</p>

## 简介

LinDB 是一个高性能、高可用并且具备水平拓展性的开源分布式时序数据库。

- [主要特性](https://lindb.io/zh/guide/introduction.html#主要特性)
- [用户指南](https://lindb.io/zh/guide/introduction.html)
- [快速开始](https://lindb.io/zh/guide/get-started.html)
- [设计](https://lindb.io/zh/design/architecture.html)
- [架构](https://github.com/lindb/lindb/blob/main/README-zh_CN.md#%E6%9E%B6%E6%9E%84)
- [Admin UI](https://github.com/lindb/lindb/blob/main/README-zh_CN.md#admin-ui)

## 编译

### 依赖

在本地编译 LinDB 需要以下工具：
- [Go >=1.21](https://golang.org/doc/install)
- [Make tool](https://www.gnu.org/software/make/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

### 获取代码

```
git clone https://github.com/lindb/lindb.git
cd lindb
```

### 编译源代码

仅编译 LinDB 后端（无管理界面）

```
make build
```

同时编译 LinDB 前端与后端

```
make build-all
```

### 测试

```
make test
```

### 管理界面(开发者)

启动 LinDB 前端应用
```
cd web
yarn install
yarn dev
```

可以通过  [localhost port 3000](http://localhost:3000/) 来访问

## 架构

![architecture](https://github.com/lindb/lindb/blob/main/docs/images/architecture.png?raw=true)

## Admin UI

Some admin ui snapshots.

### Overview

![overview](https://github.com/lindb/lindb/blob/main/docs/images/overview.png?raw=true)

### Monitoring Dashboard

![dashboard](https://github.com/lindb/lindb/blob/main/docs/images/dashboard.png?raw=true)

### Replication State

![replication](https://github.com/lindb/lindb/blob/main/docs/images/replication_shards.png?raw=true)

### Data Explore

![explore](https://github.com/lindb/lindb/blob/main/docs/images/data_explore.png?raw=true)

### Explain

![explain](https://github.com/lindb/lindb/blob/main/docs/images/data_search_explain.png?raw=true)

## JAVA 版 LinDB 相关文章
- [数据分析之时序数据库](https://zhuanlan.zhihu.com/p/36804890)
- [分布式时序数据库 - LinDB](https://zhuanlan.zhihu.com/p/35998778)

## 贡献代码

我们非常期待有社区爱好者能加入我们一起参与开发，[CONTRIBUTING](CONTRIBUTING.md) 是一些简单的 PR 的规范，对于 一个 PR 中的多个 commit，我们会根据情况在合并时做 squash 并进行归类，以方便后续查看回溯。

#### CI
PR 应当带上合适的标签，并且关联到已有的 issue 上 [issues](https://github.com/lindb/lindb/issues)。
所有的 PR 都会在 GITHUB-Actions 进行测试，社区贡献者需要关注 CI 的结果，对未通过的错误进行修复。

#### 静态检查
我们使用了以下的检查器，所有代码都需要针对以下工具做一些调整。

- [gofmt](https://golang.org/cmd/gofmt/) - Gofmt checks whether code was gofmt-ed. By default this tool runs with -s option to check for code simplification;
- [golint](https://github.com/golang/lint) - Golint differs from gofmt. Gofmt reformats Go source code, whereas golint prints out style mistakes;
- [goimports](https://godoc.org/golang.org/x/tools/cmd/goimports) - Goimports does everything that gofmt does. Additionally it checks unused imports;
- [errcheck](https://github.com/kisielk/errcheck) - Errcheck is a program for checking for unchecked errors in go programs. These unchecked errors can be critical bugs in some cases;
- [gocyclo](https://github.com/alecthomas/gocyclo) - Computes and checks the cyclomatic complexity of functions;
- [maligned](https://github.com/mdempsky/maligned) - Tool to detect Go structs that would take less memory if their fields were sorted;
- [dupl](https://github.com/mibk/dupl) - Tool for code clone detection;
- [goconst](https://github.com/jgautheron/goconst) - Finds repeated strings that could be replaced by a constant;
- [gocritic](https://github.com/go-critic/go-critic) - The most opinionated Go source code linter;

## 开源许可协议

LinDB 使用 Apache 2.0 协议， 点击 [LICENSE](LICENSE) 查看详情。


# 小结

方法总比困难多，选择合适的场景。

# 参考资料

https://github.com/lindb/lindb/blob/main/README-zh_CN.md

* any list
{:toc}