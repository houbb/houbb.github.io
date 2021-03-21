---
layout: post
title: Typescript-07-if 条件语句
date:  2021-3-09 16:52:15 +0800
categories: [Web]
tags: [web, js, sh]
published: true
---

# TypeScript 条件语句

条件语句用于基于不同的条件来执行不同的动作。

TypeScript 条件语句是通过一条或多条语句的执行结果（True 或 False）来决定执行的代码块。

## 条件语句

通常在写代码时，您总是需要为不同的决定来执行不同的动作。您可以在代码中使用条件语句来完成该任务。

在 TypeScript 中，我们可使用以下条件语句：

if 语句 - 只有当指定条件为 true 时，使用该语句来执行代码

if...else 语句 - 当条件为 true 时执行代码，当条件为 false 时执行其他代码

if...else if....else 语句- 使用该语句来选择多个代码块之一来执行

switch 语句 - 使用该语句来选择多个代码块之一来执行

# if 语句

TypeScript if 语句由一个布尔表达式后跟一个或多个语句组成。

语法

语法格式如下所示：

```js
if(boolean_expression){
    # 在布尔表达式 boolean_expression 为 true 执行
}
```

如果布尔表达式 boolean_expression为 true，则 if 语句内的代码块将被执行。如果布尔表达式为 false，则 if 语句结束后的第一组代码（闭括号后）将被执行。



# 参考资料

https://www.runoob.com/typescript/ts-operators.html

* any list
{:toc}