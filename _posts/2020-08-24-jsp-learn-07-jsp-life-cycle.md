---
layout: post
title:  jsp 学习笔记-07-JSP 生命周期
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, jsp, sf]
published: true
---

# JSP 生命周期

理解JSP底层功能的关键就是去理解它们所遵守的生命周期。

JSP生命周期就是从创建到销毁的整个过程，类似于servlet生命周期，区别在于JSP生命周期还包括将JSP文件编译成servlet。

## 阶段

以下是JSP生命周期中所走过的几个阶段：

- 编译阶段：

servlet容器编译servlet源文件，生成servlet类

- 初始化阶段：

加载与JSP对应的servlet类，创建其实例，并调用它的初始化方法

- 执行阶段：

调用与JSP对应的servlet实例的服务方法

- 销毁阶段：

调用与JSP对应的servlet实例的销毁方法，然后销毁servlet实例

很明显，JSP生命周期的四个主要阶段和servlet生命周期非常相似，下面给出图示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0830/093024_2633a789_508704.png)

# JSP编译

当浏览器请求JSP页面时，JSP引擎会首先去检查是否需要编译这个文件。

如果这个文件没有被编译过，或者在上次编译后被更改过，则编译这个JSP文件。

编译的过程包括三个步骤：

1. 解析JSP文件。

2. 将JSP文件转为servlet。

3. 编译servlet。

# JSP初始化

容器载入JSP文件后，它会在为请求提供任何服务前调用 `jspInit()` 方法。

如果您需要执行自定义的JSP初始化任务，覆写 jspInit()方法就行了，就像下面这样：

```java
public void jspInit(){
  // 初始化代码
}
```

一般来讲程序只初始化一次，servlet也是如此。

通常情况下您可以在jspInit()方法中初始化数据库连接、打开文件和创建查询表。

# JSP执行

这一阶段描述了JSP生命周期中一切与请求相关的交互行为，直到被销毁。

当JSP网页完成初始化后，JSP引擎将会调用_jspService()方法。

_jspService()方法需要一个HttpServletRequest对象和一个HttpServletResponse对象作为它的参数，就像下面这样：

```java
void _jspService(HttpServletRequest request,
                 HttpServletResponse response)
{
   // 服务端处理代码
}
```

_jspService()方法在每个request中被调用一次并且负责产生与之相对应的response，并且它还负责产生所有7个HTTP方法的回应，比如GET、POST、DELETE等等。

# JSP清理

JSP生命周期的销毁阶段描述了当一个JSP网页从容器中被移除时所发生的一切。

jspDestroy()方法在JSP中等价于servlet中的销毁方法。当您需要执行任何清理工作时复写jspDestroy()方法，比如释放数据库连接或者关闭文件夹等等。

jspDestroy()方法的格式如下：

```java
public void jspDestroy()
{
   // 清理代码
}
```

# 实战代码

## 后端

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
public class LifeCycleController {

    /**
     * 实现文件上传
     *
     * @param request  请求
     * @param response 响应
     * @return
     */
    @GetMapping("/lifeCycle")
    public String index(HttpServletRequest request,
                        HttpServletResponse response) {
        return "lifeCycle";
    }

}
```

直接跳转到  lifeCycle.jsp 页面

## 前端

- lifeCycle.jsp

```jsp
<!DOCTYPE html>
<%@page contentType="text/html; charset=UTF-8" language="java" %>
<html lang="zh">
<head>
    <title>JSP 生命周期</title>
</head>
<body>

<%!
    private int initVar = 0;
    private int serviceVar = 0;
    private int destroyVar = 0;
%>

<%!
    public void jspInit() {
        initVar++;
        System.out.println("jspInit(): JSP被初始化了" + initVar + "次");
    }

    public void jspDestroy() {
        destroyVar++;
        System.out.println("jspDestroy(): JSP被销毁了" + destroyVar + "次");
    }
%>

<%
    serviceVar++;
    System.out.println("_jspService(): JSP共响应了" + serviceVar + "次请求");

    String content1 = "初始化次数 : " + initVar;
    String content2 = "响应客户请求次数 : " + serviceVar;
    String content3 = "销毁次数 : " + destroyVar;
%>
<h1>JSP 测试实例</h1>
<p><%=content1 %>
</p>
<p><%=content2 %>
</p>
<p><%=content3 %>
</p>

</body>
</html>
```

## 测试

页面访问 [http://localhost:8080/lifeCycle](http://localhost:8080/lifeCycle)

返回内容如下：

```
JSP 测试实例
初始化次数 : 1

响应客户请求次数 : 4

销毁次数 : 0
```

响应客户请求次数会随着我们的访问次数增加而增加。


* any list
{:toc}