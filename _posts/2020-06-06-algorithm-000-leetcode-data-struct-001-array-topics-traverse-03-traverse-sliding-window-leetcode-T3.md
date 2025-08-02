---
layout: post
title: leetcode 数组专题之数组遍历-03-遍历滑动窗口 T3. 无重复字符的最长子串
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, sliding-window, prefix-sum, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。


# 3. 无重复字符的最长子串

给定一个字符串 s ，请你找出其中不含有重复字符的 最长 子串 的长度。

示例 1:

输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。

示例 2:

输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。

示例 3:

输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
 

提示：

0 <= s.length <= 5 * 10^4
s 由英文字母、数字、符号和空格组成


# v1-暴力解法

## 思路

我们用最朴素的暴力先尝试解答。

核心思路：

1）用 set 判断元素是否存在重复。

2）包含重复时，则直接中断。不断更新 max 的最大长度。

## 解法

```java
    public static int lengthOfLongestSubstring(String s) {
        int max = 0;

        char[] chars = s.toCharArray();
        for(int i = 0; i < chars.length; i++) {
            // 判重
            Set<Character> set = new HashSet<>();
            for(int j = i; j < chars.length; j++) {
                char c = chars[j];
                if(set.contains(c)) {
                    break;
                }
                set.add(c);
            }

            // 更新
            max = Math.max(max, set.size());
        }
        return max;
    }
```

## 效果

96ms 击败 5.35%

# v2-滑动窗口

## 思路

入

满足 

出

滑动窗口最自然的使用 queue 去实现。

1）没有重复前，往 queue 加入 c

2) 如果重复，那么判断最大长度。然后将 c 和之前的字符全部出队列。

3）最后还需要判断一次，避免整个没有重复，

## 实现

```java
    public static int lengthOfLongestSubstring(String s) {
        char[] chars = s.toCharArray();
        Queue<Character> queue = new LinkedList<>();

        int max = 0;
        for (int i = 0; i < chars.length; i++) {
            char c = chars[i];

            // 是否满足条件
            if (!queue.contains(c)) {
                queue.add(c);
                continue;
            }

            // 已经有重复的数据
            max = Math.max(max, queue.size());

            //出队列，需要把和当前字符重复的和之前的字符全部异常
            while (!queue.isEmpty() && queue.peek() != c) {
                queue.poll();
            }
            queue.poll();
            queue.add(c);
        }

        // 避免全部没重复的场景
        max = Math.max(max, queue.size());

        return max;
    }
```

## 效果

5ms 击败 82.69%

## 反思

数据结构的问题，如果我们用基本的数据结构会怎么样？

我们把 queue 改为基本的 array?

# v3-基本数组模拟 queue

## 思路

如果能用数组模拟，一般性能会更好一些。

我们的基本思路是一样的。

array 两个指针：start end，模拟队列的队头、队尾

那么我们要做的事情还是一样：

1) 初始化队列，start=end=0

2) 逐个遍历字符，然后在已有在队列 [start, end] 中判断是否存在

2.1 如果存在此 char。首先更新 max。然后寻找重复位置 i，进行 start=i+1  丢弃掉重复的字符和之前的所有字符

3）队尾新增字符 c  `array[end++] = c`

4) 避免没有重复，再次判断 `max = Math.max(max, end-start+1)`;

## 实现

```java
    public static int lengthOfLongestSubstring(String s) {
        int start = 0;
        int end = 0;
        int max = 0;

        char[] chars = s.toCharArray();
        char[] queue = new char[s.length()];
        for (char c : chars) {
            // 判断是否包含
            for(int i = start; i < end; i++) {
                // 重复
                if(queue[i] == c) {
                    max = Math.max(max, end-start);

                    // 丢弃 i 和之前的元素
                    start = i+1;

                    // 需要中断本次循环
                    break;
                }
            }

            // 放入队尾
            queue[end++] = c;
        }

        // 避免全部没重复的场景
        max = Math.max(max, end-start);

        return max;
    }

```


## 效果

1ms  100%

break 提前退出比较重要，因为后面不会有重复的了。

当然不加也是对的，但是会多遍历一些，耗时会变为 3ms。


## 反思

虽然是 100%，但是从时间复杂度而言，最差其实是 O(n^2)。

因为外层循环一遍，里面还是要循环一遍。

有没有更快的方法呢？


# v4-HashMap 记录位置

## 思路

回顾下我们上面的写法，我们在 queue 里循环了一遍，只是为了寻找上一次 char 的位置。

那么如果用 hashMap 来存储位置，其实可以把查找的 O(n) 提升到 O(1)。

1）hashMap key 为 chat, value 为对应的位置。start 记录队列开始的位置。初始为 0

2）判断 HashMap 中是否存在当前位置 i 的字符 c，如果存在，更新 start 位置为当前位置 `Math.max(start, map.get(c)+1)`。

这里的重复位置需要和 start 最大值比，避免位置又回去了。

3) 更新长度 `max = Math.max(max, i - start + 1)`; 其实 i 等价于队列的 end 结束位置。

整体解法实际上是一样的

## 实现

```java
    public static int lengthOfLongestSubstring(String s) {
        int start = 0;
        int max = 0;

        Map<Character, Integer> posMap = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            Integer pos = posMap.get(c);
            // 存在
            if(pos != null) {
                // 最大值
                start = Math.max(start, pos+1);
            }

            max = Math.max(max, i-start+1);

            // 更新位置
            posMap.put(c, i);
        }

        return max;
    }
```

## 效果

4ms 击败 87.18%

## 反思

实际上这是一个 O(n) 的时间复杂度。

只是复杂的数据结构，让其性能甚至不如我们的 v3 版本。

此测试用例之过也。

当然，我们可以用 array 来模拟哈希实现。

这也属于一种内存的压缩技巧。

# v5-数组模拟哈希

## 思路

我们仔细看一下题目，s 由英文字母、数字、符号和空格组成

那么就可以用 int[128] 来存储 char。

但是问题是 0 怎么办呢？

我们可以整体存储的位置，等于自己+1即可，从而避免 0 的混淆。

其他逻辑不变。

## 实现

```java
    public static int lengthOfLongestSubstring(String s) {
        int start = 0;
        int max = 0;

        int[] windows = new int[128];
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);

            // 最大值
            start = Math.max(start, windows[c]);

            max = Math.max(max, i-start+1);

            // 更新位置，这里统一+1，避免0的混淆
            windows[c] = i+1;
        }

        return max;
    }
```


## 效果

1ms 100%

42mb 90%

其实这个应该算是双A的实现。

## 反思

哈希模拟这种，其实比较适合字符集合比较简单的场景。

但是 v4 适用性是最广的。


## 有趣的现象

你有没有发现

v4 HashMap 中，我们存储的是字符的 pos 位置；

v5 array 中，我们为了避免 0 混淆，字符的位置是  pos +1

为什么 `max = Math.max(max, i-start+1);` 为什么写法都一样？

我们对比一个例子，比如 `0112`

| i | v4 HashMap | v5 array 模拟 |
|:---|:---|:---|
| 0  | {'0'=0} | |
| 1  |  | |
| 2  |  | |
| 3  |  | |



# 给出滑动窗口的经典题目，一简单，2中等，1困难

| 难度 | 题目编号 & 名称          | 链接                                                                                   | 类型          |
| -- | ------------------ | ------------------------------------------------------------------------------------ | ----------- |
| 简单 | 643. 子数组最大平均数 I    | [力扣链接](https://leetcode.cn/problems/maximum-average-subarray-i/)                     | 固定长度滑窗      |
| 中等 | 3. 无重复字符的最长子串      | [力扣链接](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) | 动态窗口 + 去重   |
| 中等 | 438. 找到字符串中所有字母异位词 | [力扣链接](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)                  | 动态窗口 + 频率统计 |
| 困难 | 76. 最小覆盖子串         | [力扣链接](https://leetcode.cn/problems/minimum-window-substring/)                       | 动态窗口 + 最小长度 |

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}