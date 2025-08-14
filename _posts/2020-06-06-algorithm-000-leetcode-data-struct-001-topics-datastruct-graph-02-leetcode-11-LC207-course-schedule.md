---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC207 课程表 course-schedule
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, graph, sf]
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

# 207 课程表

你这个学期必须选修 numCourses 门课程，记为 0 到 numCourses - 1 。

在选修某些课程之前需要一些先修课程。 先修课程按数组 prerequisites 给出，其中 prerequisites[i] = [ai, bi] ，表示如果要学习课程 ai 则 必须 先学习课程  bi 。

例如，先修课程对 [0, 1] 表示：想要学习课程 0 ，你需要先完成课程 1 。

请你判断是否可能完成所有课程的学习？如果可以，返回 true ；否则，返回 false 。

示例 1：

输入：numCourses = 2, prerequisites = [[1,0]]
输出：true
解释：总共有 2 门课程。学习课程 1 之前，你需要完成课程 0 。这是可能的。
示例 2：

输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：false
解释：总共有 2 门课程。学习课程 1 之前，你需要先完成​课程 0 ；并且学习课程 0 之前，你还应先完成课程 1 。这是不可能的。
 

提示：

1 <= numCourses <= 2000
0 <= prerequisites.length <= 5000
prerequisites[i].length == 2
0 <= ai, bi < numCourses
prerequisites[i] 中的所有课程对 互不相同


# v1-最朴素的解法

## 思路

借助 HashMap

1) 记录所有 preMap, key 是课程，value 是依赖的课程 list

2) zeroPreSet 不依赖任何课程的集合

在执行 zeroPreSet 处理的时候，移除 list 中对应的信息。

当一个 preMap value 变为空的时候，加入 tempZeroPreSet

用一个 tempZeroPreSet 记录，避免重复处理。

当前迭代结束的时候 `zeroPreSet = tempZeroPreSet;`

3）最后 preMap 清空，则说明满足条件


## 实现

```java
    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        Map<Integer, Set<Integer>> preMap = new HashMap<>();
        Set<Integer> zeroSet = new HashSet<>();

        // 初始化
        for(int[] ints : prerequisites) {
            int cur = ints[0];
            int pre = ints[1];

            Set<Integer> set = preMap.getOrDefault(cur, new HashSet<>());
            set.add(pre);
            preMap.put(cur, set);
        }

        // zero
        for(int i = 0; i < numCourses; i++) {
            if(!preMap.containsKey(i)) {
                zeroSet.add(i);
            }
        }

        // 迭代处理
        while(!zeroSet.isEmpty()) {
            Set<Integer> tempZeroSet = new HashSet<>();

            for(Integer num : zeroSet) {
                // 移除元素
                for(Map.Entry<Integer, Set<Integer>> entry : preMap.entrySet()) {
                    Integer key = entry.getKey();
                    Set<Integer> set = entry.getValue();
                    set.remove(num);

                    if(set.isEmpty()) {
                        tempZeroSet.add(key);
                    }
                }
            }

            // 统一删除，避免修改问题
            if(!tempZeroSet.isEmpty()) {
                for(Integer num : tempZeroSet) {
                    preMap.remove(num);
                }
            }

            zeroSet = tempZeroSet;
        }

        return preMap.isEmpty();
    }
```




## 效果

234ms 击败 5.14%

## 反思

我们如何做的更快呢？

其实每一次删除的时候，我们都需要去 preMap 中全部遍历一次。

但是我们可以维护一个反向依赖的 map，来进行提速。（空间换时间）

# v2-反向 map

## 思虑 

新增一个 reverseMap，记录我被谁依赖，移除的时候缩小范围。

## 实现

```java
    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        Map<Integer, Set<Integer>> preMap = new HashMap<>();
        Map<Integer, Set<Integer>> reverseMap = new HashMap<>();
        Set<Integer> zeroSet = new HashSet<>();

        // 初始化
        for(int[] ints : prerequisites) {
            int cur = ints[0];
            int pre = ints[1];

            // 我依赖了谁
            Set<Integer> set = preMap.getOrDefault(cur, new HashSet<>());
            set.add(pre);
            preMap.put(cur, set);

            // 谁依赖了我
            Set<Integer> reverseSet = reverseMap.getOrDefault(pre, new HashSet<>());
            reverseSet.add(cur);
            reverseMap.put(pre, reverseSet);
        }

        // zero
        for(int i = 0; i < numCourses; i++) {
            if(!preMap.containsKey(i)) {
                zeroSet.add(i);
            }
        }

        // 迭代处理
        while(!zeroSet.isEmpty()) {
            Set<Integer> tempZeroSet = new HashSet<>();

            for(Integer num : zeroSet) {
                // 移除的时候其实不用全表扫描 只看被影响的就行

                // 直接找受影响的课程（避免全表扫描）
                if (reverseMap.containsKey(num)) {
                    for (Integer course : reverseMap.get(num)) {
                        Set<Integer> set = preMap.get(course);
                        if (set != null) {
                            set.remove(num);
                            if (set.isEmpty()) {
                                tempZeroSet.add(course);
                            }
                        }
                    }
                }
            }

            // 统一删除，避免修改问题
            if(!tempZeroSet.isEmpty()) {
                for(Integer num : tempZeroSet) {
                    preMap.remove(num);
                }
            }

            zeroSet = tempZeroSet;
        }

        return preMap.isEmpty();
    }
```

## 效果

17ms 击败 9.24%

## 反思

效果还是很明显的，只是比例不明显而已。

# v3-基本类型优化

## 思路

我们可以保持整体的逻辑不变，修改使用的数据类型。

因为课程都是 int 类型，那么 key 其实可以弱化掉，比如 preMap 改为 int[], index 代表原始的 key, value 改为对应的依赖数量即可。

## 实现

```java
    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        int[] preMap = new int[numCourses];
        Map<Integer, Set<Integer>> reverseMap = new HashMap<>();
        Set<Integer> zeroSet = new HashSet<>();

        // 初始化
        for(int[] ints : prerequisites) {
            int cur = ints[0];
            int pre = ints[1];

            // 我依赖了谁
            preMap[cur]++;

            // 谁依赖了我
            Set<Integer> reverseSet = reverseMap.getOrDefault(pre, new HashSet<>());
            reverseSet.add(cur);
            reverseMap.put(pre, reverseSet);
        }

        // zero
        for(int i = 0; i < numCourses; i++) {
            if(preMap[i] == 0) {
                zeroSet.add(i);
            }
        }

        // 迭代处理
        int count = 0;
        while(!zeroSet.isEmpty()) {
            Set<Integer> tempZeroSet = new HashSet<>();

            for(Integer num : zeroSet) {
                count++;

                // 移除的时候其实不用全表扫描 只看被影响的就行

                // 直接找受影响的课程（避免全表扫描）
                if (reverseMap.containsKey(num)) {
                    for (Integer course : reverseMap.get(num)) {
                        preMap[course]--;
                        if (preMap[course] == 0) {
                            tempZeroSet.add(course);
                        }
                    }
                }
            }

            zeroSet = tempZeroSet;
        }

        return count == numCourses;
    }
```

## 效果

10ms 击败 13.90%

## 反思

略有优化

当然还可以进一步将 zeroSet 优化为 queue，减少 set 创建。

reverseMap 优化为 `List<Integer>[]`，进一步提升性能。

不过这2个方式都是在数据结构上改进，算法上其实大同小异。

我们来看一下另一种方案。

# v4-思路 DFS+染色法

## 思路

最核心的其实是我们要检测是否存在环。

如果课程互相依赖（存在环），那么肯定无法完成。

如何检测呢？

## 流程

把课程和先修关系当成一个 有向图：

g[a] 里存放所有从 a 出发能到达的课程（a 是先修课，指向依赖它的课）。

课程能全部修完 ⇔ 图中无环。

因为如果存在环（例如 0→1→2→0），你永远找不到一个“先修课已经完成”的起点。

### 变量解释

colors[i] 表示课程 i 的访问状态：

0 = 未访问
1 = 正在访问（当前 DFS 路径上的节点）
2 = 访问完成（该节点的所有后续节点都检查过了，没有环）

这个“染色法”可以快速检测环：

如果 DFS 时遇到 colors[y] == 1，说明我们沿着路径又回到了一个正在访问的节点 → 形成环。

## 实现

```java
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        Map<Integer, Set<Integer>> preMap = new HashMap<>();

        // 初始化
        for(int[] ints : prerequisites) {
            int cur = ints[0];
            int pre = ints[1];

            // 谁依赖了我
            Set<Integer> preSet = preMap.getOrDefault(pre, new HashSet<>());
            preSet.add(cur);
            preMap.put(pre, preSet);
        }

        // 颜色
        int[] colors = new int[numCourses];

        // zero
        for(int i = 0; i < numCourses; i++) {
           if(colors[i] == 0 && dfsDetectCycle(i, preMap, colors)) {
                return false;
           }
        }
        return true;
    }

    public boolean dfsDetectCycle(int i, Map<Integer, Set<Integer>> preMap, int[] colors) {
        // 正在访问
        colors[i] = 1;
        // 从当前位置可以到达的所有点
        if(preMap.containsKey(i)) {
            for (int y : preMap.get(i)) {

                // DFS 时遇到 colors[y] == 1，说明我们沿着路径又回到了一个正在访问的节点 → 形成环。
                if (colors[y] == 1 || (colors[y] == 0 && dfsDetectCycle(y, preMap, colors))) {
                    return true;
                }
            }
        }

        // 访问完成
        colors[i] = 2;
        return false;
    }
```

## 效果

7ms 击败 30.41%

## 在线可视化体验

> [DFS 在线可视化](https://houbb.github.io/leetcode-visual/T207-course-schedule-DFS-color.html)

* any list
{:toc}