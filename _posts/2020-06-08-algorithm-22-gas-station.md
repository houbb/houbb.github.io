---
layout: post
title: 面试算法：加油站难题，加油的学问还真不少
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, binary-tree, leetcode, sh]
published: true
---

# 题目

在一条环路上有 N 个加油站，其中第 i 个加油站有汽油 gas[i] 升。

你有一辆油箱容量无限的的汽车，从第 i 个加油站开往第 i+1 个加油站需要消耗汽油 cost[i] 升。你从其中的一个加油站出发，开始时油箱为空。

如果你可以绕环路行驶一周，则返回出发时加油站的编号，否则返回 -1。

说明: 

- 如果题目有解，该答案即为唯一答案。

- 输入数组均为非空数组，且长度相同。

- 输入数组中的元素均为非负数。


## 示例 1:

```
输入: 
gas  = [1,2,3,4,5]
cost = [3,4,5,1,2]

输出: 3

解释:
从 3 号加油站(索引为 3 处)出发，可获得 4 升汽油。此时油箱有 = 0 + 4 = 4 升汽油
开往 4 号加油站，此时油箱有 4 - 1 + 5 = 8 升汽油
开往 0 号加油站，此时油箱有 8 - 2 + 1 = 7 升汽油
开往 1 号加油站，此时油箱有 7 - 3 + 2 = 6 升汽油
开往 2 号加油站，此时油箱有 6 - 4 + 3 = 5 升汽油
开往 3 号加油站，你需要消耗 5 升汽油，正好足够你返回到 3 号加油站。
因此，3 可为起始索引。
```

## 示例 2:

```
输入: 
gas  = [2,3,4]
cost = [3,4,3]

输出: -1

解释:
你不能从 0 号或 1 号加油站出发，因为没有足够的汽油可以让你行驶到下一个加油站。
我们从 2 号加油站出发，可以获得 4 升汽油。 此时油箱有 = 0 + 4 = 4 升汽油
开往 0 号加油站，此时油箱有 4 - 3 + 2 = 3 升汽油
开往 1 号加油站，此时油箱有 3 - 3 + 3 = 3 升汽油
你无法返回 2 号加油站，因为返程需要消耗 4 升汽油，但是你的油箱只有 3 升汽油。
因此，无论怎样，你都不可能绕环路行驶一周。
```

# 解题思路

看完了这么长的题目，不知道小伙伴们是不是已经有点晕了？

我在看到这一题的时候，首先想到的是下面 2 点：

（1）如果汽油加的没有用的多，肯定无解

（2）一开始是没有油的，一个站的收益如果小于0，肯定不能作为起点；

```java
private boolean hasEnoughGas(int[] gas, int[] cost) {
    int gasSum  = 0;
    int costSum  = 0;
    for(int i = 0; i < gas.length; i++) {
        gasSum += gas[i];
        costSum += cost[i];
    }
    return gasSum >= costSum;
}
```

第一个可以开始的位置：

```java
// 第一步可行的位置
private int getFirstIndex(int[] gas, int[] cost) {
    for(int i = 0; i < gas.length; i++) {
        // 下一站够用
        if(gas[i] >= cost[i]) {
            return i;
        }
    }
    return -1;
}
```

不过这样还是不够的，因为虽然可能第一步没问题，但是到后面有可能还是会用完。

所以就需要考虑最后一个问题：

（3）而连续的多个站也可以等效地看做一个站，如果其累积收益小于0，就跳过，寻找下一个。

## java 实现

我们整理好了思路，可以写代码了。

```java
public int canCompleteCircuit(int[] gas, int[] cost) {
    // 参数校验
    if(gas == null || cost == null) {
        return -1;
    }
    if(gas.length != cost.length) {
        return -1;
    }
    // 是否为越界??
    int total = 0;
    int current = 0;
    int start = 0;
    for(int i = 0; i < gas.length; i++) {
        int remain = gas[i] - cost[i];
        total += remain;
        current += remain;
        // 连续的多个站也可以等效地看做一个站，如果其累积收益小于0，就跳过，寻找下一个
        if(current < 0) {
            current = 0;
            start = i+1;
        }
    }
    if(total < 0) {
        return -1;
    }
    return start;
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Gas Station.
Memory Usage: 38.9 MB, less than 86.56% of Java online submissions for Gas Station.
```

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/triangle/

* any list
{:toc}