---
layout: post
title: Java Servlet3.1 规范-14-部署描述符
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 部署描述符

本章指定的 Java™ Servlet 规范要求 Web 容器支持部署描述文件。部署描述文件表达了应用开发人员、应用集成人员和 Web 应用部署人员之间的元素和配置信息。

对于 Java Servlet 2.4 和以后的版本，部署描述文件在 XML 模式文档中定义。

为了向后兼容到2.2版本的API编写的应用程序，Web 容器也需要支持2.2版本的部署描述文件。为了向后兼容2.3版本的API编写的应用程序，Web容器也需要支持2.3版本的部署描述文件。

2.2版本的部署描述文件可在此下载：http://java.sun.com/j2ee/dtds/web-app_2_2.dtd，2.3版本的部署描述文件可在此下载：http://java.sun.com/dtd/web-app_2_3.dtd。

# 部署描述符元素

所有servlet容器的Web应用程序部署描述文件需要支持以下类型的配置和部署信息：

* ServletContext初始化参数
* Session配置
* Servlet声明
* Servlet映射
* 应用程序生命周期监听器类
* 过滤器定义和过滤器映射
* MIME类型映射
* 欢迎文件列表
* 错误页面
* 语言环境和编码映射
* 安全配置，包括login-config，security-constraint，security-constraint，security-role-ref和run-as


# 处理部署描述符的规则

本节列出了一些通用的规则，Web 容器和开发人员必须注意有关 Web 应用程序部署描述文件的处理。

* 对于部署描述文件的文本节点元素内容，Web 容器必须删除所有前导和后置空格，空格在XML 1.0“（http://www.w3.org/TR/2000/WD-xml-2e-20000814）中被定义为“S(white space)”。

* 部署描述文件对模式来说必须是有效的。Web 容器和操作 Web 应用程序的工具对检查 WAR 文件的有效性有多种选择。包括检查 WAR 文件中部署描述文件的有效性。

  此外，推荐 Web 容器和操作 Web 应用程序的工具提供一个级别的语义检查。例如，应该检查安全约束中引用的角色和部署描述文件中定义的某个安全角色具有相同的名称。

在 Web 应用程序不符合规范的情况下，工具和容器应该用描述性的错误消息告知开发人员。鼓励高端应用服务器提供商都提供这种有效性检查，以工具的形式和容器分开。

* 这个版本的规范中，web-app 的子元素的顺序可以是任意的。由于 XML模式的限制，可分发元素多样性，session-config、welcome-file-list、jsp-config、login-config以及locale-encoding-mapping-list，从“可选的”变成“0个或多个”。当部署描述文件包含多个session-config、 jsp-config 和 login-config 时，容器必须用描述性的错误消息告知开发人员。当有多个事件时，容器必须连接 welcome-file-list和 locale-encoding-mapping-list 中的项目。多个可分发的事件必须与单个可分发的事件以同样的方式正确对待。
* 假定部署描述符中指定的 URI 路径通过URL解码形式（意思是已经对URL进行了转义）。当 URL 包含 CR(#xD)（回车）或LF(#xA)（换行）时，容器必须用描述性的错误消息告知开发人员。容器必须保存所有其他字符，包括 URL 中的空格。
* 容器必须尝试规范化部署描文件中的路径。例如，/a/../b形式的路径必须解释为/b。部署描述文件中以../开始的路径或解析成以../开始的路径都不是有效的路径。
* URI路径指的是相对于WAR文件的根目录，或相对于WAR文件的根目录的一个路径映射，除非另有规定，应以/开头。
* 元素的值是一个枚举类型，其值是区分大小写的。

# 部署描述符

这个版本规范的部署描述文件可在此下载：http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd

# 部署描述符图解

本节举例说明部署描述文件中的元素。属性没有在图中显示。详细信息请参阅部署描述文件模式。

1.web-app元素

web-app 元素是一个 Web 应用程序的根部署描述符。此元素包含下列元素。这个元素有一个必需的属性 version 来指定部署描述符符合哪个版本的模式。此元素的所有子元素可以是任意的顺序。

FIGURE 14-1 web-app Element Structure

![](../images/FIGURE 14-1 web-app Element Structure.jpg)

2.description元素

description元素提供了父元素的文本描述。此元素不仅出现在web-app元素中，其他很多元素中也有。它有一个可选属性xml:lang指明描述中使用哪一种语言。该属性的默认值是英语（“en”）。

3.display-name元素

display-name元素包含一个简短的名称，目的是通过工具显示。显示名称不必是唯一的。这个元素有一个可选属性xml:lang用于指定语言。

4.icon元素

icon元素包含small-icon和large-icon元素，为大型和小型GIF或JPEG图标图片指定文件名，用于在GUI工具中表示父元素。

5.distributable元素

distributable元素表示设定该Web应用程序适合部署到一个分布式的servlet容器中。

6.context-param元素

context-param元素包含了Web应用程序的servlet上下文初始化参数的声明。

7.filter元素

filter元素声明了Web应用程序中的过滤器。该过滤器映射到一个servlet或filter-mapping元素中的一个URL模式，使用filter-name的值来引用。过滤器在运行时可以通过FilterConfig接口访问部署描述文件中声明的初始化参数。filter-name元素是过滤器的逻辑名称。它在Web应用程序中必须是唯一的。filter-name元素的元素内容不能为空。filter-class是过滤器的完全限定类名。init-param元素包含的名值对作为此过滤器的初始化参数。当指定可选的async-supported元素时，表示该过滤器支持异步请求处理。

FIGURE 14-2 filter Element Structure

![](../images/FIGURE 14-2 filter Element Structure.jpg)

8.filter-mapping元素

容器使用filter-mapping决定哪个过滤器以什么样的顺序应用到请求。filter-name的值必须是部署描述文件中声明的过滤器中的一个。匹配的请求可以被指定为url-pattern或servlet-name。

FIGURE 14-3 filter-mapping Element Structure

![](../images/FIGURE 14-3 filter-mapping Element Structure.jpg)

9.listener元素

listener表示应用程序监听器bean的部署属性。子元素listener-class声明应用程序中的一个类必须注册为Web应用程序监听器bean。它的值是监听器类的完全限定类名。

FIGURE 14-4 listener Element Structure

![](../images/FIGURE 14-4 listener Element Structure.jpg)

10.servlet元素

servlet元素用于声明一个servlet。它包含一个servlet的声明性数据。jsp-file元素包含到以“/”开头的Web应用程序中一个JSP文件的完全路径。如果指定了jsp-file并且存在load-on-start元素，那么JSP应该被预编译和加载。servlet-name元素包含了servlet的规范名称。在Web应用程序中每个servlet的名称是唯一的。servlet-name元素内容不能为空。servlet-class包含了servlet的完全限定类名。run-as元素指定用作一个组件执行的标识。它包含一个可选的description，和一个由role-name元素指定安全角色。load-on-startup元素表示该servlet应该在Web应用程序启动时加载（实例化并调用它的init()方法）。该元素的元素内容必须是一个整数，表示servlet应该被加载的顺序。如果该值是一个负整数，或不存在该元素，容器自由选择什么时候加载这个servlet。如果该值是一个正整数或0，当应用部署后容器必须加载和初始化这个servlet。容器必须保证较小整数标记的servlet在较大整数标记的servlet之前加载。容器可以选择具有相同load-on-startup值的servlet的加载顺序。security-role-ref元素声明组件中或部署组件的代码中的安全角色引用。它由一个可选的description，在代码中使用的安全角色名称（role-name），以及一个可选的到一个安全角色（role-link）的链接组成。如果没有指定安全角色，部署器必须选择一个合适的安全角色。当指定了可选的async-supported元素，指示的servlet可以支持异步请求处理。如果一个servlet支持文件上传功能和mime-multipart请求处理，通过描述文件中的multipart-config元素能够提供相同的配置。multipart-config元素可用于指定文件存储的位置，上传文件大小的最大值，最大请求大小和文件将写入磁盘之后的大小阈值。

FIGURE 14-5 servlet Element Structure

![](../images/FIGURE 14-5 servlet Element Structure.jpg)


11.servlet-mapping元素

servlet-mapping定义了servlet和URL模式之间的映射。

FIGURE 14-6 servlet-mapping Element Structure

![](../images/FIGURE 14-6 servlet-mapping Element Structure.jpg)

12.session-config元素

session-config元素定义了该Web应用程序的会话参数。子元素session-timeout定义了该Web应用程序中创建的所有会话的默认超时时间间隔。指定的超时时间必须使用分钟数表示。如果超时时间小于或等于0，容器将确保会话的默认行为永远不会超时。如果没有指定这个元素，容器必须设置它的缺省超时期限。

FIGURE 14-7 session-config Element Structure


![](../images/FIGURE 14-7 session-config Element Structure.jpg)

13.mime-mapping元素

mime-mapping定义了扩展名和MIME类型之间的映射。extension元素包含一个字符串描述的扩展名，例如“txt”。

FIGURE 14-8 mime-mapping Element Structure

![](../images/FIGURE 14-8 mime-mapping Element Structure.jpg)

14.welcome-file-list元素

welcome-file-list包含了一个有序的欢迎文件列表。子元素welcome-file包含一个用作缺省欢迎文件的文件名，如index.html

FIGURE 14-9 welcome-file-list Element Structure

![](../images/FIGURE 14-9 welcome-file-list Element Structure.jpg)

15.error-page元素

error-page包含一个错误代码或异常类型到Web应用程序中资源的路径之间的映射。不过，error-code或exception-type元素可以省略来指定一个默认的错误页面。子元素exception-type包含了一个Java异常类型的完全限定名称。子元素location包含了web应用程序中相对于web应用程序根目录的资源位置。location的值必须以'/'开头。

FIGURE 14-10 error-page Element Structure

![](../images/FIGURE 14-10 error-page Element Structure.jpg)

16.jsp-config Element

jsp-config用来提供Web应用程序中的JSP文件的全局配置信息。它有两个子元素，taglib和jsp-property-group。taglib元素可用来为Web应用程序中的JSP页面使用的标签库提供信息。详细信息请参阅JavaServer Pages规范2.1版本。

FIGURE 14-11 jsp-config Element Structure

![](../images/FIGURE 14-11 jsp-config Element Structure.jpg)

17.security-constraint元素

security-constraint 用于关联安全约束和一个或多个Web资源集合。子元素web-resource-collection确定安全约束应用到哪一些Web应用程序中资源的子集和这些资源的HTTP方法。auth-constraint表示用户角色应该允许访问此资源集合。这里使用的role-name必须与该Web应用程序定义的其中一个security-role元素的role-name对应，或者是指定的保留role-name“*”对应，这是一个表示web应用程序中的所有角色的紧凑语法。如果“*”和角色名都出现了，容器会将此解释为所有角色。如果没有定义角色，不允许任何用户访问由包含security-constraint所描述的Web应用程序的部分。当容器确定访问时匹配角色名称是区分大小写的。user-data-constraint表示客户端和容器之间的通信数据如何受到子元素transport-guarantee的保护。transport-guarantee的合法值是NONE，INTEGRAL或CONFIDENTIAL之一。

FIGURE 14-12 security-constraint Element Structure

![](../images/FIGURE 14-12 security-constraint Element Structure.jpg)

18.login-config元素

login-config用于配置应该使用的验证方法，可用于此应用程序的领域名，以及表单登录机制所需要的属性。子元素auth-method为Web应用程序配置验证机制。该元素的内容必须是BASIC、DIGEST、FORM、CLIENT-CERT、或vendor-specific验证模式。realm-name表示为Web应用程序选择用于验证模式的领域名。form-login-config指定应该用于基于表单登录的登录和错误页面。如果不使用基于表单的登录方式，这些元素将被忽略。

FIGURE 14-13 login-config Element Structure

![](../images/FIGURE 14-13 login-config Element Structure.jpg)

19.security-role元素

security-role定义了一个安全角色。子元素role-name指定安全角色的名称。该名称必须符合NMTOKEN的词法规则。

FIGURE 14-14 security-role Element Structure

![](../images/FIGURE 14-14 security-role Element Structure.jpg)

20.env-entry元素

env-entry声明了一个应用程序的环境入口。子元素env-entry-name包含部署组件环境入口的名称。这个名称是一个相对于java:comp/env上下文的JNDI名称。在部署组件中该名称必须是唯一的。env-entry-type包含了应用程序代码所期望的环境入口值的Java类型完全限定名。子元素env-entry-value指定部署组件的环境入口值。该值必须是一个String，对指定的使用一个String或java.lang.Character类型作为参数的构造器有效。可选的injection-target元素用来定义把指定的资源注入到字段或JavaBean属性。injection-target指定了类中应该被注入资源的类和名称。injection-target-class指定了注入目标的完全限定类名称。injection-target-name指定了指定类中的目标。首先把查找目标作为一个JavaBean属性名称。如果没有找到，则把查找目标作为一个字段名。在类初始化期间通过调用目标属性的set方法或给名称字段设置一个值将指定的资源注入到目标。如果环境入口指定了一个injection-target，那么env-entry-type可以省略或必须与注入目标的类型匹配。如果没有指定injection-target，那么需要指定env-entry-type。

FIGURE 14-15 env-entry Element Structure

![](../images/FIGURE 14-15 env-entry Element Structure.jpg)

21.ejb-ref元素

ejb-ref声明了一个对企业bean的home引用。ejb-ref-name指定了引用企业bean的部署组件代码中使用的名称。ejb-ref-type是引用的企业bean期望的类型，它可以是Entity或Session。home定义了引用的企业bean的home接口的完全限定名称。remote定义了引用的企业bean的remote接口的完全限定名称。ejb-link指定了连接到企业bean的一个EJB引用。更多详细信息请参阅Java平台企业版第6版。除了这些元素之外， injection-target元素可以用于定义指定的企业bean注入到一个组件的字段或属性。

FIGURE 14-16 ejb-ref Element Structure

![](../images/FIGURE 14-16 ejb-ref Element Structure.jpg)

22.ejb-local-ref元素

ejb-local-ref声明了对企业bean的本地home引用。local-home定义了企业bean的本地home接口的完全限定名称。local定义了企业bean的本地接口的完全限定名称。

FIGURE 14-17 ejb-local-ref Element Structure

![](../images/FIGURE 14-17 ejb-local-ref Element Structure.jpg)

23.service-ref元素

service-ref声明了一个对Web service的引用。service-ref-name声明了用于查找Web service模块组件的逻辑名称。建议所有service的引用名称以/service/ 开头。service-interface定义了客户端依赖的JAX-WS Service接口的完全限定类名称。在大多数情况下，这个值
是javax.xml.rpc.Service。也可以指定一个JAX-WS生成的服务接口类。 wsdl-file元素包含了WSDL文件的URI位置。这个位置相对于模块根目录。jaxrpc-mapping-file包含了描述应用程序使用的Java接口和wsdl-file中的WSDL描述之间的JAX-WS映射的文件名。这个文件名是一个模块文件中的相对路径。service-qname元素声明了具体的被称为WSDL的服务元素。如果没有声明wsdl-file，则不需要指定。port-component-ref元素声明了一个在容器中解析服务终端接口到一个WSDL端口的客户端依赖关系。它使用一个特别的端口组件选择性地关联服务终端接口。这仅被容器用于Service.getPort(Class)方法调用。handler元素为端口组件声明处理器。处理程序可以使用HandlerInfo接口访问init-param名值对。如果未指定port-name，处理器将与service的所有端口关联。详细信息请参阅JSR-109规范[http://www.jcp.org/en/jsr/detail?id=109]。不属于Java EE实现的容器不要求支持这个元素。

FIGURE 14-18 service-ref Element Structure

![](../images/FIGURE 14-18 service-ref Element Structure.jpg)

24.resource-ref元素

resource-ref 元素包含了部署组件对外部资源的引用声明。res-ref-name指定了一个资源管理器连接工厂引用的名称。这个名称是一个相对于java:com /env上下文的JNDI名称。在部署文件中这个名称必须是唯一的。res-type元素指定数据源的类型。该类型是一个希望由数据源实现的Java语言类或接口的完全限定名。res-auth指定部署组件代码是否以编程方式注册到资源管理器，或容器是否将代表的部署组件注册到资源管理器。如果是第二种情况，容器使用部署器提供的信息。res-sharing-scope指定了通过给定的资源管理器连接工厂引用获取的连接是否可以共享。如果指定了这个值，它必须是Shareable或Unshareable。可选的injection-target元素用于定义把指定的资源注入到字段或JavaBean属性。

FIGURE 14-19 resource-ref Element Structure

![](../images/FIGURE 14-19 resource-ref Element Structure.jpg)

25.resource-env-ref元素

resource-env-ref 包含了部署组件和对部署组件环境中的资源有关的管理对象的引用。resource-env-ref-name指定了资源环境引用的名称。它的值是部署组件代码中使用的环境入口名称，它是一个相对于java:comp/env上下文的JNDI名称，并且在部署组件中必须是唯一的。resource-env-ref-type指定了资源环境引用的类型。它是一个Java语言类或接口的完全限定名。可选的injection-target元素用于定义把指定的资源注入到字段或JavaBean属性。必须提供resource-env-ref-type除非指定了注入目标，在这种情况下，将使用目标的类型。如果两者都指定，该类型必须与注入目标的类型兼容。

FIGURE 14-20 resource-env-ref Element Structure

![](../images/FIGURE 14-20 resource-env-ref Element Structure.jpg)

26.message-destination-ref元素

message-destination-ref 元素包含了部署组件和对部署组件环境中的资源有关的消息目标的引用声明。message-destination-ref-name元素指定了一个消息目标引用的名称，它的值是部署组件代码中使用的环境入口名称。这个名称是一个相对于java:comp/env上下文的JNDI名称，并且在企业bean的ejb-jar中或其他部署文件中必须是唯一的。message-destination-type指定了目标的类型。这个类型由希望目标实现的Java接口指定。message-destination-usage指定了引用表示的消息目标的用法。这个值表示是使用目标信息中的消息，还是产生目标消息，亦或两者兼而有之。汇编器将使用此信息来连接目标的生产者与消费者。message-destination-link把一个消息目标引用或消息驱动bean连接到一个消息目标。汇编器设置这个值来反映应用程序中的生产者和消费者消息流。
这个值必须是同一个部署文件或同一个Java EE应用程序单元的另一个部署文件中的消息目标的message-destination-name。或者，这个值可以由一个路径名称组成，使用目标添加的message-destination-name和通过"#"分隔路径名称说明一个部署文件包含引用的消息目标。这个路径名称是相对于部署文件，包含引用消息目标的部署组件。这允许多个消息目标使用相同的名称作为唯一标识。可选的injection-target元素用于定义把指定的资源注入到字段或JavaBean属性。必须指定 message-destination-type 除非注入目标已经指定，在这种情况下，将使用目标的类型。如果两者都指定，该类型必须与注入目标的类型兼容。

示例：

```xml
	<message-destination-ref>
		<message-destination-ref-name>
			jms/StockQueue
		</message-destination-ref-name>
		<message-destination-type>
			javax.jms.Queue
		</message-destination-type>
		<message-destination-usage>
			Consumes
		</message-destination-usage>
		<message-destination-link>
			CorporateStocks
		</message-destination-link>
	</message-destination-ref>
```

FIGURE 14-21 message-destination-ref Element Structure

![](../images/FIGURE 14-21 message-destination-ref Element Structure.jpg)

27.message-destination元素

message-destination指定消息的目标。这个元素所描述的逻辑目标由部署器映射到物理目标。message-destination-name元素指定了消息目标的名称。该名称在部署文件的消息目标名称中必须是唯一的。
示例：

```xml
<message-destination>
	<message-destination-name>
		CorporateStocks
	</message-destination-name>
</message-destination>
```

FIGURE 14-22 message-destination Element Structure

![](../images/FIGURE 14-22 message-destination Element Structure.jpg)

28.locale-encoding-mapping-list元素

locale-encoding-mapping-list包含了语言环境和编码之间的映射。由子元素locale-encoding-mapping指定。

示例：

```xml
	<locale-encoding-mapping-list>
		<locale-encoding-mapping>
			<locale>ja</locale>
			<encoding>Shift_JIS</encoding>
		</locale-encoding-mapping>
	</locale-encoding-mapping-list>
```

FIGURE 14-23 locale-encoding-mapping-list Element Structure

![](../images/FIGURE 14-23 locale-encoding-mapping-list Element Structure.jpg)

# 示例

下面的例子说明了部署描述文件模式中列出的定义的用法。

### 一个简单的例子

CODE EXAMPLE 14-1 Basic Deployment Descriptor Example

```xml
	<?xml version="1.0" encoding="ISO-8859-1"?>
	<web-app xmlns="http://java.sun.com/xml/ns/j2ee"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee
	http://java.sun.com/xml/ns/j2ee/web-app_2_5.xsd”
	version=”2.5”>
		<display-name>A Simple Application</display-name>
		<context-param>
			<param-name>Webmaster</param-name>
			<param-value>webmaster@mycorp.com</param-value>
		</context-param>
		<servlet>
			<servlet-name>catalog</servlet-name>
			<servlet-class>com.mycorp.CatalogServlet
			</servlet-class>
			<init-param>
				<param-name>catalog</param-name>
				<param-value>Spring</param-value>
			</init-param>
		</servlet>
		<servlet-mapping>
			<servlet-name>catalog</servlet-name>
			<url-pattern>/catalog/*</url-pattern>
		</servlet-mapping>
		<session-config>
			<session-timeout>30</session-timeout>
		</session-config>
		<mime-mapping>
			<extension>pdf</extension>
			<mime-type>application/pdf</mime-type>
		</mime-mapping>
		<welcome-file-list>
			<welcome-file>index.jsp</welcome-file>
			<welcome-file>index.html</welcome-file>
			<welcome-file>index.htm</welcome-file>
		</welcome-file-list>
		<error-page>
			<error-code>404</error-code>
			<location>/404.html</location>
		</error-page>
	</web-app>
```

### 安全的例子

CODE EXAMPLE 14-2 Deployment Descriptor Example Using Security

```xml
	<?xml version="1.0" encoding="ISO-8859-1"?>
	<web-app xmlns="http://java.sun.com/xml/ns/j2ee"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee
	http://java.sun.com/xml/ns/j2ee/web-app_2_5.xsd"
	version=”2.5”>
		<display-name>A Secure Application</display-name>
		<servlet>
			<servlet-name>catalog</servlet-name>
			<servlet-class>com.mycorp.CatalogServlet
			</servlet-class>
		<init-param>
			<param-name>catalog</param-name>
			<param-value>Spring</param-value>
		</init-param>
		<security-role-ref>
		<role-name>MGR</role-name>
		<!-- role name used in code -->
		<role-link>manager</role-link>
		</security-role-ref>
		</servlet>
		<security-role>
		<role-name>manager</role-name>
		</security-role>
		<servlet-mapping>
		<servlet-name>catalog</servlet-name>
		<url-pattern>/catalog/*</url-pattern>
		</servlet-mapping>
		<security-constraint>
		<web-resource-collection>
			<web-resource-name>SalesInfo
			</web-resource-name>
			<url-pattern>/salesinfo/*</url-pattern>
			<http-method>GET</http-method>
			<http-method>POST</http-method>
		</web-resource-collection>
		<auth-constraint>
			<role-name>manager</role-name>
		</auth-constraint>
		<user-data-constraint>
			<transport-guarantee>CONFIDENTIAL
			</transport-guarantee>
		</user-data-constraint>
		</security-constraint>
	</web-app>
```




# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}