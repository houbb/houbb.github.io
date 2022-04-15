---
layout: post
title:  WebSocket-02-java 实现例子
date:  2022-04-15 09:22:02 +0800
categories: [Web]
tags: [web, socket, sh]
published: true
---


# WebSocket

[WebSocket](http://websocket.org/) 是一种网络通信协议。

> [WebSocket 教程-阮一峰](http://www.ruanyifeng.com/blog/2017/05/websocket.html)

# 缘起

为了实现如下功能：后台内容变更，前端实时刷新。

常见解决方案：

一、Ajax long-polling

性能差。

二、 flash

需要会写 flash 代码。而且这个技术即将被淘汰。

三、 Node.js Socket.io

对于前端架构有要求，个人不太想用。

四、 WebSocket

缺点：有些浏览器不支持。

个人倾向于此方案，期望这个技术可以走的更远。


# What

WebSocket 协议在 2008 年诞生，2011年成为国际标准。所有浏览器都已经支持了。

| 浏览器	    | 支持情况 |
|:---|:---|
| Chrome	        | Chrome version 4+支持   |
| Firefox	        | Firefox version 5+支持  |
| IE	            | IE version 10+支持      |
| Safari	        | IOS 5+支持              |
| Android Brower	|   Android 4.5+支持      |

它的最大特点就是，服务器可以主动向客户端推送信息，客户端也可以主动向服务器发送信息，是真正的双向平等对话，属于服务器推送技术的一种。

![2017-11-01-web-socket-description](https://raw.githubusercontent.com/houbb/resource/master/img/web/2017-11-01-web-socket-description.png)

其他特点包括：

1. 建立在 TCP 协议之上，服务器端的实现比较容易。

2. 与 HTTP 协议有着良好的兼容性。默认端口也是 80 和 443，并且握手阶段采用 HTTP 协议，因此握手时不容易屏蔽，能通过各种 HTTP 代理服务器。

3. 数据格式比较轻量，性能开销小，通信高效。

4. 可以发送文本，也可以发送二进制数据。

5. 没有同源限制，客户端可以与任意服务器通信。

6. 协议标识符是 `ws`（如果加密，则为wss），服务器网址就是 URL。


# Client Demo

下面是一个[网页脚本的例子](http://jsbin.com/muqamiqimu/edit?js,console)，基本上一眼就能明白。

```js
var ws = new WebSocket("wss://echo.websocket.org");

ws.onopen = function(evt) { 
  console.log("Connection open ..."); 
  ws.send("Hello WebSockets!");
};

ws.onmessage = function(evt) {
  console.log( "Received Message: " + evt.data);
  ws.close();
};

ws.onclose = function(evt) {
  console.log("Connection closed.");
};  
```


# Quick Start

下面演示一个基于 Java 的简单例子。

[完整的代码例子](https://github.com/houbb/websocket)

新建一个最简单的 web maven 项目，项目结构：

```
├─src
│  └─main
│      ├─java
│      │  └─com
│      │      └─ryo
│      │          └─websocket
│      │              │
│      │              └─websocket
│      │                      MyWebSocket.java
│      │
│      └─webapp
│          │  hello.html
│          │
│          └─WEB-INF
│                  web.xml
```

## 后端

- jar

```xml
<dependency>
    <groupId>javax.websocket</groupId>
    <artifactId>javax.websocket-api</artifactId>
    <version>1.1</version>
    <scope>provided</scope>
</dependency>
```

- MyWebSocket.java

```java
package com.ryo.websocket.websocket;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * WebSocket 后台简单实现
 *
 * 参考：[Java后端WebSocket的Tomcat实现](http://blog.chenzuhuang.com/archive/28.html)
 * Created by bbhou on 2017/11/1.
 */
//该注解用来指定一个URI，客户端可以通过这个URI来连接到WebSocket。类似Servlet的注解mapping。无需在web.xml中配置。
@ServerEndpoint("/websocket")
public class MyWebSocket {

    private AtomicInteger onlineCount = new AtomicInteger(0);

    //concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。若要实现服务端与单一客户端通信的话，可以使用Map来存放，其中Key可以为用户标识
    private static CopyOnWriteArraySet<MyWebSocket> webSocketSet = new CopyOnWriteArraySet<MyWebSocket>();

    //与某个客户端的连接会话，需要通过它来给客户端发送数据
    private Session session;

    /**
     * 连接建立成功调用的方法
     * @param session  可选的参数。session为与某个客户端的连接会话，需要通过它来给客户端发送数据
     */
    @OnOpen
    public void onOpen(Session session){
        this.session = session;
        webSocketSet.add(this);     //加入set中
        addOnlineCount();           //在线数加1
        System.out.println("有新连接加入！当前在线人数为" + getOnlineCount());
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose(){
        webSocketSet.remove(this);  //从set中删除
        subOnlineCount();           //在线数减1
        System.out.println("有一连接关闭！当前在线人数为" + getOnlineCount());
    }

    /**
     * 收到客户端消息后调用的方法
     * @param message 客户端发送过来的消息
     * @param session 可选的参数
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("来自客户端的消息:" + message);

        //群发消息
        for(MyWebSocket item: webSocketSet){
            try {
                item.sendMessage(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 发生错误时调用
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error){
        System.out.println("发生错误");
        error.printStackTrace();
    }


    /**
     * 获取在线人数
     * @return
     */
    private int getOnlineCount() {
        return onlineCount.get();
    }

    /**
     * 添加在线人数
     */
    private void addOnlineCount() {
        onlineCount.getAndIncrement();
    }

    /**
     * 减少在线人数
     */
    private void subOnlineCount() {
        onlineCount.getAndDecrement();
    }


    /**
     * 这个方法与上面几个方法不一样。没有用注解，是根据自己需要添加的方法。
     * @param message 消息
     * @throws IOException
     */
    private void sendMessage(String message) throws IOException {
        message = "后端对前端的回复： "+message;
        this.session.getBasicRemote().sendText(message);
    }

}
```

## 前端

- hello.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>

<body>

Welcome webSocket!<br/>
<input id="text" type="text"/>
<button onclick="send()">Send</button>
<button onclick="closeWebSocket()">Close</button>
<div id="message">
</div>

<script>
    var websocket = null;

    //判断当前浏览器是否支持WebSocket
    if ('WebSocket' in window) {
        websocket = new WebSocket("ws://localhost:18082/websocket");
    }
    else {
        alert('Not support websocket')
    }

    //连接发生错误的回调方法
    websocket.onerror = function () {
        setMessageInnerHTML("error");
    };

    //连接成功建立的回调方法
    websocket.onopen = function (event) {
        setMessageInnerHTML("open");
    }

    //接收到消息的回调方法
    websocket.onmessage = function (event) {
        setMessageInnerHTML(event.data);
    }

    //连接关闭的回调方法
    websocket.onclose = function () {
        setMessageInnerHTML("close");
    }

    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function () {
        websocket.close();
    }

    //将消息显示在网页上
    function setMessageInnerHTML(innerHTML) {
        document.getElementById('message').innerHTML += innerHTML + '<br/>';
    }

    //关闭连接
    function closeWebSocket() {
        websocket.close();
    }

    //发送消息
    function send() {
        var message = document.getElementById('text').value;
        websocket.send(message);
    }
</script>

</body>
</html>
```

> 注意

`websocket = new WebSocket("ws://localhost:18082/websocket");` 

和你运行的端口保持一致。当前例子运行端口为 18082。

## 部署 & 访问

- Deploy

使用 tomcat7-maven-plugin 运行，或者手动部署到 tomcat。

- Visit

直接在浏览器访问 `http://localhost:18082/hello.html`

## 现象

- 页面

```
Welcome webSocket!

[你好啊，老王] 【Send】【Close】

open
后端对前端的回复： 1111
后端对前端的回复： 你好啊，老王
close
```

- 后端命令行

```
有新连接加入！当前在线人数为1             //当打开页面时
来自客户端的消息:1111                   //当发送 1111 时
来自客户端的消息:你好啊，老王             //当发送 你好啊，老王 时
有一连接关闭！当前在线人数为0             //当点击 Close 时
```





* any list
{:toc}