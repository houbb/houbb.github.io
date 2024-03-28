---
layout: post
title: test 之 jmockit-02-Testing enterprise applications
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


# intro

企业应用程序针对特定的业务领域，通常具有用于多个并发用户的 GUI 和用于许多实体类型的应用程序数据库； 

此外，它通常与组织内部或外部的其他应用程序集成。 

在 Java 中，构建此类应用程序时通常使用 Java EE API 和/或 Spring 框架。

在本章中，我们描述了一种通过编写容器外集成测试来测试 Java 企业应用程序的方法，其中每个测试都在定义良好的业务场景（也称为“用例”或“使用”场景）中执行单个步骤 ）。 

在典型的分层架构中，此类测试从最高层（通常是应用程序层）的组件调用公共方法，然后向下调用较低层。

# 1 例子

为了进行演示，我们将使用 Spring Pet Clinic 示例应用程序的 Java EE 版本。 

完整的代码可以在项目存储库中找到。

应用程序代码库分为四层：UI 或表示层、应用程序层、领域层和基础设施层。

该应用程序的域模型（遵循域驱动设计的方法和术语）有六个域实体：Vet（兽医）、Specialty（兽医的专业）、Pet、PetType、Owner（宠物的主人）和 Visit（来自宠物的访问） 宠物及其主人到诊所）。 

除了实体之外，应用程序的域模型（和层）还包括域服务类。 

在这个简单的域中，对于每种实体类型（VetMaintenance、PetMaintenance 等），我们只有一个这样的类。

在 DDD 中，实体通过“存储库”组件添加到持久存储中、重构或从持久存储中删除。 

鉴于我们使用复杂的 ORM API (JPA)，只有一个这样的存储库，它不是特定于域或应用程序的，因此进入基础设施层：数据库类。 

该应用程序使用关系数据库，特别是示例应用程序中的内存中 HSqlDb 数据库，因此它可以是独立的。

应用程序层包含应用程序服务类，它将用户输入从 UI 转换为对较低层的调用，并使输出数据可在 UI 中显示。 这是划分数据库事务的层。

## 1.1 使用Java EE

在 Java EE 7 中，我们将 JPA 用于域 `@Entity` 类型，将 EJB（无状态会话 Bean）或简单的 `@Transactional` 类用于域服务，并使用 JSF `@ViewScoped` beans 用于应用程序服务。 

UI 层的代码未包含在示例中，因为无论如何集成测试套件都不会执行它。 （在 Java EE 中，该层将由“.xhtml”文件形式的 JSF Facelet 组成。）

对于我们的第一个集成测试类，让我们考虑兽医屏幕，它只显示所有兽医及其专业的列表。

```java
public final class VetScreenTest
{
   @TestUtil VetData vetData;
   @SUT VetScreen vetScreen;

   @Test
   public void findVets() {
      // Inserts input data (instances of Vet and Specialty) into the database.
      Vet vet2 = vetData.create("Helen Leary", "radiology");
      Vet vet0 = vetData.create("James Carter");
      Vet vet1 = vetData.create("Linda Douglas", "surgery", "dentistry");
      List<Vet> vetsInOrderOfLastName = asList(vet0, vet1, vet2);

      // Exercises the code under test (VetScreen, VetMaintenance, Vet, Specialty).
      vetScreen.showVetList();
      List<Vet> vets = vetScreen.getVets();

      // Verifies the output is as expected.
      vets.retainAll(vetsInOrderOfLastName);
      assertEquals(vetsInOrderOfLastName, vets); // checks the contents and ordering of the list

      Vet vetWithSpecialties = vets.get(1); // this will be "vet1"...
      assertEquals(2, vetWithSpecialties.getNrOfSpecialties()); // ...which we know has two specialties

      vetData.refresh(vetWithSpecialties); // ensures the Vet contains data actually in the db
      List<Specialty> specialtiesInOrderOfName = vetWithSpecialties.getSpecialties();
      assertEquals("dentistry", specialtiesInOrderOfName.get(0).getName()); // checks that specialties...
      assertEquals("surgery", specialtiesInOrderOfName.get(1).getName()); // ...are in the correct order
   }
}
```

在上面的测试中首先要注意的是，它从应用程序的最顶层开始，该层是用 Java 编写的，因此完全在 JVM 中运行：应用程序层。 

因此，测试不关心任何 HTTP 请求和响应，也不关心应用程序 URL 如何映射到应用程序层中的组件； 这些细节因 UI 实现所使用的技术（JSF、JSP、Struts、GWT、Spring MVC 等）而异，并且被视为超出了集成测试的范围。

第二件事要注意的是测试代码非常干净并且专注于它要测试的内容。 它完全根据应用程序及其业务领域编写，没有部署、数据库配置或事务等低级问题。

最后，第三件需要注意的事情是测试类中根本没有出现 JMockit API。 

我们所拥有的只是使用 `@TestUtil` 和 `@SUT` 注释。 这些是用户定义的注释，可以根据团队的喜好选择任意名称。 在我们的示例代码中，它们的定义如下。

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Tested(availableDuringSetup = true, fullyInitialized = true)
public @interface TestUtil {} // a test utility object

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Tested(fullyInitialized = true)
public @interface SUT {} // the System Under Test
```

所以，这里我们使用JMockit的@Tested注解作为元注解。 

使用“fullInitialized = true”会导致通过依赖项注入（具体来说，构造函数注入后跟字段注入，如果适用）自动解析测试类的依赖项。 

使用“availableDuringSetup = true”只会导致在执行任何测试设置方法（JUnit 中的 @Before 或 TestNG 中的 @BeforeMethod）之前创建测试对象，这与在每个测试方法之前创建测试对象的默认设置相反 执行，并在任何设置方法之后。 

在第一个示例测试类中，未使用此效果，因此使用“@TestUtil”的唯一好处是记录测试类中字段的意图。

如测试中所示，VetData 提供了创建测试所需的新测试数据的方法，以及其他实用方法，例如刷新（实体）（强制从数据库中重新加载给定实体的持久状态）。 

顾名思义，测试套件将为每种实体类型提供一个这样的类，只要需要所述类型的持久实例，就可以在一个或多个测试类中使用。 

## 1.2 测试基础设施

像 VetData 这样的实用程序类如下所示。

```java
public final class VetData extends TestDatabase
{
   public Vet create(String fullName, String... specialtyNames) {
      String[] names = fullName.split(" ");

      Vet vet = new Vet();
      vet.setFirstName(names[0]);
      vet.setLastName(names[names.length - 1]);

      for (String specialtyName : specialtyNames) {
         Specialty specialty = new Specialty();
         specialty.setName(specialtyName);

         vet.getSpecialties().add(specialty);
      }

      db.save(vet);
      return vet;
   }

   // other "create" methods taking different data items, if needed
}
```

此类很容易编写，因为它们只需使用现有的实体类，以及 TestDatabase 基类的“db”字段中提供的方法。 

这是一个测试基础架构类，可以重用于不同的企业应用程序，只要它们使用 JPA 进行持久性（并使用 JMockit 进行集成测试）。

```java
public class TestDatabase
{
   @PersistenceContext private EntityManager em;
   @Inject protected Database db;

   @PostConstruct
   private void beginTransactionIfNotYet() {
      EntityTransaction transaction = em.getTransaction();

      if (!transaction.isActive()) {
         transaction.begin();
      }
   }

   @PreDestroy
   private void endTransactionWithRollbackIfStillActive() {
      EntityTransaction transaction = em.getTransaction();

      if (transaction.isActive()) {
         transaction.rollback();
      }
   }

   // Other utility methods: "refresh", "findOne", "assertCreated", etc.
}
```

数据库实用程序类（也可在生产代码中使用）提供比 JPA 的 EntityManager 更易于使用的 API，但其使用是可选的； 

测试可以直接使用“em”字段而不是“db”（当然，如果它受到保护的话）。 

测试数据库类中的 EntityManager em 字段被注入一个根据 META-INF/persistence.xml 文件自动创建的实例，该文件应该存在于测试运行时类路径中（使用时这将进入“src/test”目录） Maven 兼容的项目结构；然后可以在“src/main”下提供该文件的“生产”版本）。 

创建一个默认实体管理器实例，并将其注入到具有 @PersistenceContext 字段的任何测试或生产类（例如数据库类）中。 

如果需要多个数据库，则每个数据库都有一个不同的实体管理器，由该注释的可选“name”属性配置，并在 persistence.xml 文件中具有相应的条目。

这个基类的另一个重要职责是划分每个测试运行的事务，确保它在测试开始之前存在，并在测试完成后以回滚结束（无论成功或失败）。 

这是可行的，因为 JMockit 在适当的时间执行 @PostConstruct 和 @PreDestroy 方法（来自标准 javax.annotation API，Spring 框架也支持）。 

由于每个“测试数据”对象都是在 @Tested(availableDuringSetup = true) 字段中引入测试类的，因此它会在任何设置或测试方法之前“构造”，并在每个测试完成后“销毁”。

## 1.3 使用Spring框架

完全初始化的 @Tested 对象也支持 Spring 特定的注释，例如 @Autowired 和 @Value。 

但是，基于 Spring 的应用程序还可以在各种 BeanFactory 实现类的实例上直接调用 BeanFactory#getBean(...) 方法。

无论如何获取所述 bean 工厂实例，@Tested 和 @Injectable 对象都可以作为来自 bean 工厂实例的 bean 提供，只需应用mockit.integration.springframework.FakeBeanFactory 伪类，如下所示使用 JUnit。

```java
public final class ExampleSpringIntegrationTest
{
   @BeforeClass
   public static void applySpringIntegration() {
      new FakeBeanFactory();
   }

   @Tested DependencyImpl dependency;
   @Tested(fullyInitialized = true) ExampleService exampleService;

   @Test
   public void exerciseApplicationCodeWhichLooksUpBeansThroughABeanFactory() {
      // In code under test:
      BeanFactory beanFactory = new DefaultListableBeanFactory();
      ExampleService service = (ExampleService) beanFactory.getBean("exampleService");
      Dependency dep = service.getDependency();
      ...

      assertSame(exampleService, service);
      assertSame(dependency, dep);
   }
}
```

应用 bean 工厂 fake 后，如果给定的 bean 名称等于测试的字段名称，则任何 Spring bean 工厂实例上的任何 getBean(String) 调用都将自动返回测试类中字段的测试对象。

此外，mockit.integration.springframework.TestWebApplicationContext类可以用作org.springframework.web.context.ConfigurableWebApplicationContext实现，它从测试类公开@Tested对象。

# Interface resolution

一些应用程序代码库对许多特定于应用程序的实现类使用单独的 Java 接口。 

那么，这些接口是在接收注入依赖项的字段和/或参数中使用的接口。 

因此，当实例化具有基于接口的依赖关系的 @Tested 对象时，需要告知 JMockit 实现这些接口的类。 有两种方法可以做到这一点。

2.1 显式提供测试对象

2.2 提供接口解析方法

# 3 方法的权衡

在这种测试方法中，目标是进行涵盖企业应用程序代码库中所有 Java 代码的集成测试。 

为了避免在 Java 应用程序服务器（例如 Tomcat、Glassfish 或 JBoss Wildfly）内运行代码所固有的困难，这些测试是容器外测试，其中所有代码（生产代码和测试代码）都在同一个服务器中运行。 

测试是针对应用程序最高级别组件的 API 编写的。 

因此，UI 代码不会被执行，因为它通常不是用 Java 语言编写的，而是用特定于技术的模板语言（例如 JSF Facelets、JSP 或 Spring 框架支持的语言）编写的。 

为了练习此类 UI 组件（在 Web 应用程序中通常还包含 JavaScript 代码），我们需要使用 WebDriver 或 HtmlUnit 等测试 API 编写基于 HTTP 请求和响应的功能 UI 测试。 此类测试需要采用容器内方法，这带来了许多实际问题和困难，例如如何/何时启动应用程序服务器、如何部署/重新部署应用程序代码以及如何保持测试彼此隔离 鉴于典型的功能测试经常执行一个或多个数据库事务，其中部分或全部事务通常会被提交。

相比之下，此处显示的容器外集成测试更加细粒度，通常包含单个事务，该事务始终在测试结束时回滚。 

这种方法使得测试更容易创建、运行更快（特别是启动成本可以忽略不计）并且更不易损坏。 

使用代码覆盖工具也更容易，使用调试器也更容易/更快，因为所有内容都在单个 JVM 实例中运行。 

缺点是 UI 模板中的代码以及客户端 JavaScript 代码不会被此类测试覆盖。

# 参考资料

http://jmockit.github.io/tutorial/EnterpriseApplications.html

* any list
{:toc}