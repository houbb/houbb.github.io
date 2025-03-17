---
layout: post
title:  web 实战-18-开源验证码项目 CAPTCHA
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, opensource, github, sf]
published: true
---

# tianai-captcha

[tianai-captcha](https://github.com/dromara/tianai-captcha) 可能是java界最好的开源行为验证码 [滑块验证码、点选验证码、行为验证码、旋转验证码， 滑动验证码]

## 简单介绍

- tianai-captcha 目前支持的行为验证码类型
    - 滑块验证码
    - 旋转验证码
    - 滑动还原验证码
    - 文字点选验证码
    - 后面会陆续支持市面上更多好玩的验证码玩法... 敬请期待

## 快速上手

> 注意:  如果你项目是使用的**Springboot**，
>
>
请使用SpringBoot脚手架工具[tianai-captcha-springboot-starter](https://gitee.com/tianai/tianai-captcha-springboot-starter);
>
> 该工具对tianai-captcha验证码进行了封装，使其使用更加方便快捷


> **写好的验证码demo移步 [tianai-captcha-demo](https://gitee.com/tianai/tianai-captcha-demo)**

### 1. 导入xml

```xml
<!-- maven 导入 -->
<dependency>
    <groupId>cloud.tianai.captcha</groupId>
    <artifactId>tianai-captcha</artifactId>
    <version>1.5.1</version>
</dependency>
```

### 2. 构建 `ImageCaptchaApplication`负责生成和校验验证码

```java
import cloud.tianai.captcha.validator.common.model.dto.MatchParam;

public class ApplicationTest {

    public static void main(String[] args) {
        ImageCaptchaApplication application = TACBuilder.builder()
                .addDefaultTemplate() // 添加默认模板
                // 给滑块验证码 添加背景图片，宽高为600*360, Resource 参数1为 classpath/file/url , 参数2 为具体url 
                .addResource("SLIDER", new Resource("classpath", "META-INF/cut-image/resource/1.jpg")) // 滑块验证的背景图
                .addResource("WORD_IMAGE_CLICK", new Resource("classpath", "META-INF/cut-image/resource/1.jpg")) // 文字点选的背景图
                .addResource("ROTATE", new Resource("classpath", "META-INF/cut-image/resource/1.jpg")) // 旋转验证的背景图
                .build();
        // 生成验证码数据， 可以将该数据直接返回给前端 ， 可配合 tianai-captcha-web-sdk 使用
        // 支持生成 滑动验证码(SLIDER)、旋转验证码(ROTATE)、滑动还原验证码(CONCAT)、文字点选验证码(WORD_IMAGE_CLICK)
        CaptchaResponse<ImageCaptchaVO> res = application.generateCaptcha("SLIDER");
        System.out.println(res);

        // 校验验证码， ImageCaptchaTrack 和 id 均为前端传开的参数， 可将 valid数据直接返回给 前端
        // 注意: 该项目只负责生成和校验验证码数据， 至于二次验证等需要自行扩展
        String id = res.getId();
        ImageCaptchaTrack imageCaptchaTrack = null;
        ApiResponse<?> valid = application.matching(id, new MatchParam(imageCaptchaTrack));
        System.out.println(valid.isSuccess());


        // 扩展: 一个简单的二次验证
        CacheStore cacheStore = new LocalCacheStore();
        if (valid.isSuccess()) {
            // 如果验证成功，生成一个token并存储, 将该token返回给客户端，客户端下次请求数据时携带该token， 后台判断是否有效
            String token = UUID.randomUUID().toString();
            cacheStore.setCache(token, new AnyMap(), 5L, TimeUnit.MINUTES);
        }

    }
}
```

### 3.详细文档请点击 [在线文档](http://doc.captcha.tianai.cloud)

# 参考资料

https://github.com/dromara/tianai-captcha

* any list
{:toc}