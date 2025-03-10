---
layout: post
title: IM 即时通讯系统 SSO 系列-05-swagger 文档整合
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# swagger 文档接入

将项目与 swagger 进行整合，所有 controller 和 dto 添加对应的注解，为了解耦，入参使用 dto，复制后调用底层实体。


# 整体流程

## pom.xml

引入依赖

```xml
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger2</artifactId>
	<version>3.0.0</version>
</dependency>
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger-ui</artifactId>
	<version>3.0.0</version>
</dependency>
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-boot-starter</artifactId>
	<version>3.0.0</version>
</dependency>
<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
    <version>2.0.1.Final</version>
</dependency>
```

## 启动配置项

- SwaggerConfig

```java
@Configuration
public class SwaggerConfig {
    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.example.ssobackend.controller"))
                .paths(PathSelectors.any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("SSO后台管理系统API文档")
                .description("单点登录系统接口说明")
                .version("1.0")
                .build();
    }
}
```


## 对象解耦

我们创建一下实体对应的 Dto，避免频繁调整 entity。

然后调整对应的 UserController 实现。

这里以 User 为例子。

### DTO

```java
@ApiModel("用户传输对象")
public class UserDTO {
    @ApiModelProperty(value = "用户ID", example = "1")
    private Long id;
    
    @ApiModelProperty(value = "用户名", required = true, example = "john_doe")
    private String username;
    
    @ApiModelProperty(value = "密码", required = true, example = "password123")
    private String password;
```

### controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping
    @ApiOperation("创建用户")
    public ResponseEntity<?> create(@RequestBody @Valid UserDTO userDTO) {
        User user = new User();
        BeanUtils.copyProperties(userDTO, user);
        return ResponseEntity.ok(userService.insert(user));
    }

    @PutMapping
    @ApiOperation("更新用户")
    public ResponseEntity<?> update(@RequestBody @Valid UserDTO userDTO) {
        User user = new User();
        BeanUtils.copyProperties(userDTO, user);
        return ResponseEntity.ok(userService.update(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return ResponseEntity.ok(userService.delete(id));
    }

    @GetMapping("/{id}")
    @ApiOperation("根据ID获取用户")
    public ResponseEntity<?> getById(@PathVariable @ApiParam(value = "用户ID", example = "1") Long id) {
        return ResponseEntity.ok(userService.selectById(id));
    }
}
```

## 测试验证

### 启动

报错

```
Error starting ApplicationContext. To display the conditions report re-run your application with 'debug' enabled.
2025-03-10 15:33:53.823 ERROR 8680 --- [           main] o.s.boot.SpringApplication               : Application run failed

org.springframework.context.ApplicationContextException: Failed to start bean 'documentationPluginsBootstrapper'; nested exception is java.lang.NullPointerException
	at org.springframework.context.support.DefaultLifecycleProcessor.doStart(DefaultLifecycleProcessor.java:181) ~[spring-context-5.3.20.jar:5.3.20]
	at org.springframework.context.support.DefaultLifecycleProcessor.access$200(DefaultLifecycleProcessor.java:54) ~[spring-context-5.3.20.jar:5.3.20]
	at org.springframework.context.support.DefaultLifecycleProcessor$LifecycleGroup.start(DefaultLifecycleProcessor.java:356) ~[spring-context-5.3.20.jar:5.3.20]
	at java.lang.Iterable.forEach(Iterable.java:75) ~[na:1.8.0_192]
	at org.springframework.context.support.DefaultLifecycleProcessor.startBeans(DefaultLifecycleProcessor.java:155) ~[spring-context-5.3.20.jar:5.3.20]
	at org.springframework.context.support.DefaultLifecycleProcessor.onRefresh(DefaultLifecycleProcessor.java:123) ~[spring-context-5.3.20.jar:5.3.20]
	at org.springframework.context.support.AbstractApplicationContext.finishRefresh(AbstractApplicationContext.java:935) ~[spring-context-5.3.20.jar:5.3.20]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:586) ~[spring-context-5.3.20.jar:5.3.20]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:147) ~[spring-boot-2.7.0.jar:2.7.0]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:734) [spring-boot-2.7.0.jar:2.7.0]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:408) [spring-boot-2.7.0.jar:2.7.0]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:308) [spring-boot-2.7.0.jar:2.7.0]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1306) [spring-boot-2.7.0.jar:2.7.0]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1295) [spring-boot-2.7.0.jar:2.7.0]
	at com.example.ssobackend.SsoBackendApplication.main(SsoBackendApplication.java:9) [classes/:na]
Caused by: java.lang.NullPointerException: null
	at springfox.documentation.spring.web.WebMvcPatternsRequestConditionWrapper.getPatterns(WebMvcPatternsRequestConditionWrapper.java:56) ~[springfox-spring-webmvc-3.0.0.jar:3.0.0]
	at springfox.documentation.RequestHandler.sortedPaths(RequestHandler.java:113) ~[springfox-core-3.0.0.jar:3.0.0]
	at springfox.documentation.spi.service.contexts.Orderings.lambda$byPatternsCondition$3(Orderings.java:89) ~[springfox-spi-3.0.0.jar:3.0.0]
	at java.util.Comparator.lambda$comparing$77a9974f$1(Comparator.java:469) ~[na:1.8.0_192]
	at java.util.TimSort.countRunAndMakeAscending(TimSort.java:355) ~[na:1.8.0_192]
	at java.util.TimSort.sort(TimSort.java:220) ~[na:1.8.0_192]
	at java.util.Arrays.sort(Arrays.java:1512) ~[na:1.8.0_192]
	at java.util.ArrayList.sort(ArrayList.java:1462) ~[na:1.8.0_192]
	at java.util.stream.SortedOps$RefSortingSink.end(SortedOps.java:387) ~[na:1.8.0_192]
	at java.util.stream.Sink$ChainedReference.end(Sink.java:258) ~[na:1.8.0_192]
	at java.util.stream.Sink$ChainedReference.end(Sink.java:258) ~[na:1.8.0_192]
	at java.util.stream.Sink$ChainedReference.end(Sink.java:258) ~[na:1.8.0_192]
	at java.util.stream.Sink$ChainedReference.end(Sink.java:258) ~[na:1.8.0_192]
	at java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:482) ~[na:1.8.0_192]
	at java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:471) ~[na:1.8.0_192]
	at java.util.stream.ReduceOps$ReduceOp.evaluateSequential(ReduceOps.java:708) ~[na:1.8.0_192]
	at java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:234) ~[na:1.8.0_192]
	at java.util.stream.ReferencePipeline.collect(ReferencePipeline.java:499) ~[na:1.8.0_192]
	at springfox.documentation.spring.web.plugins.WebMvcRequestHandlerProvider.requestHandlers(WebMvcRequestHandlerProvider.java:81) ~[springfox-spring-webmvc-3.0.0.jar:3.0.0]
	at java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:193) ~[na:1.8.0_192]
	at java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1382) ~[na:1.8.0_192]
	at java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:481) ~[na:1.8.0_192]
	at java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:471) ~[na:1.8.0_192]
	at java.util.stream.ReduceOps$ReduceOp.evaluateSequential(ReduceOps.java:708) ~[na:1.8.0_192]
	at java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:234) ~[na:1.8.0_192]
	at java.util.stream.ReferencePipeline.collect(ReferencePipeline.java:499) ~[na:1.8.0_192]
	at springfox.documentation.spring.web.plugins.AbstractDocumentationPluginsBootstrapper.withDefaults(AbstractDocumentationPluginsBootstrapper.java:107) ~[springfox-spring-web-3.0.0.jar:3.0.0]
	at springfox.documentation.spring.web.plugins.AbstractDocumentationPluginsBootstrapper.buildContext(AbstractDocumentationPluginsBootstrapper.java:91) ~[springfox-spring-web-3.0.0.jar:3.0.0]
	at springfox.documentation.spring.web.plugins.AbstractDocumentationPluginsBootstrapper.bootstrapDocumentationPlugins(AbstractDocumentationPluginsBootstrapper.java:82) ~[springfox-spring-web-3.0.0.jar:3.0.0]
	at springfox.documentation.spring.web.plugins.DocumentationPluginsBootstrapper.start(DocumentationPluginsBootstrapper.java:100) ~[springfox-spring-web-3.0.0.jar:3.0.0]
	at org.springframework.context.support.DefaultLifecycleProcessor.doStart(DefaultLifecycleProcessor.java:178) ~[spring-context-5.3.20.jar:5.3.20]
	... 14 common frames omitted
```


spring boot 2.6.x或更高版本集成Swagger时，直接运行会出现异常信息报错（空指针），主要原因是：Spring Boot 2.6及 更高版本使用的默认路径匹配规则是PathPatternMatcher，而Springfox使用的路径匹配是基于AntPathMatcher的。

所以这里需要更改一下SpringBoot配置。

```yaml
spring:
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher
```

如果是 proerties 配置文件：

```proerties
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```


重新启动成功

### 访问

配置完成后启动SpringBoot项目，访问 http://localhost:8080/swagger-ui/index.html 或 http://localhost:8080/swagger-ui/ 即可看到生成的接口文档。

可以直接看到 swagger 对应的测试页面。

### 验证

直接找一个 company controller 测试一下创建。

然后数据库查询一下

```
mysql> select * from company \G;
*************************** 1. row ***************************
         id: 1
       name: string
create_time: 2025-03-10 15:42:39
update_time: 2025-03-10 15:42:39
1 row in set (0.00 sec)
```

数据已经正确的入库。

# 参考资料

* any list
{:toc}