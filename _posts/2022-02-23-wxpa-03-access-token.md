---
layout: post
title: 微信公众号开发对接-03-ACCESS TOKEN
date: 2022-02-23 21:01:55 +0800 
categories: [Wechat]
tags: [Wechat, sh]
published: true
---

# 4 AccessToken

AccessToken 的意义请参考 [公众平台wiki介绍](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)。

## 4.1 查看appid及appsecret

公众平台官网查看， 其中AppSecret 不点击重置时候，则一直保持不变。

![appId](https://mmbiz.qpic.cn/mmbiz_png/PiajxSqBRaEIQxibpLbyuSK9XkjDgZoL0xMhn3MkAdHOElTxkaGlIBDeQyg8SjB9ibIcNE46ChsCXj9XNgoL1gnjw/0?wx_fmt=png)

## 4.2 获取accessToken

### 4.2.1 临时方法获取

为了方便先体验其他接口，可以临时通过在线测试 或者 浏览器获取accessToken。

![临时方法获取](https://mmbiz.qpic.cn/mmbiz_png/PiajxSqBRaEIQxibpLbyuSK9XkjDgZoL0xBHeQU4pOZnne3ZE7xA9sYvUkxWJOOxibxQudayWeWQ604jgKhI1vK1g/0?wx_fmt=png)


获取结果：

![result](https://mmbiz.qpic.cn/mmbiz_png/PiajxSqBRaEIQxibpLbyuSK9XkjDgZoL0xBHeQU4pOZnne3ZE7xA9sYvUkxWJOOxibxQudayWeWQ604jgKhI1vK1g/0?wx_fmt=png)

### 4.2.2 接口获取

详情请见公众平台wiki

特别强调：

1） 第三方需要一个access_token获取和刷新的中控服务器。

2） 并发获取access_token会导致AccessToken互相覆盖，影响具体的业务功能


## 4.3 码代码

再次重复说明，下面代码只是为了简单说明接口获取方式。实际中并不推荐，尤其是业务繁重的公众号，更需要中控服务器，统一的获取accessToken。

vim basic.py

```py
# -*- coding: utf-8 -*-
# filename: basic.py
import urllib
import time
import json
class Basic:
    def __init__(self):
        self.__accessToken = ''
        self.__leftTime = 0

    def __real_get_access_token(self):
        appId = "xxxxx"
        appSecret = "xxxxx"
        postUrl = ("https://api.weixin.qq.com/cgi-bin/token?grant_type="
                   "client_credential&appid=%s&secret=%s" % (appId, appSecret))
        urlResp = urllib.urlopen(postUrl)
        urlResp = json.loads(urlResp.read())
        self.__accessToken = urlResp['access_token']
        self.__leftTime = urlResp['expires_in']

    def get_access_token(self):
        if self.__leftTime < 10:
            self.__real_get_access_token()
        return self.__accessToken

    def run(self):
        while(True):
            if self.__leftTime > 10:
                time.sleep(2)
                self.__leftTime -= 2
            else:
                self.__real_get_access_token()
```


# 5 临时素材

公众号经常有需要用到一些临时性的多媒体素材的场景，例如在使用接口特别是发送消息时，对多媒体文件、多媒体消息的获取和调用等操作，是通过MediaID来进行的。

譬如实现“图”尚往来中，粉丝给公众号发送图片消息，便产生一临时素材。

因为永久素材有数量的限制，但是公众号又需要临时性使用一些素材，因而产生了临时素材。这类素材不在微信公众平台后台长期存储，所以在公众平台官网的素材管理中查询不到，但是可以通过接口对其操作。

其他详情请以公众平台官网wiki介绍为依据。

## 5.1 新建临时素材

接口详情请依据wiki介绍。提供参考代码如何上传素材作为临时素材，供其它接口使用。

vim media.py 编写完成之后，直接运行media.py 即可上传临时素材。

```py
# -*- coding: utf-8 -*-
# filename: media.py
from basic import Basic
import urllib2
import poster.encode
from poster.streaminghttp import register_openers


class Media(object):
    def __init__(self):
        register_openers()
    
    # 上传图片
    def upload(self, accessToken, filePath, mediaType):
        openFile = open(filePath, "rb")
        param = {'media': openFile}
        postData, postHeaders = poster.encode.multipart_encode(param)

        postUrl = "https://api.weixin.qq.com/cgi-bin/media/upload?access_token=%s&type=%s" % (
            accessToken, mediaType)
        request = urllib2.Request(postUrl, postData, postHeaders)
        urlResp = urllib2.urlopen(request)
        print urlResp.read()

if __name__ == '__main__':
    myMedia = Media()
    accessToken = Basic().get_access_token()
    filePath = "D:/code/mpGuide/media/test.jpg"  # 请按实际填写
    mediaType = "image"
    myMedia.upload(accessToken, filePath, mediaType)
```

## 5.2 获取临时素材MediaID

临时素材的MediaID 没有提供特定的接口进行统一查询，因此有俩种方式

1） 通过接口上次的临时素材，在调用成功的情况下，从返回JSON数据中提取MediaID，可临时使用

2） 粉丝互动中的临时素材，可从xml 数据提取MediaID，可临时使用

## 5.3 下载临时素材

### 5.3.1 手工体验

开发者如何保存粉丝发送的图片呢？

接口文档：获取临时素材接口，为方便理解，从最简单浏览器获取素材的方法入手，根据实际情况，浏览器输入网址： https://api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID （自行替换数据） ACCESS_TOKEN 如 "AccessToken"章节讲解 MEDIA_ID 如 图尚往来/接受图片消息xml中的MediaId 讲解 只要数据正确，则会下载图片到本地，如下图：

### 5.3.2接口获取

现在已经理解这个接口的功能了，只剩码代码了。

vim media.py

```py
# -*- coding: utf-8 -*-
# filename: media.py
import urllib2
import json
from basic import Basic


class Media(object):
    def get(self, accessToken, mediaId):
        postUrl = "https://api.weixin.qq.com/cgi-bin/media/get?access_token=%s&media_id=%s" % (
            accessToken, mediaId)
        urlResp = urllib2.urlopen(postUrl)

        headers = urlResp.info().__dict__['headers']
        if ('Content-Type: application/json\r\n' in headers) or ('Content-Type: text/plain\r\n' in headers):
            jsonDict = json.loads(urlResp.read())
            print jsonDict
        else:
            buffer = urlResp.read()  # 素材的二进制
            mediaFile = file("test_media.jpg", "wb")
            mediaFile.write(buffer)
            print "get successful"


if __name__ == '__main__':
    myMedia = Media()
    accessToken = Basic().get_access_token()
    mediaId = "2ZsPnDj9XIQlGfws31MUfR5Iuz-rcn7F6LkX3NRCsw7nDpg2268e-dbGB67WWM-N"
    myMedia.get(accessToken, mediaId)
```



# 参考资料

https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Getting_Started_Guide.html

* any list
{:toc}