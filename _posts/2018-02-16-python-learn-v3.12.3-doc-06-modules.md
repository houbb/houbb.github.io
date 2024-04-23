---
layout: post
title:  Python v3.12.3 学习-06-Module
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---


### 6. 模块

当你退出Python解释器并再次进入时，你所定义的（函数和变量）都会丢失。因此，如果你想编写一个稍微长一点的程序，最好使用文本编辑器准备解释器的输入，然后以该文件作为输入运行它。这被称为创建一个脚本。随着你的程序变得越来越长，你可能想把它分成几个文件以便更容易维护。

你可能还想使用你在几个程序中编写的一个方便的函数，而不是将其定义复制到每个程序中。

为了支持这一点，Python有一种方式可以将定义放在一个文件中，并在脚本或解释器的交互实例中使用它们。这样的文件被称为模块；模块中的定义可以被导入到其他模块或主模块（在顶级执行的脚本和计算器模式中可以访问的变量集合）中。

一个模块是一个包含Python定义和语句的文件。文件名是模块名加上后缀`.py`。在模块内部，模块的名字（作为一个字符串）可以作为全局变量`__name__`的值。例如，使用你最喜欢的文本编辑器在当前目录下创建一个名为`fibo.py`的文件，内容如下：

```python
# Fibonacci numbers module

def fib(n):    # write Fibonacci series up to n
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a+b
    print()

def fib2(n):   # return Fibonacci series up to n
    result = []
    a, b = 0, 1
    while a < n:
        result.append(a)
        a, b = b, a+b
    return result
```

现在进入Python解释器，并使用以下命令导入此模块：

```python
>>> import fibo
```

这并不直接将在`fibo`中定义的函数的名称添加到当前命名空间（详见Python作用域和命名空间以获取更多详细信息）；它只在那里添加模块名`fibo`。使用模块名你可以访问函数：

```python
>>> fibo.fib(1000)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987
>>> fibo.fib2(100)
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
>>> fibo.__name__
'fibo'
```

如果你打算经常使用一个函数，你可以将它赋值给一个本地名称：

```python
>>> fib = fibo.fib
>>> fib(500)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
```

### 6.1. 模块的更多内容

一个模块可以包含可执行的语句以及函数定义。这些语句旨在初始化模块。它们只在第一次在导入语句中遇到模块名时执行。[1]（如果文件作为脚本执行，它们也会运行。）

每个模块都有自己的私有命名空间，这个命名空间被所有在模块中定义的函数用作全局命名空间。因此，模块的作者可以在模块中使用全局变量，而不必担心与用户的全局变量的意外冲突。另一方面，如果你知道你在做什么，你可以使用相同的表示法触摸模块的全局变量，就像引用它的函数一样，`modname.itemname`。

模块可以导入其他模块。习惯上但不是必需的，将所有导入语句放在模块（或脚本，说到底）的开始。如果导入的模块名放在模块的顶级（在任何函数或类之外），它们会被添加到模块的全局命名空间。

还有一种从模块直接导入名称到导入模块的命名空间的导入语句的变体。例如：

```python
>>> from fibo import fib, fib2
>>> fib(500)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
```

这不会在本地命名空间中引入从中取得导入的模块名（所以在这个例子中，`fibo`没有被定义）。

还有一个变体，导入模块定义的所有名称：

```python
>>> from fibo import *
>>> fib(500)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
```

这导入除了以下划线（_）开头的名称之外的所有名称。在大多数情况下，Python程序员不使用这个设施，因为它引入了一组未知的名称到解释器中，可能隐藏了你已经定义的一些东西。

请注意，通常不赞成从模块或包中导入*，因为它经常导致代码难以阅读。但是，在交互式会话中使用它来节省输入是可以的。

如果模块名后跟`as`，那么`as`后面的名字直接绑定到导入的模块。

```python
>>> import fibo as fib
>>> fib.fib(500)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
```

这实际上是以与`import fibo`相

同的方式导入模块，唯一的区别是它作为`fib`可用。

在使用`from`时也可以这样做：

```python
>>> from fibo import fib as fibonacci
>>> fibonacci(500)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
```

### 6.1.1. 作为脚本执行模块

当你运行一个Python模块时：

```bash
python fibo.py <arguments>
```

模块中的代码将被执行，就像你导入它一样，但`__name__`设置为`"__main__"`。这意味着通过在你的模块末尾添加这段代码：

```python
if __name__ == "__main__":
    import sys
    fib(int(sys.argv[1]))
```

你可以使文件既可用作脚本也可用作可导入的模块，因为只有当模块作为“主”文件执行时，解析命令行的代码才会运行：

```bash
python fibo.py 50
0 1 1 2 3 5 8 13 21 34
```

如果模块被导入，代码不会运行：

```python
>>> import fibo
```

这经常用于为模块提供一个方便的用户界面，或者用于测试目的（作为脚本运行模块会执行一个测试套件）。

### 6.1.2. 模块搜索路径

当一个名为`spam`的模块被导入时，解释器首先搜索具有该名称的内置模块。这些模块名称列在`sys.builtin_module_names`中。如果没有找到，它然后在由变量`sys.path`给出的目录列表中搜索名为`spam.py`的文件。`sys.path`从这些位置初始化：

- 包含输入脚本的目录（或没有指定文件时的当前目录）。
- `PYTHONPATH`（目录名称列表，与shell变量`PATH`的语法相同）。
- 安装特定的默认目录（按照惯例包括一个`site-packages`目录，由`site`模块处理）。

更多详细信息请参阅模块搜索路径的初始化。

请注意，在支持符号链接的文件系统上，计算输入脚本所在的目录是在跟随符号链接之后计算的。换句话说，不会将包含符号链接的目录添加到模块搜索路径中。

初始化后，Python程序可以修改`sys.path`。正在运行的脚本所在的目录被放在搜索路径的开始，优先于标准库路径。这意味着该目录中的脚本将被加载，而不是库目录中具有相同名称的模块。除非打算替换，否则这是一个错误。更多信息请参阅标准模块部分。

### 6.1.3. “编译”Python文件

为了加速加载模块，Python将每个模块的编译版本缓存到`__pycache__`目录下，名称为`module.version.pyc`，其中版本编码为编译文件的格式；它通常包含Python版本号。例如，在CPython 3.3版本中，`spam.py`的编译版本将被缓存为`__pycache__/spam.cpython-33.pyc`。这种命名约定允许来自不同版本和不同Python版本的编译模块共存。

Python检查源代码的修改日期与编译版本以确定是否过时并需要重新编译。这是一个完全自动的过程。此外，编译的模块是平台无关的，因此可以在具有不同架构的系统之间共享相同的库。

在两种情况下，Python不会检查缓存。首先，它总是重新编译并不保存直接从命令行加载的模块的结果。其次，如果没有源模块，它不会检查缓存。为了支持非源（仅编译）分发，编译的模块必须位于源目录中，且不能有源模块。

一些专家提示：

你可以使用`-O`或`-OO`开关在Python命令上来减小编译模块的大小。`-O`开关删除断言语句，`-OO`开关删除断言语句和`__doc__`字符串。由于某些程序可能依赖于这些可用性，你应该只在知道你在做什么时使用此选项。"优化"模块有一个`opt-`标签，通常较小。未来版本可能会改变优化的效果。

从`.pyc`文件读取程序不会比从`.py`文件读取更快；`.pyc`文件唯一更快的是它们被加载的速度。

模块`compileall`可以为目录中的所有模块创建`.pyc`文件。

有关此过程的更多详细信息，包括决策的流程图，请参阅PEP 3147。

### 6.2. 标准模块

Python 包含了一系列的标准模块库，这些模块在一个单独的文档中有详细描述，即 Python 库参考手册（以下简称“库参考”）。有些模块是内置在解释器中的，它们提供对于语言核心之外的操作的访问，但是仍然是内置的，这可能是为了提高效率或者为了提供对操作系统原语（例如系统调用）的访问。这些模块的集合是一个配置选项，也依赖于底层平台。例如，winreg 模块只在 Windows 系统上提供。

一个特别值得注意的模块是 sys，它内置在每个 Python 解释器中。变量 sys.ps1 和 sys.ps2 定义了作为主要和次要提示的字符串：

```python
import sys
print(sys.ps1)
# 输出 '>>> '
print(sys.ps2)
# 输出 '... '
sys.ps1 = 'C> '
print('Yuck!')
# 输出 Yuck!
```

这两个变量只在解释器处于交互模式时定义。

变量 sys.path 是一个字符串列表，决定了解释器对模块的搜索路径。

它初始化为从环境变量 PYTHONPATH 中获取的默认路径，如果 PYTHONPATH 没有设置，则使用内置的默认路径。你可以使用标准的列表操作来修改它：

```python
import sys
sys.path.append('/ufs/guido/lib/python')
```

### 6.3. dir() 函数

内置函数 dir() 用于查找模块定义的名称。它返回一个排序后的字符串列表：

```python
import fibo, sys
print(dir(fibo))
# 输出 ['__name__', 'fib', 'fib2']

print(dir(sys))
# 输出包含 sys 模块中所有名称的列表
```

如果没有参数，dir() 则列出当前定义的名称：

```python
a = [1, 2, 3, 4, 5]
import fibo
fib = fibo.fib
print(dir())
# 输出包含 '__builtins__', '__name__', 'a', 'fib', 'fibo', 'sys' 的列表
```

请注意，它列出了所有类型的名称：变量、模块、函数等。

dir() 不会列出内置函数和变量的名称。如果你想要这些名称的列表，它们定义在标准模块 builtins 中：

```python
import builtins
print(dir(builtins))
# 输出包含所有内置函数和变量的列表
```

### 6.4. 包（Packages）

包是一种通过使用“点分模块名称”来组织 Python 模块命名空间的方式。例如，模块名 A.B 指的是包名为 A 中的子模块 B。就像使用模块可以使不同模块的作者不必担心彼此的全局变量名称一样，使用点分模块名称可以使像 NumPy 或 Pillow 这样的多模块包的作者不必担心彼此的模块名称。

假设你想设计一个用于统一处理声音文件和声音数据的模块集合（一个“包”）。有许多不同的声音文件格式（通常通过它们的扩展名来识别，例如：.wav、.aiff、.au），所以你可能需要创建和维护一个日益增长的模块集合来进行这些文件格式之间的转换。还有许多你可能想对声音数据执行的操作（如混音、添加回声、应用均衡器函数、创建人造立体效果），所以除此之外，你还会编写一系列模块来执行这些操作。以下是你的包可能的结构（以分层文件系统的形式表示）：

```plaintext
sound/                          顶级包
      __init__.py               初始化 sound 包
      formats/                  文件格式转换的子包
              __init__.py
              wavread.py
              wavwrite.py
              aiffread.py
              aiffwrite.py
              auread.py
              auwrite.py
              ...
      effects/                  声音效果的子包
              __init__.py
              echo.py
              surround.py
              reverse.py
              ...
      filters/                  过滤器的子包
              __init__.py
              equalizer.py
              vocoder.py
              karaoke.py
              ...
```

当导入包时，Python 会在 sys.path 上的目录中搜索包子目录。

`__init__.py` 文件是必需的，使 Python 将包含该文件的目录视为包（除非使用命名空间包，这是一个相对高级的功能）。这可以防止具有常见名称（例如 string）的目录无意中隐藏后续出现的有效模块。在最简单的情况下，`__init__.py` 可以是一个空文件，但它也可以执行包的初始化代码或设置 `__all__` 变量，稍后会描述。

包的用户可以从包中导入单个模块，例如：

```python
import sound.effects.echo
```

这会加载子模块 `sound.effects.echo`。必须使用其完整名称引用它。

```python
sound.effects.echo.echofilter(input, output, delay=0.7, atten=4)
```

另一种导入子模块的方法是：

```python
from sound.effects import echo
```

这也加载子模块 `echo`，并使其不带包前缀可用，因此可以这样使用：

```python
echo.echofilter(input, output, delay=0.7, atten=4)
```

还有另一种变体是直接导入所需的函数或变量：

```python
from sound.effects.echo import echofilter
```

这也加载子模块 `echo`，但这使得其函数 `echofilter()` 直接可用：

```python
echofilter(input, output, delay=0.7, atten=4)
```

请注意，当使用 `from package import item` 时，item 可以是包的子模块（或子包），或者是包中定义的其他名称，如函数、类或变量。导入语句首先测试项目是否在包中定义；如果不是，则假设它是一个模块并尝试加载它。如果找不到它，将引发 ImportError 异常。

相反，当使用 `import item.subitem.subsubitem` 这样的语法时，除最后一个外的每个项目必须是一个包；最后一个项目可以是一个模块或包，但不能是在前一个项目中定义的类、函数或变量。

#### 6.4.1. 从包中导入 *（Importing * From a Package）

现在，当用户编写 `from sound.effects import *` 时会发生什么呢？理想情况下，人们希望这种方法能够从文件系统中找出包中存在的所有子模块，并将它们全部导入。这可能需要很长时间，而且导入子模块可能会产生不希望的副作用，应仅在显式导入子模块时发生。

唯一的解决方案是包的作者提供一个明确的包索引。导入语句使用以下约定：如果包的 `__init__.py` 代码定义了一个名为 `__all__` 的列表，它被认为是遇到 `from package import *` 时应导入的模块名称列表。当发布包的新版本时，包作者需要保持此列表的最新状态。如果他们认为从他们的包中导入 * 没有用处，他们也可以决定不支持它。例如，文件 `sound/effects/__init__.py` 可能包含以下代码：

```python
__all__ = ["echo", "surround", "reverse"]
```

这意味着 `from sound.effects import *` 将导入 `sound.effects` 包的三个命名子模块。

请注意，子模块可能会被本地定义的名称遮蔽。例如，如果你在 `sound/effects/__init__.py` 文件中添加了一个 `reverse` 函数，`from sound.effects import *` 只会导入两个子模块 `echo` 和 `surround`，但不会导入 `reverse` 子模块，因为它被本地定义的 `reverse` 函数遮蔽了。

#### 6.4.2. 包内引用（Intra-package References）

当包结构化为子包（如示例中的 `sound`

 包）时，你可以使用绝对导入来引用同级包的子模块。例如，如果模块 `sound.filters.vocoder` 需要使用 `sound.effects` 包中的 `echo` 模块，它可以使用 `from sound.effects import echo`。

你也可以编写相对导入，使用 `from module import name` 形式的导入语句。这些导入使用前导点来指示涉及相对导入的当前和父包。例如，在 `surround` 模块中，你可能会使用：

```python
from . import echo
from .. import formats
from ..filters import equalizer
```

请注意，相对导入是基于当前模块的名称的。由于主模块的名称始终是 `"__main__"`，用作 Python 应用程序主模块的模块必须始终使用绝对导入。

#### 6.4.3. 多目录中的包（Packages in Multiple Directories）

包支持另一个特殊属性 `__path__`。这初始化为一个列表，该列表包含在执行该文件的代码之前包含包 `__init__.py` 的目录的名称。这个变量可以被修改；这样做会影响包含在包中的模块和子包的未来搜索。

虽然这个功能并不经常需要，但它可以用来扩展包中找到的模块集合。

### 脚注

[1] 实际上，函数定义也是“语句”，它们是“执行”的；模块级函数定义的执行会将函数名称添加到模块的全局命名空间中。


# 参考资料

https://docs.python.org/3.12/tutorial/modules.html

* any list
{:toc}

