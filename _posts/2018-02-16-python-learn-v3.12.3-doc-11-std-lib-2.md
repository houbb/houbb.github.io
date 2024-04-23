---
layout: post
title:  Python v3.12.3 学习-10-标准 lib2
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---


### 11. Brief Tour of the Standard Library — Part II

这次的第二部分巡回介绍了更多支持专业编程需求的高级模块。这些模块在小型脚本中很少出现。

#### 11.1. 输出格式化

- **reprlib**: `reprlib` 模块提供了一个针对大型或深度嵌套容器定制的 `repr()` 版本，用于缩略显示：

  ```python
  import reprlib
  reprlib.repr(set('supercalifragilisticexpialidocious'))
  ```

- **pprint**: `pprint` 模块提供了对内置和用户定义对象进行打印的更高级控制，使其可被解释器读取。当结果超过一行时，“漂亮的打印机”会添加换行符和缩进，以更清晰地显示数据结构：

  ```python
  import pprint
  t = [[[['black', 'cyan'], 'white', ['green', 'red']], [['magenta', 'yellow'], 'blue']]]
  pprint.pprint(t, width=30)
  ```

- **textwrap**: `textwrap` 模块格式化文本段落以适应给定的屏幕宽度：

  ```python
  import textwrap
  doc = """The wrap() method is just like fill() except that it returns
  a list of strings instead of one big string with newlines to separate
  the wrapped lines."""
  print(textwrap.fill(doc, width=40))
  ```

- **locale**: `locale` 模块访问一个文化特定数据格式的数据库。`locale` 的 `format` 函数的 `grouping` 属性提供了直接的方法来使用组分隔符格式化数字：

  ```python
  import locale
  locale.setlocale(locale.LC_ALL, 'English_United States.1252')
  conv = locale.localeconv()  # 获取约定的映射
  x = 1234567.8
  locale.format_string("%d", x, grouping=True)
  locale.format_string("%s%.*f", (conv['currency_symbol'], conv['frac_digits'], x), grouping=True)
  ```

这些工具都是专门设计来帮助开发者更好地控制和格式化输出，无论是为了更好的可读性还是更复杂的数据格式化需求。

### 11.2. 模板

Python 的 `string` 模块包含一个多功能的 `Template` 类，其语法简单，适合最终用户进行编辑。这使得用户可以自定义他们的应用程序，而无需修改应用程序本身。

该格式使用 `$` 加上有效的 Python 标识符（字母数字字符和下划线）形成占位符名。使用大括号将占位符包围起来，允许它后面跟随更多的字母数字字符，中间没有空格。写 `$$` 会创建一个转义的 `$`：

```python
from string import Template
t = Template('${village}folk send $$10 to $cause.')
t.substitute(village='Nottingham', cause='the ditch fund')
```

`substitute()` 方法在字典或关键字参数中没有提供占位符时会引发 `KeyError`。对于邮件合并样式的应用程序，用户提供的数据可能是不完整的，这时 `safe_substitute()` 方法可能更合适 — 如果数据缺失，它将保持占位符不变：

```python
t = Template('Return the $item to $owner.')
d = dict(item='unladen swallow')
t.substitute(d)
t.safe_substitute(d)
```

`Template` 子类可以指定自定义分隔符。例如，照片浏览器的批量重命名实用程序可能选择使用百分号作为占位符，如当前日期、图像序列号或文件格式：

```python
import time, os.path
photofiles = ['img_1074.jpg', 'img_1076.jpg', 'img_1077.jpg']
class BatchRename(Template):
    delimiter = '%'

fmt = input('Enter rename style (%d-date %n-seqnum %f-format):  ')
t = BatchRename(fmt)
date = time.strftime('%d%b%y')
for i, filename in enumerate(photofiles):
    base, ext = os.path.splitext(filename)
    newname = t.substitute(d=date, n=i, f=ext)
    print('{0} --> {1}'.format(filename, newname))
```

模板的另一个应用是将程序逻辑与多个输出格式的细节分离。

这使得可以为 XML 文件、纯文本报告和 HTML 网页报告替换自定义模板。

### 11.3. 使用二进制数据记录布局

`struct` 模块提供了 `pack()` 和 `unpack()` 函数，用于处理可变长度的二进制记录格式。以下示例显示了如何在不使用 `zipfile` 模块的情况下循环遍历 ZIP 文件中的头信息。打包代码 "H" 和 "I" 分别表示两字节和四字节的无符号数。"<" 表示它们是标准大小，并且是小端字节顺序：

```python
import struct

with open('myfile.zip', 'rb') as f:
    data = f.read()

start = 0
for i in range(3):  # 显示前3个文件头
    start += 14
    fields = struct.unpack('<IIIHH', data[start:start+16])
    crc32, comp_size, uncomp_size, filenamesize, extra_size = fields

    start += 16
    filename = data[start:start+filenamesize]
    start += filenamesize
    extra = data[start:start+extra_size]
    print(filename, hex(crc32), comp_size, uncomp_size)

    start += extra_size + comp_size  # 跳到下一个头部
```

### 11.4. 多线程

线程是一种技术，用于解耦那些不依赖于顺序的任务。线程可以用于提高应用程序的响应速度，使其在其他任务在后台运行时接受用户输入。一个相关的用例是在另一个线程中与计算并行运行 I/O。

以下代码显示了如何使用高级 `threading` 模块在后台运行任务，同时主程序继续在前台运行：

```python
import threading, zipfile

class AsyncZip(threading.Thread):
    def __init__(self, infile, outfile):
        threading.Thread.__init__(self)
        self.infile = infile
        self.outfile = outfile

    def run(self):
        f = zipfile.ZipFile(self.outfile, 'w', zipfile.ZIP_DEFLATED)
        f.write(self.infile)
        f.close()
        print('Finished background zip of:', self.infile)

background = AsyncZip('mydata.txt', 'myarchive.zip')
background.start()
print('The main program continues to run in foreground.')

background.join()  # 等待后台任务完成
print('Main program waited until background was done.')
```

多线程应用程序的主要挑战是协调共享数据或其他资源的线程。为此，`threading` 模块提供了一些同步原语，包括锁、事件、条件变量和信号量。

虽然这些工具很强大，但微小的设计错误可能导致难以重现的问题。

因此，任务协调的首选方法是将所有对资源的访问集中在一个线程中，然后使用 `queue` 模块从其他线程向该线程提供请求。

使用 `Queue` 对象进行线程间通信和协调的应用程序更容易设计、更可读且更可靠。

### 11.5. 日志记录

`logging` 模块提供了一个功能齐全且灵活的日志记录系统。在其最简单的形式中，日志消息被发送到一个文件或 `sys.stderr`：

```python
import logging
logging.debug('Debugging information')
logging.info('Informational message')
logging.warning('Warning:config file %s not found', 'server.conf')
logging.error('Error occurred')
logging.critical('Critical error -- shutting down')
```

这将产生以下输出：

```
WARNING:root:Warning:config file server.conf not found
ERROR:root:Error occurred
CRITICAL:root:Critical error -- shutting down
```

默认情况下，信息和调试消息被抑制，输出被发送到标准错误。其他输出选项包括通过电子邮件、数据包、套接字或到 HTTP 服务器路由消息。新的过滤器可以基于消息优先级（DEBUG、INFO、WARNING、ERROR 和 CRITICAL）选择不同的路由。

日志系统可以直接从 Python 配置，也可以从用户可编辑的配置文件中加载，以实现自定义日志记录而不改变应用程序。

### 11.6. 弱引用

Python 提供了自动内存管理（对于大多数对象使用引用计数，以及垃圾回收来消除循环引用）。内存在最后一个引用被消除后不久被释放。

这种方法对于大多数应用程序都很有效，但偶尔需要跟踪对象只要它们被其他东西使用。

不幸的是，仅仅跟踪它们会创建一个引用，使它们永久存在。

`weakref` 模块提供了在不创建引用的情况下跟踪对象的工具。当对象不再需要时，它会自动从 `weakref` 表中删除，并为 `weakref` 对象触发回调。典型的应用包括缓存创建成本高昂的对象：

```python
import weakref, gc

class A:
    def __init__(self, value):
        self.value = value
    def __repr__(self):
        return str(self.value)

a = A(10)                   # 创建一个引用
d = weakref.WeakValueDictionary()
d['primary'] = a            # 不创建引用
d['primary']                # 如果对象仍然存在，则获取该对象
10
del a                       # 移除唯一的引用
gc.collect()                # 立即运行垃圾回收
0
d['primary']                # 条目已自动删除
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "C:/python312/lib/weakref.py", line 46, in __getitem__
    o = self.data[key]()
KeyError: 'primary'
```

在这个例子中，`weakref.WeakValueDictionary` 允许我们存储对对象 `a` 的弱引用。当对象 `a` 被删除并且没有其他强引用时，它会被垃圾回收，这也会导致它从 `WeakValueDictionary` 中被自动删除。


### 11.7. 与列表一起使用的工具

内置的列表类型可以满足许多数据结构的需求。然而，有时需要具有不同性能权衡的替代实现。

`array` 模块提供了一个 `array()` 对象，它类似于列表，但只存储同类数据，并且存储得更加紧凑。以下示例显示了一个作为两字节无符号二进制数（类型代码 "H"）存储的数字数组，而不是常规列表的 Python int 对象每个条目通常为 16 字节：

```python
from array import array
a = array('H', [4000, 10, 700, 22222])
sum(a)
26932
a[1:3]
array('H', [10, 700])
```

`collections` 模块提供了一个 `deque()` 对象，它类似于列表，但从左侧进行的附加和弹出更快，但中间查找较慢。这些对象非常适合实现队列和广度优先树搜索：

```python
from collections import deque
d = deque(["task1", "task2", "task3"])
d.append("task4")
print("Handling", d.popleft())
Handling task1
unsearched = deque([starting_node])
def breadth_first_search(unsearched):
    node = unsearched.popleft()
    for m in gen_moves(node):
        if is_goal(m):
            return m
        unsearched.append(m)
```

除了替代列表实现之外，该库还提供了其他工具，例如 `bisect` 模块，其中包含用于操作排序列表的函数：

```python
import bisect
scores = [(100, 'perl'), (200, 'tcl'), (400, 'lua'), (500, 'python')]
bisect.insort(scores, (300, 'ruby'))
scores
[(100, 'perl'), (200, 'tcl'), (300, 'ruby'), (400, 'lua'), (500, 'python')]
```

`heapq` 模块提供了基于常规列表实现堆的函数。最小值条目始终保持在位置零。这对于反复访问最小元素但不想运行完整列表排序的应用程序非常有用：

```python
from heapq import heapify, heappop, heappush
data = [1, 3, 5, 7, 9, 2, 4, 6, 8, 0]
heapify(data)                      # 重新排列列表为堆顺序
heappush(data, -5)                 # 添加一个新条目
[heappop(data) for i in range(3)]  # 获取三个最小条目
[-5, 0, 1]
```

这些工具提供了处理和操作列表的多种方法，使得 Python 在数据结构方面非常灵活和强大。


### 11.8. 十进制浮点算术

`decimal` 模块提供了一个 `Decimal` 数据类型，用于十进制浮点算术。与内置的二进制浮点 `float` 实现相比，该类特别适用于：

- 需要精确的十进制表示的财务应用和其他用途，
- 对精度的控制，
- 对满足法律或监管要求的舍入的控制，
- 跟踪有效的小数位数，或
- 用户期望结果与手工计算相匹配的应用。

例如，对70美分电话费用进行5%的税收计算在十进制浮点和二进制浮点中会给出不同的结果。如果结果四舍五入到最近的一分，这种差异就变得显著：

```python
from decimal import *
round(Decimal('0.70') * Decimal('1.05'), 2)
Decimal('0.74')
round(.70 * 1.05, 2)
0.73
```

`Decimal` 结果保留了一个尾随零，从两位有效数字的乘数中自动推断出四位有效数字。`Decimal` 可以复现手工进行的数学运算，并避免当二进制浮点无法准确表示十进制数量时可能出现的问题。

精确表示使 `Decimal` 类能够执行模运算和相等性测试，这些操作对二进制浮点来说是不适合的：

```python
Decimal('1.00') % Decimal('.10')
Decimal('0.00')
1.00 % 0.10
0.09999999999999995

sum([Decimal('0.1')]*10) == Decimal('1.0')
True
0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 + 0.1 == 1.0
False
```

`decimal` 模块提供了与所需精度一样多的算术：

```python
getcontext().prec = 36
Decimal(1) / Decimal(7)
Decimal('0.142857142857142857142857142857142857')
```

使用 `Decimal` 类，Python 在处理需要精确表示的十进制数值时变得更加可靠和精确。





# 参考资料

https://docs.python.org/3.12/tutorial/stdlib2.html

* any list
{:toc}

