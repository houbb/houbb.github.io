---
layout: post
title:  【leetcode】72-greedy 2548. 填满背包的最大价格 分数背包
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, greedy, leetcode]
published: true
---

# 题目

给定一个二维整数数组 items ，其中 items[i] = [pricei, weighti] 表示第 i 个物品的价格和重量。

还给定一个 正 整数容量 capacity 。

每个物品可以分成两个部分，比率为 part1 和 part2 ，其中 part1 + part2 == 1 。

第一个物品的重量是 weighti * part1 ，价格是 pricei * part1 。

同样，第二个物品的重量是 weighti * part2 ，价格是 pricei * part2 。

使用给定的物品，返回填满容量为 capacity 的背包所需的 最大总价格 。

如果无法填满背包，则返回 -1 。

与实际答案的差距在 10-5 以内的 实际答案 将被视为接受。

示例 1 ：

输入：items = [[50,1],[10,8]], capacity = 5
输出：55.00000
解释：
我们将第二个物品分成两个部分，part1 = 0.5，part2 = 0.5。 
第一个物品的价格和重量分别为 5 和 4 。同样地，第二个物品的价格和重量也是 5 和 4 。 
经过操作后，数组 items 变为 [[50,1],[5,4],[5,4]] 。 
为了填满容量为 5 的背包，我们取价格为 50 的第一个元素和价格为 5 的第二个元素。 
可以证明，55.0 是我们可以达到的最大总价值。
示例 2 ：

输入：items = [[100,30]], capacity = 50
输出：-1.00000
解释：无法用给定的物品装满背包。
 

提示：

1 <= items.length <= 10^5
items[i].length == 2
1 <= pricei, weighti <= 10^4
1 <= capacity <= 109


# v1-贪心

## 思路

采用贪心。

需要把背包填满，那就添最大价值的物品。

## 实现

```java
import java.util.Arrays;

public class T2548_maxPriceBag_V2 {

    // [pricei, weighti]
    public double fillBackpack(int[][] items, int capacity) {
        // 按单位重量的价格从高到低排序
        Arrays.sort(items, (a, b) -> Double.compare((double) b[0] / b[1], (double) a[0] / a[1]));

        double maxPrice = 0.0;
        int remainingCapacity = capacity;

        for (int[] item : items) {
            int price = item[0];
            int weight = item[1];

            if (remainingCapacity <= 0) {
                break;
            }
            if (weight <= remainingCapacity) {
                // 如果整个物品可以放入背包
                maxPrice += price;
                remainingCapacity -= weight;
            } else {
                // 如果只能放一部分物品
                double fraction = (double) remainingCapacity / weight;
                maxPrice += price * fraction;
                remainingCapacity = 0;
            }
        }

        // 检查背包是否被完全填满
        return remainingCapacity == 0 ? maxPrice : -1.0;
    }

}
```

# chat

## 思路

这道题的核心是“分数背包”问题，即可以将物品分成不同的比例，以最大化背包的总价格。

### 解题思路
1. **按性价比排序**：由于可以将物品分成任意比例，最优策略是先取性价比（价格/重量）最高的物品。我们可以先计算每个物品的单位重量价格，然后按单位重量价格从大到小对 `items` 排序。

2. **贪心选择**：从性价比最高的物品开始，尽量将背包装满。如果一个物品可以完整放入背包，则直接放入；如果放不下，则计算需要放入的部分即可填满背包的剩余容量。

3. **计算总价格**：按以上策略累积物品的总价格，直到背包被完全填满。

4. **检查是否装满背包**：如果在放入物品后背包的剩余容量为0，则返回累积的价格；如果遍历完所有物品仍无法填满背包，则返回 -1。

### 实现代码

```java
import java.util.Arrays;

public class Solution {
    public double fillBackpack(int[][] items, int capacity) {
        // 按单位重量的价格从高到低排序
        Arrays.sort(items, (a, b) -> Double.compare((double) b[0] / b[1], (double) a[0] / a[1]));

        double maxPrice = 0.0;
        int remainingCapacity = capacity;

        for (int[] item : items) {
            int price = item[0];
            int weight = item[1];

            if (remainingCapacity <= 0) {
                break;
            }

            if (weight <= remainingCapacity) {
                // 如果整个物品可以放入背包
                maxPrice += price;
                remainingCapacity -= weight;
            } else {
                // 如果只能放一部分物品
                double fraction = (double) remainingCapacity / weight;
                maxPrice += price * fraction;
                remainingCapacity = 0;
            }
        }

        // 检查背包是否被完全填满
        return remainingCapacity == 0 ? maxPrice : -1.0;
    }
}
```

### 代码解析
- **排序**：使用 `Arrays.sort` 按照单位重量的价格（`price / weight`）排序。
- **贪心选择**：遍历排序后的 `items`，尽量选择性价比高的物品，将其重量和价格添加到 `maxPrice` 中。
- **返回结果**：如果 `remainingCapacity` 为0，说明背包被完全填满，返回 `maxPrice`；否则返回 -1。

### 时间复杂度
排序的时间复杂度为 \(O(n \log n)\)，遍历物品的复杂度为 \(O(n)\)。

## 为什么可以用贪心

这题之所以可以使用贪心算法，而不需要动态规划，主要原因在于**物品可以分割成任意比例**。这种情况下，我们可以根据物品的单位重量价格（性价比）选择最优的放入方式，贪心策略就能确保全局最优解。下面是详细的解释：

### 1. **物品可以任意分割**
   在传统的背包问题中，物品是不可分割的，因此我们无法直接使用贪心算法。为了找到最优解，通常需要动态规划来逐步计算所有可能的组合。

   然而，在这道题中，物品可以按照任意比例分割。这意味着我们可以把每个物品的任意一部分放入背包，这种情况下不需要考虑组合问题，而是直接选择性价比最高的部分即可。

### 2. **贪心策略的适用性**
   对于每个物品，我们按性价比（即单位重量的价格）从高到低排序。然后依次选择性价比最高的物品，尽可能多地放入背包，以确保每次的选择都对总价格贡献最大。这种策略可以保证全局最优，因为可以分割物品，允许我们逐步填满背包。

   - 如果能把当前物品完全放入背包，就直接放入。
   - 如果放不下整个物品，就只放入一部分（刚好填满剩余的容量）。

   因此，贪心算法在这种分数背包问题中是最优的解法。

### 3. **为什么动态规划不适合**
   动态规划适合在每个物品只能取或不取的情况下（0-1 背包）或每个物品可以无限次使用的情况下（完全背包）解决背包问题。然而，这里物品可以按任意比例分割，不存在「是否要取某个物品的整个或部分」的问题。  
   
   如果使用动态规划反而会导致不必要的复杂度，因为动态规划的设计初衷是计算不同组合的最优解，而这里贪心选择性价比最高的物品部分就能直接得到解，不需要遍历组合。

### 4. **分数背包的数学证明**
   可以证明，对于分数背包问题，按单位重量价格贪心选择是最优的，这种策略保证了局部最优解等于全局最优解。因为每次选择了性价比最高的物品部分，累积到的最大价格也就是整个背包能得到的最大价格。

### 总结
这题选择贪心策略的关键在于「物品可以分割」，这使得贪心选择按性价比排序是最优解法，不需要动态规划。


# 参考资料

https://leetcode.cn/problems/house-robber/description/?envType=problem-list-v2&envId=dynamic-programming

* any list
{:toc}