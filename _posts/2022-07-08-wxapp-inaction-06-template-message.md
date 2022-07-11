---
layout: post
title:  微信公众号项目开发实战-06-template message 模板消息发送
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 模板消息

## 定义模板

生产环境需要申请，一般审核比较严格。

如果申请通过，测试环境可以直接进行配置。

比如模板内容：

```
{{first.DATA}} 
消息类別：{{keyword1.DATA}} 
通知内容：{{keyword2.DATA}} 
{{remark.DATA}} 
```

每一个模板都有微信的模板标识，比如：`Gf_1234567890-sdfasdfasdjfkasdf`

# 代码实现

## maven 引入

公众号的接口，有很多比较成熟的 jdk 包：

```xml
<dependency>
    <groupId>com.github.binarywang</groupId>
    <artifactId>weixin-java-mp</artifactId>
    <version>3.5.0</version>
</dependency>
```

## 配置

```java
@Configuration
public class WxMpConfig {

    @Bean("wxJedisPool")
    public JedisPool jedisPool(){
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        JedisPool jedisPool = new JedisPool(poolConfig, redisAddress, redisPort,
                timeout, password);
        return jedisPool;
    }

    @Bean("wxMpService")
    public WxMpService wxMpService(@Qualifier("wxJedisPool") JedisPool jedisPool) {
        WxMpService service = new WxMpServiceOkHttpImpl();
        WxMpRedisConfigImpl config = new WxMpRedisConfigImpl(jedisPool);
        final String appId = "$appId";
        final String secret = "$appSecret";
        config.setAppId(appId);
        config.setSecret(secret);
        service.setWxMpConfigStorage(config);
        return service;
    }

}
```

这里一般建议使用 redis 作为缓存的集中式缓存持久化。

## 发送消息

基于 WxMpService 的消息发送，也比较简单：

```java
/**
 * 发送模板消息
 * @param toUser 用户
 * @param templateId 模板标识
 * @param url 连接
 * @param data 数据
 */
public void sendTemplateMessage(String toUser, String templateId, String url, List<WxMpTemplateData> data){
    try {
        log.info("开始执行消息推送 toUser:{}, templateId: {}, url: {}, data: {}",
                toUser, templateId, url, JSON.toJSON(data));
        wxMpService
                .getTemplateMsgService()
                .sendTemplateMsg(WxMpTemplateMessage.builder()
                        .toUser(toUser)
                        .templateId(templateId)
                        .url(url)
                        .data(data)
                        .build());
        log.info("完成消息推送 toUser:{}, templateId: {}", toUser, templateId);
    } catch (WxErrorException e) {
        log.error("微信发送失败",e);
        throw new BizException(RespCode.WX_REPORT_PUSH_FAILED);
    }
}
```

推送消息的时候，建议以 wxOpenId 作为推送的主体，避免对用户造成打扰。

## 实际使用

```java
// 接收用户
String toUserId = "$userId";
// 模板消息标识
String templateId = "$templateId";
// 跳转的地址
String url = "https://www.baidu.com";

List<WxMpTemplateData> data = new ArrayList<>();
data.add(new WxMpTemplateData("first","亲爱的老马，你好"));
// 报表类型
data.add(new WxMpTemplateData("keyword1", "节日问候"));
// 内容
data.add(new WxMpTemplateData("keyword2", "幸福安康"));
// 备注
String remark = "平平无奇的备注";
data.add(new WxMpTemplateData("remark", remark,"#FF0000"));

wxMpClient.sendTemplateMessage(toUserId, templateId, url, data);
```

消息是可以指定颜色的，但是不那么建议。不要花里胡哨的。

# 注意

（1）消息有一定的次数限制，测试环境要注意。

（2）模板审核比较严格，尽量使用已有的模板。


# 参考资料

https://blog.csdn.net/aloneiii/article/details/122122235

* any list
{:toc}