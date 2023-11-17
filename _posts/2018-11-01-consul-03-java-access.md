---
layout: post
title: Consul-03-java 实现 consul 的增删改查入门例子
date:  2018-11-01 06:48:58 +0800
categories: [Distributed]
tags: [distributed, service-mesh, sh]
published: true
---


# 入门例子

## maven 引入

```xml
<dependencies>
    <!-- consul-client -->
    <dependency>
        <groupId>com.orbitz.consul</groupId>
        <artifactId>consul-client</artifactId>
        <version>0.10.0</version>
    </dependency>
    <!-- consul's dependency-->
    <dependency>
        <groupId>org.glassfish.jersey.core</groupId>
        <artifactId>jersey-client</artifactId>
        <version>2.22.2</version>
    </dependency>
</dependencies>
```

## 入门例子

```java
package org.example;

import com.google.common.base.Optional;
import com.google.common.net.HostAndPort;
import com.orbitz.consul.Consul;
import com.orbitz.consul.KeyValueClient;
import com.orbitz.consul.model.kv.Value;

public class ConsulExample {

    public static void main(String[] args) {
        // 指定Consul服务地址和端口
        String consulHost = "localhost";
        int consulPort = 8500;

        // 创建Consul客户端
        Consul consul = Consul.builder()
                .withHostAndPort(HostAndPort.fromParts(consulHost, consulPort))
                .build();

        // 进行其他操作...
        // 创建KeyValueClient
        KeyValueClient keyValueClient = consul.keyValueClient();

        // 执行增删改查操作
        putKeyValue(keyValueClient, "myKey", "myValue");
        getValue(keyValueClient, "myKey");
        deleteKey(keyValueClient, "myKey");
    }

    // 添加键值对
    private static void putKeyValue(KeyValueClient keyValueClient, String key, String value) {
        keyValueClient.putValue(key, value);
        System.out.println("Key-Value pair added: " + key + " = " + value);
    }

    // 获取键值对
    private static void getValue(KeyValueClient keyValueClient, String key) {
        Optional<Value> value = keyValueClient.getValue(key);
        if (value.isPresent()) {
            System.out.println("Value for key " + key + ": " + value.get().getValueAsString());
        } else {
            System.out.println("Key not found: " + key);
        }
    }

    // 删除键
    private static void deleteKey(KeyValueClient keyValueClient, String key) {
        keyValueClient.deleteKey(key);
        System.out.println("Key deleted: " + key);
    }

}
```

如果最后不执行删除，可以在 consul 控台上看到我们添加的元素。

测试日志：

```
Key-Value pair added: myKey = myValue
Value for key myKey: Optional.of(myValue)
Key deleted: myKey
```

# 参考资料

https://blog.csdn.net/u012129558/article/details/84029365

* any list
{:toc}