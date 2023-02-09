---
layout: post
title: 【leetcode】03-leetcode 3. 无重复字符的最长子串 Longest Substring Without Repeating Characters
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, leetcode, sf]
published: true
---

# 3. 无重复字符的最长子串

给定一个字符串 s ，请你找出其中不含有重复字符的 最长子串 的长度。

## 例子

示例 1:

```
输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

示例 2:

```
输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。
```

示例 3:

```
输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
``` 

## 提示：

0 <= s.length <= 5 * 10^4

s 由英文字母、数字、符号和空格组成

# V1-基本方法

## 思路

容易想到的就是两层遍历。

i 从 0 开始，j 从 i 及后面的位置开始，判断 s[i,j] 对应的子串 s1 不存在重复字符的最大长度。

是否存在重复字符的方法，可以通过 Set 集合。

## java 实现

```java
    /**
     * 获取最长字符的长度
     * @date 2020-6-9 16:08:57
     * @param s 字符串
     * @return 结果
     */
    public int lengthOfLongestSubstring(String s) {
        int maxLength = 0;

        // 元素开始的下标
        for(int i = 0; i < s.length(); i++) {

            // 循环
            Set<Character> characters = new HashSet<>();
            for(int j = i; j < s.length(); j++) {
                char currentChar = s.charAt(j);

                // 如果元素重复
                if(characters.contains(currentChar)) {
                    maxLength = Math.max(characters.size(), maxLength);
                    // 跳过当前循环
                    break;
                }

                // 正常添加元素
                characters.add(s.charAt(j));

                // 如果已经走到了最后一位
                // 说明是最长的一位
                if(j == (s.length()-1)) {
                    return Math.max(maxLength, characters.size());
                }
            }
        }

        return maxLength;
    }
```

## 效果

[效果如下](https://leetcode.com/problems/longest-substring-without-repeating-characters/submissions/351174223/)

```
Runtime: 121 ms, faster than 15.97% of Java online submissions for Longest Substring Without Repeating Characters.
Memory Usage: 40.3 MB, less than 100% of Java online submissions for Longest Substring Without Repeating Characters.
```

# V2-滑动窗口

## 思路

优化思想：最外层 i 的自增是可以优化的。

i 在遍历的时候，直接走到最新的位置。并且保存上一个最大的距离。

```
abcdee
abcdaefgi
[i, j]
j-i+1 获取最长字串的长度。
i 初始位置遍历
j 当前 char 位置
```

## java 实现

我们引入 indexMap 记录一个字符和其对应的 char 位置 + 1。

如果发现 indexMap 已经包含了当前的 char，那么直接让 `i = Math.max(i, indexMap.get(currentChar));`。这样才能保证在 [i, j] 中没有重复的字符。

那么最大的长度就是：`maxLength = Math.max(maxLength, j-i+1);`

```java
    public int lengthOfLongestSubstring(String s) {
        int maxLength = 0;

        final int length = s.length();
        Map<Character, Integer> indexMap = new HashMap<>(length);
        for(int i = 0,j = 0; j < length; j++) {
            char currentChar = s.charAt(j);
            if(indexMap.containsKey(currentChar)) {
                // 重复，直接更新 i 的位置到最大的 max(i, j+1)
                // 这里的 indexMap.get(currentChar) 获取到的是上一次出现该元素的位置+1
                // 这里到底快了多少呢？
                i = Math.max(i, indexMap.get(currentChar));
            }

            maxLength = Math.max(maxLength, j-i+1);
            // 对应的元素位置，是下一个
            indexMap.put(currentChar, j+1);
        }

        return maxLength;
    }
```

## 效果

时间复杂度直接从 O(N^2) 优化到了 O(N)。

[效果如下](https://leetcode.com/problems/longest-substring-without-repeating-characters/submissions/351187376/)

```
Runtime: 5 ms, faster than 92.58% of Java online submissions for Longest Substring Without Repeating Characters.
Memory Usage: 39.3 MB, less than 100% of Java online submissions for Longest Substring Without Repeating Characters.
```

那么，还可以进一步优化吗？

# V3-内存优化

## 思路

在字符类的题目中，我们使用 hashmap 保存字符和位置的关系。

因为 hashmap 的操作都是 O(1) 的复杂度。

那么，有更加轻量的方式，让代码看起来更加优雅吗？

答案就是数组，直接使用 int 数组，让 char 转换为 int，设置对应的 value 即可。

这个在后续的算法题中，会经常见到。

## java 实现

```java
    /**
     * 假设字符是固定的
     *
     * 这里的原理就是把 char 当做数组的下标，访问时为 O(1)
     * 优点：快速 && 节约内存
     *
     * 其他的和上面的方法一样。
     *
     * 
     * @param s 字符串
     * @return 结果
     * @since v3
     */
    public int lengthOfLongestSubstring(String s) {
        int[] chars = new int[128];
        int maxLength = 0;

        for(int i = 0,j = 0; j < s.length(); j++) {
            char currentChar = s.charAt(j);

            // 有值的情况
            i = Math.max(chars[currentChar], i);

            // 这里临时值的计算优化基本为 0
            int temp = j+1;
            maxLength = Math.max(maxLength, temp-i);
            chars[currentChar] = temp;
        }

        return maxLength;
    }
```

## 效果

[效果如下](https://leetcode.com/problems/longest-substring-without-repeating-characters/submissions/351189700/)

```
Runtime: 2 ms, faster than 99.95% of Java online submissions for Longest Substring Without Repeating Characters.
Memory Usage: 39.4 MB, less than 100% of Java online submissions for Longest Substring Without Repeating Characters.
```

# 小结

我们日常工作中，基本是采用第一种方式居多。

不过要善于思考，体验一下第二种方式和第三种的妙处。

进一寸有进一寸的欢喜。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.cn/problems/add-two-numbers/

* any list
{:toc}