---
layout: post
title: Python-46-colorama 颜色
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, cli, lang, sh]
published: true
---

# 颜色-colorama

## 简介

[colorama](https://github.com/tartley/colorama) is simple cross-platform colored terminal text in Python.

## 快速开始

### install

```
pip3 install colorama
```

### 入门例子

```py
>>> from colorama import Fore, Back, Style
>>> print(Fore.RED + 'some red text')
some red text
>>> print(Back.GREEN + 'and with a green background')
and with a green background
>>> print(Style.DIM + 'and in dim text')
and in dim text
>>> print(Style.RESET_ALL)

>>> print('back to normal now')
back to normal now
```

### 或者使用颜色编码指定

```py
print('\033[31m' + 'some red text')
print('\033[30m') # and reset to default color
```

### ANSI 方式

```py
from colorama import init
from termcolor import colored

# use Colorama to make Termcolor work on Windows too
init()

# then use Termcolor for all colored text output
print(colored('Hello, World!', 'green', 'on_red'))
```

Available formatting constants are:

```
Fore: BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE, RESET.
Back: BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE, RESET.
Style: DIM, NORMAL, BRIGHT, RESET_ALL
```

Style.RESET_ALL resets foreground, background, and brightness. Colorama will perform this reset automatically on program exit.

# 参考资料

[Python查询12306余票：漂亮的输出-----prettytable和colorama的使用](https://blog.csdn.net/qq_25343557/article/details/78964228)

https://github.com/dprince/python-prettytable

* any list
{:toc}