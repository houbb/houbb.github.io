---
layout: post
title:  java 如何实现 binary search 二分查找法？
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, search]
published: true
---


![思维导图](https://p6-tt.byteimg.com/origin/pgc-image/e49f32c71346427b91ea575b9788a78a?from=pc)

# 顺序查找

如果让你在一堆书架上找到自己想要的书，你会怎么找呢？

实际上最简单最粗暴的方式就是一本一本的看过去。

这个用计算机实现就对应着顺序查找。

## 概念

顺序查找适合于存储结构为顺序存储或链接存储的线性表。

基本思想：顺序查找也称为线形查找，属于无序查找算法。从数据结构线形表的一端开始，顺序扫描，依次将扫描到的结点关键字与给定值k相比较，若相等则表示查找成功；若扫描结束仍没有找到关键字等于k的结点，表示查找失败。

## 复杂度分析：
　
查找成功时的平均查找长度为：（假设每个数据元素的概率相等） ASL = 1/n(1+2+3+…+n) = (n+1)/2 ;

当查找不成功时，需要n+1次比较，时间复杂度为O(n);

所以，顺序查找的时间复杂度为O(n)。

![复杂度](https://p6-tt.byteimg.com/origin/pgc-image/34b64ee3b41b4eb79c2de98e6d7e7904?from=pc)

## java 代码实现

以 java  代码为例：

```java
/*
** 顺序查询算法
** @param arr 数组信息
** @param target 目标值
** @param arrLength 数组长度
*/
int foreachSearch(int arr[], int target, int arrLength) {
    int i;
    for(i = 0; i < arrLength; i++) {
        if(target == arr[i]) {
            return i;
        }
    }
    return -1;
}
```

## java 改进版本

我们这个实现版本主要是为了弥补大部分网上实现的不足，很多实现就是一个 int 类型，适用范围不够广泛。

### 接口定义

为了后续的拓展性，我们定义查询接口及抽象实现。

```java
package com.github.houbb.search.api;

import java.util.List;

/**
 * @author 老马啸西风
 * @since 0.0.1
 */
public interface ISearch<T> {

    /**
     * 执行元素的查询
     * @param list 列表
     * @param key 目标对象
     * @return 结果对应的下标
     * @since 0.0.1
     */
    int search(List<? extends Comparable<? super T>> list, T key);

}
```

抽象实现:

```java
package com.github.houbb.search.core;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.search.api.ISearch;
import com.github.houbb.search.constant.SearchConst;

import java.util.List;

/**
 * 抽象查询类
 * @author 老马啸西风
 * @since 0.0.1
 */
public abstract class AbstractSearch<T> implements ISearch<T> {

    @Override
    public int search(List<? extends Comparable<? super T>> list, T key) {
        ArgUtil.notNull(key, "key");

        if(CollectionUtil.isEmpty(list)) {
            return SearchConst.NOT_FOUND;
        }

        return this.doSearch(list, key);
    }

    /**
     * 执行查询
     * @param list 列表
     * @param key key
     * @return 结果
     * @since 0.0.1
     */
    protected abstract int doSearch(List<? extends Comparable<? super T>> list, T key);

}
```

### 遍历实现

实现和前面基础版本类似。

```java
package com.github.houbb.search.core;

import com.github.houbb.search.constant.SearchConst;

import java.util.List;

/**
 * 遍历查询法
 * @author 老马啸西风
 * @since 0.0.1
 */
public class ForeachSearch<T> extends AbstractSearch<T> {

    @Override
    @SuppressWarnings("all")
    protected int doSearch(List<? extends Comparable<? super T>> list, T key) {
        for(int i = 0; i < list.size(); i++) {
            Comparable comparable = list.get(i);
            if(comparable.compareTo(key) == 0) {
                return i;
            }
        }

        return SearchConst.NOT_FOUND;
    }

}
```

这个实现的适用范围故意被我们缩小为可比较类型了，实际上可以更加广泛一些，理论上只要能通过 equals() 比较的对象都可以。

其实主要是为了兼容我们下面要讲的二分查找法，也是我们本文的重点。

# 二分查找法

遍历查询非常的简单粗暴，不过性能也是比较差的。

如果要查找的数据已经排序过了，比如我们通过查看联系人时，一般可以通过姓名快速找到大概的位置，而不是从头到尾的看一遍。

这个通过计算机实现就是二分查找法。

## 概念

二分搜索（英语：binary search），也称折半搜索（英语：half-interval search）、对数搜索（英语：logarithmic search），是一种在有序数组中查找某一特定元素的搜索算法。

搜索过程从数组的中间元素开始，如果中间元素正好是要查找的元素，则搜索过程结束；

如果某一特定元素大于或者小于中间元素，则在数组大于或小于中间元素的那一半中查找，而且跟开始一样从中间元素开始比较。

如果在某一步骤数组为空，则代表找不到。这种搜索算法每一次比较都使搜索范围缩小一半。

## 复杂度概览

| 分类	 | 搜索算法 |
|:---|:---|
| 数据结构	| 数组 |
| 最坏时间复杂度	| O(log(n)) |
| 最优时间复杂度	| O(1) |
| 平均时间复杂度	| O(log(n)) | 
| 空间复杂度	| 迭代: O(1); 递归: O(log(n)) |

![二分查找](https://p3-tt.byteimg.com/origin/pgc-image/94ace8605a6549f085ecb85b455ea0a8?from=pc)

## 步骤

（1）首先确定整个查找区间的中间位置 mid = （ left + right ）/ 2

（2）用待查关键字值与中间位置的关键字值进行比较；

若相等，则查找成功

若大于，则在后（右）半个区域继续进行折半查找

若小于，则在前（左）半个区域继续进行折半查找

（3）对确定的缩小区域再按折半公式，重复上述步骤。

最后，得到结果：要么查找成功， 要么查找失败。

折半查找的存储结构采用一维数组存放。

注意：这里有一个前提，数组必须是有序的。如果元素无序怎么办呢？当然是先执行排序，然后再通过折半查找了。

排序算法不是本文重点，可以参考：

> [7 天时间，我整理并实现了这 9 种最经典的排序算法](https://www.jianshu.com/p/1f38751f6f4e)

## java 代码实现

我们先来看一下网上最常见的两种实现。

### 递归实现

```java
public static int binarySearch(int[] arr, int start, int end, int hkey){
    if (start > end)
        return -1;

    int mid = start + (end - start)/2;    //防止溢位
    if (arr[mid] > hkey)
        return binarySearch(arr, start, mid - 1, hkey);
    if (arr[mid] < hkey)
        return binarySearch(arr, mid + 1, end, hkey);
    return mid;  

}
```

递归实现的版本非常的简洁优雅。

### 循环实现

```java
public static int binarySearch(int[] arr, int start, int end, int hkey){
    int result = -1;

    while (start <= end){
        int mid = start + (end - start)/2;    //防止溢位
        if (arr[mid] > hkey)
            end = mid - 1;
        else if (arr[mid] < hkey)
            start = mid + 1;
        else {
            result = mid ;  
            break;
        }
    }

    return result;
}
```

循环实现相对麻烦一些，不过性能一般会比递归好一点。


## java 改良版本

上面的方法非常简洁，问题也同样明显。

如果我想比较查找 String、Long 等其他常见类型怎么办呢？

我们可以稍微改良一下上面的实现：

```java
package com.github.houbb.search.core;

import com.github.houbb.search.constant.SearchConst;

import java.util.List;

/**
 * 折半
 * @author 老马啸西风
 * @since 0.0.1
 */
public class BinarySearch<T> extends AbstractSearch<T> {

    @Override
    @SuppressWarnings("all")
    protected int doSearch(List<? extends Comparable<? super T>> list, T key) {
        int low = 0;
        int high = list.size()-1;

        while (low <= high) {
            int mid = (low+high) / 2;

            Comparable comparable = list.get(mid);
            if(comparable.compareTo(key) == 0) {
                return mid;
            } else if(comparable.compareTo(key) < 0) {
                // 小于指定元素
                low = mid;
            } else {
                // 大于指定元素
                high = mid;
            }
        }

        return SearchConst.NOT_FOUND;
    }

}
```

这里我们将比较对象扩展为 Comparable 对象，然后通过 compareTo 方法进行比较。

# 开源工具

当然一般的查找算法到这里就结束了，但是老马却不这么认为。

知其然，知其所以然，所以我们要学习算法原理。

君子性非异也， 善假于物也，所以我们要学会使用工具。

算法应该被封装为简单可用的工具，便于使用。于是老马把上面的两种查询算法开源到了 maven 中央仓库，便于后期使用可拓展。

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>search</artifactId>
    <version>0.0.1</version>
</dependency>
```

## 使用

### 遍历查询

```java
final List<String> list = Arrays.asList("1", "2", "3", "4", "5");
Assert.assertEquals(3, SearchHelper.foreach(list, "4"));
```

### 折半查询

```java
final List<String> list = Arrays.asList("1", "2", "3", "4", "5");
Assert.assertEquals(3, SearchHelper.binary(list, "4"));
```

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解一下二叉查询树，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

- 顺序查找

https://www.cnblogs.com/yw09041432/p/5908444.html

https://www.jb51.net/article/53863.htm

https://blog.csdn.net/jiandanokok/article/details/50517837

- 二分查找

[二分搜索算法](https://zh.wikipedia.org/wiki/%E4%BA%8C%E5%88%86%E6%90%9C%E7%B4%A2%E7%AE%97%E6%B3%95)

https://www.cnblogs.com/ider/archive/2012/04/01/binary_search.html

* any list
{:toc}
