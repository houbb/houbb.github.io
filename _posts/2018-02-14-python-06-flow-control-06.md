---
layout: post
title: Python-06-流程控制
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, sh]
published: true
---

# if 

- if.py

```py
'''
func: if 测试
author: binbin.hou
'''
x = int(input("Enter an int: "))
if x <= 18:
	print("Young")
elif x < 50:
	print("Adult")
elif x < 100:
	print("Old")
else:
	print("Amazing...")
```

- 简介

可以有零个或多个 elif 部分，以及一个可选的 else 部分。 

关键字 'elif' 是 'else if' 的缩写，适合用于避免过多的缩进。 

一个 if ... elif ... elif ... 序列可以看作是其他语言中的 switch 或 case 语句的替代。

- 测试

```
python if.py
Enter an int: 25
Adult
```

## python 查看一个函数的方式

如果你对 input 方法不清楚，直接 python 互动模式下输入：

```
help(input)
```

就可以查看响应的函数信息

```
>>> help(input)
Help on built-in function input in module builtins:

input(prompt=None, /)
    Read a string from standard input.  The trailing newline is stripped.

    The prompt string, if given, is printed to standard output without a
    trailing newline before reading input.

    If the user hits EOF (*nix: Ctrl-D, Windows: Ctrl-Z+Return), raise EOFError.
    On *nix systems, readline is used if available.
```

# for 语句

Python 中的 for 语句与你在 C 或 Pascal 中可能用到的有所不同。 

Python 中的 for 语句并不总是对算术递增的数值进行迭代（如同 Pascal），或是给予用户定义迭代步骤和暂停条件的能力（如同 C），而是对任意序列进行迭代（例如列表或字符串），条目的迭代顺序与它们在序列中出现的顺序一致。 

- 测试案例

`for.py` 内容如下

```py
'''
func: for 测试
author: binbin.hou
'''
list = ["I", "love", "python"]
for s in list:
	print(s)
```

- 测试日志

```
$ python for.py
I
love
python
```

# range 

## 函数简介

range 用来生成一系列的数字。

## 函数的用法

```
>>> help(range)
Help on class range in module builtins:

class range(object)
 |  range(stop) -> range object
 |  range(start, stop[, step]) -> range object
 |
 |  Return an object that produces a sequence of integers from start (inclusive)
 |  to stop (exclusive) by step.  range(i, j) produces i, i+1, i+2, ..., j-1.
 |  start defaults to 0, and stop is omitted!  range(4) produces 0, 1, 2, 3.
 |  These are exactly the valid indices for a list of 4 elements.
 |  When step is given, it specifies the increment (or decrement).
```

有三种用法，我们来一个一个测试。

## 测试

- range.py

```py
'''
func: range 生成数字序列测试
author: binbin.hou
'''

# 最基本的用法
rangeNums = range(5)
## 1.1 使用 for 循环 
print("1.1 for range(stop): ")
for num in rangeNums:
	print(num)
## 1.2 使用 list 显示数字序列
print("1.2 list range(stop): ")
print(list(rangeNums))

# 指定开始结束区间
rangeStartEnd = range(5, 10)
print("2. list range(start, stop): ")
print(list(rangeStartEnd))

# 指定开始结束和步长
rangeStartEndStep = range(5, 16, 2)
print("3. list range(start, stop, step): ")
print(list(rangeStartEndStep))

# 集合 lens 进行使用
array = ["I", "Love", "Python"]
## 获取对应的长度序列
print("4. range with len: ")
for val in range(len(array)):
	print(val, array[val])
```

- 测试日志如下：

```
 python range.py
1.1 for range(stop):
0
1
2
3
4
1.2 list range(stop):
[0, 1, 2, 3, 4]
2. list range(start, stop):
[5, 6, 7, 8, 9]
3. list range(start, stop, step):
[5, 7, 9, 11, 13, 15]
4. range with len:
0 I
1 Love
2 Python
```

# break

## 测试

- break.py

```py
'''
func: break 测试
author: binbin.hou
'''
# 判断一个数是否为质数
for num in range(2, 10):
	for factor in range(2, num):
		if num % factor == 0:
			print(num, "=", factor, "*", num//factor)
			break
	# else 是属于 for 循环的。
	# 它会在循环遍历完列表 (使用 for) 或是在条件变为假 (使用 while) 的时候被执行，但是不会在循环被 break 语句终止时被执行。	
	else:
		print(num, " is a prime number!")
```

- 测试结果

```
$ python break.py
2  is a prime number!
3  is a prime number!
4 = 2 * 2
5  is a prime number!
6 = 2 * 3
7  is a prime number!
8 = 2 * 4
9 = 3 * 3
```

## 个人理解

这里的 else 是独有的，其他 c/java 这类的语言是没有的。

# continue

## 简介

continue 语句也是借鉴自 C 语言，表示继续循环中的下一次迭代。

## 测试

- continue.py

```py
'''
func: continue 测试
author: binbin.hou
'''
for num in range(2, 10):
	if num % 2 == 0:
		print(num, "is a even number")
		# 跳过当前循环，不再执行后面的语句。
		continue
	# 用来判断有没有执行此处的代码	
	print(num, " now is checked!")
```

- 测试结果

```
$ python continue.py
2 is a even number
3  now is checked!
4 is a even number
5  now is checked!
6 is a even number
7  now is checked!
8 is a even number
9  now is checked!
```

和明显发现，被判断为偶数的数字，都没有执行对应的打印语句。

## 总结

实际开发中，通常是用来跳过一些值的处理。比如列表中的空字符串等等。

# pass 语句

## 简介

pass 语句什么也不做。

当语法上需要一个语句，但程序需要什么动作也不做时，可以使用它。

## 测试

```
>>> while True:
...     pass  # Busy-wait for keyboard interrupt (Ctrl+C)
...
```

- 这通常用于创建最小的类:

```py
>>> class MyEmptyClass:
...     pass
...
```

- 更抽象的思考

pass 的另一个可以使用的场合是在你编写新的代码时作为一个函数或条件子句体的占位符，允许你保持在更抽象的层次上进行思考。 

pass 会被静默地忽略:

```py
>>> def initlog(*args):
...     pass   # Remember to implement this!
...
```

## 总结

在 c/java 中是没有这个关键字的。

java 中如果你不想写，就直接空着不写，或者直接写一个 `;` 表示空语句即可。

这种方式引入了一个关键词，带来的好处的是表示的意义比较明确。

适合一些思路还没明确，预留下来准备以后写的类。

# 参考资料

https://docs.python.org/zh-cn/3/tutorial/controlflow.html

* any list
{:toc}