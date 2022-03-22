---
layout: post
title: SMS 中国网建之 java 如何实现短信发送？
date: 2022-03-18 21:01:55 +0800 
categories: [TOOL]
tags: [tool, sh]
published: true
---

# 中国网建

官网：[中国网建](http://www.smschinese.cn/)

# java 例子

```java
public static void main(String[] args) {
    //获得http链接对象
    HttpClient httpClient = HttpClient.singleInstacne();
    String url="http://utf8.api.smschinese.cn";
    //中国网建账号
    String Uid="xxxx0";
    //中国网建秘钥
    String Key="d41d8cd98f00bxxxxx";
    //要发送的手机号
    String smsMob="187xxxx";
    //短信内容
    String smsText="你好";
    String message=null;
    try {
        message=httpClient.sendWithPost(url+"?Uid="+Uid+"&Key="+Key+"&smsMob="+smsMob+"&smsText="+smsText,"");
        System.out.println(message);
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```


# 参考资料

https://blog.51cto.com/u_15437298/4696303

[通过中国网建sms平台发送短信](https://blog.csdn.net/xm526489770/article/details/80422359)

https://blog.csdn.net/weixin_34982726/article/details/114143251

* any list
{:toc}