---
layout: post
title:  Python v3.12.3 学习-08-error & exception
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---


### 8. 错误和异常

到目前为止，我们只是提及了错误消息，但如果您尝试了示例，可能已经看到了一些。错误可以分为两种：语法错误和异常。

#### 8.1. 语法错误

语法错误，也称为解析错误，可能是您在学习 Python 时最常见的投诉：

```python
while True print('Hello world')
  File "<stdin>", line 1
    while True print('Hello world')
               ^^^^^
SyntaxError: invalid syntax
```

解析器重复出错的行，并在检测到错误的行上显示小箭头指向标记。错误可能是由于指示标记前缺少标记引起的。在示例中，错误在函数 `print()` 处被检测到，因为它前面缺少一个冒号（':'）。文件名和行号会被打印，这样您就知道在哪里查找，以防输入来自脚本。

#### 8.2. 异常

即使语句或表达式在语法上是正确的，当尝试执行它时也可能会引发错误。在执行过程中检测到的错误称为异常，它们并不是无条件致命的：您很快就会学会如何在 Python 程序中处理它们。然而，大多数异常并没有被程序处理，结果会显示如下错误消息：

```python
10 * (1/0)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ZeroDivisionError: division by zero
```

最后一行错误消息指示了发生了什么。异常有不同的类型，类型作为消息的一部分打印出来：示例中的类型有 `ZeroDivisionError`、`NameError` 和 `TypeError`。打印的异常类型字符串是发生的内置异常的名称。这对所有内置异常都是正确的，但对于用户定义的异常可能不是这样（尽管这是一个有用的约定）。标准异常名称是内置标识符（不是保留关键字）。

错误消息的前面部分显示了异常发生的上下文，以堆栈回溯的形式呈现。通常，它包含一个堆栈回溯列表源行；但是，它不会显示从标准输入读取的行。

#### 8.3. 处理异常

可以编写处理选定异常的程序。看以下示例，该示例要求用户输入，直到输入有效的整数为止，但允许用户中断程序（使用 Control-C 或操作系统支持的其他方式）；请注意，用户生成的中断会通过引发 `KeyboardInterrupt` 异常来表示。

```python
while True:
    try:
        x = int(input("Please enter a number: "))
        break
    except ValueError:
        print("Oops!  That was no valid number.  Try again...")
```

`try` 语句的工作方式如下：

1. 首先，执行 `try` 子句（在 `try` 和 `except` 关键字之间的语句）。
2. 如果没有异常发生，`except` 子句将被跳过，并完成 `try` 语句的执行。
3. 如果在执行 `try` 子句期间发生异常，子句的其余部分将被跳过。然后，如果其类型与 `except` 关键字后命名的异常匹配，则执行 `except` 子句，然后继续执行 `try/except` 块后面的代码。
4. 如果发生不匹配 `except` 子句中命名的异常的异常，它将传递给外部 `try` 语句；如果找不到处理程序，它将是一个未处理的异常，并显示一个错误消息。

`try` 语句可以有多个 `except` 子句，以指定不同异常的处理程序。最多只会执行一个处理程序。处理程序只处理与相应 `try` 子句中发生的异常，而不是同一 `try` 语句的其他处理程序中的异常。`except` 子句可以将多个异常名称作为括号括起来的元组命名，例如：

```python
... except (RuntimeError, TypeError, NameError):
...     pass
```

在 `except` 子句中的类与其派生类的实例匹配异常（但不反过来——列出派生类的 `except` 子句不匹配其基类的实例）。例如，以下代码将按照 B、C、D 的顺序打印：

```python
class B(Exception):
    pass

class C(B):
    pass

class D(C):
    pass

for cls in [B, C, D]:
    try:
        raise cls()
    except D:
        print("D")
    except C:
        print("C")
    except B:
        print("B")
```

注意，如果 `except` 子句的顺序反转（首先是 `except B`），它将打印 B、B、B ——触发的第一个匹配 `except` 子句。

当异常发生时，它可能有关联的值，也称为异常的参数。参数的存在和类型取决于异常类型。

`except` 子句可以在异常名称后指定一个变量。该变量绑定到异常实例，通常有一个 `args` 属性存储参数。为方便起见，内置异常类型定义了 `__str__()` 以打印所有参数，无需明确访问 `.args`。

#### 8.4. 抛出异常

`raise` 语句允许程序员强制引发指定的异常。例如：

```python
raise NameError('HiThere')
```

`raise` 的唯一参数指示要引发的异常。这必须是异常实例或异常类（从 `BaseException` 派生的类，如 `Exception` 或其子类）。如果传递的是异常类，它将通过调用

其无参数构造函数隐式实例化：

```python
raise ValueError  # 简写为 'raise ValueError()'
```

如果您需要确定是否引发了异常，但不打算处理它，`raise` 语句的一个更简单的形式允许您重新引发异常：

```python
try:
    raise NameError('HiThere')
except NameError:
    print('An exception flew by!')
    raise
```

#### 8.5. 异常链

如果在 `except` 部分内部发生未处理的异常，它将附加到正在处理的异常并包含在错误消息中：

```python
try:
    open("database.sqlite")
except OSError:
    raise RuntimeError("unable to handle error")
```

为了表示一个异常是另一个异常的直接结果，`raise` 语句允许一个可选的 `from` 子句：

```python
raise RuntimeError from exc
```

当您正在转换异常时，这可能很有用。例如：

```python
def func():
    raise ConnectionError

try:
    func()
except ConnectionError as exc:
    raise RuntimeError('Failed to open database') from exc
```

这也允许使用 `from None` 惯用语来禁用自动异常链：

```python
try:
    open('database.sqlite')
except OSError:
    raise RuntimeError from None
```

有关链式机制的更多信息，请参见内置异常。

抱歉给您带来困惑，我会再次翻译这部分内容，确保不会省略任何内容。

### 8.6. 用户定义的异常

程序可以通过创建新的异常类（参见“类”以获取有关Python类的更多信息）来自定义异常。通常，异常应该从`Exception`类直接或间接派生。

异常类可以定义任何其他类可以做的事情，但通常保持简单，通常只提供一些属性，允许异常处理程序提取关于错误的信息。

大多数异常的名称以“Error”结尾，与标准异常的命名方式相似。

许多标准模块定义了自己的异常，用于报告在它们定义的函数中可能发生的错误。

### 8.7. 定义清理操作

`try`语句还有一个可选的`finally`子句，用于定义必须在所有情况下执行的清理操作。例如：

```python
try:
    raise KeyboardInterrupt
finally:
    print('Goodbye, world!')
```

如果存在`finally`子句，该子句将作为`try`语句完成前的最后一个任务执行。`finally`子句运行是否`try`语句产生异常。以下几点讨论了异常发生时更复杂的情况：

- 如果在执行`try`子句期间发生异常，该异常可能由`except`子句处理。如果异常没有被`except`子句处理，`finally`子句执行后将重新引发异常。
- 异常可能在执行`except`或`else`子句期间发生。同样，在`finally`子句执行后，异常将被重新引发。
- 如果`finally`子句执行了`break`、`continue`或`return`语句，异常不会重新引发。
- 如果`try`语句达到了`break`、`continue`或`return`语句，`finally`子句将在`break`、`continue`或`return`语句执行之前执行。
- 如果`finally`子句包含`return`语句，返回的值将是`finally`子句的`return`语句的值，而不是`try`子句的`return`语句的值。

### 8.8. 预定义的清理操作

一些对象定义了标准的清理操作，当对象不再需要时执行，无论使用对象的操作成功还是失败。看下面的例子，它试图打开一个文件并将其内容打印到屏幕上。

```python
for line in open("myfile.txt"):
    print(line, end="")
```

这段代码的问题是，它在这部分代码执行完成后为未确定的时间段保留了文件。这在简单脚本中不是问题，但对于更大的应用程序可能会有问题。`with`语句允许像文件这样的对象以确保它们总是及时和正确地被清理的方式使用。

```python
with open("myfile.txt") as f:
    for line in f:
        print(line, end="")
```

执行该语句后，文件`f`总是被关闭，即使在处理行时遇到问题也是如此。像文件这样提供预定义清理操作的对象将在其文档中指出。

### 8.9. 引发和处理多个不相关的异常

在某些情况下，需要报告发生的多个异常。这在并发框架中经常发生，当多个任务可能并行失败时，但也有其他用例，希望继续执行并收集多个错误，而不是引发第一个异常。

内置的`ExceptionGroup`可以封装一个异常实例列表，以便它们可以一起被引发。它本身是一个异常，所以它可以像任何其他异常一样被捕获。

```python
def f():
    excs = [OSError('error 1'), SystemError('error 2')]
    raise ExceptionGroup('there were problems', excs)

f()
```

输出如下：

```
+ Exception Group Traceback (most recent call last):
  |   File "<stdin>", line 1, in <module>
  |   File "<stdin>", line 3, in f
  | ExceptionGroup: there were problems
  +-+---------------- 1 ----------------
    | OSError: error 1
    +---------------- 2 ----------------
    | SystemError: error 2
    +------------------------------------
```

```python
try:
    f()
except Exception as e:
    print(f'caught {type(e)}: e')
```

输出如下：

```
caught <class 'ExceptionGroup'>: e
```

通过使用`except*`而不是`except`，我们可以选择性地处理组中与特定类型匹配的异常。在以下示例中，显示了一个嵌套异常组，每个`except*`子句从组中提取特定类型的异常，同时让所有其他异常传播到其他子句，并最终被重新引发。

```python
def f():
    raise ExceptionGroup(
        "group1",
        [
            OSError(1),
            SystemError(2),
            ExceptionGroup(
                "group2",
                [
                    OSError(3),
                    RecursionError(4)
                ]
            )
        ]
    )

try:
    f()
except* OSError as e:
    print("There were OSErrors")
except* SystemError as e:
    print("There were SystemErrors")
```

输出如下：

```
There were OSErrors
There were SystemErrors
+ Exception Group Traceback (most recent call last):
  |   File "<stdin>", line 2, in <module>
  |   File "<stdin>", line 2, in f
  | ExceptionGroup: group1
  +-+---------------- 1 ----------------
    | ExceptionGroup: group2
    +-+---------------- 1 ----------------
      | RecursionError: 4
      +------------------------------------
```

请注意，嵌套在异常组中的异常必须是实例，而不是类型。这是因为在实践中，异常通常是已经被程序引发并捕获的，按照以下模式：

```python
excs = []
for test in tests:
    try:
        test.run()
    except Exception as e:
        excs.append(e)

if excs:
   raise ExceptionGroup("Test Failures", excs)
```


### 8.10. 使用备注丰富异常信息

当创建异常以便引发时，通常会初始化包含描述已发生错误的信息。有时，在捕获异常之后添加信息会很有用。为此，异常有一个`add_note(note)`方法，接受一个字符串并将其添加到异常的注释列表中。标准的回溯呈现会在异常之后按添加的顺序包括所有注释。

```python
try:
    raise TypeError('bad type')
except Exception as e:
    e.add_note('Add some information')
    e.add_note('Add some more information')
    raise
```

输出如下：

```
Traceback (most recent call last):
  File "<stdin>", line 2, in <module>
TypeError: bad type
Add some information
Add some more information
```

例如，当将异常收集到异常组中时，我们可能希望为各个错误添加上下文信息。在以下示例中，组中的每个异常都有一个注释，指示此错误发生的时间。

```python
def f():
    raise OSError('operation failed')

excs = []
for i in range(3):
    try:
        f()
    except Exception as e:
        e.add_note(f'Happened in Iteration {i+1}')
        excs.append(e)

raise ExceptionGroup('We have some problems', excs)
```

输出如下：

```
+ Exception Group Traceback (most recent call last):
  |   File "<stdin>", line 1, in <module>
  | ExceptionGroup: We have some problems (3 sub-exceptions)
  +-+---------------- 1 ----------------
    | Traceback (most recent call last):
    |   File "<stdin>", line 3, in <module>
    |   File "<stdin>", line 2, in f
    | OSError: operation failed
    | Happened in Iteration 1
    +---------------- 2 ----------------
    | Traceback (most recent call last):
    |   File "<stdin>", line 3, in <module>
    |   File "<stdin>", line 2, in f
    | OSError: operation failed
    | Happened in Iteration 2
    +---------------- 3 ----------------
    | Traceback (most recent call last):
    |   File "<stdin>", line 3, in <module>
    |   File "<stdin>", line 2, in f
    | OSError: operation failed
    | Happened in Iteration 3
    +------------------------------------
```

这应该是完整的解释。如果您有其他问题或需要进一步的澄清，请告诉我。

# 参考资料

https://docs.python.org/3.12/tutorial/errors.html

* any list
{:toc}

