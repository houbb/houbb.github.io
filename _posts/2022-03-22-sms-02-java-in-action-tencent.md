---
layout: post
title: SMS tencent 腾讯云之 java 如何实现短信发送？
date: 2022-03-18 21:01:55 +0800 
categories: [TOOL]
tags: [tool, sh]
published: true
---

# 腾讯云短信

## 前提条件

在使用 SDK 前，您需要准备以下信息：

（1）获取 SDKAppID 和 AppKey

云短信应用 SDKAppID 和 AppKey 可在 短信控制台 的应用信息里获取。如您尚未添加应用，请登录 短信控制台 添加应用。

（2）申请签名并确认审核通过

一个完整的短信由短信签名和短信正文内容两部分组成，短信签名需申请和审核，签名可在 短信控制台 的相应服务模块【内容配置】中进行申请，详细申请操作请参见 创建签名。发送国际/港澳台短信时，允许不携带签名。

（3）申请模板并确认审核通过

短信正文内容模板需申请和审核，模板可在 短信控制台 的相应服务模块【内容配置】中进行申请，详细申请操作请参见 创建正文模板。

## 配置 SDK

qcloudsms_java 可以采用多种方式进行安装，我们提供以下三种方法供用户使用：

```xml
<dependency>
    <groupId>com.github.qcloudsms</groupId>
    <artifactId>qcloudsms</artifactId>
    <version>1.0.6</version>
</dependency>
```

## 示例代码

```java
// 短信应用 SDK AppID
int appid = 1400009099; // SDK AppID 以1400开头
// 短信应用 SDK AppKey
String appkey = "9ff91d87c2cd7cd0ea762f141975d1df37481d48700d70ac37470aefc60f9bad";
// 需要发送短信的手机号码
String[] phoneNumbers = {"21212313123", "12345678902", "12345678903"};
// 短信模板 ID，需要在短信应用中申请
int templateId = 7839; // NOTE: 这里的模板 ID`7839`只是示例，真实的模板 ID 需要在短信控制台中申请
// 签名
String smsSign = "腾讯云"; // NOTE: 签名参数使用的是`签名内容`，而不是`签名ID`。这里的签名"腾讯云"只是示例，真实的签名需要在短信控制台申请
```

## 指定模板 ID 单发短信

```java
import com.github.qcloudsms.SmsSingleSender;
import com.github.qcloudsms.SmsSingleSenderResult;
import com.github.qcloudsms.httpclient.HTTPException;
import org.json.JSONException;
import java.io.IOException;
try {
 String[] params = {"5678"};
 SmsSingleSender ssender = new SmsSingleSender(appid, appkey);
 SmsSingleSenderResult result = ssender.sendWithParam("86", phoneNumbers[0],
     templateId, params, smsSign, "", "");
 System.out.println(result);
} catch (HTTPException e) {
 // HTTP 响应码错误
 e.printStackTrace();
} catch (JSONException e) {
 // JSON 解析错误
 e.printStackTrace();
} catch (IOException e) {
 // 网络 IO 错误
 e.printStackTrace();
}
```

## 指定模板 ID 群发短信

```java
import com.github.qcloudsms.SmsMultiSender;
import com.github.qcloudsms.SmsMultiSenderResult;
import com.github.qcloudsms.httpclient.HTTPException;
import org.json.JSONException;
import java.io.IOException;
try {
 String[] params = {"5678"};
 SmsMultiSender msender = new SmsMultiSender(appid, appkey);
 SmsMultiSenderResult result =  msender.sendWithParam("86", phoneNumbers,
     templateId, params, smsSign, "", "");
 System.out.println(result);
} catch (HTTPException e) {
 // HTTP 响应码错误
 e.printStackTrace();
} catch (JSONException e) {
 // JSON 解析错误
 e.printStackTrace();
} catch (IOException e) {
 // 网络 IO 错误
 e.printStackTrace();
}
```

## 拉取短信回执以及回复

```java
import com.github.qcloudsms.SmsStatusPuller;
import com.github.qcloudsms.SmsStatusPullCallbackResult;
import com.github.qcloudsms.SmsStatusPullReplyResult;
import com.github.qcloudsms.httpclient.HTTPException;
import org.json.JSONException;
import java.io.IOException;
try {
 // Note: 短信拉取功能需要联系腾讯云短信技术支持（QQ：3012203387）开通权限
 int maxNum = 10;  // 单次拉取最大量
 SmsStatusPuller spuller = new SmsStatusPuller(appid, appkey);
  // 拉取短信回执
 SmsStatusPullCallbackResult callbackResult = spuller.pullCallback(maxNum);
 System.out.println(callbackResult);
  // 拉取回复，国际/港澳台短信不支持回复功能
 SmsStatusPullReplyResult replyResult = spuller.pullReply(maxNum);
 System.out.println(replyResult);
} catch (HTTPException e) {
 // HTTP 响应码错误
 e.printStackTrace();
} catch (JSONException e) {
 // JSON 解析错误
 e.printStackTrace();
} catch (IOException e) {
 // 网络 IO 错误
 e.printStackTrace();
}
```

## 拉取单个手机短信状态

```java
import com.github.qcloudsms.SmsMobileStatusPuller;
import com.github.qcloudsms.SmsStatusPullCallbackResult;
import com.github.qcloudsms.SmsStatusPullReplyResult;
import com.github.qcloudsms.httpclient.HTTPException;
import org.json.JSONException;
import java.io.IOException;
try {
 int beginTime = 1511125600;  // 开始时间（UNIX timestamp）
 int endTime = 1511841600;    // 结束时间（UNIX timestamp）
 int maxNum = 10;             // 单次拉取最大量
 SmsMobileStatusPuller mspuller = new SmsMobileStatusPuller(appid, appkey);
  // 拉取短信回执
 SmsStatusPullCallbackResult callbackResult = mspuller.pullCallback("86",
     phoneNumbers[0], beginTime, endTime, maxNum);
 System.out.println(callbackResult);
  // 拉取回复，国际/港澳台短信不支持回复功能
 SmsStatusPullReplyResult replyResult = mspuller.pullReply("86",
     phoneNumbers[0], beginTime, endTime, maxNum);
 System.out.println(replyResult);
} catch (HTTPException e) {
 // HTTP 响应码错误
 e.printStackTrace();
} catch (JSONException e) {
 // JSON 解析错误
 e.printStackTrace();
} catch (IOException e) {
 // 网络 IO 错误
 e.printStackTrace();
}
```

# 其他特性

## 使用代理

部分环境需要使用代理才能上网，可使用 ProxyHTTPClient 来发送请求，示例如下：

```java
import com.github.qcloudsms.SmsSingleSender;
import com.github.qcloudsms.SmsSingleSenderResult;
import com.github.qcloudsms.httpclient.HTTPException;
import com.github.qcloudsms.httpclient.ProxyHTTPClient;
import org.json.JSONException;
import java.io.IOException;
try {
// 创建一个代理 httpclient
 ProxyHTTPClient httpclient = new ProxyHTTPClient("127.0.0.1", 8080, "http");
  String[] params = {"5678"};
 SmsSingleSender ssender = new SmsSingleSender(appid, appkey, httpclient);
 SmsSingleSenderResult result = ssender.sendWithParam("86", phoneNumbers[0],
     templateId, params, smsSign, "", "");  // 签名参数未提供或者为空时，会使用默认签名发送短信
 System.out.println(result);
} catch (HTTPException e) {
 // HTTP 响应码错误
 e.printStackTrace();
} catch (JSONException e) {
 // JSON 解析错误
 e.printStackTrace();
} catch (IOException e) {
 // 网络 IO 错误
 e.printStackTrace();
}
```

## 使用连接池

多个线程可以共用一个连接池发送 API 请求，多线程并发单发短信示例如下：

```java
import com.github.qcloudsms.SmsSingleSender;
import com.github.qcloudsms.SmsSingleSenderResult;
import com.github.qcloudsms.httpclient.HTTPException;
import com.github.qcloudsms.httpclient.PoolingHTTPClient;
import org.json.JSONException;
import java.io.IOException;
class SmsThread extends Thread {
  private final SmsSingleSender sender;
 private final String nationCode;
 private final String phoneNumber;
 private final String msg;
  public SmsThread(SmsSingleSender sender, String nationCode, String phoneNumber, String msg) {
     this.sender = sender;
     this.nationCode = nationCode;
     this.phoneNumber = phoneNumber;
     this.msg = msg;
 }
  @Override
 public void run() {
     try {
         SmsSingleSenderResult result = sender.send(0, nationCode, phoneNumber, msg, "", "");
         System.out.println(result);
     } catch (HTTPException e) {
         // HTTP 响应码错误
         e.printStackTrace();
     } catch (JSONException e) {
         // JSON 解析错误
         e.printStackTrace();
     } catch (IOException e) {
         // 网络 IO 错误
         e.printStackTrace();
     }
 }
}
public class SmsTest {
  public static void main(String[] args) {
      int appid = 122333333;
     String appkey = "9ff91d87c2cd7cd0ea762f141975d1df37481d48700d70ac37470aefc60f9bad";
     String[] phoneNumbers = {
         "21212313123", "12345678902", "12345678903",
         "21212313124", "12345678903", "12345678904",
         "21212313125", "12345678904", "12345678905",
         "21212313126", "12345678905", "12345678906",
         "21212313127", "12345678906", "12345678907",
     };
      // 创建一个连接池 httpclient, 并设置最大连接量为10
     PoolingHTTPClient httpclient = new PoolingHTTPClient(10);
      // 创建 SmsSingleSender 时传入连接池 http client
     SmsSingleSender ssender = new SmsSingleSender(appid, appkey, httpclient);
      // 创建线程
     SmsThread[] threads = new SmsThread[phoneNumbers.length];
     for (int i = 0; i < phoneNumbers.length; i++) {
         threads[i] = new SmsThread(ssender, "86", phoneNumbers[i], "您验证码是：5678");
     }
      // 运行线程
     for (int i = 0; i < threads.length; i++) {
         threads[i].start();
     }
      // join 线程
     for (int i = 0; i < threads.length; i++) {
         threads[i].join();
     }
      // 关闭连接池 httpclient
     httpclient.close();
 }
}
```

## 使用自定义 HTTP client 实现

如果需要使用自定义的 HTTP client 实现，只需实现 com.github.qcloudsms.httpclient.HTTPClient 接口，并在构造 API 对象时传入自定义 HTTP client 即可，参考示例如下：

```java
import com.github.qcloudsms.httpclient.HTTPClient;
import com.github.qcloudsms.httpclient.HTTPRequest;
import com.github.qcloudsms.httpclient.HTTPResponse;
import java.io.IOException;
import java.net.URISyntaxException;
// import com.example.httpclient.MyHTTPClient
// import com.exmaple.httpclient.MyHTTPRequest
// import com.example.httpclient.MyHTTPresponse
public class CustomHTTPClient implements HTTPClient {
  public HTTPResponse fetch(HTTPRequest request) throws IOException, URISyntaxException {
     // 1. 创建自定义 HTTP request
     // MyHTTPrequest req = MyHTTPRequest.build(request)
      // 2. 创建自定义 HTTP cleint
     // MyHTTPClient client = new MyHTTPClient();
      // 3. 使用自定义 HTTP client 获取 HTTP 响应
     // MyHTTPResponse response = client.fetch(req);
      // 4. 转换 HTTP 响应到 HTTPResponse
     // HTTPResponse res = transformToHTTPResponse(response);
      // 5. 返回 HTTPResponse 实例
     // return res;
 }
  public void close() {
     // 如果需要关闭必要资源
 }
}
// 创建自定义 HTTP client
CustomHTTPClient httpclient = new CustomHTTPClient();
// 构造 API 对象时传入自定义 HTTP client
SmsSingleSender ssender = new SmsSingleSender(appid, appkey, httpclient);
```

# 参考资料

https://cloud.tencent.com/document/product/382/13613

https://zhuanlan.zhihu.com/p/66307658

* any list
{:toc}