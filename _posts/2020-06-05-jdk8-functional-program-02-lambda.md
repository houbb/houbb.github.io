---
layout: post
title: java8 函数式编程-02-Lambda 表达式
date:  2020-6-5 17:42:59 +0800
categories: [Java]
tags: [jdk8, functional-programming, lambda, sh]
published: true
---

Java 8 的最大变化是引入了 Lambda 表达式——一种紧凑的、传递行为的方式。

它也是本书后续章节所述内容的基础，因此，接下来就了解一下什么是 Lambda 表达式。

# 2.1 第一个Lambda表达式

Swing 是一个与平台无关的 Java 类库，用来编写图形用户界面（GUI）。

该类库有一个常见用法：为了响应用户操作，需要注册一个事件监听器。

用户一输入，监听器就会执行一些操作（见例 2-1）。

- 例 2-1 使用匿名内部类将行为和按钮单击进行关联

```java
button.addActionListener(new ActionListener() {
    public void actionPerformed(ActionEvent event) {
        System.out.println("button clicked");
    }
});
```

在这个例子中，我们创建了一个新对象，它实现了 ActionListener 接口。

这个接口只有一个方法 actionPerformed，当用户点击屏幕上的按钮时，button 就会调用这个方法。

匿名内部类实现了该方法。

在例 2-1 中该方法所执行的只是输出一条信息，表明按钮已被点击。

**设计匿名内部类的目的，就是为了方便 Java 程序员将代码作为数据传递。不过，匿名内部类还是不够简便**。

为了调用一行重要的逻辑代码，不得不加上 4 行冗繁的样板代码。

尽管如此，样板代码并不是唯一的问题：这些代码还相当难读，因为它没有清楚地表达程序员的意图。

我们不想传入对象，只想传入行为。

在 Java 8 中，上述代码可以写成一个Lambda 表达式，如例 2-2 所示。

- 例 2-2 使用 Lambda 表达式将行为和按钮单击进行关联

```java
button.addActionListener(event -> System.out.println("button clicked"));
```

和传入一个实现某接口的对象不同，我们传入了一段代码块——一个没有名字的函数。

event 是参数名，和上面匿名内部类示例中的是同一个参数。-> 将参数和 Lambda 表达式的主体分开，而主体是用户点击按钮时会运行的一些代码。

和使用匿名内部类的另一处不同在于声明 event 参数的方式。

使用匿名内部类时需要显式地声明参数类型 ActionEvent event，而在 Lambda 表达式中无需指定类型，程序依然可以编译。

这是因为 javac 根据程序的上下文（addActionListener 方法的签名）在后台**推断出了参数** event 的类型。这意味着如果参数类型不言而明，则无需显式指定。

稍后会介绍类型推断的更多细节，现在先来看看编写 Lambda 表达式的各种方式。

# 2.2 如何辨别Lambda表达式

Lambda 表达式除了基本的形式之外，还有几种变体，如例 2-3 所示。

- 例 2-3 编写 Lambda 表达式的不同形式

```java
Runnable noArguments = () -> System.out.println("Hello World"); //1
ActionListener oneArgument = event -> System.out.println("button clicked"); //2
Runnable multiStatement = () -> {   //3
    System.out.print("Hello");
    System.out.println(" World");
};

BinaryOperator<Long> add = (x, y) -> x + y; //4
BinaryOperator<Long> addExplicit = (Long x, Long y) -> x + y; //5
```

➊中所示的 Lambda 表达式不包含参数，使用空括号 () 表示没有参数。该 Lambda 表达式实现了 Runnable 接口，该接口也只有一个 run 方法，没有参数，且返回类型为 void。

➋中所示的 Lambda 表达式包含且只包含一个参数，可省略参数的括号，这和例 2-2 中的形式一样。

Lambda 表达式的主体不仅可以是一个表达式，而且也可以是一段代码块，使用大括号（{}）将代码块括起来，如➌所示。

该代码块和普通方法遵循的规则别无二致，可以用返回或抛出异常来退出。只有一行代码的 Lambda 表达式也可使用大括号，用以明确 Lambda表达式从何处开始、到哪里结束。

Lambda 表达式也可以表示包含多个参数的方法，如➍所示。

这时就有必要思考怎样去阅读该 Lambda 表达式。这行代码并不是将两个数字相加，而是创建了一个函数，用来计算两个数字相加的结果。

变量 add 的类型是 `BinaryOperator<Long>`，它不是两个数字的和，而是将两个数字相加的那行代码。

到目前为止，所有 Lambda 表达式中的参数类型都是由编译器推断得出的。

这当然不错，但有时最好也可以显式声明参数类型，此时就需要使用小括号将参数括起来，多个参数的情况也是如此。如➎所示。

上述例子还隐含了另外一层意思：Lambda 表达式的类型依赖于上下文环境，是由编译器推断出来的。目标类型也不是一个全新的概念。

如例 2-4 所示，Java 中初始化数组时，数组的类型就是根据上下文推断出来的。

另一个常见的例子是 null，只有将 null 赋值给一个变量，才能知道它的类型。

- 例 2-4 等号右边的代码并没有声明类型，系统根据上下文推断出类型信息

```java
final String[] array = { "hello", "world" };
```

# 2.3 引用值，而不是变量

如果你曾使用过匿名内部类，也许遇到过这样的情况：需要引用它所在方法里的变量。

这时，需要将变量声明为 final，如例 2-5 所示。将变量声明为 final，意味着不能为其重复赋值。

同时也意味着在使用 final 变量时，实际上是在使用赋给该变量的一个特定的值。

- 例 2-5 匿名内部类中使用 final 局部变量

```java
final String name = getUserName();
button.addActionListener(new ActionListener() {
    public void actionPerformed(ActionEvent event) {
        System.out.println("hi " + name);
    }
});
```

Java 8 虽然放松了这一限制，可以引用非 final 变量，但是该变量在既成事实上必须是final。

虽然无需将变量声明为 final，但在 Lambda 表达式中，也无法用作非终态变量。

如果坚持用作非终态变量，编译器就会报错。

既成事实上的 final 是指只能给该变量赋值一次。

换句话说，Lambda 表达式引用的是值，而不是变量。

在例 2-6 中，name 就是一个既成事实上的 final 变量。

- 2-6 Lambda 表达式中引用既成事实上的 final 变量

```java
String name = getUserName();
button.addActionListener(event -> System.out.println("hi " + name));
```
final 就像代码中的线路噪声，省去之后代码更易读。

当然，有些情况下，显式地使用 final代码更易懂。

是否使用这种既成事实上的 final 变量，完全取决于个人喜好。

如果你试图给该变量多次赋值，然后在 Lambda 表达式中引用它，编译器就会报错。

比如，例 2-7 无法通过编译，并显示出错信息：

```
local variables referenced from a Lambda expression must be final or effectively final
```

- 例 2-7 未使用既成事实上的 final 变量，导致无法通过编译

```java
String name = getUserName();
name = formatUserName(name);
button.addActionListener(event -> System.out.println("hi " + name));
```

这种行为也解释了为什么 Lambda 表达式也被称为闭包。

未赋值的变量与周边环境隔离起来，进而被绑定到一个特定的值。

在众说纷纭的计算机编程语言圈子里，Java 是否拥有真正的闭包一直备受争议，因为在 Java 中只能引用既成事实上的 final 变量。

名字虽异，功能相同，就好比把菠萝叫作凤梨，其实都是同一种水果。

为了避免无意义的争论，全书将使用“Lambda 表达式”一词。

无论名字如何，如前文所述，Lambda 表达式都是静态类型的。因此，接下来就分析一下 Lambda 表达式本身的类型：函数接口。

# 2.4 函数接口

函数接口是只有一个抽象方法的接口，用作 Lambda 表达式的类型。

在 Java 里，所有方法参数都有固定的类型。

假设将数字 3 作为参数传给一个方法，则参数的类型是 int。

那么，Lambda 表达式的类型又是什么呢？

使用只有一个方法的接口来表示某特定方法并反复使用，是很早就有的习惯。

使用 Swing编写过用户界面的人对这种方式都不陌生，例 2-2 中的用法也是如此。

这里无需再标新立异，Lambda 表达式也使用同样的技巧，并将这种接口称为函数接口。

例 2-8 展示了前面例子中所用的函数接口。

- 例 2-8 ActionListener 接口：接受 ActionEvent 类型的参数，返回空

```java
public interface ActionListener extends EventListener {
    public void actionPerformed(ActionEvent event);
}
```

ActionListener 只有一个抽象方法：actionPerformed，被用来表示行为：接受一个参数，返回空。

记住，由于 actionPerformed 定义在一个接口里，因此 abstract 关键字不是必需的。该接口也继承自一个不具有任何方法的父接口：EventListener。

这就是函数接口，接口中单一方法的命名并不重要，只要方法签名和 Lambda 表达式的类型匹配即可。

可在函数接口中为参数起一个有意义的名字，增加代码易读性，便于更透彻地理解参数的用途。

这里的函数接口接受一个 ActionEvent 类型的参数，返回空（void），但函数接口还可有其他形式。

例如，函数接口可以接受两个参数，并返回一个值，还可以使用泛型，这完全取决于你要干什么。

以后我将使用图形来表示不同类型的函数接口。

指向函数接口的箭头表示参数，如果箭头从函数接口射出，则表示方法的返回类型。

ActionListener 的函数接口如图 2-1 所示。

使用 Java 编程，总会遇到很多函数接口，但 Java 开发工具包（JDK）提供的一组核心函数接口会频繁出现。

表 2-1 罗列了一些最重要的函数接口。

- 表2-1 Java中重要的函数接口

接口 参数 返回类型 示例

```java
Predicate<T> T boolean 这张唱片已经发行了吗
Consumer<T> T void 输出一个值
Function<T,R> T R 获得 Artist 对象的名字
Supplier<T> None T 工厂方法
UnaryOperator<T> T T 逻辑非（!）
BinaryOperator<T> (T, T) T 求两个数的乘积（*）
```

前面已讲过函数接口接收的类型，也讲过 javac 可以根据上下文自动推断出参数的类型，且用户也可以手动声明参数类型，但何时需要手动声明呢？

下面将对类型推断作详尽说明。

## 个人补充

我们不妨看一下 predicate 的源码：

```java
@FunctionalInterface
public interface Predicate<T> {

    boolean test(T t);

    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }

    // ... 省略其他
}
```

看起来和普通的接口没啥区别，但是这里有一个注解 `@FunctionalInterface`。

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface FunctionalInterface {}
```

这个接口就是用于指定在方法类型上，解释如下：

```
一个信息性注解类型，用于指示接口类型声明旨在按照Java语言规范定义的函数式接口。

从概念上讲，函数式接口具有正好一个抽象方法。由于默认方法有一个实现，它们不是抽象的。

如果一个接口声明一个抽象方法，覆盖了java.lang.Object的一个公共方法，那也不计入接口的抽象方法计数，因为接口的任何实现都将从java.lang.Object或其他地方继承一个实现。

请注意，函数式接口的实例可以使用lambda表达式、方法引用或构造函数引用来创建。

如果一个类型被标注为这个注解类型，编译器将生成一个错误消息，除非：该类型是一个接口类型，而不是注解类型、枚举或类。

被标注的类型满足函数式接口的要求。

然而，编译器将任何符合函数式接口定义的接口视为函数式接口，无论接口声明中是否存在 FunctionalInterface 注解。
```

这里感觉注解的作用是让编译器可以加一次编译验证，但是一个接口实际上不加这个注解，也会被视为是，只要符合对应的条件。，

# 2.5 类型推断

某些情况下，用户需要手动指明类型，建议大家根据自己或项目组的习惯，采用让代码最便于阅读的方法。

有时省略类型信息可以减少干扰，更易弄清状况；而有时却需要类型信息帮助理解代码。

经验证发现，一开始类型信息是有用的，但随后可以只在真正需要时才加上类型信息。

下面将介绍一些简单的规则，来帮助确认是否需要手动声明参数类型。

Lambda 表达式中的类型推断，实际上是 Java 7 就引入的目标类型推断的扩展。

读者可能已经知道 Java 7 中的菱形操作符，它可使 javac 推断出泛型参数的类型。

参见例 2-9。

- 例 2-9 使用菱形操作符，根据变量类型做推断

```java
Map<String, Integer> oldWordCounts = new HashMap<String, Integer>(); //1
Map<String, Integer> diamondWordCounts = new HashMap<>(); //2s
```

我们为变量 oldWordCounts ➊明确指定了泛型的类型，而变量 diamondWordCounts ➋则使用了菱形操作符。

不用明确声明泛型类型，编译器就可以自己推断出来，这就是它的神奇之处！

当然，这并不是什么魔法，根据变量 diamondWordCounts ➋的类型可以推断出 HashMap 的泛型类型，但用户仍需要声明变量的泛型类型。

如果将构造函数直接传递给一个方法，也可根据方法签名来推断类型。

在例 2-10 中，我们传入了 HashMap，根据方法签名已经可以推断出泛型的类型。

Java 7 中程序员可省略构造函数的泛型类型，Java 8 更进一步，程序员可省略 Lambda 表达式中的所有参数类型。

再强调一次，这并不是魔法，javac 根据 Lambda 表达式上下文信息就能推断出参数的正确类型。

**程序依然要经过类型检查来保证运行的安全性，但不用再显式声明类型罢了。这就是所谓的类型推断。**

接下来将通过举例来详细分析类型推断。


例 2-11 和例 2-12 都将变量赋给一个函数接口，这样便于理解。

第一个例子（例 2-11）使用 Lambda 表达式检测一个 Integer 是否大于 5。

这实际上是一个 Predicate——用来判断真假的函数接口。

- 例 2-11 类型推断

```java
Predicate<Integer> atLeast5 = x -> x > 5;
```

Predicate 也是一个 Lambda 表达式，和前文中 ActionListener 不同的是，它还返回一个值。

在例 2-11 中，表达式 x > 5 是 Lambda 表达式的主体。这样的情况下，返回值就是Lambda 表达式主体的值。

- 例 2-12 Predicate 接口的源码，接受一个对象，返回一个布尔值

```java
public interface Predicate<T> {
    boolean test(T t);
}
```

从例 2-12 中可以看出，Predicate 只有一个泛型类型的参数，Integer 用于其中。

Lambda 表达式实现了 Predicate 接口，因此它的单一参数被推断为 Integer 类型。

javac 还可检查 Lambda 表达式的返回值是不是 boolean，这正是 Predicate 方法的返回类型。

例 2-13 是一个略显复杂的函数接口：BinaryOperator。该接口接受两个参数，返回一个值，参数和值的类型均相同。实例中所用的类型是 Long。

- 例 2-13 略显复杂的类型推断

```java
BinaryOperator<Long> addLongs = (x, y) -> x + y;
```

类型推断系统相当智能，但若信息不够，类型推断系统也无能为力。

类型系统不会漫无边际地瞎猜，而会中止操作并报告编译错误，寻求帮助。

比如，如果我们删掉例 2-13 中的某些类型信息，就会得到例 2-14 所示的代码。

- 例 2-14 没有泛型，代码则通不过编译

```java
BinaryOperator add = (x, y) -> x + y;
```

编译器给出的报错信息如下：

```
Operator '& #x002B;' cannot be applied to java.lang.Object, java.lang.Object.
```

报错信息让人一头雾水，到底怎么回事？ 

BinaryOperator 毕竟是一个具有泛型参数的函数接口，该类型既是参数 x 和 y 的类型，也是返回值的类型。

上面的例子中并没有给出变量add 的任何泛型信息，给出的正是原始类型的定义。

因此，编译器认为参数和返回值都是java.lang.Object 实例。

4.3 节还会讲到类型推断，但就目前来说，掌握以上类型推断的知识就已经足够了。

# 参考资料

《java8 函数式编程》

* any list
{:toc}