---
layout: post
title: Shiro-03-5 分钟入门 shiro 安全框架实战笔记
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 序言

大家好，我是老马。

前面我们学习了 [web 安全之 Spring Security 入门教程](https://www.toutiao.com/a6884852647480787459)

这次我们来一起学习下另一款 java 安全框架 shiro。

# 什么是Apache Shiro？

Apache Shiro是一个功能强大且易于使用的Java安全框架，它为开发人员提供了一种直观而全面的解决方案，用于身份验证，授权，加密和会话管理。

实际上，它可以管理应用程序安全性的所有方面，同时尽可能避免干扰。它建立在可靠的界面驱动设计和OO原则的基础上，可在您可以想象的任何地方实现自定义行为。

但是，只要对所有内容都使用合理的默认值，就可以像应用程序安全性一样“轻松”。至少这就是我们所追求的。

## Apache Shiro可以做什么？

很多，但是我们不想夸大快速入门。

如果您想了解其功能，请查看我们的功能页面。另外，如果您对我们的起步方式以及我们为什么存在感到好奇，请参阅Shiro历史和任务页面。

好。现在让我们实际做些事情！

Shiro可以在任何环境中运行，从最简单的命令行应用程序到最大的企业Web和集群应用程序，但是对于此QuickStart，我们将在简单的`main`方法中使用最简单的示例，以便您对 API 有点感觉。

# 快速开始

官方的例子是让下载源文件，老马是直接从 github 下载的 mater 源码。

我们把核心的地方直接贴出来即可。

## maven 依赖

最基础的 shiro 演示，只需要引入下面的依赖即可。

```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-core</artifactId>
    <version>1.2.2</version>
</dependency>
```

## 入门例子

内容看起来很多，主要是因为有很多注释，实际上还是比较简单的。

```java
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.*;
import org.apache.shiro.config.IniSecurityManagerFactory;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.Factory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Simple Quickstart application showing how to use Shiro's API.
 *
 * @since 0.9 RC2
 */
public class Quickstart {

    private static final transient Logger log = LoggerFactory.getLogger(Quickstart.class);


    public static void main(String[] args) {

        // The easiest way to create a Shiro SecurityManager with configured
        // realms, users, roles and permissions is to use the simple INI config.
        // We'll do that by using a factory that can ingest a .ini file and
        // return a SecurityManager instance:

        // Use the shiro.ini file at the root of the classpath
        // (file: and url: prefixes load from files and urls respectively):
        Factory<SecurityManager> factory = new IniSecurityManagerFactory("classpath:shiro.ini");
        SecurityManager securityManager = factory.getInstance();

        // for this simple example quickstart, make the SecurityManager
        // accessible as a JVM singleton.  Most applications wouldn't do this
        // and instead rely on their container configuration or web.xml for
        // webapps.  That is outside the scope of this simple quickstart, so
        // we'll just do the bare minimum so you can continue to get a feel
        // for things.
        SecurityUtils.setSecurityManager(securityManager);

        // Now that a simple Shiro environment is set up, let's see what you can do:

        // get the currently executing user:
        Subject currentUser = SecurityUtils.getSubject();

        // Do some stuff with a Session (no need for a web or EJB container!!!)
        Session session = currentUser.getSession();
        session.setAttribute("someKey", "aValue");
        String value = (String) session.getAttribute("someKey");
        if (value.equals("aValue")) {
            log.info("Retrieved the correct value! [" + value + "]");
        }

        // let's login the current user so we can check against roles and permissions:
        if (!currentUser.isAuthenticated()) {
            UsernamePasswordToken token = new UsernamePasswordToken("lonestarr", "vespa");
            token.setRememberMe(true);
            try {
                currentUser.login(token);
            } catch (UnknownAccountException uae) {
                log.info("There is no user with username of " + token.getPrincipal());
            } catch (IncorrectCredentialsException ice) {
                log.info("Password for account " + token.getPrincipal() + " was incorrect!");
            } catch (LockedAccountException lae) {
                log.info("The account for username " + token.getPrincipal() + " is locked.  " +
                        "Please contact your administrator to unlock it.");
            }
            // ... catch more exceptions here (maybe custom ones specific to your application?
            catch (AuthenticationException ae) {
                //unexpected condition?  error?
            }
        }

        //say who they are:
        //print their identifying principal (in this case, a username):
        log.info("User [" + currentUser.getPrincipal() + "] logged in successfully.");

        //test a role:
        if (currentUser.hasRole("schwartz")) {
            log.info("May the Schwartz be with you!");
        } else {
            log.info("Hello, mere mortal.");
        }

        //test a typed permission (not instance-level)
        if (currentUser.isPermitted("lightsaber:wield")) {
            log.info("You may use a lightsaber ring.  Use it wisely.");
        } else {
            log.info("Sorry, lightsaber rings are for schwartz masters only.");
        }

        //a (very powerful) Instance Level permission:
        if (currentUser.isPermitted("winnebago:drive:eagle5")) {
            log.info("You are permitted to 'drive' the winnebago with license plate (id) 'eagle5'.  " +
                    "Here are the keys - have fun!");
        } else {
            log.info("Sorry, you aren't allowed to drive the 'eagle5' winnebago!");
        }

        //all done - log out!
        currentUser.logout();

        System.exit(0);
    }
}
```

# 代码分析

下面我们针对这段代码做一下简单的分析。

## 构建安全管理器

核心代码如下：

```java
Factory<SecurityManager> factory = new IniSecurityManagerFactory("classpath:shiro.ini");
SecurityManager securityManager = factory.getInstance();
```

实际上就是通过 `shiro.ini` 文件中的配置，来创建一个 SecurityManager 实例。

然后通过 `SecurityUtils.setSecurityManager(securityManager);` 设置对应的安全管理器。

`shiro.ini` 的内容如下：

```ini
[users]
# user 'root' with password 'secret' and the 'admin' role
root = secret, admin
# user 'guest' with the password 'guest' and the 'guest' role
guest = guest, guest
# user 'presidentskroob' with password '12345' ("That's the same combination on
# my luggage!!!" ;)), and role 'president'
presidentskroob = 12345, president
# user 'darkhelmet' with password 'ludicrousspeed' and roles 'darklord' and 'schwartz'
darkhelmet = ludicrousspeed, darklord, schwartz
# user 'lonestarr' with password 'vespa' and roles 'goodguy' and 'schwartz'
lonestarr = vespa, goodguy, schwartz

# -----------------------------------------------------------------------------
# Roles with assigned permissions
# 
# Each line conforms to the format defined in the
# org.apache.shiro.realm.text.TextConfigurationRealm#setRoleDefinitions JavaDoc
# -----------------------------------------------------------------------------
[roles]
# 'admin' role has all permissions, indicated by the wildcard '*'
admin = *
# The 'schwartz' role can do anything (*) with any lightsaber:
schwartz = lightsaber:*
# The 'goodguy' role is allowed to 'drive' (action) the winnebago (type) with
# license plate 'eagle5' (instance specific id)
goodguy = winnebago:drive:eagle5
```

## 当前主题

主题是一个相对更大的概念，我们也可以简单的理解为当前用户。

```java
Subject currentUser = SecurityUtils.getSubject();
```

这个工具方法，实际上是通过 ThreadLocal 维护了当前的用户信息，如果不存在，会创建默认的主题信息。

当获取到当前用户之后，我们就可以进行相关的操作了。

## session 操作

写过 web 的同学对 HttpSession 肯定非常熟悉。

shiro 设计非常巧妙的一点，就是有一套独立的 session API，让 session 的管理脱离 web 也可以使用，这是非常棒的设计。

```java
Session session = currentUser.getSession();
session.setAttribute("someKey", "aValue");
String value = (String) session.getAttribute("someKey");
if (value.equals("aValue")) {
    log.info("Retrieved the correct value! [" + value + "]");
}
```

我们设置对应的值，并且取出来进行判断。

此时日志也会输出：

```
2020-12-27 18:59:47,288 INFO [Quickstart] - Retrieved the correct value! [aValue]
```

## 用户登录

我们在设计 web 应用的时候，最关心的肯定还是用户的角色权限等信息。

我们前面的 currentUser 就代表这当前的用户，当然默认用户实际上是匿名的。

需要我们进行一次登录：

```java
if (!currentUser.isAuthenticated()) {
    UsernamePasswordToken token = new UsernamePasswordToken("lonestarr", "vespa");
    token.setRememberMe(true);
    try {
        currentUser.login(token);
    } catch (UnknownAccountException uae) {
        // 省略后续的各种异常
    }
}
```

这个登录的账户密码，是前面我们配置在 shiro.ini 文件中的：

```ini
# user 'lonestarr' with password 'vespa' and roles 'goodguy' and 'schwartz'
lonestarr = vespa, goodguy, schwartz
```

当然，这里的 shiro 提供的异常是非常详细的，这可以方便我们更好的定位问题。

但是当用户登录的时候，我们提示应该避免这么详细，为什么呢？

主要是避免有用户恶意撞库，提示一般都是【用户名或者密码错误】。不让恶意用户知道对应的用户名信息。

登录成功之后，可以输出对应的用户名信息：

```java
log.info("User [" + currentUser.getPrincipal() + "] logged in successfully.");
```

对应的日志如下：

```
2020-12-27 18:59:47,289 INFO [Quickstart] - User [lonestarr] logged in successfully. 
```

## 权限校验

用户成功登陆之后，我们就可以获取到用户 `lonestarr` 对应的角色 goodguy 和 schwartz。

这样，就可以判断当前用户是否有具体的权限，比如菜单权限，操作权限等。这也是我们一般最常用的功能。

### 测试角色

测试当前用户是否拥有指定的角色：

```java
if (currentUser.hasRole("schwartz")) {
    log.info("May the Schwartz be with you!");
} else {
    log.info("Hello, mere mortal.");
}
```

日志如下：

```
2020-12-27 18:59:47,290 INFO [Quickstart] - May the Schwartz be with you!
```

### 测试权限

测试当前用户是否拥有指定的权限：

```java
if (currentUser.isPermitted("lightsaber:wield")) {
    log.info("You may use a lightsaber ring.  Use it wisely.");
} else {
    log.info("Sorry, lightsaber rings are for schwartz masters only.");
}
```

我们在 shiro.ini 中配置了对应的操作权限：

```ini
# The 'schwartz' role can do anything (*) with any lightsaber:
schwartz = lightsaber:*
```

所以可以针对 lightsaber 为所欲为~


日志如下：

```
2020-12-27 18:59:47,290 INFO [Quickstart] - You may use a lightsaber ring.  Use it wisely.
```

另外一个方法也是类似的，此处不再赘述。

## 用户登出

当我们全部操作完成以后，可以执行用户的登出操作。

```java
//all done - log out!
currentUser.logout();
```

# 小结

shiro 设计的非常简洁，功能也非常的强大，可以满足我们大部分权限开发功能。

个人感觉这个框架肯定是有多年登录经验的大佬设计的，api 和背后的理念非常值得学习。

当然这里作为入门的例子，整体比较简单。我们日常开发一般都是使用数据库进行账户信息持久化，密码也会进行对应的加密处理。

这些 shiro 都已经考虑到了，我们后续会进行讲解。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

* any list
{:toc}

 
