---
layout: post
title: raft-13-从零开始实现自己的 raft（四）选举的核心实现逻辑
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

# Leader 选举的实现

## 请求者

选举，其实就是一个定时器，根据 Raft 论文描述，如果超时了就需要重新选举，我们使用 Java 的定时任务线程池进行实现，实现之前，需要确定几个点：

- 选举者必须不是 leader。

- 必须超时了才能选举，具体超时时间根据你的设计而定,注意，每个节点的超时时间不能相同，应当使用随机算法错开（Raft 关键实现），避免无谓的死锁。

- 选举者优先选举自己,将自己变成 candidate。

- 选举的第一步就是把自己的 term 加一。

- 然后像其他节点发送请求投票 RPC，请求参数参照论文，包括自身的 term，自身的 lastIndex，以及日志的 lastTerm。同时，请求投票 RPC 应该是并行请求的。

- 等待投票结果应该有超时控制，如果超时了，就不等待了。

- 最后，如果有超过半数的响应为 success，那么就需要立即变成 leader ，并发送心跳阻止其他选举。

- 如果失败了，就需要重新选举。注意，这个期间，如果有其他节点发送心跳，也需要立刻变成 follower，否则，将死循环。

## 接受者

上面说的，其实是 Leader 选举中，请求者的实现，那么接收者如何实现呢？

接收者在收到“请求投票” RPC 后，需要做以下事情：

- 注意，选举操作应该是串行的，因为涉及到状态修改，并发操作将导致数据错乱。也就是说，如果抢锁失败，应当立即返回错误。

- 首先判断对方的 term 是否小于自己，如果小于自己，直接返回失败。

- 如果当前节点没有投票给任何人，或者投的正好是对方，那么就可以比较日志的大小，反之，返回失败。

- 如果对方日志没有自己大，返回失败。反之，投票给对方，并变成 follower。变成 follower 的同时，异步的选举任务在最后从 condidate 变成 leader 之前，会判断是否是 

follower，如果是 follower，就放弃成为 leader。这是一个兜底的措施。

到这里，基本就能够实现 Raft Leader 选举的逻辑。

注意，我们上面涉及到的 LastIndex 等参数，还没有实现，但不影响我们编写伪代码，毕竟日志复制比 leader 选举要复杂的多，我们的原则是从易到难。：）

# 实现逻辑

## 请求者

投票任务的核心逻辑：

```java
package com.github.houbb.raft.server.support.vote;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.raft.common.constant.RpcRequestCmdConst;
import com.github.houbb.raft.common.constant.enums.NodeStatusEnum;
import com.github.houbb.raft.common.entity.req.VoteRequest;
import com.github.houbb.raft.common.entity.req.dto.LogEntry;
import com.github.houbb.raft.common.entity.resp.VoteResponse;
import com.github.houbb.raft.common.rpc.RpcClient;
import com.github.houbb.raft.common.rpc.RpcRequest;
import com.github.houbb.raft.server.core.LogManager;
import com.github.houbb.raft.server.dto.PeerInfoDto;
import com.github.houbb.raft.server.dto.node.NodeInfoContext;
import com.github.houbb.raft.server.support.peer.PeerManager;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 投定时调度
 *
 * 1. 在转变成候选人后就立即开始选举过程
 * 自增当前的任期号（currentTerm）
 * 给自己投票
 * 重置选举超时计时器
 * 发送请求投票的 RPC 给其他所有服务器
 * 2. 如果接收到大多数服务器的选票，那么就变成领导人
 * 3. 如果接收到来自新的领导人的附加日志 RPC，转变成跟随者
 * 4. 如果选举过程超时，再次发起一轮选举
 *
 * @since 1.0.0
 */
public class VoteTask implements Runnable {

    private final Log log = LogFactory.getLog(VoteTask.class);

    private final NodeInfoContext nodeInfoContext;

    public VoteTask(NodeInfoContext nodeInfoContext) {
        this.nodeInfoContext = nodeInfoContext;
    }

    @Override
    public void run() {
        //1. leader 不参与选举
        if(NodeStatusEnum.LEADER.equals(nodeInfoContext.getStatus())) {
            log.info("[Raft] current status is leader, ignore vote.");
            return;
        }

        //2. 判断两次的时间间隔
        boolean isFitElectionTime = isFitElectionTime();
        if(!isFitElectionTime) {
            return;
        }

        //3. 开始准备选举
        //3.1 状态候选
        nodeInfoContext.setStatus(NodeStatusEnum.CANDIDATE);
        log.info("Node will become CANDIDATE and start election leader, info={}", nodeInfoContext);
        //3.2 上一次的选票时间
        nodeInfoContext.setPreElectionTime(getPreElectionTime());
        //3.3 term 自增
        nodeInfoContext.setCurrentTerm(nodeInfoContext.getCurrentTerm()+1);
        //3.4 给自己投票
        final PeerManager peerManager = nodeInfoContext.getPeerManager();
        final String selfAddress = peerManager.getSelf().getAddress();
        nodeInfoContext.setVotedFor(selfAddress);
        //通知其他除了自己的节点（暂时使用同步，后续应该优化为异步线程池，这里为了简化流程）
        // TODO: 需要考虑超时的情况
        final List<PeerInfoDto> allPeerList = peerManager.getList();
        List<VoteResponse> voteResponseList = new ArrayList<>();
        for(PeerInfoDto remotePeer : allPeerList) {
            // 跳过自己
            if(remotePeer.getAddress().equals(selfAddress)) {
                continue;
            }

            // 远程投票
            try {
                VoteResponse response = voteSelfToRemote(remotePeer, selfAddress, nodeInfoContext);
                voteResponseList.add(response);
            } catch (Exception e) {
                log.error("voteSelfToRemote meet ex, remotePeer={}", remotePeer, e);
            }
        }

        //3.5 判断选举结果
        int voteSuccessTotal = calcVoteSuccessVote(voteResponseList, nodeInfoContext);
        // 如果投票期间,有其他服务器发送 appendEntry , 就可能变成 follower ,这时,应该停止.
        if (NodeStatusEnum.FOLLOWER.equals(nodeInfoContext.getStatus())) {
            log.info("[Raft] 如果投票期间,有其他服务器发送 appendEntry, 就可能变成 follower, 这时,应该停止.");
            return;
        }

        // 是否超过一半？加上自己，等于也行。自己此时没算
        if(voteSuccessTotal >= peerManager.getList().size() / 2) {
            log.warn("[Raft] leader node vote success become leader {}", selfAddress);
            nodeInfoContext.setStatus(NodeStatusEnum.LEADER);
            peerManager.setLeader(peerManager.getSelf());
            // 投票人信息清空
            nodeInfoContext.setVotedFor("");
            // 成主之后做的一些事情
            afterBeingLeader(nodeInfoContext);
        } else {
            // 投票人信息清空 重新选举
            nodeInfoContext.setVotedFor("");
            log.warn("vote failed, wait next vote");
        }

        // 再次更新选举时间 为什么？？？？
        nodeInfoContext.setPreElectionTime(getPreElectionTime());
    }

    /**
     * 随机  获取上一次的选举时间
     * @return 时间
     */
    private long getPreElectionTime() {
        return System.currentTimeMillis() + ThreadLocalRandom.current().nextInt(200) + 150;
    }


    /**
     * 初始化所有的 nextIndex 值为自己的最后一条日志的 index + 1. 如果下次 RPC 时, 跟随者和leader 不一致,就会失败.
     * 那么 leader 尝试递减 nextIndex 并进行重试.最终将达成一致.
     * @param nodeInfoContext 上下文
     */
    private void afterBeingLeader(NodeInfoContext nodeInfoContext) {
        //todo...  这个后续再日志复制部分实现
    }

    /**
     * 计算投票给自己的数量
     * 1. 同时需要更新自己的任期
     * @param voteResponseList 结果列表
     * @param nodeInfoContext 基本信息
     * @return 结果
     */
    private int calcVoteSuccessVote(List<VoteResponse> voteResponseList,
                                    final NodeInfoContext nodeInfoContext) {
        int sum = 0;

        for(VoteResponse response : voteResponseList) {
            if(response == null) {
                log.error("response is null");
                continue;
            }

            // 投票给自己
            boolean isVoteGranted = response.isVoteGranted();
            if (isVoteGranted) {
                sum++;
            } else {
                // 更新自己的任期.
                long resTerm = response.getTerm();
                if (resTerm >= nodeInfoContext.getCurrentTerm()) {
                    nodeInfoContext.setCurrentTerm(resTerm);
                    log.info("[Raft] update current term from vote res={}", response);
                }
            }
        }

        log.info("calcVoteSuccessVote sum={}", sum);
        return sum;
    }

    private VoteResponse voteSelfToRemote(PeerInfoDto remotePeer,
                                          final String selfAddress,
                                          final NodeInfoContext nodeInfoContext) {
        final LogManager logManager = nodeInfoContext.getLogManager();
        // 当前最后的 term
        long lastTerm = 0L;
        LogEntry last = logManager.getLast();
        if (last != null) {
            lastTerm = last.getTerm();
        }

        VoteRequest param = new VoteRequest();
        param.setTerm(nodeInfoContext.getCurrentTerm());
        param.setCandidateId(nodeInfoContext.getPeerManager().getSelf().getAddress());
        long logIndex = logManager.getLastIndex() == null ? 0 : logManager.getLastIndex();
        param.setLastLogIndex(logIndex);
        param.setLastLogTerm(lastTerm);

        RpcRequest request = new RpcRequest();
        request.setCmd(RpcRequestCmdConst.R_VOTE);
        request.setObj(param);
        request.setUrl(remotePeer.getAddress());

        // 发送
        final RpcClient rpcClient = nodeInfoContext.getRpcClient();
        // 请求超时时间，后续可以考虑配置化
        VoteResponse voteResponse = rpcClient.send(request, 30);
        return voteResponse;
    }

    /**
     * 是否满足选举的时间
     *
     * @return 结果
     */
    private boolean isFitElectionTime() {
        long electionTime = nodeInfoContext.getElectionTime();
        long preElectionTime = nodeInfoContext.getPreElectionTime();

        //基于 RAFT 的随机时间,解决冲突.
        // 这里不会导致这个值越来越大吗？？？
        long randomElectionTime = electionTime + ThreadLocalRandom.current().nextInt(50);
        nodeInfoContext.setElectionTime(randomElectionTime);

        long current = System.currentTimeMillis();
        if (current - preElectionTime < randomElectionTime) {
            log.warn("[Raft] current electionTime is not fit, ignore handle");

            return false;
        }
        return true;
    }

}
```


## 接受者

接受者的核心逻辑如下：

```java
package com.github.houbb.raft.server.core.impl;

import com.github.houbb.heaven.util.io.StreamUtil;
import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.raft.common.constant.enums.NodeStatusEnum;
import com.github.houbb.raft.common.entity.req.AppendLogRequest;
import com.github.houbb.raft.common.entity.req.VoteRequest;
import com.github.houbb.raft.common.entity.resp.AppendLogResponse;
import com.github.houbb.raft.common.entity.resp.VoteResponse;
import com.github.houbb.raft.server.core.Consensus;
import com.github.houbb.raft.server.core.LogManager;
import com.github.houbb.raft.server.dto.PeerInfoDto;
import com.github.houbb.raft.server.dto.node.NodeInfoContext;
import com.github.houbb.raft.server.support.peer.PeerManager;

import java.util.concurrent.locks.ReentrantLock;

/**
 * 默认一致性实现
 * @since 1.0.0
 */
public class DefaultConsensus implements Consensus {

    private static final Log log = LogFactory.getLog(DefaultConsensus.class);

    /**
     * 选举锁
     */
    private final ReentrantLock voteLock = new ReentrantLock();

    /**
     * node 信息上下文
     */
    private final NodeInfoContext nodeInfoContext;

    public DefaultConsensus(NodeInfoContext nodeInfoContext) {
        this.nodeInfoContext = nodeInfoContext;
    }

    /**
     * 接收者实现：
     *      主要时先做一个抢占锁的动作，失败，则直接返回。
     *
     *      如果term < currentTerm返回 false （5.2 节）
     *      如果 votedFor 为空或者就是 candidateId，并且候选人的日志至少和自己一样新，那么就投票给他（5.2 节，5.4 节）
     *
     * @param request 请求
     * @return 结果
     */
    @Override
    public VoteResponse vote(VoteRequest request) {
        final long currentTerm = nodeInfoContext.getCurrentTerm();
        final String currentVoteFor = nodeInfoContext.getVotedFor();
        final PeerManager peerManager = nodeInfoContext.getPeerManager();

        final VoteResponse voteResponse = new VoteResponse();
        voteResponse.setTerm(currentTerm);
        voteResponse.setVoteGranted(false);

        final long reqTerm = request.getTerm();

        try {
            //1. 抢占锁
            boolean tryLogFlag = voteLock.tryLock();
            if(!tryLogFlag) {
                log.info("vote for request={} tryLock false", request);
                return voteResponse;
            }

            //2.1 如果term < currentTerm返回 false （5.2 节）
            if(reqTerm < currentTerm) {
                log.info("vote for reqTerm={} < currentTerm={}", reqTerm, currentTerm);
                return voteResponse;
            }

            log.info("node {} currentTerm={}. current vote for [{}], paramCandidateId : {}, paramTerm={}",
                    peerManager.getSelf(),
                    currentTerm,
                    currentVoteFor,
                    request.getCandidateId(),
                    request.getTerm()
                    );

            //2.2 (当前节点并没有投票 或者 已经投票过了且是对方节点) && 对方日志和自己一样新
            boolean isMatchVoteCondition = isMatchVoteCondition(request);
            if(!isMatchVoteCondition) {
                return voteResponse;
            }

            //2.3 如果 votedFor 为空或者就是 candidateId，并且候选人的日志至少和自己一样新，那么就投票给他（5.2 节，5.4 节）
            final LogManager logManager = nodeInfoContext.getLogManager();
            // 对方没有自己新
            if (logManager.getLast().getTerm() > request.getLastLogTerm()) {
                log.info("request lastTerm is too old.");
                return voteResponse;
            }
            // 对方没有自己新
            if (logManager.getLastIndex() > request.getLastLogIndex()) {
                log.info("request lastIndex is too old.");
                return voteResponse;
            }

            //3. 满足
            nodeInfoContext.setStatus(NodeStatusEnum.FOLLOWER);
            nodeInfoContext.setCurrentTerm(reqTerm);
            nodeInfoContext.setVotedFor(request.getServerId()); //serverId 和 candidateId 是一样的，为什么要两个？
            peerManager.setLeader(new PeerInfoDto(request.getCandidateId()));

            //4. 返回成功
            voteResponse.setTerm(reqTerm);
            voteResponse.setVoteGranted(true);
            return voteResponse;
        } catch (Exception e) {
            log.error("Vote meet ex, req={}", request, e);
            return voteResponse;
        } finally {
            voteLock.unlock();
        }
    }

    /**
     * 满足投票条件
     * @param request 请求
     * @return 结果
     */
    private boolean isMatchVoteCondition(VoteRequest request) {
        final String currentVoteFor = nodeInfoContext.getVotedFor();
        if(StringUtil.isEmpty(currentVoteFor)
                || currentVoteFor.equals(request.getCandidateId())) {
            return true;
        }
        return false;
    }

    @Override
    public AppendLogResponse appendLog(AppendLogRequest request) {
        // todo...
        return null;
    }

}
```

# 小结

当然，这里只是简单的实现 vote 的初步逻辑，还缺少对于日志复制的逻辑实现。

我们下一节开始考虑日志的处理逻辑。

# 参考资料

* any list
{:toc}