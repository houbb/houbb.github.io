---
layout: post
title: 【leetcode】04-4.median of two sorted arrays 寻找两个正序数组的中位数
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, leetcode, sf]
published: true
---

## 4. 题目

给定两个大小为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。

请你找出这两个正序数组的中位数，并且要求算法的时间复杂度为 O(log(m + n))。

你可以假设 nums1 和 nums2 不会同时为空。

### 示例 1:

```
nums1 = [1, 3]
nums2 = [2]

则中位数是 2.0
```

### 示例 2:

```
nums1 = [1, 2]
nums2 = [3, 4]

则中位数是 (2 + 3)/2 = 2.5
```

## 简单解法

### 思路

看到这题，个人觉得最直接的思路如下：

（1）将两个数组合并成为一个

（2）重新排序

（3）取中间的元素

### java 源码

```java
/**
 * 简单解法
 * @param nums1 第一个数组
 * @param nums2 第二个数组
 * @return 结果
 * @date 2020-6-9 17:47:18
 */
public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    int totalSize = nums1.length + nums2.length;
    int[] results = new int[nums1.length+nums2.length];
    // 1. 初始化
    System.arraycopy(nums1, 0, results, 0, nums1.length);
    System.arraycopy(nums2, 0, results, nums1.length, nums2.length);
    //2. 排序
    Arrays.sort(results);
    //3. 计算结果
    // 位运算替代除法
    int mod = totalSize % 2;
    int midIndex = totalSize >> 1;
    if(mod == 1) {
        return results[midIndex];
    }
    int one = results[midIndex-1];
    int two = results[midIndex];
    double sum = one+two;
    return sum / 2;
}
```

### 性能

提交一看，有点惨。只超过了 37.05% 的 java 实现。

那有没有更加巧妙的解法呢？

```
Runtime: 3 ms, faster than 37.05% of Java online submissions for Median of Two Sorted Arrays.
Memory Usage: 40.7 MB, less than 33.92% of Java online submissions for Median of Two Sorted Arrays.
```

## 进阶解法

实际上 leetcode 下面有一个高赞解答，对中位数的理解非常到位。

此处我就不再重复，参考知乎的一篇文章。

### 中位数有什么用

要解决这个问题，我们需要先理解“中位数有什么用？”。

在统计学中，**中位数用于将集合划分为两个相等长度的子集，一个子集总是大于另一个子集。**

如果我们理解了中位数对集合的划分，我们就非常接近答案了。

### 分析过程

首先，在一个随机的位置 i 将集合 A 划分为两部分。

```
 left_A             |           right_A
A[0], A[1], ..., A[i-1]  |  A[i], A[i+1], ..., A[m-1]
```

由于A有m个元素，所以就有m+1 种分法（i=0~m）。

由此可知： len(left_A) = i, len(right_A) = m - i。

注意：当i = 0时，left_A为空，而当i = m时，right_A为空。

同样的，在一个随机的位置 j 将集合 B 划分为两部分。：

```
     left_B              |        right_B
B[0], B[1], ..., B[j-1]  |  B[j], B[j+1], ..., B[n-1]
```

将 left_A 和 left_B 放入同一个集合，将 right_A 和 right_B 放入另外一个集合。

分别称他们为 left_part 和 right_part ：

```
  left_part          |        right_part
A[0], A[1], ..., A[i-1]  |  A[i], A[i+1], ..., A[m-1]
B[0], B[1], ..., B[j-1]  |  B[j], B[j+1], ..., B[n-1]
```

如果我们能达成这两个条件：

1) len(left_part) == len(right_part)

2) max(left_part) <= min(right_part)

我们就能将 {A, B} 中所有元素分成两个长度相等的部分，并且其中一个部分总是大于另外一个部分。

那么中位数就是 median = (max(left_part) + min(right_part))/2。

ps: 这就是中位数的概念，非常的精髓。

为了达成这两个条件，我们只需要确保：

```
(1) i + j == m - i + n - j (或者: m - i + n - j + 1) 即让左半边元素数量等于与右半边

对于 n >= m 的情况，我们只需要让 : i = 0 ~ m, j = (m + n + 1)/2 - i

(2) B[j-1] <= A[i] 并且 A[i-1] <= B[j]  即让左边最大元素小于右边最小元素
```

ps. 简单起见，我们先假设 A[i-1],B[j-1],A[i],B[j] 总是可用的，即使 i=0/i=m/j=0/j=n 。 

后面我会说怎么处理这些边缘情况。

ps. 为何 n >= m？

因为我必须确保 j 是非负的，因为 0 <= i <= m 并且 j = (m + n + 1)/2 - i。 如果 n < m ， 则 j 可能是负值， 这将导致错误的结果。

所以，我们需要做的就是：

```
在 [0, m] 中找到一个使下面不等式成立的 i :
    B[j-1] <= A[i] and A[i-1] <= B[j], ( where j = (m + n + 1)/2 - i )
```

我们可以按照下面描述的步骤进行二分查找：

```
<1> 设 imin = 0, imax = m, 然后在这个区间 [imin, imax] 中查找 i

<2> 设 i = (imin + imax)/2, j = (m + n + 1)/2 - i

<3> 此时，我们满足了 len(left_part)==len(right_part)， 我们会遇到三种情况：

    <a> B[j-1] <= A[i] and A[i-1] <= B[j]

        说明我们找到了我们需要的i，停止搜索。

    <b> B[j-1] > A[i]
        意味着 A[i] 太小， 那么我们必须调整 i 以使 `B[j-1] <= A[i]` 仍然成立。
        我们可以增大 i吗?
            Yes. 因为 i 增大时， j 将减小。
            所以 B[j-1] 跟着减小而 A[i] 会增大。`B[j-1] <= A[i]`就可能成立。
        我们可以减小 i 吗?
            No!  因为 i 减小时， j 将增大。
            所以 B[j-1] 增大而 A[i] 减小。B[j-1] <= A[i] 永远不可能成立。
        所以我们必须增加 i。也就是将搜索范围调整为[i+1, imax]。 所以，设 imin = i+1, 然后回到步骤 <2>.

    <c> A[i-1] > B[j]

        意味着 A[i-1] 太大。我们必须减小 i 以使 `A[i-1]<=B[j]`.

        就是说我们要调整搜索范围为 [imin, i-1].

        所以， 设 imax = i-1, 然后回到步骤 <2>.
```

找到符合条件的 i 之后，我们想要的中位数就是：

```
max(A[i-1], B[j-1]) ( m + n 是奇数)

或者 (max(A[i-1], B[j-1]) + min(A[i], B[j]))/2 ( m + n 是偶数)
```

现在让我们考虑边缘值i = 0，i = m，j = 0，j = n，其中A [i-1]，B [j-1]，A [i]，B [j]可能不存在。 实际上这种情况比你想象的要容易。

我们需要做的是确保 max(left_part) <= min(right_part)。 所以， 如果 i 和 j 不是边缘值(意味着 A[i-1],B[j-1],A[i],B[j] 都存在)， 那么我们必须同时检查 B[j-1] <= A[i] 和 A[i-1] <= B[j]. 但是如果 A[i-1],B[j-1],A[i],B[j] 中某些值不存在， 那么我们可以只检查一个条件（甚至都不检查）。例如， 如果 i=0， 那么 A[i-1] 不存在， 也就意味着我们不用检查 A[i-1] <= B[j]。 所以，我们这样做：

```
在 [0, m] 中找到一个使下面不等式成立的 i :
    (j == 0 or i == m or B[j-1] <= A[i]) and
    (i == 0 or j == n or A[i-1] <= B[j])
    where j = (m + n + 1)/2 - i
```

在搜索循环中，我们只会遇到三种情况：

```
<a> (j == 0 or i == m or B[j-1] <= A[i]) and
    (i == 0 or j = n or A[i-1] <= B[j])
    说明 i 的值满足要求，停止循环

<b> j > 0 and i < m and B[j - 1] > A[i]
    说明 i 的值太小， 增加它.

<c> i > 0 and j < n and A[i - 1] > B[j]
    说明 i 的值过大， 减小它。
```

感谢 @Quentin.chen , 他指出： i < m ==> j > 0 and i > 0 ==> j < n . 因为：

```
m <= n, i < m ==> j = (m+n+1)/2 - i > (m+n+1)/2 - m >= (2*m+1)/2 - m >= 0
m <= n, i > 0 ==> j = (m+n+1)/2 - i < (m+n+1)/2 <= (2*n+1)/2 <= n
```

所以对于情况 `<b>` 和 `<c>`， 我们不需要检查 j > 0 和 j < n 是否满足。

### python 实现

下面是完整的Python代码：

```py
def median(A, B):
    m, n = len(A), len(B)
    if m > n:
        A, B, m, n = B, A, n, m
    if n == 0:
        raise ValueError

    imin, imax, half_len = 0, m, (m + n + 1) / 2
    while imin <= imax:
        i = (imin + imax) / 2
        j = half_len - i
        if i < m and B[j-1] > A[i]:
            # i 的值太小， 增加它
            imin = i + 1
        elif i > 0 and A[i-1] > B[j]:
            # i 的值过大， 减小它
            imax = i - 1
        else:
            # i is perfect

            if i == 0: max_of_left = B[j-1]
            elif j == 0: max_of_left = A[i-1]
            else: max_of_left = max(A[i-1], B[j-1])

            if (m + n) % 2 == 1:
                return max_of_left

            if i == m: min_of_right = B[j]
            elif j == n: min_of_right = A[i]
            else: min_of_right = min(A[i], B[j])

            return (max_of_left + min_of_right) / 2.0
```

### java 实现

个人的 java 实现如下：

```java
public double findMedianLeetCode(int[] nums1, int[] nums2) {
    int m = nums1.length;
    int n = nums2.length;
    int[] A = nums1;
    int[] B = nums2;
    // 如果 A 较大，那么直接反过来处理，保证 n >= m
    if(m > n) {
        m = nums2.length;
        n = nums1.length;
        A = nums2;
        B = nums1;
    }
    // 初始化变量
    int iMin = 0;
    int iMax = m;
    int iHalf = (m + n + 1) >> 1;
    int i, j;
    int maxOfLeft, minOfRight;
    while (iMin <= iMax) {
        i = (iMin+iMax) >> 1;
        j = iHalf - i;
        if(i < m && B[j-1] > A[i]) {
            iMin++;
        } else if(i > 0 && A[i-1] > B[j]) {
            iMax--;
        } else {
            // GOT IT（主要是边缘值的处理）
            if(i == 0) {
                // A 左边为空
                maxOfLeft = B[j-1];
            } else if(j == 0) {
                // B 左边为空
                maxOfLeft = A[i-1];
            } else {
                // 左边较大的一个
                maxOfLeft = Math.max(A[i-1], B[j-1]);
            }
            // 奇数
            if((m+n) % 2 == 1) {
                return maxOfLeft;
            }
            // 偶数
            if(i == m) {
                // 最右边
                minOfRight = B[j];
            } else if(j == n) {
                minOfRight = A[i];
            } else {
                minOfRight = Math.min(B[j], A[i]);
            }
            return (minOfRight+maxOfLeft) / 2.0;
        }
    }
    return 0.0;
}
```

### 性能

这个就非常优秀了，超越了 99% 的解法。

好的算法可以大幅度提升性能。

```
Runtime: 2 ms, faster than 99.81% of Java online submissions for Median of Two Sorted Arrays.
Memory Usage: 40.2 MB, less than 91.06% of Java online submissions for Median of Two Sorted Arrays.
```

## 个人收获

如果是面试中，我们至少应该想到第一种最基本的解法。

如果你知道第二种解法，可以把整体思路简述一遍，可以大大提升面试官对于你的打分。

所有的算法答案不是用来死记硬背的，你要做的是理解其中的思想。

如果是工作中，还是建议使用第一种算法，这样比较便于维护。当然如果你们组内都是大神，对性能要求有非常高，那么可以考虑使用第二种方法。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

## 参考资料

[leetcode median-of-two-sorted-arrays](https://leetcode-cn.com/problems/median-of-two-sorted-arrays)

[LeetCode#4. 寻找两个有序数组的中位数](https://zhuanlan.zhihu.com/p/70654378)

* any list
{:toc}