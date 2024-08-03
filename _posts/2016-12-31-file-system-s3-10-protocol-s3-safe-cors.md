---
layout: post
title: 文件存储服务系统-10-S3 CORS（跨源资源共享）
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [ftp, file]
published: true
---

# chat

## 详细介绍一下 s3 CORS

Amazon S3 的 CORS（跨源资源共享）是一种机制，用于允许或限制来自不同域的 web 应用程序访问存储桶中的资源。

CORS 使得浏览器能够在跨域请求中发送和接收数据，从而解决了同源策略带来的限制。

### CORS 基本概念

**同源策略**：浏览器的安全机制，限制从一个源（域名、协议和端口）加载的文档或脚本如何与另一个源进行交互。

CORS 允许开发者跨越这种限制，安全地访问资源。

### CORS 的工作原理

1. **预检请求（Preflight Request）**：
   - 在实际请求之前，浏览器会发送一个 HTTP OPTIONS 请求，以检查服务器是否允许实际的跨源请求。
   - 预检请求包括请求方法（如 GET、POST）和请求头信息，以帮助服务器决定是否允许实际请求。

2. **实际请求（Actual Request）**：
   - 如果预检请求通过，浏览器会发送实际的跨源请求。
   - 服务器在响应中包含 CORS 相关的头部，告诉浏览器是否允许该请求。

### 配置 CORS

要配置 S3 存储桶的 CORS 策略，你需要为存储桶设置一个 CORS 配置文件。该文件是一个 XML 文档或 JSON 对象，定义了允许的跨源请求的规则。配置示例如下：

#### CORS 配置示例

**JSON 格式配置**：

```json
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "POST"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
```

**XML 格式配置**：

```xml
<CORSConfiguration>
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
        <ExposeHeader>ETag</ExposeHeader>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
    </CORSRule>
</CORSConfiguration>
```

### 配置解释

- **AllowedHeaders**：指定允许的请求头。`*` 表示允许所有请求头。
- **AllowedMethods**：指定允许的 HTTP 方法，如 `GET`、`POST`、`PUT`、`DELETE` 等。
- **AllowedOrigins**：指定允许的来源（域名）。`*` 表示允许所有域名。
- **ExposeHeaders**：指定允许浏览器访问的响应头部。
- **MaxAgeSeconds**：指定浏览器可以缓存预检请求的结果的时间，以减少预检请求的频率。

### 设置 CORS 配置

你可以使用 AWS 管理控制台、AWS CLI 或 SDK 来设置 S3 存储桶的 CORS 配置。

**使用 AWS CLI 设置 CORS 配置**：

1. 创建一个 CORS 配置文件（如 `cors.json`）。
2. 运行以下命令将配置应用到存储桶：

   ```bash
   aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
   ```

**使用 AWS 管理控制台设置 CORS 配置**：

1. 登录到 AWS 管理控制台。
2. 进入 S3 服务，选择目标存储桶。
3. 转到“权限”选项卡，点击“CORS 配置”。
4. 编辑并保存 CORS 配置。

### 示例应用场景

1. **前端应用访问存储桶**：
   - 如果你的前端应用（如 React 或 Angular 应用）需要从 S3 存储桶中加载资源（如图片、视频），你需要配置 CORS 以允许来自你应用的跨源请求。

2. **Web 应用跨域请求**：
   - 当你的 Web 应用需要与其他域上的服务交互时（如从不同域的 S3 存储桶获取数据），CORS 允许这种跨域访问。

### CORS 与其他访问控制机制的关系

- **ACL 和存储桶策略**：CORS 主要处理跨域请求的安全性和允许性，而 ACL 和存储桶策略则控制谁可以访问存储桶中的资源。

CORS 配置和这些权限控制机制可以一起使用，以实现全面的访问控制和安全策略。

## 为什么 s3 需要 cors 控制？

Amazon S3 需要 CORS（跨源资源共享）控制的主要原因是为了允许或限制不同域的 web 应用程序安全地访问存储桶中的资源。

以下是详细解释：

### 1. **解决浏览器的同源策略限制**

- **同源策略**：浏览器的同源策略限制了从一个域发出的脚本只能访问与之同源（相同域、协议、端口）的资源。这个策略旨在保护用户数据和防止恶意网站窃取敏感信息。
- **跨源请求**：在现代 Web 应用中，前端代码（如 JavaScript）经常需要从不同的域（如 CDN 或 API 服务器）请求资源。CORS 允许这种跨域访问，前提是服务端同意。

### 2. **支持 Web 应用的功能**

- **资源共享**：CORS 使得 Web 应用可以从不同域访问资源，例如，从一个存储在 S3 存储桶中的图片或文件，或通过 API 请求获得数据。
- **跨域集成**：前端应用可能需要集成第三方服务（如分析工具、广告服务），这些服务可能托管在不同域上。CORS 使得这些集成变得可能。

### 3. **安全性控制**

- **控制访问范围**：通过 CORS 配置，S3 可以精细地控制哪些域可以访问存储桶中的资源。这提供了一层额外的安全性，防止未授权的域访问敏感数据。
- **限制方法和头部**：CORS 配置允许指定允许的 HTTP 方法和请求头，帮助确保只有预期的操作被执行，进一步减少潜在的安全风险。

### 4. **支持多样化的客户端**

- **不同客户端需求**：现代 Web 应用可能在不同的平台和客户端上运行（如浏览器、移动应用）。CORS 确保这些不同的客户端能够安全地与存储桶交互。
- **API 调用**：Web 应用或前端 JavaScript 代码可能需要通过 API 调用与 S3 交互（如上传文件、获取资源）。CORS 配置允许这种交互，而不违反浏览器的同源策略。

### 5. **简化跨域资源访问**

- **无需服务器代理**：没有 CORS，跨域请求通常需要通过代理服务器来绕过同源策略。CORS 直接在浏览器和服务端之间提供了一个标准化的方式来处理这些请求，从而简化了开发和架构。

### 6. **提高用户体验**

- **无缝集成**：通过配置 CORS，开发者可以实现更灵活和无缝的资源访问，改善用户体验。例如，用户在一个 Web 应用中上传文件到 S3 存储桶，而无需重定向或使用中间服务器。

### 示例应用场景

- **Web 应用访问存储桶中的图片**：一个前端应用需要从 S3 存储桶加载图片，CORS 配置允许来自应用域的请求。
- **跨域 API 请求**：一个单页面应用（SPA）从不同域的 S3 存储桶请求 JSON 数据，CORS 允许这种请求。
- **CDN 内容分发**：通过设置 CORS，CDN 可以从 S3 存储桶获取和缓存内容，用户从 CDN 加载资源时能够正确处理跨域请求。

### 总结

CORS 是为了在保持安全性的前提下，允许来自不同域的 web 应用访问 Amazon S3 存储桶中的资源。

它解决了浏览器的同源策略限制，并提供了一个灵活、安全的方式来管理跨域资源访问。

通过配置 CORS，S3 能够支持广泛的 Web 应用需求，同时确保数据访问的安全性。

## 我们如果是 java springboot 程序，如何实现 cors 控制？

在 Java Spring Boot 程序中，实现 CORS 控制可以通过多种方式，具体取决于你的需求。下面详细介绍几种常见的方法来配置 CORS：

### 1. **全局 CORS 配置**

如果你希望在整个应用程序中统一配置 CORS 规则，可以使用 Spring Boot 的 `WebMvcConfigurer` 接口。这样，你可以设置所有控制器的 CORS 策略。

**示例代码**：

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://example.com") // 允许的域名
                .allowedMethods("GET", "POST", "PUT", "DELETE") // 允许的 HTTP 方法
                .allowedHeaders("*") // 允许的请求头
                .allowCredentials(true) // 是否允许发送凭证（如 Cookies）
                .maxAge(3600); // 预检请求的缓存时间（秒）
    }
}
```

### 2. **针对特定控制器或方法的 CORS 配置**

如果你只想对某些特定的控制器或方法应用 CORS 配置，可以使用 `@CrossOrigin` 注解。这种方法适用于细粒度的配置需求。

**示例代码**：

```java
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MyController {

    @CrossOrigin(origins = "http://example.com")
    @GetMapping("/data")
    public String getData() {
        return "Data from API";
    }
}
```

### 3. **使用 Filter 配置 CORS**

如果需要更灵活的 CORS 配置或与其他过滤器集成，可以使用 Spring 的 `Filter` 实现。

**示例代码**：

```java
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import org.springframework.stereotype.Component;

@Component
public class CorsFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 初始化配置
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        httpServletResponse.setHeader("Access-Control-Allow-Origin", "http://example.com");
        httpServletResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        httpServletResponse.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        httpServletResponse.setHeader("Access-Control-Max-Age", "3600");
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // 清理资源
    }
}
```

### 4. **使用 Spring Boot 属性配置**

在 Spring Boot 2.4 及以上版本，你可以通过 `application.properties` 或 `application.yml` 文件进行简单的 CORS 配置。

**`application.properties` 示例**：

```properties
spring.mvc.cors.allowed-origins=http://example.com
spring.mvc.cors.allowed-methods=GET,POST,PUT,DELETE
spring.mvc.cors.allowed-headers=*
spring.mvc.cors.allow-credentials=true
spring.mvc.cors.max-age=3600
```

**`application.yml` 示例**：

```yaml
spring:
  mvc:
    cors:
      allowed-origins: "http://example.com"
      allowed-methods: GET, POST, PUT, DELETE
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

### 配置选择的总结

- **全局 CORS 配置**：适用于希望在整个应用中统一管理 CORS 策略的场景。
- **特定控制器或方法的配置**：适用于需要细粒度控制的场景，方便对特定的 API 设置不同的 CORS 策略。
- **Filter 配置**：适用于需要在 CORS 之外进行复杂处理的场景，例如与其他 HTTP 过滤器结合使用。
- **属性配置**：适用于简单的 CORS 设置，方便快捷，但功能较为有限。

选择哪种方法取决于你的应用需求和具体场景。

如果你需要统一管理 CORS 设置，推荐使用全局配置；如果只对部分 API 需要特殊设置，可以使用 `@CrossOrigin` 注解。

* any list
{:toc}