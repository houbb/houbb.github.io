---
layout: post
title: Byte Buddy-01-字节码生成入门介绍
date:  2019-10-30 10:18:30 +0800
categories: [Java]
tags: [java, bytecode, sf]
published: true
---

# Byte Buddy

[Byte Buddy](https://github.com/raphw/byte-buddy) 是一个代码生成和操作库，用于在Java应用程序运行时创建和修改Java类，而无需编译器的帮助。 

除了Java类库附带的代码生成实用程序外，Byte Buddy还允许创建任意类，并且不限于实现用于创建运行时代理的接口。 

此外，Byte Buddy提供了一种方便的API，可以使用Java代理或在构建过程中手动更改类。

## 简洁优雅的 api

为了使用字节伙伴，不需要了解Java字节码或类文件格式。 

相比之下，Byte Buddy的API的目标是使每个人的代码简洁明了。 

尽管如此，字节伙伴仍然可以完全自定义，直到可以定义自定义字节码。 

此外，该API被设计为尽可能非侵入性，因此，Byte Buddy在其创建的类中没有留下任何痕迹。 

因此，生成的类可以存在，而无需在类路径上使用字节伙伴。 

由于此功能，Byte Buddy的吉祥物被选为幽灵。

Byte Buddy用Java 5编写，但支持生成任何Java版本的类。 

Byte Buddy是一个轻量级的库，仅取决于Java字节代码解析器库ASM的访问者API，而该API本身不需要任何其他依赖项。

## 场景

乍一看，应该避免运行时代码生成，这是应该避免的，并且只有很少的开发人员编写在运行时显式生成代码的应用程序。 

但是，当创建需要与编译时未知的任意代码和类型进行交互的库时，此情况会发生变化。 

在这种情况下，库实现者必须经常在要求用户实现库专有接口或在库首次得知用户类型时在运行时生成代码之间进行选择。 

许多已知的库（例如Spring或Hibernate）选择后一种方法，这种方法在使用Plain Old Java Objects的术语下在其用户中很流行。 

结果，代码生成已成为Java领域中普遍存在的概念。 

Byte Buddy尝试创新Java类型的运行时创建，以便为依赖代码生成的用户提供更好的工具集。

## 性能

Byte Buddy以生产质量提供出色的性能。 

它是稳定的，并被著名的框架和工具（例如Mockito，Hibernate，Jackson，Google的Bazel构建系统等）使用。 

Byte Buddy也被许多商业产品使用，以取得很好的效果。 

目前每年下载超过7500万次。


# hello world

用Byte Buddy说Hello World很容易。 

Java类的任何创建都以ByteBuddy类的实例开始，该实例代表用于创建新类型的配置：

```java
Class<?> dynamicType = new ByteBuddy()
  .subclass(Object.class)
  .method(ElementMatchers.named("toString"))
  .intercept(FixedValue.value("Hello World!"))
  .make()
  .load(getClass().getClassLoader())
  .getLoaded();
assertThat(dynamicType.newInstance().toString(), is("Hello World!"));
```

上面的示例中使用的默认ByteBuddy配置会以处理文件Java虚拟机可以理解的类文件格式的最新版本创建一个Java类。

从示例代码中可以明显看出，创建的类型将扩展Object类并覆盖其toString方法，该方法应返回Hello World！的固定值。

要覆盖的方法由所谓的ElementMatcher标识。

在上面的示例中，使用了一个名为（String）的预定义元素匹配器，该匹配器通过其确切名称来标识方法。

Byte Buddy附带了许多预定义的和经过良好测试的匹配器，这些匹配器收集在ElementMatchers类中，并且可以轻松组成。

但是，自定义匹配器的创建与实现（功能性）ElementMatcher接口一样简单。

为了实现toString方法，FixedValue类为重写的方法定义了一个恒定的返回值。

定义常数只是Byte Buddy附带的许多方法拦截器的一个示例。

但是，通过实现Implementation接口，甚至可以通过自定义字节码定义方法。

最后，创建所描述的Java类，然后将其加载到Java虚拟机中。

为此，需要一个目标类加载器。

最终，我们可以通过在创建的类的实例上调用toString方法并找到代表我们期望的常量值的返回值来使结果令人信服。


# 一个更复杂的例子

当然，Hello World示例对于评估代码生成库的质量来说太简单了。

实际上，这样一个库的用户想要执行更复杂的操作，例如通过将钩子引入Java程序的执行路径中。

但是，使用Byte Buddy同样容易。以下示例介绍了如何截获方法调用。

Byte Buddy通过Implementation接口的实例表达了动态定义的方法实现。

在前面的示例中，已经演示了实现此接口的FixedValue。

通过实现此接口，Byte Buddy的用户可以花很多时间为方法定义自定义字节码。

但是，通常情况下，使用Byte Buddy的预定义实现（例如MethodDelegation）会更容易，该方法允许以纯Java实现任何方法。

使用此实现很简单，因为它通过将控制流委派给任何POJO进行操作。

## 例子

作为这样的POJO的一个示例，Byte Buddy可以例如将调用重定向到以下类的唯一方法：

```java
public class GreetingInterceptor {
  public Object greet(Object argument) {
    return "Hello from " + argument;
  }
}
```

请注意，上面的GreetingInterceptor不依赖于 byte buddy 类型。 

这是个好消息，因为Byte Buddy生成的所有类都不需要在类路径上使用Byte Buddy！ 

给定上面的GreetingInterceptor，我们可以使用Byte Buddy来实现Java 8 java.util.function.Function接口及其抽象的apply方法：

```java
Class<? extends java.util.function.Function> dynamicType = new ByteBuddy()
  .subclass(java.util.function.Function.class)
  .method(ElementMatchers.named("apply"))
  .intercept(MethodDelegation.to(new GreetingInterceptor()))
  .make()
  .load(getClass().getClassLoader())
  .getLoaded();
assertThat((String) dynamicType.newInstance().apply("Byte Buddy"), is("Hello from Byte Buddy"));
```

执行上面的代码，Byte Buddy实现Java的Function接口，并实现apply方法作为对我们之前定义的GreetingInterceptor POJO实例的委托。 

现在，每次调用Function::apply方法时，控制流都会分派到GreetingInterceptor::greet，并且后者的返回值从接口的方法中返回。

通过注释拦截器的参数，可以将拦截器定义为具有更通用的输入和输出。 

当Byte Buddy发现注释时，库将注入拦截器参数所需的依赖项。 

## 更通用的例子

下面是一个更通用的拦截器示例：

```java
public class GeneralInterceptor {
  @RuntimeType
  public Object intercept(@AllArguments Object[] allArguments,
                          @Origin Method method) {
    // intercept any method of any signature
  }
}
```

使用上述拦截器，任何被拦截的方法都可以进行匹配和处理。

例如，当匹配Function::apply时，该方法的参数将作为数组的单个元素传递。

同样，由于@Origin批注，对Fuction::apply的Method引用将作为拦截器的第二个参数传递。

通过在方法上声明@RuntimeType批注，Byte Buddy最终在需要时将返回值强制转换为被拦截方法的返回值。

这样，字节好友也可以应用自动装箱和拆箱。

除了已经提到的注释之外，还有许多其他预定义的注释。

例如，在Runnable或Callable类型上使用@SuperCall批注时，Byte Buddy注入代理实例，如果存在此类实例，则允许调用非抽象的super方法。

即使Byte Buddy不涵盖用例，Byte Buddy也提供了用于定义自定义注释的扩展机制。

您可能希望使用这些注释将您的代码与Byte Buddy绑定。

但是，如果注释对类加载器不可见，则Java将忽略它们。

这样，如果没有Byte Buddy，生成的代码仍然可以存在！

您可以在其Javadoc和Byte Buddy的教程中找到有关MethodDelegation及其所有预定义批注的更多信息。


# 更改现有课程

字节伙伴不仅限于创建子类，而且还能够重新定义现有代码。 

为此，Byte Buddy提供了一个方便的API，用于定义所谓的Java代理。 

Java代理是普通的旧Java程序，可用于在运行时更改现有Java应用程序的代码。 

例如，我们可以使用字节伙伴来更改方法以打印其执行时间。 

为此，我们首先定义一个类似于前面示例中的拦截器的拦截器：

```java
public class TimingInterceptor {
  @RuntimeType
  public static Object intercept(@Origin Method method, 
                                 @SuperCall Callable<?> callable) {
    long start = System.currentTimeMillis();
    try {
      return callable.call();
    } finally {
      System.out.println(method + " took " + (System.currentTimeMillis() - start));
    }
  }
}
```

使用Java代理，我们现在可以将此拦截器应用于与TypeDescription的ElementMatcher匹配的所有类型。 

对于示例，我们选择将上述拦截器添加到名称以Timed结尾的所有类型。

这样做是为了简单起见，而注解可能是为生产代理标记此类的更合适的替代方法。 
 
使用Byte Buddy的AgentBuilder API，创建Java代理就像定义以下代理类一样容易：

```java
public class TimerAgent {
  public static void premain(String arguments, 
                             Instrumentation instrumentation) {
    new AgentBuilder.Default()
      .type(ElementMatchers.nameEndsWith("Timed"))
      .transform((builder, type, classLoader, module) -> 
          builder.method(ElementMatchers.any())
                 .intercept(MethodDelegation.to(TimingInterceptor.class))
      ).installOn(instrumentation);
  }
}
```

与Java的main方法类似，premain方法是我们应用重新定义的任何Java代理的入口点。

作为一个参数，Java代理接收Instrumentation接口的一个实例，该实例允许Byte Buddy挂接到JVM的标准API中以进行运行时类重新定义。

该程序与清单文件一起打包，清单文件的Premain-Class属性指向TimerAgent。

现在，可以通过设置 `-javaagent：timingagent.jar` 将生成的jar文件添加到任何Java应用程序中，就像将jar添加到类路径中一样。

在代理处于活动状态时，所有以Timed结尾的类现在都将其执行时间打印到控制台。

Byte Buddy还能够通过禁用类文件格式更改并使用Advice工具来应用所谓的运行时附件。

有关更多信息，请参考Advice和AgentBuilder类的javadoc。 

Byte Buddy还通过ByteBuddy实例或使用Byte Buddy Maven和Gradle插件来显式更改Java类。

# 构建Java Agent，而不是使用框架

Java annotations自从被引入到Java之后，一直扮演着整合各种API的作用，尤其是对大型应用框架而言。

在这方面，Spring和Hibernate都是Java annotation应用的好例子——仅仅需要增加几行简单的Java annotation代码，就可以实现非常复杂的程序逻辑。

尽管对这些API（的写法）存在一些争论，但是大多数程序员认为，只要使用得当，这种声明式编程在形式上还是很有表达能力的。

不过，只有少量程序员基于Java annotation来编写框架API，或者应用程序中间件。

之所以造成这种现象很主要的一个原因是，程序员们认为Java annotation会降低代码的可读性。

在本文中，我就想告诉大家，实现这些基于annotation的API其实并不是完全无用的，只要使用恰当的工具，其实你也并不需要了解太多Java内部函数的知识。

## 注解存在的问题

在实现基于annotation的API时，很明显的一个问题就是：

这些API在Java运行时是不会被JVM处理的。

这样造成的结果就是，你没法给一个用户 annotation 赋予一个具体的含义。

例如：如果我们定义了一个 `@Log` annotation，然后我们期望在标注了@Log的地方，每调用一次就形成一条日志记录。

```java
class Service {
  @Log
  void doSomething() { 
    // do something ...
  }
}
```

单靠 `@Log` 标注本身写在哪里，是不可能完成执行程序逻辑的任务的，这就需要标注的使用者去发起生成日志的任务。

明显，这种工作原理让 annotation 看上去毫无意义，因为再调用doSomething方法的时候，我们根本无法去观察生成的log里面相应的状态。

因此，annotation 仅仅是作为一个标记而存在，对程序逻辑来说毫无贡献可言。

## 填坑

为了克服上述的功能性局限，很多基于标注的框架都采用了子类覆盖类方法的模式，来赋予特定标注相关的程序逻辑功能。

这种方法普遍使用了面向对象的集成机制。

对于我们上面提到的 `@Log` 标注来说，子类实现机制会产生一个类似于下面的类LoggingService：

```java
class LoggingService extends Service {
  @Override
  void doSomething() { 
    Logger.log("doSomething() was called");
    super.doSomething();
  }
}
```

当然，上面定义这些类的代码通常是不需要程序员手写的，而是在Java运行时，通过诸如 cglib或Javassst这样的库来自动生成。

上面提到的两个库都提供了简易的API，可以用于生成增强型的子类程序。

这种把类定义的过程放到运行时的做法，其比较好的一个副作用是，在不特别规定程序规范，也不用修改已有的用户代码的前提下，能够有效实现 logging框架的功能。

这样就可以避免“显式创建风格”，也就不用新建一个Java源文件去手写代码了。

## 但是，可伸缩性好吗？

然而，上面的解决方案又带来了另一个不足。

我们通过自动生成子类的方式实现标注的程序逻辑，必须保证在实例化的时候不能使用父类的构造函数。

否则调用标注方法的时候，还是无法完成调用添加日志的功能：原因很明显，用父类的构造函数实例化对象，无法创建出包含子类覆盖方法的正确实例（这是基本的面向对象多态的概念——译者注）。

更糟糕的是——当使用上述方法进行运行时代码生成的时候——LoggingService类无法直接被实例化，因为Java编译器在编译的时候，运行时期间生成的类代码还根本就不存在。

### 对象工厂模式

基于上述原因，Spring或者Hibernate这些框架使用了 “对象工厂”的模式。

在其框架逻辑的范畴内，不允许直接（通过构造函数）对对象进行实例化，而是通过工厂类来完成新建对象的工作。

这种方式在 Spring 设计之初就被采纳，用来管理各种bean。

Hibernates采用了相似的做法，大多数Hibernates的实例被视为查询的结果对象，因此也不是显式地来实例化的。

然而，有一个特例是，当试图存储一个在数据库中还不存在的对象实例的时候，Hibernates的使用者需要用Hibernates返回的对象来替换之前存储的对象实例。

从这个例子来看Hibernates的问题，忽略上述的替换会造成一个普通的初学者错误。

除此之外，幸亏有了这些工厂类，才能让子类化的方法对框架用户透明，因为Java的类型系统可以用子类实例来替代其父类。

因此，只要是用户需要调用自定义服务的地方，都可以用到 LoggingService的实例。

### 问题所在

很遗憾，这种采用工厂类来创建对象的方法虽然（在理论上）被证明是可行的，但（在实际中）用来实现我们提出的@Log标注的逻辑，却依然非常困难，因为这种方法必须要让每一个标注类都去构建一个对应的工厂类方法。

很显然，这么做会让我们的代码模板的尺寸显著增长。

更有甚者，为了避免在产生日志的方法中把逻辑写死（硬编码），我们甚至会为logging标注类创建不止一套代码模板。

还有，如果有人不小心调用了构造函数，那么就可能会有微妙的bug出现，因为在这种情况下，产生的对象实例对标注的处理方式很可能跟我们预期的是不同的。

再有，工厂类的设计其实并不容易。

如果我们要添加一个 `@Log` 标记到某一个类上面，但是这个类已经被定义成了一个Hibernates bean了，那怎么办？ 

这听上去好像没什么意义，但是在操作的时候就必须要设计额外的配置去把我们定义的工厂类和框架自带的工厂类整合起来。

最后一点，也是结论，采用工厂模式写出的代码臃肿不堪，如果还要做到让这些代码同时兼备可读性，然后还要所使用的框架完美结合，这实现代价也太高了。

这就是为什么我们要引入Java agent的原因。

Java agent这种被低估了的模式能够提供一种优秀的替代方案，用来实现我们想要的子类化方法。

ps: 当然，实际这种代码增强更多的是 spring aop 来实现，并没有作者说的这么臃肿。

# 一个简单的Agent

Java agent是用一个简单的jar文件来表示的。

跟普通的Java程序很相似，Java agent定义了一些类作为入口点。 

这些作为入口点的类需要包含一个静态方法，这些方法会在你原本的Java程序的main方法调用之前被调用：

```java
class MyAgent {
  public static void premain(String args, Instrumentation inst) {
    // implement agent here ...
  }
}
```

关于处理Java agent时最有趣的部分，是premain方法中的第二个参数。

这个参数是以一个Instrumentation接口的实现类实例的形式存在的。

这个接 口提供了一种机制，能够通过定义一个ClassFileTransformer，来干预对Java类的加载过程。

有了这种转设施，我们就能够在Java类被使用之前，去实现对类逻辑的强化。

## api 不够直观

这个API的使用一开始看上去不那么直观，很可能是一种新的（编程模式）挑战。

Class文件的转换是通过修改编译过后的Java类字节码来完成的。 

实际上，JVM并不知道什么是Java语言，它只知道什么是字节码。

也正是因为字节码的抽象特性，才让JVM能够具有运行多种语言的能力，例如Groovy, Scala等等。

这样一来，一个注册了的类文件转换器就只需要负责把一个字节码序列转换成另外一个字节码序列就可以了。

尽管已经有了像ASM、BCEL这样的类库，提供了一些简易的API，能够对编译过的Java类进行操作，但是使用这些库的门槛较高，需要开发者对原始的字节码的工作原理有充分的了解。

更可怕的是，想直接操作字节码并做到不出问题，这基本上就是一个冗长拉锯的过程，甚至非常细微的错误，JVM也会直接抛出又臭又硬的VerifierError。

不过还好，我们还有更好，更简单的选择，来对字节码进行操作。

## Byte Buddy 诞生

Byte Buddy这是一个我编写，并负责维护的工具库。

这个库提供了简洁的API，用来对编译后的Java字节码进行操作，也可以用来创建Java agent. 从某些方面来看，Byte Buddy也是一个代码生成的工具库，这和cglib以及Javassit的功能很类似。

然而，跟他们不同的是，Byte Buddy还能够提供统一的API，实现子类化，以及重定义现有类的功能。

在本文中，我们只会研究如何用Java agent来重定义一个类。

如果读者有更多的兴趣，可以参照Byte Buddy’s webpage which offers a detailed tutorial ，那个里面有很详细的描述。

# 现实情况是怎样的？

当然，我们在这里展示的基于agent的logger只是一个教学例子。

通常情况下，那些覆盖面很广的框架也都会提供类似的功能特性，直接调用即可。

例如Spring或者Dropwizard的类似功能都很好用。

然而，这些框架提供的功能基本上都着眼于处理（具体的）编程问题。

对大多数软件应用来说，这种思路也许还不错。

再者，这些框架的思路有时也着眼于大规模的（应用）。

如此一来，使用这些框架来做事，就有可能造成很多问题，通常是会导致有漏洞的抽象逻辑，并可能进一步造成软件运维成本的爆炸性增长。

这种假设绝对不是危言耸听，特别是在你的应用规模增长，需求变更频繁和分叉的时候，又要用框架提供的功能来解决问题，就很可能出现上述麻烦。

## 另一种解决问题的方式

相反的做法，我们可以去构建一个更加有针对性的框架或者类库，采用“挑选&融入”的风格，每次用一个完备的组件去替换原有的存在问题的组件。

如果这样还不能解决问题，我们还可以干脆去搞一个自定义的解决方案，并保证新的解决方案不会影响到应用中的原有代码。

据我们所知，第二种做法对于JVM来说实现起来有些困难，主要原因是因为Java的强类型机制造成的。

不过，通过使用Java agents，克服这些类型限制也不是完全不可能的。

概括地来说，我认为所有涉及到横向操作的概念，都应该采用agent驱动的方式来实现，并且应该使用针对性的框架，而不是采用那些大得吓死人的框架给你提供的内置方法。

我也真心希望有更多的应用能够考虑采用上述的方法。

在一般情况 下，使用agent来注册特定方法的listener，并加以实现，是完全可以满足需求的。

根据我对大体积Java应用代码的观察，这种间接的模块编码方法能够避免（模块间）的强耦合性。

## 测试变得简单

还有一个甜蜜的副作用就是，这种方法让代码的测试变得很容易。

跟测试的原理相同，在启动应用的时候不加载agent，就能按需关闭相应的应用特性（例如本文中的logging例子）。

所有这些操作都不需要改动任何一行代码，也就不会造成程序的崩溃，因为JVM会自动忽略掉那些在运行时无法解析的标注。

安全、日志、缓存还有很多其他的方面，有很多理由，需要采用本文的方式来处理。

因此，我们要说，采用agent，不要用框架。

# 个人收获

这种基于字节码增强的方式，能否直接结合编译时注解进行。

将使用 lombok-ex 进行测试进行测试。

这里擅长的是代码增强，而不是生成代码。

不知道 class 层有没有丰富的支持。

# 拓展阅读

[javassist](https://houbb.github.io/2018/07/23/javassist)

[cglib](https://houbb.github.io/2018/07/23/cglib)

[asm](https://houbb.github.io/2018/07/20/asm)

[java 编译时注解](https://houbb.github.io/2018/07/02/annotation-07-java-complie-annotation)

# 参考资料

[构建Java Agent，而不是使用框架](http://www.voidcn.com/article/p-dhjryobq-ep.html)

* any list
{:toc}
