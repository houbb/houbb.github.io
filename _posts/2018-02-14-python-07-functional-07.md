---
layout: post
title: Python-07-Function 函数的定义和使用
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, sh]
published: true
---

# 定义函数

## 说明

关键字 `def` 引入一个函数 定义。

它必须后跟函数名称和带括号的形式参数列表。

构成函数体的语句从下一行开始，并且必须缩进。

函数体的第一个语句可以（可选的）是字符串文字；这个字符串文字是函数的文档字符串或 docstring 。（有关文档字符串的更多信息，请参阅 文档字符串 部分）有些工具使用文档字符串自动生成在线或印刷文档，或者让用户以交互式的形式浏览代码；在你编写的代码中包含文档字符串是一种很好的做法，所以要养成习惯。

函数的 执行 会引入一个用于函数局部变量的新符号表。更确切地说，函数中的所有变量赋值都将值存储在本地符号表中；而变量引用首先在本地符号表中查找，然后在封闭函数的本地符号表中查找，然后在全局符号表中查找，最后在内置符号表中查找。所以全局变量不能直接在函数中赋值（除非使用 global 命名），尽管可以引用它们。

在函数被调用时，实际参数（实参）会被引入被调用函数的本地符号表中；因此，实参是通过 按值调用 传递的（其中 值 始终是对象 引用 而不是对象的值）。

当一个函数调用另外一个函数时，将会为该调用创建一个新的本地符号表。

## 例子

- fib.py

```py
'''
desc: Fib 数列
author: binbin.hou
'''
# 定义函数
def fib(n):
	"""Get the fib series of number n."""
	a,b = 0,1
	result = []
	while(a < n):
		result.append(a)
		a, b = b, a+b
	return result
	
	
# 使用函数
print(fib(100))
```

- 测试日志

```
$ python fib.py
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
```

## 函数的重命名

函数定义会把函数名引入当前的符号表中。函数名称的值具有解释器将其识别为用户定义函数的类型。

这个值可以分配给另一个名称，该名称也可以作为一个函数使用。这用作一般的重命名机制:

```py
# 使用函数引用
newFib = fib
print(newFib(100))
```

# 函数定义的更多形式

## 指定函数的默认值

### 定义

最有用的形式是对一个或多个参数指定一个默认值。

这样创建的函数，可以用比定义时允许的更少的参数调用

### 例子

比如:

- default-param.py

```py
'''
desc: 默认的参数值
author: binbin.hou
'''
# 定义函数
def defaultParam(n, desc="这里是默认描述"):
	"""The function default param demo."""
	print("first: ", n, ", second：", desc)
	
	
# 使用默认参数
defaultParam(100)

# 指定第二个参数
defaultParam(100, "个人指定的描述");	
```

- 日志信息如下：

```
$	python default-param.py
first:  100 , second： 这里是默认描述
first:  100 , second： 个人指定的描述
```

### 重要警告

默认值只会执行一次。

这条规则在默认值为可变对象（列表、字典以及大多数类实例）时很重要。

比如，下面的函数会存储在后续调用中传递给它的参数:

```py
def f(a, L=[]):
    L.append(a)
    return L

print(f(1))
print(f(2))
print(f(3))
```

这将打印出

```
[1]
[1, 2]
[1, 2, 3]
```

如果你不想要在后续调用之间共享默认值，你可以这样写这个函数:

```py
def f(a, L=None):
    if L is None:
        L = []
    L.append(a)
    return L
```

### 总结

这种比起 java 就方便很多。

提供一个灵活的方法时，不需要一次次的写重载方法，使用者又可以非常方便的使用。

对于方法的定义者和使用者都有很大的好处。

## 关键字参数

### 说明

也可以使用形如 `kwarg=value` 的 关键字参数 来调用函数。

### 例子

- key-age.py

```py
'''
desc: 关键字参数
author: binbin.hou
'''
# 定义函数
def keyParam(n, firstName="第一名称", secondName="第二名称"):
	"""The key param demo."""
	print("num: ", n, "first: ", firstName, ", second：", secondName)
	
	
# 使用默认参数
keyParam(100)

# 按照名称指定方法
keyParam(100, secondName="hello", firstName="python")

# 关键字参数必须在位置参数后面。否则报错：SyntaxError: positional argument follows keyword argument
# keyParam(secondName="hello", firstName="python", 100);	
```

日志信息

```
$ python key-arg.py
num:  100 first:  第一名称 , second： 第二名称
num:  100 first:  python , second： hello
```

### 总结

对于较长的方法列表，java 等语言通常需要记住方法参数的顺序。

有时候不小心写错了顺序，问题还是比较严重的。

python 的这种方式就提供了使用的灵活性。

## 任意的参数列表

### 定义

最不常用的选项是可以使用任意数量的参数调用函数。这些参数会被包含在一个元组里（参见 元组和序列 ）。

在可变数量的参数之前，可能会出现零个或多个普通参数。

使用场景：比较一系列数字的最大值/最小值，判断多个输入中是否有空值，将多个输入连接起来。

一般来说，这些 可变参数 将在形式参数列表的末尾，因为它们收集传递给函数的所有剩余输入参数。

出现在 `*args` 参数之后的任何形式参数都是 ‘仅关键字参数’，也就是说它们只能作为关键字参数而不能是位置参数。

### 例子

- var-arg.py

```py
'''
desc: 可变参数
author: binbin.hou
'''
# 定义函数
def varParam(*strs, sep=","):
	"""The var param demo."""
	result = sep.join(strs)
	print(result)
	
	
# 使用默认参数
varParam("hello", "python")

# 按照名称指定方法
varParam("hello", "python", sep="-")	
```

- 测试结果

```
$ python var-arg.py
hello,python
hello-python
```

### 总结

java 中也有变长列表，但是必须放在最后。

但是因为 python 允许指定关键字参数，就可以将关键字参数和可变参数区分开，所以可以放在后面。


# 文档字符串

以下是有关文档字符串的内容和格式的一些约定。

第一行应该是对象目的的简要概述。为简洁起见，它不应显式声明对象的名称或类型，因为这些可通过其他方式获得（除非名称恰好是描述函数操作的动词）。这一行应以大写字母开头，以句点结尾。

如果文档字符串中有更多行，则第二行应为空白，从而在视觉上将摘要与其余描述分开。后面几行应该是一个或多个段落，描述对象的调用约定，它的副作用等。

Python解析器不会从Python中删除多行字符串文字的缩进，因此处理文档的工具必须在需要时删除缩进。这是使用以下约定完成的。

文档字符串第一行 之后 的第一个非空行确定整个文档字符串的缩进量。

（我们不能使用第一行，因为它通常与字符串的开头引号相邻，因此它的缩进在字符串文字中不明显。）然后从字符串的所有行的开头剥离与该缩进 "等效" 的空格。 

缩进的行不应该出现，但是如果它们出现，则应该剥离它们的所有前导空格。应在扩展标签后测试空白的等效性（通常为8个空格）。

## 例子

```py
>>> def my_function():
...     """Do nothing, but document it.
...
...     No, really, it doesn't do anything.
...     """
...     pass
...
>>> print(my_function.__doc__)
Do nothing, but document it.

    No, really, it doesn't do anything.
```

# 函数标注

函数标注是关于用户自定义函数中使用的类型的完全可选元数据信息。

函数标注 以字典的形式存放在函数的 `__annotations__` 属性中，并且不会影响函数的任何其他部分。 

形参标注的定义方式是在形参名称后加上冒号，后面跟一个表达式，该表达式会被求值为标注的值。 

返回值标注的定义方式是加上一个组合符号 `->`，后面跟一个表达式，该标注位于形参列表和表示 def 语句结束的冒号之间。 

## 例子

下面的示例有一个位置参数，一个关键字参数以及返回值带有相应标注:

```py
>>> def f(ham: str, eggs: str = 'eggs') -> str:
...     print("Annotations:", f.__annotations__)
...     print("Arguments:", ham, eggs)
...     return ham + ' and ' + eggs
...
>>> f('spam')
Annotations: {'ham': <class 'str'>, 'return': <class 'str'>, 'eggs': <class 'str'>}
Arguments: spam eggs
'spam and eggs'
```

## 个人理解

类似于 java 中的注解吧，提供一些对象的元信息。

# 个人收获

Python 作为一款非常受欢迎的语言，在对设计者和使用者的友好程度上是非常值得肯定的。

至少是优于  java/C/C++/C# 的。

提供编写和阅读的便利性，正式高级语言的很大的一个意义。

# 参考资料

https://docs.python.org/zh-cn/3/tutorial/controlflow.html

* any list
{:toc}