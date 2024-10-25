---
layout: post
title: leetcode 681 最近时刻 next-closest-time [Medium]
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, hash, bit, sort, sh]
published: true
---

# 题目

## 681. 最近时刻

给定一个"HH:MM"格式的时间，重复使用这些数字，返回下一个最近的时间。每个数字可以被重复使用任意次。

保证输入的时间都是有效的。例如，"01:34"，"12:09" 都是有效的，而"1:34"，"12:9"都不是有效的时间。

例1：

输入: "19:34"

输出: "19:39"

解释:

  从1，9，3，4中选出的下一个最近的时间是19:39，它是五分钟后。

  答案不是19:33，因为它是23小时59分钟后。

例 2:

输入: "23:59"

输出: "22:22"

解释: 可以假设所返回的时间是第二天的时间，因为它在数字上小于给定的时间。

Follow up: 拓展为 n 个 digits?

## 思路:

有两种思路可以选择, 一种是从已有数字出发, 另一种是从时间点出发.

由于问题规模很小, 两种方法都可以顺利通过, 几乎没有性能差距.

注意: 分钟是60进制, 小时是24进制.

方法1: 用已有的数字生成所有排列, 在这些排列中找到距离原时间点最近的即可.

思路类似于next permutation的解法，关键是找到比当前时间大的最小值。

1. 预处理，找到 time 里的 unique number 并排序

2. 从 time 的最后一位数字开始，找比当前数字大的最小数字

3. 如果没有比它大的，continue

4. 如果有，把当前数字替换成找到的数，并把当前数字后面 一直到结尾 的数字都替换成 全局最小值

5. 判断新的时间是否 valid，是则可直接返回

6. 遍历完整个 time 都没有找到 valid 的新时间的话，说明新时间 > 23:59，会出现在第二天，因此直接返回由全局最小值组成的时间。

方法2: 从给定时间点一分钟一分钟地递增, 即枚举每一个时间点, 直到这个时间点可以被给定的数字组成为止.

## 实现

```python
from datetime import *
 
 
class Solution:
    # 法2：把时间转换成分钟，24小时有1440分钟。
    # 在（1，1441）的范围内逐步往上加分钟数，保证时间始终往后。
    # 再用set把每个step的结果分开，如果set的长度大于原时间组的长度，说明数字和原时间不同，继续往下。
    def nextClosestTime2(self, time):
        h, m = time.split(":")
        curr = int(h) * 60 + int(m)  # 换算成分钟数
        result = None
        for i in range(curr + 1, curr + 1441):
            t = i % 1440  # mod得到当天的分钟数
            h, m = t // 60, t % 60
            result = "%02d:%02d" % (h, m)
            if set(result) <= set(time):  # 只到result里的元素个数小于等于原时间，说明没有用到额外的元素
                break
        return result
 
    def nextClosestTime3(self, time):
        digits = set(time)
        while True:
            time = (datetime.strptime(time, '%H:%M') + timedelta(minutes=1)).strftime('%H:%M')
            if set(time) <= digits:
                return time
 
    # # 法1：有误！！！
    # def nextClosestTime(self, time):
    #     time = time[:2] + time[3:]  # 去掉":"
    #     # 预处理，找到 time 里的 unique number 并排序
    #     digits = sorted([int(num) for num in time])
    #     smallest = digits[0]
    #
    #     for i in reversed(range(len(time))):  # range(len(time)-1, -1, -1)
    #         #  【↑从后往前】 ↓找比当前数字大的最小数字
    #         larger = self._get_larger_digit(digits, int(time[i]))
    #         if larger == -1:
    #             continue  # 没找到
    #
    #         # 找到了，则把当前数字替换成larger，并把【此后直到结尾的数字】都替换成【全局最小值】
    #         #           ∵ time[:i]取了(0,i-1)共i个数 ∴ len(time) - (i-1 +1) - 1 ↓
    #         new_time = time[:i] + str(larger) + str(smallest) * (len(time) - 1 - i)
    #         # 判断新的时间是否 valid，是则可直接返回
    #         if not self.is_valid(new_time):
    #             continue
    #         return self.construct_time(new_time)
    #
    #     # 遍历完整个 time 都没有找到 valid_新时间，直接返回全由最小值组成的时间（第二天）
    #     return self.construct_time(str(smallest) * 4)
    #
    # def _get_larger_digit(self, digits, num):
    #     idx = digits.index(num)
    #     if idx == len(digits) - 1:
    #         return -1  # num已是max
    #     else:
    #         return digits[idx + 1]  # digits是递增序列
    #
    # def is_valid(self, time):
    #     return int(time[:2]) <= 23 and int(time[2:]) <= 59
    #
    # def construct_time(self, time):
    #     return str(time[:2]) + ":" + str(time[2:])
```

# v-1 暴力

一天一共 1440 分钟，直接全部遍历一下。


```java
package com.github.houbb.leetcode.F600T700;

import java.util.*;

public class T618_ClosestTime {

    public static void main(String[] args) {
        T618_ClosestTime closestTime = new T618_ClosestTime();
        System.out.println(closestTime.nextClosestTime("19:34"));
        System.out.println(closestTime.nextClosestTime("23:59"));
    }

    public String nextClosestTime(String time) {
        // 字符集合
        char chars[] = time.toCharArray();
        Set<Character> characters = new HashSet<>();
        for(char c : chars) {
            characters.add(c);
        }

        // 遍历
        int timeNum = toMin(time);
        for(int i = timeNum+1; i <= 1440; i++) {
            String tempTimeStr = toStr(i);
            if(isValid(characters, tempTimeStr)) {
                return tempTimeStr;
            }
        }

        // 没找到
        for(int i = 0; i < 1440; i++) {
            String tempTimeStr = toStr(i);
            if(isValid(characters, tempTimeStr)) {
                return tempTimeStr;
            }
        }

        return "";
    }

    private int toMin(String str) {
        String hourStr = str.substring(0, 2);
        String minStr = str.substring(3, 5);
        return Integer.parseInt(hourStr) * 60 + Integer.parseInt(minStr);
    }

    private String toStr(int minNum) {
        int hour = minNum / 60;
        int min = minNum % 60;
        return String.format("%2d:%2d", hour, min);
    }

    private boolean isValid(Set<Character> characters, String timeStr) {
        // 必须包含所有的时间字符
        char[] chars = timeStr.toCharArray();
        for(char c : chars) {
            if(c == ':') {
                continue;
            }

            if(!characters.contains(c)) {
                return false;
            }
        }
        return true;
    }

}
```





# 参考资料

https://leetcode.cn/problems/contains-duplicate-iii/description/

* any list
{:toc}