---
layout: post
title:  Spring.NET-02-DI
date:  2017-04-09 22:13:58 +0800
categories: [Spring]
tags: [spring, dotnet]
header-img: "static/app/res/img/article-bg.jpeg"
published: true
---


# DI

[Dependency injection](http://www.springframework.net/doc-latest/reference/html/objects.html#objects-factory-collaborators) (DI) 
is a process whereby objects define their dependencies, that is, the other objects they work with, 
only through constructor arguments and properties that are set on the object instance after it is constructed.



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


# Method-base DI

In most application scenarios, most object in the container are singletons. 
When a singleton object needs to collaborate with another singleton object, or a non-singleton object needs to collaborate with another non-singleton object, 
you typically handle the dependency by defining one object as a property of the other. 

A problem arrises when the object lifecycles are different. Suppose singleton object A needs to use a non-singleton (prototype) object B, 
perhaps on each method invocation on A. The container only creates the singleton object A once, and thus only gets one opportunity to set the properties. 
The container cannot provide object A with a new instance of object B every time one is needed.

A solution is to forego some inversion of control. You can make object A aware of the container by implementing the `IApplicationContextAware` interface, 
and by making a GetObject("B") call to the container ask for (a typically new) object B every time it needs it. 

Find below an example of this approach

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

The preceding is not desirable, because the business code is aware of and coupled to the Sring Framework. 
Method Injection, a somewhat advanced feature of the Spring IoC container, allows this use case to be handled in a clean fashion.





# Other 

## depends-on

The `depends-on` attribute can explicitly force one or more objects to be initialized before the object using this element is initialized. 

eg:

```xml
<object id="objectOne" type="Examples.ExampleObject, ExamplesLibrary" depends-on="manager">
  <property name="manager" ref="manager"/>
</object>

<object id="manager" type="Examples.ManagerObject, ExamplesLibrary"/>
```

首先会强制初始化 **manager**。
 
## Lazily-initialized objects

By default, `IApplicationContext` implementations eagerly pre-instantiate all singleton objects as part of the initialization process.

Generally this pre-instantiation is **desirable**, because errors in configuration or the surrounding environment are discovered immediately, as opposed to hours or even days later.

定义如下

```xml
<object id="lazy" type="MyCompany.ExpensiveToCreateObject, MyApp" lazy-init="true"/>
<object name="not.lazy" type="MyCompany.AnotherObject, MyApp"/>
```

You can also control lazy-initialization at the container level by using the default-lazy-init attribute on the `<objects/>`element; for example:

```xml
<objects default-lazy-init="true">
  <!-- no objects will be pre-instantiated... -->
</objects>
```

## Autowiring collaborators

TBC。。。



* any list
{:toc}







