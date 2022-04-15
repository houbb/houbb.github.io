---
layout: post
title:  WebSocket-04-socketjs 
date:  2022-04-15 09:22:02 +0800
categories: [Web]
tags: [web, socket, sh]
published: true
---


# 一、定义

SockJS是一个浏览器JavaScript库，它提供了一个类似于网络的对象。SockJS提供了一个连贯的、跨浏览器的Javascript API，它在浏览器和web服务器之间创建了一个低延迟、全双工、跨域通信通道。

# 二、产生的原因

一些浏览器中缺少对WebSocket的支持,因此，回退选项是必要的，而Spring框架提供了基于SockJS协议的透明的回退选项。

SockJS的一大好处在于提供了浏览器兼容性。优先使用原生WebSocket，如果在不支持websocket的浏览器中，会自动降为轮询的方式。 

除此之外，spring也对socketJS提供了支持。

如果代码中添加了withSockJS()如下，服务器也会自动降级为轮询。

```java
registry.addEndpoint("/coordination").withSockJS();
```

SockJS的目标是让应用程序使用WebSocket API，但在运行时需要在必要时返回到非WebSocket替代，即无需更改应用程序代码。

SockJS是为在浏览器中使用而设计的。它使用各种各样的技术支持广泛的浏览器版本。对于SockJS传输类型和浏览器的完整列表，可以看到SockJS客户端页面。 

传输分为3类:WebSocket、HTTP流和HTTP长轮询（按优秀选择的顺序分为3类）

## 三、sockjs使用教程

SockJS 很容易通过 Java 配置启用 ：

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(myHandler(), "/myHandler").withSockJS();
    }

    @Bean
    public WebSocketHandler myHandler() {
        return new MyHandler();
    }

}
```

与之等价的XML配置：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:websocket="http://www.springframework.org/schema/websocket"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/websocket
        http://www.springframework.org/schema/websocket/spring-websocket.xsd">

    <websocket:handlers>
        <websocket:mapping path="/myHandler" handler="myHandler"/>
        <websocket:sockjs/>
    </websocket:handlers>

    <bean id="myHandler" class="org.springframework.samples.MyHandler"/>

</beans>
```

打开一个连接，为连接创建事件监听器，断开连接，消息时间，发送消息返回到服务器，关闭连接。

```js
<script src="//cdn.jsdelivr.net/sockjs/1.0.0/sockjs.min.js"></script>

var sock = new SockJS('/coordination');  
sock.onopen = function() {
    console.log('open');
};
sock.onmessage = function(e) {
    console.log('message', e.data);
};
sock.onclose = function() {
    console.log('close');
};
sock.send('test');
sock.close();
```

## 四、心跳消息

SockJS协议要求服务器发送心跳消息，以阻止代理结束连接。Spring SockJS配置有一个名为“心脏节拍时间”的属性，可用于定制频率。

默认情况下，如果没有在该连接上发送其他消息，则会在25秒后发送心跳。

当在websocket/SockJS中使用STOMP时，如果客户端和服务器通过协商来交换心跳，那么SockJS的心跳就会被禁用。

Spring SockJS支持还允许配置task调度程序来调度心跳任务。

## 五、Servlet 3异步请求

HTTP流和HTTP长轮询SockJS传输需要一个连接保持比平常更长时间的连接。 

在Servlet容器中，这是通过Servlet 3的异步支持完成的，这允许退出Servlet的容器线程处理一个请求，并继续从另一个线程中写入响应。

## 六、SockJS的CROS Headers

如果允许跨源请求，那么SockJS协议使用CORS在XHR流和轮询传输中跨域支持。

# sockjs 例子

```html
<!DOCTYPE html>
<html>
<head>
  <title>Apache Tomcat WebSocket Examples: Echo</title>
  <style type="text/css">
    #connect-container {
      float: left;
      width: 400px
    }

    #connect-container div {
      padding: 5px;
    }

    #console-container {
      float: left;
      margin-left: 15px;
      width: 400px;
    }

    #console {
      border: 1px solid #CCCCCC;
      border-right-color: #999999;
      border-bottom-color: #999999;
      height: 170px;
      overflow-y: scroll;
      padding: 5px;
      width: 100%;
    }

    #console p {
      padding: 0;
      margin: 0;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js"></script>
  <script type="text/javascript">
    var ws = null;

    function setConnected(connected) {
      document.getElementById('connect').disabled = connected;
      document.getElementById('disconnect').disabled = !connected;
      document.getElementById('echo').disabled = !connected
    }

    function connect() {
      var target = document.getElementById('target').value;
      ws = new SockJS(target);
      ws.onopen = function () {
        setConnected(true);
        log('Info: WebSocket connection opened.')
      };
      ws.onmessage = function (event) {
        log('Received: ' + event.data)
      };
      ws.onclose = function () {
        setConnected(false);
        log('Info: WebSocket connection closed.')
      }
    }

    function disconnect() {
      if (ws != null) {
        ws.close();
        ws = null
      }
      setConnected(false)
    }

    function echo() {
      if (ws != null) {
        var message = document.getElementById('message').value;
        log('Sent: ' + message);
        ws.send(message)
      } else {
        alert('WebSocket connection not established, please connect.')
      }
    }

    function log(message) {
      var console = document.getElementById('console');
      var p = document.createElement('p');
      p.style.wordWrap = 'break-word';
      p.appendChild(document.createTextNode(message));
      console.appendChild(p);
      while (console.childNodes.length > 25) {
        console.removeChild(console.firstChild)
      }
      console.scrollTop = console.scrollHeight
    }
  </script>
</head>
<body>
<noscript><h2 style="color: #FF0000">Seems your browser doesn't support Javascript! Websockets rely on Javascript being
                                     enabled. Please enable
                                     Javascript and reload this page!</h2></noscript>
<div>
  <div id="connect-container">
    <div>
      <input id="target" size="40" style="width: 350px" type="text" value="/echo" />
    </div>
    <div>
      <button id="connect" onclick="connect();">Connect</button>
      <button disabled="disabled" id="disconnect" onclick="disconnect();">Disconnect</button>
    </div>
    <div>
      <textarea id="message" style="width: 350px">Here is a message!</textarea>
    </div>
    <div>
      <button disabled="disabled" id="echo" onclick="echo();">Echo message</button>
    </div>
  </div>
  <div id="console-container">
    <div id="console"></div>
  </div>
</div>
</body>
</html>
```

# 参考资料

[websocket 详细教程](https://www.cnblogs.com/jingmoxukong/p/7755643.html)

[sockjs简介与sockjs使用教程](https://www.goeasy.io/articles/846.html)

* any list
{:toc}