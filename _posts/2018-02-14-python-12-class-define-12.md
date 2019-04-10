---
layout: post
title: Python-12-class 类的定义和使用
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, class, sh]
published: true
---

# 定义语法

和 java 非常类似

```py
class ClassName:
    <statement-1>
    .
    .
    .
    <statement-N>
```

类定义与函数定义 (`def` 语句) 一样必须被执行才会起作用。 

（你可以尝试将类定义放在 if 语句的一个分支或是函数的内部。）

在实践中，类定义内的语句通常都是函数定义，但也允许有其他语句，有时还很有用 --- 我们会稍后再回来说明这个问题。 

在类内部的函数定义通常具有一种特别形式的参数列表，这是方法调用的约定规范所指明的 --- 这个问题也将在稍后再说明。

当进入类定义时，将创建一个新的命名空间，并将其用作局部作用域 --- 因此，所有对局部变量的赋值都是在这个新命名空间之内。 

特别的，函数定义会绑定到这里的新函数名称。

当（从结尾处）正常离开类定义时，将创建一个类对象。 

这基本上是一个包围在类定义所创建命名空间内容周围的包装器；我们将在下一节了解有关类对象的更多信息。 

原始的（在进入类定义之前起作用的）局部作用域将重新生效，类对象将在这里被绑定到类定义头所给出的类名称 (在这个示例中为 ClassName)。

# 类对象

类对象支持两种操作：属性引用和实例化。

## 属性引用

属性引用使用 Python 中所有属性引用所使用的标准语法: obj.name。 

有效的属性名称是类对象被创建时存在于类命名空间中的所有名称。 

因此，如果类定义是这样的:

```py
'''
desc: 定义简单的类
author: binbin.hou
'''
class MyFirstClass:
	'''The is my first simple class'''
	i = 123456
	
	def f(self):
		print("method f() called!")
```

那么 MyFirstClass.i 和 MyFirstClass.f 就是有效的属性引用，将分别返回一个整数和一个函数对象。 

类属性也可以被赋值，因此可以通过赋值来更改 MyFirstClass.i 的值。 

`__doc__` 也是一个有效的属性，将返回所属类的文档字符串: "The is my first simple class"。

## 实例化

类的实例化是使用函数表示法。 

可以想象类对象就是会返回一个新的类实例的不带参数的函数。 

举例来说（假设使用上述的类）:

```py
x = MyFirstClass()
```

创建类的新实例并将此对象分配给局部变量 x。

实例化操作（“调用”类对象）会创建一个空对象。 

## 初始化方法

许多类喜欢创建带有特定初始状态的自定义实例。 

为此类定义可能包含一个名为 `__init__()` 的特殊方法，就像这样:

当一个类定义了 `__init__()` 方法时，类的实例化操作会自动为新创建的类实例发起调用 `__init__()`。 

### 类比 java

类似于 java 中的构造器函数。

### 例子

因此在这个示例中，可以通过以下语句获得一个经初始化的新实例:

```py
'''
desc: 定义简单的类
author: binbin.hou
'''
class MyFirstClass:
	'''The is my first simple class'''
	i = 123456
	
	def __init__(self):
		print('method init() called!')
	
	def f(self):
		print("method f() called!")
```

- 测试日志

```py
>>> import MyFirstClass as my
>>> x = my.MyFirstClass()
method init() called!
>>> x.i
123456
>>> x.f()
method f() called!
>>> x.__doc__
'The is my first simple class'
```

# 实例对象

现在我们可以用实例对象做什么？

实例对象理解的唯一操作是属性引用。

有两种有效的属性名称，数据属性和方法。

## 数据属性

数据属性 对应于 Smalltalk 中的“实例变量”，以及 C++ 中的“数据成员”。 

数据属性不需要声明；像局部变量一样，它们将在第一次被赋值时产生。 

例如，如果 x 是上面创建的 MyFirstClass 的实例，则以下代码段将打印数值 16，且不保留任何追踪信息:

```py
x.counter = 1
while x.counter < 10:
    x.counter = x.counter * 2
print(x.counter)
del x.counter
```

## 方法

另一类实例属性引用称为方法。 

方法是“从属于”对象的函数。 

（在 Python 中，方法这个术语并不是类实例所特有的：其他对象也可以有方法。 

例如，列表对象具有 append, insert, remove, sort 等方法。 

然而，在以下讨论中，我们使用方法一词将专指类实例对象的方法，除非另外显式地说明。）

实例对象的有效方法名称依赖于其所属的类。 

根据定义，一个类中所有是函数对象的属性都是定义了其实例的相应方法。 

因此在我们的示例中，x.f 是有效的方法引用，因为 MyFirstClass.f 是一个函数，而 x.i 不是方法，因为 MyFirstClass.i 不是一个函数。 

但是 x.f 与 MyFirstClass.f 并不是一回事 --- 它是一个方法对象，不是函数对象。

## 方法对象

通常，方法在绑定后立即被调用:

`x.f()`

在 MyFirstClass 示例中，这将打印字符串 'method f() called!'。 

但是，立即调用一个方法并不是必须的: x.f 是一个方法对象，它可以被保存起来以后再调用。 

例如:

```py
xf = x.f
while True:
    xf()
```

将继续打印 'method f() called!'

当一个方法被调用时到底发生了什么？ 

你可能已经注意到上面调用 x.f() 时并没有带参数，虽然 f() 的函数定义指定了一个参数。 

这个参数发生了什么事？ 

当不带参数地调用一个需要参数的函数时 Python 肯定会引发异常 --- 即使参数实际未被使用...

实际上，你可能已经猜到了答案：方法的特殊之处就在于实例对象会作为函数的第一个参数被传入。 

在我们的示例中，调用 x.f() 其实就相当于 MyFirstClass.f(x)。 

总之，调用一个具有 n 个参数的方法就相当于调用再多一个参数的对应函数，这个参数值为方法所属实例对象，位置在其他参数之前。

如果你仍然无法理解方法的运作原理，那么查看实现细节可能会澄清问题。 

当一个实例的非数据属性被引用时，将搜索实例所属的类。 

如果名称表示一个属于函数对象的有效类属性，会通过合并打包（指向）实例对象和函数对象到一个抽象对象中的方式来创建一个方法对象：这个抽象对象就是方法对象。 

当附带参数列表调用方法对象时，将基于实例对象和参数列表构建一个新的参数列表，并使用这个新参数列表调用相应的函数对象。

# 类和实例变量

一般来说，实例变量用于每个实例的唯一数据，而类变量用于类的所有实例共享的属性和方法。

```py
class Dog:

    kind = 'canine'         # class variable shared by all instances

    def __init__(self, name):
        self.name = name    # instance variable unique to each instance

>>> d = Dog('Fido')
>>> e = Dog('Buddy')
>>> d.kind                  # shared by all dogs
'canine'
>>> e.kind                  # shared by all dogs
'canine'
>>> d.name                  # unique to d
'Fido'
>>> e.name                  # unique to e
'Buddy'
```

这个和 java 是一致的，此处不再赘述。

# 补充说明

## 属性和方法的命名

**数据属性会覆盖掉具有相同名称的方法属性**；为了避免会在大型程序中导致难以发现的错误的意外名称冲突，明智的做法是使用某种约定来最小化冲突的发生几率。 

可能的约定包括方法名称使用大写字母，属性名称加上独特的短字符串前缀（或许只加一个下划线），或者是用动词来命名方法，而用名词来命名数据属性。

数据属性可以被方法以及一个对象的普通用户（“客户端”）所引用。 

换句话说，类不能用于实现纯抽象数据类型。 

实际上，在 Python 中没有任何东西能强制隐藏数据 --- 它是完全基于约定的。 

（而在另一方面，用 C 语言编写的 Python 实现则可以完全隐藏实现细节，并在必要时控制对象的访问；此特性可以通过用 C 编写 Python 扩展来使用。）

客户端应当谨慎地使用数据属性 --- 客户端可能通过直接操作数据属性的方式破坏由方法所维护的固定变量。 

请注意客户端可以向一个实例对象添加他们自己的数据属性而不会影响方法的可用性，只要保证避免名称冲突 --- 再次提醒，在此使用命名约定可以省去许多令人头痛的麻烦。

在方法内部引用数据属性（或其他方法！）并没有简便方式。 

我发现这实际上提升了方法的可读性：当浏览一个方法代码时，不会存在混淆局部变量和实例变量的机会。

### 个人感觉

1. python 中的很多东西都是基于约定的，但是也有私有变量（后面会说）。根据迪米特法则，还是应该尽可能暴露最少的信息给外部。

2. 一般这种方法使用大写，属性前面加前缀，在某种程度上都是冗余且不友好的写法，还是要根据 python 编写规范来进行编码。

3. 建议方法和变量的名称不要重复。

## 方法参数 self

方法的第一个参数常常被命名为 self。 

这也不过就是一个约定: self 这一名称在 Python 中绝对没有特殊含义。 

但是要注意，不遵循此约定会使得你的代码对其他 Python 程序员来说缺乏可读性，而且也可以想像一个类浏览器程序的编写可能会依赖于这样的约定。

任何一个作为类属性的函数都为该类的实例定义了一个相应方法。 

函数定义的文本并非必须包含于类定义之内：将一个函数对象赋值给一个局部变量也是可以的。 

例如:

```py
# Function defined outside the class
def f1(self, x, y):
    return min(x, x+y)

class C:
    f = f1

    def g(self):
        return 'hello world'

    h = g
```

现在 f, g 和 h 都是 C 类的引用函数对象的属性，因而它们就都是 C 的实例的方法 --- 其中 h 完全等同于 g。 

但请注意，本示例的做法通常只会令程序的阅读者感到迷惑。

方法可以通过使用 self 参数的方法属性调用其他方法:

```py
class Bag:
    def __init__(self):
        self.data = []

    def add(self, x):
        self.data.append(x)

    def addtwice(self, x):
        self.add(x)
        self.add(x)
```

方法可以通过与普通函数相同的方式引用全局名称。 

与方法相关联的全局作用域就是包含其定义的模块。 （类永远不会被作为全局作用域。） 

虽然我们很少会有充分的理由在方法中使用全局作用域，但全局作用域存在许多合法的使用场景：举个例子，导入到全局作用域的函数和模块可以被方法所使用，在其中定义的函数和类也一样。 

通常，包含该方法的类本身是在全局作用域中定义的，而在下一节中我们将会发现为何方法需要引用其所属类的很好的理由。

每个值都是一个对象，因此具有 类 （也称为 类型），并存储为 `object.__class__`。

### 对比 java

感觉 self 更类似于 java 中的 this 指针。

1. self 这种强制放在首位的方式，导致编码的冗余性。每次都要有这个代码，很麻烦。 

2. 完全依赖于程序员的自觉这一点感觉很不友好，不是每个程序员都这么乖的。

3. self 在 python 中并没有任何的特殊含义。

# 空类

有时会需要使用类似于 Pascal 的“record”或 C 的“struct”这样的数据类型，将一些命名数据项捆绑在一起。 

这种情况适合定义一个空类:

```py
class Employee:
    pass

john = Employee()  # Create an empty employee record

# Fill the fields of the record
john.name = 'John Doe'
john.dept = 'computer lab'
john.salary = 1000
```

一段需要特定抽象数据类型的 Python 代码往往可以被传入一个模拟了该数据类型的方法的类作为替代。 

例如，如果你有一个基于文件对象来格式化某些数据的函数，你可以定义一个带有 read() 和 readline() 方法从字符串缓存获取数据的类，并将其作为参数传入。

实例方法对象也具有属性: `m.__self__` 就是带有 m() 方法的实例对象，而 `m.__func__` 则是该方法所对应的函数对象。

# 私有变量

## Python 是基于约定的

那种仅限从一个对象内部访问的“私有”实例变量在 Python 中并不存在。 

但是，大多数 Python 代码都遵循这样一个约定：带有一个下划线的名称 (例如 _spam) 应该被当作是 API 的非仅供部分 (无论它是函数、方法或是数据成员)。 

这应当被视为一个实现细节，可能不经通知即加以改变。

由于存在对于类私有成员的有效使用场景（例如避免名称与子类所定义的名称相冲突），因此存在对此种机制的有限支持，称为名称改写。 

任何形式为 __spam 的标识符（至少带有两个前缀下划线，至多一个后缀下划线）的文本将被替换为 _classname__spam，其中 classname 为去除了前缀下划线的当前类名称。 这种改写不考虑标识符的句法位置，只要它出现在类定义内部就会进行。

名称改写有助于让子类重载方法而不破坏类内方法调用。

## 私有方法

私有方法也是同样的道理，按照 `__method_name` 作为 例子。

## 例子

例如:

```py
class Mapping:
    def __init__(self, iterable):
        self.items_list = []
        self.__update(iterable)

    def update(self, iterable):
        for item in iterable:
            self.items_list.append(item)

    __update = update   # private copy of original update() method

class MappingSubclass(Mapping):
    def update(self, keys, values):
        # provides new signature for update()
        # but does not break __init__()
        for item in zip(keys, values):
            self.items_list.append(item)
```

上面的示例即使在 MappingSubclass 引入了一个 __update 标识符的情况下也不会出错，因为它会在 Mapping 类中被替换为 _Mapping__update 而在 MappingSubclass 类中被替换为 _MappingSubclass__update。

请注意，改写规则的设计主要是为了避免意外冲突；访问或修改被视为私有的变量仍然是可能的。

这在特殊情况下甚至会很有用，例如在调试器中。

请注意传递给 exec() 或 eval() 的代码不会将发起调用类的类名视作当前类；这类似于 global 语句的效果，因此这种效果仅限于同时经过字节码编译的代码。 

同样的限制也适用于 getattr(), setattr() 和 delattr()，以及对于 `__dict__` 的直接引用。

# 参考资料

https://docs.python.org/zh-cn/3/tutorial/classes.html

* any list
{:toc}