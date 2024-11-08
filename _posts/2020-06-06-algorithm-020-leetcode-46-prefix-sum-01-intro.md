---
layout: post
title:  【leetcode】46-Prefix Sum 力扣前缀和介绍 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, leetcode]
published: true
---

# 前缀和专题

[【leetcode】46-Prefix Sum 力扣前缀和介绍](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-46-prefix-sum-01-intro)

[【leetcode】47-minimum-size-subarray-sum 力扣 209. 长度最小的子数组](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-47-prefix-sum-209-minimum-size-subarray-sum)

[【leetcode】48-product-of-array-except-self 力扣 238. 除自身以外的数组的乘积](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-48-prefix-sum-238-product-of-array-except-self)

[【leetcode】49-303. range-sum-query-immutable 力扣 303. 区域和检索 - 数组不可变](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-49-prefix-sum-303-range-sum-query-immutable)

[【leetcode】50-307. range-sum-query-mutable 力扣 307. 区域和检索 - 数组可变](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-50-prefix-sum-307-range-sum-query-mutable)

[【leetcode】50-树状数组 Binary Indexed Tree，简称 BIT FenwickTree](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-50-prefix-sum-tree-array)

[【leetcode】51-1124. longest-well-performing-interval 力扣 1124. 表现良好的最长时间段 前缀和+HashMap](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-51-prefix-sum-1124-longest-well-performing-interval)

[【leetcode】52-410. split-array-largest-sum 力扣 410. 分割数组的最大值](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-52-prefix-sum-410-split-array-largest-sum)

[【leetcode】53-523. continuous-subarray-sum 力扣 523. 连续的子数组和 同余定理 前缀和+HashMap](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-53-prefix-sum-523-continuous-subarray-sum)

[【leetcode】54-325. max-size-subarray-sum-equals-k 力扣 325：和等于 k 的最长子数组长度](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-54-prefix-sum-325-longest-array-sum-equal-k)

[【leetcode】53-525. continuous-subarray-sum 力扣 525. 连续的子数组和 同余定理 前缀和+HashMap](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-55-prefix-sum-525-contiguous-array)

[【leetcode】56-560. subarray-sum-equals-k 力扣 560. 和为 k 的子数组 前缀和+HashMap](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-56-prefix-sum-560-subarray-sum-equals-k)

[【leetcode】57-1371. find-the-longest-substring-containing-vowels-in-even-counts 力扣 1371. 每个元音包含偶数次的最长子字符串](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-57-prefix-sum-1371-find-the-longest-substring-containing-vowels-in-even-counts)

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# chat

## 详细介绍一下前缀和 

“前缀和”算法（Prefix Sum）是一种高效计算数组区间和的技术，它通过提前计算数组的前缀和，减少了后续的重复计算，从而加速了查询的过程。

### 1. **前缀和定义**
给定一个数组 `arr`，它的前缀和数组 `prefix_sum` 的定义为：

- `prefix_sum[i]` 表示数组 `arr` 从 `arr[0]` 到 `arr[i]` 的累加和。

具体来说：

```
prefix_sum[0] = arr[0]
prefix_sum[1] = arr[0] + arr[1]
prefix_sum[2] = arr[0] + arr[1] + arr[2]
...
prefix_sum[i] = arr[0] + arr[1] + ... + arr[i]
```

### 2. **前缀和的计算**
前缀和数组 `prefix_sum` 可以通过对原数组进行一次遍历来构建。公式如下：

```
prefix_sum[i] = prefix_sum[i-1] + arr[i]
```

其中，`prefix_sum[0] = arr[0]`。

### 3. **使用前缀和解决区间求和问题**
通过前缀和，可以快速计算任意区间 `[l, r]` 的和。假设我们有前缀和数组 `prefix_sum`，那么区间 `[l, r]` 的和可以通过以下公式计算：

```
sum(l, r) = prefix_sum[r] - prefix_sum[l-1]
```

其中，`l-1` 为区间开始前的索引。如果 `l = 0`，则不需要减去 `prefix_sum[-1]`，直接使用 `prefix_sum[r]`。

### 4. **时间复杂度分析**
- 计算前缀和数组的时间复杂度是 `O(n)`，其中 `n` 是数组的长度。
- 查询区间和的时间复杂度是 `O(1)`，因为只需要查两个前缀和值并进行相减。

## 为什么感觉前缀和和 dp 的递推公式有些类似？二者有什么关系？

前缀和和动态规划（DP）在递推公式上确实有一些相似之处，主要体现在**利用先前计算的结果来求解当前问题**这一点上。二者之间的关系和区别可以从以下几个方面进行分析：

### 1. **递推公式的相似性**

在前缀和和动态规划中，都有类似的递推关系：
- **前缀和**：通过已知的前缀和数组，快速计算区间和。例如，在一维数组的前缀和中，我们有：

```
prefix_sum[i] = prefix_sum[i-1] + arr[i]
```

- **动态规划**：通过已知的状态值，计算当前状态的值。例如，在求解背包问题的动态规划中，我们有：

```
dp[i] = max(dp[i-1], dp[i-1] + arr[i])
```


这两者都是通过利用前一个计算结果（前缀和的前一个元素，动态规划的前一个状态）来得到当前的结果。也就是说，**前缀和是一个特殊形式的动态规划**，它是动态规划的一种应用，其中问题被简化为单一递推公式。

### 2. **核心思想：分治和递推**
- **前缀和**：通过构建一个前缀和数组，把区间和问题转化为求差的问题，从而降低查询的时间复杂度。前缀和是一种“预处理”技巧，通常用于静态问题。
  
- **动态规划**：通过将问题分解成子问题，并存储子问题的解来避免重复计算。动态规划不仅适用于静态问题，还能处理动态变化的问题，例如背包问题、最短路径问题等。

### 3. **状态与状态转移**

- 在**前缀和**中，状态通常是数组的**前缀和**，状态转移是通过累加当前元素得到前缀和：

```
prefix_sum[i] = prefix_sum[i-1] + arr[i]
```
  
- 在**动态规划**中，状态是**当前问题的解**，状态转移是基于问题的递推公式。

例如，在背包问题中，当前状态依赖于选择和不选择某个物品的状态：

```
dp[i] = max(dp[i-1], dp[i-1] + arr[i])
```

### 4. **适用场景的差异**

- **前缀和**：主要用于**静态问题**，例如区间求和、子数组计数等。它通过一次性的预处理，优化了多次查询的效率，适合于固定的数组，查询不会涉及元素的增删操作。
  
- **动态规划**：适用于**动态变化的问题**，例如路径规划、背包问题、最优化问题等。动态规划关注的是通过逐步递推得到最终的解，尤其适用于有**重叠子问题**和**最优子结构**的问题。

### 5. **空间复杂度**

- **前缀和**：前缀和数组的空间复杂度通常是 O(n)，是一个附加的数组，用来存储所有的前缀和。
  
- **动态规划**：动态规划的空间复杂度可能是 O(n)，也可能是更复杂的空间结构，取决于问题的性质。对于一些问题，动态规划甚至可以使用滚动数组等优化空间复杂度。

### 6. **计算顺序**

- **前缀和**：通常在计算前缀和时，只需要一次遍历数组。这个过程是单向的，从左到右累加。

- **动态规划**：动态规划的计算顺序可以是多种多样的，具体取决于问题的递推关系。例如，有些问题需要反向计算，有些则需要从多个方向计算（如二维动态规划）。

### 7. **举个例子：**

- **前缀和的例子**：假设你要计算一个数组的多个区间和问题，前缀和会先将所有前缀的和计算好，之后每次查询只需要常数时间 `O(1)`。
  
- **动态规划的例子**：假设你要计算背包问题的最大价值，动态规划会通过逐步构造解的方式来避免重复计算，通常递推公式是基于选择和不选择物品的不同状态转移。

---

### 总结：前缀和和动态规划的关系
1. **相似性**：前缀和和动态规划的递推公式类似，都是利用已经计算好的结果来计算当前的结果，减少了重复计算。
2. **区别**：前缀和通常处理的是静态问题，主要用于加速多次查询，而动态规划则适用于动态、递推型的最优化问题，能处理更复杂的场景。
3. **前缀和是动态规划的一种特殊应用**，但动态规划的应用范围更加广泛，解决的也往往是更复杂、更动态的问题。

两者的核心思想都可以归结为“**状态依赖于前一个状态**”，但前缀和是面向特定类型问题的优化技巧，而动态规划是一个通用的求解框架。

## 前缀和有什么应用场景？

前缀和算法广泛应用于多个场景，尤其是在处理区间和、子数组求和等问题时，它能够显著提高算法的效率。

下面列出一些常见的应用场景：

### 1. **区间求和**
最直接的应用就是**区间求和**问题。在给定一个数组时，我们可以使用前缀和来快速计算任意区间的和。

例如，对于区间 `[l, r]`，我们可以通过 `prefix_sum[r] - prefix_sum[l-1]` 来快速得到结果。

#### 示例：
```python
arr = [1, 2, 3, 4, 5]
prefix_sum = compute_prefix_sum(arr)  # [1, 3, 6, 10, 15]
print(range_sum(prefix_sum, 1, 3))  # 输出 9，即 2 + 3 + 4
```
这种方式对于频繁查询区间和的问题尤其有用。

### 2. **子数组和的最大/最小值**
在某些情况下，我们可能需要求一个数组中所有子数组的最大和或最小和。前缀和可以简化这一过程，通过计算前缀和来减少冗余计算。

#### 应用：
- **最大和子数组问题（Kadane算法）**：通过前缀和的思想可以帮助更高效地求解最大和子数组问题。
- **最小和子数组问题**：类似地，前缀和可以帮助找出最小和的子数组。

### 3. **一维和二维问题**
前缀和不仅适用于一维数组，也可以推广到**二维数组**。二维前缀和可以用来快速查询一个矩形区域的和。对于二维数组 `arr[i][j]`，定义二维前缀和 `prefix_sum[i][j]` 为从 `arr[0][0]` 到 `arr[i][j]` 的元素和。

#### 示例：
在一个二维数组中，可以使用前缀和来快速计算任意子矩阵的和。

```python
# 计算二维前缀和
def compute_2d_prefix_sum(matrix):
    m, n = len(matrix), len(matrix[0])
    prefix_sum = [[0] * (n+1) for _ in range(m+1)]
    
    for i in range(1, m+1):
        for j in range(1, n+1):
            prefix_sum[i][j] = matrix[i-1][j-1] + prefix_sum[i-1][j] + prefix_sum[i][j-1] - prefix_sum[i-1][j-1]
    
    return prefix_sum

# 查询矩形区域的和
def range_sum_2d(prefix_sum, x1, y1, x2, y2):
    return prefix_sum[x2+1][y2+1] - prefix_sum[x2+1][y1] - prefix_sum[x1][y2+1] + prefix_sum[x1][y1]

# 示例
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

prefix_sum_2d = compute_2d_prefix_sum(matrix)
print(range_sum_2d(prefix_sum_2d, 0, 0, 1, 1))  # 输出 12，即子矩阵 [[1, 2], [4, 5]]
```

### 4. **数据流问题**
对于动态数据流，前缀和可以帮助**实时更新区间和**，避免每次查询时都从头开始计算。例如，在处理一个动态数组时，可以先维护一个前缀和数组，并在每次更新时调整前缀和数组的值。

### 5. **逆序对计数**
前缀和在解决某些与**逆序对**（inversion pairs）相关的问题时也能提供帮助。在某些变种问题中，可以通过前缀和来加速计数过程。

#### 示例：统计逆序对
例如，给定一个数组，求数组中有多少个逆序对，前缀和可以用来加速这个过程。

### 6. **频率统计和查询**
前缀和可用于**频率统计问题**，比如统计某个元素出现的次数范围，或者在一定区间内，某些条件（如值大于某个数）的元素数量。使用前缀和，能够减少重复统计的计算量。

#### 应用场景：
- **区间中大于某个数的元素数量**。
- **区间中满足某条件的元素的频率**。

### 7. **求解动态更新的区间最大值/最小值**
在一些算法中，我们不仅要计算区间和，还需要动态更新区间中的元素或最大/最小值。前缀和可以和其他数据结构（如**线段树**、**树状数组**）结合，帮助我们高效处理这些动态查询和更新。

### 8. **子序列计数**
在某些问题中，前缀和可用于计算满足某条件的子序列个数。例如，给定一个数组，求数组中和为某个特定值的子序列的数量。通过前缀和的方式可以加速求解过程。

#### 示例：
在**目标和**问题中，前缀和可以帮助优化从数组中选取某些元素使得其和等于目标值的方式。

### 9. **线性时间内解决部分问题**
很多问题涉及对数组、矩阵等结构进行**多次查询**，如计算元素和、统计特定条件的元素等，使用前缀和可以将查询的时间复杂度从 O(n) 降低到 O(1)。

---

### 总结
前缀和算法的主要优点在于：
- 可以将区间查询（如区间和）从线性时间 O(n) 优化到常数时间 O(1)。
- 在处理静态数据结构时，能够显著提高查询效率，尤其适合多次查询相同数据时使用。

前缀和最常见的应用场景包括：区间和查询、子数组求和问题、二维数组求和、动态数据流处理等。它是一种非常重要且基础的算法技巧，常用于处理频繁查询的数据结构。

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}