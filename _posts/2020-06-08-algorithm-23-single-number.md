---
layout: post
title: 面试算法：只出现一次的数字详解汇总
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, binary-tree, leetcode, sh]
published: true
---

# 题目

给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。

找出那个只出现了一次的元素。

说明：

你的算法应该具有线性时间复杂度。 

你可以不使用额外空间来实现吗？

- 示例 1:

```
输入: [2,2,1]
输出: 1
```

- 示例 2:

```
输入: [4,1,2,1,2]
输出: 4
```

## 解题思路

最简单的就是我们使用 HashMap 存储每一个数字出现的次数，最后找到只出现一次的数字。

当然，也可以稍微优化一下，如果存在就删除，这样最后只会剩一个值，就是结果。

```java
public int singleNumber(int[] nums) {
    if(nums.length == 1) {
        return nums[0];
    }

    Map<Integer, Integer> map = new HashMap<>(nums.length);
    for (int key : nums) {
        if (map.containsKey(key)) {
            map.remove(key);
        } else {
            map.put(key, 1);
        }
    }

    //O(1)
    for(Map.Entry<Integer, Integer> entry : map.entrySet()) {
        return entry.getKey();
    }
    // 不应该到达
    return -1;
}
```

效果：

```
Runtime: 8 ms, faster than 42.49% of Java online submissions for Single Number.
Memory Usage: 39.5 MB, less than 34.85% of Java online submissions for Single Number.
```

## 优化1-使用 HashSet

当然，我们很快就会发现，我们只需要判断一下是否存在就行，不需要统计次数。

所以 HashMap 可以使用 HashSet 进行替换：

```java
public int singleNumber(int[] nums) {
    int result = 0;
    // 能否進一步優化？
    // hash 的優勢在於 O(1) 訪問。
    // two pointer?
    Set<Integer> set = new HashSet<>(nums.length);
    for (int key : nums) {
        if (set.contains(key)) {
            result -= key;
        } else {
            result += key;
            set.add(key);
        }
    }
    return result;
}
```

如果一个数已经存在，直接做减法，就可以抵消。


效果：

```
Runtime: 5 ms, faster than 54.71% of Java online submissions for Single Number.
Memory Usage: 39 MB, less than 83.31% of Java online submissions for Single Number.
```

## 优化2-位运算

个人感觉，能想到上面的解法，已经很不错了。

不过这一题的最好的解法实际上是使用位运算。

这个如果想不到，那就是想不到。感觉和聪明与否关系不大，更多的是经验和眼界问题。

位运算：

```
a ^ a = 0
a ^ 0 = a
```

一个数异或自己为0，一个数异或0等于自身。

所以出现两次的数，都会被抵消，最后剩的还是唯一出现的数字。

```java
public int singleNumber(int[] nums) {
    int result = 0;
    for (int key : nums) {
        result ^= key;
    }
    return result;
}
```

效果：

```
Runtime: 1 ms, faster than 95.67% of Java online submissions for Single Number.
Memory Usage: 39.3 MB, less than 48.69% of Java online submissions for Single Number.
```

### 更进一步优化

当然，上面的方法，还有一点点的优化空间。

可以节约一次运算：

```java
public int singleNumber(int[] nums) {
    int result = nums[0];
    for (int i = 1; i < nums.length; i++) {
        result ^= nums[i];
    }
    return result;
}
```

性能方法，位运算确实是当之无愧的王者。

# 只出现一次的数字 II

## 题目

给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现了三次。找出那个只出现了一次的元素。

说明：

你的算法应该具有线性时间复杂度。 

你可以不使用额外空间来实现吗？

- 示例 1:

```
输入: [2,2,3,2]
输出: 3
```

- 示例 2:

```
输入: [0,1,0,1,0,1,99]
输出: 99
```

## 解题思路-HashMap

上一题我们学会了出现 2 次，这次变成 3 次，当然使用 HashMap 依然是非常的简单。

```java
public int singleNumber(int[] nums) {
    // 參數防禦
    if(nums == null || nums.length == 0) {
        throw new IllegalArgumentException();
    }
    if(nums.length == 1) {
        return nums[0];
    }

    Map<Integer, Integer> map = new HashMap<>(nums.length);
    for(int i : nums) {
        Integer count = map.get(i);
        if(count == null) {
            count = 0;
        }
        map.put(i, count+1);
    }
    // 遍歷
    for(Map.Entry<Integer, Integer> entry : map.entrySet()) {
        if(1 == entry.getValue()) {
            return entry.getKey();
        }
    }

    //NOT FOUND
    throw new IllegalArgumentException();
}
```

不过很可惜，这一题这样解，面试官是根本不会满意的。

## 优化思路-位运算

我们都知道，出现 2 次可以通过异或清零。

那么，如何让一个数字出现 3 次，也能清零呢？

那么，让我们重新回顾一下陌生而又熟悉的位运算吧。

## 位运算

### 异或 XOR

该运算符用于检测出现奇数次的位：1、3、5 等。

- 0 与任何数 XOR 结果为该数。

- 两个相同的数 XOR 结果为 0。

以此类推，只有某个位置的数字出现奇数次时，该位的掩码才不为 0。

![xor](https://pic.leetcode-cn.com/Figures/137/xor.png)

因此，可以检测出出现一次的位和出现三次的位，但是要注意区分这两种情况。

### AND NOT

为了区分出现一次的数字和出现三次的数字，使用两个位掩码：seen_once 和 seen_twice。

思路是：

仅当 seen_twice 未变时，改变 seen_once。

仅当 seen_once 未变时，改变 seen_twice。

![three](https://pic.leetcode-cn.com/Figures/137/three.png)

位掩码 seen_once 仅保留出现一次的数字，不保留出现三次的数字。

通过上面 2 步，我们就可以唯一找到出现一次的元素了。

### java 实现

```java
public int singleNumber(int[] nums) {
  int seenOnce = 0, seenTwice = 0;

  for (int num : nums) {
    // first appearence: 
    // add num to seen_once 
    // don't add to seen_twice because of presence in seen_once
    // second appearance: 
    // remove num from seen_once 
    // add num to seen_twice
    // third appearance: 
    // don't add to seen_once because of presence in seen_twice
    // remove num from seen_twice
    seenOnce = ~seenTwice & (seenOnce ^ num);
    seenTwice = ~seenOnce & (seenTwice ^ num);
  }
  return seenOnce;
}
```

明白了吗？反正我看第一眼是蒙圈的。

我们看一下有一位小伙伴的梳理：

```
第一次出现时，once和twice均为0，once^num相当于把num添加到once，表示num出现了一次，~once表示不把num添加到twice；

第二次出现时，num已经添加到once了，num^num=0，once=0，相当于将num从once中删除，twice^num相当于把num添加到twice中；

第三次出现时，第二次的twice为1，~twice为0，所以once依然为0，第三次的twice=num^num=0，相当于把num从twice中删除；
```

这道题遍历结果：出现一次的num对应的once为1，twice为0；出现三次的num对应的once为0，twice也为0。 最终只需要返回once就行。

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Single Number II.
Memory Usage: 38.8 MB, less than 41.37% of Java online submissions for Single Number II.
```

# 只出现一次的数字 III

## 題目

给定一个整数数组 nums，其中恰好有两个元素只出现一次，其余所有元素均出现两次。 找出只出现一次的那两个元素。你可以按 任意顺序 返回答案。

进阶：你的算法应该具有线性时间复杂度。你能否仅使用常数空间复杂度来实现？

- 示例 1：

输入：nums = [1,2,1,3,2,5]
输出：[3,5]
解释：[5, 3] 也是有效的答案。

- 示例 2：

输入：nums = [-1,0]
输出：[-1,0]

- 示例 3：

输入：nums = [0,1]
输出：[1,0]

提示：

2 <= nums.length <= 3 * 104

-2^31 <= nums[i] <= 2^31 - 1

除两个只出现一次的整数外，nums 中的其他数字都出现两次

## 解題思路

入门解法，使用 HashMap:

```java
public int[] singleNumber(int[] nums) {
    Map<Integer, Integer> map = new HashMap<>(nums.length);
    for(int num : nums) {
        map.put(num, map.getOrDefault(num, 0)+1);
    }
    // 獲取結果
    int[] results = new int[2];
    int size = 0;
    for(Map.Entry<Integer, Integer> entry : map.entrySet()) {
        if(entry.getValue() == 1) {
            results[size++] = entry.getKey();
        }
    }
    return results;
}
``` 

效果：

```
Runtime: 4 ms, faster than 28.51% of Java online submissions for Single Number III.
Memory Usage: 40.3 MB, less than 24.68% of Java online submissions for Single Number III.
```

效果确实不尽如人意。

## 优化思路-位运算

如果我们像上面一样，单纯的使用异或，就会导致出现两次的数字的结果混在了一起。

题目中要求的是常量空间，所以如何可以让结果同时保留 2 个结果呢？

### 核心思路

如果我们全部异或一次，结果肯定就是两个出现一次数的异或。

那么我可以考虑异或结果的某个非 0 位如最后一个非 0 位, 因为我们知道只有当 num1、num2 在该位不一样的时候才会出现异或结果为 1. 

所以我们以该位是否为 1 对数组进行划分, 只要该位为 1 就和 num1 异或, 只要该位为 0就和 num2 异或, 这样最终得到就是只出现过一次的两个数(其他在该位为 1 或 0 的数必然出现 0/2 次对异或结果无影响)

可以达到下面的效果：

（1）相同的数，依然在相同组。

（2）唯一出现一次的数，被分到 2 个组。

这样，我们分别对2个组处理，难度就降低为题目1了。

### java 实现

我们只做 3 步：

（1）全部异或一遍，找到两个出现一次的 XOR 结果。

（2）找到 XOR 非零位

（3）以 XOR 的非零位对原始数组进行划分为 2 个部分，分别进行 XOR

```java
public int[] singleNumber(int[] nums) {
    int xor = 0;
    for(int num : nums) {
        xor ^= num;
    }

    // 获取非0位
    int bit = 1;
    while ((bit & xor) == 0) {
        bit <<= 1;
    }

    // 重新划分数组
    int a = 0;
    int b = 0;
    for(int num : nums) {
        if((num & bit) == 0) {
            a ^= num;
        } else {
            b ^= num;
        }
    }
    return new int[]{a, b};
}
```

效果：

```
Runtime: 1 ms, faster than 96.60% of Java online submissions for Single Number III.
Memory Usage: 39 MB, less than 73.26% of Java online submissions for Single Number III.
```

## 优化2-尽头

为什么没有超越 100% 呢？

答案当然是有大佬有比这更加优秀的解法，只能说山外有山。

上面的方法非常的优秀，不过有一个可以优化的点，那就是对于 XOR 的结果利用还有进步的空间。

我们都知道：

```
a XOR b = xor
```

我们利用 xor 将数组划分为 2 个部分。

实际上，我们可以只算一半，把 a 算出来即可。

```
b = xor ^ a
```

### java 实现

```java
public int[] singleNumber(int[] nums) {
    int xor = 0;
    for(int num : nums) {
        xor ^= num;
    }

    // 获取非0位
    int bit = 1;
    while ((bit & xor) == 0) {
        bit <<= 1;
    }

    // 重新划分数组
    int a = 0;
    for(int num : nums) {
        if((num & bit) == 0) {
            a ^= num;
        }
    }
    // a ^ xor 就是另一个数
    return new int[]{a, a ^ xor};
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Single Number III.
Memory Usage: 39 MB, less than 82.62% of Java online submissions for Single Number III.
```

好了，这下 100% 了，我们的位运算系列算是告一段落。

总体感觉，位运算的进阶部分偏难，有时候想不到。

就算提示我们是位运算，可能因为平时使用不多，导致应用不熟练，也无法解决问题。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/single-number

* any list
{:toc}