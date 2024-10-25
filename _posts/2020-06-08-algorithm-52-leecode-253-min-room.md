---
layout: post
title: leetcode 253 [LeetCode] 253. Meeting Rooms II 
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, hash, bit, sort, sh]
published: true
---

# 题目

[LeetCode] 253. Meeting Rooms II
Given an array of meeting time intervals intervals where intervals[i] = [starti, endi], return the minimum number of conference rooms required.

Example 1:
Input: intervals = [[0,30],[5,10],[15,20]]
Output: 2

Example 2:
Input: intervals = [[7,10],[2,4]]
Output: 1

Constraints:
1 <= intervals.length <= 104
0 <= starti < endi <= 106

会议室 II。


## 思路一 - 排序 + 双指针

第一种是排序 + 双指针。具体做法是把每个会议的开始时间和结束时间拎出来分别排序，再遍历 intervals。

遍历的时候，设置一个 pointer = 0，判断当前 interval[i] 的开始时间是否大于前一个会议的结束时间 interval[pointer][end]。如果大于，就说明不需要新开一个会议室；如果小于，就需要新开一个会议室。因为题目只在意需要同时开几个会议室，所以 start 和 end 可以分别排序。

end 只要结束一个，就意味着同时需要的会议室就少一个。

如果扫描线的题目做多了，一开始的本能反应可能是对 start 或者对 end 排序，看看是否存在 interval 之间的 overlap，但是其实是行不通的，因为可能存在比如某个会议 start 时间没有跟其他任何一个会议的 end 时间有冲突，但是有可能这个会议一直持续到最后，他的 end 时间跟别的会议也没有 overlap，但是他其实一直是占用一个房间的。

同时，为什么排序 + 双指针这个做法是正确的呢？对 start 和对 end 分别排序之后，因为 start 和 end 是有序的，在用双指针分别指向当前的 start 和当前的 end 的时候，只要当前 start 小于当前的 end，就一定要再开一个房间，因为当前确实是有一个会议没有结束。我们将 start 和 end 分别排序之后，其实是可以把数据抽象成如下这幅图的。

一开始，会议时间线是这样的：

```
|_____|
      |______|
|________|
        |_______|
```

如果把开始时间和结束时间分别排序，会变成：

```
||    ||
     |   |   |  |
```

所以只要碰到 start，就一定要增加一个房间，碰到 end 就可以减少一个房间。我们在遍历的过程中找到同时使用的会议室的峰值即可。

## 复杂度

时间O(nlogn) - 因为有对 input 排序
空间O(n) - 有用额外数组对 start 和 end 排序

# java 实现

```java
package com.github.houbb.leetcode.F600T700;

import java.util.Arrays;

public class T_minMeetingRooms {

    public static void main(String[] args) {
        T_minMeetingRooms minMeetingRooms = new T_minMeetingRooms();
        int[][] array = {{0, 30}, {5, 10}, {15, 20}};
        System.out.println(minMeetingRooms.minMeetingRooms(array));;

        // [[7,10],[2,4]]
        int[][] array2 = {{7,10}, {2,4}};
        System.out.println(minMeetingRooms.minMeetingRooms(array2));
    }

    public int minMeetingRooms(int[][] intervals) {
        if (intervals == null || intervals.length == 0) {
            return 0;
        }

        int len = intervals.length;
        int[] start = new int[len];
        int[] end = new int[len];
        for (int i = 0; i < len; i++) {
            start[i] = intervals[i][0];
            end[i] = intervals[i][1];
        }
        Arrays.sort(start);
        Arrays.sort(end);
        int res = 0;
        int pointer = 0;
        for (int i = 0; i < len; i++) {
            if (start[i] < end[pointer]) {
                res++;
            } else {
                pointer++;
            }
        }

        return res;
    }

}
```




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