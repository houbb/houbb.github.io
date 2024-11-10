---
layout: post
title: leetcode 数组专题 01-leetcode.170 two-sum III 170. 两数之和 III - 数据结构设计
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, two-pointer, sf]
published: true
---


# 题目

题目描述
设计一个接收整数流的数据结构，该数据结构支持检查是否存在两数之和等于特定值。

实现 TwoSum 类：

TwoSum() 使用空数组初始化 TwoSum 对象

void add(int number) 向数据结构添加一个数 number

boolean find(int value) 寻找数据结构中是否存在一对整数，使得两数之和与给定的值相等。如果存在，返回 true ；否则，返回 false 。
 
示例：

```
输入：
["TwoSum", "add", "add", "add", "find", "find"]
[[], [1], [3], [5], [4], [7]]
输出：
[null, null, null, null, true, false]
```

解释：

```
TwoSum twoSum = new TwoSum();
twoSum.add(1);   // [] --> [1]
twoSum.add(3);   // [1] --> [1,3]
twoSum.add(5);   // [1,3] --> [1,3,5]
twoSum.find(4);  // 1 + 3 = 4，返回 true
twoSum.find(7);  // 没有两个整数加起来等于 7 ，返回 false
```


# 思路

这一题和 001 第一题是一样的，可以参考 T001 和 T167 的解法，这里把这一题单独拿出来只是为了学习的系统性。

所以不做过多的展开。

## 区别

这一题还有一个核心的区别是数据会一直变化，所以数组的排序会打折扣。

当然也可以调整为对应的插入排序等算法。

## 常见算法

1) 暴力

2）借助 Hash

3) 排序+二分

4）双指针==》针对有序数组

在这个场景里面，最简单好用的应该是 HashMap 的方式

## 实现

```java
class TwoSum {
    private Map<Integer, Integer> cnt = new HashMap<>();

    public TwoSum() {
    }

    public void add(int number) {
        cnt.merge(number, 1, Integer::sum);
    }

    public boolean find(int value) {
        for (var e : cnt.entrySet()) {
            int x = e.getKey(), v = e.getValue();
            int y = value - x;
            if (cnt.containsKey(y) && (x != y || v > 1)) {
                return true;
            }
        }
        return false;
    }
}

/**
 * Your TwoSum object will be instantiated and called as such:
 * TwoSum obj = new TwoSum();
 * obj.add(number);
 * boolean param_2 = obj.find(value);
 */
```

# 小结

我们掌握了核心的思路，不同的场景只需要进行相关的调整就行。

* any list
{:toc}