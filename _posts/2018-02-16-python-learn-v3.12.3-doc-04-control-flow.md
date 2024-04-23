---
layout: post
title:  Python v3.12.3 学习-04-流程控制
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---

### 4.1. if 语句

`if` 语句是最为人们熟知的语句类型。例如：

```python
x = int(input("请输入一个整数："))
if x < 0:
    x = 0
    print('负数已改为零')
elif x == 0:
    print('零')
elif x == 1:
    print('单一')
else:
    print('更多')
```

`elif` 部分可以有零个或多个，`else` 部分是可选的。关键字 `elif` 是 `else if` 的简写，有助于避免过多的缩进。`if … elif … elif …` 序列是其他语言中的 `switch` 或 `case` 语句的替代。

如果你需要比较相同的值与多个常量，或检查特定类型或属性，你也可能会发现 `match` 语句很有用。更多详情请参见 `match` 语句。

### 4.2. for 语句

Python 中的 `for` 语句与 C 或 Pascal 中的 `for` 语句有所不同。Python 的 `for` 语句遍历任何序列（如列表或字符串）中的项，按照它们在序列中出现的顺序。例如：

```python
# 测量一些字符串：
words = ['cat', 'window', 'defenestrate']
for w in words:
    print(w, len(w))
```

修改正在遍历的集合的代码可能会有些棘手。通常，最简单的方法是遍历集合的副本或创建一个新的集合：

```python
# 创建一个样本集合
users = {'Hans': 'active', 'Éléonore': 'inactive', '景太郎': 'active'}

# 策略：遍历副本
for user, status in users.copy().items():
    if status == 'inactive':
        del users[user]

# 策略：创建一个新的集合
active_users = {}
for user, status in users.items():
    if status == 'active':
        active_users[user] = status
```

### 4.3. range() 函数

如果你需要遍历一系列数字，内置函数 `range()` 非常方便。它生成算术进度：

```python
for i in range(5):
    print(i)
```

给定的结束点永远不会是生成序列的一部分；`range(10)` 生成 10 个值，长度为 10 的序列的合法索引。你可以让 `range` 从另一个数字开始，或指定不同的增量（甚至为负数；有时这被称为“步长”）：

```python
list(range(5, 10))
[5, 6, 7, 8, 9]

list(range(0, 10, 3))
[0, 3, 6, 9]

list(range(-10, -100, -30))
[-10, -40, -70]
```

### 4.4. break 和 continue 语句，以及循环中的 else 子句

`break` 语句退出最内层的 `for` 或 `while` 循环。

`for` 或 `while` 循环可以包含一个 `else` 子句。

在 `for` 循环中，当循环达到其最后一个迭代时，`else` 子句会被执行。

在 `while` 循环中，当循环的条件变为 `false` 时，`else` 子句会被执行。

在任何类型的循环中，如果循环是由 `break` 终止的，`else` 子句不会被执行。

### 4.5. pass 语句

`pass` 语句什么也不做。当语法上需要一个语句，但程序不需要执行任何操作时，可以使用 `pass`。例如：

```python
while True:
    pass  # 等待键盘中断（Ctrl+C）
```

这通常用于创建最小的类：

```python
class MyEmptyClass:
    pass
```

当你正在开发新代码时，`pass` 还可以作为函数或条件体的占位符，允许你在更抽象的层次上思考。`pass` 会被静默忽略：

```python
def initlog(*args):
    pass   # 记得实现这个！
```


### 4.6. match 语句

`match` 语句接受一个表达式，并将其值与一个或多个 `case` 块中给定的模式进行比较。这与 C、Java 或 JavaScript 中的 `switch` 语句表面上相似（以及许多其他语言），但它更类似于 Rust 或 Haskell 等语言中的模式匹配。只有第一个匹配的模式会被执行，它还可以从值中提取组件（序列元素或对象属性）到变量中。

最简单的形式是将主题值与一个或多个文字进行比较：

```python
def http_error(status):
    match status:
        case 400:
            return "错误请求"
        case 404:
            return "未找到"
        case 418:
            return "我是一个茶壶"
        case _:
            return "互联网出了些问题"
```

注意最后一个块：`_` 作为通配符，永远匹配成功。如果没有 `case` 匹配，那么不会执行任何分支。

你可以使用 `|`（“或”）将几个文字组合在一个模式中：

```python
case 401 | 403 | 404:
    return "不允许"
```

模式可以看起来像解包赋值，并且可以用于绑定变量：

```python
# point 是一个 (x, y) 元组
match point:
    case (0, 0):
        print("原点")
    case (0, y):
        print(f"Y={y}")
    case (x, 0):
        print(f"X={x}")
    case (x, y):
        print(f"X={x}, Y={y}")
    case _:
        raise ValueError("不是一个点")
```

如果你使用类来组织你的数据，你可以使用类名后跟一个类似于构造函数的参数列表，但可以将属性捕获到变量中：

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

def where_is(point):
    match point:
        case Point(x=0, y=0):
            print("原点")
        case Point(x=0, y=y):
            print(f"Y={y}")
        case Point(x=x, y=0):
            print(f"X={x}")
        case Point():
            print("其他地方")
        case _:
            print("不是一个点")
```

### 4.7. 定义函数

我们可以创建一个函数，将 Fibonacci 序列写入任意边界：

```python
def fib(n):    # 写出 Fibonacci 序列直到 n
    """打印 Fibonacci 序列直到 n。"""
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a+b
    print()
```

关键字 `def` 引入了一个函数定义。它后面必须跟着函数名和括号中的形式参数列表。组成函数体的语句从下一行开始，并且必须缩进。

函数体的第一条语句可以选择性地是一个字符串字面量；这个字符串字面量是函数的文档字符串，或称为 docstring。有些工具使用 docstrings 自动产生在线或打印的文档，或者让用户交互式地浏览代码；在你写的代码中包含 docstrings 是一个好习惯。

函数执行引入了一个用于函数局部变量的新符号表。更准确地说，函数中的所有变量赋值都存储在局部符号表中；而变量引用首先在局部符号表中查找，然后在封闭函数的局部符号表中查找，然后在全局符号表中查找，最后在内建名称的表中查找。因此，全局变量和封闭函数的变量不能直接在函数内赋值（除非对于全局变量，在全局语句中命名，或者对于封闭函数的变量，在非局部语句中命名），尽管它们可以被引用。

函数调用的实际参数（参数）在调用函数时引入了调用函数的局部符号表；因此，参数是通过值传递的（其中值总是一个对象引用，而不是对象的值）。当一个函数调用另一个函数，或者递归地调用自己时，为该调用创建一个新的局部符号表。

函数定义将函数名与当前符号表中的函数对象关联起来。解释器将由该名称指向的对象识别为用户定义的函数。其他名称也可以指向同一个函数对象，并且也可以用来访问该函数。

4.8. 函数定义的更多内容
还可以定义带有可变数量参数的函数。这有三种形式，可以组合使用。

### 4.8.1. 默认参数值
最有用的形式是为一个或多个参数指定默认值。这样可以创建一个可以用少于其定义允许的参数进行调用的函数。例如：

```python
def ask_ok(prompt, retries=4, reminder='请重试!'):
    while True:
        reply = input(prompt)
        if reply in {'y', 'ye', 'yes'}:
            return True
        if reply in {'n', 'no', 'nop', 'nope'}:
            return False
        retries = retries - 1
        if retries < 0:
            raise ValueError('无效的用户响应')
        print(reminder)
```

这个函数可以通过以下几种方式调用：

- 只给必填参数：`ask_ok('你真的想退出吗?')`
- 给一个可选参数：`ask_ok('确定覆盖文件吗?', 2)`
- 给所有参数：`ask_ok('确定覆盖文件吗?', 2, '只能是是或否！')`

这个示例还介绍了 `in` 关键字，它测试一个序列是否包含某个值。

默认值在函数定义的作用域中的定义点进行评估，所以

```python
i = 5

def f(arg=i):
    print(arg)

i = 6
f()
```
将打印 5。

重要警告：默认值只评估一次。当默认值是可变对象，如列表、字典或大多数类的实例时，这将有所不同。例如，以下函数在后续调用中累积传递给它的参数：

```python
def f(a, L=[]):
    L.append(a)
    return L

print(f(1))
print(f(2))
print(f(3))
```

这将打印：

```
[1]
[1, 2]
[1, 2, 3]
```

如果你不希望默认值在后续调用之间共享，你可以这样写函数：

```python
def f(a, L=None):
    if L is None:
        L = []
    L.append(a)
    return L
```

### 4.8.2. 关键字参数
函数还可以使用形如 `kwarg=value` 的关键字参数进行调用。

```python
def parrot(voltage, state='a stiff', action='voom', type='Norwegian Blue'):
    print("-- 这只鹦鹉不会", action, end=' ')
    print("如果你通过它加入", voltage, "伏特。")
    print("-- 非常好的羽毛，", type)
    print("-- 它是", state, "!")
```

这个函数可以通过多种方式进行调用。

### 4.8.3. 特殊参数
默认情况下，可以通过位置或显式关键字传递参数给Python函数。为了可读性和性能，限制参数传递的方式是有意义的，这样开发者只需查看函数定义就能确定项目是通过位置、通过位置或关键字，还是通过关键字传递的。

函数定义可能看起来像这样：

```python
def f(pos1, pos2, /, pos_or_kwd, *, kwd1, kwd2):
      -----------    ----------     ----------
        |             |                  |
        |        位置或关键字            |
        |                                - 仅关键字
         -- 仅位置
```

其中 `/` 和 `*` 是可选的。如果使用了这些符号，它们表示参数如何传递给函数：仅位置、位置或关键字，和仅关键字。关键字参数也被称为命名参数。

### 4.8.4. 任意参数列表
最后，最不常用的选项是指定一个函数可以用任意数量的参数进行调用。这些参数将被包装在一个元组中。在可变数量的参数之前，可以出现零个或多个普通参数。

```python
def write_multiple_items(file, separator, *args):
    file.write(separator.join(args))
```

通常，这些变长参数将是形式参数列表中的最后一个，因为它们接收传递给函数的所有剩余输入参数。在 `*args` 参数之后出现的任何形式参数都是‘仅关键字’参数，这意味着它们只能作为关键字而不是位置参数使用。

### 4.8.5. 解包参数列表
当参数已经在列表或元组中，但需要为函数调用解包时，会出现相反的情况。例如，内置的 `range()` 函数期望单独的开始和停止参数。如果它们不可用单独，可以使用 `*` 运算符从列表或元组中解包参数：

```python
list(range(3, 6))            # 使用单独的参数进行正常调用
[3, 4, 5]
args = [3, 6]
list(range(*args))            # 从列表中解包参数进行调用
[3, 4, 5]
```

同样的方式，字典可以使用 `**` 运算符提供关键字参数：

```python
def parrot(voltage, state='a stiff', action='voom'):
    print("-- 这只鹦鹉不会", action, end=' ')
    print("如果你通过它加入", voltage, "伏特。", end=' ')
    print("E's", state, "!")
```

```python
d = {"voltage": "four million", "state": "bleedin' demised", "action": "VOOM"}
parrot(**d)
```

当然，我可以帮助你翻译这段文本。以下是翻译的内容：

### 4.8.6. Lambda 表达式

使用 lambda 关键字可以创建小型的匿名函数。该函数返回其两个参数的和：lambda a, b: a+b。Lambda 函数可以在需要函数对象的任何地方使用。它们在语法上受到限制，只能包含单个表达式。从语义上讲，它们只是正常函数定义的语法糖。与嵌套函数定义类似，lambda 函数可以引用包含作用域中的变量：

```py
def make_incrementor(n):
    return lambda x: x + n

f = make_incrementor(42)
f(0)
42
f(1)
43
```

上面的示例使用 lambda 表达式返回一个函数。另一个用途是将小型函数作为参数传递：

```
pairs = [(1, 'one'), (2, 'two'), (3, 'three'), (4, 'four')]
pairs.sort(key=lambda pair: pair[1])
pairs
[(4, 'four'), (1, 'one'), (3, 'three'), (2, 'two')]
```

### 4.8.7. 文档字符串

以下是关于文档字符串内容和格式的一些约定。

第一行应始终是对象用途的简短、简洁摘要。为了简洁，它不应显式说明对象的名称或类型，因为这些可以通过其他方式获取（除非名称恰好是描述函数操作的动词）。这一行应以大写字母开头，并以句点结尾。

如果文档字符串中有更多行，则第二行应为空行，用于视觉上将摘要与其余描述分隔开。接下来的行应是一个或多个段落，描述对象的调用约定、其副作用等。

Python 解析器不会从 Python 的多行字符串文字中删除缩进，因此处理文档的工具必须根据需要删除缩进。使用以下约定进行此操作。在字符串的第一行后面的第一行非空行确定整个文档字符串的缩进量。（我们不能使用第一行，因为它通常与字符串的开头引号相邻，所以其缩进在字符串文字中不明显。）等同于此缩进的空白将从字符串的所有行的开始处删除。如果存在缩进较少的行，它们的所有前导空白都应删除。应在扩展制表符后测试空白的等效性（通常为 8 个空格）。

以下是一个多行文档字符串的示例：

```py
def my_function():
    """什么都不做，但是记录它。

    实际上，它真的什么都不做。
    """
    pass

print(my_function.__doc__)
```

### 4.8.8. 函数注释

函数注释是关于用户定义函数使用的类型的完全可选元数据信息（参见 PEP 3107 和 PEP 484 获取更多信息）。

注释存储在函数的 `__annotations__` 属性中，作为字典，并且不会影响函数的任何其他部分。参数注释由参数名称后面的冒号定义，后跟表达式，该表达式评估为注释的值。返回注释由字面量 `->` 定义，位于参数列表和冒号之间，表示 `def` 语句的结束。以下示例有一个必需参数，一个可选参数，以及返回值的注释：

```py
def f(ham: str, eggs: str = 'eggs') -> str:
    print("Annotations:", f.__annotations__)
    print("Arguments:", ham, eggs)
    return ham + ' and ' + eggs

f('spam')
Annotations: {'ham': <class 'str'>, 'return': <class 'str'>, 'eggs': <class 'str'>}
Arguments: spam eggs
'spam and eggs'
```

# 4.9. 插曲：编码风格

既然你即将编写更长、更复杂的 Python 代码，现在是讨论编码风格的好时机。大多数语言都可以以不同的风格编写（或更简洁、格式化）；有些更易读。让其他人轻松阅读你的代码总是一个好主意，采用良好的编码风格对此有很大帮助。

对于 Python，PEP 8 已经成为大多数项目遵循的风格指南；它推广了一种非常易读且赏心悦目的编码风格。每个 Python 开发者都应该在某个时候阅读它；以下是为你提取的最重要的点：

- 使用 4 个空格的缩进，不使用制表符。
- 将行包装起来，使其不超过 79 个字符。
- 使用空白行来分隔函数和类，以及函数内的较大代码块。
- 在可能的情况下，将注释放在它们自己的行上。
- 使用文档字符串。
- 在操作符和逗号后面使用空格，但不直接在括号结构内部使用：`a = f(1, 2) + g(3, 4)`。
- 为类和函数命名保持一致；约定是使用大驼峰命名法（UpperCamelCase）来命名类，使用小写并使用下划线（lowercase_with_underscores）来命名函数和方法。始终使用 `self` 作为第一个方法参数的名称。
- 如果代码旨在在国际环境中使用，请不要使用高级编码。Python 的默认、UTF-8，或者甚至纯 ASCII 都是最佳选择。
- 同样，如果有任何可能的话，不要在标识符中使用非 ASCII 字符，因为有人可能会用不同的语言阅读或维护代码。


# 参考资料

https://docs.python.org/3.12/tutorial/controlflow.html

* any list
{:toc}

