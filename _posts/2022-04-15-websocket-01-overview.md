---
layout: post
title:  WebSocket-01-overview 概览（附 C# 例子）
date:  2022-4-15 13:34:42 +0800
categories: [WEB]
tags: [websocket, ws, sh]
published: true
---

# WebSocket 

[WebSocket](https://en.wikipedia.org/wiki/WebSocket)协议是基于TCP的一种新的网络协议。它实现了浏览器与服务器全双工(full-duplex)通信——可以通俗的解释为服务器主动发送信息给客户端。

- [WebSocket API](https://www.w3.org/TR/websockets/)


# HTTP 短处解决方式

HTTP协议决定了服务器与客户端之间的连接方式，无法直接实现消息推送,一些变相的解决办法：

- 轮询

客户端定时向服务器发送Ajax请求，服务器接到请求后马上返回响应信息并关闭连接。 

优点：后端程序编写比较容易。 

缺点：请求中有大半是无用，浪费带宽和服务器资源。 


- 长轮询

客户端向服务器发送Ajax请求，服务器接到请求后hold住连接，直到有新消息才返回响应信息并关闭连接，客户端处理完响应信息后再向服务器发送新的请求。 

优点：在无消息的情况下不会频繁的请求，耗费资小。 

缺点：服务器hold连接会消耗资源，返回数据顺序无保证，难于管理维护。 Comet异步的ashx，

实例：WebQQ、Hi网页版、Facebook IM。


- 长连接

在页面里嵌入一个隐蔵iframe，将这个隐蔵iframe的src属性设为对一个长连接的请求或是采用xhr请求，服务器端就能源源不断地往客户端输入数据。 

优点：消息即时到达，不发无用请求；管理起来也相对便。 

缺点：服务器维护一个长连接会增加开销。 

实例：Gmail聊天

- Flash Socket

在页面中内嵌入一个使用了Socket类的 Flash 程序JavaScript通过调用此Flash程序提供的Socket接口与服务器端的Socket接口进行通信，JavaScript在收到服务器端传送的信息后控制页面的显示。 

优点：实现真正的即时通信，而不是伪即时。 

缺点：客户端必须安装Flash插件；非HTTP协议，无法自动穿越防火墙。 

实例：网络互动游戏。


- WebSocket

WebSocket是HTML5开始提供的一种浏览器与服务器间进行全双工通讯的网络技术。依靠这种技术可以实现客户端和服务器端的长连接，双向实时通信。

特点:

事件驱动
异步
使用ws或者wss协议的客户端socket

能够实现真正意义上的推送功能

缺点：

少部分浏览器不支持，浏览器支持的程度与方式有区别。(恕我直言，不支持的可以直接放弃)

![web browser](https://raw.githubusercontent.com/houbb/resource/master/img/network/websocket/2017-04-21-websocket-browser.png)


# WebSocket 原理

[知乎-WebSocket 是什么原理？为什么可以实现持久连接？](https://www.zhihu.com/question/20215561)

首先Websocket是基于HTTP协议的，或者说借用了HTTP的协议来完成一部分握手。


一、 Request

```
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Origin: http://example.com
```

比HTTP有所不同。一一道来。

```
Upgrade: websocket
Connection: Upgrade
```

告诉Apache、Nginx等服务器：**发起的是Websocket协议，快点帮我找到对应的助理处理。不是HTTP**。

```
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
```

1. `Sec-WebSocket-Key` 是一个Base64 encode的值，这个是浏览器随机生成的，告诉服务器：我要验证尼是不是真的是Websocket助理。

2. `Sec_WebSocket-Protocol` 是一个用户定义的字符串，用来区分同URL下，不同的服务所需要的协议。

3. `Sec-WebSocket-Version` 是告诉服务器所使用的Websocket Draft（协议版本）。


二、 Response

然后服务器会返回下列东西，表示已经接受到请求， 成功建立Websocket啦！

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
Sec-WebSocket-Protocol: chat
```

这里开始就是HTTP最后负责的区域了，告诉客户，我已经成功切换协议啦~

```
Upgrade: websocket
Connection: Upgrade
```

依然是固定的，告诉客户端即将升级的是Websocket协议，而不是mozillasocket，lurnarsocket或者shitsocket。
然后，Sec-WebSocket-Accept 这个则是经过服务器确认，并且加密过后的 Sec-WebSocket-Key。

服务器：**好啦好啦，知道啦，给你看我的ID CARD来证明行了吧**

后面的，Sec-WebSocket-Protocol 则是表示最终使用的协议。

至此，HTTP已经完成它所有工作了，接下来就是完全按照Websocket协议进行了。


# WebSocket 作用

一、解决被动性问题

有新消息时候**主动**联系客户端。

二、解决HTTP无状态问题

与客户端**握手**之后，可以一直记住此信息。而不需要每次都校验。


# Fleck 实例

> [c# 实现WebSocket](http://www.cnblogs.com/zformular/archive/2012/10/20/2732507.html)

> [Fleck 实例](http://www.cnblogs.com/zhangwei595806165/p/4791589.html?utm_source=tuicool)

此处借助于 [Fleck](https://github.com/statianzo/Fleck) 演示一个Hello World.


- websocket.html

```html
<!DOCTYPE html>
<html>
<head>
    <title>websocket client</title>
    <script type="text/javascript">
        var start = function () {
            var inc = document.getElementById('incomming');
            var wsImpl = window.WebSocket || window.MozWebSocket;
            var form = document.getElementById('sendForm');
            var input = document.getElementById('sendText');

            inc.innerHTML += "connecting to server ..<br/>";

            // create a new websocket and connect
            window.ws = new wsImpl('ws://localhost:7181/');

            // when data is comming from the server, this metod is called
            ws.onmessage = function (evt) {
                inc.innerHTML += evt.data + '<br/>';
            };

            // when the connection is established, this method is called
            ws.onopen = function () {
                inc.innerHTML += '.. connection open<br/>';
            };

            // when the connection is closed, this method is called
            ws.onclose = function () {
                inc.innerHTML += '.. connection closed<br/>';
            }

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var val = input.value;
                ws.send(val);
                input.value = "";
            });

        }
        window.onload = start;
    </script>
</head>
<body>
    <form id="sendForm">
        <input id="sendText" placeholder="Text to send" />
    </form>
    <pre id="incomming"></pre>
</body>
</html>
```

- Main()

建立一个 **C#的控制台程序**, 代码如下(记得引入 Flick DLL)

```c#
using Fleck;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSocketDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            FleckLog.Level = LogLevel.Debug;
            var allSockets = new List<IWebSocketConnection>();
            var server = new WebSocketServer("ws://0.0.0.0:7181");
            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    Console.WriteLine("Open!");
                    allSockets.Add(socket);
                };
                socket.OnClose = () =>
                {
                    Console.WriteLine("Close!");
                    allSockets.Remove(socket);
                };
                socket.OnMessage = message =>
                {
                    Console.WriteLine(message);
                    allSockets.ToList().ForEach(s => s.Send("Echo: " + message));
                };
            });


            var input = Console.ReadLine();
            while (input != "exit")
            {
                foreach (var socket in allSockets.ToList())
                {
                    socket.Send(input);
                }
                input = Console.ReadLine();
            }
        }
    }
}
```

直接运行 控制台程序。然后打开 html 页面。

![web browser](https://raw.githubusercontent.com/houbb/resource/master/img/network/websocket/2017-04-21-websocket-demo.png)


# 框架

> [.NET 的 WebSocket 开发包比较](http://www.open-open.com/lib/view/open1394254398458.html)









* any list
{:toc}