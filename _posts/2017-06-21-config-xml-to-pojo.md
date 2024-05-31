---
layout: post
title:  java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [xml, sh]
published: true
---

# 拓展阅读

[config 配置方式概览-8 种配置文件介绍对比 xml/json/proeprties/ini/yaml/TOML/hcl/hocon](https://houbb.github.io/2017/06/21/config-00-overivew)

[config HCL（HashiCorp Configuration Language） 配置文件介绍](https://houbb.github.io/2017/06/21/config-hcl-01-intro)

[config HCL（HashiCorp Configuration Language） 官方文档翻译](https://houbb.github.io/2017/06/21/config-hcl-02-doc)

[config HOCON（Human-Optimized Config Object Notation）配置文件介绍](https://houbb.github.io/2017/06/21/config-hocon-01-intro)

[config ini 配置文件介绍](https://houbb.github.io/2017/06/21/config-ini-01-intro)

[config properties 配置文件介绍](https://houbb.github.io/2017/06/21/config-properties-01-intro)

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[XStream java 实现 xml 与对象 pojo 之间的转换](https://houbb.github.io/2017/06/21/config-xml-XStream-intro)

[java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson](https://houbb.github.io/2017/06/21/config-xml-to-pojo)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yaml-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[YAML-03-yml 配置文件介绍官方文档翻译](https://houbb.github.io/2017/06/21/config-yaml-03-doc)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# 场景

解析的一段 xml 报文信息：

```xml
<xml>
    <ToUserName><![CDATA[xxx]]></ToUserName>
    <FromUserName><![CDATA[xxx]]></FromUserName>
    <CreateTime>1675747313</CreateTime>
    <MsgType><![CDATA[event]]></MsgType>
    <Event><![CDATA[unsubscribe]]></Event>
    <EventKey><![CDATA[]]></EventKey>
</xml>
```

下面介绍几种常见的方式。

# V1-dom4j

## maven 引入

```xml
<dependency>
    <groupId>dom4j</groupId>
    <artifactId>dom4j</artifactId>
    <version>1.6.1</version>
</dependency>
```

## 实现

```java
package com.github.houbb.xml.learn;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import java.util.*;

public class Dmo4jTest {

    public static void main(String[] args) {
        String returnMsg = "<xml><ToUserName><![CDATA[yyyy]]></ToUserName>\n" +
                "<FromUserName><![CDATA[xxxx]]></FromUserName>\n" +
                "<CreateTime>1675747313</CreateTime>\n" +
                "<MsgType><![CDATA[event]]></MsgType>\n" +
                "<Event><![CDATA[unsubscribe]]></Event>\n" +
                "<EventKey><![CDATA[]]></EventKey>\n" +
                "</xml>";

        try {
            Document doc = DocumentHelper.parseText(returnMsg);

            // 指向根节点
            Element root = doc.getRootElement();

            Iterator it = root.elementIterator();
            while (it.hasNext()) {
                // 一个Item节点
                Element element = (Element) it.next();
                System.out.println(element.getName() + " : " + element.getTextTrim());
            }

        } catch (DocumentException e) {
            e.printStackTrace();
        }

    }

}
```

输出日志：

```
ToUserName : yyyy
FromUserName : xxxx
CreateTime : 1675747313
MsgType : event
Event : unsubscribe
EventKey : 
```

当然，这样转为 pojo 还需要额外的处理。

针对这一点，有一些工具已经非常成功。

# V2-使用 xstream

## maven 引入

```xml
<dependency>
    <groupId>com.thoughtworks.xstream</groupId>
    <artifactId>xstream</artifactId>
    <version>1.4.9</version>
</dependency>
```

## java 实现

对应的 XstramWxEventMessage 对象定义如下：

```java
package com.github.houbb.xml.learn.dto;

import com.thoughtworks.xstream.annotations.XStreamAlias;

import java.io.Serializable;

@XStreamAlias("xml")
public class XstramWxEventMessage implements Serializable {

    @XStreamAlias("ToUserName")
    private String toUserName;

    @XStreamAlias("FromUserName")
    private String fromUserName;

    @XStreamAlias("CreateTime")
    private String createTime;

    @XStreamAlias("MsgType")
    private String msgType;

    @XStreamAlias("Event")
    private String event;

    @XStreamAlias("EventKey")
    private String eventKey;

    // getter&setter&toString

}
```

我们可以通过 `@XStreamAlias` 指定字段和类的别名。

```java
package com.github.houbb.xml.learn;

import com.github.houbb.xml.learn.dto.XstramWxEventMessage;
import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.DomDriver;

public class XstramTest {

    public static void main(String[] args) {
        // 这是会报错，感觉场景不是很适合
        XStream xstream = new XStream(new DomDriver());
        xstream.processAnnotations(XstramWxEventMessage.class);

        XstramWxEventMessage message = new XstramWxEventMessage();
        message.setFromUserName("ffff");
        message.setToUserName("Xxxx");

        String xml = xstream.toXML(message);
        System.out.println(xml);


        String returnMsg = "<xml><ToUserName><![CDATA[yyyy]]></ToUserName>\n" +
                "<FromUserName><![CDATA[xxxx]]></FromUserName>\n" +
                "<CreateTime>1675747313</CreateTime>\n" +
                "<MsgType><![CDATA[event]]></MsgType>\n" +
                "<Event><![CDATA[unsubscribe]]></Event>\n" +
                "<EventKey><![CDATA[]]></EventKey>\n" +
                "</xml>";

        XstramWxEventMessage fromMessage = (XstramWxEventMessage) xstream.fromXML(returnMsg);
        System.out.println(fromMessage);
    }

}
```


输出日志：

```
<xml>
  <ToUserName>Xxxx</ToUserName>
  <FromUserName>ffff</FromUserName>
</xml>

WxEventMessage{toUserName='yyyy', fromUserName='xxxx', createTime='1675747313', msgType='event', event='unsubscribe', eventKey=''}
```

这样使用起来比较方便，不过对于 xml 这个必须限定指定别称，感觉也挺别扭的。

# V3-jaskson 

## maven 

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.9.7</version>
</dependency>
```

## java 实现

```java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class JacksonWxEventMessage implements Serializable {

    @JacksonXmlProperty(localName = "ToUserName")
    private String toUserName;

    @JacksonXmlProperty(localName = "FromUserName")
    private String fromUserName;

    @JacksonXmlProperty(localName = "CreateTime")
    private String createTime;

    @JacksonXmlProperty(localName = "MsgType")
    private String msgType;

    @JacksonXmlProperty(localName = "Event")
    private String event;

    @JacksonXmlProperty(localName = "EventKey")
    private String eventKey;

    // getter&setter&toString

}
```

测试代码

```java
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.github.houbb.xml.learn.dto.JacksonWxEventMessage;

public class JasksonTest {

    public static void main(String[] args) {
        String returnMsg = "<xml><ToUserName><![CDATA[yyyy]]></ToUserName>\n" +
                "<FromUserName><![CDATA[xxxx]]></FromUserName>\n" +
                "<CreateTime>1675747313</CreateTime>\n" +
                "<MsgType><![CDATA[event]]></MsgType>\n" +
                "<Event><![CDATA[unsubscribe]]></Event>\n" +
                "<EventKey><![CDATA[]]></EventKey>\n" +
                "</xml>";

        try {
            XmlMapper xmlMapper = new XmlMapper();

            JacksonWxEventMessage jacksonWxEventMessage = xmlMapper.readValue(returnMsg, JacksonWxEventMessage.class);

            System.out.println(jacksonWxEventMessage);

        } catch (Exception e) {
            e.printStackTrace();
        }

    }

}
```

# 总结

实现的方式有多种，选择合适自己业务的即可。

* any list
{:toc}