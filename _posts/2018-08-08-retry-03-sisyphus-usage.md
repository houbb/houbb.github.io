---
layout: post
title: 更好的 java 重试框架 sisyphus 的 3 种使用方式
date:  2018-08-08 17:46:57 +0800
categories: [Java]
tags: [java, retry]
published: true
---

# 回顾

我们前面学习了

[更好的 java 重试框架 sisyphus 入门简介](https://juejin.cn/post/7021143985192189982)

[更好的 java 重试框架 sisyphus 配置的 2 种方式介绍](https://juejin.cn/post/7021496945055105032)

[更好的 java 重试框架 sisyphus 背后的故事](https://juejin.cn/post/7020767222687612964)

> [java 重试框架 sisyphus 开源地址](https://github.com/houbb/sisyphus) https://github.com/houbb/sisyphus

这一节让我们一起学习下 sisyphus 的 3 种使用方式。

# sisyphus 代理模板

## 目的

为了便于用户更加方便地使用注解，同时又不依赖 spring。

提供基于代码模式+字节码增强实现的方式。

# 使用案例

## maven 引入

引入注解相关模块。

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sisyphus-annotation</artifactId>
    <version>0.0.9</version>
</dependency>
```

## 定义测试方法

以下测试代码可以参考 [spring-test]() 模块。

- MenuServiceImpl.java

```java
public class MenuServiceImpl {

    public void queryMenu(long id) {
        System.out.println("查询菜单...");
        throw new RuntimeException();
    }

    @Retry
    public void queryMenuRetry(long id) {
        System.out.println("查询菜单...");
        throw new RuntimeException();
    }

}
```

## 测试

使用 RetryTemplate 进行测试

### 无重试注解的方法

```java
@Test(expected = RuntimeException.class)
public void templateTest() {
    MenuServiceImpl menuService = RetryTemplate.getProxyObject(new MenuServiceImpl());
    menuService.queryMenu(1);
}
```

- 日志信息

```
查询菜单...
```

只请求了一次。

### 有注解的方法

```java
@Test(expected = RuntimeException.class)
public void templateRetryTest() {
    MenuServiceImpl menuService = RetryTemplate.getProxyObject(new MenuServiceImpl());
    menuService.queryMenuRetry(1);
}
```

- 日志信息

```
查询菜单...
查询菜单...
查询菜单...
```

# sisyphus spring 整合

## 目的

类似于 spring-retry 框架，如果你使用 spring 框架，那么整合本项目将会非常简单。

注解的方式和过程式编程，二者尽可能的保持一致性，你想从一种方式变为另一种也比较简单。

想从  spring-retry 切换到本框架也很方便。

## maven 引入

```xml
<dependency>
    <groupId>${project.groupId}</groupId>
    <artifactId>sisyphus-spring</artifactId>
    <version>${project.version}</version>
</dependency>
```

会默认引入 spring 以及 AOP 相关 jar。

## 业务代码

你可以参考 sisyphus-test 模块。

下面模拟非常常见的一些业务方法。

使用 `@Retry` 标识方法需要进行重试。

- SpringService.java

```java
public interface SpringService {

    /**
     * 查询示例代码
     * @return 结果
     */
    String query();

}
```

- SpringServiceImpl.java

```java
import com.github.houbb.sisyphus.annotation.annotation.Retry;
import com.github.houbb.sisyphus.test.service.SpringService;
import org.springframework.stereotype.Service;

/**
 * @author binbin.hou
 * @since 0.0.4
 */
@Service
public class SpringServiceImpl implements SpringService {

    @Override
    @Retry
    public String query() {
        System.out.println("spring service query...");
        throw new RuntimeException();
    }

}
```

## 开启重试

基于注解直接如下配置即可。

使用 `@EnableRetry` 标识需要开启重试。

```java
@Configurable
@ComponentScan(basePackages = "com.github.houbb.sisyphus.test.service")
@EnableRetry
public class SpringConfig {
}
```

## 测试代码

```java
import com.github.houbb.sisyphus.test.config.SpringConfig;
import com.github.houbb.sisyphus.test.service.SpringService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author binbin.hou
 * @since 0.0.4
 */
@ContextConfiguration(classes = SpringConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class SpringServiceTest {

    @Autowired
    private SpringService springService;

    @Test(expected = RuntimeException.class)
    public void queryTest() {
        springService.query();
    }

}
```

- 日志信息

```
spring service query...
spring service query...
spring service query...
```

# sisyphus springboot 整合

## 目的

类似于 spring-retry 框架，如果你使用 springboot 框架，那么整合本项目将会非常简单。

注解的方式和过程式编程，二者尽可能的保持一致性，你想从一种方式变为另一种也比较简单。

想从  spring-retry 切换到本框架也很方便。

整体与 spring 整合类似，而且更加简单。

## maven 引入

```xml
<dependency>
    <groupId>${project.groupId}</groupId>
    <artifactId>sisyphus-springboot-starter</artifactId>
    <version>${project.version}</version>
</dependency>
```

会默认引入 springboot 整合相关的依赖。

## 业务代码

你可以参考 sisyphus-test springboot 测试模块。

下面模拟非常常见的一些业务方法。

使用 `@Retry` 标识方法需要进行重试。

- SpringService.java

```java
public interface SpringService {

    /**
     * 查询示例代码
     * @return 结果
     */
    String query();

}
```

- SpringServiceImpl.java

```java
import com.github.houbb.sisyphus.annotation.annotation.Retry;
import com.github.houbb.sisyphus.test.service.SpringService;
import org.springframework.stereotype.Service;

/**
 * @author binbin.hou
 * @since 0.0.4
 */
@Service
public class SpringServiceImpl implements SpringService {

    @Override
    @Retry
    public String query() {
        System.out.println("spring service query...");
        throw new RuntimeException();
    }

}
```

## 测试代码

- SisyphusApplicationTest.java

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SisyphusApplication.class)
public class SisyphusApplicationTest {

    @Autowired
    private SpringService springService;

    @Test(expected = RuntimeException.class)
    public void queryTest() {
        springService.query();
    }

}
```

其中 SisyphusApplication.java 代码如下：

就是最基本的 springboot 启动入口。

```java
@SpringBootApplication
@ComponentScan(basePackages = "com.github.houbb.sisyphus.test.service")
public class SisyphusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SisyphusApplication.class, args);
    }

}
```

- 日志信息

```
spring service query...
spring service query...
spring service query...
```

# 小结

3 种使用方式基本可以满足日常开发中的各种场景。

> [java 重试框架 sisyphus 开源地址](https://github.com/houbb/sisyphus)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

* any list
{:toc}