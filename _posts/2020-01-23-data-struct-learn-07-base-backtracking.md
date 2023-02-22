---
layout: post
title: 五大基本算法之回溯算法 backtracking
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, algorithm, sh]
published: true
---

面试算法：回溯算法与分割回文串实战

# 回溯算法

回溯算法实际上一个类似枚举的搜索尝试过程，主要是在搜索尝试过程中寻找问题的解，当发现已不满足求解条件时，就“回溯”返回，尝试别的路径。

回溯法是一种选优搜索法，按选优条件向前搜索，以达到目标。

但当探索到某一步时，发现原先选择并不优或达不到目标，就退回一步重新选择，这种走不通就退回再走的技术为回溯法，而满足回溯条件的某个状态的点称为“回溯点”。

许多复杂的，规模较大的问题都可以使用回溯法，有“通用解题方法”的美称。

## 与穷举的联系

回溯法简单来说就是按照深度优先的顺序，穷举所有可能性的算法，但是回溯算法比暴力穷举法更高明的地方就是回溯算法可以随时判断当前状态是否符合问题的条件。

一旦不符合条件，那么就退回到上一个状态，省去了继续往下探索的时间。

回溯法的特点是深度优先遍历，也就是该问题的遍历顺序是1->2->3，然后从子节点3返回，从子节点2返回，再到1->3->2，以此类推。

状态的返回只有当前的节点不再满足问题的条件或者我们已经找到了问题的一个解时，才会返回，否则会以深度优先一直在解空间树内遍历下去。

当然，对于某些问题如果其解空间过大，即使用回溯法进行计算也有很高的时间复杂度，因为回溯法会尝试解空间树中所有的分支。

## 剪枝

所以根据这类问题，我们有一些优化剪枝策略以及启发式搜索策略。

所谓优化剪枝策略，就是判断当前的分支树是否符合问题的条件，如果当前分支树不符合条件，那么就不再遍历这个分支里的所有路径。

所谓启发式搜索策略指的是，给回溯法搜索子节点的顺序设定一个优先级，从该子节点往下遍历更有可能找到问题的解。

# 一般步骤

回溯算法也叫试探法，它是一种系统地搜索问题的解的方法。

用回溯算法解决问题的一般步骤：

1、针对所给问题，定义问题的解空间，它至少包含问题的一个（最优）解。

2、确定易于搜索的解空间结构,使得能用回溯法方便地搜索整个解空间 。

3、以深度优先的方式搜索解空间，并且在搜索过程中用剪枝函数避免无效搜索。

# 基本思想

回溯算法的基本思想是：从一条路往前走，能进则进，不能进则退回来，换一条路再试。

**回溯算法说白了就是穷举法。不过回溯算法使用剪枝函数，剪去一些不可能到达 最终状态（即答案状态）的节点，从而减少状态空间树节点的生成。**

回溯法是一个既带有系统性又带有跳跃性的的搜索算法。

它在包含问题的所有解的解空间树中，按照深度优先的策略，从根结点出发搜索解空间树。

算法搜索至解空间树的任一结点时，总是先判断该结点是否肯定不包含问题的解。

如果肯定不包含，则跳过对以该结点为根的子树的系统搜索，逐层向其祖先结点回溯。

否则，进入该子树，继续按深度优先的策略进行搜索。

回溯法在用来求问题的所有解时，要回溯到根，且根结点的所有子树都已被搜索遍才结束。

而回溯法在用来求问题的任一解时，只要搜索到问题的一个解就可以结束。

这种以深度优先的方式系统地搜索问题的解的算法称为回溯法，它适用于解一些组合数较大的问题。

# 分割回文串

## 题目

[131. 分割回文串](https://leetcode-cn.com/problems/palindrome-partitioning/)

给你一个字符串 s，请你将 s 分割成一些子串，使每个子串都是 回文串 。返回 s 所有可能的分割方案。

回文串是正着读和反着读都一样的字符串。

示例 1：

```
输入：s = "aab"
输出：[["a","a","b"],["aa","b"]]
```

示例 2：

```
输入：s = "a"
输出：[["a"]] 
```

提示：

1 <= s.length <= 16

s 仅由小写英文字母组成

## 思路1-回溯

我能想到最自然的解法就是回溯。

这题大概花了 30min 左右解出来的，整体思路如下：

（1）子字符串的截取方式

最短的可能性为1，最长可能是整个字符串

（2）回文的判断

可以翻转字符串，和原来字符串相等，则认为是回文。

也可以，从前往后进行比较（有点双指针的感觉），遇到不一致的则认为不是。

（3）终止条件

当截取的 index 等于源字符串的长度-1

### java 实现

java 实现如下:

```java
public List<List<String>> partition(String s) {
    List<List<String>> results = new ArrayList<>();
    backtrack(results, new ArrayList<>(), s, 0);
    return results;
}

private void backtrack(List<List<String>> results, List<String> tempList,
                       String s, int startIndex) {
    // 终止的条件
    // 元素的長度等於 s
    if(startIndex == s.length()) {
        results.add(new ArrayList<>(tempList));
    } else {
        // 如何进行回溯处理呢？
        for(int i = 1; i <= s.length()-startIndex; i++) {
            int endIndex = startIndex + i;
            String subString = s.substring(startIndex, endIndex);
            if(isPalindrome(subString)) {
                tempList.add(subString);
                // 执行具体的逻辑
                backtrack(results, tempList, s, endIndex);
                // 回溯
                tempList.remove(tempList.size()-1);
            }
        }
    }
}

private boolean isPalindrome(String s) {
    if(s.length() == 1) {
        return true;
    }
    char[] chars = s.toCharArray();
    int low = 0;
    int high = chars.length-1;
    while (low < high) {
        if(chars[low] != chars[high] ) {
            return false;
        }
        low++;
        high--;
    }
    return true;
}
```

效果如下：

```
Runtime: 8 ms, faster than 79.54% of Java online submissions for Palindrome Partitioning.
Memory Usage: 52.8 MB, less than 67.93% of Java online submissions for Palindrome Partitioning.
```

只能说是中规中矩，看了其他答案，感觉不是自己的菜，目前也记不住。

## 优化思路

看到官方解题中的对于回文的判断比较有趣，这里记录一下。

利用动态规划，来判断是否为回文。

```java
int[][] f;
List<List<String>> ret = new ArrayList<List<String>>();
List<String> ans = new ArrayList<String>();
int n;

public List<List<String>> partition(String s) {
    n = s.length();
    f = new int[n][n];
    dfs(s, 0);
    return ret;
}

public void dfs(String s, int i) {
    if (i == n) {
        ret.add(new ArrayList<String>(ans));
        return;
    }
    for (int j = i; j < n; ++j) {
        if (isPalindrome(s, i, j) == 1) {
            ans.add(s.substring(i, j + 1));
            dfs(s, j + 1);
            ans.remove(ans.size() - 1);
        }
    }
}

// 记忆化搜索中，f[i][j] = 0 表示未搜索，1 表示是回文串，-1 表示不是回文串
public int isPalindrome(String s, int i, int j) {
    if (f[i][j] != 0) {
        return f[i][j];
    }
    if (i >= j) {
        f[i][j] = 1;
    } else if (s.charAt(i) == s.charAt(j)) {
        f[i][j] = isPalindrome(s, i + 1, j - 1);
    } else {
        f[i][j] = -1;
    }
    return f[i][j];
}
```

效果：

```
Runtime: 7 ms, faster than 99.23% of Java online submissions for Palindrome Partitioning.
Memory Usage: 53.2 MB, less than 49.46% of Java online submissions for Palindrome Partitioning.
```

忽然返现，这 1ms 的差距，差的人还是很多的。

# 8 皇后问题

## 问题

在 8×8 格的国际象棋上摆放八个皇后，使其不能互相攻击，即任意两个皇后都不能处于同一行、同一列或同一斜线上，问有多少种摆法。

## 解法

```c
int g_number = 0;
 
  
void EightQueen()
 
{
 
    const int queens = 8;
 
    int ColumnIndex[queens];
 
    for(int i = 0; i < queens; ++ i)
 
        ColumnIndex[i] = i;
 
  
 
    Permutation(ColumnIndex, queens, 0);
 
}
 
  
 
void Permutation(int ColumnIndex[], int length, int index)
 
{
 
    if(index == length)
 
    {
 
        if(Check(ColumnIndex, length))
 
        {
 
            ++ g_number;
 
            PrintQueen(ColumnIndex, length);
 
        }
 
    }
 
    else
 
    {
 
        for(int i = index; i < length; ++ i)
 
        {
 
            int temp = ColumnIndex[i];
 
            ColumnIndex[i] = ColumnIndex[index];
 
            ColumnIndex[index] = temp;
 
  
 
            Permutation(ColumnIndex, length, index + 1);
 
  
 
            temp = ColumnIndex[index];
 
            ColumnIndex[index] = ColumnIndex[i];
 
            ColumnIndex[i] = temp;
 
        }
 
    }
 
}
 
  
 
bool Check(int ColumnIndex[], int length)
{
 
    for(int i = 0; i < length; ++ i)
 
    {
 
        for(int j = i + 1; j < length; ++ j)
 
        {
 
            if((i - j == ColumnIndex[i] - ColumnIndex[j])
 
                || (j - i == ColumnIndex[i] - ColumnIndex[j]))
 
            return false;
 
        }
 
    }
 
    return true;
}
 
void PrintQueen(int ColumnIndex[], int length)
{
 
    printf("Solution %d\n", g_number);
 
  
 
    for(int i = 0; i < length; ++i)
 
        printf("%d\t", ColumnIndex[i]);
 
    
 
    printf("\n");
 
}
```

# 背包问题

有N件物品和一个容量为V的背包。

第i件物品的价格（即体积，下同）是w[i]，价值是c[i]。

求解将哪些物品装入背包可使这些物品的费用总和不超过背包容量，且价值总和最大。

这是最基础的背包问题，总的来说就是：选还是不选，这是个问题

相当于用f[i][j]表示前i个物品装入容量为v的背包中所可以获得的最大价值。

对于一个物品，只有两种情况

情况一: 第i件不放进去，这时所得价值为:f[i-1][v]

情况二: 第i件放进去，这时所得价值为：f[i-1][v-c[i]]+w[i]

接下来的实例属于算法进阶，可做了解

提两点，

1. 与上期贪婪法所解决的背包问题相比，回溯法将能更能顾及寻找全局最优。

2. 背包问题与八皇后问题所用的算法虽然都是回溯法，但是他们的目的不一样，八皇后只要求把所有的棋子放在棋盘上（即只需解决深度最优）。

而背包问题不仅需要让物品都放进背包，而且要使得物品质量最大，在八皇后问题上多提出了一个限制。

## 问题的解空间

用回溯法解问题时，应明确定义问题的解空间。问题的解空间至少包含问题的一个(最优)解。

对于 n=3 时的 0/1 背包问题，可用一棵完全二叉树表示解空间，如图所示：

![背包问题](https://upload-images.jianshu.io/upload_images/15646173-e78825cb1debbd92.png?imageMogr2/auto-orient/strip|imageView2/2/w/876/format/webp)

## 求解步骤

1) 针对所给问题，定义问题的解空间；

2) 确定易于搜索的解空间结构；

3) 以深度优先方式搜索解空间，并在搜索过程中用剪枝函数避免无效搜索。

**常用的剪枝函数：用约束函数在扩展结点处剪去不满足约束的子树；用限界函数剪去得不到最优解的子树。**

回溯法对解空间做深度优先搜索时，有递归回溯和迭代回溯（非递归）两种方法，但一般情况下用递归方法实现回溯法。

## 算法描述

解 0/1 背包问题的回溯法在搜索解空间树时，只要其左儿子结点是一个可行结点，搜索就进入其左子树。

当右子树中有可能包含最优解时才进入右子树搜索。

否则将右子树剪去。

```cpp
void dfs(int i,int cv,int cw)
{   
    //cw当前包内物品重量，cv当前包内物品价值
    if(i>n)   
    {
        if(cv>bestval)             //是否超过了最大价值
        {
            bestval=cv;            //得到最大价值
            for(i=1;i<=n;i++)      
                bestx[i]=x[i];      //得到选中的物品
        }
    }
    else 
        for(int j=0;j<=1;j++)    //枚举物体i所有可能的路径，
        {
            x[i]=j;      
            if(cw+x[i]*w[i]<=TotCap)  //满足约束,继续向子节点探索
            {
                cw+=w[i]*x[i];
                cv+=val[i]*x[i];
                dfs(i+1,cv,cw);
                cw-=w[i]*x[i];    //回溯上一层物体的选择情况
                cv-=val[i]*x[i];
            }
        }
}
```

这里其实是：穷举+剪枝+回溯

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[百度百科-回溯算法](https://baike.baidu.com/item/%E5%9B%9E%E6%BA%AF%E7%AE%97%E6%B3%95/9258495?fr=aladdin)

[回溯算法](https://www.jianshu.com/p/dd3c3f3e84c0)

* any list
{:toc}