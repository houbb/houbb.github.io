---
layout: post
title:  Python v3.12.3 学习-07-io Input and Output
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---


### 7. 输入和输出（Input and Output）

程序的输出可以以几种方式呈现；数据可以以人类可读的形式打印，或写入文件以供将来使用。本章将讨论一些可能性。

#### 7.1. 更精美的输出格式（Fancier Output Formatting）

到目前为止，我们遇到了两种编写值的方式：表达式语句和 print() 函数。（第三种方式是使用文件对象的 write() 方法；标准输出文件可以通过 sys.stdout 引用。有关此信息，请参见库参考。）

通常，你会希望对输出的格式有更多的控制，而不仅仅是打印以空格分隔的值。有几种格式化输出的方式。

要使用格式化字符串字面值，在开放引号或三重引号之前用 f 或 F 开始一个字符串。在这个字符串内，你可以在 { 和 } 字符之间写一个 Python 表达式，该表达式可以引用变量或文字值。

```python
year = 2016
event = 'Referendum'
f'Results of the {year} {event}'
# 输出 'Results of the 2016 Referendum'
```

字符串的 str.format() 方法需要更多的手动工作。你仍然会使用 { 和 } 标记要替换变量的位置，并可以提供详细的格式指令，但你还需要提供要格式化的信息。

```python
yes_votes = 42_572_654
no_votes = 43_132_495
percentage = yes_votes / (yes_votes + no_votes)
'{:-9} YES votes  {:2.2%}'.format(yes_votes, percentage)
# 输出 ' 42572654 YES votes  49.67%'
```

最后，你可以通过使用字符串切片和连接操作自己处理所有字符串处理，以创建你可以想象的任何布局。字符串类型有一些方法，用于为给定的列宽填充字符串执行有用的操作。

当你不需要花哨的输出，只是想快速显示一些变量以进行调试时，你可以使用 repr() 或 str() 函数将任何值转换为字符串。

str() 函数旨在返回相当适合人类阅读的值的表示形式，而 repr() 函数旨在生成可以被解释器读取的表示形式（如果没有等效的语法，则会强制产生 SyntaxError）。对于没有特定表示形式供人类消费的对象，str() 将返回与 repr() 相同的值。许多值，如数字或结构（如列表和字典），在使用任一函数时都具有相同的表示形式。特别是字符串，它们有两种不同的表示形式。

一些示例：

```python
s = 'Hello, world.'
str(s)          # 输出 'Hello, world.'
repr(s)         # 输出 "'Hello, world.'"
str(1/7)        # 输出 '0.14285714285714285'
x = 10 * 3.25
y = 200 * 200
s = 'The value of x is ' + repr(x) + ', and y is ' + repr(y) + '...'
print(s)        # 输出 'The value of x is 32.5, and y is 40000...'
# 字符串的 repr() 添加了字符串引号和反斜杠：
hello = 'hello, world\n'
hellos = repr(hello)
print(hellos)   # 输出 'hello, world\n'
# repr() 的参数可以是任何 Python 对象：
repr((x, y, ('spam', 'eggs')))  # 输出 "(32.5, 40000, ('spam', 'eggs'))"
```

字符串模块包含一个 Template 类，它提供了另一种将值替换为字符串的方式，使用占位符如 $x 并将它们替换为字典中的值，但提供的格式控制较少。

### 7.1.1. 格式化字符串字面值（Formatted String Literals）

格式化字符串字面值（简称为 f-strings）允许你在字符串内包含 Python 表达式的值，方法是在字符串前加上 f 或 F，并使用 {expression} 写表达式。

可选的格式说明符可以跟随表达式。这允许更大的控制如何格式化值。下面的示例将 π 四舍五入到小数点后三位：

```python
import math
print(f'The value of pi is approximately {math.pi:.3f}.')
# 输出 The value of pi is approximately 3.142.
```

在 ':' 后传递一个整数将导致该字段至少有这么多个字符宽。这对于使列对齐非常有用。

```python
table = {'Sjoerd': 4127, 'Jack': 4098, 'Dcab': 7678}
for name, phone in table.items():
    print(f'{name:10} ==> {phone:10d}')
```

其他修改符可用于在格式化之前转换值。'!a' 应用 ascii()，'!s' 应用 str()，'!r' 应用 repr()：

```python
animals = 'eels'
print(f'My hovercraft is full of {animals}.')
print(f'My hovercraft is full of {animals!r}.')
```

'= ' 格式说明符可用于扩展表达式到表达式文本、等号，然后是评估后的表达式的表示：

```python
bugs = 'roaches'
count = 13
area = 'living room'
print(f'Debugging {bugs=} {count=} {area=}')
```

#### 7.1.2. 字符串 format() 方法

str.format() 方法的基本用法如下：

```python
print('We are the {} who say "{}!"'.format('knights', 'Ni'))
```

括号和其中的字符（称为格式字段）将被传递给 str.format() 方法的对象替换。括号中的数字可以用来引用传递给 str.format() 方法的对象的位置。

```python
print('{0} and {1}'.format('spam', 'eggs'))
print('{1} and {0}'.format('spam', 'eggs'))
```

如果在 str.format() 方法中使用关键字参数，它们的值将通过使用参数的名称来引用。

```python
print('This {food} is {adjective}.'.format(
      food='spam', adjective='absolutely horrible'))
```

位置参数和关键字参数可以任意组合：

```python
print('The story of {0}, {1}, and {other}.'.format('Bill', 'Manfred', other='Georg'))
```

可以通过传递字典并使用方括号 '[]' 访问键来通过名称引用要格式化的变量。

```python
table = {'Sjoerd': 4127, 'Jack': 4098, 'Dcab': 8637678}
print('Jack: {0[Jack]:d}; Sjoerd: {0[Sjoerd]:d}; Dcab: {0[Dcab]:d}'.format(table))
```

这也可以通过使用 ** 表示法将表字典作为关键字参数传递来完成。

```python
table = {'Sjoerd': 4127, 'Jack': 4098, 'Dcab': 8637678}
print('Jack: {Jack:d}; Sjoerd: {Sjoerd:d}; Dcab: {Dcab:d}'.format(**table))
```

这在与内置函数 vars() 结合使用时尤其有用，该函数返回一个包含所有局部变量的字典。

#### 7.1.3. 手动字符串格式化

下面是相同的平方和立方表，手动格式化：

```python
for x in range(1, 11):
    print(repr(x).rjust(2), repr(x*x).rjust(3), end=' ')
    print(repr(x*x*x).rjust(4))
```

str.rjust() 方法可以将字符串右对齐在给定宽度的字段中，通过在左侧用空格填充。还有类似的方法 str.ljust() 和 str.center()。这些方法不写任何东西，只返回一个新字符串。如果输入字符串太长，它们不会截断它，而是返回它不变；这会破坏你的列布局，但通常比另一种选择更好，即对

值进行错误描述。如果你真的想要截断，你可以随时添加一个切片操作，如 x.ljust(n)[:n]。

还有另一种方法 str.zfill()，它在左侧用零填充数值字符串。它理解正负号：

```python
'12'.zfill(5)
'-3.14'.zfill(7)
'3.14159265359'.zfill(5)
```

#### 7.1.4. 旧的字符串格式化

% 运算符（取模）也可以用于字符串格式化。

给定 'string' % values，字符串中的 % 实例将被值的零个或多个元素替换。这个操作通常被称为字符串插值。例如：

```python
import math
print('The value of pi is approximately %5.3f.' % math.pi)
```

当然，下面是您提供内容的中文翻译：

### 7.2. 读取和写入文件

`open()` 函数返回一个文件对象，最常用的方式是使用两个位置参数和一个关键字参数：`open(filename, mode, encoding=None)`。

```python
f = open('workfile', 'w', encoding="utf-8")
```

- 第一个参数是包含文件名的字符串。
- 第二个参数是另一个字符串，描述文件的使用方式。模式可以是 'r'（只读），'w'（只写，已存在的文件会被删除），'a'（追加，写入的数据会自动添加到文件末尾），'r+'（读写）。
- 默认情况下，文件以文本模式打开，这意味着您可以读取和写入字符串，这些字符串会以特定编码进行编码。如果未指定编码，则默认取决于平台（见 `open()`）。推荐使用 `encoding="utf-8"`，除非您知道需要使用其他编码。在模式字符串后添加 'b' 会以二进制模式打开文件，这种模式下数据以字节对象形式读取和写入。在二进制模式下无法指定编码。

在文本模式下，读取时默认会将特定于平台的换行符（Unix 上为 `\n`，Windows 上为 `\r\n`）转换为 `\n`。在写入时，默认会将 `\n` 转换回特定于平台的换行符。这种在文件数据上的幕后修改对于文本文件是可以的，但会损坏像 JPEG 或 EXE 这样的二进制数据。读写此类文件时务必使用二进制模式。

使用 `with` 关键字处理文件对象是个好习惯。这样做的好处是，即使在某个点上引发异常，文件也会在其代码块完成后被正确关闭。使用 `with` 也比编写等效的 try-finally 块更简短：

```python
with open('workfile', encoding="utf-8") as f:
    read_data = f.read()
```

如果您不使用 `with` 关键字，那么应调用 `f.close()` 来关闭文件并立即释放任何由其使用的系统资源。

**警告**：在不使用 `with` 关键字或不调用 `f.close()` 的情况下调用 `f.write()` 可能会导致 `f.write()` 的参数不完全写入磁盘，即使程序成功退出。

关闭文件对象后，尝试使用该文件对象将自动失败。

```python
f.close()
f.read()  # 这会导致错误
```

### 7.2.1. 文件对象的方法

本节的其余示例将假设已创建了一个名为 `f` 的文件对象。

- `f.read(size)`：读取一定数量的数据并将其作为字符串（在文本模式下）或字节对象（在二进制模式下）返回。`size` 是一个可选的数值参数。当省略或为负数时，将读取并返回文件的整个内容；如果到达文件的末尾，`f.read()` 将返回一个空字符串 (`''`)。
  
- `f.readline()`：从文件中读取一行；在字符串的末尾留下一个换行符 (`\n`)，仅在文件的最后一行不以换行符结束时省略它。

- `f.write(string)`：将字符串的内容写入文件，并返回写入的字符数。

- `f.tell()`：返回文件对象在文件中的当前位置。在二进制模式下，它返回从文件开始算起的字节位置，在文本模式下返回一个不透明的数字。

- `f.seek(offset, whence)`：更改文件对象的位置。位置是通过将 `offset` 添加到参考点计算得出的；参考点由 `whence` 参数选择。`whence` 值为 0 从文件开始计算，1 使用当前文件位置，2 使用文件末尾作为参考点。

### 7.2.2. 使用 JSON 保存结构化数据

可以轻松地将字符串写入文件并从文件中读取。数字需要更多的努力，因为 `read()` 方法只返回字符串，这些字符串必须传递给如 `int()` 这样的函数，该函数将字符串（如 '123'）转换为其数值值 123。当您想要保存更复杂的数据类型，如嵌套的列表和字典时，手动解析和序列化变得复杂。

与其让用户不断地编写和调试代码以将复杂的数据类型保存到文件中，Python 允许您使用流行的数据交换格式 JSON（JavaScript 对象表示法）。标准模块 `json` 可以接受 Python 数据层次结构，并将它们转换为字符串表示；这个过程称为序列化。从字符串表示重建数据称为反序列化。在序列化和反序列化之间，表示对象的字符串可能已存储在文件或数据中，或发送到某台远程机器。

如果您有一个对象 `x`，您可以使用一行简单的代码查看其 JSON 字符串表示：

```python
import json
x = [1, 'simple', 'list']
json.dumps(x)
```

`json.dump()` 函数将对象简单地序列化到文本文件中。因此，如果 `f` 是一个已打开用于写入的文本文件对象，我们可以这样做：

```python
json.dump(x, f)
```

要再次解码对象，如果 `f` 是一个已打开用于读取的二进制文件或文本文件对象：

```python
x = json.load(f)
```

**注意**：JSON 文件必须使用 UTF-8 编码。在打开 JSON 文件作为文本文件进行读取和写入时使用 `encoding="utf-8"`。


# 参考资料

https://docs.python.org/3.12/tutorial/inputoutput.html

* any list
{:toc}

