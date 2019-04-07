---
layout: post
title: Python-13-class 类的继承
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, class, sh]
published: true
---

# 类的继承

当然，如果不支持继承，语言特性就不值得称为“类”。

## 语法

派生类定义的语法如下所示:

```py
class DerivedClassName(BaseClassName):
    <statement-1>
    .
    .
    .
    <statement-N>
```

名称 BaseClassName 必须定义于包含派生类定义的作用域中。 

### 基类在其他模块

也允许用其他任意表达式代替基类名称所在的位置。 

这有时也可能会用得上，例如，当基类定义在另一个模块中的时候:

```py
class DerivedClassName(modname.BaseClassName):
```

派生类定义的执行过程与基类相同。

当构造类对象时，基类会被记住。 

此信息将被用来解析属性引用：如果请求的属性在类中找不到，搜索将转往基类中进行查找。 

如果基类本身也派生自其他某个类，则此规则将被递归地应用。

派生类的实例化没有任何特殊之处: DerivedClassName() 会创建该类的一个新实例。 

## 方法引用解析方式

方法引用将按以下方式解析：搜索相应的类属性，如有必要将按基类继承链逐步向下查找，如果产生了一个函数对象则方法引用就生效。

派生类可能会重载其基类的方法。 

因为方法在调用同一对象的其他方法时没有特殊权限，调用同一基类中定义的另一方法的基类方法最终可能会调用覆盖它的派生类的方法。 

（对 C++ 程序员的提示：Python 中所有的方法实际上都是 virtual 方法。）

在派生类中的重载方法实际上可能想要扩展而非简单地替换同名的基类方法。 

有一种方式可以简单地直接调用基类方法：即调用 BaseClassName.methodname(self, arguments)。 

有时这对客户端来说也是有用的。 

（请注意仅当此基类可在全局作用域中以 BaseClassName 的名称被访问时方可使用此方式。）

## 内置函数

Python有两个内置函数可被用于继承机制：

使用 isinstance() 来检查一个实例的类型: isinstance(obj, int) 仅会在 `obj.__class__` 为 int 或某个派生自 int 的类时为 True。

使用 issubclass() 来检查类的继承关系: issubclass(bool, int) 为 True，因为 bool 是 int 的子类。 但是，issubclass(float, int) 为 False，因为 float 不是 int 的子类。

# 多重继承

Python也支持多重继承的形式。 具有多个基类的类定义如下所示：

```py
class DerivedClassName(Base1, Base2, Base3):
    <statement-1>
    .
    .
    .
    <statement-N>
```

对于多数应用来说，在最简单的情况下，你可以认为搜索从父类所继承属性的操作是深度优先、从左至右的，当层次结构中存在重叠时不会在同一个类中搜索两次。 

因此，如果某一属性在 DerivedClassName 中未找到，则会到 Base1 中搜索它，然后（递归地）到 Base1 的基类中搜索，如果在那里未找到，再到 Base2 中搜索，依此类推。

真实情况比这个更复杂一些；方法解析顺序会动态改变以支持对 super() 的协同调用。 

这种方式在某些其他多重继承型语言中被称为后续方法调用，它比单继承型语言中的 super 调用更强大。

动态改变顺序是有必要的，因为所有多重继承的情况都会显示出一个或更多的菱形关联（即至少有一个父类可通过多条路径被最底层类所访问）。 

例如，所有类都是继承自 object，因此任何多重继承的情况都提供了一条以上的路径可以通向 object。 

为了确保基类不会被访问一次以上，动态算法会用一种特殊方式将搜索顺序线性化， 保留每个类所指定的从左至右的顺序，只调用每个父类一次，并且保持单调（即一个类可以被子类化而不影响其父类的优先顺序）。 

总而言之，这些特性使得设计具有多重继承的可靠且可扩展的类成为可能。 

要了解更多细节，请参阅 https://www.python.org/download/releases/2.3/mro/。

# 参考资料

https://docs.python.org/zh-cn/3/tutorial/classes.html

* any list
{:toc}