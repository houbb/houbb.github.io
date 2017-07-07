---
layout: post
title:  WebService
date:  2017-7-3 18:13:57 +0800
categories: [HTTP]
tags: [web service]
published: true
---

# Web Service

一、是什么？

[Web Services](http://www.w3school.com.cn/webservices/index.asp)是由企业发布的完成其特定商务需求的在线应用服务,其他公司或应用软件能够通过Internet来访问并使用这项在线服务。
用简单点的话说，就是系统对外的接口。

- Web Services 是应用程序组件

- Web Services 使用开放协议进行通信

- Web Services 是独立的（self-contained）并可自我描述

- Web Services 可通过使用UDDI来发现

- Web Services 可被其他应用程序使用

- XML 是 Web Services 的基础

二、 如何工作？

基础的 Web Services 平台是 XML + HTTP。

HTTP 协议是最常用的因特网协议。

XML 提供了一种可用于不同的平台和编程语言之间的语言。

Web services 平台的元素：

- [SOAP](http://www.w3school.com.cn/soap/index.asp) (简易对象访问协议)

- UDDI (通用描述、发现及整合)

- [WSDL](http://www.runoob.com/wsdl/wsdl-tutorial.html) (Web services 描述语言)


> [系列教程](http://blog.csdn.net/csh624366188/article/details/8221430)

# Hello world

[简单实例](http://blog.csdn.net/hanxuemin12345/article/details/40163757)


本例子语言为 java，依赖于JDK1.6及以上。(本机为1.8)


一、创建服务类

- HelloWorldService.java

```java
import javax.jws.WebMethod;
import javax.jws.WebService;
import javax.xml.ws.Endpoint;

/**
 * Created by bbhou on 2017/7/3.
 * @since 1.6
 */
@WebService
public class HelloWorldService {

    public String helloWorld(String name) {
        return "hello" + name;
    }

    /**
     * 此方法不会被发布
     * @param name
     * @return
     */
    @WebMethod(exclude = true)
    public String helloWorldTwo(String name) {
        return "hello" + name;
    }

    public static void main(String[] args) {
        System.out.println("WebService Start...");
        Endpoint.publish("http://127.0.0.1:12345/helloworld", new HelloWorldService());
    }

}
```

启动本服务，当命令行打印出`WebService Start...` 之后，在浏览器中输入：

```
http://127.0.0.1:12345/helloworld?wsdl
```

你可以看到网页内容如下：

```xml
<definitions xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:wsp="http://www.w3.org/ns/ws-policy" xmlns:wsp1_2="http://schemas.xmlsoap.org/ws/2004/09/policy" xmlns:wsam="http://www.w3.org/2007/05/addressing/metadata" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:tns="http://core.webservice.ryo.com/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://schemas.xmlsoap.org/wsdl/" targetNamespace="http://core.webservice.ryo.com/" name="HelloWorldServiceService">
<types>
<xsd:schema>
<xsd:import namespace="http://core.webservice.ryo.com/" schemaLocation="http://127.0.0.1:12345/helloworld?xsd=1"/>
</xsd:schema>
</types>
<message name="helloWorld">
<part name="parameters" element="tns:helloWorld"/>
</message>
<message name="helloWorldResponse">
<part name="parameters" element="tns:helloWorldResponse"/>
</message>
<portType name="HelloWorldService">
<operation name="helloWorld">
<input wsam:Action="http://core.webservice.ryo.com/HelloWorldService/helloWorldRequest" message="tns:helloWorld"/>
<output wsam:Action="http://core.webservice.ryo.com/HelloWorldService/helloWorldResponse" message="tns:helloWorldResponse"/>
</operation>
</portType>
<binding name="HelloWorldServicePortBinding" type="tns:HelloWorldService">
<soap:binding transport="http://schemas.xmlsoap.org/soap/http" style="document"/>
<operation name="helloWorld">
<soap:operation soapAction=""/>
<input>
<soap:body use="literal"/>
</input>
<output>
<soap:body use="literal"/>
</output>
</operation>
</binding>
<service name="HelloWorldServiceService">
<port name="HelloWorldServicePort" binding="tns:HelloWorldServicePortBinding">
<soap:address location="http://127.0.0.1:12346/helloworld"/>
</port>
</service>
</definitions>
```

二、服务的发布

wsimport 是 JDK 自带的，可以根据 WSDL 文档生成客户端调用代码的工具。

`wsimport.exe` 命令参数：

```
-d: 生成class文件。默认参数。
-s：生成Java文件
-p：自定义包结构
```

在文件夹 `/Users/houbinbin/IT/fork/webService/temp` 中执行以下命令：

```
wsimport -s . -p com.ryo.webservice.core http://127.0.0.1:12346/helloworld?wsdl
```

则在文件夹 `/Users/houbinbin/IT/fork/webService/temp/com/ryo/webservice/core` 下可见如下文件：

```
houbinbindeMacBook-Pro:core houbinbin$ ls
HelloWorld.class                HelloWorldResponse.class        HelloWorldService.class         HelloWorldServiceService.class  ObjectFactory.class             package-info.class
HelloWorld.java                 HelloWorldResponse.java         HelloWorldService.java          HelloWorldServiceService.java   ObjectFactory.java              package-info.java
```

三、客户端调用


新建项目 `webservice-client`, 将上述java文件复制到源文件目录下。

创建客户端类：

- WebServiceClient.java

```java
public class WebServiceClient {

    public static void main(String[] args) {
        HelloWorldServiceService helloWorldServiceService = new HelloWorldServiceService();
        HelloWorldService helloWorldService = helloWorldServiceService.getHelloWorldServicePort();
        String result = helloWorldService.helloWorld("ryo");
        System.out.println(result);
    }

}
```

运行内容如下：

```
helloryo
```

文件目结构如下：

```
houbinbindeMacBook-Pro:client houbinbin$ ls
HelloWorld.java                 HelloWorldService.java          ObjectFactory.java              package-info.java
HelloWorldResponse.java         HelloWorldServiceService.java   WebServiceClient.java
```

# 如何发布到服务器

有2个办法，

一是：在本机上通过myeclipse自带的直接deploy，然后到tomcat安装目录下把编译后的项目文件夹拷到服务器上的tomcat webApps。再启动tomcat

二是：打包部署，myeclipse中右击项目，有个导出功能，选择war包。先把服务器上的tomcat停止，然后把前面导出的war包拷到服务器上tomcat webApps目录下，启动tomcat服务，就会自动部署了。


其实第二个方法打包部署昨天就试过了不行，估计是那时tomcat没停止再启动吧。 至于拷整个目录，我之前也都是拷错了，一直拷编译前的webroot目录， 所以有很多问题。



# Idea 创建 webService

> [利用IDEA创建Web Service服务端和客户端](http://blog.csdn.net/qq_35489188/article/details/52997014)

一、服务端的创建

此处省略不讲。

二、客户端创建

1、File => New => Project

![new web service]({{ site.url }}/static/app/img/webservice/2017-07-07-webservice-client.png)

输入对应的项目名称，完成即可。

会自动下载需要的jar包等文件。

2、Generator code

项目右键=》webService=》Generate java Code From Wsdl。
 
保证引入的 web service 可访问， 直接在 **Web service wsdl url** 输入对应的 wsdl 全路径。

如：

```
http://localhost:12345/hell?wsdl
```

可以勾选 **Generate TestCase**, 会生成对应的测试代码。需要引入 junit 的代码。

* any list
{:toc}



 
 




