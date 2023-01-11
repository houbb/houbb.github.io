---
layout: post
title: leetcode 76 Minimum Window Substring 
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, backtrack, sh]
published: true
---

# 76. Minimum Window Substring

Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. 

If there is no such substring, return the empty string "".

The testcases will be generated such that the answer is unique.

## EX

Example 1:

```
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.
```

Example 2:

```
Input: s = "a", t = "a"
Output: "a"
Explanation: The entire string s is the minimum window.
```

Example 3:

```
Input: s = "a", t = "aa"
Output: ""
Explanation: Both 'a's from t must be included in the window.
Since the largest window of s only has one 'a', return empty string.
```

PS: 这个要注意下，其实就是匹配每次都会消耗一个字母。

## Constraints:

m == s.length

n == t.length

1 <= m, n <= 10^5

s and t consist of uppercase and lowercase English letters.

Follow up: Could you find an algorithm that runs in O(m + n) time?


# V1-基本思路

## 思路

我们可以通过固定步长，遍历 s。

然后和 t 对比。

对比的时候可以把 t 拆分为 HashMap，key 是当前 char，value 为出现的次数。

## 实现

```java
import java.util.HashMap;
import java.util.Map;

public class T076_MinimumWindowSubstring {

    /**
     * 通过 step 的方式判断
     *
     * 
     *
     * @param s 原始
     * @param t 目标
     * @return 结果
     */
    public String minWindow(String s, String t) {
        if(s.length() < t.length()) {
            return "";
        }


        // 从头开始遍历
        for(int stepLen = t.length(); stepLen <= s.length(); stepLen++) {
            for(int i = 0; i <= s.length() - stepLen; i++) {
                // 是否匹配
                String matchString = matchString(s, i, i + stepLen, t);
                if(matchString.length() > 0) {
                    return matchString;
                }
            }
        }

        return "";
    }

    /**
     * 匹配完之后，要剔除掉。
     * @param sourceString
     * @param target
     * @return
     */
    private String matchString(String sourceString,
                               int startIndex,
                               int endIndex,
                               String target) {
        StringBuilder stringBuilder = new StringBuilder();

        // 是否包含所有的字符？
        Map<Character, Integer> map = new HashMap<>();
        for(int i = startIndex; i < endIndex; i++) {
            char c = sourceString.charAt(i);
            stringBuilder.append(c);

            Integer count = map.get(c);
            if(count == null) {
                count = 0;
            }
            count++;
            map.put(c, count);
        }

        // 如果匹配
        for(char c : target.toCharArray()) {
            Integer count = map.get(c);
            if(count == null
                || count <= 0) {
                return "";
            }

            count--;
            map.put(c, count);
        }


        return stringBuilder.toString();
    }

}
```

264 / 267 TEL 超时

# V2-一点改进

## 思路

我们上面有一些浪费。

其实 target 目标字符串是不变的，可以先初始化对应的 hashmap 统计 char 出现的次数。

原始 source 字符串，也可以做一些优化。

在一个步长 stepLen 以内，如果逐步向后的话，比如步长为 4，字符串 s = 'ABCDEFG'

从前往后，每次的内容分别是

```
ABCD
 BCDE
  CDEF
   DEFG    
```

第一次，是把 [0, stepLen] 内的字符串放入，后面逐步的话，可以把第一个位置的移除，加入新的即可。

这样的话 hashmap 的次数统计只需要 2 个变化即可。

## 实现

```java
import java.util.HashMap;
import java.util.Map;

public class T076_MinimumWindowSubstringV2 {

    /**
     * 通过 step 的方式判断
     * 
     *
     * @param s 原始
     * @param t 目标
     * @return 结果
     */
    public String minWindow(String s, String t) {
        if (s.length() < t.length()) {
            return "";
        }

        // 构建 t 的 hashMap，而不是每次都去构建
        Map<Character, Integer> targetMap = new HashMap<>();
        // 如果匹配
        for (char c : t.toCharArray()) {
            Integer count = targetMap.get(c);
            if (count == null) {
                count = 0;
            }

            count++;
            targetMap.put(c, count);
        }

        // 从头开始遍历
        // 这里调整一下，为了复用 sourceMap

        Map<Character, Integer> sourceMap = new HashMap<>();

        // 固定步长考虑，这样步长最小的时候，可以优先获取答案。
        for (int stepLen = t.length(); stepLen <= s.length(); stepLen++) {

            // 清空
            sourceMap = new HashMap<>();

            // 遍历字符串
            // 从 stepLen-1 开始
            for (int i = stepLen-1; i < s.length(); i++) {
                // 如何复用上一次的结果呢？
                //[0.3] [1,4] 其实只有第一个位置发生了变化

                //如果是开始，把 [0, stepLen] 的元素都放进来。
                if (i == (stepLen-1)) {
                    for (int k = 0; k < stepLen; k++) {
                        Character sc = s.charAt(k);
                        Integer count = sourceMap.getOrDefault(sc, 0);
                        sourceMap.put(sc, count + 1);
                    }

                    if (isValid(sourceMap, targetMap)) {
                        // 截取开头
                        return s.substring(0, stepLen);
                    }
                } else {
                    // 如果不是，则需要移除 i-1 的元素，加入 i + len 的元素。更新 map
                    Character lastChar = s.charAt(i - stepLen);
                    Integer lastCount = sourceMap.getOrDefault(lastChar, 0);
                    sourceMap.put(lastChar, lastCount - 1);

                    // 加入新的
                    Character newChar = s.charAt(i);
                    Integer newCount = sourceMap.getOrDefault(newChar, 0);
                    sourceMap.put(newChar, newCount + 1);

                    if (isValid(sourceMap, targetMap)) {
                        return s.substring(i+1-stepLen, i+1);
                    }
                }
            }
        }

        return "";
    }

    /**
     * 匹配完之后
     *
     * @param sourceMap 原始
     * @param targetMap t 对应的 map
     * @return
     */
    private boolean isValid(Map<Character, Integer> sourceMap, Map<Character, Integer> targetMap) {
        // 如果匹配
        for (Map.Entry<Character, Integer> entry : targetMap.entrySet()) {
            Character character = entry.getKey();
            Integer count = entry.getValue();

            // 不够
            Integer sourceCount = sourceMap.get(character);
            if (sourceCount == null || sourceCount < count) {
                return false;
            }
        }

        return true;
    }

}
```

265 / 267 TEL 超时

然后看了下 265 的测试用例，直接 s 都超过 65535 了。

也就是这一题，没有实现 O(m+n) 这一题就算不可解。

# V3-HashMap + Two Pointers

## 思路


和上面类似，但是我们要调整一下，使用双指针解决这个问题。

我们定义两个 map，分别存放 s, t 对应的 char 和 count

1) 初始化 tMap

直接遍历，初始化即可

```java
tMap.put(each, tMap.getOrDefault(each, 0) + 1);
```


2) 逻辑处理

初始化：

```java
int tSize = tMap.size();
int sSize = 0;
int left = 0;
int minLeft = -1;
int minRight = -1;
int result = Integer.MAX_VALUE;
```

我们从 0 开始，遍历 s。

```java
for (int right = 0; right < s.length(); right++) {
    // 这个把 char 的次数更新
    char cur = s.charAt(right);
    int count = sMap.getOrDefault(cur, 0) + 1;
    sMap.put(cur, count);


    // 如果 t 中有这个字符，且 s 中的字符已经满足，则 s++。
    // 这里需要通过 intValue 对比，因为 Interger 是一个对象，需要用 equals 对比。
    if (tMap.containsKey(cur) && tMap.get(cur).intValue() == sMap.get(cur).intValue()) {
        sSize++;
    }

    // 进一步处理
}
```

3) 进一步处理

left、right 对应 s 的左右位置的指针。

`sSize == tSize` 才会进入这个循环，也就是进入循环的时候，s从 `[0, right]` 这个范围内，有目标 t 的所有字符且次数刚好相同。

我们就是需要从 left 左边到右边开始寻找，找到最短的字符串。

```java
while (left <= right && sSize == tSize) {
    // 更新一下 left/right 位置
    if (right - left + 1 < result) {
        minLeft = left;
        minRight = right;
        result = right - left + 1;
    }

    // 更新次数
    char leftCur = s.charAt(left);
    int leftCount = sMap.get(leftCur) - 1;
    sMap.put(leftCur, leftCount);

    if (tMap.containsKey(leftCur)
            && sMap.get(leftCur) < tMap.get(leftCur)) {
        // 不满足时，sSize--。
        sSize--;
    }

    left++;
}
```

## java 实现

完整的实现如下：

```java
    public String minWindow(String s, String t) {
        // *Important* use intValue to compare values stored in the map
        HashMap<Character, Integer> sMap = new HashMap<>();
        HashMap<Character, Integer> tMap = new HashMap<>();

        for (char each : t.toCharArray()) {
            tMap.put(each, tMap.getOrDefault(each, 0) + 1);
        }

        int tSize = tMap.size();
        int sSize = 0;
        int left = 0;
        int minLeft = -1;
        int minRight = -1;
        int result = Integer.MAX_VALUE;

        for (int right = 0; right < s.length(); right++) {
            char cur = s.charAt(right);
            int count = sMap.getOrDefault(cur, 0) + 1;
            sMap.put(cur, count);
            if (tMap.containsKey(cur) && tMap.get(cur).intValue() == sMap.get(cur).intValue()) {
                sSize++;
            }
            while (left <= right && sSize == tSize) {
                if (right - left + 1 < result) {
                    minLeft = left;
                    minRight = right;
                    result = right - left + 1;
                }
                char leftCur = s.charAt(left);
                int leftCount = sMap.get(leftCur) - 1;
                sMap.put(leftCur, leftCount);

                if (tMap.containsKey(leftCur)
                        && sMap.get(leftCur) < tMap.get(leftCur)) {
                    sSize--;
                }
                left++;
            }
        }
        return result == Integer.MAX_VALUE ? "" : s.substring(minLeft, minRight + 1);
    }
```

# 归纳总结

[Here is a 10-line template that can solve most 'substring' problems](https://leetcode.com/problems/minimum-window-substring/solutions/26808/here-is-a-10-line-template-that-can-solve-most-substring-problems/) 这篇文章写的比较好。

我将首先给出解决方案，然后向您展示魔术模板。

## 76 题目的解法

解决这个问题的代码如下。 

它可能是讨论中提供的所有解决方案中最短的（但是不好理解，各种 ++--）。

```c
    string minWindow(string s, string t) {
        vector<int> map(128,0);
        for(auto c: t) map[c]++;
        int counter=t.size(), begin=0, end=0, d=INT_MAX, head=0;
        while(end<s.size()){
            if(map[s[end++]]-->0) counter--; //in t
            while(counter==0){ //valid
                if(end-begin<d)  d=end-(head=begin);
                if(map[s[begin++]]++==0) counter++;  //make it invalid
            }  
        }
        return d==INT_MAX? "":s.substr(head, d);
    }
```


## 解题模板

模板来了。

对于大多数子串问题，给定一个字符串，我们需要找到它的一个满足某些限制的子串。 

一种通用的方法是使用一个由两个指针辅助的哈希图。 

模板如下。

```c
int findSubstring(string s){
        vector<int> map(128,0);
        int counter; // check whether the substring is valid
        int begin=0, end=0; //two pointers, one point to tail and one  head
        int d; //the length of substring

        for() { /* initialize the hash map here */ }

        while(end<s.size()){

            if(map[s[end++]]-- ?){  /* modify counter here */ }

            while(/* counter condition */){ 
                 
                 /* update d here if finding minimum*/

                //increase begin to make it invalid/valid again
                
                if(map[s[begin++]]++ ?){ /*modify counter here*/ }
            }  

            /* update d here if finding maximum*/
        }
        return d;
  }
```

PS: `vector<int> map(128,0);` 可以替代 HashMap 的场景是在可见的 128 个字符时，一般是够用的。而且更新起来比较简单。但是比较复杂的场景，还是建议使用 HashMap。

其他的解法，暂时不放在这里，我们后续会继续几个类似的题目。

# 参考资料

https://leetcode.com/problems/minimum-window-substring/solutions/2731308/java-hashmap-two-pointers-easy-to-understand/

https://leetcode.com/problems/edit-distance/description/

https://en.wikipedia.org/wiki/Levenshtein_distance

https://web.stanford.edu/class/cs124/lec/med.pdf

* any list
{:toc}