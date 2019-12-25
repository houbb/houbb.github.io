---
layout: post
title: Spring Web MVC-02-DispatcherServlet 分派器
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: true
---

# Spring Web MVC

Spring Web MVC是基于Servlet API构建的原始Web框架，从一开始就已包含在Spring框架中。 

正式名称“ Spring Web MVC”来自其源模块的名称（spring-webmvc），但它通常被称为“ Spring MVC”。

与Spring Web MVC并行，Spring Framework 5.0引入了一个反应式堆栈Web框架，其名称“ Spring WebFlux”也基于其源模块（spring-webflux）。

有关基线信息以及与Servlet容器和Java EE版本范围的兼容性，请参见Spring Framework Wiki。

# DispatcherServlet

与其他许多Web框架一样，Spring MVC围绕前端控制器模式进行设计，在该模式下，中央Servlet DispatcherServlet提供了用于请求处理的共享算法，而实际工作是由可配置的委托组件执行的。 

该模型非常灵活，并支持多种工作流程。

与任何Servlet一样，都需要根据Servlet规范使用Java配置或在web.xml中声明和映射DispatcherServlet。 

反过来，DispatcherServlet使用Spring配置发现请求映射，视图解析，异常处理等所需的委托组件。

## 代码自动检测

以下Java配置示例注册并初始化DispatcherServlet，该容器由Servlet容器自动检测到（请参阅Servlet Config）：

```java
public class MyWebApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletCxt) {

        // Load Spring web application configuration
        AnnotationConfigWebApplicationContext ac = new AnnotationConfigWebApplicationContext();
        ac.register(AppConfig.class);
        ac.refresh();

        // Create and register the DispatcherServlet
        DispatcherServlet servlet = new DispatcherServlet(ac);
        ServletRegistration.Dynamic registration = servletCxt.addServlet("app", servlet);
        registration.setLoadOnStartup(1);
        registration.addMapping("/app/*");
    }
}
```

## web.xml 配置形式

以下web.xml配置示例注册并初始化DispatcherServlet：

```xml
<web-app>

    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/app-context.xml</param-value>
    </context-param>

    <servlet>
        <servlet-name>app</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value></param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>app</servlet-name>
        <url-pattern>/app/*</url-pattern>
    </servlet-mapping>

</web-app>
```

### spring boot 的初始化顺序

Spring Boot遵循不同的初始化顺序。 

Spring Boot并没有陷入Servlet容器的生命周期，而是使用Spring配置来引导自身和嵌入式Servlet容器。 

在Spring配置中检测到过滤器和Servlet声明，并在Servlet容器中注册。 

# 上下文层次(Context Hierarchy)

DispatcherServlet期望WebApplicationContext（纯ApplicationContext的扩展）为其自身的配置。 

WebApplicationContext具有指向ServletContext和与其关联的Servlet的链接。它还绑定到ServletContext，以便应用程序可以在RequestContextUtils上使用静态方法来查找WebApplicationContext（如果需要访问它们）。

对于许多应用程序而言，拥有一个WebApplicationContext很简单并且足够。也可能具有上下文层次结构，其中一个根WebApplicationContext在多个DispatcherServlet（或其他Servlet）实例之间共享，每个实例都有其自己的子WebApplicationContext配置。有关上下文层次结构功能的更多信息，请参见ApplicationContext的其他功能。

根WebApplicationContext通常包含需要在多个Servlet实例之间共享的基础结构Bean，例如数据存储库和业务服务。这些Bean是有效继承的，并且可以在Servlet特定的子WebApplicationContext中重写（即重新声明），该子WebApplicationContext通常包含给定Servlet本地的Bean。

下图显示了这种关系：

![关系](https://docs.spring.io/spring/docs/current/spring-framework-reference/images/mvc-context-hierarchy.png)

## 代码示例

下面的示例配置一个WebApplicationContext层次结构：

```java
public class MyWebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class<?>[] { RootConfig.class };
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class<?>[] { App1Config.class };
    }

    @Override
    protected String[] getServletMappings() {
        return new String[] { "/app1/*" };
    }
}
```

如果不需要应用程序上下文层次结构，则应用程序可以通过 getRootConfigClasses() 返回所有配置，并从 getServletConfigClasses() 返回null。

## web.xml 等效配置

```xml
<web-app>

    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/root-context.xml</param-value>
    </context-param>

    <servlet>
        <servlet-name>app1</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>/WEB-INF/app1-context.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>app1</servlet-name>
        <url-pattern>/app1/*</url-pattern>
    </servlet-mapping>

</web-app>
```

如果不需要应用程序上下文层次结构，则应用程序可以仅配置“root”上下文，并将contextConfigLocation Servlet参数保留为空。

# 特殊 Bean 类型

DispatcherServlet委托给特殊的Bean处理请求并呈现适当的响应。

所谓“特殊bean”，是指实现框架协定的Spring管理对象实例。 

这些通常带有内置合同，但是您可以自定义它们的属性并扩展或替换它们。

下表列出了DispatcherServlet检测到的特殊bean：

## HandlerMapping

将请求与拦截器列表一起映射到处理程序，以进行预处理和后期处理。 

映射基于某些条件，其细节因HandlerMapping实现而异。

HandlerMapping的两个主要实现是RequestMappingHandlerMapping（支持 `@RequestMapping` 带注释的方法）和SimpleUrlHandlerMapping（维护对处理程序的URI路径模式的显式注册）。

## HandlerAdapter

帮助DispatcherServlet调用映射到请求的处理程序，而不管实际如何调用该处理程序。 

例如，调用带注释的控制器需要解析注释。 

HandlerAdapter的主要目的是使DispatcherServlet免受此类细节的影响。

## HandlerExceptionResolver

解决异常的策略，可能将它们映射到处理程序，HTML错误视图或其他目标。 

## ViewResolver

解析从处理程序返回的实际基于字符串的基于逻辑的视图名称，以实际的视图呈现给响应。 

## LocaleResolver, LocaleContextResolver

解决客户正在使用的语言环境及其可能的时区，以便能够提供国际化的视图

## ThemeResolver

解决Web应用程序可以使用的主题，例如，以提供个性化的布局。

## MultipartResolver

借助一些多部分解析库来解析多部分请求的抽象（例如，浏览器表单文件上传）。

## FlashMapManager

存储和检索“输入”和“输出” FlashMap，可用于将属性从一个请求传递到另一个请求，通常跨重定向。

# Web MVC配置

应用程序可以声明处理请求所需的特殊Bean类型中列出的基础结构Bean。 

DispatcherServlet检查每个特殊bean的WebApplicationContext。 

如果没有匹配的bean类型，它将使用DispatcherServlet.properties中列出的默认类型。

在大多数情况下，MVC Config是最佳起点。 

它使用Java或XML声明所需的bean，并提供了更高级别的配置回调API来对其进行自定义。

# Servlet配置

在Servlet 3.0+环境中，您可以选择以编程方式配置Servlet容器，作为替代方案或与web.xml文件结合使用。 

下面的示例注册一个DispatcherServlet：

```java
import org.springframework.web.WebApplicationInitializer;

public class MyWebApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) {
        XmlWebApplicationContext appContext = new XmlWebApplicationContext();
        appContext.setConfigLocation("/WEB-INF/spring/dispatcher-config.xml");

        ServletRegistration.Dynamic registration = container.addServlet("dispatcher", new DispatcherServlet(appContext));
        registration.setLoadOnStartup(1);
        registration.addMapping("/");
    }
}
```

WebApplicationInitializer是Spring MVC提供的接口，可确保检测到您的实现并将其自动用于初始化任何Servlet 3容器。 

## 抽象实现

WebApplicationInitializer的抽象基类实现名为AbstractDispatcherServletInitializer，它通过重写指定Servlet映射和DispatcherServlet配置位置的方法，使注册DispatcherServlet更容易。

对于使用基于Java的Spring配置的应用程序，建议这样做，如以下示例所示：

```java
public class MyWebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

    @Override
    protected Class<?>[] getRootConfigClasses() {
        return null;
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class<?>[] { MyWebConfig.class };
    }

    @Override
    protected String[] getServletMappings() {
        return new String[] { "/" };
    }
}
```

如果使用基于XML的Spring配置，则应直接从AbstractDispatcherServletInitializer进行扩展，如以下示例所示：

```java
public class MyWebAppInitializer extends AbstractDispatcherServletInitializer {

    @Override
    protected WebApplicationContext createRootApplicationContext() {
        return null;
    }

    @Override
    protected WebApplicationContext createServletApplicationContext() {
        XmlWebApplicationContext cxt = new XmlWebApplicationContext();
        cxt.setConfigLocation("/WEB-INF/spring/dispatcher-config.xml");
        return cxt;
    }

    @Override
    protected String[] getServletMappings() {
        return new String[] { "/" };
    }
}
```

AbstractDispatcherServletInitializer还提供了一种方便的方法来添加Filter实例，并将其自动映射到DispatcherServlet，如以下示例所示：

```java
public class MyWebAppInitializer extends AbstractDispatcherServletInitializer {

    // ...

    @Override
    protected Filter[] getServletFilters() {
        return new Filter[] {
            new HiddenHttpMethodFilter(), new CharacterEncodingFilter() };
    }
}
```

每个过滤器都会根据其具体类型添加一个默认名称，并自动映射到DispatcherServlet。

AbstractDispatcherServletInitializer的isAsyncSupported受保护方法提供了一个位置，以在DispatcherServlet及其映射的所有过滤器上启用异步支持。 

默认情况下，此标志设置为true。

最后，如果您需要进一步自定义DispatcherServlet本身，则可以覆盖createDispatcherServlet方法。

# 处理中

## 处理请求的流程

DispatcherServlet处理请求的方式如下：

搜索WebApplicationContext并将其绑定在请求中，作为控制器和流程中其他元素可以使用的属性。默认情况下，它绑定在DispatcherServlet.WEB_APPLICATION_CONTEXT_ATTRIBUTE键下。

语言环境解析器绑定到请求，以使流程中的元素解析在处理请求（呈现视图，准备数据等）时要使用的语言环境。如果不需要语言环境解析，则不需要语言环境解析器。

主题解析器绑定到请求，以使诸如视图之类的元素确定要使用的主题。如果不使用主题，则可以将其忽略。

如果指定多部分文件解析器，则将检查请求中是否有多部分。如果找到多部分，则将该请求包装在MultipartHttpServletRequest中，以供流程中的其他元素进一步处理。有关多部分处理的更多信息，请参见Multipart Resolver。

搜索适当的处理程序。如果找到处理程序，则执行与处理程序（预处理器，后处理器和控制器）关联的执行链，以准备模型或渲染。或者，对于带注释的控制器，可以呈现响应（在HandlerAdapter中），而不是返回视图。

如果返回模型，则呈现视图。如果没有返回任何模型（可能是由于预处理器或后处理器拦截了该请求，可能出于安全原因），则不会呈现任何视图，因为该请求可能已经被满足。

## 其他支持

WebApplicationContext中声明的HandlerExceptionResolver Bean用于解决在请求处理期间引发的异常。 

这些异常解析器允许定制逻辑以解决异常。

Spring DispatcherServlet还支持Servlet API所指定的last-modification-date的返回。 

确定特定请求的最后修改日期的过程很简单：DispatcherServlet查找适当的处理程序映射，并测试找到的处理程序是否实现了LastModified接口。 

如果是这样，则将LastModified接口的 `long getLastModified(request)` 方法的值返回给客户端。

您可以通过将Servlet初始化参数（init-param元素）添加到web.xml文件中的Servlet声明中，来定制各个DispatcherServlet实例。 


### DispatcherServlet initialization parameters

下表列出了受支持的参数：

- contextClass

实现ConfigurableWebApplicationContext的类，将由此Servlet实例化并在本地配置。 

默认情况下，使用XmlWebApplicationContext。

- contextConfigLocation

传递给上下文实例的字符串（由contextClass指定），以指示可以在哪里找到上下文。 

该字符串可能包含多个字符串（使用逗号作为分隔符）以支持多个上下文。 

对于具有两次定义的bean的多个上下文位置，以最新位置为准。

- namespace

WebApplicationContext的命名空间。 

缺省为 `[servlet-name] -servlet`。

- throwExceptionIfNoHandlerFound

在找不到请求的处理程序时是否引发NoHandlerFoundException。 

然后可以使用HandlerExceptionResolver捕获该异常（例如，通过使用@ExceptionHandler控制器方法），然后将其作为其他任何异常进行处理。

默认情况下，它设置为false，在这种情况下，DispatcherServlet将响应状态设置为404（NOT_FOUND），而不会引发异常。

请注意，如果还配置了默认servlet处理，则始终将未解决的请求转发到默认servlet，并且永远不会引发404。


# 拦截

所有HandlerMapping实现都支持处理程序拦截器，当您要将特定功能应用于某些请求时（例如，检查主体），该拦截器很有用。

## 三种方法

拦截器必须使用三种方法从org.springframework.web.servlet包中实现HandlerInterceptor，这三种方法应提供足够的灵活性来执行各种预处理和后处理：

preHandle（..）：在执行实际处理程序之前

postHandle（..）：处理程序执行后

afterCompletion（..）：在完成请求之后

preHandle（..）方法返回一个布尔值。您可以使用此方法来中断或继续执行链的处理。当此方法返回true时，处理程序执行链将继续。当它返回false时，DispatcherServlet假定拦截器本身已经处理了请求（例如，渲染了一个适当的视图），并且不会继续执行其他拦截器和执行链中的实际处理程序。

有关如何配置拦截器的示例，请参见MVC配置部分中的拦截器。您还可以通过在各个HandlerMapping实现上使用setter直接注册它们。

请注意，对于@ResponseBody和ResponseEntity方法，postHandle的用处不大，在HandlerAdapter内以及postHandle之前，将其写入并提交响应。这意味着对响应进行任何更改为时已晚，例如添加额外的标头。

对于这种情况，您可以实现ResponseBodyAdvice并将其声明为Controller Advice Bean或直接在RequestMappingHandlerAdapter上对其进行配置。

# Exceptions 例外情况

如果异常在请求映射期间发生或从请求处理程序（例如 `@Controller`）抛出，则DispatcherServlet委托给HandlerExceptionResolver Bean链来解决该异常并提供替代处理，通常是错误响应。

## HandlerExceptionResolver implementations

下表列出了可用的HandlerExceptionResolver实现：

- SimpleMappingExceptionResolver

异常类名称和错误视图名称之间的映射。 

对于在浏览器应用程序中呈现错误页面很有用。

- DefaultHandlerExceptionResolver

解决了Spring MVC引发的异常，并将它们映射到HTTP状态代码。 

另请参见备用ResponseEntityExceptionHandler和REST API异常。

- ResponseStatusExceptionResolver

使用 `@ResponseStatus` 批注解决异常，并根据批注中的值将其映射到HTTP状态代码。

- ExceptionHandlerExceptionResolver

通过调用 `@Controller` 或 `@ControllerAdvice` 类中的 `@ExceptionHandler` 方法来解决异常。 

请参见@ExceptionHandler方法。


## 解析器链

您可以通过在Spring配置中声明多个HandlerExceptionResolver bean并根据需要设置其order属性来形成异常解析器链。 

order属性越高，异常解析器的定位就越晚。

HandlerExceptionResolver的约定指定它可以返回：

指向错误视图的ModelAndView。

如果在解析程序中处理了异常，则为空的ModelAndView。

如果该异常仍未解决，则为null，以供后续解析器尝试；如果该异常仍在末尾，则允许将其冒泡到Servlet容器。

MVC Config自动为默认的Spring MVC异常，`@ResponseStatus` 注释的异常以及对@ExceptionHandler方法的支持声明内置解析器。 您可以自定义该列表或替换它。

## 容器错误页面

如果任何HandlerExceptionResolver都无法解决异常，因此该异常可以传播，或者如果响应状态设置为错误状态（即4xx，5xx），则Servlet容器可以在HTML中呈现默认错误页面。 

要自定义容器的默认错误页面，可以在web.xml中声明错误页面映射。 

以下示例显示了如何执行此操作：

```xml
<error-page>
    <location>/error</location>
</error-page>
```

给定前面的示例，当异常冒出或响应具有错误状态时，Servlet容器在容器内向配置的URL进行ERROR调度（例如，/error）。 

然后由DispatcherServlet处理它，可能将其映射到@Controller，可以实现该错误以使用模型返回错误视图名称或呈现JSON响应，如以下示例所示：

```java
@RestController
public class ErrorController {

    @RequestMapping(path = "/error")
    public Map<String, Object> handle(HttpServletRequest request) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("status", request.getAttribute("javax.servlet.error.status_code"));
        map.put("reason", request.getAttribute("javax.servlet.error.message"));
        return map;
    }

}
```

# View 实现

Spring MVC定义了ViewResolver和View接口，这些接口使您可以在浏览器中呈现模型，而无需将您与特定的视图技术联系在一起。

 ViewResolver提供了视图名称和实际视图之间的映射。 
 
 在移交给特定的视图技术之前，视图解决了数据准备问题。

## 相关实现

下表提供了有关ViewResolver层次结构的更多详细信息：

- AbstractCachingViewResolver

AbstractCachingViewResolver的子类缓存它们解析的视图实例。 

缓存可以提高某些视图技术的性能。 

您可以通过将cache属性设置为false来关闭缓存。 

此外，如果必须在运行时刷新某个视图（例如，当修改FreeMarker模板时），则可以使用removeFromCache（String viewName，Locale loc）方法。

- XmlViewResolver

ViewResolver的实现，它接受用XML编写的配置文件，该配置文件的DTD与Spring的XML bean工厂相同。 

默认配置文件是/WEB-INF/views.xml。

- ResourceBundleViewResolver

ViewResolver的实现，该ViewResolver在ResourceBundle中使用bean的定义，该定义由包的基本名称指定。 

对于应该解析的每个视图，它将属性  `[viewname].(class)` 的值用作视图类，并将属性  `[viewname].url` 的值用作视图URL。 

- UrlBasedViewResolver

ViewResolver接口的简单实现会影响逻辑视图名称到URL的直接解析，而无需显式映射定义。 

如果您的逻辑名称以直接的方式与视图资源的名称匹配，而无需任意映射，则这是适当的。

- InternalResourceViewResolver

UrlBasedViewResolver的方便子类，它支持InternalResourceView（实际上是Servlet和JSP）以及诸如JstlView和TilesView之类的子类。 

您可以使用setViewClass（..）为该解析器生成的所有视图指定视图类。

- FreeMarkerViewResolver

UrlBasedViewResolver的便利子类，支持FreeMarkerView及其自定义子类。

- ContentNegotiatingViewResolver

ViewResolver接口的实现，该接口根据请求文件名或Accept标头解析视图。 

## 处理方式

您可以通过声明多个解析器bean，并在必要时通过设置order属性以指定顺序来链接视图解析器。 

请记住，order属性越高，视图解析器在链中的定位就越晚。

ViewResolver的协定指定它可以返回null，以指示找不到该视图。 

但是，对于JSP和InternalResourceViewResolver，确定JSP是否存在的唯一方法是通过RequestDispatcher进行调度。 

因此，您必须始终将InternalResourceViewResolver配置为在视图解析器的总体顺序中排在最后。

配置视图分辨率就像将ViewResolver bean添加到Spring配置中一样简单。 

MVC Config为View解析器和添加无逻辑的View Controller提供了专用的配置API，这对于无需控制器逻辑的HTML模板呈现非常有用。


## 重定向（Redirecting）

视图名称中的特殊redirect：前缀使您可以执行重定向。 

UrlBasedViewResolver（及其子类）将其识别为需要重定向的指令。 视图名称的其余部分是重定向URL。

最终效果与控制器返回RedirectView的效果相同，但是现在控制器本身可以根据逻辑视图名称进行操作。

 逻辑视图名称（例如 redirect:/myapp/some/resource）相对于当前Servlet上下文进行重定向，而名称诸如 redirect:https://myhost.com/some/arbitrary/path 则重定向到绝对URL。

请注意，如果使用@ResponseStatus注释控制器方法，则注释值优先于RedirectView设置的响应状态。

## Forwarding

您还可以使用特殊的forward：前缀表示最终由UrlBasedViewResolver和子类解析的视图名称。 

这将创建一个InternalResourceView，它执行RequestDispatcher.forward()。 

因此，此前缀在InternalResourceViewResolver和InternalResourceView（对于JSP）中没有用，但是如果您使用另一种视图技术但仍然希望强制转发由Servlet/JSP引擎处理的资源，则该前缀很有用。 

请注意，您也可以链接多个视图解析器。

## 内容协商

ContentNegotiatingViewResolver不会解析视图本身，而是委派给其他视图解析器，并选择类似于客户端请求的表示形式的视图。

可以从Accept标头或查询参数（例如， "/path?format=pdf"）中确定表示形式。

ContentNegotiatingViewResolver通过将请求媒体类型与其与每个ViewResolvers关联的View支持的媒体类型（也称为Content-Type）进行比较，从而选择合适的View处理该请求。

列表中具有兼容Content-Type的第一个View将表示形式返回给客户端。如果ViewResolver链无法提供兼容的视图，请查阅通过DefaultViews属性指定的视图列表。

后一个选项适用于单身视图，无论逻辑视图名称如何，该视图都可以呈现当前资源的适当表示形式。 Accept标头可以包含通配符（例如 text/*），在这种情况下，其Content-Type为text/xml的View是兼容的匹配。

# Locale-语言环境

正如Spring Web MVC框架所做的那样，Spring体系结构的大多数部分都支持国际化。

使用DispatcherServlet，您可以使用客户端的语言环境自动解析消息。这是通过LocaleResolver对象完成的。

当请求进入时，DispatcherServlet会寻找一个语言环境解析器，如果找到了它，它会尝试使用它来设置语言环境。

通过使用 RequestContext.getLocale() 方法，您始终可以检索由语言环境解析器解析的语言环境。

除了自动的语言环境解析之外，您还可以在处理程序映射上附加一个拦截器（有关处理程序映射拦截器的更多信息，请参见拦截），以在特定情况下（例如，基于请求中的参数）更改语言环境。

语言环境解析器和拦截器在org.springframework.web.servlet.i18n包中定义，并以常规方式在应用程序上下文中进行配置。 

Spring包含以下选择的语言环境解析器。

Time Zone

Header Resolver

Cookie Resolver

Session Resolver

Locale Interceptor

# 主题

您可以应用Spring Web MVC框架主题来设置应用程序的整体外观，从而增强用户体验。 

主题是静态资源的集合，通常影响样式表和图像，这些样式表和图像会影响应用程序的视觉样式。

# 多部分解析器

org.springframework.web.multipart包中的MultipartResolver是一种用于解析包括文件上传在内的多部分请求的策略。 

有一种基于Commons FileUpload的实现，另一种基于Servlet 3.0多部分请求解析。

要启用多部分处理，您需要在DispatcherServlet Spring配置中声明一个名为multipartResolver的MultipartResolver bean。 

DispatcherServlet会检测到它并将其应用于传入的请求。 

当收到内容类型为multipart/form-data的POST时，解析程序将解析内容并将当前HttpServletRequest包装为MultipartHttpServletRequest以提供对解析部分的访问权限，除了将其作为请求参数公开外，还可以通过主题主题设置整体外观 并感觉到您的应用程序，从而增强了用户体验。 

主题是静态资源的集合，通常影响样式表和图像，这些样式表和图像会影响应用程序的视觉样式。

## Apache Commons FileUpload

要使用Apache Commons FileUpload，可以配置名称为multipartResolver的CommonsMultipartResolver类型的Bean。 

您还需要commons-fileupload作为对类路径的依赖。

## Servlet 3.0

需要通过Servlet容器配置启用Servlet 3.0多部分解析。 

为此：

在Java中，在Servlet注册上设置MultipartConfigElement。

在web.xml中，将 `<multipart-config>` 部分添加到Servlet声明中。

以下示例显示了如何在Servlet注册上设置MultipartConfigElement：

```java
public class AppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

    // ...

    @Override
    protected void customizeRegistration(ServletRegistration.Dynamic registration) {

        // Optionally also set maxFileSize, maxRequestSize, fileSizeThreshold
        registration.setMultipartConfig(new MultipartConfigElement("/tmp"));
    }

}
```

# 个人总结

我觉得这一节知识很多，但是我没有领会其中的精髓。

还是直接实现来的实在。

## 翻译

这种直白的翻译比较适合知道有哪些特性，便于系统的学习。但是对于深刻的理解基本没有帮助。

# 拓展阅读

# 参考资料

[mvc-servlet](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-servlet)

[DispatcherServlet详解](http://sishuok.com/forum/blogPost/list/5188.html)

[DispatcherServlet的初始化过程](https://www.jianshu.com/p/9865f749e550)

* any list
{:toc}