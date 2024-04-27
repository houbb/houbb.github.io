---
layout: post
title: sort-09-bucket sort 桶排序
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


# 桶排序（Bucket sort）

或所谓的箱排序，是一个排序算法，工作的原理是将数组分到有限数量的桶里。

每个桶再个别排序（有可能再使用别的排序算法或是以递归方式继续使用桶排序进行排序）。

桶排序是鸽巢排序的一种归纳结果。当要被排序的数组内的数值是均匀分配的时候，桶排序使用线性时间 `O(n)`。

桶排序是计数排序的扩展版本，**计数排序可以看成每个桶只存储相同元素，而桶排序每个桶存储一定范围的元素**，通过映射函数，将待排序数组中的元素映射到各个对应的桶中，对每个桶中的元素进行排序，最后将非空桶中的元素逐个放入原序列中。

桶排序需要尽量保证元素分散均匀，否则当所有数据集中在同一个桶中时，桶排序失效。

## 算法流程

桶排序以下列程序进行：

1. 设置一个定量的数组当作空桶子。

2. 寻访序列，并且把项目一个一个放到对应的桶子去。

3. 对每个不是空的桶子进行排序。

4. 从不是空的桶子里把项目再放回原来的序列中。

![算法](https://img-blog.csdnimg.cn/20190219081232815.png)

# java 实现

## 实现

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 桶排序
 *
 * @author binbin.hou
 * @since 0.0.9
 */
@ThreadSafe
public class BucketSort extends AbstractSort {

    private static final Log log = LogFactory.getLog(BucketSort.class);

    @Override
    @SuppressWarnings("all")
    public void doSort(List original) {
        final int step = 10;

        // 计算最小值
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;
        for(Object object : original) {
            Integer integer = (Integer) object;
            min = Math.min(min, integer);
            max = Math.max(max, integer);
        }

        //2. 计算桶的个数
        int bucketNum = (max-min) / step + 1;;
        //2.1 初始化临时列表
        List<List<Integer>> tempList = new ArrayList<>(bucketNum);
        for(int i = 0; i < bucketNum; i++) {
            tempList.add(new ArrayList<Integer>());
        }

        //3. 将元素放入桶中
        // 这里有一个限制：要求元素必须一个左边的桶元素，要小于右边的桶。
        // 这就限制了只能是数字类的比较，不然没有范围的概念
        for(Object o : original) {
            Integer integer = (Integer) o;
            int index = (integer-min) / step;

            tempList.get(index).add(integer);
        }

        // 4. 针对单个桶进行排序
        // 可以选择任意你喜欢的算法
        for(int i = 0; i < bucketNum; i++) {
            Collections.sort(tempList.get(i));
        }

        //5. 设置结果
        int index = 0;
        for(int i = 0; i < bucketNum; i++) {
            List<Integer> integers = tempList.get(i);

            for(Integer val : integers) {
                original.set(index++, val);
            }
        }
    }

}
```

## 测试代码

```java
List<Integer> list = RandomUtil.randomList(10);
System.out.println("开始排序：" + list);
SortHelper.bucket(list);
System.out.println("完成排序：" + list);
```

日志如下：

```
开始排序：[57, 35, 66, 32, 40, 57, 91, 26, 20, 45]
完成排序：[20, 26, 32, 35, 40, 45, 57, 57, 66, 91]
```

# 复杂度分析

##  时间复杂度：O(N + C)

对于待排序序列大小为 N，共分为 M 个桶，主要步骤有：

1. N 次循环，将每个元素装入对应的桶中

2. M 次循环，对每个桶中的数据进行排序（平均每个桶有 N/M 个元素）

一般使用较为快速的排序算法，时间复杂度为 `O(NlogN)`，实际的桶排序过程是以链表形式插入的。

## 额外空间复杂度

O(N + M)

# 开源地址

为了便于大家学习，上面的排序已经开源，开源地址：

> [https://github.com/houbb/sort](https://github.com/houbb/sort)

欢迎大家 fork/star，鼓励一下作者~~

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[【排序】图解桶排序](https://blog.csdn.net/qq_27124771/article/details/87651495)

* any list
{:toc}