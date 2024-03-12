---
layout: post
title: Programming language theory 编程语言理论-03-短路求值（Short-circuit evaluation; minimal evaluation; McCarthy evaluation; 又称最小化求值）
date:  2020-6-5 17:42:59 +0800
categories: [Theory]
tags: [programming-language-theory, sh]
published: true
---

# 短路求值

短路求值（Short-circuit evaluation; minimal evaluation; McCarthy evaluation; 又称最小化求值）

是一种逻辑运算符的求值策略。只有当第一个运算数的值无法确定逻辑运算的结果时，才对第二个运算数进行求值。

例如，当AND的第一个运算数的值为false时，其结果必定为false；当OR的第一个运算数为true时，最后结果必定为true，在这种情况下，就不需要知道第二个运算数的具体值。

在一些语言中（如Lisp），默认的逻辑运算符就是短路运算符，而在另一些语言中（如Java，Ada），短路和非短路的运算符都存在。

对于一些逻辑运算，如XOR，短路求值是不可能的 。

短路表达式x AND y，事实上等价于条件语句：if x then y else false。短路表达式x OR y，则等价于条件语句：if x then true else y。

# C语言和C++

C语言和C++语言标准强制规定了 `||` 和 && 短路求值语义以及求值顺序。

从而，下述这样的包含安全检查的代码是非常常见的：

```c
   char* pChar = 0;
   // some actions which may or may not set pChar to something
   if ((pChar != 0) && (*pChar != '\0')) {
      // do something useful
   }
```

C99语言标准的Section 6.5.13 Logical AND operator规定：

   (4). Unlike the bitwise binary & operator, the && operator guarantees left-to-right evaluation; there is a sequence point after the evaluation of the first operand. If the first operand compares equal to 0, the second operand is not evaluated.

   翻譯：於二元位與運算符&不同，&&運算符保證從左到右求值，第一操作數求值後有一個順序點。如果第一操作數比較等於0，則第二操作數不再求值。

类似地，section 6.5.14 Logical OR operator有类似规定。C++语言标准有同样规定。但如果重载了||和&&运算符，则仅是普通运算符。



考虑以下使用C语言写的例子：

```c
int a = 0;
if (a && myfunc(b)) {
    do_something();
}
```

在这个例子中，最小化计算使得myfunc(b)永远不会被调用。这是因为 a 等于false，而false AND q无论q是什么总是得到false。这个特性允许两个有用的编程结构。

首先，不论判别式中第一个子判别语句要耗费多昂贵的计算，总是会被执行，若此时求得的值为 false，则第二个子判别运算将不会执行，这可以节省来自第二个语句的昂贵计算。

再来，这个结构可由第一个子判别语句来避免第二个判别语句不会导致运行时错误。例如对以下使用C语言写的例子而言，最小化计算可以避免对空指针进行存取。

```c
void * p = NULL;
int ret;
/* ... */
if(p && ret = func(p) ){
    /* 或者另一種更清晰的寫法是if( (p != NULL) && (ret = func(p)) ) */
    /* ... */
}
/* ... */
```

当使用最小化计算时，很重要的一点是得知表示式取值的顺序。某些编程语言中确保有一致的取值顺序。例如：C语言、Java、Perl、Python和Ruby等。

它不过是下面语句的一种更加紧凑的表示形式罢了。

```c
if (cond_a) {
    if (expensive_or_dangerous_cond_b) {
        ...
    }
}
```

# 参考资料

https://zh.wikipedia.org/wiki/%E7%9F%AD%E8%B7%AF%E6%B1%82%E5%80%BC



* any list
{:toc}