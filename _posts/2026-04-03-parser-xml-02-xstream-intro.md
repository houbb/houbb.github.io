---
layout: post 
title: dom4j = Java 里一个偏“工程实用”的 XML 处理库
date: 2026-04-03 21:01:55 +0800
categories: [XML]
tags: [xml, ast]
published: true
---

XStream 是一个非常易用的 Java 对象与 XML 相互转换的库，其核心用法非常简单，主要涉及 `toXML()` 和 `fromXML()` 两个方法[reference:0]。

### 📦 第一步：添加Maven依赖

在你的 `pom.xml` 文件中添加 XStream 的核心依赖。

```xml
<dependency>
    <groupId>com.thoughtworks.xstream</groupId>
    <artifactId>xstream</artifactId>
    <version>1.4.21</version>
</dependency>
```
当前最新稳定版本是 1.4.21[reference:1]。如果不使用 Maven，也可以直接从[官网](https://x-stream.github.io/download.html)下载 JAR 包并添加到项目的 classpath 中。

### 🚀 第二步：基础使用

下面的例子展示了将一个简单的 `Person` 对象序列化成 XML，再反序列化回来的完整过程。

#### 1. 定义Java类
首先，定义两个普通的 Java 类（POJO）。XStream 不要求类必须有 getter/setter 或无参构造器，对私有字段也能直接操作[reference:2]。

```java
import java.util.List;

public class Person {
    private String firstName;
    private String lastName;
    private List<PhoneNumber> phoneNumbers;
    
    // 为了代码简洁，此处省略了构造器、getter和setter方法
}

public class PhoneNumber {
    private int code;
    private String number;
    
    // 为了代码简洁，此处省略了构造器、getter和setter方法
}
```

#### 2. 序列化与反序列化
`XStream` 类是主要入口。核心用法就是创建 `XStream` 实例，然后调用其 `toXML()` 和 `fromXML()` 方法[reference:3]。

```java
import com.thoughtworks.xstream.XStream;
import java.util.Arrays;

public class XStreamDemo {
    public static void main(String[] args) {
        // 创建XStream实例
        XStream xstream = new XStream();

        // --- 序列化：将Java对象转换为XML ---
        Person person = new Person("John", "Doe");
        person.setPhoneNumbers(Arrays.asList(new PhoneNumber(123, "12345678")));
        
        String xml = xstream.toXML(person);
        System.out.println("生成的XML:\n" + xml);
        // 生成的XML默认会使用类的全限定名作为根标签
        // <com.example.Person>...</com.example.Person>

        // --- 反序列化：将XML转换回Java对象 ---
        Person deserializedPerson = (Person) xstream.fromXML(xml);
        System.out.println("反序列化后的对象: " + deserializedPerson.getFirstName());
    }
}
```
生成的 XML 默认会使用类的全限定名（如 `<com.example.Person>`），这虽然能工作，但不够简洁。为了解决这个问题，可以使用"别名"。

### ⚙️ 第三步：进阶配置

#### 1. 使用别名 (Alias)
别名可以让你自定义 XML 中的元素名，使 XML 更简洁、可读性更高[reference:4]。

*   **为类起别名**：使用 `alias(String name, Class type)` 方法[reference:5]。
*   **为字段起别名**：使用 `aliasField(String alias, Class definedIn, String fieldName)` 方法[reference:6]。

```java
// 在创建XStream实例后添加别名配置
XStream xstream = new XStream();
// 为Person类起别名为"person"
xstream.alias("person", Person.class);
// 为PhoneNumber类起别名为"phoneNumber"
xstream.alias("phoneNumber", PhoneNumber.class);
// 为Person类的firstName字段起别名为"firstNameAlias"
xstream.aliasField("firstNameAlias", Person.class, "firstName");
```

#### 2. 使用注解 (Annotation)
如果不想在代码中显式配置，可以使用注解，让代码更简洁[reference:7]。

*   **启用注解**：需要调用 `processAnnotations(Class... types)` 方法。
*   **常用注解**：
    *   `@XStreamAlias("alias")`：用于类或字段，定义别名[reference:8]。
    *   `@XStreamAsAttribute`：用于字段，将该字段序列化为 XML 元素的属性，而非子元素[reference:9]。
    *   `@XStreamOmitField`：用于字段，让 XStream 忽略该字段[reference:10]。

```java
import com.thoughtworks.xstream.annotations.XStreamAlias;
import com.thoughtworks.xstream.annotations.XStreamAsAttribute;

@XStreamAlias("person")  // 类的别名
public class Person {
    @XStreamAlias("firstNameAlias")  // 字段的别名
    private String firstName;
    
    @XStreamAsAttribute  // 将lastName序列化为<person lastName="...">
    private String lastName;
}
```
```java
// 在代码中处理注解
XStream xstream = new XStream();
// 让XStream处理Person类上的注解
xstream.processAnnotations(Person.class);
```
需要注意的是，`processAnnotations` 方法有轻微的线程安全问题，建议在应用启动时单线程执行[reference:11]。

### 🛡️ 第四步：安全配置

从 1.4.x 版本开始，XStream 引入了安全框架。在处理来自外部的、不可信的 XML 数据时，进行安全配置是**必须**的，这可以有效防止反序列化漏洞[reference:12]。

通常的做法是**设置类型白名单**，明确告知 XStream 哪些类可以被反序列化[reference:13]。

```java
XStream xstream = new XStream();
// 1. 设置一个默认的安全配置，限制一些危险的操作
XStream.setupDefaultSecurity(xstream);
// 2. 明确允许需要反序列化的类，可以使用通配符
xstream.allowTypesByWildcard(new String[]{
        "com.yourproject.model.**",  // 允许model包及其子包下的所有类
        "java.util.**"               // 允许java.util包下的类，如ArrayList
});
```
此外，始终使用最新版本的 XStream 库也非常重要[reference:14]。对于简单的 JSON 处理场景，如果涉及外部数据，也推荐参考官方最新的[安全指南](https://x-stream.github.io/security.html)进行配置。

### 🎨 第五步：拓展：支持JSON

除了 XML，XStream 也支持将对象与 JSON 互相转换[reference:15]。

```java
import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.json.JsonHierarchicalStreamDriver;

// 1. 使用特定的JSON驱动创建XStream实例
XStream xstream = new XStream(new JsonHierarchicalStreamDriver());

// 2. 设置别名（可选，能让生成的JSON更简洁）
xstream.alias("person", Person.class);

// 3. 序列化为JSON
Person person = new Person("John", "Doe");
String json = xstream.toXML(person); // 注意方法名仍是toXML
System.out.println(json);
// 输出示例: {"person": {"firstName": "John", "lastName": "Doe"}}
```
这个 `JsonHierarchicalStreamDriver` 只能用于序列化。如果需要双向转换，可以使用 `JettisonMappedXmlDriver`，但它需要额外添加 `jettison` 依赖[reference:16]。

### 💡 常见问题与提醒

*   **JVM Crash 问题**：在某些 JDK 版本（如 JDK 8u202 及更早版本）中使用 XStream 处理 XML 时，可能会触发 `SUN.security.validator.ValidatorException` 导致 JVM 崩溃。这通常与 Xalan XSLT 处理器有关。建议将 JDK 升级到较新的版本，或在 JVM 启动参数中添加 `-Dcom.sun.org.apache.xml.internal.security.ignoreLineBreaks=true` 来规避。
*   **依赖冲突**：XStream 依赖 XPP3 作为默认的 XML 解析器[reference:17]。如果你的项目中存在其他 XML 解析库，可能会引发版本冲突。此时，可以切换为使用标准的 JAXP DOM 解析器：`XStream xstream = new XStream(new DomDriver())`[reference:18]。

如果需要更深入的信息，推荐查阅 [XStream 官方网站](https://x-stream.github.io/index.html) 或 [Baeldung 上的系列教程](https://www.baeldung.com/xstream-deserialize-xml-to-object)。


# 如果我不知道具体的字段，只想解析 xml 的结构+基本属性、类似于 dom4j 那种，xstream 做的到吗？



# 参考资料

* any list
{:toc}