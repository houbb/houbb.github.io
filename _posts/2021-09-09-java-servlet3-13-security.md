---
layout: post
title: Java Servlet3.1 规范-13-安全
date:  2021-09-09 14:49:58 +0800
categories: [Java]
tags: [web, servlet, servlet3, sh]
published: true
---

# 安全

应用开发人员创建Web应用，他给、销售或其他方式转入应用给部署人员，部署人员覆盖安装到运行时环境。

应用开发人员与部署人员沟通部署系统的安全需求。该信息可以通过应用部署描述符声明传达，通过在应用代码中使用注解，或通过 ServletRegistration 接口的setServletSecurity 方法编程。

本节描述了 Servlet 容器安全机制、接口、部署描述符和基于注解机制和编程机制用于传达应用安全需求。

# 介绍

web 应用包含的资源可以被多个用户访问。这些资源常常不受保护的遍历，开放网络如 Internet。在这样的环境，大量的 web 应用将有安全需求。

尽管质量保障和实现细节可能会有所不同，但 servlet 容器有满足这些需求的机制和基础设施，共用如下一些特性：

* 身份认证：表示通信实体彼此证明他们具体身份的行为是被授权访问的。
* 资源访问控制：表示和资源的交互是受限于集合的用户或为了强制完整性、保密性、或可用性约束的程序。
* 数据完整性：表示用来证明信息在传输过程中没有被第三方修改。
* 保密或数据隐私：表示用来保证信息只对已授权访问的用户可用。

# 声明式安全

声明式安全是指以在应用外部的形式表达应用的安全模型需求，包括角色、访问控制和认证需求。部署描述符是web应用中的声明式安全的主要手段。

部署人员映射应用的逻辑安全需求到特定于运行时环境的安全策略的表示。在运行时，servlet 容器使用安全策略表示来实施认证和授权。

安全模型适用于 web 应用的静态内容部分和客户端请求到的应用内的servlet 和过滤器。安全模型不适用于当 servlet 使用 RequestDispatcher 调用静态内容或使用 forward 或 include 到的servlet。

# 编程式安全

当仅仅声明式安全是不足以表达应用的安全模型时，编程式安全被用于意识到安全的应用。

编程式安全包括以下 HttpServletRequest 接口的方法：

* authenticate
* login
* logout
* getRemoteUser
* isUserInRole
* getUserPrincipal

login 方法允许应用执行用户名和密码收集（作为一种 Form-Based Login 的替代）。

authenticate 方法允许应用由容器发起在一个不受约束的请求上下文内的来访者请求认证。

logout 方法提供用于应用重置来访者的请求身份。

getRemoteUser 方法由容器返回与该请求相关的远程用户（即来访者）的名字。

isUserInRole 方法确定是否与该请求相关的远程用户（即来访者）在一个特定的安全角色中。

getUserPrincipal 方法确定远程用户（即来访者）的 Principal 名称并返回一个与远程用户相关的 java.security.Principal 对象。

调用getUserPrincipal 返回的 Principal 的 getName 方法返回远程用户的名字。这些 API 允许 Servlet 基于获得的信息做一些业务逻辑决策。

如果没有用户通过身份认证，getRemoteUser 方法返回 null，isUserInRole 方法总返回 false，getUserPrincipal 方法总返回null。

isUserInRolem 方法需要一个引用应用角色的参数。对于用在调用isUserInRole 的每一个单独的角色引用，一个带有关联到角色引用的role-name 的 security-role-ref 元素应该声明在部署描述符中。每一个 security-role-ref 元素应该包含一个 role-link 子元素，其值是应用内嵌的角色引用链接到的应用安全角色名称。容器使用 security-role-ref 的 role-name 是否等于角色引用来决定哪一个 security-role 用于测试用户是否在身份中。

例如，映射安全角色应用“FOO”到 role-name 为"manager"的安全角色的语法是：

```xml
    <security-role-ref>
        <role-name>FOO</role-name>
        <role-link>manager</role-link>
    </security-role-ref>
```

在这种情况下，如果属于“manager”安全角色的用户调用了 servlet，则调用 isUserInRole("FOO") API的结果是true。

如果用于调用 isUserInRole 的一个角色引用，没有匹配的 security-role-ref 存在 ，容器必须默认以 security-role 的 role-name 等于用于调用的角色引用来测试用户身份。

角色名`*`应该从不用作调用 isUserInRole 的参数。任何以`*`调用isUserInRole 必须返回 false。如果 security-role 的 role-name 使用`**`测试，且应用没有声明一个role-name为`**`的应用 security-role，isUserInRole 必须仅返回 true。

如果用户已经认证；即，仅当 getRemoteUser 和 getUserPrincipal 将同时返回非 null 值。否则，容器必须检查用户身份是否在应用角色中。

security-role-ref 元素声明通知部署人员应用使用的角色引用和必须定义哪一个映射。

# 编程式安全策略配置

本章定义的注解和API提供用于配置 Servlet 容器强制的安全约束。

### @ServletSecurity 注解

`@ServletSecurity` 提供了用于定义访问控制约束的另一种机制，相当于那些通过在便携式部署描述符中声明式或通过 ServletRegistration 接口的 setServletSecurity 方法编程式表示。

Servlet 容器必须支持在实现 javax.servlet.Servlet 接口的类（和它的子类）上使用@ServletSecurity 注解。

```java
    package javax.servlet.annotation;
    
    @Inherited
    @Documented
    @Target(value=TYPE)
    @Retention(value=RUNTIME)
    public @interface ServletSecurity {
        HttpConstraint value();
        HttpMethodConstraint[] httpMethodConstraints();
    }
```

TABLE 13-1 The ServletSecurity Interface

| 元素                  | 描述                                                         | 默认            |
| --------------------- | ------------------------------------------------------------ | --------------- |
| value                 | HttpConstraint 定义了应用到没有在httpMethodConstraints 返回的数组中表示的所有HTTP方法的保护。 | @HttpConstraint |
| httpMethodConstraints | HTTP方法的特定限制数组                                       | {}              |

#### @HttpConstraint

@HttpConstraint 注解用在 @ServletSecurity 中表示应用到所有 HTTP 协议方法的安全约束，且 HTTP 协议方法对应的@HttpMethodConstraint 没有出现在 @ServletSecurity 注解中。

对于一个 @HttpConstraint 返回所有默认值发生在与至少一个@HttpMethodConstraint 返回不同于所有默认值的组合的特殊情况，@HttpMethodConstraint 表示没有安全约束被应用到任何 HTTP 协议方法，否则一个安全约束将应用。

这个例外是确保这些潜在的非特定@HttpConstraint 使用没有产生约束，这将明确建立不受保护的访问这些方法；因为，它们没有被约束覆盖。

```java
package javax.servlet.annotation;

@Documented
@Retention(value=RUNTIME)
public @interface HttpConstraint {
    ServletSecurity.EmptyRoleSemantic value();
    java.lang.String[] rolesAllowed();
    ServletSecurity.TransportGuarantee transportGuarantee();
}
```

| 元素               | 描述                                                     | 默认   |
| ------------------ | -------------------------------------------------------- | ------ |
| value              | 当rolesAllowed返回一个空数组，（只）应用的默认授权语义。 | PERMIT |
| rolesAllowed       | 包含授权角色的数组                                       | {}     |
| transportGuarantee | 在连接的请求到达时必须满足的数据保护需求。               | NONE   |

### @HttpMethodConstraint

@HttpMethodConstraint 注解用在 @ServletSecurity 注解中表示在特定 HTTP 协议消息上的安全约束。

```java
package javax.servlet.annotation;

@Documented
@Retention(value=RUNTIME)
public @interface HttpMethodConstraint {
    ServletSecurity.EmptyRoleSemantic value();
    java.lang.String[] rolesAllowed();
    ServletSecurity.TransportGuarantee transportGuarantee();
}
```

TABLE 13-3 The HttpMethodConstraint Interface

| 元素               | 描述                                                     | 默认   |
| ------------------ | -------------------------------------------------------- | ------ |
| value              | HTTP协议方法名                                           |        |
| emptyRoleSemantic  | 当rolesAllowed返回一个空数组，（只）应用的默认授权语义。 | PERMIT |
| rolesAllowed       | 包含授权角色的数组                                       | {}     |
| transportGuarantee | 在连接的请求到达时必须满足的数据保护需求。               | NONE   |

@ServletSecurity 注解可以指定在(更准确地说，目标是) Servlet 实现类上，且根据 @Inherited 元注解定义的规则，它的值是被子类继承的。

至多只有一个 @ServletSecurity 注解实例可以出现在 Servlet 实现类上，且 @ServletSecurity 注解必须不指定在(更准确地说，目标是) Java 方法上。

当一个或多个 @HttpMethodConstraint 注解定义在 @ServletSecurity注解中时，每一个 @HttpMethodConstraint 定义的 security-constraint，其应用到 @HttpMethodConstraint 中标识的 HTTP 协议方法。

除了它的 @HttpConstraint 返回所有默认值、和它包含至少一个返回不同于所有默认值的 @HttpMethodConstraint 的情况之外，@ServletSecurity 注解定义另一个 security-constraint 应该到所有还没有定义相关 @HttpMethodConstraint 的 HTTP 协议方法。

定义在便携式部署描述符中的 security-constraint 元素用于对所有出现在该约束中的 url-pattern 授权。

当在便携式部署描述符中的一个 security-constraint 包含一个 url-pattern，其精确匹配一个使用@ServletSecurity注解的模式映射到的类，该注解必须在由容器在该模式上强制实施的约束上没有效果。

当为便携式部署描述符定义了 metadata-complete=true 时，@ServletSecurity 注解不会应用到部署描述符中的任何 url-pattern 映射到（任何servlet映射到）的注解类。

@ServletSecurity 注解不应用到 ServletRegistration 使用ServletContext 接口的 addServlet(String, Servlet) 方法创建的url-pattern，除非该 Servlet 是由 ServletContext 接口的createServlet 方法构建的。
除了上面列出的，当一个 Servlet 类注解了 @ServletSecurity，该注解定义的安全约束应用到所有 url-pattern 映射到的所有 Servlet 映射到的类。

当一个类没有加 @ServletSecurity 注解时，应用到从那个类映射到的Servlet 的访问策略是由合适的 security-constraint 元素确定的，如果有，在相关的便携式部署描述符，或者由约束禁止任何这样的标签，则如果有，为目标 servlet 通过 ServletRegistration 接口的setServletSecurity 方法编程式确定的。

####　示例

以下示例演示了　ServletSecurity　注解的使用。

CODE EXAMPLE 13-1 for all HTTP methods, no constraints

```java
    @ServletSecurity
    public class Example1 extends HttpServlet {
    }
```

CODE EXAMPLE 13-2 for all HTTP methods, no auth-constraint, confidential transport　required

```java
    @ServletSecurity(@HttpConstraint(transportGuarantee =
    TransportGuarantee.CONFIDENTIAL))
    public class Example2 extends HttpServlet {
    }


CODE EXAMPLE 13-3 for all HTTP methods, all access denied

```java
    @ServletSecurity(@HttpConstraint(EmptyRoleSemantic.DENY))
    public class Example3 extends HttpServlet {
    }
```

CODE EXAMPLE 13-4 for all HTTP methods, auth-constraint requiring membership in Role　R1

```java
    @ServletSecurity(@HttpConstraint(rolesAllowed = "R1"))
    public class Example4 extends HttpServlet {
    }
```

CODE EXAMPLE 13-5 for All HTTP methods except GET and POST, no constraints; forethods GET and POST, auth-constraint requiring membership in　Role R1; for POST, confidential transport required

```java
    @ServletSecurity((httpMethodConstraints = {
    @HttpMethodConstraint(value = "GET", rolesAllowed = "R1"),
    @HttpMethodConstraint(value = "POST", rolesAllowed = "R1",
    transportGuarantee = TransportGuarantee.CONFIDENTIAL)
    })
    public class Example5 extends HttpServlet {
    }
```

CODE EXAMPLE 13-6 for all HTTP methods except GET auth-constraint requiring　membership in Role R1; for GET, no constraints

```java
    @ServletSecurity(value = @HttpConstraint(rolesAllowed = "R1"),
    httpMethodConstraints = @HttpMethodConstraint("GET"))
    public class Example6 extends HttpServlet {
    }
```

CODE EXAMPLE 13-7 for all HTTP methods except TRACE, auth-constraint requiring　membership in Role R1; for TRACE, all access denied

```java
    @ServletSecurity(value = @HttpConstraint(rolesAllowed = "R1"),
    httpMethodConstraints = @HttpMethodConstraint(value="TRACE",
    emptyRoleSemantic = EmptyRoleSemantic.DENY))
    public class Example7 extends HttpServlet {
    }
```

#### 映射 @ServletSecurity 为 security-constraint

本节将介绍 @ServletSecurity 注解映射为它等价表示，security-constraint元素。这提供了使用已存在容器的 security-constraint 实施机制来简化实施。

由 Servlet 容器实施的 @ServletSecurity 注解必须在实施的效果上是等价的，由容器从在本节中定义的映射产生security-constraint 元素。

@ServletSecurity 注解用于定义一个方法无关的 @HttpConstraint，且紧跟着一个包含零个或多个 @HttpMethodConstraint 规格的列表。方法无关的约束应用到那些没有定义 HTTP 特定方法约束的所有 HTTP 方法。
当没有包含 @HttpMethodConstraint 元素，@ServletSecurity 注解相当于包含一个 web-resource-collection 的单个 security-constraint 元素，且 web-resource-collection 不包含 http-method 元素，因此涉及到所有 HTTP 方法。

下面的例子展示了把一个不包含 @HttpMethodConstraint 注解的@ServletSecurity 注解表示为单个 security-constraint 元素。相关的 servlet（registration）定义的 url-pattern 元素将被包含在web-resource-collection 中， 任何包含的 auth-constraint 和 user-data-constraint 元素的存在和值，将由定义在13.4.1.3节的“映射 @HttpConstraint 和 @HttpMethodConstraint 为XML”的映射的@HttpConstraint 的值确定。

CODE EXAMPLE 13-8 mapping @ServletSecurity with no contained

```
@HttpMethodConstraint

    @ServletSecurity(@HttpConstraint(rolesAllowed = "Role1"))
    
    <security-constraint>
        <web-resource-collection>
            <url-pattern>...</url-pattern>
        </web-resource-collection>
        <auth-constraint>
            <role-name>Role1</role-name>
        </auth-constraint>
    </security-constraint>
```

当指定了一个或多个 @HttpMethodConstraint 元素，方法无关的约束关联一个单个 security-constraint 元素，其，web-resource-collection 包含了为每一个 HTTP 方法命名在 @HttpMethodConstraint 元素中的 http-method-omission 元素。如果方法无关的约束返回所有默认值和至少一个 @HttpMethodConstraint 不是，包含 http-method-omission 元素的 security-constraint 必须不被创建。每一个 @HttpMethodConstraint 与另一种包含一个 web-resource-collection 的 security-constraint 关联，web-resource-collection 包含一个使用相应 HTTP 方法命名的 http-method 元素。

下面的例子展示了映射带有单个 @HttpMethodConstraint 的@ServletSecurity 注解为两种 security-constraint 元素。相应的Servlet（registration）定义的 url-pattern 元素将被包含在两种约束的 web-resource-collection 中，且任何包含的 auth-constraint 和 user-data-constraint 元素的存在和值，将由定义在13.4.1.3节的“映射 @HttpConstraint 和 @HttpMethodConstraint 为XML”的映射关联的 @HttpConstraint 和 @HttpMethodConstraint 的值确定。

CODE EXAMPLE 13-9 mapping @ServletSecurity with contained @HttpMethodConstraint

```
    @ServletSecurity(value=@HttpConstraint(rolesAllowed = "Role1"),
    httpMethodConstraints = @HttpMethodConstraint(value = "TRACE",
    emptyRoleSemantic = EmptyRoleSemantic.DENY))
    
    <security-constraint>
        <web-resource-collection>
            <url-pattern>...</url-pattern>
            <http-method-omission>TRACE</http-method-omission>
        </web-resource-collection>
        <auth-constraint>
            <role-name>Role1</role-name>
        </auth-constraint>
    </security-constraint>
    <security-constraint>
        <web-resource-collection>
            <url-pattern>...</url-pattern>
            <http-method>TRACE</http-method>
        </web-resource-collection>
        <auth-constraint/>
    </security-constraint>
```

### 映射 @HttpConstraint 和 @HttpMethodConstraint 为 XML

本节将介绍映射映射 @HttpConstraint 和 @HttpMethodConstraint 注解值（在 @ServletSecurity 中定义使用的）为它们等价的 auth-constraint 和 user-data-constraint 表示，这些注解共用一个通用模型用于表示用在便携式部署描述符中的 auth-constraint 和 user-data-constraint 元素的等价形式。该模型包括以下3种元素：

* emptyRoleSemantic
  授权语义，PERMIT或DENY，适用于在rolesAllowed中没有指定的角色时。此元素的默认值为PERMIT，且DENY不支持与非空的rolesAllowed列表结合使用。
* rolesAllowed
  一个包含授权角色的名字列表。当该列表为空时，其含义取决于emptyRoleSemantic的值。当角色名字“*”包含在允许的角色列表中时是没有特别的含义的。当特殊的角色名字“**”出现在rolesAllowed中时，它表示用户认证，不受约束的角色，是必需的和足够的。该元素的默认值是一个空列表。
* transportGuarantee
  数据保护需求，NONE 或 CONFIDENTIAL，在连接的请求到达时必须满足。该元素与一个包含一个使用相应值的transport-guarantee的user-data-constraint是等价的。该元素的默认值是NONE。
  下面的例子展示了上述的 @HttpConstraint 模型和 web.xml 中的 auth-constraint 和 user-data-constraint 元素之间的对应关系。

CODE EXAMPLE 13-10 emptyRoleSemantic=PERMIT, rolesAllowed={}, transportGuarantee=NONE

没有 constraint

CODE EXAMPLE 13-11 emptyRoleSemantic=PERMIT, rolesAllowed={}, transportGuarantee=CONFIDENTIAL

```xml
    <user-data-constraint>
        <transport-guarantee>CONFIDENTIAL</transport-guarantee>
    </user-data-constraint>
```

CODE EXAMPLE 13-12 emptyRoleSemantic=PERMIT, rolesAllowed={Role1},transportGuarantee=NONE

```xml
    <auth-constraint>
        <security-role-name>Role1</security-role-name>
    </auth-constraint>
```

CODE EXAMPLE 13-13 emptyRoleSemantic=PERMIT, rolesAllowed={Role1},transportGuarantee=CONFIDENTIAL

```xml
    <auth-constraint>
        <security-role-name>Role1</security-role-name>
    </auth-constraint>
    <user-data-constraint>
        <transport-guarantee>CONFIDENTIAL</transport-guarantee>
    </user-data-constraint>
```

CODE EXAMPLE 13-14 emptyRoleSemantic=DENY, rolesAllowed={}, transportGuarantee=NONE

```xml
    <auth-constraint/>
```

CODE EXAMPLE 13-15 emptyRoleSemantic=DENY, rolesAllowed={}, transportGuarantee=CONFIDENTIAL

```xml
    <auth-constraint/>
    <user-data-constraint>
        <transport-guarantee>CONFIDENTIAL</transport-guarantee>
    </user-data-constraint>
```

### ServletRegistration.Dynamic 的 setServletSecurity

ServletContextListener 内的 setServletSecurity 方法用于定义应用到 ServletRegistration 定义的映射的安全约束。

```java
    Collection<String> setServletSecurity(ServletSecurityElement arg);
```

setServletSecurity 的 javax.servlet.ServletSecurityElement 参数与 ServletSecurity 接口的 @ServletSecurity 注解在结构和模型上是类似的。

因此，定义在13.4.1.2节的“映射@ServletSecurity为security-constraint”的映射，应用类似的包含HttpConstraintElement 和 HttpMethodConstraintElement 值的ServletSecurityElement 映射为其等价的 security-constraint 表示。

setServletSecurity 方法返回一组 URL pattern（可能空），其已是便携式部署描述符中的 security-constraint 元素的精确目标（因此，调用是不影响的）。

如果 ServletContext 中得到的 ServletRegistration 已经被初始化了，该方法抛出 IllegalStateException。

当便携式部署描述符中的 security-constraint 包含一个 url-pattern 其精确匹配 ServletRegistration 映射的 pattern，调用ServletRegistration 的 setServletSecurity 必须对 Servlet 容器对 pattern 实施的约束没有任何影响。

除了上面列出的，包括当 Servlet 类注解了 @ServletSecurity，当调用了 ServletRegistration 的 setServletSecurity，它制定应用到registration 的 url-pattern 的安全约束。

# 角色

安全角色是由应用开发人员或装配人员定义的逻辑用户分组。当部署了应用，由部署人员映射角色到运行时环境的 principal 或组。

Servlet 容器根据 principal 的安全属性为与进入请求相关的principal 实施声明式或编程式安全。
这可能以如下任一方式发生：

1. 部署人员已经映射一个安全角色到运行环境中的一个用户组。调用的principal 所属的用户组取自其安全属性。仅当 principal 所属的用户组由部署人员已经映射了安全角色，principal 是在安全角色中。

2. 部署人员已经映射安全角色到安全策略域中的 principal 名字。在这种情况下，调用的 principal 的名字取自其安全属性。仅当 principal 名字与安全角色已映射到的 principal 名字一样时，principal 是在安全角色中。

# 认证

web客户端可以使用以下机制之一向web服务器认证用户身份：

* HTTP Basic Authentication（HTTP基本认证）
* HTTP Digest Authentication（HTTP摘要认证）
* HTTPS Client Authentication（HTTPS客户端认证）
* Form Based Authentication（基于表单的认证）

### HTTP Basic Authentication

HTTP Basic Authentication 基于用户名和密码，是 HTTP/1.0 规范中定义的认证机制。Web 服务器要求 web 客户端认证用户。作为请求的一部分，web 服务器传递 realm（字符串）给要被认证的用户。Web 客户端获取用户的用户名和密码并传给 web 服务器。Web 服务器然后在指定的realm 认证用户。

基本认证是不安全的认证协议。用户密码以简单的 base64 编码发送，且未认证目标服务器。额外的保护可以减少一些担忧：安全传输机制（HTTPS），或者网络层安全（如 IPSEC 协议或 VPN 策略）被应用到一些部署场景。

### HTTP Digest Authentication

跟 HTTP Basic Authentication 类似，HTTP Digest Authentication 也是 基于用户名和密码，所不同的是，HTTP Digest Authentication 并不在网络中传递用户密码。在 HTTP Digest Authentication 中，客户端发送单向散列的密码（和额外的数据）。尽管密码不在线路上发生，HTTP Digest Authentication 需要对认证容器可用的明文密码等价物（密码等价物可以是这样的，它们仅能在一个特定的 realm 用来认证用户），以致容器可以通过计算预期的摘要验证接收到的认证者。Servlet容器应支持 HTTP_DIGEST 身份认证。

### Form Based Authentication

“登录界面”的外观在使用 web 浏览器的内置的认证机制时不能被改变。本规范引入了所需的基于表单的认证机制，允许开发人员控制登录界面的外观。

Web 应用部署描述符包含登录表单和错误页面条目。登录界面必须包含用于输入用户名和密码的字段。这些字段必须分别命名为 j_username 和j_password。

当用户试图访问一个受保护的 web 资源，容器坚持用户的认证。如果用户已经通过认证则具有访问资源的权限，请求的 web 资源被激活并返回一个引用。如果用户未被认证，发生所有如下步骤：

1. 与安全约束关联的登录界面被发送到客户端，且 URL 路径和 HTTP 协议方法触发容器存储的认证。
2. 用户被要求填写表单，包括用户名和密码字段。
3. 客户端 post 表单到服务器。
4. 容器尝试使用来自表单的信息认证用户。
5. 如果认证失败，使用 forward 或 redirect 返回错误页面，且响应状态码设置为200。错误页面包含失败信息。
6. 如果授权成功，客户端使用存储的 URL 路径重定向到资源。
7. 当一个重定向的和已认证的请求到达容器，容器恢复请求和 HTTP 协 议方法，且已认证的用户主体被检查看看是否它在已授权的允许访问资源的角色中。
8. 如果用户已授权，容器处理接受的请求。

到达步骤7的重定向的请求的 HTTP 协议方法，可以和触发认证的请求有不同的 HTTP 方法。同样地，在第6步的重定向之后，表单认证器必须处理重定向的请求，即使对到达请求的 HTTP 方法的认证不是必需的。为了改善重定向的请求的 HTTP 方法的可预测性，容器应该使用303状态码（SC_SEE_OTHER）重定向（步骤6），除了与HTTP 1.0用户代理的协作之外的是必需的；在这种情况应该使用302状态码。

当进行一个不受保护的传输时，基于表单的认证受制于一些与基本验证一样的相同的脆弱性。

当触发认证的请求在一个安全传输之上到达，或者登录页面受制于一个CONFIDENTIAL user-data-constraint，登录页面必须返回给用户，并在安全传输之上提交到容器。

登录页面受制于一个CONFIDENTIAL user-data-constraint，且一个CONFIDENTIAL user-data-constraint应该包含在每一个包含认证要求的security-constraint中。

HttpServletRequest 接口的 login 方法提供另一种用于应用控制它的登录界面外观的手段。

#### 登录表单

基于表单的登录和基于 URL 的 session 跟踪可以通过编程实现。基于表单的登录应该仅被用在当 session 由 cookie 或 SSL session 信息维护时。

为了进行适当的认证，登录表单的 action 总是 j_security_check。该限制使得不管请求什么资源，登录表单都能工作，且避免了要求服务器指定输出表单的 action 字段。登录表单应该在密码表单字段上指定autocomplete="off"。

下面的示例展示了如何把表单编码到HTML页中：

```xml
    <form method=”POST” action=”j_security_check”>
    <input type=”text” name=”j_username”>
    <input type=”password” name=”j_password” autocomplete=”off”>
    </form>
```

如果因为 HTTP 请求造成基于表单的登录被调用，容器必须保存原始请求参数，在成功认证时使用，它重定向调用所请求的资源。

如果用户已使用表单登录通过认证，且已经创建一个 HTTP session，该session 的超时或失效将导致用户被注销，在这种情况下，随后的请求必须导致用户重新认证。注销与认证具有相同的作用域：例如，如果容器支持单点登录，如 Java EE 技术兼容的web容器，用户只需要与托管在web容器中的任何一个 web 应用重新认证即可。

#### HTTPS Client Authentication

使用HTTPS（HTTP over SSL）认证最终用户是一种强认证机制。该机制需要客户端拥有 Public Key Certificate（PKC）。目前，PKC 在电子商务应用中是很有用的，也对浏览器中的单点登录很有用。

### 其他容器认证机制

Servlet 容器应该提供公共接口，可用于集成和配置其他的 HTTP 消息层的认证机制，提供给代表已部署应用的容器使用。这些接口应该提供给参与者使用而不是容器供应商（包括应用开发人员、系统管理人员和系统集成人员）。

为了便于实现和集成其他容器认证机制，建议为所有 Servlet 容器实现Servlet 容器 Profile 的 Java 认证 SPI（即，JSR 196）。SPI可下载地址：http://www.jcp.org/en/jsr/detail?id=196

# 服务器跟踪认证信息

下面的安全标识（如用户和组）在运行时环境中映射的角色是环境指定的而非应用指定的，理想的是：

1. 使登录机制和策略是 web 应用部署到的环境属性。
2. 在同一个容器部署的所有应用能使用相同的认证信息来表示principal，且
3. 需要重新认证用户仅当已经越过了安全策略域边界。

因此，servlet 容器需要在容器级别（而不是在 web 应用级别）跟踪认证信息。这允许在一个 web 应用已经通过认证的用户可以访问容器管理的以同样的安全标识许可的其他资源。

# 指定安全约束

安全约束是一种定义 web 内容保护的声明式方式。安全约束关联授权和或在 web 资源上对 HTTP 操作的用户数据约束。安全约束，在部署描述符中由 security-constraint 表示，其包含以下元素：

* web资源集合 (部署描述符中的 web-resource-collection)
* 授权约束 (部署描述符中的 auth-constraint)
* 用户数据约束 (部署描述符中的 user-data-constraint)
  HTTP操作和网络资源的安全约束应用(即受限的请求)根据一个或多个web资源集合识别。Web资源集合包含以下元素：
* URL 模式 (部署描述符中的url-pattern)
* HTTP methods (部署描述符中的 http-method 或 http-method-omission 元素)

授权约束规定认证和命名执行受约束请求的被许可的授权角色的要求。用户必须至少是许可执行受约束请求的命名角色中的一个成员。特殊角色名“*”是定义在部署描述符中的所有角色名的一种简写。特殊的角色名“**”是一种用于任何授权的用户不受约束的角色的速记法。它表示任何授权的用户，不受约束的角色，被授权允许执行约束的请求。没有指定角色的授权约束表示在任何情况下不允许访问受约束请求。授权约束包含以下元素：

* role name (部署描述符中的role-name)

用户数据约束规定了在受保护的传输层连接之上接收受约束的请求的要求。需要保护的强度由传输保障的值定义。INTEGRAL类型的传输保障用于规定内容完整性要求，且传输保障CONFIDENTIAL用于规定保密性要求的。传输保障“NONE”表示当容器通过任何包括不受保护的连接接受到请求时，必须接受此受约束的请求。容器可能在响应中强加一个受信的传输保障（confidential transport guarantee）为INTEGRAL值。 用户数据约束包括如下元素：

* transport guarantee (部署描述符中的transport-guarantee)

如果没有授权约束应用到请求，容器必须接受请求，而不要求用户身份认证。如果没有用户数据约束应用到请求，当容器通过任何包括不受保护的连接接收到请求时，必须接受此请求。

### 组合约束

为了组合约束，HTTP 方法可以说是存在于 web-resource-collection中，仅当没有在集合中指定 HTTP 方法，或者集合在包含的 http-method 元素中具体指定了 HTTP 方法，或者集合包含一个或多个 http-method-omission 元素，但那些没有指定的 HTTP 方法。
当url-pattern 和 HTTP 方法以组合方式（即，在 web-resource-collection 中）出现在多个安全约束中，该约束（在模式和方法上的）是通过合并单个约束定义的。以相同的模式和方法出现的组合约束规则如下所示：

授权约束组合，其明确指定角色或通过“*” 隐式指定角色，可产生单个约束的合并的角色名称作为许可的角色。一个命名角色“**”的授权约束将与授权约束命名的或隐式的角色组合以允许任何授权的用户不受约束的角色。不包含授权约束的安全约束将与明确指定角色的或隐式指定角色的允许未授权访问的安全约束合并。授权约束的一个特殊情况是其没有指定角色，将与任何其他约束合并并覆盖它们的作用，这导致访问被阻止。

应用到常见的 url-pattern 和 http-method 的 user-data-constraint 组合，可产生合并的单个约束接受的连接类型作为接受的连接类型。不包含 user-data-constraint 的安全约束，将与其他 user-data-constraint 合并，使不安全的连接类型是可接受的连接类型。

### 示例

下面的示例演示了组合约束及它们翻译到的可应用的约束表格。假设部署描述符包含如下安全约束。

```xml
    <security-constraint>
        <web-resource-collection>
            <web-resource-name>precluded methods</web-resource-name>
            <url-pattern>/*</url-pattern>
            <url-pattern>/acme/wholesale/*</url-pattern>
            <url-pattern>/acme/retail/*</url-pattern>
            <http-method-omission>GET</http-method-omission>
            <http-method-omission>POST</http-method-omission>
        </web-resource-collection>
        <auth-constraint/>
    </security-constraint>
    <security-constraint>
        <web-resource-collection>
            <web-resource-name>wholesale</web-resource-name>
            <url-pattern>/acme/wholesale/*</url-pattern>
            <http-method>GET</http-method>
            <http-method>PUT</http-method>
        </web-resource-collection>
        <auth-constraint>
            <role-name>SALESCLERK</role-name>
        </auth-constraint>
    </security-constraint>
    <security-constraint>
        <web-resource-collection>
            <web-resource-name>wholesale 2</web-resource-name>
            <url-pattern>/acme/wholesale/*</url-pattern>
            <http-method>GET</http-method>
            <http-method>POST</http-method>
        </web-resource-collection>
        <auth-constraint>
            <role-name>CONTRACTOR</role-name>
        </auth-constraint>
        <user-data-constraint>
            <transport-guarantee>CONFIDENTIAL</transport-guarantee>
        </user-data-constraint>
    </security-constraint>
    <security-constraint>
        <web-resource-collection>
            <web-resource-name>retail</web-resource-name>
            <url-pattern>/acme/retail/*</url-pattern>
            <http-method>GET</http-method>
            <http-method>POST</http-method>
        </web-resource-collection>
        <auth-constraint>
            <role-name>CONTRACTOR</role-name>
            <role-name>HOMEOWNER</role-name>
        </auth-constraint>
    </security-constraint>
```

转化这个假定的部署描述符将产生定义在表13-4中的约束。

TABLE 13-4 Security Constraint Table

| url-pattern       | http 方法               | 许可的角色            | 支持的连接类型 |
| ----------------- | ----------------------- | --------------------- | -------------- |
| /*                | 所有除 GET，POST 的方法 | 阻止访问              | 不限制         |
| /acme/wholesale/* | 所有除 GET，POST 的方法 | 阻止访问              | 不限制         |
| /acme/wholesale/* | GET                     | CONTRACTOR SALESCLERK | 不限制         |
| /acme/wholesale/* | POST                    | CONTRACTOR            | CONFIDENTIAL   |
| /acme/retail/*    | 所有除 GET，POST 的方法 | 阻止访问              | 不限制         |
| /acme/retail/*    | GET                     | CONTRACTOR HOMEOWNER  | 不限制         |
| /acme/retail/*    | POST                    | CONTRACTOR HOMEOWNER  | 不限制         |

### 处理请求

当 servlet 容器接收到一个请求，它将使用119页“使用URL路径”描述的规则来选择在请求URI最佳匹配的url-pattern上定义的约束（如果有）。

如果没有约束被选择，容器将接受该请求。否则，容器将确定在选择的模式上是否此请求的HTTP方法是受约束的。如果不是，请求将被接受。

否则，请求必须满足在urlpattern应用到HTTP方法的约束。请求被接受和分派到相关的servlet，必须满足以下两个规则。

1. 接收到的请求的连接特性必须满足至少一种由约束定义的支持的连接类型。如果该规则不满足，容器将拒绝该请求并重定向到HTTPS端口。（作为一种优化，容器将以拒绝该请求为forbidden 并返回403 (SC_FORBIDDEN)状态码，如果知道该访问将最终将被阻止 (通过没有指定角色的授权约束)）

2. 请求的认证特性必须满足任何由约束定义的认证和角色要求。如果该规则不能满足是因为访问已经被阻止（通过没有指定角色的授权约束），则请求将被拒绝为forbidden 并返回403 (SC_FORBIDDEN)状态码。如果访问是受限于许可的角色且请求还没有被认证，则请求将被拒绝为unauthorized 且401(SC_UNAUTHORIZED)状态码将被返回以导致身份认证。如果访问是受限于许可的角色且请求的认证身份不是这些角色中的成员，则请求将被拒绝为forbidden 且403状态码(SC_FORBIDDEN)将被返回到用户。

### 未覆盖的 HTTP 协议方法

security-constraint schema提供了枚举（包括省略）定义在security-constraint 中的保护要求应用到哪一个HTTP方法的能力。

当HTTP 方法枚举在 security-constraint，约束定义的保护仅应用到枚举建立的方法。我们把不是枚举建立的方法称为“未覆盖的”HTTP方法。未覆盖的 HTTP 方法不保护所有 security-constraint 的 url-pattern 最匹配的请求的 URL。

当 HTTP 方法没有枚举在一个 security-constraint 中时，约束定义的保护应用到完整的HTTP（扩展）方法集。

在那种情况，在那些 security-constraint的url-pattern 最佳匹配的所有请求的URL，没有未覆盖的HTTP方法。

例子用三种方式描述了在哪些 HTTP 协议方法可能未覆盖。方法是否是未覆盖的是由在所有约束应用到一个 url-pattern 已经按照113.8.1节，“组合约束”组合决定的。

1. security-constraint 在 http-method 元素中命名一个或多个 HTTP 方法。除了那些明明在约束中的，所有 HTTP 方法是未覆盖的。

```xml
   <security-constraint>
       <web-resource-collection>
           <web-resource-name>wholesale</web-resource-name>
           <url-pattern>/acme/wholesale/*</url-pattern>
           <http-method>GET</http-method>
       </web-resource-collection>
       <auth-constraint>
           <role-name>SALESCLERK</role-name>
       </auth-constraint>
   </security-constraint>
```

除了GET，所以HTTP方法是未覆盖的。

2. security-constriant在http-method-omission元素中命名一个或多个HTTP方法。所有命名在约束中的HTTP方法是未覆盖的

```xml
   <security-constraint>
       <web-resource-collection>
           <web-resource-name>wholesale</web-resource-name>
           <url-pattern>/acme/wholesale/*</url-pattern>
           <http-method-omission>GET</http-method-omission>
       </web-resource-collection>
       <auth-constraint/>
   </security-constraint>
```

GET是未覆盖的。所有其他方法是被排除的auth-constraint覆盖的。

3. 包括一个 @HttpConstraint 的 @ServletSecurity 注解返回所有默认值，且也包括至少一个返回除了所有默认值之外的@HttpMethodConstraint。

除了那些命名在 @HttpMethodConstraint 中的所有 HTTP 方法是被注解未覆盖的。这种情况是与情况1是类似的，且等价于使用 ServletRegistration 接口的 setServletSecurity 方法也将产生一个类似的结果。

```java
   @ServletSecurity((httpMethodConstraints = {
   @HttpMethodConstraint(value = "GET", rolesAllowed = "R1"),
   @HttpMethodConstraint(value = "POST", rolesAllowed = "R1",
   transportGuarantee = TransportGuarantee.CONFIDENTIAL)
   })
   public class Example5 extends HttpServlet {
   }
```

除了GET和POST之外的所有HTTP方法是未覆盖的。

#### 安全约束配置规则

目的：确保在所有约束的 URL 模式上的所有HTTP方法有预期的安全保护（即，覆盖的）。

1. 没有在约束中命名 HTTP 方法；在这种情况下，未 URL 模式定义的安全保护将应用到所有 HTTP 方法。

2. 如果你不能遵循规则#1，添加`<deny-uncovered-http-methods>`和声明（使用`<http-method>`元素，或等价的注解）所有在约束URL模式允许的HTTP方法（有安全保护）。

3. 如果你不能遵循规则#2，声明约束来覆盖每一个约束的URL模式的所有HTTP方法。使用`<http-method-omission>`元素或HttpMethodConstraint 注解来表示除了被`<http-method>`或HttpMethodConstraint 命名的那些之外的所有 HTTP 方法集。当使用注解时，使用 HttpConstraint 定义应用到所有其他 HTTP 方法和配置EmptyRoleSemantic=DENY 来导致所有其他 HTTP 方法被拒绝的安全语义。

### 处理未覆盖的HTTP方法

在应用部署期间，容器必须通知部署人员任何存在于从为应用定义的约束组合产生的应用安全约束配置中的未覆盖的 HTTP 方法。提供的信息必须标识未覆盖的 HTTP 协议方法，和在 HTTP 方法未覆盖那些相关的URL模式。通知部署人员的要求可以通过记录必需的信息来满足。

当 deny-uncovered-http-methods 标记在应用的 web.xml 中设置了，容器必须拒绝任何 HTTP 协议方法，当它用于一个其 HTTP 方法在应用到请求 URL 最佳匹配的 url-pattern 的组合安全约束请求URL是未覆盖的。拒绝的请求将被拒绝为 forbidden 并返回一个 403（SC_FORBIDDEN）状态码。

导致未覆盖的 HTTP 方法为拒绝，部署系统将建立额外的排除 auth-constraint，去覆盖这些在未覆盖的HTTP方法约束的 url-pattern 的HTTP 方法。

当应用的安全配置不包含未覆盖的方法，deny-uncovered-http-methods标记在应用的有效的安全配置上必须没有效果。

应用deny-uncovered-http-methods 到一个应用，其安全配置包含未覆盖的方法，可能，在一些情况下，拒绝访问资源为了应用的功能必须是可访问的。这这种情况下，应用的安全配置应该完成所有未覆盖的方法被相关约束配置覆盖。

应用开发人员应该定义安全约束配置，没有任何未覆盖的 HTTP 方法，且他们应该设置 deny-uncovered-http-methods 标记确保他们的应用不会依赖于通过未覆盖的方法来得到可访问性。

Servlet 容器可以提供一个配置选项来选择未覆盖方法的默认行为是ALLOW 还是 DENY。这个选项可以配置在每容器粒度或更大。注意，设置这个默认为 DENY 可能导致一些应用失败。

# 默认策略

默认情况下，身份认证并不需要访问资源。

当安全约束（如果有）包含的url-pattern 是请求 URI 的最佳匹配，且结合了施加在请求的 HTTP 方法上的 auth-constraint（指定的角色），则身份认证是需要的。

同样，一个受保护的传输是不需要的，除非应用到请求的安全约束结合了施加在请求的HTTP方法上的 user-data-constraint（有一个受保护的transport-guarantee）。

# 登录和登出

容器在分派请求到 servlet引擎之前建立调用者身份。在整个请求处理过程中或直到应用成功的在请求上调用身份认证、登录或退出，调用者身份保持不变。

对于异步请求，调用者身份建立在初始分派时，直到整个请求处理完成或直到应用成功的在请求上调用身份认证、登录或退出，调用者身份保持不变。

在处理请求时登录到一个应用，精确地对应有一个有效的非空的与请求关联的调用者身份，可以通过调用请求的 getRemoteUser 或getUserPrincipal 确定。

这些方法的任何一个返回null值表示调用者没有登录到处理请求的应用。

容器可以创建 HTTP Session 对象用于跟踪登录状态。

如果开发人员创建一个 session 而用户没有进行身份认证，然后容器认证用户，登录后，对开发人员代码可见的 session 必须是相同的 session 对象，该session 是登录发生之前创建的，以便不丢失 session 信息。

# 参考地址

https://download.oracle.com/otn-pub/jcp/servlet-3_1-fr-eval-spec/servlet-3_1-final.pdf

* any list
{:toc}