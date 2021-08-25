---
layout: post
title: 如果获取请求客户端的真实 IP？
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, maven, sh]
published: true
---

# 问题

如何获取客户端的真实 IP 呢？

用来限制 IP 的恶意访问等？

网关整体架构？

# 核心实现

IP取值顺序：

X-Client-IP ，X-Real-IP， X-Real-Ip， WL-Proxy-Client-IP，PROXY_CLIENT_IP， X_Forwarded_For，最后增加request.getRemoteAddr()     

# 属性说明

有这样的思路，再认识下各个请求头的意思：

## 1）X-Forwarded-For

这是一个 Squid 开发的字段，只有在通过了HTTP代理或者负载均衡服务器时才会添加该项。

格式为X-Forwarded-For:client1,proxy1,proxy2，一般情况下，第一个ip为客户端真实ip，后面的为经过的代理服务器ip。现在大部分的代理都会加上这个请求头

## 2）Proxy-Client-IP/WL- Proxy-Client-IP

这个一般是经过apache http服务器的请求才会有，用apache http做代理时一般会加上Proxy-Client-IP请求头，而WL-Proxy-Client-IP是他的weblogic插件加上的头。

## 3）HTTP_CLIENT_IP

有些代理服务器会加上此请求头

## 4）X-Real-IP

nginx代理一般会加上此请求头。

注意点：

这些请求头都不是http协议里的标准请求头，也就是说这个是各个代理服务器自己规定的表示客户端地址的请求头。

如果哪天有一个代理服务器软件用oooo-client-ip这个请求头代表客户端请求，那上面的代码就不行了。

这些请求头不是代理服务器一定会带上的，网络上的很多匿名代理就没有这些请求头，所以获取到的客户端ip不一定是真实的客户端ip。代理服务器一般都可以自定义请求头设置。

即使请求经过的代理都会按自己的规范附上代理请求头，上面的代码也不能确保获得的一定是客户端ip。不同的网络架构，判断请求头的顺序是不一样的。

最重要的一点，请求头都是可以伪造的。

如果一些对客户端校验较严格的应用（比如投票）要获取客户端ip，应该直接使用ip=request.getRemoteAddr()，虽然获取到的可能是代理的ip而不是客户端的ip，但这个获取到的ip基本上是不可能伪造的，也就杜绝了刷票的可能。(有分析说arp欺骗+syn有可能伪造此ip，如果真的可以，这是所有基于TCP协议都存在的漏洞)，这个ip是tcp连接里的ip。

X-Forwarded-For ：这是一个 Squid 开发的字段，只有在通过了HTTP代理或者负载均衡服务器时才会添加该项。

格式为X-Forwarded-For:client1,proxy1,proxy2，一般情况下，第一个ip为客户端真实ip，后面的为经过的代理服务器ip。现在大部分的代理都会加上这个请求头。

Proxy-Client-IP/WL- Proxy-Client-IP ：这个一般是经过apache http服务器的请求才会有，用apache http做代理时一般会加上Proxy-Client-IP请求头，而WL-Proxy-Client-IP是他的weblogic插件加上的头。
HTTP_CLIENT_IP ：有些代理服务器会加上此请求头。
X-Real-IP  ：nginx代理一般会加上此请求头

## remote_addr

remote_addr 指的是当前直接请求的客户端IP地址，它存在于tcp请求体中，是http协议传输时自动添加的，不受请求头header所控制。

所以，**当客户端与服务器间不存在任何代理时，通过remote_addr获取客户端IP地址是最准确的，也是最安全的。**

x-forwarded-for简称XFF，它其实和http协议本身并没什么关系，是很多代理服务器在请求转发时添加上去的。

如果客户端和服务器之间存在代理服务器，那么直接通过remote_addr获取的IP就是代理服务器的地址，并不是客户端真实的IP地址。

因此，需要代理服务器（通常是反向代理服务器）将真实客户端的IP地址转发给服务器，转发时客户端的真实IP地址通常就存在于x-forwarded-for请求头中。

client-ip同x-forwarded-for，也是代理服务器添加的用于转发客户端请求的真实IP地址，同样保存于请求头中。

# 如何获取呢？

通过什么参数来获取客户端请求地址是由实际的应用场景决定的：

当客户端与服务器之间不存在代理服务器（尤其指服务端反向代理服务器）时，直接通过remote_addr获取客户端请求IP地址。

当服务器间存在反向代理服务器时，需要在反向代理服务器中转发客户端真实请求IP地址，可以设置x-forwarded-for、client-ip，也可以自定义请求头名称，然后在服务端代码中获取请求头中的该值。

需要注意的是，此时必须保证服务器不会绕过代理服务器直接对外提供服务，否则存在IP伪造的风险（客户端伪造设置请求头）。

# 实现例子

## java 实现

```java
public final class IpUtil {

    private IpUtil(){}

    /**
     * 获取所有的 IP 信息
     * @param request 入参
     * @return 结果
     * @since 0.0.3
     */
    public static IpInfo getAllIpInfo(HttpServletRequest request) {
        IpInfo ipInfo = new IpInfo();
        ipInfo.setxClientIp(request.getHeader("X-Client-IP"));
        ipInfo.setxRealIP(request.getHeader("X-Real-IP"));
        ipInfo.setxRealIp(request.getHeader("X-Real-Ip"));
        ipInfo.setWlProxyClientIP(request.getHeader("WL-Proxy-Client-IP"));
        ipInfo.setProxyClientIp(request.getHeader("PROXY_CLIENT_IP"));
        ipInfo.setxForwardedFor(request.getHeader("X_Forwarded_For"));
        ipInfo.setRemoveAddress(request.getRemoteAddr());
        return ipInfo;
    }

    /**
     * 获取 ip 信息
     * @param request 请求
     * @return 结果
     * @since 1.0.0
     */
    private String getIp(HttpServletRequest request) {
        List<String> keyList = Arrays.asList(
                "X-Client-IP",
                "X-Real-IP",
                "X-Real-Ip",
                "WL-Proxy-Client-IP",
                "PROXY_CLIENT_IP",
                "X_Forwarded_For"
        );

        for(String key : keyList) {
            String ip = request.getHeader(key);
            if(StringUtil.isNotEmptyTrim(ip)) {
                return ip;
            }
        }

        // 结果可能为包含 , 好的多个
        return request.getRemoteAddr();
    }

    /**
     * 获取 ip 信息
     * @param request 请求
     * @return 结果
     * @since 1.0.0
     */
    private String getSingleIp(HttpServletRequest request) {
        String ip = getIp(request);

        if(ip.contains(",")) {
            return ip.split(",")[0];
        }

        return ip;
    }

}
```

# 参考资料

[服务端如何安全获取客户端请求IP地址](https://www.cnblogs.com/hanganglin/p/6648075.html)

[Java-Web获取客户端真实IP](https://www.huaweicloud.com/articles/935a4a0bfca04e028912eac2fb355e3a.html)

* any list
{:toc}