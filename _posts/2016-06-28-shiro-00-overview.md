---
layout: post
title: Shiro-00-shiro 概览
date:  2016-8-11 09:38:24 +0800
categories: [Apache]
tags: [shiro]
published: true
---


# RBAC

> [RBCA](http://www.katasoft.com/blog/2011/05/09/new-rbac-resource-based-access-control)

> [RBCA zh_CN](http://www.thinksaas.cn/topics/0/150/150841.html)

# Shiro

Apache Shiro 是一个强大且易于使用的 Java 安全框架，负责执行身份验证、授权、加密和会话管理。

通过 Shiro 的易于理解的 API，您可以快速而轻松地保护任何应用程序，从最小的移动应用到最大的 Web 和企业应用。

Shiro 提供了应用程序安全 API，用于执行以下方面：

- 身份验证 - 验证用户身份，通常称为用户“登录”
- 授权 - 访问控制
- 加密 - 保护或隐藏数据免受窥探
- 会话管理 - 每个用户的时限敏感状态

<uml>
    Subject->SecurityManager:
    SecurityManager->Realms:
</uml>

> [shiro](http://shiro.apache.org/)

> [shiro zh_CN](http://jinnianshilongnian.iteye.com/blog/2018398)

# Hello world

- pom.xml

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.9</version>
    </dependency>
    <dependency>
        <groupId>commons-logging</groupId>
        <artifactId>commons-logging</artifactId>
        <version>1.1.3</version>
    </dependency>
    <dependency>
        <groupId>org.apache.shiro</groupId>
        <artifactId>shiro-core</artifactId>
        <version>1.2.2</version>
    </dependency>
</dependencies>
```

- shiro.ini

> create this file under the classpath.

```
[users]
ryo=123
wang=123
```

- ShiroTest.java

```java
@Test
public void testHelloworld() {
    Factory<SecurityManager> factory =
            new IniSecurityManagerFactory("classpath:shiro.ini");

    org.apache.shiro.mgt.SecurityManager securityManager = factory.getInstance();
    SecurityUtils.setSecurityManager(securityManager);
    Subject subject = SecurityUtils.getSubject();
    UsernamePasswordToken token = new UsernamePasswordToken("ryo", "123");

    try {
        subject.login(token);
    } catch (AuthenticationException e) {
        //login falied
    }

   assertEquals(true, subject.isAuthenticated());   //assert user has logined.

   //logout
   subject.logout();
}
```

# Realms

Realms（领域）充当 Shiro 与您的应用程序安全数据之间的“桥梁”或“连接器”。

当需要实际与安全相关的数据进行交互，例如从用户帐户执行身份验证（登录）和授权（访问控制）时，Shiro 会查找配置为应用程序的一个或多个领域中的许多信息。

- Realm.java

```java
public interface Realm {
    String getName();   //返回一个唯一的Realm名字

    boolean supports(AuthenticationToken var1); //判断此Realm是否支持此Token

    AuthenticationInfo getAuthenticationInfo(AuthenticationToken var1) throws AuthenticationException;  //根据Token获取认证信息
}
```

- MyRealm.java

```java
public class MyRealm implements Realm {
    @Override
    public String getName() {
        return "firstRealm";
    }

    @Override
    public boolean supports(AuthenticationToken authenticationToken) {
        //仅支持UsernamePasswordToken类型的Token
        return authenticationToken instanceof UsernamePasswordToken;
    }

    @Override
    public AuthenticationInfo getAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        String username = (String) authenticationToken.getPrincipal();      //get username
        String password = new String((char[]) authenticationToken.getCredentials());    //get password
        if (!"ryo".equals(username)) {
            throw new UnknownAccountException();
        }
        if (!"123".equals(password)) {
            throw new IncorrectCredentialsException();
        }

        //如果身份认证验证成功，返回一个AuthenticationInfo实现；
        return new SimpleAuthenticationInfo(username, password, getName());
    }
}
```

- shiro-realm.ini

create this file under the classpath.

```
#declear realm
firstRealm=com.ryo.shiro.MyRealm
#point the realms impls of securityManager
securityManager.realms=$firstRealm
```

- test()

```java
@Test
public void testRealm() {
    Factory<SecurityManager> factory =
            new IniSecurityManagerFactory("classpath:shiro-realm.ini");
    org.apache.shiro.mgt.SecurityManager securityManager = factory.getInstance();
    SecurityUtils.setSecurityManager(securityManager);
    Subject subject = SecurityUtils.getSubject();
    UsernamePasswordToken token = new UsernamePasswordToken("ryo", "123");

    try {
        subject.login(token);
    } catch (AuthenticationException e) {
    }

    assertEquals(true, subject.isAuthenticated());

    subject.logout();
}
```

## multi-realm

- define another realm SecondRealm.java

```java
public class SecondRealm implements Realm {
    public String getName() {
        return "secondRealm";
    }

    public boolean supports(AuthenticationToken authenticationToken) {
        return authenticationToken instanceof UsernamePasswordToken;
    }

    public AuthenticationInfo getAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        String username = (String) authenticationToken.getPrincipal();
        String password = new String((char[]) authenticationToken.getCredentials());
        if (!"wang".equals(username)) {
            throw new UnknownAccountException();
        }
        if (!"123".equals(password)) {
            throw new IncorrectCredentialsException();
        }
        return new SimpleAuthenticationInfo(username, password, getName());
    }
}
```

- define shiro-multi-realm.ini

```
[main]
#define
firstRealm=com.ryo.shiro.FirstRealm
secondRealm=com.ryo.shiro.SecondRealm
#use
securityManager.realms=$firstRealm,$secondRealm
```

- test()

```java
@Test
public void testMultiRealm() {
    Factory<SecurityManager> factory =
            new IniSecurityManagerFactory("classpath:shiro-multi-realm.ini");

    org.apache.shiro.mgt.SecurityManager securityManager = factory.getInstance();
    SecurityUtils.setSecurityManager(securityManager);

    Subject subject = SecurityUtils.getSubject();
    UsernamePasswordToken token = new UsernamePasswordToken("wang", "123");

    try {
        subject.login(token);
    } catch (AuthenticationException e) {
        e.printStackTrace();
    }

    Assert.assertEquals(true, subject.isAuthenticated());

    subject.logout();
}
```

<label class="label label-warning">Notice</label>

The realm worked only after you used it.

## JDBC Realm

- Add jars info your pom.xml, here I user ```MySQL``` and ```druid``` datasource for test.

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.25</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>0.2.23</version>
</dependency>
```

- Here are some sql to init database.

```sql
DROP DATABASE IF EXISTS shiro;
CREATE DATABASE shiro;
USE shiro;

CREATE TABLE users (
  id            BIGINT AUTO_INCREMENT,
  username      VARCHAR(100),
  password      VARCHAR(100),
  password_salt VARCHAR(100),
  CONSTRAINT pk_users PRIMARY KEY (id)
)
  CHARSET = utf8
  ENGINE = InnoDB;
CREATE UNIQUE INDEX idx_users_username ON users (username);

CREATE TABLE user_roles (
  id        BIGINT AUTO_INCREMENT,
  username  VARCHAR(100),
  role_name VARCHAR(100),
  CONSTRAINT pk_user_roles PRIMARY KEY (id)
)
  CHARSET = utf8
  ENGINE = InnoDB;
CREATE UNIQUE INDEX idx_user_roles ON user_roles (username, role_name);

CREATE TABLE roles_permissions (
  id         BIGINT AUTO_INCREMENT,
  role_name  VARCHAR(100),
  permission VARCHAR(100),
  CONSTRAINT pk_roles_permissions PRIMARY KEY (id)
)
  CHARSET = utf8
  ENGINE = InnoDB;
CREATE UNIQUE INDEX idx_roles_permissions ON roles_permissions (role_name, permission);

INSERT INTO users (username, password) VALUES ('wang', '123');
INSERT INTO users (username, password) VALUES ('ryo', '123');
```

- shiro-jdbc-realm.ini

```
[main]
jdbcRealm=org.apache.shiro.realm.jdbc.JdbcRealm
dataSource=com.alibaba.druid.pool.DruidDataSource
dataSource.driverClassName=com.mysql.jdbc.Driver
dataSource.url=jdbc:mysql://localhost:3307/shiro
dataSource.username=root
dataSource.password=${youOwnSQLPassword}
jdbcRealm.dataSource=$dataSource
securityManager.realms=$jdbcRealm


;1、varName=className    auto create an instance of class.
;2、varName.property=val         auto call the set()
;3、$varname             reference an object define before;
```

- test()

```
@Test
public void testJDBCRealm() {
    Factory<org.apache.shiro.mgt.SecurityManager> factory =
            new IniSecurityManagerFactory("classpath:shiro-jdbc-realm.ini");

    org.apache.shiro.mgt.SecurityManager securityManager = factory.getInstance();
    SecurityUtils.setSecurityManager(securityManager);

    Subject subject = SecurityUtils.getSubject();
    UsernamePasswordToken token = new UsernamePasswordToken("ryo", "123");

    try {
        subject.login(token);
    } catch (AuthenticationException e) {
        e.printStackTrace();
    }

    Assert.assertEquals(true, subject.isAuthenticated());

    subject.logout();
}
```

# Authenticator

- 在单领域应用程序中，```ModularRealmAuthenticator``` 将直接调用单个领域。

- 如果您希望使用自定义的 ```Authenticator``` 实现配置 SecurityManager，您可以在 *shiro.ini* 中进行配置，例如：

```
[main]
authenticator = com.foo.bar.CustomAuthenticator

securityManager.authenticator = $authenticator
```

> SecurityManager.java

```java
public interface SecurityManager extends Authenticator, Authorizer, SessionManager {
}
```

> Authenticator.java

```java
public interface Authenticator {
    AuthenticationInfo authenticate(AuthenticationToken var1) throws AuthenticationException;
}
```


# AuthenticationStrategy

当为应用程序配置了两个或更多领域时，```ModularRealmAuthenticator``` 依赖于内部的 ```AuthenticationStrategy``` 组件来确定身份验证尝试成功或失败的条件。

<table  id="AuthenticationStrategy" class="table table-bordered table-hover">
    <tr>
        <th>AuthenticationStrategy 类</th>
        <th>描述</th>
    </tr>
    <tr>
        <td>AtLeastOneSuccessfulStrategy</td>
        <td>如果一个或多个领域成功验证，则将考虑整体尝试成功。如果没有一个验证成功，则尝试失败。</td>
    </tr>
    <tr>
        <td>FirstSuccessfulStrategy</td>
        <td>仅使用从第一个成功验证的领域返回的信息。所有后续领域将被忽略。如果没有一个验证成功，则尝试失败。</td>
    </tr>
    <tr>
        <td>AllSuccessfulStrategy</td>
        <td>所有配置的领域必须成功验证才能考虑整体尝试成功。如果有任何一个验证不成功，则尝试失败。</td>
    </tr>
</table>

1、这里定义了三个用于测试的领域：

- FirstRealm    ryo/123  成功，返回 ryo/123

- SecondRealm   wang/123 成功，返回 wang/123   

- ThirdRealm    ryo/123 成功，返回 ryo@gmail.com/123

2、shiro-authenticator-all-success.ini

```ModularRealmAuthenticator``` 默认使用 ```AtLeastOneSuccessfulStrategy``` 实现，因为这是最常用的策略。

但是，如果需要，您可以配置不同的策略。

```
[main]
#point out securityManager's authenticator  
authenticator=org.apache.shiro.authc.pam.ModularRealmAuthenticator  
securityManager.authenticator=$authenticator  
  
#Point out securityManager.authenticator's authenticationStrategy  
allSuccessfulStrategy=org.apache.shiro.authc.pam.AllSuccessfulStrategy  
securityManager.authenticator.authenticationStrategy=$allSuccessfulStrategy  

#Define and use realms
firstRealm=com.ryo.shiro.FirstRealm
secondRealm=com.ryo.shiro.SecondRealm
thirdRealm=com.ryo.shiro.ThirdRealm
securityManager.realms=$firstRealm,$thirdRealm
```

3、AuthenticatorTest.java

```java
@Test
public void testAllSuccessfulStrategyWithSuccess() {
    Subject subject = getSubjectByPath("classpath:shiro-authenticator-all-success.ini");

    UsernamePasswordToken token = new UsernamePasswordToken("ryo", "123");
    subject.login(token);

    PrincipalCollection principalCollection = subject.getPrincipals();
    assertEquals("ryo,ryo@gmail.com", principalCollection.toString());
}

private Subject getSubjectByPath(String configFilePath) {
    Factory<SecurityManager> factory = new IniSecurityManagerFactory(configFilePath);

    SecurityManager securityManager = factory.getInstance();
    SecurityUtils.setSecurityManager(securityManager);
    return SecurityUtils.getSubject();
}
```

```<label class="label label-info">提示</label>```

如果您想自己创建自己的 ```AuthenticationStrategy``` 实现，您可以使用 ```org.apache.shiro.authc.pam.AbstractAuthenticationStrategy``` 作为起点。

- OnlyOneAuthenticatorStrategy.java

```java
public class OnlyOneAuthenticatorStrategy extends AbstractAuthenticationStrategy {
    //Simply returns the aggregate argument without modification.
    @Override
    public AuthenticationInfo beforeAllAttempts(Collection<? extends Realm> realms, AuthenticationToken token) throws AuthenticationException {
        return super.beforeAllAttempts(realms, token);
    }

    //Simply returns the aggregate method argument, without modification.
    @Override
    public AuthenticationInfo beforeAttempt(Realm realm, AuthenticationToken token, AuthenticationInfo aggregate) throws AuthenticationException {
        return super.beforeAttempt(realm, token, aggregate);
    }

    /**
     * Base implementation that will aggregate the specified singleRealmInfo into the aggregateInfo and then returns the aggregate.
     * @param realm the realm that was just consulted for AuthenticationInfo for the given token.
     * @param token the AuthenticationToken submitted for the subject attempting system log-in.
     * @param singleRealmInfo the info returned from a single realm.    单个realm信息
     * @param aggregateInfo the aggregate info representing all realms in a multi-realm environment.    总信息
     * @param t the Throwable thrown by the Realm during the attempt, or null if the method returned normally.
     * @return
     * @throws AuthenticationException
     */
    @Override
    public AuthenticationInfo afterAttempt(Realm realm, AuthenticationToken token, AuthenticationInfo singleRealmInfo, AuthenticationInfo aggregateInfo, Throwable t) throws AuthenticationException {
        AuthenticationInfo info;

        if(singleRealmInfo == null) {
            info = aggregateInfo;
        } else if(aggregateInfo == null) {
            info = singleRealmInfo;
        } else {
            info = merge(singleRealmInfo, aggregateInfo);

            if(info.getPrincipals().getRealmNames().size() > 1) {
                throw new AuthenticationException("Authentication token of type [" + token.getClass() + "] " +
                        "could not be authenticated by any configured realms.  Please ensure that only one realm can " +
                        "authenticate these tokens.");
            }
        }

        return info;
    }

    //Merges the specified info argument into the aggregate argument and then returns an aggregate for continued use throughout the login process.
    @Override
    protected AuthenticationInfo merge(AuthenticationInfo info, AuthenticationInfo aggregate) {
        return super.merge(info, aggregate);
    }

    //Base implementation that will aggregate the specified singleRealmInfo into the aggregateInfo and then returns the aggregate.
    @Override
    public AuthenticationInfo afterAllAttempts(AuthenticationToken token, AuthenticationInfo aggregate) throws AuthenticationException {
        return super.afterAllAttempts(token, aggregate);
    }
}
```


- shiro-authenticator-onlyone-success.ini

```ini
[main]
authenticator=org.apache.shiro.authc.pam.ModularRealmAuthenticator
securityManager.authenticator=$authenticator

onlyOneAuthenticatorStrategy=com.ryo.shiro.authenticator.strategy.OnlyOneAuthenticatorStrategy
securityManager.authenticator.authenticationStrategy=$onlyOneAuthenticatorStrategy

#define and uer realms.
firstRealm=com.ryo.shiro.FirstRealm
secondRealm=com.ryo.shiro.SecondRealm
securityManager.realms=$firstRealm,$secondRealm
```

- test()

```java
@Test
    public void testOnlyOneAuthenticatorStrategy() {
        Subject subject = getSubjectByPath("classpath:shiro-authenticator-onlyone-success.ini");

        UsernamePasswordToken token = new UsernamePasswordToken("ryo", "123");
        subject.login(token);

        PrincipalCollection principalCollection = subject.getPrincipals();
        assertEquals("ryo", principalCollection.toString());
    }
```

- if you change the *shiro-authenticator-onlyone-success.ini* into

```ini
#define and uer realms.
firstRealm=com.ryo.shiro.FirstRealm
thirdRealm=com.ryo.shiro.ThirdRealm
securityManager.realms=$firstRealm,$thirdRealm
```

You will get an error as following.

```
org.apache.shiro.authc.AuthenticationException: Authentication token of type [class org.apache.shiro.authc.UsernamePasswordToken] 
could not be authenticated by any configured realms.  Please ensure that only one realm can authenticate these tokens.
```
 
* any list
{:toc}