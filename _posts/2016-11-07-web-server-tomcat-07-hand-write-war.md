---
layout: post
title: 从零手写是实现 tomcat-07-war 如何解析处理三方的 war 包？
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: false
---

# 拓展阅读

[Netty 权威指南-01-BIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-01-bio)

[Netty 权威指南-02-NIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-02-nio)

[Netty 权威指南-03-AIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-03-aio)

[Netty 权威指南-04-为什么选择 Netty？Netty 入门教程](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

# 前言

到目前为止，我们处理的都是自己的 servlet 等。

但是 tomcat 这种做一个 web 容器，坑定要能解析处理其他的 war 包。

这个要如何实现呢？

# 1-war 包什么样的？

## 源码

直接用一个 web 简单的项目。

[https://github.com/houbb/simple-servlet](https://github.com/houbb/simple-servlet)

## 目录结构

打包成 war，然后解压：

```
C:.
│  index.html
│
├─META-INF
│  │  MANIFEST.MF
│  │
│  └─maven
│      └─com.github.houbb
│          └─simple-servlet
│                  pom.properties
│                  pom.xml
│
└─WEB-INF
    │  web.xml
    │
    └─classes
        └─com
            └─github
                └─houbb
                    └─simple
                        └─servlet
                                CookieAddServlet.class
                                CookieClearServlet.class
                                CookieGetServlet.class
                                IndexServlet.class
                                SessionAddServlet.class
                                SessionClearServlet.class
                                SessionGetServlet.class
```

其实比较重要的就是 web.xml 作为一切的入口。



# 核心问题

## war 包是什么？

Java Web 应用程序通常打包为 WAR（Web Application Archive）文件，WAR 文件是一种特殊的 JAR 文件，用于将 Web 应用程序的相关文件打包在一起。

WAR 文件通常包含了 Web 应用程序的静态资源、Servlet 类、JSP 页面、配置文件等内容。以下是 WAR 文件的详细介绍：

1. **静态资源**：
   WAR 文件中通常包含了 Web 应用程序所需的静态资源，如 HTML 页面、CSS 样式表、JavaScript 脚本、图片文件等。这些资源可以直接由客户端浏览器请求和加载，用于构建 Web 页面的外观和交互效果。

2. **Servlet 类**：
   WAR 文件中包含了编写的 Java Servlet 类文件，Servlet 类是处理客户端请求并生成响应的 Java 程序。这些 Servlet 类通常位于 WEB-INF/classes 目录下的包结构中，或者作为 JAR 文件存放在 WEB-INF/lib 目录下。

3. **JSP 页面**：
   WAR 文件中可能包含了 JavaServer Pages（JSP）页面，JSP 页面是一种特殊的 HTML 页面，其中嵌入了 Java 代码。当客户端请求访问 JSP 页面时，服务器会动态地生成 HTML 页面并返回给客户端。

4. **配置文件**：
   WAR 文件中包含了各种配置文件，用于配置 Web 应用程序的行为和特性。其中最重要的是 web.xml 文件，它是 Web 应用程序的部署描述符（Deployment Descriptor），包含了 Servlet 的映射配置、监听器配置、过滤器配置等信息。

5. **资源文件**：
   WAR 文件中还可能包含了一些其他的资源文件，如属性文件、XML 配置文件、模板文件等。这些资源文件通常用于配置和支持 Web 应用程序的各种功能。

6. **部署描述符**：
   WAR 文件中的 WEB-INF/web.xml 文件是 Web 应用程序的部署描述符，它是一个 XML 文件，用于描述 Web 应用程序的配置信息和部署结构。部署描述符中包含了 Servlet 的映射配置、Servlet 初始化参数、过滤器配置、监听器配置等内容。

7. **META-INF 目录**：
   WAR 文件中可能包含了一个 META-INF 目录，用于存放一些元数据信息。其中最常见的是 MANIFEST.MF 文件，用于描述 WAR 文件的一些元数据信息，如版本号、创建者、依赖关系等。

总的来说，WAR 文件是一种用于打包和部署 Java Web 应用程序的标准格式，它将 Web 应用程序的相关文件打包在一起，方便部署到支持 Java Web 应用程序的服务器上。

通过 WAR 文件，可以将 Java Web 应用程序以一种简单和标准化的方式进行分发和部署。

## 如何解压一个 war 压缩包

要解压一个 WAR 压缩包，你可以使用 Java 中的 `java.util.zip` 包提供的类来实现。下面是一个示例代码，演示了如何解压一个 WAR 压缩包：

```java
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class WarExtractor {
    public static void main(String[] args) {
        String warFilePath = "your_war_file.war"; // 要解压的 WAR 文件路径
        String destinationDirectory = "destination_directory"; // 解压后的目标目录

        try {
            extractWar(warFilePath, destinationDirectory);
            System.out.println("WAR 文件解压成功！");
        } catch (IOException e) {
            System.err.println("解压 WAR 文件时出错：" + e.getMessage());
        }
    }

    public static void extractWar(String warFilePath, String destinationDirectory) throws IOException {
        File destinationDir = new File(destinationDirectory);
        if (!destinationDir.exists()) {
            destinationDir.mkdirs();
        }

        try (ZipInputStream zipInputStream = new ZipInputStream(new FileInputStream(warFilePath))) {
            ZipEntry entry = zipInputStream.getNextEntry();
            while (entry != null) {
                String filePath = destinationDirectory + File.separator + entry.getName();
                if (!entry.isDirectory()) {
                    extractFile(zipInputStream, filePath);
                } else {
                    File dir = new File(filePath);
                    dir.mkdir();
                }
                zipInputStream.closeEntry();
                entry = zipInputStream.getNextEntry();
            }
        }
    }

    private static void extractFile(ZipInputStream zipInputStream, String filePath) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            byte[] buffer = new byte[1024];
            int length;
            while ((length = zipInputStream.read(buffer)) > 0) {
                fos.write(buffer, 0, length);
            }
        }
    }
}
```

在这个示例中，我们定义了一个 `WarExtractor` 类，其中包含了一个 `extractWar()` 方法，用于解压 WAR 文件。

你只需要将 WAR 文件的路径和解压后的目标目录传递给 `extractWar()` 方法，它就会自动将 WAR 文件解压到指定的目录中。

请确保在使用这段代码时替换 `your_war_file.war` 和 `destination_directory` 分别为实际的 WAR 文件路径和目标解压目录路径。

## 如何解析解压后的 war 包

一旦你成功解压了 WAR 文件，你可以通过遍历解压后的目录结构来访问其中的文件和资源。在解压后的目录中，通常会包含以下重要的内容：

1. **WEB-INF 目录**：这是 WAR 文件中的一个重要目录，包含了 Web 应用程序的配置和部署描述符。在解压后的目录中，你可以找到 `WEB-INF/web.xml` 文件，这是 Web 应用程序的部署描述符，其中包含了 Servlet 的映射配置、初始化参数、过滤器配置等信息。

2. **Classes 目录**：在 `WEB-INF/classes` 目录下存放着编译后的 Java 类文件。这些类文件通常是 Servlet 和其他 Java 类，用于处理客户端请求并生成响应。你可以直接访问这些类文件，并在你的应用程序中使用它们。

3. **Lib 目录**：在 `WEB-INF/lib` 目录下存放着应用程序依赖的 JAR 文件。这些 JAR 文件包含了应用程序所需的第三方库和组件。你可以将这些 JAR 文件添加到你的应用程序的类路径中，以便在代码中引用其中的类和资源。

4. **静态资源**：在解压后的目录中可能还包含了一些静态资源文件，如 HTML 页面、CSS 样式表、JavaScript 脚本、图片文件等。这些资源文件通常存放在解压后的根目录或者 `WEB-INF` 目录下的子目录中。

你可以编写代码来遍历解压后的目录结构，并读取其中的文件和资源。

例如，你可以使用 Java 的 File 类来遍历目录和访问文件内容，或者使用第三方库如 Apache Commons IO 来简化操作。

下面是一个简单的示例代码，演示了如何遍历解压后的 WAR 文件目录结构，并打印其中的文件和目录名：

```java
import java.io.File;

public class WarParser {
    public static void main(String[] args) {
        String warDirectory = "your_war_directory"; // 解压后的 WAR 文件目录路径
        parseWarDirectory(new File(warDirectory));
    }

    public static void parseWarDirectory(File directory) {
        if (directory.isDirectory()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        System.out.println("Directory: " + file.getName());
                        parseWarDirectory(file);
                    } else {
                        System.out.println("File: " + file.getName());
                    }
                }
            }
        }
    }
}
```

在这个示例中，我们定义了一个 `WarParser` 类，其中包含了一个 `parseWarDirectory()` 方法，用于递归地遍历解压后的 WAR 文件目录结构，并打印其中的文件和目录名。

你只需要将解压后的 WAR 文件目录路径传递给 `parseWarDirectory()` 方法，它就会打印出目录结构中的所有文件和目录名。

## 如何把解压后的 servlet 容器处理逻辑关联？

一旦你解压了 WAR 文件并得到了其中的 Servlet 类以及其他相关文件，你可以将这些 Servlet 类和其他资源关联到你的 Servlet 容器中进行处理。

下面是一些步骤来关联解压后的 Servlet 容器处理逻辑：

1. **配置 Servlet 映射**：
   在 WAR 文件的 `WEB-INF/web.xml` 文件中，通常包含了 Servlet 的映射配置。你需要将这些 Servlet 映射配置添加到你的 Servlet 容器中，以便能够正确地处理对应的 URL 请求。例如：
   ```xml
   <servlet>
       <servlet-name>HelloServlet</servlet-name>
       <servlet-class>com.example.HelloServlet</servlet-class>
   </servlet>
   <servlet-mapping>
       <servlet-name>HelloServlet</servlet-name>
       <url-pattern>/hello</url-pattern>
   </servlet-mapping>
   ```
   这个示例配置了一个名为 `HelloServlet` 的 Servlet 类，并将其映射到了 `/hello` 的 URL 路径上。

2. **将 Servlet 类添加到类路径**：
   WAR 文件中的 Servlet 类通常位于 `WEB-INF/classes` 目录下的包结构中，或者作为 JAR 文件存放在 `WEB-INF/lib` 目录下。你需要将这些 Servlet 类添加到你的 Servlet 容器的类路径中，以便能够加载和执行这些类。具体的做法取决于你使用的是哪种 Servlet 容器，通常可以通过配置类路径来实现。

3. **启动 Servlet 容器**：
   一旦你将 Servlet 类和映射配置添加到了你的 Servlet 容器中，你需要启动该容器以开始处理请求。根据你使用的 Servlet 容器的不同，启动的方式可能会有所不同。一般来说，你可以通过命令行或者图形界面来启动 Servlet 容器。

4. **测试 Servlet 容器**：
   启动 Servlet 容器后，你可以通过访问配置了映射的 URL 来测试你的 Servlet 容器是否能够正确地处理请求。如果一切配置正确，当你访问配置了映射的 URL 时，应该能够看到相应的 Servlet 响应。

通过以上步骤，你可以将解压后的 Servlet 容器处理逻辑关联到你的 Servlet 容器中进行处理。

请确保按照正确的方式配置 Servlet 映射，并将 Servlet 类添加到你的类路径中，以确保能够正确地加载和执行这些类。

# 开源地址

https://github.com/houbb/minicat

# 参考资料

* any list
{:toc}