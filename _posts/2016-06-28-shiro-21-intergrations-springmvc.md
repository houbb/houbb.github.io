---
layout: post
title: Shiro-09-shiro 整合 springmvc 实战及源码详解
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 序言

前面我们学习了如下内容：

[5 分钟入门 shiro 安全框架实战笔记](https://www.toutiao.com/i6910927630845919756/)

[shiro 整合 spring 实战及源码详解](https://houbb.github.io/2016/08/11/shiro-20-intergrations-spring)

相信大家对于 shiro 已经有了最基本的认识，这一节我们一起来学习写如何将 shiro 与 springmvc 进行整合。


# spring mvc 整合源码

## maven 依赖

- 版本号

```xml
<properties>
    <jetty.version>9.4.34.v20201102</jetty.version>
    <shiro.version>1.7.0</shiro.version>
    <spring.version>5.2.8.RELEASE</spring.version>
    <taglibs.standard.version>1.2.5</taglibs.standard.version>
</properties>
```

- shiro 相关依赖

```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-core</artifactId>
    <version>${shiro.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-spring</artifactId>
    <version>${shiro.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-web</artifactId>
    <version>${shiro.version}</version>
</dependency>
```

- 其他依赖

主要是 servlet、spring、数据库和 tags

```xml
<dependency>
    <groupId>javax.annotation</groupId>
    <artifactId>javax.annotation-api</artifactId>
    <version>1.3.2</version>
</dependency>
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>3.1.0</version>
    <scope>provided</scope>
</dependency>

<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>${spring.version}</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>${spring.version}</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>${spring.version}</version>
</dependency>

<dependency>
    <groupId>org.hsqldb</groupId>
    <artifactId>hsqldb</artifactId>
    <version>2.5.0</version>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>org.apache.taglibs</groupId>
    <artifactId>taglibs-standard-spec</artifactId>
    <version>${taglibs.standard.version}</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.apache.taglibs</groupId>
    <artifactId>taglibs-standard-impl</artifactId>
    <version>${taglibs.standard.version}</version>
    <scope>runtime</scope>
</dependency>
```

- jetty

依赖于 jetty 作为容器启动：

```xml
<plugin>
    <groupId>org.eclipse.jetty</groupId>
    <artifactId>jetty-maven-plugin</artifactId>
    <version>${jetty.version}</version>
    <configuration>
        <httpConnector>
            <port>8080</port>
        </httpConnector>
        <webApp>
            <contextPath>/</contextPath>
        </webApp>
    </configuration>
</plugin>
```

## 配置

- applicaiton.properties

主要指定了 shiro 相关的配置

```
# Let Shiro Manage the sessions
shiro.userNativeSessionManager = true

# disable URL session rewriting
shiro.sessionManager.sessionIdUrlRewritingEnabled = false
# 登录地址
shiro.loginUrl = /s/login
# 登录成功
shiro.successUrl = /s/index
# 未授权
shiro.unauthorizedUrl = /s/unauthorized
```

## LoginController 登录控制器

我们首先来看一下后端的登录控制器：

```java
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Spring MVC controller responsible for authenticating the user.
 *
 * @since 0.1
 */
@Component
@RequestMapping("/s/login")
public class LoginController {

    private static transient final Logger log = LoggerFactory.getLogger(LoginController.class);

    private static String loginView = "login";

    @RequestMapping(method = RequestMethod.GET)
    protected String view() {
        return loginView;
    }

    @RequestMapping(method = RequestMethod.POST)
    protected String onSubmit(@RequestParam("username") String username,
                              @RequestParam("password") String password,
                              Model model) throws Exception {
        UsernamePasswordToken token = new UsernamePasswordToken(username, password);

        try {
            SecurityUtils.getSubject().login(token);
        } catch (AuthenticationException e) {
            log.debug("Error authenticating.", e);
            model.addAttribute("errorInvalidLogin", "The username or password was not correct.");

            return loginView;
        }

        return "redirect:/s/index";
    }
}
```

登录的校验非常简单，直接根据页面的账户密码，然后执行登录校验。


## LogoutController 登出控制器

登出直接调用对应的 logout 方法，并且重定向到登录页面。

```java
import org.apache.shiro.SecurityUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Controller responsible for logging out the current user by invoking
 * {@link org.apache.shiro.subject.Subject#logout()}
 *
 * @since 0.1
 */
@Component
@RequestMapping("/s/logout")
public class LogoutController extends AbstractController {

    @RequestMapping(method = RequestMethod.GET)
    protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
        SecurityUtils.getSubject().logout();
        return new ModelAndView("redirect:login");
    }
}
```

## 核心组件

当然，上面的实现看起来非常简单。

### 数据准备

实际上还有一些用户的账户密码信息准备，是直接通过 `BootstrapDataPopulator` 类实现的，将账户信息存储到内存数据库 hsqldb 中。

### SaltAwareJdbcRealm

针对领域信息的获取实现如下：

```java
import org.apache.shiro.authc.*;
import org.apache.shiro.realm.jdbc.JdbcRealm;
import org.apache.shiro.util.ByteSource;
import org.apache.shiro.util.JdbcUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Realm that exists to support salted credentials.  The JdbcRealm implementation needs to be updated in a future
 * Shiro release to handle this.
 */
public class SaltAwareJdbcRealm extends JdbcRealm {

    private static final Logger log = LoggerFactory.getLogger(SaltAwareJdbcRealm.class);

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        UsernamePasswordToken upToken = (UsernamePasswordToken) token;
        String username = upToken.getUsername();

        // Null username is invalid
        if (username == null) {
            throw new AccountException("Null usernames are not allowed by this realm.");
        }

        Connection conn = null;
        AuthenticationInfo info = null;
        try {
            conn = dataSource.getConnection();

            String password = getPasswordForUser(conn, username);

            if (password == null) {
                throw new UnknownAccountException("No account found for user [" + username + "]");
            }

            SimpleAuthenticationInfo saInfo = new SimpleAuthenticationInfo(username, password, getName());
            /**
             * This (very bad) example uses the username as the salt in this sample app.  DON'T DO THIS IN A REAL APP!
             *
             * Salts should not be based on anything that a user could enter (attackers can exploit this).  Instead
             * they should ideally be cryptographically-strong randomly generated numbers.
             */
            saInfo.setCredentialsSalt(ByteSource.Util.bytes(username));

            info = saInfo;

        } catch (SQLException e) {
            final String message = "There was a SQL error while authenticating user [" + username + "]";
            if (log.isErrorEnabled()) {
                log.error(message, e);
            }

            // Rethrow any SQL errors as an authentication exception
            throw new AuthenticationException(message, e);
        } finally {
            JdbcUtils.closeConnection(conn);
        }

        return info;
    }

    private String getPasswordForUser(Connection conn, String username) throws SQLException {

        PreparedStatement ps = null;
        ResultSet rs = null;
        String password = null;
        try {
            ps = conn.prepareStatement(authenticationQuery);
            ps.setString(1, username);

            // Execute query
            rs = ps.executeQuery();

            // Loop over results - although we are only expecting one result, since usernames should be unique
            boolean foundResult = false;
            while (rs.next()) {

                // Check to ensure only one row is processed
                if (foundResult) {
                    throw new AuthenticationException("More than one user row found for user [" + username + "]. Usernames must be unique.");
                }

                password = rs.getString(1);

                foundResult = true;
            }
        } finally {
            JdbcUtils.closeResultSet(rs);
            JdbcUtils.closeStatement(ps);
        }

        return password;
    }

}
```

这里直接通过默认的 sql

```sql
select password from users where username = ?
```

获取账户信息，然后进行最简单的加密验证。

## web.xml 配置

细心的小伙伴也许发现了，这个 mvc 项目中没有 web.xml 文件。

那么，一般需要指定的配置是如何指定的呢？

官方给出的案例有另外一个配置类实现了这个功能。

```java
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;
import java.util.EnumSet;

/**
 * Initializes Spring Environment without the need for a web.xml
 */
public class ServletApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) {
        //now add the annotations
        AnnotationConfigWebApplicationContext appContext = getContext();

        // Manage the lifecycle of the root application context
        container.addListener(new ContextLoaderListener(appContext));

        FilterRegistration.Dynamic shiroFilter = container.addFilter("shiroFilterFactoryBean", DelegatingFilterProxy.class);
        shiroFilter.setInitParameter("targetFilterLifecycle", "true");
        shiroFilter.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), false, "/*");


        ServletRegistration.Dynamic remotingDispatcher = container.addServlet("remoting", new DispatcherServlet(appContext));
        remotingDispatcher.setLoadOnStartup(1);
        remotingDispatcher.addMapping("/remoting/*");


        ServletRegistration.Dynamic dispatcher = container.addServlet("DispatcherServlet", new DispatcherServlet(appContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }

    private AnnotationConfigWebApplicationContext getContext() {
        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.setConfigLocation(getClass().getPackage().getName());
        return context;
    }

}
```

## 授权方法

当然，不同的用户登录的权限不同，肯定是因为我们定义了不同的权限。

```java
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.apache.shiro.authz.annotation.RequiresRoles;


/**
 * Business manager interface used for sample application.
 *
 * @since 0.1
 */
public interface SampleManager {

    /**
     * Method that requires <tt>role1</tt> in order to be invoked.
     */
    @RequiresRoles("role1")
    void secureMethod1();

    /**
     * Method that requires <tt>role2</tt> in order to be invoked.
     */
    @RequiresRoles("role2")
    void secureMethod2();

    /**
     * Method that requires <tt>permission1</tt> in order to be invoked.
     */
    @RequiresPermissions("permission2")
    void secureMethod3();
}
```

这里通过 `@RequiresRoles` 和 `@RequiresPermissions` 指定了方法访问需要的角色或者权限。

# 实战效果

为了便于大家学习，上述代码已经全部开源：

> [https://github.com/houbb/shiro-inaction/tree/master/shiro-inaction-02-springmvc](https://github.com/houbb/shiro-inaction/tree/master/shiro-inaction-02-springmvc)

## 登录页面

启动程序，浏览器直接访问 [http://localhost:8080/](http://localhost:8080/)，会被重定向到登录页面。

![登录](https://images.gitee.com/uploads/images/2021/0110/002546_bade0351_508704.png "shiro-mvc-login.png")

## user1 登录

我们使用 user1 登录：

![user1 登录](https://images.gitee.com/uploads/images/2021/0110/002821_6667c82d_508704.png "shiro-login-user1.png")

## user2 登录

我们使用 user2 登录：

![user2 登录](https://images.gitee.com/uploads/images/2021/0110/002841_778814b6_508704.png "shiro-login-user2.png")

## 登出

直接点击页面的登出链接，就可以实现登出。

# 实现原理

## 思考

现在，老马和大家一起思考一个问题。

我们在 application.properties 文件中指定了对应的登录/登出路径，那么 shiro 是如何映射并且执行的呢？

答案就是 Filter。

针对每一个请求，shiro 会判断请求的 url 是否和我们指定的 url 匹配，并且调用对应的 filter，然后出发对应的方法。

实际上 shiro 中有很多内置的 filter 实现，我们选取其中的几个做下介绍。

## 登录验证 Filter

### 匿名

最简单的就是所有的用户都可以访问，实现也最简单：

```java
import org.apache.shiro.web.filter.PathMatchingFilter;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

 * @since 0.9
 */
public class AnonymousFilter extends PathMatchingFilter {

    /**
     * Always returns <code>true</code> allowing unchecked access to the underlying path or resource.
     *
     * @return <code>true</code> always, allowing unchecked access to the underlying path or resource.
     */
    @Override
    protected boolean onPreHandle(ServletRequest request, ServletResponse response, Object mappedValue) {
        // Always return true since we allow access to anyone
        return true;
    }

}
```

这种适合登录页面之类的，比如可以指定如下

```
/user/signup/** = anon
```

### form 表单提交

还有比较常用的就是 form 表单提交，springboot 整合的时候甚至可以省略掉我们写的登录校验实现。

```java
/**
 * <p>If you would prefer to handle the authentication validation and login in your own code, consider using the
 * {@link PassThruAuthenticationFilter} instead, which allows requests to the
 * {@link #loginUrl} to pass through to your application's code directly.
 *
 * @see PassThruAuthenticationFilter
 * @since 0.9
 */
public class FormAuthenticationFilter extends AuthenticatingFilter {

    //TODO - complete JavaDoc

    public static final String DEFAULT_ERROR_KEY_ATTRIBUTE_NAME = "shiroLoginFailure";

    public static final String DEFAULT_USERNAME_PARAM = "username";
    public static final String DEFAULT_PASSWORD_PARAM = "password";
    public static final String DEFAULT_REMEMBER_ME_PARAM = "rememberMe";

    private static final Logger log = LoggerFactory.getLogger(FormAuthenticationFilter.class);

    private String usernameParam = DEFAULT_USERNAME_PARAM;
    private String passwordParam = DEFAULT_PASSWORD_PARAM;
    private String rememberMeParam = DEFAULT_REMEMBER_ME_PARAM;

    private String failureKeyAttribute = DEFAULT_ERROR_KEY_ATTRIBUTE_NAME;

    public FormAuthenticationFilter() {
        setLoginUrl(DEFAULT_LOGIN_URL);
    }

    @Override
    public void setLoginUrl(String loginUrl) {
        String previous = getLoginUrl();
        if (previous != null) {
            this.appliedPaths.remove(previous);
        }
        super.setLoginUrl(loginUrl);
        if (log.isTraceEnabled()) {
            log.trace("Adding login url to applied paths.");
        }
        this.appliedPaths.put(getLoginUrl(), null);
    }

    //...
}
```

当然可以有很多种方式，主要就是构建出登录的账户密码信息。

这里继承自 `AuthenticatingFilter` 实现类，会调用对应的登录方法：

```java
protected boolean executeLogin(ServletRequest request, ServletResponse response) throws Exception {
    AuthenticationToken token = createToken(request, response);
    if (token == null) {
        String msg = "createToken method implementation returned null. A valid non-null AuthenticationToken " +
                "must be created in order to execute a login attempt.";
        throw new IllegalStateException(msg);
    }
    try {
        Subject subject = getSubject(request, response);
        subject.login(token);
        return onLoginSuccess(token, subject, request, response);
    } catch (AuthenticationException e) {
        return onLoginFailure(token, e, request, response);
    }
}
```

## 登出验证 Filter

shiro 也为我们实现了内置的登出过滤器。

```java
/**
 * Simple Filter that, upon receiving a request, will immediately log-out the currently executing
 * {@link #getSubject(javax.servlet.ServletRequest, javax.servlet.ServletResponse) subject}
 * and then redirect them to a configured {@link #getRedirectUrl() redirectUrl}.
 *
 * @since 1.2
 */
public class LogoutFilter extends AdviceFilter {
    
    //...

    /**
     * Acquires the currently executing {@link #getSubject(javax.servlet.ServletRequest, javax.servlet.ServletResponse) subject},
     * a potentially Subject or request-specific
     * {@link #getRedirectUrl(javax.servlet.ServletRequest, javax.servlet.ServletResponse, org.apache.shiro.subject.Subject) redirectUrl},
     * and redirects the end-user to that redirect url.
     *
     * @param request  the incoming ServletRequest
     * @param response the outgoing ServletResponse
     * @return {@code false} always as typically no further interaction should be done after user logout.
     * @throws Exception if there is any error.
     */
    @Override
    protected boolean preHandle(ServletRequest request, ServletResponse response) throws Exception {

        // 获取主题信息
        Subject subject = getSubject(request, response);

        // 检测是否只支持 POST 方式登出
        // Check if POST only logout is enabled
        if (isPostOnlyLogout()) {

            // check if the current request's method is a POST, if not redirect
            if (!WebUtils.toHttp(request).getMethod().toUpperCase(Locale.ENGLISH).equals("POST")) {
                // 返回对应的非 post 登出的响应
               return onLogoutRequestNotAPost(request, response);
            }
        }

        // 获取重定向的地址
        String redirectUrl = getRedirectUrl(request, response, subject);
        //try/catch added for SHIRO-298:
        try {
            // 执行登出方法
            subject.logout();
        } catch (SessionException ise) {
            log.debug("Encountered session exception during logout.  This can generally safely be ignored.", ise);
        }
        issueRedirect(request, response, redirectUrl);
        return false;
    }

    //...
}
```

## 授权验证 Filter

### RolesAuthorizationFilter 角色授权过滤器

```java
import java.io.IOException;
import java.util.Set;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.CollectionUtils;


/**
 * Filter that allows access if the current user has the roles specified by the mapped value, or denies access
 * if the user does not have all of the roles specified.
 *
 * @since 0.9
 */
public class RolesAuthorizationFilter extends AuthorizationFilter {

    //TODO - complete JavaDoc

    @SuppressWarnings({"unchecked"})
    public boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) throws IOException {
        // 获取当前主题
        Subject subject = getSubject(request, response);
        // 获取需要的角色列表
        String[] rolesArray = (String[]) mappedValue;

        if (rolesArray == null || rolesArray.length == 0) {
            //no roles specified, so nothing to check - allow access.
            return true;
        }

        // 判断是否拥有指定的角色
        Set<String> roles = CollectionUtils.asSet(rolesArray);
        return subject.hasAllRoles(roles);
    }

}
```

### PermissionsAuthorizationFilter 权限授权过滤器

```java
import java.io.IOException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.shiro.subject.Subject;

/**
 * Filter that allows access if the current user has the permissions specified by the mapped value, or denies access
 * if the user does not have all of the permissions specified.
 *
 * @since 0.9
 */
public class PermissionsAuthorizationFilter extends AuthorizationFilter {

    public boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) throws IOException {
        // 获取主题
        Subject subject = getSubject(request, response);
        // 需要的权限
        String[] perms = (String[]) mappedValue;

        boolean isPermitted = true;
        if (perms != null && perms.length > 0) {
            if (perms.length == 1) {
                // 如果列表长度为1，进行校验
                if (!subject.isPermitted(perms[0])) {
                    isPermitted = false;
                }
            } else {
                // 如果需要多个，执行校验
                if (!subject.isPermittedAll(perms)) {
                    isPermitted = false;
                }
            }
        }

        return isPermitted;
    }
}
```

# 小结

这一节我们讲解了如何整合 springmvc 与 shiro，可以发现 shiro 内置了非常多的实现，帮助我们简化登录的设计实现。

不过使用过 springboot 的小伙伴都知道，我们的实现可以变得更加简化。

可以阅读 springboot 与 shiro 的整合：

> [shiro 整合 springboot 实战笔记](https://www.toutiao.com/item/6913925968646226443/)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}