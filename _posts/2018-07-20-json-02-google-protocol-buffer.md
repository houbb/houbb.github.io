---
layout: post
title:  Google Protocol Buffer
date:  2018-07-20 09:24:03 +0800
categories: [Tool]
tags: [tool, json, xml]
published: true
---

# Google Protocol Buffer

[Protocol Buffers](https://github.com/google/protobuf) are Google's language-neutral, platform-neutral, 
extensible mechanism for serializing structured data. 

## 优点

protobuf是google提供的一个开源序列化框架，类似于XML，JSON这样的数据表示语言，其最大的特点是基于二进制，因此比统的 XML表示高效短小得多。

虽然是二进制数据格式，但并没有因此变得复杂，可以很方便的对其基于二进制的协议进行扩展，且很方便的能让新版本的协议兼容老的版本。

如果说xml太臃肿，json易解析，比xml更高效，易扩展，那么protobuf可以说相对于json更高效，更易扩展，而且协议的保密性更强。

并且protobuf是跨语言的，可以支持c(c++),java，python等主流言，非常方便大系统的设计。

protobuf号称也有service，可以基于其service的接口和回调，来完成客户端和服务器的逻辑但是，目前版本service还仅仅停留在接口层，其底层的通讯，还需要自己实现，这点确实远不如thrift完备。

# 入门案例

## maven 引入

```xml

```

# 参考资料

[原理解密](http://blog.csdn.net/carson_ho/article/details/70568606)

http://bijian1013.iteye.com/blog/2232207

* any list
{:toc}

