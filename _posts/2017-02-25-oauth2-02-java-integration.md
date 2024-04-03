---
layout: post
title: OAuth2-02-java 整合
date:  2017-02-25 08:46:41 +0800
categories: [Auth]
tags: [oauth, spring-intergration, spring-cloud, sh]
published: true
---

# 拓展阅读

[OAuth 2.0-01-Overview](https://houbb.github.io/2017/02/25/oauth2-01-overview-01)

[OAuth2-02-java 整合](https://houbb.github.io/2017/02/25/oauth2-02-java-integration)

[OAuth2-03-springboot 整合](https://houbb.github.io/2017/02/25/oauth2-03-springboot-integration)


# java 例子

下面是一个简单的Java程序，演示了如何使用Java实现OAuth 2.0的基本功能：

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;

public class OAuth2Example {

    public static void main(String[] args) throws IOException {
        // 定义OAuth 2.0 授权服务器的地址、客户端ID和客户端密钥
        String authorizationServerUrl = "http://example.com/oauth2/token";
        String clientId = "your_client_id";
        String clientSecret = "your_client_secret";

        // 构建获取访问令牌的请求
        URL url = new URL(authorizationServerUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        connection.setDoOutput(true);

        // 添加请求参数
        String requestBody = "grant_type=client_credentials";
        connection.getOutputStream().write(requestBody.getBytes());

        // 添加客户端认证头部
        String authHeader = clientId + ":" + clientSecret;
        String encodedAuthHeader = Base64.getEncoder().encodeToString(authHeader.getBytes());
        connection.setRequestProperty("Authorization", "Basic " + encodedAuthHeader);

        // 发送请求并获取响应
        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();

        // 解析响应，获取访问令牌
        String accessToken = response.toString();
        System.out.println("Access Token: " + accessToken);

        // 使用访问令牌访问受保护资源
        String resourceUrl = "http://example.com/resource";
        HttpURLConnection resourceConnection = (HttpURLConnection) new URL(resourceUrl).openConnection();
        resourceConnection.setRequestProperty("Authorization", "Bearer " + accessToken);
        int statusCode = resourceConnection.getResponseCode();
        if (statusCode == HttpURLConnection.HTTP_OK) {
            BufferedReader resourceReader = new BufferedReader(new InputStreamReader(resourceConnection.getInputStream()));
            String resourceResponse = resourceReader.readLine();
            System.out.println("Resource Response: " + resourceResponse);
            resourceReader.close();
        } else {
            System.out.println("Failed to access protected resource, status code: " + statusCode);
        }
    }
}
```

在这个示例中，我们模拟了客户端使用客户端凭据授权（Client Credentials Grant）来获取访问令牌，并使用该访问令牌访问受保护的资源。

请确保替换示例中的实际授权服务器地址、客户端ID和客户端密钥。






# 参考资料


* any list
{:toc}