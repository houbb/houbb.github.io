---
layout: post
title:  Spring.NET-06-test 测试
date:  2017-04-09 22:52:40 +0800
categories: [Spring]
tags: [spring, dotnet]
published: true
---

# 测试

对企业中[测试](http://www.springframework.net/docs/1.3.2/reference/html/testing.html)的全面处理超出了本章的范围；

本章的重点是采用 IoC 原则对单元测试的增值；

以及 Spring 框架在集成测试中提供的好处。

## 单元测试

这允许编写单元测试，使被测试的对象可以简单地用 `new` 运算符实例化，并在单元测试代码中设置其依赖项。

您可以使用 `mock` 对象（结合许多其他有价值的测试技术）来隔离测试您的代码。

## 集成测试

.NET 平台中最常见的两种测试工具：_Spring.Testing.NUnit.dll_ 和 _Spring.Testing.Microsoft.dll_。

使用方法类似，可以大概了解一下。

### 上下文管理和缓存

文章提到，如果配置文件较多，加载会很慢。为解决这个问题，Spring.net 提供了以下方案。

在 `AbstractDependencyInjectionSpringContextTests` 类中，有一个受保护的属性，子类必须实现该属性以提供上下文定义文件的位置：

```c#
protected abstract string[] ConfigLocations { get; }
```

在极少数情况下，如果测试可能会“弄脏”配置位置，需要重新加载 - 例如，通过更改对象定义或应用程序对象的状态 - 您可以在 `AbstractDependencyInjectionSpringContextTests` 上调用 `SetDirty()` 方法，使测试夹具在执行下一个测试用例之前重新加载配置并重建应用程序上下文。

### 测试夹具的依赖注入

当 `AbstractDependencyInjectionSpringContextTests`（及其子类）加载您的应用程序上下文时，它们可以选择通过**Setter 注入**配置测试类的实例。

您只需定义实例变量和相应的 setter 方法。`AbstractDependencyInjectionSpringContextTests` 会自动在 **ConfigLocations** 属性指定的一组配置文件中找到相应的对象。

#### daos.xml

`ConfigLocations` 方法引用的文件（`'classpath:com/foo/daos.xml'`）如下所示：

```xml
<?xml version="1.0" encoding="utf-8" ?>
<objects xmlns="http://www.springframework.net">

    <!-- 这个对象将被注入到 HibernateTitleDaoTests 类中 -->
    <object id="titleDao" type="Spring.Samples.HibernateTitleDao, Spring.Samples">
        <property name="sessionFactory" ref="sessionFactory"/>
    </object>

    <object id="sessionFactory" type="Spring.Data.NHibernate.LocalSessionFactoryObject, Spring.Data.NHibernate">
        <!-- 为了清晰省略的依赖项 -->
    </object>

</objects>
```

#### 使用 NUnit

```c#
[TestFixture]
public class HibernateTitleDaoTests : AbstractDependencyInjectionSpringContextTests {

    // 这个实例将被（自动）依赖注入    
    private HibernateTitleDao titleDao;

    // 一个 setter 方法用于 DI 的 'titleDao' 实例变量
    public HibernateTitleDao HibernateTitleDao {
        set { titleDao = value; }
    }

    [Test]
    public void LoadTitle() {
        Title title = this.titleDao.LoadTitle(10);
        Assert.IsNotNull(title);
    }

    // 指定为此测试夹具加载的 Spring 配置
    protected override string[] ConfigLocations {
        return new String[] { "assembly://MyAssembly/MyNamespace/daos.xml" };
    }

}
```

#### 使用 Microsoft 的测试框架

```c#
[TestClass]
public class HibernateTitleDaoTests : AbstractDependencyInjectionSpringContextTests {

    // 这个实例将被（自动）依赖注入    
    private HibernateTitleDao titleDao;

    // 一个 setter 方法用于 DI 的 'titleDao' 实例变量
    public HibernateTitleDao HibernateTitleDao {
        set { titleDao = value; }
    }

    [Test]
    public void LoadTitle() {
        Title title = this.titleDao.LoadTitle(10);
        Assert.IsNotNull(title);
    }

    // 指定为此测试夹具加载的 Spring 配置
    protected override string[] ConfigLocations {
        return new String[] { "assembly://MyAssembly/MyNamespace/daos.xml" };
    }

}
```

### 字段级别注入

如果由于某种原因，你不想通过 **Setter** 方法注入，Spring 也可以注入到 **protected** 的属性上。

```c#
[TestFixture]
public class HibernateTitleDaoTests : AbstractDependencyInjectionSpringContextTests {

    public HibernateTitleDaoTests() {
        // 开启字段级别注入
        PopulateProtectedVariables = true;
    }

    // 这个实例将被（自动）依赖注入
    protected HibernateTitleDao titleDao;

    [TestMethod]
    public void LoadTitle() {
        Title title = this.titleDao.LoadTitle(10);
        Assert.IsNotNull(title);
    }

    // 指定为此测试夹具加载的 Spring 配置
    protected override string[] ConfigLocations {
        return new String[] { "assembly://MyAssembly/MyNamespace/daos.xml" };
    }

}
```

在字段注入的情况下，没有自动装配发生：**protected** 实例变量的名称用于在配置的 Spring 容器中查找对象名称。

### 事务管理

这一点非常有用。确保所有的数据库测试不会污染数据库。例如，测试插入操作，如果没有回滚，运行多次就会有问题。

`AbstractTransactionalDbProviderSpringContextTests` 为此而生。

如果你希望事务提交 - 这很不寻常，但在希望某个特定测试填充数据库时偶尔有用 -

你可以调用从 AbstractTransactionalSpringContextTests 继承的 `SetComplete()` 方法。这将导致事务提交而不是回滚。

还有一种方便的方法是在测试用例结束前结束事务，通过调用 `EndTransaction()` 方法。

默认情况下，这将回滚事务，只有在之前调用 `SetComplete()` 时才会提交。这一功能在你希望测试“断开”的数据对象行为时很有用，

例如，在事务外的 Web 或远程层中使用的 Hibernate 映射对象。

通常，只有通过 UI 测试才能发现懒加载错误；如果你调用 `EndTransaction()`，你可以通过 NUnit 测试套件确保 UI 的正确操作。


* any list
{:toc}