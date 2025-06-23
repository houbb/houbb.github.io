---
layout: post
title: raft-13-从零开始实现自己的 raft（五）heartbeat 心跳日志
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

# 日志复制的实现

日志复制是 Raft 实现一致性的核心。

日志复制有 2 种形式，1种是心跳，一种是真正的日志，心跳的日志内容是空的，其他部分基本相同，也就是说，接收方在收到日志时，如果发现是空的，那么他就是心跳。

# 心跳

## 请求者

既然是心跳，肯定就是个定时任务，和选举一样。

在我们的实现中，我们每 5 秒发送一次心跳。

注意点：

- 首先自己必须是 leader 才能发送心跳。

- 必须满足 5 秒的时间间隔。

- 并发的向其他 follower 节点发送心跳。

- 心跳参数包括自身的 ID，自身的 term，以便让对方检查 term，防止网络分区导致的脑裂。

- 如果任意 follower 的返回值的 term 大于自身，说明自己分区了，那么需要变成 follower，并更新自己的 term。然后重新发起选举。

## 接收者

然后是心跳接收者的实现，这个就比较简单了，接收者需要做几件事情：

1) 无论成功失败首先设置返回值，也就是将自己的 term 返回给 leader。

2) 判断对方的 term 是否大于自身，如果大于自身，变成 follower，防止异步的选举任务误操作。同时更新选举时间和心跳时间。

3) 如果对方 term 小于自身，返回失败。不更新选举时间和心跳时间。以便触发选举。


# 实现逻辑

## 主节点

```java
package com.github.houbb.raft.server.support.hearbeat;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.raft.common.constant.RpcRequestCmdConst;
import com.github.houbb.raft.common.constant.enums.NodeStatusEnum;
import com.github.houbb.raft.common.entity.req.AppendLogRequest;
import com.github.houbb.raft.common.entity.resp.AppendLogResponse;
import com.github.houbb.raft.common.rpc.RpcClient;
import com.github.houbb.raft.common.rpc.RpcRequest;
import com.github.houbb.raft.server.dto.PeerInfoDto;
import com.github.houbb.raft.server.dto.node.NodeInfoContext;
import com.github.houbb.raft.server.support.peer.PeerManager;

import java.util.List;

/**
 * 心跳调度任务
 * @since 1.0.0
 */
public class HeartbeatTask implements Runnable {

    private final Log log = LogFactory.getLog(HeartbeatTask.class);

    private final NodeInfoContext nodeInfoContext;

    public HeartbeatTask(NodeInfoContext nodeInfoContext) {
        this.nodeInfoContext = nodeInfoContext;
    }

    /**
     * - 必须满足 5 秒的时间间隔。
     * （其实这个应该调度间隔控制，方法判断感觉比较奇怪，如何二次刚好没达到，会导致下一次时间间隔过长）
     *
     * - 并发的向其他 follower 节点发送心跳。
     * - 心跳参数包括自身的 ID，自身的 term，以便让对方检查 term，防止网络分区导致的脑裂。
     * - 如果任意 follower 的返回值的 term 大于自身，说明自己分区了，那么需要变成 follower，并更新自己的 term。然后重新发起选举。
     */
    @Override
    public void run() {
        log.info(">>>>>>>>>>>>>>> [Heartbeat] task start");

        final NodeStatusEnum nodeStatus = nodeInfoContext.getStatus();
        if(!NodeStatusEnum.LEADER.equals(nodeStatus)) {
            log.warn("Only leader node need heartbeat, currentStatus={}", nodeStatus);
            return;
        }

        // 时间间隔控制，个人觉得没必要

        // 通知 follower
        final PeerManager peerManager = nodeInfoContext.getPeerManager();
        List<PeerInfoDto> peerInfoList = peerManager.getList();
        final PeerInfoDto selfInfo = peerManager.getSelf();

        final RpcClient rpcClient = nodeInfoContext.getRpcClient();
        final long currentTerm = nodeInfoContext.getCurrentTerm();
        for(PeerInfoDto remotePeer : peerInfoList) {
            // 跳过自己
            if(remotePeer.getAddress().equals(selfInfo.getAddress())) {
                continue;
            }

            AppendLogRequest appendLogRequest = new AppendLogRequest();
            appendLogRequest.setLeaderId(selfInfo.getAddress());
            // 这有什么用？ 通知到对方，为什么要设置对方的标识？
            appendLogRequest.setServerId(remotePeer.getAddress());
            appendLogRequest.setTerm(nodeInfoContext.getCurrentTerm());
            appendLogRequest.setLeaderCommit(currentTerm);
            appendLogRequest.setLeaderCommit(nodeInfoContext.getCommitIndex());

            RpcRequest request = new RpcRequest();
            request.setCmd(RpcRequestCmdConst.R_VOTE);
            request.setObj(appendLogRequest);
            request.setUrl(remotePeer.getAddress());

            AppendLogResponse appendLogResponse = rpcClient.send(request);

            // 结果的处理
            final long term = appendLogResponse.getTerm();
            if (term > currentTerm) {
                log.error("self will become follower, he's term : {}, my term : {}", term, currentTerm);
                nodeInfoContext.setCurrentTerm(term);
                nodeInfoContext.setVotedFor("");
                nodeInfoContext.setStatus(NodeStatusEnum.FOLLOWER);
            }
        }

        log.info(">>>>>>>>>>>>>>> [Heartbeat] task end");
    }

}
```

## 接收者

```java
    /**
     * 添加日志
     *
     * 接收者实现：
     *    如果 term < currentTerm 就返回 false （5.1 节）
     *    如果日志在 prevLogIndex 位置处的日志条目的任期号和 prevLogTerm 不匹配，则返回 false （5.3 节）
     *    如果已经存在的日志条目和新的产生冲突（索引值相同但是任期号不同），删除这一条和之后所有的 （5.3 节）
     *    附加任何在已有的日志中不存在的条目
     *    如果 leaderCommit > commitIndex，令 commitIndex 等于 leaderCommit 和 新日志条目索引值中较小的一个
     *
     * @param request 请求
     * @return 结果
     */
    @Override
    public AppendLogResponse appendLog(AppendLogRequest request) {
        AppendLogResponse appendLogResponse = new AppendLogResponse();
        final long currentTerm = nodeInfoContext.getCurrentTerm();
        appendLogResponse.setTerm(currentTerm);
        appendLogResponse.setSuccess(false);

        final long reqTerm = request.getTerm();
        try {
            //1.1 抢占锁
            boolean tryLockFlag = appendLogLock.tryLock();
            if(!tryLockFlag) {
                log.warn("[AppendLog] tryLog false");
                return appendLogResponse;
            }
            //1.2 是否够格？
            if(currentTerm > request.getTerm()) {
                log.warn("[AppendLog] currentTerm={} > reqTerm={}", currentTerm, reqTerm);
                return appendLogResponse;
            }

            //2.1 基本信息更新 为什么这样设置？
            final PeerManager peerManager = nodeInfoContext.getPeerManager();
            final long nowMills = System.currentTimeMillis();
            nodeInfoContext.setElectionTime(nowMills);
            nodeInfoContext.setPreElectionTime(nowMills);
            nodeInfoContext.setStatus(NodeStatusEnum.FOLLOWER);
            nodeInfoContext.setCurrentTerm(reqTerm);
            peerManager.setLeader(new PeerInfoDto(request.getLeaderId()));
            log.info("[AppendLog] update electionTime={}, status=Follower, term={}, leader={}",
                    nowMills, reqTerm, request.getLeaderId());

            //3.1 处理心跳
            if(ArrayUtil.isEmpty(request.getEntries())) {
                handleHeartbeat(request);

                //3.2 返回响应
                appendLogResponse.setTerm(reqTerm);
                appendLogResponse.setSuccess(true);
                return appendLogResponse;
            }

            return appendLogResponse;
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            appendLogLock.unlock();
        }
    }

    private void handleHeartbeat(AppendLogRequest request) {
        final long startTime = System.currentTimeMillis();
        log.info("handleHeartbeat start req={}", request);

        final LogManager logManager = nodeInfoContext.getLogManager();

        // 处理 leader 已提交但未应用到状态机的日志

        // 下一个需要提交的日志的索引（如有）
        long nextCommit = nodeInfoContext.getCommitIndex() + 1;

        //如果 leaderCommit > commitIndex，令 commitIndex 等于 leaderCommit 和 新日志条目索引值中较小的一个
        if (request.getLeaderCommit() > nodeInfoContext.getCommitIndex()) {
            int commitIndex = (int) Math.min(request.getLeaderCommit(), logManager.getLastIndex());
            nodeInfoContext.setCommitIndex(commitIndex);
            nodeInfoContext.setLastApplied(commitIndex);
        }

        final StateMachine stateMachine = nodeInfoContext.getStateMachine();
        while (nextCommit <= nodeInfoContext.getCommitIndex()){
            // 提交之前的日志
            // todo: 状态机需要基于 kv 实现
            stateMachine.apply(logManager.read(nextCommit));

            nextCommit++;
        }

        long costTime = System.currentTimeMillis() - startTime;
        log.info("handleHeartbeat start end, costTime={}", costTime);
    }
```

# 小结

当然，这里只是简单的实现 appendLog 的心跳 的初步逻辑，其他条目的处理逻辑还没有实现。

我们下一节开始考虑日志复制的具体处理逻辑。

# 参考资料

* any list
{:toc}