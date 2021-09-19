---
layout: post
title: Java Servlet3.1 规范-15-Require 与其它规范有关的要求
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 与其它规范有关的要求

本章列出对 web 容器的要求，它已经包含在容器产品中了，还包括其他Java 技术。

下面章节中任何涉及到 Java EE 应用的 profile，不只是完整的 Java EE profile，还包括任何支持 Servelt 的 profile，像 Java EE Web Profile。有关配置文件的更多信息，请参阅 Java EE 平台规范。

# 会话

分布式的 servlet 容器必须支持 Java EE 实现机制所必需的其他 Java EE 对象从一个 JVM 迁移到另一个。

# Web 应用

### Web 应用 Class Loader

Servlet 容器是一个 Java EE 产品的一部分，不应该允许应用程序重写Java SE 或 Java EE 平台的类，比如那些在 Java.* 和 javax.* 命名空间中的类，Java SE 或 Java EE 不允许被修改。

### Web 应用程序环境

Java EE 定义了一个命名的环境，允许应用程序在没有明确的知道外部信息是如何命名和组织的情况下轻松地访问资源和外部信息。

由于 servlet 是 Java EE 技术的一个完整的组件类型，已经在Web应用程序部署文件中规定了允许 servlet 获取引用资源和企业 bean 的指定信息。此包含信息的的部署元素有：

* env-entry
* ejb-ref
* ejb-local-ref
* resource-ref
* resource-env-ref
* service-ref
* message-destination-ref
* persistence-context-ref
* persistence-unit-ref

开发人员使用这些元素来描述在 Web 容器中运行时 Web 应用程序需要在JNDI命名空间中注册的某些对象。

Java EE 规范第5章中描述了关于Java EE环境设置的要求 Servlet 容器属于Java EE技术标准实现的一部分，它必须支持这种语法。查阅 Java EE 规范可获取更多详细信息。这种类型的 servlet 容器必须支持查找这种对象并在受 servlet 容器管理的线程上执行时调用这些对象。当在开发人员创建的线程上执行时，这种类型的 servlet 容器应该支持这种行为，但目前没有要求这样做。这样的规定将被添加到本规范的下一个版本中。开发人员应该小心，不推荐应用程序创建的线程依赖这种能力，因为它是不可移植的。

### Web模块上下文根URL的JNDI名称

Java EE平台规范定义了一个标准化的全局JNDI命名空间和一系列相关的命名空间映射到不同的Java EE应用程序范围。应用程序可以使用这些命名空间可移植地检索组件和资源的引用。本节定义的Web应用程序的基本URL是需要注册的JNDI名称。

为一个Web应用程序上下文根目录预定义的java.net.URL资源的名称的语法如下：

全局命名空间中

```
	java:global[/<app-name>]/<module-name>!ROOT
```

，应用程序指定的命名空间中

```
	java:app/<module-name>!ROOT
```

确定应用程序名称和模块名称的规则请参阅Java EE规范8.1.1节（组件创建）和 8.1.2节（应用程序组装）。

只有当Web应用打包成一个.ear文件时才适合使用`<app-name>`。

java:app 前缀允许一个组件内执行的Java EE应用程序来访问特定于应用程序的命名空间。java:app名称允许一个企业应用程序中的模块引用同一个企业应用程序中其他模块的上下文根目录。`<module-name>`是java:app url语法的必要组成部分。

#### 示例

然后，可以在应用程序使用上述的URL，如下：

如果Web应用程序使用模块名称myWebApp独立部署。URL可被注入到另一个web模块，如下：

CODE EXAMPLE 15-1

```java
	@Resource(lookup=“java:global/myWebApp!ROOT”)
	URL myWebApp;
```

当打包到一个名为myApp的EAR文件中时，可像下面这样使用：

CODE EXAMPLE 15-2

```java
	@Resource(lookup=“java:global/myApp/myWebApp!ROOT”)
	URL myWebApp;
```

# 安全

本节详细介绍了Web容器包含在一个产品中时额外的安全性要求，还包含EJB、JACC和（或）JASPIC。以下各节将介绍这些要求。

### EJB™调用传播的安全标识

必须始终提供一个安全标识或主体(principal)，用于调用一个企业 bean。从 Web 应用程序中调用企业 Bean 的默认模式是为把 Web 用户的安全标识传播到 EJB 容器。
在其他情况下，Web 容器必须允许不了解 Web 容器或 EJB 容器的 web 用户进行调用：

* Web 容器必须支持未把自己授权给容器的用户访问 Web 资源。这是在互联网上访问Web资源常见的模式。
* 应用程序代码可以是单点登录和基于调用者标识的定制化数据的唯一处理器。

在这些情况下，Web应用程序部署描述文件可以指定一个 run-as 元素。当为Servlet 指定了一个 run-as 角色时，Servlet 容器必须传播主要的映射到该角色，作为任何从 Servlet 到 EJB 调用的安全标识，包括从Servlet的init和destory方法进行原始调用。安全角色名必须是为Web应用程序定义的安全角色名称之一。
由于Web容器作为Java EE平台的一部分运行，在同一个Java EE应用程序中调用EJB组件，以及调用部署在其他Java EE中的应用程序都必须支持run-as元素的使用。

### 容器授权的要求

在Java EE产品中或包括支持 Java 容器授权合约（JAAC, i.e, JSR 115）的产品中，所有 Servlet 容器必须实现支持JACC。JACC规范可在此处下载 http://www.jcp.org/en/jsr/detail?id=115

### 容器认证的要求

在 Java EE 产品中或包括支持 Java 容器认证SPI（JASPIC, i.e, JSR 196）的产品中，所有 Servlet 容器必须实现 JASPIC 规范的 Servlet 容器 Profile。JASPIC 规范可在此处下载 http://www.jcp.org/en/jsr/detail?id=196

# 部署

本节详细说明了部署描述符,打包和部署描述符处理 Java EE 技术兼容的容器和产品的要求,包括对 JSP 和 Web 服务的支持。

### 部署描述符元素

以下附加元素存在于 Web 应用程序部署描述符，用于满足 Web 容器开启JSP 页面的要求，或作为 Java EE 应用服务器的一部分。它们不需要由希望仅支持Servlet 规范的容器支持：

* jsp-config
* 用于描述资源引用的语法 (env-entry, ejb-ref, ejb-local-ref, resource-ref, resource-env-ref)
* 指定消息目的地的语法 (message-destination, message-destination-ref)
* 引用Web Service (service-ref)
* 引用持久化上下文(persistence-context-ref)
* 引用持久化单元 (persistence-unit-ref)

这些元素的语法现在由Java服务器页面（JavaServer Pages）规范 2.2版本，和 Java EE 规范控制。

### 打包和JAX-WS组件部署

Web 容器可以选择支持运行实现 JAX-PRC 和/或 JAX-WS 规范定义的Web服务端点（endpoint）编写的组件。需要Web容器嵌入一个Java EE符合的实现来支持JAX-RPC和JAX-WS Web Service组件。

本节描述了Web容器包括也支持JAX-RPC和JAX-WS的产品的打包和部署模型。

JSR-109 [http://jcp.org/jsr/detail/109.jsp]定义了用于打包Web service接口与它关联的WSDL描述和关联的类的模型。它定义了一种机制用于启用了JAX-WS和JAX-RPC的容器链接到一个实现了这个Web service的组件。一个JAX-WS或JAX-RPC Web service实现组件使用JAX-WS和/或JAX-RPC规范定义的API，其定义了它与启用了JAX-WS 和/或 JAX-RPC的Web容器之间的契约。它被打包到WAR文件。Web service开发人员使用平常的`<servlet>`声明来声明这个组件。
启用了JAX-WS和JAX-RPC的Web容器必须支持开发人员在使用的Web部署描述符中定义用于端点实现组件的如下信息，使用与HTTP Servlet组件使用的Servlet元素相同的语法。子元素用于以如下方式指定端点信息：

* servlet-name元素定义可用于找出WAR中的处于其他组件中的这个端点描述的逻辑名字
* servlet-class元素提供这个端点实现的全限定Java类名
* description 元素可以用于描述该组件，并可能显示在一个工具中
* load-on-startup元素指定Web容器中的组件相对于其它组件的初始化顺序
* security-role-ref元素可以用于测试是否已通过身份认证的用户在一个逻辑安全角色中
* run-as元素可以用于覆盖该组件到EJB调用的身份传播

由开发人员定义的用于这个组件的任何Servlet初始化参数可能被容器忽略。此外，启用了JAX-WS和JAX-RPC的Web组件继承了用于定义如下信息的传统Web组件机制：

* 使用Servlet映射技术映射组件到Web容器的URL命名空间
* 使用安全约束在Web组件上授权约束
* 能够使用servlet过滤器提供底层（low-level）字节流支持，用于使用过滤器映射技术操纵JAX-WS和/或JAX-RPC消息
* 任何与组件关联的HTTP 会话的超时特性
* 链接到存储在JNDO命名空间的Java EE对象
  所有上述要求可使用定义在8.2节的“可插拔性”的插拔机制得到满足。

### 处理部署描述符的规则

符合 Java EE 技术实现一部分的容器和工具，需要根据 XML schema 验证部署描述符结构的正确性。建议验证，但对于不符合 Java EE 技术实现的web容器和工具不是必须的。


# 注解和资源注入

Java 元数据（Metadata）规范（JSR-175），是J2SE 5.0和更高版本的一部分，提供一种在Java代码中指定配置数据的方法。Java代码中的元数据也被称为注解。在JavaEE中，注解用于声明对外部资源的依赖和在Java代码中的配置数据而无需在配置文件中定义该数据。

本节描述了在Java EE技术兼容的Servlet容器中注解和资源注入的行为。本节扩展了Java EE规范第5节标题为“资源，命名和注入”。

注解必须支持以下容器管理的类，其实现了以下接口并在web应用部署描述符中声明，或使用定义在8.1节“注解和可插拔性”的注解声明或编程式添加的。

TABLE 15-1 Components and Interfaces supporting Annotations and Dependency Injection

| 组件类型  | 实现下面接口的类                                             |
| --------- | ------------------------------------------------------------ |
| Servlets  | javax.servlet.Servlet                                        |
| Filters   | javax.servlet.Filter                                         |
| Listeners | javax.servlet.ServletContextListener javax.servlet.ServletContextAttributeListener javax.servlet.ServletRequestListener javax.servlet.ServletRequestAttributeListener javax.servlet.http.HttpSessionListener javax.servlet.http.HttpSessionAttributeListener javax.servlet.http.HttpSessionIdListener javax.servlet.AsyncListener |

Web 容器不需要为存在注解的除了上表15-1列出的那些类执行资源注入。

引用必须在任何生命周期方法调用之前注入，且组件实例对应用是可用的。

在一个web应用中，使用资源注入的类只有当它们位于WEB-INF/classes目录，或如果它们被打包到位于WEB-INF目录下的jar文件中，它们的注解将被处理。容器可以选择性地为在其他地方的应用类路径中找到的类处理资源注入注解。

Web 应用部署描述符的web-app元素上包含一个metadata-complete属性。metadata-complete属性定义了web.xml描述符是否是完整的，或是否应考虑部署过程中使用的其他资源的元数据。元数据可能来自web.xml文件、web-fragment.xml文件、WEB-INF/classes中的类文件上的注解、和WEB-INF/lib目录中的jar文件中的文件上的注解。如果metadata-complete设置为“true”，部署工具仅检查web.xml文件且必须忽略如出现在应用的类文件上的@WebServlet、@WebFilter、和@WebListener注解，且必须也忽略WEB-INF/lib中的打包在jar文件的任何web-fragment.xml描述符。如果metadata-complete没有指定或设置为“false”，部署工具必须检查类文件和web-fragment.xml文件的元数据，就像前面指定的那样。

web-fragment.xml的web-fragment元素也包含了metadata-complete属性。该属性定义了对于给定片段的web-fragment.xml描述符是否是完整的，或者是否应该扫描相关的jar文件中的类中的注解。如果metadata-complete设置为“true”，部署工具仅检查web-fragment.xml文件且必须忽略如出现在fragment的类文件上的@WebServlet、@WebFilter、和@WebListener注解。如果metadata-complete没有指定或设置为“false”，部署工具必须检查类文件的元数据。

以下是Java EE技术兼容的web容器需要的注解。

### @DeclareRoles

该注解用于定义由应用安全模型组成的安全角色。该注解指定在类上，且它用于定义能从注解的类的方法内测试（即，通过调用 isUserInRole）的角色。由于用在 @RolesAllowed 而隐式声明的角色，不必使用@DeclareRoles 注解明确声明。@DeclareRoles 注解仅可以定义在实现了javax.servlet.Servlet 接口或它的一个子类的类中。

以下是如果使用该注解的一个例子。

CODE EXAMPLE 15-3 @DeclareRoles Annotation Example

```java
	@DeclareRoles("BusinessAdmin")
	public class CalculatorServlet {
		//...
	}
```

声明 @DeclareRoles("BusinessAdmin") 等价于如下在 web.xml 中的定义。

CODE EXAMPLE 15-4 @DeclareRoles web.xml

```xml
	<web-app>
		<security-role>
			<role-name>BusinessAdmin</role-name>
		</security-role>
	</web-app>
```

该注解不是用于重新链接（relink）应用角色到其他角色。当这样的链接是必需的，它是通过在相关的部署描述符中定义一个适当的security-role-ref来实现。

当从注解的类调用isUserInRole时，与调用的类关联的调用者身份以相同名称作为isCallerInRole的参数来测试角色成员身份。如果已经定义了参数role-name的一个security-role-ref，调用者测试映射到role-name的角色成员身份。

为进一步了解@DeclareRoles注解细节，请参考Java™平台™的通用注解（Common Annotation）规范（(JSR 250）第2.12节。

### @EJB

企业级 JavaBean™ 3.2 (EJB) 组件可以从一个 web 组件使用 @EJB 注解引用。@EJB注 解提供了与部署描述符中声明 ejb-ref 或 ejb-local-ref 元素等价的功能。有一个相应的 @EJB 注解的字段被注入一个相应的EJB组件的引用。

一个例子：

	@EJB private ShoppingCart myCart;

在上述情况下，到 EJB 组件“myCart”的一个引用被注入作为私有字段“myCart”的值，在声明注入的类可用之前。

进一步了解@EJB注解的行为请参考EJB 3.2规范（JSR 345）第11.5.1节。

### @EJBs

@EJBs 注解允许在单个资源上声明多于一个 @EJB 注解。

一个例子：

CODE EXAMPLE 15-5 @EJBs Annotation Example

```java
	@EJBs({@EJB(Calculator), @EJB(ShoppingCart)})
	public class ShoppingCartServlet {
		//...
	}
```

上面例子中的 EJB 组件 ShoppingCart 和 Calculator 对ShoppingCartServlet 是可用的。ShoppingCartServlet 仍然必须使用 JNDI 查找引用，但不需要声明在 web.xml 文件中。

### @Resource

@Resource 注解用于声明到资源的引用，如一个数据源（data source）、Java消息服务（JMS）目的地、或环境项（environment entry）。该注解等价于在部署描述符中声明resource-ref、 message-destination-ref、或env-ref、或resource-env-ref元素。
@Resource 注解指定在一个类、方法或字段上。容器负责注入到由@Resource 注解声明的资源的引用和映射到适当的JNDI资源。请参考 Java EE 规范第5章进一步了解细节。

以下是一个@Resource注解的例子：

CODE EXAMPLE 15-6 @Resource Example

```java
	@Resource
	private javax.sql.DataSource catalogDS;
	public getProductsByCategory() {
		// get a connection and execute the query
		Connection conn = catalogDS.getConnection();
	..
	}
```

在上面的示例代码中，servlet、filter或listener声明一个javax.sql.DataSource 类型的 catalogDS 字段，在该组件对应用可用之前由容器注入数据源引用。数据源JNDI映射是从字段名“catalogDS”和类型（javax.sql.DataSource）推导出来的。此外，catalogDS数据源不再需要定义在部署描述符中。

进一步了解@Resource注解的语义请参考Java™平台™的通用注解规范（JSR 250）第2.3节和Java EE 7规范第5.2.5节。

### @PersistenceContext

该注解指定容器管理的用于引用持久化单元（persistence unit）的实体管理器（entity manager）。

一个例子：

CODE EXAMPLE 15-7 @PersistenceContext Example

```java
	@PersistenceContext (type=EXTENDED)
	EntityManager em;
```

进一步了解@PersistenceContext注解的行为请参考Java持久化API（Java Persistence API）2.1版本第10.5.1节（JSR 338）。

### @PersistenceContexts

PersistenceContexts 注解允许在一个资源上声明多于一个@PersistenceContext。进一步了解 @PersistenceContexts 注解的行为请参考Java持久化API（Java Persistence API）2.1版本第10.5.1节（JSR 338）。

### @PersistenceUnit

@PersistenceUnit 注解提供声明在 servlet 中的到企业级 JavaBean组件实体管理器工厂（entity manager factory）的引用。实体管理器工厂绑定到一个单独的persistence.xml 配置文件，该文件在EJB 3.2规范（JSR 345）中 11.10 节中描述。

一个示例：

CODE EXAMPLE 15-8 @PersistenceUnit Example

```java
	@PersistenceUnit
	EntityManagerFactory emf;
```

进一步了解@ PersistenceUnit注解的行为请参考Java持久化API（Java Persistence API）2.1版本第10.5.2节（JSR 338）。

### @PersistenceUnits

该注解允许在一个资源上声明多于一个 @PersistentUnit。进一步了解@ PersistentUnits 注解的行为请参考Java持久化API（Java Persistence API）2.1版本第10.5.2节（JSR 338）。

### @PostConstruct

@PostConstruct 注解声明在一个无参的方法上，且必须不抛出任何检查的异常。返回值必须是void。该方法必须在资源注入完成之后被调用且在组件的任何生命周期方法之前被调用。

示例

CODE EXAMPLE 15-9 @PostConstruct Example

```java
	@PostConstruct
	public void postConstruct() {
		...
	}
```

上面的示例展示了一个使用 @PostConstruct 注解的方法。
@PostConstruct 注解必须支持那些支持依赖注入的所有类并即使该类不要求任何资源注入也会被调用。如果该方法抛出未受查一次，该类必须不被放入服务中且该实例没有方法被调用。

参考Java EE规范第2.5节和Java™平台™的通用注解规范的第2.5节获取更多细节。

### @PreDestroy

@PreDestroy 注解声明在容器管理组件的一个方法上。该方法在容器移除该组件之前调用。

一个例子：

CODE EXAMPLE 15-10 @PreDestroy Example

```java
	@PreDestroy
	public void cleanup() {
	// clean up any open resources
	...
	}
```


使用@PreDestroy注解的该方法必须返回void且必须不抛出受查异常。该方法可以是public、protected、package私有或private。该方法必须不是static的，但它可以是final的。

参考JSR 250第2.6节获取更多细节。

### @Resources

由于Java元数据规范不允许在相同的注解目标以相同名字使用多个注解，因此@Resources注解充当容器的多个@Resource注解。

一个例子：

CODE EXAMPLE 15-11 @Resources Example

```java
	@Resources ({
	@Resource(name=”myDB” type=javax.sql.DataSource),
	@Resource(name=”myMQ” type=javax.jms.ConnectionFactory)
	})
	public class CalculatorServlet {
		//...
	}
```

在上面的示例中 CalculatorServlet 通过 @Resources 注解 使的 JMS 连接工厂和数据源变得可用。

@Resources 注解的语义是进一步详细的常见的注释的Java™平台™规范(JSR 250)2.4节

### @RunAs

@RunAs 注解等价于部署描述符中的run-as注解。@RunAs注解可能仅定义在javax.servlet.Servlet 接口或它的子类的类实现上。

一个例子：


CODE EXAMPLE 15-12 @RunAs Example

```java
	@RunAs(“Admin”)
	public class CalculatorServlet {
	
		@EJB private ShoppingCart myCart;
	
		public void doGet(HttpServletRequest, req, HttpServletResponse	res) {
		//....
		myCart.getTotal();
		//....
		}
	}
		//....
	}
```

@RunAs(“Admin”) 语句等价于：

CODE EXAMPLE 15-13 @RunAs web.xml Example

```xml
	<servlet>
		<servlet-name>CalculatorServlet</servlet-name>
		<run-as>Admin</run-as>
	</servlet>
```

以上示例展示了当调用 myCart.getTotal() 方法时 Servlet 如何使用@RunAs 注解来传播安全身份“Admin”到 EJB 组件。进一步了解传播身份的细节请看第15.3.1节“EJB™调用的安全身份传播”。

进一步了解@RunAs注解的细节请参考Java™平台™的通用注解规范（JSR 250）第2.7节。

### @WebServiceRef

@WebServiceRef 注解在一个web组件中使用可能在部署描述符中的resource-ref 相同的方式提供一个到 web service 的引用。

一个例子：

```java
	@WebServiceRef private MyService service;
```

在这个例子中，一个到web service“MyService”的引用将被注入到声明该注解的类。

### @WebServiceRefs

这个注解允许在单个资源上声明多于一个的 @WebServiceRef 注解。进一步了解这个注解的行为请参考JAX-WS规范（JSR 224）第7章节。

### JavaEE 要求的上下文和依赖注入

在一个支持JavaEE（CDI）上下文和依赖注入且CDI开启的产品中，实现必须支持使用CDI managed bean。Servlet、Filter、Listener和HttpUpgradeHandler必须支持CDI注入和描述在EE.5.24节的拦截器使用，JavaEE 7平台规范“支持依赖注入”。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}