---
layout: post
title: leetcode 44 179. Largest Number
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, math, sh]
published: true
---

# 179. Largest Number

Given a list of non-negative integers nums, arrange them such that they form the largest number and return it.

Since the result may be very large, so you need to return a string instead of an integer.

## EX
 
Example 1:

```
Input: nums = [10,2]
Output: "210"
```

Example 2:

```
Input: nums = [3,30,34,5,9]
Output: "9534330"
``` 

## Constraints:

1 <= nums.length <= 100

0 <= nums[i] <= 10^9


# 思路

这里的想法基本上是实现一个 String 比较器来决定在连接过程中哪个 String 应该先出现。 

因为当你有 2 个数字时（让我们将它们转换成字符串），你只会面临 2 种情况：

例如：

```java
String s1 = "9";
String s2 = "31";

String case1 =  s1 + s2; // 931
String case2 = s2 + s1; // 319
```

显然，就价值而言，case1 大于 case2。

所以，我们应该始终将 s1 放在 s2 的前面。


# java 实现

```java
class Solution {
    
    public String largestNumber(int[] nums) {
        //1. int 转 string
        List<String> stringList = new ArrayList<>(nums.length);
        for(int i : nums) {
            stringList.add(String.valueOf(i));
        }

        //2. 排序
        Collections.sort(stringList, new Comparator<String>() {
            @Override
            public int compare(String o1, String o2) {
                String s1 = o1+o2;
                String s2 = o2+o1;

                // reverse order here, so we can do append() later
                return s2.compareTo(s1);
            }
        });

        //3. 构建结果
        // An extreme edge case by lc, say you have only a bunch of 0 in your int array
        if(stringList.get(0).charAt(0) == '0') {
            return "0";
        }

        StringBuilder sb = new StringBuilder();
        for(String s: stringList) {
            sb.append(s);
        }

        return sb.toString();
    }
    
}
```

# 数学证明

有时候我们感觉不需要证明的东西，必须要通过严格地数学证明。直觉往往会出错。

我们这里找到一个评论区的证明过程。

## 定理

We use a.b to represent the concatenation of non-negative integers a and b .

Theorem:

Let a, b, and c be non-negative integers. 

**If a.b > b.a and b.c > c.b , we have a.c > c.a .**

## 证明

Proof:

We use [a] to denote the length of the decimal representation of a . 

For example, if a = 10 , we have [a] = 2 .

Since a.b > b.a and b.c > c.b , we have

```
a * 10^[b] + b > b * 10^[a] + a
b * 10^[c] + c > c * 10^[b] + b
```

, which is equivalent to

```
a * (10^[b] - 1) > b * (10^[a] - 1)
b * (10^[c] - 1) > c * (10^[b] - 1)
```

Obviously, `10^[a] - 1 > 0 , 10^[b] - 1 > 0` , and `10^[c] - 1 > 0` . 

Since c >= 0 , according to the above inequalities, we know that b > 0 and a > 0 . 

After multiplying the above two inequalities and cancelling b and (10^[b] - 1) , we have

`a * (10^[c] - 1) > c * (10^[a] - 1)`

This is equivalent to

`a * 10^[c] + c > c * 10^[a] + a`

, which means a.c > c.a .

Q.E.D.

# 参考资料

https://leetcode.com/problems/largest-number/

https://leetcode.com/problems/largest-number/discussion/

https://leetcode.com/problems/largest-number/solutions/53158/my-java-solution-to-share/?orderBy=most_votes

* any list
{:toc}