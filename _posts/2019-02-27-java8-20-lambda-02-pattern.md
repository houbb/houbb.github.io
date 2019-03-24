---
layout: post
title: Java8-20-lambda 设计模式
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, jdk8, functional, sh]
published: true
---

# 使用 Lambda 重构面向对象的设计模式

## 语言特性对于技术的推动

**新的语言特性常常让现存的编程模式或设计黯然失色。**

比如， Java 5中引入了 foreach 循环，由于它的稳健性和简洁性，已经替代了很多显式使用迭代器的情形。

Java 7中推出的菱形操作符（`<>`）让大家在创建实例时无需显式使用泛型，一定程度上推动了Java程序员们采用类型接口（type interface）进行程序设计。

## lambda 对于设计模式的影响

对设计经验的归纳总结被称为设计模式。

设计软件时，如果你愿意，可以复用这些方式方法来解决一些常见问题。这看起来像传统建筑工程师的工作方式，对典型的场景（比如悬挂桥、拱桥等）都定义有可重用的解决方案。

例如，访问者模式常用于分离程序的算法和它的操作对象。单例模式一般用于限制类的实例化，仅生成一份对象Lambda表达式为程序员的工具箱又新添了一件利器。

它们为解决传统设计模式所面对的问题提供了新的解决方案，不但如此，采用这些方案往往更高效、更简单。

使用Lambda表达式后，很多现存的略显臃肿的面向对象设计模式能够用更精简的方式实现了。

这一节中，我们会针对五个设计模式展开讨论，它们分别是：

- 策略模式

- 模板方法

- 观察者模式

- 责任链模式

- 工厂模式

我们会展示Lambda表达式是如何另辟蹊径解决设计模式原来试图解决的问题的。

# 策略模式

策略模式代表了解决一类算法的通用解决方案，你可以在运行时选择使用哪种方案。

在第2章中你已经简略地了解过这种模式了，当时我们介绍了如何使用不同的条件（比如苹果的重量，或者颜色）来筛选库存中的苹果。

你可以将这一模式应用到更广泛的领域，比如使用不同的标准来验证输入的有效性，使用不同的方式来分析或者格式化输入。

## 内容

策略模式包含三部分内容：

1. 一个代表某个算法的接口（它是策略模式的接口）。

2. 一个或多个该接口的具体实现，它们代表了算法的多种实现（比如，实体类 ConcreteStrategyA 或者 ConcreteStrategyB ）。

3. 一个或多个使用策略对象的客户。

## 应用场景

我们假设你希望验证输入的内容是否根据标准进行了恰当的格式化（比如只包含小写字母或数字）。

你可以从定义一个验证文本（以 String 的形式表示）的接口入手：

```java
interface ValidationStrategy {
    boolean execute(String s);
}
```

其次，你定义了该接口的一个或多个具体实现：

```java
static class IsAllLowerCase implements ValidationStrategy {

    @Override
    public boolean execute(String s) {
        return s.matches("[a-z]+");
    }
}
```

```java
static class IsNumeric implements ValidationStrategy {

    @Override
    public boolean execute(String s) {
        return s.matches("\\d+");
    }
}
```

之后，你就可以在你的程序中使用这些略有差异的验证策略了：

```java
private static class Validator {
    private final ValidationStrategy validationStrategy;

    public Validator(ValidationStrategy validationStrategy) {
        this.validationStrategy = validationStrategy;
    }

    public boolean validate(String s) {
        return validationStrategy.execute(s);
    }
}

Validator v1 = new Validator(new IsNumeric());
// false
System.out.println(v1.validate("aaaa"));
Validator v2 = new Validator(new IsAllLowerCase());
// true
System.out.println(v2.validate("bbbb"));
```

## 使用Lambda表达式

到现在为止，你应该已经意识到 ValidationStrategy 是一个函数接口了（除此之外，它还与 Predicate 具有同样的函数描述）。

这意味着我们不需要声明新的类来实现不同的策略，通过直接传递Lambda表达式就能达到同样的目的，并且还更简洁：

```java
Validator v3 = new Validator((String s) -> s.matches("\\d+"));
System.out.println(v3.validate("aaaa"));
Validator v4 = new Validator((String s) -> s.matches("[a-z]+"));
System.out.println(v4.validate("bbbb"));
```

正如你看到的，Lambda 表达式避免了采用策略设计模式时僵化的模板代码。

如果你仔细分析一下个中缘由，可能会发现，Lambda表达式实际已经对部分代码（或策略）进行了封装，而这就是创建策略设计模式的初衷。

因此，我们强烈建议对类似的问题，你应该尽量使用Lambda表达式来解决。

# 模板方法

如果你需要采用某个算法的框架，同时又希望有一定的灵活度，能对它的某些部分进行改进，那么采用模板方法设计模式是比较通用的方案。

好吧，这样讲听起来有些抽象。

换句话说，模板方法模式在你“希望使用这个算法，但是需要对其中的某些行进行改进，才能达到希望的效果”时是非常有用的。

## 例子

让我们从一个例子着手，看看这个模式是如何工作的。

假设你需要编写一个简单的在线银行应用。通常，用户需要输入一个用户账户，之后应用才能从银行的数据库中得到用户的详细信息，最终完成一些让用户满意的操作。

不同分行的在线银行应用让客户满意的方式可能还略有不同，比如给客户的账户发放红利，或者仅仅是少发送一些推广文件。

你可能通过下面的抽象类方式来实现在线银行应用：

```java
public abstract class AbstractOnlineBanking {
    public void processCustomer(int id) {
        Customer customer = Database.getCustomerWithId(id);
        makeCustomerHappy(customer);
    }

    /**
     * 让客户满意
     *
     * @param customer
     */
    abstract void makeCustomerHappy(Customer customer);

    private static class Customer {}

    private static class Database {
        static Customer getCustomerWithId(int id) {
            return new Customer();
        }
    }
}
```

processCustomer() 方法搭建了在线银行算法的框架：获取客户提供的ID，然后提供服务让用户满意。不同的支行可以通过继承 AbstractOnlineBanking 类，对该方法提供差异化的实现。

## 使用Lambda表达式

使用你偏爱的Lambda表达式同样也可以解决这些问题（创建算法框架，让具体的实现插入某些部分）。你想要插入的不同算法组件可以通过Lambda表达式或者方法引用的方式实现。

这里我们向 processCustomer 方法引入了第二个参数，它是一个 Consumer 类型的参数，与前文定义的 makeCustomerHappy 的特征保持一致：

```java
public void processCustomer(int id, Consumer<Customer> makeCustomerHappy) {
    Customer customer = Database.getCustomerWithId(id);
    makeCustomerHappy.accept(customer);
}
```

现在，你可以很方便地通过传递Lambda表达式，直接插入不同的行为，不再需要继承AbstractOnlineBanking 类了：

```java
public static void main(String[] args) {
    new AbstractOnlineBankingLambda().processCustomer(1337, (
        AbstractOnlineBankingLambda.Customer c) -> System.out.println("Hello!"));
}
```

这是又一个例子，佐证了Lamba表达式能帮助你解决设计模式与生俱来的设计僵化问题。

ps: 模板方法是为了差异化的实现，实际上通过参数化传递可以达到。

同样的道理，决策模式为了不同场景的路由，也可以通过 lambda 来实现。

# 观察者模式

观察者模式是一种比较常见的方案，某些事件发生时（比如状态转变），如果一个对象（通常我们称之为主题）需要自动地通知其他多个对象（称为观察者），就会采用该方案。创建图形用户界面（GUI）程序时，你经常会使用该设计模式。这种情况下，你会在图形用户界面组件（比如按钮）上注册一系列的观察者。如果点击按钮，观察者就会收到通知，并随即执行某个特定的行为。 

但是观察者模式并不局限于图形用户界面。

比如，观察者设计模式也适用于股票交易的情形，多个券商可能都希望对某一支股票价格（主题）的变动做出响应。

## 例子

让我们写点儿代码来看看观察者模式在实际中多么有用。你需要为Twitter这样的应用设计并实现一个定制化的通知系统。想法很简单：好几家报纸机构，比如《纽约时报》《卫报》以及《世界报》都订阅了新闻，他们希望当接收的新闻中包含他们感兴趣的关键字时，能得到特别通知。

首先，你需要一个观察者接口，它将不同的观察者聚合在一起。它仅有一个名为 notify 的方法，一旦接收到一条新的新闻，该方法就会被调用：

```java
interface Observer{
    void inform(String tweet);
}
```

现在，你可以声明不同的观察者（比如，这里是三家不同的报纸机构），依据新闻中不同的关键字分别定义不同的行为：

```java
private static class NYTimes implements Observer {

    @Override
    public void inform(String tweet) {
        if (tweet != null && tweet.contains("money")) {
            System.out.println("Breaking news in NY!" + tweet);
        }
    }
}
```

```java
private static class Guardian implements Observer {

    @Override
    public void inform(String tweet) {
        if (tweet != null && tweet.contains("queen")) {
            System.out.println("Yet another news in London... " + tweet);
        }
    }
}

private static class LeMonde implements Observer {

    @Override
    public void inform(String tweet) {
        if(tweet != null && tweet.contains("wine")){
            System.out.println("Today cheese, wine and news! " + tweet);
        }
    }
}
```

你还遗漏了最重要的部分： Subject ！让我们为它定义一个接口：

```java
interface Subject {
    void registerObserver(Observer o);

    void notifyObserver(String tweet);
}
```

Subject 使用 registerObserver 方法可以注册一个新的观察者，使用 notifyObservers方法通知它的观察者一个新闻的到来。

让我们更进一步，实现 Feed 类：

```java
private static class Feed implements Subject {

    private final List<Observer> observers = new ArrayList<>();

    @Override
    public void registerObserver(Observer o) {
        observers.add(o);
    }

    @Override
    public void notifyObserver(String tweet) {
        observers.forEach(o -> o.inform(tweet));
    }
}
```

这是一个非常直观的实现： Feed 类在内部维护了一个观察者列表，一条新闻到达时，它就进行通知。

毫不意外，《卫报》会特别关注这条新闻！

## 使用Lambda表达式

你可能会疑惑Lambda表达式在观察者设计模式中如何发挥它的作用。

不知道你有没有注意到， Observer 接口的所有实现类都提供了一个方法： inform。

新闻到达时，它们都只是对同一段代码封装执行。

Lambda表达式的设计初衷就是要消除这样的僵化代码。

使用Lambda表达式后，你无需显式地实例化三个观察者对象，直接传递Lambda表达式表示需要执行的行为即可：

```java
Feed feedLambda = new Feed();
feedLambda.registerObserver((String tweet) -> {
    if (tweet != null && tweet.contains("money")) {
        System.out.println("Breaking news in NY!" + tweet);
    }
});

feedLambda.registerObserver((String tweet) -> {
    if (tweet != null && tweet.contains("queen")) {
        System.out.println("Yet another news in London... " + tweet);
    }
});

feedLambda.notifyObserver("Money money money, give me money!");
```

那么，是否我们随时随地都可以使用Lambda表达式呢？

答案是否定的！我们前文介绍的例子中，Lambda适配得很好，那是因为需要执行的动作都很简单，因此才能很方便地消除僵化代码。

但是，观察者的逻辑有可能十分复杂，它们可能还持有状态，抑或定义了多个方法，诸如此类。

在这些情形下，你还是应该继续使用类的方式。

# 责任链模式

责任链模式是一种创建处理对象序列（比如操作序列）的通用方案。

一个处理对象可能需要在完成一些工作之后，将结果传递给另一个对象，这个对象接着做一些工作，再转交给下一个处理对象，以此类推。

通常，这种模式是通过定义一个代表处理对象的抽象类来实现的，在抽象类中会定义一个字段来记录后续对象。

一旦对象完成它的工作，处理对象就会将它的工作转交给它的后继。

## 代码

代码中，这段逻辑看起来是下面这样：

```java
private static abstract class AbstractProcessingObject<T> {
    protected AbstractProcessingObject<T> successor;

    public void setSuccessor(AbstractProcessingObject<T> successor) {
        this.successor = successor;
    }

    public T handle(T input) {
        T r = handleWork(input);
        if (successor != null) {
            return successor.handle(r);
        }
        return r;
    }

    protected abstract T handleWork(T input);
}
```

下面让我们看看如何使用该设计模式。

你可以创建两个处理对象，它们的功能是进行一些文本处理工作。

```java
private static class HeaderTextProcessing extends AbstractProcessingObject<String> {

    @Override
    protected String handleWork(String text) {
        return "From Raoul, Mario and Alan: " + text;
    }
}

private static class SpellCheckerProcessing extends AbstractProcessingObject<String> {

    @Override
    protected String handleWork(String text) {
        return text.replaceAll("labda", "lambda");
    }
}
```

现在你就可以将这两个处理对象结合起来，构造一个操作序列！

```java
AbstractProcessingObject<String> p1 = new HeaderTextProcessing();
AbstractProcessingObject<String> p2 = new SpellCheckerProcessing();
p1.setSuccessor(p2);
String result = p1.handle("Aren't labdas really sexy?!!");
System.out.println(result);
```

## 使用Lambda表达式

稍等！这个模式看起来像是在链接（也即是构造） 函数。

第3章中我们探讨过如何构造Lambda表达式。你可以将处理对象作为函数的一个实例，或者更确切地说作为 UnaryOperator 的一个实例。

为了链接这些函数，你需要使用 andThen 方法对其进行构造。

```java
UnaryOperator<String> headerProcessing =
            (String text) -> "From Raoul, Mario and Alan: " + text;

UnaryOperator<String> spellCheckerProcessing =
        (String text) -> text.replaceAll("labda", "lambda");

Function<String, String> pipeline = headerProcessing.andThen(spellCheckerProcessing);

String result2 = pipeline.apply("Aren't labdas really sexy?!!");
System.out.println(result2);
```

# 工厂模式

使用工厂模式，你无需向客户暴露实例化的逻辑就能完成对象的创建。

比如，我们假定你为一家银行工作，他们需要一种方式创建不同的金融产品：贷款、期权、股票，等等。

## 常规实现

通常，你会创建一个工厂类，它包含一个负责实现不同对象的方法，如下所示：

```java
private interface Product {
}

private static class ProductFactory {
    public static Product createProduct(String name) {
        switch (name) {
            case "loan":
                return new Loan();
            case "stock":
                return new Stock();
            case "bond":
                return new Bond();
            default:
                throw new RuntimeException("No such product " + name);
        }
    }
}

static private class Loan implements Product {
}

static private class Stock implements Product {
}

static private class Bond implements Product {
}
```

这里贷款（ Loan ）、股票（ Stock ）和债券（ Bond ）都是产品（ Product ）的子类。

createProduct 方法可以通过附加的逻辑来设置每个创建的产品。但是带来的好处也显而易见，你在创建对象时不用再担心会将构造函数或者配置暴露给客户，这使得客户创建产品时更加简单：

```java
Product p1 = ProductFactory.createProduct("loan");
```

## 使用Lambda表达式

第3章中，我们已经知道可以像引用方法一样引用构造函数。

比如，下面就是一个引用贷款（ Loan ）构造函数的示例：

```java
Supplier<Product> loanSupplier = Loan::new;
Product p2 = loanSupplier.get();
```

通过这种方式，你可以重构之前的代码，创建一个 Map ，将产品名映射到对应的构造函数：

```java
final static private Map<String, Supplier<Product>> map = new HashMap<>();

static {
    map.put("loan", Loan::new);
    map.put("stock", Stock::new);
    map.put("bond", Bond::new);
}
```

现在，你可以像之前使用工厂设计模式那样，利用这个 Map 来实例化不同的产品。

```java
public static Product createProductLambda(String name) {
    Supplier<Product> p = map.get(name);
    if (p != null) {
        return p.get();
    }
    throw new RuntimeException("No such product " + name);
}
```

这是个全新的尝试，它使用Java 8中的新特性达到了传统工厂模式同样的效果。

但是，如果工厂方法 createProduct 需要接收多个传递给产品构造方法的参数，这种方式的扩展性不是很好。

你不得不提供不同的函数接口，无法采用之前统一使用一个简单接口的方式。

比如，我们假设你希望保存具有三个参数（两个参数为 Integer 类型，一个参数为 String类型）的构造函数；为了完成这个任务，你需要创建一个特殊的函数接口 TriFunction 。最终的结果是 Map 变得更加复杂。

```java
public interface TriFunction<T, U, V, R>{
    R apply(T t, U u, V v);
}
Map<String, TriFunction<Integer, Integer, String, Product>> map = new HashMap<>();
```

你已经了解了如何使用Lambda表达式编写和重构代码。

接下来，我们会介绍如何确保新编写代码的正确性。

ps: 这里其实是使用了 map 去维护这种映射关系，和 lambda 的关系倒不是很大。

个人感觉 map 维护映射关系，实际上和决策模式非常相似。

# 参考资料

《java8 实战》

[【Java8实战】开始使用流](https://mrbird.cc/blog/java8stream1.html)

[JDK8 实战系列](https://juejin.im/user/5ad35e786fb9a028cd458b59/posts)

* any list
{:toc}