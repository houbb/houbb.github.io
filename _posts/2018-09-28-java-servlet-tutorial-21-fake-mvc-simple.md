---
layout: post
title: Java Servlet 教程-21-自己手写 spring mvc 简单实现
date:  2018-09-27 14:49:58 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
---

# 整体代码结构

```
├─java
│  └─com
│      └─github
│          └─houbb
│              └─mvc
│                  │  package-info.java
│                  │
│                  ├─annotation
│                  │      Controller.java
│                  │      RequestMapping.java
│                  │      RequestParam.java
│                  │
│                  ├─controller
│                  │      IndexController.java
│                  │
│                  ├─exception
│                  │      MvcRuntimeException.java
│                  │
│                  └─servlet
│                          DispatchServlet.java
│
├─resources
│      application.properties
│
└─webapp
    └─WEB-INF
            web.xml
```

## pom.xml 依赖

引入 servlet-api 相关的包，用户开发。

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>3.0.1</version>
    <scope>provided</scope>
</dependency>
```

# 注解

因为本次主要实现 dispatch 分发这个功能，所有的 ioc 并不是我们实现的重点。

关于 ioc，可以参见 [spring ioc 实现](https://github.com/houbb/ioc)

所以只实现了以下几个注解：

功能和 spring 保持一致，此处不再赘述。

## @Controller

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Controller {

    /**
     * 对象的别名
     * @return 路径
     * @since 0.0.1
     */
    String value() default "";

}
```

## @RequestMapping

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface RequestMapping {

    /**
     * 映射 url 路徑
     * @return 路径
     * @since 0.0.1
     */
    String value();

}
```

## @RequestParam

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
public @interface RequestParam {

    /**
     * 参数别称
     * @return 路径
     * @since 0.0.1
     */
    String value();

}
```

# 属性配置文件

## web.xml

首先看一下 web 程序最核心的文件 web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://java.sun.com/xml/ns/javaee"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
         version="3.0">
    <servlet>
        <servlet-name>SpringMvc</servlet-name>
        <servlet-class>com.github.houbb.mvc.servlet.DispatchServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>application.properties</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>SpringMvc</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>

</web-app>
```

## 配置文件

这里主要有一个配置文件 application.properties

```
basePackage=com.github.houbb.mvc
```

spring-mvc 中一般是一个 app.xml，其他指定的基本也是扫描包等基础信息。

## 分发 Servlet

还有一个 DispatchServlet，用于处理各种请求。

也是本次实现的核心内容。

# DispatchServlet

## 继承自 HttpServlet 

```java
public class DispatchServlet extends HttpServlet {
```

## 基本属性

后面实现会用到。

```java
/**
 * 实例 Map
 *
 * @since 0.0.1
 */
private Map<String, Object> controllerInstanceMap = new HashMap<>();
/**
 * 请求方法 map
 *
 * @since 0.0.1
 */
private Map<String, Method> requestMethodMap = new HashMap<>();
/**
 * 配置文件
 *
 * @since 0.0.1
 */
private Properties properties = new Properties();
```

## 重载父类方法

```java
@Override
public void init(ServletConfig config) throws ServletException {}

@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {}

@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {}
```

## 实现 init 方法

init 方法主要负责解析 web.xml 中的配置，然后进行相关的初始化。

```java
@Override
public void init(ServletConfig config) throws ServletException {
    super.init();
    //1. 加载配置文件信息
    initConfig(config);

    //2. 根据配置信息进行相关处理
    String basePackage = properties.getProperty("basePackage");
    initInstance(basePackage);

    //3. 初始化映射关系
    initRequestMappingMap();
}
```

我们分开一个个看。

### 1. 加载配置文件信息

这个就是根据 web.xml 中的配置，初始化一下配置文件信息。

```java
/**
 * 初始化配置信息
 * （1）spring-mvc 一般是指定一个 xml 文件。
 * 至于各种 classpath，我们也可以对其进行特殊处理，暂时简单化。
 *
 * @param config 配置信息
 * @since 0.0.1
 */
private void initConfig(final ServletConfig config) {
    final String configPath = config.getInitParameter("contextConfigLocation");
    //把web.xml中的contextConfigLocation对应value值的文件加载到流里面
    try (InputStream resourceAsStream = this.getClass().getClassLoader().getResourceAsStream(configPath)) {
        properties.load(resourceAsStream);
    } catch (IOException e) {
        throw new MvcRuntimeException(e);
    }
}
```

- MvcRuntimeException 异常类

一个简单的自定义运行时异常类:

```java
public class MvcRuntimeException extends RuntimeException {
    //....
}
```

### 2. 根据配置信息进行初始化

根据指定的扫描包，我们初始化所有指定 `@Controller` 注解的类。

当然这里最简单的场景，还有很多复杂的情况，比如 jar 包中引用等等，可以参考 [spring ioc 实现](https://github.com/houbb/ioc)

```java
/**
 * 初始化对象实例
 *
 * @param basePackage 基本包
 * @since 0.0.1
 */
private void initInstance(final String basePackage) {
    String path = basePackage.replaceAll("\\.", "/");
    URL url = this.getClass().getClassLoader().getResource(path);
    if (null == url) {
        throw new MvcRuntimeException("base package can't loaded!");
    }
    File dir = new File(url.getFile());
    File[] files = dir.listFiles();
    if (files != null) {
        for (File file : files) {
            if (file.isDirectory()) {
                //递归读取包
                initInstance(basePackage + "." + file.getName());
            } else {
                String className = basePackage + "." + file.getName().replace(".class", "");
                //实例化处理
                try {
                    Class clazz = Class.forName(className);
                    if (clazz.isAnnotationPresent(Controller.class)) {
                        Object instance = clazz.newInstance();
                        controllerInstanceMap.put(className, instance);
                    }
                } catch (ClassNotFoundException | IllegalAccessException | InstantiationException e) {
                    throw new MvcRuntimeException(e);
                }
            }
        }
    }
}
```

### 3. 初始化映射关系

这个主要是解析 `@RequestMapping` 对应的 url 信息。

```java
/**
 * 初始化 {@link com.github.houbb.mvc.annotation.RequestMapping} 的方法映射
 *
 * @since 0.0.1
 */
private void initRequestMappingMap() {
    for (Map.Entry<String, Object> entry : controllerInstanceMap.entrySet()) {
        Object instance = entry.getValue();
        String prefix = "/";
        final Class controllerClass = instance.getClass();
        if (controllerClass.isAnnotationPresent(RequestMapping.class)) {
            RequestMapping requestMapping = (RequestMapping) controllerClass.getAnnotation(RequestMapping.class);
            prefix = requestMapping.value();
        }
        // 暂时只处理当前类的方法
        Method[] methods = controllerClass.getDeclaredMethods();
        // 为了简单，只有注解处理的方法才被作为映射。
        // 当然这里可以加一些限制，比如只处理 public 方法等。
        // 可以加一些严格的判重，暂不处理。
        for (Method method : methods) {
            if (method.isAnnotationPresent(RequestMapping.class)) {
                RequestMapping requestMapping = method.getAnnotation(RequestMapping.class);
                String methodUrl = requestMapping.value();
                String fullUrl = prefix + methodUrl;
                requestMethodMap.put(fullUrl, method);
            }
        }
    }
}
```

## 请求分发

请求主要分为 get/post 两种：

```java
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    doDispatch(req, resp);
}

@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    doDispatch(req, resp);
}
```

这里我们统一调用了消息分发接口。

### doDispatch() 核心实现

```java
/**
 * 执行消息的分发
 *
 * @param req  请求
 * @param resp 响应
 * @since 0.0.1
 */
private void doDispatch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    try {
        if (requestMethodMap.isEmpty()) {
            return;
        }
        // 请求信息 url 的处理
        String requestUrl = req.getRequestURI();
        System.out.println("requestUrl====" + requestUrl);
        String contextPath = req.getContextPath();
        // 直接替换掉 contextPath，感觉这样不太好。可以选择去掉这种开头。
        requestUrl = requestUrl.replace(contextPath, "");
        //404
        // 这里应该有各种响应码的处理，暂时简单点。
        if (!requestMethodMap.keySet().contains(requestUrl)) {
            resp.getWriter().write("404 for request " + requestUrl);
            return;
        }
        Method method = requestMethodMap.get(requestUrl);
        // 参数，这里其实要处理各种基本类型等
        // 还有各种信息的类型转换
        Class<?>[] paramTypes = method.getParameterTypes();
        // 参数为空的情况
        final Object instance = controllerInstanceMap.get(method.getDeclaringClass().getName());
        if (paramTypes.length <= 0) {
            method.invoke(instance);
        }
        // 这里实际上需要对各种类型的参数加以转换，目前只支持 String
        Object[] paramValues = new Object[paramTypes.length];
        List<String> paramNames = getParamNames(method);
        Map<String, String[]> requestParamMap = req.getParameterMap();
        for (int i = 0; i < paramTypes.length; i++) {
            // 类的简称
            String typeName = paramTypes[i].getSimpleName();
            if ("HttpServletRequest".equals(typeName)) {
                //参数类型已明确，这边强转类型
                paramValues[i] = req;
            } else if ("HttpServletResponse".equals(typeName)) {
                paramValues[i] = resp;
            } else if("String".endsWith(typeName)) {
                // 为什么是数组 https://www.cnblogs.com/wscit/p/5800147.html
                String paramName = paramNames.get(i);
                String[] strings = requestParamMap.get(paramName);
                // 简单处理，只取第一个。
                paramValues[i] = strings[0];
            } else {
                throw new MvcRuntimeException("Not support type for " + typeName);
            }
        }
        // 反射调用
        method.invoke(instance, paramValues);
    } catch (IOException | IllegalAccessException | InvocationTargetException e) {
        resp.getWriter().write("500");
    }
}
```

### 获取参数名称的方法

```java
/**
 * 获取参数的名称
 * （1）后期可以结合 asm，对于没有注解的也可以处理。
 *
 * @param method 方法
 * @return 结果
 * @since 0.0.1
 */
private List<String> getParamNames(final Method method) {
    Annotation[][] paramAnnos = method.getParameterAnnotations();
    List<String> paramNames = new ArrayList<>(paramAnnos.length);
    final int paramSize = paramAnnos.length;
    for(int i = 0; i < paramSize; i++) {
        Annotation[] annotations = paramAnnos[i];
        String paramName = getParamName(i, annotations);
        paramNames.add(paramName);
    }
    return paramNames;
}

/**
 * 获取参数名称
 * @param index 参数的下标
 * @param annotations 注解信息
 * @return 参数名称
 * @since 0.0.1
 */
private static String getParamName(final int index, final Annotation[] annotations) {
    final String defaultName = "arg"+index;
    if(annotations == null) {
        return defaultName;
    }
    for(Annotation annotation : annotations) {
        if(annotation.annotationType().equals(RequestParam.class)) {
            RequestParam param = (RequestParam)annotation;
            return param.value();
        }
    }
    return defaultName;
}
```

# 代码自测

## IndexController

我们定义个简单的控制类

```java
package com.github.houbb.mvc.controller;

import com.github.houbb.mvc.annotation.Controller;
import com.github.houbb.mvc.annotation.RequestMapping;
import com.github.houbb.mvc.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * index 控制器
 *
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
@RequestMapping("/index")
public class IndexController {

    @RequestMapping("/print")
    public void print(@RequestParam("param") String param) {
        System.out.println(param);
    }

    @RequestMapping("/echo")
    public void echo(HttpServletRequest request,
                     HttpServletResponse response,
                     @RequestParam("param") String param) {
        try {
            response.getWriter().write("Echo :" + param);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

## 项目启动

为了方便，此处直接使用 tomcat maven 插件。

```xml
<plugin>
    <groupId>org.apache.tomcat.maven</groupId>
    <artifactId>tomcat7-maven-plugin</artifactId>
    <version>2.2</version>
    <configuration>
        <port>8080</port>
        <path>/</path>
        <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
    </configuration>
</plugin>
```

## 页面访问

- 404

tomcat7 启动以后，直接页面访问 [http://localhost:8080/](http://localhost:8080/)

默认页面显示

```
404 for request /
```

因为我们没有处理默认的 index 页面。

- print

页面访问 [http://localhost:8080/index/print?param=hello](http://localhost:8080/index/print?param=hello)

会在控台打印 

```
hello
```

- echo

页面访问 [http://localhost:8080/index/echo?param=hello](http://localhost:8080/index/echo?param=hello)

会在页面打印 

```
Echo :hello
```

# 开源地址

完整代码地址 [mvc](https://github.com/houbb/mvc/tree/release_0.0.1)

* any list
{:toc}