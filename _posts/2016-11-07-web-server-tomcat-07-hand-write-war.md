---
layout: post
title: 从零手写实现 tomcat-07-war 如何解析处理三方的 war 包？
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 创作缘由

平时使用 tomcat 等 web 服务器不可谓不多，但是一直一知半解。

于是想着自己实现一个简单版本，学习一下 tomcat 的精髓。

# 系列教程

[从零手写实现 apache Tomcat-01-入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-overview)

[从零手写实现 apache Tomcat-02-web.xml 入门详细介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-web-xml)

[从零手写实现 tomcat-03-基本的 socket 实现](https://houbb.github.io/2016/11/07/web-server-tomcat-03-hand-write-simple-socket)

[从零手写实现 tomcat-04-请求和响应的抽象](https://houbb.github.io/2016/11/07/web-server-tomcat-04-hand-write-request-and-resp)

[从零手写实现 tomcat-05-servlet 处理支持](https://houbb.github.io/2016/11/07/web-server-tomcat-05-hand-write-servlet-web-xml)

[从零手写实现 tomcat-06-servlet bio/thread/nio/netty 池化处理](https://houbb.github.io/2016/11/07/web-server-tomcat-06-hand-write-thread-pool)

[从零手写实现 tomcat-07-war 如何解析处理三方的 war 包？](https://houbb.github.io/2016/11/07/web-server-tomcat-07-hand-write-war)

[从零手写实现 tomcat-08-tomcat 如何与 springboot 集成？](https://houbb.github.io/2016/11/07/web-server-tomcat-08-hand-write-embed)

[从零手写实现 tomcat-09-servlet 处理类](https://houbb.github.io/2016/11/07/web-server-tomcat-09-hand-write-servlet)

[从零手写实现 tomcat-10-static resource 静态资源文件](https://houbb.github.io/2016/11/07/web-server-tomcat-10-hand-write-static-resource)

[从零手写实现 tomcat-11-filter 过滤器](https://houbb.github.io/2016/11/07/web-server-tomcat-11-hand-write-filter)

[从零手写实现 tomcat-12-listener 监听器](https://houbb.github.io/2016/11/07/web-server-tomcat-12-hand-write-listener)

# 前言

到目前为止，我们处理的都是自己的 servlet 等。

但是 tomcat 这种做一个 web 容器，坑定要能解析处理其他的 war 包。

这个要如何实现呢？

# 1-war 包什么样的？

## 源码

直接用一个 web 简单的项目。

[https://github.com/houbb/servlet-webxml](https://github.com/houbb/servlet-webxml)

## 项目目录

```
mvn clean
tree /f

D:.
│
└─src
    └─main
        ├─java
        │  └─com
        │      └─github
        │          └─houbb
        │              └─servlet
        │                  └─webxml
        │                          IndexServlet.java
        │
        └─webapp
            │  index.html
            │
            └─WEB-INF
                    web.xml
```

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.github.houbb</groupId>
    <artifactId>servlet-webxml</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <plugin.tomcat.version>2.2</plugin.tomcat.version>
    </properties>

    <packaging>war</packaging>

    <dependencies>
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>servlet-api</artifactId>
            <version>2.5</version>
            <scope>provided</scope>
        </dependency>

        <dependency>
            <groupId>org.apache.tomcat</groupId>
            <artifactId>tomcat-servlet-api</artifactId>
            <version>9.0.0.M8</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>servlet</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>${plugin.tomcat.version}</version>
                <configuration>
                    <port>8080</port>
                    <path>/</path>
                    <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

### web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.4"
         xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

    <!--默认的欢迎页面-->
    <welcome-file-list>
        <welcome-file>/index.html</welcome-file>
    </welcome-file-list>

    <servlet>
        <servlet-name>index</servlet-name>
        <servlet-class>com.github.houbb.servlet.webxml.IndexServlet</servlet-class>
    </servlet>

    <servlet-mapping>
        <servlet-name>index</servlet-name>
        <url-pattern>/index</url-pattern>
    </servlet-mapping>

</web-app>
```

### index.html

```html
<!DOCTYPE html>
<html>
<body>
Hello Servlet!
</body>
</html> 
```

### servlet

```java
package com.github.houbb.servlet.webxml;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * @author binbin.hou
 * @since 0.1.0
 */
public class IndexServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");

        // 实际的逻辑是在这里
        PrintWriter out = resp.getWriter();
        out.println("<h1>servlet index</h1>");
    }

}
```

## 目录结构

打包成 war，然后解压：

```
mvn clean install
```

其实比较重要的就是 web.xml 作为一切的入口。

对应的 war

```xml
D:.
│  index.html
│
├─META-INF
│  │  MANIFEST.MF
│  │
│  └─maven
│      └─com.github.houbb
│          └─servlet-webxml
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
                    └─servlet
                        └─webxml
                                IndexServlet.class
```



# 如何根据类路径加载类信息？类不是当前项目的

[JVM-09-classloader](https://houbb.github.io/2018/10/08/jvm-09-classloader)

## 核心实现

```java
package com.github.houbb.minicat.support.classloader;


import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * https://www.liaoxuefeng.com/wiki/1545956031987744/1545956487069728
 *
 * 每一个 dir 的 classLoader 独立。
 */
public class WebAppClassLoader extends URLClassLoader {

    private Path classPath;
    private Path[] libJars;

    public WebAppClassLoader(Path classPath, Path libPath) throws IOException {
        super(createUrls(classPath, libPath), ClassLoader.getSystemClassLoader());
//        super("WebAppClassLoader", createUrls(classPath, libPath), ClassLoader.getSystemClassLoader());
//
        this.classPath = classPath.toAbsolutePath().normalize();
        if(libPath.toFile().exists()) {
            this.libJars = Files.list(libPath).filter(p -> p.toString().endsWith(".jar")).map(p -> p.toAbsolutePath().normalize()).sorted().toArray(Path[]::new);
        }
    }

    static URL[] createUrls(Path classPath, Path libPath) throws IOException {
        List<URL> urls = new ArrayList<>();
        urls.add(toDirURL(classPath));

        //lib 可能不存在
        if(libPath.toFile().exists()) {
            Files.list(libPath).filter(p -> p.toString().endsWith(".jar")).sorted().forEach(p -> {
                urls.add(toJarURL(p));
            });
        }

        return urls.toArray(new URL[0]);
    }

    static URL toDirURL(Path p) {
        try {
            if (Files.isDirectory(p)) {
                String abs = toAbsPath(p);
                if (!abs.endsWith("/")) {
                    abs = abs + "/";
                }
                return URI.create("file://" + abs).toURL();
            }
            throw new IOException("Path is not a directory: " + p);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    //D:\github\minicat\src\test\webapps\servlet\WEB-INF\classes
    //D:\github\minicat\src\test\webapps\WEB-INF\classes

    static URL toJarURL(Path p) {
        try {
            if (Files.isRegularFile(p)) {
                String abs = toAbsPath(p);
                return URI.create("file://" + abs).toURL();
            }
            throw new IOException("Path is not a jar file: " + p);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    static String toAbsPath(Path p) throws IOException {
        return p.toAbsolutePath().normalize().toString().replace('\\', '/');
    }

}
```

# 开源地址

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)



--------------------------------------------------------------------------------------------------------------------------------------------





# class 如何加载

## Java类加载双亲委派模型

Java类加载器是用户程序和JVM虚拟机之间的桥梁，在Java程序中起了至关重要的作用，关于其详细实现可以参考了java官方文档关于虚拟机加载的教程，[点此直达官方参考文档](https://docs.oracle.com/javase/specs/jvms/se11/jvms11.pdf)。

java中的类加载默认是采用双亲委派模型，即加载一个类时，首先判断自身define加载器有没有加载过此类，如果加载了直接获取class对象，如果没有查到，则交给加载器的父类加载器去重复上面过程。

我在另外一篇文章中详细介绍了Java的类加载机制，此处不做详细介绍。

![类加载](https://img2020.cnblogs.com/other/2529502/202110/2529502-20211006173211361-534315865.png)


# Tomcat是如何隔离Web应用的？

Tomcat通过自定义的类加载器WebAppClassLoader打破了双亲委托机制，目的就是为了优化加载Web应用目录下的类。

Tomcat 作为 Servlet 容器，它负责加载我们Servlet 类，此外它还负责加载 Servlet 所依赖的 JAR 包。并且Tomcat 本身也是也是一个 Java 程序，因此它需要加载自己的类和依赖的 JAR 包。

如果Tomcat里面运行了两个Web应用程序，两个Web应用程序中有同名的Servlet，但功能不同，Tomcat需要同时加载和管理这两个同名的 Servlet 类，保证它们不会冲突，因此 Web 应用之间的类需要隔离。

如果如两个 Web 应用都依赖同一个第三方的 JAR 包，比如 Spring，那 Spring 的 JAR 包被加载到内存后，Tomcat 要保证这两个 Web 应用能够共享，也就是说Spring 的 JAR 包只被加载一次，否则随着依赖的第三方JAR 包增多，JVM 的内存会膨胀。

同时，跟JVM一样，我们需要隔离Tomcat本身的类和Web应用类。

## Tomcat的类加载器的层次结构

为了解决AppClassLoader，同类名的Servlet类只能被加载一次。

Tomcat 自定义一个类加载器WebAppClassLoader，并且给每个 Web 应用创建一个类加载器实例。

Context 容器组件对应一个 Web应用，因此，每个 Context 容器负责创建和维护一个WebAppClassLoader 加载器实例。

原理是，**不同的加载器实例加载的类被认为是不同的类，即使它们的类名相同**。

这就相当于在 Java 虚拟机内部创建了一个个相互隔离的 Java 类空间，每一个 Web 应用都有自己的类空间，Web 应用之间通过各自的类加载器互相隔离。

![WebAppClassLoader](https://img-blog.csdnimg.cn/20200428175746875.png)

为了Tomcat可以存放多个Web应用，Tomcat实现了Web应用的隔离，从而达到可以加载不同Web应用下相同名的Servlet类，从而编写了自己的类加载器，其内部类加载器模型如上图所示

（1）SharedClassLoader：该类加载器存在是为了解决不同Web应用之间共享类库，并且不会重复加载相同的类。它作为WebAppClassLoader的父加载器，专门加载Web应用之间的共享类。

（2）CatalinaClassloader：该类加载器专门加载Tomcat自身的类，从而和web应用的类做一个隔离。

（3）CommonClassLoad：CatalinaClassLader实现了Tomcat类和web应用类的隔离，如果二者之间需要共享一些类怎么办？这里就需要CommonClassLoad，它所加载的所有类都可以被SharedClassLoader和CatalinaClassLoader使用，从而实现web应用和tomcat对一些类的共享。

## 补充Spring的加载问题

在 JVM 的实现中有一条隐含的规则，默认情况下，如果一个类由类加载器 A 加载，那么这个类的依赖类也是由相同的类加载器加载。比如 Spring 作为一个 Bean 工厂，它需要创建业务类的实例，并且在创建业务类实例之前需要加载这些类。Spring 是通过调用Class.forName来加载业务类的。

我在前面提到，Web 应用之间共享的 JAR 包可以交给SharedClassLoader 来加载，从而避免重复加载。

Spring作为共享的第三方 JAR 包，它本身是由SharedClassLoader 来加载的，Spring 又要去加载业务类，按照前面那条规则，加载 Spring 的类加载器也会用来加载业务类，但是业务类在 Web 应用目录下，不在SharedClassLoader 的加载路径下，这该怎么办呢？

于是线程上下文加载器登场了，它其实是一种类加载器传递机制。为什么叫作“线程上下文加载器”呢，因为这个类加载器保存在线程私有数据里，只要是同一个线程，一旦设置了线程上下文加载器，在线程后续执行过程中就能把这个类加载器取出来用。

因此 Tomcat 为每个 Web 应用创建一个WebAppClassLoarder 类加载器，并在启动 Web 应用的线程里设置线程上下文加载器，这样 Spring 在启动时就将线程上下文加载器取出来，用来加载 Bean。

# tomcat 如何加载类？

## Loader接口

在载入Web应用程序中需要的servlet类及其相关类时要遵守一些明确的规则，例如应用程序中的servlet只能引用部署在WEB-INF/classes目录及其子目录下的类。

但是，servlet类不能访问其它路径中的类，即使这些累包含在运行当前Tomcat的JVM的CLASSPATH环境变量中。

此外，servlet类只能访问WEB-INF/LIB目录下的库，其它目录的类库均不能访问。

Tomcat中的载入器值得是Web应用程序载入器，而不仅仅是类载入器，载入器必须实现Loader接口。

Loader接口的定义如下所示：

```java
public interface Loader {

    public void backgroundProcess();
    public ClassLoader getClassLoader();
    public Context getContext();
    public void setContext(Context context);
    public boolean getDelegate();
    public void setDelegate(boolean delegate);
    public void addPropertyChangeListener(PropertyChangeListener listener);
    public boolean modified();
    public void removePropertyChangeListener(PropertyChangeListener listener);
}
```

后台任务：

Loader接口需要进行在servlet类变更的时候实现类的重新加载，这个任务就是在backgroundProcess()中实现的，WebApploader中backgroundProcess()的实现如下所示。

可以看到，当Context容器开启了Reload功能并且仓库变更的情况下，Loaders会先把类加载器设置为Web类加载器，重启Context容器。

重启Context容器会重启所有的子Wrapper容器，会销毁并重新创建servlet类的实例，从而达到动态加载servlet类的目的。

```java
@Override
public void backgroundProcess() {
    Context context = getContext();
    if (context != null) {
        if (context.getReloadable() && modified()) {
            ClassLoader originalTccl = Thread.currentThread().getContextClassLoader();
            try {
                Thread.currentThread().setContextClassLoader(WebappLoader.class.getClassLoader());
                context.reload();
            } finally {
                Thread.currentThread().setContextClassLoader(originalTccl);
            }
        }
    }
}
```

类加载器：Loader的实现中，会使用一个自定义类载入器，它是WebappClassLoader类的一个实例。可以使用Loader接口的getClassLoader()方法来获取Web载入器中的ClassLoader的实例。默认的类加载器的实现有两种种：ParallelWebappClassLoader和WebappClassLoader

Context容器：Tomcat的载入器通常会与一个Context级别的servelt容器相关联，Loader接口的getContainer()方法和setContainer()方法用来将载入器和某个servlet容器关联。如果Context容器中的一个或者多个类被修改了，载入器也可以支持对类的重载。这样，servlet程序员就可以重新编译servlet类及其相关类，并将其重新载入而不需要重新启动Tomcat。Loader接口使用modified()方法来支持类的自动重载。

类修改检测：在载入器的具体实现中，如果仓库中的一个或者多个类被修改了，那么modified()方法必须放回true，才能提供自动重载的支持

父载入器：载入器的实现会指明是否要委托给父类的载入器，可以通过setDelegate()和getDelegate方法配置。


## WebappLoader类

Tomcat中唯一实现Loader接口的类就是WebappLoader类，其实例会用作Web应用容器的载入器，负责载入Web应用程序中所使用的类。

在容器启动的时候，WebApploader会执行以下工作：

- 创建类加载器

- 设置仓库

- 设置类的路径

- 设置访问权限

- 启动新线程来支持自动重载

### 创建类加载器

为了完成类加载功能，WebappLoader会按照配置创建类加载器的实例，Tomcat默认有两种类加载器：WebappClassLoader和ParallelWebappClassLoader，默认情况下使用ParallelWebappClassLoader作为类加载器。

用户可以通过setLoaderClass()设置类加载器的名称。WebappLoader创建类加载器的源码如下所示，我们可以看到类加载器的实例必须是WebappClassLoaderBase的子类。

```java
    private WebappClassLoaderBase createClassLoader()
        throws Exception {

        if (classLoader != null) {
            return classLoader;
        }

        if (ParallelWebappClassLoader.class.getName().equals(loaderClass)) {
            return new ParallelWebappClassLoader(context.getParentClassLoader());
        }

        Class<?> clazz = Class.forName(loaderClass);
        WebappClassLoaderBase classLoader = null;

        ClassLoader parentClassLoader = context.getParentClassLoader();

        Class<?>[] argTypes = { ClassLoader.class };
        Object[] args = { parentClassLoader };
        Constructor<?> constr = clazz.getConstructor(argTypes);
        classLoader = (WebappClassLoaderBase) constr.newInstance(args);

        return classLoader;
    }
```

### 设置仓库

WebappLoader会在启动的时候调用类加载器的初始化方法，类加载器在初始化的时候会设置类加载的仓库地址。

默认的仓库地址为"/WEB-INF/classes"和"/WEB-INF/lib"。

类加载器初始化源码如下所示：

```java
    @Override
    public void start() throws LifecycleException {

        state = LifecycleState.STARTING_PREP;

        WebResource[] classesResources = resources.getResources("/WEB-INF/classes");
        for (WebResource classes : classesResources) {
            if (classes.isDirectory() && classes.canRead()) {
                localRepositories.add(classes.getURL());
            }
        }
        WebResource[] jars = resources.listResources("/WEB-INF/lib");
        for (WebResource jar : jars) {
            if (jar.getName().endsWith(".jar") && jar.isFile() && jar.canRead()) {
                localRepositories.add(jar.getURL());
                jarModificationTimes.put(
                        jar.getName(), Long.valueOf(jar.getLastModified()));
            }
        }

        state = LifecycleState.STARTED;
    }

```

### 设置类路径

设置类路径是在初始化的时候调用setClassPath()方法完成的(源码如下)。

setClassPath()方法会在servlet上下文中为Jasper JSP编译器设置一个字符串类型的属性来指明类路径信息。

此处不详细介绍JSP相关内容。


```java
  private void setClassPath() {

        // Validate our current state information
        if (context == null)
            return;
        ServletContext servletContext = context.getServletContext();
        if (servletContext == null)
            return;

        StringBuilder classpath = new StringBuilder();

        // Assemble the class path information from our class loader chain
        ClassLoader loader = getClassLoader();

        if (delegate && loader != null) {
            // Skip the webapp loader for now as delegation is enabled
            loader = loader.getParent();
        }

        while (loader != null) {
            if (!buildClassPath(classpath, loader)) {
                break;
            }
            loader = loader.getParent();
        }

        if (delegate) {
            // Delegation was enabled, go back and add the webapp paths
            loader = getClassLoader();
            if (loader != null) {
                buildClassPath(classpath, loader);
            }
        }

        this.classpath = classpath.toString();

        // Store the assembled class path as a servlet context attribute
        servletContext.setAttribute(Globals.CLASS_PATH_ATTR, this.classpath);
    }
```


### 设置访问权限

若是运行Tomcat的时候，使用了安全管理器，则setPermissions()方法会为类载入器设置访问相关目录的权限，比如只能访问WEB-INF/classes和WEB-INF/lib的目录。

若是没有使用安全管理器，则setPermissions()方法只是简单地返回，什么也不做。

其源码如下：

```java

    /**
     * Configure associated class loader permissions.
     */
    private void setPermissions() {

        if (!Globals.IS_SECURITY_ENABLED)
            return;
        if (context == null)
            return;

        // Tell the class loader the root of the context
        ServletContext servletContext = context.getServletContext();

        // Assigning permissions for the work directory
        File workDir =
            (File) servletContext.getAttribute(ServletContext.TEMPDIR);
        if (workDir != null) {
            try {
                String workDirPath = workDir.getCanonicalPath();
                classLoader.addPermission
                    (new FilePermission(workDirPath, "read,write"));
                classLoader.addPermission
                    (new FilePermission(workDirPath + File.separator + "-",
                                        "read,write,delete"));
            } catch (IOException e) {
                // Ignore
            }
        }

        for (URL url : context.getResources().getBaseUrls()) {
           classLoader.addPermission(url);
        }
    }
```

## 开启新线程执行类的重新载入

WebappLoader类支持自动重载功能。

如果WEB-INF/classes目录或者WEB-INF/lib目录下的某些类被重新编译了，那么这个类会自动重新载入，而无需重启Tomcat。

为了实现此目的，WebappLoader类使用一个线程周期性的检查每个资源的时间戳。

间隔时间由变量checkInterval指定，单位为s，默认情况下，checkInterval的值为15s，每隔15s会检查依次是否有文件需要自动重新载入。

顶层容器在启动的时候，会启动定时线程池循环调用backgroundProcess任务。

# WebappClassLoader类加载器

Web应用程序中负责载入类的类载入器有两种：ParallelWebappClassLoader和WebappClassLoaderBase，二者实现大同小异，本节以WebappClassLoader类加载器为例，介绍Tomcat的类加载器。

WebappClassLoader的设计方案考虑了优化和安全两方面。例如，它会缓存之前已经载入的类来提升性能，还会缓存加载失败的类的名字，这样，当再次请求加载同一个类的时候，类加载器就会直接抛出ClassNotFindException异常，而不是再次去查找这个类。WebappClassLoader会在仓库列表和指定的JAR文件中搜索需要在载入的类。

## 类缓存

为了达到更好的性能，WebappClassLoader会缓存已经载入的类，这样下次再使用该类的时候，会直接从缓存中获取。

由WebappClassLoader载入的类都会被视为资源进行缓存，对应的类为“ResourceEntry”类的实例。

ResourceEndty保存了其所代表的class文件的字节流、最后一次修改日期，Manifest信息等。

如下为类加载过程中读取缓存的部分代码和ResourceEntry的定义源码。


```java
public Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {

    // 省略部分逻辑
    // (0) Check our previously loaded local class cache
    clazz = findLoadedClass0(name);
    if (clazz != null) {
        if (log.isDebugEnabled())
            log.debug("  Returning class from cache");
            if (resolve)
                resolveClass(clazz);
        return clazz;
    }
     // 省略部分逻辑
}

protected Class<?> findLoadedClass0(String name) {

    String path = binaryNameToPath(name, true);

    ResourceEntry entry = resourceEntries.get(path);
    if (entry != null) {
        return entry.loadedClass;
    }
     return null;
}


public class ResourceEntry {
    /**
     * The "last modified" time of the origin file at the time this resource
     * was loaded, in milliseconds since the epoch.
     */
    public long lastModified = -1;

    /**
     * Loaded class.
     */
    public volatile Class<?> loadedClass = null;
}
```

## 载入类

载入类的时候，WebappClassLoader要遵循如下规则：

- 因为所有已经载入的类都会缓存起来，所以载入类的时候要先检查本地缓存。

- 若本地缓存没有，则检查父类加载器的缓存，调用ClassLoader接口的findLoadedClass()方法。

- 若两个缓存总都没有，则使用系统类加载器进行加载，防止Web应用程序中的类覆盖J2EE中的类。

- 若启用了SecurityManager，则检查是否允许载入该类。若该类是禁止载入的类，抛出ClassNotFoundException异常。

- 若打开了标志位delegate，或者待载入的在类不能用web类加载器加载的类，则使用父类加载器来加载器来加载相关类。如果父类加载器为null，则使用系统类加载器。

- 从当前仓库载入类。

- 当前仓库没有需要载入的类，而且delegate关闭，则是用父类载入器来载入相关的类。

- 若没有找到需要加载的类，则抛出ClassNotFindException。

# Tomcat 类加载结构

Tomcat容器在启动的时候会初始化类加载器，Tomcat的类加载器分为四种类型：Common类加载器，Cataline类加载器和Shared类加载器，此外每个应用都会有自己的Webapp类加载器，也就是我们上文介绍的WebappClassLoader，四者之间的关系如下所示。

![Tomcat类加载结构](https://img2020.cnblogs.com/other/2529502/202110/2529502-20211006173211664-1004684152.jpg)

Common类加载器，Cataline类加载器和Shared类加载器会在Tomcat容器启动的时候就初始化完成，初始化代码如下所示：

```java
    private void initClassLoaders() {
        try {
            commonLoader = createClassLoader("common", null);
            if (commonLoader == null) {
                // no config file, default to this loader - we might be in a 'single' env.
                commonLoader = this.getClass().getClassLoader();
            }
            catalinaLoader = createClassLoader("server", commonLoader);
            sharedLoader = createClassLoader("shared", commonLoader);
        } catch (Throwable t) {
            handleThrowable(t);
            log.error("Class loader creation threw exception", t);
            System.exit(1);
        }
    }


    private ClassLoader createClassLoader(String name, ClassLoader parent)
        throws Exception {

        String value = CatalinaProperties.getProperty(name + ".loader");
        if ((value == null) || (value.equals("")))
            return parent;

        value = replace(value);

        List<Repository> repositories = new ArrayList<>();

        String[] repositoryPaths = getPaths(value);

        for (String repository : repositoryPaths) {
            // Check for a JAR URL repository
            try {
                @SuppressWarnings("unused")
                URL url = new URL(repository);
                repositories.add(new Repository(repository, RepositoryType.URL));
                continue;
            } catch (MalformedURLException e) {
                // Ignore
            }

            // Local repository
            if (repository.endsWith("*.jar")) {
                repository = repository.substring
                    (0, repository.length() - "*.jar".length());
                repositories.add(new Repository(repository, RepositoryType.GLOB));
            } else if (repository.endsWith(".jar")) {
                repositories.add(new Repository(repository, RepositoryType.JAR));
            } else {
                repositories.add(new Repository(repository, RepositoryType.DIR));
            }
        }

        return ClassLoaderFactory.createClassLoader(repositories, parent);
    }
```

而Webapp类加载器则是在Context容器启动时候有WebappLoader初始化，Webapp类加载器的父类加载器是Tomcat容器在初始化阶段通过反射设置的，反射设置父类加载器的源码如下所示：

```java
    public void init() throws Exception {

        initClassLoaders();

        Thread.currentThread().setContextClassLoader(catalinaLoader);

        SecurityClassLoad.securityClassLoad(catalinaLoader);

        // Load our startup class and call its process() method
        if (log.isDebugEnabled())
            log.debug("Loading startup class");
        Class<?> startupClass = catalinaLoader.loadClass("org.apache.catalina.startup.Catalina");
        Object startupInstance = startupClass.getConstructor().newInstance();

        // Set the shared extensions class loader
        if (log.isDebugEnabled())
            log.debug("Setting startup class properties");
        String methodName = "setParentClassLoader";
        Class<?> paramTypes[] = new Class[1];
        paramTypes[0] = Class.forName("java.lang.ClassLoader");
        Object paramValues[] = new Object[1];
        paramValues[0] = sharedLoader;
        Method method =
            startupInstance.getClass().getMethod(methodName, paramTypes);
        method.invoke(startupInstance, paramValues);

        catalinaDaemon = startupInstance;
    }
```

## Tomcat类加载结构的目的

一个web容器可能需要部署两个应用程序，不同的应用程序可能会依赖同一个第三方类库的不同版本，不能要求同一个类库在同一个服务器只有一份，因此要保证每个应用程序的类库都是独立的，保证相互隔离。所以每个应用需要自身的Webapp类加载器。

部署在同一个web容器中相同的类库相同的版本可以共享。否则，如果服务器有10个应用程序，那么要有10份相同的类库加载进虚拟机。

所以需要Shared类加载器

web容器也有自己依赖的类库，不能于应用程序的类库混淆。基于安全考虑，应该让容器的类库和程序的类库隔离开来。所以需要Cataline类加载器。

web容器要支持jsp的修改，我们知道，jsp 文件最终也是要编译成class文件才能在虚拟机中运行，但程序运行后修改jsp已经是司空见惯的事情，否则要你何用？ 所以，web容器需要支持 jsp 修改后不用重启。

还有最后一个类的共享的问题，如果十个web应用都引入了spring的类，由于web类加载器的隔离，那么对内存的开销是很大的。此时我们可以想到shared类加载器，我们肯定都会选择将spring的jar放于shared目录底下，但是此时又会存在一个问题，shared类加载器是webapp类加载器的parent，若spring中的getBean方法需要加载web应用底下的类，这种过程是违反双亲委托机制的。

打破双亲委托机制的桎梏：线程上下文类加载器线程上下文类加载器是指的当前线程所用的类加载器，可以通过Thread.currentThread().getContextClassLoader()获得或者设置。在spring中，他会选择线程上下文类加载器去加载web应用底下的类，如此就打破了双亲委托机制。

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

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

# 参考资料

## tomcat 类加载方式

https://tomcatist.gitee.io/2021/02/02/%E6%B7%B1%E5%85%A5%E6%8B%86%E8%A7%A3Tomcat%E5%92%8CJetty%E4%B9%8B%E5%AE%B9%E5%99%A8/

https://juejin.cn/s/tomcat%E7%9A%84spi%E6%9C%BA%E5%88%B6

https://blog.csdn.net/Wangdiankun/article/details/105819963

https://time.geekbang.org/column/article/105711

https://www.cnblogs.com/zhangchuan210/p/3357413.html

https://blog.csdn.net/qq_43284469/article/details/126065241

[Tomcat如何打破双亲委派机制实现隔离Web应用的？（上）](https://developer.aliyun.com/article/846910)

[web.xml 中的listener、 filter、servlet 加载顺序及其详解](https://tuonioooo-notebook.gitbook.io/application-framework/springyuan-ma-jie-du-pian/springmvcyuan-ma-jie-du/webxml-zhong-de-listener-filter-servlet-jia-zai-shun-xu-ji-qi-xiang-jie)

[学习Tomcat（六）之类加载器](https://www.cnblogs.com/yuhushen/p/15371793.html)

## jvm 类加载

[实现ClassLoader](https://www.liaoxuefeng.com/wiki/1545956031987744/1545956487069728)

[重温JVM之Java类加载机制](https://www.cnblogs.com/niceyoo/p/11241660.html)

[踩坑集锦之你真的明白Java类路径的含义吗？](https://cloud.tencent.com/developer/article/2290318)

* any list
{:toc}