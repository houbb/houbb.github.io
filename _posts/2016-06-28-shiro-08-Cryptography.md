---
layout: post
title: Shiro-09-web
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 配置

将Shiro集成到任何web应用程序的最简单方法是在web.xml中配置一个Servlet ContextListener和过滤器，该Servlet了解如何读取Shiro的INI配置。

INI配置格式本身的大部分是在配置页面的INI部分中定义的，但是我们将在这里介绍一些额外的特定于web的部分。

- 使用 Spring？

Spring Framework用户不会执行这个设置。如果您使用Spring，那么您将希望阅读有关Spring特定的web配置的内容。

## web.xml

Shiro 1.2及以后版本

在Shiro 1.2及以后版本中，标准的web应用程序通过向 web.xml 中添加以下XML块来初始化Shiro:

```xml
<listener>
    <listener-class>org.apache.shiro.web.env.EnvironmentLoaderListener</listener-class>
</listener>

<filter>
    <filter-name>ShiroFilter</filter-name>
    <filter-class>org.apache.shiro.web.servlet.ShiroFilter</filter-class>
</filter>

<filter-mapping>
    <filter-name>ShiroFilter</filter-name>
    <url-pattern>/*</url-pattern>
    <dispatcher>REQUEST</dispatcher>
    <dispatcher>FORWARD</dispatcher>
    <dispatcher>INCLUDE</dispatcher>
    <dispatcher>ERROR</dispatcher>
</filter-mapping>
```

这假设Shiro INI配置文件位于以下两个位置之一，使用先找到的位置:

1. `/WEB-INF/shiro.ini`

2. `shiro.ini` 文件位于类路径的根。

## 配置流程

下面是上面的配置做的事情:

EnvironmentLoaderListener初始化一个Shiro WebEnvironment实例(包含Shiro需要操作的所有内容，包括SecurityManager)，并使其在ServletContext中可访问。如果您需要在任何时候获得这个WebEnvironment实例，您可以调用 WebUtils.getRequiredWebEnvironment(servletContext)。

ShiroFilter将使用这个web环境为任何过滤的请求执行所有必要的安全操作。

最后，过滤器映射定义确保所有请求都通过ShiroFilter进行过滤，大多数web应用程序都推荐使用ShiroFilter，以确保任何请求都是安全的。

### 默认配置

- ShiroFilter filter-mapping

通常我们希望在任何其他“filter-mapping”声明之前定义“ShiroFilter filter-mapping”，以确保Shiro也能在这些过滤器中发挥作用。

- ShiroFilter默认编码

shiro过滤器是一个标准的servlet过滤器，根据servlet规范，默认编码为ISO-8859-1。

但是，客户机可以选择使用Content-Type头的charset属性发送具有不同编码的身份验证数据。

## 自定义WebEnvironment类

默认情况下，EnvironmentLoaderListener将创建一个IniWebEnvironment实例，该实例假定Shiro基于ini的配置。

如果你愿意，你可以通过在web.xml中指定ServletContext context-param来指定一个自定义的WebEnvironment实例:

```xml
<context-param>
    <param-name>shiroEnvironmentClass</param-name>
    <param-value>com.foo.bar.shiro.MyWebEnvironment</param-value>
</context-param>
```

这允许您自定义如何解析配置格式并将其表示为WebEnvironment实例。

你可以子类化现有的IniWebEnvironment来定制行为，或者完全支持不同的配置格式。

例如，如果有人想要在XML而不是INI中配置Shiro，他们可以创建一个基于XML的实现，例如com.foo.bar.shiro.XmlWebEnvironment。

## 自定义配置位置

IniWebEnvironment类需要读取和加载INI配置文件。

默认情况下，这个类将自动查找以下两个Shiro .ini配置的位置(顺序):

- /WEB-INF/shiro.ini

- classpath:shiro.ini

它将使用先找到的那个。

然而，如果你想把你的配置放在另一个位置，你可以在web.xml中用另一个上下文参数指定那个位置:

```xml
<context-param>
    <param-name>shiroConfigLocations</param-name>
    <param-value>YOUR_RESOURCE_LOCATION_HERE</param-value>
</context-param>
```

默认情况下，param-value应该可以通过ServletContext定义的规则解析。

getResource方法。例如, /WEB-INF/some/path/shiro.ini

但你也可以通过使用Shiro的ResourceUtils类支持的适当的资源前缀来指定特定的文件系统、类路径或URL位置，例如:

```
file:/home/foobar/myapp/shiro.ini
classpath:com/foo/bar/shiro.ini
url:http://confighost.mycompany.com/myapp/shiro.ini
```

# Web INI配置

除了在主配置章节中已经描述的标准[main]， [users]和[roles]部分之外，你还可以在shiro.ini文件中指定一个特定于web的[url]部分:

```ini
# [main], [users] and [roles] above here
...
[urls]
...
```

[urls] 部分允许您做一些在我们所见过的任何web框架中都不存在的事情:

为应用程序中的任何匹配URL路径定义临时过滤链的能力!

这比您通常在web中定义过滤器链的方式要灵活、强大和简洁得多。

xml:即使您从未使用过Shiro提供的任何其他特性，并且只使用了这个特性，它本身也值得使用。

## [urls]

url部分的每行格式如下:

```
_URL_Ant_Path_Expression_ = _Path_Specific_Filter_Chain_
```

例如：

```ini
...
[urls]

/index.html = anon
/user/create = anon
/user/** = authc
/admin/** = authc, roles[administrator]
/rest/** = authc, rest
/remoting/rpc/** = authc, perms["remote:invoke"]
```

接下来我们将详细介绍这些线条的含义。

等号(=)左侧的标记是相对于web应用程序上下文根的ant风格路径表达式。

例如，假设你有以下[urls]行:

```
/account/** = ssl, authc
```

这一行说明“任何请求到我的应用程序的路径/account或它的子路径(/account/foo， /account/bar/baz等)将触发‘ssl, authc’过滤器链”。

我们将在下面讨论过滤链。

注意，所有的路径表达式都是相对于应用程序的上下文根的。

这意味着，如果某天您将应用程序部署到www.somehost.com/myapp，然后将其部署到www.anotherhost.com(没有' myapp '子路径)，模式匹配仍然可以工作。

所有路径都是相对于HttpServletRequest.getContextPath()值的。

### 顺序很重要!

URL路径表达式将根据传入请求的定义顺序进行计算，并且第一个匹配将获胜。

例如，我们假设有以下链定义:

```ini
/account/** = ssl, authc
/account/signup = anon
```

如果一个传入的请求是要到达/account/signup/index.html(所有'匿名'用户都可以访问)，它将永远不会被处理!原因是/account/**模式首先匹配传入的请求，并“短路”了所有剩余的定义。

始终记住，**根据第一次匹配获胜的策略来定义您的过滤器链!**

## 过滤器链定义

等号(=)右边的标记是要为匹配该路径的请求执行的以逗号分隔的过滤器列表。

它必须符合以下格式:

```ini
filter1[optional_config1], filter2[optional_config2], ..., filterN[optional_configN]
```

- filterN是在[main]部分中定义的筛选器bean的名称

- [optional_config]是一个可选的括号字符串，对于特定路径的特定过滤器(每个过滤器，特定路径配置!)具有意义。如果过滤器不需要对URL路径进行特定的配置，您可以丢弃括号，这样filterN[]就会变成filterN。

因为过滤器标记定义了链(又名列表)，所以要记住顺序很重要!按照希望请求流经链的顺序定义以逗号分隔的列表。

最后，如果必要的条件不满足，每个过滤器都可以自由地处理响应(例如，执行重定向，响应一个HTTP错误代码，直接呈现，等等)。否则，它将允许请求通过链继续到最终的目标视图。

- 提示

能够对特定路径的配置做出反应，例如过滤器令牌的[optional_config]部分，是Shiro过滤器的一个独特特性。

如果您想创建自己的javax.servlet。Filter实现也可以做到这一点，确保你的Filter子类org.apache.shiro.web.filter.PathMatchingFilter

## 可用的过滤器

过滤器链定义中可用的过滤器“池”在[main]部分中定义。在main部分中分配给它们的名称是在过滤器链定义中使用的名称。

例如:

```
[main]
...
myFilter = com.company.web.some.FilterImplementation
myFilter.property1 = value1
...

[urls]
...
/some/path/** = myFilter
```

# 默认的过滤器

当运行一个web应用程序时，Shiro会创建一些有用的默认过滤器实例，并在[main]部分自动提供它们。

您可以像配置任何其他bean一样在main中配置它们，并在您的链定义中引用它们。

例如:

```
[main]
...
# Notice how we didn't define the class for the FormAuthenticationFilter ('authc') - it is instantiated and available already:
authc.loginUrl = /login.jsp
...

[urls]
...
# make sure the end-user is authenticated.  If not, redirect to the 'authc.loginUrl' above,
# and after successful authentication, redirect them back to the original account page they
# were trying to view:
/account/** = authc
...
```

自动可用的默认过滤器实例由DefaultFilter枚举定义，枚举的name字段是可用于配置的名称。

它们是:

| Filter Name 	    | Class |
|:----|:----|
| anon 	            | org.apache.shiro.web.filter.authc.AnonymousFilter |
| authc 	            | org.apache.shiro.web.filter.authc.FormAuthenticationFilter |
| authcBasic 	        | org.apache.shiro.web.filter.authc.BasicHttpAuthenticationFilter |
| authcBearer 	    | org.apache.shiro.web.filter.authc.BearerHttpAuthenticationFilter |
| invalidRequest 	    | org.apache.shiro.web.filter.InvalidRequestFilter |
| logout 	            | org.apache.shiro.web.filter.authc.LogoutFilter |
| noSessionCreation 	| org.apache.shiro.web.filter.session.NoSessionCreationFilter |
| perms 	            | org.apache.shiro.web.filter.authz.PermissionsAuthorizationFilter |
| port 	            | org.apache.shiro.web.filter.authz.PortFilter |
| rest 	            | org.apache.shiro.web.filter.authz.HttpMethodPermissionFilter |
| roles 	            | org.apache.shiro.web.filter.authz.RolesAuthorizationFilter |
| ssl 	            | org.apache.shiro.web.filter.authz.SslFilter |
| user 	            | org.apache.shiro.web.filter.authc.UserFilter |

# 启用和禁用过滤器

任何过滤器链定义机制(web。你可以通过在过滤器链定义中包含它来启用过滤器，也可以通过从链定义中移除它来禁用它。

但是Shiro 1.2中增加了一个新特性，可以在不将过滤器从过滤器链中移除的情况下启用或禁用过滤器。

如果启用(默认设置)，则将按预期过滤请求。如果禁用，则过滤器将允许请求立即传递到过滤器链中的下一个元素。您可以根据配置属性触发过滤器的启用状态，或者甚至可以根据每个请求触发它。

这是一个强大的概念，因为根据特定的需求启用或禁用过滤器通常比更改静态过滤器链定义更方便，后者是永久性的和不灵活的。

Shiro通过它的OncePerRequestFilter抽象父类来实现这一点。Shiro的所有开箱即用的过滤器实现都继承了这个类，因此可以在不从过滤器链中移除它们的情况下启用或禁用它们。如果你需要这个功能，你可以为你自己的过滤器实现子类化这个类*。

## 一般的启用/禁用

OncePerRequestFilter(及其所有子类)支持跨所有请求以及针对每个请求启用/禁用。

通过将其enabled属性设置为true或false，可以对所有请求启用或禁用过滤器。

默认设置为true，因为大多数过滤器在链中配置时都需要执行。

例如，在shiro.ini中:

```ini
[main]
...
# configure Shiro's default 'ssl' filter to be disabled while testing:
ssl.enabled = false

[urls]
...
/some/path = ssl, authc
/another/path = ssl, roles[admin]
...
```

这个示例表明，可能有许多URL路径都要求一个请求必须由SSL连接保护。

在开发过程中设置SSL是令人沮丧和耗时的。

在开发过程中，可以禁用ssl过滤器。

当部署到生产环境时，您可以使用一个配置属性来启用它——这比手动更改所有URL路径或维护两个Shiro配置要容易得多。

## 特定于启用/禁用

OncePerRequestFilter实际上根据它的isEnabled(请求，响应)方法确定是否启用或禁用过滤器。

该方法默认返回enabled属性的值，通常用于启用/禁用上面提到的所有请求。

如果您想根据请求特定的条件启用或禁用过滤器，您可以覆盖OncePerRequestFilter isEnabled(请求，响应)方法来执行更特定的检查。

## 于路径启用/禁用

Shiro的PathMatchingFilter (OncePerRequestFilter的子类，能够根据被过滤的特定路径对配置做出反应。这意味着除了传入的请求和响应之外，您还可以根据路径和特定于路径的配置启用或禁用过滤器。

如果你需要能够应对匹配路径和于路径配置,以确定如果启用或禁用一个过滤器,而不是覆盖OncePerRequestFilter isEnabled(请求、响应)方法,你会覆盖PathMatchingFilter isEnabled(请求、响应路径,pathConfig)方法。

# 全局过滤器

从Shiro 1.6开始，就添加了定义全局过滤器的能力。

添加“全局过滤器”将向所有路由添加额外的过滤器，这包括先前配置的过滤器链以及未配置的路径。

缺省情况下，全局过滤器包含invalidRequest过滤器。此过滤器阻止已知的恶意攻击，有关配置细节，请参阅下面。

例如，可以自定义或禁用全局筛选器

```ini
[main]
...
# disable Global Filters
filterChainResolver.globalFilters = null
```

定义全局过滤器：

```
[main]
...
filterChainResolver.globalFilters = invalidRequest, port
```

invalidRequest过滤器会阻止带有非ascii字符、分号和反斜杠的请求，为了向后兼容，可以单独禁用这些字符。

```ini
[main]
...
invalidRequest.blockBackslash = true
invalidRequest.blockSemicolon = true
invalidRequest.blockNonAscii = true
...
```

- 注意

如果您目前允许URL重写以允许URL中的jsessionid，则必须将block分号设置为false。

jsessionid的URL重写在Java Servlet规范的“7.1.3”节中定义，但通常不推荐这样做。

## HTTP严格传输安全

SslFilter(及其所有子类)支持启用/禁用HTTP严格传输安全(HSTS)。

例如，在shiro.ini中:

```ini
[main]
...
# configure Shiro's default 'ssl' filter to enabled HSTS:
ssl.enabled = true
ssl.hsts.enabled = true
ssl.hsts.includeSubDomains = true

[urls]
...
/some/path = ssl, authc
/another/path = ssl, roles[admin]
...
```


# 会话管理

## Servlet容器会话

在web环境中，Shiro的缺省会话管理器SessionManager实现是ServletContainerSessionManager。

这个非常简单的实现将所有会话管理职责(包括servlet容器支持的会话集群)委托给运行时servlet容器。

它本质上是Shiro的会话API到servlet容器的桥接器，除此之外几乎没有其他功能。

使用这个默认值的一个好处是，使用现有servlet容器会话配置(超时、任何特定于容器的集群机制等)的应用程序将按预期工作。

这种默认设置的缺点是您被绑定到servlet容器的特定会话行为。

例如，如果您想对会话进行集群，但是您使用Jetty进行测试，并在生产中使用Tomcat，那么您的特定于容器的配置(或代码)就不能移植。

## Servlet容器会话超时

如果使用默认的servlet容器支持，则在web应用程序的web.xml文件中按照预期配置会话超时。

例如:

```xml
<session-config>
  <!-- web.xml expects the session timeout in minutes: -->
  <session-timeout>30</session-timeout>
</session-config>
```

## 本地会话

如果你想让你的会话配置设置和集群可以跨servlet容器移植(比如测试中的Jetty，但生产中的Tomcat或JBoss)，或者你想控制特定的会话/集群特性，你可以启用Shiro的本地会话管理。

“本机”这个词在这里意味着Shiro自己的企业会话管理实现将被用来支持所有Subject和HttpServletRequest会话，并完全绕过servlet容器。

但请放心——Shiro直接实现了Servlet规范的相关部分，因此任何现有的web/http相关代码都可以按照预期工作，而且永远不需要“知道”Shiro正在透明地管理会话。

### DefaultWebSessionManager

要为您的web应用程序启用本机会话管理，您需要配置一个支持本机web的会话管理器，以覆盖缺省的基于servlet容器的会话管理器。您可以通过在Shiro的SecurityManager上配置DefaultWebSessionManager实例来实现这一点。

例如，在shiro.ini中:

- 本地web会话管理

```ini
[main]
...
sessionManager = org.apache.shiro.web.session.mgt.DefaultWebSessionManager
# configure properties (like session timeout) here if desired

# Use the configured native session manager:
securityManager.sessionManager = $sessionManager
```

声明之后，您可以使用本地会话选项(如会话超时和集群配置)配置DefaultWebSessionManager实例，如会话管理一节中所述。

### 本地会话超时

配置DefaultWebSessionManager实例后，“会话超时时间”的配置请参见“会话管理:会话超时时间”

### 会话 Cookie

DefaultWebSessionManager支持两个web特定的配置属性:

sessionIdCookieEnabled(布尔)

sessionIdCookie，一个Cookie实例。

- Cookie作为模板

sessionIdCookie属性本质上是一个模板——您可以配置Cookie实例属性，这个模板将用于在运行时使用适当的会话ID值设置实际的HTTP ' Cookie '头。

### 会话Cookie配置

DefaultWebSessionManager的sessionIdCookie默认实例是一个SimpleCookie。

这个简单的实现允许对需要在http Cookie上配置的所有相关属性进行javabeans风格的属性配置。

例如，可以设置Cookie域:

```ini
[main]
...
securityManager.sessionManager.sessionIdCookie.domain = foo.com
```

有关其他属性，请参阅SimpleCookie JavaDoc。

根据servlet规范，cookie的默认名称是JSESSIONID。

此外，Shiro的cookie支持HttpOnly和SameSite标志。sessionIdCookie默认将HttpOnly设置为true，将SameSite设置为LAX，以增加安全性。

- 请注意

Shiro的Cookie概念甚至在Servlet 2.4和2.5环境中也支持HttpOnly标志(而Servlet API仅在2.6或更高版本中支持它)。

### 禁用会话Cookie

如果不希望使用会话cookie，可以通过将sessionIdCookieEnabled属性配置为false来禁用它们。例如:

禁用本机会话cookie

```ini
[main]
...
securityManager.sessionManager.sessionIdCookieEnabled = false
```

# 记得我的服务

如果AuthenticationToken实现了org.apache.shiro.authc, Shiro将执行' rememberMe '服务。RememberMeAuthenticationToken接口。该接口指定了一个方法:

```
boolean isRememberMe();
```

如果该方法返回true, Shiro将跨会话记住最终用户的身份。

- UsernamePasswordToken和RememberMe

常用的UsernamePasswordToken已经实现了RememberMeAuthenticationToken接口，并支持rememberMe登录。

## 编程支持

要以编程方式使用rememberMe，可以在支持此配置的类上将该值设置为true。例如，使用标准的UsernamePasswordToken:

```java
UsernamePasswordToken token = new UsernamePasswordToken(username, password);

token.setRememberMe(true);

SecurityUtils.getSubject().login(token);
...
```

## 基于表单的登录

对于web应用程序，authc过滤器默认为FormAuthenticationFilter。这支持将‘rememberMe’布尔值作为表单/请求参数来读取。

默认情况下，它期望请求参数被命名为rememberMe。

下面是一个shiro.ini配置支持的例子:

```ini
[main]
authc.loginUrl = /login.jsp

[urls]

# your login form page here:
login.jsp = authc
```

在你的网页表单中，有一个名为“记住我”的复选框:

```html
<form ...>

   Username: <input type="text" name="username"/> <br/>
   Password: <input type="password" name="password"/>
    ...
   <input type="checkbox" name="rememberMe" value="true"/>Remember Me?
   ...
</form>
```

默认情况下，FormAuthenticationFilter将查找名为username、password和rememberMe的请求参数。

如果这些名称不同于您在表单中使用的表单字段名，那么您需要在formuthenticationfilter上配置这些名称。

例如，在shiro.ini中:

```ini
[main]
...
authc.loginUrl = /whatever.jsp
authc.usernameParam = somethingOtherThanUsername
authc.passwordParam = somethingOtherThanPassword
authc.rememberMeParam = somethingOtherThanRememberMe
...
```

# Cookie 的配置

您可以通过设置默认的{{RememberMeManager}}的各种cookie属性来配置rememberMe的功能。

例如，在shiro.ini中:

```ini
[main]
...

securityManager.rememberMeManager.cookie.name = foo
securityManager.rememberMeManager.cookie.maxAge = blah
...
```

关于配置属性，请参阅CookieRememberMeManager和支持的SimpleCookie JavaDoc。

## 自定义RememberMeManager

应该注意的是，如果默认的基于cookie的remembermememanager实现不满足你的需求，你可以插入任何你喜欢的插入到securityManager，就像你可以配置任何其他对象引用:

```
[main]
...
rememberMeManager = com.my.impl.RememberMeManager
securityManager.rememberMeManager = $rememberMeManager
```



# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}