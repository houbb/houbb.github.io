---
layout: post
title: leetcode 技巧篇专题之哈希 Hashing 02-TOP100 49. 字母异位词分组
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, hashing, top100, sf]
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

# 技巧篇

双指针

滑动窗口

位运算--状态压缩

扫描线

前缀和

哈希哈数--滚动哈希

计数

# 49. 字母异位词分组

给你一个字符串数组，请你将 字母异位词 组合在一起。

可以按任意顺序返回结果列表。

示例 1:

输入: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]

输出: [["bat"],["nat","tan"],["ate","eat","tea"]]

解释：

在 strs 中没有字符串可以通过重新排列来形成 "bat"。
字符串 "nat" 和 "tan" 是字母异位词，因为它们可以重新排列以形成彼此。
字符串 "ate" ，"eat" 和 "tea" 是字母异位词，因为它们可以重新排列以形成彼此。


示例 2:

输入: strs = [""]
输出: [[""]]

示例 3:

输入: strs = ["a"]
输出: [["a"]]

提示：

1 <= strs.length <= 10^4

0 <= strs[i].length <= 100

strs[i] 仅包含小写字母

# v1-哈希

## 思路

运用哈希，进行最朴素的处理。

## 实现

```java
public List<List<String>> groupAnagrams(String[] strs) {
        // 处理
        Map<String, List<String>> map = new HashMap<>();

        for(String str : strs) {
            // 构建 Key
            char[] chars = str.toCharArray();
            Map<Character, Integer> charCountMap = new HashMap<>();
            for(char c : chars) {
                Integer count = charCountMap.getOrDefault(c, 0);
                count++;
                charCountMap.put(c, count);
            }

            // 直接序列化可能不一致
//            String key = charCountMap.toString();
            String key = buildKey(charCountMap);

            List<String> stringList = map.getOrDefault(key, new ArrayList<>());
            stringList.add(str);

            map.put(key, stringList);
        }

        // 构建结果
        List<List<String>> resultList = new ArrayList<>(map.size());
        resultList.addAll(map.values());

        return resultList;
    }

    private String buildKey(Map<Character, Integer> charCountMap) {
        StringBuilder stringBuilder =  new StringBuilder();

        for(int i = 0; i < 26; i++) {
            char c = (char) (i+'a');
            Integer count = charCountMap.get(c);
            if(count != null) {
                stringBuilder.append(c).append(count).append(";");
            }
        }
        return stringBuilder.toString();
    }
```

## 效果

26 ms 击败 5.30%

## 反思

性能比较差。

charCountMap 和 buildKey 过于浪费时间。

# v2-哈希优化

## 思路

我们可以对 charCountMap 和 buildKey 这两个部分做一下优化。

1）我们用 int[] 来替代，因为都是小写字母。利用 `-a` 可以降低到 26

2）buildKey 不再使用，而是通过 Arrays.toString() 构建 key


## 实现

```java
public List<List<String>> groupAnagrams(String[] strs) {
        // 处理
        Map<String, List<String>> map = new HashMap<>();

        for(String str : strs) {
            // 构建 Key
            char[] chars = str.toCharArray();
            int[] charCountMap = new int[26];
            for(char c : chars) {
                int ix = c - 'a';
                charCountMap[ix]++;
            }

            // 此时顺序是固定的，所以应该相等。
            // 也可以用比较数组，但是需要序列化
            String key = Arrays.toString(charCountMap);

            List<String> stringList = map.getOrDefault(key, new ArrayList<>());
            stringList.add(str);

            map.put(key, stringList);
        }

        // 构建结果
        List<List<String>> resultList = new ArrayList<>(map.size());
        resultList.addAll(map.values());

        return resultList;
    }
```

## 效果

25 ms 击败 5.53%

## 反思

差异竟然不大，震惊。

## 优化1-优化 key 的构建

### 思路

自己用 stringBuilder 构建数组，而不是一来 `Arrays.toString()`

```java
StringBuilder keyBuilder = new StringBuilder();
for(int i : charCountMap) {
    keyBuilder.append(i).append(',');
}
String key = keyBuilder.toString();
```

### 效果

16ms 10.20%

### 反思

看来还是不能太相信 jdk 的方法，时间差异还是比较大的。


## 优化2:避免集合的重复创建

### 思路

虽然我们的写法比较方便理解，但是最后又创建了一遍集合。

有没有方法避免呢？

有的，我们给 key 保存一个 index 的映射，直接把数据放在结果中。

### 实现

```java
public List<List<String>> groupAnagrams(String[] strs) {
        // 处理
        List<List<String>> resultList = new ArrayList<>();
        Map<String, Integer> keyIndexMap = new HashMap<>();

        for(String str : strs) {
            // 构建 Key
            char[] chars = str.toCharArray();
            int[] charCountMap = new int[26];
            for(char c : chars) {
                int ix = c - 'a';
                charCountMap[ix]++;
            }

            // 此时顺序是固定的，所以应该相等。
            // 也可以用比较数组，但是需要序列化
            // 改为自己拼接
            StringBuilder keyBuilder = new StringBuilder();
            for(int i : charCountMap) {
                keyBuilder.append(i).append(',');
            }
            String key = keyBuilder.toString();

            // 是否存在
            if(keyIndexMap.containsKey(key)) {
                Integer index = keyIndexMap.get(key);
                resultList.get(index).add(str);
            } else {
                // 不存在
                List<String> stringList = new ArrayList<>();
                stringList.add(str);
                resultList.add(stringList);
                keyIndexMap.put(key, resultList.size()-1);
            }
        }

        return resultList;
    }
```

### 效果

16 ms 击败 10.20%

### 反思

竟然区别不大？！


# v3-排序

## 思路

我们对字符串进行排序？

然后直接构建 key

## 实现

```java
public List<List<String>> groupAnagrams(String[] strs) {
        // 处理
        List<List<String>> resultList = new ArrayList<>();
        Map<String, Integer> keyIndexMap = new HashMap<>();

        for(String str : strs) {
            // 构建 Key
            char[] chars = str.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);

            // 是否存在
            if(keyIndexMap.containsKey(key)) {
                Integer index = keyIndexMap.get(key);
                resultList.get(index).add(str);
            } else {
                // 不存在
                List<String> stringList = new ArrayList<>();
                stringList.add(str);
                resultList.add(stringList);
                keyIndexMap.put(key, resultList.size()-1);
            }
        }

        return resultList;
    }
```

## 效果

6ms 击败 98.92%

## 反思

这里可以发现，慢在 key 的构建

因为排序肯定是低于我们上面的计数排序的。

# v4-计数排序+String 构建

## 思路

我们排序依然用技术排序，不过数组直接用 char

让其可以直接构建为 string

## 实现

```java
    public List<List<String>> groupAnagrams(String[] strs) {
        // 处理
        List<List<String>> resultList = new ArrayList<>();
        Map<String, Integer> keyIndexMap = new HashMap<>();

        for(String str : strs) {
            // 构建 Key
            char[] chars = str.toCharArray();
            char[] charCountMap = new char[26];
            for(char c : chars) {
                int ix = c - 'a';
                charCountMap[ix]++;
            }

            // 此时顺序是固定的，直接用 string 更快
            String key = new String(charCountMap);

            // 是否存在
            if(keyIndexMap.containsKey(key)) {
                Integer index = keyIndexMap.get(key);
                resultList.get(index).add(str);
            } else {
                // 不存在
                List<String> stringList = new ArrayList<>();
                stringList.add(str);
                resultList.add(stringList);
                keyIndexMap.put(key, resultList.size()-1);
            }
        }

        return resultList;
    }
```

## 效果

5ms 击败 99.72%

## 反思

归根到底，可以看到 key 的构建影响特别大。


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将继续学习 TOP100，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}