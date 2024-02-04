---
layout: post
title:  privilege system design-01-如何从零开始设计权限管理系统
date:  2020-9-17 21:38:08 +0800
categories: [Design]
tags: [design, privilege, safe, web, sf]
published: true
---

# 背景说明

近期写代码又开始重新接触了一点控台应用，接触到的项目年代久远，所有的权限管理用起来感觉不是很得心应手。

于是想着自己能否从零设计一个，梳理一下思路，当然实际用不用也无所谓。

权限管理主要是为了安全，项目中的权限管理是全部放在前端控制的，感觉这一点非常不安全。

前端防君子，不防小人。

当然本次造轮子主要也是为了打造一款自己满意的权限控制框架，所以设计采用 MVP 模式，采用渐进式的方式开发。

大家可以一起学习一下权限控制的设计和实现思路。

如果生产想直接使用，也有比较成熟的框架：

[spring security](https://houbb.github.io/2017/12/19/spring-security-hello)

[shiro](https://houbb.github.io/2016/08/11/shiro)

# 权限设计的基础知识

写代码之前，我们先学习一点权限设计的基础知识。

权限设计发展至今，网上的资料还是比较丰富的，我们节选一些比较经典的内容。

## 用户-权限 模型

对于权限管理，最简单的想法应该是为每一个用户，分配不同的权限。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0917/220043_beaf0cad_508704.png)

但是这种设计存在一个比较大的问题就是不够灵活，当用户较多时，比较难以维护。

## RBAC0 模型

于是，很多人想到了在用户和权限中间增加一个角色。

也是迄今为止迄最为普及的权限设计模型,基于角色的访问控制（Role-Based Access Control)。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0917/220342_945eaa24_508704.png)

这里主要有三个概念：用户，角色，权限。

用户其实就是我们需要控制的主体。

角色就是一座桥梁，也是这个模型中最巧妙的地方。就像我们每一个人一样，我们是父母的孩子，孩子的父母，公司的员工，我们在不同的时刻饰演着不同的角色。不同的角色，对应的不同的权限。

权限是一个比较宽泛的概念，对于控台而言，可能是菜单权限，资源权限，也包括对于数据的增删改查的操作权限。

在数据库表设计的时候，其实就是三张实体表：

user 用户表

role 角色表

privilege 权限表

然后两张映射表：

user_role 用户-角色关系表

role_privilege 角色-权限关系表

以上是RBAC的核心设计及模型分析,此模型也叫做RBAC0,而基于核心概念之上,RBAC还提供了扩展模式。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0917/223453_e25b4d12_508704.png)

包括RBAC1,RBAC2,RBAC3模型。

下面介绍这三种类型

## RBAC1 模型

这里主要是引入了角色权限继承(Hierarchical Role)的概念。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0917/220947_3d14a7f9_508704.png)

这种设计可以给角色分组和分层，一定程度简化了权限管理工作。

## RBAC2模型

基于核心模型的基础上，进行了角色的约束控制,RBAC2模型中添加了责任分离关系,其规定了权限被赋予角色时，或角色被赋予用户时，以及当用户在某一时刻激活一个角色时所应遵循的强制性规则。

不过实际工作中，这种模型用的也不多。此处不做展开。

## RBAC3模型

功能最全的模型，也是各大公司最常用的一种模型。

我们平时见到的权限管理，一般是和公司的组织架构是一一对应的。

这就是，模型来源于生活。

### 用户组

最常见的一个概念就是用户组。

比如我们常用的 gitlab，加入一个项目组，然后就可以对相关的代码仓库进行操作。

就像我们在真正的工作中加入了一个项目组，是相同的道理。这里的用户一般是平级的。

公司中一般组织都是有上下级关系的，一般公司的组织架构图如下：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0917/221519_04fcd664_508704.png)

这种架构的好处就是便于权限的变更调整，也便于权限的控制。

这种关系我们在设计表的时候，就可以加一个 user_group 表，将某些用户放在同一个组中。

### 职位

职位其实对应的是角色的概念，不同的职位权限也是不同的，即使在同一个项目中。

就像项目负责人和普通开发之间的区别。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0917/221803_354b45e8_508704.png)

### 权限模型

最终的模型大概是下面的这个样子：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0917/221849_32251506_508704.png)

# 授权流程

给用户赋予角色，这个是如何实现的呢？

## 手动授权

最常见的是手动设计。

项目初始化的时候，有一些基本的角色和管理员等信息。

然后管理员进行相关的权限配置。

## 审批授权

用户可以申请对应的角色，然后通过审批流程，赋予其对应的角色。

比如我们有时候可以申请访问某一个资源，实际上背后也是类似的道理。

其实到这里，都只是一些基础知识。

如果想设计好菜单，还有很多东西需要考虑，比如菜单的设计，页面的设计，流程怎么设计更加合理？可以自定义角色吗？用户可以自定义菜单吗？

等等。不过这些暂时我们不做深入讨论，我们本篇的重点是自己实现一个简单版本的权限控制框架。

# 传统 RBAC 的不足

当然上面的模型还是存在不足之处的。

比如我读的一篇 paper 中所言：

> 尽管RBAC已经得到广泛应用，但传统的RBAC模型仍存在不足之处，主要有以下两个方面：(1)访问控制不能满足实际应用的需要，Web应用系统需要更加细粒度的访问控制。
> (2)该模型仅仅定义了访问控制的内部机制，并没有提出简单友好的访问控制实现方式，而对于Web系统的用户而言，友好直观的用户接口是系统必不可少的组成部分。

解决方案是设计了一个操作码，然后通过字符串标识比如： `10000` 可以代表可访问菜单，没有增删改查权限。

当然这些都需要我们结合自己的业务去设计。

我们假定设计产品设计完成，数据库也设计完成的情况下，如何在编码时灵活的实现权限控制呢？

# 设计思路

最基本的思路就是类似于 shiro 的方式。

可以指定角色，或者权限来访问固定的菜单。

## 设计目标

（1）当然我们希望可以更加灵活，可以具体到固定的一个方法，而不是拘泥于固定的某一个 Controller 请求。

（2）编写方便，后期可以使用注解指定

（3）由简到繁，初期只实现基于权限编码的控制，暂时不考虑基于角色的控制。因为每一个登录的用户，都可以获取到对应的角色和权限编码。

## 整体流程

1. 用户页面请求

2. 获取用户登录信息。分布式系统可以基于 redis session 或者 JWT 等，获取当前用户的所有权限编码

3. 校验用户是否拥有请求的权限

4. 返回对应的页面结果

# 第一步-接口设计

## 核心接口

```java
public interface IPrivilege {

    /**
     * 是否拥有权限
     *
     * {@code true} 拥有
     * {@code false} 不拥有
     *
     * @param context 上下文
     * @return 是否
     * @since 0.0.1
     */
    boolean hasPrivilege(final IPrivilegeContext context);

}
```

这里就是一切的核心，我们关心的只是是否有权限，结果就是一个 boolean 值。

那么 context 的内容是什么呢？

```java
public interface IPrivilegeContext {

    /**
     * 拥有的权限上下文
     * @return 拥有
     * @since 0.0.1
     */
    IPrivilegeOwn own();

    /**
     * 需要的权限上下文
     * @return 拥有
     * @since 0.0.1
     */
    IPrivilegeAcquire acquire();

}
```

这里实际上有两个接口，一个是拥有的权限，另一个是需要的权限。

## 权限信息

两个权限的内容如下：

- 拥有的权限

```java
public interface IPrivilegeOwn {

    /**
     * 拥有的权限编码列表
     * @return 编码列表
     * @since 0.0.1
     */
    List<IPrivilegeInfo> ownPrivilege();

}
```

- 需要的权限

```java
public interface IPrivilegeAcquire {

    /**
     * 需要的权限编码列表
     * @return 编码列表
     * @since 0.0.1
     */
    List<IPrivilegeInfo> acquirePrivilege();

}
```

# 第二步-编程式实现

## maven 引入

```xml
<dependency>
    <group>com.github.houbb</group>
    <artifact>privilege-core</artifact>
    <version>${最新版本}</version>
</dependency>
```

## 自定义拥有的权限

实现 `IPrivilegeOwn` 接口即可。

可以查询数据库，文件等。

```java
public class PrivilegeOwnOne implements IPrivilegeOwn {
    @Override
    public List<IPrivilegeInfo> ownPrivilege() {
        IPrivilegeInfo info = PrivilegeInfo.newInstance().code("001");
        return Collections.singletonList(info);
    }
}
```

## 自定义需要的权限

```java
public class PrivilegeAcquireTwo implements IPrivilegeAcquire {

    @Override
    public List<IPrivilegeInfo> acquirePrivilege() {
        IPrivilegeInfo one = PrivilegeInfo.newInstance().code("001");
        IPrivilegeInfo two = PrivilegeInfo.newInstance().code("002");
        return Arrays.asList(one, two);
    }

}
```

## 测试1

```java
IPrivilegeOwn own = new PrivilegeOwnOne();
IPrivilegeAcquire acquire = new PrivilegeAcquireTwo();
boolean hasPrivilege = PrivilegeBs.newInstance()
        .own(own)
        .acquire(acquire)
        .hasPrivilege();

Assert.assertFalse(hasPrivilege);
```

这里我们得到的结果是没有权限，因为默认的策略是指定的编码全部拥有，才算通过。

## 内置策略

内置的策略，可以通过 `Privileges` 直接获取。

| 策略 | 说明 |
|:---|:---|
| all() | 需要的权限编码，全部都拥有，才认为拥有权限。（默认策略）|
| any() | 需要的权限编码，拥有任何一个，则认为拥有权限。|
| allow() | 白名单，直接返回拥有权限。|
| deny() | 黑名单，直接返回不拥有权限。|

## 测试2

我们指定拥有一个就可以通过

```java
IPrivilegeOwn own = new PrivilegeOwnOne();
IPrivilegeAcquire acquire = new PrivilegeAcquireTwo();
IPrivilege privilege = Privileges.any();

boolean hasPrivilege = PrivilegeBs.newInstance()
        .own(own)
        .acquire(acquire)
        .privilege(privilege)
        .hasPrivilege();

Assert.assertTrue(hasPrivilege);
```

# 第三步-注解式编程

## 注解的必要性

当然上面已经实现了一个最基本的实现，但是实际使用肯定不能让开发者手动指定。

那该多麻烦。

叙事我们设计可以基于注解的实现。

## 注解定义

```java
@Inherited
@Documented
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface PrivilegeAcquire {

    /**
     * 权限编码
     * @return 编码
     * @since 0.0.4
     */
    String[] code() default {};

}
```

这个注解可以放在方法上，指定访问时需要的编码。

## maven 引入

我们一般开发，都是在 spring-mvc 项目中使用。

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>privilege-mvc</artifactId>
    <version>${最新版本}</version>
</dependency>
```

## 自定义拦截器

我们定义一个属于自己的拦截器，用来处理登录用户的权限。

```java
@Component
public class MyPrivilegeInterceptor extends AbstractPrivilegeInterceptor {

    @Override
    protected void fillSubject(ISubject subject, HttpServletRequest request) {
        String id = request.getParameter("id");
        if("admin".equals(id)) {
            subject.privileges("1001");
        }
    }

}
```

我们只为 admin 用户设置权限编码为 1001，其他用户不做处理。

### 注册拦截器

将我们的拦截器注册一下，当访问 `/hello` 这个地址的时候，会生效。当然也可以根据实际情况调整。

```java
@Configuration
public class InterceptorConfig extends WebMvcConfigurerAdapter {

    @Autowired
    private MyPrivilegeInterceptor myPrivilegeInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(myPrivilegeInterceptor)
            .addPathPatterns("/hello");
    }

}
```


## 业务代码

### Controller

我们通过注解 `@PrivilegeAcquire` 指定访问当前方法时，需要权限编码 `1001`

```java
@Controller
public class HelloController {

    @RequestMapping("/hello")
    @ResponseBody
    @PrivilegeAcquire(code = "1001")
    public String hello() {
        return "hello";
    }

}
```

### Application

启动类定义如下：

我们通过注解 `@EnablePrivilege` 启动权限校验。

```java
@SpringBootApplication
@EnablePrivilege
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

## 测试

页面访问 [http://localhost:8080/hello](http://localhost:8080/hello) 报错权限不足;

```
There was an unexpected error (type=Internal Server Error, status=500).
Has no privilege! Acquire: <[1001]>, Own: <[]>
```

页面访问 [http://localhost:8080/hello?id=admin](http://localhost:8080/hello?id=admin) 正常访问。

## 小结

到这里一个最简单的权限设计就完成了。

实际上设计的时候，为了适应各种场景，项目是非常多个模块的：

（1）api 核心的接口和注解定义

（2）core 编程式的基本实现，可以脱离 spring 存在

（3）proxy 脱离 spring 可以直接使用的代理

（4）spring 结合 spring 的 AOP 模式

（5）mvc 结合 spring-mvc，也是最常用的一种模式

后续将考虑继续优化，添加对于 springboot 的支持。

也考虑学习一下 shiro 的精髓，引入更多的特性。


## 开源地址

> [https://github.com/houbb/privilege](https://github.com/houbb/privilege)

欢迎 fork/star~~

# 愿景

框架可以支持更多的特性，比如基于角色，基于用户。

开箱即用的设计，比如最基本的 sql + mybatis 的通用权限管理框架，类似于 quartz。

一个完整的项目设计，支持前后端页面。

单独的服务打磨，可以对外提供鉴权服务，结合 auth 等，进一步优化权限管理。

# 拓展阅读

[spring security](https://houbb.github.io/2017/12/19/spring-security-hello)

[shiro](https://houbb.github.io/2016/08/11/shiro)

# 参考资料

[有赞权限系统(SAM)](https://tech.youzan.com/sam/)

[权限系统设计的一种解法](https://xie.infoq.cn/article/f2698810ec34717c13933d9fc)

[权限系统设计学习总结（2）——SAAS后台权限设计案例分析](https://blog.csdn.net/u012562943/article/details/89923469)

[基于RBAC模型的权限系统设计(github开源项目)](https://juejin.im/entry/6844903540884766733)

[网易高手：角色权限设计的100种解法](https://www.uisdc.com/100-solutions-for-character-permission-design)

* any list
{:toc}