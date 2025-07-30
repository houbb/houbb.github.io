---
layout: post
title: leetcode sort 排序-10-radixSort 基数排序力扣 T164. 最大间距 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, sort, sf]
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

# 164. 最大间距

给定一个无序的数组 nums，返回 数组在排序之后，相邻元素之间最大的差值 。如果数组元素个数小于 2，则返回 0 。

您必须编写一个在「线性时间」内运行并使用「线性额外空间」的算法。

示例 1:

输入: nums = [3,6,9,1]
输出: 3
解释: 排序后的数组是 [1,3,6,9], 其中相邻元素 (3,6) 和 (6,9) 之间都存在最大差值 3。

示例 2:

输入: nums = [10]
输出: 0
解释: 数组元素个数小于 2，因此返回 0。
 

提示:

1 <= nums.length <= 10^5
0 <= nums[i] <= 10^9

# v1-排序解法

## 思路

简单粗暴，直接排序对比

## 解法

```java
    public int maximumGap(int[] nums) {
        Arrays.sort(nums);

        int maxGap = 0;

        for(int i = 1; i < nums.length; i++) {
            maxGap = Math.max(nums[i]-nums[i-1], maxGap);
        }

        return maxGap;
    }
```

## 效果

44ms 击败 57.97%

# v2-计数排序

## 思路

想要让复杂度为 O(n)，那么只有 3 种方法：计数、桶排序、基数排序。

我们用计数排序尝试一下

## 解法

```java
    public int maximumGap(int[] nums) {
        if (nums.length < 2) {
            return 0;
        }

        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;

        for (int num : nums) {
            min = Math.min(min, num);
            max = Math.max(max, num);
        }

        // 如果所有数字都相同
        if (min == max) return 0;

        // 计数数组
        int[] count = new int[max - min + 1];

        // 计数填充
        for (int num : nums) {
            count[num - min]++;
        }

        int maxGap = 0;
        int prev = -1;

        for (int i = 0; i < count.length; i++) {
            if (count[i] == 0) continue;

            if (prev != -1) {
                maxGap = Math.max(maxGap, i - prev);
            }

            prev = i;
        }

        return maxGap;
    }
```

## 效果

内存超过限制。

# v3-桶排序

## 思路

其实个人感觉还是不太好思考的，官方的解答也不太好理解。

个人认为最好的理解：

```
假设我们有 n 个数，那么分成 n+1 个桶。

根据抽屉原理，必然有一个空桶。

桶内的元素最多差距为桶的距离，空桶的存在，会导致我们的最大间距必然在空桶两边的位置产生。
```

## 抽屉原理

抽屉原理（也称为**鸽巢原理**，英文名：**Pigeonhole Principle**）是一个非常直观但威力强大的**组合数学基本原理**，在竞赛数学、算法设计、数据结构分析、概率论等领域都有广泛应用。

### ✅ 定义（基本形式）

如果将 **n 个物品** 放入 **m 个抽屉**（其中 n > m），那么**至少有一个抽屉里有不止一个物品**。

换句话说：

> 如果物品数 **超过** 抽屉数，那就一定存在某个抽屉，至少包含两个或以上的物品。

### 🧠 举个简单例子

你有 **13 只袜子**，它们分别是黑色或白色两种颜色，现在在**黑暗中随机拿袜子**。

> 问：**至少需要拿几只袜子，才能保证拿到一双同色的？**

答：**3只**。

* 因为颜色只有 2 种（2 个抽屉），一旦你拿了 3 只袜子（3 个物品），根据抽屉原理，至少有一种颜色拿了 2 只。

## 解法

接下来，我们来思考如何用桶排序来解决。

类似的

1）找出 min、max

2) bucketSize = n+1

```java
bucketWitdh=Math.ceil((double)(max-min) / bucketSize)
```

3) 下标

那么如何计算每一个数对应的桶的下标？

桶的编号有一个计算公式：

```java
bucketIndex = (min - minVal) / bucketWitdh;
```

4）如何计算最大 gap？

在空桶的左右两边产生。

每个桶记录 min 和 max

有些桶可能是空的（min = -1 或用 isEmpty 标记）

我们要找到 当前非空桶的 min 和前一个非空桶的 max 的差值

每次计算差值，更新一个 maxGap 变量

大概逻辑：

```java
int maxGap = 0;
int prev = minVal;

for (int i = 0; i < bucketCount; i++) {
    if (bucketMin[i] == Integer.MAX_VALUE) {
        continue; // 空桶
    }

    // 当前桶的最小值 - 前一个桶的最大值
    maxGap = Math.max(maxGap, bucketMin[i] - prev);
    prev = bucketMax[i]; // 更新 prev
}
```

## 实现

```java
    public static int maximumGap(int[] nums) {
        // 找到最大、最小值
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;
        for (int num : nums) {
            if (num > max) {
                max = num;
            }
            if (num < min) {
                min = num;
            }
        }
        // 最大值和最小值相同
        if(min == max) {
            return 0;
        }

        // 创建桶
        int bucketSize = nums.length + 1;

        // 初始化 [min, max) 只需要记录最大值+最小值即可
        int[][] buckets = new int[bucketSize][2];
        for(int i = 0; i < bucketSize; i++) {
            buckets[i][0] = Integer.MAX_VALUE;
            buckets[i][1] = Integer.MIN_VALUE;
        }

        // 更新真实的最大、最小值
        int bucketWidth= (int) Math.ceil((double)(max-min)/ bucketSize);
        for (int num : nums) {
            int bucketIndex = (num - min) / bucketWidth;
            // 这里要处理下临界值的问题
            if(bucketIndex == bucketSize) {
                bucketIndex--;
            }
            buckets[bucketIndex][0] = Math.min(buckets[bucketIndex][0], num);
            buckets[bucketIndex][1] = Math.max(buckets[bucketIndex][1], num);
        }

        int maxGap = 0;
        int prev = min;
        for(int i = 0; i < buckets.length; i++) {
            // 跳过空桶
            if(buckets[i][0] == Integer.MAX_VALUE) {
                continue;
            }

            // 当前最小值 - 上一个最大值，得到最大的间隔
            maxGap = Math.max(maxGap, buckets[i][0] - prev);
            prev = buckets[i][1];
        }

        return maxGap;
    }
```

## 效果

26ms 击败 82.71%

## 可视化

> [可视化效果](https://houbb.github.io/leetcode-visual/T164-bucket-sort.html)

# v4-基数排序

## 思路

我们用基数排序，保证复杂度为 O(n)

## 实现

```java
    public static int maximumGap(int[] nums) {
        // 找到最大值
        int max = 0;
        for (int num : nums) {
            if (num > max) {
                max = num;
            }
        }

        // 每一位先进先出的队列
        // 10个桶，每个桶一个队列，代表 0~9
        List<Queue<Integer>> queueList = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            queueList.add(new LinkedList<>());
        }

        // 从低到高开始比较，个位开始
        int exp = 1;
        // 最大的数还没结束
        while (max / exp > 0) {
            // 按照当前位放入元素？
            for(int num : nums) {
                int digit = (num / exp) % 10;   // 当前位

                // 放入对应的位置
                queueList.get(digit).add(num);
            }

            // 按照入的顺序，出到数组中
            int index = 0;
            for(Queue<Integer> queue : queueList) {
                while (!queue.isEmpty()) {
                    nums[index++] = queue.poll();
                }
            }

            // 进位
            exp *= 10;
        }

        // 计算
        int maxGap = 0;
        for(int i = 1; i < nums.length; i++) {
            maxGap = Math.max(maxGap, nums[i] - nums[i-1]);
        }
        return maxGap;
    }
```

## 复杂度

138ms 击败 5.76%

## 可视化

> [可视化效果](https://houbb.github.io/leetcode-visual/T164-radix-sort-basic.html)

# v5-基数排序基本类型

## 思路

我们基数排序明明如此优秀，为何性能如何一般？

List 和 queue 集合的创建消耗性能，我们用基础数据类型替代，来模拟实现一样的效果。

## 实现

```java
 public static int maximumGap(int[] nums) {
        // 找到最大值
        int max = 0;
        for (int num : nums) {
            if (num > max) {
                max = num;
            }
        }

        // 每一位先进先出的队列
        // 10个桶，每个桶一个队列，代表 0~9
        // 我们用数组来模拟，而不是使用这种比较重的队列
        int[][] queueList = new int[10][nums.length];
        // 记录每一个桶里面有多少个元素
        int[] queueIndexList = new int[10];

        // 从低到高开始比较，个位开始
        int exp = 1;
        // 最大的数还没结束
        while (max / exp > 0) {

            // 按照当前位放入元素？
            for(int num : nums) {
                int digit = (num / exp) % 10;   // 当前位

                // 放入对应的位置
                queueList[digit][queueIndexList[digit]++] = num;
            }

            int index = 0;
            for(int i = 0; i < 10; i++) {
                for(int j = 0; j < queueIndexList[i]; j++) {
                    // 出队列
                    nums[index++] = queueList[i][j];
                }

                // 清空数据
                queueIndexList[i] = 0;
            }

            // 进位
            exp *= 10;
        }

        // 计算
        int maxGap = 0;
        for(int i = 1; i < nums.length; i++) {
            maxGap = Math.max(maxGap, nums[i] - nums[i-1]);
        }
        return maxGap;
    }
```

## 效果

23ms 击败 84.75%

其实这个效果已经非常好了，而且相对比较好记忆。

# v6-基数排序前缀和版本

## 思路

我们可以把基数排序+计数排序+前缀和的方式来优化。

## 实现

```java
public static int maximumGap(int[] nums) {
    if (nums.length < 2) return 0;

    // 1. 找出最大值，用来确定最多多少位（exp 趟）
    int maxVal = nums[0];
    for (int num : nums) {
        if (num > maxVal) maxVal = num;
    }

    int n = nums.length;
    int[] aux = new int[n];   // 辅助数组，用于每一轮排序
    int exp = 1;              // 当前位的“进制权重”：1 => 个位，10 => 十位...

    while (maxVal / exp > 0) {
        int[] digitCounts = new int[10]; // 每个桶中数字出现的次数（0~9）

        // 2. 统计当前位是 0~9 的数字个数
        for (int i = 0; i < n; i++) {
            int digit = (nums[i] / exp) % 10;
            digitCounts[digit]++;
        }

        // 3. 前缀和：digitCounts[i] 表示该位 <= i 的数字个数
        int[] digitPositions = new int[10];  // 每个数字在 aux 中的起始写入位置
        digitPositions[0] = 0;
        for (int i = 1; i < 10; i++) {
            digitPositions[i] = digitPositions[i - 1] + digitCounts[i - 1];
        }

        // 4. 将 nums 中的元素稳定排序，放入 aux
        for (int i = 0; i < n; i++) {
            int digit = (nums[i] / exp) % 10;
            int pos = digitPositions[digit]++;
            aux[pos] = nums[i];
        }

        // 5. 拷贝回原数组，准备处理下一位
        System.arraycopy(aux, 0, nums, 0, n);
        exp *= 10;
    }

    // 6. 求最大间距
    int maxGap = 0;
    for (int i = 1; i < n; i++) {
        maxGap = Math.max(maxGap, nums[i] - nums[i - 1]);
    }

    return maxGap;
}
```

## 拆解

我们来拆解一下，整体结构不变。

✅ 举个具体例子：

假设我们对下面这个数组进行基数排序的 **个位** 排序：

```java
int[] nums = {23, 45, 12, 35, 22, 33};
```

我们提取每个数字的 **个位数字**（也就是 `% 10`）：

| 原数 | 个位数字 |
| -- | ---- |
| 23 | 3    |
| 45 | 5    |
| 12 | 2    |
| 35 | 5    |
| 22 | 2    |
| 33 | 3    |

🔢 第一步：统计 digitCounts（每个数字出现次数）

```java
digitCounts[2] = 2;  // 12, 22
digitCounts[3] = 2;  // 23, 33
digitCounts[5] = 2;  // 45, 35
// 其它值为 0
```

也就是：

```java
digitCounts = [0, 0, 2, 2, 0, 2, 0, 0, 0, 0];
```

---

### 🧮 第二步：前缀和求 digitPositions（每个数字写入 aux\[] 的起始位置）

```java
digitPositions[0] = 0;
digitPositions[1] = 0 + digitCounts[0] = 0;
digitPositions[2] = 0 + digitCounts[1] = 0;
digitPositions[3] = digitPositions[2] + digitCounts[2] = 0 + 2 = 2;
digitPositions[4] = digitPositions[3] + digitCounts[3] = 2 + 2 = 4;
digitPositions[5] = digitPositions[4] + digitCounts[4] = 4 + 0 = 4;
digitPositions[6] = digitPositions[5] + digitCounts[5] = 4 + 2 = 6;
... 后面都等于6，因为 digitCounts[6~9] 都是 0
```

所以最后是：

```java
digitPositions = [0, 0, 0, 2, 4, 4, 6, 6, 6, 6];
```

💡 这意味着什么？

我们要把所有个位数字为 `2` 的数（即 12、22），放到 `aux[0]` 开始；

个位为 `3` 的数（23、33）放到 `aux[2]` 开始；

个位为 `5` 的数（45、35）放到 `aux[4]` 开始。

也就是：

| 个位数 | 元素（保持顺序） | 应放入 aux\[] 起始位置 |
| --- | -------- | --------------- |
| 2   | 12, 22   | 0               |
| 3   | 23, 33   | 2               |
| 5   | 45, 35   | 4               |

✅ 最终目标：

通过 `digitPositions[digit]++`，我们就能动态把每个元素稳定地放入正确位置，实现稳定排序。

```java
int digit = nums[i] % 10;
aux[digitPositions[digit]++] = nums[i];  // 稳定地放入正确位置
```



* any list
{:toc} 