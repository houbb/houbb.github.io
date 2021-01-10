---
layout: post
title: Shiro-30-从零手写 shiro 权限校验框架 (1) 基础功能
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 序言

前面我们学习了如下内容：

[5 分钟入门 shiro 安全框架实战笔记](https://www.toutiao.com/i6910927630845919756/)

[shiro 安全框架入门，看这一篇就够了](https://www.toutiao.com/i6910932912108175879/)

[shiro 整合 spring 实战及源码详解](https://www.toutiao.com/item/6913919734140436995/)

[shiro 整合 springmvc 实战及源码详解](https://www.toutiao.com/item/6915794728332165646/)

[shiro 整合 springboot 实战笔记](https://www.toutiao.com/item/6913925968646226443/)

相信大家对于 shiro 已经有了最基本的认识，后续我们将尝试和大家一起手写一个自己的 shiro 权限校验框架，加深对于 shiro 的理解。

主要分成下面几个步骤：

（1）基本功能的实现

（2）整合 web 

（3）整合 spring

（4）整合 springboot

# 基本功能的实现

本篇主要目标在于实现最基本的功能，也就是我们在 shiro 入门中使用的例子。

先和老马一起回顾一下：

```java
public static void main(String[] args) {
    //1. SecurityManager
    Factory<SecurityManager> factory = new IniSecurityManagerFactory("classpath:shiro.ini");
    SecurityManager securityManager = factory.getInstance();
    SecurityUtils.setSecurityManager(securityManager);
    Subject currentUser = SecurityUtils.getSubject();

    //2. session
    Session session = currentUser.getSession();
    session.setAttribute("someKey", "aValue");
    String value = (String) session.getAttribute("someKey");
    if (value.equals("aValue")) {
        log.info("Retrieved the correct value! [" + value + "]");
    }

    //3. 登录
    if (!currentUser.isAuthenticated()) {
        UsernamePasswordToken token = new UsernamePasswordToken("lonestarr", "vespa");
        token.setRememberMe(true);
        currentUser.login(token);
    }

    //4. 授权
    log.info("User [" + currentUser.getPrincipal() + "] logged in successfully.");
    if (currentUser.hasRole("schwartz")) {
        log.info("May the Schwartz be with you!");
    } else {
        log.info("Hello, mere mortal.");
    }
    if (currentUser.isPermitted("lightsaber:wield")) {
        log.info("You may use a lightsaber ring.  Use it wisely.");
    } else {
        log.info("Sorry, lightsaber rings are for schwartz masters only.");
    }
    
    //5. 登出
    currentUser.logout();
}
```

## 核心组件

shiro 的详细架构如下。

![详细架构](https://shiro.apache.org/assets/images/ShiroArchitecture.png)

我们在实现的时候，会做很多简化，以方便大家学习理解。

我们重点关注下面几个部分：

（1）subject 主题

（2）SecurityManager 安全管理器

（3）session 

（4）login 与 logout

（5）hasRole、isPermitted 授权校验

# 接口定义

有了上面的目标之后，我们来定义一下对应的接口

## subject

shiro 的核心思想在于面向 subject 编程，这样所有的操作看起来更加自然。

```java
import com.github.houbb.orihs.api.session.Session;
import com.github.houbb.orihs.api.verify.VerifyContext;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public interface Subject {

    /**
     * 主题标识
     * @return 标识
     * @since 0.0.1
     */
    Object id();

    /**
     * 当前的 session 信息
     * @return session
     * @since 0.0.1
     */
    Session session();

    /**
     * 是否已经验证过身份
     * @return 是否
     * @since 0.0.1
     */
    boolean authed();

    /**
     * 登陆
     * @param verifyContext 验证信息
     * @since 0.0.1
     */
    void login(final VerifyContext verifyContext);

    /**
     * 登出
     * @since 0.0.1
     */
    void logout();

    /**
     * 是否拥有角色
     * @param roleCode 角色标识
     * @return 结果
     * @since 0.0.1
     */
    boolean hasRole(final String roleCode);

    /**
     * 是否拥有权限
     * @param permissionCode 权限
     * @return 结果
     * @since 0.0.1
     */
    boolean hasPermission(final String permissionCode);

}
```

## Session

对于 session 实际上可以沿用 HttpSessin，不过这里为了简单，直接定义了一个 session 接口。

```java
/**
 * session 接口定义
 * @author binbin.hou
 * @since 0.0.1
 */
public interface Session {

    /**
     * 设置属性
     * @param key 键
     * @param value 值
     * @return this
     * @since 0.0.1
     */
    Session attr(final Object key, final Object value);

    /**
     * 获取属性
     * @param key 键
     * @return 结果
     * @since 0.0.1
     */
    Object attr(final Object key);

    /**
     * 删除属性
     * @param key 键
     * @return 结果
     * @since 0.0.1
     */
    Object removeAttr(final Object key);

}
```

## SecurityManager

安全管理器只有两个核心方法，一个是登录，一个是登出。

```java
package com.github.houbb.orihs.api.manager;

import com.github.houbb.orihs.api.auth.Auth;
import com.github.houbb.orihs.api.auth.AuthContext;
import com.github.houbb.orihs.api.session.Session;
import com.github.houbb.orihs.api.subject.Subject;
import com.github.houbb.orihs.api.verify.VerifyContext;

/**
 * 安全管理类
 * @author binbin.hou
 * @since 0.0.1
 */
public interface SecurityManager {

    /**
     * 登陆
     * @param subject 主题
     * @param verifyContext 验证信息
     * @since 0.0.1
     */
    void login(final Subject subject, final VerifyContext verifyContext);

    /**
     * 登出
     * @param subject 主题
     * @since 0.0.1
     */
    void logout(final Subject subject);

}
```

## 登录校验

个人感觉 shiro 的接口命名过于官方，不利于记忆，登录和授权的英文命名过于近似。

这里为了偷懒就给改了一个简单的名字。

```java
public interface Verify {

    /**
     * 认证
     * @param context 上下文
     * @return 结果
     * @since 0.0.1
     */
    VerifyResult verify(final VerifyContext context);

}
```

VerifyContext 用于存放登录信息：

```java
public interface VerifyContext {

    /**
     * 唯一标识
     * @return 标识
     * @since 0.0.1
     */
    Object id();

    /**
     * 密码
     * @return 密码
     * @since 0.0.1
     */
    Object password();

}
```

VerifyResult 对应校验的结果，便于后期拓展。

```java
public interface VerifyResult {

    /**
     * 用户标识
     * @return 标识
     * @since 0.0.1
     */
    Object id();

}
```

## 授权校验

在登录成功之后，就是授权了。

```java
package com.github.houbb.orihs.api.auth;

import java.util.List;

/**
 * 授权
 * @author binbin.hou
 * @since 0.0.1
 */
public interface Auth {

    /**
     * 是否拥有角色
     * @param role 角色
     * @param authContext 认证上下文
     * @return 结果
     * @since 0.0.1
     */
    boolean hasRole(final Role role, final AuthContext authContext);

    /**
     * 是否拥有权限
     * @param permission 权限
     * @param authContext 认证上下文
     * @return 结果
     * @since 0.0.1
     */
    boolean hasPermission(final Permission permission, final AuthContext authContext);

    /**
     * 角色列表
     * @param authContext 上下文
     * @return 角色列表
     * @since 0.0.1
     */
    List<Role> roles(final AuthContext authContext);

    /**
     * 权限列表
     * @param authContext 上下文
     * @return 权限列表
     * @since 0.0.1
     */
    List<Permission> permissions(final AuthContext authContext);

}
```

好的，定义好了接口，我们就可以开始实现了。

# session 实现

session 的实现最简单的可以直接实现一个 map。

```java
import com.github.houbb.orihs.api.session.Session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * session 接口定义
 *
 * @author binbin.hou
 * @since 0.0.1
 */
public class DefaultSession implements Session {

    /**
     * 属性 map
     *
     * @since 0.0.1
     */
    private Map<Object, Object> attrMap;

    public DefaultSession() {
        this.attrMap = new ConcurrentHashMap<>();
    }

    /**
     * 设置属性
     *
     * @param key   键
     * @param value 值
     * @return this
     * @since 0.0.1
     */
    @Override
    public Session attr(final Object key, final Object value) {
        attrMap.put(key, value);
        return this;
    }

    /**
     * 获取属性
     *
     * @param key 键
     * @return 结果
     * @since 0.0.1
     */
    @Override
    public Object attr(final Object key) {
        return attrMap.get(key);
    }

    /**
     * 删除属性
     *
     * @param key 键
     * @return 结果
     * @since 0.0.1
     */
    @Override
    public Object removeAttr(final Object key) {
        return attrMap.remove(key);
    }

}
```

# SecurityManager  实现

其中 auth 和 verify 是我们前面的登录和授权实现类。

## 登录

```java
/**
 * 登陆
 *
 * @param subject 上下文
 * @param verifyContext 验证上下文
 * @since 0.0.1
 */
@Override
public void login(final Subject subject, VerifyContext verifyContext) {
    //0. 参数校验
    ArgUtil.notNull(verify, "verify 验证实现");
    ArgUtil.notNull(auth, "auth 授权实现");
    //1. 验证
    VerifyResult verifyResult = this.verify.verify(verifyContext);
    //2. 更新授权上下文
    DefaultAuthContext authContext = new DefaultAuthContext();
    authContext.id(verifyResult.id());
    //3. 更新主题信息
    DelegatingSubject delegatingSubject = (DelegatingSubject) subject;
    delegatingSubject.auth(auth);
    delegatingSubject.authContext(authContext);
    delegatingSubject.authed(true);
    //4. 重新绑定到当前线程
    SecurityUtils.setSubject(delegatingSubject);
}
```

## 登出

登出的时候会把相关的信息全部清空。

```java
/**
 * 登出
 *
 * @param subject 主题
 * @since 0.0.1
 */
@Override
public void logout(final Subject subject) {
    // 信息清空
    this.verify = null;
    this.auth = null;
    DelegatingSubject delegatingSubject = (DelegatingSubject) subject;
    delegatingSubject.authContext(null);
    delegatingSubject.authed(false);
    delegatingSubject.auth(null);
    delegatingSubject.session(null);
    SecurityUtils.clearSubject();
}
```

# Subject 实现

主题作为 shiro 的核心部分，实现要复杂一点：

```java
import com.github.houbb.orihs.api.auth.Auth;
import com.github.houbb.orihs.api.auth.AuthContext;
import com.github.houbb.orihs.api.auth.Permission;
import com.github.houbb.orihs.api.auth.Role;
import com.github.houbb.orihs.api.manager.SecurityManager;
import com.github.houbb.orihs.api.session.Session;
import com.github.houbb.orihs.api.subject.Subject;
import com.github.houbb.orihs.api.verify.VerifyContext;
import com.github.houbb.orihs.core.auth.DefaultPermission;
import com.github.houbb.orihs.core.auth.DefaultRole;
import com.github.houbb.orihs.core.auth.NoneAuth;
import com.github.houbb.orihs.core.exception.OrihsException;
import com.github.houbb.orihs.core.exception.OrihsRespCode;
import com.github.houbb.orihs.core.session.DefaultSession;
import com.github.houbb.orihs.core.util.SecurityUtils;

/**
 * 默认主题
 * @author binbin.hou
 * @since 0.0.1
 */
public class DelegatingSubject implements Subject {

    /**
     * 是否已经验证过
     * @since 0.0.1
     */
    private boolean authed = false;

    /**
     * session 信息
     * @since 0.0.1
     */
    private Session session = new DefaultSession();

    /**
     * 权限验证
     * @since 0.0.1
     */
    private Auth auth = new NoneAuth();

    /**
     * 授权上下文
     * @since 0.0.1
     */
    private AuthContext authContext = null;

    @Override
    public boolean authed() {
        return authed;
    }

    public DelegatingSubject authed(boolean authed) {
        this.authed = authed;
        return this;
    }

    @Override
    public Object id() {
        assertAuthed();

        return this.authContext.id();
    }

    @Override
    public Session session() {
        return session;
    }

    public DelegatingSubject session(Session session) {
        this.session = session;
        return this;
    }

    public Auth auth() {
        return auth;
    }

    public DelegatingSubject auth(Auth auth) {
        this.auth = auth;
        return this;
    }

    public AuthContext authContext() {
        return authContext;
    }

    public DelegatingSubject authContext(AuthContext authContext) {
        this.authContext = authContext;
        return this;
    }

    @Override
    public void login(VerifyContext verifyContext) {
        SecurityManager securityManager = SecurityUtils.getSecurityManagerAndAssert();
        securityManager.login(this, verifyContext);
    }

    @Override
    public void logout() {
        SecurityManager securityManager = SecurityUtils.getSecurityManagerAndAssert();

        securityManager.logout(this);
    }

    @Override
    public boolean hasRole(String roleCode) {
        assertAuthed();

        Role role = new DefaultRole(roleCode);
        return this.auth.hasRole(role, this.authContext);
    }

    @Override
    public boolean hasPermission(String permissionCode) {
        assertAuthed();

        Permission permission = new DefaultPermission(permissionCode);
        return this.auth.hasPermission(permission, this.authContext);
    }

    /**
     * 断言已经授权
     * @since 0.0.1
     */
    private void assertAuthed() {
        if(!authed) {
            throw new OrihsException(OrihsRespCode.VERIFY_USER_NOT_LOGIN);
        }
    }

}
```

## 如何实现面向 subject 的？

实际上 shiro 设计比较巧妙的一点就是，如何实现以 subject 为主题的？

因为登录/登出实际上的实现都在 SecurityManager 中。

这里技巧就在于使用了 ThreadLocal 保存了 SecurityManager 信息。

```java
@Override
public void login(VerifyContext verifyContext) {
    SecurityManager securityManager = SecurityUtils.getSecurityManagerAndAssert();
    securityManager.login(this, verifyContext);
}
```

Subject 在登录的时候首先会获取当前线程的 SecurityManager，然后调用其中的 login 方法进行登录校验。

```java
//4. 重新绑定到当前线程
SecurityUtils.setSubject(delegatingSubject);
```

登录完成后，会把 subject 信息重新设置到当前线程中，这样可以方便在任何地方使用。

## 权限校验

权限校验的实现其实比较简单：

```java
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.orihs.api.auth.Auth;
import com.github.houbb.orihs.api.auth.AuthContext;
import com.github.houbb.orihs.api.auth.Permission;
import com.github.houbb.orihs.api.auth.Role;
import com.github.houbb.orihs.core.util.CodeUtil;

import java.util.List;

/**
 * 抽象的验证策略
 * @author binbin.hou
 * @since 0.0.1
 */
public abstract class AbstractAuth implements Auth {

    @Override
    public boolean hasRole(Role role, AuthContext authContext) {
        List<Role> roles = this.roles(authContext);
        return CodeUtil.hasCode(roles, role);
    }

    @Override
    public boolean hasPermission(Permission permission, AuthContext authContext) {
        List<Permission> permissions = this.permissions(authContext);
        return CodeUtil.hasCode(permissions, permission);
    }

}
```

只需要具体的实现类，提供对对应的角色编码之后，我们统一判断即可。


# 测试

好了，写了这么多，我们可以验证一下效果了。

## 测试代码

```java
public static void main(String[] args) {
    //1. 构建并且设置 SecurityManager
    Verify verify = new FooVerify();
    Auth auth = new FooAuth();
    SecurityManager securityManager = new DefaultSecurityManager(verify, auth);
    SecurityUtils.setSecurityManager(securityManager);
    //2. 获取 Subject
    Subject subject = SecurityUtils.getSubject();
    Session session = subject.session();
    session.attr("someKey", "aValue");
    //3. 登录
    VerifyContext verifyContext = new DefaultVerifyContext(RoleConst.ROLE_ADMIN, RoleConst.ROLE_ADMIN);
    subject.login(verifyContext);
    if(subject.authed()) {
        System.out.println("已经登录，当前用户：" + subject.id());
        System.out.println("是否拥有角色：" + subject.hasRole(RoleConst.ROLE_ADMIN));
        System.out.println("是否拥有权限：" + subject.hasPermission(RoleConst.ROLE_ADMIN));
        System.out.println(subject.session().attr("someKey"));
    }
    subject.logout();
    System.out.println(subject.authed());
}
```

## 测试实现

为了验证，我们实现了最简单的验证和授权实现。

### 登录

```java
import com.github.houbb.orihs.api.verify.Verify;
import com.github.houbb.orihs.api.verify.VerifyContext;
import com.github.houbb.orihs.api.verify.VerifyResult;
import com.github.houbb.orihs.core.constant.RoleConst;
import com.github.houbb.orihs.core.exception.OrihsException;
import com.github.houbb.orihs.core.exception.OrihsRespCode;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class FooVerify implements Verify {

    @Override
    public VerifyResult verify(VerifyContext context) {
        final String id = (String) context.id();
        final String password = (String) context.password();
        if(RoleConst.ROLE_ADMIN.equals(id)) {
            if(RoleConst.ROLE_ADMIN.equals(password)) {
                return DefaultVerifyResult.newInstance().id(id);
            }
            throw new OrihsException(OrihsRespCode.VERIFY_ERROR_ACCT_PWD);
        }

        if(RoleConst.ROLE_GUEST.equals(context.id())) {
            if(RoleConst.ROLE_GUEST.equals(password)) {
                return DefaultVerifyResult.newInstance().id(id);
            }
            throw new OrihsException(OrihsRespCode.VERIFY_ERROR_ACCT_PWD);
        }

        throw new OrihsException(OrihsRespCode.VERIFY_UNKNOWN_ACCT);
    }

}
```

### 授权

```java
import com.github.houbb.orihs.api.auth.AuthContext;
import com.github.houbb.orihs.api.auth.Permission;
import com.github.houbb.orihs.api.auth.Role;
import com.github.houbb.orihs.core.constant.RoleConst;
import com.github.houbb.orihs.core.util.PermissionUtil;
import com.github.houbb.orihs.core.util.RoleUtil;

import java.util.List;

/**
 * 测试版本
 * @author binbin.hou
 * @since 0.0.1
 */
public class FooAuth extends AbstractAuth {

    @Override
    public List<Role> roles(AuthContext authContext) {
        if(RoleConst.ROLE_ADMIN.equals(authContext.id())) {
            return RoleUtil.roles(RoleConst.ROLE_ADMIN);
        }

        return RoleUtil.roles(RoleConst.ROLE_GUEST);
    }

    @Override
    public List<Permission> permissions(AuthContext authContext) {
        if(RoleConst.ROLE_ADMIN.equals(authContext.id())) {
            return PermissionUtil.permissions(RoleConst.ROLE_ADMIN);
        }

        return PermissionUtil.permissions(RoleConst.ROLE_GUEST);
    }

}
```

## 测试日志

测试日志如下：

```
已经登录，当前用户：admin
是否拥有角色：true
是否拥有权限：true
aValue
false
```

是不是和 shiro 入门教程比较，有那么一点儿味道了呢？

不过和真正的 shiro 相比，我们的功能还是缺少了很多，算是迈出了第一步。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}