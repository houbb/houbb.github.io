---
layout: post
title: leetcode 31+46+60 Next Permutation/Permutations/Permutation Sequence  backtrack
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, backtrack, sh]
published: true
---

# 31. Next Permutation

## 题目

```
A permutation of an array of integers is an arrangement of its members into a sequence or linear order.

For example, for arr = [1,2,3], the following are all the permutations of arr: [1,2,3], [1,3,2], [2, 1, 3], [2, 3, 1], [3,1,2], [3,2,1].
The next permutation of an array of integers is the next lexicographically greater permutation of its integer. More formally, if all the permutations of the array are sorted in one container according to their lexicographical order, then the next permutation of that array is the permutation that follows it in the sorted container. If such arrangement is not possible, the array must be rearranged as the lowest possible order (i.e., sorted in ascending order).

For example, the next permutation of arr = [1,2,3] is [1,3,2].

Similarly, the next permutation of arr = [2,3,1] is [3,1,2].

While the next permutation of arr = [3,2,1] is [1,2,3] because [3,2,1] does not have a lexicographical larger rearrangement.

Given an array of integers nums, find the next permutation of nums.

The replacement must be in place and use only constant extra memory.
```

整数数组的排列是将其成员排列成序列或线性顺序。

例如arr = [1,2,3]，下面是arr的所有排列：[1,2,3], [1,3,2], [2, 1, 3], [2, 3, 1], [3,1,2], [3,2,1]。

整数数组的下一个排列是其整数的下一个字典顺序更大的排列。 

更正式地说，如果数组的所有排列都根据其字典顺序在一个容器中排序，则该数组的下一个排列是排序容器中它后面的排列。 

如果这样的排列是不可能的，则数组必须重新排列为尽可能低的顺序（即按升序排序）。

例如，arr = [1,2,3] 的下一个排列是 [1,3,2]。

同样，arr = [2,3,1] 的下一个排列是 [3,1,2]。

而 arr = [3,2,1] 的下一个排列是 [1,2,3] 因为 [3,2,1] 没有字典序更大的重排。

给定一个整数数组 nums，找到 nums 的下一个排列。

替换必须到位并且只使用常量的额外内存。

### EX

Example 1:

```
Input: nums = [1,2,3]
Output: [1,3,2]
```

Example 2:

```
Input: nums = [3,2,1]
Output: [1,2,3]
```

Example 3:

```
Input: nums = [1,1,5]
Output: [1,5,1]
```

### Constraints:

1 <= nums.length <= 100

0 <= nums[i] <= 100

## 思路

这个题目其实不难。

## 暴力算法

这一题初看是各种排列组合，比如数字 {1, 2, 3}

你可能需要考虑从 1 开始 1 + {2, 3} 的各种排列; 然后是 2 + {1, 3}；最后是 3 + {1, 2}。

一种最粗暴的方法是按照题目的规则，先把所有的排列列出来，然后依次寻找。

## 比较的方式

但是实际上不需要这么麻烦。

1. 如何判断有木有下一个呢？只要存在a[i-1] < a[i]的升序结构，就有，而且我们应该从右往左找

2. 当发现a[i-1] < a[i]的结构时，从在[i, ∞]中找到最接近a[i-1]并且又大于a[i-1]的数字，由于降序，从右往左遍历即可得到k

3. 然后交换a[i-1]与a[k]，然后对[i, ∞]排序即可，排序只需要首尾不停交换即可，因为已经是降序 

### 例子

比如 {1, 3, 2} 下一个排列是什么呢？

1) 如何判断有木有下一个呢？

我们从右往左寻找。

在 `1 < 3` 比较时，中断。此时 i = 1，对应元素 3。

```java
int i = 0;
for(i = len-1; i > 0; i--) {
    // 小于
    if(nums[i-1] < nums[i]) {
        // 记录索引
        break;
    }
}
```

2）当发现 `a[i-1] < a[i]` 的结构时，从在[i, ∞]中找到最接近a[i-1]并且又大于a[i-1]的数字，由于降序，从右往左遍历即可得到k

然后交换a[i-1]与a[k]

```java
//132  从右向左边，找到第一个小于等于 index 的数 && > index-1
//从 index=>len 找到大于 n
// 存在
if(i > 0) {
    int preVal = nums[i-1];     // 1
    int indexVal = nums[i];     // 3
    int k;
    for(k = len-1; k > i; k--) {
        // 
        if(nums[k] > preVal && nums[k] <= indexVal) {
            // 跳出循环
            break;
        }
    }
    // 交换 k 和 i-1
    swap(nums, k, i-1);
}
```

{1 3 2}, 此时 i = 1

从右往左遍历，在 nums[k] 比 preVal 1 大，且小于等于 nums[i] = 3。

此时的 k = 2, 交换位置 nums[2] 和 nums[i-1]。得到：{2, 3, 1}。

3) 然后对[i, ∞]排序即可，排序只需要首尾不停交换即可，因为已经是降序 

```java
// 将 i => len-1 执行排序
reverse(nums, i, nums.length-1);
```

## java 实现

```java
    public void nextPermutation(int[] nums) {
        //fast-return
        int len = nums.length;
        if(len == 1) {
            return;
        }

        // 132 倒叙查看
        int i = 0;
        for(i = len-1; i > 0; i--) {
            // 小于
            if(nums[i-1] < nums[i]) {
                // 记录索引
                break;
            }
        }

        //132  从右向左边，找到第一个小于等于 index 的数 && > index-1
        //从 index=>len 找到大于 n
        // 存在
        if(i > 0) {
            int preVal = nums[i-1];
            int indexVal = nums[i];
            int k;
            for(k = len-1; k > i; k--) {
                if(nums[k] > preVal && nums[k] <= indexVal) {
                    // 跳出循环
                    break;
                }
            }
            // 交换 k 和 i-1
            swap(nums, k, i-1);
        }

        // 将 i => len-1 执行排序
        reverse(nums, i, nums.length-1);
    }

    /**
     * 交换
     * @param nums 数组
     * @param one 第一个下标
     * @param two 第二个下标
     */
    private static void swap(int[] nums, int one, int two) {
        int temp = nums[one];
        nums[one] = nums[two];
        nums[two] = temp;
    }

    /**
     * 逆序
     * @param nums 数组
     * @param startIndex 开始
     * @param endIndex 结束
     */
    private static void reverse(int[] nums, int startIndex, int endIndex) {
        while (startIndex < endIndex) {
            swap(nums, startIndex++, endIndex--);
        }
    }
```

# 46. Permutations

## 题目

给定一个包含不同整数的数组 nums，返回所有可能的排列。 

您可以按任何顺序返回答案。

### 例子

Example 1:

```
Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

Example 2:

```
Input: nums = [0,1]
Output: [[0,1],[1,0]]
```

Example 3:

```
Input: nums = [1]
Output: [[1]]
```

### Constraints:

1 <= nums.length <= 6

-10 <= nums[i] <= 10

All the integers of nums are unique. nums 的所有整数都是唯一的。


## 分析

所有的排列组合，这一题使用回溯解决就非常自然。

## java 实现

```java
    public List<List<Integer>> permute(int[] nums) {
        // 这个个数实际上可以预测：就是 nums ! 阶乘。
        final int len = nums.length;
        List<List<Integer>> results = new ArrayList<>();

        // 避免扩容
        List<Integer> tempList = new ArrayList<>(len);
        backtrack(results, tempList, nums);
        return results;
    }

    private void backtrack(List<List<Integer>> results, List<Integer> tempList, int[] nums) {
        // 什么时候停止
        final int len = nums.length;
        if(tempList.size() == len) {
            results.add(new ArrayList<>(tempList));
        } else {
            // 回溯
            for (int current : nums) {
                // 元素不能重复
                if (tempList.contains(current)) {
                    continue;
                }

                tempList.add(current);

                // 下一个元素
                backtrack(results, tempList, nums);

                // 回溯
                tempList.remove(tempList.size() - 1);
            }
        }
    }
```

# 60. Permutation Sequence

## 题目

集合 [1, 2, 3, ..., n] 总共包含 n！ 独特的排列。

通过按顺序列出和标记所有排列，我们得到以下 n = 3 的序列：

```
“123”
“132”
“213”
“231”
“312”
“321”
```

给定 n 和 k，返回第 k 个排列序列。

### Ex

Example 1:

```
Input: n = 3, k = 3
Output: "213"
```

Example 2:

```
Input: n = 4, k = 9
Output: "2314"
```

Example 3:

```
Input: n = 3, k = 1
Output: "123"
``` 

### Constraints:

1 <= n <= 9

1 <= k <= n!

## V1-基于 backtrack 实现

我们在 T46 中已经知道了如何计算数字序列的排列组合，然后到底 k 个直接返回。

### java 实现

```java
    public String getPermutation(int n, int k) {
        List<List<Integer>> all = new ArrayList<>();

        List<Integer> tempList = new ArrayList<>();
        backtrack(all, tempList, n, k, 1);

        // 返回列表中的最后一个。
        List<Integer> integers = all.get(k-1);
        StringBuilder stringBuilder = new StringBuilder();
        for(Integer i : integers) {
            stringBuilder.append(i);
        }
        return stringBuilder.toString();
    }

    // 如何可以簡化這個操作呢？
    // 其實我們只關心第 K 個元素
    private void backtrack(List<List<Integer>> all, List<Integer> tempList,
                           int n, int k, int start) {
        if(tempList.size() == n) {
            // 满了
            all.add(new ArrayList<>(tempList));

            // 如果大小已经够了，直接剪枝
            if(all.size() >= k) {
                return;
            }
        }

        for(int i = 1; i <= n; i++) {
            // 跳过重复的元素
            if(tempList.contains(i)) {
                continue;
            }

            tempList.add(i);
            // 下一个元素
            backtrack(all, tempList, n, k, start+1);
            // 移除，回溯
            tempList.remove(tempList.size()-1);
        }
    }
```

不过很不幸，在 85/200 的时候，执行超时。

## V2-换种思路

这就是 hard 题目的坑爹之处。

也就是需要追求一种妙手解法，才能解决这个问题。

> ["Explain-like-I'm-five" Java Solution in O(n)](https://leetcode.com/problems/permutation-sequence/solutions/22507/explain-like-i-m-five-java-solution-in-o-n/)

### 思路

```
I'm sure somewhere can be simplified so it'd be nice if anyone can let me know. 

The pattern was that:

say n = 4, you have {1, 2, 3, 4}

If you were to list out all the permutations you have

1 + (permutations of 2, 3, 4)

2 + (permutations of 1, 3, 4)

3 + (permutations of 1, 2, 4)

4 + (permutations of 1, 2, 3)
```

我确定某个地方可以简化，所以如果有人可以让我知道，那就太好了。

模式是：

说 n = 4，你有 {1, 2, 3, 4}

如果你要列出你拥有的所有排列

1 +（2、3、4 的排列）

2 +（1、3、4 的排列）

3 +（1、2、4 的排列）

4 +（1、2、3 的排列）

```
We know how to calculate the number of permutations of n numbers... n! 

So each of those with permutations of 3 numbers means there are 6 possible permutations. 

Meaning there would be a total of 24 permutations in this particular one. So if you were to look for the (k = 14) 14th permutation, it would be in the

3 + (permutations of 1, 2, 4) subset.

To programmatically get that, you take k = 13 (subtract 1 because of things always starting at 0) and divide that by the 6 we got from the factorial, which would give you the index of the number you want. In the array {1, 2, 3, 4}, k/(n-1)! = 13/(4-1)! = 13/3! = 13/6 = 2. The array {1, 2, 3, 4} has a value of 3 at index 2. So the first number is a 3.
```

我们知道如何计算n个数的排列数……n！

因此，每个具有 3 个数字排列的数字都意味着有 6 种可能的排列。

这意味着在这个特定的排列中总共会有 24 种排列。 

所以如果你要寻找 (k = 14) 第 14 个排列，它会在

3 +（1、2、4 的排列）子集。

要以编程方式获得它，您需要 k = 13（减去 1，因为事物总是从 0 开始）并将其除以我们从阶乘中得到的 6，这将为您提供所需数字的索引。 

在数组{1, 2, 3, 4}中，`k/(n-1)! = 13/(4-1)! = 13/3! = 13/6 = 2.`。

数组 {1, 2, 3, 4} 在索引 2 处的值为 3。因此第一个数字是 3。

```
Then the problem repeats with less numbers.

The permutations of {1, 2, 4} would be:

1 + (permutations of 2, 4)

2 + (permutations of 1, 4)

4 + (permutations of 1, 2)

But our k is no longer the 14th, because in the previous step, we've already eliminated the 12 4-number permutations starting with 1 and 2. So you subtract 12 from k.. which gives you 1. Programmatically that would be...
```

然后问题以更少的数字重复。

{1, 2, 4} 的排列是：

1 +（2、4 的排列）

2 +（1、4 的排列）

4 +（1、2 的排列）

但是我们的 k 不再是第 14 个，因为在上一步中，我们已经消除了以 1 和 2 开头的 12 个 4 数排列。

所以你从 k 中减去 12.. 得到 1。

以编程方式就是这样。 `k = k - (index from previous) * (n-1)! = k - 2*(n-1)! = 13 - 2*(3)! = 1`

```
In this second step, permutations of 2 numbers has only 2 possibilities, meaning each of the three permutations listed above a has two possibilities, giving a total of 6. We're looking for the first one, so that would be in the 1 + (permutations of 2, 4) subset.

Meaning: index to get number from is k / (n - 2)! = 1 / (4-2)! = 1 / 2! = 0.. from {1, 2, 4}, index 0 is 1


so the numbers we have so far is 3, 1... and then repeating without explanations.


{2, 4}

k = k - (index from pervious) * (n-2)! = k - 0 * (n - 2)! = 1 - 0 = 1;

third number's index = k / (n - 3)! = 1 / (4-3)! = 1/ 1! = 1... from {2, 4}, index 1 has 4

Third number is 4


{2}

k = k - (index from pervious) * (n - 3)! = k - 1 * (4 - 3)! = 1 - 1 = 0;

third number's index = k / (n - 4)! = 0 / (4-4)! = 0/ 1 = 0... from {2}, index 0 has 2

Fourth number is 2


Giving us 3142. If you manually list out the permutations using DFS method, it would be 3142. Done! It really was all about pattern finding.
```

在第二步中，2 个数字的排列只有 2 种可能性，这意味着上面列出的三种排列中的每一种都有两种可能性，总共有 6 种可能性。

我们正在寻找第一种，所以它会在 1 + （2、4 的排列）子集。

含义：从中获取数字的索引是 `k / (n - 2)! = 1 / (4-2)! = 1 / 2! = 0` 来自 {1, 2, 4}，索引 0 为 1

所以我们目前拥有的数字是 3、1... 然后不加解释地重复。

### 个人感受

这里的巧妙之处在于，我们在给定个数之后，首先统计每个数字对应的排列组合个数。

然后不断的重复这个过程，得到结果。

这里的 k 可谓用的出神入化。

### java 实现

```java
public String getPermutation(int n, int k) {
    List<Integer> numbers = new ArrayList<>();
    int[] factorial = new int[n+1];
    StringBuilder sb = new StringBuilder();
    // create an array of factorial lookup
    int sum = 1;
    factorial[0] = 1;
    for(int i=1; i<=n; i++){
        sum *= i;
        factorial[i] = sum;
    }
    // factorial[] = {1, 1, 2, 6, 24, ... n!}
    // create a list of numbers to get indices
    for(int i=1; i<=n; i++){
        numbers.add(i);
    }
    // numbers = {1, 2, 3, 4}
    k--;
    for(int i = 1; i <= n; i++){
        int index = k/factorial[n-i];
        sb.append(numbers.get(index));
        numbers.remove(index);
        k-=index*factorial[n-i];
    }
    return String.valueOf(sb);
}
```

我们以 {1,2,3,4} 第 14 个为例子。

```
factorial: [1, 1, 2, 6, 24]

SB:3, index: 2, k: 13, nums: [1, 2, 3, 4]

SB:31, index: 0, k: 1, nums: [1, 2, 4]

SB:314, index: 1, k: 1, nums: [2, 4]

SB:3142, index: 0, k: 0, nums: [2]
```

# 参考资料

https://leetcode.com/problems/next-permutation/description/

https://leetcode.com/problems/permutations/

https://leetcode.com/problems/permutation-sequence/discuss/22507/%22Explain-like-I'm-five%22-Java-Solution-in-O(n)

* any list
{:toc}