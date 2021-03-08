---
layout: post
title:  钉钉消息入门案例
date:  2021-3-05 16:52:15 +0800
categories: [Java]
tags: [java, tool, sh]
published: true
---

# 业务背景

有时候，程序的运行的异常状态，日常统计信息等需要有一个展示的地方。

可以是：

- 邮件

- 钉钉

- 企业微信

- 短信

等等，这里记录一下钉钉的 sdk 入门操作。

# 准备工作

## 建群

首先需要创建一个群。

如果只是测试，你可以先拉 2 个小伙伴创建一个群，可以把其他人踢掉，就可以创建好一个群了。

## 机器人

一个群可以添加 10 个机器人，一般是够用的。

钉钉有一些内置的机器人，我们选择自定义机器人，这样更加灵活。

这里为了简单，我选择的安全策略是指定关键词。此处为【测试】。

创建时，记录一下对应的密钥等信息。

# 代码编写

## maven 引入

钉钉的所有请求可以认为就是 https 请求，不过有客户端可以简化一些操作。

```xml
<dependencies>
    <dependency>
        <groupId>commons-codec</groupId>
        <artifactId>commons-codec</artifactId>
        <version>1.4</version>
    </dependency>
    <dependency>
        <groupId>com.aliyun</groupId>
        <artifactId>alibaba-dingtalk-service-sdk</artifactId>
        <version>1.0.1</version>
    </dependency>
</dependencies>
```

codec 主要用于 sign 加密。

## 代码编写

```java
public static void main(String[] args) throws ApiException {
    String url = "https://oapi.dingtalk.com/robot/send?access_token=xxx";
    DingTalkClient client = new DefaultDingTalkClient(url);
    OapiRobotSendRequest request = new OapiRobotSendRequest();
    // 指定 @ 的人
    OapiRobotSendRequest.At at = new OapiRobotSendRequest.At();
    at.setIsAtAll(true);
    request.setAt(at);
    // 以下是设置各种消息格式的方法
    sentText(request);
    OapiRobotSendResponse response = client.execute(request);
    System.out.println(response.getErrmsg());
}

private static void sentText(OapiRobotSendRequest request) {
    OapiRobotSendRequest.Text text = new OapiRobotSendRequest.Text();
    text.setContent("测试消息发送");
    request.setMsgtype("text");
    request.setText(text);
}
```

access_token 需要替换为我们对应的密钥。

直接运行就可以发送一个文本消息到群里。

# 参考资料

[钉钉接入](https://developers.dingtalk.com/document/app/develop-enterprise-internal-robots?spm=ding_open_doc.document.0.0.6d9d28e1Q8xCw9#topic-2026025)

* any list
{:toc}
