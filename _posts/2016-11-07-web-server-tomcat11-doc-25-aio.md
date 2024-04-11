---
layout: post
title: web server apache tomcat11-25-Advanced IO and Tomcat
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

## 介绍

重要提示：使用这些功能需要使用HTTP连接器。AJP连接器不支持它们。

### 异步写入

当使用HTTP连接器时，Tomcat支持使用sendfile发送大型静态文件。这些写操作在系统负载增加时会以最有效的方式异步执行。与使用阻塞写操作发送大型响应不同，可以将内容写入静态文件，并使用sendfile代码进行写入。缓存阀门可以利用这一点，将响应数据缓存到文件中，而不是将其存储在内存中。如果请求属性 org.apache.tomcat.sendfile.support 被设置为 Boolean.TRUE，则可以使用sendfile支持。

任何Servlet都可以通过设置适当的请求属性来指示Tomcat执行sendfile调用。还需要正确设置响应的内容长度。当使用sendfile时，最好确保请求或响应都没有被包装，因为响应主体将由连接器自身稍后发送，无法进行过滤。除了设置所需的3个请求属性之外，Servlet不应发送任何响应数据，但可以使用任何导致修改响应标头的方法（比如设置cookies）。

- org.apache.tomcat.sendfile.filename：将作为String发送的文件的规范文件名
- org.apache.tomcat.sendfile.start：作为Long的起始偏移量
- org.apache.tomcat.sendfile.end：作为Long的结束偏移量

除了设置这些参数之外，还需要设置content-length头。Tomcat不会为您执行此操作，因为您可能已经将数据写入输出流。

请注意，使用sendfile将禁用Tomcat对响应的任何压缩操作。



# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/aio.html

* any list
{:toc}