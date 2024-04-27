---
layout: post
title: sort-06-shell sort 希尔排序算法详解
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


# 希尔排序（Shellsort）

也称递减增量排序算法，是插入排序的一种更高效的改进版本。

希尔排序是非稳定排序算法。

希尔排序是基于插入排序的以下两点性质而提出改进方法的：

1. 插入排序在对几乎已经排好序的数据操作时，效率高，即可以达到线性排序的效率

2. 但插入排序一般来说是低效的，因为插入排序每次只能将数据移动一位

## 算法实现

希尔排序通过将比较的全部元素分为几个区域来提升插入排序的性能。

这样可以让一个元素可以一次性地朝最终位置前进一大步。然后算法再取越来越小的步长进行排序，算法的最后一步就是普通的插入排序，但是到了这步，需排序的数据几乎是已排好的了（此时插入排序较快）。

假设有一个很小的数据在一个已按升序排好序的数组的末端。如果用复杂度为O(n^2)的排序（冒泡排序或插入排序），可能会进行n次的比较和交换才能将该数据移至正确位置。

而希尔排序会**用较大的步长移动数据，所以小数据只需进行少数比较和交换即可到正确位置**。

一个更好理解的希尔排序实现：将数组列在一个表中并对列排序（用插入排序）。重复这过程，不过每次用更长的列来进行。最后整个表就只有一列了。

将数组转换至表是为了更好地理解这算法，算法本身仅仅对原数组进行排序（通过增加索引的步长，例如是用i += step_size而不是i++）。

## 例子

例如，假设有这样一组数[ 13 14 94 33 82 25 59 94 65 23 45 27 73 25 39 10 ]，如果我们以步长为5开始进行排序，我们可以通过将这列表放在有5列的表中来更好地描述算法，这样他们就应该看起来是这样： 

```
13 14 94 33 82
25 59 94 65 23
45 27 73 25 39
10
```

然后我们对每列进行排序： 

```
10 14 73 25 23
13 27 94 33 39
25 59 94 65 82
45
```

将上述四行数字，依序接在一起时我们得到：[ 10 14 73 25 23 13 27 94 33 39 25 59 94 65 82 45 ]。

这时10已经移至正确位置了，然后再以3为步长进行排序： 

```
10 14 73
25 23 13
27 94 33
39 25 59
94 65 82
45
```

排序之后变为： 

```
10 14 13
25 23 33
27 25 59
39 65 73
45 94 82
94
```

最后以1步长进行排序（此时就是简单的插入排序了）。 

## 步长序列如何选择？

Donald Shell 最初建议步长选择为 n/2 并且对步长取半直到步长达到1。

虽然这样取可以比 O(n^2) 类的算法（插入排序）更好，但这样仍然有减少平均时间和最差时间的余地。 

已知的最好步长序列是由 Sedgewick 提出的(1, 5, 19, 41, 109,...)，

另一个在大数组中表现优异的步长序列是（斐波那契数列除去0和1将剩余的数以黄金分割比的两倍的幂进行运算得到的数列）：

(1, 9, 34, 182, 836, 4025, 19001, 90358, 428481, 2034035, 9651787, 45806244, 217378076, 1031612713,…)

# java 代码实现

## 实现

这里为了简单，我们步长直接选择列表长度的一半，并且依次折半。

```java
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sort.core.util.InnerSortUtil;

import java.util.List;

/**
 * 希尔排序
 *
 * @author binbin.hou
 * @since 0.0.6
 */
public class ShellSort extends AbstractSort {

    private static final Log log = LogFactory.getLog(ShellSort.class);

    @Override
    @SuppressWarnings("all")
    protected void doSort(List<?> original) {
        // 步长从大到小
        for(int step = original.size()/2; step > 0; step /= 2) {
            // 从第 step 个元素，逐个执行插入排序
            for(int i = step; i < original.size(); i++) {
                int j = i;

                while ((j-step >= 0) && InnerSortUtil.lt(original, j, j-step)) {
                    // 执行交换
                    InnerSortUtil.swap(original, j, j-step);

                    if(log.isDebugEnabled()) {
                        log.debug("step: {}, j: {}, j-step: {}, list: {}",
                                step, j, j-step, original);
                    }

                    // 更新步长
                    j -= step;
                }
            }
        }
    }

}
```

整体实现也不难，大家可以回顾下 [插入排序](https://houbb.github.io/2016/07/14/sort-05-insert-sort)

这里为了便于大家理解，我们特意添加了日志。

## 测试

### 测试代码

```java
List<Integer> list = RandomUtil.randomList(10);
System.out.println("开始排序：" + list);
SortHelper.shell(list);
System.out.println("完成排序：" + list);
```

### 测试日志

```
开始排序：[28, 2, 86, 40, 86, 1, 72, 95, 92, 68]

step: 5, j: 5, j-step: 0, list: [1, 2, 86, 40, 86, 28, 72, 95, 92, 68]
step: 5, j: 9, j-step: 4, list: [1, 2, 86, 40, 68, 28, 72, 95, 92, 86]

step: 2, j: 4, j-step: 2, list: [1, 2, 68, 40, 86, 28, 72, 95, 92, 86]
step: 2, j: 5, j-step: 3, list: [1, 2, 68, 28, 86, 40, 72, 95, 92, 86]
step: 2, j: 6, j-step: 4, list: [1, 2, 68, 28, 72, 40, 86, 95, 92, 86]
step: 2, j: 9, j-step: 7, list: [1, 2, 68, 28, 72, 40, 86, 86, 92, 95]

step: 1, j: 3, j-step: 2, list: [1, 2, 28, 68, 72, 40, 86, 86, 92, 95]
step: 1, j: 5, j-step: 4, list: [1, 2, 28, 68, 40, 72, 86, 86, 92, 95]
step: 1, j: 4, j-step: 3, list: [1, 2, 28, 40, 68, 72, 86, 86, 92, 95]

完成排序：[1, 2, 28, 40, 68, 72, 86, 86, 92, 95]
```

常言道，步子别迈太大，容易扯到淡。

但是这里就是一个反其道而行之的方式，而且效果还不错。


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

[希尔排序](https://zh.wikipedia.org/wiki/%E5%B8%8C%E5%B0%94%E6%8E%92%E5%BA%8F)

[索引数据结构（1）概览篇](https://houbb.github.io/2020/10/17/data-struct-index-01-overview)

[图解排序算法(二)之希尔排序](https://www.cnblogs.com/chengxiao/p/6104371.html)

* any list
{:toc}