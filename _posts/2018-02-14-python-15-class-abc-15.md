---
layout: post
title: Python-14-class ABC 抽象类学习
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, class, sh]
published: true
---

# ABC 的作用

该模块提供了在 Python 中定义 抽象基类 (ABC) 的组件，在 PEP 3119 中已有概述。

查看 PEP 文档了解为什么需要在 Python 中增加这个模块。（也可查看 PEP 3141 以及 numbers 模块了解基于 ABC 的数字类型继承关系。）

collections 模块中有一些派生自 ABC 的具体类；当然这些类还可以进一步被派生。此外，collections.abc 子模块中有一些 ABC 可被用于测试一个类或实例是否提供特定的接口，例如它是否可哈希或它是否为映射等。

该模块提供了一个元类 ABCMeta，可以用来定义抽象类，另外还提供一个工具类 ABC，可以用它以继承的方式定义抽象基类。

# class abc.ABC 功能简介

一个使用 ABCMeta 作为元类的工具类。

抽象基类可以通过从 ABC 派生来简单地创建，这就避免了在某些情况下会令人混淆的元类用法，例如：

```py
from abc import ABC

class MyABC(ABC):
    pass
```

注意 ABC 的类型仍然是 ABCMeta，因此继承 ABC 仍然需要关注元类使用中的注意事项，比如可能会导致元类冲突的多重继承。

当然你也可以直接使用 ABCMeta 作为元类来定义抽象基类，例如：

```py
from abc import ABCMeta

class MyABC(metaclass=ABCMeta):
    pass
```

下面罗列一些常见的功能特性

## class abc.ABCMeta

用于定义抽象基类（ABC）的元类。

使用该元类以创建抽象基类。抽象基类可以像 mix-in 类一样直接被子类继承。你也可以将不相关的具体类（包括内建类）和抽象基类注册为“抽象子类” —— 这些类以及它们的子类会被内建函数 issubclass() 识别为对应的抽象基类的子类，但是该抽象基类不会出现在其 MRO（Method Resolution Order，方法解析顺序）中，抽象基类中实现的方法也不可调用（即使通过 super() 调用也不行）。

使用 ABCMeta 作为元类创建的类含有如下方法：

### register(subclass)

将“子类”注册为该抽象基类的“抽象子类”，

例如：

```py
from abc import ABC

class MyABC(ABC):
    pass

MyABC.register(tuple)

assert issubclass(tuple, MyABC)
assert isinstance((), MyABC)
```

在 3.3 版更改: 返回注册的子类，使其能够作为类装饰器。

在 3.4 版更改: 你可以使用 get_cache_token() 函数来检测对 register() 的调用。

你也可以在虚基类中重载这个方法。

### __subclasshook__(subclass)

（必须定义为类方法。）

检查 subclass 是否是该抽象基类的子类。也就是说对于那些你希望定义为该抽象基类的子类的类，你不用对每个类都调用 register() 方法了，而是可以直接自定义 issubclass 的行为。

（这个类方法是在抽象基类的 `__subclasscheck__()` 方法中调用的。）

该方法必须返回 True, False 或是 NotImplemented。如果返回 True，subclass 就会被认为是这个抽象基类的子类。如果返回 False，无论正常情况是否应该认为是其子类，统一视为不是。如果返回 NotImplemented，子类检查会按照正常机制继续执行。

为了对这些概念做一演示，请看以下定义 ABC 的示例：

```py
class Foo:
    def __getitem__(self, index):
        ...
    def __len__(self):
        ...
    def get_iterator(self):
        return iter(self)

class MyIterable(ABC):

    @abstractmethod
    def __iter__(self):
        while False:
            yield None

    def get_iterator(self):
        return self.__iter__()

    @classmethod
    def __subclasshook__(cls, C):
        if cls is MyIterable:
            if any("__iter__" in B.__dict__ for B in C.__mro__):
                return True
        return NotImplemented

MyIterable.register(Foo)
```

ABC MyIterable 定义了标准的迭代方法 `__iter__()` 作为一个抽象方法。

这里给出的实现仍可在子类中被调用。get_iterator() 方法也是 MyIterable 抽象基类的一部分，但它并非必须被非抽象派生类所重载。

此外，abc 模块还提供了这些装饰器：

## @abc.abstractmethod

用于声明抽象方法的装饰器。

使用此装饰器要求类的元类是 ABCMeta 或是从该类派生。一个具有派生自 ABCMeta 的元类的类不可以被实例化，除非它全部的抽象方法和特征属性均已被重载。抽象方法可通过任何普通的“super”调用机制来调用。 

abstractmethod() 可被用于声明特性属性和描述器的抽象方法。

```py
class C(ABC):
    @abstractmethod
    def my_abstract_method(self, ...):
        ...
    @classmethod
    @abstractmethod
    def my_abstract_classmethod(cls, ...):
        ...
    @staticmethod
    @abstractmethod
    def my_abstract_staticmethod(...):
        ...

    @property
    @abstractmethod
    def my_abstract_property(self):
        ...
    @my_abstract_property.setter
    @abstractmethod
    def my_abstract_property(self, val):
        ...

    @abstractmethod
    def _get_x(self):
        ...
    @abstractmethod
    def _set_x(self, val):
        ...
    x = property(_get_x, _set_x)
```

为了正确地与抽象基类机制进行互操作，描述符必须使用 `__isabstractmethod__` 将其自身标识为抽象。 

通常，如果用于组成描述符的任何方法都是抽象的，则此属性应为True。 

例如，Python的内置属性相当于：

```py
class Descriptor:
    ...
    @property
    def __isabstractmethod__(self):
        return any(getattr(f, '__isabstractmethod__', False) for
                   f in (self._fget, self._fset, self._fdel))
```


> 注意

与Java抽象方法不同，这些抽象方法可能具有实现。 

可以通过覆盖它的类的 super() 机制调用此实现。 

这可以作为使用协作多重继承的框架中的超级调用的终点。

# Python2/3 兼容问题

为解决兼容性问题，我们需要引入six模块

## 通用做法。

`@six.add_metaclass(MetaClass)` 的作用是在不同版本的Python之间提供一个优雅的声明类的metaclass的手段，事实上不用它也可以，只是使用了它代码更为整洁明了。

```py
import six

@six.add_metaclass(Meta)
class MyClass(object):
    pass
```

### 在Python 3 等价于

```py
import six
class MyClass(object, metaclass = Meta):
    pass
```   

### 在Python 2.x (x >= 6)中等价于

```py
import six
class MyClass(object):
    __metaclass__ = Meta
    pass
```

## 使用装饰器

```py
import six

class MyClass(object):
    pass
MyClass = six.add_metaclass(Meta)(MyClass)
```

这里也能看出来装饰器就是个方法包装而已。


# 个人感受

1. python 2/3 不兼容带来了很多问题，但是初步学习可以不用关心。

2. 感觉这个类似于 java 中的注解。

# 参考资料

- 官方

[abc --- 抽象基类](https://docs.python.org/zh-cn/3/library/abc.html?highlight=abc#module-abc)

[pep-3119-为什么需要ABC 模块](https://www.python.org/dev/peps/pep-3119/)

[Abstract Base Classes](https://docspy3zh.readthedocs.io/en/latest/library/abc.html)

- 比较好的博客

[Python装饰器、metaclass、abc模块学习笔记](https://www.cnblogs.com/Security-Darren/p/4094959.html)

这篇文章参考的文章挺好的。值得一读。

[Python之abc模块](https://blog.csdn.net/haiyanggeng/article/details/81983627)

- 兼容性问题

[Python抽象类（abc模块）](http://www.imooc.com/article/74245)

* any list
{:toc}