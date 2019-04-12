---
layout: post
title: Python-22-style guide 文件编写规范
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, style-guide, sh]
published: true
---

# 编码规范的重要性

比起编码，我们大部分的时间都应该是在阅读自己或者他人编写的代码。

所以编写更利于别人阅读的代码，是一件非常重要的事情。

以下代码中 Yes 表示推荐，No 表示不推荐。

# 编码类规范

## 访问控制

在Python中, 对于琐碎又不太重要的访问函数, 你应该直接使用公有变量来取代它们, 这样可以避免额外的函数调用开销. 当添加更多功能时, 你可以用属性(property)来保持语法的一致性.

(译者注: 重视封装的面向对象程序员看到这个可能会很反感, 因为他们一直被教育: 所有成员变量都必须是私有的! 其实, 那真的是有点麻烦啊. 试着去接受Pythonic哲学吧)

另一方面, 如果访问更复杂, 或者变量的访问开销很显著, 那么你应该使用像 get_foo() 和 set_foo() 这样的函数调用. 如果之前的代码行为允许通过属性(property)访问 , 那么就不要将新的访问函数与属性绑定. 这样, 任何试图通过老方法访问变量的代码就没法运行, 使用者也就会意识到复杂性发生了变化.


## 命名

module_name, package_name, ClassName, method_name, 

ExceptionName, function_name, GLOBAL_VAR_NAME, 

instance_var_name, function_parameter_name, local_var_name.

ps: 其实就是出了类名，异常名，全局变量名称，其他全部使用小写+下划线的形式。

### 应该避免的名称


1. 单字符名称, 除了计数器和迭代器.

2. 包/模块名中的连字符(-)

3. 双下划线开头并结尾的名称(Python保留, 例如`__init__`)

### 命名约定

所谓"内部(Internal)"表示仅模块内可用, 或者, 在类内是保护或私有的.

用单下划线(`_`)开头表示模块变量或函数是protected的(使用import * from时不会包含).

用双下划线(`__`)开头的实例变量或方法表示类内私有.

将相关的类和顶级函数放在同一个模块里. 不像Java, 没必要限制一个类一个模块.

对类名使用大写字母开头的单词(如CapWords, 即Pascal风格), 但是模块名应该用小写加下划线的方式(如lower_with_under.py). 

尽管已经有很多现存的模块使用类似于CapWords.py这样的命名, 但现在已经不鼓励这样做, 因为如果模块名碰巧和类名一致, 这会让人困扰.


## 类

如果一个类不继承自其它类, 就显式的从object继承. 嵌套类也一样.

```py
Yes: class SampleClass(object):
         pass


     class OuterClass(object):

         class InnerClass(object):
             pass


     class ChildClass(ParentClass):
         """Explicitly inherits from another class already."""
```

## 分号

不要在行尾加分号, 也不要用分号将两条命令放在同一行。

## 行长度

每行不超过80个字符

### 以下情况除外：

1. 长的导入模块语句

2. 注释里的URL

3. 不要使用反斜杠连接行。

Python会将圆括号, 中括号和花括号中的行隐式的连接起来 , 你可以利用这个特点. 如果需要, 你可以在表达式外围增加一对额外的圆括号。

# 注释类规范

## 文档字符串

Python有一种独一无二的的注释方式: 使用文档字符串. 文档字符串是包, 模块, 类或函数里的第一个语句. 

这些字符串可以通过对象的 `__doc__` 成员被自动提取, 并且被pydoc所用. (你可以在你的模块上运行pydoc试一把, 看看它长什么样). 

我们对文档字符串的惯例是使用三重双引号"""( PEP-257 ). 

一个文档字符串应该这样组织: 首先是一行以句号, 问号或惊叹号结尾的概述(或者该文档字符串单纯只有一行). 接着是一个空行. 接着是文档字符串剩下的部分, 它应该与文档字符串的第一行的第一个引号对齐. 

## 模块

每个文件应该包含一个许可样板. 根据项目使用的许可(例如, Apache 2.0, BSD, LGPL, GPL), 选择合适的样板.

## 函数和方法

下文所指的函数,包括函数, 方法, 以及生成器.

一个函数必须要有文档字符串, 除非它满足以下条件:

1. 外部不可见

2. 非常短小

3. 简单明了

文档字符串应该包含函数做什么, 以及输入和输出的详细描述. 通常, 不应该描述"怎么做", 除非是一些复杂的算法. 文档字符串应该提供足够的信息, 当别人编写代码调用该函数时, 他不需要看一行代码, 只要看文档字符串就可以了. 对于复杂的代码, 在代码旁边加注释会比使用文档字符串更有意义.

关于函数的几个方面应该在特定的小节中进行描述记录， 这几个方面如下文所述. 每节应该以一个标题行开始. 标题行以冒号结尾. 除标题行外, 节的其他内容应被缩进2个空格.

### 入參

列出每个参数的名字, 并在名字后使用一个冒号和一个空格, 分隔对该参数的描述.如果描述太长超过了单行80字符,使用2或者4个空格的悬挂缩进(与文件其他部分保持一致). 描述应该包括所需的类型和含义. 如果一个函数接受*foo(可变长度参数列表)或者**bar (任意关键字参数), 应该详细列出*foo和**bar.

### 返回值

 (或者 Yields: 用于生成器)
描述返回值的类型和语义. 如果函数返回None, 这一部分可以省略.

### 异常

列出与接口有关的所有异常.

## 类

类应该在其定义下有一个用于描述该类的文档字符串. 如果你的类有公共属性(Attributes), 那么文档中应该有一个属性(Attributes)段. 并且应该遵守和函数参数相同的格式.

## 块注释和行注释

最需要写注释的是代码中那些技巧性的部分. 如果你在下次代码审查的时候必须解释一下, 那么你应该现在就给它写注释. 

对于复杂的操作, 应该在其操作开始前写上若干行注释. 对于不是一目了然的代码, 应在其行尾添加注释.

```py
# We use a weighted dictionary search to find out where i is in
# the array.  We extrapolate position based on the largest num
# in the array and the array size and then do binary search to
# get the exact number.

if i & (i-1) == 0:        # true iff i is a power of 2
```

为了提高可读性, 注释应该至少离开代码2个空格.

另一方面, 绝不要描述代码. 假设阅读代码的人比你更懂Python, 他只是不知道你的代码要做什么.

```py
# BAD COMMENT: Now go through the b array and make sure whenever i occurs
# the next element is i+1
```

## TODO注释

为临时代码使用TODO注释, 它是一种短期解决方案. 不算完美, 但够好了.

TODO注释应该在所有开头处包含"TODO"字符串, 紧跟着是用括号括起来的你的名字, email地址或其它标识符. 然后是一个可选的冒号. 接着必须有一行注释, 解释要做什么. 主要目的是为了有一个统一的TODO格式, 这样添加注释的人就可以搜索到(并可以按需提供更多细节). 写了TODO注释并不保证写的人会亲自解决问题. 当你写了一个TODO, 请注上你的名字.

```
# TODO(kl@gmail.com): Use a "*" here for string repetition.
# TODO(Zeke) Change this to use relations.
```

如果你的TODO是"将来做某事"的形式, 那么请确保你包含了一个指定的日期("2009年11月解决")或者一个特定的事件("等到所有的客户都可以处理XML请求就移除这些代码").

ps: idea 这种工具还可以统一发现 TODO。


# Main

## Shebang

大部分.py文件不必以#!作为文件的开始. 根据 PEP-394 , 程序的main文件应该以 `#!/usr/bin/python2` 或者 `#!/usr/bin/python3` 开始.

(译者注: 在计算机科学中, Shebang (也称为Hashbang)是一个由井号和叹号构成的字符串行(#!), 其出现在文本文件的第一行的前两个字符. 在文件中存在Shebang的情况下, 类Unix操作系统的程序载入器会分析Shebang后的内容, 将这些内容作为解释器指令, 并调用该指令, 并将载有Shebang的文件路径作为该解释器的参数. 例如, 以指令#!/bin/sh开头的文件在执行时会实际调用/bin/sh程序.)

`#!` 先用于帮助内核找到Python解释器, 但是在导入模块时, 将会被忽略. 因此只有被直接执行的文件中才有必要加入`#!`.

## 一种副作用. 主功能应该放在一个main()函数中.

在Python中, pydoc以及单元测试要求模块必须是可导入的. 

你的代码应该在执行主程序前总是检查 `if __name__ == '__main__'` , 这样当模块被导入时主程序就不会被执行.

```py
def main():
      ...

if __name__ == '__main__':
    main()
```

所有的顶级代码在模块导入时都会被执行. 要小心不要去调用函数, 创建对象, 或者执行那些不应该在使用pydoc时执行的操作.

# 参考资料

- 英文

[google pyguide](https://google.github.io/styleguide/pyguide.html)

[python PEP8](https://legacy.python.org/dev/peps/pep-0008/)

- 中文

[google python 编程规范](http://www.runoob.com/w3cnote/google-python-styleguide.html)

* any list
{:toc}