---
layout: post
title:  Spring.NET-06-test
date:  2017-04-09 22:52:40 +0800
categories: [Spring]
tags: [spring, dotnet]
header-img: "static/app/res/img/article-bg.jpeg"
published: true
---


# Test

A thorough treatment of [testing](http://www.springframework.net/docs/1.3.2/reference/html/testing.html) in the enterprise is beyond the scope of this chapter; 

rather, the focus here is on the value add that the adoption of the IoC principle can bring to unit testing; 

and on the benefits that the Spring Framework provides in integration testing.


# Unit testing

This allows for unit tests to be written in a manner such that the object under test can be simply instantiated with the `new` operator and have its dependences set in the unit test code.
 
You can use `mock` objects (in conjunction with many other valuable testing techniques) to test your code in isolation.
 
 
# Integration testing

dotnet 最常见两种测试工具： _Spring.Testing.NUnit.dll_ and the MSTest is located in _Spring.Testing.Microsoft.dll_.

使用起来应该类似。大概看一下。


## Context management and caching

文章提到，如果配置文件较多，加载会很慢。为解决这个问题，Spring.net 有如下方案。


In class `AbstractDependencyInjectionSpringContextTests` has an protected property that subclasses must implement to provide the location of context definition files:

```c#
protected abstract string[] ConfigLocations { get; }
```

In the unlikely case that a test may 'dirty' the config location, requiring reloading - for example, by changing an object definition or the state of an application object - 
you can call the `SetDirty()` method on AbstractDependencyInjectionSpringContextTests to cause the test fixture to reload the configurations and 
rebuild the application context before executing the next test case.


## Dependency Injection of test fixtures

When `AbstractDependencyInjectionSpringContextTests` (and subclasses) load your application context, they can optionally configure instances of your test classes by **Setter Injection**. 

All you need to do is to define instance variables and the corresponding setters. `AbstractDependencyInjectionSpringContextTests` will automatically locate the corresponding object 
in the set of configuration files specified in the **ConfigLocations** property.

- daos.xml

The file referenced by the ConfigLocations method (`'classpath:com/foo/daos.xml'`) looks like this:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<objects  xmlns="http://www.springframework.net">

    <!-- this object will be injected into the HibernateTitleDaoTests class -->
    <object id="titleDao" type="Spring.Samples.HibernateTitleDao, Spring.Samples">
        <property name="sessionFactory" ref="sessionFactory"/>
    </object>
    
    <object id="sessionFactory" type="Spring.Data.NHibernate.LocalSessionFactoryObject, Spring.Data.NHibernate">
        <!-- dependencies elided for clarity -->
    </object>

</objects>
```

一、Using NUnit

```c#
[TestFixture]
public class HibernateTitleDaoTests : AbstractDependencyInjectionSpringContextTests  {

    // this instance will be (automatically) dependency injected    
    private HibernateTitleDao titleDao;

    // a setter method to enable DI of the 'titleDao' instance variable
    public HibernateTitleDao HibernateTitleDao {
        set { titleDao = value; }
    }

    [Test]
    public void LoadTitle() {
        Title title = this.titleDao.LoadTitle(10);
        Assert.IsNotNull(title);
    }

    // specifies the Spring configuration to load for this test fixture
    protected override string[] ConfigLocations {
        return new String[] { "assembly://MyAssembly/MyNamespace/daos.xml" };
    }

}
```



二、Using Microsoft's Testing Framework

```c#
[TestClass]
public class HibernateTitleDaoTests : AbstractDependencyInjectionSpringContextTests  {

    // this instance will be (automatically) dependency injected    
    private HibernateTitleDao titleDao;

    // a setter method to enable DI of the 'titleDao' instance variable
    public HibernateTitleDao HibernateTitleDao {
        set { titleDao = value; }
    }

    [Test]
    public void LoadTitle() {
        Title title = this.titleDao.LoadTitle(10);
        Assert.IsNotNull(title);
    }

    // specifies the Spring configuration to load for this test fixture
    protected override string[] ConfigLocations {
        return new String[] { "assembly://MyAssembly/MyNamespace/daos.xml" };
    }

}
```

# Field level injection

如果由于某种原因，你不想通过 **Setter** 方法注入，Spring 也可以注入到 **protected** 的属性上。

```c#
[TestFixture]
public class HibernateTitleDaoTests : AbstractDependencyInjectionSpringContextTests {

    public HibernateTitleDaoTests() {
    	   // switch on field level injection
        PopulateProtectedVariables = true;
    }

    // this instance will be (automatically) dependency injected
    protected HibernateTitleDao titleDao;

    [TestMethod]
    public void LoadTitle() {
        Title title = this.titleDao.LoadTitle(10);
        Assert.IsNotNull(title);
    }

    // specifies the Spring configuration to load for this test fixture
    protected override string[] ConfigLocations {
        return new String[] { "assembly://MyAssembly/MyNamespace/daos.xml" };
    }

}
```

In the case of field injection, there is no autowiring going on: the name of your **protected** instances variable(s) are used as the lookup object name in the configured Spring container.



# Transaction management

这个非常有用。确保所有的数据库测试不会污染数据库。或者是比如测试插入，没有回滚，跑多次就有问题。

`AbstractTransactionalDbProviderSpringContextTests` 为此而生。

If you want a transaction to commit - unusual, but occasionally useful when you want a particular test to populate the database - 

you can call the `SetComplete()` method inherited from AbstractTransactionalSpringContextTests. This will cause the transaction to commit instead of roll back.

There is also convenient ability to end a transaction before the test case ends, through calling the `EndTransaction()` method. 

This will roll back the transaction by default, and commit it only if `SetComplete()` had previously been called. 

This functionality is useful if you want to test the behavior of 'disconnected' data objects, 

such as Hibernate-mapped objects that will be used in a web or remoting tier outside a transaction. 

Often, lazy loading errors are discovered only through UI testing; if you call `EndTransaction()` you can ensure correct operation of the UI through your NUnit test suite.









* any list
{:toc}
















