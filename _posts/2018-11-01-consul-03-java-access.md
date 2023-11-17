---
layout: post
title: Consul-03-java 实现 consul 的增删改查入门例子
date:  2018-11-01 06:48:58 +0800
categories: [Distributed]
tags: [distributed, service-mesh, sh]
published: true
---


# orbitz.consul 入门例子

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

# Ecwid/consul-api

## 说明 

尝试了一下 github，这个应该作为入门的例子。

## maven 引入

```xml
<dependency>
  <groupId>com.ecwid.consul</groupId>
  <artifactId>consul-api</artifactId>
  <version>1.4.5</version>
</dependency>
```

## 例子

```java
package org.example;

import com.ecwid.consul.v1.ConsulClient;
import com.ecwid.consul.v1.QueryParams;
import com.ecwid.consul.v1.Response;
import com.ecwid.consul.v1.agent.model.NewService;
import com.ecwid.consul.v1.health.HealthServicesRequest;
import com.ecwid.consul.v1.health.model.HealthService;
import com.ecwid.consul.v1.kv.model.GetValue;

import java.util.Arrays;
import java.util.List;

public class EcwidDemo {

    public static void main(String[] args) {
        ConsulClient client = new ConsulClient("localhost", 8500);

        // set KV
        byte[] binaryData = new byte[] {1,2,3,4,5,6,7};
        client.setKVBinaryValue("someKey", binaryData);

        client.setKVValue("com.my.app.foo", "foo");
        client.setKVValue("com.my.app.bar", "bar");
        client.setKVValue("com.your.app.foo", "hello");
        client.setKVValue("com.your.app.bar", "world");

        // get single KV for key
        Response<GetValue> keyValueResponse = client.getKVValue("com.my.app.foo");
        System.out.println(keyValueResponse.getValue().getKey() + ": " + keyValueResponse.getValue().getDecodedValue()); // prints "com.my.app.foo: foo"

        // get list of KVs for key prefix (recursive)
        Response<List<GetValue>> keyValuesResponse = client.getKVValues("com.my");
        keyValuesResponse.getValue().forEach(value -> System.out.println(value.getKey() + ": " + value.getDecodedValue())); // prints "com.my.app.foo: foo" and "com.my.app.bar: bar"

        //list known datacenters
        Response<List<String>> response = client.getCatalogDatacenters();
        System.out.println("Datacenters: " + response.getValue());

        // register new service
        NewService newService = new NewService();
        newService.setId("myapp_01");
        newService.setName("myapp");
        newService.setTags(Arrays.asList("EU-West", "EU-East"));
        newService.setPort(8080);
        client.agentServiceRegister(newService);

// register new service with associated health check
//        NewService newService2 = new NewService();
//        newService2.setId("myapp_02");
//        newService2.setTags(Collections.singletonList("EU-East"));
//        newService2.setName("myapp");
//        newService2.setPort(8080);
//
//        NewService.Check serviceCheck = new NewService.Check();
//        serviceCheck.setScript("/usr/bin/some-check-script");
//        serviceCheck.setInterval("10s");
//        newService2.setCheck(serviceCheck);
//        client.agentServiceRegister(newService2);

// query for healthy services based on name (returns myapp_01 and myapp_02 if healthy)
        HealthServicesRequest request = HealthServicesRequest.newBuilder()
                .setPassing(true)
                .setQueryParams(QueryParams.DEFAULT)
                .build();
        Response<List<HealthService>> healthyServices = client.getHealthServices("myapp", request);

// query for healthy services based on name and tag (returns myapp_01 if healthy)
        HealthServicesRequest request2 = HealthServicesRequest.newBuilder()
                .setTag("EU-West")
                .setPassing(true)
                .setQueryParams(QueryParams.DEFAULT)
                .build();
        Response<List<HealthService>> healthyServices2 = client.getHealthServices("myapp", request2);
    }

}
```

对应的日志：

```
com.my.app.foo: foo
com.my.app.bar: bar
com.my.app.foo: foo
Datacenters: [dc1]
```

# 参考资料

https://blog.csdn.net/u012129558/article/details/84029365

* any list
{:toc}