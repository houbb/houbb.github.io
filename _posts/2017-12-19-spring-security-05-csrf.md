---
layout: post
title:  Spring Security-05-CSRF 跨域攻击
date:  2017-12-19 22:29:09 +0800
categories: [Spring]
tags: [spring, spring-security, web-safe]
published: true
---


# 序言

前面我们学习了 [spring security 与 springmvc 的整合入门教程](https://www.toutiao.com/i6884852647480787459/)。

[spring secutity整合springboot入门](https://www.toutiao.com/item/6916894767628468747/)

[spring security 使用 maven 导入汇总](https://www.toutiao.com/item/6917240713151398403/)

[spring security 业界标准加密策略源码详解](https://www.toutiao.com/item/6917261378050982403/)

这一节我们来学习一下 spring security 是如何预防 CSRF 攻击的。

## 拓展阅读

[web 安全系列-04-CSRF 跨站请求伪造](https://houbb.github.io/2020/08/09/web-safe-04-csrf)

# 什么是CSRF攻击？

了解CSRF攻击的最佳方法是看一个具体示例。

## 例子

假设您银行的网站提供了一种表格，该表格允许将资金从当前登录的用户转移到另一个银行帐户。 

例如，转账表单可能如下所示：

```html
<form method="post"
    action="/transfer">
<input type="text"
    name="amount"/>
<input type="text"
    name="routingNumber"/>
<input type="text"
    name="account"/>
<input type="submit"
    value="Transfer"/>
</form>
```

http 的响请求可能如下：

```
POST /transfer HTTP/1.1
Host: bank.example.com
Cookie: JSESSIONID=randomid
Content-Type: application/x-www-form-urlencoded

amount=100.00&routingNumber=1234&account=9876
```

现在，假装您对银行的网站进行身份验证，然后无需注销即可访问一个邪恶的网站。 

恶意网站包含具有以下格式的HTML页面：

```html
<form method="post"
    action="https://bank.example.com/transfer">
<input type="hidden"
    name="amount"
    value="100.00"/>
<input type="hidden"
    name="routingNumber"
    value="evilsRoutingNumber"/>
<input type="hidden"
    name="account"
    value="evilsAccountNumber"/>
<input type="submit"
    value="Win Money!"/>
</form>
```

您想赢钱，因此单击“提交”按钮。 

在此过程中，您无意中将 $100 转让给了恶意用户。 

发生这种情况的原因是，尽管恶意网站无法看到您的cookie，但与您的银行关联的cookie仍与请求一起发送。

最糟糕的是，使用JavaScript可以使整个过程自动化。 这意味着您甚至不需要单击该按钮。 

此外，在访问受XSS攻击的诚实站点时，也很容易发生这种情况。 

那么，我们如何保护用户免受此类攻击呢？

> [web 安全系列-02-XSS 跨站脚本攻击](https://houbb.github.io/2020/08/09/web-safe-02-xss)


# 防范CSRF攻击

发生CSRF攻击的原因是受害者网站的HTTP请求与攻击者网站的请求完全相同。 

这意味着无法拒绝来自邪恶网站的请求，也不允许来自银行网站的请求。 

为了防御CSRF攻击，我们需要**确保恶意站点无法提供请求中的某些内容，以便我们区分这两个请求**。

Spring提供了两种机制来防御CSRF攻击：

- 同步器令牌模式

- 在会话Cookie上指定SameSite属性

## 安全方法必须是幂等的

为了使针对CSRF的任何一种保护都起作用，应用程序必须确保“安全” HTTP方法是幂等的。 

这意味着使用HTTP方法GET，HEAD，OPTIONS和TRACE进行的请求不应更改应用程序的状态。

> [idempotent 幂等性防止重复提交](https://houbb.github.io/2020/07/16/idempotent-resubmit)

# 同步器令牌模式

抵御CSRF攻击的最主要，最全面的方法是使用同步器令牌模式。

## 解决方案

该解决方案是为了确保每个HTTP请求除了我们的会话cookie之外，还必须在HTTP请求中提供一个安全的，随机生成的值，称为CSRF令牌。

提交HTTP请求时，服务器必须查找预期的CSRF令牌，并将其与HTTP请求中的实际CSRF令牌进行比较。如果值不匹配，则应拒绝HTTP请求。

这项工作的关键是，实际的CSRF令牌应该位于浏览器**不会自动包含的HTTP请求的一部分中。**

ps: 这里可以发现防止重复提交和思想非常类似，甚至是验证码也是类似的思路。不过要确保这个信息不会被自动放到请求之中。

例如，在HTTP参数或HTTP标头中要求实际的CSRF令牌将防止CSRF攻击。在cookie中要求实际CSRF令牌不起作用，因为浏览器会自动将cookie包含在HTTP请求中。

我们可以放宽期望，仅对每个更新应用程序状态的HTTP请求仅要求实际的CSRF令牌。

为此，我们的应用程序必须确保安全的HTTP方法是幂等的。因为我们希望允许使用外部站点的链接来链接到我们的网站，所以这提高了可用性。

此外，我们不想在HTTP GET中包含随机令牌，因为这可能导致令牌泄漏。

让我们看一下使用同步令牌模式时示例将如何变化。

假设实际的CSRF令牌必须位于名为_csrf的HTTP参数中。

我们应用程序的转帐表单如下：

```html
<form method="post"
    action="/transfer">
<input type="hidden"
    name="_csrf"
    value="4bfd1575-3ad1-4d21-96c7-4ef2d9f86721"/>
<input type="text"
    name="amount"/>
<input type="text"
    name="routingNumber"/>
<input type="hidden"
    name="account"/>
<input type="submit"
    value="Transfer"/>
</form>
```

现在，该表单包含具有CSRF令牌值的隐藏输入。 

外部站点无法读取CSRF令牌，因为相同的来源策略可确保恶意站点无法读取响应。

相应的HTTP汇款请求如下所示：

```
POST /transfer HTTP/1.1
Host: bank.example.com
Cookie: JSESSIONID=randomid
Content-Type: application/x-www-form-urlencoded

amount=100.00&routingNumber=1234&account=9876&_csrf=4bfd1575-3ad1-4d21-96c7-4ef2d9f86721
```

您会注意到，HTTP请求现在包含带有安全随机值的_csrf参数。 

恶意网站将无法为_csrf参数提供正确的值（必须在邪恶网站上明确提供），并且当服务器将实际CSRF令牌与预期CSRF令牌进行比较时，传输将失败。

# SameSite 属性

防止CSRF攻击的一种新兴方法是在cookie上指定SameSite属性。 

设置cookie时，服务器可以指定SameSite属性，以指示从外部站点发出时不应发送该cookie。

Spring Security不直接控制会话cookie的创建，因此它不提供对SameSite属性的支持。 

Spring Session在基于servlet的应用程序中为SameSite属性提供支持。 

Spring Framework的CookieWebSessionIdResolver为基于WebFlux的应用程序中的SameSite属性提供了开箱即用的支持。

## 例子

一个示例，带有SameSite属性的HTTP响应标头可能类似于：

```
Set-Cookie: JSESSIONID=randomid; Domain=bank.example.com; Secure; HttpOnly; SameSite=Lax
```

## 属性值介绍

SameSite属性的有效值为：

Strict-指定后，来自同一站点的任何请求都将包含cookie。否则，cookie将不会包含在HTTP请求中。

Lax-当来自同一个站点的特定cookie将被发送，或者当请求来自顶层导航且方法是幂等时，将被发送。否则，cookie将不会包含在HTTP请求中。

## 真实案例

让我们看一下如何使用SameSite属性保护我们的示例。

银行应用程序可以通过在会话cookie上指定SameSite属性来防御CSRF。

在会话cookie上设置SameSite属性后，浏览器将继续发送JSESSIONID cookie和来自银行网站的请求。但是，浏览器将不再发送带有来自邪恶网站的传输请求的JSESSIONID cookie。由于会话不再存在于来自邪恶网站的传输请求中，因此可以保护应用程序免受CSRF攻击。

## 注意范围

使用SameSite属性防御CSRF攻击时，应注意一些重要注意事项。

（1）将SameSite属性设置为Strict可以提供更强的防御能力，但会使用户感到困惑。

考虑一个保持登录到托管在https://social.example.com上的社交媒体网站的用户。用户在https://email.example.org上收到一封电子邮件，其中包含指向社交媒体网站的链接。

如果用户单击链接，则他们理所当然地希望能够通过社交媒体站点进行身份验证。

但是，如果SameSite属性为Strict，则不会发送cookie，因此不会对用户进行身份验证。

另一个明显的考虑因素是，为了使SameSite属性能够保护用户，浏览器必须支持SameSite属性。 

（2）大多数现代浏览器都支持SameSite属性。 

但是，可能仍未使用较旧的浏览器。

因此，通常建议将SameSite属性用作深度防御，而不是针对CSRF攻击的唯一防护。

# 何时使用CSRF保护

什么时候应该使用CSRF保护？ 

我们的建议是对普通用户可能由浏览器处理的任何请求使用CSRF保护。 

如果仅创建非浏览器客户端使用的服务，则可能需要禁用CSRF保护。

## CSRF保护和JSON

一个常见的问题是“我需要保护由javascript发出的JSON请求吗？” 

简短的答案是，这看情况。 

但是，您必须非常小心，因为有些CSRF漏洞会影响JSON请求。 

### 例子

例如，恶意用户可以使用以下格式使用JSON创建CSRF：

```html
<form action="https://bank.example.com/transfer" method="post" enctype="text/plain">
    <input name='{"amount":100,"routingNumber":"evilsRoutingNumber","account":"evilsAccountNumber", "ignore_me":"' value='test"}' type='hidden'>
    <input type="submit"
        value="Win Money!"/>
</form>
```

这将产生以下JSON结构

```json
{ 
"amount": 100,
"routingNumber": "evilsRoutingNumber",
"account": "evilsAccountNumber",
"ignore_me": "=test"
}
```

如果应用程序未验证Content-Type，则该应用程序将被暴露。 

根据设置的不同，仍然可以通过更新URL后缀以.json结尾的方式来利用验证Content-Type的Spring MVC应用程序，如下所示：

```html
<form action="https://bank.example.com/transfer.json" method="post" enctype="text/plain">
    <input name='{"amount":100,"routingNumber":"evilsRoutingNumber","account":"evilsAccountNumber", "ignore_me":"' value='test"}' type='hidden'>
    <input type="submit"
        value="Win Money!"/>
</form>
```

## CSRF和无状态浏览器应用程序

如果我的应用程序是无状态的怎么办？ 

这并不一定意味着您受到保护。 

实际上，如果用户不需要针对给定请求在Web浏览器中执行任何操作，则他们可能仍然容易受到CSRF攻击。

例如，考虑一个使用自定义cookie而不是JSESSIONID的应用程序，其中包含其中的所有状态用于身份验证。 

进行CSRF攻击后，自定义cookie将与请求一起发送，其方式与在前面的示例中发送JSESSIONID cookie相同。 

此应用程序容易受到CSRF攻击。

使用基本身份验证的应用程序也容易受到CSRF攻击。 

该应用程序容易受到攻击，因为浏览器将以与前面示例中发送JSESSIONID cookie相同的方式在任何请求中自动包含用户名和密码。

# CSRF注意事项

实施针对CSRF攻击的防护时，需要考虑一些特殊注意事项。

## 登录

为了防止伪造登录请求，应保护HTTP请求中的登录免受CSRF攻击。

必须防止伪造登录请求，以使恶意用户无法读取受害者的敏感信息。

攻击执行如下：

1. 恶意用户使用恶意用户的凭据执行CSRF登录。现在，将受害者验证为恶意用户。

2. 然后，恶意用户欺骗受害者访问受感染的网站并输入敏感信息

3. 该信息与恶意用户的帐户相关联，因此恶意用户可以使用自己的凭据登录并查看vicitim的敏感信息

确保保护HTTP请求不受CSRF攻击的可能原因是，用户可能会遇到会话超时，从而导致请求被拒绝。会话超时对于不需要登录就需要会话的用户来说是令人惊讶的。

## 登出

为了防止伪造注销请求，应该保护注销HTTP请求免受CSRF攻击。 

必须防止伪造注销请求，以便恶意用户无法读取受害者的敏感信息。 

确保注销HTTP请求免受CSRF攻击的可能麻烦在于，用户可能会遇到会话超时，从而导致请求被拒绝。 

会话超时对于不希望需要会话才能注销的用户来说是令人惊讶的

## CSRF和会话超时

通常，预期的CSRF令牌存储在会话中。这意味着，会话期满后，服务器将不会找到预期的CSRF令牌并拒绝HTTP请求。

有很多选项可以解决超时问题，每个选项都需要权衡取舍。

减轻超时的最佳方法是使用JavaScript在表单提交时请求CSRF令牌。然后使用CSRF令牌更新该表单并提交。

另一个选择是使用一些JavaScript，让用户知道他们的会话即将到期。用户可以单击按钮以继续并刷新会话。

最后，预期的CSRF令牌可以存储在cookie中。这允许预期的CSRF令牌超过会话寿命。

有人可能会问为什么默认情况下预期的CSRF令牌没有存储在Cookie中。

这是因为存在已知的漏洞利用，其中另一个域可以设置标头（例如，用于指定cookie）。这与出现标题X-Requested-With时Ruby on Rails不再跳过CSRF检查的原因相同。请参阅此webappsec.org线程以获取有关如何执行漏洞利用的详细信息。

另一个缺点是，通过删除状态（即超时），您将失去在令牌遭到破坏时强制使令牌无效的能力。

## 分段（文件上传）

保护分段请求（文件上传）免受CSRF攻击会导致鸡和蛋的问题。 

为了防止发生CSRF攻击，必须读取HTTP请求的正文以获得实际的CSRF令牌。 

但是，读取正文表示文件将被上传，这意味着外部站点可以上传文件。

将CSRF保护与 `multipart/form-data` 一起使用有两种选择。 

每个选项都有其取舍。

- 将CSRF令牌放入 body

- 将CSRF令牌放入URL

在将Spring Security的CSRF保护与分段文件上传集成之前，请确保您可以先上传而无需CSRF保护。 

- 将CSRF令牌放入 body

第一种选择是在请求正文中包含实际的CSRF令牌。通过将CSRF令牌放入正文中，将在执行授权之前读取正文。这意味着任何人都可以在您的服务器上放置临时文件。

但是，只有授权用户才能提交由您的应用程序处理的文件。

通常，这是推荐的方法，因为临时文件上传对大多数服务器的影响可以忽略不计。

- 在网址中包含CSRF令牌

如果不允许未经授权的用户上传临时文件，则可以选择将预期的CSRF令牌作为查询参数包括在表单的action属性中。

这种方法的缺点是查询参数可能会泄漏。

更一般而言，将敏感数据放置在正文或标题中以确保不泄漏是最佳实践。

- HiddenHttpMethodFilter

在某些应用程序中，可以使用form参数来覆盖HTTP方法。

例如，下面的 form 可用于将HTTP方法视为删除而不是 post。

```html
<form action="/process"
    method="post">
    <!-- ... -->
    <input type="hidden"
        name="_method"
        value="delete"/>
</form>
```

覆盖HTTP方法在过滤器中进行。 该过滤器必须放在Spring Security支持之前。 

请注意，覆盖仅发生在帖子上，因此实际上不太可能引起任何实际问题。 

但是，仍然最好的方法是确保将其放置在Spring Security的过滤器之前。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}