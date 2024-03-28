---
layout: post
title: test 之 jmockit-04-Faking 伪造
date:  2023-05-09 +0800
categories: [Test]
tags: [junit, test, sh]
published: true
---

# 拓展阅读

[jmockit-01-jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[jmockit-02-概览](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-03-Mocking 模拟](https://houbb.github.io/2023/05/09/test-jmockit-03-mocking)

[jmockit-04-Faking 伪造](https://houbb.github.io/2023/05/09/test-jmockit-04-faking)

[jmockit-05-代码覆盖率](https://houbb.github.io/2023/05/09/test-jmockit-05-code-converate)

[mockito-01-入门介绍](https://houbb.github.io/2023/05/09/test-mockito-01-overivew)

[mockito-02-springaop 整合遇到的问题，失效](https://houbb.github.io/2023/05/09/test-mockito-02-springaop)


# Faking

在 JMockit 工具包中，Faking API 为创建假实现提供支持。 

通常，伪造的目标是要伪造的类中的一些方法和/或构造函数，同时保持大多数其他方法和构造函数不变。

假实现在依赖于外部组件或资源（例如电子邮件或 Web 服务服务器、复杂库等）的测试中特别有用。

通常，假实现将从可重用的测试基础架构组件应用，而不是直接从测试类应用。

用假实现替换真实实现对于使用这些依赖项的代码来说是完全透明的，并且可以在单个测试、单个测试类中的所有测试或整个测试运行的范围内打开和关闭。

# 1 假方法和假类

在 Faking API 的上下文中，假方法是假类中用 @Mock 注释的任何方法。 

伪造类是扩展 `mockit.MockUp<T>` 通用基类的任何类，其中 T 是要伪造的类型。 

下面的示例显示了在我们的示例“真实”类 javax.security.auth.login.LoginContext 的伪类中定义的几个伪方法。

```java
public final class FakeLoginContext extends MockUp<LoginContext> {
   @Mock
   public void $init(String name, CallbackHandler callback) {
      assertEquals("test", name);
      assertNotNull(callback);
   }

   @Mock
   public void login() {}

   @Mock
   public Subject getSubject() { return null; }
}
```

当假类应用于真实类时，后者会获取那些具有相应假方法的方法和构造函数的实现，这些方法和构造函数会暂时替换为匹配假方法的实现，如假类中所定义的。 

换句话说，在应用假类的测试期间，真实的类会变成“假的”。 

每当在测试执行期间收到调用时，其方法都会做出相应的响应。 

在运行时，真正发生的情况是，伪造的方法/构造函数的执行被拦截并重定向到相应的伪造方法，然后该方法执行并返回（除非抛出异常/错误）给原始调用者，而这一调用者没有注意到 实际上执行了不同的方法。 通常，“调用者”类是正在测试的类，而伪造的类是一个依赖项。

每个 @Mock 方法必须有一个相应的“真实方法/构造函数”，在目标真实类中具有相同的签名。 

对于方法来说，签名由方法名和参数组成； 对于构造函数来说，它只是参数，假方法具有特殊名称“$init”。

最后，请注意，不需要为真实类中的所有方法和构造函数使用假方法。 任何此类方法或构造函数如果假类中不存在相应的假方法，则将简单地保持“原样”，也就是说，它不会被伪造。

# 2 应用假类

给定的假类必须应用于相应的真实类才能产生任何效果。 这通常是针对整个测试类或测试套件完成的，但也可以针对单个测试完成。 

可以从测试类内的任何位置应用 Fake：@BeforeClass 方法、@BeforeMethod / @Before / @BeforeEach 方法 (TestNG / JUnit 4 / JUnit 5) 或 @Test 方法。 

一旦应用了假类，所有假方法和真实类的构造函数的执行都会自动重定向到相应的假方法。

要应用上面的 FakeLoginContext 伪类，我们只需实例化它：

```java
@Test
public void applyingAFakeClass() throws Exception {
   new FakeLoginContext());

   // Inside an application class which creates a suitable CallbackHandler:
   new LoginContext("test", callbackHandler).login();

   ...
}
```

由于伪造类应用于测试方法内部，因此 FakeLoginContext 伪造的 LoginContext 仅对特定测试有效。

当实例化LoginContext的构造函数调用执行时，FakeLoginContext中相应的“$init”fake方法将被执行。 

类似地，当调用 LoginContext#login 方法时，将执行相应的 fake 方法，在这种情况下，该方法不会执行任何操作，因为该方法没有参数且返回类型为 void。 发生这些调用的假类实例是在测试的第一部分中创建的实例。

## 2.1 可以伪造的方法种类

到目前为止，我们只用公共实例伪造方法伪造了公共实例方法。 真实类中的其他几种方法也可以被伪造：具有受保护或“包私有”可访问性的方法、静态方法、最终方法和本机方法。 

更重要的是，真实类中的静态方法可以通过实例伪造方法来伪造，反之亦然（实例真实方法与静态伪造）。

要伪造的方法需要有一个实现，但不一定是字节码（在本机方法的情况下）。 因此，抽象方法不能直接伪造。

请注意，假方法不需要公开。

# 3 伪造未指定的实现类

为了演示此功能，让我们考虑下面的测试代码。

```java
public interface Service { int doSomething(); }
final class ServiceImpl implements Service { public int doSomething() { return 1; } }

public final class TestedUnit {
   private final Service service1 = new ServiceImpl();
   private final Service service2 = new Service() { public int doSomething() { return 2; } };

   public int businessOperation() {
      return service1.doSomething() + service2.doSomething();
   }
}
```

我们要测试的方法businessOperation() 使用实现单独接口Service 的类。 

其中一种实现是通过匿名内部类定义的，客户端代码完全无法访问该内部类（除了使用反射）。

给定一个基类型（无论是接口、抽象类还是任何类型的基类），我们可以编写一个仅了解基类型但所有实现/扩展实现类都被伪造的测试。 

为此，我们创建一个假的，其目标类型仅引用已知的基本类型，并通过类型变量来实现。 

不仅 JVM 已经加载的实现类会被伪造，而且在以后的测试执行期间 JVM 碰巧加载的任何其他类也会被伪造。 

下面演示了这种能力。

```java
@Test
public <T extends Service> void fakingImplementationClassesFromAGivenBaseType() {
   new MockUp<T>() {
      @Mock int doSomething() { return 7; }
   };

   int result = new TestedUnit().businessOperation();

   assertEquals(14, result);

}
```

在上面的测试中，所有对实现 Service#doSomething() 的方法的调用都将被重定向到假方法实现，无论实现接口方法的实际类如何。


# 4 伪造类初始值设定项

当一个类在一个或多个静态初始化块中执行某些工作时，我们可能需要将其存根，以便它不会干扰测试执行。 

我们可以为此定义一个特殊的 fake 方法，如下所示。

```java
@Test
public void fakingStaticInitializers() {
   new MockUp<ClassWithStaticInitializers>() {
      @Mock
      void $clinit() {
         // Do nothing here (usually).
      }
   };

   ClassWithStaticInitializers.doSomething();
}
```

当类的静态初始化代码被伪造时必须特别小心。 

请注意，这不仅包括类中的任何“静态”块，还包括对静态字段的任何赋值（不包括在编译时解析的那些赋值，它们不会生成可执行字节码）。 

由于 JVM 仅尝试初始化一个类一次，因此恢复伪造类的静态初始化代码将不会产生任何效果。 

因此，如果您伪造尚未由 JVM 初始化的类的静态初始化，则原始类初始化代码将永远不会在测试运行中执行。 

这将导致使用运行时计算的表达式分配的任何静态字段都保持使用其类型的默认值进行初始化。

# 5 访问调用上下文

假方法可以选择声明一个类型为mockit.Initation的额外参数，前提是它是第一个参数。 

对于相应的伪造方法/构造函数的每次实际调用，在执行伪造方法时都会自动传入一个 Invocation 对象。

该调用上下文对象提供了几个可在 fake 方法中使用的 getter。 

一种是 getInvokedInstance() 方法，它返回发生调用的伪造实例（如果伪造方法是静态的，则返回 null）。 

其他 getter 提供对伪造的方法/构造函数的调用次数（包括当前调用次数）、调用参数（如果有）以及调用的成员（java.lang.reflect.Method 或 java.lang.reflect.Constructor 对象） ， 作为适当的）。 

下面我们有一个示例测试。

```java
@Test
public void accessingTheFakedInstanceInFakeMethods() throws Exception {
   new MockUp<LoginContext>() {
      Subject testSubject;

      @Mock
      void $init(Invocation invocation, String name, Subject subject) {
         assertNotNull(name);
         assertNotNull(subject);

         // Verifies this is the first invocation.
         assertEquals(1, invocation.getInvocationCount());
      }

      @Mock
      void login(Invocation invocation) {
         // Gets the invoked instance.
         LoginContext loginContext = invocation.getInvokedInstance();
         assertNull(loginContext.getSubject()); // null until subject is authenticated
         testSubject = new Subject();
      }

      @Mock
      void logout() { testSubject = null; }

      @Mock
      Subject getSubject() { return testSubject; }
   };

   LoginContext theFakedInstance = new LoginContext("test", new Subject());
   theFakedInstance.login();
   assertSame(testSubject, theFakedInstance.getSubject();
   theFakedInstance.logout();
   assertNull(theFakedInstance.getSubject();
}
```

# 6 进入实际实施阶段

一旦 @Mock 方法被执行，任何对相应伪造方法的额外调用也会被重定向到该伪造方法，从而导致重新进入其实现。 

但是，如果我们想要执行伪造方法的真正实现，我们可以在作为伪造方法的第一个参数接收的 Invocable 对象上调用proceed() 方法。

下面的示例测试使用未指定的配置来练习正常创建的 LoginContext 对象（在创建时没有任何伪造效果）。

```java
@Test
public void proceedIntoRealImplementationsOfFakedMethods() throws Exception {
   // Create objects used by the code under test:
   LoginContext loginContext = new LoginContext("test", null, null, configuration);

   // Apply fakes:
   ProceedingFakeLoginContext fakeInstance = new ProceedingFakeLoginContext();

   // Exercise the code under test:
   assertNull(loginContext.getSubject());
   loginContext.login();
   assertNotNull(loginContext.getSubject());
   assertTrue(fakeInstance.loggedIn);

   fakeInstance.ignoreLogout = true;
   loginContext.logout(); // first entry: do nothing
   assertTrue(fakeInstance.loggedIn);

   fakeInstance.ignoreLogout = false;
   loginContext.logout(); // second entry: execute real implementation
   assertFalse(fakeInstance.loggedIn);
}

static final class ProceedingFakeLoginContext extends MockUp<LoginContext> {
   boolean ignoreLogout;
   boolean loggedIn;

   @Mock
   void login(Invocation inv) throws LoginException {
      try {
         inv.proceed(); // executes the real code of the faked method
         loggedIn = true;
      }
      finally {
         // This is here just to show that arbitrary actions can be taken inside the
         // fake, before and/or after the real method gets executed.
         LoginContext lc = inv.getInvokedInstance();
         System.out.println("Login attempted for " + lc.getSubject());
      }
   }

   @Mock
   void logout(Invocation inv) throws LoginException {
      // We can choose to proceed into the real implementation or not.
      if (!ignoreLogout) {
         inv.proceed();
         loggedIn = false;
      }
   }
}
```

在上面的示例中，即使某些方法（登录和注销）是伪造的，测试的 LoginContext 类中的所有代码都将被执行。 

这个例子是人为的； 在实践中，进行实际实施的能力通常对于测试本身没有用处，至少不是直接有用。

您可能已经注意到，在假方法中使用 Invocable#proceed(...) 的行为实际上类似于相应真实方法的建议（来自 AOP 术语）。 

这是一个强大的能力，对于某些事情很有用（想想拦截器或装饰器）。

# 7 在测试之间重复使用假货

通常，一个假类需要在多个测试中使用，甚至应用于整个测试运行。 

一种选择是使用在每个测试方法之前运行的测试设置方法； 对于 JUnit，我们使用 @Before 注释； 对于 TestNG，它是@BeforeMethod。 

另一种方法是在测试类设置方法中应用伪造：@BeforeClass。 无论哪种方式，只要在设置方法中实例化该假类即可应用它。

一旦应用，假货将在测试类中的所有测试的执行中保持有效。 

在“之前”方法中应用的 fake 范围包括测试类可能具有的任何“之后”方法中的代码（对于 JUnit 使用 @After 注释，对于 TestNG 使用 @AfterMethod 注释）。 

这同样适用于 @BeforeClass 方法中应用的任何伪造：它们在任何 AfterClass 方法的执行期间仍然有效。 

然而，一旦最后一个“after”或“after class”方法完成执行，所有假货都会自动“拆除”。

例如，如果我们想用一个假类来假冒 LoginContext 类来进行一系列相关测试，我们将在 JUnit 测试类中使用以下方法：

```java
public class MyTestClass {
   @BeforeClass
   public static void applySharedFakes() {
      new MockUp<LoginContext>() {
         // shared @Mock's here...
      };
   }

   // test methods that will share the fakes applied above...
}
```

还可以从基测试类进行扩展，基测试类可以选择定义应用一个或多个伪造的“之前”方法。

# 8 全局 Fake

有时，我们可能需要对测试套件的整个范围（其所有测试类）应用伪造，即“全局”伪造。

这可以通过外部配置、设置系统属性来完成。

fakes 系统属性支持完全限定的假类名称的逗号分隔列表。 

如果在 JVM 启动时指定，任何此类（必须扩展 `MockUp<T>`）将自动应用于整个测试运行。 

对于所有测试类，启动假类中定义的假方法将一直有效，直到测试运行结束。 

每个伪类都将通过其无参数构造函数实例化，除非在类名后提供了附加值（例如，如“-Dfakes=my.fakes.MyFake=anArbitraryStringWithoutCommas”），在这种情况下，伪类应该 有一个带有一个 String 类型参数的构造函数。

# 9 应用 AOP 风格的建议

还有一种特殊的 @Mock 方法可以出现在假类中：“$advice”方法。 

如果定义了，此伪造方法将处理目标类（或多个类，当将伪造应用于基类型中的未指定类时）中每个方法的执行。 

与常规的伪造方法不同，这个方法需要有一个特定的签名和返回类型：Object $advice(Initation)。

为了演示，假设我们想要在测试执行期间测量给定类中所有方法的执行时间，同时仍然执行每个方法的原始代码。

```java
public final class MethodTiming extends MockUp<Object> {
   private final Map<Method, Long> methodTimes = new HashMap<>();

   public MethodTiming(Class<?> targetClass) { super(targetClass); }
   MethodTiming(String className) throws ClassNotFoundException { super(Class.forName(className)); }

   @Mock
   public Object $advice(Invocation invocation) {
      long timeBefore = System.nanoTime();

      try {
         return invocation.proceed();
      }
      finally {
         long timeAfter = System.nanoTime();
         long dt = timeAfter - timeBefore;

         Method executedMethod = invocation.getInvokedMember();
         Long dtUntilLastExecution = methodTimes.get(executedMethod);
         Long dtUntilNow = dtUntilLastExecution == null ? dt : dtUntilLastExecution + dt;
         methodTimes.put(executedMethod, dtUntilNow);
      }
   }

   @Override
   protected void onTearDown() {
      System.out.println("\nTotal timings for methods in " + targetType + " (ms)");

      for (Entry<Method, Long> methodAndTime : methodTimes.entrySet()) {
         Method method = methodAndTime.getKey();
         long dtNanos = methodAndTime.getValue();
         long dtMillis = dtNanos / 1000000L;
         System.out.println("\t" + method + " = " + dtMillis);
      }
   }
}
```

上面的假类可以应用于测试内部、“before”方法、“before class”方法，甚至可以通过设置“-Dfakes=testUtils.MethodTiming=my.application.AppClass”应用于整个测试运行。 

它将把给定类中所有方法的所有执行的执行时间相加。 $advice方法的实现所示，可以获取到正在执行的java.lang.reflect.Method。 

如果需要，可以通过对调用对象的类似调用来获取当前调用计数和/或调用参数。 

当假的被（自动）拆除时， onTearDown() 方法被执行，将测量的时间转储到标准输出。

# 参考资料

http://jmockit.github.io/tutorial/Faking.html

* any list
{:toc}