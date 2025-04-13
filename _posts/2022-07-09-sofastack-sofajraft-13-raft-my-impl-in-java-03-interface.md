---
layout: post
title: 从零开始实现自己的 raft（三）接口定义
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFAJRaft, raft, sh]
published: true
---

## 前言

大家好，我是老马。

分布式系统中，一致性算法是最重要的基石，也是最难学习的部分。

这里是从零开始实现 raft 系列。

# 核心能力

Raft 为了算法的可理解性，将算法分成了 4 个部分。

leader 选举

日志复制

成员变更

日志压缩

## 简单说明

同 zk 一样，leader 都是必须的，所有的写操作都是由 leader 发起，从而保证数据流向足够简单。

而 leader 的选举则通过比较每个节点的逻辑时间（term）大小，以及日志下标（index）的大小。

刚刚说 leader 选举涉及日志下标，那么就要讲日志复制。

日志复制可以说是 Raft 核心的核心，说简单点，Raft 就是为了保证多节点之间日志的一致。

当日志一致，我们可以认为整个系统的状态是一致的。这个日志你可以理解成 mysql 的 binlog。

Raft 通过各种补丁，保证了日志复制的正确性。

Raft leader 节点会将客户端的请求都封装成日志，发送到各个 follower 中，如果集群中超过一半的 follower 回复成功，那么这个日志就可以被提交（commit），这个 commit 可以理解为 ACID 的 D ，即持久化。当日志被持久化到磁盘，后面的事情就好办了。

而第三点则是为了节点的扩展性。第四点是为了性能。

相比较 leader 选举和 日志复制，不是那么的重要，可以说，如果没有成员变更和日志压缩，也可以搞出一个可用的 Raft 分布式系统，但没有 leader 选举和日志复制，是万万不能的。

因此，本文和本项目将重点放在 leader 选举和日志复制。

# 接口定义

## 概览

Consensus， 一致性模块接口

LogManager 日志管理模块接口

StateMachine， 状态机接口

RpcServer & RpcClient， RPC 接口

Node，同时，为了聚合上面的几个接口，我们需要定义一个 Node 接口，即节点，Raft 抽象的机器节点。

LifeCycle， 最后，我们需要管理以上组件的生命周期，因此需要一个 LifeCycle 接口。

# Consensus 一致性模块接口

请求投票 & 附加日志。

也就是我们的 Raft 节点的核心功能，leader 选举和 日志复制。

实现这两个接口是 Raft 的关键所在。

```java
package com.github.houbb.raft.server.core;

import com.github.houbb.raft.common.entity.req.AppendLogRequest;
import com.github.houbb.raft.common.entity.req.VoteRequest;
import com.github.houbb.raft.common.entity.resp.AppendLogResponse;
import com.github.houbb.raft.common.entity.resp.VoteResponse;

/**
 *  一致性模块接口
 *
 * 1. leader 选举
 * 2. 日志复制。
 *
 * 实现这两个接口是 Raft 的关键所在。
 *
 * @since 1.0.0
 */
public interface Consensus {

    /**
     * 请求投票 RPC
     *
     * 接收者实现：
     *
     * 1. 如果term < currentTerm返回 false （5.2 节）
     *
     * 2. 如果 votedFor 为空或者就是 candidateId，并且候选人的日志至少和自己一样新，那么就投票给他（5.2 节，5.4 节）
     *
     * @param request 请求
     * @return 结果
     */
    VoteResponse vote(VoteRequest request);

    /**
     * 附加日志(多个日志,为了提高效率) RPC
     *
     * 接收者实现：
     *
     *    如果 term < currentTerm 就返回 false （5.1 节）
     *    如果日志在 prevLogIndex 位置处的日志条目的任期号和 prevLogTerm 不匹配，则返回 false （5.3 节）
     *    如果已经存在的日志条目和新的产生冲突（索引值相同但是任期号不同），删除这一条和之后所有的 （5.3 节）
     *    附加任何在已有的日志中不存在的条目
     *    如果 leaderCommit > commitIndex，令 commitIndex 等于 leaderCommit 和 新日志条目索引值中较小的一个
     *
     * @param request 请求
     * @return 结果
     */
    AppendLogResponse appendLog(AppendLogRequest request);

}
```

# LogManager 日志管理模块

```java
package com.github.houbb.raft.server.core;

import com.github.houbb.raft.common.entity.req.dto.LogEntry;

/**
 * 日志模块
 *
 * @since 1.0.0
 */
public interface LogManager {

    /**
     * 写入
     * @param logEntry 日志
     */
    void write(LogEntry logEntry);

    /**
     * 读取
     * @param index 下标志
     * @return 结果
     */
    LogEntry read(Long index);

    /**
     * 从开始位置删除
     * @param startIndex 开始位置
     */
    void removeOnStartIndex(Long startIndex);

    /**
     * 获取最新的日志
     * @return 日志
     */
    LogEntry getLast();

    /**
     * 获取最新的下标
     * @return 结果
     */
    Long getLastIndex();

}
```

分别是写，读，删，最后是两个关于 Last 的接口，在 Raft 中，Last 是一个非常关键的东西，因此我这里单独定义了 2个方法，虽然看起来不是很好看 ：）

# StateMachine， 状态机接口

```java
package com.github.houbb.raft.server.core;

import com.github.houbb.raft.common.entity.req.dto.LogEntry;

/**
 * 状态机接口
 *
 * 状态机接口，在 Raft 论文中，将数据保存到状态机，作者称之为应用，那么我们也这么命名，
 * 
 * 说白了，就是将已成功提交的日志应用到状态机中：
 *
 * @since 1.0.0
 */
public interface StateMachine {

    /**
     * 将数据应用到状态机.
     *
     * 原则上,只需这一个方法(apply). 其他的方法是为了更方便的使用状态机.
     * @param logEntry 日志中的数据.
     */
    void apply(LogEntry logEntry);

    /**
     * 获取信息
     * @param key Key
     * @return 结果
     */
    LogEntry get(String key);

    /**
     * 获取信息
     * @param key Key
     * @return 结果
     */
    String getString(String key);

    /**
     * 设置
     * @param key Key
     * @param value 值
     */
    void setString(String key, String value);

    /**
     * 删除
     * @param key Key
     */
    void delString(String... key);


}
```

# LifeCycle 生命周期

这里我们简单定义了 2 个，有需要的话，再另外加上组合接口：

```java
/**
 *
 * 生命周期
 *
 * @since 1.0.0
 */
public interface LifeCycle {

    /**
     * 初始化.
     * @throws Throwable 异常
     */
    void init() throws Throwable;

    /**
     * 关闭资源.
     * @throws Throwable 异常
     */
    void destroy() throws Throwable;

}
```

# rpc 客户端+服务端

RpcClient 和 RPCServer 没什么好讲的，其实就是 send 和 receive。

## 客户端

```java
/**
 * rpc 客户端
 * @author houbb
 */
public interface RpcClient extends LifeCycle {

    /**
     * 发送请求, 并同步等待返回值.
     * @param request 参数
     * @param <R> 返回值泛型
     * @return 结果
     */
    <R> R send(RpcRequest request);

    <R> R send(RpcRequest request, int timeout);

}
```

## 服务端

```java
/**
 * rpc 服务端
 * 
 * @author houbb
 */
public interface RpcServer extends LifeCycle {

    /**
     * 处理请求.
     * @param request 请求参数.
     * @return 返回值.
     */
    RpcResponse<?> handlerRequest(RpcRequest request);

}
```

# Node 接口

然后是 Node 接口，Node 接口也是 Raft 没有定义的，我们依靠自己的理解定义了几个接口：

```java
package com.github.houbb.raft.server.core;

import com.github.houbb.raft.common.core.LifeCycle;
import com.github.houbb.raft.common.entity.dto.NodeConfig;
import com.github.houbb.raft.common.entity.req.AppendLogRequest;
import com.github.houbb.raft.common.entity.req.ClientKeyValueRequest;
import com.github.houbb.raft.common.entity.req.VoteRequest;
import com.github.houbb.raft.common.entity.resp.AppendLogResponse;
import com.github.houbb.raft.common.entity.resp.ClientKeyValueResponse;
import com.github.houbb.raft.common.entity.resp.VoteResponse;

/**
 * 节点
 *
 * 首先，一个 Node 肯定需要配置文件，所以有一个 setConfig 接口，
 *
 * 然后，肯定需要处理“请求投票”和“附加日志”，
 *
 * 同时，还需要接收用户，也就是客户端的请求（不然数据从哪来？），
 *
 * 所以有 handlerClientRequest 接口，最后，考虑到灵活性，
 *
 * 我们让每个节点都可以接收客户端的请求，但 follower 节点并不能处理请求，所以需要重定向到 leader 节点，因此，我们需要一个重定向接口。
 *
 */
public interface Node extends LifeCycle {

    /**
     * 设置配置文件.
     *
     * @param config 配置
     */
    void setConfig(NodeConfig config);

    /**
     * 处理请求投票 RPC.
     *
     * @param param 请求
     * @return 结果
     */
    VoteResponse handlerRequestVote(VoteRequest param);

    /**
     * 处理附加日志请求.
     *
     * @param param 请求
     * @return v结果
     */
    AppendLogResponse handlerAppendEntries(AppendLogRequest param);

    /**
     * 处理客户端请求.
     *
     * @param request 请求
     * @return 结果
     */
    ClientKeyValueResponse handlerClientRequest(ClientKeyValueRequest request);

    /**
     * 转发给 leader 节点.
     * @param request 请求
     * @return 结果
     */
    ClientKeyValueResponse redirect(ClientKeyValueRequest request);

}
```


# 参考资料


* any list
{:toc}