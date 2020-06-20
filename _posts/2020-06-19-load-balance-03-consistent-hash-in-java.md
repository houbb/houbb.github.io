---
layout: post
title:  load balance 03-consistent hash algorithm 一致性哈希算法 java 实现
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

本节我们来看一下如何实现一个一致性 hash 框架。

## 源码

### 普通 hash

我们首先定义一下 hash 接口，以及最简单的 jdk 实现：

- IHash

```java
public interface IHash {

    /**
     * 计算 hash 值
     * @param text 文本
     * @return 结果
     * @since 0.0.1
     */
    int hash(String text);

}
```

- HashJdk.java

```java
public class HashJdk implements IHash {

    @Override
    public int hash(String text) {
        return text.hashCode();
    }

}
```

### Node 定义

用来定义一个节点：

此处省略了一些方法。

```java
public class Node {

    /**
     * 节点名称
     * @since 0.0.1
     */
    private String name;

    /**
     * 节点 ip
     * @since 0.0.1
     */
    private String ip;

    public Node(String name, String ip) {
        this.name = name;
        this.ip = ip;
    }

    public Node(String ip) {
        this(ip, ip);
    }

    //Getter & Setter & toString()
    // equals && hashCode
}
```

### 核心实现

- IConsistentHashing.java

一致性 hash 的接口定义。

```java
public interface IConsistentHashing {

    /**
     * 获取对应的节点
     * @param key key
     * @return 节点
     * @since 0.0.1
     */
    Node get(final String key);

    /**
     * 添加节点
     * @param node 节点
     * @return this
     * @since 0.0.1
     */
    IConsistentHashing add(final Node node);

    /**
     * 移除节点
     * @param node 节点
     * @return this
     * @since 0.0.1
     */
    IConsistentHashing remove(final Node node);

    /**
     * 获取节点信息
     * @return 节点
     * @since 0.0.1
     */
    Map<Integer, Node> nodeMap();

}
```

- 默认实现

```java
public class ConsistentHashing implements IConsistentHashing {

    /**
     * 虚拟节点数量
     * @since 0.0.1
     */
    private final int virtualNum;

    /**
     * hash 策略
     * @since 0.0.1
     */
    private final IHash hash;

    /**
     * node map 节点信息
     *
     * key: 节点 hash
     * Node: 节点
     * @since 0.0.1
     */
    private final TreeMap<Integer, Node> nodeMap = new TreeMap<>();

    public ConsistentHashing(int virtualNum, IHash hash) {
        this.virtualNum = virtualNum;
        this.hash = hash;
    }

    /**
     * 沿环的顺时针找到虚拟节点
     * @param key key
     * @return 结果
     * @since 0.0.1
     */
    @Override
    public Node get(String key) {
        final int hashCode = hash.hash(key);
        Integer target = hashCode;

        // 不包含时候的处理
        if (!nodeMap.containsKey(hashCode)) {
            target = nodeMap.ceilingKey(hashCode);
            if (target == null && !nodeMap.isEmpty()) {
                target = nodeMap.firstKey();
            }
        }
        return nodeMap.get(target);
    }

    @Override
    public IConsistentHashing add(Node node) {
        // 初始化虚拟节点
        for (int i = 0; i < virtualNum; i++) {
            int nodeKey = hash.hash(node.toString() + "-" + i);
            nodeMap.put(nodeKey, node);
        }

        return this;
    }

    @Override
    public IConsistentHashing remove(Node node) {
        // 移除虚拟节点
        // 其实这里有一个问题，如果存在 hash 冲突，直接移除会不会不够严谨？
        for (int i = 0; i < virtualNum; i++) {
            int nodeKey = hash.hash(node.toString() + "-" + i);
            nodeMap.remove(nodeKey);
        }

        return this;
    }

    @Override
    public Map<Integer, Node> nodeMap() {
        return Collections.unmodifiableMap(this.nodeMap);
    }

}
```

## 完整代码

其他还有一些引导类等辅助工具。

完整代码参见 [github](https://github.com/houbb/consistent-hashing)

# 参考资料

[consistent-hashing-redis](https://github.com/Fourwenwen/consistent-hashing-redis)

[consistent-hash-algorithm](https://github.com/lexburner/consistent-hash-algorithm)

[ConsistentHash](https://github.com/codeAping/ConsistentHash)

[一致性hash的JAVA实现](https://github.com/zhishan332/ConsistantHash)

* any list
{:toc}