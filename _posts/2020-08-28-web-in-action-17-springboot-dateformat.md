---
layout: post
title:  web 实战-17-springboot dateformat 日期页面显示为数字或者 jackson 格式化无效
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 背景

数据库中字段为时间类型，页面显示全部变成了 Long 类型。

如果一个个处理会非常的麻烦。


# 解决方案

## 返回参数

1，每个实体属性添加 `@JsonFormat(pattern="yyyy-MM-dd HH:mm:ss",timezone="GMT+8")` 注解

2，可以在配置文件中全局指定

```
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
spring.jackson.time-zone=GMT+8
```

## 接受参数

1, 每个实体属性添加 

`@DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")`

2, 配置文件全局配置 

```
spring.mvc.date-format=yyyy-MM-dd HH:mm:ss
```

# 配置不生效的问题

开始制定格式化，显示都好好的，后来发现不行了。

看了下原因，有的说是指定了 `@EnableWebMvc`，发现自己没有使用。

后来定位出原因是自己重写了 `WebMvcConfigurationSupport`，导致默认的配置无效。

## 解决方案

可以重新指定：

```java
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import java.text.SimpleDateFormat;
import java.util.List;

/**
 * @author binbin.hou
 * @since 0.0.11
 */
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {

    /**
     * 使用此方法, 以下 spring-boot: jackson时间格式化 配置 将会失效
     * spring.jackson.time-zone=GMT+8
     * spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
     * 原因: 会覆盖 @EnableAutoConfiguration 关于 WebMvcAutoConfiguration 的配置
     * */
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        ObjectMapper objectMapper = converter.getObjectMapper();
        // 生成JSON时,将所有Long转换成String
        SimpleModule simpleModule = new SimpleModule();
        simpleModule.addSerializer(Long.class, ToStringSerializer.instance);
        simpleModule.addSerializer(Long.TYPE, ToStringSerializer.instance);
        objectMapper.registerModule(simpleModule);
        // 时间格式化
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
        // 设置格式化内容
        converter.setObjectMapper(objectMapper);
        converters.add(0, converter);
    }

}
```

# 参考资料

[springboot 格式化日期](https://www.cnblogs.com/huanggy/p/9471827.html)

[SpringBoot中spring.jackson.date-format配置失效的解决办法](https://cloud.tencent.com/developer/article/1552011)

[解决springboot配置jackson.date-format不生效的问题](https://blog.csdn.net/qq_24484911/article/details/103420218)

* any list
{:toc}