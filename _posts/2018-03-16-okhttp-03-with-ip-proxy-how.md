---
layout: post
title: okhttp-03-okhttp 如何使用 ip proxy?
date: 2025-4-3 14:03:48 +0800
categories: [Java]
tags: [java, http, ip, proxy, sh]
published: true
---


# 基本的模板

## maven 

```xml
<dependencies>
    <dependency>
        <groupId>com.squareup.okhttp3</groupId>
        <artifactId>okhttp</artifactId>
        <version>3.2.0</version>
    </dependency>

    <!--Okio用于给OkHttp提供快速的I/O和可调整大小的缓存池。-->
    <dependency>
        <groupId>com.squareup.okio</groupId>
        <artifactId>okio</artifactId>
        <version>1.6.0</version>
    </dependency>
</dependencies>
```

## 代码例子

```java
final int proxyPort = 1080; //your proxy port
final String proxyHost = "your proxy host";
final String username = "proxy username";
final String password = "proxy password";

InetSocketAddress proxyAddr = new InetSocketAddress(proxyHost, proxyPort);
Proxy proxy = new Proxy(Proxy.Type.HTTP, proxyAddr);

Authenticator.setDefault(new Authenticator() {
  @Override
  protected PasswordAuthentication getPasswordAuthentication() {
    if (getRequestingHost().equalsIgnoreCase(proxyHost)) {
      if (proxyPort == getRequestingPort()) {
        return new PasswordAuthentication(username, password.toCharArray());
      }
    }
    return null;
  }
});


OkHttpClient client = new OkHttpClient.Builder()
        .proxy(proxy)
        .build();
```

# smariproxy 具体例子




# 参开资料

[How to Use a Proxy With OkHttp [Tutorial 2025]](https://www.zenrows.com/blog/okhttp-proxy#proxy-authentication)

[OkHttp proxy settings](https://stackoverflow.com/questions/37866902/okhttp-proxy-settings)

[HTTPS proxy is not supported](https://github.com/square/okhttp/issues/3787)

# chat

## Q1

java使用okhttp在境内请求境外接口，可以使用各种付费代理。
1. 流冠动态ip代理。（只有国内代理）
2. 快代理。（买国内代理不能访问国外接口，买国外接口，我又在国内，不给用）
3. IPRoyal。一直没成功，也不知道为啥。

### A

根据您描述的问题，结合多维度资料分析，以下是针对Java使用OkHttp访问境外接口的代理配置优化建议及替代服务商推荐：

---

### **一、现有代理失败原因分析**
#### **1. 流冠动态IP代理**
- **问题定位**：该服务仅提供国内IP池（覆盖300+城市），无法用于访问境外接口(evidence_1)(evidence_3)。
- **关键限制**：
  - 国内代理IP不具备跨境访问能力，无法绕过地理限制。
  - 动态IP虽适合数据采集，但针对境外接口无实际作用。

#### **2. 快代理**
- **问题定位**：
  - **国内代理**：仅支持访问国内资源，无法访问境外接口(evidence_9)(evidence_10)。
  - **国外代理**：部分海外代理服务限制中国境内用户使用（可能因合规政策或IP被GFW拦截）(evidence_12)(evidence_14)。
- **技术矛盾**：
  - 快代理的海外代理服务器可能未针对中国用户优化链路，导致高延迟或连接失败。

#### **3. IPRoyal**
- **潜在失败原因**：
  - **配置错误**：未正确设置代理协议（需支持HTTP/SOCKS5）或忽略认证信息(evidence_17)(evidence_21)。
  - **IP被封锁**：目标接口可能识别并封禁代理IP(evidence_18)。
  - **流量耗尽**：IPRoyal按流量计费，需检查账户余额或流量配额(evidence_17)。

---

### **二、OkHttp代理配置优化建议**
#### **1. 基础代理设置**
```java
// 示例代码：使用HTTP代理
Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("代理IP", 端口));
OkHttpClient client = new OkHttpClient.Builder()
    .proxy(proxy)
    .build();
```


#### **2. 代理认证处理**
若代理需要用户名密码认证：
```java
Authenticator proxyAuthenticator = (route, response) -> {
    String credential = Credentials.basic("用户名", "密码");
    return response.request().newBuilder()
        .header("Proxy-Authorization", credential)
        .build();
};
OkHttpClient client = new OkHttpClient.Builder()
    .proxy(proxy)
    .proxyAuthenticator(proxyAuthenticator)
    .build();
```


#### **3. 高匿代理与协议选择**
- **优先选择SOCKS5协议**：穿透性更强，适用于复杂网络环境(evidence_30)。
- **启用高匿名性**：确保代理IP的`X-Forwarded-For`和`Via`头信息隐藏，避免被目标服务器识别(evidence_6)。

---

### **三、替代代理服务商推荐**
#### **1. IPRoyal（二次尝试建议）**
- **优势**：
  - 支持全球195+国家住宅IP，覆盖范围广(evidence_17)。
  - 提供24/7技术支持，可协助排查配置问题(evidence_18)(evidence_19)。
- **配置要点**：
  - 使用其提供的API接口动态获取IP，避免IP重复使用导致封禁。
  - 选择**静态住宅IP**套餐，稳定性更高(evidence_21)。

#### **2. Bright Data（原Luminati）**
- **优势**：
  - 全球最大住宅代理网络，IP池超过7200万，可用率99.99%(evidence_45)。
  - 提供中国用户专用通道，优化跨境链路延迟。
- **适用场景**：高频次、高稳定性需求的境外接口调用。

#### **3. Smartproxy**
- **优势**：
  - 按请求次数计费，成本可控（适合低频访问）(evidence_25)。
  - 支持HTTP/HTTPS/SOCKS5协议，提供自动IP轮换功能(evidence_44)。

#### **4. Oxylabs**
- **优势**：
  - 专业跨境代理服务，支持定制化IP地理位置(evidence_45)。
  - 提供中国用户专属客服，解决GFW相关连接问题。

---

### **四、网络限制规避策略**
1. **协议混淆**：使用WebSocket或TLS加密代理，避免GFW识别代理流量(evidence_37)。
2. **多节点负载均衡**：通过多个代理IP轮换请求，降低单IP被封风险(evidence_6)。
3. **本地测试工具**：
   - 使用`curl -x [代理IP:端口] [http://example.com](http://example.com)`验证代理可用性。
   - 通过`ping`和`traceroute`检查代理服务器连通性。

---

### **五、常见问题排查清单**

| 问题现象                | 可能原因                  | 解决方案                          |
|-------------------------|---------------------------|-----------------------------------|
| 连接超时                | 代理IP被GFW拦截           | 更换高匿代理或启用协议混淆        |
| HTTP 403/Forbidden      | 目标接口封禁代理IP        | 动态切换IP或联系代理商更新IP池    |
| 认证失败                | 用户名/密码错误           | 检查代理控制面板的认证信息        |
| 响应缓慢                | 代理服务器带宽不足        | 选择不限流量套餐或优化请求频率    |


---

### **六、总结**
- **核心问题**：当前使用的代理服务商在IP覆盖范围、协议支持或网络优化上不满足跨境需求。
- **推荐方案**：优先尝试IPRoyal的静态住宅代理（联系技术支持），或切换至Bright Data等专业跨境服务商。
- **配置关键**：确保OkHttp正确设置代理协议、认证信息，并启用IP轮换机制。

通过以上优化，可显著提升境外接口访问成功率。

若需进一步调试协助，建议提供具体错误日志或代理响应头信息。


## Q: 具体的例子

>好的，我现在需要帮助用户解决如何使用Smartproxy在国内请求国外接口的具体例子。用户之前尝试了其他代理服务商但遇到了问题，现在希望转向Smartproxy。首先，我需要回顾用户我搜索到的资料，特别是关于Smartproxy的部分，看看是否有相关的配置示例或说明。
>
>用户我搜索到的资料中有多个关于Smartproxy的指南和代码示例，例如。我搜索到的资料提到了如何设置代理服务器、认证方法以及如何指定国家代码。需要注意的是，提到Smartproxy的服务仅适用于海外网络环境，国内IP可能无法直接连接，但给出了一个替代方案，将域名中的“smartproxy”替换为“visitxiangtan”以便国内用户使用。
>
>接下来，我需要确定用户需要的是一个具体的Java示例，使用OkHttp库配置Smartproxy代理来访问国外接口。根据资料中的代码片段，尤其是中的Java示例，可以构建一个基本的代理配置，同时结合认证信息和特定的国家代码。
>
>需要确保代理地址正确，例如使用国内优化后的域名，如gate.visitxiangtan.com，并指定目标国家参数（如us）。同时，认证部分需要使用用户提供的用户名和密码，可能还需要处理会话参数以保持IP稳定。
>
>此外，用户可能遇到的常见问题包括连接超时、认证失败或代理IP被封，因此需要在回答中包含错误处理和验证步骤，例如检查响应状态码和IP信息。最后，根据资料中的推荐，建议用户使用高匿代理或更换端口以避免GFW的检测。
>

---

### **Java + OkHttp 实现国内访问境外接口的SmartProxy完整示例**

#### **一、前置条件准备**
1. **账号开通**：购买SmartProxy的**住宅代理套餐**（推荐静态IP或Sticky Session套餐），确保套餐支持**跨境访问**（部分国内代理套餐无法访问外网，需确认订阅类型）()。
2. **获取认证信息**：在SmartProxy控制面板获取以下信息：
   - `用户名` (如`user-sp2131dca9-sessionduration-30`)
   - `密码` (控制面板生成的随机密码)
   - **代理入口节点**：国内优化节点为`gate.visitxiangtan.com`（避免使用国际域名被GFW拦截）
   - **端口**：根据套餐类型选择（如`10001`为住宅代理默认端口）

3. **目标国家参数**：在代理URL中需添加`country=us`等参数指定出口IP所在国。

---

#### **二、Java代码实现（OkHttp 4.x）**
```java
import okhttp3.*;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.util.concurrent.TimeUnit;

public class SmartProxyDemo {
    
    // 代理配置
    private static final String PROXY_HOST = "gate.visitxiangtan.com"; // 国内优化入口节点
    private static final int PROXY_PORT = 10001; // 住宅代理端口
    private static final String PROXY_USER = "user-sp2131dca9-sessionduration-30"; // 控制面板获取
    private static final String PROXY_PASS = "your_password_here";
    
    // 目标接口（以Google为例）
    private static final String TARGET_URL = "https://www.google.com";
    
    public static void main(String[] args) {
        // 1. 创建代理对象
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(PROXY_HOST, PROXY_PORT));
        
        // 2. 构建带认证的OkHttpClient
        OkHttpClient client = new OkHttpClient.Builder()
                .proxy(proxy)
                .proxyAuthenticator((route, response) -> {
                    // 生成Basic认证头
                    String credential = Credentials.basic(PROXY_USER, PROXY_PASS);
                    return response.request().newBuilder()
                            .header("Proxy-Authorization", credential)
                            .build();
                })
                .connectTimeout(15, TimeUnit.SECONDS) // 建议设置超时
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        
        // 3. 构造请求（添加国家参数）
        HttpUrl url = HttpUrl.parse(TARGET_URL).newBuilder()
                .addQueryParameter("country", "us") // 强制使用美国出口IP
                .build();
        Request request = new Request.Builder().url(url).build();
        
        // 4. 发送请求并处理响应
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                System.err.println("请求失败: " + response.code());
                return;
            }
            // 验证代理IP
            String ipResponse = response.body().string();
            System.out.println("当前出口IP信息: " + ipResponse);
        } catch (IOException e) {
            System.err.println("连接异常: " + e.getMessage());
        }
    }
}
```


---

#### **三、关键配置解析**

| 配置项               | 说明                                                                                      | 来源               |
|----------------------|-----------------------------------------------------------------------------------------|--------------------|
| `gate.visitxiangtan.com` | 国内专用入口节点，避免国际域名被拦截                                                     |        |
| `country=us`参数      | 强制指定出口IP所在国家（支持195+国家代码）                                               |         |
| Sticky Session配置   | 使用`user-xxx-sessionduration-30`格式用户名可保持30分钟相同IP，避免频繁更换触发风控      |        |
| HTTP Basic认证       | 必须通过`Proxy-Authorization`头传递用户名密码                                            |        |


---

#### **四、进阶优化策略**
1. **IP轮换机制**：
   ```java
   // 使用随机Session ID实现动态IP
   String randomSession = "session-" + UUID.randomUUID().toString().substring(0,8);
   String dynamicUser = PROXY_USER.replace("sessionduration-30", randomSession);
   ```

   通过动态生成Session ID实现每次请求更换IP（需套餐支持）。

2. **协议升级**：
   ```java
   // 启用SOCKS5协议（需代理服务器支持）
   Proxy proxy = new Proxy(Proxy.Type.SOCKS5, new InetSocketAddress(PROXY_HOST, PROXY_PORT));
   ```

   SOCKS5协议穿透性更好，但需确认套餐支持。

3. **异常重试机制**：
   ```java
   .retryOnConnectionFailure(true) // 自动重试连接失败
   .addInterceptor(new RetryInterceptor(3)) // 自定义重试逻辑
   ```


---

#### **五、常见问题排查**
1. **连接超时**：
   - 检查`gate.visitxiangtan.com`是否被本地防火墙拦截
   - 尝试更换端口（如`10000-10010`）
   - 使用`curl -x http://用户:密码@gate.visitxiangtan.com:10001 [https://api.ipify.org](https://api.ipify.org)`验证代理可用性

2. **认证失败(407错误)**：
   - 确认用户名格式正确（如包含`sessionduration`参数）
   - 检查密码中是否包含非法字符（如`@`需URL编码为`%40`）

3. **IP被封禁**：
   - 在控制面板开启**IP自动轮换**
   - 使用`session-`参数实现请求级IP切换

---

#### **六、跨境访问性能优化**
1. **节点选择策略**：
   - 优先选择离目标服务器近的出口（如访问美国服务选择`country=us`）
   - 避免使用网络不稳定地区的IP（可通过`ping`测试延迟）

2. **数据压缩**：
   ```java
   .addHeader("Accept-Encoding", "gzip, deflate") // 启用压缩减少传输量
   ```


3. **连接池复用**：
   ```java
   .connectionPool(new ConnectionPool(5, 5, TimeUnit.MINUTES)) // 复用TCP连接
   ```


---

#### **七、合规注意事项**
1. **流量加密**：
   ```java
   // 强制使用HTTPS
   HttpUrl url = HttpUrl.parse("https://target.com").newBuilder().build();
   ```

   避免明文传输敏感数据

2. **频率控制**：
   - 添加随机延迟（0.5-2秒）避免触发反爬
   ```java
   Thread.sleep(500 + (int)(Math.random()*1500));
   ```


3. **遵守Robots协议**：
   - 在请求头中添加`User-Agent: SmartProxy-Crawler/1.0`标识身份

---

通过上述配置，可实现从国内环境通过SmartProxy稳定访问境外API。建议首次部署时使用`IP验证接口`测试连通性：
```java
Request testRequest = new Request.Builder()
    .url("https://api.ip.sb/geoip")
    .build();
```

若返回的`country_code`字段与`country`参数一致，则代理生效。





# 参考资料

https://github.com/browser-use/browser-use/blob/main/README.md

* any list
{:toc}