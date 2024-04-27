---
layout: post
title: sort-01-bubble sort 冒泡排序算法详解
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

# 冒泡排序

冒泡排序（英语：Bubble Sort）又称为泡式排序，是一种简单的排序算法。

它重复地走访过要排序的数列，一次比较两个元素，如果他们的顺序错误就把他们交换过来。走访数列的工作是重复地进行直到没有再需要交换，也就是说该数列已经排序完成。这个算法的名字由来是因为越小的元素会经由交换慢慢“浮”到数列的顶端。

冒泡排序对 n 个项目需要 O(n^2) 的比较次数，且可以原地排序。

尽管这个算法是最简单了解和实现的排序算法之一，但它对于包含大量的元素的数列排序是很没有效率的。

## 流程

冒泡排序算法的运作如下：

1. 比较相邻的元素。如果第一个比第二个大，就交换他们两个。

2. 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。这步做完后，最后的元素会是最大的数。

3. 针对所有的元素重复以上的步骤，除了最后一个。

4. 持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较。

由于它的简洁，冒泡排序通常被用来对于程序设计入门的学生介绍算法的概念。

![排序过程](https://en.wikipedia.org/wiki/File:Bubble-sort-example-300px.gif)

# 代码实现

## 已有实现的不足

冒泡排序的文章和实现在网上有很多，讲解的也很详细。

此处只补充一下自己觉得不足的地方：

（1）大部分实现都只是一个 int 比较的例子，实用性不强。

（2）没有统一的接口，不便于后期的统一拓展和自适应。（根据不同的数量，选择不同的算法）

（3）没有自适应性的日志输出，不便于学习。

## 接口定义

基于上面 3 点，我们做一点小小的改进。

第一步：统一定义一个排序的接口。

```java
package com.github.houbb.sort.api;

import java.util.List;

/**
 * 排序接口
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ISort {

    /**
     * 排序
     * @param original 原始列表
     * @since 0.0.1
     */
    void sort(List<?> original);

}
```

## 抽象实现

为了便于后期拓展，统一实现一个抽象父类：

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.sort.api.ISort;

import java.util.List;

/**
 * 抽象排序实现
 * @author binbin.hou
 * @since 0.0.1
 */
public abstract class AbstractSort implements ISort {

    @Override
    public void sort(List<?> original) {
        //fail-return
        if(CollectionUtil.isEmpty(original) || original.size() == 1) {
            return;
        }

        doSort(original);
    }

    /**
     * 执行排序
     * @param original 原始结果
     * @since 0.0.1
     */
    protected abstract void doSort(List<?> original);

}
```


这里很简单，针对空列表，或者大小为1的列表，无需进行排序。

## 冒泡排序

接下来我们实现以下冒泡排序即可：

有几点需要说明下：

（1）这里是对 Comparable 对象的支持，本质上和常见的 int 比较一样，这样的适用范围更加广泛一些。

（2）这里是基于 java 的 list 进行排序，因为个人认为 list 的出场率是高于数组的，当然大家如果想实现数组版本的，也是类似的。

（3）changeFlag 也就是我们常说的针对冒泡排序的优化，如果没有变更，说明排序完成，可以直接返回了。

```java
package com.github.houbb.sort.core.api;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.List;

/**
 * 冒泡排序
 * @author binbin.hou
 * @since 0.0.1
 */
@ThreadSafe
public class BubbleSort extends AbstractSort {

    private static final Log log = LogFactory.getLog(BubbleSort.class);

    @Override
    @SuppressWarnings("unchecked")
    public void doSort(List<?> original) {
        boolean changeFlag;

        for(int i = 0; i < original.size()-1; i++) {
            changeFlag = false;

            for(int j = 0; j < original.size()-1-i; j++) {
                // 如果 j > j+1
                Comparable current = (Comparable) original.get(j);
                Comparable next = (Comparable) original.get(j+1);
                if(current.compareTo(next) > 0) {
                    swap(original, j, j+1);
                    changeFlag = true;
                }
            }

            // 如果没发生置换，说明后面已经排序完成
            if(!changeFlag) {
                return;
            }
        }
    }

    /**
     * 执行数据的交换
     * @param original 原始
     * @param i 第一个
     * @param j 第二个
     * @since 0.0.1
     */
    @SuppressWarnings("unchecked")
    private void swap(List original,
                      int i, int j) {
        Object temp = original.get(i);
        original.set(i, original.get(j));
        original.set(j, temp);
    }

}
```

## 工具类

为了让这个实现类使用起来更加方便，我们就模仿一下 jdk 中的方法。提供一个工具类：

```java
package com.github.houbb.sort.core.util;

import com.github.houbb.heaven.support.instance.impl.Instances;
import com.github.houbb.sort.core.api.BubbleSort;

import java.util.List;

/**
 * 排序工具类
 * @author binbin.hou
 * @since 0.0.1
 */
public final class SortHelper {

    private SortHelper(){}

    /**
     * 冒泡排序
     * @param <T> 泛型
     * @param list 列表
     * @since 0.0.1
     */
    public static <T extends Comparable<? super T>> void bubble(List<T> list) {
        Instances.singleton(BubbleSort.class).sort(list);
    }

}
```

# 测试

我们来验证一下排序算法。

## 测试代码

```java
List<Integer> list = RandomUtil.randomList(5);
System.out.println("开始排序：" + list);
SortHelper.bubble(list);
```

其中 RandomUtil 是一个随机生成的工具，便于我们测试，实现如下：

```java
package com.github.houbb.sort.core.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public final class RandomUtil {

    private RandomUtil(){}

    /**
     * 随机列表
     * @param size 大小
     * @return 结果
     * @since 0.0.1
     */
    public static List<Integer> randomList(final int size) {
        List<Integer> list = new ArrayList<>(size);

        Random random = ThreadLocalRandom.current();
        for(int i = 0; i < size; i++) {
            list.add(random.nextInt(100));
        }

        return list;
    }
}
```

## 日志

为了便于理解，我们可以在排序实现中加一点日志：

```java
if(current.compareTo(next) > 0) {
    swap(original, j, j+1);
    changeFlag = true;
    if(log.isDebugEnabled()) {
        String format = String.format("i=%s, j=%s, c=%s, n=%s, 排序后: %s",
                i, j, current, next, original);
        log.debug(format);
    }
} else {
    if(log.isDebugEnabled()) {
        String format = String.format("i=%s, j=%s, c=%s, n=%s, 无变化: %s",
                i, j, current, next, original);
        log.debug(format);
    }
}
```

i,j 代表本次循环的 i,j; c 代表当前值，n 代表 next 下一个值。

测试日志如下：

```
开始排序：[77, 48, 10, 8, 28]

i=0, j=0, c=77, n=48, 排序后: [48, 77, 10, 8, 28]
i=0, j=1, c=77, n=10, 排序后: [48, 10, 77, 8, 28]
i=0, j=2, c=77, n=8, 排序后: [48, 10, 8, 77, 28]
i=0, j=3, c=77, n=28, 排序后: [48, 10, 8, 28, 77]      -- 第一次冒泡，把最大的 77 排序到最右侧

i=1, j=0, c=48, n=10, 排序后: [10, 48, 8, 28, 77]
i=1, j=1, c=48, n=8, 排序后: [10, 8, 48, 28, 77]
i=1, j=2, c=48, n=28, 排序后: [10, 8, 28, 48, 77]      -- 第二次冒泡，把第二大的 48 排序到最右侧 

i=2, j=0, c=10, n=8, 排序后: [8, 10, 28, 48, 77]       -- 这次排序结束后， 28 和 10 已经放在了对应的位置
i=2, j=1, c=10, n=28, 无变化: [8, 10, 28, 48, 77]      

i=3, j=0, c=8, n=10, 无变化: [8, 10, 28, 48, 77]
```

这个算法，是把小的值放在前面，所以只有当 c > n 的时候，才会发生排序。

最后 i = 6, j = 2 的时候，已经排序完成。

# 开源地址

为了便于大家学习，上面的排序已经开源，开源地址：

> [https://github.com/houbb/sort](https://github.com/houbb/sort)

欢迎大家 fork/star，鼓励一下作者~~

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[Bubble_sort](https://en.wikipedia.org/wiki/Bubble_sort)

* any list
{:toc}