---
layout: post
title: Sort-00-十大排序算法汇总
date:  2016-07-14 17:22:22 +0800
categories: [Algorithm]
tags: [sort, index]
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

# 十大排序算法简单介绍

排序算法就像是一套套不同的整理技巧，用于把一组杂乱无章的数字或对象按照一定的顺序排列整齐。

1. **冒泡排序**：这就像是给数字泡个澡，通过不断地交换相邻的两个数，如果它们的顺序错误就交换位置，直到没有需要交换的，排序就算完成了。

2. **选择排序**：想象一下，你有一堆数字，每次都从里面找到最小的那个，然后放到最前面，接着剩下的再找最小的放到第二个位置，以此类推。

3. **插入排序**：这就像是在整理一副扑克牌，你已经排好了一部分，然后每次从剩余的牌中拿出一张，插入到已排好牌的适当位置。

4. **归并排序**：这个方法就像是把整理任务分成几小份，先把每一小份分别整理好，然后再把整理好的几小份合在一起，继续整理，直到整个序列都排好。

5. **快速排序**：这个算法就像是玩一个叫“猜数字”的游戏，选定一个数字作为“基准”，然后把比它小的数字放到左边，比它大的放到右边，接着对左右两边的数字重复这个过程。

6. **堆排序**：堆排序利用了一种叫做“堆”的数据结构，它像是把数字堆成了一个金字塔，通过调整这个金字塔的形状，最终达到排序的目的。

7. **希尔排序**：这是插入排序的一种更高效的改进版本，它通过先进行“分组”，在组内进行直接插入排序，然后逐步减少组的大小，直到所有元素都参与到一个组中。

8. **计数排序**：这个方法适用于一定范围内的整数排序。它通过统计每个数字出现的次数，然后按顺序累加这些数字的出现次数，从而得到排序结果。

9. **桶排序**：这个方法是把数字分配到有限数量的桶里，每个桶负责排序一定范围内的数字，最后把各个桶里排好序的数字再按顺序取出。

10. **基数排序**：这个方法是按照数字的每一位来排序，从最低位开始，逐步向上排序，直到最高位。

# 对比

以下是对不同排序算法的对比表格：

| 序号 | 算法名             | 时间复杂度（平均） | 空间复杂度 | 稳定性 | 适应场景                                                     | 优点                                                         | 缺点                                                         |
|------|------------------|-------------------|------------|--------|------------------------------------------------------------|------------------------------------------------------------|------------------------------------------------------------|
| 1    | 冒泡排序           | O(n^2)           | O(1)       | 稳定   | 小规模数据或基本有序的数组                                 | 简单，稳定                                                 | 效率低，不适合大规模数据排序                                 |
| 2    | 选择排序           | O(n^2)           | O(1)       | 不稳定 | 简单数据排序，找到最大或最小值的场景                        | 简单，可以实现原地排序                                       | 效率低，不稳定                                             |
| 3    | 插入排序           | O(n^2)           | O(1)       | 稳定   | 小数据集或基本有序的数组                                     | 简单，稳定，适合小数据量                                     | 效率较低，对于大量数据不适用                                 |
| 4    | 希尔排序           | O(n^1.3 - n^2)  | O(1)       | 不稳定 | 小数组或要求较少内存空间的场景                                | 对于原始插入排序进行了优化，效率提升                           | 复杂度不稳定，不稳定                                         |
| 5    | 快速排序           | O(nlogn)         | O(logn)    | 不稳定 | 大规模数据排序，当数据随机分布时效率高                      | 效率高，使用广泛                                             | 需要递归，空间复杂度较高，不稳定                             |
| 6    | 归并排序           | O(nlogn)         | O(n)       | 稳定   | 大规模数据排序，需要稳定性排序的场景                          | 稳定，效率较高                                               | 需要额外的存储空间                                           |
| 7    | 堆排序             | O(nlogn)         | O(1)       | 不稳定 | 大规模数据排序，寻找前k大的元素                               | 效率高，使用广泛                                             | 不稳定，需要维护堆结构                                         |
| 8    | 计数排序           | O(n+k)           | O(k)       | 稳定   | 数据范围不大，整数排序                                        | 简单，对小范围数据排序效率高                                 | 对于数据范围大的数组效率低，需要大量内存                       |
| 9    | 桶排序             | O(n+nlogn)       | O(n)       | 稳定   | 大量均匀分布的整数数据排序                                    | 可以利用多核处理器并行处理                                    | 对于数据分布不均匀的情况效率低                             |
| 10   | 基数排序           | O(d(n+r))        | O(n+r)     | 稳定   | 大数值的排序，如电话号码排序                                   | 稳定，对于大数值排序效率高                                   | 对于数据位数不统一的处理复杂                                 |

这里的 `k` 是最大值的大小，`n` 是数组的长度，`d` 是关键字的位数，`r` 是基数。

请注意，这个表格是基于搜索结果的概述，实际应用中算法的选择还需要考虑数据特性和实际的运行环境。

----------------------------------------------------------------------------------------------------------------------------

# 排序

![排序算法](https://p9-tt-ipv6.byteimg.com/origin/pgc-image/407dc3c36843431389ed08ec9b6f1b59)

【Exchange sorts】

冒泡排序 BubbleSort

快速排序 Quicksort

【Selection sorts】

[Selection sort](https://houbb.github.io/2016/07/14/sort-03-select-sort)

Heapsort

【Insertion sorts】

Insertion sort

Shellsort

【Merge sorts】

Merge sort

【Distribution sorts】

Bucket sort

Counting sort

------------------------------------------------------------------------

【树形数据结构】

树：

树，BST

AVL 红黑树

B B+ B- 树



# Sort

Here are some tools for sort.

- RandomUtil.java

```java
public class RandomUtil {
    public static int[] randomArray(final int size) {
        int[] array = new int[size];

        Random random = new Random();
        for(int i = 0; i < size; i++) {
            array[i] = random.nextInt(100);
        }

        return array;
    }
}
```

- SortUtil.java

```java
public class SortUtil {
    private SortUtil(){}

    /**
     * swap array[index] & array[index+1]
     * @param array
     * @param index
     */
    private static void swap(int[] array, int index) {
        int temp = array[index];
        array[index] = array[index+1];
        array[index+1] = temp;
    }

    /**
     * swap array[dest] & array[target]
     * @param array
     * @param destIndex
     * @param targetIndex
     */
    private static void swap(int[] array, int destIndex, int targetIndex) {
        int temp = array[destIndex];
        array[destIndex] = array[targetIndex];
        array[targetIndex] = temp;
    }

    public static void show(int[] array) {
        for(int value : array) {
            System.out.print(value+"\t");
        }
        System.out.println();
    }
}
```

# Bubble sort

TODO优化：


> [bubble sort](https://en.wikipedia.org/wiki/Bubble_sort)

![example](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-16-bubble-sort.gif)

Starting from the beginning of the list, compare every adjacent pair, swap their position if they are not in the right order (the latter one is smaller than the former one).
After each iteration, one less element (the last one) is needed to be compared until there are no more elements left to be compared.

- bubbleSort()

```java
public static void bubbleSort(int[] array) {
    for(int i = 0; i < array.length-1; i++) {
        for(int j = 0; j < array.length-1-i; j++) {
            if(array[j] > array[j+1]) {
                SortUtil.swap(array, j);
            }
        }
    }
}
```

- test

```java
@Test
public void testSort() {
    int[] array = RandomUtil.randomArray(10);
    SortUtil.show(array);

    SortUtil.bubbleSort(array);

    SortUtil.show(array);
}
```

- result

```
39	97	71	51	39	54	13	7	90	39
7	13	39	39	39	51	54	71	90	97

Process finished with exit code 0
```


<label class="label label-info">Tips</label>

We can add a flag to improve the speed of bubble sort, it works well when array **has sorted**.

- bubbleSortFlag()

```java
public static void bubbleSortFlag(int[] array) {
    boolean flag = true;

    for(int i = 0; i < array.length-1; i++) {
        flag = false;
        for(int j = 0; j < array.length-1-i; j++) {
            if(array[j] > array[j+1]) {
                SortUtil.swap(array, j);

                flag = true;
            }
        }

        if(!flag) {
            break;
        }
    }
}
```

# Selection sort

> [selection sort](https://en.wikipedia.org/wiki/Selection_sort)

![example](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-16-selection-sort.gif)


- selectionSort()

```java
public static void selectionSort(int[] array) {
    for(int i = 0; i < array.length-1; i++) {
        int minIndex = i;
        for(int j = i+1; j < array.length; j++) {
            if(array[j] < array[minIndex]) {
                minIndex = j;    //获取最小下标
            }
        }

        if(minIndex != i) {
            swap(array, minIndex, i);
        }
    }
}
```

- test

```java
@Test
public void testSelectionSort() {
    int[] array = RandomUtil.randomArray(10);
    SortUtil.show(array);

    SortUtil.selectionSort(array);
    SortUtil.show(array);
}
```

- result

```
7	19	38	23	63	11	0	55	77	78
0	7	11	19	23	38	55	63	77	78

Process finished with exit code 0
```

# insertion sort

## 插入排序

插入排序（英语：Insertion Sort）是一种简单直观的排序算法。

它的工作原理是通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。

插入排序在实现上，通常采用in-place排序（即只需用到 O(1) 的额外空间的排序），因而在从后向前扫描过程中，需要反复把已排序元素逐步向后挪位，为最新元素提供插入空间。

## 算法描述

一般来说，插入排序都采用in-place在数组上实现。具体算法描述如下：

1. 从第一个元素开始，该元素可以认为已经被排序

2. 取出下一个元素，在已经排序的元素序列中从后向前扫描

3. 如果该元素（已排序）大于新元素，将该元素移到下一位置

4. 重复步骤3，直到找到已排序的元素小于或者等于新元素的位置

5. 将新元素插入到该位置后

重复步骤 2~5

如果比较操作的代价比交换操作大的话，可以采用二分查找法来减少比较操作的数目。

该算法可以认为是插入排序的一个变种，称为二分查找插入排序。

## 实例代码

- 实现 1

```java
public void insertionSort(int[] array) {
	for (int i = 1; i < array.length; i++) {
		int key = array[i];
		int j = i - 1;
		while (j >= 0 && array[j] > key) {
			array[j + 1] = array[j];
			j--;
		}
		array[j + 1] = key;
	}
}
```

- 实现 2

```java
//将arr[i] 插入到arr[0]...arr[i - 1]中
public static void insertion_sort(int[] arr) {
	for (int i = 1; i < arr.length; i++ ) {
		int temp = arr[i];
		int j = i - 1;  
//如果将赋值放到下一行的for循环内, 会导致在第10行出现j未声明的错误
		for (; j >= 0 && arr[j] > temp; j-- ) {
			arr[j + 1] = arr[j];
		}
		arr[j + 1] = temp;
	}
}
```

## 算法复杂度

如果目标是把n个元素的序列升序排列，那么采用插入排序存在最好情况和最坏情况。

最好情况就是，序列已经是升序排列了，在这种情况下，需要进行的比较操作需 `(n-1)` 次即可。

最坏情况就是，序列是降序排列，那么此时需要进行的比较共有 `n*(n-2)/2` 次。

插入排序的赋值操作是比较操作的次数减去 `(n-1)` 次，（因为 `(n-1)` 次循环中，每一次循环的比较都比赋值多一个，多在最后那一次比较并不带来赋值）。

平均来说插入排序算法复杂度为 `O(n^2)`。

因而，插入排序不适合对于数据量比较大的排序应用。

但是，如果需要排序的数据量很小，例如，量级小于千；或者若已知输入元素大致上按照顺序排列，那么插入排序还是一个不错的选择。 

插入排序在工业级库中也有着广泛的应用，在STL的sort算法和stdlib的qsort算法中，都将插入排序作为快速排序的补充，用于少量元素的排序（通常为8个或以下）。

## 参考资料

[插入排序](https://zh.wikipedia.org/wiki/%E6%8F%92%E5%85%A5%E6%8E%92%E5%BA%8F)

[二分查找法](https://zh.wikipedia.org/wiki/%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE%E6%B3%95)

* any list
{:toc}




