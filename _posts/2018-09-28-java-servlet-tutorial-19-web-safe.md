---
layout: post
title: Java Servlet 教程-19-web 安全
date:  2018-10-07 10:17:56 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-19-web 安全
---

# web 安全的几个方面

认证、授权、机密性、数据完整性。

## 特征

web 应用包含的资源可以被多个用户访问。这些资源常常不受保护的遍历，开放网络如 Internet。

在这样的环境，大量的 web 应用将有安全需求。 

尽管质量保障和实现细节可能会有所不同，但 servlet 容器有满足这些需求的机制和基础设施，共用如下一些特性：

- 身份认证：表示通信实体彼此证明他们具体身份的行为是被授权访问的。

- 资源访问控制：表示和资源的交互是受限于集合的用户或为了强制完整性、保密性、或可用性约束的程序。

- 数据完整性：表示用来证明信息在传输过程中没有被第三方修改。

- 保密或数据隐私：表示用来保证信息只对以授权访问的用户可用。

# 登录和登出

容器在分派请求到 servlet引擎之前建立调用者身份。

在整个请求处理过程中或直到应用成功的在请求上调用身份认证、登录或退出，调用者身份保持不变。

对于异步请求，调用者身份建立在初始分派时，直到整个请求处理完成或直到应用成功的在请求上调用身份认证、登录或退出，调用者身份保持不变。

在处理请求时登录到一个应用，精确地对应有一个有效的非空的与请求关联的调用者身份，可以通过调用请求的 getRemoteUser 或getUserPrincipal 确定。

这些方法的任何一个返回null值表示调用者没有登录到处理请求的应用。

容器可以创建 HTTP Session 对象用于跟踪登录状态。

如果开发人员创建一个 session 而用户没有进行身份认证，然后容器认证用户，登录后，对开发人员代码可见的 session 必须是相同的 session 对象，该session 是登录发生之前创建的，以便不丢失 session 信息。

# 声明式安全

声明式安全是指以在应用外部的形式表达应用的安全模型需求，包括角色、访问控制和认证需求。部署描述符是web应用中的声明式安全的主要手段。

部署人员映射应用的逻辑安全需求到特定于运行时环境的安全策略的表示。在运行时，servlet 容器使用安全策略表示来实施认证和授权。

安全模型适用于 web 应用的静态内容部分和客户端请求到的应用内的servlet 和过滤器。

安全模型不适用于当 servlet 使用 RequestDispatcher 调用静态内容或使用 forward 或 include 到的servlet。

# 编程式安全

当仅仅声明式安全是不足以表达应用的安全模型时，编程式安全被用于意识到安全的应用。

## 接口方法

编程式安全包括以下 HttpServletRequest 接口的方法：

- authenticate

authenticate 方法允许应用由容器发起在一个不受约束的请求上下文内的来访者请求认证。

- login

login 方法允许应用执行用户名和密码收集（作为一种 Form-Based Login 的替代）。

- logout

logout 方法提供用于应用重置来访者的请求身份。

- getRemoteUser

getRemoteUser 方法由容器返回与该请求相关的远程用户（即来访者）的名字。

- isUserInRole

isUserInRole 方法确定是否与该请求相关的远程用户（即来访者）在一个特定的安全角色中。

isUserInRolem 方法需要一个引用应用角色的参数。

对于用在调用isUserInRole 的每一个单独的角色引用，一个带有关联到角色引用的role-name 的 security-role-ref 元素应该声明在部署描述符中。

每一个 security-role-ref 元素应该包含一个 role-link 子元素，其值是应用内嵌的角色引用链接到的应用安全角色名称。

容器使用 security-role-ref 的 role-name 是否等于角色引用来决定哪一个 security-role 用于测试用户是否在身份中。

- getUserPrincipal

getUserPrincipal 方法确定远程用户（即来访者）的 Principal 名称并返回一个与远程用户相关的 java.security.Principal 对象。调用getUserPrincipal 返回的 Principal 的 getName 方法返回远程用户的名字。

这些 API 允许 Servlet 基于获得的信息做一些业务逻辑决策。

如果没有用户通过身份认证，getRemoteUser 方法返回 null，isUserInRole 方法总返回 false，getUserPrincipal 方法总返回null。

例如，映射安全角色应用“FOO”到 role-name 为"manager"的安全角色的语法是：

```xml
<security-role-ref>
    <role-name>FOO</role-name>
    <role-link>manager</role-link>
</security-role-ref>
```

在这种情况下，如果属于“manager”安全角色的用户调用了 servlet，则调用 isUserInRole("FOO") API的结果是true。

如果用于调用 isUserInRole 的一个角色引用，没有匹配的 security-role-ref 存在 ，容器必须默认以 security-role 的 role-name 等于用于调用的角色引用来测试用户身份。

角色名 `*` 应该从不用作调用 isUserInRole 的参数。

任何以`*`调用isUserInRole 必须返回 false。

如果 security-role 的 role-name 使用`**`测试，且应用没有声明一个role-name为`**`的应用 security-role，isUserInRole 必须仅返回 true。

如果用户已经认证；即，仅当 getRemoteUser 和 getUserPrincipal 将同时返回非 null 值。否则，容器必须检查用户身份是否在应用角色中。

security-role-ref 元素声明通知部署人员应用使用的角色引用和必须定义哪一个映射。

# 编程式安全策略配置

## @ServletSecurity 注解

`@ServletSecurity` 提供了用于定义访问控制约束的另一种机制，相当于那些通过在便携式部署描述符中声明式或通过 ServletRegistration 接口的 setServletSecurity 方法编程式表示。

Servlet 容器必须支持在实现 javax.servlet.Servlet 接口的类（和它的子类）上使用@ServletSecurity 注解。

## @HttpConstraint

`@HttpConstraint` 注解用在 @ServletSecurity 中表示应用到所有 HTTP 协议方法的安全约束，且 HTTP 协议方法对应的@HttpMethodConstraint 没有出现在 @ServletSecurity 注解中。

对于一个 @HttpConstraint 返回所有默认值发生在与至少一个@HttpMethodConstraint 返回不同于所有默认值的组合的特殊情况，@HttpMethodConstraint 表示没有安全约束被应用到任何 HTTP 协议方法，否则一个安全约束将应用。

这个例外是确保这些潜在的非特定@HttpConstraint 使用没有产生约束，这将明确建立不受保护的访问这些方法；因为，它们没有被约束覆盖。

## @HttpMethodConstraint

`@HttpMethodConstraint` 注解用在 @ServletSecurity 注解中表示在特定 HTTP 协议消息上的安全约束。

@ServletSecurity 注解可以指定在(更准确地说，目标是) Servlet 实现类上，且根据 @Inherited 元注解定义的规则，它的值是被子类继承的。至多只有一个 @ServletSecurity 注解实例可以出现在 Servlet 实现类上，且 @ServletSecurity 注解必须不指定在(更准确地说，目标是) Java 方法上。

当一个或多个 @HttpMethodConstraint 注解定义在 @ServletSecurity注解中时，每一个 @HttpMethodConstraint 定义的 security-constraint，其应用到 @HttpMethodConstraint 中标识的 HTTP 协议方法。除了它的 @HttpConstraint 返回所有默认值、和它包含至少一个返回不同于所有默认值的 @HttpMethodConstraint 的情况之外，@ServletSecurity 注解定义另一个 security-constraint 应该到所有还没有定义相关 @HttpMethodConstraint 的 HTTP 协议方法。

## 感想

这里的定义较为复杂，建议参考拓展阅读中的鉴权框架。

# 角色

安全角色是由应用开发人员或装配人员定义的逻辑用户分组。当部署了应用，由部署人员映射角色到运行时环境的 principal 或组。

Servlet 容器根据 principal 的安全属性为与进入请求相关的principal 实施声明式或编程式安全。 这可能以如下任一方式发生：

部署人员已经映射一个安全角色到运行环境中的一个用户组。调用的principal 所属的用户组取自其安全属性。仅当 principal 所属的用户组由部署人员已经映射了安全角色，principal 是在安全角色中。

部署人员已经映射安全角色到安全策略域中的 principal 名字。

在这种情况下，调用的 principal 的名字取自其安全属性。仅当 principal 名字与安全角色已映射到的 principal 名字一样时，principal 是在安全角色中。

# 四种认证类型

web客户端可以使用以下机制之一向web服务器认证用户身份：

- HTTP Basic Authentication（HTTP基本认证）

- HTTP Digest Authentication（HTTP摘要认证）

- HTTPS Client Authentication（HTTPS客户端认证）

- Form Based Authentication（基于表单的认证）

## HTTP Basic Authentication

HTTP Basic Authentication 基于用户名和密码，是 HTTP/1.0 规范中定义的认证机制。Web 服务器要求 web 客户端认证用户。作为请求的一部分，web 服务器传递 realm（字符串）给要被认证的用户。Web 客户端获取用户的用户名和密码并传给 web 服务器。Web 服务器然后在指定的realm 认证用户。

基本认证是不安全的认证协议。用户密码以简单的 base64 编码发送，且未认证目标服务器。额外的保护可以减少一些担忧：安全传输机制（HTTPS），或者网络层安全（如 IPSEC 协议或 VPN 策略）被应用到一些部署场景。

## HTTP Digest Authentication

跟 HTTP Basic Authentication 类似，HTTP Digest Authentication 也是 基于用户名和密码，所不同的是，HTTP Digest Authentication 并不在网络中传递用户密码。在 HTTP Digest Authentication 中，客户端发送单向散列的密码（和额外的数据）。尽管密码不在线路上发生，HTTP Digest Authentication 需要对认证容器可用的明文密码等价物（密码等价物可以是这样的，它们仅能在一个特定的 realm 用来认证用户），以致容器可以通过计算预期的摘要验证接收到的认证者。Servlet容器应支持 HTTP_DIGEST 身份认证。

## Form Based Authentication

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


到达步骤7的重定向的请求的 HTTP 协议方法，可以和触发认证的请求有不同的 HTTP 方法。

同样地，在第6步的重定向之后，表单认证器必须处理重定向的请求，即使对到达请求的 HTTP 方法的认证不是必需的。

为了改善重定向的请求的 HTTP 方法的可预测性，容器应该使用303状态码（SC_SEE_OTHER）重定向（步骤6），除了与HTTP 1.0用户代理的协作之外的是必需的；在这种情况应该使用302状态码。

当进行一个不受保护的传输时，基于表单的认证受制于一些与基本验证一样的相同的脆弱性。

当触发认证的请求在一个安全传输之上到达，或者登录页面受制于一个CONFIDENTIAL user-data-constraint，登录页面必须返回给用户，并在安全传输之上提交到容器。

登录页面受制于一个CONFIDENTIAL user-data-constraint，且一个CONFIDENTIAL user-data-constraint应该包含在每一个包含认证要求的security-constraint中。

HttpServletRequest 接口的 login 方法提供另一种用于应用控制它的登录界面外观的手段。

### 登录表单

基于表单的登录和基于 URL 的 session 跟踪可以通过编程实现。基于表单的登录应该仅被用在当 session 由 cookie 或 SSL session 信息维护时。

为了进行适当的认证，登录表单的 action 总是 j_security_check。

该限制使得不管请求什么资源，登录表单都能工作，且避免了要求服务器指定输出表单的 action 字段。登录表单应该在密码表单字段上指定autocomplete="off"。

下面的示例展示了如何把表单编码到HTML页中：

```html
<form method=”POST” action=”j_security_check”>
<input type=”text” name=”j_username”>
<input type=”password” name=”j_password” autocomplete=”off”>
</form>
```

如果因为 HTTP 请求造成基于表单的登录被调用，容器必须保存原始请求参数，在成功认证时使用，它重定向调用所请求的资源。

如果用户已使用表单登录通过认证，且已经创建一个 HTTP session，该session 的超时或失效将导致用户被注销，在这种情况下，随后的请求必须导致用户重新认证。注销与认证具有相同的作用域：例如，如果容器支持单点登录，如 Java EE 技术兼容的web容器，用户只需要与托管在web容器中的任何一个 web 应用重新认证即可。

## HTTPS Client Authentication

使用HTTPS（HTTP over SSL）认证最终用户是一种强认证机制。该机制需要客户端拥有 Public Key Certificate（PKC）。目前，PKC 在电子商务应用中是很有用的，也对浏览器中的单点登录很有用。

## 其他容器认证机制

Servlet 容器应该提供公共接口，可用于集成和配置其他的 HTTP 消息层的认证机制，提供给代表已部署应用的容器使用。这些接口应该提供给参与者使用而不是容器供应商（包括应用开发人员、系统管理人员和系统集成人员）。

为了便于实现和集成其他容器认证机制，建议为所有 Servlet 容器实现Servlet 容器 Profile 的 Java 认证 SPI（即，JSR 196）。SPI可下载地址：http://www.jcp.org/en/jsr/detail?id=196

# 拓展阅读

实际使用中，上面的认证过程实在过于繁琐，建议使用成熟的框架。

## 权限验证框架

[shiro](https://houbb.github.io/2016/08/11/shiro)

[spring-security](https://houbb.github.io/2017/12/19/spring-security-hello)

# 服务器跟踪认证信息

下面的安全标识（如用户和组）在运行时环境中映射的角色是环境指定的而非应用指定的，理想的是：

1. 使登录机制和策略是 web 应用部署到的环境属性。

2. 在同一个容器部署的所有应用能使用相同的认证信息来表示principal，且

3. 需要重新认证用户仅当已经越过了安全策略域边界。

因此，servlet 容器需要在容器级别（而不是在 web 应用级别）跟踪认证信息。

这允许在一个 web 应用已经通过认证的用户可以访问容器管理的以同样的安全标识许可的其他资源。


# 默认策略

默认情况下，身份认证并不需要访问资源。

当安全约束（如果有）包含的url-pattern 是请求 URI 的最佳匹配，且结合了施加在请求的 HTTP 方法上的 auth-constraint（指定的角色），则身份认证是需要的。

同样，一个受保护的传输是不需要的，除非应用到请求的安全约束结合了施加在请求的HTTP方法上的 user-data-constraint（有一个受保护的transport-guarantee）。

# 参考资料

[web 安全](https://github.com/waylau/servlet-3.1-specification/tree/master/docs/Security)

《Head First Servlet & JSP》

* any list
{:toc}