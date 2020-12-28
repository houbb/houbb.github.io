---
layout: post
title: Shiro-05-Authorization 授权
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 授权

![授权](http://shiro.apache.org/assets/images/ShiroFeatures_Authorization.png)

授权，也称为访问控制，是管理对资源访问的过程。 

换句话说，**控制谁有权访问应用程序中的内容**。

授权检查的示例包括：是否允许用户查看此网页，编辑此数据，查看此按钮或打印到该打印机？ 

这些都是决定用户有权访问的内容的决定。

## 授权要素

授权具有三个在Shiro中引用的核心元素：权限，角色和用户。

# 权限（Permissions）

Apache Shiro中的权限代表安全策略中最基本的元素。

从根本上讲，它们是有关行为的声明，并明确表示可以在应用程序中完成的操作。

格式正确的权限声明本质上描述了资源以及主题与这些资源进行交互时可以采取的措施。

权限声明的一些示例：

- Open a file

- View the ‘/user/list’ web page

- Print documents

- Delete the ‘jsmith’ user

大多数资源将支持典型的CRUD（创建，读取，更新，删除）操作，但是任何对特定资源类型有意义的操作都是可以的。

基本思想是，权限声明至少基于“资源和操作”。

在查看权限时，可能要意识到的最重要的事情是，权限语句不代表谁可以执行所代表的行为。它们仅是在应用程序中可以执行的操作的声明。

- 权限仅代表行为

权限语句仅反映行为（与资源类型关联的操作）。它们不能反映谁能够执行这种行为。

定义允许谁（用户）执行某事（权限）是一种以某种方式向用户分配权限的练习。这始终由应用程序的数据模型完成，并且在不同的应用程序之间可能会有很大差异。

例如，权限可以分组在一个角色中，并且该角色可以与一个或多个用户对象相关联。或某些应用程序可以具有一个用户组，并且可以为一个组分配一个角色，这通过传递关联将意味着该组中的所有用户都隐式地获得了该角色中的权限。

如何授予用户权限有很多变体-应用程序根据应用程序需求确定如何对此建模。

我们将介绍Shiro如何确定某个主题是否被允许做某事或以后做某事。

## 权限粒度（Permission Granularity）

首先，权限示例指定对资源类型（门，文件，客户等）的操作（打开，读取，删除等）。

在某些情况下，他们甚至指定了非常精细的实例级行为-例如，使用用户名“ jsmith”（实例标识符）“删除”（操作）“用户”（资源类型）。

在 Shiro 中，您可以精确定义这些语句的粒度。

我们会在 Shiro 的[权限文档](http://shiro.apache.org/permissions.html)中更详细地介绍权限粒度和权限声明的“级别”。

# 角色（Roles）

角色是一个命名实体，通常代表一组行为或职责。这些行为会转化为您可以使用软件应用程序执行或无法执行的操作。角色通常分配给用户帐户，因此通过关联，用户可以“执行”归因于各种角色的事情。

实际上有两种类型的角色，并且Shiro支持这两种概念：

## 隐式角色

大多数人将角色用作隐式构造：您的应用程序仅基于角色名称隐含一组行为（即权限）。

在具有隐式角色的情况下，在软件级别上没有任何内容说“允许角色X执行行为A，B和C”。

行为仅由名称暗示。

- 潜在的脆弱安全性

虽然更简单，最常见的方法是隐式角色，但可能会带来很多软件维护和管理问题。

例如，如果您只想添加或删除角色，或稍后重新定义角色的行为，该怎么办？

每当需要进行更改时，您都必须返回源代码并更改所有角色检查，以反映安全模型中的更改！更不用说会产生的运营成本（重新测试，进行质量检查，关闭应用程序，使用新角色检查升级软件，重新启动应用程序等）。

对于非常简单的应用程序（例如，可能有“管理员”角色和“其他所有人”），这可能是可以的。但是对于更复杂或可配置的应用程序，这可能是整个应用程序生命周期内的主要主要问题，并为您的软件带来大量维护成本。

## 显式角色

但是，显式角色本质上是实际权限声明的命名集合。

以这种形式，应用程序（和Shiro）确切地知道具有或没有特定角色的含义。

因为已知可以执行或不能执行的确切行为，所以没有猜测或暗示特定角色可以执行或不能执行的操作。

Shiro团队提倡使用权限和显式角色，而不是较早的隐式方法。您将可以更好地控制应用程序的安全性。

- 基于资源的访问控制

一定要阅读Les Hazlewood的文章“[新的RBAC：基于资源的访问控制](https://stormpath.com/blog/new-rbac-resource-based-access-control)”，该文章深入介绍了使用权限和显式角色（以及它们对源代码的积极影响）而不是旧的隐式角色方法的好处。

# 用户（Users）

用户本质上是应用程序的“用户”。但是，正如我们之前介绍的那样，主题实际上是Shiro的“用户”概念。

允许用户（主题）通过与角色或直接权限的关联在您的应用程序中执行某些操作。您应用程序的数据模型精确定义了允许主题执行某项操作或不执行某项操作的方式。

例如，在您的数据模型中，也许您有一个实际的User类，并且直接将权限分配给User实例。或者，您可能仅直接将权限分配给角色，然后再将角色分配给用户，因此通过关联，用户可传递地“拥有”分配给其角色的权限。或者，您可以使用“组”概念来表示这些东西。这取决于您-使用对您的应用程序有意义的内容。

您的数据模型精确定义了授权将如何起作用。 Shiro依靠Realm实现将您的数​​据模型关联详细信息转换为Shiro理解的格式。稍后我们将介绍Realms如何做到这一点。

- 注意

最终，您的Realm实现是与数据源（RDBMS，LDAP等）进行通信的对象。因此，您的 realm 将告诉Shiro是否存在角色或权限。您可以完全控制授权模型的结构和定义方式。

# 授权主题

在Shiro中执行授权可以通过3种方式完成：

1. 以编程方式-您可以在Java代码中使用if和else块之类的结构执行授权检查。

2. JDK 注解-您可以将授权注解附加到Java方法

3. JSP/GSP TagLibs-您可以根据角色和权限控制JSP或GSP页面输出

## 程序授权

执行授权的最简单，最常见的方法是直接以编程方式与当前Subject实例进行交互。

### 基于角色的授权

如果要基于更简单/传统的隐式角色名称控制访问，则可以执行角色检查：

#### 角色检查

如果只想检查当前的Subject是否具有角色，则可以在Subject实例上调用变体 `hasRole*` 方法。

例如，要查看某个主题是否具有特定（单个）角色，可以调用该主题。 

hasRole（roleName）方法，并做出相应的反应：

```java
Subject currentUser = SecurityUtils.getSubject();

if (currentUser.hasRole("administrator")) {
    //show the admin button 
} else {
    //don't show the button?  Grey it out? 
}
```

您可以根据需要调用几种面向角色的Subject方法：

| Subject Method	| Description |
|:---|:---|
| hasRole(String roleName) | 如果为Subject分配了指定角色，则返回true，否则返回false。 |
| hasRoles(`List<String>` roleNames) | 返回与方法参数中的索引对应的hasRole结果数组。 如果需要执行许多角色检查（例如，自定义复杂视图时），可作为性能增强的有用工具 |
| hasAllRoles(`Collection<String>` roleNames) | 如果为Subject分配了所有指定角色，则返回true，否则返回false。 |

#### 角色断言

除了检查布尔值以查看主体是否具有角色之外，还可以在执行逻辑之前简单地断言它们具有预期的角色。 

如果Subject没有预期的角色，则将抛出AuthorizationException。 

如果它们确实发挥了预期的作用，则声明将安静地执行，并且逻辑将按预期继续。

例如：

```java
Subject currentUser = SecurityUtils.getSubject();

//guarantee that the current user is a bank teller and 
//therefore allowed to open the account: 
currentUser.checkRole("bankTeller");
openBankAccount();
```

与 `hasRole*` 方法相比，这种方法的优点是代码可以更简洁一些，因为如果当前的Subject不符合预期的条件（如果您不希望这样做），则不必构造自己的AuthorizationExceptions。

您可以根据需要调用几种面向角色的主题声明方法：

| Subject Method	| Description |
|:---|:---|
| checkRole(String roleName) | 如果对象被分配了指定角色，则静默返回；否则，则抛出AuthorizationException。 |
| `checkRoles(Collection<String> roleNames)` | 如果为Subject分配了所有指定角色，则安静地返回；否则，则抛出AuthorizationException。 |
| checkRoles(String... roleNames) | 与上面的checkRoles方法具有相同的效果，但是允许使用 Java 5 var-args样式参数。 |

### 基于权限的授权

如上文在角色概述中所述，执行访问控制的更好方法通常是基于权限的授权。基于权限的授权，因为它与应用程序的原始功能（以及应用程序的核心资源上的行为）紧密相关，所以基于权限的授权源代码会在您的功能更改时（而不是在安全策略更改时）更改。这意味着与类似的基于角色的授权代码相比，代码受到的影响要小得多。

#### 权限检查

如果要检查是否允许某个主体做某事，则可以调用各种 `isPermitted*` 方法变体中的任何一个。有

两种主要的权限检查方法-基于对象的权限实例或表示权限的字符串

（1）基于对象的权限检查

执行权限检查的一种可能方法是实例化 Shiro 的 org.apache.shiro.authz.Permission 接口的实例，并将其传递给接受权限实例的 `*isPermitted` 方法。

例如，请考虑以下情形：办公室中有一台打印机，其唯一标识符为laserjet4400n。我们的软件需要先检查是否允许当前用户在该打印机上打印文档，然后再允许他们按“打印”按钮。

权限检查，看是否可以这样写：

```java
Permission printPermission = new PrinterPermission("laserjet4400n", "print");

Subject currentUser = SecurityUtils.getSubject();

if (currentUser.isPermitted(printPermission)) {
    //show the Print button 
} else {
    //don't show the button?  Grey it out?
}
```

在此示例中，我们还看到了一个非常强大的实例级访问控制检查的示例-能够基于单个数据实例限制行为的能力。

基于对象的权限在以下情况下很有用：

- 您需要编译时类型安全

- 您想保证权限被正确表示和使用

- 您需要显式控制权限解析逻辑（基于Permission接口的implies方法，称为权限蕴涵逻辑）的执行方式。

- 您想保证权限能够正确反映应用程序资源（例如，也许可以在项目的构建过程中根据项目的域模型自动生成权限类）。

您可以根据需要调用几种面向对象权限的Subject方法：

| Subject Method	| Description |
|:---|:---|
| isPermitted（Permission p） | 如果允许主题执行操作或访问由指定的Permission实例汇总的资源，则返回true，否则返回false。 |
| `isPermitted（List <Permission> perms）` | 返回与方法参数中的索引对应的isPermitted结果数组。 如果需要执行许多权限检查（例如，自定义复杂视图时），可作为性能增强的有用工具 |
| isPermittedAll（Collection <Permission> perms） | 如果允许Subject的所有指定权限，则返回true，否则返回false。 |

（2）基于字符串的权限检查

尽管基于对象的权限很有用（编译时类型安全，保证的行为，自定义的蕴涵逻辑等），但对于许多应用程序来说，有时它们有时会有些“繁重”。 

一种替代方法是使用普通的字符串表示权限实例。

例如，基于上面的打印许可权示例，我们可以将其与基于字符串的许可权检查相同地重新制定：

```java
Subject currentUser = SecurityUtils.getSubject();

if (currentUser.isPermitted("printer:print:laserjet4400n")) {
    //show the Print button
} else {
    //don't show the button?  Grey it out? 
}
```

此示例仍显示相同的实例级权限检查，但是权限的重要部分-打印机（资源类型），打印（操作）和laserjet4400n（实例ID）均以字符串表示。

这个特定的示例显示了一种特殊的冒号分隔格式，该格式由Shiro的默认org.apache.shiro.authz.permission.WildcardPermission实现定义，大多数人都认为合适。

也就是说，以上代码块（主要是）以下操作的快捷方式：

```java
Subject currentUser = SecurityUtils.getSubject();

Permission p = new WildcardPermission("printer:print:laserjet4400n");

if (currentUser.isPermitted(p) {
    //show the Print button
} else {
    //don't show the button?  Grey it out?
}
```

Shiro的权限文档中详细介绍了WildcardPermission令牌格式和格式选项。

尽管上述String默认为WildcardPermission格式，但实际上您可以发明自己的String格式，并根据需要使用它。我们将在下面的领域授权部分中介绍如何执行此操作。

基于字符串的权限很有用，因为您不必强制实现接口，而且简单的字符串通常易于阅读。

缺点是您没有类型安全性，并且如果您需要更复杂的行为，而这些行为超出了Strings表示的范围，那么您将需要基于许可接口实现自己的许可对象。

实际上，大多数Shiro最终用户为简单起见都选择了基于字符串的方法，但是最终您的应用程序的要求将决定哪种更好。

与基于对象的权限检查方法一样，有一些String变体来支持基于字符串的权限检查：

| Subject Method	| Description |
|:---|:---|
| isPermitted（String p） | 如果允许主题执行操作或访问由指定的Permission实例汇总的资源，则返回true，否则返回false。 |
| isPermitted（String... perms） | 返回与方法参数中的索引对应的isPermitted结果数组。 如果需要执行许多权限检查（例如，自定义复杂视图时），可作为性能增强的有用工具 |
| isPermittedAll（String... perms） | 如果允许Subject的所有指定权限，则返回true，否则返回false。 |

### 权限断言

作为检查布尔值以查看主题是否被允许执行某项操作的替代方法，您可以简单地断言在执行逻辑之前它们具有预期的权限。 

如果不允许使用Subject，则将抛出AuthorizationException。 

如果按预期允许它们，则断言将安静地执行，并且逻辑将按预期继续。

例如：

```java
Subject currentUser = SecurityUtils.getSubject();

//guarantee that the current user is permitted 
//to open a bank account: 
Permission p = new AccountPermission("open");
currentUser.checkPermission(p);
openBankAccount();
```

或者使用字符串的形式：

```java
Subject currentUser = SecurityUtils.getSubject();

//guarantee that the current user is permitted 
//to open a bank account: 
currentUser.checkPermission("account:open");
openBankAccount();
```

与 `isPermitted*` 方法相比，这种方法的好处是代码可以更简洁一些，因为如果当前的Subject不符合预期的条件（如果您不希望这样做），则不必构造自己的AuthorizationExceptions。

您可以根据需要调用几种面向权限的主题断言方法：

| Subject Method	| Description |
|:---|:---|
| checkPermission(Permission p) | 如果允许Subject执行操作或访问由指定的Permission实例汇总的资源，则静默返回；否则，则抛出AuthorizationException。 |
| checkPermission(String perm) | 如果允许Subject执行操作或访问由指定的String权限汇总的资源，则静默返回；否则，则抛出AuthorizationException。 |
| checkPermissions(Collection`<Permission>` perms) | 如果允许Subject获得所有指定的权限，则静默返回；否则，将抛出AuthorizationException。 |
| checkPermissions(String... perms) | 与上面的checkPermissions方法相同，但使用的是基于字符串的权限。 |


# 基于注解的授权

除了主题API调用之外，如果您更喜欢基于元的授权控制，Shiro还提供了Java 5+注解的集合。

## Configuration

在使用Java注解之前，您需要在应用程序中启用AOP支持。 

有许多不同的AOP框架，因此，不幸的是，没有在应用程序中启用AOP的标准方法。

对于AspectJ，您可以查看我们的 [AspectJ示例应用程序](https://github.com/apache/shiro/tree/master/samples/aspectj)。

对于Spring应用程序，您可以查看我们的 [Spring Integration文档](http://shiro.apache.org/spring.html)。

## @RequiresAuthentication 注解

@RequiresAuthentication 注解要求当前Subject在其当前会话期间已通过身份验证，以便可以访问或调用带注释的类/实例/方法。

例如：

```java
@RequiresAuthentication
public void updateAccount(Account userAccount) {
    //this method will only be invoked by a
    //Subject that is guaranteed authenticated
    ...
}
```

等价于：

```java
public void updateAccount(Account userAccount) {
    if (!SecurityUtils.getSubject().isAuthenticated()) {
        throw new AuthorizationException(...);
    }

    //Subject is guaranteed authenticated here
    ...
}
```

## @RequiresGuest 注解

@RequiresGuest 注解要求当前的Subject为“guest”，也就是说，对于要访问或调用的带注释的类/实例/方法，它们在上一个会话中没有经过身份验证或记住。

例如：

```java
@RequiresGuest
public void signUp(User newUser) {
    //this method will only be invoked by a
    //Subject that is unknown/anonymous
    ...
}
```

等价于:

```java
public void signUp(User newUser) {
    Subject currentUser = SecurityUtils.getSubject();
    PrincipalCollection principals = currentUser.getPrincipals();
    if (principals != null && !principals.isEmpty()) {
        //known identity - not a guest:
        throw new AuthorizationException(...);
    }

    //Subject is guaranteed to be a 'guest' here
    ...
}
```

## @RequiresPermissions 批注

@RequiresPermissions 批注要求当前的Subject被授予一个或多个权限，以便执行带注释的方法。

例如：

```java
@RequiresPermissions("account:create")
public void createAccount(Account account) {
    //this method will only be invoked by a Subject
    //that is permitted to create an account
    ...
}
```

等价于：

```java
public void createAccount(Account account) {
    Subject currentUser = SecurityUtils.getSubject();
    if (!subject.isPermitted("account:create")) {
        throw new AuthorizationException(...);
    }

    //Subject is guaranteed to be permitted here
    ...
}
```

## @RequiresPermissions 批注

@RequiresPermissions 批注要求当前的Subject被授予一个或多个权限，以便执行带注释的方法。

例如：

```java
@RequiresPermissions("account:create")
public void createAccount(Account account) {
    //this method will only be invoked by a Subject
    //that is permitted to create an account
    ...
}
```

等价于：

```java
public void createAccount(Account account) {
    Subject currentUser = SecurityUtils.getSubject();
    if (!subject.isPermitted("account:create")) {
        throw new AuthorizationException(...);
    }

    //Subject is guaranteed to be permitted here
    ...
}
```

## @RequiresRoles 权限

RequiresRoles批注要求当前的Subject具有所有指定角色。 

如果他们没有角色，则该方法将不会执行，并且会抛出AuthorizationException。

例如：

```java
@RequiresRoles("administrator")
public void deleteUser(User user) {
    //this method will only be invoked by an administrator
    ...
}
```

等价于：

```java
public void deleteUser(User user) {
    Subject currentUser = SecurityUtils.getSubject();
    if (!subject.hasRole("administrator")) {
        throw new AuthorizationException(...);
    }

    //Subject is guaranteed to be an 'administrator' here
    ...
}
```

## @RequiresUser 批注

`RequiresUser*` 注释要求当前Subject为要访问或调用的带注释的类/实例/方法的应用程序用户。 

“应用程序用户”定义为具有已知身份的主题，该身份可能是由于在当前会话期间通过了身份验证而已知的，或者是从先前会话的“RememberMe”服务中记住的。

```java
@RequiresUser
public void updateAccount(Account account) {
    //this method will only be invoked by a 'user'
    //i.e. a Subject with a known identity
    ...
}
```

等价于：

```java
public void updateAccount(Account account) {
    Subject currentUser = SecurityUtils.getSubject();
    PrincipalCollection principals = currentUser.getPrincipals();
    if (principals == null || principals.isEmpty()) {
        //no identity - they're anonymous, not allowed:
        throw new AuthorizationException(...);
    }

    //Subject is guaranteed to have a known identity here
    ...
}
```

# JSP TagLib授权

Shiro提供了一个标记库，用于根据主题状态控制JSP/GSP页面输出。 

网络一章的 [“JSP/GSP标签库”](http://shiro.apache.org/web.html#Web-taglibrary) 部分对此进行了介绍。



# 授权流程

现在，我们已经了解了如何基于当前主题执行授权，让我们看一下在进行授权调用时Shiro内部发生的情况。

我们从“架构”一章中获取了之前的架构图，仅突出显示了与授权相关的组件。

每个数字代表授权操作过程中的一个步骤：

![授权流程](http://shiro.apache.org/assets/images/ShiroAuthorizationSequence.png)

步骤1：应用程序或框架代码调用任何主题的 `hasRole*`，`checkRole*`，`isPermitted*` 或 `checkPermission*` 方法变体，传入所需的任何权限或角色表示。

步骤2：Subject实例（通常是DelegatingSubject（或子类））通过调用securityManager几乎相同的各自 `hasRole*`，`checkRole*`，`isPermitted*` 或 `checkPermission*` 方法变体来委托给应用程序的SecurityManager（securityManager实现org.apache.shiro.authz.Authorizer接口，它定义所有特定于主题的授权方法。

步骤3：作为基本的“伞”组件，SecurityManager通过调用授权者各自的 `hasRole*`，`checkRole*`，`isPermitted*` 或 `checkPermission*` 方法来中继/委托其内部org.apache.shiro.authz.Authorizer实例。默认情况下，authorizer实例是ModularRealmAuthorizer实例，该实例支持在任何授权操作期间协调一个或多个Realm实例。

步骤4：检查每个已配置的Realm，以查看其是否实现相同的Authorizer接口。如果是这样，则会调用Realm各自的 `hasRole*`，`checkRole*`，`isPermitted*` 或 `checkPermission*` 方法。

## ModularRealmAuthorizer

如前所述，Shiro SecurityManager实现默认使用ModularRealmAuthorizer实例。 

ModularRealmAuthorizer同样支持具有单个Realm和具有多个Realm的应用程序。

对于任何授权操作，ModularRealmAuthorizer都将迭代其内部领域的集合，并以迭代顺序与每个集合进行交互。每个Realm交互功能如下：

（1）如果Realm本身实现Authorizer接口，则会调用其各自的Authorizer方法（hasRole *，checkRole *，isPermitted *或checkPermission *）。

（1.1）如果Realm的方法导致异常，则该异常将作为AuthorizationException传播到Subject调用者。这会缩短授权过程，并且该授权操作将不咨询任何剩余的领域。

（1.2）如果Realm的方法是hasRole *或isPermitted *变体，它返回一个布尔值并且返回值是true，则立即返回true值，并且所有剩余的Realms都将短路。此行为作为一种性能增强而存在，通常，如果一个领域允许，则暗示允许主题。这有利于安全策略，在默认情况下，所有内容均被禁止，并且明确允许所有内容，这是最安全的安全策略类型。

（2）如果领域未实现Authorizer接口，则将其忽略。

### 领域授权顺序

必须指出的是，与身份验证完全一样，ModularRealmAuthorizer将以迭代顺序与Realm实例进行交互。

ModularRealmAuthorizer可以访问在SecurityManager上配置的Realm实例。执行授权操作时，它将遍历该集合，并且对于实现了Authorizer接口本身的每个Realm，调用该Realm各自的Authorizer方法（例如hasRole *，checkRole *，isPermitted *或checkPermission *）。

## 配置全局 PermissionResolver

在执行基于字符串的权限检查时，大多数Shiro的默认Realm实现都会先执行此字符串将其转换为实际的Permission实例，然后再执行权限蕴含逻辑。

这是因为权限是根据隐含逻辑而不是直接进行相等性检查来评估的（有关隐含性与相等性的更多信息，请参阅权限文档）。隐式逻辑比通过字符串比较更好地用代码表示。因此，大多数领域需要将提交的权限字符串转换或解析为相应的代表性Permission实例。

为了帮助进行这种转换，Shiro支持PermissionResolver的概念。大多数Shiro Realm实现都使用PermissionResolver来支持Authorizer接口基于字符串的权限方法的实现：当在Realm上调用这些方法之一时，它将使用PermissionResolver将字符串转换为Permission实例，并执行检查那样。

所有Shiro Realm实施默认为内部WildcardPermissionResolver，该内部假定Shiro的WildcardPermission String格式。

如果要创建自己的PermissionResolver实现（也许是为了支持自己的Permission字符串语法），并且希望所有已配置的Realm实例都支持该语法，则可以为可以配置一个的所有Realm全局设置PermissionResolver。

例如，在shiro.ini中：

```ini
globalPermissionResolver = com.foo.bar.authz.MyPermissionResolver
...
securityManager.authorizer.permissionResolver = $globalPermissionResolver
...
```

### PermissionResolver 注意点

如果要配置全局PermissionResolver，则每个要接收配置的PermissionResolver的领域都必须实现PermisionResolverAware接口。 

这保证了可以将配置的实例中继到支持这种配置的每个Realm。

如果您不想使用全局的PermissionResolver或不想被PermissionResolverAware接口打扰，则始终可以使用PermissionResolver实例显式配置一个领域（假设有一个与JavaBeans兼容的setPermissionResolver方法）：

```ini
permissionResolver = com.foo.bar.authz.MyPermissionResolver

realm = com.foo.bar.realm.MyCustomRealm
realm.permissionResolver = $permissionResolver
...
```

## 配置全局 RolePermissionResolver

在概念上与PermissionResolver类似，RolePermissionResolver能够表示领域执行权限检查所需的Permission实例。

但是，与RolePermissionResolver的主要区别在于输入的String是角色名称，而不是权限字符串。

当需要将角色名称转换为具体的Permission实例集时，Realm可以在内部使用RolePermissionResolver。

这对于支持可能没有权限概念的旧数据源或不灵活数据源特别有用。

例如，许多LDAP目录存储角色名称（或组名称），但不支持将角色名称与具体权限相关联，因为它们没有“权限”概念。基于Shiro的应用程序可以使用LDAP中存储的角色名称，但是实现Role RoleResolver将LDAP名称转换为一组显式权限，以执行首选的显式访问控制。权限关联将存储在另一个数据存储中，可能是本地数据库。

由于将角色名称转换为权限的概念是特定于应用程序的，因此Shiro的默认Realm实现不使用它们。

但是，如果您要创建自己的RolePermissionResolver并具有多个要配置的Realm实现，则可以为可以配置一个的所有Realm全局设置RolePermissionResolver。

- shiro.ini

```
globalRolePermissionResolver = com.foo.bar.authz.MyPermissionResolver
...
securityManager.authorizer.rolePermissionResolver = $globalRolePermissionResolver
```

### RolePermissionResolver 注意点

如果要配置全局RolePermissionResolver，则每个要接收配置的RolePermissionResolver的领域都必须实现RolePermisionResolverAware接口。 

这保证了可以将已配置的全局RolePermissionResolver实例中继到支持该配置的每个Realm。

如果您不想使用全局的RolePermissionResolver或不想被RolePermissionResolverAware接口打扰，则始终可以使用RolePermissionResolver实例显式配置一个领域（假定存在与JavaBeans兼容的setRolePermissionResolver方法）：

```ini
rolePermissionResolver = com.foo.bar.authz.MyRolePermissionResolver

realm = com.foo.bar.realm.MyCustomRealm
realm.rolePermissionResolver = $rolePermissionResolver
...
```

## 自定义 Authorizer

如果您的应用程序使用多个领域来执行授权，并且ModularRealmAuthorizer的默认基于简单迭代的短路授权行为不符合您的需求，则您可能需要创建自定义Authorizer并相应地配置SecurityManager。

例如，在shiro.ini中：

```ini
[main]
...
authorizer = com.foo.bar.authz.CustomAuthorizer

securityManager.authorizer = $authorizer
```

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

* any list
{:toc}