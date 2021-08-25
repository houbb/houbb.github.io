---
layout: post
title: 服务受到网络攻击时，如何获取请求客户端的真实 IP？
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, maven, sh]
published: true
---

# 网络攻击

前不久公司遭受了一次网络攻击。

早晨刚到公司，就发现登录接口的调用次数飙升，很快就确认是被恶意攻击，让安全部门做网关入口针对对方 IP 加了限制。

并统一对所有的 IP 加了调用的频率限制。

![恶意攻击](https://images.gitee.com/uploads/images/2021/0825/205014_a815a0f7_508704.jpeg "网络攻击.jpg")

## 登录

基本每一家公司都会有登录接口，然而无论大小，多少都会存在一些问题。

最核心的准则这里稍微提一下，以后有机会展开：

（1）密码一定要加密存储（而且不能是简单的 MD5），日志一定要脱敏。

（2）登录接口一定要添加验证码，防止接口被恶意调用

（3）禁止用户使用弱口令，弱口令字典可自行 github

（4）异地登录等要求用户进行二次验证

当然，个人认为最好的方式还是限制调用的次数和频率。

比如银行的密码错误 3 次，直接冻结 24H 之类的。

## 限流

限流功能，建议统一做在网关这一层，没有必要每个业务应用都去实现。

网关和限流的框架以前写过，感兴趣的话以后可以重点讲一下。

# 获取 IP

本来被攻击也是家常便饭，时间一久，也就淡忘了。

不过同事最近接了一个需求，其中涉及到获取 HTTP 请求客户端的真实 IP。

机智的小伙伴们，能说出你平时获取 IP 的方法吗？百度也行。

## 复制黏贴

同事接到这个需求，感觉也不难。

巧的是以前应用里就有获取 IP 的代码，更巧的查了一下，发现获取的不对。

于是就去百度了一下，复制黏贴，三下五除二上线了。

比如：

```java
public static String getIp(final HttpServletRequest req) {
    String ip = req.getHeader("X-Forwarded-For");
    if (StringUtil.isEmpty(ip)) {
        ip = req.getHeader("Proxy-Client-IP");
    }
    if (StringUtil.isEmpty(ip)) {
        ip = req.getHeader("WL-Proxy-Client-IP");
    }
    if (StringUtil.isEmpty(ip)) {
        ip = req.getRemoteAddr();
    }
    return ip;
}
```

稍微靠谱点的：

```java
public class IPUtils {

    public static String getClientAddress(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Forwarded-For");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }

        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip.equals("0:0:0:0:0:0:0:1") ? "127.0.0.1" : ip;
    }

}
```

第二天发现，获取的 IP 地址还是不对，白忙活一场，还要重新上线。

## 应该如何获取 IP 呢？

其实获取客户端的真实 IP，首先和我们的应用架构是紧密相关的。

我们先看一下网上最常见的解释：

网络架构主要分为两种情况：

（1）客户端未经过代理，直接访问服务器端(nginx,squid,haproxy)；

（2）客户端通过多级代理，最终到达服务器端(nginx,squid,haproxy)；

![架构](https://images.gitee.com/uploads/images/2021/0825/201849_b7784bed_508704.png "未命名绘图.png")

客户端请求信息都包含在HttpServletRequest中，可以通过方法 `getRemoteAddr()` 获得该客户端IP。

方式一形式，可以直接获得该客户端真实IP。

方式二中通过代理的形式，此时经过多级反向的代理，通过方法 getRemoteAddr() 得不到客户端真实IP，可以通过 x-forwarded-for 等获得转发后请求信息。

当客户端请求被转发，IP将会追加在其后并以逗号隔开，例如：10.47.103.13,4.2.2.2,10.96.112.230。

## 属性

这些都是个啥？

![输入图片说明](https://images.gitee.com/uploads/images/2021/0825/205303_74446884_508704.jpeg "写的是啥.jpg")

第一次看感觉还是有点蒙，于是去简单整理，便于以后查阅。

### X-Forwarded-For

这是一个 Squid 开发的字段，只有在通过了HTTP代理或者负载均衡服务器时才会添加该项。

格式为 `X-Forwarded-For:client1,proxy1,proxy2`，一般情况下，第一个ip为客户端真实ip，后面的为经过的代理服务器ip。

现在大部分的代理都会加上这个请求头。

### Proxy-Client-IP/WL-Proxy-Client-IP

这个一般是经过 apache http 服务器的请求才会有，用apache http做代理时一般会加上Proxy-Client-IP请求头，而WL-Proxy-Client-IP是他的weblogic插件加上的头。

### HTTP_CLIENT_IP

有些代理服务器会加上此请求头

### X-Real-IP

nginx代理一般会加上此请求头。

### remote_addr

remote_addr 指的是当前直接请求的客户端IP地址，它存在于tcp请求体中，是http协议传输时自动添加的，不受请求头header所控制。

所以，**当客户端与服务器间不存在任何代理时，通过remote_addr获取客户端IP地址是最准确的，也是最安全的。**

## 注意

这些请求头都不是http协议里的标准请求头，也就是说这个是各个代理服务器自己规定的表示客户端地址的请求头。

即使请求经过的代理都会按自己的规范附上代理请求头，上面的属性也不能确保获得的一定是客户端ip。

最重要的一点，**请求头都是可以伪造的**。

说了这么多，感觉这里面水太深了，建议最好还是选择放弃深究，让我们直接上代码。

![水很深](https://images.gitee.com/uploads/images/2021/0825/205503_484fcb88_508704.jpeg "水很深.jpg")

# java 实现

老马把上面的实现做了简单的整理，java 初步实现如下：

```java
import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.web.core.dto.IpInfo;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;

/**
 * IP 工具类
 *
 * @author 老马啸西风
 * @since 1.0.0
 */
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
        ipInfo.setClientIp(request.getHeader("X-Client-IP"));
        ipInfo.setRealIP(request.getHeader("X-Real-IP"));
        ipInfo.setWlProxyClientIP(request.getHeader("WL-Proxy-Client-IP"));
        ipInfo.setProxyClientIp(request.getHeader("Proxy-Client-IP"));
        ipInfo.setForwardedFor(request.getHeader("X-Forwarded-For"));
        ipInfo.setRemoteAddress(request.getRemoteAddr());
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
                "WL-Proxy-Client-IP",
                "Proxy-Client-IP",
                "X-Forwarded-For"
        );

        for(String key : keyList) {
            String ip = request.getHeader(key);
            // 是合法的 IP，直接返回
            if(StringUtil.isNotEmptyTrim(ip)
                && !"unknown".equalsIgnoreCase(ip)) {
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

# 小结

获取客户端真实 IP 是一个很基础的方法，但是也是很重要的一个方法。

看起来不起眼的一个方法，写的不好，可能整个公司的安全就是一张纸。

网上的资料参差不齐，使用时注意甄别。

包括本篇，毕竟老马对网络安全也是一点不懂。

我是老马，期待与你的下次重逢。


# 拓展阅读

[根据Request获取客户端IP](https://www.cnblogs.com/lukelook/p/11079372.html)

[利用X-Forwarded-For伪造客户端IP漏洞成因及防范](https://blog.csdn.net/xiao__gui/article/details/83054462)

# 参考资料

[服务端如何安全获取客户端请求IP地址](https://www.cnblogs.com/hanganglin/p/6648075.html)

[Java-Web获取客户端真实IP](https://www.huaweicloud.com/articles/935a4a0bfca04e028912eac2fb355e3a.html)

* any list
{:toc}