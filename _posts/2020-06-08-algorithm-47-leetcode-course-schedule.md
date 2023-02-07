---
layout: post
title: leetcode 47 207. Course Schedule 课程表 DFS/BFS 
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dfs, bfs, sh]
published: true
---


# 207. 课程表

你这个学期必须选修 numCourses 门课程，记为 0 到 numCourses - 1 。

在选修某些课程之前需要一些先修课程。 先修课程按数组 prerequisites 给出，其中 prerequisites[i] = [ai, bi] ，表示如果要学习课程 ai 则 必须 先学习课程  bi 。

例如，先修课程对 [0, 1] 表示：想要学习课程 0 ，你需要先完成课程 1 。

请你判断是否可能完成所有课程的学习？如果可以，返回 true ；否则，返回 false 。

## Ex

示例 1：

```
输入：numCourses = 2, prerequisites = [[1,0]]
输出：true
解释：总共有 2 门课程。学习课程 1 之前，你需要完成课程 0 。这是可能的。
```

示例 2：

```
输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：false
解释：总共有 2 门课程。学习课程 1 之前，你需要先完成​课程 0 ；并且学习课程 0 之前，你还应先完成课程 1 。这是不可能的。
```

## 提示：

- 1 <= numCourses <= 10^5

- 0 <= prerequisites.length <= 5000

- prerequisites[i].length == 2

- 0 <= ai, bi < numCourses

- prerequisites[i] 中的所有课程对 互不相同


# 知识准备

[DAG 有向无环图（Directed Acyclic Graph）](https://houbb.github.io/2020/01/23/data-struct-learn-03-dag#)

[DFS 深度优先遍历与 BFS 广度优先遍历详解](https://houbb.github.io/2020/01/23/data-struct-learn-08-dfs-bfs)

# 思路梳理

## 题意解释

一共有 n 门课要上，编号为 0 ~ n-1。

先决条件 [1, 0]，意思是必须先上课 0，才能上课 1。

给你 n、和一个先决条件表，请你判断能否完成所有课程。

## 再举个生活的例子

先穿内裤再穿裤子，先穿打底再穿外套，先穿衣服再戴帽子，是约定俗成的。

内裤外穿、光着身子戴帽子等，都会有点奇怪。

我们遵循穿衣的一条条先后规则，用一串 顺序行为，把衣服一件件穿上。

我们遵循课程之间的先后规则，找到一种上课顺序，把所有课一节节上完。

## 用有向图描述依赖关系

示例：n = 6，先决条件表：[[3, 0], [3, 1], [4, 1], [4, 2], [5, 3], [5, 4]]

课 0, 1, 2 没有先修课，可以直接选。其余的课，都有两门先修课。

我们用有向图来展现这种依赖关系（做事情的先后关系）：

![学习课](https://pic.leetcode-cn.com/de601db5bd50985014c7a6b89bca8aa231614b4ba423620dd2e31993c75a9137-%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200517052852.png)

这种叫 有向无环图，**把一个 有向无环图 转成 线性的排序 就叫 拓扑排序**。

有向图有 入度 和 出度 的概念：

如果存在一条有向边 A --> B，则这条边给 A 增加了 1 个出度，给 B 增加了 1 个入度。

所以，顶点 0、1、2 的入度为 0。顶点 3、4、5 的入度为 2。

## 每次只能选你能上的课

每次只能选入度为 0 的课，因为它不依赖别的课，是当下你能上的课。

假设选了 0，课 3 的先修课少了一门，入度由 2 变 1。

接着选 1，导致课 3 的入度变 0，课 4 的入度由 2 变 1。

接着选 2，导致课 4 的入度变 0。

现在，课 3 和课 4 的入度为 0。继续选入度为 0 的课……直到选不到入度为 0 的课。

## 这很像 BFS

让入度为 0 的课入列，它们是能直接选的课。

然后逐个出列，出列代表着课被选，需要减小相关课的入度。

如果相关课的入度新变为 0，安排它入列、再出列……直到没有入度为 0 的课可入列。

## BFS 前的准备工作

每门课的入度需要被记录，我们关心入度值的变化。
课程之间的依赖关系也要被记录，我们关心选当前课会减小哪些课的入度。
因此我们需要选择合适的数据结构，去存这些数据：
入度数组：课号 0 到 n - 1 作为索引，通过遍历先决条件表求出对应的初始入度。
邻接表：用哈希表记录依赖关系（也可以用二维矩阵，但有点大）
key：课号
value：依赖这门课的后续课（数组）

## 怎么判断能否修完所有课？

BFS 结束时，如果仍有课的入度不为 0，无法被选，完成不了所有课。否则，能找到一种顺序把所有课上完。

或者：用一个变量 count 记录入列的顶点个数，最后判断 count 是否等于总课程数。

## 总结：拓扑排序问题

根据依赖关系，构建邻接表、入度数组。

选取入度为 0 的数据，根据邻接表，减小依赖它的数据的入度。

找出入度变为 0 的数据，重复第 2 步。

直至所有数据的入度为 0，得到排序，如果还有数据的入度不为 0，说明图中存在环。

# DFS-深度优先遍历

## 思路

我们可以将深度优先搜索的流程与拓扑排序的求解联系起来，用一个栈来存储所有已经搜索完成的节点。

对于一个节点 u，如果它的所有相邻节点都已经搜索完成，那么在搜索回溯到 u 的时候，u 本身也会变成一个已经搜索完成的节点。

这里的「相邻节点」指的是从 u 出发通过一条有向边可以到达的所有节点。

假设我们当前搜索到了节点 u，如果它的所有相邻节点都已经搜索完成，那么这些节点都已经在栈中了，此时我们就可以把 u 入栈。

可以发现，如果我们从栈顶往栈底的顺序看，由于 u 处于栈顶的位置，那么 u 出现在所有 u 的相邻节点的前面。

因此对于 u 这个节点而言，它是满足拓扑排序的要求的。

这样以来，我们对图进行一遍深度优先搜索。当每个节点进行回溯的时候，我们把该节点放入栈中。最终从栈顶到栈底的序列就是一种拓扑排序。

## 算法

对于图中的任意一个节点，它在搜索的过程中有三种状态，即：

「未搜索」：我们还没有搜索到这个节点；

「搜索中」：我们搜索过这个节点，但还没有回溯到该节点，即该节点还没有入栈，还有相邻的节点没有搜索完成）；

「已完成」：我们搜索过并且回溯过这个节点，即该节点已经入栈，并且所有该节点的相邻节点都出现在栈的更底部的位置，满足拓扑排序的要求。

通过上述的三种状态，我们就可以给出使用深度优先搜索得到拓扑排序的算法流程，在每一轮的搜索搜索开始时，我们任取一个「未搜索」的节点开始进行深度优先搜索。

我们将当前搜索的节点 u 标记为「搜索中」，遍历该节点的每一个相邻节点 v：

如果 v 为「未搜索」，那么我们开始搜索 v，待搜索完成回溯到 u；

如果 v 为「搜索中」，那么我们就找到了图中的一个环，因此是不存在拓扑排序的；

如果 v 为「已完成」，那么说明 v 已经在栈中了，而 u 还不在栈中，因此 u 无论何时入栈都不会影响到 (u,v) 之前的拓扑关系，以及不用进行任何操作。

当 u 的所有相邻节点都为「已完成」时，我们将 u 放入栈中，并将其标记为「已完成」。

在整个深度优先搜索的过程结束后，如果我们没有找到图中的环，那么栈中存储这所有的 n 个节点，从栈顶到栈底的顺序即为一种拓扑排序。

## 优化

由于我们只需要判断是否存在一种拓扑排序，而栈的作用仅仅是存放最终的拓扑排序结果，因此我们可以只记录每个节点的状态，而省去对应的栈。

## java 

```java
class Solution {
    List<List<Integer>> edges;
    int[] visited;
    boolean valid = true;

    public boolean canFinish(int numCourses, int[][] prerequisites) {
        edges = new ArrayList<List<Integer>>();
        for (int i = 0; i < numCourses; ++i) {
            edges.add(new ArrayList<Integer>());
        }
        visited = new int[numCourses];
        for (int[] info : prerequisites) {
            edges.get(info[1]).add(info[0]);
        }
        for (int i = 0; i < numCourses && valid; ++i) {
            if (visited[i] == 0) {
                dfs(i);
            }
        }
        return valid;
    }

    public void dfs(int u) {
        visited[u] = 1;
        for (int v: edges.get(u)) {
            if (visited[v] == 0) {
                dfs(v);
                if (!valid) {
                    return;
                }
            } else if (visited[v] == 1) {
                valid = false;
                return;
            }
        }
        visited[u] = 2;
    }
}
```

自己的实现：

```java
class Solution {
    
    private boolean valid = true;

    public boolean canFinish(int numCourses, int[][] prerequisites) {
        //1. 构建边，用 list 和 hashMap 一样。list 需要初始化一遍，避免越界。
        Map<Integer, List<Integer>> edges = new HashMap<>();
        for(int[] ints : prerequisites) {
            List<Integer> list = edges.getOrDefault(ints[1], new ArrayList<>());
            list.add(ints[0]);
            edges.put(ints[1], list);
        }

        // 3 种状态标记
        int[] visited = new int[numCourses];
        for(int i = 0; i < numCourses; i++) {
            if(!valid) {
                break;
            }

            // 未访问
            if(visited[i] == 0) {
                dfs(edges, visited, i);
            }
        }

        return valid;
    }

    private void dfs(Map<Integer, List<Integer>> edges,
                     int[] visited,
                     int i) {
        if(!valid) {
            return;
        }

        // 访问中
        visited[i] = 1;

        // 遍历所有的边
        for(int v : edges.getOrDefault(i, new ArrayList<>())) {
            // 如果未访问的，递归
            if(visited[v] == 0) {
                dfs(edges, visited, v);
            } else if(visited[v] == 1) {
                // 存在环
                valid = false;
            } else {
                // v 已经入栈，不需要关心。
            }
        }

        // 访问完成
        visited[i] = 2;
    }



}
```

## 复杂度分析

时间复杂度: O(n+m)，其中 n 为课程数，m 为先修课程的要求数。这其实就是对图进行深度优先搜索的时间复杂度。

空间复杂度: O(n+m)。题目中是以列表形式给出的先修课程关系，为了对图进行深度优先搜索，我们需要存储成邻接表的形式，空间复杂度为 O(n+m)。

在深度优先搜索的过程中，我们需要最多 O(n) 的栈空间（递归）进行深度优先搜索，因此总空间复杂度为 O(n+m)。

# 方法二: 广度优先搜索

## 思路

方法一的深度优先搜索是一种「逆向思维」：最先被放入栈中的节点是在拓扑排序中最后面的节点。我们也可以使用正向思维，顺序地生成拓扑排序，这种方法也更加直观。

我们考虑拓扑排序中最前面的节点，该节点一定不会有任何入边，也就是它没有任何的先修课程要求。当我们将一个节点加入答案中后，我们就可以移除它的所有出边，代表着它的相邻节点少了一门先修课程的要求。如果某个相邻节点变成了「没有任何入边的节点」，那么就代表着这门课可以开始学习了。按照这样的流程，我们不断地将没有入边的节点加入答案，直到答案中包含所有的节点（得到了一种拓扑排序）或者不存在没有入边的节点（图中包含环）。

上面的想法类似于广度优先搜索，因此我们可以将广度优先搜索的流程与拓扑排序的求解联系起来。

## 算法

我们使用一个队列来进行广度优先搜索。初始时，所有入度为 0 的节点都被放入队列中，它们就是可以作为拓扑排序最前面的节点，并且它们之间的相对顺序是无关紧要的。

在广度优先搜索的每一步中，我们取出队首的节点 u：

- 我们将 u 放入答案中；

- 我们移除 u 的所有出边，也就是将 u 的所有相邻节点的入度减少 1。如果某个相邻节点 v 的入度变为 0，那么我们就将 v 放入队列中。

在广度优先搜索的过程结束后。如果答案中包含了这 n 个节点，那么我们就找到了一种拓扑排序，否则说明图中存在环，也就不存在拓扑排序了。

## 优化

由于我们只需要判断是否存在一种拓扑排序，因此我们省去存放答案数组，而是只用一个变量记录被放入答案数组的节点个数。

在广度优先搜索结束之后，我们判断该变量的值是否等于课程数，就能知道是否存在一种拓扑排序。

## java

```java
class Solution {
    List<List<Integer>> edges;
    int[] indeg;

    public boolean canFinish(int numCourses, int[][] prerequisites) {
        edges = new ArrayList<List<Integer>>();
        for (int i = 0; i < numCourses; ++i) {
            edges.add(new ArrayList<Integer>());
        }
        indeg = new int[numCourses];
        for (int[] info : prerequisites) {
            edges.get(info[1]).add(info[0]);
            ++indeg[info[0]];
        }

        Queue<Integer> queue = new LinkedList<Integer>();
        for (int i = 0; i < numCourses; ++i) {
            if (indeg[i] == 0) {
                queue.offer(i);
            }
        }

        int visited = 0;
        while (!queue.isEmpty()) {
            ++visited;
            int u = queue.poll();
            for (int v: edges.get(u)) {
                --indeg[v];
                if (indeg[v] == 0) {
                    queue.offer(v);
                }
            }
        }

        return visited == numCourses;
    }
}
``

自己的实现：

```java
    /**
     * 思路：BFS
     *
     *
     * Kahn算法采用入度方法，其算法过程如下：
     *
     * 1. 选择入度为0的节点，输出到结果序列中；
     *
     * 2. 删除该节点以及该节点的边；
     *
     * 重复执行步骤1和2，直到所有节点输出到结果序列中，完成拓扑排序；如果最后还存在入度不为0的节点，说明有向图中存在环，无法进行拓扑排序。
     *
     *
     * 【思路】
     * 存储课程的列表，保障可以加兼容 T210
     *
     *
     *
     * @param numCourses
     * @param prerequisites
     * @return
     */
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<Integer> resultList = new ArrayList<>();
        // 定义两个数据，一个存放对应的下标和剩余的入度数。
        Map<Integer, Integer> inCountMap = new HashMap<>();
        // 一个对应出度映射，删除一个节点时，哪些节点的入度可以-1
        Map<Integer, List<Integer>> outListMap = new HashMap<>();

        // 出度和入度的初始化
        for(int i = 0; i < prerequisites.length; i++) {
            int[] nums = prerequisites[i];

            // [1,0]  学习课程 1 之前，你需要完成课程 0 。这是可能的。
            int pre = nums[1];  // 准备课程
            int cur = nums[0];  // 当前课程

            // 1. 计算当前课程的入度
            Integer curInCount = inCountMap.getOrDefault(cur, 0);
            curInCount++;
            inCountMap.put(cur, curInCount);

            Integer preInCount = inCountMap.getOrDefault(pre, 0);
            inCountMap.put(pre, preInCount);

            //2. 删除一个 pre 节点，哪些节点的入度可以 -1
            List<Integer> outList = outListMap.getOrDefault(pre, new ArrayList<>());
            outList.add(cur);
            outListMap.put(pre, outList);
        }

        // 入度数为0的数组
        List<Integer> inZeroList = new ArrayList<>();
        for(Map.Entry<Integer, Integer> entry : inCountMap.entrySet()) {
            if(entry.getValue().equals(0)) {
                inZeroList.add(entry.getKey());
            }
        }

        // 当入度为0的列表存在时，循环处理
        while (inZeroList.size() > 0) {
            // 随意取出一个入度为0的元素，放在结果列表
            int zero = inZeroList.remove(0);
            resultList.add(zero);

            // 满足后直接返回，区别不大。忽略

            // 对应的所有入度列表-1，如果有节点入度变成0，加到零入度列表中
            List<Integer> outs = outListMap.getOrDefault(zero, new ArrayList<>());
            for(Integer out : outs) {
                Integer integer = inCountMap.get(out);
                integer--;
                inCountMap.put(out, integer);

                // 入度为0，加入0入度列表
                if(integer == 0) {
                    inZeroList.add(out);
                }
            }
        }


        // 如果看
        // 如果删除一个节点，如何把对应的入度更新呢？
        // 满足结果，或者说所有的需求都已经满足了
        return resultList.size() >= numCourses
                || resultList.size() >= inCountMap.keySet().size();
    }
```

## 复杂度分析

时间复杂度: O(n+m)，其中 n 为课程数，m 为先修课程的要求数。这其实就是对图进行深度优先搜索的时间复杂度。

空间复杂度: O(n+m)。题目中是以列表形式给出的先修课程关系，为了对图进行深度优先搜索，我们需要存储成邻接表的形式，空间复杂度为 O(n+m)。

在深度优先搜索的过程中，我们需要最多 O(n) 的栈空间（递归）进行深度优先搜索，因此总空间复杂度为 O(n+m)。

# 参考资料

https://leetcode.cn/problems/course-schedule/description/

https://leetcode.cn/problems/course-schedule/solution/ke-cheng-biao-by-leetcode-solution/

https://leetcode.cn/problems/course-schedule-ii/

https://leetcode.cn/problems/course-schedule/solution/bao-mu-shi-ti-jie-shou-ba-shou-da-tong-tuo-bu-pai-/

* any list
{:toc}