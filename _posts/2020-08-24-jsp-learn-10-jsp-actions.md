---
layout: post
title:  jsp 学习笔记-10-JSP 动作
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, jsp, sf]
published: true
---

# JSP 动作元素

与JSP指令元素不同的是，JSP动作元素在请求处理阶段起作用。

JSP动作元素是用XML语法写成的。

利用JSP动作可以动态地插入文件、重用JavaBean组件、把用户重定向到另外的页面、为Java插件生成HTML代码。

动作元素只有一种语法，它符合XML标准：

```xml
<jsp:action_name attribute="value" />
```

## 标注动作元素

动作元素基本上都是预定义的函数，JSP规范定义了一系列的标准动作，它用JSP作为前缀，可用的标准动作元素如下：

| 语法	        | 描述 |
|:---|:---|
| jsp:include	    | 在页面被请求的时候引入一个文件。 |
| jsp:useBean	    | 寻找或者实例化一个JavaBean。 |
| jsp:setProperty | 设置JavaBean的属性。 |
| jsp:getProperty | 输出某个JavaBean的属性。 |
| jsp:forward	    | 把请求转到一个新的页面。 |
| jsp:plugin	    | 根据浏览器类型为Java插件生成OBJECT或EMBED标记。 |
| jsp:element	    | 定义动态XML元素 |
| jsp:attribute	 | 设置动态定义的XML元素属性。 |
| jsp:body	    | 设置动态定义的XML元素内容。 |
| jsp:text	    | 在JSP页面和文档中使用写入文本的模板 |


## 常见的属性

所有的动作要素都有两个属性：id属性和scope属性。

- id属性

id属性是动作元素的唯一标识，可以在JSP页面中引用。动作元素创建的id值可以通过PageContext来调用。

- scope属性

该属性用于识别动作元素的生命周期。 

id属性和scope属性有直接关系，scope属性定义了相关联id对象的寿命。 

scope属性有四个可能的值： (a) page, (b)request, (c)session, 和 (d) application。

# jsp:include 动作元素

`<jsp:include>` 动作元素用来包含静态和动态的文件。该动作把指定文件插入正在生成的页面。

语法格式如下：

```xml
<jsp:include page="相对 URL 地址" flush="true" />
```

前面已经介绍过include指令，它是在JSP文件被转换成Servlet的时候引入文件，而这里的 jsp:include 动作不同，插入文件的时间是在页面被请求的时候。

## 属性

以下是include动作相关的属性列表。

| 属性	| 描述 |
|:----|:----|
| page	| 包含在页面中的相对URL地址。 |
| flush	|  布尔属性，定义在包含资源前是否刷新缓存区。| 

## 实例

### 后端

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/actions")
public class ActionsController {

    @GetMapping("/include")
    public String hello(HttpServletRequest request,
                        HttpServletResponse response) {
        return "actions/include";
    }

}
```

### 前端

- date.jsp

```jsp
<%@ page import="java.util.Date" %>
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>入门案例</title>
</head>
<body>
<h2>DATE</h2>
<br/>

<p>
    当前时间：<%=new Date().toLocaleString()%>
</p>

</body>
</html>
```

- include.jsp

```jsp
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>入门案例</title>
</head>
<body>

<h2> 动作实例 </h2>

<jsp:include page="date.jsp" flush="true"/>

</body>
</html>
```

我们在 include.jsp 中，引入了 date.jsp 页面。

### 页面效果

```
动作实例
DATE

当前时间：2020-8-30 12:49:10
```

# jsp:useBean 动作元素

jsp:useBean 动作用来加载一个将在JSP页面中使用的JavaBean。

这个功能非常有用，因为它使得我们可以发挥 Java 组件复用的优势。

## 语法

jsp:useBean动作最简单的语法为：

```jsp
<jsp:useBean id="name" class="package.class" />
```

在类载入后，我们既可以通过 jsp:setProperty 和 jsp:getProperty 动作来修改和检索bean的属性。

## 属性

以下是useBean动作相关的属性列表。

| 属性	    | 描述 |
|:-----|:-----|
| class	    | 指定Bean的完整包名。 |
| type	    | 指定将引用该对象变量的类型。 |
| beanName	| 通过 java.beans.Beans 的 instantiate() 方法指定Bean的名字。 |

在给出具体实例前，让我们先来看下 jsp:setProperty 和 jsp:getProperty 动作元素：

## jsp:setProperty 动作元素

jsp:setProperty用来设置已经实例化的Bean对象的属性，有两种用法。

首先，你可以在jsp:useBean元素的外面（后面）使用jsp:setProperty，如下所示：

```jsp
<jsp:useBean id="myName" ... />
<jsp:setProperty name="myName" property="someProperty" .../>
```

此时，不管jsp:useBean是找到了一个现有的Bean，还是新创建了一个Bean实例，jsp:setProperty都会执行。

第二种用法是把jsp:setProperty放入jsp:useBean元素的内部，如下所示：

```jsp
<jsp:useBean id="myName" ... >
 ...
 <jsp:setProperty name="myName" property="someProperty" .../>
</jsp:useBean>
```

此时，jsp:setProperty只有在新建Bean实例时才会执行，如果是使用现有实例则不执行jsp:setProperty。

### 属性

jsp:setProperty动作有下面四个属性,如下表：

| 属性	| 描述 |
|:----|:----|
| name	| name属性是必需的。它表示要设置属性的是哪个Bean。 |
| property	| property属性是必需的。它表示要设置哪个属性。有一个特殊用法：如果property的值是"*"，表示所有名字和Bean属性名字匹配的请求参数都将被传递给相应的属性set方法。 |
| value	| value 属性是可选的。该属性用来指定Bean属性的值。字符串数据会在目标类中通过标准的valueOf方法自动转换成数字、boolean、Boolean、 byte、Byte、char、Character。例如，boolean和Boolean类型的属性值（比如"true"）通过 Boolean.valueOf转换，int和Integer类型的属性值（比如"42"）通过Integer.valueOf转换。 　　value和param不能同时使用，但可以使用其中任意一个。|
| param	  | param 是可选的。它指定用哪个请求参数作为Bean属性的值。如果当前请求没有参数，则什么事情也不做，系统不会把null传递给Bean属性的set方法。因此，你可以让Bean自己提供默认属性值，只有当请求参数明确指定了新值时才修改默认属性值。 |

## jsp:getProperty 动作元素

jsp:getProperty动作提取指定Bean属性的值，转换成字符串，然后输出。

### 语法

语法格式如下：

```jsp
<jsp:useBean id="myName" ... />
...
<jsp:getProperty name="myName" property="someProperty" .../>
```

### 属性

下表是与getProperty相关联的属性：

| 属性	   | 描述|
|:----|:----|
| name	   | 要检索的Bean属性名称。Bean必须已定义。|
| property	| 表示要提取Bean属性的值|

## 实例

### 前端

```jsp
<%@ page import="java.util.Date" %>
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>入门案例</title>
</head>
<body>
<h2>UseBean</h2>
<br/>

<jsp:useBean id="user" class="com.github.houbb.jsp.learn.hello.model.User"/>

<%--set--%>
<jsp:setProperty name="user" property="name" value="JSP 设置"/>

设置后的值：

<jsp:getProperty name="user" property="name"/>

</body>
</html>
```

### 后端

- User.java

```java
package com.github.houbb.jsp.learn.hello.model;

public class User {

    private String name;

    private String password;


    //getter & setter & toString()

}
```

- mvc

```java
@GetMapping("/useBean")
public String useBean(HttpServletRequest request,
                    HttpServletResponse response) {
    return "actions/useBean";
}
```

### 测试效果

页面访问：http://localhost:8080/actions/useBean

结果如下：

```
UseBean

设置后的值： JSP 设置
```

# jsp:forward 动作元素

jsp:forward动作把请求转到另外的页面。

jsp:forward标记只有一个属性page。

## 语法

语法格式如下所示：

```jsp
<jsp:forward page="相对 URL 地址" />
```

## 属性

以下是forward相关联的属性：

| 属性	| 描述 |
|:---|:---|
| page	| page属性包含的是一个相对URL。page的值既可以直接给出，也可以在请求的时候动态计算，可以是一个JSP页面或者一个 Java Servlet.|

## 实例

### 前端实现

- date.jsp

```jsp
<p>
    当前时间：<%=new Date().toLocaleString()%>
</p>
```

- forward.jsp

```jsp
<body>

<h2>FORWARD 动作实例</h2>

<jsp:forward page="date.jsp"/>

</body>
```

### 测试效果

当我们访问 forward.jsp 时，实际会跳转到 date.jsp

```
DATE

当前时间：2020-8-30 13:11:11
```

# jsp:plugin 动作元素

jsp:plugin动作用来根据浏览器的类型，插入通过Java插件运行Java Applet所必需的OBJECT或EMBED元素。

如果需要的插件不存在，它会下载插件，然后执行Java组件。 

Java组件可以是一个applet或一个JavaBean。

plugin动作有多个对应HTML元素的属性用于格式化Java 组件。

param元素可用于向Applet 或 Bean 传递参数。

## 实例

以下是使用 plugin 动作元素的典型实例:

```jsp
<jsp:plugin type="applet" codebase="dirname" code="MyApplet.class"
                           width="60" height="80">
   <jsp:param name="fontcolor" value="red" />
   <jsp:param name="background" value="black" />
 
   <jsp:fallback>
      Unable to initialize Java Plugin
   </jsp:fallback>
 
</jsp:plugin>
```

如果你有兴趣可以尝试使用applet来测试jsp:plugin动作元素，`<fallback>` 元素是一个新元素，在组件出现故障的错误时发送给用户错误信息。

ps: 本地测试没有通过，应该是我没有定义 `MyApplet` 类的原因。

# jsp:element jsp:attribute jsp:body 动作元素

`<jsp:element> 、 <jsp:attribute>、 <jsp:body>`动作元素动态定义XML元素。

动态是非常重要的，这就意味着XML元素在编译时是动态生成的而非静态。

## 实例

以下实例动态定义了XML元素：

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程(runoob.com)</title>
</head>
<body>
<jsp:element name="xmlElement">
<jsp:attribute name="xmlElementAttr">
   属性值
</jsp:attribute>
<jsp:body>
   XML 元素的主体
</jsp:body>
</jsp:element>
</body>
</html>
```

### 效果

实际上的 html 对应的是下面的页面：

```xml
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>菜鸟教程(runoob.com)</title>
</head>
<body>
<xmlElement xmlElementAttr="属性值">
        XML 元素的主体
    </xmlElement>
</body>
</html>
```

# jsp:text 动作元素

`<jsp:text>`动作元素允许在JSP页面和文档中使用写入文本的模板

## 语法

语法格式如下：

```jsp
<jsp:text>模板数据</jsp:text>
```

以上文本模板不能包含重复元素，只能包含文本和EL表达式（注：EL表达式将在后续章节中介绍）。

请注意，在XML文件中，您不能使用表达式如 `${whatever > 0}`，因为>符号是非法的。 

你可以使用 `${whatever gt 0}` 表达式或者嵌入在一个CDATA部分的值。

```xml
<jsp:text><![CDATA[<br>]]></jsp:text>
```

## 实例

如果你需要在 XHTML 中声明 DOCTYPE,必须使用到 `<jsp:text>` 动作元素，实例如下：

```jsp
<jsp:text><![CDATA[<!DOCTYPE html
PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"DTD/xhtml1-strict.dtd">]]>
</jsp:text>
<head><title>jsp:text action</title></head>
<body>

<books><book><jsp:text>  
    Welcome to JSP Programming
</jsp:text></book></books>

</body>
</html>
```

### 测试效果

如果使用 text 标签，效果实际如下：

```xml
<!DOCTYPE html>
<html>
<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "DTD/xhtml1-strict.dtd">

<head><title>jsp:text action</title></head>
<body>

<books><book>
    Welcome to JSP Programming
</book></books>

</body>
</html>
```

如果去掉 text 标签：

```xml
<!DOCTYPE html>
<html>
<![CDATA[<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "DTD/xhtml1-strict.dtd">]]>
<head><title>jsp:text action</title></head>
<body>

<books><book>
    Welcome to JSP Programming
</book></books>

</body>
</html>
```

# 参考资料

https://www.runoob.com/jsp/jsp-actions.html

* any list
{:toc}