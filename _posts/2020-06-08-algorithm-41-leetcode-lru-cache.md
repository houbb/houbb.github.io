---
layout: post
title: leetcode 41 LRU CACHE 
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, sh]
published: true
---

# 146. LRU Cache

Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:

LRUCache(int capacity) Initialize the LRU cache with positive size capacity.

int get(int key) Return the value of the key if the key exists, otherwise return -1.

void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. 

If the number of keys exceeds the capacity from this operation, evict the least recently used key.

The functions get and put must each run in O(1) average time complexity.

## EX

Example 1:

```
Input
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
Output
[null, null, null, 1, null, -1, null, -1, 3, 4]

Explanation
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // cache is {1=1}
lRUCache.put(2, 2); // cache is {1=1, 2=2}
lRUCache.get(1);    // return 1
lRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}
lRUCache.get(2);    // returns -1 (not found)
lRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}
lRUCache.get(1);    // return -1 (not found)
lRUCache.get(3);    // return 3
lRUCache.get(4);    // return 4
```

## Constraints:

1 <= capacity <= 3000

0 <= key <= 10^4

0 <= value <= 10^5

At most 2 * 10^5 calls will be made to get and put.

# V1-HashMap + single-list

## 思路

我们通过 HashMap 存放对应的 key/value。

通过 list 保存对应的出现频率，每次 get/put 把对应的 key 从 list 中删除，然后放在 list 的最开始。

每次 put，判断 map 是否已满，如果满了，则直接淘汰一个元素。淘汰的元素，就是 list 中最后一个元素。

## 实现

```java
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * LRU:
 *
 * 先进来的放到尾端，后进来放到头部，如果内存不够应该是从尾部删除吧，如果get队列中有的数据元素，则会把它移动到头部，每次put都要判断缓存大小是否达到指定的大小，如果达到了，则移除尾部元素
 *
 */
public class T146_LRUCache {

    /**
     * 通过 hashmap 存放数据
     */
    private Map<Integer, Integer> dataMap;

    /**
     * 链表。
     *
     * 1. 新的数据放在 head
     * 2. 每次插入判断是否达到最大的 size，如果达到，则直接 remove 尾巴的元素。
     *
     */
    private List<Integer> freqList;

    private int capacity = 0;

    public T146_LRUCache(int capacity) {
        this.capacity = capacity;
        this.dataMap = new HashMap<>(capacity);
        this.freqList = new LinkedList<>();
    }

    public int get(int key) {
        // 不存在返回-1
        Integer value =  dataMap.get(key);

        // 判断是否存在这个 key
        if(dataMap.containsKey(key)) {
            // GET 的时候，也需要更新频率，首先要把以前的值移除掉。
            this.freqList.remove((Integer) key);
            this.freqList.add(0, key);
        } else {
            value = -1;
        }
        return value;
    }

    public void put(int key, int value) {
        // 首先判断数据是不是满了，而且不包含的时候才淘汰
        if(dataMap.size() >= capacity
            && !dataMap.containsKey(key)) {
            // 准备移除数据，最后一个
            int lastIndex = this.freqList.size()-1;

            // 把对应的数据都删除。
            Integer lastKey = this.freqList.get(lastIndex);
            this.dataMap.remove(lastKey);

            this.freqList.remove(lastIndex);
        }

        // 放入数据
        this.dataMap.put(key, value);

        // 移除
        this.freqList.remove((Integer)key);
        this.freqList.add(0, key);
    }

}
```

## 反思

这个方法功能是正确的，但是性能存在问题。会在 18/22 超时。

对于 dataMap 的操作本身都是 O(1) 的，对于 list 的操作，有下面 2 个：

1）删除最后一个元素

2）删除指定元素的节点，并且把节点移到 list 的最开始

第一步如果通过 index，使用 arraylist 就可以解决。

但是第二步中，删除指定元素的节点，需要遍历，时间复杂度为 O(n)。

有没有办法可以优化呢？

# V2-HashMap + double linked list

## 思路

涉及到操作频率变更的 2 个操作：

1）删除最后一个元素

2）删除指定元素的节点，并且把节点移到 list 的最开始

我们采用双向链表的方式来实现，每个节点 node 有对应的 pre/next 节点

删除最后一个元素，则可以通过一个 tail 节点维护，直接 O(1) 实现。

每一次操作 key 的时候，如果我们把对应的 node 放在 map 中，通过 key 可以 O(1) 获取，可以 O(1) 实现删除操作；加入到 list 这个动作可以 O(1) 实现。

## 实现

```java
class LRUCache {

    /**
     * 双向链表节点
     */
    private class DoubleNode {
        int key;
        int value;

        DoubleNode prev;
        DoubleNode next;

        public DoubleNode(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    // head 之后，after 之前
    private void add(DoubleNode node){
        DoubleNode after = head.next;

        head.next = node;
        node.prev = head;
        node.next = after;
        after.prev = node;
    }

    // 移除当前节点 A<=>B<=>C  变成 A<=>C
    private void remove(DoubleNode node){
        DoubleNode before = node.prev;
        DoubleNode after = node.next;
        before.next = after;
        after.prev = before;
    }

    /**
     * 通过 hashmap 存放数据
     */
    private Map<Integer, DoubleNode> dataMap;

    /**
     * 最大容量
     */
    private int capacity;

    /**
     * 头尾节点
     */
    private DoubleNode head, tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.dataMap = new HashMap<>();

        // 初始化首尾
        this.head = new DoubleNode(0,0);
        this.tail = new DoubleNode(0,0);
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        DoubleNode node = dataMap.get(key);
        if(node == null) {
            return -1;
        }

        //更新 node 信息
        remove(node);
        add(node);

        return node.value;
    }

    public void put(int key, int value) {
        //是否存在
        DoubleNode node = dataMap.get(key);
        if(node == null) {
            DoubleNode newNode = new DoubleNode(key, value);
            dataMap.put(key, newNode);

            // 不存在，则初始化插入
            this.add(newNode);
        } else {
            // 如果存在，则更新对应的 value
            node.value = value;

            //更新 node 信息
            remove(node);
            add(node);
        }

        // 如果超过大小，则移除 tail 元素
        if(dataMap.size() > this.capacity) {
            DoubleNode lastNode = this.tail.prev;
            this.remove(lastNode);

            this.dataMap.remove(lastNode.key);
        }
    }

}
```

# V3-LinkedHashMap

## 思路

当然，实际使用过程中。我们直接使用现成的 api 也可以完成这个功能。

我们直接使用 LinkedHashMap，在大小超过指定容量时，移除最旧的元素。 

## 实现

实现起来也是非常的简洁。

```java
class LRUCache {

    /**
     * 通过 hashmap 存放数据
     */
    private Map<Integer, Integer> dataMap;

    public LRUCache(final int capacity) {
        this.dataMap = new LinkedHashMap<Integer, Integer>(capacity, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry eldest) {
                // 大于指定容量，则移除最旧的元素
                return size() > capacity;
            }
        };
    }

    public int get(int key) {
        return dataMap.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        dataMap.put(key, value);
    }

}
```

# 参考资料

https://leetcode.com/problems/lru-cache/description/

https://www.programcreek.com/2013/03/arraylist-vs-linkedlist-vs-vector/

https://leetcode.com/problems/lru-cache/solutions/45939/laziest-implementation-java-s-linkedhashmap-takes-care-of-everything/

* any list
{:toc}