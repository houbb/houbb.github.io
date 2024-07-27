---
layout: post
title:  Spring.NET-01-hello world 入门介绍
date:  2017-04-08 20:52:59 +0800
categories: [Spring]
tags: [spring, dotnet]
header-img: "static/app/res/img/article-bg.jpeg"
published: true
---

# Spring.NET

[Spring.NET](http://www.springframework.net/) 是一个开源应用程序框架，可以简化企业 .NET 应用程序的构建。

> 模块

![modules](https://raw.githubusercontent.com/houbb/resource/master/img/spring/2017-04-08-spring-net-overview.gif)

# 安装

先尝试最基础的模块：`spring.core`。可以直接通过 NuGet 搜索并引入，目前的版本是 **2.0.1**。

# IOC

2004年初，**Martin Fowler** 向他网站的读者提问：谈论控制反转时，“问题是他们在反转哪方面的控制？” 
在谈到控制反转这个术语之后，Martin 建议重命名该模式，或者至少给它一个更自解释的名称，并开始使用依赖注入这个术语。

## Hello World

文件目录

```
.
├── ./Program.cs
├── ./Properties
│   └── ./Properties/AssemblyInfo.cs
├── ./Resources
│   └── ./Resources/Objects.xml
├── ./bin
│   └── ./bin/Debug
│       └── ./bin/Debug/Resources
├── ./domain
│   └── ./domain/User.cs
├── ./obj
│   └── ./obj/x86
│       └── ./obj/x86/Debug
├── ./packages.config
└── ./springNet.csproj
```


- User.cs

```c#
using System;
namespace springNet.domain
{
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
}
```

- Objects.xml

MONO里，文件上右键->【生成操作】->【EmbeddedResource】; 文件上右键->【快捷属性】->【复制到输出目录】.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<objects xmlns="http://www.springframework.net"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.net http://www.springframework.net/xsd/spring-objects.xsd">


  <object id="CommonUser" type="springNet.domain.User">
		<property name="id" value="5"/>
		<property name="name" value="ryo"/>
  </object>
	
</objects>
```

- Main()

```c#
using System;
using Spring.Context;
using Spring.Context.Support;
using springNet.domain;

namespace springNet
{
	class MainClass
	{
		public static void Main(string[] args)
		{
			IApplicationContext context = new XmlApplicationContext(
				 "Resources/Objects.xml");

			User user = (springNet.domain.User)context.GetObject("CommonUser");
			Console.WriteLine("User :{0}", user);
		}
	}
}
```

执行结果:

```
User :[User: name=ryo, id=5]

Press any key to continue...
```

## Declarative configuration of the container in App.config/Web.config

- App.config

添加配置文件 `App.config` 内容如下：

```xml
<?xml version="1.0" encoding="utf-8"?>

<configuration>

<configSections>
<sectionGroup name="spring">
  <section name="context" type="Spring.Context.Support.ContextHandler, Spring.Core"/>
</sectionGroup>
</configSections>
	
<spring>
  <context>
    <resource uri="Resources/Objects.xml"/>
  </context>
</spring> 

</configuration>
```


- Main()

调用可简化如下：

```c#
public static void Main(string[] args)
{
    IApplicationContext context = ContextRegistry.GetContext();

    User user = (springNet.domain.User)context.GetObject("CommonUser");
    Console.WriteLine("User :{0}", user);
}
```


# 参考资料

> [objects-dependencies](http://www.springframework.net/docs/1.3.2/reference/html/objects.html#objects-dependencies)

> [xsd intergration](http://www.springframework.net/docs/1.3.2/reference/html/vsnet.html)

* any list
{:toc}