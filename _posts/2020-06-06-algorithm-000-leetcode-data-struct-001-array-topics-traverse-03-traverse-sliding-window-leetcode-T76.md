---
layout: post
title: leetcode 数组专题之数组遍历-03-遍历滑动窗口 T76 最小覆盖子串
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, sliding-window, prefix-sum, top100, sf]
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


# 76. 最小覆盖子串

给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。

如果 s 中不存在涵盖 t 所有字符的子串，则返回空字符串 "" 。

注意：

对于 t 中重复字符，我们寻找的子字符串中该字符数量必须不少于 t 中该字符数量。
如果 s 中存在这样的子串，我们保证它是唯一的答案。
 

示例 1：

输入：s = "ADOBECODEBANC", t = "ABC"
输出："BANC"
解释：最小覆盖子串 "BANC" 包含来自字符串 t 的 'A'、'B' 和 'C'。


示例 2：

输入：s = "a", t = "a"
输出："a"
解释：整个字符串 s 是最小覆盖子串。
示例 3:

输入: s = "a", t = "aa"
输出: ""
解释: t 中两个字符 'a' 均应包含在 s 的子串中，
因此没有符合条件的子字符串，返回空字符串。
 

提示：

m == s.length
n == t.length
1 <= m, n <= 10^5
s 和 t 由英文字母组成
 
进阶：你能设计一个在 o(m+n) 时间内解决此问题的算法吗？

# v1-暴力解法

## 思路

首先我们就是最朴素的暴力解法。

1）用 map 记录 t 所以字符出现的次数

2）遍历 s 中所有的可能性，找到满足条件的最短长度。

## 解法

```java
    public String minWindow(String s, String t) {
        //
        char[] tcs = t.toCharArray();
        char[] scs = s.toCharArray();

        int left = 0;
        int right = 0;

        // 遍历所有的可能性
        String result = null;

        // 字符统计，可以优化为数组
        Map<Character, Integer> targetCountMap = new HashMap<>();
        for(char c : tcs) {
            Integer count = targetCountMap.getOrDefault(c, 0);
            count++;
            targetCountMap.put(c, count);
        }

        for(left = 0; left < s.length(); left++) {
            for(right = left; right < s.length(); right++) {
                // 判断字符的可能性
                int len = right-left+1;

                // 长度不够，直接跳过
                if(len < t.length()) {
                    continue;
                }

                // 然后判断
                Map<Character, Integer> sourceCountMap = new HashMap<>();
                StringBuilder stringBuilder = new StringBuilder();
                for(int i = left; i <= right; i++) {
                    char c = scs[i];
                    Integer count = sourceCountMap.getOrDefault(c , 0);
                    count++;
                    sourceCountMap.put(c, count);
                    stringBuilder.append(c);
                }

                // 判断是否满足条件
                if(isMatchCondition(sourceCountMap, targetCountMap)) {
                    if(result == null) {
                        result = stringBuilder.toString();
                    } else {
                        if(result.length() > stringBuilder.length()) {
                            result = stringBuilder.toString();
                        }
                    }
                }
            }
        }


        // 默认为空
        if(result == null) {
            result = "";
        }
        return result;
    }

    private boolean isMatchCondition(Map<Character, Integer> sourceCountMap,
                                     Map<Character, Integer> targetCountMap) {
        if(sourceCountMap.size() < targetCountMap.size()) {
            return false;
        }


        // t 的每个 char，s 都有大于等于的
        for(Map.Entry<Character, Integer> entry : targetCountMap.entrySet()) {
            Character tc = entry.getKey();
            Integer tCount = entry.getValue();

            Integer sCount = sourceCountMap.get(tc);
            if(sCount == null) {
                return false;
            }
            if(sCount < tCount) {
                return false;
            }
        }
        return true;

    }
```

## 效果

超出时间限制

224 / 268 个通过的测试用例

## 反思

这个属于最容易想到的解法，无任何优化。

# v2-暴力版本优化

## 思路

其实可以换一种思路，我们首先构建 targetCharCountMap

然后用滑动窗口，每入栈一个 c，就在 targetCharCountMap 中减去对应的次数；每出栈一个，则加上。

次数为零，删除这个 char 对应的 key。

那么判断条件就变成了，如果 targetCharCountMap 为空，则满足条件。

然后可以提前跳出，我们主要改进下暴力的性能。

## 实现

```java
    public String minWindow(String s, String t) {
        //
        char[] tcs = t.toCharArray();
        char[] scs = s.toCharArray();
        Map<Character, Integer> targetCountMap = new HashMap<>();
        for(char c : tcs) {
            Integer count = targetCountMap.getOrDefault(c, 0);
            count++;
            targetCountMap.put(c, count);
        }

        String result = null;
        int left = 0;
        int right = 0;
        for(left = 0; left < s.length(); left++) {
            // 然后判断
            Map<Character, Integer> tempTargetCountMap = new HashMap<>(targetCountMap);
            StringBuilder stringBuilder = new StringBuilder();

            for(right = left; right < s.length(); right++) {
                char c = scs[right];
                stringBuilder.append(c);

                Integer count = tempTargetCountMap.get(c);
                if(count != null) {
                    count--;
                    tempTargetCountMap.put(c, count);

                    if(count == 0) {
                        tempTargetCountMap.remove(c);
                    }
                }

                if(tempTargetCountMap.isEmpty()) {
                    // 满足
                    if(result == null) {
                        result = stringBuilder.toString();
                    } else {
                        if(result.length() > stringBuilder.length()) {
                            result = stringBuilder.toString();
                        }
                    }
                    // 当前循环终止
                    break;
                }
            }
        }

        // 默认为空
        if(result == null) {
            result = "";
        }
        return result;
    }
```

## 效果

超出时间限制
265 / 268 个通过的测试用例

## 反思

有一点进步，但是还不够。

那么要如何才可以优化呢？

# v3-滑动窗口

## 思路

这里慢，其实主要慢在我们必须循环两次。

但是实际上是可以优化的。

假设我们定义 left right 两个位置。right 代表当前位置，left 代表开始位置。

最核心的一点在于，如果我们只能遍历一次，在满足条件的时候，left 什么时候可以向右？

答案是：在满足条件之后，我们可以尝试 left 向右，一直到不满足，说明 left-1 的位置是最后一个满足条件的。

## 解法

```java
public String minWindow(String s, String t) {
        char[] tcs = t.toCharArray();
        final Map<Character, Integer> targetCountMap = new HashMap<>();
        for(char c : tcs) {
            Integer count = targetCountMap.getOrDefault(c, 0);
            count++;
            targetCountMap.put(c, count);
        }

        String result = null;
        int left = 0;
        Map<Character, Integer> tempMap = new HashMap<>();
        for(int right = 0; right < s.length(); right++) {
            addChar(s, right, tempMap);

            // 判断多少个字符满足条件，这里只是为了加速判断，先不做也行

            // 满足条件
            if(isMatchCondition(tempMap, targetCountMap)) {
                // 当条件满足的时候，可以尝试让 left 指针像右移动。一直到条件不符合的时候终止，此时 left 在最右边，距离最短。
                // 此时类似于模拟出栈
                while (isMatchCondition(tempMap, targetCountMap)) {
                    removeChar(s, left, tempMap);
                    left++;
                }
                // 恢复正常位置
                left--;
                addChar(s, left, tempMap);

                // 满足
                if(result == null) {
                    result = buildString(s, left, right);
                } else {
                    int len = right-left+1;
                    if(result.length() > len) {
                        result = buildString(s, left, right);
                    }
                }
            }
        }

        // 默认为空
        if(result == null) {
            result = "";
        }
        return result;
    }

    private void addChar(String s,
                            int index,
                            Map<Character, Integer> tempMap) {
        char c = s.charAt(index);
        Integer curCount = tempMap.getOrDefault(c, 0);
        curCount++;
        tempMap.put(c, curCount);
    }

    private void removeChar(String s,
                            int index,
                            Map<Character, Integer> tempMap) {
        char c = s.charAt(index);
        Integer curCount = tempMap.getOrDefault(c, 0);
        curCount--;
        tempMap.put(c, curCount);
    }

    // 这个应该也可以优化 这里为了逻辑清晰。先不优化
    private String buildString(String s, int left, int right) {
        StringBuilder stringBuilder = new StringBuilder();
        for(int i = left; i <= right; i++) {
            char c = s.charAt(i);
            stringBuilder.append(c);
        }
        return stringBuilder.toString();
    }

    // 后续可以用有多少个字符满足来加速判断，这里为了逻辑清晰。先不加。
    private boolean isMatchCondition(Map<Character, Integer> sourceCountMap,
                                     Map<Character, Integer> targetCountMap) {
        if(sourceCountMap.size() < targetCountMap.size()) {
            return false;
        }

        // t 的每个 char，s 都有大于等于的
        for(Map.Entry<Character, Integer> entry : targetCountMap.entrySet()) {
            Character tc = entry.getKey();
            Integer tCount = entry.getValue();

            Integer sCount = sourceCountMap.get(tc);
            if(sCount == null) {
                return false;
            }
            if(sCount < tCount) {
                return false;
            }
        }
        return true;

    }
```

## 效果

349ms 击败 5.66%

AC 了，但是性能很差。

## 反思

这里我们为了方便理解，加了很多基础的方法。

按理说，我们可以对这些方法都优化一下。

# v4-滑动窗口性能优化

## 优化1-满足条件判断

### 思路

我们用一个 matchCharCount 来统计多少个字符满足条件，避免判断满足条件特别慢的问题

维护更新下这个字段即可。

### 代码

```java
    public String minWindow(String s, String t) {
        char[] tcs = t.toCharArray();
        final Map<Character, Integer> targetCountMap = new HashMap<>();
        for(char c : tcs) {
            Integer count = targetCountMap.getOrDefault(c, 0);
            count++;
            targetCountMap.put(c, count);
        }

        String result = null;
        int left = 0;
        Map<Character, Integer> tempMap = new HashMap<>();
        int matchCharCount = 0;

        for(int right = 0; right < s.length(); right++) {
            // 判断多少个字符满足条件，这里只是为了加速判断，先不做也行
            char c = s.charAt(right);
            Integer curCount = tempMap.getOrDefault(c, 0);
            curCount++;
            tempMap.put(c, curCount);
            // 刚好等于时+1
            if(targetCountMap.containsKey(c)
                && targetCountMap.get(c).equals(curCount)) {
                matchCharCount++;
            }

            // 满足条件
            if(matchCharCount == targetCountMap.size()) {
                // 当条件满足的时候，可以尝试让 left 指针像右移动。一直到条件不符合的时候终止，此时 left 在最右边，距离最短。
                // 此时类似于模拟出栈
                while (matchCharCount == targetCountMap.size()) {
                    char leftChar = s.charAt(left);

                    int leftCharCount = tempMap.getOrDefault(leftChar, 0);
                    leftCharCount--;
                    tempMap.put(leftChar, leftCharCount);
                    // +1 刚好等于目标
                    if(targetCountMap.containsKey(leftChar)
                            && targetCountMap.get(leftChar).equals(leftCharCount+1)) {
                        matchCharCount--;
                    }

                    // 向右移动
                    left++;
                }
                // 恢复正常位置
                left--;
                char leftRecoveryChar = s.charAt(left);
                tempMap.put(leftRecoveryChar, targetCountMap.get(leftRecoveryChar));
                matchCharCount++;

                // 满足
                if(result == null) {
                    result = buildString(s, left, right);
                } else {
                    int len = right-left+1;
                    if(result.length() > len) {
                        result = buildString(s, left, right);
                    }
                }
            }
        }

        // 默认为空
        if(result == null) {
            result = "";
        }
        return result;
    }
```

### 效果

35ms 击败 31.70%

## 优化2-移除 stringBuilder

### 思路

其实，直接通过 `s.substring(left, right + 1)` 来计算结果更加直接。

### 实现

```java
public String minWindow(String s, String t) {
        char[] tcs = t.toCharArray();
        final Map<Character, Integer> targetCountMap = new HashMap<>();
        for(char c : tcs) {
            Integer count = targetCountMap.getOrDefault(c, 0);
            count++;
            targetCountMap.put(c, count);
        }

        String result = null;
        int left = 0;
        Map<Character, Integer> tempMap = new HashMap<>();
        int matchCharCount = 0;

        for(int right = 0; right < s.length(); right++) {
            // 判断多少个字符满足条件，这里只是为了加速判断，先不做也行
            char c = s.charAt(right);
            Integer curCount = tempMap.getOrDefault(c, 0);
            curCount++;
            tempMap.put(c, curCount);
            // 刚好等于时+1
            if(targetCountMap.containsKey(c)
                && targetCountMap.get(c).equals(curCount)) {
                matchCharCount++;
            }

            // 满足条件
            if(matchCharCount == targetCountMap.size()) {
                // 当条件满足的时候，可以尝试让 left 指针像右移动。一直到条件不符合的时候终止，此时 left 在最右边，距离最短。
                // 此时类似于模拟出栈
                while (matchCharCount == targetCountMap.size()) {
                    char leftChar = s.charAt(left);

                    int leftCharCount = tempMap.getOrDefault(leftChar, 0);
                    leftCharCount--;
                    tempMap.put(leftChar, leftCharCount);
                    // +1 刚好等于目标
                    if(targetCountMap.containsKey(leftChar)
                            && targetCountMap.get(leftChar).equals(leftCharCount+1)) {
                        matchCharCount--;
                    }

                    // 向右移动
                    left++;
                }
                // 恢复正常位置
                left--;
                char leftRecoveryChar = s.charAt(left);
                tempMap.put(leftRecoveryChar, targetCountMap.get(leftRecoveryChar));
                matchCharCount++;

                // 满足
                if(result == null) {
                    result = s.substring(left, right + 1);
                } else {
                    int len = right-left+1;
                    if(result.length() > len) {
                        result = s.substring(left, right + 1);
                    }
                }
            }
        }

        // 默认为空
        if(result == null) {
            result = "";
        }
        return result;
    }
```

### 效果

25ms 击败 36.36%

有提升，但是因为大家的算法比较优，看起来百分比不大

## 优化三-数组哈希替代 HashMap

### 思路

对于字符集合有限的，我们可以用 index 数组，来替代 hashMap。

代码也可以变得更加优雅。

### 实现

```java
    public String minWindow(String s, String t) {
        char[] tcs = t.toCharArray();
        int[] targetCountMap = new int[128];
        for(char c : tcs) {
            targetCountMap[c]++;
        }
        // 这里用 set 会更快吗？
        int targetCharSize = 0;
        for(int i = 0; i < 128; i++) {
            if(targetCountMap[i] > 0) {
                targetCharSize++;
            }
        }

        String result = null;
        int left = 0;
        int[] tempMap = new int[128];
        int matchCharCount = 0;

        for(int right = 0; right < s.length(); right++) {
            // 入
            char c = s.charAt(right);
            tempMap[c]++;
            // 刚好等于时+1
            if(targetCountMap[c] > 0
                    && targetCountMap[c] == tempMap[c]) {
                matchCharCount++;
            }

            // 满足条件
            if(matchCharCount == targetCharSize) {
                // 当条件满足的时候，可以尝试让 left 指针像右移动。一直到条件不符合的时候终止，此时 left 在最右边，距离最短。
                // 此时类似于模拟出栈
                while (matchCharCount == targetCharSize) {
                    // 移除字符
                    char leftChar = s.charAt(left);
                    tempMap[leftChar]--;
                    // +1 刚好等于目标
                    if(targetCountMap[leftChar] > 0
                            && targetCountMap[leftChar] == (tempMap[leftChar]+1)) {
                        matchCharCount--;
                    }

                    // 向右移动
                    left++;
                }
                // 恢复正常位置
                left--;
                char leftRecoveryChar = s.charAt(left);
                tempMap[leftRecoveryChar] = targetCountMap[leftRecoveryChar] ;
                matchCharCount++;

                // 满足
                if(result == null) {
                    result = s.substring(left, right + 1);
                } else {
                    int len = right-left+1;
                    if(result.length() > len) {
                        result = s.substring(left, right + 1);
                    }
                }
            }
        }

        // 默认为空
        if(result == null) {
            result = "";
        }
        return result;
    }
```

### 效果

4ms 击败 78.39%

此时已经是第一梯队的算法。

可以发现，同样的算法，使用基本类型，其实性能提升非常大。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}