---
layout: post
title: SymPy 是一个用于符号数学计算的Python库
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, cli, lang, sh]
published: true
---

# 拓展阅读

> [junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

> [基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)

# 拓展阅读

[自动生成测试用例](https://github.com/houbb/evosuite-learn)

# SymPy

查看 [AUTHORS](AUTHORS) 文件以获取作者列表。

许多其他人也在 SymPy 邮件列表上提供帮助，报告错误，协助组织 SymPy 参与 Google Summer of Code、Google Highly Open Participation Contest、Google Code-In，并写作和撰写 SymPy 的博客……

许可证：除非另有说明，否则新的 BSD 许可证（详见 [LICENSE](LICENSE) 文件）覆盖 sympy 存储库中的所有文件。

我们的邮件列表位于 <https://groups.google.com/forum/?fromgroups#!forum/sympy>。

我们在 [Gitter](https://gitter.im/sympy/sympy) 上有一个社区聊天室。随时在那里问我们任何问题。我们有一个非常热情和乐于助人的社区。

## 下载

推荐的安装方法是通过 Anaconda，<https://www.anaconda.com/products/distribution>

你还可以从 <https://pypi.python.org/pypi/sympy/> 获取 SymPy 的最新版本

要获取 git 版本，请执行：

```shell
$ git clone https://github.com/sympy/sympy.git
```

其他选项（tarballs、debs 等）请参见 <https://docs.sympy.org/dev/install.html>。

## 文档和使用

有关安装和构建文档的详细说明，请参阅 [SymPy 文档样式指南](https://docs.sympy.org/dev/documentation-style-guide.html)。

所有内容都在：<https://docs.sympy.org/>

你可以在上述站点的本地副本中生成所有内容：

```shell
$ cd doc
$ make html
```

然后文档将在 <span class="title-ref">\_build/html</span> 中。如果你不想阅读那里，这是一个简短的用法：

从此目录开始 Python 并执行：

```python
>>> from sympy import Symbol, cos
>>> x = Symbol('x')
>>> e = 1/cos(x)
>>> print(e.series(x, 0, 10))
1 + x**2/2 + 5*x**4/24 + 61*x**6/720 + 277*x**8/8064 + O(x**10)
```

SymPy 还带有一个控制台，它是对经典 Python 控制台（或在可用时使用 IPython）的简单包装，加载 SymPy 命名空间并为您执行一些常见命令。

要启动它，请执行：

```shell
$ bin/isympy
```

从此目录开始，如果 SymPy 没有安装，或者简单地执行：

```shell
$ isympy
```

如果 SymPy 已安装。

## 安装

SymPy 对 [mpmath](http://mpmath.org/) 库有强制依赖（版本 \>= 0.19）。你应该首先安装它，请参考 mpmath 安装指南：

<https://github.com/fredrik-johansson/mpmath#1-download--installation>

要使用 PyPI 安装 SymPy，请运行以下命令：

```shell
$ pip install sympy
```

要使用 Anaconda 安装 SymPy，请运行以下命令：

```shell
$ conda install -c anaconda sympy
```

要从 GitHub 源安装 SymPy，首先使用 `git` 克隆 SymPy：

```shell
$ git clone https://github.com/sympy/sympy.git
```

然后，在你克隆的 `sympy` 存储库中，只需运行：

```shell
$ pip install .
```

有关更多信息，请参见 <https://docs.sympy.org/dev/install.html>。

## 贡献

我们欢迎任何人的贡献，即使你是开源新手。请阅读我们的 [贡献简介](https://docs.sympy.org/dev/contributing/introduction-to-contributing.html) 页面和 [SymPy 文档样式指南](https://docs.sympy.org/dev/documentation-style-guide.html)。如果你是新手并正在寻找贡献的途径，一个好的起点是查看标记为 [Easy to Fix](https://github.com/sympy/sympy/issues?q=is%3Aopen+is%3Aissue+label%3A%22Easy+to+Fix%22) 的问题。

请注意，该项目的所有参与者都应遵守我们的行为准则。通过参与此项目，您同意遵守其条款。请参阅 [CODE\_OF\_CONDUCT.md](CODE_OF_CONDUCT.md)。

## 测试

要执行所有测试，请运行：

```shell
$./setup.py test
```

在当前目录中。

对于更精细的测试或 doctests 运行，使用 `bin/test` 或分别使用 `bin/doctest`。主分支由 GitHub Actions 自动测试。

要测试拉取请求，请使用 [sympy-bot](https://github.com/sympy/sympy-bot)。

## 重新生成实验性 <span class="title-ref">LaTeX</span> 解析器/词法分析器

解析器和词法分析器是使用 [ANTLR4](http://antlr4.org) 工具链在 `sympy/parsing/latex/_antlr` 中生成的，并检入到存储库中。目前，大多数用户应该不需要重新生成这些文件，但如果你计划在此功能上工作，你将需要 `antlr4` 命令行工具（并确保它在你的 `PATH` 中）。获取它的一种方法是：

```shell
$ conda install -c conda-forge antlr=4.11.1
```

或者，按照 ANTLR 网站上的说明下载 `antlr-4.11.1-complete.jar`。然后按照说明导出 `CLASSPATH`，并按照下面的方式将 `antlr4` 创建为可执行文件：

```bash
#!/bin/bash
java -jar /usr/local/lib/antlr-4.11.1-complete.jar "$@"
```

在对 `sympy/parsing/latex/LaTeX.g4`

 进行更改后，运行：

```shell
$ ./setup.py antlr
```

## 清理

要清理所有内容（从而获得与存储库中相同的树）：

```shell
$ git clean -Xdf
```

这将清除 `.gitignore` 忽略的所有内容，并：

```shell
$ git clean -df
```

以清除所有未跟踪的文件。你可以使用以下 git 命令还原最近的更改：

```shell
$ git reset --hard
```

警告：上述命令将清除可能已经进行的更改，你将永久失去它们。在执行任何上述操作之前，请使用 `git status`、`git diff`、`git clean -Xn` 和 `git clean -n` 进行检查。

## 错误

我们的问题跟踪器位于 <https://github.com/sympy/sympy/issues>。请报告您发现的任何错误。或者，更好的是，在 GitHub 上 fork 存储库并创建拉取请求。我们欢迎所有的更改，无论大小，我们将帮助您创建拉取请求，如果您对 git 不熟悉的话（在我们的邮件列表或 Gitter Channel 上询问）。

如果您有任何其他问题，您可以在 Stack Overflow 上使用 [sympy](https://stackoverflow.com/questions/tagged/sympy) 标签找到答案。

## 简要历史

SymPy 由 Ondřej Čertík 在 2005 年创建，他在夏季写了一些代码，然后在 2006 年夏季写了更多的代码。在 2007 年 2 月，Fabian Pedregosa 加入了项目，帮助修复了许多问题，贡献了文档，并使其再次焕发生机。在 2007 年夏季，5 位学生（Mateusz Paprocki、Brian Jorgensen、Jason Gedge、Robert Schwarz 和 Chris Wu）作为 Google Summer of Code 的一部分，极大地改进了 SymPy。Pearu Peterson 在 2007 年夏季加入了开发，并通过从头开始重写核心使 SymPy 更加竞争力，使其速度提高了 10 到 100 倍。Jurjen N.E. Bos 贡献了漂亮的打印和其他补丁。Fredrik Johansson 编写了 mpmath 并贡献了很多补丁。

SymPy 自 2007 年以来每年都参与 Google Summer of Code。您可以在 <https://github.com/sympy/sympy/wiki#google-summer-of-code> 查看完整的详细信息。每一年都通过跨越式的进步改善了 SymPy。SymPy 大部分的发展都来自 Google Summer of Code 学生。

2011 年，Ondřej Čertík 辞去了首席开发人员的职务，由 Aaron Meurer 接替，他也是 Google Summer of Code 学生。Ondřej Čertík 仍然活跃在社区中，但因为工作和家庭忙碌，无法担任主导开发的角色。

此后，更多的人加入了开发，一些人也离开了。您可以在 doc/src/aboutus.rst 中查看完整列表，或在线查看：

<https://docs.sympy.org/dev/aboutus.html#sympy-development-team>

git 历史可以追溯到 2007 年，当时开发从 svn 切换到 hg。要查看该点之前的历史，请查看 <https://github.com/sympy/sympy-old>。

您可以使用 git 查看最大的开发人员。命令：

```shell
$ git shortlog -ns
```

将显示每个开发人员按提交项目排序。命令：

```shell
$ git shortlog -ns --since="1 year"
```

将显示最近一年内的前开发人员。

## 引用

在出版物中引用 SymPy，请使用以下格式：

> Meurer A, Smith CP, Paprocki M, Čertík O, Kirpichev SB, Rocklin M,
> Kumar A, Ivanov S, Moore JK, Singh S, Rathnayake T, Vig S, Granger BE,
> Muller RP, Bonazzi F, Gupta H, Vats S, Johansson F, Pedregosa F, Curry
> MJ, Terrel AR, Roučka Š, Saboo A, Fernando I, Kulal S, Cimrman R,
> Scopatz A. (2017) SymPy: symbolic computing in Python. *PeerJ Computer
> Science* 3:e103 <https://doi.org/10.7717/peerj-cs.103>

LaTeX 用户的 BibTeX 条目如下：

``` bibtex
@article{10.7717/peerj-cs.103,
 title = {SymPy: symbolic computing in Python},
 author = {Meurer, Aaron and Smith, Christopher P. and Paprocki, Mateusz and \v{C}ert\'{i}k, Ond\v{r}ej and Kirpichev, Sergey B. and Rocklin, Matthew and Kumar, Amit and Ivanov, Sergiu and Moore, Jason K. and Singh, Sartaj and Rathnayake, Thilina and Vig, Sean and Granger, Brian E. and Muller, Richard P. and Bonazzi, Francesco and Gupta, Harsh and Vats, Shivam and Johansson, Fredrik and Pedregosa, Fabian and Curry, Matthew J. and Terrel, Andy R. and Rou\v{c}ka, \v{S}t\v{e}p\'{a}n and Saboo, Ashutosh and Fernando, Isuru and Kulal, Sumith and Cimrman, Robert and Scopatz, Anthony},
 year = 2017,
 month = Jan,
 keywords = {Python, Computer algebra system, Symbolics},
 abstract = {
            SymPy is an open-source computer algebra system written in pure Python. It is built with a focus on extensibility and ease of use, through both interactive and programmatic applications. These characteristics have led SymPy to become a popular symbolic library for the scientific Python ecosystem. This paper presents the architecture of SymPy, a description of its features, and a discussion of select submodules. The supplementary material provides additional examples and further outlines details of the architecture and features of SymPy.
         },
 volume = 3,
 pages = {e103},
 journal = {PeerJ Computer Science},
 issn = {2376-5992},
 url = {https://doi.org/10.7717/peerj-cs.103},
 doi = {10.7717/peerj-cs.103}
}
```

SymPy 使用 BSD 许可证，因此您可以根据需要自由使用它，无论是用于学术、商业、创建分支或衍生产品，只要在重新分发时复制 BSD 语句即可（有关详细信息，请参阅 LICENSE 文件）。尽管 SymPy 许可证不要求这样做，但如果方便的话，请在使用 SymPy 时引用它，并考虑将所有更改贡献回来，以便我们可以合并它，最终我们都将受益。

# chat

## 详细介绍一下 SymPy

SymPy（Symbolic Python）是一个用于符号数学计算的Python库。它允许你进行符号数学运算，而不仅仅是数值计算。符号计算是一种处理符号表达式和代数运算的方法，而不是直接计算数值结果。SymPy提供了一套强大的工具，用于处理代数表达式、求解方程、微积分、线性代数等数学任务。

以下是SymPy的一些主要特性和功能：

1. **符号表达式：** SymPy允许你创建符号变量，这些变量可以用于构建符号表达式。这使得你可以进行代数运算而不需要具体的数值。

    ```python
    from sympy import symbols

    x, y = symbols('x y')
    expr = x + 2*y
    ```

2. **代数运算：** SymPy支持基本的代数运算，如加法、减法、乘法、除法等。

    ```python
    expr = x**2 + 2*x + 1
    expanded_expr = expr.expand()
    ```

3. **方程求解：** SymPy可以用于求解方程和方程组。它提供了`solve`函数，可以解决各种类型的代数方程。

    ```python
    from sympy import solve

    equation = x**2 - 4
    solutions = solve(equation, x)
    ```

4. **微积分：** SymPy支持微积分运算，包括求导和积分。

    ```python
    from sympy import diff, integrate

    expr = x**2
    derivative = diff(expr, x)
    integral = integrate(expr, x)
    ```

5. **线性代数：** SymPy包含一些线性代数工具，如矩阵操作、特征值、特征向量等。

    ```python
    from sympy import Matrix

    A = Matrix([[1, 2], [3, 4]])
    eigenvalues = A.eigenvals()
    ```

6. **数学函数：** SymPy提供了许多数学函数的符号表达式，例如三角函数、指数函数、对数函数等。

    ```python
    from sympy import sin, exp, log

    expr = sin(x) + exp(x) + log(x)
    ```

7. **图形化输出：** SymPy支持将符号表达式输出为LaTeX格式，从而方便用于文档撰写或演示。

    ```python
    from sympy import latex

    latex_code = latex(expr)
    ```

SymPy是一个功能强大且灵活的库，适用于需要进行符号数学计算的科学计算、工程和数学建模任务。

它是开源的，可以通过Python的包管理器（如pip）安装。



# 参考资料

https://github.com/EvoSuite/evosuite

https://www.evosuite.org/documentation/maven-plugin/

https://randoop.github.io/randoop/manual/index.html

* any list
{:toc}