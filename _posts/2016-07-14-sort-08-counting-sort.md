---
layout: post
title: sort-08-counting sort 计数排序
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


# counting sort 计数排序

计数排序（Counting sort）是一种稳定的线性时间排序算法。

该算法于1954年由 Harold H. Seward 提出。

通过计数将时间复杂度降到了 `O(N)`。

# 基础版

## 算法步骤

1. 找出原数组中元素值最大的，记为max。

2. 创建一个新数组count，其长度是max加1，其元素默认值都为0。

3. 遍历原数组中的元素，以**原数组中的元素作为count数组的索引，以原数组中的元素出现次数作为count数组的元素值**。

4. 创建结果数组result，起始索引index。

5. 遍历count数组，找出其中元素值大于0的元素，将其对应的索引作为元素值填充到result数组中去，每处理一次，count中的该元素值减1，直到该元素值不大于0，依次处理count中剩下的元素。

6. 返回结果数组 result。

## java 实现

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sort.core.util.InnerSortUtil;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 计数排序
 *
 * @author binbin.hou
 * @since 0.0.8
 */
@ThreadSafe
public class CountingSortBasic extends AbstractSort {

    private static final Log log = LogFactory.getLog(CountingSortBasic.class);

    @Override
    @SuppressWarnings("all")
    public void doSort(List original) {
        //1. 获取最大的元素
        int max = Integer.MIN_VALUE;
        for (Object object : original) {
            Integer integer = (Integer) object;
            max = Math.max(max, integer);
        }

        //2. 构建 count 列表
        int[] counts = new int[max + 1];
        //3.遍历原数组中的元素，以原数组中的元素作为count数组的索引，以原数组中的元素出现次数作为count数组的元素值。
        for (Object object : original) {
            Integer integer = (Integer) object;
            counts[integer]++;
        }

        //4. 结果构建
        int index = 0;
        // 遍历计数数组，将计数数组的索引填充到结果数组中
        for (int i = 0; i < counts.length; i++) {
            while (counts[i] > 0) {
                // i 实际上就是元素的值
                // 从左到右遍历，元素自然也就排序好了。
                // 相同的元素会出现多次，所以才需要循环。
                original.set(index++, i);
                counts[i]--;

                if(log.isDebugEnabled()) {
                    log.debug("结果数组：{}", original);
                }
            }
        }
    }

}
```

## 测试

```java
List<Integer> list = RandomUtil.randomList(10);
System.out.println("开始排序：" + list);
SortHelper.countingSortBasic(list);
System.out.println("完成排序：" + list);
```

测试日志如下：

```
开始排序：[67, 63, 78, 15, 2, 47, 88, 68, 71, 86]
结果数组：[2, 63, 78, 15, 2, 47, 88, 68, 71, 86]
结果数组：[2, 15, 78, 15, 2, 47, 88, 68, 71, 86]
结果数组：[2, 15, 47, 15, 2, 47, 88, 68, 71, 86]
结果数组：[2, 15, 47, 63, 2, 47, 88, 68, 71, 86]
结果数组：[2, 15, 47, 63, 67, 47, 88, 68, 71, 86]
结果数组：[2, 15, 47, 63, 67, 68, 88, 68, 71, 86]
结果数组：[2, 15, 47, 63, 67, 68, 71, 68, 71, 86]
结果数组：[2, 15, 47, 63, 67, 68, 71, 78, 71, 86]
结果数组：[2, 15, 47, 63, 67, 68, 71, 78, 86, 86]
结果数组：[2, 15, 47, 63, 67, 68, 71, 78, 86, 88]
完成排序：[2, 15, 47, 63, 67, 68, 71, 78, 86, 88]
```


作为一个开场，还是很不错的。

# 改良版

## 空间浪费

实际上我们创建一个比最大元素还要大1的数组，只是为了放下所有的元素而已。

但是它有一个缺陷，那就是存在**空间浪费**的问题。

比如一组数据{101,109,102,110}，其中最大值为110，按照基础版的思路，我们需要创建一个长度为111的计数数组，但是我们可以发现，它前面的[0,100]的空间完全浪费了，那怎样优化呢？

将数组长度定为 `max-min+1`，即不仅要找出最大值，还要找出最小值，根据两者的差来确定计数数组的长度。

## 改良版本实现

```java
import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.Arrays;
import java.util.List;

/**
 * 计数排序
 *
 * @author binbin.hou
 * @since 0.0.8
 */
@ThreadSafe
public class CountingSort extends AbstractSort {

    private static final Log log = LogFactory.getLog(CountingSort.class);

    @Override
    @SuppressWarnings("all")
    public void doSort(List original) {
        //1. 获取最大、最小的元素
        int max = Integer.MIN_VALUE;
        int min = Integer.MAX_VALUE;
        for (Object object : original) {
            Integer integer = (Integer) object;
            max = Math.max(max, integer);
            min = Math.min(min, integer);
        }

        //2. 构建 count 列表
        int[] counts = new int[max-min + 1];
        //3.遍历原数组中的元素，以原数组中的元素作为count数组的索引，以原数组中的元素出现次数作为count数组的元素值。
        for (Object object : original) {
            Integer integer = (Integer) object;
            // 元素要减去最小值，再作为新索引
            counts[integer-min]++;
        }

        if(log.isDebugEnabled()) {
            log.debug("counts.length: {}", counts.length);
        }
        //4. 结果构建
        int index = 0;
        // 遍历计数数组，将计数数组的索引填充到结果数组中
        for (int i = 0; i < counts.length; i++) {
            while (counts[i] > 0) {
                // i 实际上就是元素的值
                // 从左到右遍历，元素自然也就排序好了。
                // 相同的元素会出现多次，所以才需要循环。
                // 这里将减去的最小值统一加上
                original.set(index++, i+min);
                counts[i]--;

                if(log.isDebugEnabled()) {
                    log.debug("结果数组：{}", original);
                }
            }
        }
    }

}
```

## 测试

日志如下：

```
开始排序：[27, 59, 25, 73, 30, 82, 80, 65, 72, 43]
counts.length: 58
结果数组：[25, 59, 25, 73, 30, 82, 80, 65, 72, 43]
结果数组：[25, 27, 25, 73, 30, 82, 80, 65, 72, 43]
结果数组：[25, 27, 30, 73, 30, 82, 80, 65, 72, 43]
结果数组：[25, 27, 30, 43, 30, 82, 80, 65, 72, 43]
结果数组：[25, 27, 30, 43, 59, 82, 80, 65, 72, 43]
结果数组：[25, 27, 30, 43, 59, 65, 80, 65, 72, 43]
结果数组：[25, 27, 30, 43, 59, 65, 72, 65, 72, 43]
结果数组：[25, 27, 30, 43, 59, 65, 72, 73, 72, 43]
结果数组：[25, 27, 30, 43, 59, 65, 72, 73, 80, 43]
结果数组：[25, 27, 30, 43, 59, 65, 72, 73, 80, 82]
完成排序：[25, 27, 30, 43, 59, 65, 72, 73, 80, 82]
```


这次的 counts 长度为：58，而不是 81。


# 自己的思考

## 算法的本质

这个算法的本质是什么呢？

个人理解只需要保证两点：

（1）每一个元素，都有自己的一个元素位置

（2）相同的元素，次数会增加。

算法的巧妙之处在于**直接利用数值本身所谓索引，直接跳过了排序比较**；利用技数，解决了重复数值的问题。

## 算法的不足

这个算法的巧妙之处，同时也是对应的限制：那就是只能直接比较数字。如果是字符串呢？

## 一点想法

我最初的想法就是可以使用类似于 HashMap 的数据结构。这样可以解决元素过滤，次数统计的问题。

但是无法解决排序问题。

当然了，如果使用 TreeMap 就太赖皮了，因为本身就是利用了树进行排序。

## TreeMap 版本

我们这里使用 TreeMap 主要有下面的目的：

（1）让排序不局限于数字。

（2）大幅度降低内存的浪费，不多一个元素，也不少一个元素。

思想实际上依然是技术排序的思想。

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * 计数排序-TreeMap
 *
 * @author binbin.hou
 * @since 0.0.8
 */
@ThreadSafe
public class CountingSortTreeMap extends AbstractSort {

    private static final Log log = LogFactory.getLog(CountingSortTreeMap.class);

    @Override
    @SuppressWarnings("all")
    public void doSort(List original) {
        TreeMap<Comparable, Integer> countMap = new TreeMap<>();

        // 初始化次数
        for (Object object : original) {
            Comparable comparable = (Comparable) object;

            Integer count = countMap.get(comparable);
            if(count == null) {
                count = 0;
            }
            count++;
            countMap.put(comparable, count);
        }

        //4. 结果构建
        int index = 0;
        // 遍历计数数组，将计数数组的索引填充到结果数组中
        for (Map.Entry<Comparable, Integer> entry : countMap.entrySet()) {
            int count = entry.getValue();
            Comparable key = entry.getKey();
            while (count > 0) {
                // i 实际上就是元素的值
                // 从左到右遍历，元素自然也就排序好了。
                // 相同的元素会出现多次，所以才需要循环。
                original.set(index++, key);
                count--;
            }
        }
    }

}
```

## 测试

```java
List<Integer> list = RandomUtil.randomList(10);
System.out.println("开始排序：" + list);
SortHelper.countingSortTreeMap(list);
System.out.println("完成排序：" + list);
```

日志如下：

```
开始排序：[92, 50, 9, 17, 89, 31, 17, 65, 39, 94]
完成排序：[9, 17, 17, 31, 39, 50, 65, 89, 92, 94]
```

# 开源地址

为了便于大家学习，上面的排序已经开源，开源地址：

> [https://github.com/houbb/sort](https://github.com/houbb/sort)

欢迎大家 fork/star，鼓励一下作者~~

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[一文弄懂计数排序算法！](https://www.cnblogs.com/xiaochuan94/p/11198610.html)

[计数排序](https://zhuanlan.zhihu.com/p/26595385)

* any list
{:toc}