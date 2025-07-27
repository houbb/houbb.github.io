---
layout: post
title: leetcode sort 排序-02-冒泡排序力扣 912. 排序数组
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, sort, leetcode, sf]
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

# 前言

大家好，我是老马。

以前从工程的角度，已经梳理过一次排序算法。

这里从力扣算法的角度，重新梳理一遍。

核心内容包含：

1）常见排序算法介绍

2）背后的核心思想

3）leetcode 经典题目练习+讲解

4）应用场景、优缺点等对比总结

5）工程 sdk 包，这个已经完成。

6) 可视化

本次主要讲解的是冒泡排序的实战练习。

# 排序数组

给你一个整数数组 nums，请你将该数组升序排列。

你必须在 不使用任何内置函数 的情况下解决问题，时间复杂度为 O(nlog(n))，并且空间复杂度尽可能小。

示例 1：

输入：nums = [5,2,3,1]
输出：[1,2,3,5]
解释：数组排序后，某些数字的位置没有改变（例如，2 和 3），而其他数字的位置发生了改变（例如，1 和 5）。
示例 2：

输入：nums = [5,1,1,2,0,0]
输出：[0,0,1,1,2,5]
解释：请注意，nums 的值不一定唯一。
 

提示：

1 <= nums.length <= 5 * 10^4
-5 * 10^4 <= nums[i] <= 5 * 10^4

# 排序算法回顾

我们首先回顾下适用性比较强的排序算法，下面主要作为练习，我们把前面 3 种也写一下。

🧱 一、基础排序算法（适合入门）

| 算法                      | 时间复杂度 (平均/最坏) | 空间复杂度 | 稳定性   | 优点           | 缺点               |
| ----------------------- | ------------- | ----- | ----- | ------------ | ---------------- |
| **冒泡排序** Bubble Sort    | O(n²) / O(n²) | O(1)  | ✅ 稳定  | 实现简单，适合教学    | 效率极低，适合数据很小或几乎有序 |
| **选择排序** Selection Sort | O(n²) / O(n²) | O(1)  | ❌ 不稳定 | 交换次数少，结构清晰   | 比冒泡还慢，不能利用已有序性   |
| **插入排序** Insertion Sort | O(n²) / O(n²) | O(1)  | ✅ 稳定  | 适合小规模、部分有序数据 | 大数据量时效率低         |

⚙️ 二、进阶排序算法（效率更高）

| 算法                  | 时间复杂度 (平均/最坏)           | 空间复杂度         | 稳定性   | 优点              | 缺点                |
| ------------------- | ----------------------- | ------------- | ----- | --------------- | ----------------- |
| **归并排序** Merge Sort | O(n log n) / O(n log n) | O(n)          | ✅ 稳定  | 稳定，时间稳定，适合链表等结构 | 空间消耗大，递归实现复杂      |
| **快速排序** Quick Sort | O(n log n) / O(n²)      | O(log n)（递归栈） | ❌ 不稳定 | 平均快，原地排序，实用性强   | 最坏情况退化为 O(n²)，不稳定 |
| **希尔排序** Shell Sort | 约 O(n¹.³) / O(n²)       | O(1)          | ❌ 不稳定 | 改进插入排序，速度提升大    | 增量序列选择影响性能，难分析    |
| **堆排序** Heap Sort   | O(n log n) / O(n log n) | O(1)          | ❌ 不稳定 | 不使用递归，不需要额外内存   | 实现略复杂，不稳定  

# v1-冒泡排序

## 思路

我们从最简单的冒泡排序开始实现。

## 算法

```java
public int[] sortArray(int[] nums) {
    // 外层控制循环 为什么是 N-1?
    for(int i = 0; i < nums.length; i++) {

        // 内层控制大的向后交换 前面处理过的，则不需要再次处理
        for(int j = 0; j < nums.length-1-i; j++) {
            // 如果比后面的大，则交换
            if(nums[j] > nums[j+1]) {
                int temp = nums[j];
                nums[j] = nums[j+1];
                nums[j+1] = temp;
            }
        }
    }
    return nums;
}
```

## 效果

超出时间限制 10 / 21 个通过的测试用例

意料之中

## 算法改进

当然，冒泡还可以做一些基础的改进。

比如添加冒泡的标识，因为我们在最外层控制的是循环，在 j 层其实才是交换的逻辑。

如果在真实实现交换的时候，发现没有任何交换，其实 nums 已经排序完成，可以直接提前结束。

```java
    public int[] sortArray(int[] nums) {
        // 外层控制循环 为什么是 N-1?
        for(int i = 0; i < nums.length; i++) {

            boolean swapFlag = false;
            // 内层控制大的向后交换 前面处理过的，则不需要再次处理
            // 每一轮排序之后，其实已经将最大的数放在了对应正确位置，故可以 -i。没必要重复比较
            for(int j = 0; j < nums.length-1-i; j++) {
                // 如果比后面的大，则交换
                if(nums[j] > nums[j+1]) {
                    int temp = nums[j];
                    nums[j] = nums[j+1];
                    nums[j+1] = temp;

                    swapFlag = true;
                }
            }

            // 无交换，直接结束
            if(!swapFlag) {
                break;
            }
        }

        return nums;
    }
```

## 可视化

> [可视化-冒泡](https://houbb.github.io/leetcode-visual/T192-sort-bubble-sort.html)


# v2-选择排序

## 思路

每次从剩余的数组中选择最小的一个，放在结果数组中。

这里直接用 swap 节省掉数组开销。

## 解法

```java
    public int[] sortArray(int[] nums) {
        // 外层控制循环
        for(int i = 0; i < nums.length; i++) {

            int minIx = i;
            // 找到 i 后边的最小值
            for(int j = i+1; j < nums.length; j++) {
                if(nums[j] < nums[minIx]) {
                    minIx = j;
                }
            }

            // 交换
            swap(nums, i, minIx);
        }

        return nums;
    }

    private void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }
```

## 效果

执行超时 12 / 21 个通过的测试用例

## 可视化

> [可视化-选择](https://houbb.github.io/leetcode-visual/T192-sort-select-sort.html)

# v3-插入排序

## 思路

就像我们打扑克一样

1）一张牌，天然有序

2）来了一张牌，看看应该放在哪里，然后插入进去。

## 实现

边界值考虑：

1）0 位置一个数，天然有顺序，从 1 开始往前比即可

2）考虑当前值可能最小，所以要一直对比到左边的 0 位置 && 比当前数小的位置

3）对比的时候，同时移动，是一种取巧的方式。减少迭代

4）在 j+1 的位置插入新的数

```java
    public int[] sortArray(int[] nums) {
        // 0 位置本身有序

        for(int i = 1; i < nums.length; i++) {
            int curNum = nums[i];

            // 在左边找到合适的位置
            int j = i-1;

            // 需要等于，因为可能是最小值
            while (j >= 0 && nums[j] > curNum) {
                nums[j+1] = nums[j];    // 向后移动一位

                j--;
            }

            // 插入新的数  j 是最小值下标，最小的时候 j=-1
            nums[j+1] = curNum;
        }

        return nums;
    }
```

## 耗时

超出时间限制 15 / 21 个通过的测试用例

## 可视化

> [可视化](https://houbb.github.io/leetcode-visual/T192-sort-insert-sort.html)

# v4-插入排序优化

## 优化思路

原本查找插入位置的时间复杂度是 O(n)，本身是在一个有序的数组中寻找插入位置，那么我们用二分查找改造一下，复杂度降低为 O(logn)。

数组的移动，学习一下 jdk 的用数组拷贝来实现，实际上这里用到了空间换时间，比  O(n) 的移动要快不少。

## 实现

```java
    public int[] sortArray(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            int curNum = nums[i];

            // 在 [0, i-1] 区间内查找 curNum 的插入位置
            int insertPos = binarySearch(nums, 0, i - 1, curNum);

            // 将 insertPos ~ i-1 区间整体向右移动一位
            System.arraycopy(nums, insertPos, nums, insertPos + 1, i - insertPos);

            // 插入当前数
            nums[insertPos] = curNum;
        }
        return nums;
    }

    /**
     * 在 nums[left...right] 中找到第一个 >= target 的位置
     * 如果所有值都小于 target，则返回 right + 1（即插入到最后）
     */
    private int binarySearch(int[] nums, int left, int right, int target) {
        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                // 找到一个 >= 的，继续向左逼近
                right = mid - 1;
            }
        }
        return left;
    }
```

## 效果

没想到直接 AC 了。

589ms 击败 36.65%

54.68MB 击败 74.27%

## 可视化

> [可视化](https://houbb.github.io/leetcode-visual/T192-sort-insert-sort-binary-search.html)

# v5-归并排序

## 思路

把大问题拆分为子问题来解决：

1. **分解（Divide）**：将数组从中间一分为二，递归地对子数组排序。

2. **解决（Conquer）**：对子数组分别排序。

3. **合并（Combine）**：将两个有序数组**合并成一个有序数组**。

递归的思想：

1）数组不停的拆分，拆分到数组只有一个数时，自然有序。

2）剩下的就是将有序的 2 个数组不停的合并为1个

### 递归排序拆分

一个数组，mid 分开为 2 个部分

1）左侧递归

2）右侧递归

终止条件 left <= right，只有一个元素的时候

### 递归合并

我们在上边的一步中，通过拆分获取到了有序的子数组。

那么，如何合并两个有序数组成为一个呢？

arr1 下标i
arr2 下标j

我们取二者的最小值，避免越界。minIx

然后同时循环这个迭代，小的值放入数组。谁小，谁的下标移动一位

那么最后可能二者 i j 元素没走完，把没走完的元素一次放在数组结尾即可。

## 实现

理解了之后，算不上特别难：

```java
    public int[] sortArray(int[] nums) {
        mergeSort(nums, 0, nums.length-1);

        return nums;
    }

    public void mergeSort(int[] nums, int left, int right) {
        // 终止
        if(left >= right) {
            return;
        }

        // 拆分为子问题，递归处理
        int mid = left + (right-left)/2;
        mergeSort(nums, left, mid);
        mergeSort(nums, mid+1, right);

        // 整体合并
        merge(nums, left, right, mid);
    }

    private void merge(int[] nums, int left, int right, int mid) {
        int temp[] = new int[right-left+1];

        int lx = left;
        int rx = mid+1;

        // 找小的，放入 temp
        int tempIx = 0;
        while (lx <= mid && rx <= right) {
            //左边更小
            if(nums[lx] <= nums[rx]) {
                temp[tempIx++] = nums[lx++];
            } else {
                temp[tempIx++] = nums[rx++];
            }
        }

        // 把二者没放完的，放入到 temp 中
        while (lx <= mid) {
            temp[tempIx++] = nums[lx++];
        }
        while (rx <= right) {
            temp[tempIx++] = nums[rx++];
        }

        // 拷贝
        for(int i = 0; i < temp.length; i++) {
            nums[i+left] = temp[i];
        }
    }
```


## 效果

28ms 击败 79.04%

排名第二的解法。

## 优化1

### 思路

我们把数组拷贝改为系统拷贝优化一下吗，改为：

```java
System.arraycopy(temp, 0, nums, left, temp.length);
```

### 效果

27ms 击败83.35%

区别不是特别大。

## 优化 2

### 思路

避免 temp 每次都是创建

### 实现

接口参数需要调整下

```java
    public int[] sortArray(int[] nums) {
        // 节省数组创建开销
        int[] temp = new int[nums.length];
        
        mergeSort(nums, 0, nums.length-1, temp);

        return nums;
    }

    public void mergeSort(int[] nums, int left, int right, int[] temp) {
        // 终止
        if(left >= right) {
            return;
        }

        // 拆分为子问题，递归处理
        int mid = left + (right-left)/2;
        mergeSort(nums, left, mid, temp);
        mergeSort(nums, mid+1, right, temp);

        // 整体合并
        merge(nums, left, right, mid, temp);
    }

    private void merge(int[] nums, int left, int right, int mid, int[] temp) {
        int lx = left;
        int rx = mid+1;

        // 找小的，放入 temp
        int tempIx = 0;
        while (lx <= mid && rx <= right) {
            //左边更小
            if(nums[lx] <= nums[rx]) {
                temp[tempIx++] = nums[lx++];
            } else {
                temp[tempIx++] = nums[rx++];
            }
        }

        // 把二者没放完的，放入到 temp 中
        while (lx <= mid) {
            temp[tempIx++] = nums[lx++];
        }
        while (rx <= right) {
            temp[tempIx++] = nums[rx++];
        }

        // 拷贝
        System.arraycopy(temp, 0, nums, left, (right-left+1));
    }
```

### 效果

25ms 击败 91.94%

接近极限

## 优化3：merge 的优化

### 思路

我们在 merge 的时候，如果 `nums[mid] <= nums[mid + 1]` 时，其实说明左、右已经有序，可以跳过 merge。

### 实现

```java
public void mergeSort(int[] nums, int left, int right, int[] temp) {
    // 终止
    if(left >= right) {
        return;
    }
    // 拆分为子问题，递归处理
    int mid = left + (right-left)/2;
    mergeSort(nums, left, mid, temp);
    mergeSort(nums, mid+1, right, temp);

    // 整体合并
    // merge 优化
    if(nums[mid] <= nums[mid + 1]) {
        return;
    }

    merge(nums, left, right, mid, temp);
}
```

### 效果

19 ms  击败 96.51%

这个已经是目前的 TOP1 解法。

## 可视化

> [可视化](https://houbb.github.io/leetcode-visual/T192-sort-merge-sort.html)

# v6-快速排序

## 思路

我们来用快速排序解决这个问题。

整体思路其实还是递归，将数组分为两个部分：

1）选择一个 pivotIndex 位置

对数组进行 partion 分组，让其满足如下条件：

pivot 左边全是 小于等于 pivot 的值；

pivot 右边全是 大于 pivot 的值。

2）完整的数组按照 pivotIndex 拆分为 2 个部分

然后递归实现上面的步骤

## 实现

```java
    public int[] sortArray(int[] nums) {
        quickSort(nums, 0, nums.length-1);
        return nums;
    }

    private void quickSort(int[] nums, int left, int right) {
        // 终止
        if (left >= right) {
            return;
        }

        int partIx = partition(nums, left, right);

        // 拆分为左右两边，递归排序
        quickSort(nums, left, partIx-1);
        quickSort(nums, partIx+1, right);
    }

    private int partition(int[] nums, int left, int right) {
        // 初始选择最右边，方便理解
        int pivotVal = nums[right];

        // 标记，我们选择的拆分点的位置
        int px = left;

        // 将小于的 pivotVal 全部放在左边
        // 对比值是最后一个，用小于判断右边界
        for(int i = left; i < right; i++) {
            // 这里可以验证一下，等于不变，会怎么样？
            if(nums[i] < pivotVal) {
                swap(nums, px, i);
                px++;
            }
        }

        // 将 pivotVal 放在中间，默认取的是 right 值，最后和 right 交换即可
        swap(nums, px, right);

        // 返回分割位置
        return px;
    }


    private void swap(int[] arr, int i, int j) {
        if (i != j) {
            int tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
    }
```

## 效果

超出时间限制 17 / 21 个通过的测试用例

## 优化1

### 思路

快速排序的缺点在于不稳定。

好家伙 17/21 给我们扔一堆一样的数，我们直接炸了。

问题出现在我们的 partition 方法上，我们选择最右边的数，会导致不稳定。

很明显，这是针对快排弱点的测试用例。

自然地，肯定也有解救的办法。

对和 pivot 的数字，忽略处理即可。

我们不左二分，而是三分天下。 改为三路快排！

### 实现

```java
public int[] sortArray(int[] nums) {
        quickSort(nums, 0, nums.length - 1);
        return nums;
    }

    private void quickSort(int[] nums, int left, int right) {
        if (left >= right) return;

        // 三路快排
        int pivot = nums[right]; // 仍然选右边作为 pivot

        int lt = left;     // nums[left...lt-1] < pivot
        int gt = right;    // nums[gt+1...right] > pivot
        int i = left;      // 当前处理元素

        while (i <= gt) {
            if (nums[i] < pivot) {
                swap(nums, lt, i);
                lt++;
                i++;
            } else if (nums[i] > pivot) {
                swap(nums, i, gt);
                gt--;
            } else {
                i++; // nums[i] == pivot，跳过
            }
        }

        quickSort(nums, left, lt - 1);
        quickSort(nums, gt + 1, right);
    }

    private void swap(int[] nums, int i, int j) {
        if (i != j) {
            int temp = nums[i];
            nums[i] = nums[j];
            nums[j] = temp;
        }
    }
```

### 效果

1445ms 击败 30.30%

勉勉强强 AC

## 可视化

> [可视化](https://houbb.github.io/leetcode-visual/T192-sort-quick-sort.html)

# v7-希尔排序

## 思路

希尔排序是 **分组+插入排序** 的组合：

1. 将原始数组按一定“间隔 gap”分组
2. 对每组执行插入排序
3. 减小 gap（例如：gap = gap / 2），重复上述过程
4. 最终 gap = 1 时，就是普通插排，此时数据已经基本有序，效率较高

这种方式称为 **“缩小增量排序”**。

## 回顾插入排序

我们回顾一下插入排序：

```java
    public int[] sortArray(int[] nums) {
        // 0 位置本身有序
        for(int i = 1; i < nums.length; i++) {
            int curNum = nums[i];

            // 在左边找到合适的位置
            int j = i-1;

            // 需要等于，因为可能是最小值
            while (j >= 0 && nums[j] > curNum) {
                nums[j+1] = nums[j];    // 向后移动一位

                j--;
            }

            // 插入新的数  j 是最小值下标，最小的时候 j=-1
            nums[j+1] = curNum;
        }

        return nums;
    }
```

## 实现

我们数组加一个 gap。整个插入排序，从以前的移动一步，改为移动 gap

其他的其实不变。

但是觉得绕个完，需要考虑一下。

```java
public int[] sortArray(int[] nums) {
    int n = nums.length;
    int gap = n / 2;
    while (gap > 0) {
        // 对每个组进行插排
        for (int i = gap; i < n; i++) {
            int temp = nums[i];
            int j = i;
            // 按照 gap 的步骤切割数组
            // 向左找到需要插入的位置
            while ((j - gap) >= 0 && nums[j - gap] > temp) {
                // 移动
                nums[j] = nums[j - gap];
                j -= gap;
            }
            // 插入
            nums[j] = temp;
        }
        // 每次减少一半，逐步缩小步长
        gap /= 2;
    }
    return nums;
}
```

## 效果

27ms 击败 83.35%

## 可视化

> [可视化](https://houbb.github.io/leetcode-visual/T192-sort-shell-sort.html)

# v8-堆排序

## 思路

我们可以尝试使用堆排序来解决这个问题。

## 算法


```java
    public int[] sortArray(int[] nums) {
        heapSort(nums);
        return nums;
    }

    private void heapSort(int[] nums) {
        int n = nums.length;

        // 1. 构建最大堆，从最后一个非叶子节点开始往前调整
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(nums, n, i);
        }

        // 2. 依次将堆顶最大元素与末尾元素交换，缩小堆大小，并调整堆
        for (int i = n - 1; i > 0; i--) {
            swap(nums, 0, i);
            heapify(nums, i, 0);
        }
    }

    // 调整堆，使 subtree 根节点满足最大堆性质
    private void heapify(int[] nums, int heapSize, int rootIndex) {
        int largest = rootIndex;
        int leftChild = 2 * rootIndex + 1;
        int rightChild = 2 * rootIndex + 2;

        if (leftChild < heapSize && nums[leftChild] > nums[largest]) {
            largest = leftChild;
        }

        if (rightChild < heapSize && nums[rightChild] > nums[largest]) {
            largest = rightChild;
        }

        if (largest != rootIndex) {
            swap(nums, rootIndex, largest);
            heapify(nums, heapSize, largest);
        }
    }

    private void swap(int[] nums, int i, int j) {
        int tmp = nums[i];
        nums[i] = nums[j];
        nums[j] = tmp;
    }
```


## 效果

51ms 击败 44.74%

## 可视化

> [可视化](https://houbb.github.io/leetcode-visual/T192-sort-shell-sort.html)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解二分的实战题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}