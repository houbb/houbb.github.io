---
layout: post
title: java web mvc-02-struts2 入门介绍
date:  2016-5-14 11:58:26 +0800
categories: [WEB]
tags: [web, mvc]
published: false
---

# 拓展阅读

[Java Servlet 教程-20-自己手写实现 spring mvc 整体思路](https://houbb.github.io/2018/09/27/java-servlet-tutorial-20-fake-mvc)

[Java Servlet 教程-21-自己手写 spring mvc 简单实现](https://houbb.github.io/2018/09/27/java-servlet-tutorial-21-fake-mvc-simple)

[Spring Web MVC-00-重学 mvc](https://houbb.github.io/2019/12/25/springmvc-00-index)

[mvc-01-Model-View-Controller 概览](https://houbb.github.io/2016/05/14/mvc-01-overview)

[mvc-02-structs 介绍](https://houbb.github.io/2016/05/14/mvc-02-structs-intro)

[web mvc-03-JFinal](https://houbb.github.io/2016/05/14/mvc-03-jfinal-intro)

[web mvc-04-Apache Wicket](https://houbb.github.io/2016/05/14/mvc-04-apache-whicket-intro)

[web mvc-05-JSF JavaServer Faces](https://houbb.github.io/2016/05/14/mvc-05-jsf-intro)

[web mvc-06-play framework intro](https://houbb.github.io/2016/05/14/mvc-06-play-framework-intro)

[web mvc-07-Vaadin](https://houbb.github.io/2016/05/14/mvc-07-Vaadin)

[web mvc-08-Grails](https://houbb.github.io/2016/05/14/mvc-08-Grails)

# 从零手写组件系列

[java 从零手写 spring ioc 控制反转](https://github.com/houbb/ioc)

[java 从零手写 spring mvc](https://github.com/houbb/mvc)

[java 从零手写 jdbc-pool 数据库连接池](https://github.com/houbb/jdbc-pool)

[java 从零手写 mybatis](https://github.com/houbb/mybatis)

[java 从零手写 hibernate](https://github.com/houbb/hibernate)

[java 从零手写 rpc 远程调用](https://github.com/houbb/rpc)

[java 从零手写 mq 消息组件](https://github.com/houbb/rpc)

[java 从零手写 cache 缓存](https://github.com/houbb/cache)

[java 从零手写 nginx4j](https://github.com/houbb/nginx4j)

[java 从零手写 tomcat](https://github.com/houbb/minicat)

# Struts2

Apache Struts是一个用于创建优雅、现代Java Web应用程序的免费、开源的MVC框架。

> [struts](http://struts.apache.org/)

## Hello World

我的示例基于[maven](http://maven.apache.org/)和[struts2文档](http://struts.apache.org/docs/home.html)。
开始使用Struts2原型的推荐方式是使用原型目录。

```
mvn archetype:generate -DarchetypeCatalog=http://struts.apache.org/
```

Struts 2空白原型（"blank-archetype"）提供了一个最小但完整的Struts 2应用程序。
它演示了一些最基本的Struts 2概念。这是我的风格，我选择了这个。

使用

```
mvn clean install
```

来删除先前的文件并将JAR文件添加到您的存储库。

使用

```
mvn tomcat7:run
```

启动项目。或者将WAR文件放到Tomcat中。

<label class="label label-danger">错误</label>

您可能会遇到类似以下错误。

```
no plugin found for prefix 'tomcat 7' in the current project and in the plugin groups
```

<label class="label label-success">提示</label>

别担心，这是解决方法。打开**pom.xml**，将以下代码添加到**plugins**中。

```
<plugin>
    <groupId>org.apache.tomcat.maven</groupId>
    <artifactId>tomcat7-maven-plugin</artifactId>
    <version>${plugin.tomcat.version}</version>
    <configuration>
        <port>8080</port>
        <path>/</path>
        <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
    </configuration>
</plugin>
```

并将此代码添加到**properties**中。

```
<plugin.tomcat.version>2.2</plugin.tomcat.version>
```

好了，享受Struts2之旅。

## Configuration Files

## web.xml

在`web.xml`文件中，Struts定义了它的`FilterDispatcher`，这是一个Servlet过滤器类，用于初始化Struts框架并处理所有请求。如下所示...

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app id="struts_blank" version="2.4"
         xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

  <filter>
    <filter-name>struts2</filter-name>
    <filter-class>
      org.apache.struts2.dispatcher.filter.StrutsPrepareAndExecuteFilter
    </filter-class>
  </filter>
  <filter-mapping>
    <filter-name>struts2</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>

</web-app>
```

在上面的示例中，我们将Struts 2调度程序映射到`/*`，因此Struts 2会处理所有传入的请求。这是因为Struts 2从其JAR文件中提供静态内容，包括Dojo JavaScript文件（如果使用S2.0或S2.1+中的Dojo插件）和用于生成HTML的Struts 2标签的FreeMarker模板。

自Struts 2.1.7以来，您可以提供一个逗号分隔的模式列表，当匹配请求URL时，过滤器将直接通过。这是通过配置选项`struts.action.excludePattern`完成的，例如在您的`struts.xml`中：

```xml
<struts>
    <constant name="struts.action.excludePattern" value=".*unfiltered.*,.*\\.nofilter"/>
    ...
</struts>
```

您可能会问，`struts.xml`是什么？

## struts.xml

该框架的核心配置文件是默认的（`struts.xml`）文件，应存放在Web应用程序的类路径上（通常是`/WEB-INF/classes`）。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE struts PUBLIC
        "-//Apache Software Foundation//DTD Struts Configuration 2.3//EN"
        "http://struts.apache.org/dtds/struts-2.3.dtd">
<struts>
</struts>
```

<label class="label label-info">DTD</label>

DTD是文档类型定义，定义了XML文档的结构以及合法的元素和属性。

> [DTD](http://www.w3schools.com/xml/xml_dtd_intro.asp)

<label class="label label-info">include</label>

我们可以将一个大的`struts.xml`文件分解成较小的部分吗？

- 您可以在`struts.xml`中的`<package>`元素中交替使用`<include>`元素。配置对象将按出现的顺序加载。框架从上到下读取配置并在引用时按顺序添加对象。

```xml
<struts>
    <include file="example.xml"/>
    ...
</struts>
```

<label class="label label-info">Constant</label>

您可能会在`struts.xml`中找到这些，这是常量。

```xml
<constant name="struts.enable.DynamicMethodInvocation" value="false"/>
<constant name="struts.devMode" value="true"/>
```

常量提供了一种通过定义修改框架和插件行为的关键设置来自定义Struts应用程序的简单方法。

<label class="label label-info">Packages</label>

```xml
<package name="default" namespace="/" extends="struts-default">

    <default-action-ref name="index"/>

    <action name="index">
        <result>/index.html</result>
    </action>

</package>
```

- `package`元素具有一个必需的属性，即`name`，它充当稍后引用包的键。

- `namespace`属性将动作配置细分为逻辑模块，每个模块都有其自己的标识前缀。命名空间避免了动作名称之间的冲突。

- `extends`属性是可选的，允许一个包继承一个或多个先前包的配置。

- `action`映射可以指定一组结果类型、一组异常处理程序和一个拦截器堆栈。

## struts.properties

所有属性也可以在XML配置文件中使用**Constant Configuration**进行设置。

属性列表可以在`struts-default.properties`（在`struts2.jar`中）中找到。

```properties
### Struts default properties
###(can be overridden by a struts.properties file in the root of the classpath)
###
### This can be used to set your default locale and encoding scheme
# struts.locale=en_US
struts.i18n.encoding=UTF-8
 
### Used by the DefaultActionMapper
### You may provide a comma separated list, e.g. struts.action.extension=action,jnlp,do
### The blank extension allows you to match directory listings as well as pure action names
### without interfering with static resources, which can be specified as an empty string
### prior to a comma e.g. struts.action.extension=, or struts.action.extension=x,y,z,,
struts.action.extension=action,,
 
### Set this to false if you wish to disable implicit dynamic method invocation
### via the URL request. This includes URLs like foo!bar.action, as well as params
### like method:bar (but not action:foo).
### An alternative to implicit dynamic method invocation is to use wildcard
### mappings, such as <action name="*/*" method="{2}" class="actions.{1}">
struts.enable.DynamicMethodInvocation = false
 
### when set to true, Struts will act much more friendly for developers. This
### includes:
### - struts.i18n.reload = true
### - struts.configuration.xml.reload = true
### - raising various debug or ignorable problems to errors
###   For example: normally a request to foo.action?someUnknownField=true should
###                be ignored (given that any value can come from the web and it
###                should not be trusted). However, during development, it may be
###                useful to know when these errors are happening and be told of
###                them right away.
struts.devMode = false
```

## Wildcards

当应用程序规模增大时，动作映射的数量也会增加。通配符可以用来将相似的映射合并为一个更通用的映射。

解释通配符的最佳方式是通过示例并逐步演示其工作原理。

- action in struts.xml

```xml
<action name="*_*" class="struts2.example.{1}" method="{2}">
    <result>
        /WEB-INF/example/{1}_{2}.jsp
    </result>
</action>
```

- HelloWorld.java

```java
public class HelloWorld extends ActionSupport {

    public String add() {
        return SUCCESS;
    }

    public String update() {
        return SUCCESS;
    }
}

```

- url

```
http://localhost:8080/HelloWorld_add
```

匹配类`struts2.example.HelloWorld`，方法为`add`。结果是`/WEB-INF/example/HellWorld_add.jsp`。

- url

```
http://localhost:8080/HelloWorld_update
```

匹配类`struts2.example.HelloWorld`，方法为`update`。结果是`/WEB-INF/example/HellWorld_update.jsp`。

## Action Default

通常，如果请求一个动作，而框架无法将请求映射到动作名称，结果将是通常的"404 - 页面未找到"错误。

但是，如果您希望一个全能的动作处理任何未匹配的请求，您可以指定一个默认动作。

- default action define in struts.xml

```xml
<package name="default" namespace="/" extends="struts-default">
    <default-action-ref name="index"></default-action-ref>

    <action name="index">
        <result>
            /index.html
        </result>
    </action>

</package>
```

- url

```
http://localhost:8080/xxx/yyy/zzz
```

如果没有其他动作匹配，则将使用默认动作。

## Accept arguments

the login.jsp

```xml
<body>
<s:form action="Login">
    <s:textfield key="username"/>
    <s:password key="password" />
    <s:submit/>
</s:form>
</body>
```

1. Use the properties.

```java
public class Login extends ActionSupport {

    public String execute() throws Exception {
        System.out.printf(getUsername());
        return SUCCESS;
    }

    private String username;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
```

## Interceptors

拦截器允许您在执行动作方法之前和/或之后定义要执行的代码（"过滤器"模式）。

在开发应用程序时，拦截器可以是一个强大的工具。

### 1.interceptors

现在，我们创建一个时间拦截器来演示它是如何工作的。

- TimerAction.java

```java
public class TimerAction extends ActionSupport {
    @Override
    public String execute() throws Exception {
        return SUCCESS;
    }
}
```

- struts.xml first define for action

```xml
<package name="interceptor" namespace="/interceptor" extends="struts-default">
    <action name="timer" class="struts2.example.TimerAction">
        <result>
            /login.jsp
        </result>
    </action>
</package>
```

- define TimerInterceptor.java

```java
public class TimerInterceptor extends AbstractInterceptor {

    public String intercept(ActionInvocation actionInvocation) throws Exception {
        long start = System.currentTimeMillis();
        Thread.sleep(1000);
        long end = System.currentTimeMillis();

        String result = actionInvocation.invoke();
        System.out.println("Cost time: " + (end - start));
        return result;
    }
}
```

- register and call TimerInterceptor in struts.xml

```xml
<package name="interceptor" namespace="/interceptor" extends="struts-default">
    <!-- register -->
    <interceptors>
        <interceptor name="myTimer" class="struts2.example.interceptor.TimerInterceptor">
        </interceptor>
    </interceptors>

    <action name="timer" class="struts2.example.TimerAction">
        <!-- call -->
        <interceptor-ref name="myTimer"></interceptor-ref>
        <result>
            /login.jsp
        </result>
    </action>
</package>
```

### 2.struts-default

你可能在很多地方看到过**extends="struts-default"**，这是什么意思呢？这在`struts-default.xml`中有定义。

默认配置（`struts-default.xml`）设置了一个默认的拦截器堆栈，适用于大多数应用程序。

```xml
<struts>
    <constant name="struts.excludedClasses"
                  value="com.opensymphony.xwork2.ActionContext" />
                  ...
    <package name="struts-default" abstract="true" strict-method-invocation="true">
        ...
        <interceptors>
            <interceptor name="${interceptorName}" class="${interceptorClass}" />
            ...
            <interceptor-stack name="${stackName}">
                <interceptor-ref name="${interceptorName}"/>
                ...
            </interceptor-stack>
            ...
        </interceptors>

        <default-interceptor-ref name="defaultStack"/>
        <default-class-ref class="com.opensymphony.xwork2.ActionSupport" />
        <global-allowed-methods>execute,input,back,cancel,browse,save,delete,list,index</global-allowed-methods>
    </package>
</struts>
```

### 3.default interceptors

- We define a page **LoginSuccess.jsp** which access with login first.

```html
<body>
    <h1>Login Success</h1>
    <p>this page must login first!</p>
</body>
```

- define the struts.xml

```xml
<action name="auth">
    <interceptor-ref name="myStack"></interceptor-ref>

    <result>/WEB-INF/example/LoginSuccess.jsp</result>
    <result name="login">/login.jsp</result>
</action>
```

Now, we input

```
http://localhost:8080/authInterceptor/auth
```

will access this page without login, that's not good.

- Okay, we define a page for login first.

```html
<body>
    <h1>Login</h1>
    ${loginError}
    <form action="LoginAction" method="post">
        UserName: <input type="text" name="username"/>
        Password: <input type="password" name="password"/>
        <input type="submit" value="Submit"/>
    </form>
</body>
```

- define LoginAction in struts.xml

```xml
<action name="LoginAction" class="struts2.example.action.LoginAction" method="login">
    <result>/WEB-INF/example/LoginSuccess.jsp</result>
    <result name="error">/login.jsp</result>
</action>
```

- LoginAction.java

```java
public class LoginAction extends ActionSupport implements SessionAware {
    public static String LOGIN_SUCCESS = "loginSuccess";
    public static String LOGIN_ERROR = "loginError";

    private String username;
    private String password;
    private Map<String, Object> session = new HashMap<String, Object>();

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setSession(Map<String, Object> session) {
        this.session = session;
    }

    public String login() {
        if(username.equals("admin") && password.equals("123456")) {
            session.put(LOGIN_SUCCESS, "success");
            return SUCCESS;
        }

        session.put(LOGIN_ERROR, "Error username or password.");
        return ERROR;
    }
}
```

- AuthInterceptor.java

```java
public class AuthInterceptor extends AbstractInterceptor {
    @Override
    public String intercept(ActionInvocation actionInvocation) throws Exception {
        ActionContext actionContext = ActionContext.getContext();
        Map<String, Object> session = actionContext.getSession();

        if(session != null && "success".equals(session.get(LoginAction.LOGIN_SUCCESS))) {
            String result = actionInvocation.invoke();
            return result;
        }

        return "login"; //need login;
    }
}
```

- register and use interceptor in struts.xml

```xml
<struts>
    <package name="authInterceptor" namespace="/authInterceptor" extends="struts-default">
        <!-- register interceptor-->
        <interceptors>
            <interceptor name="auth" class="struts2.example.interceptor.AuthInterceptor"></interceptor>
            <!-- define my stack-->
            <interceptor-stack name="myStack">
                <interceptor-ref name="auth"></interceptor-ref>
                <interceptor-ref name="defaultStack"></interceptor-ref>
            </interceptor-stack>
        </interceptors>

        <action name="auth">
            <interceptor-ref name="myStack"></interceptor-ref>

            <result>/WEB-INF/example/LoginSuccess.jsp</result>
            <result name="login">/login.jsp</result>
        </action>

        <action name="LoginAction" class="struts2.example.action.LoginAction" method="login">
            <result>/WEB-INF/example/LoginSuccess.jsp</result>
            <result name="error">/login.jsp</result>
        </action>

    </package>
</struts>
```

> <a title="directives" href="{{ site.url }}/static/download/struts/struts.zip"><i class="fa fa-fw fa-download"></i>&nbsp;struts.zip</a>


# chat

## 详细介绍一下 structs2

Structs2 是一个流行的 Java Web 应用框架，主要用于构建基于 MVC（Model-View-Controller）模式的应用。它是 Struts 1 的继任者，相较于 Struts 1，Structs2 在设计和功能上有了显著的改进。以下是 Structs2 的一些主要特性和优点：

### 主要特性

1. **POJO（Plain Old Java Objects）行动类**：
   Structs2 允许使用简单的 POJO 类来作为行动类，而不需要继承框架特定的类或实现接口，这使得代码更加简洁和易于测试。

2. **拦截器（Interceptor）**：
   Structs2 使用拦截器来处理大部分的框架逻辑，如验证、文件上传、数据预处理等。这使得业务逻辑和框架逻辑分离，代码更清晰。

3. **可插拔的视图技术**：
   Structs2 支持多种视图技术，如 JSP、FreeMarker、Velocity 等，开发者可以根据需求选择合适的视图技术。

4. **强大的标签库**：
   Structs2 提供了丰富的标签库，用于简化 JSP 页面的开发，如数据表单标签、UI 标签等。

5. **内置验证框架**：
   Structs2 提供了灵活的验证框架，支持 XML 配置、注解配置等方式，方便进行表单验证。

6. **良好的集成能力**：
   Structs2 能够与其他流行的 Java 框架和技术（如 Spring、Hibernate）无缝集成，增强了应用的扩展性和灵活性。

### 架构概述

Structs2 的架构主要包括以下几个组件：

1. **Action**：代表用户的一个操作请求，处理业务逻辑并返回一个结果字符串。
2. **Interceptor**：在 Action 执行前后进行预处理和后处理。
3. **Result**：根据 Action 返回的结果字符串，决定如何呈现响应页面。
4. **OGNL（Object-Graph Navigation Language）**：用于在 JSP 中访问和操作数据。

### 工作流程

1. **请求进入**：客户端发出请求。
2. **拦截器链**：请求首先经过一系列的拦截器进行预处理。
3. **Action 执行**：拦截器链处理完毕后，请求交给相应的 Action 处理。
4. **结果处理**：Action 返回一个结果字符串，根据该字符串找到对应的 Result 类型，决定如何呈现响应页面。
5. **视图渲染**：Result 负责渲染最终的响应页面，返回给客户端。

### 使用示例

以下是一个简单的 Structs2 使用示例：

**1. 定义一个 Action 类：**

```java
package com.example.action;

public class HelloWorldAction {
    private String message;

    public String execute() {
        message = "Hello, Struts2!";
        return "success";
    }

    public String getMessage() {
        return message;
    }
}
```

**2. 配置文件 `struts.xml`：**

```xml
<!DOCTYPE struts PUBLIC "-//Apache Software Foundation//DTD Struts Configuration 2.0//EN"
        "http://struts.apache.org/dtds/struts-2.0.dtd">
<struts>
    <package name="default" extends="struts-default">
        <action name="hello" class="com.example.action.HelloWorldAction">
            <result name="success">/hello.jsp</result>
        </action>
    </package>
</struts>
```

**3. JSP 页面 `hello.jsp`：**

```jsp
<%@ taglib prefix="s" uri="/struts-tags" %>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1><s:property value="message"/></h1>
</body>
</html>
```

通过这些配置，当客户端请求 `hello` 时，Structs2 框架会调用 `HelloWorldAction` 的 `execute` 方法，并返回 `hello.jsp` 页面，在页面中显示 `message` 属性的值。

Structs2 框架的灵活性和扩展性使得它在开发复杂的 Java Web 应用时非常有用。通过合理使用拦截器、标签库和验证框架，可以大大提高开发效率和代码质量。

## structs2 的设计有哪些优秀之处？

Structs2（Struts 2）在设计上有许多优秀之处，使其成为一个强大且灵活的 Web 应用框架。以下是 Structs2 设计上的一些优秀之处：

### 1. 简单的 POJO Action
Structs2 允许使用普通的 Java 类（POJO）作为 Action 类，而不需要继承特定的框架类或实现接口。这使得代码更加简洁、易于理解和测试，同时减少了对框架的依赖。

### 2. 拦截器机制
Structs2 使用拦截器（Interceptor）来处理大部分的框架逻辑，如验证、文件上传、数据预处理等。拦截器可以在 Action 执行前后进行处理，使得业务逻辑和框架逻辑分离，增强了代码的可维护性和可扩展性。

### 3. 灵活的配置
Structs2 提供了灵活的配置方式，可以使用 XML 配置文件（如 `struts.xml`）或者基于注解的配置方式。这种灵活性允许开发者根据项目需求选择最合适的配置方式。

### 4. 丰富的标签库
Structs2 提供了丰富的标签库，用于简化 JSP 页面的开发，如数据表单标签、UI 标签等。通过这些标签，开发者可以更加方便地进行表单数据绑定和页面展示。

### 5. 内置验证框架
Structs2 内置了一个强大的验证框架，支持多种验证方式（XML 配置、注解配置）。开发者可以非常方便地对表单输入进行验证，确保数据的正确性和安全性。

### 6. OGNL（Object-Graph Navigation Language）
Structs2 使用 OGNL 作为表达式语言，支持在 JSP 中访问和操作数据。这种方式使得数据绑定和表达式处理更加灵活和强大。

### 7. 可插拔的视图技术
Structs2 支持多种视图技术，如 JSP、FreeMarker、Velocity 等。开发者可以根据项目需求选择合适的视图技术，增强了应用的可扩展性和灵活性。

### 8. 良好的集成能力
Structs2 能够与其他流行的 Java 框架和技术（如 Spring、Hibernate）无缝集成。这使得开发者可以充分利用这些框架的优点，构建功能强大的应用程序。

### 9. 多模块支持
Structs2 支持多模块应用的开发，通过不同的 package 配置可以将应用程序的不同模块进行分离和组织，提高了代码的可维护性和可重用性。

### 10. 国际化支持
Structs2 提供了强大的国际化支持，可以非常方便地实现应用的多语言支持，通过配置不同的资源文件，可以根据用户的语言环境动态切换语言。

### 11. 详尽的文档和社区支持
Structs2 拥有详尽的文档和强大的社区支持。开发者可以很容易地找到所需的资源和帮助，解决在开发过程中遇到的问题。

这些设计上的优秀之处使得 Structs2 成为一个灵活、强大且易于使用的 Web 应用框架，适用于各种规模的 Java Web 应用开发。

## 为什么 structs2 现在不再使用了？

Structs2（Struts 2）曾经是一个非常流行的 Java Web 应用框架，但随着时间的推移，它的使用逐渐减少，主要原因包括以下几点：

### 1. 新兴框架的崛起

随着技术的不断发展，出现了许多新的 Web 框架，如 Spring MVC、Spring Boot、Play Framework 等，这些新框架在设计、功能和易用性上都有显著的改进。

例如：

- **Spring MVC** 和 **Spring Boot** 提供了更强大的依赖注入、自动配置和集成能力，使得开发变得更加简单和高效。
- **Play Framework** 支持非阻塞式 I/O 和高度并发，适用于构建现代 Web 应用。

### 2. 过时的设计理念
尽管 Structs2 在设计上有许多优秀之处，但它的某些设计理念已经过时。例如，Structs2 主要依赖于 XML 配置文件，这在当今注重简洁和易用性的开发环境中显得繁琐和不便。现代框架更倾向于使用基于注解的配置，减少了配置的复杂性。

### 3. 社区支持和活跃度下降
随着新框架的崛起，Structs2 的社区支持和活跃度逐渐下降。开发者更倾向于选择那些有活跃社区和持续更新的框架，以获得更好的支持和最新的功能。

### 4. 安全问题
Structs2 曾经爆出过一些安全漏洞，如知名的 **CVE-2017-5638** 漏洞，这对其声誉造成了负面影响。尽管漏洞已经被修复，但一些企业开始转向其他更安全、更新的框架。

### 5. 开发效率和现代化工具的缺乏
现代开发工具和生态系统更倾向于支持像 Spring Boot 这样的框架，这些工具能够显著提高开发效率。例如，Spring Boot 的自动配置和嵌入式服务器使得开发和部署变得更加简单和快速，而 Structs2 在这方面显得相对较弱。

### 6. 微服务架构的兴起
随着微服务架构的普及，开发者更多地转向 Spring Cloud 等微服务框架，这些框架提供了更好的支持和工具链，用于构建和管理分布式系统。Structs2 的设计更多地面向传统的单体应用架构，无法很好地适应微服务架构的需求。

### 总结

虽然 Structs2 曾经是一个强大且灵活的 Web 应用框架，但随着技术的发展和新框架的崛起，它的使用逐渐减少。

新兴框架在设计、功能、易用性、安全性和社区支持方面都有显著的优势，吸引了越来越多的开发者转向这些新的选择。

* any list
{:toc}