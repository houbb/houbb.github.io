---
layout: post
title:  web 实战-09-springboot 文件上传最大大小限制
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# springboot 全局异常

```java
import com.alibaba.fastjson.JSON;
import com.huifu.hongpos.profit.application.constants.Constant;
import com.huifu.hongpos.profit.application.constants.RespCode;
import io.undertow.server.handlers.form.MultiPartParserDefinition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@ResponseBody
@Slf4j
public class CommonExceptionAdvice {

    @ResponseStatus(HttpStatus.OK)
    @ExceptionHandler(MultiPartParserDefinition.FileTooLargeException.class)
    public String fileTooLarge(MultiPartParserDefinition.FileTooLargeException e) {
        log.error("文件过大异常", e);
        return "文件太大";
    }

}
```

# 设置文件大小限制

## springboot-1.x

```
spring.http.multipart.max-file-size=100mb
spring.http.multipart.max-request-size=1000mb
```

## springboot-2.x

```
#设置上传APP的大小限制
spring.servlet.multipart.max-file-size=100Mb
spring.servlet.multipart.max-request-size=100Mb
```

## 定义 Bean 

```java
@Configuration
public class UploadConfig {
 
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        //单个文件最大
        factory.setMaxFileSize("20480KB"); //KB,MB
        /// 设置总上传数据总大小
        factory.setMaxRequestSize("1024000KB");
        return factory.createMultipartConfig();
    }
}
```


# undertow 异常无法捕获

## maven 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
```


版本：springboot 1.5x

## 配置设置

```yml
# 文件上传限制
spring.http.multipart.maxFileSize=10MB
spring.http.multipart.maxRequestSize=100MB
```

## 全局异常

```java
// 上传文件过大
@ExceptionHandler(value = { MaxUploadSizeExceededException.class })
public Object maxUploadSizeExceededException(HttpServletRequest request, HttpServletResponse response,
		MaxUploadSizeExceededException exception) throws IOException {
	return this.errorHandler(request, response,
			Message.fail(HttpStatus.BAD_REQUEST, "文件大小不能超过:" + exception.getMaxUploadSize()), exception);
}
```

## 处理

如果上传比较小的文件，那么一切正常，如果上传比较大的文件，直接异常，且无法捕获：

```
Caused by: io.undertow.server.handlers.form.MultiPartParserDefinition$FileTooLargeException: UT000054: The maximum size 8388608 for an individual file in a multipart request was exceeded
	at io.undertow.server.handlers.form.MultiPartParserDefinition$MultiPartUploadHandler.data(MultiPartParserDefinition.java:262)
	at io.undertow.util.MultipartParser$IdentityEncoding.handle(MultipartParser.java:365)
	at io.undertow.util.MultipartParser$ParseState.entity(MultipartParser.java:343)
	at io.undertow.util.MultipartParser$ParseState.parse(MultipartParser.java:131)
	at io.undertow.server.handlers.form.MultiPartParserDefinition$MultiPartUploadHandler.parseBlocking(MultiPartParserDefinition.java:222)
	at io.undertow.servlet.spec.HttpServletRequestImpl.parseFormData(HttpServletRequestImpl.java:792)
	... 37 common frames omitted
```

[MaxUploadSizeExceededException cannot be caught with undertow](https://github.com/spring-projects/spring-boot/issues/18914)

发现这个是官方说的一个确实存在问题。

## 解决方案

网上有一些让舍弃 undertow，直接使用 tomcat 的。

我这边无法直接修改容器，影响比较大。于是直接想在前端做一下校验。

### 前端限制大小

```html
<input type="file" id="file1" />

<script>
var size = $("#file1")[0].files[0].size;
</script>
```

加一个简单的判断即可：

```js
// 文件大小，最大为 8M
var size = fileInput[0].files[0].size;
if(size > 8 * 1000 * 1000) {
	alert("文件大小不可超过 8M!");
	return;
}
```

# 参考资料

[导出excel (返回页面方式)](https://www.cnblogs.com/forever2h/p/6836938.html)

[spring boot 上传附件文件过大时,没法捕捉异常(二)](https://www.jianshu.com/p/8f02ee86dd65)

[springboot设置文件上传大小，默认是1mb](https://blog.csdn.net/qq_33243189/article/details/89631495)

[springBoot 全局异常捕捉（里面包含个各种常见异常）](https://blog.csdn.net/zllww123/article/details/80549397)

[springBoot设置文件上传大小限制](https://blog.csdn.net/AIfurture/article/details/101421576)

[SpringBoot2.0与Undertow容器采坑笔录](https://www.jianshu.com/p/c171eed87f95)

[SpringBoot之设置上传文件大小](https://blog.csdn.net/belalds/article/details/86248116)

[MaxUploadSizeExceededException cannot be caught with undertow](https://github.com/spring-projects/spring-boot/issues/18914)

[Jquery 获取上传文件大小](https://www.cnblogs.com/sgciviolence/p/5608434.html)

* any list
{:toc}