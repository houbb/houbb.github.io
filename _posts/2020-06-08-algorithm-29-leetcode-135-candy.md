---
layout: post
title: leetcode 135 Candy 递归+MEM
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, sh]
published: true
---

# 题目

There are n children standing in a line. Each child is assigned a rating value given in the integer array ratings.

You are giving candies to these children subjected to the following requirements:

1. Each child must have at least one candy.

2. Children with a higher rating get more candies than their neighbors.

Return the minimum number of candies you need to have to distribute the candies to the children.

## EX

Example 1:

```
Input: ratings = [1,0,2]
Output: 5
Explanation: You can allocate to the first, second and third child with 2, 1, 2 candies respectively.
```

Example 2:

```
Input: ratings = [1,2,2]
Output: 4
Explanation: You can allocate to the first, second and third child with 1, 2, 1 candies respectively.
The third child gets 1 candy because it satisfies the above two conditions.
```

## Constraints:

```
n == ratings.length

1 <= n <= 2 * 10^4

0 <= ratings[i] <= 2 * 10^4
```

# V1-递归

## 解题思路

【简单感觉】

其实想到递归，并不是很难。

从左往右，或者反过来应该是一样的。

1) 从左边第一个开始，第一个应该是多少呢？

最左边的好处是，左边没有孩子。所以只需要看左边第二个。右边有几个情况

1.1) 第二个大于等于左边，则 0 位的孩子 1 个糖果即可。

1.2) 第二个小于左边，则 0 位的孩子必须大于 1 位的。

但是 1 位的如何判断呢？

这是一个递归？后续用 dp 优化。

【递归的完整思路】

一个位置 i 的孩子，应该给多少个糖果呢？

1. 最少给 1 个

2. 然后和左边对比。如果权重比左边大，则要比左边的+1

3. 然后和右边对比。如果权重比右边大，则要比右边的+1

## java 实现

```java
public class T135_Candy {

    /**
     * 思路：
     *
     * 从左往右，或者反过来应该是一样的。
     *
     * 1. 从左边第一个开始，第一个应该是多少呢？
     *
     * 最左边的好处是，左边没有孩子。所以只需要看左边第二个。右边有几个情况
     *
     * 1.1 第二个大于等于左边，则 0 位的孩子 1 个糖果即可。
     *
     * 1.2 第二个小于左边，则 0 位的孩子必须大于 1 位的。
     *
     * 但是 1 位的如何判断呢？
     *
     * 这是一个递归？后续用 dp 优化。
     *
     *
     * @param ratings 比例
     * @return 结果
     */
    public int candy(int[] ratings) {
        int sum = 0;

        for(int i = 0; i < ratings.length; i++) {
            sum += getMinCandy(i, ratings);
        }

        return sum;
    }

    /**
     * 获取当前位置，最少给几个糖果
     * @param i 下标
     * @param rating 权重
     * @return 结果
     */
    private int getMinCandy(int i, int[] rating) {
        int minLeft = 0;
        int minRight = 0;

        // 和左边对比，如果比左边大，则取左边
        if(i > 0 && (rating[i] > rating[i-1])) {
            minLeft = getMinCandy(i-1, rating);
        }

        // 和右边对比，如果比右边大，则取右边
        if(i < rating.length-1 && (rating[i] > rating[i+1])) {
            minRight = getMinCandy(i+1, rating);
        }

        // 左右对比之后，选择最大的。然后 + 1
        return Math.max(minLeft, minRight) + 1;
    }

}
```

诚然，这种解法的性能存在一定的问题。

会超时。

## V2-mem+递归 内存提升

上面的方法，最大的问题就是每一次我们都需要递归从头计算。

那么，我们使用数组，计算好对应的数值，然后直接读取如何呢？

```java
public class T135_CandyV2 {

    /**
     * 思路：
     *
     * 从左往右，或者反过来应该是一样的。
     *
     * 1. 从左边第一个开始，第一个应该是多少呢？
     *
     * 最左边的好处是，左边没有孩子。所以只需要看左边第二个。右边有几个情况
     *
     * 1.1 第二个大于等于左边，则 0 位的孩子 1 个糖果即可。
     *
     * 1.2 第二个小于左边，则 0 位的孩子必须大于 1 位的。
     *
     * 但是 1 位的如何判断呢？
     *
     * 这是一个递归？后续用 dp 优化。
     *
     * 内存优化：使用一个 n-array 存储对应的糖果，减少计算量
     *
     * @param ratings 比例
     * @return 结果
     */
    public int candy(int[] ratings) {
        // 存放糖果数量
        int[] candies = new int[ratings.length];

        int sum = 0;

        for(int i = 0; i < ratings.length; i++) {
            // 有值，则直接去取
            sum += getMinCandy(i, ratings, candies);
        }

        return sum;
    }

    /**
     * 获取当前位置，最少给几个糖果
     * @param i 下标
     * @param rating 权重
     * @param candies 糖果
     * @return 结果
     */
    private int getMinCandy(int i, int[] rating,
                            int[] candies) {
        // 复用
        if(candies[i] != 0) {
            return candies[i];
        }

        int minLeft = 0;
        int minRight = 0;

        // 和左边对比，如果比左边大，则取左边
        if(i > 0 && (rating[i] > rating[i-1])) {
            // 复用数据
            if(candies[i-1] != 0) {
                minLeft = candies[i-1];
            } else {
                minLeft = getMinCandy(i-1, rating, candies);
                // 存储
                candies[i-1] = minLeft;
            }
        }

        // 和右边对比，如果比右边大，则取右边
        if(i < rating.length-1 && (rating[i] > rating[i+1])) {
            // 复用
            if(candies[i+1] != 0) {
                minRight = candies[i+1];
            } else {
                minRight = getMinCandy(i+1, rating, candies);
                // 存储
                candies[i+1] = minRight;
            }
        }

        // 左右对比之后，选择最大的。然后 + 1
        return Math.max(minLeft, minRight) + 1;
    }

}
```

此时这个算法其实已经通过了。

或者递归改为 bottom=>up 的解法也行，不再赘述。

我们在学习下，能否有其他解决思路？

## V3-two pass

```java
    /**
     * 思路：TWO-PASS
     *
     * 从前往后：如果右边的比左边大，则为左边+1。
     *
     * 从后往前：如果左边的比右边权重大，但是糖果却不多，进行修正。
     *
     * @param ratings 比例
     * @return 结果
     */
    public int candy(int[] ratings) {
        // 存放糖果数量
        int[] candies = new int[ratings.length];
        // 至少有一个
        Arrays.fill(candies, 1);

        // 从前往后遍历
        // 和左边比
        for(int i = 1; i < ratings.length; i++) {
            if(ratings[i] > ratings[i-1]) {
                candies[i] = candies[i-1] + 1;
            }
        }

        // 从后往前遍历
        // 和右边比，但是糖果缺少
        for(int i = ratings.length-2; i >=0; i--) {
            if((ratings[i] > ratings[i+1])
                && candies[i] <= candies[i+1]) {
                candies[i] = candies[i+1] + 1;
            }
        }

        // 累加结果
        int sum = 0;
        for(int i = 0; i < ratings.length; i++) {
            sum += candies[i];
        }

        return sum;
    }
```

这个时间复杂度，严格说其实是 4 * O(N)。

循环 4 次，和循环一次，耗时肯定是不同的，只是 TC 弱化了这一点。

那么，我们有没有可能，，让循环的次数变得更少呢？

## V4-ONE PASS

我们来学习一下其他大佬的思路。

> [one-pass-constant-space-java-solution](https://leetcode.com/problems/candy/solutions/42770/one-pass-constant-space-java-solution/)

### 思路

```
This solution picks each element from the input array only once. First, we give a candy to the first child. Then for each child we have three cases:

    His/her rating is equal to the previous one -> give 1 candy.
    His/her rating is greater than the previous one -> give him (previous + 1) candies.
    His/her rating is less than the previous one -> don't know what to do yet, let's just count the number of such consequent cases.

When we enter 1 or 2 condition we can check our count from 3. If it's not zero then we know that we were descending before and we have everything to update our total candies amount: number of children in descending sequence of raitings - coundDown, number of candies given at peak - prev (we don't update prev when descending). Total number of candies for "descending" children can be found through arithmetic progression formula (1+2+...+countDown). Plus we need to update our peak child if his number of candies is less then or equal to countDown.
```

该解决方案仅从输入数组中选取每个元素一次。 

首先，我们给第一个孩子一颗糖果。 

然后对于每个孩子，我们有三种情况：

- TA 的评分与前一个相同 -> 给 1 颗糖果。

- TA 的评分高于前一个 -> 给 TA（前一个 + 1）颗糖果。

- TA 的评分比上一个低-> 还不知道怎么办，让我们数一数这样的后续案例的数量。

当我们输入 1 或 2 条件时，我们可以检查我们从 3 开始的计数。

如果它不为零，那么我们知道我们之前是下降的，我们有一切可以更新我们的总糖果数量：

降序排列的孩子数量 - coundDown，数字 在高峰期给出的糖果数量 - prev（我们在下降时不更新 prev）。 

通过等差数列公式（1+2+...+countDown）可以找到“降序”儿童的糖果总数。 

另外，如果他的糖果数量小于或等于 countDown，我们需要更新我们的 peak 孩子。


### 个人感受

这个术语数学算法。

可一件算法+数学，才是最牛的，但是实际中很难想到。

### java 实现

```java
    public int candy(int[] ratings) {
        int total = 1;
        int prev = 1;
        int countDown = 0;

        for (int i = 1; i < ratings.length; i++) {
            if (ratings[i] >= ratings[i - 1]) {
                if (countDown > 0) {
                    // arithmetic progression
                    total += countDown * (countDown + 1) / 2;
                    if (countDown >= prev) {
                        total += countDown - prev + 1;
                    }
                    countDown = 0;
                    prev = 1;
                }
                prev = ratings[i] == ratings[i - 1] ? 1 : prev + 1;
                total += prev;
            } else {
                countDown++;
            }
        }
        // if we were descending at the end
        if (countDown > 0) {
            total += countDown * (countDown + 1) / 2;
            if (countDown >= prev) {
                total += countDown - prev + 1;
            }
        }
        return total;
    }
```

# 参考资料

https://leetcode.com/problems/candy/solutions/2701595/java-two-solutions-two-pass/

https://leetcode.com/problems/candy/solutions/2236920/java-o-n-solution-dp-commented-and-readable/

https://leetcode.com/problems/candy/solutions/42770/one-pass-constant-space-java-solution/


* any list
{:toc}