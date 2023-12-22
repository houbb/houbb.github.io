---
layout: post
title: java classgraph 工具
date: 2023-12-22 21:01:55 +0800
categories: [Java]
tags: [java, tool, sh]
published: true
---

# classgraph

ClassGraph 是用于 Java、Scala、Kotlin 和其他 JVM 语言的超快速并行类路径扫描器和模块扫描器。

ClassGraph 在 Oracle Code One 2018 赢得了杜克选择奖（这是对 Java 生态系统中最有用和/或创新的软件的认可），并在 2022 年获得了 Google 开源同行奖励。

感谢所有报告错误、提出功能请求、提供建议并提交拉取请求的用户，这些都对将 ClassGraph 发展到今天的水平起到了积极的作用。

ClassGraph 是一个稳定且成熟的工具，尽管被数百个项目使用，但其 bug 报告率很低。
ClassGraph 与 Java 内省对比
ClassGraph 具有"反转"Java类和/或反射API的能力，或者具有索引类和资源的能力。例如，Java类和反射API可以告诉你给定类的超类，或者给定类实现的接口，或者可以提供类上的注解列表；而 ClassGraph 可以找到所有扩展给定类的类（给定类的所有子类），或者所有实现给定接口的类，或者所有用给定注解注释的类。Java API 可以加载特定 ClassLoader 中具有特定路径的资源文件的内容，但 ClassGraph 可以查找并加载所有类加载器中路径与给定模式匹配的所有资源。

## 示例

以下代码打印了在类路径或模块路径的任何位置，属于包 com.xyz 或其子包的所有类，并带有形如 @com.xyz.Route("/pages/home.html") 的注解，以及注解参数值。

这是在不加载或初始化任何扫描到的类的情况下完成的。

```java
String pkg = "com.xyz";
String routeAnnotation = pkg + ".Route";
try (ScanResult scanResult =
        new ClassGraph()
            .verbose()               // Log to stderr
            .enableAllInfo()         // Scan classes, methods, fields, annotations
            .acceptPackages(pkg)     // Scan com.xyz and subpackages (omit to scan all packages)
            .scan()) {               // Start the scan
    for (ClassInfo routeClassInfo : scanResult.getClassesWithAnnotation(routeAnnotation)) {
        AnnotationInfo routeAnnotationInfo = routeClassInfo.getAnnotationInfo(routeAnnotation);
        List<AnnotationParameterValue> routeParamVals = routeAnnotationInfo.getParameterValues();
        // @com.xyz.Route has one required parameter
        String route = (String) routeParamVals.get(0).getValue();
        System.out.println(routeClassInfo.getName() + " is annotated with route " + route);
    }
}
```

以下代码会在所有 ClassLoader 或模块中查找 META-INF/config 中的所有 JSON 文件，并对每个文件的路径和内容调用方法 readJson(String path, String content)。

```java
try (ScanResult scanResult = new ClassGraph().acceptPathsNonRecursive("META-INF/config").scan()) {
    scanResult.getResourcesWithExtension("json")
              .forEachByteArray((Resource res, byte[] content) -> {
                  readJson(res.getPath(), new String(content, StandardCharsets.UTF_8));
              });
}
```

# 功能特点

ClassGraph 为 JVM 生态系统提供了许多重要的功能：

1. **构建内存中的关联图：** ClassGraph 具有构建整个类、注解、接口、方法和字段的关联图模型的能力，该图包括 JVM 可见的所有内容，甚至可以读取类型注解。这个类元数据的图可以以多种方式进行查询，使得在 JVM 语言中可以进行一定程度的元编程，即编写能够分析或响应其他代码属性的代码。

2. **直接读取类文件字节码格式：** ClassGraph 直接读取类文件的字节码格式，因此可以在不加载或初始化类的情况下读取有关类的所有信息。

3. **完全兼容 JPMS 模块系统：** ClassGraph 完全兼容新的 JPMS 模块系统（Project Jigsaw / JDK 9+），即它可以扫描传统的类路径和模块路径。然而，代码也完全向后兼容 JDK 7 和 JDK 8（即代码以 Java 7 兼容模式编译，并且所有与模块系统的交互都通过反射实现以实现向后兼容性）。

4. **多线程优化的路径扫描：** ClassGraph 使用经过精心优化的多线程代码进行类路径或模块路径的扫描，以实现最短的扫描时间，并在快速 SSD 上尽可能接近 I/O 带宽限制。

5. **处理多种类路径规范：** ClassGraph 处理比其他任何类路径扫描器发现的更多类路径规范，使依赖于 ClassGraph 的代码具有最大的可移植性。

6. **运行时或构建时扫描：** ClassGraph 可以在运行时或构建时（例如，用于实现 Android 的注解处理）扫描类路径和模块路径。

7. **查找重复定义的类：** ClassGraph 可以找到在类路径或模块路径中重复定义或定义多次的类，这有助于找到奇怪的类解析行为的原因。

8. **创建 GraphViz 可视化：** ClassGraph 可以创建类图结构的 GraphViz 可视化，这有助于理解代码。

![图](https://raw.githubusercontent.com/classgraph/classgraph/master/src/test/java/com/xyz/classgraph-fig.png)



# chat

## 详细介绍一下 classgraph

ClassGraph 是一个用于扫描 Java 类路径（classpath）并获取有关类信息的开源库。

它提供了一个灵活而强大的 API，用于在运行时获取关于类、接口、注解、字段、方法等信息。

ClassGraph 的主要用途是帮助开发人员在运行时动态地获取和操作类信息，这对于某些框架和工具来说是非常有用的。

以下是一些 ClassGraph 的主要特性和用法:

1. **快速扫描类路径：** ClassGraph 使用高效的算法，能够快速扫描类路径上的类文件，而不需要加载类到内存。

2. **获取类信息：** 通过 ClassGraph，你可以获取关于类的详细信息，包括类名、包名、超类、实现的接口、字段、方法等。

3. **过滤器和条件：** ClassGraph 提供了丰富的过滤器和条件，允许你根据特定的规则和条件来过滤扫描结果。这样你可以只关注你感兴趣的类或者排除特定的类。

4. **支持类路径的多种形式：** ClassGraph 支持从文件系统、JAR 文件、ZIP 文件等多种类路径形式中扫描类信息。

5. **与注解处理器整合：** ClassGraph 可以与 Java 的注解处理器一起使用，允许你在编译时和运行时同时获取和处理类信息。

6. **模块化支持：** 如果你的应用使用了 Java 9 或更高版本的模块系统，ClassGraph 也提供了对模块路径的支持。

7. **跨平台：** ClassGraph 可以在各种不同的操作系统上运行，并且兼容不同的 Java 运行时环境。


### maven 引入

```xml
<dependency>
    <groupId>io.github.classgraph</groupId>
    <artifactId>classgraph</artifactId>
    <version>X.Y.Z</version>
</dependency>
```

以下是一个简单的示例，演示了如何使用 ClassGraph 扫描类路径并获取类信息：

```java
import io.github.classgraph.ClassGraph;
import io.github.classgraph.ScanResult;

public class ClassGraphExample {
    public static void main(String[] args) {
        try (ScanResult scanResult = new ClassGraph().enableAllInfo().scan()) {
            scanResult.getAllClasses().forEach(classInfo -> {
                System.out.println("Class: " + classInfo.getName());
                System.out.println("Superclass: " + classInfo.getSuperclass());
                System.out.println("Interfaces: " + classInfo.getInterfaces());
                // 可以根据需要获取更多信息
            });
        }
    }
}
```

需要注意的是，ClassGraph 的 API 可能在不同的版本中有所变化，因此建议查看官方文档以获取最新的信息和用法示例。

官方文档地址为：[ClassGraph GitHub Repository](https://github.com/classgraph/classgraph)。


## classgraph 可以用来做什么？

ClassGraph 可以用于许多不同的用途，主要集中在动态地获取和操作 Java 类信息的领域。

以下是一些你可以使用 ClassGraph 实现的常见用途：

1. **类路径扫描：** ClassGraph 可以扫描类路径或模块路径，获取关于类、接口、注解、字段、方法等的详细信息。这对于动态地了解应用程序中存在的类结构非常有用。

2. **元编程：** 通过构建内存中的类关联图，ClassGraph 支持一定程度的元编程，允许你编写代码来分析或响应其他代码的属性。这样的能力对于一些高级应用、框架或工具的开发非常有帮助。

3. **注解处理器：** ClassGraph 可以与 Java 的注解处理器一起使用，帮助你在编译时发现和处理注解。这对于实现自定义的编译时代码生成或分析逻辑非常有用。

4. **资源文件查找：** 通过 ClassGraph，你可以查找类路径或模块路径中的资源文件，而不需要加载这些资源。这对于查找配置文件、模板文件等非代码文件非常有用。

5. **模块化支持：** ClassGraph 是与 Java 9 及更高版本的模块系统（JPMS）兼容的，因此你可以在模块路径上扫描类信息。这有助于处理现代 Java 应用中的模块化问题。

6. **类加载器：** ClassGraph 可以与类加载器一起使用，使你能够在运行时动态加载类，而无需直接通过 `Class.forName()` 等方式加载类。

7. **类依赖分析：** 通过查找类之间的关系，ClassGraph 可以用于执行类依赖分析，找出项目中类之间的依赖关系，有助于理解和优化代码结构。

8. **资源查找和加载：** 通过 ClassGraph，你可以以灵活的方式查找和加载类路径中的资源文件，这对于动态配置加载等场景非常有用。

总的来说，ClassGraph 是一个强大的工具，可用于在运行时获取关于类和资源的信息，支持元编程和动态代码生成，同时兼容现代的 Java 模块系统。

# 参考资料

https://github.com/classgraph/classgraph

* any list
{:toc}