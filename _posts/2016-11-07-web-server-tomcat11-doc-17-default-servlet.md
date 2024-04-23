---
layout: post
title: web server apache tomcat11-17-default-servlet
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

...


# DefaultServlet 是什么？

默认的 Servlet 是一个用于提供静态资源以及显示目录列表（如果启用了目录列表）的 Servlet。

## 声明位置

它在 `$CATALINA_BASE/conf/web.xml` 中全局声明。默认情况下，它的声明如下：

```xml
<servlet>
    <servlet-name>default</servlet-name>
    <servlet-class>
      org.apache.catalina.servlets.DefaultServlet
    </servlet-class>
    <init-param>
        <param-name>debug</param-name>
        <param-value>0</param-value>
    </init-param>
    <init-param>
        <param-name>listings</param-name>
        <param-value>false</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
</servlet>

...

<servlet-mapping>
    <servlet-name>default</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

因此，默认情况下，default servlet 在 web 应用程序启动时加载，目录列表被禁用，并且调试被关闭。

## 如何更改设置？

DefaultServlet 允许以下 initParameters：

| 属性                    | 描述                                                                                                                                                                  |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| debug                 | 调试级别。除非您是 Tomcat 开发者，否则没有多大用处。截至目前，有用的值为 0、1、11。 [0]                                                                                                      |
| listings              | 如果没有欢迎文件，是否可以显示目录列表？值可以是 true 或 false [false]                                                                                                                    |
| precompressed         | 如果存在文件的预压缩版本（文件名附加了 .br 或 .gz），并且用户代理支持匹配的内容编码（br 或 gzip），并且启用了此选项，则 Tomcat 将提供预压缩文件。 [false]                        |
| readmeFile            | 如果显示目录列表，则也可以显示 readme 文件。此文件会原样插入，因此它可能包含 HTML。                                                                                                            |
| globalXsltFile        | 如果要自定义目录列表，可以使用 XSL 转换。此值是一个相对文件名（到 $CATALINA_BASE/conf/ 或 $CATALINA_HOME/conf/），将用于所有目录列表。此设置可以针对每个上下文和/或每个目录进行覆盖。见下文的 contextXsltFile 和 localXsltFile。 |
| contextXsltFile       | 您还可以通过配置 contextXsltFile 来根据上下文自定义目录列表。这必须是一个上下文相对路径（例如：/path/to/context.xslt），指向具有 .xsl 或 .xslt 扩展名的文件。这会覆盖 globalXsltFile。如果此值存在但文件不存在，则将使用 globalXsltFile。如果 globalXsltFile 不存在，则将显示默认目录列表。 |
| localXsltFile         | 您还可以通过配置 localXsltFile 来根据目录自定义目录列表。这必须是目录列表所在目录中具有 .xsl 或 .xslt 扩展名的文件。这会覆盖 globalXsltFile 和 contextXsltFile。如果此值存在但文件不存在，则将使用 contextXsltFile。如果 contextXsltFile 不存在，则将使用 globalXsltFile。如果 globalXsltFile 不存在，则将显示默认目录列表。 |
| input                 | 在读取要提供的资源时的输入缓冲区大小（以字节为单位）。 [2048]                                                                                                                    |
| output                | 在写入要提供的资源时的输出缓冲区大小（以字节为单位）。 [2048]                                                                                                                    |
| readonly              | 此上下文是否为“只读”，因此会拒绝像 PUT 和 DELETE 这样的 HTTP 命令？ [true]                                                                                                        |
| fileEncoding          | 在读取静态资源时要使用的文件编码。 [platform default]                                                                                                                             |
| useBomIfPresent       | 如果静态文件包含字节顺序标记（BOM），是否应该优先使用它来确定文件编码，而不是 fileEncoding。此设置必须是 true（删除 BOM 并优先使用它而不是 fileEncoding）、false（删除 BOM 但不使用它）或 pass-through（不使用 BOM 并且不删除它）。 [true] |
| sendfileSize          | 如果使用的连接器支持 sendfile，这表示将使用 sendfile 的最小文件大小（以 KiB 为单位）。使用负值始终禁用 sendfile。 [48]                                                                |
| useAcceptRanges       | 如果为真，则会在响应适当时设置 Accept-Ranges 标头。 [true]                                                                                                                         |
| showServerInfo        | 在启用目录列表时，是否应向客户端发送响应中呈现服务器信息。 [true]                                                                                                                    |
| sortListings          | 服务器是否应该对目录中的列表进行排序。 [false]                                                                                                                                      |
| sortDirectoriesFirst  | 服务器是否应该在所有文件之前列出所有目录。 [false]                                                                                                                                  |
| allowPartialPut       | 服务器是否应将具有 Range 标头的 HTTP PUT 请求视为部分 PUT？请注意，虽然 RFC 7233 澄清了 Range 标头仅对 GET 请求有效，但 RFC 9110（废除了 RFC 7233）现在允许部分 PUT。 [true]                                                                  |
| directoryRedirectStatusCode | 当进行目录重定向（缺少尾部斜杠）时，使用此作为 HTTP 响应代码。 [302]                                                                                                             |

（部分属性已省略）

## 如何自定义目录列表？

您可以使用 `localXsltFile`、`contextXsltFile` 或 `globalXsltFile`，DefaultServlet 将创建一个 XML 文档，并根据 XSLT 文件中提供的值运行它进行 XSL 转换。首先检查 `localXsltFile`，然后是 `contextXsltFile`，最后是 `globalXsltFile`。如果没有配置 XSLT 文件，则使用默认行为。

```xml
<listing>
     <entries>
      <entry type='file|dir' urlPath='aPath' size='###' date='gmt date'>
        fileName1
      </entry>
      <entry type='file|dir' urlPath='aPath' size='###' date='gmt date'>
        fileName2
      </entry>
      ...
     </entries>
     <readme></readme>
    </listing>
```

一个例子：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  version="3.0">

  <xsl:output method="html" html-version="5.0"
    encoding="UTF-8" indent="no"
    doctype-system="about:legacy-compat"/>

  <xsl:template match="listing">
   <html>
    <head>
      <title>
        Sample Directory Listing For
        <xsl:value-of select="@directory"/>
      </title>
      <style>
        h1 {color : white;background-color : #0086b2;}
        h3 {color : white;background-color : #0086b2;}
        body {font-family : sans-serif,Arial,Tahoma;
             color : black;background-color : white;}
        b {color : white;background-color : #0086b2;}
        a {color : black;} HR{color : #0086b2;}
        table td { padding: 5px; }
      </style>
    </head>
    <body>
      <h1>Sample Directory Listing For
            <xsl:value-of select="@directory"/>
      </h1>
      <hr style="height: 1px;" />
      <table style="width: 100%;">
        <tr>
          <th style="text-align: left;">Filename</th>
          <th style="text-align: center;">Size</th>
          <th style="text-align: right;">Last Modified</th>
        </tr>
        <xsl:apply-templates select="entries"/>
        </table>
      <xsl:apply-templates select="readme"/>
      <hr style="height: 1px;" />
      <h3>Apache Tomcat/11.0</h3>
    </body>
   </html>
  </xsl:template>


  <xsl:template match="entries">
    <xsl:apply-templates select="entry"/>
  </xsl:template>

  <xsl:template match="readme">
    <hr style="height: 1px;" />
    <pre><xsl:apply-templates/></pre>
  </xsl:template>

  <xsl:template match="entry">
    <tr>
      <td style="text-align: left;">
        <xsl:variable name="urlPath" select="@urlPath"/>
        <a href="{$urlPath}">
          <pre><xsl:apply-templates/></pre>
        </a>
      </td>
      <td style="text-align: right;">
        <pre><xsl:value-of select="@size"/></pre>
      </td>
      <td style="text-align: right;">
        <pre><xsl:value-of select="@date"/></pre>
      </td>
    </tr>
  </xsl:template>

</xsl:stylesheet>
```



## 如何保护目录列表？

对于每个个别的 web 应用程序，可以使用 `web.xml`。请参阅 Servlet 规范的安全部分。

# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/proxy-howto.html

* any list
{:toc}