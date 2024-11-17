---
layout: post
title: leetcode offline-query-optimize 离线查询优化-05-线段树 segment tree
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, offline-query-optimize, sf]
published: true
---


# chat


## 详细介绍一下 线段树

### 什么是线段树？

线段树是一种**二叉树数据结构**，用于快速处理数组的**区间查询**和**区间更新**操作。

它将一个数组分为多个区间，每个节点保存一个区间的信息，可以在 \(O(\log n)\) 的时间内完成以下操作：

1. **区间查询**：如查询区间 `[l, r]` 的和、最大值、最小值等。
2. **区间更新**：如将区间 `[l, r]` 的值增加、减少或直接赋值。

---

### 线段树的特点

1. **存储形式**：线段树可以用**数组**或**链式结构**表示。通常使用数组表示，索引从 `0` 开始。
2. **性质**：
   - 叶节点表示单个元素。
   - 内部节点表示对应区间的聚合信息（如区间和或最大值）。
3. **时间复杂度**：
   - 构建：\(O(n)\)。
   - 单次查询：\(O(\log n)\)。
   - 单次更新：\(O(\log n)\)。
4. **空间复杂度**：\(O(4n)\)，线段树最多需要 \(4n\) 的空间。

---

### 线段树的操作

#### 1. 构建线段树

将数组 `arr` 构建成线段树，存储在 `tree` 中。

**递归公式**：
- 如果 `start == end`（叶节点）：`tree[node] = arr[start]`
- 否则：
  ```
  mid = (start + end) / 2
  tree[node] = merge(tree[leftChild], tree[rightChild])
  ```
  其中，`leftChild = 2 * node + 1`, `rightChild = 2 * node + 2`。

**代码实现**：

```java
// 构建线段树
public void buildTree(int[] arr, int[] tree, int node, int start, int end) {
    if (start == end) {
        // 叶节点：直接存储数组的值
        tree[node] = arr[start];
    } else {
        int mid = (start + end) / 2;
        int leftChild = 2 * node + 1;
        int rightChild = 2 * node + 2;

        // 递归构建左右子树
        buildTree(arr, tree, leftChild, start, mid);
        buildTree(arr, tree, rightChild, mid + 1, end);

        // 合并左右子树的结果
        tree[node] = tree[leftChild] + tree[rightChild]; // 示例为区间和
    }
}
```

---

#### 2. 区间查询

查询区间 `[l, r]` 的值。

**递归公式**：
- 如果区间 `[l, r]` 完全包含节点区间 `[start, end]`，返回 `tree[node]`。
- 如果区间 `[l, r]` 完全不相交，返回中性值（如区间和为 `0`，最小值为 `Integer.MAX_VALUE`）。
- 如果区间 `[l, r]` 部分相交：
  ```
  mid = (start + end) / 2
  leftResult = query(tree, leftChild, start, mid, l, r)
  rightResult = query(tree, rightChild, mid + 1, end, l, r)
  result = merge(leftResult, rightResult)
  ```

**代码实现**：

```java
// 查询区间 [l, r]
public int query(int[] tree, int node, int start, int end, int l, int r) {
    if (r < start || l > end) {
        // 完全不相交
        return 0; // 示例为区间和，返回中性值
    }
    if (l <= start && end <= r) {
        // 完全包含
        return tree[node];
    }

    // 部分相交
    int mid = (start + end) / 2;
    int leftChild = 2 * node + 1;
    int rightChild = 2 * node + 2;

    int leftResult = query(tree, leftChild, start, mid, l, r);
    int rightResult = query(tree, rightChild, mid + 1, end, l, r);

    // 合并结果
    return leftResult + rightResult; // 示例为区间和
}
```

---

#### 3. 单点更新

将数组中的某个值 `arr[idx]` 更新为 `val`。

**递归公式**：
- 如果 `start == end`（叶节点）：更新值为 `val`。
- 否则：
  ```
  mid = (start + end) / 2
  if (idx <= mid) {
      update(tree, leftChild, start, mid, idx, val)
  } else {
      update(tree, rightChild, mid + 1, end, idx, val)
  }
  tree[node] = merge(tree[leftChild], tree[rightChild])
  ```

**代码实现**：

```java
// 单点更新，将 arr[idx] 更新为 val
public void update(int[] tree, int node, int start, int end, int idx, int val) {
    if (start == end) {
        // 叶节点：直接更新
        tree[node] = val;
    } else {
        int mid = (start + end) / 2;
        int leftChild = 2 * node + 1;
        int rightChild = 2 * node + 2;

        if (idx <= mid) {
            // 更新左子树
            update(tree, leftChild, start, mid, idx, val);
        } else {
            // 更新右子树
            update(tree, rightChild, mid + 1, end, idx, val);
        }

        // 合并左右子树的结果
        tree[node] = tree[leftChild] + tree[rightChild]; // 示例为区间和
    }
}
```

---

### 示例运行

#### 输入
数组：
```
arr = [1, 3, 5, 7, 9, 11]
```

构建线段树后（示例为区间和），`tree` 的内容为：
```
tree = [36, 9, 27, 4, 5, 16, 11, 1, 3, 0, 0, 7, 9, 0, 0]
```

#### 区间查询
- 查询 `[2, 5]` 的区间和：
  ```
  query(tree, 0, 0, 5, 2, 5) = 32
  ```

#### 单点更新
- 将 `arr[3]` 更新为 `10`：
  ```
  update(tree, 0, 0, 5, 3, 10)
  ```

更新后，`tree` 内容变为：
```
tree = [39, 12, 27, 4, 8, 16, 11, 1, 3, 0, 0, 10, 9, 0, 0]
```

---

### 总结

1. **核心公式**：
   - 构建：`tree[node] = merge(tree[leftChild], tree[rightChild])`
   - 查询：递归部分相交区间，合并结果。
   - 更新：递归更新叶节点后回溯更新区间值。
2. **时间复杂度**：
   - 构建：`O(n)`
   - 单次查询/更新：`O(log n)`。
3. **优点**：支持高效区间查询和更新，灵活处理多种聚合操作（和、最大值、最小值）。
4. **缺点**：实现复杂，区间更新需额外优化（如懒惰标记）。


## 线段树应用场景

线段树因其高效的区间查询和更新能力，在多种场景下特别有用。

以下是一些典型的应用场景：

1. **区间查询**：
   - **区间求和**：在需要频繁查询数组中某个区间的和的场景，如股票价格分析、财务数据汇总等。
   - **区间最小值/最大值**：在需要快速找到某个区间内的最小值或最大值的场景，如温度变化分析、比赛得分统计等。

2. **区间更新**：
   - **单点更新**：在需要更新数组中某个元素的值，并快速反映这个变化到区间查询结果中的场景，如实时数据监控、传感器数据更新等。
   - **区间修改**：在需要对数组中的一个区间的所有元素进行相同操作的场景，如批量修改商品价格、调整服务费用等。

3. **游戏开发**：
   - 在游戏开发中，线段树可以用来处理游戏地图上的事件，如计算特定区域内的敌人数量、资源分布等。

4. **图算法中的拓扑排序**：
   - 线段树可以用于计算图中的最长路径或者最短路径，尤其是在动态图中，节点和边可能会频繁地添加或删除。

5. **数据库**：
   - 在数据库中，线段树可以用于处理区间查询和更新，如时间序列数据的存储和查询。

6. **文本编辑器**：
   - 在高级文本编辑器中，线段树可以用来处理文本的快速插入和删除操作，以及查询特定范围内的文本信息。

7. **动态规划问题**：
   - 在解决一些动态规划问题时，线段树可以用来高效地处理状态的更新和查询。

8. **实时系统监控**：
   - 在系统监控工具中，线段树可以用来实时更新和查询系统的性能指标，如CPU使用率、内存使用情况等。

9. **计算几何**：
   - 在计算几何问题中，线段树可以用来处理区间内点的查询和更新，如点的包含关系、最近邻搜索等。

10. **生物信息学**：
    - 在生物信息学中，线段树可以用于处理基因序列的查询和比较。

线段树因其灵活性和高效性，在需要处理大量数据且对查询和更新响应时间有要求的场景下尤其有用。通过使用线段树，开发者可以减少算法的时间复杂度，提高程序的性能。


* any list
{:toc}