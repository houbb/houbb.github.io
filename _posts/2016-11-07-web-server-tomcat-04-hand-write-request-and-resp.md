---
layout: post
title: 从零手写实现 tomcat-04-请求和响应的抽象
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

# 整体思路

我们针对入参 request 和 出参 response 做一个简单的封装。

# v1-出入参的抽象

## request

```java
    /**
     * 请求方式 例如：GET/POST
     */
    private String method;


    /**
     * / ， /index.html
     */

    private String url;


    /**
     * 其他的属性都是通过inputStream解析出来的。
     */

    private InputStream inputStream;

    public MiniCatRequest(InputStream inputStream) {
        this.inputStream = inputStream;

        this.readFromStream();
    }

    private void readFromStream() {
        try {
            //从输入流中获取请求信息
            int count = inputStream.available();
            byte[] bytes = new byte[count];
            int readResult = inputStream.read(bytes);
            String inputsStr = new String(bytes);
            logger.info("[MiniCat] readCount={}, input stream {}", readResult, inputsStr);

            //获取第一行数据
            String firstLineStr = inputsStr.split("\\n")[0];  //GET / HTTP/1.1
            String[] strings = firstLineStr.split(" ");
            this.method = strings[0];
            this.url = strings[1];
        } catch (IOException e) {
            logger.error("[MiniCat] readFromStream meet ex", e);
            throw new RuntimeException(e);
        }
    }
```

这里是针对 http 请求的解析处理。

## response

```java
    private final OutputStream outputStream;

    public MiniCatResponse(OutputStream outputStream) {
        this.outputStream = outputStream;
    }


    public void write(byte[] bytes) {
        try {
            outputStream.write(bytes);
        } catch (IOException e) {
            throw new MiniCatException(e);
        }
    }
```

## start 方法调整

直接改动为对应的出入参对象。

```java
while(runningFlag && !serverSocket.isClosed()){
    Socket socket = serverSocket.accept();
    // 输入流
    InputStream inputStream = socket.getInputStream();
    MiniCatRequest request = new MiniCatRequest(inputStream);
    // 输出流
    MiniCatResponse response = new MiniCatResponse(socket.getOutputStream());
    response.write(InnerHttpUtil.httpResp("Hello miniCat!").getBytes());
    socket.close();
}
```

## 测试

```
[INFO] [2024-04-02 16:27:32.455] [Thread-0] [c.g.h.m.b.MiniCatBootstrap.startSync] - [MiniCat] start listen on port 8080
[INFO] [2024-04-02 16:27:32.455] [Thread-0] [c.g.h.m.b.MiniCatBootstrap.startSync] - [MiniCat] visit url http://127.0.0.1:8080
```

我们浏览器访问 [http://127.0.0.1:8080](http://127.0.0.1:8080)

读取到的流内容为：

```
[INFO] [2024-04-02 16:28:17.825] [Thread-0] [c.g.h.m.d.MiniCatRequest.readFromStream] - [MiniCat] readCount=664, input stream GET / HTTP/1.1
Host: 127.0.0.1:8080
Connection: keep-alive
sec-ch-ua: "Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: zh-CN,zh;q=0.9
```

# v2-返回静态资源文件

## 思路

我们根据 url 解析本地的 html 等静态资源信息。

resources 下面的文件，mvn clean install 之后，默认在 `~\target\classes` 路径下

## 核心代码

```java
// 输出流
MiniCatResponse response = new MiniCatResponse(socket.getOutputStream());
// 判断文件是否存在
String staticHtmlPath = request.getUrl();
if (staticHtmlPath.endsWith(".html")) {
    String absolutePath = ResourceUtil.buildFullPath(ResourceUtil.getClassRootResource(MiniCatBootstrap.class), staticHtmlPath);
    String content = FileUtil.getFileContent(absolutePath);
    logger.info("[MiniCat] static html path: {}, content={}", absolutePath, content);
    String html = InnerHttpUtil.http200Resp(content);
    response.write(html);
} else {
    String html = InnerHttpUtil.http404Resp();
    response.write(html);
}
```

主要是两个步骤：

1）获取当前 class 文件对应的资源文件根路径。

2）然后拼接完整文件路径，读取文件内容。

## 测试

比如我们在 resource 下面放一个 index.html

内容如下：

```html
mini cat index html!
```

启动后，访问：

访问 [http://127.0.0.1:8080/index.html](http://127.0.0.1:8080/index.html)

页面返回：

```
mini cat index html!
```

# 开源地址

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

# 参考资料

https://www.cnblogs.com/isdxh/p/14199711.html

https://blog.csdn.net/u011662320/article/details/65631800


[java获取路径，文件名的方法总结](https://blog.csdn.net/dudefu011/article/details/49911287)

* any list
{:toc}