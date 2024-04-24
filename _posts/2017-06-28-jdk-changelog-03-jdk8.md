---
layout: post
title: jdk 变更日志-03-JDK8 
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---

# 拓展阅读

[Java Functional java 函数式编程](https://houbb.github.io/2017/06/29/java-functional)

[Java Lambda](https://houbb.github.io/2017/06/28/java-lambda)

# Q: 详细介绍一下 jdk8 有哪些新特性。

当然，JDK 8 是 Java 平台的一个里程碑版本，引入了许多重要的新特性和改进。

以下是 JDK 8 中的一些主要新特性：

1. **Lambda 表达式**：Lambda 表达式是 JDK 8 中引入的一个核心特性，它提供了一种更简洁的语法来表示匿名函数。Lambda 表达式可以使代码更加简洁和可读，特别是在集合操作和函数式编程中。

   ```java
   // 使用 Lambda 表达式来替代匿名内部类
   List<String> list = Arrays.asList("apple", "banana", "orange");
   list.forEach(item -> System.out.println(item));
   ```

2. **Stream API**：Stream API 提供了一种新的抽象来处理集合数据。它使得开发者可以轻松地进行复杂的数据操作，如过滤、映射、排序等，而无需编写冗长的代码。

   ```java
   // 使用 Stream API 进行数据过滤和映射
   List<String> filteredList = list.stream()
                                   .filter(item -> item.startsWith("a"))
                                   .map(String::toUpperCase)
                                   .collect(Collectors.toList());
   ```

3. **接口的默认方法和静态方法**：JDK 8 允许在接口中定义默认方法和静态方法，这使得接口可以有一些实现，而不仅仅是抽象方法。

   ```java
   public interface MyInterface {
       default void defaultMethod() {
           System.out.println("Default method");
       }
       
       static void staticMethod() {
           System.out.println("Static method");
       }
   }
   ```

4. **新的日期和时间 API**：JDK 8 引入了一个全新的日期和时间 API，提供了更加灵活和强大的日期和时间处理能力。

   ```java
   LocalDate today = LocalDate.now();
   LocalTime now = LocalTime.now();
   LocalDateTime dateTime = LocalDateTime.now();
   ```

5. **Optional 类**：Optional 是一个容器对象，用于包装可能为 null 的值。它鼓励开发者更加注意处理 null 值，从而减少空指针异常的风险。

   ```java
   Optional<String> optional = Optional.ofNullable(null);
   String value = optional.orElse("default");
   ```

6. **新的 JavaScript 引擎 Nashorn**：JDK 8 引入了 Nashorn，一个基于 JVM 的新的 JavaScript 引擎，使得 Java 和 JavaScript 之间的交互更加容易。

7. **并行数组操作**：JDK 8 提供了新的方法来支持并行数组操作，可以提高数组处理的效率。

   ```java
   Arrays.parallelSort(array);
   ```

这些只是 JDK 8 中的一些主要新特性，还有其他许多小的改进和优化，这些新特性都为 Java 开发者提供了更加强大和灵活的工具。

# 官方笔记

https://www.oracle.com/java/technologies/javase/8all-relnotes.html

https://www.oracle.com/java/technologies/javase/8-whats-new.html

### Java编程语言

**Lambda表达式**  
在此版本中引入了Lambda表达式作为新的语言特性。它们使你能够将功能性视为方法参数，或将代码视为数据。Lambda表达式让你更紧凑地表示单方法接口（称为功能性接口）的实例。

**方法引用**  
为已有名称的方法提供了易于阅读的Lambda表达式。

**默认方法**  
允许在库的接口中添加新功能，并确保与旧版本的代码二进制兼容性。

**重复注解**  
提供了将同一注解类型应用到同一声明或类型使用上的能力。

**类型注解**  
允许在任何使用类型的地方应用注解，而不仅仅是在声明上。与可插拔类型系统一起使用，此功能可以改进代码的类型检查。

**改进的类型推断**  
**方法参数反射**

### 集合

**流API**  
新的`java.util.stream`包中的类提供了流API，支持对元素流进行功能性操作。流API集成到集合API中，使得可以对集合进行批量操作，如顺序或并行的映射-归约转换。

**HashMap性能改进**  
处理键冲突时的性能改进。

**紧凑配置文件**  
包含Java SE平台的预定义子集，使得不需要整个平台的应用程序可以在小型设备上部署和运行。

### 安全性

**默认启用客户端TLS 1.2**  
**AccessController.doPrivileged的新变体**  
**更强的基于密码的加密算法**  
**SSL/TLS Server Name Indication (SNI)扩展支持**  
**AEAD算法支持**  
**KeyStore增强**  
**SHA-224消息摘要**  
**增强的NSA Suite B加密支持**  
**更好的高熵随机数生成支持**  
**新的PKIXRevocationChecker类**  
**64位Windows的PKCS11**  
**Kerberos 5回放缓存中的新rcache类型**  
**Kerberos 5协议过渡和有限委派支持**  
**Kerberos 5弱加密类型默认禁用**  
**GSS-API/Kerberos 5机制的无绑定SASL**  
**多个主机名的SASL服务**  
**Mac OS X上的JNI桥接到本地JGSS**  
**在SunJSSE提供程序中支持更强的强度临时DH密钥**  
**JSSE中服务器端密码套件偏好自定义的支持**

### JavaFX

**新的Modena主题**  
**SwingNode类**  
**新的UI控件**  
**打印API**  
**3D图形功能**  
**WebView类的新特性和改进**  
**增强的文本支持**  
**支持Hi-DPI显示**  
**CSS Styleable*类已成为公共API**  
**新的ScheduledService类**  
**JavaFX现在适用于ARM平台**

### 工具

**jjs命令**  
**java命令**  
**java手册页重做**  
**jdeps命令行工具**  
**Java管理扩展（JMX）**  
**jarsigner工具**  

### Javac工具

**javac命令的-parameters选项**  
**javac命令的类型规则**  
**检查javadoc注释的内容**  
**生成本机头文件的能力**

### Javadoc工具

**支持新的DocTree API**  
**支持新的Javadoc Access API**  
**检查javadoc注释的内容**

### 国际化

**Unicode增强**  
**采用Unicode CLDR数据和java.locale.providers系统属性**  
**新的Calendar和Locale API**  
**能够安装自定义资源包作为扩展**

### 部署

**使用URLPermission允许连接回服务器**  
**JAR文件清单中的权限属性是必需的**  
**新的Date-Time包**

### 脚本

**Rhino JavaScript引擎已被Nashorn JavaScript引擎替换**

### Pack200

**Pack200支持常量池条目和JSR 292引入的新字节码**

### JDK8支持

**IO和NIO**

**java.lang和java.util包**

**JDBC**

**Java DB**

**网络**

**并发**

**Java XML - JAXP**

### HotSpot

**硬件内在增强**  
**PermGen的移除**  
**默认方法在Java编程语言中的支持**

### Java Mission Control 5.3发布说明

**JDK 8包括Java Mission Control 5.3**


* any list
{:toc}