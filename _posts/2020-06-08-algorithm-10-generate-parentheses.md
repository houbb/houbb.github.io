---
layout: post
title: leecode 详解 07-generate-parentheses 括号生成
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [Algorithm, data-struct, leetcode, sf]
published: true
---

## 括号生成

### 题目

数字 n 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且有效的括号组合。

示例：

```
输入：n = 3
输出：[
       "((()))",
       "(()())",
       "(())()",
       "()(())",
       "()()()"
     ]
```

### 思路分析

你看这道题，他的样子平淡无奇。

但是既然我们选择讲解，那他一定有自己的不凡之处，下面我们来逐层学习这道题背后解法。

题目在于精，而不在于多，可以举一反三，自然胜过走马观花。

## 思路1-暴力破万法

忘记在哪里看到的一句话，计算机实际上只会一种策略——穷举，所有的算法只是教会其如何更加聪明的穷举而已。

首先，我们来看一种最简单粗暴的方式。

### 流程

1. 构建所有 `()` 可能构成的字符串

2. 过滤出其中符合条件的字符串。

### 示例代码

```java
/**
 *
 * 思路：
 *
 * （1）生成所有可能
 * （2）如果符合则加入结果
 *
 * @param n 数字
 * @return 结果
 */
public List<String> generateParenthesis(int n) {
    List<String> all = generateAll(n);
    List<String> resultList = new ArrayList<>();
    for(String string : all) {
        if(isValid(string)) {
            resultList.add(string);
        }
    }
    return resultList;
}

/**
 * 生成所有的可能字符串
 * @param n 个数
 * @return 结果
 */
private List<String> generateAll(final int n) {
    List<String> resultList = new ArrayList<>();
    resultList.add("");
    char[] chars = new char[]{'(', ')'};
    for(int i = 0; i < n*2; i++) {
        List<String> newList = new ArrayList<>();
        for(String result : resultList) {
            for(char c: chars) {
                newList.add(result+c);
            }
        }
        resultList = newList;
    }
    return resultList;
}

/**
 * 是否合法
 * @param s 字符串
 * @return 结果
 */
private boolean isValid(final String s) {
    int length = s.length();
    int headIx = 0;
    for(int i = 0; i < length; i++) {
        char c = s.charAt(i);
        if('(' == c) {
            headIx++;
        } else {
            if(headIx == 0) {
                return false;
            }
            headIx--;
        }
    }
    return headIx == 0;
}
```

### 性能

这个方法提交，结果评测只能超过 5.08% 的实现，太惨了！

这是乌龟妈妈开门——慢到家了。

那么问题出在哪里呢？其实就是这种穷举太笨了，没有一点选择性。

## 思路2-DFS 深度优先遍历

我们考虑 n=2 的情况，即 left 表示“左括号还有几个没有用掉”，right 表示“右括号还有几个没有用掉”，可以画出一棵递归树。

![dfs](https://pic.leetcode-cn.com/efbe574e5e6addcd1c9dc5c13a50c6f162a2b14a95d6aed2c394e18287a067fa-image.png)

这里我们可以很明显的做一些剪枝算法，把不可能的情况提前过滤掉。

### 流程

1. 第一个有效符号一定是 `(`

2. `(` 个数比 `)` 少的时候，进行剪枝

3. `(` 和 `)` 的个数都等于 n 的时候，一次遍历就结束了。

### 实现

```java
public List<String> generateParenthesis(int n) {
    List<String> resultList = new ArrayList<>();
    dfs(resultList, "", 0, 0, n);
    return resultList;
}

/**
 * 深度优先遍历
 * @param resultList 结果列表
 * @param string 字符串
 * @param left 左括号
 * @param right 右括号
 * @param num 位数
 */
private void dfs(List<String> resultList,
                 String string,
                 int left,
                 int right,
                 int num) {
    if(left == num && right == num) {
        resultList.add(string);
        return;
    }
    //左边的括号是可以一直加的
    if(left < num) {
        dfs(resultList, string+"(", left+1, right, num);
    }
    // 这里是对剪枝处理的优化，如果 left < right，是跳过的。
    // ) 小于 < 的时候，可以添加
    if(right < left) {
        dfs(resultList, string+")", left, right+1, num);
    }
}
```

### 性能

```
Runtime: 1 ms, faster than 85.42% of Java online submissions for Generate Parentheses.
Memory Usage: 39 MB, less than 98.86% of Java online submissions for Generate Parentheses.
```

这里超越了 85% 的实现，但是作为算法题解，我们是不满意的。

那么问题出在哪里呢？

实际上 String 有过多次的隐式创建，还是很消耗性能的。我们来做一个改良版本。

## 思路3-DFS 深度优先遍历改进

### 实现

其实这里才算是一个标准的回溯算法。

核心区别就是我们使用 StringBuilder 替代了 String，注意这里是需要重新设置长度的，这样才能保证回溯正确。

```java
public List<String> generateParenthesis(int n) {
    List<String> resultList = new ArrayList<>();
    StringBuilder stringBuilder = new StringBuilder(n << 1);
    backtrack(resultList, stringBuilder, 0, 0, n);
    return resultList;
}

/**
 * 递归处理
 * @param resultList 结果列表
 * @param stringBuilder 字符串
 * @param left 左括号
 * @param right 右括号
 * @param num 位数
 */
private void backtrack(List<String> resultList,
                       StringBuilder stringBuilder,
                       int left,
                       int right,
                       int num) {
    if(stringBuilder.length() == num << 1) {
        resultList.add(stringBuilder.toString());
        return;
    }
    //左边的括号是可以一直加的
    if(left < num) {
        backtrack(resultList, stringBuilder.append("("), left+1, right, num);
        // 重新设置
        stringBuilder.setLength(stringBuilder.length()-1);
    }
    // ) 小于 < 的时候，可以添加
    if(right < left) {
        backtrack(resultList, stringBuilder.append(")"), left, right+1, num);
        stringBuilder.setLength(stringBuilder.length()-1);
    }
}
```

### 性能

超越了 100% 的 java 实现，这次算是基本满意了。

实际上还是有些地方可以优化的，比如列表扩容等等，此处不再展示。

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Generate Parentheses.
Memory Usage: 39.6 MB, less than 63.29% of Java online submissions for Generate Parentheses.
```

看到这里你可能会想，终于结束了，这道题还有点意思。

少侠留步，为了举一反三，本文还将讨论下此类问题的其他几种解法。

让你感受一下，一题更比六题强的快乐~

## 思路4-DFS 深度优先方式2

上面主要展示了 DFS 做加法的方式，其实也可以反过来做减法。

整体大同小异，和思路 2 比较类似，此处保留主要是为了提供更多的角度。

整体图示：

![dfs](https://pic.leetcode-cn.com/7ec04f84e936e95782aba26c4663c5fe7aaf94a2a80986a97d81574467b0c513-LeetCode%20%E7%AC%AC%2022%20%E9%A2%98%EF%BC%9A%E2%80%9C%E6%8B%AC%E5%8F%B7%E7%94%9F%E5%87%BA%E2%80%9D%E9%A2%98%E8%A7%A3%E9%85%8D%E5%9B%BE.png)

### java 实现

```java
public List<String> generateParenthesis(int n) {
    List<String> resultList = new ArrayList<>();
    dfs(resultList, "", n, n, n);
    return resultList;
}

/**
 * 深度优先遍历
 * @param resultList 结果列表
 * @param string 字符串
 * @param left 左括号
 * @param right 右括号
 * @param num 位数
 */
private void dfs(List<String> resultList,
                 String string,
                 int left,
                 int right,
                 int num) {
    if(left == 0 && right == 0) {
        resultList.add(string);
        return;
    }
    // 剪枝（左括号可以使用的个数严格大于右括号可以使用的个数）
    if (left > right) {
        return;
    }
    if(left > 0) {
        dfs(resultList, string+"(", left-1, right, num);
    }
    if(right > 0) {
        dfs(resultList, string+")", left, right-1, num);
    }
}
```

## 思路5-BFS 广度优先遍历

说到 DFS，那么自然而然可以想到 BFS。

不过 BFS 需要我们自己去处理一下节点，用起来感觉没有 DFS 递归方便，此处也记录一下，拓展一下思路。

或者你遇到了指定用 BFS 去解决的题目：

### java 实现

这里采用自定义 Node 节点，然后横向优先遍历的方式。

```java
class Node {
    private String text;
    private int left;
    private int right;

    public Node(String text, int left, int right) {
        this.text = text;
        this.left = left;
        this.right = right;
    }
}

/**
 * @param n 数字
 * @return 结果
 */
public List<String> generateParenthesis(int n) {
    List<String> res = new ArrayList<>();
    if (n == 0) {
        return res;
    }
    // 从上到下
    Queue<Node> queue = new LinkedList<>();
    Node rootNode = new Node("", 0, 0);
    queue.add(rootNode);
    while (!queue.isEmpty()) {
        Node curNode = queue.remove();
        // 最后一层
        if (curNode.left == n && curNode.right == n) {
            res.add(curNode.text);
        }
        if (curNode.left < n) {
            queue.add(new Node(curNode.text + "(", curNode.left + 1, curNode.right));
        }
        // 剪枝
        if (curNode.right < curNode.left) {
            queue.add(new Node(curNode.text + ")", curNode.left, curNode.right + 1));
        }
    }
    return res;
}
```

当然这里你可以自己实现基于栈 DFS 遍历，此处不再赘述。

## 思路6-DP 动态规划

动态规划，永远滴神~

此处直接参考 leetcode 官方解法。

### 核心思路

任何一个括号序列都一定是由 `(` 开头，并且第一个 `(` 一定有一个唯一与之对应的 `)`。

这样一来，每一个括号序列可以用 `(a)b` 来表示，其中 a 与 b 分别是一个合法的括号序列（可以为空）。

那么，要生成所有长度为 2 * n 的括号序列，我们定义一个函数 generate(n) 来返回所有可能的括号序列。

那么在函数 generate(n) 的过程中：

1. 我们需要枚举与第一个 ( 对应的 ) 的位置 2 * i + 1；

2. 递归调用 generate(i) 即可计算 a 的所有可能性；

3. 递归调用 generate(n - i - 1) 即可计算 b 的所有可能性；

4. 遍历 a 与 b 的所有可能性并拼接，即可得到所有长度为 2 * n 的括号序列。

为了节省计算时间，我们在每次 generate(i) 函数返回之前，把返回值存储起来，下次再调用 generate(i) 时可以直接返回，不需要再递归计算。

ps: DP 最核心的两点

（1）找到递推公式

（2）缓存结果，避免重复计算

### java 实现

```java
public List<String> generateParenthesis(int n) {
    // 存放缓存信息
    List<List<String>> cache = new ArrayList<>();
    // 初始化第一个元素列表为 [""]
    cache.add(Collections.singletonList(""));
    for (int i = 1; i <= n; i++) {
        List<String> cur = new ArrayList<>();
        for (int j = 0; j < i; j++) {
            List<String> str1 = cache.get(j);
            List<String> str2 = cache.get(i - 1 - j);
            for (String s1 : str1) {
                for (String s2 : str2) {
                    // 枚举右括号的位置
                    cur.add("(" + s1 + ")" + s2);
                }
            }
        }
        cache.add(cur);
    }
    return cache.get(n);
}
```

### 性能

不过这种算法实际执行效果却比较差：

```
Runtime: 7 ms, faster than 13.20% of Java online submissions for Generate Parentheses.
Memory Usage: 39.5 MB, less than 65.23% of Java online submissions for Generate Parentheses.
```

## 小结

类似的这种二叉树遍历问题，其实都可以使用 DFS/BFS，可以使用递归，也可以使用栈/队列实现。

针对本题，可以使用最笨的暴力算法，也可以通过剪枝降低耗时。

不知道你的收获如何呢？

## 参考资料

[generate-parentheses](https://leetcode-cn.com/problems/generate-parentheses)

[括号生成-官方解法](https://leetcode-cn.com/problems/generate-parentheses/solution/gua-hao-sheng-cheng-by-leetcode-solution/)

[回溯算法（深度优先遍历）+ 广度优先遍历 + 动态规划](https://leetcode-cn.com/problems/generate-parentheses/solution/hui-su-suan-fa-by-liweiwei1419/)

[二叉树 深度优先搜索（DFS）、广度优先搜索（BFS）](https://blog.csdn.net/chlele0105/article/details/38759593)

* any list
{:toc}