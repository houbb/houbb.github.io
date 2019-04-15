---
layout: post
title: Python-08-generator 生成器 yeild
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, sh]
published: true
---

# 生成器

## 概念

Generator 是一个用于创建迭代器的简单而强大的工具。 

它们的写法类似标准的函数，但当它们要返回数据时会使用 yield 语句。 

每次对生成器调用 `next()` 时，它会从上次离开位置恢复执行（它会记住上次执行语句时的所有数据值）。 

## 例子

显示如何非常容易地创建生成器的示例如下:

- yield_test.py

```py
def print_yeild(nums):
    for i in nums:
        yield "1"
        
for num in print_yeild(range(5)):
    print(num)
```

- 测试结果

```
> python .\yield_test.py
1
1
1
1
1
```

ps: 其实很简单，只是在我 for each 的时候，调用了 yeild 返回的值。

# 生成器表达式

## 概念

某些简单的生成器可以写成简洁的表达式代码，所用语法类似列表推导式，将外层为圆括号而非方括号。 

这种表达式被设计用于生成器将立即被外层函数所使用的情况。 

生成器表达式相比完整的生成器更紧凑但较不灵活，相比等效的列表推导式则更为节省内存。

## 例子

```py
>>> sum(i*i for i in range(10))                 # sum of squares
285

>>> xvec = [10, 20, 30]
>>> yvec = [7, 5, 3]
>>> sum(x*y for x,y in zip(xvec, yvec))         # dot product
260

>>> from math import pi, sin
>>> sine_table = {x: sin(x*pi/180) for x in range(0, 91)}

>>> unique_words = set(word  for line in page  for word in line.split())

>>> valedictorian = max((student.gpa, student.name) for student in graduates)

>>> data = 'golf'
>>> list(data[i] for i in range(len(data)-1, -1, -1))
['f', 'l', 'o', 'g']
```

# 参考资料

[生成器](https://docs.python.org/zh-cn/3/tutorial/classes.html#generators)

[迭代器和生成器](http://www.runoob.com/python3/python3-iterator-generator.html)

* any list
{:toc}