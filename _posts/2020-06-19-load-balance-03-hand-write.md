---
layout: post
title:  load balance 04-java 从零手写实现负载均衡
date:  2020-6-19 09:26:03 +0800
categories: [Distributed]
tags: [java, open-source, distributed, hash, sh]
published: true
---

## 负载均衡系列专题

[01-负载均衡基础知识](https://houbb.github.io/2020/06/19/load-balance-01-basic)

[02-一致性 hash 原理](https://houbb.github.io/2020/06/19/load-balance-02-consistent-hash-in-java)

[03-一致性哈希算法 java 实现](https://houbb.github.io/2020/06/19/load-balance-03-consistent-hash-in-java)

[04-负载均衡算法 java 实现](https://houbb.github.io/2020/06/19/load-balance-03-load-balance)

本节我们来看一下如何实现一负载均衡框架。

## 源码

### 核心接口定义

```java
public interface ILoadBalance {

    /**
     * 选择下一个节点
     *
     * 返回下标
     * @param context 上下文
     * @return 结果
     * @since 0.0.1
     */
    IServer select(final ILoadBalanceContext context);

}
```

### 1. 随机策略

```java
public class LoadBalanceRandom extends AbstractLoadBalance{

    public LoadBalanceRandom(List<IServer> servers) {
        super(servers);
    }

    @Override
    protected IServer doSelect(ILoadBalanceContext context) {
        Random random = ThreadLocalRandom.current();
        int nextIndex = random.nextInt(servers.size());
        return servers.get(nextIndex);
    }

}
```

### 2. 轮训

```java
public class LoadBalanceRoundRobbin extends AbstractLoadBalance {

    /**
     * 位移指针
     * @since 0.0.1
     */
    private final AtomicLong indexHolder = new AtomicLong();

    public LoadBalanceRoundRobbin(List<IServer> servers) {
        super(servers);
    }

    @Override
    protected IServer doSelect(ILoadBalanceContext context) {
        long index = indexHolder.getAndIncrement();
        int actual = (int) (index % servers.size());
        return servers.get(actual);
    }

}
```

### 3. 有权重的轮训

这个需要对数据进行初始化处理，计算数组的最大公约数。

```java
public class LoadBalanceWeightRoundRobbin extends AbstractLoadBalance {

    /**
     * 位移指针
     * @since 0.0.1
     */
    private final AtomicLong indexHolder = new AtomicLong();

    /**
     * 处理后的列表
     * @since 0.0.1
     */
    private final List<IServer> actualList = new ArrayList<>();

    public LoadBalanceWeightRoundRobbin(List<IServer> servers) {
        super(servers);

        // 初始化真实列表
        this.init(servers);
    }

    @Override
    protected IServer doSelect(ILoadBalanceContext context) {
        long index = indexHolder.getAndIncrement();

        // 基于真实的列表构建
        int actual = (int) (index % actualList.size());
        return actualList.get(actual);
    }

    /**
     * 初始化
     * @param serverList 服务列表
     * @since 0.0.1
     */
    private void init(final List<IServer> serverList) {
        //1. 过滤掉权重为 0 的机器
        List<IServer> notZeroServers = CollectionUtil.filterList(serverList, new IFilter<IServer>() {
            @Override
            public boolean filter(IServer iServer) {
                return iServer.weight() <= 0;
            }
        });

        //2. 获取权重列表
        List<Integer> weightList = CollectionUtil.toList(notZeroServers, new IHandler<IServer, Integer>() {
            @Override
            public Integer handle(IServer iServer) {
                return iServer.weight();
            }
        });

        //3. 获取最大的权重
        int maxDivisor = MathUtil.ngcd(weightList);

        //4. 重新计算构建基于权重的列表
        for(IServer server : notZeroServers) {
            int weight = server.weight();

            int times = weight / maxDivisor;
            for(int i = 0; i < times; i++) {
                actualList.add(server);
            }
        }
    }

}
```

### 4. 普通哈希

```java
public class LoadBalanceCommonHash extends AbstractLoadBalanceHash {

    public LoadBalanceCommonHash(List<IServer> servers, IHash hash) {
        super(servers, hash);
    }

    @Override
    protected IServer doSelect(ILoadBalanceContext context) {
        final String hashKey = context.hashKey();

        int hashCode = Math.abs(hash.hash(hashKey));
        int index = servers.size() % hashCode;
        return servers.get(index);
    }

}
```

### 5. 一致性哈希

这里将我们前面实现的一致性哈希，与负载均衡结合。

```java
public class LoadBalanceConsistentHash extends AbstractLoadBalanceHash {

    /**
     * 一致性 hash 实现
     * @since 0.0.1
     */
    private final IConsistentHashing<IServer> consistentHashing;

    public LoadBalanceConsistentHash(List<IServer> servers, IHash hash) {
        super(servers, hash);

        this.consistentHashing = ConsistentHashingBs
                .<IServer>newInstance()
                .hash(hash)
                .nodes(servers)
                .build();
    }

    @Override
    protected IServer doSelect(ILoadBalanceContext context) {
        final String hashKey = context.hashKey();

        return consistentHashing.get(hashKey);
    }

}
```

## 后期 Road-Map

还有基于系统最小压力，最小连接的实现，暂时没有放在这里。

后续将加入对应的实现。

## 完整开源代码

其他还有一些引导类等辅助工具。

完整代码参见 [load-balance](https://github.com/houbb/load-balance)

* any list
{:toc}