---
layout: post
title:  web privilege security 安全框架-04-okta
date: 2024-08-04 21:01:55 +0800
categories: [Web]
tags: [web, privilege, safe, web, sf]
published: true
---

MethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@EnableWebFluxSecurity 
@EnableReactiveMethodSecurity 
public class SecurityConfiguration {

    @Bean 
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .authorizeExchange()
                .anyExchange().authenticated()
                .and()
            .oauth2ResourceServer()
                .jwt();
                
        // 向浏览器发送401消息（没有这个，您将看到一个空白页面）
        Okta.configureResourceServer401ResponseBody(http);
                
        return http.build();
    }
}
```

如果您想在同一应用程序中支持SSO和资源服务器，也可以做到！

```java
@EnableWebFluxSecurity 
@EnableReactiveMethodSecurity 
public class SecurityConfiguration {

    @Bean 
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .authorizeExchange()
                .anyExchange().authenticated()
                .and()
            .oauth2Login()
            .and()
            .oauth2ResourceServer()
                .jwt();
        return http.build();
    }
}
```

[使用Spring WebFlux、WebSockets和React的全栈响应式](https://developer.okta.com/blog/2018/09/25/spring-webflux-websockets-react) 使用了SSO和资源服务器。其当前代码使用了Spring Security的OIDC支持。[更改为使用Okta Spring Starter](https://github.com/oktadeveloper/okta-spring-webflux-react-example/pull/11) 大大减少了代码行数。

## 支持服务器端应用程序 - OAuth代码流

正在构建服务器端应用程序，只需要重定向到登录页面？这个OAuth 2.0代码流适合您。

### 在Okta上创建Web应用程序

要在Okta上为Spring Boot创建新的OIDC应用程序：

1. 登录到您的开发者账户，导航到**应用程序**，点击**添加应用程序**。
2. 选择**Web**，然后点击**下一步**。
3. 给应用程序命名，并添加 `http://localhost:8080/login/oauth2/code/okta` 作为登录重定向URI。
4. 点击**完成**。

### 配置属性

您可以使用环境变量、系统属性或配置文件配置应用程序属性。查看[Spring Boot文档](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)了解更多详情。

| 属性 | 必需 | 详情 |
|----------|---------|---------|
| okta.oauth2.issuer     | 是 | [授权服务器](/docs/how-to/set-up-auth-server.html)发行者URL，例如：https://{yourOktaDomain}/oauth2/default |
| okta.oauth2.clientId   | 是 | 您的Okta OIDC应用程序的客户端ID |
| okta.oauth2.clientSecret   | 是 | 您的Okta OIDC应用程序的客户端密钥 |
| okta.oauth2.postLogoutRedirectUri | 否 | 设置为相对或绝对URI以启用[RP-Initiated (SSO)登出](https://developer.okta.com/blog/2020/03/27/spring-oidc-logout-options)。  |

**注意**：设置**postLogoutRedirectUri**后，您的会话结束后将被重定向到它。因此，此资源必须是匿名可访问的，因此请确保将其添加到您的`HttpSecurity`配置中。

<details>
<summary>查看 <code>postLogoutRedirectUri</code> 示例：</summary>

```yaml
okta:
  oauth2:
    postLogoutRedirectUri: "http://localhost:8080/logout/callback"
```

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            // 允许匿名访问根和登出页面
            .antMatchers("/", "/logout/callback").permitAll()
            // 所有其他请求
            .anyRequest().authenticated();
        return http.build();
    }
}
```

</details>

### 创建简单应用程序

创建一个最小的Spring Boot应用程序：

```java
@RestController
@SpringBootApplication
public class ExampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExampleApplication.class, args);
    }

    @GetMapping("/")
    public String getMessageOfTheDay(@AuthenticationPrincipal OidcUser user) {
        return user.getName() + ", 今天的消息很无聊";
    }
}
```

如果您想允许特定路由的匿名访问，可以添加一个`SecurityFilterChain` bean：

```java
@Configuration
static class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers("/my-anon-page").permitAll()
                .anyRequest().authenticated()
            .and().oauth2Client()
            .and().oauth2Login();
        return http.build();
    }
}
```

如果您想为自定义授权服务器中的JWT令牌添加自定义声明，请参阅[为令牌添加自定义声明](https://developer.okta.com/docs/guides/customize-tokens-returned-from-okta/add-custom-claim/)以获取更多信息。

然后，您可以通过以下方式从令牌中提取属性：

```java
@RestController
public class ExampleController {

    @GetMapping("/email")
    public String getUserEmail(AbstractOAuth2TokenAuthenticationToken authentication) {
        // AbstractOAuth2TokenAuthenticationToken适用于JWT和不透明访问令牌
        return (String) authentication.getTokenAttributes().get("sub");
    }
}
```

### 在Web服务器之间共享会话

授权代码流（典型的OAuth重定向）使用会话。如果您的应用程序有多个实例，您必须配置[Spring Session](https://docs.spring.io/spring-session/docs/current/reference/html5/)实现，例如Redis、Hazelcast、JDBC等。

### 就是这样！

在您喜欢的浏览器中打开 <http://localhost:8080>。

您将自动重定向到Okta登录页面。成功登录后，您将被重定向回您的应用程序，您将看到每日消息！

此模块与Spring Security的OAuth支持集成，您所需要做的就是用标准的`@EnableOAuth2Client`注释标记您的应用程序。

## 使用Spring Native

您可以将此启动器与[Spring Native](https://github.com/spring-projects-experimental/spring-native)一起使用。但是，您需要在主Spring Boot应用程序类中启用HTTPS。例如：

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.nativex.hint.NativeHint;

@NativeHint(options = "--enable-https")
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

您也可以在`pom.xml`或`build.gradle`中配置此设置。查看[Spring Native文档](https://docs.spring.io/spring-native/docs/current/reference/htmlsingle/#native-image-options)了解更多信息。

## 代理

如果您的应用程序（带有此okta-spring-boot依赖项）在网络代理后面运行，您可以在application.yml中为其设置属性：
```yaml
okta:
  oauth2:
    proxy:
      host: "proxy.example.com"
      port: 7000
      username: "your-username"             # 可选
      password: "your-secret-password"      # 可选
```

或者，您可以像这样向应用程序添加JVM参数：

```bash
-Dokta.oauth2.proxy.host=proxy.example.com
-Dokta.oauth2.proxy.port=port
-Dokta.oauth2.proxy.username=your-username
-Dokta.oauth2.proxy.password=your-secret-password
```

或者，您可以像这样以编程方式设置它：

```java
System.setProperty("okta.oauth2.proxy.host", "proxy.example.com");
System.setProperty("okta.oauth2.proxy.port", "7000");
System.setProperty("okta.oauth2.proxy.username", "your-username");
System.setProperty("okta.oauth2.proxy.password", "your-secret-password");
```

查看[这里](https://docs.oracle.com/javase/8/docs/api/java/net/doc-files/net-properties.html)获取属性的完整列表。

**注意：** Spring WebFlux（和`WebClient`）不支持这些属性。（见[spring-projects/spring-security#8882](https://github.com/spring-projects/spring-security/issues/8882)）。

如果您在反向代理后面运行Spring Boot应用程序，请务必阅读[此](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto-use-behind-a-proxy-server)指南。

# 在应用程序中注入Okta Java SDK

要将[Okta Java SDK](https://github.com/okta/okta-sdk-java)集成到您的Spring Boot应用程序中，您只需要添加一个依赖项：

```xml
<dependency>
    <groupId>com.okta.spring</groupId>
    <artifactId>okta-spring-sdk</artifactId>
</dependency>
```

然后定义`okta.client.token`属性。查看[创建API令牌](https://developer.okta.com/docs/api/getting_started/getting_a_token)了解更多信息。

剩下的就是注入客户端（`com.okta.sdk.client.Client`）了！查看[这篇文章](https://spring.io/blog/2007/07/11/setter-injection-versus-constructor-injection-and-the-use-of-required/)了解更多关于以最佳方式注入您的bean的信息。

# 额外学分

想构建这个项目吗？

只需克隆它并运行：

```bash
$ git clone https://github.com/okta/okta-spring-boot.git 
$ cd okta-spring-boot
$ mvn install
```




* any list
{:toc}