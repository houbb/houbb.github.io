---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC118 杨辉三角 pascals-triangle 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下LC118 杨辉三角。

# LC118 杨辉三角 pascals-triangle 

给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。

在「杨辉三角」中，每个数是它左上方和右上方的数的和。

![2](https://pic.leetcode-cn.com/1626927345-DZmfxB-PascalTriangleAnimated2.gif)
 
示例 1:

输入: numRows = 5
输出: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
示例 2:

输入: numRows = 1
输出: [[1]]
 

提示:

1 <= numRows <= 30

# v0-朴素思路

## 思路

numsRows 对应的有多少行数据。

我们从第一行开始构建。

这一题其实是 dp, 但是实际上我们按照的处理逻辑就可以解决。

1）处理好第一行、第二行。

2）每一行的第一个、最后一个元素都是1

3）剩下的元素，从 i=1 开始，都等于 `pre[i-1] + pre[i]`

4）每一行的元素个数和行数一样

## 实现

```java
    public List<List<Integer>> generate(int numRows) {
        List<List<Integer>> res = new ArrayList<>();

        List<Integer> one = Arrays.asList(1);
        List<Integer> two = Arrays.asList(1, 1);

        if(numRows <= 1) {
            return Arrays.asList(one);
        }
        if(numRows == 2) {
            return Arrays.asList(one, two);
        }

        res.add(one);    
        res.add(two);    

        // 处理
        for(int row = 3; row <= numRows; row++) {
            // 处理每一行
            List<Integer> list = new ArrayList<>(row);
            // 第一个数字是1
            list.add(1);
            List<Integer> preRow = res.get(row-2);
            // 每一列
            for(int i = 1; i < row-1; i++) {
                int temp = preRow.get(i-1) + preRow.get(i);
                list.add(temp);        
            }
            // 最后一个数字也是1
            list.add(1);

            res.add(list);
        }    

        return res;
    }   
```

## 效果

1ms 击败 97.55%

# 开源项目

为方便大家学习，所有相关文档和代码均已开源。

[leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

[leetcode 算法实现源码](https://github.com/houbb/leetcode)

[leetcode 刷题学习笔记](https://github.com/houbb/leetcode-notes)

[老马技术博客](https://houbb.github.io/)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解力扣经典，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}