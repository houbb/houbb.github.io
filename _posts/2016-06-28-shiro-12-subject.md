---
layout: post
title: Shiro-12-subject 主体
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 理解Apache Shiro中的主题

毫无疑问，Apache Shiro中最重要的概念是主题。

“主题”只是一个安全术语，它指的是应用程序用户特定于安全的“视图”。Shiro主题实例代表了单个应用程序用户的安全状态和操作。

这些操作包括:

- 身份验证(登录)

- 授权(访问控制)

- 会话的访问

- 注销

我们最初想叫它“用户”，因为这“很有意义”，但我们决定不叫它:太多的应用程序已经有了它们自己的用户类/框架的api，我们不想与它们冲突。

此外，在安全领域，术语“主体”实际上是公认的命名法。

Shiro的API鼓励应用程序采用**以主题为中心**的编程范式。

在编写应用程序逻辑时，大多数应用程序开发人员都想知道当前执行的用户是谁。

虽然应用程序通常可以通过自己的机制(UserService，等等)查找任何用户，但当涉及到安全性时，最重要的问题是“当前用户是谁?”

虽然任何主题都可以通过使用SecurityManager获得，但**仅基于当前用户/主题的应用程序代码更加自然和直观**。

# 当前正在执行的主体

在几乎所有的环境中，你都可以通过使用 `org.apache.shiro.SecurityUtils` 来获取当前正在执行的主题:

```java
Subject currentUser = SecurityUtils.getSubject();
```

在独立的应用程序中，getSubject()调用可能会根据应用程序特定位置的用户数据返回一个主题，而在服务器环境(例如web应用程序)中，它会根据与当前线程或传入请求相关联的用户数据获取主题。

在你学习了现在的课程之后，你能做些什么呢?

如果你想让用户在他们当前的会话中使用这些东西，你可以得到他们的会话:

```java
Session session = currentUser.getSession();
session.setAttribute( "someKey", "aValue" );
```

Session是一个特定于shiro的实例，它提供了常规httpsession所使用的大部分功能，但也有一些额外的好处和一个很大的区别:它不需要HTTP环境!

如果在web应用程序中部署，默认情况下会话将是基于HttpSession的。但是，

在一个非web环境中，比如这个简单的快速入门，Shiro默认情况下会自动使用它的企业会话管理。这意味着无论部署环境如何，您都可以在应用程序的任何层中使用相同的API。这打开了一个全新的应用程序世界，因为任何需要会话的应用程序都不需要强制使用HttpSession或EJB有状态会话bean。而且，任何客户机技术现在都可以共享会话数据。

所以现在你可以获得一个对象和他们的会话。那么真正有用的东西呢，比如检查它们是否被允许做一些事情，比如检查角色和权限?

## 登陆验证

我们只能对已知的用户做这些检查。上面的Subject实例表示当前用户，但是谁是当前用户呢?嗯，他们是匿名的——也就是说，直到他们至少登录一次。

那么，让我们这样做:

```java
if ( !currentUser.isAuthenticated() ) {
    //collect user principals and credentials in a gui specific manner
    //such as username/password html form, X509 certificate, OpenID, etc.
    //We'll use the username/password example here since it is the most common.
    //(do you know what movie this is from? ;)
    UsernamePasswordToken token = new UsernamePasswordToken("lonestarr", "vespa");
    //this is all you have to do to support 'remember me' (no config - built in!):
    token.setRememberMe(true);
    currentUser.login(token);
}
```

就是这样!再简单不过了。

但是，如果他们的登录尝试失败怎么办?你可以捕捉各种特定的异常，告诉你到底发生了什么:

```java
try {
    currentUser.login( token );
    //if no exception, that's it, we're done!
} catch ( UnknownAccountException uae ) {
    //username wasn't in the system, show them an error message?
} catch ( IncorrectCredentialsException ice ) {
    //password didn't match, try again?
} catch ( LockedAccountException lae ) {
    //account for that username is locked - can't login.  Show them a message?
}
    ... more types exceptions to check if you want ...
} catch ( AuthenticationException ae ) {
    //unexpected condition - error?
}
```

作为应用程序/GUI开发人员，您可以选择是否根据异常显示最终用户消息(例如，“系统中没有具有该用户名的帐户”)。

有许多不同类型的异常你可以检查，或者抛出你自己的Shiro可能无法解释的自定义条件。

更多信息请参阅AuthenticationException JavaDoc。

现在，我们有了一个登录用户。

## 权限校验

我们还能做什么?

让我们说说他们是谁:

```java
//print their identifying principal (in this case, a username): 
log.info( "User [" + currentUser.getPrincipal() + "] logged in successfully." );
```

我们也可以测试他们是否有特定的角色:

```java
if ( currentUser.hasRole( "schwartz" ) ) {
    log.info("May the Schwartz be with you!" );
} else {
    log.info( "Hello, mere mortal." );
}
```

是否拥有权限：

```java
if ( currentUser.isPermitted( "lightsaber:weild" ) ) {
    log.info("You may use a lightsaber ring.  Use it wisely.");
} else {
    log.info("Sorry, lightsaber rings are for schwartz masters only.");
}
```

此外，我们还可以执行非常强大的实例级权限检查——查看用户是否有能力访问特定类型的实例的能力:

```java
if ( currentUser.isPermitted( "winnebago:drive:eagle5" ) ) {
    log.info("You are permitted to 'drive' the 'winnebago' with license plate (id) 'eagle5'.  " +
                "Here are the keys - have fun!");
} else {
    log.info("Sorry, you aren't allowed to drive the 'eagle5' winnebago!");
}
```

最后，登陆的用户也可以登出：

```java
currentUser.logout(); //removes all identifying information and invalidates their session too.
```

# 自定义对象实例

Shiro 1.0中添加的一个新特性是能够构造定制/特别的主题实例，以在特殊情况下使用。

- 特别的只使用!

你应该总是通过调用SecurityUtils.getSubject()来获取当前正在执行的主题;只有在特殊情况下才能创建自定义主题实例。

## 特殊场景

一些“特殊情况”会很有用:

（1）系统启动/引导-当没有用户与系统交互，但代码应该作为“系统”或守护用户执行。创建代表特定用户的主题实例是可取的，这样引导代码就可以作为该用户(例如，作为管理用户)执行。

（2）鼓励这种做法，因为它确保实用程序/系统代码以与普通用户相同的方式执行，确保代码是一致的。这使得代码更容易维护，因为您不必为系统/守护进程场景担心定制代码块。

（3）集成测试——您可能希望根据需要创建用于集成测试的主题实例。有关更多信息，请参阅测试文档。

守护进程/后台进程工作——当守护进程或后台进程执行时，它可能需要作为特定的用户执行。

如果您已经拥有了对Subject实例的访问权，并且希望它对其他线程可用，那么您应该使用 `Subject.associateWith*` 方法，而不是创建一个新的Subject实例。

好了，假设你仍然需要创建自定义的subject实例，让我们看看怎么做:

## Subject.Builder

这个 Subject 提供了Builder类来轻松构建主题实例，而不需要知道构造细节。

构建器最简单的用法是构造一个匿名的、无会话的Subject实例:

```java
Subject subject = new Subject.Builder().buildSubject()
```

上面显示的默认无参数的Subject.Builder()构造函数将通过 `SecurityUtils.getSecurityManager()` 方法使用应用程序当前可访问的SecurityManager。

如果需要，你也可以指定SecurityManager实例来由额外的构造函数使用:

```java
SecurityManager securityManager = //acquired from somewhere 
Subject subject = new Subject.Builder(securityManager).buildSubject();
```

所有其他 Subject.Builder 方法可以在buildSubject()方法之前调用，以提供关于如何构造Subject实例的上下文。

例如，如果你有一个会话ID，想要获得“拥有”该会话的主题(假设会话存在并且没有过期):

```java
Serializable sessionId = //acquired from somewhere 
Subject subject = new Subject.Builder().sessionId(sessionId).buildSubject();
```

类似地，如果你想创建一个反映特定身份的Subject实例:

```java
Object userIdentity = //a long ID or String username, or whatever the "myRealm" requires 
String realmName = "myRealm";
PrincipalCollection principals = new SimplePrincipalCollection(userIdentity, realmName);
Subject subject = new Subject.Builder().principals(principals).buildSubject();
```

然后，您可以使用构建的Subject实例，并按照预期对其进行调用。

但注意:

构建的Subject实例不会自动绑定到应用程序(线程)以供进一步使用。

如果希望任何调用 `SecurityUtils.getSubject()` 的代码都可以使用它，则必须确保一个线程与所构造的主题相关联。

# 线程关联

如上所述，仅仅构建一个Subject实例并不会将它与线程相关联——如果在线程执行期间要使任何对 `SecurityUtils.getSubject()` 的调用正常工作，这通常是一个要求。

有三种方法可以确保线程与Subject相关联:

（1）自动关联——通过主题执行的可调用或可运行 `Subject.execute*` 方法将在可调用/可运行的执行之前和之后自动绑定和解绑定Subject到线程。

（2）手动关联—手动绑定和解绑定Subject实例到当前执行的线程。这通常对框架开发人员很有用。

（3）不同的线程——一个可调用对象或可运行对象通过调用 `Subject.associateWith*` 方法相关联，然后返回的可调用对象/可运行对象由另一个线程执行。如果您需要在作为主题的另一个线程上执行工作，这是首选的方法。

关于线程关联需要知道的重要事情是，有两件事必须总是发生:

1. Subject被绑定到线程，因此在线程执行的所有点都可以使用它。Shiro通过它的ThreadState机制来实现这一点，该机制是ThreadLocal之上的一个抽象。

2. 即使线程执行会导致错误，主题也会在稍后的某个时间点解除绑定。这确保线程在池/可重用线程环境中保持干净和清除任何先前的主题状态。

这些原则保证在上面列出的3种机制中发生。下面将详细说明它们的用法。

## 自动关联

如果您只需要一个主题暂时与当前线程相关联，并且您希望线程绑定和清理自动发生，那么使用Subject直接执行Callable或Runnable是可行的方法。

在 Subject.execute 调用返回时，当前线程保证处于与执行前相同的状态。这种机制是三种机制中应用最广泛的一种。

例如，假设在系统启动时需要执行一些逻辑。您希望作为特定用户执行一段代码，但是一旦逻辑完成，您希望确保线程/环境自动恢复正常。

你可以执行 `Subject.execute*` 方法:

```java
Subject subject = //build or acquire subject 
subject.execute( new Runnable() {
    public void run() {
        //subject is 'bound' to the current thread now
        //any SecurityUtils.getSubject() calls in any
        //code called from here will work
    }
});
//At this point, the Subject is no longer associated 
//with the current thread and everything is as it was before
```

当然也支持可调用实例，所以你可以有返回值和捕获异常:

```java
Subject subject = //build or acquire subject 
MyResult result = subject.execute( new Callable<MyResult>() {
    public MyResult call() throws Exception {
        //subject is 'bound' to the current thread now
        //any SecurityUtils.getSubject() calls in any
        //code called from here will work
        ...
        //finish logic as this Subject
        ...
        return myResult;
    }
});
//At this point, the Subject is no longer associated 
//with the current thread and everything is as it was before
```

这种方法在框架开发中也很有用。

例如，Shiro对安全Spring remoting的支持确保远程调用作为一个特定的主题执行:

```java
Subject.Builder builder = new Subject.Builder();
//populate the builder's attributes based on the incoming RemoteInvocation ...
Subject subject = builder.buildSubject();

return subject.execute(new Callable() {
    public Object call() throws Exception {
        return invoke(invocation, targetObject);
    }
});
```

## Manual Association

而这个 `Subject.execute*` 方法在线程返回后自动清除线程状态，在某些情况下，您可能希望自己管理线程状态。

在集成 Shiro时，这几乎总是在框架级开发中完成，即使在引导/守护程序场景中也很少使用(上面的Subject.execute(callable)示例更为频繁)。

### 保证清理

关于这种机制最重要的一点是，您必须始终保证在执行逻辑后清除当前线程，以确保在可重用或线程池环境中不会出现线程状态损坏。

确保清理工作最好在try/finally块中完成:

```java
Subject subject = new Subject.Builder()...
ThreadState threadState = new SubjectThreadState(subject);
threadState.bind();
try {
    //execute work as the built Subject
} finally {
    //ensure any state is cleaned so the thread won't be
    //corrupt in a reusable or pooled thread environment
    threadState.clear();
}
```

有趣的是，这正是 `Subject.execute*` 方法——它们只是在可调用或可运行的执行之前和之后自动执行这个逻辑。

Shiro的ShiroFilter为web应用程序执行的逻辑也几乎相同(ShiroFilter使用的是web特有的ThreadState实现，超出了本节的范围)。

### web 使用

不要在处理web请求的线程中使用上述ThreadState代码示例。而在web请求期间使用web特定的线程状态实现。

相反，确保ShiroFilter拦截web请求，以确保正确地完成主题构建/绑定/清理。

# 一个不同的线程

如果你有一个可调用的或可运行的实例，应该作为一个主题来执行，并且你要自己执行这个可调用的或可运行的实例(或者把它交给线程池、Executor或ExecutorService，例如)，你应该使用 `Subject.associateWith*` 方法。

这些方法确保主题在最终执行的线程上被保留和可访问。

- Callable

```java
Subject subject = new Subject.Builder()...
Callable work = //build/acquire a Callable instance. 
//associate the work with the built subject so SecurityUtils.getSubject() calls works properly: 
work = subject.associateWith(work);
ExecutorService executor = java.util.concurrent.Executors.newCachedThreadPool();
//execute the work on a different thread as the built Subject: 
executor.execute(work);
```

- Runnable:

```java
Subject subject = new Subject.Builder()...
Runnable work = //build/acquire a Runnable instance. 
//associate the work with the built subject so SecurityUtils.getSubject() calls works properly: 
work = subject.associateWith(work);
ExecutorService executor = java.util.concurrent.Executors.newCachedThreadPool();
//execute the work on a different thread as the built Subject:
executor.execute(work);
```

## 自动清理

`associateWith*` 方法自动执行必要的线程清理，以确保线程在池环境中保持干净。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}