---
layout: post
title: Spring Web MVC-04-Annotated Controllers 直接控制器
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: true
---

# mvc-controller

Spring MVC提供了一个基于注释的编程模型，其中 `@Controller` 和 `@RestController` 组件使用注释来表达请求映射，请求输入，异常处理等。 

带注释的控制器具有灵活的方法签名，无需扩展基类或实现特定的接口。 

以下示例显示了由注释定义的控制器：

```java
@Controller
public class HelloController {

    @GetMapping("/hello")
    public String handle(Model model) {
        model.addAttribute("message", "Hello World!");
        return "index";
    }
}
```

在前面的示例中，该方法接受Model并以String的形式返回视图名称，但是还存在许多其他选项，本章稍后将对其进行说明。

# 声明

您可以使用Servlet的WebApplicationContext中的标准Spring bean定义来定义控制器bean。 

`@Controller` 构造型允许自动检测，与Spring对在类路径中检测 `@Component` 类并为其自动注册Bean定义的常规支持保持一致。 

它还充当带注释类的构造型，表明其作为Web组件的作用。

要启用对此类 `@Controller` bean的自动检测，可以将组件扫描添加到Java配置中，如以下示例所示：

```java
@Configuration
@ComponentScan("org.example.web")
public class WebConfig {
}
```

或者使用 xml 的方式声明：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:p="http://www.springframework.org/schema/p"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="org.example.web"/>

    <!-- ... -->

</beans>
```

@RestController是一个组合的批注，其本身使用@Controller和@ResponseBody进行了元注释，以指示其每个方法都继承类型级别@ResponseBody批注的控制器，因此直接将其写入响应主体（相对于视图分辨率）并使用 HTML模板。

## AOP代理

在某些情况下，您可能需要在运行时用AOP代理装饰控制器。 

一个示例是，如果您选择直接在控制器上具有 `@Transactional` 批注。 

在这种情况下，特别是对于控制器，我们建议使用基于类的代理。 

这通常是控制器的默认选择。 

但是，如果控制器必须实现不是Spring Context回调的接口（例如InitializingBean，* Aware等），则可能需要显式配置基于类的代理。 

例如，使用 `<tx：annotation-driven />`，您可以更改为 `<tx:annotation-driven proxy-target-class="true"/>`；

使用 `@EnableTransactionManagement`，您可以更改为 `@EnableTransactionManagement（proxyTargetClass = true）`。

# Request Mapping

您可以使用 `@RequestMapping` 批注将请求映射到控制器方法。 

它具有各种属性，可以通过URL，HTTP方法，请求参数，标头和媒体类型进行匹配。 

您可以在类级别使用它来表示共享的映射，也可以在方法级别使用它来缩小到特定的端点映射。

`@RequestMapping` 还有HTTP方法特定的快捷方式：

```
@GetMapping

@PostMapping

@PutMapping

@DeleteMapping

@PatchMapping
```

快捷方式是提供的“自定义注释”，因为可以说，大多数控制器方法应该映射到特定的HTTP方法，而不是使用@RequestMapping，后者默认情况下与所有HTTP方法匹配。 

同时，在类级别仍需要@RequestMapping来表示共享映射。

以下示例具有类型和方法级别的映射：

```java
@RestController
@RequestMapping("/persons")
class PersonController {

    @GetMapping("/{id}")
    public Person getPerson(@PathVariable Long id) {
        // ...
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@RequestBody Person person) {
        // ...
    }
}
```

## URI 模式

您可以使用以下全局模式和通配符来映射请求：

`?` 匹配一个字符

`*` 匹配路径段中的零个或多个字符

`**` 匹配零个或多个路径段

您还可以声明URI变量并使用 `@PathVariable` 访问其值，如以下示例所示：

```java
@GetMapping("/owners/{ownerId}/pets/{petId}")
public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
    // ...
}
```

您可以在类和方法级别声明URI变量，如以下示例所示：

```java
@Controller
@RequestMapping("/owners/{ownerId}")
public class OwnerController {

    @GetMapping("/pets/{petId}")
    public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
        // ...
    }
}
```

ps: 这里可以简单理解为，url 拼接完成后，然后再根据方法进行反射处理。

URI变量会自动转换为适当的类型，或者引发TypeMismatchException。 

默认情况下，支持简单类型（int，long，Date等），您可以注册对任何其他数据类型的支持。 

ps: 这里的字符串和各种类型互转，应该统一抽象到 converter 项目中。

您可以显式地命名URI变量（例如，`@PathVariable("customId")`)，但是如果名称相同并且您的代码是使用调试信息或Java 8上的-parameters编译器标志进行编译的，则可以省略该详细信息。 

ps: spring 会利用字节码技术直接获取到对应的属性信息。

语法 `{varName：regex}` 声明带有正则表达式的URI变量，语法为 `{varName：regex}`。 

例如，给定URL "/spring-web-3.0.5 .jar"，以下方法提取名称，版本和文件扩展名：

```java
@GetMapping("/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}")
public void handle(@PathVariable String version, @PathVariable String ext) {
    // ...
}
```

URI路径模式也可以嵌入 `${}` 占位符，这些占位符在启动时通过针对本地，系统，环境和其他属性源使用PropertyPlaceHolderConfigurer进行解析。 

例如，您可以使用它来基于某些外部配置参数化基本URL。

## Pattern Comparison

当多个模式与URL匹配时，必须将它们进行比较以找到最佳匹配。 

这是通过使用 `AntPathMatcher.getPatternComparator(String path)` 来完成的，该工具查找更特定的模式。

如果模式的URI变量（计数为1），单通配符（计数为1）和双通配符（计数为2）的数量较少，则模式的含义不太明确。 

给定相等的分数，则选择更长的模式。 给定相同的分数和长度，将选择URI变量比通配符更多的模式。

默认映射模式 `(/**)` 从评分中排除，并且始终排在最后。 

另外，前缀模式（例如 `/public/**`）也被认为比其他没有双通配符的模式更具体。

有关完整的详细信息，请参阅AntPathMatcher中的AntPatternComparator，并且请记住，您可以自定义PathMatcher实现。 

请参阅配置部分中的路径匹配。

## 后缀匹配

默认情况下，Spring MVC执行 `.*` 后缀模式匹配，以便映射到 /person 的控制器也隐式映射到 `/person.*`。

然后，文件扩展名用于解释请求的内容类型以用于响应（即，代替Accept标头），例如/person.pdf、/person.xml等。

当浏览器用来发送难以一致解释的Accept标头时，以这种方式使用文件扩展名是必要的。

目前，这已不再是必须的，使用Accept标头应该是首选。

随着时间的流逝，文件扩展名的使用已经以各种方式证明是有问题的。

当使用URI变量，路径参数和URI编码进行覆盖时，可能会引起歧义。

关于基于URL的授权和安全性的推理（请参阅下一部分以了解更多详细信息）也变得更加困难。

若要完全禁用文件扩展名，必须设置以下两项：

useSuffixPatternMatching(false)，请参阅PathMatchConfigurer

favorPathExtension(false)，请参阅ContentNegotiationConfigurer

基于URL的内容协商仍然有用（例如，在浏览器中键入URL时）。

为此，我们建议使用基于查询参数的策略，以避免文件扩展名附带的大多数问题。

或者，如果必须使用文件扩展名，请考虑通过ContentNegotiationConfigurer的mediaTypes属性将它们限制为显式注册的扩展名列表。

## 后缀匹配和RFD

反射文件下载（RFD）攻击与XSS相似，因为它依赖反映在响应中的请求输入（例如，查询参数和URI变量）。但是，RFD攻击不是将JavaScript插入HTML，而是依靠浏览器切换来执行下载，并在以后双击时将响应视为可执行脚本。

在Spring MVC中，`@ResponseBody`和ResponseEntity方法存在风险，因为它们可以呈现不同的内容类型，客户端可以通过URL路径扩展来请求这些内容类型。禁用后缀模式匹配并使用路径扩展进行内容协商可以降低风险，但不足以防止RFD攻击。

为了防止RFD攻击，Spring MVC在呈现响应主体之前，添加了 `Content-Disposition:inline;filename=f.txt` 标头，以建议一个固定且安全的下载文件。

仅当URL路径包含既未列入白名单也未明确注册用于内容协商的文件扩展名时，才执行此操作。但是，当直接在浏览器中键入URL时，它可能会产生副作用。

默认情况下，许多常见路径扩展名都列入了白名单。具有自定义HttpMessageConverter实现的应用程序可以显式注册文件扩展名以进行内容协商，以避免为这些扩展名添加Content-Disposition标头。请参阅内容类型。

有关RFD的其他建议，请参见 [CVE-2015-5211](https://pivotal.io/security/cve-2015-5211)。

## Consumable Media Types

您可以根据请求的Content-Type缩小请求映射，如以下示例所示：

```java
@PostMapping(path = "/pets", consumes = "application/json") 
public void addPet(@RequestBody Pet pet) {
    // ...
}
```

consumes 属性还支持否定表达式-例如，`!text/plain` 表示除 text/plain 之外的任何内容类型。

您可以在类级别上声明一个共享的消耗属性。 

但是，与大多数其他请求映射属性不同，在类级别使用时，方法级别使用属性覆盖而不是扩展类级别声明。

MediaType为常用的媒体类型提供常量，例如APPLICATION_JSON_VALUE和APPLICATION_XML_VALUE。

## Producible Media Types

您可以根据接受请求标头和控制器方法生成的内容类型列表来缩小请求映射，如以下示例所示：

```java
@GetMapping(path = "/pets/{petId}", produces = "application/json") 
@ResponseBody
public Pet getPet(@PathVariable String petId) {
    // ...
}
```

您可以在类级别声明共享的Produces属性。

但是，与大多数其他请求映射属性不同，在类级别使用方法级别时，方法级别会产生属性覆盖，而不是扩展类级别声明。

## Parameters, headers

您可以根据请求参数条件来缩小请求映射。 

您可以测试是否存在请求参数（myParam），是否存在一个请求参数（!myParam）或特定值（myParam = myValue）。 

以下示例显示如何测试特定值：


```java
@GetMapping(path = "/pets/{petId}", params = "myParam=myValue") 
public void findPet(@PathVariable String petId) {
    // ...
}
```

您还可以将其与请求标头条件一起使用，如以下示例所示：

```java
@GetMapping(path = "/pets", headers = "myHeader=myValue") 
public void findPet(@PathVariable String petId) {
    // ...
}
```

您可以将Content-Type和Accept与标头条件进行匹配，但是最好使用 consumes 和 produces。

## HTTP HEAD, OPTIONS

@GetMapping（和@RequestMapping（method = HttpMethod.GET））透明地支持HTTP HEAD来进行请求映射。控制器方法不需要更改。应用于javax.servlet.http.HttpServlet的响应包装器确保将Content-Length标头设置为写入的字节数（实际上未写入响应）。

@GetMapping（和@RequestMapping（method = HttpMethod.GET））被隐式映射到并支持HTTP HEAD。像处理HTTP GET一样处理HTTP HEAD请求，不同的是，不是写入正文，而是计算字节数并设置Content-Length头。

默认情况下，通过将“允许响应”标头设置为所有具有匹配URL模式的@RequestMapping方法中列出的HTTP方法列表来处理HTTP OPTIONS。

对于没有HTTP方法声明的@RequestMapping，将Allow标头设置为GET，HEAD，POST，PUT，PATCH，DELETE，OPTIONS。控制器方法应始终声明支持的HTTP方法（例如，通过使用HTTP方法特定的变体：@GetMapping，@PostMapping等）。

您可以将@RequestMapping方法显式映射到HTTP HEAD和HTTP OPTIONS，但这在通常情况下不是必需的。

## 自定义注解

Spring MVC支持将组合注释用于请求映射。 

这些注解本身使用@RequestMapping进行元注解，并且旨在以更狭窄，更具体的用途重新声明@RequestMapping属性的子集（或全部）。

@GetMapping，@PostMapping，@PutMapping，@DeleteMapping和@PatchMapping是组合注释的示例。 

之所以提供它们，是因为可以说，大多数控制器方法应该映射到特定的HTTP方法，而不是使用@RequestMapping，后者默认情况下与所有HTTP方法都匹配。 

如果需要组合注释的示例，请查看如何声明它们。

Spring MVC还支持带有自定义请求匹配逻辑的自定义请求映射属性。 

这是一个更高级的选项，它需要子类化RequestMappingHandlerMapping并覆盖getCustomMethodCondition方法，您可以在其中检查自定义属性并返回自己的RequestCondition。

## Explicit Registrations 明确注册

您可以以编程方式注册处理程序方法，这些方法可用于动态注册或高级案例，例如同一处理程序在不同URL下的不同实例。 

下面的示例注册一个处理程序方法：

```java
@Configuration
public class MyConfig {

    @Autowired
    public void setHandlerMapping(RequestMappingHandlerMapping mapping, UserHandler handler) 
            throws NoSuchMethodException {

        RequestMappingInfo info = RequestMappingInfo
                .paths("/user/{id}").methods(RequestMethod.GET).build(); 

        Method method = UserHandler.class.getMethod("getUser", Long.class); 

        mapping.registerMapping(info, handler, method); 
    }
}
```

# 参考资料

[mvc-controller](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-controller)

* any list
{:toc}