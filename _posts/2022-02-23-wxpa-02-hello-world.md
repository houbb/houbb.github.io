---
layout: post
title: 微信公众号开发对接-02-微信公众号入门
date: 2022-02-23 21:01:55 +0800 
categories: [Wechat]
tags: [Wechat, sh]
published: true
---

# 1开启公众号开发者模式

公众平台技术文档的目的是为了简明扼要的说明接口的使用，语句难免苦涩难懂，甚至对于不同的读者，有语意歧义。

万事皆是入门难，对于刚入门的开发者讲，更是难上加难。


为了降低门槛，弥补不足，我们编写了《开发者指引》来讲解微信开放平台的基础常见功能，旨在帮助大家入门微信开放平台的开发者模式。

已熟知接口使用或有一定公众平台开发经验的开发者，请直接跳过本文。

这篇文章不会给你带来厉害的编码技巧亦或接口的深层次讲解。对于现有接口存在的疑问，可访问 #公众号社区 发帖交流、联系腾讯客服或使用微信反馈。

## 1.1 申请服务器

以腾讯云服务器为示例：腾讯云服务器购买入口

如你已有小程序，并且已开通小程序云开发，则可以使用 公众号环境共享 能力，在公众号中使用云开发。

## 1.2 搭建服务

以web.py网络框，python，腾讯云服务器为例介绍。

1）安装/更新需要用到的软件

安装python2.7版本以上

安装web.py

安装libxml2, libxslt, lxml python

2）编辑代码，如果不懂python 语法，请到python官方文档查询说明。

vim main.py

```py
# -*- coding: utf-8 -*-
# filename: main.py
import web

urls = (
    '/wx', 'Handle',
)

class Handle(object):
    def GET(self):
        return "hello, this is handle view"

if __name__ == '__main__':
    app = web.application(urls, globals())
    app.run()
```

3）如果出现“socket.error: No socket could be created“错误信息，可能为80端口号被占用，可能是没有权限，请自行查询解决办法。

如果遇见其他错误信息，请到web.py官方文档，学习webpy 框架3执行命令：sudo python main.py 80 。

4）url填写：http://外网IP/wx （外网IP请到腾讯云购买成功处查询）。如下图，一个简单的web应用已搭建。


## 1.3 申请公众号

[申请公众号网页](https://mp.weixin.qq.com/cgi-bin/loginpage?t=wxm2-login&lang=zh_CN)

## 1.4 开发者基本配置

1） 公众平台官网登录之后，找到“基本配置”菜单栏

![开发者基本配置](https://res.wx.qq.com/op_res/WznsbzjH1SHD7V2Z6IP3-MYCkb2bMnMyPsKIoAPJE0SkuGLDiBdilqy-KOuo7KRo)

![配置](https://res.wx.qq.com/op_res/dzBDX4ngZJwYw955u-1hJ9lv-oZ5MswAbda4_lWojE3OwwqpZfQKur4e_Nb7ed6Q)

2） 填写配置 url填写：http://外网IP/wx 。外网IP请到腾讯云购买成功处查询。 

http的端口号固定使用80，不可填写其他。 

Token：自主设置，这个token与公众平台wiki中常提的access_token不是一回事。这个token只用于验证开发者服务器。

![基本配置](https://res.wx.qq.com/op_res/K9BCGP4fgz0RS_5rSoslqqGvxPPNHOIvDv8cutiDHqsgS16qIhsvqxmi_ad5gAxX)

3） 现在选择提交肯定是验证token失败，因为还需要完成代码逻辑。改动原先main.py文件，新增handle.py

a）vim main.py

```py
# -*- coding: utf-8 -*-
# filename: main.py
import web
from handle import Handle

urls = (
    '/wx', 'Handle',
)

if __name__ == '__main__':
    app = web.application(urls, globals())
    app.run()
```

b）vim handle.py

先附加逻辑流程图

![逻辑流程图](https://mmbiz.qpic.cn/mmbiz_png/PiajxSqBRaEIQxibpLbyuSK9B2CRwJYwMRFbDwdwNicNwcwhWaTuibPIqUwocStP6VicjxyGc2S96XlaNiciagkc26eKg/0?wx_fmt=png)

```py
# -*- coding: utf-8 -*-
# filename: handle.py

import hashlib
import web

class Handle(object):
    def GET(self):
        try:
            data = web.input()
            if len(data) == 0:
                return "hello, this is handle view"
            signature = data.signature
            timestamp = data.timestamp
            nonce = data.nonce
            echostr = data.echostr
            token = "xxxx" #请按照公众平台官网\基本配置中信息填写

            list = [token, timestamp, nonce]
            list.sort()
            sha1 = hashlib.sha1()
            map(sha1.update, list)
            hashcode = sha1.hexdigest()
            print "handle/GET func: hashcode, signature: ", hashcode, signature
            if hashcode == signature:
                return echostr
            else:
                return ""
        except Exception, Argument:
            return Argument
```

4） 重新启动成功后（python main.py 80），点击提交按钮。若提示”token验证失败”, 请认真检查代码或网络链接等。若token验证成功，会自动返回基本配置的主页面，点击启动按钮

## 1.5 重要事情提前交代

接下来，文章准备从两个简单的示例入手。

示例一：实现“你说我学”

示例二：实现“图尚往来”

两个简单的示例后，是一些基础功能的介绍：素材管理、自定义菜单、群发。所有的示例代码是为了简明的说明问题，避免代码复杂化。

在实际中搭建一个安全稳定高效的公众号，建议参考框架如下图：

![struct](https://mmbiz.qpic.cn/mmbiz_png/PiajxSqBRaEIQxibpLbyuSK9XkjDgZoL0xnC7SUbrIRwI8NhEGFeax6HoPcTMDqKGYxaSoNqBwocrj70Pt1EcKnQ/0?wx_fmt=png)

主要有三个部分：负责业务逻辑部分的服务器，负责对接微信API的API-Proxy服务器，以及唯一的AccessToken中控服务器

1）AccessToken中控服务器：

负责： 提供主动刷新和被动刷新机制来刷新accessToken并存储（为了防止并发刷新，注意加并发锁），提供给业务逻辑有效的accessToken。

优点： 避免业务逻辑方并发获取access_token，避免AccessToken互相覆盖，提高业务功能的稳定性。

2）API-Proxy服务器：

负责：专一与微信API对接，不同的服务器可以负责对接不同的业务逻辑，更可进行调用频率、权限限制。

优点：某台API-proxy异常，还有其余服务器支持继续提供服务，提高稳定性，避免直接暴漏内部接口，有效防止恶意攻击，提高安全性。


# 2 实现“你问我答”

目的：

1）理解被动消息的含义

2）理解收\发消息机制

预实现功能：

粉丝给公众号一条文本消息，公众号立马回复一条文本消息给粉丝，不需要通过公众平台网页操作。

## 2.1 接受文本消息

即粉丝给公众号发送的文本消息。

官方wiki链接：[接收普通消息](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_standard_messages.html)

粉丝给公众号发送文本消息：“欢迎开启公众号开发者模式”，在开发者后台，收到公众平台发送的xml 如下：（下文均隐藏了ToUserName 及 FromUserName 信息）

```xml
<xml>
 <ToUserName><![CDATA[公众号]]></ToUserName>
 <FromUserName><![CDATA[粉丝号]]></FromUserName>
 <CreateTime>1460537339</CreateTime>
 <MsgType><![CDATA[text]]></MsgType>
 <Content><![CDATA[欢迎开启公众号开发者模式]]></Content>
 <MsgId>6272960105994287618</MsgId>
</xml>
```

解释：

createTime 是微信公众平台记录粉丝发送该消息的具体时间

text: 用于标记该xml 是文本消息，一般用于区别判断

欢迎开启公众号开发者模式: 说明该粉丝发给公众号的具体内容是欢迎开启公众号开发者模式

MsgId: 是公众平台为记录识别该消息的一个标记数值, 微信后台系统自动产生

## 2.2 被动回复文本消息

即公众号给粉丝发送的文本消息，

官方wiki链接: [被动回复用户消息](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Passive_user_reply_message)

特别强调：

1） 被动回复消息，即发送被动响应消息，不同于客服消息接口

2） 它其实并不是一种接口，而是对微信服务器发过来消息的一次回复

3） 收到粉丝消息后不想或者不能5秒内回复时，需回复“success”字符串（下文详细介绍）

4） 客服接口在满足一定条件下随时调用

公众号想回复给粉丝一条文本消息，内容为“test”, 那么开发者发送给公众平台后台的xml 内容如下：

```xml
<xml>
 <ToUserName><![CDATA[粉丝号]]></ToUserName>
 <FromUserName><![CDATA[公众号]]></FromUserName>
 <CreateTime>1460541339</CreateTime>
 <MsgType><![CDATA[text]]></MsgType>
 <Content><![CDATA[test]]></Content>
</xml>
```

特别备注：

1）ToUserName（接受者）、FromUserName(发送者) 字段请实际填写。

2）createtime 只用于标记开发者回复消息的时间，微信后台发送此消息都是不受这个字段约束。

3）text : 用于标记 此次行为是发送文本消息 （当然可以是image/voice等类型）。

4）文本换行 ‘\n’。

## 2.3 回复success问题

查询官方wiki 开头强调： 假如服务器无法保证在五秒内处理回复，则必须回复“success”或者“”（空串），否则微信后台会发起三次重试。

解释一下为何有这么奇怪的规定。

**发起重试是微信后台为了尽可以保证粉丝发送的内容开发者均可以收到。如果开发者不进行回复，微信后台没办法确认开发者已收到消息，只好重试。**

真的是这样子吗？

尝试一下收到消息后，不做任何回复。在日志中查看到微信后台发起了三次重试操作，日志截图如下：

三次重试后，依旧没有及时回复任何内容，系统自动在粉丝会话界面出现错误提示“该公众号暂时无法提供服务，请稍后再试”。

如果回复success，微信后台可以确定开发者收到了粉丝消息，没有任何异常提示。因此请大家注意回复success的问题。

## 2.4 流程图

![流程图](https://mmbiz.qpic.cn/mmbiz_png/PiajxSqBRaEIQxibpLbyuSK9XkjDgZoL0xEVXiblIZm80UCBlia6vYiaXD7Od9Ev3nujHoNkNCubr9WPo8L7opJGhIA/0?wx_fmt=png)

## 2.5 码代码

main.py文件不改变，handle.py 需要增加一下代码，增加新的文件receive.py, reply.py

1）vim handle.py

```py
# -*- coding: utf-8 -*-# 
# filename: handle.py
import hashlib
import reply
import receive
import web
class Handle(object):
    def POST(self):
        try:
            webData = web.data()
            print "Handle Post webdata is ", webData
            #后台打日志
            recMsg = receive.parse_xml(webData)
            if isinstance(recMsg, receive.Msg) and recMsg.MsgType == 'text':
                toUser = recMsg.FromUserName
                fromUser = recMsg.ToUserName
                content = "test"
                replyMsg = reply.TextMsg(toUser, fromUser, content)
                return replyMsg.send()
            else:
                print "暂且不处理"
                return "success"
        except Exception, Argment:
            return Argment
```

2）vim receive.py

```py
# -*- coding: utf-8 -*-#
# filename: receive.py
import xml.etree.ElementTree as ET


def parse_xml(web_data):
    if len(web_data) == 0:
        return None
    xmlData = ET.fromstring(web_data)
    msg_type = xmlData.find('MsgType').text
    if msg_type == 'text':
        return TextMsg(xmlData)
    elif msg_type == 'image':
        return ImageMsg(xmlData)


class Msg(object):
    def __init__(self, xmlData):
        self.ToUserName = xmlData.find('ToUserName').text
        self.FromUserName = xmlData.find('FromUserName').text
        self.CreateTime = xmlData.find('CreateTime').text
        self.MsgType = xmlData.find('MsgType').text
        self.MsgId = xmlData.find('MsgId').text


class TextMsg(Msg):
    def __init__(self, xmlData):
        Msg.__init__(self, xmlData)
        self.Content = xmlData.find('Content').text.encode("utf-8")


class ImageMsg(Msg):
    def __init__(self, xmlData):
        Msg.__init__(self, xmlData)
        self.PicUrl = xmlData.find('PicUrl').text
        self.MediaId = xmlData.find('MediaId').text
```

3）vim reply.py

```py


# -*- coding: utf-8 -*-#
# filename: reply.py
import time

class Msg(object):
    def __init__(self):
        pass

    def send(self):
        return "success"

class TextMsg(Msg):
    def __init__(self, toUserName, fromUserName, content):
        self.__dict = dict()
        self.__dict['ToUserName'] = toUserName
        self.__dict['FromUserName'] = fromUserName
        self.__dict['CreateTime'] = int(time.time())
        self.__dict['Content'] = content

    def send(self):
        XmlForm = """
            <xml>
                <ToUserName><![CDATA[{ToUserName}]]></ToUserName>
                <FromUserName><![CDATA[{FromUserName}]]></FromUserName>
                <CreateTime>{CreateTime}</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[{Content}]]></Content>
            </xml>
            """
        return XmlForm.format(**self.__dict)

class ImageMsg(Msg):
    def __init__(self, toUserName, fromUserName, mediaId):
        self.__dict = dict()
        self.__dict['ToUserName'] = toUserName
        self.__dict['FromUserName'] = fromUserName
        self.__dict['CreateTime'] = int(time.time())
        self.__dict['MediaId'] = mediaId

    def send(self):
        XmlForm = """
            <xml>
                <ToUserName><![CDATA[{ToUserName}]]></ToUserName>
                <FromUserName><![CDATA[{FromUserName}]]></FromUserName>
                <CreateTime>{CreateTime}</CreateTime>
                <MsgType><![CDATA[image]]></MsgType>
                <Image>
                <MediaId><![CDATA[{MediaId}]]></MediaId>
                </Image>
            </xml>
            """
        return XmlForm.format(**self.__dict)
```

码好代码之后，重新启动程序，sudo python main.py 80。

## 2.6 在线测试

微信公众平台有提供一个[在线测试的平台](http://mp.weixin.qq.com/debug/)方便开发者模拟场景测试代码逻辑。

正如 2.2被动回复文本消息 交代此被动回复接口不同于客服接口，测试时也要注意区别。

在线测试目的在于测试开发者代码逻辑是否有误、是否符合预期。即便测试成功也不会发送内容给粉丝。所以可以随意测试。

# 3 实现“图”尚往来

目的：

1）引入素材管理

2）以文本消息，图片消息为基础，可自行理解剩余的语音消息、视频消息、地理消息等

预实现功能：

接受粉丝发送的图片消息，并立马回复相同的图片给粉丝。

## 3.1 接收图片消息

即粉丝给公众号发送的图片消息。

官方wiki链接：消息管理/接收消息-接受普通消息/ 图片消息从实例讲解，粉丝给公众号发送一张图片消息，在公众号开发者后台接收到的xml如下:

```xml
<xml>
 <ToUserName><![CDATA[公众号]]></ToUserName>
 <FromUserName><![CDATA[粉丝号]]></FromUserName>
 <CreateTime>1460536575</CreateTime>
 <MsgType><![CDATA[image]]></MsgType>
 <PicUrl><![CDATA[http://mmbiz.qpic.cn/xxxxxx /0]]></PicUrl>
 <MsgId>6272956824639273066</MsgId>
 <MediaId><![CDATA[gyci5a-xxxxx-OL]]></MediaId>
</xml>
```

特别说明：

PicUrl: 这个参数是微信系统把“粉丝“发送的图片消息自动转化成url。 这个url可用浏览器打开查看到图片。

MediaId: 是微信系统产生的id 用于标记该图片，详情可参考wiki素材管理/获取临时素材，

## 3.2 被动回复图片消息

即公众号给粉丝发送的图片消息。官方wiki链接：消息管理/发送消息-被动回复用户消息/ 图片消息

特别说明：

1） 被动回复消息，即发送被动响应消息，不同于客服消息接口

2） 它其实并不是一种接口，而是对微信服务器发过来消息的一次回复

3） 收到粉丝消息后不想或者不能5秒内回复时，需回复“success”字符串（下文详细介绍）

4） 客服接口在满足一定条件下随时调用

开发者发送给微信后台的 xml 如下：

```xml
<xml>
 <ToUserName><![CDATA[粉丝号]]></ToUserName>
 <FromUserName><![CDATA[公众号]]></FromUserName>
 <CreateTime>1460536576</CreateTime>
 <MsgType><![CDATA[image]]></MsgType>
 <Image>
 <MediaId><![CDATA[gyci5oxxxxxxv3cOL]]></MediaId>
 </Image>
</xml>
```

这里填写的MediaId的内容，其实就是粉丝的发送图片的原MediaId，所以粉丝收到了一张一模一样的原图。 

如果想回复粉丝其它图片怎么呢？

1） 新增素材，请参考 新增临时素材 或者 新增永久素材

2） 获取其MediaId，请参考 获取临时素材MediaID 或者 获取永久素材MediaID

## 3.3 流程图

![流程图](https://mmbiz.qpic.cn/mmbiz_png/PiajxSqBRaEIQxibpLbyuSK9XkjDgZoL0xDdfzVUuLvr3iaR3BvJnkkL9kATK0TgmFXsF2tPHTlpulfJ6eU930a1Q/0?wx_fmt=png)


## 3.4 码代码

只显示更改的代码部分，其余部分参考上小节，在线测试，真实体验，回复空串，请参考 实现"你问我答"。 

vim handle.py

```py
# -*- coding: utf-8 -*-
# filename: handle.py
import hashlib
import reply
import receive
import web

class Handle(object):
    def POST(self):
        try:
            webData = web.data()
            print "Handle Post webdata is ", webData   #后台打日志
            recMsg = receive.parse_xml(webData)
            if isinstance(recMsg, receive.Msg):
                toUser = recMsg.FromUserName
                fromUser = recMsg.ToUserName
                if recMsg.MsgType == 'text':
                    content = "test"
                    replyMsg = reply.TextMsg(toUser, fromUser, content)
                    return replyMsg.send()
                if recMsg.MsgType == 'image':
                    mediaId = recMsg.MediaId
                    replyMsg = reply.ImageMsg(toUser, fromUser, mediaId)
                    return replyMsg.send()
                else:
                    return reply.Msg().send()
            else:
                print "暂且不处理"
                return reply.Msg().send()
        except Exception, Argment:
            return Argment
```

# 参考资料

https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Getting_Started_Guide.html

* any list
{:toc}