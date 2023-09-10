---
layout: post
title: 分布式链路追踪-10-http client 
date:  2023-07-25 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# Q1: java http client 有哪些常见的？介绍一下

在 Java 中，有几个常见的 HTTP 客户端库可以用来发送 HTTP 请求和处理响应。以下是一些常见的 Java HTTP 客户端库，以及它们的简要介绍：

1. **HttpURLConnection**：
   `HttpURLConnection` 是 Java 标准库提供的原生 HTTP 客户端。它提供了基本的 HTTP 请求和响应功能，适用于简单的 HTTP 请求场景。然而，它的使用可能相对繁琐，需要手动处理连接、请求、响应以及错误处理等。

2. **Apache HttpClient**：
   `Apache HttpClient` 是 Apache 软件基金会提供的开源 HTTP 客户端库。它提供了丰富的功能，可以更容易地发送 HTTP 请求、处理响应、管理连接池、处理重定向等。它在 Java 社区中非常流行，提供了更高层次的抽象，使得编写 HTTP 客户端代码更加简洁。

3. **OkHttp**：
   `OkHttp` 是 Square 公司开发的开源 HTTP 客户端库，专注于性能和易用性。它提供了简洁的 API，支持同步和异步请求，具有连接池管理、缓存、拦截器等特性。OkHttp 的性能表现很出色，广泛应用于 Android 和 Java 项目中。

4. **Unirest**：
   `Unirest` 是一个轻量级的 HTTP 客户端库，提供了简洁的 API 来发送 HTTP 请求和处理响应。它支持多种编程语言，包括 Java，具有直观的语法，使得编写 HTTP 请求代码更加简单。

5. **Spring WebClient**：
   `Spring WebClient` 是 Spring Framework 5 中引入的一部分，用于进行非阻塞的异步 HTTP 请求。它适用于响应式编程，支持函数式风格的 API，并可以与 Spring 的其他组件无缝集成。

这些是一些常见的 Java HTTP 客户端库。

选择适合项目需求的库取决于项目的规模、性能需求、功能要求以及开发团队的熟悉程度。

无论选择哪个库，都应该注意其文档和示例，以确保正确使用和处理 HTTP 请求和响应。


# HttpURLConnection

## Q2: 给出 HttpURLConnection get/post 请求的 java 代码例子

当使用 `HttpURLConnection` 进行 GET 和 POST 请求时，以下是相应的 Java 代码示例：

**GET 请求示例：**

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpGetExample {
    public static void main(String[] args) {
        try {
            // 创建 URL 对象
            URL url = new URL("https://api.example.com/data");

            // 打开连接
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // 设置请求方法为 GET
            connection.setRequestMethod("GET");

            // 获取响应代码
            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            // 读取响应内容
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();

            while ((inputLine = reader.readLine()) != null) {
                response.append(inputLine);
            }
            reader.close();

            // 打印响应内容
            System.out.println("Response Content: " + response.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**POST 请求示例：**

```java
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HttpPostExample {
    public static void main(String[] args) {
        try {
            // 创建 URL 对象
            URL url = new URL("https://api.example.com/postdata");

            // 打开连接
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // 设置请求方法为 POST
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);

            // 设置请求头
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

            // 构建请求参数
            String postData = "param1=value1&param2=value2";
            byte[] postDataBytes = postData.getBytes(StandardCharsets.UTF_8);

            // 发送请求数据
            try (DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream())) {
                outputStream.write(postDataBytes);
            }

            // 获取响应代码
            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            // 读取响应内容
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();

            while ((inputLine = reader.readLine()) != null) {
                response.append(inputLine);
            }
            reader.close();

            // 打印响应内容
            System.out.println("Response Content: " + response.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

请注意，这只是简单的示例代码，实际项目中需要处理更多的异常和错误情况，以及适应性更强的请求和响应处理。

在真实项目中，您可能会使用一些辅助方法来更好地处理连接、流关闭等资源管理。

## Q2.2 把上面的方法优化一下，提取成为2个工具方法

当我们优化代码时，可以将通用的功能提取成工具方法，以便在不同的地方重复使用。

以下是将 GET 和 POST 请求分别提取成工具方法的示例：

```java
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HttpUtils {

    public static String sendGetRequest(String url) throws Exception {
        URL apiUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) apiUrl.openConnection();
        connection.setRequestMethod("GET");

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();

            while ((inputLine = reader.readLine()) != null) {
                response.append(inputLine);
            }
            reader.close();
            return response.toString();
        } else {
            throw new RuntimeException("GET request failed with response code: " + responseCode);
        }
    }

    public static String sendPostRequest(String url, String postData) throws Exception {
        URL apiUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) apiUrl.openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        byte[] postDataBytes = postData.getBytes(StandardCharsets.UTF_8);
        try (DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream())) {
            outputStream.write(postDataBytes);
        }

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();

            while ((inputLine = reader.readLine()) != null) {
                response.append(inputLine);
            }
            reader.close();
            return response.toString();
        } else {
            throw new RuntimeException("POST request failed with response code: " + responseCode);
        }
    }

    public static void main(String[] args) {
        try {
            String getResponse = sendGetRequest("https://api.example.com/data");
            System.out.println("GET Response: " + getResponse);

            String postData = "param1=value1&param2=value2";
            String postResponse = sendPostRequest("https://api.example.com/postdata", postData);
            System.out.println("POST Response: " + postResponse);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

通过将 GET 和 POST 请求逻辑提取到 `HttpUtils` 类中的静态方法中，您可以更好地组织和复用代码。

在主方法中，您可以看到如何使用这些工具方法来发送 GET 和 POST 请求，并处理响应。

请注意，这里仍然需要适当地处理异常情况，以便在实际应用中能够更好地处理错误。

## 设置 header-HttpURLConnection 如何设置 header 信息

在 `HttpURLConnection` 中，您可以使用 `setRequestProperty` 方法来设置请求的头信息。以下是如何设置头信息的示例代码：

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpURLConnectionHeaderExample {
    public static void main(String[] args) {
        try {
            // 创建 URL 对象
            URL url = new URL("https://api.example.com/data");

            // 打开连接
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            // 设置请求头
            connection.setRequestProperty("User-Agent", "MyHttpURLConnection");  // 设置用户代理

            // 设置请求方法为 GET
            connection.setRequestMethod("GET");

            // 获取响应代码
            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            // 读取响应内容
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();

            while ((inputLine = reader.readLine()) != null) {
                response.append(inputLine);
            }
            reader.close();

            // 打印响应内容
            System.out.println("Response Content: " + response.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在示例代码中，我们使用 `setRequestProperty` 方法设置了一个名为 "User-Agent" 的请求头，以模拟一个自定义的用户代理信息。您可以根据需求添加其他请求头。

确保您在执行请求前设置所需的所有头信息，以便请求能够正确发送并得到正确的响应。


# Apache

下面是使用 Apache HttpClient 库执行 GET 和 POST 请求的示例代码，以及如何通过 Maven 引入该库：

**GET 请求示例：**

```java
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

public class HttpClientGetExample {
    public static void main(String[] args) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet httpGet = new HttpGet("https://api.example.com/data");

            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                String responseBody = EntityUtils.toString(response.getEntity());
                System.out.println("Response Content: " + responseBody);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**POST 请求示例：**

```java
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

public class HttpClientPostExample {
    public static void main(String[] args) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost("https://api.example.com/postdata");
            StringEntity postData = new StringEntity("param1=value1&param2=value2");
            httpPost.setEntity(postData);

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                String responseBody = EntityUtils.toString(response.getEntity());
                System.out.println("Response Content: " + responseBody);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**Maven 引入 Apache HttpClient：**

在 Maven 项目中引入 Apache HttpClient 是很简单的。您只需要在项目的 `pom.xml` 文件中添加以下依赖：

```xml
<dependencies>
    <!-- Other dependencies -->
    <dependency>
        <groupId>org.apache.httpcomponents</groupId>
        <artifactId>httpclient</artifactId>
        <version>4.5.13</version>
    </dependency>
</dependencies>
```

在这个例子中，版本号可能需要根据您的项目需求进行适当的调整。一旦您添加了依赖，Maven 将会自动下载并管理 Apache HttpClient 库的相关 JAR 文件。

这些示例代码演示了如何使用 Apache HttpClient 库执行 GET 和 POST 请求，并处理响应。

确保您的项目正确引入了 Apache HttpClient 依赖后，这些示例应该能够正常工作。

## 如何设置 header 信息

在 Apache HttpClient 中，可以使用 `setHeader` 方法来设置请求的头信息。以下是如何设置头信息的示例代码：

```java
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.http.Header;

public class HttpClientHeaderExample {
    public static void main(String[] args) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet httpGet = new HttpGet("https://api.example.com/data");
            
            // 设置请求头
            httpGet.setHeader("User-Agent", "MyHttpClient");  // 设置用户代理

            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                // 获取响应头
                Header[] headers = response.getAllHeaders();
                for (Header header : headers) {
                    System.out.println(header.getName() + ": " + header.getValue());
                }
                
                String responseBody = EntityUtils.toString(response.getEntity());
                System.out.println("Response Content: " + responseBody);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个示例中，我们使用 `setHeader` 方法来设置了一个名为 "User-Agent" 的请求头，以模拟一个自定义的用户代理信息。您可以根据需求添加其他请求头。

确保您在执行请求前设置所需的所有头信息，以便请求能够正确发送并得到正确的响应。

# OkHttp maven 引入 以及 入门 get/post 例子

在 Maven 项目中引入 OkHttp 是相当简单的。您只需要在项目的 `pom.xml` 文件中添加以下依赖：

```xml
<dependencies>
    <!-- Other dependencies -->
    <dependency>
        <groupId>com.squareup.okhttp3</groupId>
        <artifactId>okhttp</artifactId>
        <version>4.9.1</version>
    </dependency>
</dependencies>
```

确保版本号与您所需的版本匹配。一旦您添加了依赖，Maven 将会自动下载并管理 OkHttp 库的相关 JAR 文件。

下面是 OkHttp 的入门 GET 和 POST 请求的示例代码：

**GET 请求示例：**

```java
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class OkHttpGetExample {
    public static void main(String[] args) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://api.example.com/data")
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            System.out.println("Response Content: " + responseBody);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**POST 请求示例：**

```java
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class OkHttpPostExample {
    public static void main(String[] args) {
        OkHttpClient client = new OkHttpClient();

        MediaType mediaType = MediaType.parse("application/x-www-form-urlencoded");
        RequestBody body = RequestBody.create(mediaType, "param1=value1&param2=value2");
        
        Request request = new Request.Builder()
                .url("https://api.example.com/postdata")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            System.out.println("Response Content: " + responseBody);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这些示例中，我们使用了 OkHttp 的 `OkHttpClient` 类来执行 GET 和 POST 请求。通过创建适当的请求对象（`Request`）并使用 `execute()` 方法发送请求，然后可以处理响应并从响应主体中获取数据。

请确保在您的代码中适当地处理异常情况，以确保在请求和响应过程中没有问题。

## okhttp 如何设置 headers

在 OkHttp 中，您可以使用 `Request.Builder` 的 `addHeader` 方法来设置请求的头信息。以下是如何设置头信息的示例代码：

```java
import okhttp3.*;

public class OkHttpHeadersExample {
    public static void main(String[] args) {
        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
                .url("https://api.example.com/data")
                .addHeader("User-Agent", "MyOkHttpClient")  // 设置用户代理
                .addHeader("Authorization", "Bearer YourToken")  // 设置授权头
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            System.out.println("Response Content: " + responseBody);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个示例中，我们使用 `addHeader` 方法在请求对象中添加了两个头信息："User-Agent" 和 "Authorization"。您可以根据需要添加其他请求头。

确保您在执行请求前设置所需的所有头信息，以便请求能够正确发送并得到正确的响应。



# 参考资料


* any list
{:toc}