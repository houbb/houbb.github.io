---
layout: post
title:  Spring.NET-02-DI 依赖注入
date:  2017-04-09 22:13:58 +0800
categories: [Spring]
tags: [spring, dotnet]
header-img: "static/app/res/img/article-bg.jpeg"
published: true
---


# 依赖注入 (DI)

[依赖注入](http://www.springframework.net/doc-latest/reference/html/objects.html#objects-factory-collaborators) (DI) 是一个过程，通过该过程，对象仅通过构造函数参数和对象实例构造后设置的属性来定义它们的依赖项，即它们与之一起工作的其他对象。

# Constructor-based DI

构造器注入有三种方式。其中ByName应该是最常用的。

- User.cs

```c#
using System;
namespace springNet.domain
{
	public class User
	{
		private string name;

		private int id;

		public User(string name, int id)
		{
			this.name = name;
			this.id = id;
		}


		public override string ToString()
		{
			return string.Format("[User: name={0}, id={1}]", name, id);
		}
	}
}
```


- DICons.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<objects xmlns="http://www.springframework.net"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.net http://www.springframework.net/xsd/spring-objects.xsd">


  <object id="UserWithType" type="springNet.domain.User">
		<constructor-arg type="int" value="7500000"/>
  		<constructor-arg type="string" value="helloCons"/>
  </object>

  <object id="UserWithIndex" type="springNet.domain.User">
		<constructor-arg index="1" value="7500000"/>
  		<constructor-arg index="0" value="helloConsIndex"/>
  </object>

  <object id="UserWithName" type="springNet.domain.User">
		<constructor-arg name="id" value="7500000"/>
  		<constructor-arg name="name" value="helloConsName"/>
  </object>
	
</objects>
```

调用

```c#
IApplicationContext context = new XmlApplicationContext(
				 "Resources/DICons.xml");

User user = (springNet.domain.User) context.GetObject("UserWithType");
Console.WriteLine("User here :{0}", user);

User user2 = (springNet.domain.User)context.GetObject("UserWithIndex");
Console.WriteLine("User here :{0}", user2);

User user3 = (springNet.domain.User)context.GetObject("UserWithName");
Console.WriteLine("User here :{0}", user3);
```

结果

```
User here :[User: name=helloCons, id=7500000]
User here :[User: name=helloConsIndex, id=7500000]
User here :[User: name=helloConsName, id=7500000]
```


<label class="label label-info">Type Alias</label> 

| Type	        | Alias'	        | Array Alias'  |
|:---|:---| 
| System.Char 	| char, Char	    | char[], Char()  | 
| System.Int16	| short, Short	    | short[], Short()  | 
| System.Int32	| int, Integer	    | int[], Integer()  | 
| System.Int64	| long, Long	    | long[], Long()  | 
| System.UInt16	| ushort	        | ushort[]  | 
| System.UInt32	| uint	            | uint[]  | 
| System.UInt64	| ulong	            | ulong[]  | 
| System.Float	| float, Single	    | float[], Single()  | 
| System.Double	| double, Double	| double[], Double()  | 
| System.Date	    | date, Date	    | date[], Date()  | 
| System.Decimal	| decimal, Decimal	| decimal[], Decimal()  | 
| System.Bool	    | bool, Boolean	    | bool[], Boolean()  | 
| System.String	| string, String	| string[], String()  | 


# Setter-base DI

属性注入比较常见。这里有一点需要注意。实体类需要提供一个**无参构造**方法。

- User.cs

```c#
public class User
{
    private string name;

    private int id;

    string Name
    {
        get
        {
            return name;
        }
        set
        {
            name = value;
        }
    }

    int Id
    {
        get
        {
            return id;
        }
        set
        {
            id = value;
        }
    }

    public override string ToString()
    {
        return string.Format("[User: name={0}, id={1}]", name, id);
    }
}
```

- DISetter.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<objects xmlns="http://www.springframework.net"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.net http://www.springframework.net/xsd/spring-objects.xsd">


  <object id="UserWithSetter" type="springNet.domain.User">
		<property name="id" value="11"/>
		<property name="name" value="UserWithSetter"/>	
  </object>

</objects>
```


调用

```c#
IApplicationContext context = new XmlApplicationContext(
				 "Resources/DISetter.xml");
User user3 = (springNet.domain.User)context.GetObject("UserWithSetter");
Console.WriteLine("User here :{0}", user3);
```

结果

```
User here :[User: name=UserWithSetter, id=11]
```

<label class="label label-info">Tips</label>

- 设置NULL

这样定义

```xml
<property name="name"><null/></property>
```

等同于

```c#
name = null;
```

- 定义列表

如果 User 实体有属性如下：

```c#
List<int> numbers;
```

可定义如下：

```xml
<object id="UserWithSetter" type="springNet.domain.User">

  <property name="numbers"> 
    <list element-type="int"> 
      <value>11</value>
      <value>21</value> 
      <value>23</value>
      <value>34</value> 
      <value>36</value>
      <value>38</value> 
    </list> 
  </property>
  
</object>
```


# 基于方法的依赖注入

在大多数应用场景中，容器中的大多数对象都是单例。当一个单例对象需要与另一个单例对象协作，或者一个非单例对象需要与另一个非单例对象协作时，通常通过将一个对象定义为另一个对象的属性来处理依赖关系。

当对象生命周期不同步时会出现问题。假设单例对象 A 需要使用非单例（原型）对象 B，可能在每次调用 A 的方法时需要使用 B。容器只创建一次单例对象 A，因此只有一次机会设置其属性。容器无法在每次需要时为对象 A 提供一个新的对象 B 实例。

解决方案是放弃一些控制反转。你可以通过实现 `IApplicationContextAware` 接口使对象 A 感知容器，并在每次需要对象 B 时通过调用 `GetObject("B")` 向容器请求（通常是新的）对象 B。

以下是这种方法的一个示例：

```csharp
public class SingletonA : IApplicationContextAware {
    private IApplicationContext applicationContext;

    // Implementing the IApplicationContextAware interface
    public IApplicationContext ApplicationContext {
        set { applicationContext = value; }
    }

    public void DoSomething() {
        // Requesting a new instance of PrototypeB from the application context
        PrototypeB prototypeB = (PrototypeB)applicationContext.GetObject("B");
        prototypeB.PerformTask();
    }
}

public class PrototypeB {
    public void PerformTask() {
        // Implementation of task
    }
}
```

在这个示例中，`SingletonA` 类实现了 `IApplicationContextAware` 接口，并通过 `GetObject("B")` 调用从应用程序上下文请求一个新的 `PrototypeB` 实例。每次调用 `DoSomething` 方法时，都会获得一个新的 `PrototypeB` 实例并执行其任务。

```c#
using System.Collections;
using Spring.Objects.Factory;

namespace Fiona.Apple
{
    public class CommandManager : IObjectFactoryAware
    {
        private IObjectFactory objectFactory;

        public object Process(IDictionary commandState)
        {
            // grab a new instance of the appropriate Command
            Command command = CreateCommand();
            // set the state on the (hopefully brand new) Command instance
            command.State = commandState;
            return command.Execute();
        }

        // the Command returned here could be an implementation that executes asynchronously, or whatever
        protected Command CreateCommand()
        {
            return (Command) objectFactory.GetObject("command");  // notice the Spring API dependency 
        }

        public IObjectFactory ObjectFactory
        {
            set { objectFactory = value; }
        }
    }
}
```

上述方法并不理想，因为业务代码了解并依赖于 Spring 框架。方法注入是 Spring IoC 容器的一个相当高级的特性，它允许以一种干净的方式处理这种用例。

# 其他

## depends-on

`depends-on` 属性可以显式地强制一个或多个对象在使用此元素的对象初始化之前初始化。

例如：

```xml
<object id="objectOne" type="Examples.ExampleObject, ExamplesLibrary" depends-on="manager">
  <property name="manager" ref="manager"/>
</object>

<object id="manager" type="Examples.ManagerObject, ExamplesLibrary"/>
```

这将首先强制初始化 **manager**。

## 延迟初始化对象

默认情况下，`IApplicationContext` 实现会在初始化过程中急切地预先实例化所有单例对象。

通常这种预先实例化是**可取的**，因为配置或环境中的错误会立即被发现，而不是在数小时甚至数天后才被发现。

定义如下：

```xml
<object id="lazy" type="MyCompany.ExpensiveToCreateObject, MyApp" lazy-init="true"/>
<object name="not.lazy" type="MyCompany.AnotherObject, MyApp"/>
```

您还可以通过在 `<objects/>` 元素上使用 `default-lazy-init` 属性来控制容器级别的延迟初始化；例如：

```xml
<objects default-lazy-init="true">
  <!-- 不会预先实例化任何对象... -->
</objects>
```

* any list
{:toc}