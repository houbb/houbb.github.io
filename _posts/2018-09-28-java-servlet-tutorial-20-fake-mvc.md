---
layout: post
title: Java Servlet 教程-20-自己手写实现 spring mvc 整体思路
date:  2018-09-27 14:49:58 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
---

# SpringMVC 简介

SpringMVC 是当前最优秀的MVC框架，自从Spring 2.5版本发布后，由于支持注解配置，易用性有了大幅度的提高。

Spring 3.0更加完善，实现了对Struts 2的超越。

现在越来越多的开发团队选择了Spring MVC。

Spring为展现层提供的基于MVC设计理念的优秀的Web框架，是目前最主流的MVC框架之一

Spring3.0后全面超越Struts2，成为最优秀的MVC框架

Spring MVC通过一套MVC注解，让POJO成为处理请求的控制器，而无须实现任何接口。

支持REST风格的URL请求

采用了松散耦合可插拔组件结构，比其他MVC框架更具扩展性和灵活性

# SpringMVC 运行流程

![image](https://user-images.githubusercontent.com/18375710/74233773-48846480-4d06-11ea-9c72-e6ffe15ad41d.png)

## 执行流程

执行过程如图所示：

- 用户发送请求至前端控制器DispatcherServlet。

- DispatcherServlet收到请求调用HandlerMapping处理器映射器。

- 处理器映射器根据请求url找到具体的处理器，生成处理器对象及处理器拦截器(如果有则生成)一并返回给DispatcherServlet。

- DispatcherServlet通过HandlerAdapter处理器适配器调用处理器。

- 执行处理器(Controller，也叫后端控制器)。

- Controller执行完成返回ModelAndView。

- HandlerAdapter将controller执行结果ModelAndView返回给DispatcherServlet。

- DispatcherServlet将ModelAndView传给ViewReslover视图解析器。

- ViewReslover解析后返回具体View。

- DispatcherServlet对View进行渲染视图（即将模型数据填充至视图中）。

- DispatcherServlet响应用户。

从上面可以看出，DispatcherServlet有接收请求，响应结果，转发等作用。

有了DispatcherServlet之后，可以减少组件之间的耦合度。

# SpringMVC九大组件

## HandlerMapping

是用来查找Handler的。

在SpringMVC中会有很多请求，每个请求都需要一个Handler处理，具体接收到一个请求之后使用哪个Handler进行处理，这就是HandlerMapping需要做的事。

## HandlerAdapter

从名字上看，它就是一个适配器。

因为SpringMVC中的Handler可以是任意的形式，只要能处理请求就ok，但是Servlet需要的处理方法的结构却是固定的，都是以request和response为参数的方法。

如何让固定的Servlet处理方法调用灵活的Handler来进行处理呢？

这就是HandlerAdapter要做的事情。

小结：Handler是用来干活的工具；HandlerMapping用于根据需要干的活找到相应的工具；HandlerAdapter是使用工具干活的人。

## HandlerExceptionResolver

其它组件都是用来干活的。

在干活的过程中难免会出现问题，出问题后需要有一个专门的角色对异常情况进行处理，在SpringMVC中就是HandlerExceptionResolver。

具体来说，此组件的作用是根据异常设置ModelAndView，之后再交给render方法进行渲染。

## ViewResolver

ViewResolver用来将String类型的视图名和Locale解析为View类型的视图。

View是用来渲染页面的，也就是将程序返回的参数填入模板里，生成html（也可能是其它类型）文件。

这里就有两个关键问题：使用哪个模板？用什么技术（规则）填入参数？

这其实是ViewResolver主要要做的工作，ViewResolver需要找到渲染所用的模板和所用的技术（也就是视图的类型）进行渲染，具体的渲染过程则交由不同的视图自己完成。

## RequestToViewNameTranslator

ViewName是根据ViewName查找View，但有的Handler处理完后并没有设置View也没有设置ViewName，这时就需要从request获取ViewName了，如何从request中获取ViewName就是RequestToViewNameTranslator要做的事情了。

RequestToViewNameTranslator在Spring MVC容器里只可以配置一个，所以所有request到ViewName的转换规则都要在一个Translator里面全部实现。

## LocaleResolver

解析视图需要两个参数：一是视图名，另一个是Locale。

视图名是处理器返回的，Locale是从哪里来的？

这就是LocaleResolver要做的事情。

LocaleResolver用于从request解析出Locale，Locale就是zh-cn之类，表示一个区域，有了这个就可以对不同区域的用户显示不同的结果。

SpringMVC主要有两个地方用到了Locale：一是ViewResolver视图解析的时候；二是用到国际化资源或者主题的时候。

## ThemeResolver

用于解析主题。

SpringMVC中一个主题对应一个properties文件，里面存放着跟当前主题相关的所有资源、如图片、css样式等。

SpringMVC的主题也支持国际化，同一个主题不同区域也可以显示不同的风格。

SpringMVC中跟主题相关的类有 ThemeResolver、ThemeSource和Theme。

主题是通过一系列资源来具体体现的，要得到一个主题的资源，首先要得到资源的名称，这是ThemeResolver的工作。

然后通过主题名称找到对应的主题（可以理解为一个配置）文件，这是ThemeSource的工作。

最后从主题中获取资源就可以了。

## MultipartResolver

用于处理上传请求。

处理方法是将普通的request包装成MultipartHttpServletRequest，后者可以直接调用getFile方法获取File，如果上传多个文件，还可以调用getFileMap得到FileName->File结构的Map。

此组件中一共有三个方法，作用分别是判断是不是上传请求，将request包装成MultipartHttpServletRequest、处理完后清理上传过程中产生的临时资源。

## FlashMapManager

用来管理FlashMap的，FlashMap主要用在redirect中传递参数。

# Spring Mvc 整体流程设计

## 配置加载

SpringMVC本质上是一个Servlet,这个 Servlet 继承自 HttpServlet。

FrameworkServlet负责初始化SpringMVC的容器，并将Spring容器设置为父容器。

因为本文只是实现SpringMVC，对于Spring容器不做过多讲解。

为了读取web.xml中的配置，我们用到ServletConfig这个类，它代表当前Servlet在web.xml中的配置信息。

通过 web.xml 中加载我们自己写的 DispatcherServlet 和读取配置文件。

![image](https://user-images.githubusercontent.com/18375710/74235340-bbdba580-4d09-11ea-800a-d057b7866fa5.png)

## 初始化阶段

 在前面我们提到DispatcherServlet的initStrategies方法会初始化9大组件，但是这里将实现一些SpringMVC的最基本的组件而不是全部，按顺序包括：

1. 加载配置文件

2. 扫描用户配置包下面所有的类

3. 拿到扫描到的类，通过反射机制，实例化。并且放到ioc容器中(Map的键值对 beanName-bean) beanName默认是首字母小写

4. 初始化HandlerMapping，这里其实就是把url和method对应起来放在一个k-v的Map中,在运行阶段取出

## 运行阶段

每一次请求将会调用doGet或doPost方法，所以统一运行阶段都放在doDispatch方法里处理，它会根据url请求去HandlerMapping中匹配到对应的Method，然后利用反射机制调用Controller中的url对应的方法，并得到结果返回。

按顺序包括以下功能：

1. 异常的拦截

2. 获取请求传入的参数并处理参数

3. 通过初始化好的handlerMapping中拿出url对应的方法名，反射调用

# 参考资料

[手写 SpringMVC 框架（简易版）](https://blog.csdn.net/yaluoshan/article/details/80768258)

* any list
{:toc}