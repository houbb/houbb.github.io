---
layout: post
title:  Python v3.12.3 学习-03-An Informal Introduction to Python Python简介
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---

**3. Python简介**

在以下示例中，输入和输出通过提示符（`>>>` 和 `...`）来区分：要重复示例，你必须在提示符出现时键入提示符后的所有内容；不以提示符开头的行是解释器的输出。

请注意，在示例中单独一行的次要提示符意味着你必须输入一个空行；这用于结束多行命令。

你可以通过点击示例框右上角的 `>>>` 来切换提示符和输出的显示。如果隐藏提示符和输出，那么你可以轻松地将输入行复制并粘贴到你的解释器中。

这本手册中的许多示例，即使是在交互提示符中输入的，也包括注释。Python中的注释以井号字符 `#` 开始，直到物理行的末尾。注释可以出现在行的开头或后面的空格或代码后，但不能出现在字符串文字中。字符串文字中的井号字符仅仅是一个井号字符。由于注释是为了澄清代码并且不被Python解释，所以在输入示例时可以省略它们。

一些示例：

```python
# 这是第一个注释
spam = 1  # 这是第二个注释
          # ...现在是第三个！
text = "# 这不是注释，因为它在引号内。"
```

**3.1. 使用Python作为计算器**

让我们尝试一些简单的Python命令。启动解释器并等待主提示符 `>>>`。（不应该需要很长时间。）

**3.1.1. 数字**

解释器可以作为一个简单的计算器：你可以在它上面键入一个表达式，它会写出值。表达式语法很简单：运算符 `+`、`-`、`*` 和 `/` 可以用于执行算术；括号 `()` 可以用于分组。例如：

```python
2 + 2
4
50 - 5*6
20
(50 - 5*6) / 4
5.0
8 / 5  # 除法总是返回浮点数
1.6
```

整数（例如2、4、20）的类型是 `int`，带有小数部分的（例如5.0、1.6）的类型是 `float`。我们将在教程后面了解更多关于数字类型的信息。

除法（`/`）总是返回一个浮点数。要执行地板除法并得到一个整数结果，你可以使用 `//` 运算符；要计算余数，你可以使用 `%`：

```python
17 / 3  # 经典的除法返回浮点数
5.666666666666667
17 // 3  # 地板除法舍弃小数部分
5
17 % 3  # % 运算符返回除法的余数
2
5 * 3 + 2  # 地板商 * 除数 + 余数
17
```

使用Python，你可以使用 `**` 运算符计算幂次：

```python
5 ** 2  # 5的平方
25
2 ** 7  # 2的7次方
128
```

等号（`=`）用于将值赋给变量。之后，在下一个交互提示符之前不会显示任何结果：

```python
width = 20
height = 5 * 9
width * height
900
```

如果一个变量没有“定义”（赋值），尝试使用它将会给你一个错误：

```python
n  # 尝试访问未定义的变量
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'n' is not defined
```

对于浮点数，操作符会将整数操作数转换为浮点数：

```python
4 * 3.75 - 1
14.0
```

在交互模式中，最后打印的表达式被赋给变量 `_`。这意味着当你使用Python作为台式计算器时，继续计算会更容易，例如：

```python
tax = 12.5 / 100
price = 100.50
price * tax
12.5625
price + _
113.0625
round(_, 2)
113.06
```

这个变量应该被用户视为只读。不要显式地给它赋值——你会创建一个独立的同名局部变量，掩盖其魔术行为的内置变量。

除了 `int` 和 `float`，Python还支持其他类型的数字，例如 `Decimal` 和 `Fraction`。Python还内置支持复数，并使用 `j` 或 `J` 后缀表示虚部（例如 `3+5j`）。

**3.1.2. 文本**

Python可以操作文本（表示为类型 `str`，所谓的“字符串”）以及数字。这包括字符“!”、单词“rabbit”、名字“Paris”、句子“Got your back.”，等等。“Yay! :)”。它们可以用单引号（`'...'`）或双引号（`"..."`）括起来，结果相同。

```python
'spam eggs'  # 单引号
'spam eggs'
"Paris rabbit got your back :)! Yay!"  # 双引号
'Paris rabbit got your back :)! Yay!'
'1975'  # 在引号内的数字和数字也是字符串
'1975'
```

要引用引号，我们需要“转义”它，通过在其前面加上 `\`。或者，我们可以使用另一种引号类型：

```python
'doesn\'t'  # 使用 \' 转义单引号...
"doesn't"
"doesn't"  # ...或使用双引号
"doesn't"
'"Yes," they said

.'
'"Yes," they said.'
"\"Yes,\" they said."
'"Yes," they said.'
'"Isn\'t," they said.'
'"Isn\'t," they said.'
```

在Python shell中，字符串定义和输出字符串可能看起来不同。`print()` 函数通过省略包围的引号并打印转义和特殊字符，产生更可读的输出：

```python
s = 'First line.\nSecond line.'  # \n 表示换行
s  # 不使用 print()，特殊字符包括在字符串中
'First line.\nSecond line.'
print(s)  # 使用 print()，特殊字符被解释，所以 \n 产生新行
First line.
Second line.
```

如果你不希望由 `\` 前缀的字符被解释为特殊字符，可以通过在第一个引号前添加 `r` 来使用原始字符串：

```python
print('C:\some\name')  # 这里 \n 表示换行！
C:\some
ame
print(r'C:\some\name')  # 注意引号前的 r
C:\some\name
```

原始字符串有一个微妙的方面：原始字符串可能不以奇数个 `\` 字符结束；查看FAQ条目以获取更多信息和解决方法。

字符串文字可以跨多行。一种方式是使用三引号：`"""..."""` 或 `'''...'''`。行的结束自动包括在字符串中，但可以通过在行末添加 `\` 来防止这一点。以下示例：

```python
print("""\
Usage: thingy [OPTIONS]
     -h                        Display this usage message
     -H hostname               Hostname to connect to
""")
```

产生以下输出（请注意，初始换行符不包括在内）：

```
Usage: thingy [OPTIONS]
     -h                        Display this usage message
     -H hostname               Hostname to connect to
```

字符串可以使用 `+` 运算符连接（粘合在一起），并使用 `*` 重复：

```python
# 3次 'un'，后跟 'ium'
3 * 'un' + 'ium'
'unununium'
```

两个或更多字符串文字（即用引号括起来的那些）紧挨在一起时会自动连接。

```python
'Py' 'thon'
'Python'
```

这个功能在你想要分隔长字符串时特别有用：

```python
text = ('Put several strings within parentheses '
        'to have them joined together.')
text
'Put several strings within parentheses to have them joined together.'
```

这只对两个字面量有效，而不是变量或表达式：

```python
prefix = 'Py'
prefix 'thon'  # 不能连接变量和字符串字面量
```

如果你想连接变量或变量和字面量，使用 `+`：

```python
prefix + 'thon'
'Python'
```

字符串可以被索引（订阅），第一个字符的索引为0。没有单独的字符类型；一个字符只是大小为一的字符串：

```python
word = 'Python'
word[0]  # 在位置0的字符
'P'
word[5]  # 在位置5的字符
'n'
```

索引也可以是负数，从右边开始计数：

```python
word[-1]  # 最后一个字符
'n'
word[-2]  # 倒数第二个字符
'o'
word[-6]
'P'
```

请注意，由于 -0 与 0 相同，负索引从 -1 开始。

除了索引，还支持切片。索引用于获取单个字符，而切片允许你获取子字符串：

```python
word[0:2]  # 从位置0（包括）到2（不包括）的字符
'Py'
word[2:5]  # 从位置2（包括）到5（不包括）的字符
'tho'
```

切片索引有有用的默认值；省略的第一个索引默认为零，省略的第二个索引默认为字符串的大小：

```python
word[:2]   # 从开始到位置2（不包括）的字符
'Py'
word[4:]   # 从位置4（包括）到结束的字符
'on'
word[-2:]  # 从倒数第二个（包括）到结束的字符
'on'
```

请注意，始终包含开始，始终不包含结束。这确保 `s[:i] + s[i:]` 总是等于 `s`：

```python
word[:2] + word[2:]
'Python'
word[:4] + word[4:]
'Python'
```

记住切片的工作方式的一种方法是将索引视为指向字符之间的指针，第一个字符的左边缘编号为0。然后，字符串的最后一个字符的右边缘的索引是 n，例如：

```
 +---+---+---+---+---+---+
 | P | y | t | h | o | n |
 +---+---+---+---+---+---+
 0   1   2   3   4   5   6
-6  -5  -4  -3  -2  -1
```

第一行数字给出了字符串中索引 0…6 的

位置；第二行给出了相应的负索引。从 i 到 j 的切片包括标记为 i 和 j 的边缘之间的所有字符。

对于非负索引，切片的长度是索引之差，如果两者都在边界内。例如，word[1:3] 的长度是 2。

尝试使用一个索引值太大的索引会导致错误：

```python
word[42]  # 这个单词只有6个字符
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
IndexError: string index out of range
```

然而，当用于切片时，超出范围的切片索引会被优雅地处理：

```python
word[4:42]
'on'
word[42:]
''
```

Python 字符串是不可变的 —— 它们不能改变。因此，将一个索引位置赋值给字符串会导致错误：

```python
word[0] = 'J'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'str' object does not support item assignment
```

如果你需要一个不同的字符串，你应该创建一个新的：

```python
'J' + word[1:]
'Jython'
word[:2] + 'py'
'Pypy'
```

内置函数 `len()` 返回字符串的长度：

```python
s = 'supercalifragilisticexpialidocious'
len(s)
34
```

另请参阅

- [Text Sequence Type — str](https://docs.python.org/3/library/stdtypes.html#textseq)
- [String Methods](https://docs.python.org/3/library/stdtypes.html#string-methods)
- [f-strings](https://docs.python.org/3/reference/lexical_analysis.html#f-strings)
- [Format String Syntax](https://docs.python.org/3/library/string.html#formatstrings)
- [printf-style String Formatting](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)

# 参考资料

https://docs.python.org/3.12/tutorial/introduction.html

* any list
{:toc}

