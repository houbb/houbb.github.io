---
layout: post
title: leetcode 20+32 Longest Valid Parentheses 动态规划/DP
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, stack, sh]
published: true
---

# 20. Valid Parentheses

Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

Open brackets must be closed by the same type of brackets.

Open brackets must be closed in the correct order.

Every close bracket has a corresponding open bracket of the same type.
 
## Ex

Example 1:

```
Input: s = "()"
Output: true
```

Example 2:

```
Input: s = "()[]{}"
Output: true
```

Example 3:

```
Input: s = "(]"
Output: false
```

## Constraints:

1 <= s.length <= 10^4

s consists of parentheses only '()[]{}'.


# 解题思路

这一题实际上不难。

只是为了下一题做铺垫。

`()` 这种是否成对出现，最常见的思路就是使用 stack。

遇到 `(` 开始字符，我们就 push 入栈；遇到 `)` 字符，就把 stack 中的字符 pop 出栈。

最后字符串遍历结束，然后 stack 刚好也是空的，说明 string 是符合条件的。

# 代码实现

## V1-stack 版本

我们引入一个 map，记录下几个成对字符的映射关系。

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

/**
 * @author d
 * @since 1.0.0
 */
public class T020_ValidParentheses {

    private static final Map<Character, Character> MAP = new HashMap<>(4);

    static {
        MAP.put(')', '(');
        MAP.put('}', '{');
        MAP.put(']', '[');
    }

    /**
     * 简单思路
     *
     * 【效果】
     *
     * Runtime: 1 ms, faster than 98.79% of Java online submissions for Valid Parentheses.
     * Memory Usage: 37.4 MB, less than 70.07% of Java online submissions for Valid Parentheses.
     *
     * @param s 字符串
     * @return 结果
     * @since v1
     */
    public boolean isValid(String s) {
        if(null == s || s.length() == 0) {
            return true;
        }
        // 奇数
        if(s.length() % 2 != 0) {
            return false;
        }

        Stack<Character> stack = new Stack<>();
        for(int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);

            if(c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                // 开始 pop
                if(stack.isEmpty()) {
                    return false;
                }

                char pop = stack.pop();
                char expectPop = MAP.get(c);

                if(pop != expectPop) {
                    return false;
                }
            }

        }

        return stack.isEmpty();
    }

}
```

## v2-基于数组模拟 stack

当然，大道至简。

我们就算使用数组，其实也可以模拟 stack，实现类似的效果。

```java
/**
 * 优化思路：
 *
 * 使用数组+指针替代 Stack
 *
 * <p> project: leetcode-ValidParentheses </p>
 * <p> create on 2020/6/16 22:49 </p>
 *
 * @author binbin.hou
 * @since 2020-6-16 22:49:35
 */
public class T020_ValidParenthesesV2 {

    /**
     * 大道至简
     *
     * 【效果】
     * Runtime: 0 ms, faster than 100.00% of Java online submissions for Valid Parentheses.
     * Memory Usage: 37.1 MB, less than 95.67% of Java online submissions for Valid Parentheses.
     *
     * @param s 字符串
     * @return 结果
     * @since v1
     */
    public boolean isValid(String s) {
        int length = s.length();
        char[] stack = new char[length];
        int headIx = 0;

        for(int i = 0; i < length; i++) {
            char c = s.charAt(i);

            switch (c) {
                case '{':
                case '[':
                case '(':
                    stack[headIx++] = c;
                    break;
                case '}':
                    if(headIx == 0 || stack[--headIx] != '{') {
                        return false;
                    }
                    break;
                case ']':
                    if(headIx == 0 || stack[--headIx] != '[') {
                        return false;
                    }
                    break;
                case ')':
                    if(headIx == 0 || stack[--headIx] != '(') {
                        return false;
                    }
                    break;
            }
        }

        return headIx == 0;
    }

}
```

# 32. Longest Valid Parentheses

开始我们今天的正菜。

Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.

## Ex

Example 1:

```
Input: s = "(()"
Output: 2
Explanation: The longest valid parentheses substring is "()".
```

Example 2:

```
Input: s = ")()())"
Output: 4
Explanation: The longest valid parentheses substring is "()()".
```

Example 3:

```
Input: s = ""
Output: 0
```

## Constraints:

0 <= s.length <= 3 * 10^4

s[i] is '(', or ')'.

# 初步思路

看到这个，我们结合 T20，如何判断字符串是否为有效的成对括弧并不难。

那么，如何找到最长的呢？

（1）暴力算法

我们把所有可能的 substring 构建出来，然后判断是否合法，找到最长的一个。

（2）双指针

一个字符串，想找到最长的合法 substring。

比较自然的其实会想到双指针的方式，i 从左边开始，j 从右边开始。

二者逐渐向中间靠拢，判断 substring 是否合法，合法返回，则此时就是最长的。

实现起来，个人采用的是固定步长的方式。

# V1-基本实现

为了实现双指针，我们采用固定步长的方式。

从 i=0 开始，逐步向右，步长逐渐变短。

```java
    /**
     * 最简单的思路：
     *
     * 1. 通过双指针，两边移动。截取 substring
     * 2. 通过 020 的方法，判断字符串是否为 valid，是返回 j-i
     * 3. i j 重合，返回 0
     *
     * 这种解法：会在 222 CASE 超时
     *
     * @param s 字符串
     * @return 结果
     */
    public int longestValidParentheses(String s) {
        //0.1 都不是
        if(s.length() <= 1) {
            return 0;
        }

        // 这个复杂度是 o(N^3)，肯定没戏
        for (int stepLen = s.length(); stepLen >= 2; stepLen--) {
            // 逆序，本质是双指针
            for(int i = 0; i < s.length()-1; i++) {
                // fast-return
                if(i + stepLen > s.length()) {
                    break;
                }

                String subString = s.substring(i, i+stepLen);

                if(isValid(subString)) {
                    return stepLen;
                }
            }
        }

        // 没有
        return 0;
    }

    /**
     * 大道至简
     *
     * T020
     *
     * @param s 字符串
     * @return 结果
     * @since v1
     */
    public static boolean isValid(String s) {
        // 奇数个，不可能满足
        if(s.length() % 2 != 0) {
            return false;
        }

        Stack<Character> stack = new Stack<>();
        for(int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);

            if(c == '(') {
                stack.push(c);
            } else {
                // 开始 pop
                if(stack.isEmpty()) {
                    return false;
                }

                char pop = stack.pop();
                char expectPop = '(';

                if(pop != expectPop) {
                    return false;
                }
            }

        }

        return stack.isEmpty();
    }
```

这个方法本身并没有问题，但是会超时。

isValid 判断是否合法，是 T20 的一个简化版本。

接下来，还是学习下其他实现方式。

> [two-java-solutions-with-explanation-stack-dp-short-easy-to-understand](https://leetcode.com/problems/longest-valid-parentheses/solutions/14278/two-java-solutions-with-explanation-stack-dp-short-easy-to-understand/)

# V2-基于 stack

## 基于堆栈的思路

```
// Stack solution 10ms
The idea is simple, we only update the result (max) when we find a "pair".
If we find a pair. We throw this pair away and see how big the gap is between current and previous invalid.
EX: "( )( )"
stack: -1, 0,
when we get to index 1 ")", the peek is "(" so we pop it out and see what's before "(".
In this example it's -1. So the gap is "current_index" - (-1) = 2.

The idea only update the result (max) when we find a "pair" and push -1 to stack first covered all edge cases.
```

这个想法很简单，我们只在找到“pair”时更新结果 (max)。

如果我们找到一对。 

我们把这对扔掉，看看当前和以前的无效之间的差距有多大。

```
例子： "()()"

堆栈：-1、0、
```

当我们到达索引 1“)”时，窥视是“(”，所以我们弹出它并查看“(”之前的内容。

在这个例子中它是-1。 所以差距是“current_index” - (-1) = 2。

当我们找到一个“pair”并将 -1 推入堆栈时，这个想法只会更新结果（最大值），首先覆盖所有边缘情况。


### 个人理解

以  `)(())` 为例子思考

一开始的 stack 入栈情况，

```
2   // (
1   // ( 
0   // )
-1  // 初始
```

一直到 i=3 的时候，才会看到 `)` 且匹配的情况。

我们把 stack 顶层弹出。然后 i=3 和 stack 当前的顶元素1对比，此时最长的就是 3-1 = 2。

```
1   // ( 
0   // )
-1  // 初始
```

i = 4 的时候，也会匹配。

继续 stack 弹出，i=3 和剩余的 stack 顶层元素对比，此时最长为 4 - 0 = 4。

```
0   // )
-1  // 初始
```

这种弹出之后，自然 `()` 就是一对。然后和剩余的对比，计算最大差异。如果连续都是满足的，则差值刚好也是满足的。

确实比较巧妙。

## java 实现

其实这个算法，可以认为是在 isValid 的基础之上的拓展。

```java
    /**
     * 基于 stack 的差异对比
     * 
     * @param s 字符串
     * @return 结果
     */
    public int longestValidParentheses(String s) {
        Stack<Integer> stack = new Stack<>();
        int result = 0;
        stack.push(-1);

        for(int i = 0; i < s.length(); i++) {
            // 当前为 )，且 stack 中上一个刚好为 (
            if (s.charAt(i) == ')' && stack.size() > 1 && s.charAt(stack.peek()) == '(') {
                stack.pop();
                result = Math.max(result, i - stack.peek());
            } else {
                stack.push(i);
            }
        }

        return result;
    }
```

耗时 60ms，超过 55%。

那么，还有其他的解法吗？

# V2-基于 DP

## 自己的初步思路

说实在的，一开始我也想到利用 dp。

因为如果一个字符串 `()` 是满足的，那么这个字符串的左右只需要是 `(` 和 `)` 构成的字符串肯定也是满足的。

但是，始终没有把这个技巧，和最大长度结合起来。

## 他山之石

```
//DP solution 4ms
The idea is go through the string and use DP to store the longest valid parentheses at that point.
take example "()(())"
i : [0,1,2,3,4,5]
s : [( ,) ,( ,( ,) ,) ]
DP:[0,2,0,0,2,6]

1, We count all the ‘(‘.
2, If we find a ‘)’ and ‘(‘ counter is not 0, we have at least a valid result size of 2. “()"
3, Check the the one before (i - 1). If DP[i - 1] is not 0 means we have something like this “(())” . This will have DP “0024"
4, We might have something before "(())”. Take "()(())” example, Check the i = 1 because this might be a consecutive valid string.
```

这个想法是遍历字符串并使用 DP 来存储此时最长的有效括号。

以 “()(())” 为例

```
i：[0,1,2,3,4,5]
s : [( ,) ,( ,( ,) ,) ]
DP：[0,2,0,0,2,6]
```

1，我们计算所有的'('。

2，如果我们发现一个')'和'('计数器不为0，我们至少有一个有效的结果大小为2。“()”

3、检查前一项(i - 1)。 如果 DP[i - 1] 不是 0 意味着我们有这样的东西 “(())” 。 这将有 DP “0024”

4，我们可能在“（（））”之前有一些东西。以“（）（（））”为例，检查i = 1，因为这可能是一个连续的有效字符串。

## java 实现

```java
public class Solution {
    public int longestValidParentheses(String s) {
        int[] dp = new int[s.length()];
        int result = 0;
        int leftCount = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                leftCount++;
            } else if (leftCount > 0){
                // 当前位置满足最长，() 的长度为2。在上一个最长的基础上+2
                dp[i] = dp[i - 1] + 2;

                dp[i] += (i - dp[i]) >= 0 ? dp[i - dp[i]] : 0;

                // 计算最大的结果
                result = Math.max(result, dp[i]);
                leftCount--;
            }
        }
        return result;
    }
}
```

`dp[i] += (i - dp[i]) >= 0 ? dp[i - dp[i]] : 0;` 这句话时最令人困惑的？

希望这是有道理的——它是 dp 数组中值的索引，就在当前正在计算的括号序列之前

### 例子解释

如果你有 `()()`，当你检查字符串中的最后一个字符时，你的 dp 值将是 `[0][2][0][]`，并且首先因为你有一个 `)`，你会 添加 2，但您想添加索引 1 中的值（`i - dp[i]`，或 3 - 2，给您索引 1），因为它代表您要添加到总计数的相邻有效序列的计数
索引 1 包含 2，因此您将 2 添加到当前 2 并得到正确答案 4

其实就是把前面可能存在的连续满足长度的字符加进来。

这个算法超过 100%，但是个人感觉比较难以想到。

# 参考资料

https://leetcode.com/problems/valid-parentheses/

https://leetcode.com/problems/longest-valid-parentheses/description/

https://leetcode.com/problems/longest-valid-parentheses/solutions/14278/two-java-solutions-with-explanation-stack-dp-short-easy-to-understand/

* any list
{:toc}