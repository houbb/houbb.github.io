---
layout: post
title:  微信公众号项目开发实战-05-miniapp 小程序跳转
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 说明

公众号作为流量的入口，定位比较轻量。

一些复杂的操作，比如开户+交易查询等，小程序的操作体验会更好。

考虑到开发成本等，就会直接进行小程序跳转。

# 小程序跳转的方式

## 基于公众号 js

实现比较麻烦，不容易验证。

## 基于 schema url

基于链接，相对简单。

# 基于公众号 js

> [js 文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)

## 后端实现

```java
/**
 * 配置查询
 *
 * @param req 入参
 * @return 配置
 */
public AnyMiniAppConfig queryConfig(AnyMiniAppOpenReq req) {
    AnyMiniAppConfig config = new AnyMiniAppConfig();
    String currentUrl = req.getCurrentUrl();
    String appId = "$appId";
    String miniAppId = "$minAppId";
    String miniAppPath = "$miniAppPath";

    long time = System.currentTimeMillis() / 1000;
    String nonceStr = RandomStringUtils.randomNumeric(16);
    String sign = getSignature(nonceStr, time, currentUrl);
    List<String> jsApiList = ["uploadVoice"];
    List<String> openTagList = ["wx-open-launch-app"];
    config.setTimestamp(time);
    config.setAppId(appId);
    config.setMiniAppId(miniAppId);
    config.setMiniAppPath(miniAppPath);
    config.setNonceStr(nonceStr);
    config.setSignature(sign);
    config.setJsApiList(jsApiList);
    config.setOpenTagList(openTagList);
    return config;
}
```

获取签名的算法如下：

```java
/**
 * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
 *
 * @param noncestr  随机数
 * @param timestamp 时间戳
 * @param url 当前页面地址
 * @return 结果
 */
private String getSignature(String noncestr,
                            long timestamp,
                            String url) {
    try {
        String jsapi_ticket = wxMpService.getJsapiTicket();
        StringBuilder builder = new StringBuilder();
        builder.append("jsapi_ticket=")
                .append(jsapi_ticket)
                .append("&")
                .append("noncestr=")
                .append(noncestr)
                .append("&")
                .append("timestamp=")
                .append(timestamp)
                .append("&")
                .append("url=").append(url);
        String string = builder.toString();
        return ShaUtils.getSha1(string);
    } catch (WxErrorException e) {
        log.error("微信异常", e);
        throw new BizException(RespCode.WX_MINI_APP_SIGN_FAILED);
    }
}
```

## 说明

这种方法实现起来很麻烦，前后端都要有大量的开发，不建议使用。

我们来看一下基于 schema url 的实现方式。

# schema url

## 文档

> [urlscheme.generate.html](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-scheme/urlscheme.generate.html)

获取小程序 scheme 码，适用于短信、邮件、外部网页、微信内等拉起小程序的业务场景。

目前仅针对国内非个人主体的小程序开放，详见获取 URL scheme。

## 后端

```java
public String getWxOpenLink(String path, String query, String merUUId) {
    //1.根据请求参数path和query 获取redis是否有值
    String openLinkRedisKey = merUUId + "_" + path + "_" + query;
    String openLinkRedisValue = redisService.get(openLinkRedisKey);
    if(StringUtils.isNotBlank(openLinkRedisValue)){
        return openLinkRedisValue;
    }

    //2.获取access_token
    String accessToken =  getMiniAppAccessToken();

    //3.根据access_token获取openLink
    String openLink = sendMiniAppOpenLinkRequest(path, query, accessToken);

    //4.将openLink放在redis中
    redisService.add(openLinkRedisKey, openLink, 3600L);
    resp.setOpenLink(openLink);
    return resp;
}
```

schema url 限制一个链接只能被一个用户打开，然后就会失效。

所以需要为不同的用户生成不同的 openlink。

微信对这个接口的调用有一定的频率限制等，所以建议添加缓存。

## miniApp token 获取

```java
public String getMiniAppAccessToken(){
    String accessTokenRedisValue = redisService.get("$miniAppAccessToken");
    if(StringUtils.isNotBlank(accessTokenRedisValue)){
        return accessTokenRedisValue;
    }

    String accessToken = sendMiniAppAccessTokenHttpRequest();

    redisService.add(accessTokenRedisKey, accessToken, 86400);
    return  accessToken;
}
```

miniApp 的 accessToken 建议统一放在 redis 中，用同一个服务器处理。

```java
/***
 * 获取微信小程序的access_token
 * 接口地址：GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 * 接口文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/access-token/auth.getAccessToken.html
 * @return
 */
public String sendMiniAppAccessTokenHttpRequest(){
    String httpUrl = "https://api.weixin.qq.com/cgi-bin/token";
    String miniAppId = "$miniAppId";
    String miniAppSecret = "$miniAppSecret";
    Integer connectTimeOut = 5000;
    Integer readTimeOut =  5000;

    String authUrl = httpUrl +"?grant_type=client_credential"  + "&appid=" + miniAppId + "&secret=" + miniAppSecret;
    log.info("获取小程序access_token地址：{}", authUrl);
    
    String postForm = HttpClient.postForm(authUrl, null, null, connectTimeOut, readTimeOut);

    log.info("获取小程序access_token结果: {}", postForm);
    WxHttpAccessTokenResp response = JSON.parseObject(postForm, WxHttpAccessTokenResp.class);
    String accessToken = response.getAccess_token();
    if (StringUtils.isBlank(accessToken)) {
        String errmsg = response.getErrmsg();
        log.error("未获取到小程序access_token或者获取失败，失败原因：{}", errmsg);
        throw new BizException("获取 miniApp accessToken 失败");
    }
    return accessToken;
}
```

WxHttpAccessTokenResp 是一个简单的对象的对象

```java
public class WxHttpAccessTokenResp {

    /***
     * 获取到的凭证
     */
    private String access_token;

    /***
     * 凭证有效时间，单位：秒。目前是7200秒之内的值。
     */
    private String expires_in;

    /** 错误码 */
    private String errcode;

    /** 错误信息 */
    private String errmsg;

}
```

ps: 注意微信会有一些限制，所以请求并不一定成功。

## openLink 获取

```java
/***
* 获取小程序 scheme 码，适用于短信、邮件、外部网页、微信内等拉起小程序的业务场景。
 * 接口地址：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-scheme/urlscheme.generate.html
 *
 * @return
 */
public String sendMiniAppOpenLinkRequest(String path, String query, String accessToken) {
    String httpUrl = "https://api.weixin.qq.com/wxa/generatescheme";
    Integer connectTimeOut = 5000;
    Integer readTimeOut = 5000;
    String authUrl = httpUrl +"?access_token=" + accessToken;

    Map<String, Object> params = new HashMap<>();
    Map<String, String> jumpParam = new HashMap<>();
    jumpParam.put("path", path);
    jumpParam.put("query", query);

    //要打开的小程序版本。正式版为"release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
    String version = "release";

    jumpParam.put("env_version", version);
    params.put("jump_wxa", jumpParam);

    // 指定2天过期
    params.put("expire_type", 1);
    String expireDays = 2;
    params.put("expire_interval", expireDays);
    Map<String, String> headers = new HashMap<>();
    
    // 注意，需要指定
    headers.put("Content-Type", "application/json");

    log.info("获取小程序openLink请求：{}", JSONObject.toJSONString(params));
    String postForm = HttpClient.doPost(authUrl, JSONObject.toJSONString(params), headers, connectTimeOut, readTimeOut);
    log.info("获取小程序openLink返回: {}", postForm);

    WxHttpOpenLinkResp response = JSON.parseObject(postForm, WxHttpOpenLinkResp.class);
    String errcode = response.getErrcode();
    String errmsg = response.getErrmsg();
    String openLink = response.getOpenlink();
    if (!Constants.ZERO.equals(errcode) || StringUtils.isBlank(openLink)) {
        log.error("未获取到小程序openLink或者获取失败，失败原因：{}", errmsg);

        throw new BizException("openLink 获取失败！");
    }
    return openLink;
}
```

其中

```java
public class WxHttpOpenLinkResp {

    /***
     * 生成的小程序 scheme 码
     */
    private String openlink;

    /** 错误码 */   
    private String errcode;

    /** 错误信息 */
    private String errmsg;
}
```

注意：要打开的小程序版本。正式版为"release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。

**只有通过浏览器打开才能生效。微信内直接打开，跳的都是 release 版本。**

# 兼容性

有的 andriod 版本，会提示改地址无效。

ps: 微信本身的兼容性问题。

# 前端使用方式

## 请求

前端传入对应的 query path 即可。

```
path: pages/index/index
query: targetPage=1&source=test
```

返回的结果如下：

```
openlink: weixin://dl/business/?t=abcdefg
```

## 使用

前端直接做一次页面重定向即可。


```js
windows.location.href=weixin://dl/business/?t=abcdefg
```

# 测试环境的权限问题

ACCESS Token 是根据 mini-app 的标识和令牌获取的。

小程序的标识只有一套。

如果生产已经部署，那么测试再次获取，会导致生产的失效。

## 方案1

申请一套全新的小程序测试。

这种比较麻烦。

## 方案2

生产环境提供一个查询接口

测试环境查询生产的 accessToken 并且将其放在测试环境的 redis 中。




# 参考资料

https://blog.csdn.net/aloneiii/article/details/122122235

* any list
{:toc}