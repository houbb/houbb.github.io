---
layout: post
title: jmdns-01-JmDNS 是 Java 中多播 DNS 的实现 支持服务发现和服务注册，并且与 Apple 的 Bonjour 完全兼容。
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [web-server, dns, jmdns, sh]
published: true
---

# JmDNS 技术文档

此处展示了 JmDNS 库的一些基本信息和示例代码。

## JmDNS

JmDNS 是 Java 中多播 DNS 的实现。它支持服务发现和服务注册，并且与 Apple 的 Bonjour 完全兼容。

## 服务注册示例代码

```java
import java.io.IOException;
import java.net.InetAddress;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceInfo;

public class ExampleServiceRegistration {

    public static void main(String[] args) throws InterruptedException {

        try {
            // 创建一个 JmDNS 实例
            JmDNS jmdns = JmDNS.create(InetAddress.getLocalHost());

            // 注册一个服务
            ServiceInfo serviceInfo = ServiceInfo.create("_http._tcp.local.", "example", 1234, "path=index.html");
            jmdns.registerService(serviceInfo);

            // 等待片刻
            Thread.sleep(25000);

            // 注销所有服务
            jmdns.unregisterAllServices();

        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

## 服务发现示例代码

```java
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceListener;

public class ExampleServiceDiscovery {

    private static class SampleListener implements ServiceListener {
        @Override
        public void serviceAdded(ServiceEvent event) {
            System.out.println("添加服务: " + event.getInfo());
        }

        @Override
        public void serviceRemoved(ServiceEvent event) {
            System.out.println("移除服务: " + event.getInfo());
        }

        @Override
        public void serviceResolved(ServiceEvent event) {
            System.out.println("解析服务: " + event.getInfo());
        }
    }

    public static void main(String[] args) throws InterruptedException {
        try {
            // 创建一个 JmDNS 实例
            JmDNS jmdns = JmDNS.create(InetAddress.getLocalHost());

            // 添加一个服务监听器
            jmdns.addServiceListener("_http._tcp.local.", new SampleListener());

            // 等待片刻
            Thread.sleep(30000);
        } catch (UnknownHostException e) {
            System.out.println(e.getMessage());
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }
}
``` 

以上是 JmDNS 技术文档的翻译。

# 参考资料

https://github.com/jmdns/jmdns/blob/main/README.md

* any list
{:toc}



