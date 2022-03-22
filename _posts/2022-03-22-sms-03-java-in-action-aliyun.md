---
layout: post
title: SMS aliyun 阿里云之 java 如何实现短信发送？
date: 2022-03-18 21:01:55 +0800 
categories: [TOOL]
tags: [tool, sh]
published: true
---

# 准备工作

本接口主要适用于短信单发场景，特殊场景下可支持群发（最多可向1000个手机号码发送同样内容的短信），但群发会有一定延迟。

## 步骤1：创建阿里云账号

为了访问短信服务，您需要有一个阿里云账号。如果没有，可首先按照如下步骤创建阿里云账号：

访问阿里云官方网站，单击页面上的免费注册按钮。

按照屏幕提示完成注册流程并进行实名认证， 短信服务只支持实名认证用户使用。 为了更好地使用阿里云服务，建议尽快完成实名认证，否则部分阿里云服务将无法使用。具体实名认证流程，请参见实名认证。

## 步骤2：获取阿里云访问密钥

为了使用短信发送API-JAVA SDK，您必须申请阿里云的访问密钥。

阿里云访问密钥是阿里云为用户使用 API（非控制台）来访问其云资源设计的“安全口令”。您可以用它来签名 API 请求内容以通过服务端的安全验证。

该访问密钥成对（AccessKeyId 与 AccessKeySecret）生成和使用。

每个阿里云用户可以创建多对访问密钥，且可随时启用（Active）、禁用（Inactive）或者删除已经生成的访问密钥对。

您可以通过阿里云控制台的密钥管理页面创建、管理所有的访问密钥对，且保证它处于“启用”状态。由于访问密钥是阿里云对 API 请求进行安全验证的关键因子，请妥善保管你的访问密钥。如果某些密钥对出现泄漏风险，建议及时删除该密钥对并生成新的替代密钥对。

## 步骤3：申请模板和签名

短信签名

根据用户属性来创建符合自身属性的签名信息。企业用户需要上传相关企业资质证明，个人用户需要上传证明个人身份的证明。


# 开发实现

## 客户端引入

```xml
<!-- aliyun-java-sdk-core -->
<dependency>
    <groupId>com.aliyun</groupId>
    <artifactId>aliyun-java-sdk-core</artifactId>
    <version>3.7.1</version>
</dependency>
<!-- aliyun-java-sdk-dysmsapi -->
<dependency>
    <groupId>com.aliyun</groupId>
    <artifactId>aliyun-java-sdk-dysmsapi</artifactId>
    <version>1.1.0</version>
</dependency>
```

## java 测试例子

```java
//设置超时时间-可自行调整
System.setProperty("sun.net.client.defaultConnectTimeout", "10000");
System.setProperty("sun.net.client.defaultReadTimeout", "10000");
//初始化ascClient需要的几个参数
final String product = "Dysmsapi";//短信API产品名称（短信产品名固定，无需修改）
final String domain = "dysmsapi.aliyuncs.com";//短信API产品域名（接口地址固定，无需修改）
//替换成你的AK
final String accessKeyId = "yourAccessKeyId";//你的accessKeyId,参考本文档步骤2
final String accessKeySecret = "yourAccessKeySecret";//你的accessKeySecret，参考本文档步骤2
//初始化ascClient,暂时不支持多region（请勿修改）
IClientProfile profile = DefaultProfile.getProfile("cn-hangzhou", accessKeyId,
accessKeySecret);
DefaultProfile.addEndpoint("cn-hangzhou", "cn-hangzhou", product, domain);
IAcsClient acsClient = new DefaultAcsClient(profile);
 //组装请求对象
 SendSmsRequest request = new SendSmsRequest();
 //使用post提交
 request.setMethod(MethodType.POST);
 //必填:待发送手机号。支持以逗号分隔的形式进行批量调用，批量上限为1000个手机号码,批量调用相对于单条调用及时性稍有延迟,验证码类型的短信推荐使用单条调用的方式；发送国际/港澳台消息时，接收号码格式为国际区号+号码，如“85200000000”
 request.setPhoneNumbers("1500000000");
 //必填:短信签名-可在短信控制台中找到
 request.setSignName("云通信");
 //必填:短信模板-可在短信控制台中找到，发送国际/港澳台消息时，请使用国际/港澳台短信模版
 request.setTemplateCode("SMS_1000000");
 //可选:模板中的变量替换JSON串,如模板内容为"亲爱的${name},您的验证码为${code}"时,此处的值为
 //友情提示:如果JSON中需要带换行符,请参照标准的JSON协议对换行符的要求,比如短信内容中包含\r\n的情况在JSON中需要表示成\\r\\n,否则会导致JSON在服务端解析失败
//参考：request.setTemplateParam("{\"变量1\":\"值1\",\"变量2\":\"值2\",\"变量3\":\"值3\"}")
 request.setTemplateParam("{\"name\":\"Tom\", \"code\":\"123\"}");
 //可选-上行短信扩展码(扩展码字段控制在7位或以下，无特殊需求用户请忽略此字段)
 //request.setSmsUpExtendCode("90997");
 //可选:outId为提供给业务方扩展字段,最终在短信回执消息中将此值带回给调用者
 request.setOutId("yourOutId");
//请求失败这里会抛ClientException异常
SendSmsResponse sendSmsResponse = acsClient.getAcsResponse(request);
if(sendSmsResponse.getCode() != null && sendSmsResponse.getCode().equals("OK")) {
//请求成功
}
```



# 参考资料

[java编写发送短信](https://www.jiangxinyu1688.com/archives/java%E7%BC%96%E5%86%99%E5%8F%91%E9%80%81%E7%9F%AD%E4%BF%A1)

[短信发送API（SendSms）---Java](https://help.aliyun.com/document_detail/55284.html)

[Java发送SMS短信](https://blog.csdn.net/justry_deng/article/details/81058818)

云片 [Java开发发送短信功能的实战教程(真实项目已在使用)](https://codeantenna.com/a/QLONvamVKN)

http://1.116.90.158/detil/27e233e5dbaa4e5e8c2b73e4aefc2d86

http://www.360-face.com/guanyu.html

* any list
{:toc}