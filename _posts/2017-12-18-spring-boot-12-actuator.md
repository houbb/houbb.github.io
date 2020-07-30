---
layout: post
title:  Spring Boot-12-监控 Actuator
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# Actuator 介绍

Actuator 是 SpringBoot 项目中一个非常强大一个功能，有助于对应用程序进行监视和管理，通过 restful api 请求来监管、审计、收集应用的运行情况。

Actuator 的核心是端点 Endpoint，它用来监视应用程序及交互，spring-boot-actuator 中已经内置了非常多的 Endpoint（health、info、beans、metrics、httptrace、shutdown等等），同时也允许我们自己扩展自己的 Endpoints。

每个 Endpoint 都可以启用和禁用。

要远程访问 Endpoint，还必须通过 JMX 或 HTTP 进行暴露，大部分应用选择HTTP，Endpoint 的ID默认映射到一个带 /actuator 前缀的URL。

例如，health 端点默认映射到 /actuator/health。


# Actuator 使用

启用 Actuator 最简单方式是添加 spring-boot-starter-actuator ‘Starter’依赖。 

## maven 引入

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.2.RELEASE</version>
        <relativePath/>
    </parent>

    <modelVersion>4.0.0</modelVersion>

    <artifactId>springboot-learn-actuator</artifactId>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

</project>
```

## application.yml

```yml
management:
  endpoints:
    # 暴露 EndPoint 以供访问，有jmx和web两种方式，exclude 的优先级高于 include
    jmx:
      exposure:
        exclude: '*'
        include: '*'
    web:
      exposure:
      # exclude: '*'
        include: ["health","info","beans","mappings","logfile","metrics","shutdown","env"]
      base-path: /actuator  # 配置 Endpoint 的基础路径
      cors: # 配置跨域资源共享
        allowed-origins: http://example.com
        allowed-methods: GET,POST
    enabled-by-default: true # 修改全局 endpoint 默认设置
  endpoint:
    auditevents: # 1、显示当前引用程序的审计事件信息，默认开启
      enabled: true
      cache:
        time-to-live: 10s # 配置端点缓存响应的时间
    beans: # 2、显示一个应用中所有 Spring Beans 的完整列表，默认开启
      enabled: true
    conditions: # 3、显示配置类和自动配置类的状态及它们被应用和未被应用的原因，默认开启
      enabled: true
    configprops: # 4、显示一个所有@ConfigurationProperties的集合列表，默认开启
      enabled: true
    env: # 5、显示来自Spring的 ConfigurableEnvironment的属性，默认开启
      enabled: true
    flyway: # 6、显示数据库迁移路径，如果有的话，默认开启
      enabled: true
    health: # 7、显示健康信息，默认开启
      enabled: true
      show-details: always
    info: # 8、显示任意的应用信息，默认开启
      enabled: true
    liquibase: # 9、展示任何Liquibase数据库迁移路径，如果有的话，默认开启
      enabled: true
    metrics: # 10、展示当前应用的metrics信息，默认开启
      enabled: true
    mappings: # 11、显示一个所有@RequestMapping路径的集合列表，默认开启
      enabled: true
    scheduledtasks: # 12、显示应用程序中的计划任务，默认开启
      enabled: true
    sessions: # 13、允许从Spring会话支持的会话存储中检索和删除(retrieval and deletion)用户会话。使用Spring Session对反应性Web应用程序的支持时不可用。默认开启。
      enabled: true
    shutdown: # 14、允许应用以优雅的方式关闭，默认关闭
      enabled: true
    threaddump: # 15、执行一个线程dump
      enabled: true
    # web 应用时可以使用以下端点
    heapdump: # 16、    返回一个GZip压缩的hprof堆dump文件，默认开启
      enabled: true
    jolokia: # 17、通过HTTP暴露JMX beans（当Jolokia在类路径上时，WebFlux不可用），默认开启
      enabled: true
    logfile: # 18、返回日志文件内容（如果设置了logging.file或logging.path属性的话），支持使用HTTP Range头接收日志文件内容的部分信息，默认开启
      enabled: true
    prometheus: #19、以可以被Prometheus服务器抓取的格式显示metrics信息，默认开启
      enabled: true
```


大抵就是全部默认的 Endpoint 的配置了，怎么样？强大吧！之前做了一个网络监控的项目，就是能够实时查看服务器的 CPU、内存、磁盘、IO 这些（基于 sigar.jar 实现），然后现在发现 SpringBoot 就这样轻松支持了，还更强大，更简便......

默认的 Endpoint 映射前缀是 /actuator，可以通过如上 base-path 自定义设置。

每个 Endpoint 都可以配置开启或者禁用。但是仅仅开启 Endpoint 是不够的，还需要通过 jmx 或者 web 暴露他们，通过 exclude 和 include 属性配置。

## 效果

比如查看健康情况：

[http://127.0.0.1:8080/actuator/health](http://127.0.0.1:8080/actuator/health)

结果如下：

```
{"status":"UP","details":{"diskSpace":{"status":"UP","details":{"total":127083565056,"free":46642671616,"threshold":10485760}}}}
```

# 自定义 Endpoint

自定义 Endpoint 端点，只需要在我们的新建Bean上使用 `@Endpoint` 注解即可。

则 Bean 中的方法就可以通过 JMX 或者 HTTP 公开。

除此之外，你还可以使用 `@JmxEndpoint` 或 `@WebEndpoint` 编写 EndPoint。

但是这些 EndPoint 仅限于各自的公开方式。例如，@WebEndpoint 仅通过HTTP公开，而不通过JMX公开。

那么是不是类中所有的方法都支持对外公开呢？很明显不是的。

这里又要提到三个注解，只有加三个注解的方法才支持对外公开，并且每个注解都有支持它的 HTTP method。

如下：

| Operation	| HTTP method |
|:---|:---|
| @ReadOperation	GET |
| @WriteOperation	POST |
| @DeleteOperation	| DELETE |

Endpoint 上的操作通过参数接收输入。 
 
当通过网络公开时，这些参数的值取自URL的查询参数和JSON请求主体。 
 
通过JMX公开时，参数将映射到MBean操作的参数。
 
参数默认是必需的,可以通过使用 @Nullable 注释使其成为可选的。

可以通过使用 `@Selector` 注释操作方法的一个或多个参数来进一步定制路径。@Selector 会将路径上的参数作为变量传递给操作方法。
 
这个注解有点诡异，且听我徐徐道来~~

## Endpoint Bean

```java
@Component
@Endpoint(id = "my", enableByDefault = true) //设置 id，并选择是否默认开启
public class MyEndPoint {

    @ReadOperation
    public List<String> getPaths() {
        List<String> list = new ArrayList<>();
        list.add("java");
        list.add("c++");
        list.add("python");
        return list;
    }

    @ReadOperation
    public String get(@Selector String arg0) {
        return arg0;
    }
    @WriteOperation
    public String post() {
        return "post";
    }

    @DeleteOperation
    public Integer delete() {
        return 1;
    }
}
```

## 暴露 Endpoint

设置好了上面的 Endpoint Bean，还不能真正的访问到它们，需要在 application.yml 中将它们暴露出来：

```yml
management:
  endpoints:
    # 暴露 EndPoint 以供访问，有jmx和web两种方式，exclude 的优先级高于 include
    jmx:
      exposure:
        exclude: '*'
        include: '*'
    web:
      exposure:
      # exclude: '*'
        include: ["health","info","beans","mappings","logfile","metrics","shutdown","env","my"]
```

做好这些配置后，你就能访问到 Endpoint 了（http://127.0.0.1:8080/actuator/my）

## @Selector

注意到没有，上面的 Endpoint 有一个 `@Selector` 参数的方法，并且参数名是 arg0，这个参数名是有学问滴......

原来我给的参数名是 path，原来我设想我可以访问 `/actuator/my/[任意字符]` 的路径，但是会报 400 参数不匹配错误。

但是嘞，`/actuator/my/[任意字符]?path=[任意字符]` 是正常访问的，真是奇了怪了！。

原来，为了使 @Selector 正常工作，必须使用嵌入的参数名称编译 Endpoint（`-parameters`），如下。

或者将参数名改为 arg0 就能达到目的。

[这个是 stackoverflow 上的一个解释~](https://stackoverflow.com/questions/47920201/how-do-you-use-selector-in-writeoperation-in-spring-boot-2-0-actuator-endp)

ps: 这个应该是 jdk7 参数名称反射导致的。

```xml
<plugins>
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <configuration>
            <compilerArgs>
                <arg>-parameters</arg>
            </compilerArgs>
        </configuration>
    </plugin>
    <!-- 或者：
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.7.0</version>
        <configuration>
            <parameters>true</parameters>
        </configuration>
    </plugin>
    -->
</plugins>
```

# 参考资料

[SpringBoot 之Actuator](https://www.cnblogs.com/jmcui/p/9820579.html)

* any list
{:toc}
