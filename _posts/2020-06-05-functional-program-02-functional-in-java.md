---
layout: post
title: 函数式编程-02-函数中的方法
date:  2020-6-5 17:42:59 +0800
categories: [Pattern]
tags: [pattern, functional-programming, sh]
published: true
---

# Java 中的函数

在第1 章中，你用了我称之为函数的东西，但实际上它们是方法。

方法是一种在传统的Java 里在某种程度上表示函数的方式。

## 函数式的方法

一个方法可以是函数式的，只要它满足纯函数的要求：

- 它不能修改函数外的任何东西。外部观测不到内部的任何变化。

- 它不能修改自己的参数。

- 它不能抛出错误或异常。

- 它必须返回一个值。

- 只要调用它的参数相同，结果也必须相同。

让我们来看一个例子。

## 例子

你能说出那些事函数式方法吗？为什么？

```java
public class FunctionalMethods {

    public int percent1 =5;
    private int percent2 =9;
    public final int percent3 = 13;

    @Functional
    public int add(int a, int b) {
        return a+b;
    }

    public void setPercent2(int percent2) {
        this.percent2 = percent2;
    }

    @Functional
    public int multi(int a, Integer b) {
        a = 5;
        b = 2;
        return a*b;
    }

    public int div(int a, int b) {
        return a / b;
    }

    public int applyTax1(int a) {
        return a / 100 * (100+percent1);
    }

    public int applyTax2(int a) {
        return a / 100 * (100+percent2);
    }

    @Functional
    public int applyTax3(int a) {
        return a / 100 * (100+percent3);
    }

    public List<Integer> append(int i,
                                List<Integer> list) {
        list.add(i);
        return list;
    }

}
```

### 思考过程

你能说出哪些方法是纯函数吗？在阅读下面的答案之前先思考几分钟。

想想方法内部的所有状态和过程。请记住，**重要的是外界能观测到什么。别忘了考虑异常情况。**

```java
@Functional
public int add(int a, int b) {
    return a+b;
}
```

add 是一个函数，因为它返回的值总是取决于自己的参数。

它并不修改自己的参数，也不以任何方式与外界交互。这个方法可能会在a+b 溢出最大的int 值时出错，但它并不会抛出异常。

结果是错误的，但这是其他问题。每当函数被相同的参数调用，结果必须总是一致的。这并不意味着结果必须准确无误！

- 准确性

准确（ exact ）这个词本身并不表示什么东西。它通常只是表示结果与期望相符。

所以要说函数实现的结果是否准确，你需要知道实现的意图。

通常除了函数名以外没有什么能够查明意图，而函数名可能是误解的起源。

```java
@Functional
public int multi(int a, Integer b) {
    a = 5;
    b = 2;
    return a*b;
}
```

与 add 方法一样， multi 方法也是一个纯函数。

你可能会觉得有些不可思议，因为它似乎改变了自己的参数。

但是 Java 的方法**参数是值传递的， 意味着对它们重新赋值在方法外界观测不到。**

这个方法永远都会返回10 ，因为它并不依赖于参数，所以没什么用处，但是这一点并没有违反要求。

当这个方法被相同的参数多次调用时，它永远会返回相同的值。

顺便提一句，这个方法等价于一个无参方法。它是函数f (x) = 10 的一个特例，是一个常量。

```java
public int div(int a, int b) {
    return a / b;
}
```

由于除数为0 的时候会抛出异常， 所以 div 方法并不是一个纯函数。

为了让它成为函数，你可以检查第二个参数，当其为0 时返回一个值。

它必须是一个int 类型，所以可能很难找到一个有意义的值，不过那是别的问题了。

```java
public int applyTax1(int a) {
    return a / 100 * (100+percent1);
}
```

applyTaxl 方法似乎并不是一个纯函数，因为结果依赖于公共的percentl 值，而这个值在两次调用间可能会不一致。

因此，相同参数的两次调用可能会返回不同的值。

percentl 可以理解为一个隐式的参数，但是这个参数并不像方法参数那样在同一时间决定。

如果你在方法里只用一次 percentl 值，那就没什么问题，但是如果你读取了两次，它可能就会在两次读取操作之间发生变化。

因此如果需要用这个值两次，你就必须读取一次并将其保存为局部变量。

这就意味着 applyTax1 方法对于元组 (a, percent1) 来说是一个纯函数，但是对于a 来说就不是了。

ps: 我个人认为这个不是一个纯函数，因为如果 percentl=-100，那么上面的函数就会抛出异常。而且这个值确实是可变的。个人认为作者这里的例子不够严谨。

append() 方法不是，因为它改变了入参，且对外部可见。

# 对象标记与函数标记

你己经看到了， 实例方法访问类属性可以视为一个外围类实例的隐式参数。

可以把不访问外围类实例的方法安全地标记为静态方法。

访问外围类实例的那些方法也可以被标记为静态方法，只需显式地标记它们的隐式参数（外围类实例）。

## 转为 static

第一章节的 Payment 类：

```java
public Payment combine(final Payment other) {
    // 只有同一张卡才进行合并
    if(other.creditCard.equals(this.creditCard)) {
        this.price += other.price;
        return this;
    }
    throw new UnsupportedOperationException("只支持相同信用卡的合并！");
}
```

这里不是静态方法，因为依赖了 this 属性。

可以如下转换：

```java
public static Payment combine(final Payment first, final Payment other) {
    // 只有同一张卡才进行合并
    if(other.creditCard.equals(first.creditCard)) {
        first.price += first.price;
        return first;
    }
    throw new UnsupportedOperationException("只支持相同信用卡的合并！");
}
```

静态方法可以从类的内部被调用，只需传入this 引用即可：

```java
combine(this, other)
```

这么做有少许不同，但是如果你需要复合方法调用，它们全都需要改变。

如果你需要合并多个支付，以下是一个实例方法：

```java
Payment payment = p0.combine(p1)
                .combine(p2)
                .combine(p3);
```

ps: 这就是我们常说的链式调用。

肯定比下面的调用优雅的多：

```java
Payment payment = combine(combine(combine(p0, p1), p2), p3);
```

# Java 的函数式接口与匿名类

方法可以是函数式的，但是在函数式编程中，它缺少了一些可以用来表示函数的东西：

除了应用于参数以外，它无法被控制。

你无法将一个方法作为参数传递给另一个方法。

结果就是你无法只是复合方法而不应用它们。你可以复合方法的应用，但无法复合方法本身。

一个 java 方法属于定义它的类， 并且只能待在那里。

你可以通过从其他方法调用它们来复合方法，但是这应该在编写程序时就完成。如果你想在不同的情况下做不同的复合，就必须在写程序时规划好这些复合。你无法用程序在运行期间改变自身的方式来编写一段程序。难道可以吗？

是的，你可以！ 

有时你可以在运行时注册处理器来处理特定的情况。

你可以在处理器集合里增加处理器、移除或者改变使用顺序。

怎么做到的呢？通过

使用那些包含了你打算操作的方法的类。

在图形用户界面 GUI 上，你经常使用监听器来处理诸如移动鼠标、
更改窗口大小或是输入文本等特定事件。

这些监听器一般都是实现了一个特定接口的匿名类。你可以用相同的原理来创建函数。

假设你打算创建一个方法， 返回整型参数的三倍。

## 接口

首先， 你需要定义一个接口，里面有一个方法：

```java
public interface Function {

    int apply(final int value);
    
}
```

然后你就可以实现这个方法来创建函数：

```java
Function triple = new Function() {
    @Override
    public int apply(int value) {
        return value * 3;
    }
};
Function square = new Function() {
    @Override
    public int apply(int value) {
        return value * value;
    }
};
```

## 复合函数

如果你把函数当成方法，复合它们似乎很简单：

```java
System.out.println(square.apply(triple.apply(2)));
```

但它并不是复合函数，在本例中，你在复合函数的应用。

复合函数是函数的二元操作， 正如加法是数字的二元操作。

因此你能够以编码的方式用一个方法来复合函数：

```java
public static Function compose(final Function one, final Function two) {
    return new Function() {
        @Override
        public int apply(int value) {
            return one.apply(two.apply(value));
        }
    };
}
```

使用如下：

```java
System.out.println(compose(square, triple).apply(2));
```

# 多态函数

为了让我们的函数更加容易重用，你可以通过使用类型参数 (parameterized types) 来把它变成一个多态函数。

Java 使用泛型来实现类型参数：

```java
public interface Function<S, R> {

    R apply(S s);
    
}
```

其他方法重写如下：

```java
public static <T> Function<T, T> compose(final Function<T, T> one, final Function<T, T> two) {
    return new Function<T, T>() {
        @Override
        public T apply(T t) {
            return one.apply(two.apply(t));
        }
    };
}


public static void main(String[] args) {
    Function<Integer, Integer> triple = new Function<Integer, Integer>() {
        @Override
        public Integer apply(Integer integer) {
            return integer * 3;
        }
    };
    Function<Integer, Integer> square = new Function<Integer, Integer>() {
        @Override
        public Integer apply(Integer integer) {
            return integer * integer;
        }
    };
    System.out.println(square.apply(triple.apply(2)));
    System.out.println(compose(square, triple).apply(2));
}
```

ps: 针对 compose 方法，此处也是用了泛型。和作者的答案有些不同。

## 复合函数存在的问题

复合函数是一个非常强大的概念，但是如果用Java 来实现，会有一个大隐患。

复合几个函数没什么问题。

但是思考一下，构建10 000 个函数并把它们复合成一个。（可以通过折叠未完成，你将在第3 章中学习这个操作。）

在命令式编程里，每个函数都在计算之后才把结果传递给下一个函数当作输入。

但是在函数式编程里，复合函数意味着无须计算便直接构建结果函数。

复合函数非常强大，因为函数无须计算就可以被复合。

但是结果就是，在大量内嵌的方法调用中应用复合函数最终会导致栈溢出。

可以用一个简单的例子来演示（使用下一节将会介绍到的lambda ） 。

```java
int fnum = 10_000;

Function<Integer, Integer> g  = x -> x;
Function<Integer, Integer> f  = x -> x+1;
for(int i = 0; i < fnum; i++) {
    g = compose(f, g);
}
System.out.println(g.apply(0));
```

运行结果为 SOE

```
java.lang.StackOverflowError
	at com.github.houbb.fp.learn.chap2.FunctionDemo$1.apply(FunctionDemo.java:18)
	at com.github.houbb.fp.learn.chap2.FunctionDemo$1.apply(FunctionDemo.java:18)
```

希望你不要在生产写这种代码。

如果想被开除的话，这个另说。:)

# 通过lambda 简化代码

第二个问题就是，定义为匿名类的函数在用于编码时有些笨拙。

程序员的梦想就是 less code, no code。然后到失业！

幸运的是， Java 8 引入了lambda 。

## lambda 改写

```java
public static <T> Function<T, T> compose(final Function<T, T> one, final Function<T, T> two) {
    return t -> one.apply(two.apply(t));
}

public static void main(String[] args) {
    Function<Integer, Integer> triple = integer -> integer * 3;
    Function<Integer, Integer> square = integer -> integer * integer;

    System.out.println(square.apply(triple.apply(2)));
    System.out.println(compose(square, triple).apply(2));
}
```

是不是简洁了很多，多出的时间可以用来写更多的 BUG。

lambda 不单单是做了代码简化，同时也会做一些类型推断。当然这个也有推断不出来的时候，那就需要我们显式指定：

```java
Function<Integer, Integer> triple = (Integer integer) -> integer * 3;
```

# 高级函数特性

你己经看过了如何创建apply 和compose 函数，也学过了函数可以表示为方法或对象。

可是你还没有回答一个基础问题： 为什么需要函数对象？不能只使用方法吗？

在回答这个问题之前，你需要思考一下多参方法表示为函数式的问题。

## 多参函数怎么样

在 2.1.l 节中， 我说过没有多参函数这回事，只有参数为元组的函数。

元组的基数（ cardinality ）可以是任何你所需的东西。

有几种元组拥有自己的特定名称： 二元组(pair)、三元组(triplet) 、四元组(quartet)等。

它们还有其他名称， 有些人喜欢称它们为 tuple2 、tuple3 、tuple4 等。

ps: 使用数字其实更好记忆。

不过我也说过，参数可以一个接一个地应用，除了最后一个参数以外， 每个参数的应用都会返回一个全新的函数。

## 对于整数求和

让我们来定义一个函数，用于对两个整数求和。


这个函数将会接收一个Integer 为参数并返回一个从Integer 到Integer 的函数，所以它的类型为 `Function<Integer, Function<Integer, Integer>>`。

让我们把它命名add。

最终的结果如下所示：

```java
Function<Integer, Function<Integer, Integer>> add = x -> y -> x+y;
```

你会发现一行的长度很快就不够用了！ 

Java 不支持类型别名，但是你可以通过继承来达到相同的效果。

如果有许多相同类型的函数， 你可以用一个更简短的标识来继承， 就像下面这样：

```java
public interface BinaryOperator extends Function<Integer, Function<Integer, Integer>> {
}
```

- 使用

```java
BinaryOperator add = x->y->x+y;
BinaryOperator multi = x->y->x*y;
```

参数的数量没有限制，你可以定义接收任意数量参数的函数。

正如我在本章的开始部分所说的，你在上面定义的add 或mult 函数，等价于接收元组为参数的函数的柯里化形式。

# 柯里化形式

你已经看到了如何编写柯里化函数的类型以及如何将其实现。

但是如何应用它们呢？与任何函数一样。

把函数应用于第一个参数， 然后把结果应用于下一个参数，以此类推直至最后一个。

例如，你可以将add 函数应用于 3 和 5 :

```java
System.out.println(add.apply(2).apply(2));
```

# 高阶函数

在练习2.1 中，你为复合函数编写了一个方法。那个方法是函数式的，接收包含两个函数的元组为参数井返回一个函数。

不过你可以用一个函数来代替这个方法！

这个特殊版本的函数，接收函数为参数并返回函数，被称为高阶函数 (higher-orderfunction ，即 HOF)。

```java
Function<Function<Integer, Integer>, Function<Function<Integer, Integer>, Function<Integer, Integer>>>
                compose = x->y->z->x.apply(y.apply(z));
```

ps: 这简化的，T-M 都快认不出来了。这里的思维要变化一下，这里返回的是一个函数。

## 应用

```java
Function<Integer, Integer> triple = integer -> integer * 3;
Function<Integer, Integer> square = integer -> integer * integer;

Function<Integer, Integer> composeTripleAndSquare = compose.apply(triple).apply(square);
```

我们将前面的两个函数整合，返回一个新的函数。

调用

```java
System.out.println(composeTripleAndSquare.apply(2));
```

输出 12，就是 2 * 2 * 3 的结果

调用顺序：首先执行 square，然后执行 triple。

ps: 如果想验证可以改成一个加法，一个乘法测试即可

# 多态高阶函数

虽然我们的compose 函数还挺不错， 可它只能复合从Integer 到Integer的函数。

如果你可以复合任意类型的函数， 例如从Stri 呵到Double ，或是从Boolean 到Long，那一定会更吸引人。

不过那才是刚开始。

一个完全多态的compose 函数允许你复合 `Function<Integer , Function<Integer, Integer>>`,就像你在练习2.3 中编写的add 和mult 那样。你还应该能够复合不同类型的函数，

其中一个函数的返回类型与另一个函数的参数类型相同。

## 代码

```java
/**
 * 高阶动态
 * @param <S> 入参
 * @param <M> 中间态
 * @param <R> 出参
 * @return 结果
 * @since chap2
 */
static <S, M, R> Function<Function<S, R>, Function<Function<M, S>, Function<M, R>>> dynamicHofCompose() {
    return f->g->x->f.apply(g.apply(x));
}
```

g.apply(x) 对应的是 `Function<M, S>`，得到返回函数的 S

f.apply 对应的是 `Function<S, R>`，根据 S 得到 R。

个人理解，这2个 M 实际上也不是强依赖的，你也可以改变的。

## 使用

```java
Function<Integer, Integer> triple = integer -> integer * 3;
Function<Integer, Integer> square = integer -> integer * integer;
Integer value = HOF.<Integer, Integer, Integer>dynamicHofCompose()
        .apply(triple)
        .apply(square)
        .apply(2);
System.out.println(value);
```

因为类型推断的问题，这里需要我们显式指定对应的泛型。

## 编写反顺序执行的函数

编写用于反向复合函数的higherAndThen 函数，也就是说， higherCompose(f, g ）相当于higherAndThen(g , f ）。


```java
static <S, M, R> Function<Function<S, R>, Function<Function<R, M>, Function<S, M>>> dynamicHofAndThen() {
    return f->g->x->g.apply(f.apply(x));
}
```

- 测试代码

ps: 此处为了简单，我们使用 2 种不同的函数进行测试。

```java
Function<Integer, Integer> add = integer -> integer + 3;
Function<Integer, Integer> multi = integer -> integer * 2;

Integer one = HOF.<Integer, Integer, Integer>dynamicHofCompose()
        .apply(add)
        .apply(multi)
        .apply(2);
//2*2 + 3 = 7;
System.out.println(one);

Integer two = HOF.<Integer, Integer, Integer>dynamicHofAndThen()
        .apply(add)
        .apply(multi)
        .apply(2);
// (2+3) * 2
System.out.println(two);
```

# 使用匿名函数

迄今为止，你一直在使用命名函数。

这些函数由匿名类实现，但是你创建的实例都己命名，井有显式的类型。

通常你并不会定义函数的名字，而是将其当作匿名实例来使用。

让我们来看一个例子。

无须如此编写：

```java
Function<Double, Double> f = x -> Math.PI/2-x;
Function<Double, Double> sin = Math::sin;

Double cos = Function.compose(f, sin).apply(2.0);
```

直接使用我们前面提到的：

```java
Function.compose(x->Math.PI/2-x, Math::sin).apply(2.0);

// 高阶
Function.<Double, Double, Double>dynamicHofCompose()
        .apply(x->Math.PI/2-x)
        .apply(Math::sin)
        .apply(2.0);
```

## 方法引用

除了lambda, Java 8 中也引入了方法引用（ method reference ），即当lambda 的实现是一个单参的方法调用时，用于替换这个lambda 的语法。
ps: 记得第一次接触这种写法，应该是在 C++ 中。

例如：

`Math::sin` 实际上等价于 `x->Math.sin(x)`

## 应该用匿名函数还是命名函数

除了那些用不了匿名函数的特殊场合外，你可以自行决定是用匿名函数还是命名函数。

有一个基本规则： **仅使用一次的函数可以被定义为匿名实例**。但是只用一次，就意味着你只编写函数一次，并不意味着仅仅实例化一次。

在以下例子里，定义一个方法来计算Double 值的余弦。

这个方法使用两个匿名函数实现， 因为你用了一个 lambda 表达式和一个方法引用：

```java
Function.compose(x->Math.PI/2-x, Math::sin).apply(2.0);
```

不必担心创建匿名实例。Java 不会在每次调用函数时都创建新的对象。另外，实例化这样的对象代价很低。

**你只应该从考虑代码的整洁性和可维护性的角度上决定是使用匿名函数还是命名函数。如果你考虑的是性能与重用性，那就应该尽量使用方法引用。**

使用方法引用的另一个理由：有时候匿名函数的类型推断会出错=。

# 局部函数

你方才看到了可以在方法内部定义函数，但是不能在方法内部定义方法。

另一方面，函数可以用 lambda 的形式完美地定义在函数内部。

正如先前所说，这两种形式（即是否使用局部命名函数）有一点不同可能有时候会很重要。

当涉及类型推断时，使用命名函数意味着需要显式地指定类型，这样在编译器无法正确推断的时候是非常有必要的。

它不仅对编译器有用，对那些在类型方面不擅长的程序员来说也是一个莫大的帮助。

显式地编写期望的类型有助于定位到与预期不符的地方。

# 闭包

你己经知道纯函数计算的返回值不应该依赖于参数以外的东西。

Java 方法经常访问类成员，不仅会读取，甚至还会写入。方法也会访问其他类的静态成员。

我已经说过，函数式方法是遵守引用透明性的方法，这意味着它们除了返回一个值以外不会有其他可观测到的作用。函数亦如是。

函数只在没有可观测到的副作用时才是纯函数。

可是如果函数（还有方法）的返回结果不仅依赖于它们的参数，还依赖于外围作用域的元素呢？

你己经看过了这样的例子，这些外围作用域里的元素可以被视为函数或方法的隐式参数。

lambda 还有附加要求： 一个lambda 访问的局部变量必须是final 的。这

并不是lambda 的新要求， 而是Java 8 以前的版本对匿名类的要求，而 lambda 也需要遵守相同的约定，虽然它并没有那么严格。

自 Java 8 起，从匿名类或是lambda 访问的元素都是**隐式 final 的**：它们无须被声明为 final 来表明它们是不会被改变的。

ps: jdk7 及其以前需要显式指定内部类的变量为 final。

让我们来看看这个例子：

```java
public void asMethod() {
    double price = 2;
    Function<Double, Double> doubleFunction = x -> x+price;
}
```

- 编译不通过的例子

```java
public void asMethod2() {
    double price = 2;
    Function<Double, Double> doubleFunction = x -> x+price;
    price +=2;
}
```

请注意，这个要求只适用于局部变量。

- 全局变量

```java
double price = 2;

public void asMethod3() {
    Function<Double, Double> doubleFunction = x -> x+price;
    price +=2;
}
```

这种写法是可以的，因为被认为是一个隐式参数。

doubleFunction 并不是 x 的函数，因为它不会为相同的参数返回相同的结果。然而，它可以被视为一个元组(x, price)的函数。

如果你把它们当作附加的隐式参数，那么闭包与纯函数可相互兼容。

然而，它们可能会在重构代码，或是作为参数传递给其他函数时带来问题。这样会导致程序不易读并且不好维护。

## 元组的方式

用元组作为函数的参数是让程序更加模块化的一种方式：

```java
double rate = 0.9;

Function<Pair<Double, Double>, Double> function = t -> t.getValueOne() + t.getValueOne()* t.getValueTwo();
System.out.println(function.apply(Pair.of(100.0, rate)));
```

## 新定义接口的方式

- 新接口

```java
public interface Function2<T, U, V> {

    V apply(U u, V v);

}
```

使用如下：

```java
double rate = 0.9;
Function2<Double, Double, Double> function2 = (m, r)-> m + m*r;
System.out.println(function2.apply(100.0, rate));
```

## 更好的解决方案

你也可以用Java 8 定义的Bi Function 类，它模拟了接收二元组参数的函数。还有BinaryOperator ，相当于类型相同的二元组参数的函数，还有DoubleBinaryOperator ，接收的都是double 原始类型的二元组。

所有这些备
选都挺好，但如果需要三个或更多的参数，那该怎么办呢？

可以定义Function3 、Function4 ，如此这般。

但是**柯里化是一个更棒的解决方案**。

这就是为什么学习使用柯里化非常有必要，而且正如你所见，它非常简单：

```java
double rate = 0.9;
Function<Double, Function<Double, Double>> function = r->p->p+p*r;
System.out.println(function.apply(rate).apply(100.0));
```

# 部分函数应用和自动柯里化

上一个例子中的闭包和柯里化版本都可以得到相同的结果，可以认为它们等价。

可事实上，它们在“语义上”有所不同。正如我所说，这两个参数的作用截然不同。

税率并不会经常变化，而价格很可能在每次调用时会变化。

在闭包版本中尤其如此。函数封闭了一个不会变化（因为它是final 的）的参数。

在柯里化版本中，两个参数都可能会随每次调用而变化，虽然税率并不会比闭包版本变化更频繁。

改变税率的需求还是挺常见的，例如当产品类别或运输目的地不同时通常有几种税率。

## 传统实现

在传统的Java 中，这是通过把类转换成一个参数化的“税计算器”来实现的：

```java
public class TaxComputer {

    private final double rate;

    public TaxComputer(double rate) {
        this.rate = rate;
    }

    public double compute(final double price) {
        return price + price*rate;
    }

}
```

## 部分函数化

```java
 Function<Double, Function<Double, Double>> function = r->p->p+p*r;

// 部分函数化
Function<Double, Double> rate9 = function.apply(0.9);
System.out.println(rate9.apply(100.0));
```

你可以看到柯里化和部分应用紧密地联系着。

柯里化包括了把接收元组的函数替换为可以部分应用各个参数的函数。这是柯里化函数和元组函数最主要的区别。

使用元组函数，所有的参数都在调用函数之前就计算出来了。

使用柯里化版本，所有的参数都必须在完全应用函数之前确定，但是每个单独的参数都可以在函数部分应用它之前才计算。你不必将函数完全柯里化。

一个接收三个参数的函数可以被柯里化为一个生成单参函数的二元组函数。

在函数式编程里，柯里化和部分应用函数用得如此频繁，抽象这些操作以允许自动使用便显得非常有帮助。

在前面的章节中， 只用了柯里化函数而非元组函数。这显示出了一大优势：部分应用函数绝对非常**直观**。


# 交换函数参数顺序

如果有一个双参函数，也许你会想要仅应用第一个参数来得到一个部分应用函数。

比如说你有如下函数：

```java
Function<Double, Function<Double, Double>> addTax = x->y->y+y/100*x;


Function<Double, Double> rate9 = addTax.apply(9.0);
System.out.println(rate9.apply(100.0));
```

可是如果函数一开始是这样的怎么办？

```java
Function<Double, Function<Double, Double>> addTax2 = x->y->x+x/100*y;
```

你如何首先构建出一个 rate 固定的函数呢？（假设我们无法直接修改函数）

## 使用反序函数

```java
/**
 * 参数反序
 * @param f 函数
 * @param <T> 泛型
 * @param <U> 泛型
 * @param <V> 泛型
 * @return 结果
 */
public static <T, U, V> Function<U, Function<T, V>> reverseArgs(Function<T, Function<U, V>> f) {
    return u->t->f.apply(t).apply(u);
}
```

结果:

```java
Function<Double, Function<Double, Double>> addTax2 = x->y->x+x/100*y;
Function<Double, Double> rate2_9 = addTax2.apply(9.0);
System.out.println(rate2_9.apply(100.0));

//reverse
double result = reverseArgs(addTax2).apply(9.0).apply(100.0);
System.out.println(result);
```

# 递归函数

在诸多函数式编程语言中，递归函数是一项必备功能，虽然递归和函数式编程没有什么关系。

有些函数式程序员甚至认为递归是函数式编程的 goto 功能，应该尽量避免使用。

然而作为函数式程序员，必须掌握递归，哪怕你最终决定不去使用。

如你所知， Java 在递归上的能力有限。

方法可以递归地调用自己，但是这也意味着每次递归调用时，计算的状态都被压入战中，直至满足终止条件为止。

此时所有先前的计算状态都被弹出枝， 一个接一个地被赋值。

栈的大小是可配置的，不过所有的线程都会使用相同的大小。

默认的大小取决于 java 的实现，从32 位版本的320KB 到64 位实现的1064KB ，与存储对象的堆的大小相比，它们实在是微不足道。

这样导致的结果就是递归的次数有限。

确定 java 能处理多少次递归有些困难，因为它取决于入校数据的大小，以及在递归处理开始时梭的状态。

一般来说， Java 可以处理 5000 到 6000 次递归。

由于 java 内部使用了记忆化，因此使得人为挑战这个极限成为可能。

这个技术包括将函数或方法的返回结果存放在内存中以便加快未来的访问。

如果先前存放过， java无须重新计算便可以直接从内存中获取结果。

除了加快访问速度，这么做还能更快地找到终止状态，从而在一定程度上避免递归。

我们将会在第 4 章再回到这个主题， 你将在那里学到如何在 Java 里创建基于堆的递归。

在本节的剩余部分，暂且认为Java 的标准递归不会出问题。

## 函数式递归

```java
private final Function<Integer, Integer> function = n -> n == 0 ? n : this.function.apply(n-1);
```

# 恒等函数

你己经见到了，在函数式编程里，函数是被当作数据来对待的。

它们可以作为参数传递给其他函数，可以被函数返回，也可以用于操作，如同 integer 或 double 。

在后面的程序中，你还会把函数应用于操作， 还需要一个中性元素或者说是恒等元素来满足这些操作。

一个中性的元素就像是求和中的0 ，求积中的1 ，或者是字符串拼接中的空字符串。

## 定义

可以把恒等函数命名为 identity 方法，添加到Function 类的定义中，以返回恒等函数：

```java
static <T> Function<T, T> identity() {
    return t -> t;
}
```

## 完整的函数列表

```java
/**
 * <p> project: fp-learn-Function </p>
 * <p> create on 2020/6/6 9:35 </p>
 *
 * @author binbin.hou
 * @since chap2
 */
public interface Function<T, U> {

    /**
     * 核心方法
     * @param s 泛型
     * @return 结果
     * @since chap2
     */
    U apply(T s);

    /**
     * 恒等函数
     * @param <T> 泛型
     * @return 函数
     * @since chap2
     */
    static <T> Function<T, T> identity() {
        return t -> t;
    }

    /**
     * 组合
     * @param f 函数
     * @param <V> 泛型
     * @return 结果
     * @since chap2
     */
    default <V> Function<V, U> compose(Function<V, T> f) {
        return x->apply(f.apply(x));
    }

    /**
     * 反序
     * @param f 函数
     * @param <V> 泛型
     * @return 结果
     * @since chap2
     */
    default <V> Function<T, V> andThen(Function<U, V> f) {
        return x->f.apply(apply(x));
    }

    static <T, U, V> Function<V, U> compose(final Function<T, U> f,
                                            final Function<V, T> g) {
        return x->f.apply(g.apply(x));
    }

    static <T, U, V> Function<T, V> andThen(final Function<T, U> f,
                                            final Function<U, V> g) {
        return x->g.apply(f.apply(x));
    }

    static <T, U, V> Function<Function<T, U>,
            Function<Function<U,V>, Function<T, V>> > compose() {
        return x->y->y.compose(x);
    }

    static <T, U, V> Function<Function<T, U>,
            Function<Function<V,T>, Function<V, U>> > andThen() {
        return x->y->y.andThen(x);
    }

    static <T, U, V> Function<Function<U, V>,
            Function<Function<T, U>, Function<T, V>>>higherCompose() {
        return f->g->x->f.apply(g.apply(x));
    }

    static <T, U, V> Function<Function<T, U>,
            Function<Function<U, V>, Function<T, V>>>higherAndThen() {
        return x->y->z->y.apply(x.apply(z));
    }

}
```

# 个人收获

每个知识点如果按照细化，内容确实非常多。

本节关于函数洋洋洒洒近万字，比我原来走马观花看一遍的收获更多，花的时间也更多。

# 参考资料

《java 函数式编程》

* any list
{:toc}