---
layout: post
title:  Python v3.12.3 学习-02-Using the Python Interpreter 使用Python解释器
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---

**2. 使用Python解释器**

**2.1. 调用解释器**

Python解释器通常安装在`/usr/local/bin/python3.12`这样的位置。将`/usr/local/bin`添加到你的Unix shell的搜索路径中，可以通过输入以下命令来启动它：

```bash
python3.12
```

在Windows机器上，如果你从Microsoft Store安装了Python，`python3.12`命令将可用。如果你安装了`py.exe`启动器，你可以使用`py`命令。参见**附录：设置环境变量**以了解其他启动Python的方法。

输入文件结束符（Unix上的`Control-D`，Windows上的`Control-Z`）将使解释器以零的退出状态退出。如果这不起作用，你可以通过输入以下命令退出解释器：

```python
quit()
```

解释器的行编辑功能包括交互式编辑、历史替换和代码完成。如果你的系统支持GNU Readline库，可以通过输入`Control-P`来检查命令行编辑是否支持。如果哔哔哔作响，你有命令行编辑。如果没有发生任何事情或`^P`被回显，命令行编辑不可用。

解释器的工作方式类似于Unix shell：当使用标准输入连接到tty设备时，它交互式地读取和执行命令；当使用文件名参数或文件作为标准输入时，它从该文件读取并执行脚本。

另一种启动解释器的方法是使用`python -c command [arg] ...`，它执行命令中的语句，类似于shell的`-c`选项。

有些Python模块也可以作为脚本使用，可以使用`python -m module [arg] ...`来调用。

**2.1.1. 参数传递**

解释器知道脚本名和附加参数后，它们被转换为一个字符串列表并分配给`sys`模块中的`argv`变量。你可以通过执行`import sys`来访问这个列表。

**2.1.2. 交互模式**

当从tty读取命令时，解释器处于交互模式。在此模式下，它使用主提示符`>>>`提示下一个命令；对于继续行，它使用次要提示符`...`。

**2.2. 解释器及其环境**

**2.2.1. 源代码编码**

默认情况下，Python源文件被视为以UTF-8编码。为了声明除默认之外的编码，应在文件的第一行添加一个特殊的注释行：

```python
# -*- coding: encoding -*-
```

其中`encoding`是Python支持的有效编解码器之一。例如，要声明使用Windows-1252编码，你的源代码文件的第一行应为：

```python
# -*- coding: cp1252 -*-
```

例外情况是当源代码以UNIX的“shebang”行开始时。在这种情况下，应在文件的第二行添加编码声明。例如：

```python
#!/usr/bin/env python3
# -*- coding: cp1252 -*-
```

# 参考资料

https://docs.python.org/3.12/tutorial/interpreter.html  

* any list
{:toc}

