---
layout: post
title:  Python v3.12.3 学习-10-标准 lib
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---


### 10. 标准库简要概览

#### 10.1. 操作系统接口

`os` 模块提供了与操作系统交互的数十个函数：

```python
import os
os.getcwd()      # 返回当前工作目录
'C:\\Python312'
os.chdir('/server/accesslogs')   # 更改当前工作目录
os.system('mkdir today')   # 在系统shell中运行 mkdir 命令
0
```

确保使用 `import os` 的方式，而不是 `from os import *`。

这样做可以避免 `os.open()` 掩盖了内置的 `open()` 函数，它们的功能有很大的不同。

内置的 `dir()` 和 `help()` 函数对于与 `os` 这样的大型模块交互时是有用的交互式工具：

```python
import os
dir(os)   # 返回所有模块函数的列表
help(os)  # 返回从模块的文档字符串创建的详细手册页面
```

对于日常文件和目录管理任务，`shutil` 模块提供了一个更高级的接口，使用起来更容易：

```python
import shutil
shutil.copyfile('data.db', 'archive.db')
'archive.db'
shutil.move('/build/executables', 'installdir')
'installdir'
```

#### 10.2. 文件通配符

`glob` 模块提供了一个函数，用于从目录通配符搜索中制作文件列表：

```python
import glob
glob.glob('*.py')
['primes.py', 'random.py', 'quote.py']
```

#### 10.3. 命令行参数

常见的实用脚本通常需要处理命令行参数。这些参数存储在 `sys` 模块的 `argv` 属性中，作为一个列表。例如，考虑以下 `demo.py` 文件：

```python
# File demo.py
import sys
print(sys.argv)
```

在命令行运行 `python demo.py one two three` 后，输出为：

```
['demo.py', 'one', 'two', 'three']
```

`argparse` 模块提供了一个更复杂的机制来处理命令行参数。以下脚本提取一个或多个文件名以及要显示的可选行数：

```python
import argparse

parser = argparse.ArgumentParser(
    prog='top',
    description='Show top lines from each file')
parser.add_argument('filenames', nargs='+')
parser.add_argument('-l', '--lines', type=int, default=10)
args = parser.parse_args()
print(args)
```

在命令行使用 `python top.py --lines=5 alpha.txt beta.txt` 运行该脚本时，脚本会将 `args.lines` 设置为 5，将 `args.filenames` 设置为 `['alpha.txt', 'beta.txt']`。

### 10.4. 错误输出重定向和程序终止

`sys` 模块还有 `stdin`、`stdout` 和 `stderr` 这些属性。`stderr` 对于发出警告和错误消息很有用，即使 `stdout` 已经被重定向：

```python
import sys
sys.stderr.write('Warning, log file not found starting a new one\n')
```

要直接终止一个脚本，最直接的方法是使用 `sys.exit()`。

### 10.5. 字符串模式匹配

`re` 模块提供了用于高级字符串处理的正则表达式工具。对于复杂的匹配和操作，正则表达式提供了简洁、优化的解决方案：

```python
import re
re.findall(r'\bf[a-z]*', 'which foot or hand fell fastest')
re.sub(r'(\b[a-z]+) \1', r'\1', 'cat in the the hat')
```

当只需要简单的功能时，优先使用字符串方法，因为它们更容易阅读和调试：

```python
'tea for too'.replace('too', 'two')
```

### 10.6. 数学

`math` 模块提供了对浮点数数学的底层 C 库函数的访问：

```python
import math
math.cos(math.pi / 4)
math.log(1024, 2)
```

`random` 模块提供了进行随机选择的工具：

```python
import random
random.choice(['apple', 'pear', 'banana'])
random.sample(range(100), 10)
random.random()
random.randrange(6)
```

`statistics` 模块计算数值数据的基本统计属性（均值、中位数、方差等）：

```python
import statistics
data = [2.75, 1.75, 1.25, 0.25, 0.5, 1.25, 3.5]
statistics.mean(data)
statistics.median(data)
statistics.variance(data)
```

### 10.7. 互联网访问

有许多模块用于访问互联网和处理互联网协议。两个最简单的是 `urllib.request`（用于从 URL 检索数据）和 `smtplib`（用于发送邮件）：

```python
from urllib.request import urlopen
import smtplib
```

### 10.8. 日期和时间

`datetime` 模块提供了在简单和复杂方式中操作日期和时间的类。虽然支持日期和时间算术，但实现的重点是对输出格式化和操作的高效成员提取。该模块还支持时区感知对象。

```python
from datetime import date
now = date.today()
now.strftime("%m-%d-%y. %d %b %Y is a %A on the %d day of %B.")
```

### 10.9. 数据压缩

常见的数据归档和压缩格式直接由模块支持，包括：`zlib`、`gzip`、`bz2`、`lzma`、`zipfile` 和 `tarfile`。

```python
import zlib
s = b'witch which has which witches wrist watch'
t = zlib.compress(s)
zlib.decompress(t)
zlib.crc32(s)
```

这只是标准库的一部分，Python 的标准库还包含许多其他有用的模块和功能。

### 10.10. 性能测量

一些 Python 用户对比较不同方法解决同一问题的相对性能产生了浓厚的兴趣。Python 提供了一个测量工具，可以立即回答这些问题。

例如，使用元组打包和解包特性而不是传统的交换参数方法可能更吸引人。`timeit` 模块迅速展示了适度的性能优势：

```python
from timeit import Timer
Timer('t=a; a=b; b=t', 'a=1; b=2').timeit()
Timer('a,b = b,a', 'a=1; b=2').timeit()
```

与 `timeit` 的精细级别的细粒度相比，`profile` 和 `pstats` 模块提供了识别较大代码块中时间关键部分的工具。

### 10.11. 质量控制

开发高质量软件的一种方法是在开发过程中为每个函数编写测试，并在开发过程中频繁运行这些测试。

`doctest` 模块提供了一个工具，用于扫描模块并验证程序文档字符串中嵌入的测试。测试构造就像剪切并粘贴典型调用及其结果到文档字符串中一样简单。

```python
def average(values):
    """Computes the arithmetic mean of a list of numbers.

    >>> print(average([20, 30, 70]))
    40.0
    """
    return sum(values) / len(values)

import doctest
doctest.testmod()
```

`unittest` 模块不如 `doctest` 模块那么轻松，但它允许在一个单独的文件中维护一个更全面的测试集。

```python
import unittest

class TestStatisticalFunctions(unittest.TestCase):

    def test_average(self):
        self.assertEqual(average([20, 30, 70]), 40.0)
        self.assertEqual(round(average([1, 5, 7]), 1), 4.3)
        with self.assertRaises(ZeroDivisionError):
            average([])
        with self.assertRaises(TypeError):
            average(20, 30, 70)

unittest.main()
```

### 10.12. 电池包含在内

Python 有一个“电池包含在内”的哲学。这最好通过其更大的包的复杂和健壮的功能来看。例如：

- `xmlrpc.client` 和 `xmlrpc.server` 模块使实现远程过程调用几乎成为一个微不足道的任务。尽管模块的名字中有 XML，但不需要直接知道或处理 XML。
  
- `email` 包是一个管理电子邮件消息的库，包括 MIME 和其他基于 RFC 2822 的消息文档。与实际发送和接收消息的 `smtplib` 和 `poplib` 不同，`email` 包有一个完整的工具集，用于构建或解码复杂的消息结构（包括附件）和实现互联网编码和头协议。
  
- `json` 包提供了对解析这种流行数据交换格式的强大支持。`csv` 模块支持直接读写逗号分隔值格式的文件，这种格式通常由数据库和电子表格支持。`xml.etree.ElementTree`、`xml.dom` 和 `xml.sax` 包支持 XML 处理。这些模块和包共同大大简化了 Python 应用程序与其他工具之间的数据交换。
  
- `sqlite3` 模块是 SQLite 数据库库的包装器，提供了一个可以使用稍微非标准的 SQL 语法更新和访问的持久数据库。
  
- 国际化由一些模块支持，包括 `gettext`、`locale` 和 `codecs` 包。


# 参考资料

https://docs.python.org/3.12/tutorial/stdlib.html

* any list
{:toc}

