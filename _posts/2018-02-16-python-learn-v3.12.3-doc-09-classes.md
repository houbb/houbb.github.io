---
layout: post
title:  Python v3.12.3 学习-09-classes 类
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---


### 9. 类

类提供了一种将数据和功能捆绑在一起的方式。创建一个新类会生成一个新类型的对象，从而允许创建该类型的新实例。每个类实例可以附加属性以维护其状态。类实例还可以有方法（由其类定义），用于修改其状态。

与其他编程语言相比，Python的类机制在语法和语义上添加了最少的新内容。它是C++和Modula-3中找到的类机制的混合体。Python类提供了面向对象编程的所有标准功能：类继承机制允许多个基类，派生类可以覆盖其基类或类的任何方法，方法可以调用具有相同名称的基类的方法。对象可以包含任意数量和类型的数据。与模块一样，类参与Python的动态性：它们在运行时创建，创建后还可以进一步修改。

在C++术语中，通常类成员（包括数据成员）是公共的（除非见下面的私有变量），并且所有成员函数都是虚拟的。与Modula-3一样，没有简写用于从其方法引用对象的成员：方法函数声明有一个明确的第一个参数表示对象，该参数由调用隐式提供。与Smalltalk一样，类本身是对象。这为导入和重命名提供了语义。与C++和Modula-3不同，用户可以使用内置类型作为基类进行扩展。此外，与C++一样，具有特殊语法的大多数内置运算符（算术运算符、下标等）可以为类实例重新定义。

（缺乏普遍接受的术语来讨论类，我会偶尔使用Smalltalk和C++术语。我会使用Modula-3术语，因为其面向对象的语义与Python更接近，但我预计很少有读者听说过它。）

#### 9.1. 关于名称和对象的说明

对象具有独特性，多个名称（在多个作用域中）可以绑定到同一对象。这在其他语言中被称为别名。这在首次查看Python时通常不会被注意到，并且在处理不可变的基本类型（数字、字符串、元组）时可以安全地忽略。但是，别名对包含列表、字典和大多数其他类型的可变对象的Python代码的语义可能会产生令人惊讶的效果。这通常用于程序的利益，因为别名在某些方面表现得像指针。例如，传递对象是便宜的，因为实现只传递一个指针；如果函数修改作为参数传递的对象，调用者将看到更改 — 这消除了像Pascal那样需要两种不同的参数传递机制的需要。

#### 9.2. Python作用域和命名空间

在介绍类之前，我首先要告诉你一些关于Python作用域规则的事情。类定义在命名空间方面玩了一些巧妙的把戏，你需要了解作用域和命名空间的工作方式才能完全理解发生了什么。顺便说一下，对这个主题的知识对于任何高级Python程序员都是有用的。

让我们从一些定义开始。

命名空间是从名称到对象的映射。大多数命名空间当前实现为Python字典，但通常没有任何注意到的方式（除了性能），并且它可能会在未来更改。命名空间的例子包括：内置名称集（包含函数如abs()和内置异常名称）；模块中的全局名称；以及函数调用中的局部名称。从某种意义上说，对象的属性集也形成一个命名空间。了解命名空间的重要事项是不同命名空间中的名称之间绝对没有关系；例如，两个不同的模块都可能定义一个函数maximize而不会混淆 — 模块的用户必须使用模块名作为前缀。

顺便说一下，我使用属性这个词来表示跟在点后面的任何名称 — 例如，在表达式z.real中，real是对象z的一个属性。严格来说，模块中的名称引用是属性引用：在表达式modname.funcname中，modname是一个模块对象，而funcname是其属性。在这种情况下，模块的属性和模块中定义的全局名称之间有一个直接的映射：它们共享相同的命名空间！[1]

属性可以是只读或可写的。在后者的情况下，可以对属性进行赋值。模块属性是可写的：你可以写modname.the_answer = 42。可写属性也可以用del语句删除。例如，del modname.the_answer将从由modname命名的对象中删除属性the_answer。

命名空间在不同的时刻被创建，并且有不同的生命周期。包含内置名称的命名空间是在Python解释器启动时创建的，并且永远不会被删除。模块的全局命名空间是在读取模块定义时创建的；通常，模块命名空间也会持续到解释器退出。由解释器顶层调用执行的语句，无论是从脚本文件还是交互式地读取的，都被认为是一个名为__main__的模块的一部分，因此它们有自己的全局命名空间。 （内置名称实

际上也存在于一个模块中；这称为builtins。）

当函数被调用时，函数的局部命名空间被创建，并在函数返回或引发未在函数内处理的异常时被删除。 （实际上，遗忘是描述实际发生的情况的更好方式。）当然，递归调用每个都有自己的局部命名空间。

作用域是Python程序中命名空间直接可访问的文本区域。“直接可访问”这里意味着对名称的无资格引用尝试在命名空间中找到名称。

尽管作用域是静态确定的，但它们是动态使用的。在执行期间的任何时候，有3个或4个嵌套作用域，它们的命名空间是直接可访问的：

- 最内部的作用域，首先被搜索，包含局部名称
- 任何包围函数的作用域，从最近的包围作用域开始搜索，包含非局部但也非全局的名称
- 倒数第二个作用域包含当前模块的全局名称
- 最外层的作用域（最后搜索）是包含内置名称的命名空间

如果一个名称被声明为全局，那么所有的引用和赋值都直接到下一个-to-last的作用域，包含模块的全局名称。要重新绑定在最内部作用域外找到的变量，可以使用nonlocal语句；如果未声明为nonlocal，那些变量是只读的（尝试写入这样的变量将在最内部作用域中简单地创建一个新的局部变量， leaving the identically named outer variable unchanged）。

通常，局部作用域引用（文本上）当前函数的局部名称。在函数外部，局部作用域引用与全局作用域相同的命名空间：模块的命名空间。类定义在局部作用域中放置另一个命名空间。

重要的是要认识到作用域是文本确定的：在模块中定义的函数的全局作用域是该模块的命名空间，无论从何处或通过何种别名调用函数。另一方面，实际的名称搜索是在运行时动态完成的 — 但是，语言定义正在向静态名称解析的方向发展，在“编译”时间，所以不要依赖于动态名称解析！（事实上，局部变量已经静态确定。）

Python的一个特殊怪癖是 - 如果没有全局或nonlocal语句在效果 - 名称的赋值总是进入最内部的作用域。赋值不复制数据 — 它们只是将名称绑定到对象。删除也是如此：语句del x从由局部作用域引用的命名空间中删除x的绑定。事实上，引入新名称的所有操作都使用局部作用域：特别是，import语句和函数定义在局部作用域中绑定模块或函数名称。

global语句可以用来指示特定的变量存在于全局作用域并应该在那里重新绑定；nonlocal语句指示特定的变量存在于封闭作用域并应该在那里重新绑定。

### 9.2.1. 作用域和命名空间示例

以下是一个示例，展示了如何引用不同的作用域和命名空间，以及`global`和`nonlocal`如何影响变量绑定：

```python
def scope_test():
    def do_local():
        spam = "local spam"

    def do_nonlocal():
        nonlocal spam
        spam = "nonlocal spam"

    def do_global():
        global spam
        spam = "global spam"

    spam = "test spam"
    do_local()
    print("After local assignment:", spam)
    do_nonlocal()
    print("After nonlocal assignment:", spam)
    do_global()
    print("After global assignment:", spam)

scope_test()
print("In global scope:", spam)
```

这段示例的输出是：

```
After local assignment: test spam
After nonlocal assignment: nonlocal spam
After global assignment: nonlocal spam
In global scope: global spam
```

注意，局部赋值（默认）没有改变`scope_test`对`spam`的绑定。`nonlocal`赋值改变了`scope_test`对`spam`的绑定，而`global`赋值改变了模块级别的绑定。

你还可以看到，在全局赋值之前，`spam`没有任何先前的绑定。

### 9.3. 类初探

类引入了一些新的语法、三种新的对象类型和一些新的语义。

#### 9.3.1. 类定义语法

类定义的最简单形式如下：

```python
class 类名:
    <语句-1>
    .
    .
    .
    <语句-N>
```

类定义和函数定义（使用 `def` 语句）一样，必须在它们发挥任何效果之前执行。（理论上，您可以将类定义放在 `if` 语句的一个分支中，或者放在函数内部。）

实际上，类定义内部的语句通常会是函数定义，但允许其他语句，有时也很有用——我们稍后会回到这个话题。类内部的函数定义通常有一种特殊的参数列表，由方法的调用约定决定——这也会在稍后解释。

当进入类定义时，会创建一个新的命名空间，并用作局部作用域——因此，所有对局部变量的赋值都进入这个新的命名空间。特别是，函数定义将新函数的名称绑定到这里。

当正常离开类定义（通过结尾）时，会创建一个类对象。这基本上是一个围绕类定义创建的命名空间内容的包装器；我们将在下一节学习更多关于类对象的知识。原始的局部作用域（在进入类定义之前生效的作用域）被恢复，并且类对象绑定到类定义头中给出的类名（在示例中为 `ClassName`）。

#### 9.3.2. 类对象

类对象支持两种操作：属性引用和实例化。

属性引用使用 Python 中用于所有属性引用的标准语法：`obj.name`。有效的属性名称是在创建类对象时类的命名空间中的所有名称。因此，如果类定义看起来像这样：

```python
class MyClass:
    """一个简单的示例类"""
    i = 12345

    def f(self):
        return 'hello world'
```

那么 `MyClass.i` 和 `MyClass.f` 都是有效的属性引用，分别返回一个整数和一个函数对象。类属性也可以被赋值，所以你可以通过赋值改变 `MyClass.i` 的值。`__doc__` 也是一个有效的属性，返回属于类的文档字符串："一个简单的示例类"。

类实例化使用函数表示法。就像假设类对象是一个无参数函数，返回类的一个新实例。例如（假设上述类）：

```python
x = MyClass()
```

创建类的一个新实例，并将这个对象分配给局部变量 `x`。

实例化操作（“调用”一个类对象）创建一个空对象。许多类喜欢创建具有特定初始状态的实例化对象。因此，一个类可能定义一个特殊的方法，名为 `__init__()`，如下：

```python
def __init__(self):
    self.data = []
```

当类定义一个 `__init__()` 方法时，类实例化会自动调用 `__init__()` 为新创建的类实例。因此，在这个示例中，可以通过：

```python
x = MyClass()
```

获取一个新的、初始化的实例。当然，`__init__()` 方法也可以有参数以提供更大的灵活性。在这种情况下，给类实例化运算符的参数会传递给 `__init__()`。例如：

```python
class Complex:
    def __init__(self, realpart, imagpart):
        self.r = realpart
        self.i = imagpart

x = Complex(3.0, -4.5)
x.r, x.i
```

输出将是 `(3.0, -4.5)`。

### 9.3.3. 实例对象

现在我们能用实例对象做什么呢？实例对象理解的唯一操作是属性引用。有两种有效的属性名称：数据属性和方法。

数据属性对应于 Smalltalk 中的“实例变量”和 C++ 中的“数据成员”。数据属性不需要声明；像局部变量一样，它们在首次赋值时就会自动生成。

例如，如果 `x` 是上面创建的 `MyClass` 的实例，以下代码将打印值 `16`，而不留下任何痕迹：

```python
x.counter = 1
while x.counter < 10:
    x.counter = x.counter * 2
print(x.counter)
del x.counter
```

另一种实例属性引用是方法。方法是一个“属于”对象的函数。（在 Python 中，“方法”这个术语并不仅仅是类实例独有的：其他对象类型也可以有方法。

例如，列表对象有名为 `append`、`insert`、`remove`、`sort` 等的方法。但是，在下面的讨论中，我们将使用术语“方法”来指代类实例对象的方法，除非另有明确说明。）

实例对象的有效方法名称取决于它的类。根据定义，所有类的所有属性都是函数对象，它定义了其实例的相应方法。因此，在我们的示例中，`x.f` 是一个有效的方法引用，因为 `MyClass.f` 是一个函数，但 `x.i` 不是，因为 `MyClass.i` 不是。但 `x.f` 不同于 `MyClass.f` — 它是一个方法对象，而不是函数对象。

### 9.3.4. 方法对象

通常，方法在绑定后立即被调用：

```python
x.f()
```

在 `MyClass` 示例中，这将返回字符串 `'hello world'`。但是，不必立即调用方法：`x.f` 是一个方法对象，可以被存储并在以后的时间调用。例如：

```python
xf = x.f
while True:
    print(xf())
```

将继续打印 `hello world`，直到时间的尽头。

当调用方法时会发生什么？你可能已经注意到 `x.f()` 在上面没有参数地被调用，即使函数 `f()` 的定义指定了一个参数。参数去哪了？当调用一个需要参数的函数而没有提供任何参数时，Python 会引发异常...

实际上，你可能已经猜到答案：方法的特殊之处在于实例对象作为函数的第一个参数被传递。

在我们的示例中，调用 `x.f()` 完全等同于 `MyClass.f(x)`。通常，使用 n 个参数列表调用方法等同于在第一个参数之前插入方法的实例对象调用相应的函数。

### 9.3.5. 类和实例变量

一般来说，实例变量是每个实例独有的数据，而类变量是类的所有实例共享的属性和方法：

```python
class Dog:

    kind = 'canine'         # 类变量，所有实例共享

    def __init__(self, name):
        self.name = name    # 实例变量，每个实例独有
```

```python
>>> d = Dog('Fido')
>>> e = Dog('Buddy')
>>> d.kind                  # 所有狗共享
'canine'
>>> e.kind                  # 所有狗共享
'canine'
>>> d.name                  # d 独有
'Fido'
>>> e.name                  # e 独有
'Buddy'
```

如在关于名称和对象的一词中讨论的，共享的数据可能与涉及可变对象（如列表和字典）的可能令人惊讶的效果有关。

例如，在以下代码中，`tricks` 列表不应该被用作类变量，因为所有 `Dog` 实例都会共享同一个列表：

```python
class Dog:

    tricks = []             # 错误使用的类变量

    def __init__(self, name):
        self.name = name

    def add_trick(self, trick):
        self.tricks.append(trick)
```

```python
>>> d = Dog('Fido')
>>> e = Dog('Buddy')
>>> d.add_trick('roll over')
>>> e.add_trick('play dead')
>>> d.tricks                # 所有狗意外共享
['roll over', 'play dead']
```

正确的类设计应该使用实例变量代替：

```python
class Dog:

    def __init__(self, name):
        self.name = name
        self.tricks = []    # 为每只狗创建一个新的空列表

    def add_trick(self, trick):
        self.tricks.append(trick)
```

```python
>>> d = Dog('Fido')
>>> e = Dog('Buddy')
>>> d.add_trick('roll over')
>>> e.add_trick('play dead')
>>> d.tricks
['roll over']
>>> e.tricks
['play dead']
```

### 9.4. 随机备注

如果同一个属性名称在实例和类中都出现，那么属性查找将优先选择实例：

```python
class Warehouse:
   purpose = 'storage'
   region = 'west'

w1 = Warehouse()
print(w1.purpose, w1.region)  # 输出 storage west

w2 = Warehouse()
w2.region = 'east'
print(w2.purpose, w2.region)  # 输出 storage east
```

数据属性可以由方法以及对象的普通用户（“客户端”）引用。换句话说，类不能用来实现纯抽象数据类型。

事实上，Python 中没有任何东西可以强制执行数据隐藏 — 它都是基于约定的。

（另一方面，用 C 编写的 Python 实现完全可以隐藏实现细节并控制对象的访问，如果需要，这可以被用于以 C 编写的 Python 扩展。）

客户端应谨慎使用数据属性 — 客户端可能会通过更改它们的数据属性来破坏方法维护的不变性。

注意，只要避免名称冲突，客户端可以向实例对象添加自己的数据属性，而不会影响方法的有效性 — 再次，命名约定在这里可以避免很多麻烦。

没有简写来从方法内部引用数据属性（或其他方法！）。我发现这实际上增加了方法的可读性：当浏览方法时，没有混淆局部变量和实例变量的机会。

通常，方法的第一个参数被称为 `self`。这只是一个约定：名称 `self` 对 Python 没有任何特殊意义。

但请注意，不遵循这个约定，你的代码可能对其他 Python 程序员来说不太可读，而且也可以想象有一个类浏览器程序可能依赖这样的约定。

任何作为类属性的函数对象都为该类的实例定义了一个方法。函数定义文本上不一定需要在类定义内部：在类中将函数对象分配给本地变量也是可以的。例如：

```python
# 在类外部定义的函数
def f1(self, x, y):
    return min(x, x+y)

class C:
    f = f1

    def g(self):
        return 'hello world'

    h = g
```

现在 `f`、`g` 和 `h` 都是类 `C` 的属性，它们指向函数对象，因此它们都是 `C` 的实例的方法 — `h` 恰好等同于 `g`。注意，这种做法通常只会使程序的读者感到困惑。

方法可以通过使用 `self` 参数的方法属性来调用其他方法：

```python
class Bag:
    def __init__(self):
        self.data = []

    def add(self, x):
        self.data.append(x)

    def addtwice(self, x):
        self.add(x)
        self.add(x)
```

方法可以以与普通函数相同的方式引用全局名称。与方法关联的全局作用域是包含其定义的模块。

（类从不用作全局作用域。）虽然很少遇到在方法中使用全局数据的好理由，但全局作用域有许多合法的用途：首先，导入到全局作用域的函数和模块可以被方法使用，以及其中定义的函数和类。

通常，包含方法的类本身在这个全局作用域中定义，在下一节中，我们将找到一些方法想要引用自己类的好理由。

每个值都是一个对象，因此都有一个类（也称为其类型）。它存储为 `object.__class__`。

### 9.5. 继承

当然，如果不支持继承，那么一个语言特性就不配被称为“类”。

派生类定义的语法如下：

```python
class DerivedClassName(BaseClassName):
    <statement-1>
    .
    .
    .
    <statement-N>
```

`BaseClassName` 必须在包含派生类定义的作用域内可访问的命名空间中定义。除了基类名称外，还允许使用其他任意表达式。这在基类定义在另一个模块时可能很有用：

```python
class DerivedClassName(modname.BaseClassName):
```

派生类定义的执行方式与基类相同。当构造类对象时，会记住基类。这用于解析属性引用：如果在类中找不到请求的属性，搜索将继续查找基类。如果基类本身从其他类派生而来，这个规则会递归应用。

派生类的实例化没有什么特殊之处：`DerivedClassName()` 创建类的一个新实例。方法引用解析如下：搜索相应的类属性，必要时沿着基类链向下搜索，如果这产生一个函数对象，则该方法引用有效。

派生类可以覆盖其基类的方法。因为方法在调用同一对象的其他方法时没有特殊权限，所以调用在同一基类中定义的另一个方法的基类方法可能会最终调用覆盖它的派生类的方法。（对于 C++ 程序员：Python 中的所有方法实际上都是虚拟的。）

派生类中的覆盖方法实际上可能想要扩展而不是简单替换同名的基类方法。直接调用基类方法有一个简单的方法：只需调用 `BaseClassName.methodname(self, arguments)`。这对客户端也有时是有用的。（请注意，这仅在基类在全局作用域中可访问时有效。）

Python 有两个内置函数与继承一起使用：

- 使用 `isinstance()` 检查实例的类型：`isinstance(obj, int)` 只有当 `obj.__class__` 是 `int` 或 `int` 的某个派生类时才为 `True`。
  
- 使用 `issubclass()` 检查类继承关系：`issubclass(bool, int)` 是 `True`，因为 `bool` 是 `int` 的子类。然而，`issubclass(float, int)` 是 `False`，因为 `float` 不是 `int` 的子类。

### 9.5.1. 多重继承

Python 也支持一种多重继承形式。具有多个基类的类定义如下：

```python
class DerivedClassName(Base1, Base2, Base3):
    <statement-1>
    .
    .
    .
    <statement-N>
```

在大多数情况下，在最简单的情况下，你可以将从父类继承的属性的搜索视为深度优先、从左到右，不在同一个类中搜索两次，当在层次结构中存在重叠时。

因此，如果在 `DerivedClassName` 中找不到属性，则在 `Base1` 中搜索，然后（递归地）在 `Base1` 的基类中搜索，如果在那里找不到，就在 `Base2` 中搜索，依此类推。

事实上，它比那稍微复杂一些；方法解析顺序动态变化以支持协同调用 `super()`。这种方法在其他多重继承语言中被称为 `call-next-method`，比单一继承语言中的 `super` 调用更为强大。

动态排序是必要的，因为所有多重继承的情况都展示一个或多个钻石关系（其中至少一个父类可以通过多条路径从最底层类访问）。

例如，所有类都继承自 `object`，所以任何多重继承都提供了到达 `object` 的多条路径。

为了防止多次访问基类，动态算法以保持每个类中指定的从左到右的顺序线性化搜索顺序的方式进行，每次只调用每个父类一次，而且是单调的（意味着一个类可以被子类化而不影响其父类的优先顺序）。

综合这些属性，可以设计出可靠和可扩展的多重继承类。更多细节，请参见 Python 2.3 方法解析顺序。

### 9.6. 私有变量

Python 中不存在不能从对象内部访问的“私有”实例变量。

但是，大多数 Python 代码都遵循一个约定：以下划线为前缀的名称（例如 `_spam`）应被视为 API 的非公共部分（无论它是函数、方法还是数据成员）。它应被视为实现细节，可能会在不事先通知的情况下更改。

由于存在一种有效的使用情况来支持类私有成员（即避免与子类定义的名称冲突），因此有一种受限制的支持这种机制，称为名称修饰。

任何形如 `__spam`（至少两个前导下划线，最多一个尾随下划线）的标识符都会在文本上被替换为 `_classname__spam`，其中 `classname` 是当前类名，前导下划线（们）被剥除。这种修饰是在不考虑标识符的语法位置的情况下完成的，只要它出现在类的定义内部。

名称修饰有助于子类重写方法而不会破坏类内方法调用。例如：

```python
class Mapping:
    def __init__(self, iterable):
        self.items_list = []
        self.__update(iterable)

    def update(self, iterable):
        for item in iterable:
            self.items_list.append(item)

    __update = update   # 原始 update() 方法的私有副本

class MappingSubclass(Mapping):

    def update(self, keys, values):
        # 提供了 update() 的新签名
        # 但不破坏 __init__()
        for item in zip(keys, values):
            self.items_list.append(item)
```

上面的示例即使 `MappingSubclass` 引入了 `__update` 标识符，也会工作，因为它在 `Mapping` 类中被替换为 `_Mapping__update`，在 `MappingSubclass` 类中被替换为 `_MappingSubclass__update`。

请注意，修饰规则主要是为了避免意外；仍然可能访问或修改被视为私有的变量。在某些特殊情况下，例如在调试器中，这甚至可能很有用。

请注意，传递给 `exec()` 或 `eval()` 的代码不会认为调用类的类名是当前类；这与 `global` 语句的效果相似，其效果同样限制于与之一同字节编译的代码。相同的限制也适用于 `getattr()`、`setattr()` 和 `delattr()`，以及直接引用 `__dict__` 时。


### 9.7. 其他细节

有时，拥有与 Pascal 的“记录”或 C 的“结构体”相似的数据类型是很有用的，可以将几个命名的数据项捆绑在一起。惯用的方法是使用 `dataclasses`：

```python
from dataclasses import dataclass

@dataclass
class Employee:
    name: str
    dept: str
    salary: int

john = Employee('john', 'computer lab', 1000)
john.dept
'computer lab'
john.salary
1000
```

一个期望特定抽象数据类型的 Python 代码片段通常可以接受一个模仿该数据类型方法的类。

例如，如果你有一个函数从文件对象格式化一些数据，你可以定义一个具有 `read()` 和 `readline()` 方法的类，从字符串缓冲区获取数据，并将其作为参数传递。

实例方法对象也有属性：`m.__self__` 是使用方法 `m()` 的实例对象，而 `m.__func__` 是对应于该方法的函数对象。

### 9.8. 迭代器

到目前为止，你可能已经注意到大多数容器对象都可以使用 `for` 语句进行循环：

```python
for element in [1, 2, 3]:
    print(element)
for element in (1, 2, 3):
    print(element)
for key in {'one':1, 'two':2}:
    print(key)
for char in "123":
    print(char)
for line in open("myfile.txt"):
    print(line, end='')
```

这种访问方式清晰、简洁且方便。迭代器的使用贯穿了 Python，并统一了它。在幕后，`for` 语句在容器对象上调用 `iter()`。该函数返回一个迭代器对象，该对象定义了方法 `__next__()`，逐一访问容器中的元素。当没有更多元素时，`__next__()` 会引发 `StopIteration` 异常，告诉 `for` 循环终止。你可以使用 `next()` 内置函数调用 `__next__()` 方法；下面的示例展示了它是如何工作的：

```python
s = 'abc'
it = iter(s)
it
<str_iterator object at 0x10c90e650>
next(it)
'a'
next(it)
'b'
next(it)
'c'
next(it)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    next(it)
StopIteration
```

了解了迭代器协议的机制后，很容易为你的类添加迭代器行为。定义一个 `__iter__()` 方法，它返回一个具有 `__next__()` 方法的对象。

如果类定义了 `__next__()`，那么 `__iter__()` 可以直接返回 `self`：

```python
class Reverse:
    """Iterator for looping over a sequence backwards."""
    def __init__(self, data):
        self.data = data
        self.index = len(data)

    def __iter__(self):
        return self

    def __next__(self):
        if self.index == 0:
            raise StopIteration
        self.index = self.index - 1
        return self.data[self.index]

rev = Reverse('spam')
iter(rev)
<__main__.Reverse object at 0x00A1DB50>
for char in rev:
    print(char)

m
a
p
s
```

### 9.9. 生成器（Generators）

生成器是创建迭代器的简单且强大的工具。它们的编写方式与常规函数相同，但当它们想要返回数据时使用 `yield` 语句。每次在生成器上调用 `next()` 时，生成器都会从离开的地方恢复（它记住了所有数据值以及上次执行的语句）。以下示例展示了生成器可以非常容易地创建：

```python
def reverse(data):
    for index in range(len(data)-1, -1, -1):
        yield data[index]

for char in reverse('golf'):
    print(char)
```

结果为：

```
f
l
o
g
```

所有可以使用生成器实现的内容，也都可以使用基于类的迭代器来实现，如前一节所述。生成器如此紧凑的原因是 `__iter__()` 和 `__next__()` 方法会自动创建。

另一个关键特性是，局部变量和执行状态在调用之间会自动保存。这使得函数编写更加简单，比使用实例变量如 `self.index` 和 `self.data` 的方法更加清晰。

除了自动方法创建和保存程序状态之外，当生成器终止时，它们会自动引发 `StopIteration`。结合使用，这些特性使得创建迭代器与编写常规函数一样简单。

### 9.10. 生成器表达式（Generator Expressions）

一些简单的生成器可以用与列表推导相似的语法简洁地编码，但使用的是括号而不是方括号。

这些表达式设计用于生成器立即被封闭函数使用的情况。

生成器表达式比完整的生成器定义更为紧凑，但不如等效的列表推导内存占用高。

示例：

```python
sum(i*i for i in range(10))                 # 平方和
285

xvec = [10, 20, 30]
yvec = [7, 5, 3]
sum(x*y for x,y in zip(xvec, yvec))         # 点积
260

unique_words = set(word for line in page for word in line.split())

valedictorian = max((student.gpa, student.name) for student in graduates)

data = 'golf'
list(data[i] for i in range(len(data)-1, -1, -1))
['f', 'l', 'o', 'g']
```

### 脚注

[1]  
除了一个例外。模块对象有一个名为 `__dict__` 的秘密只读属性，该属性返回用于实现模块命名空间的字典；

名称 `__dict__` 是一个属性，但不是全局名称。

显然，使用这种方法会违反命名空间实现的抽象，并且应该限制在像事后调试器这样的东西上使用。



# 参考资料

https://docs.python.org/3.12/tutorial/classes.html

* any list
{:toc}

