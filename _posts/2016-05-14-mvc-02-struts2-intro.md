---
layout: post
title: java web mvc-02-struts2
date:  2016-5-14 11:58:26 +0800
categories: [WEB]
tags: [web, mvc]
published: false
---

# 拓展阅读

[Spring Web MVC-00-重学 mvc](https://houbb.github.io/2019/12/25/springmvc-00-index)

[mvc-01-Model-View-Controller 概览](https://houbb.github.io/2016/05/14/mvc-01-overview)

[web mvc-03-JFinal](https://houbb.github.io/2016/05/14/mvc-03-jfinal-intro)

[web mvc-04-Apache Wicket](https://houbb.github.io/2016/05/14/mvc-04-apache-whicket-intro)

[web mvc-05-JSF JavaServer Faces](https://houbb.github.io/2016/05/14/mvc-05-jsf-intro)

[web mvc-06-play framework intro](https://houbb.github.io/2016/05/14/mvc-06-play-framework-intro)

[web mvc-07-Vaadin](https://houbb.github.io/2016/05/14/mvc-07-Vaadin)

[web mvc-08-Grails](https://houbb.github.io/2016/05/14/mvc-08-Grails)

# 拓展阅读

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)


## Struts2

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

* any list
{:toc}