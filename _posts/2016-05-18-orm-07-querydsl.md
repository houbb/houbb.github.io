---
layout: post
title: ORM-07-querydsl 入门介绍
date:  2016-05-21 18:35:52 +0800
categories: [ORM]
tags: [orm, sql, jdbc]
---

# 拓展阅读

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)


# 1. 介绍

## 1.1 背景

Querydsl的诞生源于以类型安全的方式维护HQL查询的需求。逐步构建HQL查询需要进行字符串连接，导致代码难以阅读。通过普通字符串进行HQL构建时对域类型和属性的不安全引用是另一个问题。

在不断变化的领域模型中，类型安全在软件开发中带来巨大的好处。领域的变化直接反映在查询中，而在查询构建中使用自动完成可以使查询构建更快速、更安全。

最初Querydsl的目标语言是Hibernate的HQL，但现在它支持JPA、JDO、JDBC、Lucene、Hibernate Search、MongoDB、Collections和RDFBean作为后端。

如果您完全是Java中的数据库访问新手，https://www.marcobehler.com/guides/a-guide-to-accessing-databases-in-java 提供了对各种部分、组件和选项的良好概述，并向您展示了QueryDSL的确切位置。

## 1.2 原则

类型安全是Querydsl的核心原则。查询是基于生成的查询类型构建的，这些类型反映了您的领域类型的属性。

同时，函数/方法调用以完全类型安全的方式构建。

一致性是另一个重要原则。查询路径和操作在所有实现中都相同，而且查询接口具有共同的基础接口。

要了解 Querydsl 查询和表达式类型的表达能力，请参阅javadocs并查看com.querydsl.core.Query、com.querydsl.core.Fetchable和com.querydsl.core.types.Expression。


# 2.1. 查询JPA

Querydsl定义了一种在持久化领域模型数据之上进行查询的通用静态类型语法。

JDO和JPA是Querydsl的主要集成技术。本指南描述了如何将Querydsl与JPA结合使用。

Querydsl for JPA是JPQL和Criteria查询的替代品。它将Criteria查询的动态性与JPQL的表达能力结合在一起，而且是完全类型安全的。

## 2.1.1. Maven集成

将以下依赖项添加到您的Maven项目中：

```xml
<dependency>
  <groupId>com.querydsl</groupId>
  <artifactId>querydsl-apt</artifactId>
  <version>${querydsl.version}</version>
  <scope>provided</scope>
</dependency>

<dependency>
  <groupId>com.querydsl</groupId>
  <artifactId>querydsl-jpa</artifactId>
  <version>${querydsl.version}</version>
</dependency>
```

现在，配置Maven APT插件：

```xml
<project>
  <build>
    <plugins>
      ...
      <plugin>
        <groupId>com.mysema.maven</groupId>
        <artifactId>apt-maven-plugin</artifactId>
        <version>1.1.3</version>
        <executions>
          <execution>
            <goals>
              <goal>process</goal>
            </goals>
            <configuration>
              <outputDirectory>target/generated-sources/java</outputDirectory>
              <processor>com.querydsl.apt.jpa.JPAAnnotationProcessor</processor>
            </configuration>
          </execution>
        </executions>
      </plugin>
      ...
    </plugins>
  </build>
</project>
```

JPAAnnotationProcessor会找到使用javax.persistence.Entity注解的领域类型，并为它们生成查询类型。

如果您的领域类型中使用了Hibernate注解，您应该使用APT处理器com.querydsl.apt.hibernate.HibernateAnnotationProcessor。

运行`clean install`，您将获得生成的Query类型，存储在`target/generated-sources/java`目录中。

如果您使用Eclipse，请运行`mvn eclipse:eclipse`，将`target/generated-sources/java`包含为源文件夹，以更新Eclipse项目。

现在，您可以构造JPA查询实例和查询领域模型的实例。

## 2.1.2. Ant集成

将full-deps包的jar文件放在类路径上，并使用以下任务进行Querydsl代码生成：

```xml
<!-- 基于APT的代码生成 -->
<javac srcdir="${src}" classpathref="cp">
  <compilerarg value="-proc:only"/>
  <compilerarg value="-processor"/>
  <compilerarg value="com.querydsl.apt.jpa.JPAAnnotationProcessor"/>
  <compilerarg value="-s"/>
  <compilerarg value="${generated}"/>
</javac>

<!-- 编译 -->
<javac classpathref="cp" destdir="${build}">
  <src path="${src}"/>
  <src path="${generated}"/>
</javac>
```

将`src`替换为您的主源文件夹，`generated`替换为生成源文件的文件夹，`build`替换为目标文件夹。

## 2.1.3. 在Roo中使用Querydsl JPA

如果您在Spring Roo中使用Querydsl JPA，可以将`com.querydsl.apt.jpa.JPAAnnotationProcessor`替换为`com.querydsl.apt.roo.RooAnnotationProcessor`，后者将处理使用@RooJpaEntity和@RooJpaActiveRecord注解的类，而不是@Entity注解的类。

基于APT的代码生成在AspectJ IDTs中效果不佳。

## 2.1.4. 从hbm.xml文件生成模型

如果您使用带有基于XML的配置的Hibernate，可以使用XML元数据创建Querydsl模型。

`com.querydsl.jpa.codegen.HibernateDomainExporter`提供了此功能：

```java
HibernateDomainExporter exporter = new HibernateDomainExporter(
  "Q",                     // 名称前缀
  new File("target/gen3"), // 目标文件夹
  configuration);          // org.hibernate.cfg.Configuration的实例

exporter.export();
```

由于属性类型是通过反射解析的，因此需要在可见领域类型的类路径中执行HibernateDomainExporter。

所有JPA注解都被忽略，但会考虑Querydsl注解，如@QueryInit和@QueryType。

## 2.1.5. 使用查询类型

要使用Querydsl创建查询，您需要实例化变量和查询实现。

我们将从变量开始。

假设您的项目具有以下领域类型：

```java
@Entity
public class Customer {
    private String firstName;
    private String lastName;

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setFirstName(String fn) {
        firstName = fn;
    }

    public void setLastName(String ln) {
        lastName = ln;
    }
}
```

Querydsl将生成一个名为QCustomer的查询类型，放置在与Customer相同的包中。QCustomer可以作为Querydsl查询中的静态类型变量，代表Customer类型。

QCustomer具有一个默认的实例变量，可以作为静态字段访问：

```java
QCustomer customer = QCustomer.customer;
```

或者，您可以像这样定义自己的Customer变量：

```java
QCustomer customer = new QCustomer("myCustomer");
```

## 2.1.6. 查询

Querydsl JPA模块支持JPA和Hibernate API。

要使用JPA API，您可以像这样为查询使用JPAQuery实例：

```java
// 其中entityManager是JPA EntityManager
JPAQuery<?> query = new JPAQuery<Void>(entityManager);
```

如果您使用的是Hibernate API，可以像这样实例化HibernateQuery：

```java
// 其中session是Hibernate会话
HibernateQuery<?> query = new HibernateQuery<Void>(session);
```

JPAQuery和HibernateQuery都实现了JPQLQuery接口。

在本章的示例中，查询是通过JPAQueryFactory实例创建的。JPAQueryFactory应该是获取JPAQuery实例的首选选项。

对于Hibernate API，可以使用HibernateQueryFactory。

要检索名为Bob的客户，您可以构造如下查询：

```java
QCustomer customer = QCustomer.customer;
Customer bob = queryFactory.selectFrom(customer)
  .where(customer.firstName.eq("Bob"))
  .fetchOne();
```

selectFrom调用定义了查询源和投影，where部分定义了过滤器，fetchOne告诉Querydsl返回单个元素。很简单，对吧？

要创建具有多个源的查询，可以像这样使用查询：

```java
QCustomer customer = QCustomer.customer;
QCompany company = QCompany.company;
query.from(customer, company);
```

要使用多个过滤器，可以像这样使用：

```java
queryFactory.selectFrom(customer)
    .where(customer.firstName.eq("Bob"), customer.lastName.eq("Wilson"));
```

或者像这样使用：

```java
queryFactory.selectFrom(customer)
    .where(customer.firstName.eq("Bob").and(customer.lastName.eq("Wilson")));
```

在本地JPQL形式中，查询将如下编写：

```sql
select customer from Customer as customer
where customer.firstName = "Bob" and customer.lastName = "Wilson"
```

如果要通过"or"组合过滤器，则使用以下模式：

```java
queryFactory.selectFrom(customer)
    .where(customer.firstName.eq("Bob").or(customer.lastName.eq("Wilson")));
```

## 2.1.7. 使用联接

Querydsl支持JPQL中的以下联接变体：inner join、join、left join和right join。联接使用是类型安全的，并遵循以下模式：

```java
QCat cat = QCat.cat;
QCat mate = new QCat("mate");
QCat kitten = new QCat("kitten");
queryFactory.selectFrom(cat)
    .innerJoin(cat.mate, mate)
    .leftJoin(cat.kittens, kitten)
    .fetch();
```

查询的本机JPQL版本将是：

```sql
select cat from Cat as cat
inner join cat.mate as mate
left outer join cat.kittens as kitten
```

另一个例子：

```java
queryFactory.selectFrom(cat)
    .leftJoin(cat.kittens, kitten)
    .on(kitten.bodyWeight.gt(10.0))
    .fetch();
```

使用以下JPQL版本：

```sql
select cat from Cat as cat
left join cat.kittens as kitten
on kitten.bodyWeight > 10.0
```

## 2.1.8. 通用用法

使用JPQLQuery接口的级联方法，如下所示：

- select：设置查询的投影。（如果通过查询工厂创建，此步骤是不必要的）
- from：在此处添加查询源。
- innerJoin、join、leftJoin、rightJoin、on：使用这些结构添加联接元素。对于join方法，第一个参数是联接源，第二个是目标（别名）。
- where：添加查询过滤器，可以是以逗号分隔的可变参数形式，也可以是通过and运算符级联的形式。
- groupBy：以可变参数形式添加分组参数。
- having：将“group by”分组的过滤器作为Predicate表达式的可变参数数组添加。
- orderBy：以OrderSpecifier实例的可变参数数组形式添加结果的排序。对于数字、字符串和其他可比较的表达式，请使用asc()和desc()来访问OrderSpecifier实例。
- limit、offset、restrict：设置结果的分页。limit用于最大结果数，offset用于跳过行，restrict用于在一个调用中定义两者。

## 2.1.9. 排序

声明排序的语法如下：

```java
QCustomer customer = QCustomer.customer;
queryFactory.selectFrom(customer)
    .orderBy(customer.lastName.asc(), customer.firstName.desc())
    .fetch();
```

这相当于以下本机JPQL：

```sql
select customer from Customer as customer
order by customer.lastName asc, customer.firstName desc
```

## 2.1.10. 分组

分组可以使用以下形式进行：

```java
queryFactory.select(customer.lastName).from(customer)
    .groupBy(customer.lastName)
    .fetch();
```

这相当于以下本机JPQL：

```sql
select customer.lastName
from Customer as customer
group by customer.lastName
```

## 2.1.11. 删除子句

Querydsl JPA中的删除子句遵循简单的删除-where-执行形式。以下是一些示例：

```java
QCustomer customer = QCustomer.customer;
// 删除所有客户
queryFactory.delete(customer).execute();
// 删除级别低于3的所有客户
queryFactory.delete(customer).where(customer.level.lt(3)).execute();
```

where调用是可选的，execute调用执行删除并返回删除的实体数量。

JPA中的DML子句不考虑JPA级别的级联规则，也不提供细粒度的二级缓存交互。

## 2.1.12. 更新子句

Querydsl JPA中的更新子句遵循简单的update-set/where-执行形式。以下是一些示例：

```java
QCustomer customer = QCustomer.customer;
// 将名为Bob的客户重命名为Bobby
queryFactory.update(customer).where(customer.name.eq("Bob"))
    .set(customer.name, "Bobby")
    .execute();
```

set调用以SQL-Update样式定义属性更新，execute调用执行更新并返回更新的实体数量。

JPA中的DML子句不考虑JPA级别的级联规则，也不提供细粒度的二级缓存交互。

## 2.1.13. 子查询

要创建子查询，可以使用JPAExpressions的静态工厂方法，并通过from、where等定义查询参数。

```java
QDepartment department = QDepartment.department;
QDepartment d = new QDepartment("d");
queryFactory.selectFrom(department)
    .where(department.size.eq(
        JPAExpressions.select(d.size.max()).from(d)))
     .fetch();
```

另一个例子：

```java
QEmployee employee = QEmployee.employee;
QEmployee e = new QEmployee("e");
queryFactory.selectFrom(employee)
    .where(employee.weeklyhours.gt(
        JPAExpressions.select(e.weeklyhours.avg())
            .from(employee.department.employees, e)
            .where(e.manager.eq(employee.manager))))
    .fetch();
```

## 2.1.14. 暴露原始查询

如果需要在执行查询之前调整原始查询，可以像这样暴露它：

```java
Query jpaQuery = queryFactory.selectFrom(employee).createQuery();
// ...
List results = jpaQuery.getResultList();
```

## 2.1.15. 在JPA查询中使用本机SQL

Querydsl通过JPASQLQuery类支持在JPA中使用本机SQL。

要使用它，您必须为您的SQL模式生成Querydsl查询类型。例如，可以使用以下Maven配置完成：

```xml
<project>
  <build>
    <plugins>
      ...
      <plugin>
        <groupId>com.querydsl</groupId>
        <artifactId>querydsl-maven-plugin</artifactId>
        <version>${querydsl.version}</version>
        <executions>
          <execution>
            <goals>
              <goal>export</goal>
            </goals>
          </execution>
        </executions>
        <configuration>
          <jdbcDriver>org.apache.derby.jdbc.EmbeddedDriver</jdbcDriver>
          <jdbcUrl>jdbc:derby:target/demoDB;create=true</jdbcUrl>
          <packageName>com.mycompany.mydomain</packageName>
          <targetFolder>${project.basedir}/target/generated-sources/java</targetFolder>
        </configuration>
        <dependencies>
          <dependency>
            <groupId>org.apache.derby</groupId>
            <artifactId>derby</artifactId>
            <version>${derby.version}</version>
          </dependency>
        </dependencies>
      </plugin>
      ...
    </plugins>
  </build>
</project>
```

成功生成查询类型并将其放置在所选位置后，可以在查询中使用它们。

单列查询：

```java
// 序列化模板
SQLTemplates templates = new DerbyTemplates();
// 查询类型（S*用于SQL，Q*用于领域类型）
SAnimal cat = new SAnimal("cat");
SAnimal mate = new SAnimal("mate");
QCat catEntity = QCat.cat;

JPASQLQuery<?> query = new JPASQLQuery<Void>(entityManager, templates);
List<String> names = query.select(cat.name).from(cat).fetch();
```

如果在查询中混合使用实体（例如QCat）和表（例如SAnimal）引用，则需要确保它们使用相同的变量名称。SAnimal.animal的变量名为"animal"，因此使用了新实例（new SAnimal("cat")）。

另一种模式可能是：

```java
QCat catEntity = QCat.cat;
SAnimal cat = new SAnimal(catEntity.getMetadata().getName());
```

多列查询：

```java
query = new JPASQLQuery<Void>(entityManager, templates);
List<Tuple> rows = query.select(cat.id, cat.name).from(cat).fetch();
```

查询所有列：

```java
List<Tuple> rows = query.select(cat.all()).from(cat).fetch();
```

在SQL中查询，但以实体形式进行投影：

```java
query = new JPASQLQuery<Void>(entityManager, templates);
List<Cat> cats = query.select(catEntity).from(cat).orderBy(cat.name.asc()).fetch();
```

带有联接的查询：

```java
query = new JPASQLQuery<Void>(entityManager, templates);
cats = query.select(catEntity).from(cat)
    .innerJoin(mate).on(cat.mateId.eq(mate.id))
    .where(cat.dtype.eq("Cat"), mate.dtype.eq("Cat"))
    .fetch();
```

查询并将结果投影到DTO：

```java
query = new JPASQLQuery<Void>(entityManager, templates);
List<CatDTO> catDTOs = query.select(Projections.constructor(CatDTO.class, cat.id, cat.name))
    .from(cat)
    .orderBy(cat.name.asc())
    .fetch();
```

如果使用的是Hibernate API而不是JPA API，则使用HibernateSQLQuery。

# chat

## 详细介绍一下 Querydsl

Querydsl（Query Domain Specific Language）是一个用于构建类型安全的查询的框架，支持多种数据存储后端，包括关系型数据库、NoSQL 数据库以及其他数据存储系统。

它是一种领域特定语言（DSL），专门用于构建查询语句，使得查询操作更加容易、类型安全，并且支持面向对象的查询。

以下是 Querydsl 的一些主要特点和用法：

1. **类型安全的查询语句：** Querydsl 在编译时就能够检查查询语句的正确性，避免了在运行时出现的一些常见错误。这意味着你可以在开发阶段捕获到潜在的错误，而不是等到运行时才发现。

2. **支持多种数据存储后端：** Querydsl 不仅仅局限于关系型数据库，它还支持多种数据存储后端，包括 MongoDB、Elasticsearch 等。这使得你可以使用相同的查询语法来处理不同类型的数据存储。

3. **面向对象的查询：** Querydsl 使用面向对象的模型来表示查询，而不是使用字符串或者特定的查询语言。这样可以更直观地表达查询条件，使得代码更易读、易维护。

4. **支持 JPA、Hibernate、Spring Data 等集成：** Querydsl 与许多流行的 Java 持久化框架集成得很好，比如 JPA（Java Persistence API）、Hibernate、Spring Data 等。这使得在使用这些框架的项目中，可以轻松地使用 Querydsl 进行查询。

5. **丰富的查询功能：** Querydsl 提供了丰富的查询功能，包括过滤、排序、分页等，可以满足复杂的查询需求。

下面是一个简单的使用 Querydsl 进行查询的例子：

```java
// 使用 Querydsl 构建查询
JPAQueryFactory queryFactory = new JPAQueryFactory(entityManager);
QUser user = QUser.user; // Q 类是由 Querydsl 自动生成的，用于表示实体类
List<User> users = queryFactory
    .selectFrom(user)
    .where(user.age.gt(25).and(user.username.eq("John")))
    .orderBy(user.age.desc())
    .fetch();
```

在这个例子中，我们使用 Querydsl 的 JPA 模块，通过 `JPAQueryFactory` 来构建查询。`QUser` 类是由 Querydsl 自动生成的，用于表示实体类 `User`。

通过这种方式，我们可以以类型安全的方式构建查询条件，避免了手写字符串查询语句的弊端。

总的来说，Querydsl 是一个强大而灵活的查询框架，可以在 Java 项目中方便地构建类型安全的查询语句，提高代码的可维护性和可读性。

## 给一个 Querydsl 的 java 入门例子

当使用 Querydsl 进行查询时，通常需要以下步骤：

1. **引入 Querydsl 依赖：** 在项目的构建工具（比如 Maven 或 Gradle）中添加 Querydsl 的依赖。

2. **生成 Q 类：** 使用 Querydsl 提供的代码生成工具生成实体类对应的 Q 类。这个 Q 类包含了实体类中的属性，用于在查询中引用这些属性。

3. **配置 Querydsl 插件（可选）：** 如果使用 JPA 或 Hibernate，可以配置 Querydsl 插件，以便自动生成 Q 类。

4. **使用 Querydsl 进行查询：** 在代码中使用生成的 Q 类进行类型安全的查询。

下面是一个简单的 Querydsl 入门例子，假设我们有一个简单的实体类 `User`：

```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private int age;

    // 省略其他属性、构造函数和方法
}
```

接下来，我们将使用 Querydsl 进行查询。首先，我们需要引入相关的依赖。如果是使用 Maven，可以在 `pom.xml` 中添加如下依赖：

```xml
<dependencies>
    <!-- Querydsl core -->
    <dependency>
        <groupId>com.querydsl</groupId>
        <artifactId>querydsl-core</artifactId>
        <version>4.4.0</version> <!-- 查询最新版本 -->

        <!--
        如果使用 JPA 模块，还需要添加如下依赖：
        <dependency>
            <groupId>com.querydsl</groupId>
            <artifactId>querydsl-jpa</artifactId>
            <version>4.4.0</version>
        </dependency>
        -->
    </dependency>

    <!-- Querydsl apt plugin，用于生成 Q 类 -->
    <dependency>
        <groupId>com.querydsl</groupId>
        <artifactId>querydsl-apt</artifactId>
        <version>4.4.0</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

接着，我们需要配置 Maven 插件来生成 Q 类。在 `pom.xml` 中添加如下插件：

```xml
<build>
    <plugins>
        <!-- Querydsl Maven Plugin -->
        <plugin>
            <groupId>com.mysema.maven</groupId>
            <artifactId>apt-maven-plugin</artifactId>
            <version>1.1.3</version>
            <executions>
                <execution>
                    <goals>
                        <goal>process</goal>
                    </goals>
                    <configuration>
                        <outputDirectory>target/generated-sources/java</outputDirectory>
                        <processor>com.querydsl.apt.jpa.JPAAnnotationProcessor</processor>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

然后，运行 Maven 构建命令，生成 Q 类。

接下来，我们可以使用 Querydsl 进行查询。假设我们有一个 UserRepository 接口：

```java
import org.springframework.data.jpa.repository.JpaRepository;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;

public interface UserRepository extends JpaRepository<User, Long> {

    // 使用 Querydsl 提供的查询方法
    List<User> findByAge(int age);
    
    // 自定义 Querydsl 查询方法
    List<User> findByUsernameAndAge(String username, int age);

    // 使用 Querydsl 表达式进行复杂查询
    List<User> findByUsernameLength(int length);

    // 使用 Querydsl 表达式进行排序
    List<User> findByAgeGreaterThanOrderByUsernameDesc(int age);
}
```

在这个例子中，我们使用了 Querydsl 的表达式来构建查询方法。在实际的应用中，你可以根据具体的需求使用更复杂的查询条件。

最后，你可以在应用程序中使用这些查询方法，例如在服务层或控制层：

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getUsersByAge(int age) {
        return userRepository.findByAge(age);
    }

    public List<User> getUsersByUsernameAndAge(String username, int age) {
        return userRepository.findByUsernameAndAge(username, age);
    }

    public List<User> getUsersByUsernameLength(int length) {
        return userRepository.findByUsernameLength(length);
    }

    public List<User> getUsersByAgeSortedDescending(int age) {
        return userRepository.findByAgeGreaterThanOrderByUsernameDesc(age);
    }
}
```

这是一个简单的 Querydsl 入门例子，演示了如何在 Spring Data JPA 项目中使用 Querydsl 进行类型安全的查询。

实际上，Querydsl 可以与多种数据存储后端集成，提供丰富的查询功能。


## Querydsl 的实现原理

Querydsl 的实现原理涉及到编译时代码生成和运行时查询构建两个主要方面。

下面简要介绍这两个方面的实现原理：

1. **编译时代码生成：**

    - **Q 类的生成：** Querydsl 使用APT（Annotation Processing Tool）插件来在编译时生成 Q 类。在 JPA 或 Hibernate 中，Q 类对应于实体类，其中包含了实体类的属性作为静态常量，以及用于构建查询的查询DSL（Domain Specific Language）方法。这些方法通常是类型安全的，遵循面向对象的原则。

    - **查询DSL方法的生成：** Querydsl 使用注解处理器扫描实体类，根据实体类的字段生成相应的 Q 类和查询DSL方法。这样，开发者在查询时可以使用类型安全的 API，而不需要手写字符串形式的查询语句。

2. **运行时查询构建：**

    - **Query 类的使用：** 在运行时，开发者可以使用生成的 Q 类来构建查询。这些查询由 Querydsl 提供的 Query 接口表示，Query 接口包含了丰富的方法用于构建各种查询条件，如 where 子句、排序、分组等。

    - **支持不同数据存储后端：** Querydsl 提供了不同的模块，使其可以与不同的数据存储后端集成，比如 JPA 模块、Hibernate 模块、MongoDB 模块等。这些模块实现了相应的 Query 接口，以适应不同的数据存储系统。

    - **查询执行：** 在运行时，Querydsl 构建的查询被传递给相应的数据存储后端执行。例如，在 JPA 中，Query 对象最终被转化为 JPA Criteria 查询或者 JPQL 语句，并由 JPA 提供的实现执行。

总体来说，Querydsl 的实现原理主要涉及到编译时代码生成和运行时查询构建。

通过生成类型安全的 Q 类和查询DSL方法，Querydsl 在编译时就能够提供错误检查和智能提示等好处。

在运行时，Querydsl 提供了灵活的 API，使得开发者可以以面向对象的方式构建和执行查询，同时能够方便地适应不同的数据存储后端。

## 给出 Querydsl 的学习资料，包含网址 

以下是 Querydsl 的学习资料，包括官方文档、示例项目和其他相关资源：

1. **Querydsl 官方文档：**
   - [Querydsl 官方网站](http://www.querydsl.com/)：官方网站提供了详细的文档、示例和下载链接。
   - [Querydsl GitHub 仓库](https://github.com/querydsl/querydsl)：官方源代码托管在 GitHub 上，可以查看最新的代码、问题和贡献者。

2. **官方示例项目：**
   - [Querydsl 示例项目](https://github.com/querydsl/querydsl/tree/master/querydsl-examples)：官方提供了一些示例项目，涵盖了不同数据存储后端（JPA、Hibernate、MongoDB 等）的用法示例。

3. **入门教程和博客文章：**
   - [Querydsl - Getting Started](http://www.querydsl.com/static/querydsl/latest/reference/html_single/#d0e261)：官方文档的入门部分，提供了 Querydsl 的基本概念和使用指南。
   - [Introduction to Querydsl](https://www.baeldung.com/intro-to-querydsl)：Baeldung 网站上的一篇介绍 Querydsl 的文章，包含了一些基本的示例和用法。
   - [Querydsl Tutorial](https://www.javaguides.net/2019/06/querydsl-tutorial.html)：JavaGuides 上的 Querydsl 教程，涵盖了基本概念和使用方法。

4. **视频教程：**
   - [Querydsl - Predicate and QuerydslRepository](https://www.youtube.com/watch?v=0J3VzVP0zrk)：YouTube 上的一段 Querydsl 视频教程，介绍了 Predicate 和 QuerydslRepository 的使用。

5. **Stack Overflow：**
   - [Querydsl 标签](https://stackoverflow.com/questions/tagged/querydsl)：在 Stack Overflow 上的 Querydsl 标签下，你可以找到与 Querydsl 相关的问题和解答，也可以提出自己的问题。

请注意，由于互联网上的资源可能随时间变化，建议查看官方文档和最新的社区讨论以获取最准确和最新的信息。


# 参考资料

http://querydsl.com/static/querydsl/5.0.0/reference/html_single/#intro

* any list
{:toc}