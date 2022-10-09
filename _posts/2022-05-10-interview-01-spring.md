---
layout: post
title:  spring 常见面试题
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, spring, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# 前言

Spring 是我们日常开发中常用的容器框架。

面试中出现频率也比较高，本文对常见问题进行整理，便于平时查阅收藏。

# 什么是spring、为什么要用spring及其优点、spring有哪些模块组成 ?

## 什么是spring

Spring 是个Java企业级应用的开源开发框架。Spring主要用来开发Java应用，但是有些扩展是针对构建J2EE平台的web应用。Spring 框架目标是简化Java企业级应用开发，它使得开发者只需要关心业务需求。

## spring 优点

spring 属于低侵入式设计，代码的污染极低；

spring 的DI机制将对象之间的依赖关系交由框架处理，减低组件的耦合性；

Spring 提供了 AOP 技术，支持将一些通用任务，如安全、事务、日志、权限等进行集中式管理，从而提供更好的复用。

spring 对于主流的应用框架提供了集成支持。

## spring 有哪些模块组成

- Spring Core：核心类库，提供IOC服务；

- Spring Context：提供框架式的Bean访问方式，以及企业级功能（JNDI、定时任务等）；

- Spring AOP：AOP服务；

- Spring DAO：对JDBC的抽象，简化了数据访问异常的处理；

- Spring ORM：对现有的ORM框架的支持；

- Spring Web：提供了基本的面向Web的综合特性，例如多方文件上传；

- Spring MVC：提供面向Web应用的Model-View-Controller实现。

# 什么是IOC、DI 及其两者的优点 、 有哪几种注入方式

IOC: 控制反转，把创建对象的控制权利由代码转移到spring的配置文件中。

最直观的表达就是，IOC让对象的创建不用去new了，可以由spring自动生产，使用java的反射机制，根据配置文件在运行时动态的去创建对象以及管理对象，并调用对象的方法的。

DI：依赖注入，在程序运行期间,由外部容器动态地将依赖对象注入到组件中。简单定义就是当一个对象需要另一个对象时，可以把另一个对象注入到对象中去。

优点就是把应用的代码量降到最低，达到松散耦合度。

## IOC 的优点

- 它将最小化应用程序中的代码量。

- 它将使您的应用程序易于测试，因为它不需要单元测试用例中的任何单例或 JNDI 查找机制。

- 它以最小的影响和最少的侵入机制促进松耦合。

- 它支持即时的实例化和延迟加载服务。

## 注入的方式

- 构造注入

- Set注入

- 接口注入

Spring 提供以下几种集合的配置元素：

`<list>` 类型用于注入一列值，允许有相同的值。

`<set>` 类型用于注入一组值，不允许有相同的值。

`<map>` 类型用于注入一组键值对，键和值都可以为任意类型。

`<props>` 类型用于注入一组键值对，键和值都只能为String类型。


## IOC 容器初始化过程

基于 XML 的容器初始化，当创建个 ClassPathXmlApplicationContext 时，构造方法做了两件事：

① 调用父容器的构造方法为容器设置好 Bean 资源加载器。

② 调用父类的路径。方法设置 Bean 配置信息定位。

ClassPathXmlApplicationContext 通过调用父类 AbstractApplicationContext 的方法启动

整个 IoC 容器对 Bean 定义的载入过程， refresh 是个模板方法，规定了 IoC 容器的启动流程。在创建 IoC 容器前如果已有容器存在，需要把已有的容器销毁，保证在的 IoC 容器。

方法后使用的是新创建容器创建后通过方法加载 Bean 配置资源，该方法做两件事：

① 调用资源加载器的方法获取要加载的资源。

② 真正执行加载功能，由子类 XmlBeanDenitionReader 实现。加载资源时先解析配置文件路径，读取配置文件的内容，然后通过 XML 解析器将 Bean 配置信息转换成档对象，之后按照 Spring Bean 的定义规则对档对象进解析。

Spring IoC 容器中注册解析的 Bean 信息存放在个 HashMap 集合中，key 是字符串，值是BeanDenition，注册过程中需要使 synchronized 保证线程安全。当配置信息中配置的 Bean 被解析且被注册到 IoC 容器中后，初始化就算真正完成了，Bean 定义信息已经可以使且可被检索。Spring IoC 容器的作用就是对这些注册的 Bean 定义信息进处理和维护，注册的 Bean 定义信息是控制反转和依赖注的基础。

基于注解的容器初始化分为两种：

① 直接将注解 Bean 注册到容器中，可以在初始化容器时注册，也可以在容器创建之后动注册，然后刷新容器使其对注册的注解 Bean 进行处理。

② 通过扫描指定的包及其子包的所有类处理， 在初始化注解容器时指定要动扫描的路径。

## Spring的自动装配（依赖注入）：

在spring中，对象无需自己查找或创建与其关联的其他对象，由容器负责把需要相互协作的对象引用赋予各个对象，使用autowire来配置自动装载模式。

在Spring框架xml配置中共有5种自动装配：

（1）no：默认的方式是不进行自动装配的，通过手工设置ref属性来进行装配bean。

（2）byName：通过bean的名称进行自动装配，如果一个bean的 property 与另一bean 的name 相同，就进行自动装配。 

（3）byType：通过参数的数据类型进行自动装配。

（4）constructor：利用构造函数进行装配，并且构造函数的参数通过byType进行装配。

（5）autodetect：自动探测，如果有构造方法，通过 construct的方式自动装配，否则使用 byType的方式自动装配。

基于注解的方式：

使用@Autowired注解来自动装配指定的bean。在使用@Autowired注解之前需要在Spring配置文件进行配置，`<context:annotation-config/>`。

在启动spring IoC时，容器自动装载了一个AutowiredAnnotationBeanPostProcessor后置处理器，当容器扫描到@Autowied、@Resource或@Inject时，就会在IoC容器自动查找需要的bean，并装配给该对象的属性。

在使用@Autowired时，首先在容器中查询对应类型的bean：

如果查询结果刚好为一个，就将该bean装配给@Autowired指定的数据；

如果查询的结果不止一个，那么@Autowired会根据名称来查找；

如果上述查找的结果为空，那么会抛出异常。解决方法时，使用required=false。

@Autowired可用于：构造函数、成员变量、Setter方法

注：@Autowired和@Resource之间的区别

(1) @Autowired 默认是按照类型装配注入的，默认情况下它要求依赖对象必须存在（可以设置它required属性为false）。

(2) @Resource 默认是按照名称来装配注入的，只有当找不到与名称匹配的bean才会按照类型来装配注入。

## 注入过程

方法获取 Bean 实例，该方法调Bean 的功能，也是触发依赖注入的地方。

具体创建 Bean 对象的过程由 ObjectFactory 的， doGetBean 真正实现从 IoC 容器获取完成，该方法主要通过依赖注入进处理。方法生成Bean 包含的 Java 对象实例和方法对 Bean 属性的。

在 populateBean 方法中，注入过程主要分为两种情况：

① 属性值类型不需要强制转换时，不需要解析属性值，直接进行依赖注入。

②属性值类型需要强制转换时，首先解析属性值，然后对解析后的属性值进行依赖注。

依赖注入的过程就是将 Bean 对象实例设置到它所依赖的 Bean 对象属性上，真正的依赖注入是通过方法实现的，该方法使用了委派模式。

BeanWrapperImpl 类负责对完成初始化的 Bean 对象进行依赖注入，对于非集合类型属性，使用 JDK反射，通过属性的 setter 方法为属性设置注入后的值。对于集合类型的属性，将属性值解析为标类型的集合后直接赋值给属性。

当容器对 Bean 的定位、载入、解析和依赖注全部完成后就不再需要手动创建对象，IoC 容器会动为我们创建对象并且注入依赖。

## spring bean 的生命周期

1. 对Bean进行实例化

2. 依赖注入

3. 如果Bean实现了BeanNameAware接口，Spring将调用setBeanName()，设置 Bean的 id（xml文件中bean标签的id）

4. 如果Bean实现了BeanFactoryAware接口，Spring将调用setBeanFactory()

5. 如果Bean实现了ApplicationContextAware接口，Spring容器将调用setApplicationContext()

6. 如果存在BeanPostProcessor，Spring将调用它们的postProcessBeforeInitialization（预初始化）方法，在Bean初始化前对其进行处理

7. 如果Bean实现了InitializingBean接口，Spring将调用它的afterPropertiesSet方法，然后调用xml定义的 init-method 方法，两个方法作用类似，都是在初始化 bean 的时候执行

8. 如果存在BeanPostProcessor，Spring将调用它们的postProcessAfterInitialization（后初始化）方法，在Bean初始化后对其进行处理

9. Bean初始化完成，供应用使用，直到应用被销毁

10. 如果Bean实现了DisposableBean接口，Spring将调用它的destory方法，然后调用在xml中定义的 destory-method方法，这两个方法作用类似，都是在Bean实例销毁前执行。

ps: 简而言之，根据配置初始化 bean。注入对应的依赖属性等。根据实现的接口，进行调用。

# 谈谈对 AOP 理解?

## 是什么？

AOP(Aspect-Oriented Programming), 即 面向切面编程, 它与 OOP( Object-Oriented Programming, 面向对象编程) 相辅相成, 提供了与 OOP 不同的抽象软件结构的视角. 

在 OOP 中, 我们以类(class)作为我们的基本单元, 而 AOP 中的基本单元是 Aspect(切面)

## 作用

aop 面向切面编程，关键在于代理模式，Spring AOP使用的动态代理，所谓的动态代理就是说AOP框架不会去修改字节码，而是每次运行时在内存中临时为方法生成一个AOP对象，这个AOP对象包含了目标对象的全部方法，并且在特定的切点做了增强处理，并回调原对象的方法。

动态代理可以减少系统中的重复代码，降低了模块间的耦合度，同时提高了系统的可维护性。可用于权限认证、日志、事务处理。

## 基本概念

AOP 中的 Aspect、Advice、Pointcut、JointPoint 和 Advice 参数分别是什么？

![aop](https://images.gitbook.cn/37630330-5c7b-11ea-bd6c-43eeac1b3938)

Aspect - Aspect 是一个实现交叉问题的类，例如事务管理。方面可以是配置的普通类，然后在 Spring Bean 配置文件中配置，或者我们可以使用 Spring AspectJ 支持使用 @Aspect 注解将类声明为 Aspect。

Advice - Advice 是针对特定 JoinPoint 采取的操作。在编程方面，它们是在应用程序中达到具有匹配切入点的特定 JoinPoint 时执行的方法。您可以将 Advice 视为 Spring 拦截器（Interceptor）或 Servlet 过滤器（filter）。

Advice Arguments - 我们可以在 advice 方法中传递参数。我们可以在切入点中使用 args() 表达式来应用于与参数模式匹配的任何方法。如果我们使用它，那么我们需要在确定参数类型的 advice 方法中使用相同的名称。

Pointcut - Pointcut 是与 JoinPoint 匹配的正则表达式，用于确定是否需要执行 Advice。 Pointcut 使用与 JoinPoint 匹配的不同类型的表达式。Spring 框架使用 AspectJ Pointcut 表达式语言来确定将应用通知方法的 JoinPoint。

JoinPoint - JoinPoint 是应用程序中的特定点，例如方法执行，异常处理，更改对象变量值等。在 Spring AOP 中，JoinPoint 始终是方法的执行器。

## 有哪些类型的通知（Advice）？

**特定 JoinPoint 处的 Aspect 所采取的动作称为 Advice。**

Spring AOP 使用一个 Advice 作为拦截器，在 JoinPoint “周围”维护一系列的拦截器。

Before - 这些类型的 Advice 在 joinpoint 方法之前执行，并使用 @Before 注解标记进行配置。

After Returning - 这些类型的 Advice 在连接点方法正常执行后执行，并使用@AfterReturning 注解标记进行配置。

After Throwing - 这些类型的 Advice 仅在 joinpoint 方法通过抛出异常退出并使用 @AfterThrowing 注解标记配置时执行。

After (finally) - 这些类型的 Advice 在连接点方法之后执行，无论方法退出是正常还是异常返回，并使用 @After 注解标记进行配置。

Around - 这些类型的 Advice 在连接点之前和之后执行，并使用 @Around 注解标记进行配置。

## 实现方式

Spring AOP 中的动态代理主要有两种方式，JDK动态代理和CGLIB动态代理：

JDK代理：基于接口的代理，不支持类的代理。

核心InvocationHandler接口和Proxy类，InvocationHandler 通过invoke()方法反射来调用目标类中的代码，动态地将横切逻辑和业务编织在一起；接着，Proxy利用 InvocationHandler动态创建一个符合某一接口的的实例,  生成目标类的代理对象。

```java
Proxy.newProxyInstance(ClassLoader,Interfaces,InvocationHandler);
```

CGLIB动态代理：如果代理类没有实现 InvocationHandler 接口（或者说是基于父子类的），那么Spring AOP会选择使用CGLIB来动态代理目标类。CGLIB（Code Generation Library），是一个代码生成的类库，可以在运行时动态的生成指定类的一个子类对象，并覆盖其中特定方法并添加增强代码，从而实现AOP。CGLIB是通过继承的方式做的动态代理，因此如果某个类被标记为final，那么它是无法使用CGLIB做动态代理的

Enhancer是一个非常重要的类，它允许为非接口类型创建一个JAVA代理，Enhancer动态的创建给定类的子类并且拦截代理类的所有的方法，和JDK动态代理不一样的是不管是接口还是类它都能正常工作

spring 的动态代理通过代理类为目标对象增加额外功能。

代理本质 = 目标对象+额外功能+代理对象的接口

## 开发步骤：

1，创建原始对象

2，提供额外功能（实现下面的接口）

MethodBeforeAdvice   额外功能需要运行在原始方法之前执行.

AfterReturningAdvice   额外功能需要运行在原始方法之后执行

MethodInterceptor  额外功能需要运行在原始方法之前 后执行

ThrowsAdvice  额外功能运行在原始方法抛出异常的执行

3，配置切入点

```xml
<aop:pointcut id="pc"  expression="execution(* *(..))"/>
```

4，组装切入点和代理功能

```xml
<aop:advisor pointcut-ref="pc" advice-ref="代理功能的bean"/>
```

# spring 事务的实现及其原理

Spring 事务的本质其实就是数据库对事务的支持，没有数据库的事务支持，spring是无法提供事务功能的。

## Spring 事务的种类：

spring支持编程式事务管理和声明式事务管理两种方式：

① 编程式事务管理使用TransactionTemplate。

② 声明式事务管理建立在AOP之上的。其本质是通过AOP功能，对方法前后进行拦截，将事务处理的功能编织到拦截的方法中，也就是在目标方法开始之前加入一个事务，在执行完目标方法之后根据执行情况提交或者回滚事务。

声明式事务最大的优点就是不需要在业务逻辑代码中掺杂事务管理的代码，只需在配置文件中做相关的事务规则声明或通过 `@Transactional` 注解的方式，便可以将事务规则应用到业务逻辑中。

声明式事务管理要优于编程式事务管理，这正是spring倡导的非侵入式的开发方式，使业务代码不受污染，只要加上注解就可以获得完全的事务支持。唯一不足地方是，最细粒度只能作用到方法级别，无法做到像编程式事务那样可以作用到代码块级别。

## spring 的事务传播行为：

spring 事务的传播行为说的是，当多个事务同时存在的时候，spring如何处理这些事务的行为。

① PROPAGATION_REQUIRED：**如果当前没有事务，就创建一个新事务，如果当前存在事务，就加入该事务，该设置是最常用的设置**。

② PROPAGATION_SUPPORTS：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就以非事务执行。

③ PROPAGATION_MANDATORY：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就抛出异常。

④ PROPAGATION_REQUIRES_NEW：创建新事务，无论当前存不存在事务，都创建新事务。

⑤ PROPAGATION_NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。

⑥ PROPAGATION_NEVER：以非事务方式执行，如果当前存在事务，则抛出异常。

⑦ PROPAGATION_NESTED：如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则按REQUIRED属性执行。

## Spring 中的隔离级别：

① ISOLATION_DEFAULT：这是个 PlatfromTransactionManager 默认的隔离级别，**使用数据库默认的事务隔离级别**。

② ISOLATION_READ_UNCOMMITTED：读未提交，允许另外一个事务可以看到这个事务未提交的数据。

③ ISOLATION_READ_COMMITTED：读已提交，保证一个事务修改的数据提交后才能被另一事务读取，而且能看到该事务对已有记录的更新。解决脏读问题

④ ISOLATION_REPEATABLE_READ：可重复读，保证一个事务修改的数据提交后才能被另一事务读取，但是不能看到该事务对已有记录的更新。行锁

⑤ ISOLATION_SERIALIZABLE：一个事务在执行的过程中完全看不到其他事务对数据库所做的更新。表锁

脏读：表示一个事务能够读取另一个事务中还未提交的数据。比如，某个事务尝试插入记录 A，此时该事务还未提交，然后另一个事务尝试读取到了记录 A。

不可重复读：是指在一个事务内，多次读同一数据。

幻读：指同一个事务内多次查询返回的结果集不一样。比如同一个事务 A 第一次查询时候有 n 条记录，但是第二次同等条件下查询却有 n+1 条记录，这就好像产生了幻觉。发生幻读的原因也是另外一个事务新增或者删除或者修改了第一个事务结果集里面的数据，同一个记录的数据内容被修改了，所有数据行的记录就变多或者变少了。


## 只读属性(readOnly)

false应用在查询操作时,提高查询效率， true用于查询，false用于增删改，默认是false

## 超时属性(timeout) 秒 -1 由数据库决定

如果当前事务操作的数据,被别的事务锁住,那么通过超时数据指定最多等待多少秒.

## 异常属性(+-Exception)

默认Spring会对RuntimeException及其子类进行回滚操作

默认Spring会对Exception及其子类进行提交操作

rollback-for=”异常的权限定名” 回滚操作

no-rollback-for=”java.lang.RuntimeException” 提交操作

# Spring 有几种配置方式？

将Spring配置到应用开发中有以下三种方式：

- 基于XML的配置

- 基于注解的配置（主流）

- 基于Java的配置

# Spring 框架中都用到了哪些设计模式？

工厂模式：BeanFactory就是简单工厂模式的体现，用来创建对象的实例；

单例模式：Bean默认为单例模式。

代理模式：Spring的AOP功能用到了JDK的动态代理和CGLIB字节码生成技术；

模板方法：用来解决代码重复的问题。比如. RestTemplate, JmsTemplate, JpaTemplate。

观察者模式：定义对象键一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会得到通知被制动更新，如Spring中listener的实现--ApplicationListener。


# spring 并发安全问题

## Spring框架中的单例bean是线程安全的吗？

不是，Spring框架中的单例bean不是线程安全的。

spring 中的 bean 默认是单例模式，spring 框架并没有对单例 bean 进行多线程的封装处理。

实际上大部分时候 spring bean 无状态的（比如 dao 类），所有某种程度上来说 bean 也是安全的，但如果 bean 有状态的话（比如 view model 对象），那就要开发者自己去保证线程安全了，最简单的就是改变 bean 的作用域，把“singleton”变更为“prototype”，这样请求 bean 相当于 new Bean()了，所以就可以保证线程安全了。

- 有状态就是有数据存储功能。

- 无状态就是不会保存数据。

## Spring如何处理线程并发问题？

在一般情况下，只有无状态的Bean才可以在多线程环境下共享，在Spring中，绝大部分Bean都可以声明为singleton作用域，因为Spring对一些Bean中非线程安全状态采用ThreadLocal进行处理，解决线程安全问题。

ThreadLocal和线程同步机制都是为了解决多线程中相同变量的访问冲突问题。同步机制采用了“时间换空间”的方式，仅提供一份变量，不同的线程在访问前需要获取锁，没获得锁的线程则需要排队。而ThreadLocal采用了“空间换时间”的方式。

**ThreadLocal 会为每一个线程提供一个独立的变量副本，从而隔离了多个线程对数据的访问冲突。因为每一个线程都拥有自己的变量副本，从而也就没有必要对该变量进行同步了。**

ThreadLocal提供了线程安全的共享对象，在编写多线程代码时，可以把不安全的变量封装进ThreadLocal。

# 解释Spring支持的几种bean的作用域。

Spring容器中的bean可以分为5个范围：

（1）singleton：默认，每个容器中只有一个bean的实例，单例的模式由BeanFactory自身来维护。

（2）prototype：为每一个bean请求提供一个实例。

（3）request：为每一个网络请求创建一个实例，在请求完成以后，bean会失效并被垃圾回收器回收。

（4）session：与request范围类似，确保每个session中有一个bean的实例，在session过期后，bean会随之失效。

（5）global-session：全局作用域，global-session和Portlet应用相关。当你的应用部署在Portlet容器中工作时，它包含很多portlet。如果你想要声明让所有的portlet共用全局的存储变量的话，那么这全局变量需要存储在global-session中。全局作用域与Servlet中的session作用域效果相同。

# 怎样开启注解装配？

注解装配在默认情况下是不开启的，为了使用注解装配，我们必须在Spring配置文件中配置 `<context:annotation-config/>` 元素。

# spring 核心类有哪些？各有什么作用？ 

BeanFactory：产生一个新的实例，可以实现单例模式

BeanWrapper：提供统一的get及set方法

ApplicationContext: 提供框架的实现，包括BeanFactory的所有功能

# Spring 怎么解决循环依赖问题？

spring对循环依赖的处理有三种情况： 

①构造器的循环依赖：这种依赖spring是处理不了的，直接抛出BeanCurrentlylnCreationException异常。 

②单例模式下的setter循环依赖：通过“三级缓存”处理循环依赖。 

③非单例循环依赖：无法处理。

下面分析单例模式下的setter循环依赖如何解决

Spring 的单例对象的初始化主要分为三步： 

（1）createBeanInstance：实例化，其实也就是调用对象的构造方法实例化对象

（2）populateBean：填充属性，这一步主要是多bean的依赖属性进行填充

（3）initializeBean：调用 spring xml中的init 方法。

从上面讲述的单例bean初始化步骤我们可以知道，循环依赖主要发生在第一、第二步骤。

也就是构造器循环依赖和field循环依赖。

| 缓存 | 用途 |
|:---|:---|
| singletonObjects | 用于存放完全初始化好的 bean, 缓存中的 bean 可以直接使用 |
| earlySingletonObjects | 存放原始的 bean 对象，尚未填充属性，用于解决循环依赖。 |
| singletonFactories | 存放 bean 工厂对象，解决循环依赖 |

A的某个field或者setter依赖了B的实例对象，同时B的某个field或者setter依赖了A的实例对象”这种循环依赖的情况。

A首先完成了初始化的第一步（createBeanINstance实例化），并且将自己提前曝光到singletonFactories中，此时进行初始化的第二步，发现自己依赖对象B，此时就尝试去get(B)，发现B还没有被create，所以走create流程，B在初始化第一步的时候发现自己依赖了对象A，于是尝试get(A)，尝试一级缓存singletonObjects(肯定没有，因为A还没初始化完全)，尝试二级缓存earlySingletonObjects（也没有），尝试三级缓存singletonFactories，由于A通过ObjectFactory将自己提前曝光了，所以B能够通过ObjectFactory.getObject拿到A对象(虽然A还没有初始化完全，但是总比没有好呀)，B拿到A对象后顺利完成了初始化阶段1、2、3，完全初始化之后将自己放入到一级缓存singletonObjects中。

此时返回A中，A此时能拿到B的对象顺利完成自己的初始化阶段2、3，最终A也完成了初始化，进去了一级缓存singletonObjects中，而且更加幸运的是，由于B拿到了A的对象引用，所以B现在hold住的A对象完成了初始化。

# SpringMVC 工作原理了解吗?

原理如下图所示：

![mvc](https://pic2.zhimg.com/80/v2-02fb46c11086d571c8ceb762a00637cd_720w.jpg)

上图的一个笔误的小问题：Spring MVC 的入口函数也就是前端控制器 DispatcherServlet 的作用是接收请求，响应结果。

流程说明（重要）：

1. 客户端（浏览器）发送请求，直接请求到 DispatcherServlet。 

2. DispatcherServlet 根据请求信息调用 HandlerMapping，解析请求对应的 Handler。 

3. 解析到对应的 Handler（也就是我们平常说的 Controller 控制器）后，开始由 HandlerAdapter 适配器处理。 

4. HandlerAdapter 会根据 Handler来调用真正的处理器开处理请求，并处理相应的业务逻辑。 

5. 处理器处理完业务后，会返回一个 ModelAndView 对象，Model 是返回的数据对象，View 是个逻辑上的 View。 

6. ViewResolver 会根据逻辑 View 查找实际的 View。 

7. DispaterServlet 把返回的 Model 传给 View（视图渲染）。 

8. 把 View 返回给请求者（浏览器） 

# 常见的注解

## @Autowired 和 @Resource 的区别？

`@Autowired` 注解是按照类型（byType）装配依赖对象的,但是存在多个类型致的bean，法通过byType注时，就会再使byName来注，如果还是法判断注哪个bean则会UnsatisfiedDependencyException。

`@Resource` 会先按照byName来装配，如果找不到bean，会动byType再找次。

当需要创建多个相同类型的 bean 并希望仅使用属性装配其中一个 bean 时，可以使用 `@Qualifier` 注解和 `@Autowired` 通过指定应该装配哪个 bean 来消除歧义。

## @Bean 和 @Component有什么区别？

都是使用注解定义 Bean。

@Bean 是使用 Java 代码装配 Bean，@Component 是自动装配 Bean。

@Component 注解用在类上，表明一个类会作为组件类，并告知Spring要为这个类创建bean，每个类对应一个 Bean。

@Bean 注解用在方法上，表示这个方法会返回一个 Bean。

@Bean 需要在配置类中使用，即类上需要加上@Configuration注解。

@Bean 注解更加灵活。

当需要将第三方类装配到 Spring 容器中，因为没办法源代码上添加@Component注解，只能使用@Bean 注解的方式，当然也可以使用 xml 的方式。

## @Component、@Controller、@Repositor和@Service 的区别？

@Component：最普通的组件，可以被注入到spring容器进行管理。

@Controller：将类标记为 Spring Web MVC 控制器。

@Service：将类标记为业务层组件。

@Repository：将类标记为数据访问组件，即DAO组件。

# 参考资料

[spring 常见面试题大汇总](https://blog.csdn.net/sxeric/article/details/121941304)

https://blog.csdn.net/yunzhaji3762/article/details/113577884

https://zhuanlan.zhihu.com/p/381067302

https://www.cnblogs.com/yanggb/p/11004887.html

https://gitchat.csdn.net/activity/5e5cebcc8d27ec012e81277b

* any list
{:toc}