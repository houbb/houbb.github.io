---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC146. LRU 缓存  lru-cache
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, linkedlist, top100, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# 数据结构篇

https://leetcode.cn/studyplan/top-100-liked/

## 历史回顾

# LC146. LRU 缓存

请你设计并实现一个满足  LRU (最近最少使用) 缓存 约束的数据结构。

实现 LRUCache 类：

LRUCache(int capacity) 以 正整数 作为容量 capacity 初始化 LRU 缓存

int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。

void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value ；如果不存在，则向缓存中插入该组 key-value 。

如果插入操作导致关键字数量超过 capacity ，则应该 逐出 最久未使用的关键字。

函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。

示例：

输入

```
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
```

输出

```
[null, null, null, 1, null, -1, null, -1, 3, 4]
```

解释

```
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // 缓存是 {1=1}
lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}
lRUCache.get(1);    // 返回 1
lRUCache.put(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
lRUCache.get(2);    // 返回 -1 (未找到)
lRUCache.put(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
lRUCache.get(1);    // 返回 -1 (未找到)
lRUCache.get(3);    // 返回 3
lRUCache.get(4);    // 返回 4
``` 

提示：

1 <= capacity <= 3000
0 <= key <= 10000
0 <= value <= 10^5
最多调用 2 * 10^5 次 get 和 put

# v1-最基本的解法

## 思路

1. 借助 HashMap 做底层实现，存储值

2. 同时用额外的 HashMap 记录时间先后，用 counter 来替代时间戳，避免重复。

## 实现

```java
    class LRUCache {

        private Map<Integer, Integer> valueMap = new HashMap<>();

        private Map<Integer, Long> lastUseMap = new HashMap<>();

        private int capacity = 0;

        // 替代时间戳
        private long counter = 0;

        public LRUCache(int capacity) {
            this.capacity = capacity;
        }

        public int get(int key) {
            if(!valueMap.containsKey(key)) {
                return -1;
            }

            updateUsage(key);

            return valueMap.get(key);
        }

        public void put(int key, int value) {
            // 大小限制
            if(!valueMap.containsKey(key)
                    && valueMap.size() >= capacity) {
                // 驱除最老的一个
                evictKey();
            }

            // 更新使用频率
            updateUsage(key);

            // 更新
            valueMap.put(key, value);
        }

        private void updateUsage(int key) {
            // 更新使用时间
            lastUseMap.put(key, ++counter);
        }

        private void evictKey() {
            // 找到最少被使用的 Key?
            long time = Long.MAX_VALUE;
            Integer key = -1;
            for(Map.Entry<Integer, Long> entry : lastUseMap.entrySet()) {
                if(entry.getValue() < time) {
                    key = entry.getKey();
                    time = entry.getValue();
                }
            }

            lastUseMap.remove(key);
            valueMap.remove(key);
        }
    }
```

## 效果 

超出时间限制

23 / 24 个通过的测试用例

## 反思

这里慢在 evictKey 的时候，我们 O(n) 才找到要删除的节点。

如何优化呢？


# v2-删除优化

## 思路

我们需要 O(1) 的删除，那就需要：

1）O(1) 通过 key 找到节点

2）一直维护好最久没使用的节点信息，可以 O(1) 获取到

可以满足这个条件的就是双向链表。

## 实现

```java
        // 节点
        class Node {
            int key;
            Node prev, next;
            Node(int key) { this.key = key; }
        }

        private Map<Integer, Integer> valueMap = new HashMap<>();
        private int capacity = 0;

        private Map<Integer, Node> nodeMap = new HashMap<>();
        private Node tail = new Node(-1);
        private Node head = new Node(-1);

        public LRUCache(int capacity) {
            this.capacity = capacity;

            // 双向
            head.next = tail;
            tail.prev = head;
        }

        public int get(int key) {
            if(!valueMap.containsKey(key)) {
                return -1;
            }

            updateUsage(key);

            return valueMap.get(key);
        }

        public void put(int key, int value) {
            // 大小限制
            if(!valueMap.containsKey(key)
                    && valueMap.size() >= capacity) {
                // 驱除最老的一个
                evictKey();
            }

            // 更新使用频率
            updateUsage(key);

            // 更新
            valueMap.put(key, value);
        }

        private void updateUsage(int key) {
            Node node = nodeMap.get(key);
            if(node == null) {
                node = new Node(key);
                nodeMap.put(key, node);
            } else {
                // 先删除这个节点
                node.prev.next = node.next;
                node.next.prev = node.prev;
            }

            // 节点放在表头 head->[]->tail
            node.next = head.next;
            node.prev = head;
            head.next.prev = node;
            head.next = node;
        }

        private void evictKey() {
            Node oldest = tail.prev;
            if (oldest == head) return; // 空链表
            removeNode(oldest);
            int key = oldest.key;

            nodeMap.remove(key);
            valueMap.remove(key);
        }

        private void removeNode(final Node node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
```

## 效果

58ms 击败 16.32%

## 反思

感觉上已经是最优秀了，但是效果很差？为什么？

# v3-进一步改进

## 思路

1) nodeMap 和 valueMap 维护了两份 可以改进吗？

也就是我们可以直接把 value 放在 node 中，节省一个空间。

2) map 的话，也可以用 array 数组替代，性能一般更好。

说白了这里使用空间换时间

## 实现

```java
class LRUCache {

    class Node {
        int key;
        int value;
        Node pre;
        Node next;

        public Node(int k, int v) {
            key = k;
            value = v;
        }
    }

    private final Node[] map;
    private final Node head, tail;
    private int size;
    private final int capacity;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new Node[10001];
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.pre = head;
        this.size = 0;
    }

    public int get(int key) {
        Node node = map[key];
        if (node == null) {
            return -1;
        }
        removeNode(node);
        addToHead(node);
        return node.value;
    }

    public void put(int key, int value) {
        Node node = map[key];
        if (node != null) {
            node.value = value;
            removeNode(node);
            addToHead(node);
        } else {
            if (size == capacity) {
                //移除最后一个元素
                Node tailpre = tail.pre;
                removeNode(tailpre);
                map[tailpre.key] = null;
                size--;
            }
            //放入元素
            Node newnode = new Node(key, value);
            addToHead(newnode);
            map[key] = newnode;
            size++;
        }
    }

    private void removeNode(Node node) {
        node.pre.next = node.next;
        node.next.pre = node.pre;
    }

    private void addToHead(Node node) {
        node.next = head.next;
        node.next.pre = node;
        node.pre = head;
        head.next = node;
    }
}

/**
 * Your LRUCache object will be and called as such:
 * LRUCache obj = new LRUCache(capacity);
 * int param_1 = obj.get(key);
 * obj.put(key,value);
 */
```

## 效果

37ms 击败 99.69%

提升一般，但是已经是 Top1 解法。

# v4-借助 LinkedHashMap

## 思路

jdk 内置实现了这个，性能更好

又称为逃课版本

## 实现

```java
class LRUCache extends LinkedHashMap<Integer, Integer> {

        private int capacity;

        public LRUCache(int capacity) {
            super(capacity, 0.75f, true); // true = accessOrder
            this.capacity = capacity;
        }

        public int get(int key) {
            return super.getOrDefault(key, -1);
        }

        public void put(int key, int value) {
           super.put(key, value);
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
            return size() > capacity;
        }

    }

```

## 效果

45ms 击败 82.64%

## 反思

依然不是最优



* any list
{:toc}