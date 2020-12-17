---
layout: post
title:  web 实战-19-http 请求的正确姿势
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 序言

最近再写 http 请求相关的东西，为了方便就直接通过 java HttpClient 调用另外一个系统。

结果调试了一晚上才通过，血的教训，这里记录一下。

# 服务端

```java
import com.alibaba.fastjson.JSON;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 用户控制层
 * @author binbin.hou
 */
@Controller
@RequestMapping("/user")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @RequestMapping(value = "/active", method = RequestMethod.POST)
    @ResponseBody
    public String active(@RequestBody UserReqVo reqVo) {
        try {
            logger.info("开始处理信息 {}", reqVo);

            if(null == reqVo) {
                logger.error("请求参数不可为空，忽略处理");
                return "fail";
            }

            final String traceId = reqVo.getTraceId();
            
            boolean result = xxxx();

            logger.info("{} 处理结果 {}", traceId, result);
            return "ok";
        } catch (Exception exception) {
            logger.error("{} 处理异常", reqVo, exception);
            return "fail";
        }
    }

}
```

这里是非常简单的一个方法定义，然而有很多地方还是要注意下。

`@RequestMapping(value = "/active", method = RequestMethod.POST)` 指定这是一个 post 请求；`@RequestBody` 直接将 json 反序列为对象。

# 请求端

最基本的 get/post 请求工具类：

```java
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;

public class HttpUtils {

    private static Logger logger = LoggerFactory.getLogger(HttpUtils.class);

    public static String doPost(String url, String requestParams) {
        StringBuffer sb = new StringBuffer();
        try {
            logger.info("请求日志 url: {}, 参数：{}", url, requestParams);
            URL urlPost = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) urlPost.openConnection();
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setRequestMethod("POST");
            connection.setUseCaches(false);
            connection.setInstanceFollowRedirects(true);
            connection.setRequestProperty("Content-Type", "application/json;charset=UTF-8");
            connection.setConnectTimeout(45 * 1000);

            connection.connect();
            if (StringUtils.isNotEmpty(requestParams)) {
                DataOutputStream out = new DataOutputStream(connection.getOutputStream());
                out.write(requestParams.getBytes("UTF-8"));
                out.flush();
                out.close();
            }
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String lines;
            while ((lines = reader.readLine()) != null) {
                String lines1 = new String(lines.getBytes(), "UTF-8");
                sb.append(lines1);
            }
            reader.close();
            connection.disconnect();
        } catch (Exception e) {
            logger.error("请求遇到异常", e);
            throw new RuntimeException();
        }

        logger.info("请求结果: {}", sb.toString());
        return sb.toString();
    }


    /**
     * 向指定URL发送GET方法的请求
     */
    public static String doGet(String url, String requestParams, String token) {
        BufferedReader in = null;
        try {
            logger.info(url + "?" + requestParams);
            URL realUrl = new URL(url + "?" + requestParams);
            // 打开和URL之间的连接
            URLConnection connection = realUrl.openConnection();
            // 设置通用的请求属性
            connection.setRequestProperty("accept", "*/*");
            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            connection.setRequestProperty("token", token);
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            // 建立实际的连接
            connection.connect();
            // 定义 BufferedReader输入流来读取URL的响应
            in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuffer sb = new StringBuffer();
            String line;
            while ((line = in.readLine()) != null) {
                sb.append(line);
            }
            logger.info(sb.toString());
            return sb.toString();
        } catch (Exception e) {
            logger.error("Exception occur when send http get request!", e);
        }
        // 使用finally块来关闭输入流
        finally {
            try {
                if (in != null) {
                    in.close();
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
        return null;
    }

}
```

这里 post 请求的属性设置很重要：

```java
connection.setRequestProperty("Content-Type", "application/json;charset=UTF-8");
```

表示传入的参数时 json 类型。

调用方式如下：

```java
String json = JSON.toJSONString(user);
HttpUtils.doPost(url, json);
```

# 拓展阅读

[okhttp](https://houbb.github.io/2018/03/16/okhttp)

# 参考资料

* any list
{:toc}