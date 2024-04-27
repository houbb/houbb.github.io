---
layout: post
title: sort-05-insert sort 插入排序算法详解
date:  2016-07-14 17:22:22 +0800
categories: [Algorithm]
tags: [sort, exchange-sorts]
published: true
---

# 排序系列

[sort-00-排序算法汇总](https://houbb.github.io/2016/07/14/sort-00-overview-sort)

[sort-01-bubble sort 冒泡排序算法详解](https://houbb.github.io/2016/07/14/sort-01-bubble-sort)

[sort-02-QuickSort 快速排序到底快在哪里？](https://houbb.github.io/2016/07/14/sort-02-quick-sort)

[sort-03-SelectSort 选择排序算法详解](https://houbb.github.io/2016/07/14/sort-03-select-sort)

[sort-04-heap sort 堆排序算法详解](https://houbb.github.io/2016/07/14/sort-04-heap-sort)

[sort-05-insert sort 插入排序算法详解](https://houbb.github.io/2016/07/14/sort-05-insert-sort)

[sort-06-shell sort 希尔排序算法详解](https://houbb.github.io/2016/07/14/sort-06-shell-sort)

[sort-07-merge sort 归并排序](https://houbb.github.io/2016/07/14/sort-07-merge-sort)

[sort-08-counting sort 计数排序](https://houbb.github.io/2016/07/14/sort-08-counting-sort)

[sort-09-bucket sort 桶排序](https://houbb.github.io/2016/07/14/sort-09-bucket-sort)

[sort-10-bigfile 大文件外部排序](https://houbb.github.io/2016/07/14/sort-10-bigfile-sort)


# 插入排序

插入排序（英语：Insertion Sort）是一种简单直观的排序算法。

它的工作原理是通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。

插入排序在实现上，通常采用in-place排序（即只需用到 O(1) 的额外空间的排序），因而在从后向前扫描过程中，需要反复把已排序元素逐步向后挪位，为最新元素提供插入空间。 

## 算法步骤

一般来说，插入排序都采用in-place在数组上实现。具体算法描述如下：

1. 从第一个元素开始，该元素可以认为已经被排序

2. 取出下一个元素，在已经排序的元素序列中从后向前扫描

3. 如果该元素（已排序）大于新元素，将该元素移到下一位置

4. 重复步骤3，直到找到已排序的元素小于或者等于新元素的位置

5. 将新元素插入到该位置后

6. 重复步骤2~5

## 例子

和打扑克牌时类似，从牌桌上逐一拿起扑克牌，在手上排序的过程相同。

举例：

Input: {5 2 4 6 1 3}。

首先拿起第一张牌, 手上有 {5}。

拿起第二张牌 2, 把 2 insert 到手上的牌 {5}, 得到 {2 5}。

拿起第三张牌 4, 把 4 insert 到手上的牌 {2 5}, 得到 {2 4 5}。

以此类推。 

![排序](https://upload.wikimedia.org/wikipedia/commons/0/0f/Insertion-sort-example-300px.gif)

# java 实现

## java 实现

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sort.core.util.InnerSortUtil;

import java.util.List;

/**
 * 冒泡排序
 * @author binbin.hou
 * @since 0.0.5
 */
@ThreadSafe
public class InsertSort extends AbstractSort {

    private static final Log log = LogFactory.getLog(InsertSort.class);

    @Override
    @SuppressWarnings("all")
    public void doSort(List original) {
        for(int i = 1; i < original.size(); i++) {
            Comparable current = (Comparable) original.get(i);

            int j = i-1;
            // 从后向前遍历，把大于当前元素的信息全部向后移动。
            while (j >= 0 && InnerSortUtil.gt(original, j, current)) {
                // 元素向后移动一位
                original.set(j+1, original.get(j));
                j--;
            }

            // 将元素插入到对应的位置
            original.set(j+1, current);
        }
    }

}
```

## 代码测试

```java
List<Integer> list = RandomUtil.randomList(10);
System.out.println("开始排序：" + list);
SortHelper.insert(list);
System.out.println("完成排序：" + list);
```

测试日志如下：

```
开始排序：[31, 49, 86, 74, 64, 23, 12, 42, 93, 64]
完成排序：[12, 23, 31, 42, 49, 64, 64, 74, 86, 93]
```

# 开源地址

为了便于大家学习，上面的排序已经开源，开源地址：

> [https://github.com/houbb/sort](https://github.com/houbb/sort)

欢迎大家 fork/star，鼓励一下作者~~

# 小结

堆排序是一种选择排序，整体主要由构建初始堆+交换堆顶元素和末尾元素并重建堆两部分组成。其中构建初始堆经推导复杂度为O(n)，在交换并重建堆的过程中，需交换n-1次，而重建堆的过程中，根据完全二叉树的性质，[log2(n-1),log2(n-2)...1]逐步递减，近似为nlogn。

所以堆排序时间复杂度一般认为就是O(nlogn)级。

ps: 个人理解一般树的数据结构，时间复杂度都是 logn 级别的。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[插入排序](https://zh.wikipedia.org/wiki/%E6%8F%92%E5%85%A5%E6%8E%92%E5%BA%8F)

[索引数据结构（1）概览篇](https://houbb.github.io/2020/10/17/data-struct-index-01-overview)

* any list
{:toc}