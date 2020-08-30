---
layout: post
title:  jsp 学习笔记-08-JSP 语法
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, http, jsp, sf]
published: true
---

# 脚本程序

脚本程序可以包含任意量的Java语句、变量、方法或表达式，只要它们在脚本语言中是有效的。

脚本程序的语法格式：

```
<% 代码片段 %>
```

或者，您也可以编写与其等价的XML语句，就像下面这样：

```
<jsp:scriptlet>
   代码片段
</jsp:scriptlet>
```

任何文本、HTML标签、JSP元素必须写在脚本程序的外面。

# 入门例子

## 后端

```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
@RequestMapping("/grammar")
public class GrammarController {

    @GetMapping("/hello")
    public String hello(HttpServletRequest request,
                        HttpServletResponse response) {
        return "grammar/hello";
    }

}
```

## 前端

- /grammer/hello.jsp

下面给出一个示例，同时也是本教程的第一个JSP示例：

```jsp
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>入门案例</title>
</head>
<body>
你好，JSP!
<br/>
<%
out.println("你的 IP 地址 " + request.getRemoteAddr());
%>
</body>
</html>
```

## 测试

页面访问 [http://localhost:8080/grammar/hello](http://localhost:8080/grammar/hello)

内容如下：

```
你好，JSP!
你的 IP 地址 0:0:0:0:0:0:0:1
```

# JSP 声明

一个声明语句可以声明一个或多个变量、方法，供后面的Java代码使用。

在JSP文件中，您必须先声明这些变量和方法然后才能使用它们。

## 语法

JSP声明的语法格式：

```
<%! declaration; [ declaration; ]+ ... %>
```

## 实例

- 一次声明单个

```jsp
<%! int i = 0; %> 
<%! int a, b, c; %> 
<%! Circle a = new Circle(2.0); %> 
````

- 一次声明多个

```jsp
<%!
    private int initVar = 0;
    private int serviceVar = 0;
    private int destroyVar = 0;
%>
```

# JSP表达式

一个JSP表达式中包含的脚本语言表达式，先被转化成String，然后插入到表达式出现的地方。

由于表达式的值会被转化成String，所以您可以在一个文本行中使用表达式而不用去管它是否是HTML标签。

表达式元素中可以包含任何符合Java语言规范的表达式，但是不能使用分号来结束表达式。

## 语法

JSP表达式的语法格式：

```
<%= 表达式 %>
```

## 例子

```jsp
<p>
    今天的日期是<%=new Date().toLocaleString()%>
</p>
```

Date 包的导入

```java
<%@ page import="java.util.Date" %>
```

其实和 java 编写非常的类似。

### 测试效果

```
今天的日期是2020-8-30 10:00:30
```

# JSP注释

JSP注释主要有两个作用：为代码作注释以及将某段代码注释掉。

## 语法

JSP注释的语法格式：

| 语法 | 说明 |
|:---|:---|
| `<%-- 注释 --%>`	| JSP注释，注释内容不会被发送至浏览器甚至不会被编译 |
| `<!-- 注释 -->`	| HTML注释，通过浏览器查看网页源代码时可以看见注释内容 |
| `<\%`	| 代表静态 <%常量 |
| `%\>`	| 代表静态 %> 常量 |
| `\'`	| 在属性中使用的单引号 |
| `\"`	| 在属性中使用的双引号 |

## 例子

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>JSP 注释语法</title>
</head>
<body>
<%-- 该部分注释在网页中不会被显示--%> 
<p>
   今天的日期是: <%= (new java.util.Date()).toLocaleString()%>
</p>
</body> 
</html> 
```

# JSP指令

JSP指令用来设置与整个JSP页面相关的属性。

## 语法

JSP指令语法格式：

```
<%@ directive attribute="value" %>
```

这里有三种指令标签：

| 指令	| 描述 |
|:----|:----|
| `<%@ page ... %>`	    | 定义页面的依赖属性，比如脚本语言、error页面、缓存需求等等| 
| `<%@ include ... %>`	| 包含其他文件 |
| `<%@ taglib ... %>`	| 引入标签库的定义，可以是自定义标签 |

# JSP行为

JSP行为标签使用XML语法结构来控制servlet引擎。

它能够动态插入一个文件，重用JavaBean组件，引导用户去另一个页面，为Java插件产生相关的HTML等等。

## 语法

行为标签只有一种语法格式，它严格遵守XML标准：

```xml
<jsp:action_name attribute="value" />
```

行为标签基本上是一些预先就定义好的函数，下表罗列出了一些可用的JSP行为标签：：

| 语法	        | 描述 |
|:----|:----|
| jsp:include	    | 用于在当前页面中包含静态或动态资源 |
| jsp:useBean	    | 寻找和初始化一个JavaBean组件 |
| jsp:setProperty	| 设置 JavaBean组件的值 |
| jsp:getProperty	| 将 JavaBean组件的值插入到 output中 |
| jsp:forward	    | 从一个JSP文件向另一个文件传递一个包含用户请求的request对象 |
| jsp:plugin	    | 用于在生成的HTML页面中包含Applet和JavaBean对象 |
| jsp:element	    | 动态创建一个XML元素 |
| jsp:attribute	| 定义动态创建的XML元素的属性 |
| jsp:body	    | 定义动态创建的XML元素的主体 |
| jsp:text	    | 用于封装模板数据 |


# JSP 隐含对象

JSP 支持九个自动定义的变量，江湖人称隐含对象。

这九个隐含对象的简介见下表：

| 对象	    | 描述 |
|:----|:----|
| request	    | HttpServletRequest类的实例 |
| response	 | HttpServletResponse类的实例 |
| out	        | PrintWriter类的实例，用于把结果输出至网页上 |
| session	    | HttpSession类的实例 |
| application | ServletContext类的实例，与应用上下文有关 |
| config	    | ServletConfig类的实例 |
| pageContext | PageContext类的实例，提供对JSP页面所有对象以及命名空间的访问 |
| page	    | 类似于Java类中的this关键字 |
| Exception	 | Exception类的对象，代表发生错误的JSP页面中对应的异常对象 |

# 控制流语句

JSP提供对Java语言的全面支持。

您可以在JSP程序中使用Java API甚至建立Java代码块，包括判断语句和循环语句等等。

## 判断语句

If…else 块，请看下面这个例子：

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
<h2>IF ELSE 例子</h2>
<br/>
<%!
    private int day = 3;
%>

<%
    if(day == 7 || day == 6) {
        out.println("今天是周末");
    } else {
        out.println("今天是工作日");
    }
%>

</body>
</html>
```

- 测试效果

```
IF ELSE 例子

今天是工作日
```

## switch…case

现在来看看switch…case块，与if…else块有很大的不同，它使用out.println()，并且整个都装在脚本程序的标签中，就像下面这样：

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
<h2>SWITCH CASE 例子</h2>
<br/>
<%!
    private int day = 3;
%>

<%
    switch (day) {
        case 6:
        case 7:
            out.print("周末");
        default:;
            out.print("工作日");
    }
%>

</body>
</html>
```

## 循环语句

在JSP程序中可以使用Java的三个基本循环类型：for，while，和 do…while。

让我们来看看for循环的例子，以下输出的不同字体大小的"菜鸟教程"：

### for 

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
<h2>FOR 循环 例子</h2>
<br/>

<%
    for(int i = 0; i < 3; i++){
        out.println("我爱JSP!");
    }
%>

</body>
</html>
```

- 效果

```
FOR 循环 例子

我爱JSP! 我爱JSP! 我爱JSP!
```

### while

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
<h2>WHILE 循环例子</h2>
<br/>

<%
    int i = 0;
    while(i < 3) {
        out.println("我爱JSP!");
        i++;
    }
%>

</body>
</html>
```

- 页面效果

```
WHILE 循环例子

我爱JSP! 我爱JSP! 我爱JSP!
```

### do...while

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
<h2>DO WHILE 循环例子</h2>
<br/>

<%
    int i = 0;

    do {
        out.println("我爱JSP!");
        i++;
    } while (i < 3);
%>

</body>
</html>
```

- 页面效果

```
DO WHILE 循环例子

我爱JSP! 我爱JSP! 我爱JSP!
```

# JSP 运算符

JSP支持所有Java逻辑和算术运算符。

下表罗列出了JSP常见运算符，优先级从高到底：

| 类别	    | 操作符	           |   结合性 |
|:----|:----|:----|
| 后缀	    | () [] . (点运算符)|   左到右 |
| 一元	    | ++ - - ! ~	       |   右到左 |
| 可乘性	 |     * / % 	           |   左到右 |
| 可加性	 |     + - 	           |   左到右 |
| 移位	    | `>> >>> <<`  	   |   左到右  |
| 关系	    | `> >= < <=`  	   |   左到右 |
| 相等/不等 | == != 	           |   左到右 |
| 位与	    | & 	               |   左到右 |
| 位异或	 |     ^ 	               |   左到右 |
| 位或	    | `|` 	           |   左到右 |
| 逻辑与	 |     && 	               |   左到右 |
| 逻辑或	 |     `||` 	           |   左到右 |
| 条件判断 | ?: 	               |   右到左 |
| 赋值	 |    `= += -= *= /= %= >>= <<= &= ^= |=` 	| 右到左 |
| 逗号 	    | , 	| 左到右 |

# JSP 字面量

JSP语言定义了以下几个字面量：

布尔值(boolean)：true 和 false;

整型(int)：与 Java 中的一样;

浮点型(float)：与 Java 中的一样;

字符串(string)：以单引号或双引号开始和结束;

Null：null。

# 参考资料

https://www.runoob.com/jsp/jsp-syntax.html

* any list
{:toc}