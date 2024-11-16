---
layout: post
title: leetcode 扫描线专题 06-leetcode.1851 minimum-interval-to-include-each-query 力扣.1851 包含每个查询的最小区间
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sweep-line, sf]
published: true
---


# 题目

给你一个二维整数数组 intervals ，其中 intervals[i] = [lefti, righti] 表示第 i 个区间开始于 lefti 、结束于 righti（包含两侧取值，闭区间）。

区间的 长度 定义为区间中包含的整数数目，更正式地表达是 righti - lefti + 1 。

再给你一个整数数组 queries 。第 j 个查询的答案是满足 lefti <= queries[j] <= righti 的 长度最小区间 i 的长度 。如果不存在这样的区间，那么答案是 -1 。

以数组形式返回对应查询的所有答案。

示例 1：

```
输入：intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]
输出：[3,3,1,4]
解释：查询处理如下：
- Query = 2 ：区间 [2,4] 是包含 2 的最小区间，答案为 4 - 2 + 1 = 3 。
- Query = 3 ：区间 [2,4] 是包含 3 的最小区间，答案为 4 - 2 + 1 = 3 。
- Query = 4 ：区间 [4,4] 是包含 4 的最小区间，答案为 4 - 4 + 1 = 1 。
- Query = 5 ：区间 [3,6] 是包含 5 的最小区间，答案为 6 - 3 + 1 = 4 。
```

示例 2：

```
输入：intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,5,22]
输出：[2,-1,4,6]
解释：查询处理如下：
- Query = 2 ：区间 [2,3] 是包含 2 的最小区间，答案为 3 - 2 + 1 = 2 。
- Query = 19：不存在包含 19 的区间，答案为 -1 。
- Query = 5 ：区间 [2,5] 是包含 5 的最小区间，答案为 5 - 2 + 1 = 4 。
- Query = 22：区间 [20,25] 是包含 22 的最小区间，答案为 25 - 20 + 1 = 6 。
``` 

提示：

- 1 <= intervals.length <= 10^5

- 1 <= queries.length <= 10^5

- intervals[i].length == 2

- 1 <= lefti <= righti <= 10^7

- 1 <= queries[j] <= 10^7



# v1-暴力

## 思路

先别管这么多优化，直接判断对应的区间是否存在。

然后找到最小的一个，当然性能非常差。

## 实现

```java
class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        int[] resArray = new int[queries.length];
        for(int i = 0; i < queries.length; i++) {
            int res = getInterval(intervals, queries[i]);
            resArray[i] = res;
        }
        return resArray;
    }

    private int getInterval(int[][] intervals,
                            int query) {

        int minLen = Integer.MAX_VALUE;

        // 遍历，然后找一个最小的区间
        for(int i = 0; i < intervals.length; i++) {
            int[] range = intervals[i];
            if(query >= range[0] && query <= range[1]) {
                int len = range[1] - range[0] + 1;
                minLen = Math.min(len, minLen);
            }
        }

        if(minLen == Integer.MAX_VALUE) {
            return -1;
        }
        return minLen;
    }
}
```

## 效果

超出时间限制

34 / 42 个通过的测试用例


# v2-排序

## 思路

我们要反思一下，为什么这么慢？

因为我们每一次都把数据全部遍历了一遍。

我们当然可以通过排序，保证开始的 range[0] 有序，然后如果 range[0] 不符合，后续的就不需要比较了。

## 实现

```java
class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        int[] resArray = new int[queries.length];

        //sort
        List<int[]> sortList = new ArrayList<>();
        for(int i = 0; i < intervals.length; i++) {
            sortList.add(intervals[i]);
        }
        Collections.sort(sortList, new Comparator<int[]>() {
            @Override
            public int compare(int[] o1, int[] o2) {
                return o1[0] - o2[0];
            }
        });

        for(int i = 0; i < queries.length; i++) {
            int res = getInterval(sortList, queries[i]);
            resArray[i] = res;
        }
        return resArray;
    }

    private int getInterval(List<int[]> listList,
                            int query) {

        int minLen = Integer.MAX_VALUE;

        // 遍历，然后找一个最小的区间
        for(int i = 0; i < listList.size(); i++) {
            int[] range = listList.get(i);
            // 如果开始已经大于 query，直接中断
            if(query < range[0]) {
                break;
            }

            if(query <= range[1]) {
                int len = range[1] - range[0] + 1;
                minLen = Math.min(len, minLen);
            }
        }

        if(minLen == Integer.MAX_VALUE) {
            return -1;
        }
        return minLen;
    }
}
```

## 效果

超出时间限制 34 / 42 个通过的测试用例

## 小结

我直接一个原地问号？？？

感情这个快捷结束，并没有任何的性能提升？

# v2.1-排序+二分查找 key

## 思路

我们不再从头开始循环找开始的位置，而是直接通过二分，找到最小的开始位置？？

可是感觉如果 CASE 设计的非常极端，还是会废掉。

## 否决

但是感觉没有用。

因为就算找到了 query 对应的位置，但是未必是整体最短的，也说明不了什么？

那么，要怎么才能快速找到最短的一个数组呢？

# v3-离线优化

## 核心

这一题到底在考察啥？

其实比较核心的是离线优化。

## 问题的重新考虑

此处引用一下别人的一段解释：

```
如果查询是在线的，即query是一个个到来的，那么对于单一query来说，比如query = 5，我们需要：

过滤1：找到所有左端点left <= 5的区间

过滤2：对上述区间，找到所有右端点right >=5的区间

排序：对所有剩下的区间排序，返回长度最小的

上述“过滤1-过滤2-排序”的过程，如果我们能够提前对intervals按“左端点从小到大”进行排序，则“过滤1”很好做就是从小到大扫描intervals，把符合“left <= 5”的保存下来，直到left > 5就可以停止；因为考虑到最后一步是排序，所以提前选用有序容器（优先队列等）会是一个好主意。接下来“过滤2”也很直观，把容器中所有右边界不符合“right >= 5”的排除掉（出队）。下来留下长度最小（优先队列顶上）的且符合条件的区间，就是“query = 5”对应的答案。

而离线优化，对queries进行事先排序的好处是，考虑“query = 5”和“query = 6”，如果我们做完了前者的“过滤-过滤-排序”：

满足第一步过滤条件的区间，当然也满足更大值的query，因为left <= 5 <= 6嘛

不满足第二步过滤条件的区间，同样不会满足更大值的query，因为right < 5 < 6

所以，我们会发现“query = 5”，留下的所有区间，都是“query = 6”的备选，只不过会漏掉一部分“起点在[5, 6]之间的区间“，还会多出一些“终点在[5, 6]之间的区间”，那么这些“遗漏”和“多余”，只不过是把两次过滤再“增量地”对区间[5, 6]执行一次罢了——这就是离线算法带来的好处，某种程度上仍旧是“过滤-过滤-排序”，但所有的操作都变成增量的了。

“过滤-过滤”体现在代码里就是那两个“while-循环”，而排序则是隐含在heap中了。
```

我们前面的考虑主要集中在 过滤1+过滤2 找到符合 query=5 的列表，然后通过 sort 或者最小值找到 长度最小。

但是忽略了一个点，多个 query 时，其实数据是可以复用的。

也就是对 query 条件排序，我们离线优化的一种技巧。

## 什么是离线优化？

### 离线优化的解释

离线优化是一种常用的优化技术，通常用于处理涉及查询的问题，尤其是当查询和处理的时间复杂度较高时。其核心思想是通过预处理和排序来减少在处理每个查询时的重复计算，从而提高整体性能。

在这个问题中，我们有一个二维数组 `intervals` 和一个数组 `queries`，需要对每个查询找到包含该查询值的最小区间长度。

如果直接逐个查询，可能导致非常高的时间复杂度，特别是当区间和查询都很大时。

通过离线优化，我们可以通过排序和一些额外的结构（比如堆）来优化查询的处理过程。

### 离线优化的关键步骤

1. **预排序：**
   - **区间排序**：我们首先对所有区间按左端点进行排序。如果左端点相同，则按照右端点排序。这是为了在处理查询时，可以顺序地将符合条件的区间加入堆中，避免重复遍历所有区间。
   - **查询排序**：我们还将查询按查询值进行排序。这样做的好处是，我们可以按查询的顺序来处理每个查询，并确保在处理查询时，已经将所有符合条件的区间加入堆。

2. **堆的使用：**
   - 使用最小堆来存储当前查询值能够匹配的区间。堆中的每个元素是一个区间的长度、右端点和左端点。
   - 每次处理一个查询时，我们将所有左端点小于等于该查询值的区间加入堆中，并从堆中选取最小的区间（即最小的区间长度）。
   - 同时，我们会移除堆中那些不再覆盖当前查询值的区间（即右端点小于当前查询值的区间）。

3. **一次遍历：**
   - 通过对区间和查询的排序，我们只需要一次遍历区间数组和查询数组。这避免了每次查询时都重新遍历区间数组的重复计算。

## 实现

这里的一些预处理非常巧妙

1）对 intervals 首先按照短点排序

2）对 queries 进行离线优化排序

3）遍历的过程中，将长度较小的放在 minHeap 中。

```java
import java.util.*;

public class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        // 将查询的值与原始索引配对，方便结果按查询顺序返回
        int[] result = new int[queries.length];
        for (int i = 0; i < queries.length; i++) {
            result[i] = -1;  // 初始化为-1
        }

        // 1. 对区间按左端点排序，如果左端点相同则按右端点排序
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

        // 2. 对查询进行排序，并记录原来的索引
        int[][] queriesWithIndex = new int[queries.length][2];
        for (int i = 0; i < queries.length; i++) {
            queriesWithIndex[i] = new int[]{queries[i], i};
        }
        Arrays.sort(queriesWithIndex, (a, b) -> Integer.compare(a[0], b[0]));

        // 3. 使用最小堆维护区间
        PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0])); // 堆按区间长度排序

        int idx = 0;  // 区间数组的下标
        // 4. 遍历查询并处理每个查询
        for (int[] query : queriesWithIndex) {
            int q = query[0];  // 当前查询值
            int queryIdx = query[1];  // 当前查询的原始索引

            // 5. 将所有左端点小于等于当前查询值的区间加入堆
            while (idx < intervals.length && intervals[idx][0] <= q) {
                int left = intervals[idx][0], right = intervals[idx][1];
                minHeap.offer(new int[]{right - left + 1, right, left});
                idx++;
            }

            // 6. 移除堆中不再覆盖当前查询值的区间
            while (!minHeap.isEmpty() && minHeap.peek()[1] < q) {
                minHeap.poll();
            }

            // 7. 如果堆不为空，说明有有效区间覆盖当前查询值
            // 这里直接取到的第一个，就是最小的区间
            if (!minHeap.isEmpty()) {
                result[queryIdx] = minHeap.peek()[0];
            }
        }

        return result;
    }

}
```

## 效果

115ms 击败 50.00%

# v4-线段树 SegmentTree

## 关系

这道题和 **线段树** 之间的关系，主要体现在如何高效地处理区间范围和查询值的最小区间问题。

具体而言，线段树可以用来维护区间的动态状态，在处理区间覆盖查询时，可以高效地进行更新和查询操作。

### 为什么线段树适合解决这类问题？

1. **区间查询**：线段树能够快速处理区间查询问题，特别是当需要频繁查找某个查询值是否落在某个区间内时，线段树能够提供对区间的快速查询。
   
2. **区间更新**：在扫描线或其他解法中，可能需要在动态过程中维护活跃区间的集合。线段树通过区间的更新和查询，能够帮助我们高效地维护和检索包含某个值的最小区间。

### 线段树应用的思路：

我们可以利用线段树来处理这道题，通过以下方式来设计：

1. **区间的插入**：每当扫描到一个区间时，在线段树中插入该区间的长度和有效范围（即该区间的起始位置和结束位置）。
   
2. **区间的删除**：当扫描线移动到区间的结束位置时，删除相应的区间。

3. **查询的处理**：对于每一个查询值，我们通过线段树查询其对应的区间，找出包含该值的最小区间，并返回该区间的长度。

### 如何用线段树解决？

我们将问题抽象为一个区间覆盖的问题。具体步骤如下：

1. **区间排序**：首先对所有区间按左端点排序，以便我们可以在扫描线过程中依次处理区间。
   
2. **线段树维护**：使用线段树来维护当前扫描到的区间。在每次查询时，使用线段树来查找当前查询值所在的区间。

3. **查询处理**：对于每个查询，查询当前活动区间中包含该查询值的最小区间长度。

## 实现

题目可以转化为更新区间内的最小值，查询某个点的值，即区间更新，单点查询；

可以使用树状数组和线段树，但树状数组需要离散化，动态线段树比较省事儿

需要注意

- update方法最后不需要向上更新

- 懒标记mark和val都需要初始化为MAX

```java
class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        Node root = new Node(1, (int)1e7);
        for(int[] in:intervals){
            root.update(in[0],in[1],in[1]-in[0]+1);
        }
        int[] ans = new int[queries.length];
        for(int i=0;i<queries.length;i++){
            int cur = root.query(queries[i], queries[i]);
            ans[i] = cur==Integer.MAX_VALUE?-1:cur;
        }

        return ans;
    }

    class Node{
        int left;
        int right;
        int val;
        int mark;
        Node leftNode;
        Node rightNode;

        public Node(int l, int r){
            left = l;
            right = r;
            val = Integer.MAX_VALUE;
            mark = Integer.MAX_VALUE;
        }

        public Node getLeftNode(){
            if (leftNode==null){
                leftNode = new Node(left, left+(right-left)/2);
            }
            return leftNode;
        }

        public Node getRightNode(){
            if(rightNode==null){
                rightNode = new Node(left+(right-left)/2+1, right);
            }
            return rightNode;
        }

        public void update(int lo, int hi, int v){
            if(left>hi||right<lo||v>=val){
                return;
            }
            if(left>=lo&&right<=hi){
                val = v;
                mark = v;
                return;
            }
            pushDown();
            getLeftNode().update(lo,hi,v);
            getRightNode().update(lo,hi,v);
        }

        public int query(int lo, int hi){
            if(left>hi||right<lo){
                return Integer.MAX_VALUE;
            }
            if(left>=lo&&right<=hi){
                return val;
            }
            pushDown();
            return Math.min(getLeftNode().query(lo,hi), getRightNode().query(lo,hi));
        }

        public void pushDown(){
            if(mark != Integer.MAX_VALUE){
                getLeftNode().val = Math.min(leftNode.val, mark);
                getRightNode().val = Math.min(rightNode.val, mark);
                getLeftNode().mark = Math.min(leftNode.mark, mark);
                getRightNode().mark = Math.min(rightNode.mark, mark);
                mark = Integer.MAX_VALUE;
            }
        }
    }
}
```

## 效果

197ms 击败7.14%

这个效果一般，毕竟是通用解法。

# V5-树状数组 BIT

## 思路

线段树应该可以在线解决这道题，但线段树写起来比较麻烦，使用离线思想可以更简单的解决这道题。

首先对queries排序，对intervals按左端点排序。

当遍历到一个查询时，能满足要求的区间必然有左端点小于等于查询的位置，也就是intervals的左边一段，只需要考虑这些区间。而查询是升序的，每次需要考虑的区间只会增加，不会减少，可以双指针遍历。

这样对于每个查询，可以快速找到左端点满足条件的区间，接下来再来考虑右端点。

满足条件的区间的右端点应该大于等于查询位置，换句话说，查询的结果应该是右端点大于等于查询位置的区间中，区间长度的最小值。

设数组 L 在下标 p 处的值 L[p] 表示以 p 为区间右端点的区间的长度最小值，查询结果就相当于数组 L 的后缀最小值，可以用树状数组维护。

当然，用树状数组处理后缀和还是有点别扭，代码中把上面的这些过程颠倒了一下，查询是逆序排序的，区间是按右端点逆序排序的，这样要处理的就是左端点的前缀和了。

这道题的数据范围比较大，还需要离散化一下。

## c++ 实现

```c++
// 树状数组
class BIT {
public:
    vector<int> tree;

    BIT(int n) : tree(n + 1, INT_MAX) {}

    void update(int p, int delta) {
        const int n = tree.size();
        for (int i = p + 1;i < n;i += i & -i)
            if (delta < tree[i])
                tree[i] = delta;
    }

    int query(int p) const {
        int ans = INT_MAX;
        for (int i = p;i > 0;i -= i & -i)
            if (tree[i] < ans)
                ans = tree[i];
        return ans;
    }
};

class Solution {
public:
    struct item {
        int val;
        int idx;
        bool operator<(item const& other) const {   
            return val > other.val;
        }
    };
    
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
        const int m = intervals.size(), n = queries.size();
        // 离散化
        vector<int> order;
        for (const auto& e : intervals)
            order.push_back(e[0]);
        auto first = order.begin();
        auto last = order.end();
        sort(first, last);
        last = order.erase(unique(first, last), last);
        // 排序
        vector<item> items;
        for (int i = 0;i < n;++i)
            items.push_back({queries[i], i});
        sort(items.begin(), items.end());
        sort(intervals.begin(), intervals.end(),
            [] (vector<int> const& v1, vector<int> const& v2) {
                return v1[1] > v2[1];
            });
        // 树状数组
        BIT tree(order.size());
        vector<int> ans(n);
        int i = 0, j = 0;
        for (;i < n;++i) {
            for (;j < m;++j) {
                const int l = intervals[j][0], r = intervals[j][1];
                if (r < items[i].val) break;
                tree.update(lower_bound(first, last, l) - first, r - l + 1);
            }
            ans[items[i].idx] = tree.query(upper_bound(first, last, items[i].val) - first);
        }
        for (int& e : ans)
            if (e == INT_MAX)
                e = -1;
        return ans;
    }
};
```

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 扫描线专题

[leetcode 扫描线专题 06-扫描线算法（Sweep Line Algorithm）](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-000-sweep-line-intro)

[leetcode 扫描线专题 06-leetcode.218 the-skyline-problem 力扣.218 天际线问题](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-218-sweep-line-skyline)

[leetcode 扫描线专题 06-leetcode.252 meeting room 力扣.252 会议室](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-252-sweep-line-meeting-room)

[leetcode 扫描线专题 06-leetcode.253 meeting room ii 力扣.253 会议室 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-253-sweep-line-meeting-room-ii)

# 参考资料

https://leetcode.cn/problems/4sum/

https://leetcode.cn/problems/rectangle-overlap/solutions/155825/tu-jie-jiang-ju-xing-zhong-die-wen-ti-zhuan-hua-we/

https://leetcode.cn/problems/minimum-interval-to-include-each-query/solutions/755213/c-chi-xian-shu-zhuang-shu-zu-jie-fa-by-v-tatt/?envType=problem-list-v2&envId=line-sweep

* any list
{:toc}