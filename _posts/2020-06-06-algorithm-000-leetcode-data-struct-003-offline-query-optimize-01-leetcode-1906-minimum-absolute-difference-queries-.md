---
layout: post
title: leetcode 离线查询优化-01-力扣.1906 查询绝对值差的最小值 7种解法 leetcode.1906 minimum-absolute-difference-queries
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, offline-query-optimize, sf]
published: true
---


# 题目

一个数组 a 的 差绝对值的最小值 定义为：0 <= i < j < a.length 且 a[i] != a[j] 的 |a[i] - a[j]| 的 最小值。

如果 a 中所有元素都 相同 ，那么差绝对值的最小值为 -1 。

比方说，数组 [5,2,3,7,2] 差绝对值的最小值是 |2 - 3| = 1 。注意答案不为 0 ，因为 a[i] 和 a[j] 必须不相等。

给你一个整数数组 nums 和查询数组 queries ，其中 queries[i] = [li, ri] 。对于每个查询 i ，计算 子数组 nums[li...ri] 中 差绝对值的最小值 ，子数组 nums[li...ri] 包含 nums 数组（下标从 0 开始）中下标在 li 和 ri 之间的所有元素（包含 li 和 ri 在内）。

请你返回 ans 数组，其中 ans[i] 是第 i 个查询的答案。

子数组 是一个数组中连续的一段元素。

|x| 的值定义为：

如果 x >= 0 ，那么值为 x 。
如果 x < 0 ，那么值为 -x 。
 

示例 1：

```
输入：nums = [1,3,4,8], queries = [[0,1],[1,2],[2,3],[0,3]]
输出：[2,1,4,1]
解释：查询结果如下：
- queries[0] = [0,1]：子数组是 [1,3] ，差绝对值的最小值为 |1-3| = 2 。
- queries[1] = [1,2]：子数组是 [3,4] ，差绝对值的最小值为 |3-4| = 1 。
- queries[2] = [2,3]：子数组是 [4,8] ，差绝对值的最小值为 |4-8| = 4 。
- queries[3] = [0,3]：子数组是 [1,3,4,8] ，差的绝对值的最小值为 |3-4| = 1 。
```

示例 2：

```
输入：nums = [4,5,2,2,7,10], queries = [[2,3],[0,2],[0,5],[3,5]]
输出：[-1,1,1,3]
解释：查询结果如下：
- queries[0] = [2,3]：子数组是 [2,2] ，差绝对值的最小值为 -1 ，因为所有元素相等。
- queries[1] = [0,2]：子数组是 [4,5,2] ，差绝对值的最小值为 |4-5| = 1 。
- queries[2] = [0,5]：子数组是 [4,5,2,2,7,10] ，差绝对值的最小值为 |4-5| = 1 。
- queries[3] = [3,5]：子数组是 [2,7,10] ，差绝对值的最小值为 |7-10| = 3 。
``` 

提示：

- 2 <= nums.length <= 10^5

- 1 <= nums[i] <= 100

- 1 <= queries.length <= 2 * 10^4

- 0 <= li < ri < nums.length

# v1-暴力

## 思路

我们直接采用暴力算法，按照题目要求解答。

## 实现

```java
public int[] minDifference(int[] nums, int[][] queries) {
    final int len = queries.length;
    int[] res = new int[len];
    for(int i = 0; i < len; i++) {
        int[] query = queries[i];
        res[i] = getMinAbs(nums, query);
    }
    return res;
}

private int getMinAbs(final int[] num, final int[] query) {
    // 计算范围内任意两个数的最小值
    int minAbs = Integer.MAX_VALUE;
    int startIx = query[0];
    int endIx = query[1];
    for(int i = startIx; i <= endIx-1; i++) {
        for(int j = i+1; j <= endIx; j++) {
            // 如果相等
            if(num[i] == num[j]) {
                continue;
            }
            int abs = Math.abs(num[i] - num[j]);
            minAbs = Math.min(abs, minAbs);
        }
    }
    if(minAbs != Integer.MAX_VALUE) {
        return minAbs;
    }
    return -1;
}
```

## 效果

超出时间限制

45 / 60 个通过的测试用例


# v2-子数组排序

## 优化思路

我们对查询范围内的子数组进行排序。

这样我们只需要比较相邻的数就行，性能会好一些。

## 实现

```java
class Solution {

    public int[] minDifference(int[] nums, int[][] queries) {
        final int len = queries.length;
        int[] res = new int[len];
        for(int i = 0; i < len; i++) {
            int[] query = queries[i];
            res[i] = getMinAbs(nums, query);
        }
        return res;
    }

    private int getMinAbs(final int[] num, final int[] query) {
        // 计算范围内任意两个数的最小值
        int minAbs = Integer.MAX_VALUE;

        int startIx = query[0];
        int endIx = query[1];

        // 子数组排序
        // 获取子数组 nums[l...r]
        int[] subArray = Arrays.copyOfRange(num, startIx, endIx + 1);

        // 对子数组进行排序
        Arrays.sort(subArray);

        boolean allEqual = true;
        for (int j = 1; j < subArray.length; j++) {
            // 如果有不同的元素，更新最小差值
            if (subArray[j] != subArray[j - 1]) {
                allEqual = false;
                minAbs = Math.min(minAbs, Math.abs(subArray[j] - subArray[j - 1]));
            }
        }

        if(allEqual) {
            return -1;
        }

        return minAbs;
    }

}
```

## 效果

超出时间限制

50 / 60 个通过的测试用例

## 小结

好一点，但是依然不够。

# v3-二分法

## 思路

1、先从小到大记录数字i（1<=i<=100) 出现在nums中的所有位置（实际处理时可只处理出现过的数字）；

2、逐一处理每一个查询区间[L, R]：

a、判定数字i（1<=i<=100) 是否出现在此区间，在数字i所有位置中，二分查找L，得到最小位置j（满足>=L），如果j<=R，则说明数字i在区间[L, R]里出现过；

b、对于所有出现在区间[L, R]的数字，枚举从小到大相邻两个的差绝对值，找出最小的；

## 实现

```java
    public int[] minDifference(int[] nums, int[][] queries) {
        // 记录数字 i (1 <= i <= 100) 出现在 nums 中的所有位置
        Map<Integer, List<Integer>> idx = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            // 使用 getOrDefault 处理索引列表
            List<Integer> positions = idx.getOrDefault(nums[i], new ArrayList<>());
            positions.add(i);
            idx.put(nums[i], positions); // 更新 Map
        }

        // 获取已出现过的数字并排序
        List<Integer> keys = new ArrayList<>(idx.keySet());
        Collections.sort(keys);

        int[] res = new int[queries.length];

        // 遍历每个查询
        for (int q = 0; q < queries.length; q++) {
            int l = queries[q][0];
            int r = queries[q][1];
            int minDiff = Integer.MAX_VALUE;
            int pre = 0;

            // 遍历已出现的数字
            for (int i : keys) {
                List<Integer> positions = idx.get(i);

                // 判断数字 i 是否出现在 [l, r] 区间
                // 满足条件的 pos >= L
                int pos = lowerBound(positions, l);
                if (pos < positions.size() && positions.get(pos) <= r) {
                    // 如果存在相邻的两个不同数字，更新最小绝对差
                    if (pre > 0) {
                        minDiff = Math.min(minDiff, i - pre);
                    }
                    pre = i;
                }
            }

            // 如果 minDiff 未被更新，说明区间内只有一种数字
            res[q] = (minDiff == Integer.MAX_VALUE) ? -1 : minDiff;
        }

        return res;
    }

    // 二分查找：找到第一个大于等于 target 的位置
    private int lowerBound(List<Integer> list, int target) {
        int left = 0, right = list.size();
        while (left < right) {
            int mid = (left + right) / 2;
            if (list.get(mid) < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }
```

## 效果

677ms 击败 66.67%

## 小结

这种解法还是比较不错的，至少比很多答案的前缀和容易想到才对。

# v4-前缀和

## 思路

如果我们对 nums 数组排序，对结果将如何产生提升？

如果我们对查询的 queries 做离线优化，将产生什么改进？

## Tips

我们看一下提示：

- How does the maximum value being 100 help us?

- How can we tell if a number exists in a given range?

数组最多只有 100 个对我们有什么用？

我们如何判断一个数是否在给定的范围中？

## 前缀和思路

这一题的的提示引导主要是前缀和。

设一个前缀和数组pre，数组中是大小为101的数组，pre[i]存储截止i元素的所有值的计数。

1. 首先遍历一次nums，统计pre

2. 然后遍历queries，对于每个查询，通过对前缀和数组进行算术运算得到该子数组内所有元素的计数，遍历不为0的元素的间隔，返回最小的那个即可

### 复杂度

时间复杂度：O(100n+100m),n为nums.length，m为queries.length

空间复杂度：O(100n)

## 实现拆分

### 前缀和数组如何构建？

我们在查询 query[l, r] 时，如果可以快速判断一个数 num 是否在这个范围内该多好啊？

要实现这一点，可以利用前缀和的思维，记录一个 [0,,,i] 内的全部对应整数 num 的次数，然后两个区间相减大于0，就说明存在这个数。 

核心实现

```java
final int n = nums.length;

// 初始化个数前缀和数组 1 <= nums[i] <= 100
int[][] prefixSum = new int[n+1][101];
for(int i = 0; i < n; i++) {
    for (int j = 1; j <= 100; j++) {
        prefixSum[i + 1][j] = prefixSum[i][j]; // 复制上一行的状态
    }
    prefixSum[i + 1][nums[i]]++; // 更新当前元素的计数
}
```

### 如何比较？

```java
// 直接遍历 100 个数字在 [left, right] 出现的次数
for(int i = 1; i <= 100; i++) {
    // 使用前缀和判断：count[r + 1][j] - count[l][j] 表示 j 在 [l, r] 区间中的出现次数
    if (prefixSum[right + 1][i] - prefixSum[left][i] > 0) {
        // 如果 pre 已有记录，则更新最小差值。相邻的数肯定是最小的，且这里是有序地，当前数大于以前的数
        if (pre != 0) {
            minDiff = Math.min(minDiff, i - pre);
        }
        pre = i;
    }
}
```

## 实现

完整实现如下

```java
class Solution {

    public int[] minDifference(int[] nums, int[][] queries) {
        final int n = nums.length;

        // 初始化个数前缀和数组 1 <= nums[i] <= 100
        int[][] prefixSum = new int[n+1][101];
        for(int i = 0; i < n; i++) {
            for (int j = 1; j <= 100; j++) {
                prefixSum[i + 1][j] = prefixSum[i][j]; // 复制上一行的状态
            }

            prefixSum[i + 1][nums[i]]++; // 更新当前元素的计数
        }

        // 循环所有的 query
        int[] res = new int[queries.length];
        for(int qx = 0; qx < queries.length; qx++) {
            int left = queries[qx][0];
            int right = queries[qx][1];

            int minDiff = Integer.MAX_VALUE;    // 最大值
            int pre = 0;    // 上一次出现
            // 直接遍历 100 个数字在 [left, right] 出现的次数
            for(int i = 1; i <= 100; i++) {
                // 使用前缀和判断：count[r + 1][j] - count[l][j] 表示 j 在 [l, r] 区间中的出现次数
                if (prefixSum[right + 1][i] - prefixSum[left][i] > 0) {
                    // 如果 pre 已有记录，则更新最小差值。相邻的数肯定是最小的，且这里是有序地，当前数大于以前的数
                    if (pre != 0) {
                        minDiff = Math.min(minDiff, i - pre);
                    }

                    // 更新 pre 为当前值
                    pre = i;
                }
            }

            res[qx] = minDiff == Integer.MAX_VALUE ? -1 : minDiff;
        }

        return res;
    }


}
```

## 效果

81ms 击败 66.67%

## 小结

这个前缀和实在有些巧妙，我们以前都是一维的，这个是多维度的。

# v5-树状数组 Binary Indexed Tree, BIT

## 思路

给定一个数组 `nums` 和多个查询 `[l, r]`，每个查询要求找出区间 `[l, r]` 中差绝对值的最小值。

整体而言，我们的优化是围绕着这个目标进行的。

我们只要用一个方法，**可以计算出 range(l, r) 内对应的 num 是否存在即可**。

所以二分可行，上面的个数前缀和可行，那么下面的树状数组自然也可以。

## 树状数组解法

我们将树状数组应用于统计各个数字的出现次数，然后根据这些信息来找到差绝对值的最小值。

具体步骤如下：

1. **树状数组设计**：维护一个树状数组来记录各个数字的频次，区间查询时可以快速地获取某个数字在某个区间内的出现次数。

2. **初始化树状数组**：在初始化阶段，我们预处理一下数组 `nums`，构建出频次数组。

3. **查询处理**：对于每个查询，我们可以利用树状数组快速地查询出区间内各个数字的出现情况，从而找出最小的差值。

## 实现拆分

### 频次初始化

BIT 数组的初始化，记录每一个数出现的次数。

```java
// 更新树状数组，记录 nums 中每个元素的频次
for (int i = 0; i < n; i++) {
    fenwickTrees[nums[i]].update(i + 1, 1); // 将元素 nums[i] 计入树状数组
}
```

到这里你可以发现，我们只是在构建一种数据结构，方便查询 [l, r] 范围内，是否存在对应的 num 数字而已。

所以，二分可以+个数前缀和可以+BIT 也可以。莫斯算法比较特别，通过排序后的减少移动而提升性能。

如果我们理解了这种思想，我们过会儿实现一个基于 HashMap 性能比较差的方式。

### 循环处理

剩下的逻辑都是一样的了，直接根据 queryRange 方法找到是否存在。

```java
// 处理每个查询
int[] res = new int[queries.length];
for (int i = 0; i < queries.length; i++) {
    int left = queries[i][0] + 1;
    int right = queries[i][1] + 1;
    int minDiff = Integer.MAX_VALUE;    // 最小差值初始化为一个很大的数
    int pre = -1;    // 上一个出现的元素
    // 遍历 1 到 100 的所有数字，检查在区间 [left, right] 内的出现情况
    for (int j = 1; j <= maxVal; j++) {
        if (fenwickTrees[j].queryRange(left, right) > 0) {
            // 计算差值
            if (pre != -1) {
                minDiff = Math.min(minDiff, j - pre);
            }
            pre = j;
        }
    }

    // 如果 minDiff 没有更新，说明区间内没有不同的元素
    res[i] = (minDiff == Integer.MAX_VALUE) ? -1 : minDiff;
}
```

## 代码实现：

```java
public class Solution {

    // 树状数组实现
    static class FenwickTree {
        int[] bit;
        int n;

        public FenwickTree(int size) {
            this.n = size;
            this.bit = new int[size + 1];
        }

        // 更新树状数组
        public void update(int index, int delta) {
            while (index <= n) {
                bit[index] += delta;
                index += index & -index; // 更新父节点
            }
        }

        // 查询前缀和
        public int query(int index) {
            int sum = 0;
            while (index > 0) {
                sum += bit[index];
                index -= index & -index; // 查询父节点
            }
            return sum;
        }

        // 查询区间 [left, right] 的和
        public int queryRange(int left, int right) {
            return query(right) - query(left - 1);
        }
    }

    public int[] minDifference(int[] nums, int[][] queries) {
        final int n = nums.length;
        int maxVal = 100; // nums 中的值范围为 1 到 100

        // 初始化树状数组
        FenwickTree[] fenwickTrees = new FenwickTree[maxVal + 1];
        for (int i = 1; i <= maxVal; i++) {
            fenwickTrees[i] = new FenwickTree(n);
        }
        // 更新树状数组，记录 nums 中每个元素的频次
        for (int i = 0; i < n; i++) {
            fenwickTrees[nums[i]].update(i + 1, 1); // 将元素 nums[i] 计入树状数组
        }

        // 处理每个查询
        int[] res = new int[queries.length];
        for (int i = 0; i < queries.length; i++) {
            int left = queries[i][0] + 1;
            int right = queries[i][1] + 1;

            int minDiff = Integer.MAX_VALUE;    // 最小差值初始化为一个很大的数
            int pre = -1;    // 上一个出现的元素
            // 遍历 1 到 100 的所有数字，检查在区间 [left, right] 内的出现情况
            for (int j = 1; j <= maxVal; j++) {
                if (fenwickTrees[j].queryRange(left, right) > 0) {
                    // 计算差值
                    if (pre != -1) {
                        minDiff = Math.min(minDiff, j - pre);
                    }
                    pre = j;
                }
            }

            // 如果 minDiff 没有更新，说明区间内没有不同的元素
            res[i] = (minDiff == Integer.MAX_VALUE) ? -1 : minDiff;
        }

        return res;
    }
}
```


## 效果

293ms 66.67%

### 复杂度

时间复杂度：

- **更新操作**：每次更新树状数组的时间复杂度是 `O(log n)`，共进行 `n` 次更新，因此总的时间复杂度是 `O(n log n)`。

- **查询操作**：每次查询操作中，我们需要遍历 100 个数字，检查每个数字在区间内的频次，这需要 `O(100 log n)` 的时间，因此每个查询的时间复杂度是 `O(100 log n)`，所有查询的总时间复杂度是 `O(m * log n)`，其中 `m` 是查询的数量。

- 总时间复杂度为：`O(n log n + m * log n)`，其中 `n` 是数组长度，`m` 是查询的数量。

- 空间复杂度为：`O(n * maxVal)`，其中 `maxVal` 是 `nums` 中数字的最大值范围，在这里是 100。

这就是利用树状数组来解决差绝对值最小值查询问题的实现。

# v6-线段树

## 思路

1. **使用线段树存储数字的出现情况**：我们需要一个线段树来维护每个区间内各个数字出现的频次。对于每个区间节点，维护一个大小为 `101` 的数组，记录该区间内每个数字的出现次数。

2. **区间查询**：对于每个查询 `[l, r]`，我们可以通过线段树查询区间内每个数字的出现次数。然后，我们根据这些频次计算最小的绝对差。

3. **更新操作**：由于题目没有明确要求支持动态更新，如果是静态查询，则更新操作可以忽略。如果需要动态更新，可以将线段树的构建和更新相结合，支持在线更新区间值。

## 代码实现

```java
class SegmentTree {
    // 定义线段树，树的每个节点存储一个大小为 101 的数组，记录该区间内每个数字的出现次数
    private int[][] tree;
    private int n;
    
    public SegmentTree(int n) {
        this.n = n;
        tree = new int[4 * n][101]; // 线段树大小为 4 * n
    }

    // 构建线段树
    public void build(int[] nums, int node, int start, int end) {
        if (start == end) {
            // 如果是叶子节点，将 nums[start] 对应的数字出现次数设为 1
            tree[node][nums[start]] = 1;
        } else {
            int mid = (start + end) / 2;
            int leftNode = 2 * node + 1;
            int rightNode = 2 * node + 2;
            build(nums, leftNode, start, mid);
            build(nums, rightNode, mid + 1, end);
            // 合并左右子树的信息
            for (int i = 1; i <= 100; i++) {
                tree[node][i] = tree[leftNode][i] + tree[rightNode][i];
            }
        }
    }

    // 查询区间 [l, r] 的信息
    public int[] query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) {
            return new int[101]; // 区间完全不在查询范围内，返回一个全 0 的数组
        }
        if (l <= start && end <= r) {
            return tree[node]; // 完全包含在查询范围内，直接返回该区间的出现情况
        }
        int mid = (start + end) / 2;
        int leftNode = 2 * node + 1;
        int rightNode = 2 * node + 2;
        int[] leftResult = query(leftNode, start, mid, l, r);
        int[] rightResult = query(rightNode, mid + 1, end, l, r);
        int[] result = new int[101];
        for (int i = 1; i <= 100; i++) {
            result[i] = leftResult[i] + rightResult[i];
        }
        return result;
    }
}

public class Solution {
    public int[] minDifference(int[] nums, int[][] queries) {
        int n = nums.length;
        int m = queries.length;
        int[] res = new int[m];

        // 构建线段树
        SegmentTree segmentTree = new SegmentTree(n);
        segmentTree.build(nums, 0, 0, n - 1);

        // 处理查询
        for (int q = 0; q < m; q++) {
            int left = queries[q][0];
            int right = queries[q][1];
            int[] freq = segmentTree.query(0, 0, n - 1, left, right);

            // 计算最小绝对差
            int minDiff = Integer.MAX_VALUE;
            int prev = -1;
            for (int i = 1; i <= 100; i++) {
                if (freq[i] > 0) {
                    if (prev != -1) {
                        minDiff = Math.min(minDiff, i - prev);
                    }
                    prev = i;
                }
            }

            // 如果 minDiff 没有更新，说明区间内所有元素相同
            res[q] = minDiff == Integer.MAX_VALUE ? -1 : minDiff;
        }

        return res;
    }
}
```

## 效果

582ms 击败66.67%

### 时间复杂度

- **构建线段树**：`O(n * log n)`，每个节点的构建需要合并左右子树的结果，树的深度为 `log n`，每个节点维护 101 个数字的频次。

- **查询操作**：`O(log n + k)`，其中 `log n` 是线段树的高度，`k` 是查询区间内的数字个数。在最坏情况下，`k` 可能为 100。

- **总体时间复杂度**：`O(n * log n + m * (log n + k))`，其中 `n` 是数组的长度，`m` 是查询的数量。

# v7-莫斯算法

## 思路

我们前面的方法，都是针对 nums 的各种优化技巧，接下来让我们把视角转移到针对 query 数组的优化——离线优化。

下面的方法性能不见得更好，但是适用性更广泛一些。

## 莫斯算法

使用莫队算法（Mo's Algorithm）可以高效地处理这种区间查询问题，尤其在需要对多个区间进行复杂计算时。

莫队算法的核心思想是**通过对查询重新排序，减少区间扩展和缩减的代价**。

以下是实现步骤和代码示例。

### 莫队算法实现步骤

1）排序查询：

按照查询的左端点块号排序，当块号相同时按照右端点排序。

块大小通常取 `blockSize=sqrt(n)`, 这里的 n 是指输入的 nums 数组，而不是查询数组。

作用：

a. 优化移动次数：

b. 平衡分块和滑动

2) 滑动窗口维护区间状态：

使用两个指针 currentL 和 currentR 表示当前维护的区间，通过移动指针动态维护区间。

3) 增删元素更新状态：

定义 add(x) 和 remove(x) 函数，用于向区间添加或移除一个元素时，更新状态。

4) 处理查询：

按照排序后的顺序依次处理查询，记录结果。

5) 返回结果：

按查询的原顺序返回答案。

## 实现

```java
import java.util.*;

public class Solution {
    static class Query implements Comparable<Query> {
        int left, right, index, queryBlockSize;

        Query(int left, int right, int index, int queryBlockSize) {
            this.left = left;
            this.right = right;
            this.index = index;
            this.queryBlockSize = queryBlockSize;
        }

        @Override
        public int compareTo(Query other) {
            int blockSize = queryBlockSize; // 块大小，sqrt(n) 的近似值
            int blockA = this.left / blockSize;
            int blockB = other.left / blockSize;
            if (blockA != blockB) {
                return blockA - blockB;
            }
            return (blockA % 2 == 0) ? this.right - other.right : other.right - this.right;
        }
    }

    public int[] minDifference(int[] nums, int[][] queries) {
        int n = nums.length;
        int q = queries.length;

        // 构造 Query 对象
        Query[] queryList = new Query[q];
        final int querySize = (int) Math.sqrt(n);
        for (int i = 0; i < q; i++) {
            queryList[i] = new Query(queries[i][0], queries[i][1], i, querySize);
        }

        // 排序查询
        Arrays.sort(queryList);

        // 结果数组
        int[] result = new int[q];

        // 滑动窗口的状态
        int[] freq = new int[101]; // 记录每个数出现的频率
        TreeSet<Integer> activeNumbers = new TreeSet<>(); // 有序集合记录当前区间中出现的数

        int currentL = 0, currentR = -1;

        // 处理每个查询
        for (Query query : queryList) {
            int L = query.left, R = query.right;

            // 扩展或缩小左边界
            while (currentL < L) {
                int num = nums[currentL];
                freq[num]--;
                if (freq[num] == 0) {
                    activeNumbers.remove(num);
                }
                currentL++;
            }
            while (currentL > L) {
                currentL--;
                int num = nums[currentL];
                freq[num]++;
                if (freq[num] == 1) {
                    activeNumbers.add(num);
                }
            }

            // 扩展或缩小右边界
            while (currentR < R) {
                currentR++;
                int num = nums[currentR];
                freq[num]++;
                if (freq[num] == 1) {
                    activeNumbers.add(num);
                }
            }
            while (currentR > R) {
                int num = nums[currentR];
                freq[num]--;
                if (freq[num] == 0) {
                    activeNumbers.remove(num);
                }
                currentR--;
            }

            // 计算结果：最小差绝对值
            if (activeNumbers.size() <= 1) {
                result[query.index] = -1; // 如果只有一个元素或没有元素，返回 -1
            } else {
                int minDiff = Integer.MAX_VALUE;
                Integer prev = null;
                for (int num : activeNumbers) {
                    if (prev != null) {
                        minDiff = Math.min(minDiff, num - prev);
                    }
                    prev = num;
                }
                result[query.index] = minDiff;
            }
        }

        return result;
    }
}
```

## 效果

159ms 击败 66.67%

## 小结

莫斯算法是一种适用性特别广的方式，不用特别高的技巧，也可以实现比较不错的效果。

# 参考资料

https://leetcode.cn/problems/minimum-absolute-difference-queries/solutions/1823281/by-wanglongjiang-h2by/

https://leetcode.cn/problems/minimum-absolute-difference-queries/solutions/837208/er-fen-wei-zhi-qu-jian-shun-xu-cha-xun-1-3zhp/

* any list
{:toc}