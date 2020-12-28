---
layout: post
title: Shiro-04-Authentication 身份验证
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---


# Authentication(身份验证)

身份验证是身份验证的过程-也就是说，证明用户实际上就是他们所说的真实身份。 

为了使用户证明自己的身份，他们需要提供一些标识信息以及系统可以理解和信任的那种身份证明。

这是通过向Shiro提交用户的主体和凭据来完成的，以查看它们是否与应用程序期望的匹配。

## Principals

Principals 是主题的“识别属性”。 

Principals 可以是可以识别主题的任何东西，例如名字（姓氏），姓氏（姓氏或姓氏），用户名，社会保险号等。

当然，诸如姓氏之类的东西并不擅长唯一地标识主题，因此用于身份验证的最佳主体对于应用程序是唯一的-通常是用户名或电子邮件地址。

### 主要主体

尽管Shiro可以代表任意数量的主体，但Shiro希望应用程序具有一个“主要”主体-一个唯一标识应用程序中“主题”的值。 

在大多数应用程序中，这通常是用户名，电子邮件地址或全局唯一的用户ID。

## Credentials（凭证）

凭证通常是仅由主体知道的秘密值，用作其实际上“拥有”所主张身份的佐证。 

凭据的一些常见示例是密码，生物特征数据（例如指纹和视网膜扫描）以及X.509证书。

主体/凭证配对的最常见示例是用户名和密码。 

用户名是声明的身份，密码是与声明的身份匹配的证明。 

如果提交的密码与应用程序期望的密码匹配，则该应用程序可以在很大程度上假定用户确实是他们所说的那个人，因为没有其他人应该知道相同的密码。

# 验证主题

验证主题的过程可以有效地分为三个不同的步骤：

1. 收集主题提交的主体和证书

2. 提交主体和凭据以进行身份验证。

3. 如果提交成功，则允许访问，否则重试身份验证或阻止访问。

以下代码演示了Shiro的API如何反映这些步骤：

## 第一步：收集主题提交的主体和证书

```java
//Example using most common scenario of username/password pair:
UsernamePasswordToken token = new UsernamePasswordToken(username, password);

//"Remember Me" built-in: 
token.setRememberMe(true);
```

在这种情况下，我们使用的是UsernamePasswordToken，它支持最常用的用户名/密码身份验证方法。这是Shiro的org.apache.shiro.authc.AuthenticationToken接口的实现，该接口是Shiro身份验证系统用来表示提交的主体和凭据的基本接口。

在这里需要注意的重要一点是Shiro不在乎您如何获取此信息：数据可能是由提交HTML表单的用户获取的，或者是从HTTP标头中检索的，或者是从Swing或Flex中读取的GUI密码形式，或通过命令行参数。从应用程序最终用户收集信息的过程与Shiro的AuthenticationToken概念完全脱钩。

您可以随意构造和表示AuthenticationToken实例-它与协议无关。

此示例还表明，我们已表明我们希望Shiro为身份验证尝试执行“记住我”服务。这样可以确保Shiro能够在以后返回应用程序时记住用户身份。我们将在下一章介绍“记住我”服务。

## 步骤2：提交主体和凭据

在收集了主体和凭据并将其表示为AuthenticationToken实例之后，我们需要将该令牌提交给Shiro来执行实际的身份验证尝试：

```java
Subject currentUser = SecurityUtils.getSubject();

currentUser.login(token);
```

在获取当前正在执行的Subject之后，我们进行一次登录调用，传入我们之前创建的AuthenticationToken实例。

对登录方法的调用有效地表示身份验证尝试。

## 步骤3：处理成功或失败

如果登录方法悄悄返回，就可以了-我们完成了！ 主题已通过身份验证。

应用程序线程可以不间断地继续运行，对 SecurityUtils.getSubject() 的所有其他调用将返回经过身份验证的Subject实例，以及对subject的任何调用。 isAuthenticated() 将返回true。

但是，如果登录尝试失败怎么办？ 

例如，如果最终用户提供了错误的密码，或者访问了系统太多次并且可能他们的帐户被锁定了怎么办？

Shiro具有丰富的运行时AuthenticationException层次结构，可以准确说明尝试失败的原因。 

您可以将登录信息包装在try/catch块中，并捕获所需的任何异常并对它们做出相应的反应。 

例如：

```java
try {
    currentUser.login(token);
} catch ( UnknownAccountException uae ) { ...
} catch ( IncorrectCredentialsException ice ) { ...
} catch ( LockedAccountException lae ) { ...
} catch ( ExcessiveAttemptsException eae ) { ...
} ... catch your own ...
} catch ( AuthenticationException ae ) {
    //unexpected error?
}

//No problems, continue on as expected...
```

如果现有的异常类之一不能满足您的需求，则可以创建自定义AuthenticationExceptions来表示特定的故障情况。

### 登录失败提示

尽管您的代码可以对特定的异常做出反应并在必要时执行逻辑，但是安全性最佳做法是仅在发生失败时向最终用户显示通用失败消息，例如“用户名或密码错误”。 

这样可确保没有任何特定信息可供尝试攻击媒介的黑客使用。

# 记住与已认证

如上例所示，除了正常的登录过程之外，Shiro还支持“记住我”的概念。

值得指出的是，此时，Shiro在记住的主题和经过身份验证的实际主题之间做出了非常精确的区分：

## Remembered（记住）

记住的主题不是匿名的，并且具有已知的身份（即subject.getPrincipals() 是非空的）。 

但是，在先前的会话期间，通过先前的身份验证会记住此身份。 

如果 subject.isRemembered() 返回true，则认为该主题已被记住。

## Authenticated（已验证）

已验证的主题是在主题当前会话期间已成功验证（即，调用登录方法而未引发异常）的主题。 

如果 subject.isAuthenticated() 返回true，则认为该主题已通过身份验证。

## 为什么要区分？

“认证”一词具有非常强烈的证明含义。也就是说，可以预期地确保对象证明了自己是谁。

当仅通过与应用程序的先前交互来记住用户时，证明状态将不复存在：记住的身份使系统知道该用户可能是谁，但实际上，它无法绝对保证是否记住了该主题代表预期的用户。主题通过身份验证后，就不再认为它们仅被记住，因为它们的身份在当前会话中已经过验证。

因此，尽管应用程序的许多部分仍可以基于记住的原则（例如自定义视图）执行特定于用户的逻辑，但通常不应执行高度敏感的操作，直到用户通过执行成功的身份验证尝试合法地验证了其身份。

例如，检查主体是否可以访问财务信息的检查应几乎始终依赖于isAuthenticated()而不是isRemembered()，以保证期望的身份和经过验证的身份。

## 一个说明性的例子

以下是一个相当常见的场景，有助于说明为什么记住和已认证之间的区别很重要。

假设您正在使用Amazon.com。您已成功登录，并已在购物车中添加了几本书。但是您必须参加会议，但忘记注销。会议结束时，该回家了，您离开办公室了。

第二天上班时，您发现自己还没有完成购买，因此回到amazon.com。这次，亚马逊“记住”您的身份，以名字向您打招呼，并仍然为您提供一些个性化的书本推荐。对于Amazon，subject.isRemembered（）将返回true。

但是，如果您尝试访问帐户以更新信用卡信息以购买图书，会发生什么情况？当亚马逊“记住”您（isRemembered（）== true）时，它不能保证您实际上是您（例如，某个同事正在使用您的计算机）。

因此，在执行敏感操作（如更新信用卡信息）之前，亚马逊会强迫您登录，以便他们保证您的身份。登录后，您的身份已经过验证，并已登录到Amazon，isAuthenticated（）现在为true。

这种情况在许多类型的应用程序中经常发生，因此该功能内置于Shiro中，因此您可以将其用于自己的应用程序。现在，是否使用isRemembered（）或isAuthenticated（）自定义视图和工作流已由您决定，但是Shiro将保留此基本状态，以备不时之需。


# 注销

认证的相反是释放所有已知的识别状态。 

当主题与应用程序完成交互后，可以调用subject.logout（）放弃所有标识信息：

```java
//all done - log out!
currentUser.logout();
```

当您调用注销时，任何现有的会话都将无效，并且任何身份都将被取消关联（例如，在网络应用中，RememberMe cookie也将被删除）。

主题注销后，再次将Subject实例视为匿名，并且除Web应用程序外，可以根据需要重新用于登录。

## Web应用公告

由于Web应用程序中记住的身份通常与cookie保持在一起，并且cookie只能在提交响应主体之前删除，因此强烈建议在调用subject.logout（）之后立即将最终用户重定向到新视图或页面。 

这样可以保证所有与安全性有关的cookie都可以按预期删除。 

这是HTTP cookie的功能限制，而不是Shiro的限制。

# 认证流程

到目前为止，我们仅研究了如何从应用程序代码中对主题进行身份验证。 

现在，我们将介绍发生身份验证尝试时Shiro内部发生的情况。

我们从“架构”一章中获取了之前的架构图，仅突出显示了与身份验证相关的组件。 

![步骤](http://shiro.apache.org/assets/images/ShiroAuthenticationSequence.png)

##  步骤

每个数字代表身份验证尝试中的步骤：

步骤1：应用程序代码调用Subject.login方法，传入代表最终用户的主体和凭据的AuthenticationToken实例。

步骤2：Subject实例（通常是DelegatingSubject（或子类））通过调用securityManager.login（token）委托应用程序的SecurityManager，在此开始实际的身份验证工作。

步骤3：作为基本的“伞”组件，SecurityManager接收令牌，并通过调用authenticator.authenticate（token）简单地委派给其内部Authenticator实例。这几乎总是一个ModularRealmAuthenticator实例，该实例支持在身份验证期间协​​调一个或多个Realm实例。 ModularRealmAuthenticator本质上为Apache Shiro（其中每个Realm在PAM术语中是一个“模块”）提供了PAM风格的范例。

步骤4：如果为该应用程序配置了多个Realm，则ModularRealmAuthenticator实例将利用其配置的AuthenticationStrategy发起多域身份验证尝试。在调用领域进行身份验证之前，期间和之后，将调用AuthenticationStrategy以使其对每个领域的结果做出反应。我们将很快介绍AuthenticationStrategies。

- 单领域应用

如果仅配置一个Realm，则将直接调用它-在单个Realm应用程序中不需要AuthenticationStrategy。

步骤5：咨询每个已配置的Realm，以查看其是否支持提交的AuthenticationToken。 

如果是这样，将使用提交的令牌调用支持领域的getAuthenticationInfo方法。 

getAuthenticationInfo方法有效地表示对该特定领域的单个身份验证尝试。 

我们将很快介绍Realm身份验证行为。

## 源码

上述步骤看起来很多，实际上看源码的话也比较简单。

```java
//1. 调用 login 方法
currentUser.login(token);
```

实际上调用的是下面的方法：

```java
Subject subject = securityManager.login(this, token);
```

这里就是我们的安全管理器，调用的是对应的 

```java
this.authenticator.authenticate(token)
```

接下来我们一起看一下 authenticator 的实现原理。

## Authenticator（认证者）

如前所述，Shiro SecurityManager实现默认使用ModularRealmAuthenticator实例。 

ModularRealmAuthenticator同样支持具有单个Realm和具有多个Realm的应用程序。

在单领域应用程序中，ModularRealmAuthenticator将直接调用单个Realm。 

如果配置了两个或更多领域，它将使用AuthenticationStrategy实例来协调尝试的发生方式。 

我们将在下面介绍AuthenticationStrategies。

如果要使用自定义的Authenticator实现配置SecurityManager，则可以在shiro.ini中进行配置，例如：

```ini
[main]
...
authenticator = com.foo.bar.CustomAuthenticator

securityManager.authenticator = $authenticator
```

通常，`ModularRealmAuthenticator` 就可以满足大部分的需求场景。

## AuthenticationStrategy（认证策略）

当为一个应用程序配置两个或多个领域时，ModularRealmAuthenticator依赖于内部AuthenticationStrategy组件来确定认证尝试成功或失败的条件。

例如，如果只有一个Realm成功地对AuthenticationToken进行身份验证，而所有其他Realm都失败了，那么该身份验证尝试是否被视为成功？

还是必须所有领域都成功进行身份验证，才能将整体尝试视为成功？

或者，如果某个领域成功通过身份验证，是否有必要进一步咨询其他领域？ 

AuthenticationStrategy根据应用程序的需求做出适当的决定。

AuthenticationStrategy是无状态组件，在尝试进行身份验证时会被查询4次（这4种交互所需的任何必要状态都将作为方法参数给出）：

- 在任何领域被调用之前

- 在调用单个Realm的getAuthenticationInfo方法之前

- 在调用单个领域的getAuthenticationInfo方法之后

- 在所有领域都被调用之后

AuthenticationStrategy还负责汇总每个成功Realm的结果，并将它们“捆绑”成单个AuthenticationInfo表示形式。

这个最终的AuthenticationInfo实例集合是Authenticator实例返回的结果，也是Shiro用来表示主体的最终身份（也称为委托人）的东西。

### 主体身份“视图”

如果您在应用程序中使用多个Realm来从多个数据源获取帐户数据，则AuthenticationStrategy最终负责应用程序看到的主体身份的最终“合并”视图。

### 内置策略

- AtLeastOneSuccessfulStrategy

如果一个（或多个）领域成功认证，则整个尝试都被视为成功。 如果没有成功进行身份验证，则尝试将失败。

- FirstSuccessfulStrategy

仅使用从第一个成功通过身份验证的领域返回的信息。 所有其他领域将被忽略。 如果没有成功通过身份验证，则尝试将失败。

- AllSuccessfulStrategy

所有配置的领域都必须成功进行身份验证，才能将整体尝试视为成功。 如果任何人未成功通过身份验证，则尝试将失败。

ModularRealmAuthenticator默认为AtLeastOneSuccessfulStrategy实现，因为这是最常用的策略。 

但是，您可以根据需要配置其他策略：

```ini
[main]
...
authcStrategy = org.apache.shiro.authc.pam.FirstSuccessfulStrategy

securityManager.authenticator.authenticationStrategy = $authcStrategy
```

### 自定义策略

如果您想自己创建自己的AuthenticationStrategy实现，可以使用org.apache.shiro.authc.pam.AbstractAuthenticationStrategy作为起点。

AbstractAuthenticationStrategy类自动实现将每个Realm的结果合并到单个AuthenticationInfo实例中的“捆绑”/聚合行为。

## 领域认证顺序

必须指出，ModularRealmAuthenticator将以迭代顺序与Realm实例进行交互。

ModularRealmAuthenticator可以访问在SecurityManager上配置的Realm实例。 

执行身份验证尝试时，它将遍历该集合，对于支持提交的AuthenticationToken的每个Realm，调用Realm的getAuthenticationInfo方法。

### 隐式排序

使用Shiro的INI配置格式时，您应该按照希望它们处理AuthenticationToken的顺序来配置Realms。 

例如，在shiro.ini中，将按照在INI文件中定义的顺序查询领域。 也就是说，对于以下shiro.ini示例：

```ini
blahRealm = com.company.blah.Realm
...
fooRealm = com.company.foo.Realm
...
barRealm = com.company.another.Realm
```

SecurityManager将使用这三个领域进行配置，并且在进行身份验证尝试期间，将按该顺序调用blahRealm，fooRealm和barRealm。

与定义以下行基本上具有相同的效果：

```ini
securityManager.realms = $blahRealm, $fooRealm, $barRealm
```

使用这种方法，您无需设置securityManager的领域属性-定义的每个领域都会自动添加到领域属性中。

### 显式排序

如果您想显式定义领域交互的顺序，无论它们如何定义，都可以将securityManager的领域属性设置为显式集合属性。

例如，如果使用上面的定义，但是您希望最后查询blahRealm而不是首先查询：

```ini
blahRealm = com.company.blah.Realm
...
fooRealm = com.company.foo.Realm
...
barRealm = com.company.another.Realm

securityManager.realms = $fooRealm, $barRealm, $blahRealm
```

- 明确领域包含

当您显式配置securityManager.realms属性时，将在SecurityManager上仅配置引用的领域。

这意味着您可以在INI中定义5个领域，但是如果realms属性引用了3个，则只能实际使用3个领域。

这与将使用所有可用领域的隐式领域排序不同。

# 领域认证

本章介绍了Shiro的主工作流程，解释了如何进行身份验证尝试。在“领域”一章的“领域身份验证”部分中介绍了在身份验证过程中进行咨询（即上述“第5步”）时在单个领域中发生的内部工作流程。

> [http://shiro.apache.org/realm.html#Realm-authentication](http://shiro.apache.org/realm.html#Realm-authentication)

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

* any list
{:toc}

 
