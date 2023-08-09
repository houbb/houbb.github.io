---
layout: post
title: Byte Buddy-02-替换类实现
date:  2019-10-30 10:18:00 +0800
categories: [Java]
tags: [java, bytecode, sf]
published: true
---

# 替换类实现

##  maven 引入 

```xml
<dependencies>
    <dependency>
        <groupId>net.bytebuddy</groupId>
        <artifactId>byte-buddy</artifactId>
        <version>1.8.0</version>
    </dependency>
    <dependency>
        <groupId>net.bytebuddy</groupId>
        <artifactId>byte-buddy-agent</artifactId>
        <version>1.8.0</version>
    </dependency>
</dependencies>
```

## 测试类定义

- Log.java

```java
public class Log {

    public static void log(String a) {

        System.out.println("Log: " + a);
    }

}
```

- Log4j.java

```java
public class Log4j {

    /**
     * 注意代理类要和原实现类的方法声明保持一致
     * @param a
     */
    public static void log(String a) {
        System.err.println("Log4j: " + a);
    }

}
```

## 替换测试

- main()

将 log 的实现替换为 log4j

```java
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.agent.ByteBuddyAgent;
import net.bytebuddy.dynamic.loading.ClassReloadingStrategy;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.matcher.ElementMatchers;

public class LogMain {

    public static void main(String[] args) {
        // 替换
        ByteBuddyAgent.install();
        new ByteBuddy().redefine(Log.class)
                .method(ElementMatchers.named("log"))
                .intercept(MethodDelegation.to(Log4j.class))
                .make()
                .load(Thread.currentThread().getContextClassLoader(), ClassReloadingStrategy.fromInstalledAgent());

        // 调用
        Log.log("hello");
    }

}
```

- 日志输出

```java
Log4j: hello
```

# 个人感受

比起 spring aop，感觉依赖更少，也更加优雅。

# 参考资料

[基于 ByteBuddy 运行时动态修改字节码](https://lzxz1234.cn/archives/168)

* any list
{:toc}
