---
layout: post
title: 面试算法：如何找到数组中出现次数最多的元素？
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, binary-tree, leetcode, sh]
published: true
---

# 多数元素

## 题目

给定一个大小为 n 的数组，找到其中的多数元素。多数元素是指在数组中出现次数 大于 ⌊ n/2 ⌋ 的元素。

你可以假设数组是非空的，并且给定的数组总是存在多数元素。

- 示例 1：

```
输入：[3,2,3]
输出：3
```

- 示例 2：

```
输入：[2,2,1,1,1,2,2]
输出：2
```

进阶：

尝试设计时间复杂度为 O(n)、空间复杂度为 O(1) 的算法解决此问题。

## 思路0-HashMap 次数统计

这应该是最基本的思路。

我们利用 HashMap 统计每一个元素出现的次数，出现次数最多的，或者说超过 n/2 的，就是满足条件的结果：

### java-出现次数最多的

这种解法，适应范围更加广泛一点，题目如果调整为出现次数最多的，也可以解决。

```java
public int majorityElement(int[] nums) {
    int result = nums[0];
    int maxCount = 1;
    Map<Integer, Integer> countMap = new HashMap<>(nums.length);
    //O(N)
    for(int n : nums) {
        int count = countMap.getOrDefault(n,0)+1;
        if(count >= maxCount) {
            result = n;
            maxCount = count;
        }
        // 统计次数
        countMap.put(n, count);
    }
    // 找到超过一半的元素
    return result;
}
```

效果：

```
Runtime: 9 ms, faster than 31.63% of Java online submissions for Majority Element.
Memory Usage: 44 MB, less than 44.51% of Java online submissions for Majority Element.
```

性能太差了。

### java-次数超过一半

```java
public int majorityElement(int[] nums) {
    int limit = nums.length >> 1;
    Map<Integer, Integer> countMap = new HashMap<>(limit);
    for(int n : nums) {
        int count = countMap.getOrDefault(n,0)+1;
        if(count > limit) {
            return n;
        }
        countMap.put(n, count);
    }
    // 异常
    return -1;
}
```

效果：

```
Runtime: 7 ms, faster than 41.56% of Java online submissions for Majority Element.
Memory Usage: 44.4 MB, less than 29.86% of Java online submissions for Majority Element.
```

这两种方法，理论上都是 O(N)，但是性能确实是太差了。

那有没有其他解法呢？

## 思路1-排序

如果一个元素超过一半，那么原始的数组排序之后，中间的元素肯定满足条件。

### java 实现

```java
public int majorityElement(int[] nums) {
    Arrays.sort(nums);
    return nums[nums.length >> 1];
}
```

效果：

```
Runtime: 1 ms, faster than 99.95% of Java online submissions for Majority Element.
Memory Usage: 42 MB, less than 92.66% of Java online submissions for Majority Element.
```

### 复杂度

当然，这个时间复杂度取决于排序算法的复杂度。

一般是 O(nlogn)

## 思路2-摩尔投票法

假设数组中每个不同的数字就代表一个国家，而数字的个数就代表这个国家的人数，他们在一起混战，就是每两个两个同归于尽。

我们就可以知道那个人数大于数组长度一半的肯定会获胜。

就算退一万步来说，其他的所有人都来攻击这个人数最多的国家，他们每两个两个同归于尽，最终剩下的也是那个众数。

### java 实现

```java
public int majorityElement(int[] nums) {
    int major = nums[0];
    int count = 1;

    for(int i = 1; i < nums.length; i++) {
        int num = nums[i];
        // 全部抵消，重新赋值
        if(count == 0) {
            count++;
            major = num;
        } else if(major == num) {
            // 自己阵营，+1
            count++;
        } else {
            // 敌方阵营，-1
            count--;
        }
    }

    return major;
}
```

### 复杂度

效果：

```
Runtime: 1 ms, faster than 99.95% of Java online submissions for Majority Element.
Memory Usage: 42.4 MB, less than 59.78% of Java online submissions for Majority Element.
```

时间复杂度：O(N)

空间复杂度：O(1)

这个解法，就是最满足进阶的一个解法。

# 多数元素 II

## 題目

给定一个大小为 n 的整数数组，找出其中所有出现超过 ⌊ n/3 ⌋ 次的元素。

进阶：尝试设计时间复杂度为 O(n)、空间复杂度为 O(1)的算法解决此问题。

示例 1：

```
输入：[3,2,3]
输出：[3]
```

示例 2：

```
输入：nums = [1]
输出：[1]
```

示例 3：

```
输入：[1,1,1,3,3,2,2,2]
输出：[1,2]
```

提示：

1 <= nums.length <= 5 * 10^4

-10^9 <= nums[i] <= 10^9

## 思路0-HashMap 记数

和上面一题类似，我们直接借助 HashMap 实现次数的统计。

### java 实现

```java
public List<Integer> majorityElement(int[] nums) {
    // 最多两个元素
    List<Integer> results = new ArrayList<>(2);
    int limit = nums.length / 3;
    Map<Integer, Integer> map = new HashMap<>();
    for(int num : nums) {
        int count = map.getOrDefault(num, 0) + 1;
        if(count > limit && !results.contains(num)) {
            results.add(num);
        }
        map.put(num, count);
    }
    return results;
}
```

效果:

```
Runtime: 8 ms, faster than 29.02% of Java online submissions for Majority Element II.
Memory Usage: 42.3 MB, less than 78.51% of Java online submissions for Majority Element II.
```

虽然问题解决了，但是性能实在是太差了。

## 优化思路1-摩尔投票法

到底应该怎么优化呢？

我们上一题中的排序和摩尔投票法，好像都无法直接使用了。

实际上，摩尔投票法是可以改良的。

我们可以根据摩尔投票法，找到前两个最多的元素。

核心流程如下：

（1）利用摩尔投票法找到投票最多的 2 個元素

（2）统计两个元素出现的次数，超过 1/3 则加入到结果中

### java 实现

```java
int one = nums[0];
    int two = nums[0];
    int countOne = 0;
    int countTwo = 0;
    for(int n : nums) {
        // 投票
        if(one == n) {
            countOne++;
            continue;
        }
        if(two == n) {
            countTwo++;
            continue;
        }
        // 第1个候选人配对
        if (countOne == 0) {
            one = n;
            countOne++;
            continue;
        }
        // 第2个候选人配对
        if (countTwo == 0) {
            two = n;
            countTwo++;
            continue;
        }
        // 其他情况，二者都抵消
        countOne--;
        countTwo--;
    }
    // 计数阶段
    countOne = 0;
    countTwo = 0;
    for(int n : nums) {
        if(n == one) {
            countOne++;
        } else if(n == two) {
            countTwo++;
        }
    }
    int limit = nums.length / 3;
    List<Integer> results = new ArrayList<>();
    if(countOne > limit) {
        results.add(one);
    }
    if(countTwo > limit) {
        results.add(two);
    }
    // 添加元素
    return results;
}
```

效果：

```
Runtime: 1 ms, faster than 99.86% of Java online submissions for Majority Element II.
Memory Usage: 43.1 MB, less than 30.73% of Java online submissions for Majority Element II.
```

## 优化思路2-排序

还记得上一题中的排序算法的优雅吗？

其实这一题还是可以使用排序解决的，不过相对麻烦很多。

这里记录下来，给大家提供一种思路：

```java
public List<Integer> majorityElement(int[] nums) {
    List<Integer> res = new ArrayList<>();
    if (nums == null || nums.length == 0) return res;
    if (nums.length == 1) {
        res.add(nums[0]);
        return res;
    } else if (nums.length == 2) {
        if (nums[0] == nums[1]) {
            res.add(nums[0]);
            return res;
        }
        res.add(nums[0]);
        res.add(nums[1]);
        return res;
    }

    // 核心逻辑
    quickSort(nums, 0, nums.length - 1, res);
    
    return res;
}

private void quickSort(int[] nums, int start, int end, List<Integer> res) {
    int threshold = nums.length / 3;
    if (end - start + 1 <= threshold) return;
    
    int pivot = nums[end];
    int pos = start - 1;
    int count = 1;
    for (int i = start; i < end; i++) {
        if (nums[i] < pivot) {
            swap(nums, ++pos, i);
        } else if (nums[i] == pivot) {
            swap(nums, pos + count, i);
            count++;
        }
        
    }
    
    swap(nums, pos + count, end);
    if (count > threshold) {
        res.add(pivot);
    }
    
    quickSort(nums, start, pos, res);
    quickSort(nums, pos + count, end, res);
}

private void swap(int[] nums, int i, int j) {
    int tmp = nums[i];
    nums[i] = nums[j];
    nums[j] = tmp;
}
```

这里主要是对快速排序的利用，我们下一节还是回顾一下常用的排序算法吧。

排序这个东西，一看就会，一写就废。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/number-of-digit-one/

* any list
{:toc}