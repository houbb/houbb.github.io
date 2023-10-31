---
layout: post
title: logstash java 实现 hangout-02-hangout 流程原理
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# 架构浅谈

Hangout可以说是java版的Logstash，我是没有测试过性能，不过据说是kafka这边性能要高出Logstash5倍。

不知道真的假的，不过看代码，确实要比Logstash高效一点。

关于input,filter,output的关系

在Logstash里面，Input,filter,output是三个独立的部分，每个部分通过Buffer存储数据。

但是Hangout没有采用这种思想，每个Input是独立的input对象。

每个input对象又由decoder、filter、output组成。事件由Input搜集产生，然后经由filter进行过滤解析，再交给output输出。

这样的关系，在组织结构上，使得filter、output与Input的关系变成了被包含的关系。

# 关于buffer

Logstash中input,filter,output之间都有一个Buffer用于暂存数据。所有的input数据会暂存到buffer里面，等待filter解析，filter解析后数据又会放入filter和output之间的Buffer,等待output去flush到目的地。

在Hangout中，则是直接取消掉了buffer这一概念，使得事件由Input直接经过filter，直接交给output。

性能上肯定是更快速了一些；但是这样也存在问题，就是每个input的数据不是同一存放的，filter、output其实会在不同的input中初始化多次，这就意味着其实浪费了一些资源，很多资源被重复利用了。

# 代码学习

下面是今天抽空整理的hangout的类图，可以提供点基本的代码提示。

由于以前没怎么使用过反射，这次正好通过看代码学习了一下。

通过反射的方式，使得初始化这种模块化程度很高的代码，变得十分容易：

```java
Iterator<Entry<String, Map>> inputIT = input.entrySet().iterator();
while (inputIT.hasNext()) {
    Map.Entry<String, Map> inputEntry = inputIT.next();
    String inputType = inputEntry.getKey();
    Map inputConfig = inputEntry.getValue();

    Class<?> inputClass = Class.forName("com.ctrip.ops.sysdev.inputs." + inputType);
    Constructor<?> ctor = inputClass.getConstructor(Map.class,ArrayList.class, ArrayList.class);
    BaseInput inputInstance = (BaseInput) ctor.newInstance(inputConfig, configs.get("filters"), configs.get("outputs"));
    inputInstance.emit();
}
```

其中inputIT是获得input配置集合，通过反射的方式拿到class

```java
Class.forName("com.ctrip.ops.sysdev.inputs." + inputType);
```

设置它的构造方法，并初始化

```java
Constructor<?> ctor = inputClass.getConstructor(Map.class,ArrayList.class, ArrayList.class);

BaseInput inputInstance = (BaseInput) ctor.newInstance(inputConfig, configs.get("filters"), configs.get("outputs"));
```

最后使用emit方法，启动input输入

```java
inputInstance.emit();
```

# 类图

![类图](https://ask.qcloudimg.com/http-save/yehe-1154259/52bqxxfagi.png)

# 流程图

![流程图](https://ask.qcloudimg.com/http-save/yehe-1154259/70yvyhy94y.png)

# 参考资料

https://cloud.tencent.com/developer/article/1022163?areaId=106001

* any list
{:toc}