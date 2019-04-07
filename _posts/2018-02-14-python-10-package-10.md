---
layout: post
title: Python-10-package 包
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, sh]
published: true
---


# 包

包是一种通过用“带点号的模块名”来构造 Python 模块命名空间的方法。 

例如，模块名 A.B 表示 A 包中名为 B 的子模块。正如模块的使用使得不同模块的作者不必担心彼此的全局变量名称一样，使用加点的模块名可以使得 NumPy 或 Pillow 等多模块软件包的作者不必担心彼此的模块名称一样。

假设你想为声音文件和声音数据的统一处理，设计一个模块集合（一个“包”）。

由于存在很多不同的声音文件格式（通常由它们的扩展名来识别，例如：.wav， .aiff， .au），因此为了不同文件格式间的转换，你可能需要创建和维护一个不断增长的模块集合。 

你可能还想对声音数据还做很多不同的处理（例如，混声，添加回声，使用均衡器功能，创造人工立体声效果）， 因此为了实现这些处理，你将另外写一个无穷尽的模块流。

这是你的包的可能结构（以分层文件系统的形式表示）：

```
sound/                          Top-level package
      __init__.py               Initialize the sound package
      formats/                  Subpackage for file format conversions
              __init__.py
              wavread.py
              wavwrite.py
              aiffread.py
              aiffwrite.py
              auread.py
              auwrite.py
              ...
      effects/                  Subpackage for sound effects
              __init__.py
              echo.py
              surround.py
              reverse.py
              ...
      filters/                  Subpackage for filters
              __init__.py
              equalizer.py
              vocoder.py
              karaoke.py
```

## init.py

当导入这个包时，Python 搜索 sys.path 里的目录，查找包的子目录。

为了让 Python 将目录当做包，目录中必须包含 `__init__.py` 文件；

这样做是为了**防止具有通用名称的目录无意中隐藏稍后在模块搜索路径上出现的有效模块，例如 string。**

最简单的情况下，只需要一个空的 `__init__.py` 文件即可，当然它也可以执行包的初始化代码，或者定义稍后会介绍的 `__all__` 变量。

ps: 对比 java 中的包信息，增加了一定程度的编程复杂度。可能更类似于 `package-info.java`

## 包导入

### 单个模块

包的用户可以从包中导入单个模块，例如:

```py
import sound.effects.echo
```

这会加载子模块 sound.effects.echo。但引用它时必须使用它的全名。

```py
sound.effects.echo.echofilter(input, output, delay=0.7, atten=4)
```

### from packge import module 方式

导入子模块的另一种方法是

```py
from sound.effects import echo
```

这也会加载子模块 echo ，并使其在没有包前缀的情况下可用，因此可以按如下方式使用:

```py
echo.echofilter(input, output, delay=0.7, atten=4)
```

### 直接导入函数

另一种形式是直接导入所需的函数或变量:

```py
from sound.effects.echo import echofilter
```

同样，这也会加载子模块 echo，但这会使其函数 echofilter() 直接可用:

```py
echofilter(input, output, delay=0.7, atten=4)
```

请注意，当使用 from package import item 时，item可以是包的子模块（或子包），也可以是包中定义的其他名称，如函数，类或变量。 

import 语句首先测试是否在包中定义了item；如果没有，它假定它是一个模块并尝试加载它。如果找不到它，则引发 ImportError 异常。

相反，当使用 import item.subitem.subsubitem 这样的语法时，除了最后一项之外的每一项都必须是一个包；最后一项可以是模块或包，但不能是前一项中定义的类或函数或变量。


### 个人感受

让一个开发者在调用的时候写全包的引用是非常不友好的。

如此看来，python 中的 module 就类似于 java 中的类。

## 导入 *

当用户写 `from sound.effects import *` 会发生什么？

理想情况下，人们希望这会以某种方式传递给文件系统，找到包中存在哪些子模块，并将它们全部导入。

这可能需要很长时间，导入子模块可能会产生不必要的副作用，这种副作用只有在显式导入子模块时才会发生。

### 包的显示索引

唯一的解决方案是让包作者提供一个包的显式索引。

import 语句使用下面的规范：如果一个包的 `__init__.py` 代码定义了一个名为 `__all__` 的列表，它会被视为在遇到 from package import * 时应该导入的模块名列表。

在发布该包的新版本时，包作者可以决定是否让此列表保持更新。包作者如果认为从他们的包中导入 * 的操作没有必要被使用，也可以决定不支持此列表。

例如，文件 `sound/effects/__init__.py` 可以包含以下代码:

```py
__all__ = ["echo", "surround", "reverse"]
```

这意味着 from sound.effects import * 将导入 sound 包的三个命名子模块。

如果没有定义 `__all__`，from sound.effects import * 语句不会从包 sound.effects 中导入所有子模块到当前命名空间；

它只确保导入了包 sound.effects （可能运行任何在 `__init__.py` 中的初始化代码），然后导入包中定义的任何名称。

这包括 `__init__.py` 定义的任何名称（以及显式加载的子模块）。它还包括由之前的 import 语句显式加载的包的任何子模块。

思考下面的代码:

```py
import sound.effects.echo
import sound.effects.surround
from sound.effects import *
```

在这个例子中， echo 和 surround 模块是在执行 from...import 语句时导入到当前命名空间中的，因为它们定义在 sound.effects 包中。

（这在定义了 `__all__` 时也有效。）

虽然某些模块被设计为在使用 import * 时只导出遵循某些模式的名称，但在生产代码中它仍然被认为是不好的做法。

请记住，使用 from Package import specific_submodule 没有任何问题！

实际上，除非导入模块需要使用来自不同包的同名子模块，否则这是推荐的表示法。


# 子包参考

## 绝对导入

当包被构造成子包时（与示例中的 sound 包一样），你可以使用绝对导入来引用兄弟包的子模块。

例如，如果模块 sound.filters.vocoder 需要在 sound.effects 包中使用 echo 模块，它可以使用 from sound.effects import echo 。

## 相对导入

你还可以使用import语句的 from module import name 形式编写相对导入。

这些导入使用前导点来指示相对导入中涉及的当前包和父包。

例如，从 surround 模块，你可以使用:

```python
from . import echo
from .. import formats
from ..filters import equalizer
```

请注意，相对导入是基于当前模块的名称进行导入的。

由于主模块的名称总是 `"__main__"`，因此**用作Python应用程序主模块的模块必须始终使用绝对导入。**

## 多个目录中的包

包支持另一个特殊属性， `__path__`。

它被初始化为一个列表，其中包含在执行该文件中的代码之前保存包的文件 `__init__.py` 的目录的名称。

这个变量可以修改；这样做会影响将来对包中包含的模块和子包的搜索。

虽然通常不需要此功能，但它可用于扩展程序包中的模块集。

# java 的对比

## 包的目的

在设计目的上，二者是一致的。都是为了避免不同的包下相同的模块冲突。

# 参考资料

https://docs.python.org/zh-cn/3/tutorial/modules.html

* any list
{:toc}