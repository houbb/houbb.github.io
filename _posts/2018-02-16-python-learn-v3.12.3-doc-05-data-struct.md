---
layout: post
title:  Python v3.12.3 学习-05-数据结构
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---


### 5. 数据结构

这一章节详细描述了您已经学到的一些内容，并添加了一些新的内容。

#### 5.1. 列表进一步讲解

列表数据类型有更多的方法。以下是列表对象的所有方法：

```python
# list.append(x)
# 在列表末尾添加一个项目。等效于 a[len(a):] = [x]。

# list.extend(iterable)
# 通过添加可迭代对象的所有项目来扩展列表。等效于 a[len(a):] = iterable。

# list.insert(i, x)
# 在给定位置插入一个项目。第一个参数是要插入的元素之前的索引，所以 a.insert(0, x) 在列表前面插入，而 a.insert(len(a), x) 等效于 a.append(x)。

# list.remove(x)
# 删除第一个值等于 x 的项目。如果没有这样的项目，则引发 ValueError。

# list.pop([i])
# 删除列表中给定位置的项目，并返回它。如果未指定索引，a.pop() 删除并返回列表中的最后一个项目。如果列表为空或索引超出列表范围，则引发 IndexError。

# list.clear()
# 删除列表中的所有项目。等效于 del a[:]。

# list.index(x[, start[, end]])
# 返回列表中第一个值等于 x 的项目的零基索引。如果没有这样的项目，则引发 ValueError。
# 可选参数 start 和 end 被解释为切片符号中的内容，并用于限制搜索到列表的特定子序列。返回的索引是相对于完整序列的开始而不是 start 参数的。

# list.count(x)
# 返回 x 在列表中出现的次数。

# list.sort(*, key=None, reverse=False)
# 对列表中的项目进行就地排序（可以使用参数进行排序自定义，有关它们的说明，请参见 sorted()）。

# list.reverse()
# 就地反转列表的元素。

# list.copy()
# 返回列表的浅拷贝。等效于 a[:]。
```

以下是使用大多数列表方法的示例：

```python
fruits = ['orange', 'apple', 'pear', 'banana', 'kiwi', 'apple', 'banana']
fruits.count('apple')  # 输出 2
fruits.count('tangerine')  # 输出 0
fruits.index('banana')  # 输出 3
fruits.index('banana', 4)  # 从位置 4 开始查找下一个 banana，输出 6
fruits.reverse()
fruits  # 输出 ['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange']
fruits.append('grape')
fruits  # 输出 ['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange', 'grape']
fruits.sort()
fruits  # 输出 ['apple', 'apple', 'banana', 'banana', 'grape', 'kiwi', 'orange', 'pear']
fruits.pop()  # 输出 'pear'
```

您可能已经注意到，像 insert、remove 或 sort 这样只修改列表的方法没有打印出返回值 - 它们返回默认的 None。这是 Python 中所有可变数据结构的设计原则。

还有一件事，您可能注意到并非所有数据都可以排序或比较。例如，[None, 'hello', 10] 不能排序，因为整数不能与字符串比较，None 不能与其他类型比较。此外，还有一些类型没有定义的排序关系。例如，3+4j < 5+7j 不是有效的比较。

#### 5.1.1. 使用列表作为堆栈

列表方法使得使用列表作为堆栈非常容易，其中最后添加的元素是第一个检索的元素（“后进先出”）。要将项目添加到堆栈的顶部，请使用 append()。要从堆栈的顶部检索项目，请使用没有明确索引的 pop()。例如：

```python
stack = [3, 4, 5]
stack.append(6)
stack.append(7)
stack  # 输出 [3, 4, 5, 6, 7]
stack.pop()  # 输出 7
stack  # 输出 [3, 4, 5, 6]
stack.pop()  # 输出 6
stack.pop()  # 输出 5
stack  # 输出 [3, 4]
```

#### 5.1.2. 使用列表作为队列

也可以使用列表作为队列，其中第一个添加的元素是第一个检索的元素（“先进先出”）；然而，列表不适用于此目的。虽然从列表的末尾进行 appends 和 pops 很快，但从列表的开头进行插入或 pops 很慢（因为所有其他元素都必须移动一位）。

要实现队列，请使用 collections.deque，它设计用于从两端快速进行 appends 和 pops。例如：

```python
from collections import deque
queue = deque(["Eric", "John", "Michael"])
queue.append("Terry")  # Terry 到达
queue.append("Graham")  # Graham 到达
queue.popleft()  # 第一个到达的现在离开，输出 'Eric'
queue.popleft()  # 第二个到达的现在离开，输出 'John'
queue  # 输出 deque(['Michael', 'Terry', 'Graham'])
```

#### 5.1.3. 列表推导

列表推导提供了一种简洁的方法来创建列表。常见的应用是创建新的列表，其中每个元素都是应用于另一个序列或可迭代对象的一些操作的结果，或者创建满足某些条件的那些元素的子序列。

例如，假设我们想创建一个平方的列表，如下所示：

```python
squares = []
for x in range(10):
    squares.append(x**2)

squares  # 输出 [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

注意，这将创建（或覆盖）一个名为 x 的变量，该变量在循环完成后仍然存在。我们可以不产生任何

副作用地计算平方的列表：

```python
squares = list(map(lambda x: x**2, range(10)))
# 或者等效于：
squares = [x**2 for x in range(10)]
```

这更简洁、更可读。

列表推导由包含表达式的方括号和一个 for 子句组成，然后是零个或多个 for 或 if 子句。结果将是在其后跟随的 for 和 if 子句的上下文中评估表达式产生的新列表。例如，此 listcomp 结合了两个列表的元素，如果它们不相等：

```python
[(x, y) for x in [1,2,3] for y in [3,1,4] if x != y]
# 输出 [(1, 3), (1, 4), (2, 3), (2, 1), (2, 4), (3, 1), (3, 4)]
```

它等同于：

```python
combs = []
for x in [1,2,3]:
    for y in [3,1,4]:
        if x != y:
            combs.append((x, y))

combs  # 输出 [(1, 3), (1, 4), (2, 3), (2, 1), (2, 4), (3, 1), (3, 4)]
```

注意这两个片段中 for 和 if 语句的顺序相同。

如果表达式是一个元组（例如前面示例中的 (x, y)），则必须使用括号括起来。

#### 5.1.4. 嵌套列表推导

列表推导中的初始表达式可以是任意的表达式，包括另一个列表推导。

考虑以下实现为 3x4 矩阵的列表的示例：

```python
matrix = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
]
```

以下列表推导将转置行和列：

```python
[[row[i] for row in matrix] for i in range(4)]
# 输出 [[1, 5, 9], [2, 6, 10], [3, 7, 11], [4, 8, 12]]
```

正如我们在上一节中看到的，内部列表推导在其后跟随的 for 的上下文中进行评估，所以这个示例等同于：

```python
transposed = []
for i in range(4):
    transposed.append([row[i] for row in matrix])

transposed  # 输出 [[1, 5, 9], [2, 6, 10], [3, 7, 11], [4, 8, 12]]
```

这又等同于：

```python
transposed = []
for i in range(4):
    transposed_row = []
    for row in matrix:
        transposed_row.append(row[i])
    transposed.append(transposed_row)

transposed  # 输出 [[1, 5, 9], [2, 6, 10], [3, 7, 11], [4, 8, 12]]
```

在现实世界中，您应该优先选择内置函数而不是复杂的流程语句。zip() 函数对这个用例做得很好：

```python
list(zip(*matrix))
# 输出 [(1, 5, 9), (2, 6, 10), (3, 7, 11), (4, 8, 12)]
```

有关此行中的星号的详细信息，请参见 Unpacking Argument Lists。

### 5.2. del 语句

有一种方法可以根据其索引而不是其值从列表中删除项目：del 语句。这与返回值的 pop() 方法不同。del 语句还可以用于从列表中删除切片或清空整个列表（我们之前通过将空列表赋值给切片来做到这一点）。例如：

```python
a = [-1, 1, 66.25, 333, 333, 1234.5]
del a[0]
a  # 输出 [1, 66.25, 333, 333, 1234.5]

del a[2:4]
a  # 输出 [1, 66.25, 1234.5]

del a[:]
a  # 输出 []
```

del 也可以用于删除整个变量：

```python
del a
```

此后引用名称 a 将导致错误（至少在为其分配另一个值之前）。我们稍后会找到 del 的其他用途。

### 5.3. 元组和序列

我们看到列表和字符串具有许多共同的属性，例如索引和切片操作。它们是序列数据类型的两个示例（参见序列类型 — 列表、元组、range）。由于 Python 是一种不断发展的语言，可能会添加其他序列数据类型。还有另一种标准的序列数据类型：元组。

元组由逗号分隔的一系列值组成，例如：

```python
t = 12345, 54321, 'hello!'
t[0]  # 输出 12345
t  # 输出 (12345, 54321, 'hello!')
```

元组可以嵌套：

```python
u = t, (1, 2, 3, 4, 5)
u  # 输出 ((12345, 54321, 'hello!'), (1, 2, 3, 4, 5))
```

元组是不可变的：

```python
t[0] = 88888  # TypeError: 'tuple' object does not support item assignment
```

但它们可以包含可变对象：

```python
v = ([1, 2, 3], [3, 2, 1])
v  # 输出 ([1, 2, 3], [3, 2, 1])
```

如您所见，输出的元组总是用括号括起来，这样嵌套的元组才能被正确解释；它们可以带有或不带有周围的括号输入，尽管通常括号总是必要的（如果元组是较大表达式的一部分）。但是，不能为元组的各个项赋值，但是可以创建包含可变对象（如列表）的元组。

尽管元组可能看起来与列表相似，但它们通常用于不同的情境和目的。元组是不可变的，通常包含异构的元素序列，可以通过解包（稍后在本节中看到）或索引（甚至在命名元组的情况下通过属性）访问。列表是可变的，它们的元素通常是同构的，并通过迭代列表来访问。

一个特殊的问题是构造包含 0 或 1 个项的元组：语法有一些额外的怪癖来适应这些情况。空元组由一个空括号对构造；一个包含一个项的元组由一个值后跟一个逗号构造（仅将单个值括在括号中是不够的）。丑陋，但有效。例如：

```python
empty = ()
singleton = 'hello',    # <-- 注意末尾的逗号
len(empty)  # 输出 0
len(singleton)  # 输出 1
singleton  # 输出 ('hello',)
```

语句 t = 12345, 54321, 'hello!' 是元组打包的一个例子：值 12345, 54321 和 'hello!' 被打包在一个元组中。反向操作也是可能的：

```python
x, y, z = t
```

这称为适当的序列解包，适用于右侧的任何序列。序列解包要求左侧的等号有与序列中的元素一样多的变量。请注意，多重赋值实际上只是元组打包和序列解包的组合。

### 5.4. 集合（Sets）

Python 也包括了一个用于集合的数据类型。集合是一个无序的、没有重复元素的集合。基本用途包括成员资格测试和消除重复条目。集合对象还支持像并集、交集、差集和对称差集这样的数学操作。

大括号或 `set()` 函数可用于创建集合。注意：要创建一个空集合，你必须使用 `set()`，而不是 `{}`；后者创建一个空字典，这是我们在下一节讨论的数据结构。

以下是一个简单的演示：

```python
basket = {'apple', 'orange', 'apple', 'pear', 'orange', 'banana'}
print(basket)                      # 显示已删除重复项
{'orange', 'banana', 'pear', 'apple'}
'orange' in basket                 # 快速成员资格测试
True
'crabgrass' in basket
False
```

演示两个单词的唯一字母的集合操作：

```python
a = set('abracadabra')
b = set('alacazam')
a                                  # a 中的唯一字母
{'a', 'r', 'b', 'c', 'd'}
a - b                              # a 中但不在 b 中的字母
{'r', 'd', 'b'}
a | b                              # a 和 b 中的字母或两者都有的
{'a', 'c', 'r', 'd', 'b', 'm', 'z', 'l'}
a & b                              # a 和 b 中都有的字母
{'a', 'c'}
a ^ b                              # a 或 b 中的字母，但不是两者都有的
{'r', 'd', 'b', 'm', 'z', 'l'}
```

类似于列表推导式，集合推导式也是支持的：

```python
a = {x for x in 'abracadabra' if x not in 'abc'}
a
{'r', 'd'}
```

### 5.5. 字典（Dictionaries）

Python 内置了另一个有用的数据类型，叫做字典（参见 Mapping Types — dict）。在其他语言中，字典有时被称为“关联数组”或“关联内存”。与序列不同，序列是由一系列数字索引的，字典是由键索引的，这些键可以是任何不可变类型；字符串和数字总是可以作为键。如果元组只包含字符串、数字或元组，它们可以作为键使用；如果元组包含任何可变对象，直接或间接地，它就不能作为键使用。你不能使用列表作为键，因为列表可以使用索引赋值、切片赋值或像 `append()` 和 `extend()` 这样的方法在原地修改。

最好将字典视为键值对的集合，要求键是唯一的（在一个字典内）。一对大括号创建一个空字典：`{}`。在大括号内放置一个用逗号分隔的键值对列表，就可以添加初始的键值对到字典中；这也是字典在输出时的写法。

字典的主要操作是使用某个键存储一个值并提取给定键的值。还可以使用 `del` 删除一个键值对。如果你使用一个已经使用的键进行存储，与该键相关联的旧值将被忘记。使用不存在的键提取值是一个错误。

在字典上执行 `list(d)` 返回字典中使用的所有键的列表，按插入顺序排列（如果你想要它排序，只需使用 `sorted(d)`）。使用 `in` 关键字检查单个键是否在字典中。

这里有一个使用字典的小例子：

```python
tel = {'jack': 4098, 'sape': 4139}
tel['guido'] = 4127
tel
{'jack': 4098, 'sape': 4139, 'guido': 4127}
tel['jack']
4098
del tel['sape']
tel['irv'] = 4127
tel
{'jack': 4098, 'guido': 4127, 'irv': 4127}
list(tel)
['jack', 'guido', 'irv']
sorted(tel)
['guido', 'irv', 'jack']
'guid

o' in tel
True
'jack' not in tel
False
```

`dict()` 构造函数可以直接从键值对的序列构建字典：

```python
dict([('sape', 4139), ('guido', 4127), ('jack', 4098)])
{'sape': 4139, 'guido': 4127, 'jack': 4098}
```

此外，`dict` 推导式也可以用于从任意键和值表达式创建字典：

```python
{x: x**2 for x in (2, 4, 6)}
{2: 4, 4: 16, 6: 36}
```

当键是简单的字符串时，有时使用关键字参数指定对更容易：

```python
dict(sape=4139, guido=4127, jack=4098)
{'sape': 4139, 'guido': 4127, 'jack': 4098}
```

### 5.6. 循环技巧

当循环遍历字典时，可以同时获取键和对应的值，使用 `items()` 方法：

```python
knights = {'gallahad': 'the pure', 'robin': 'the brave'}
for k, v in knights.items():
    print(k, v)

gallahad the pure
robin the brave
```

当循环遍历序列时，可以同时获取位置索引和对应的值，使用 `enumerate()` 函数：

```python
for i, v in enumerate(['tic', 'tac', 'toe']):
    print(i, v)

0 tic
1 tac
2 toe
```

要同时遍历两个或更多序列，可以使用 `zip()` 函数将条目配对：

```python
questions = ['name', 'quest', 'favorite color']
answers = ['lancelot', 'the holy grail', 'blue']
for q, a in zip(questions, answers):
    print('What is your {0}?  It is {1}.'.format(q, a))

What is your name?  It is lancelot.
What is your quest?  It is the holy grail.
What is your favorite color?  It is blue.
```

要反向遍历一个序列，首先以正向方式指定序列，然后调用 `reversed()` 函数。

```python
for i in reversed(range(1, 10, 2)):
    print(i)

9
7
5
3
1
```

要按排序顺序遍历一个序列，使用 `sorted()` 函数，该函数返回一个新的排序列表，而不改变原始源。

```python
basket = ['apple', 'orange', 'apple', 'pear', 'orange', 'banana']
for i in sorted(basket):
    print(i)

apple
apple
banana
orange
orange
pear
```

在序列上使用 `set()` 可以消除重复元素。结合 `sorted()` 和 `set()` 在序列上的使用是一个用于按排序顺序遍历序列的短语法：

```python
basket = ['apple', 'orange', 'apple', 'pear', 'orange', 'banana']
for f in sorted(set(basket)):
    print(f)

apple
banana
orange
pear
```

有时在遍历列表时更改列表是很诱人的；但是，创建一个新列表通常更简单、更安全。

```python
import math
raw_data = [56.2, float('NaN'), 51.7, 55.3, 52.5, float('NaN'), 47.8]
filtered_data = []
for value in raw_data:
    if not math.isnan(value):
        filtered_data.append(value)

filtered_data
[56.2, 51.7, 55.3, 52.5, 47.8]
```

### 5.7. 更多关于条件的内容

在 `while` 和 `if` 语句中使用的条件可以包含任何运算符，不仅仅是比较。

`in` 和 `not in` 运算符是成员资格测试，用于确定值是否在（或不在）容器中。`is` 和 `is not` 运算符比较两个对象是否真的是同一个对象。所有比较运算符具有相同的优先级，这比所有数值运算符都要低。

比较可以链接。例如，`a < b == c` 测试 `a` 是否小于 `b` 并且 `b` 是否等于 `c`。

比较可以使用布尔运算符 `and` 和 `or` 进行组合，比较（或任何其他布尔表达式）的结果可以用 `not` 取反。这些运算符的优先级低于比较运算符；在它们之间，`not` 的优先级最高，`or` 的最低，所以 `A and not B or C` 等同于 `(A and (not B)) or C`。如常，可以使用括号来表示所需的组合。

布尔运算符 `and` 和 `or` 是所谓的短路运算符：它们的参数从左到右进行评估，一旦确定结果，评估就会停止。例如，如果 `A` 和 `C` 为真，但 `B` 为假，`A and B and C` 不会评估表达式 `C`。当用作一般值而不是布尔值时，短路运算符的返回值是最后评估的参数。

可以将比较或其他布尔表达式的结果赋值给一个变量。例如，

```python
string1, string2, string3 = '', 'Trondheim', 'Hammer Dance'
non_null = string1 or string2 or string3
non_null
'Trondheim'
```

注意，在 Python 中，与 C 不同，表达式中的赋值必须使用小矮人运算符 `:=` 明确完成。这避免了在 C 程序中遇到的常见问题：在表达式中键入 `=`，而意图是 `==`。

### 5.8. 比较序列和其他类型

序列对象通常可以与具有相同序列类型的其他对象进行比较。比较使用字典序排序：首先比较前两

个项，如果它们不同，则确定比较的结果；如果它们相等，则比较下两个项，依此类推，直到一个序列耗尽。如果两个要比较的项本身是相同类型的序列，将递归地进行字典序比较。如果两个序列的所有项都相等，那么认为序列相等。如果一个序列是另一个序列的初始子序列，较短的序列是较小（较小）的。字符串的字典序使用 Unicode 代码点号对单个字符进行排序。一些相同类型的序列之间的比较示例：

```python
(1, 2, 3)              < (1, 2, 4)
[1, 2, 3]              < [1, 2, 4]
'ABC' < 'C' < 'Pascal' < 'Python'
(1, 2, 3, 4)           < (1, 2, 4)
(1, 2)                 < (1, 2, -1)
(1, 2, 3)             == (1.0, 2.0, 3.0)
(1, 2, ('aa', 'ab'))   < (1, 2, ('abc', 'a'), 4)
```

注意，使用 `<` 或 `>` 比较不同类型的对象是合法的，前提是对象具有适当的比较方法。

例如，混合的数值类型按照它们的数值进行比较，所以 `0` 等于 `0.0` 等等。否则，解释器会引发 `TypeError` 异常。


# 参考资料

https://docs.python.org/3.12/tutorial/datastructures.html

* any list
{:toc}

