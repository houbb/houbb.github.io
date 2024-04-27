---
layout: post
title: sort-02-QuickSort 快速排序到底快在哪里？
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


# 创作目的

最近想系统整理一下数据库的索引系列，然后就牵扯到了二分查找，二分查找的前提需要排序。

排序工作中我们用的很多，不过很少去关心实现；面试中，排序的出场率非常高，以此来验证大家是否懂得“算法”。

无论如何，排序算法都值得每一位极客去学习和掌握。

# 快速排序 Quicksort

快速排序（有时称为分区交换排序）是一种有效的排序算法。

由英国计算机科学家Tony Hoare于1959年开发[1]，并于1961年发表[2]，它仍然是一种常用的排序算法。如果实施得当，它可以比主要竞争者（合并排序和堆排序）快两倍或三倍。

Quicksort是一种**分而治之**的算法。它通过从数组中选择一个“pivot”元素并将其他元素划分为两个子数组（根据它们是否小于或大于基准数）来工作。然后将子数组递归排序。这可以就地完成，需要少量额外的内存来执行排序。

快速排序是一种比较排序，这意味着它可以对定义了“小于”关系的任何类型的项目进行排序。

快速排序的有效实现不是稳定的排序，这意味着不会保留相等排序项的相对顺序。

快速排序的数学分析表明，平均而言，该算法采用O（n log n）比较来对n个项目进行排序。

在最坏的情况下，它会进行O（n^2）比较，尽管这种行为很少见。

# 算法流程

Quicksort是一种分而治之的算法。

首先将输入数组分为两个较小的子数组：低元素和高元素。

然后，它将对子数组进行递归排序。就地Quicksort的步​​骤是：

1. 从数组中选择一个称为基准数的元素。

2. 分区：对数组重新排序，以使所有值小于基准数的元素都位于基准数之前，而所有值大于基准数的元素都位于基准数之后（相等的值可以任意选择）。分割之后，基准数处于其最终位置。这称为分区操作。
 
3. 将上述步骤递归地应用于值较小的元素子数组，并分别应用于值较大的元素的子数组。

递归的基本情况是大小为零或一的数组，这些数组按定义顺序排列，因此它们不需要排序。

基准数选择和分区步骤可以通过几种不同的方式完成。具体实施方案的选择会极大地影响算法的性能。

# 例子

上面的算法直接说，不免有些抽象。

我们举一个例子，假如排序 {6 1 2 7 9 3 4 5 10 8}。

这个例子的图片是参考网上的一篇文章的，画的生动有趣，便于大家理解。

## 基准数

我们第一步，需要选择一个基准数，为了简单，直接选择第一个数 6 作为比较的基准。

## 分区

这里实际上是“双指针”的思想，从两边开始比较。

### 第一次交换

先从右往左找一个小于6的数，再从左往右找一个大于6的数，然后交换他们。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1115/163720_82a576d1_508704.png "屏幕截图.png")

满足条件的左边是 7， 右边 是 5，执行交换：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1115/163823_3eda11c5_508704.png "屏幕截图.png")

### 第二次交换

接下来，继续走。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1115/163941_a27b74f2_508704.png "屏幕截图.png")

满足条件的左边的是 9，右边的是 4,执行交换：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1115/164021_7d40f1a0_508704.png "屏幕截图.png")

### 第三次交换

然后右边的右边的哨兵向左，找到了满足条件的元素 3（比 6 小）；左边的向右移动。

发现两个人已经碰到一起了，说明本次的探测已经结束了。

我们需要把基准数放在交换到这个位置上。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1115/164229_28d5b5e0_508704.png "屏幕截图.png")

交换之后：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1115/164326_7fdca786_508704.png "屏幕截图.png")

### 递归

然后我们将上面三步的策略，应用于左右两个数组。

你问我哪两个数组？

实际上就是根据基准数分割的 2 个 数组：

{3 1 2 5 4 6 9 7 10 8}

根据 6 拆分为：

{3 1 2 5 4} 和 {9 7 10 8}

![输入图片说明](https://images.gitee.com/uploads/images/2020/1115/162731_ffcc2d92_508704.png "屏幕截图.png")

# java 代码实现

我们一起来看一下 java 的代码实现。

## 核心代码实现

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.sort.core.util.InnerSortUtil;

import java.util.List;

/**
 * 快速排序
 * @author binbin.hou
 * @since 0.0.2
 */
public class QuickSort extends AbstractSort {

    private static final Log log = LogFactory.getLog(QuickSort.class);

    @Override
    protected void doSort(List<?> original) {
        this.quickSort(original, 0, original.size()-1);
    }

    /**
     * 快速排序
     * @param original 原始列表
     * @param left 左边
     * @param right 右边
     * @since 0.0.2
     */
    @SuppressWarnings("all")
    private void quickSort(final List<?> original,
                           final int left,
                           final int right) {
        if(left > right) {
            return;
        }

        // 左右两边的哨兵指针
        int leftIx = left;
        int rightIx = right;
        // 比较基准，直接取最左边的元素
        Comparable basic = (Comparable) original.get(leftIx);

        while (leftIx < rightIx) {
            // 右边，从右向左移动找到第一个小于基准的数
            while (leftIx < rightIx && InnerSortUtil.gte(original, rightIx, basic)) {
                rightIx--;
            }

            // 左边，从左向右移动找到第一个大于基准的数
            while (leftIx < rightIx && InnerSortUtil.lte(original, leftIx, basic)) {
                leftIx++;
            }

            // 判断是否满足交换的条件
            if(leftIx < rightIx) {
                InnerSortUtil.swap(original, leftIx, rightIx);
            } 
        }

        // 更新基准的信息（i == j）
        // 将最左边位置的元素，和此时的哨兵位置交换
        InnerSortUtil.swap(original, left, leftIx);

        // 执行递归调用
        quickSort(original, left, leftIx-1);
        quickSort(original, leftIx+1, right);
    }

}
```

## InnerSortUtil 工具类

为了便于后期复用，我们把交换和比较做了抽成单独的方法：

```java
package com.github.houbb.sort.core.util;

import java.util.List;

/**
 * 内部比较辅助类，可能会变更。
 * 外部不要使用
 * @author binbin.hou
 * @since 0.0.2
 */
public final class InnerSortUtil {

    /**
     * 执行数据的交换
     * @param original 原始
     * @param i 第一个
     * @param j 第二个
     * @since 0.0.1
     */
    @SuppressWarnings("unchecked")
    public static void swap(List original,
                      int i, int j) {
        Object temp = original.get(i);
        original.set(i, original.get(j));
        original.set(j, temp);
    }

    /**
     * 是否大于等于元素
     * @param original 原始
     * @param i 索引
     * @param target 指定元素
     * @since 0.0.2
     */
    @SuppressWarnings("all")
    public static boolean gte(List original, int i, Comparable target) {
        Comparable comparable = (Comparable) original.get(i);
        return comparable.compareTo(target) >= 0;
    }

    /**
     * 是否小于等于元素
     * @param original 原始
     * @param i 索引
     * @param target 指定元素
     * @since 0.0.2
     */
    @SuppressWarnings("all")
    public static boolean lte(List original, int i, Comparable target) {
        Comparable comparable = (Comparable) original.get(i);
        return comparable.compareTo(target) <= 0;
    }

}
```

## 工具方法

为了快速排序便于使用，我们将其封装为工具类：

```java
/**
 * 快速排序
 * @param <T> 泛型
 * @param list 列表
 * @since 0.0.2
 */
public static <T extends Comparable<? super T>> void quick(List<T> list) {
    Instances.singleton(QuickSort.class).sort(list);
}
```

# 代码测试

## 测试代码

我们就以开始的例子作为测试案例。

```java
List<Integer> list = Arrays.asList(6,1,2,7,9,3,4,5,10,8);
System.out.println("开始排序：" + list);
SortHelper.quick(list);
System.out.println("完成排序：" + list);
```

## 测试日志

为了便于大家阅读和理解过程，我们在核心的实现代码中加了一点儿魔法，不，一点儿日志。

### 数据交换时

```java
// 判断是否满足交换的条件
if(leftIx < rightIx) {
    InnerSortUtil.swap(original, leftIx, rightIx);
    if(log.isDebugEnabled()) {
        String info = String.format("l=%s, r=%s, lx=%s, rx=%s, 交换后：%s",
                left, right, leftIx, rightIx, original);
        log.debug(info);
    }
} else {
    if(log.isDebugEnabled()) {
        String info = String.format("l=%s, r=%s, lx=%s, rx=%s, 无交换",
                left, right, leftIx, rightIx);
        log.debug(info);
    }
}
```

### 基准归位时

```java
// 更新基准的信息（i == j）
// 将最左边位置的元素，和此时的哨兵位置交换
InnerSortUtil.swap(original, left, leftIx);
if(log.isDebugEnabled()) {
    String info = String.format("l=%s, lx=%s, 基准数归位：%s",
            left, leftIx, original);
    log.debug(info);
}
```

## 测试日志

测试日志如下：

```
开始排序：[6, 1, 2, 7, 9, 3, 4, 5, 10, 8]
l=0, r=9, lx=3, rx=7, 交换后：[6, 1, 2, 5, 9, 3, 4, 7, 10, 8]
l=0, r=9, lx=4, rx=6, 交换后：[6, 1, 2, 5, 4, 3, 9, 7, 10, 8]
l=0, r=9, lx=5, rx=5, 无交换
l=0, lx=5, 基准数归位：[3, 1, 2, 5, 4, 6, 9, 7, 10, 8]
l=0, r=4, lx=2, rx=2, 无交换
l=0, lx=2, 基准数归位：[2, 1, 3, 5, 4, 6, 9, 7, 10, 8]
l=0, r=1, lx=1, rx=1, 无交换
l=0, lx=1, 基准数归位：[1, 2, 3, 5, 4, 6, 9, 7, 10, 8]
l=0, lx=0, 基准数归位：[1, 2, 3, 5, 4, 6, 9, 7, 10, 8]
l=3, r=4, lx=4, rx=4, 无交换
l=3, lx=4, 基准数归位：[1, 2, 3, 4, 5, 6, 9, 7, 10, 8]
l=3, lx=3, 基准数归位：[1, 2, 3, 4, 5, 6, 9, 7, 10, 8]
l=6, r=9, lx=8, rx=9, 交换后：[1, 2, 3, 4, 5, 6, 9, 7, 8, 10]
l=6, r=9, lx=8, rx=8, 无交换
l=6, lx=8, 基准数归位：[1, 2, 3, 4, 5, 6, 8, 7, 9, 10]
l=6, r=7, lx=7, rx=7, 无交换
l=6, lx=7, 基准数归位：[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
l=6, lx=6, 基准数归位：[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
l=9, lx=9, 基准数归位：[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
完成排序：[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

这个日志，再对照一下开始的解释，聪明的你一定可以理解地更加深入！

# 开源地址

为了便于大家学习，上面的排序已经开源，开源地址：

> [https://github.com/houbb/sort](https://github.com/houbb/sort)

欢迎大家 fork/star，鼓励一下作者~~

# 小结

快速排序之所比较快，因为相比冒泡排序，每次交换是跳跃式的。

每次排序的时候设置一个基准点，将小于等于基准点的数全部放到基准点的左边，将大于等于基准点的数全部放到基准点的右边。这样在每次交换的时候就不会像冒泡排序一样每次只能在相邻的数之间进行交换，交换的距离就大的多了。

只能说，**分治算法，永远滴神！**

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[Bubble_sort](https://en.wikipedia.org/wiki/Bubble_sort)

[快速排序——JAVA实现（图文并茂）](https://blog.csdn.net/u014241071/article/details/81565148)

* any list
{:toc}