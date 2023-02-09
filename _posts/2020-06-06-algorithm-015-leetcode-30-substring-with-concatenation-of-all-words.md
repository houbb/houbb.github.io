---
layout: post
title: 【leetcode】015-30.串联所有单词的子串 Substring with Concatenation of All Words
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [Algorithm, data-struct, leetcode, sf]
published: true
---

## 串联所有单词的子串

给定一个字符串 s 和一些长度相同的单词 words。找出 s 中恰好可以由 words 中所有单词串联形成的子串的起始位置。

注意子串要与 words 中的单词完全匹配，中间不能有其他字符，但不需要考虑 words 中单词串联的顺序。

示例 1：

```
输入：
  s = "barfoothefoobarman",
  words = ["foo","bar"]
输出：[0,9]
解释：
从索引 0 和 9 开始的子串分别是 "barfoo" 和 "foobar" 。
输出的顺序不重要, [9,0] 也是有效答案。
```

示例 2：

```
输入：
  s = "wordgoodgoodgoodbestword",
  words = ["word","good","best","word"]
输出：[]
```

## 解法1

### 思路

最简单的思路就是对整个字符串进行遍历，获取到对应的所有符合条件的结果保存起来。

![image](https://user-images.githubusercontent.com/18375710/85977830-ece61980-ba0f-11ea-8109-c6e4ff7a5cc8.png)


核心难题：如何判断是否匹配呢？

由于子串包含的单词顺序并不需要固定，如果是两个单词 A，B，我们只需要判断子串是否是 AB 或者 BA 即可。如果是三个单词 A，B，C 也还好，只需要判断子串是否是 ABC，或者 ACB，BAC，BCA，CAB，CBA 就可以了，但如果更多单词呢？那就崩溃了。

不过好在字符串的长度固定，我们可以利用 HashMap 来简化实现。

（1）将目标数组的字符串作为 key，出现次数作为 value

（2）将截取的字符串，按照固定长度截取，类似（1）的方法组成 map。如果二者的 key/value 都能一一对应，说明是匹配的。

### java 实现

```java
public List<Integer> findSubstring(String s, String[] words) {
    List<Integer> resultList = new ArrayList<>();
    //fast-fail
    if(words.length == 0) {
        return resultList;
    }
    Map<String, Integer> targetMap = buildTargetMap(words);
    int wordLength = words[0].length();
    int totalLength = words.length * wordLength;
    for(int i = 0; i <= s.length() - totalLength; i++) {
        String subText = s.substring(i, totalLength+i);
        Map<String, Integer> subMap = buildSubMap(subText, wordLength);
        if(isMatch(targetMap, subMap)) {
            resultList.add(i);
        }
    }
    return resultList;
}

private boolean isMatch(final Map<String, Integer> targetMap,
                        final Map<String, Integer> subMap) {
    for(Map.Entry<String, Integer> entry : targetMap.entrySet()) {
        String word = entry.getKey();
        Integer targetCounter = entry.getValue();
        Integer subCounter = subMap.get(word);
        // 判断是否匹配
        if(!targetCounter.equals(subCounter)) {
            return false;
        }
    }
    return true;
}

private Map<String, Integer> buildSubMap(String subText, int wordLength) {
    int size = subText.length() / wordLength;
    Map<String, Integer> map = new HashMap<>(size);
    for(int i = 0; i < subText.length(); i += wordLength) {
        String word = subText.substring(i, i+wordLength);
        Integer counter = map.get(word);
        if(counter == null) {
            counter = 0;
        }
        counter++;
        map.put(word, counter);
    }
    return map;
}

private Map<String, Integer> buildTargetMap(String[] words) {
    Map<String, Integer> map = new HashMap<>(words.length);
    for(String word : words) {
        Integer counter = map.get(word);
        if(counter == null) {
            counter = 0;
        }
        counter++;
        map.put(word, counter);
    }
    return map;
}
```

ps: 这个实现写的比较繁琐，只是为了便于理解。

### 效果

```
Runtime: 211 ms, faster than 32.43% of Java online submissions for Substring with Concatenation of All Words.
Memory Usage: 40 MB, less than 64.21% of Java online submissions for Substring with Concatenation of All Words.
```

很显然，我们对于这个结果是不满意的。

## 解法二

### 思路

我们对于逐个字符遍历的方式，可以做下改变。

我们每次移动数组中的字符串总长度，通过控制开始开始位置来保证完全遍历。

比如 words = ["hello", "world"]

我们移动位置如下：

```
0 10 20 ...
1 11 21 ...
2 12 22 ...
3 13 23 ...
4 14 24 ...
```

### java 实现

```java
public List<Integer> findSubstring(String s, String[] words) {
    List<Integer> resultList = new ArrayList<>();
    //fast-fail
    if (words.length == 0) {
        return resultList;
    }
    Map<String, Integer> targetMap = buildTargetMap(words);
    int wordLength = words[0].length();
    int totalLength = words.length * wordLength;
    for (int i = 0; i < wordLength; i++) {
        for (int j = i; j <= s.length() - totalLength; j += wordLength) {
            String subText = s.substring(j, totalLength + j);
            Map<String, Integer> subMap = buildSubMap(subText, wordLength);
            if (isMatch(targetMap, subMap)) {
                resultList.add(j);
            }
        }
    }
    return resultList;
}

private boolean isMatch(final Map<String, Integer> targetMap,
                        final Map<String, Integer> subMap) {
    for (Map.Entry<String, Integer> entry : targetMap.entrySet()) {
        String word = entry.getKey();
        Integer targetCounter = entry.getValue();
        Integer subCounter = subMap.get(word);
        // 判断是否匹配
        if (!targetCounter.equals(subCounter)) {
            return false;
        }
    }
    return true;
}

private Map<String, Integer> buildSubMap(String subText, int wordLength) {
    int size = subText.length() / wordLength;
    Map<String, Integer> map = new HashMap<>(size);
    for (int i = 0; i < subText.length(); i += wordLength) {
        String word = subText.substring(i, i + wordLength);
        Integer counter = map.getOrDefault(word, 0) + 1;
        map.put(word, counter);
    }
    return map;
}

private Map<String, Integer> buildTargetMap(String[] words) {
    Map<String, Integer> map = new HashMap<>(words.length);
    for (String word : words) {
        Integer counter = map.getOrDefault(word, 0) + 1;
        map.put(word, counter);
    }
    return map;
}
```

### 效果

```
Runtime: 205 ms, faster than 33.12% of Java online submissions for Substring with Concatenation of All Words.
Memory Usage: 40.1 MB, less than 62.91% of Java online submissions for Substring with Concatenation of All Words.
```

虽然是提供了不同的解法，但是性能依然没有太大的提升。

不过写到这里，对 KMP 算法有了解的小伙伴肯定会有自己的想法了，可以跳过一些情况吗？

下面我们就来看看哪些情况是可以优化改进的。

## 算法优化

### 思路

主要有三种需要优化的情况。

（1）情况一：当子串完全匹配，移动到下一个子串的时候。

![image](https://user-images.githubusercontent.com/18375710/85978643-b90bf380-ba11-11ea-854e-b7a8893d1f44.png)

在解法一中，对于 i = 3 的子串，我们肯定是从第一个 foo 开始判断。

但其实前两个 foo 都不用判断了 ，因为在判断上一个 i = 0 的子串的时候我们已经判断过了。

所以解法一中的 HashMap2 每次并不需要清空从 0 开始，而是可以只移除之前 i = 0 子串的第一个单词 bar 即可，然后直接从箭头所指的 foo 开始就可以了。

（2）情况二：当判断过程中，出现不符合的单词。

![image](https://user-images.githubusercontent.com/18375710/85978812-1142f580-ba12-11ea-855b-fe5dce92331c.png)

但判断 i = 0 的子串的时候，出现了 the ，并不在所给的单词中。所以此时 i = 3，i = 6 的子串，我们其实并不需要判断了。

我们直接判断 i = 9 的情况就可以了。

（3）情况三：判断过程中，出现的是符合的单词，但是次数超了。

![image](https://user-images.githubusercontent.com/18375710/85978951-3e8fa380-ba12-11ea-98b7-f456ab755762.png)

对于 i = 0 的子串，此时判断的 bar 其实是在 words 中的，但是之前已经出现了一次 bar，所以 i = 0 的子串是不符合要求的。

此时我们只需要往后移动窗口，i = 3 的子串将 foo 移除，此时子串中一定还是有两个 bar，所以该子串也一定不符合。

接着往后移动，当之前的 bar 被移除后，此时 i = 6 的子串，就可以接着按正常的方法判断了。

所以对于出现 i = 0 的子串的情况，我们可以直接从 HashMap2 中依次移除单词，当移除了之前次数超的单词的时候，我们就可以正常判断了，直接从移除了超出了次数的单词后，也就是 i = 6 开始判断就可以了。

### java 实现

```java
public List<Integer> findSubstring(String s, String[] words) {
    List<Integer> res = new ArrayList<Integer>();
    int wordNum = words.length;
    if (wordNum == 0) {
        return res;
    }
    int wordLen = words[0].length();
    HashMap<String, Integer> allWords = new HashMap<String, Integer>();
    for (String w : words) {
        int value = allWords.getOrDefault(w, 0);
        allWords.put(w, value + 1);
    }
    //将所有移动分成 wordLen 类情况
    for (int j = 0; j < wordLen; j++) {
        HashMap<String, Integer> hasWords = new HashMap<String, Integer>();
        int num = 0; //记录当前 HashMap2（这里的 hasWords 变量）中有多少个单词
		//每次移动一个单词长度
        for (int i = j; i < s.length() - wordNum * wordLen + 1; i = i + wordLen) {
            boolean hasRemoved = false; //防止情况三移除后，情况一继续移除
            while (num < wordNum) {
                String word = s.substring(i + num * wordLen, i + (num + 1) * wordLen);
                if (allWords.containsKey(word)) {
                    int value = hasWords.getOrDefault(word, 0);
                    hasWords.put(word, value + 1);
                    //出现情况三，遇到了符合的单词，但是次数超了
                    if (hasWords.get(word) > allWords.get(word)) {
                        // hasWords.put(word, value);
                        hasRemoved = true;
                        int removeNum = 0;
                        //一直移除单词，直到次数符合了
                        while (hasWords.get(word) > allWords.get(word)) {
                            String firstWord = s.substring(i + removeNum * wordLen, i + (removeNum + 1) * wordLen);
                            int v = hasWords.get(firstWord);
                            hasWords.put(firstWord, v - 1);
                            removeNum++;
                        }
                        num = num - removeNum + 1; //加 1 是因为我们把当前单词加入到了 HashMap 2 中
                        i = i + (removeNum - 1) * wordLen; //这里依旧是考虑到了最外层的 for 循环，看情况二的解释
                        break;
                    }
                //出现情况二，遇到了不匹配的单词，直接将 i 移动到该单词的后边（但其实这里
                //只是移动到了出现问题单词的地方，因为最外层有 for 循环， i 还会移动一个单词
                //然后刚好就移动到了单词后边）
                } else {
                    hasWords.clear();
                    i = i + num * wordLen;
                    num = 0;
                    break;
                }
                num++;
            }
            if (num == wordNum) {
                res.add(i);

            }
            //出现情况一，子串完全匹配，我们将上一个子串的第一个单词从 HashMap2 中移除
            if (num > 0 && !hasRemoved) {
                String firstWord = s.substring(i, i + wordLen);
                int v = hasWords.get(firstWord);
                hasWords.put(firstWord, v - 1);
                num = num - 1;
            }

        }

    }
    return res;
}
```

### 效果

```
Runtime: 5 ms, faster than 96.75% of Java online submissions for Substring with Concatenation of All Words.
Memory Usage: 40 MB, less than 64.75% of Java online submissions for Substring with Concatenation of All Words.
```

事实证明，这个优化效果还是很显著的。

不过实际面试中我们可能无法思考这么全面，但至少应该有类似的优化思路。

下面我们来看一下类似的实现。

## 大道至简

### 思路

上述的优化结果看起来很棒，但是可以简化吗？

答案是肯定的，至少我们可以让代码看起来简洁一些。

### java 实现

```java
public List<Integer> findSubstring(String s, String[] words) {
    List<Integer> resultList = new ArrayList<>();
    //fast-fail
    if (s == null || words == null || words.length == 0 || words[0].isEmpty() || words[0].length() > s.length()) {
        return resultList;
    }

    Map<String, Integer> targetMap = new HashMap<>(words.length);
    for (String word : words) {
        targetMap.put(word, targetMap.getOrDefault(word, 0) + 1);
    }

    int wordLength = words[0].length();
    int totalLength = wordLength * words.length;
    for (int i = 0; i < wordLength; ++i) {
        int start = i;
        while (start + totalLength <= s.length()) {
            String sub = s.substring(start, start + totalLength);
            Map<String, Integer> temp = new HashMap<>();
            int c = words.length;
            while (c > 0) {
                String word = sub.substring(wordLength * (c - 1), wordLength * c);
                int tempC = temp.getOrDefault(word, 0) + 1;
                if (tempC > targetMap.getOrDefault(word, 0)) {
                    break;
                }
                temp.put(word, tempC);
                --c;
            }
            if (c == 0) {
                resultList.add(start);
            }
            // 这里的跳跃应该是比较巧妙的地方
            // 如果有了一个不存在于原列表的字符串，那么就跳过它。
            start += wordLength * Math.max(c, 1);
        }
    }
    return resultList;
}
```

### 效果

```
Runtime: 3 ms, faster than 99.96% of Java online submissions for Substring with Concatenation of All Words.
Memory Usage: 40.1 MB, less than 57.99% of Java online submissions for Substring with Concatenation of All Words.
```

这里没有特别多的判断，但是实际优化效果却非常明显。

可见大道至简。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

## 参考资料

https://leetcode-cn.com/problems/substring-with-concatenation-of-all-words

[详细通俗的思路分析，多解法](https://leetcode-cn.com/problems/substring-with-concatenation-of-all-words/solution/xiang-xi-tong-su-de-si-lu-fen-xi-duo-jie-fa-by-w-6/)

* any list
{:toc}