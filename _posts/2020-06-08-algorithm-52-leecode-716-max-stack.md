---
layout: post
title: leetcode 716 最大栈
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, hash, bit, sort, sh]
published: true
---

# 题目


设计一个最大栈数据结构，既支持栈操作，又支持查找栈中最大元素。

实现 MaxStack 类：

MaxStack() 初始化栈对象
void push(int x) 将元素 x 压入栈中。
int pop() 移除栈顶元素并返回这个元素。
int top() 返回栈顶元素，无需移除。
int peekMax() 检索并返回栈中最大元素，无需移除。
int popMax() 检索并返回栈中最大元素，并将其移除。如果有多个最大元素，只要移除 最靠近栈顶 的那个。
示例：

输入
["MaxStack", "push", "push", "push", "top", "popMax", "top", "peekMax", "pop", "top"]
[[], [5], [1], [5], [], [], [], [], [], []]

输出
[null, null, null, null, 5, 5, 1, 5, 1, 5]

解释
MaxStack stk = new MaxStack();
stk.push(5);   // [5] - 5 既是栈顶元素，也是最大元素
stk.push(1);   // [5, 1] - 栈顶元素是 1，最大元素是 5
stk.push(5);   // [5, 1, 5] - 5 既是栈顶元素，也是最大元素
stk.top();     // 返回 5，[5, 1, 5] - 栈没有改变
stk.popMax();  // 返回 5，[5, 1] - 栈发生改变，栈顶元素不再是最大元素
stk.top();     // 返回 1，[5, 1] - 栈没有改变
stk.peekMax(); // 返回 5，[5, 1] - 栈没有改变
stk.pop();     // 返回 1，[5] - 此操作后，5 既是栈顶元素，也是最大元素
stk.top();     // 返回 5，[5] - 栈没有改变
提示：

-10^7 <= x <= 10^7
最多调用 10^4 次 push、pop、top、peekMax 和 popMax
调用 pop、top、peekMax 或 popMax 时，栈中 至少存在一个元素
进阶： 

试着设计解决方案：调用 top 方法的时间复杂度为 O(1) ，调用其他方法的时间复杂度为 O(logn) 。 


# v1-最简单的思路

## 直接一个 list + 一个内部变量


# v2-双栈

## 思路

解题思路
  使用一个主栈(stack)+辅助栈(assistStack)，assistStack 的栈顶永远是最大值。

  1、push：

  1.1 对于 stack 来说，直接push即可：stack.push(x);

  1.2 对于 assistStack 来说，要进行判断，它 push 待插入的 x 和它栈顶两者最大的那个；

  2、pop：两个栈都 pop，返回 stak 的 pop 值；

  3、top：直接返回 stack 的 top 即可；

  4、peekMax：assistStack 的栈顶保存的就是 stack 的最大值，于是：return assistStack.peek();

  5、popMax：定义一个临时栈 tmpStack，判断 stack 的栈顶此时是不是最大值：

  如果 stack.peak() != assistStack.peak()，说明不是最大值，把 stack 栈顶元素弹出并装入 tmpStack 中；

  5.2 如果 stack.peak() == assistStack.peak()，说明是最大值，返回，并把 tmpStack 元素装回 stack 中。

## 解法

```java
class MaxStack {

    /** initialize your data structure here. */
    private final Stack<Integer> stack;
    private final Stack<Integer> assistStack;

    public MaxStack() {
        stack = new Stack<>();
        assistStack = new Stack<>();
    }

    public void push(int x) {
        stack.push(x);
        if (assistStack.isEmpty()) {
            assistStack.push(x);
        } else {
            if (assistStack.peek() < x) {
                assistStack.push(x);
            } else {
                assistStack.push(assistStack.peek());
            }
        }
    }
    public int pop() {
        assistStack.pop();
        return stack.pop();
    }
    public int top() {
        return stack.peek();
    }
    public int peekMax() {
        return assistStack.peek();
    }
    public int popMax() {
        Stack<Integer> tmpStack = new Stack<>();
        while (!stack.peek().equals(assistStack.peek())) {
            tmpStack.push(this.pop());
        }
        int max = this.pop();
        while (!tmpStack.isEmpty()) {
            this.push(tmpStack.pop());
        }
        return max;
    }
}

/**
 * Your MaxStack object will be instantiated and called as such:
 * MaxStack obj = new MaxStack();
 * obj.push(x);
 * int param_2 = obj.pop();
 * int param_3 = obj.top();
 * int param_4 = obj.peekMax();
 * int param_5 = obj.popMax();
 */
```






# 参考资料

https://leetcode.cn/problems/contains-duplicate-iii/description/

* any list
{:toc}