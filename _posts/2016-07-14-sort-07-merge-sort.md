---
layout: post
title: sort-07-merge sort 归并排序
date:  2016-07-14 17:22:22 +0800
categories: [Algorithm]
tags: [sort]
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


# 归并排序（英语：Merge sort，或mergesort）

是创建在归并操作上的一种有效的排序算法，效率为 O(nlogn)（大O符号）。1945年由约翰·冯·诺伊曼首次提出。

该算法是采用分治法（Divide and Conquer）的一个非常典型的应用，且各层分治递归可以同时进行。

## 概述

采用分治法:

分割：递归地把当前序列平均分割成两半。

集成：在保持元素顺序的同时将上一步得到的子序列集成到一起（归并）。

# java 实现递归法

## 递归法（Top-down）

1. 申请空间，使其大小为两个已经排序序列之和，该空间用来存放合并后的序列

2. 设定两个指针，最初位置分别为两个已经排序序列的起始位置

3. 比较两个指针所指向的元素，选择相对小的元素放入到合并空间，并移动指针到下一位置

4. 重复步骤3直到某一指针到达序列尾

5. 将另一序列剩下的所有元素直接复制到合并序列尾

## java 实现

实际上代码实现也不难，不过递归多多少少让人看起来不太习惯。

我们后面会结合测试日志，再进行讲解。

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * 归并排序-递归实现
 *
 * @author binbin.hou
 * @since 0.0.7
 */
public class MergeRecursiveSort extends AbstractSort {

    private static final Log log = LogFactory.getLog(MergeRecursiveSort.class);

    @Override
    @SuppressWarnings("all")
    protected void doSort(List<?> original) {
        // 存放归并的结果
        // 直接将数组填满，避免 set 出现越界
        List<?> resultList = new ArrayList<>(original);
        sortRecursive(original, resultList, 0, original.size()-1);
    }

    /**
     * 递归排序
     * @param originalList 原始列表
     * @param resultList 存放结果的列表
     * @param startIx 开始
     * @param endIx 结果
     * @since 0.0.7
     */
    @SuppressWarnings("all")
    private void sortRecursive(List originalList,
                               List resultList,
                               int startIx,
                               int endIx) {
        // 循环结束
        if(startIx >= endIx) {
            return;
        }

        // 找到中间位置，将列表一分为二
        int midIx = (startIx+endIx) / 2;
        int leftStart = startIx;
        int leftEnd = midIx;
        int rightStart = midIx+1;
        int rightEnd = endIx;

        if(log.isDebugEnabled()) {
            log.debug("拆分：ls: {}, le: {}, rs: {}, re: {}",
                    leftStart, leftEnd, rightStart, rightEnd);
        }

        // 递归调用
        sortRecursive(originalList, resultList, leftStart, leftEnd);
        sortRecursive(originalList, resultList, rightStart, rightEnd);

        if(log.isDebugEnabled()) {
            log.debug("操作：ls: {}, le: {}, rs: {}, re: {}",
                    leftStart, leftEnd, rightStart, rightEnd);
        }

        // 这里需要通过 k 记录一下开始的位置
        int k = startIx;
        while (leftStart <= leftEnd && rightStart <= rightEnd) {
            //相对小的元素放入到合并空间，并移动指针到下一位置
            Comparable left = (Comparable) originalList.get(leftStart);
            Comparable right = (Comparable) originalList.get(rightStart);

            // 左边较小，则放入合并空间
            if(left.compareTo(right) < 0) {
                resultList.set(k++, left);
                leftStart++;
            } else {
                resultList.set(k++, right);
                rightStart++;
            }
        }

        // 如果列表比较结束，将剩下的元素，全部放入到队列中。
        while (leftStart <= leftEnd) {
            resultList.set(k++, originalList.get(leftStart++));
        }
        while (rightStart <= rightEnd) {
            resultList.set(k++, originalList.get(rightStart++));
        }

        // 将结果统一拷贝到原始集合中
        for(int i = startIx; i <= endIx; i++) {
            originalList.set(i, resultList.get(i));
        }
    }

}
```

## 代码测试

```java
List<Integer> list = RandomUtil.randomList(10);
System.out.println("开始排序：" + list);
SortHelper.mergeRecursive(list);
System.out.println("完成排序：" + list);
```

## 测试日志

为了让大家更加直观的理解整个拆分的过程，我们加了2行日志。

```
开始排序：[16, 90, 88, 27, 94, 99, 45, 66, 35, 33]
拆分：ls: 0, le: 4, rs: 5, re: 9    -- 0-9     拆分为：0-4, 5-9
拆分：ls: 0, le: 2, rs: 3, re: 4    -- 0-4 继续拆分为：0-2, 3-4 
拆分：ls: 0, le: 1, rs: 2, re: 2    -- 0-2 继续拆分为：0-1，2-2 
拆分：ls: 0, le: 0, rs: 1, re: 1    -- 0-1 继续拆分为：0-0, 1-1 
操作：ls: 0, le: 0, rs: 1, re: 1    -- 0-0 和 1-1 此时已经无法继续拆分，开始进行操作
操作：ls: 0, le: 1, rs: 2, re: 2
拆分：ls: 3, le: 3, rs: 4, re: 4
操作：ls: 3, le: 3, rs: 4, re: 4
操作：ls: 0, le: 2, rs: 3, re: 4
拆分：ls: 5, le: 7, rs: 8, re: 9
拆分：ls: 5, le: 6, rs: 7, re: 7
拆分：ls: 5, le: 5, rs: 6, re: 6
操作：ls: 5, le: 5, rs: 6, re: 6
操作：ls: 5, le: 6, rs: 7, re: 7
拆分：ls: 8, le: 8, rs: 9, re: 9
操作：ls: 8, le: 8, rs: 9, re: 9
操作：ls: 5, le: 7, rs: 8, re: 9
操作：ls: 0, le: 4, rs: 5, re: 9
完成排序：[16, 27, 33, 35, 45, 66, 88, 90, 94, 99]
```

这是 10 个元素的列表排序。

首先进行对半的拆分，当无法细分的时候，会对元素进行排序操作。

最后又会把拆分排序好的数组拼接起立。这样一个完整的数组就是有序的了。

当然这个排序也有一个很明显的缺点：那就是需要额外的空间复杂度。

# java 迭代实现

相信很多小伙伴都知道迭代可以使得代码变得简洁，但是会让调试和理解变得复杂。

我们来一起学习一下迭代的实现方式。

## 迭代法（Bottom-up）

原理如下（假设序列共有 n 个元素）：

1. 将序列每相邻两个数字进行归并操作，形成 ceil(n/2) 个序列，排序后每个序列包含两/一个元素

2. 若此时序列数不是1个则将上述序列再次归并，形成 ceil(n/4) 个序列，每个序列包含四/三个元素

3. 重复步骤2，直到所有元素排序完毕，即序列数为1

## 迭代实现

相对递归，这个代码就要显得复杂很多。

不过这种迭代的方式性能更好，实现如下。

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sort.core.util.InnerSortUtil;

import java.util.ArrayList;
import java.util.List;

/**
 * 归并排序-迭代实现
 *
 * @author binbin.hou
 * @since 0.0.7
 */
public class MergeSort extends AbstractSort {

    private static final Log log = LogFactory.getLog(MergeSort.class);

    @Override
    protected void doSort(List<?> original) {
        // 存放归并的结果
        // 直接将数组填满，避免 set 出现越界
        List<?> resultList = new ArrayList<>(original);

        //起始，子序列长度为1。对长度为1的序列进行两两合并
        int k = 1;
        final int length = original.size();
        while (k < length) {
            mergePass(original, resultList, k, length);//将原先无序的数据两两归并入归并数组
            k = 2 * k;//子序列长度加倍
            mergePass(resultList, original, k, length);//将归并数组中已经两两归并的有序序列再归并回数组 original
            k = 2 * k;//子序列长度加倍
        }
    }

    /**
     * 负责将数组中的相邻的有k个元素的字序列进行归并
     *
     * @param original 原始列表
     * @param results 结果列表
     * @param s  子序列长度
     * @param len 长度
     * @since 0.0.7
     */
    @SuppressWarnings("all")
    private static void mergePass(List original, List results, int s, int len) {
        int i = 0;

        // 写成(i + 2 * k - 1 < len)，就会把（i+2*k-1）当做一个整体看待
        // 从前往后,将2个长度为k的子序列合并为1个。
        // 对于序列{3, 4, 2, 5, 7, 0, 9, 8, 1, 6}，当k=8的时候，因为i>(len-2*k+1),所以根本没有进入while循环
        while (i < len - 2 * s + 1) {
            merge(original, results, i, i + s - 1, i + 2 * s - 1);//两两归并
            i = i + 2 * s;
        }

        // 将那些“落单的”长度不足两两merge的部分和前面merge起来。
        // (连接起来之前也是要进行排序的，因此有了下面的merge操作)
        if (i < len - s + 1) {
            merge(original, results, i, i + s - 1, len - 1);//归并最后两个序列
        } else {
            for (int j = i; j < len; j++) {//若最后只剩下单个子序列
                results.set(j, original.get(j));
            }
        }
    }

    /**
     * 将两个有序数组合并成一个有序数组
     * @param original 原始
     * @param result 结果
     * @param low 开始
     * @param mid 中间
     * @param high 结束
     * @since 0.0.7
     */
    @SuppressWarnings("all")
    private static void merge(List original, List result, int low, int mid, int high) {
        int j, k, l;

        // 将记录由小到大地放进temp数组
        for (j = mid + 1, k = low; low <= mid && j <= high; k++) {
            if (InnerSortUtil.lt(original, low, j)) {
                result.set(k, original.get(low++));
            } else {
                result.set(k, original.get(j++));
            }
        }

        //接下来两循环是为了将剩余的（比另一边多出来的个数）放到temp数组中
        if (low <= mid) {
            for (l = 0; l <= mid - low; l++) {
                result.set(k + l, original.get(low + l));
            }
        }
        if (j <= high) {
            for (l = 0; l <= high - j; l++) {
                result.set(k + l, original.get(j + l));
            }
        }
    }

}
```

## 测试

```java
List<Integer> list = RandomUtil.randomList(10);
System.out.println("开始排序：" + list);
SortHelper.merge(list);
System.out.println("完成排序：" + list);
```

日志如下：

```
开始排序：[38, 31, 7, 91, 25, 73, 3, 84, 70, 96]
完成排序：[3, 7, 25, 31, 38, 70, 73, 84, 91, 96]
```

# 开源地址

为了便于大家学习，上面的排序已经开源，开源地址：

> [https://github.com/houbb/sort](https://github.com/houbb/sort)

欢迎大家 fork/star，鼓励一下作者~~

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[递归和迭代两种方式实现归并排序（Java版）](https://blog.csdn.net/scgaliguodong123_/article/details/47072223)

[归并排序-迭代实现-java](https://blog.csdn.net/yurong33333/article/details/103817512)

* any list
{:toc}