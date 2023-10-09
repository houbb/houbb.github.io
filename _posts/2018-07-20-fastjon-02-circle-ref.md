---
layout: post
title:  FastJSON-02-循环依赖  JSONSerializer.containerReference 与 SerializerFeature.DisableCircularReferenceDetect
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, overview, sf]
published: true
---

# fastjson把对象转化成json避免$ref

## 重复对象

当进行toJSONString的时候，默认如果重用对象的话，会使用引用的方式进行引用对象。

引用是通过"$ref"来表示

| 引用	描述 |
|:---|:---|
| "$ref":".."	| 上一级 |
| "$ref":"@"	| 当前对象，也就是自引用 |
| "$ref":"$"	| 根对象 |
| "$ref":"$.children.0" | 	 基于路径的引用，相当于 root.getChildren().get(0) |
| {"$ref":"../.."}	|  引用父对象的父对象 | 

重复引用: 指一个对象重复出现多次

## 循环引用

指你心里有我，我心里有你(互相引用)，这个问题比较严重，如果处理不好就会出现StackOverflowError异常

注意：这个时候不要禁用循环引用，或者会出现问题。

## 举例说明

重复引用

```java
List<Object> list = new ArrayList<>();  
Object obj = new Object();  
list.add(obj);  
list.add(obj);  
```

循环引用

```java
// 循环引用的特殊情况，自引用  
Map<String,Object> map = new HashMap<>();  
map.put("map",map);  
//  
// map1引用了map2，而map2又引用map1，导致循环引用  
Map<String,Object> map1 = new HashMap<>();  
Map<String,Object> map2 = new HashMap<>();  
map1.put("map",map2);  
map2.put("map",map1);  
```

简单说，重复引用就是一个集合/对象中的多个元素/属性同时引用同一对象，循环引用就是集合/对象中的多个元素/属性存在相互引用导致循环。 

## 循环引用会触发的问题

暂时不说重复引用，单说循环引用。

一般来说，存在循环引用问题的集合/对象在序列化时（比如Json化），如果不加以处理，会触发StackOverflowError异常。

分析原因：当序列化引擎解析map1时，它发现这个对象持有一个map2的引用，转而去解析map2。解析map2时，发现他又持有map1的引用，又转回map1。如此产生StackOverflowError异常。

FastJson对重复/循环引用的处理

首先，fastjson作为一款序列化引擎，不可避免的会遇到循环引用的问题，为了避免StackOverflowError异常，fastjson会对引用进行检测。

**如果检测到存在重复/循环引用的情况，fastjson默认会以“引用标识”代替同一对象，而非继续循环解析导致StackOverflowError**。

以下文两例说明,查看json化后的输出

### 1. 重复引用 JSON.toJSONString(list)

```js
[  
    {},  //obj的实体  
    {  
        "$ref": "$[0]"   //对obj的重复引用的处理  
    }  
]  
```

### 2. 循环引用 JSON.toJSONString(map1)

```js
{  
// map1的key:value对  
    "map": {  
         // map2的key:value对  
        "map": {  
             // 指向map1，对循环引用的处理  
            "$ref": ".."  
        }  
    }  
}  
```

## 重复引用的解决方法

1.单个关闭 `JSON.toJSONString(object, SerializerFeature.DisableCircularReferenceDetect);`

2.全局配置关闭 `JSON.DEFAULT_GENERATE_FEATURE |= SerializerFeature.DisableCircularReferenceDetect.getMask();`

FastJson提供了SerializerFeature.DisableCircularReferenceDetect这个序列化选项，用来关闭引用检测。

**关闭引用检测后，重复引用对象时就不会被$ref代替，但是在循环引用时也会导致StackOverflowError异常。** 

避免重复引用序列化时显示$ref

- 在编码时，使用新对象为集合或对象赋值，而非使用同一对象

- 不要在多处引用同一个对象，这可以说是一种java编码规范，需要时刻注意。

- 不要关闭FastJson的引用检测来避免显示$ref

- 引用检测是FastJson提供的一种避免运行时异常的优良机制，如果为了避免在重复引用时显示$ref而关闭它，会有很大可能导致循环引用时发生StackOverflowError异常。这也是FastJson默认开启引用检
测的原因。

## 循环引用的解决方法：

1) 如果你前端用不到这个属性在该属性的get方法上加上注解@JSONField(serialize=false),

这样该属性就不会被序列化出来，这个也可以解决重复引用

2) 修改表结构，出现循环引用了就是一个很失败的结构了，不然准备迎接StackOverflowError异常。


# 参考资料

## Q1: fastjson 中的 JSONSerializer.containerReference 作用？

在 FastJSON（com.alibaba.fastjson.JSON）中，`JSONSerializer` 类是用于将 Java 对象序列化为 JSON 字符串的核心类。

`containerReference` 是 `JSONSerializer` 的一个属性，它的作用是用于存储 JSON 序列化过程中的上下文信息，主要用于处理循环引用的情况。

当 Java 对象中存在循环引用（例如，对象A引用了对象B，而对象B又引用了对象A），在进行 JSON 序列化时，如果不做处理，就会导致无限递归，最终导致栈溢出或死循环。为了避免这种情况，FastJSON 使用 `containerReference` 属性来跟踪已经序列化的对象，当发现循环引用时，它会使用引用来代替实际的对象，从而避免无限递归的问题。

具体来说，`containerReference` 是一个 `SerialContext` 类型的属性，`SerialContext` 类用于表示对象在 JSON 序列化过程中的上下文信息，包括对象引用、属性名等信息。通过 `containerReference`，FastJSON 能够在序列化过程中检测到循环引用，避免无限递归，确保序列化过程的正常进行。

在使用 FastJSON 进行 JSON 序列化时，通常不需要直接操作 `containerReference` 属性，FastJSON 会在内部处理循环引用的情况，确保序列化结果的正确性。

## Q2: 如何避免这个属性的调用？发现比较耗时

如果你发现 `JSONSerializer` 中的 `containerReference` 属性调用比较耗时，有几种方法可以尝试避免或优化：

### 1. 使用FastJSON的版本：

确保你使用的是 FastJSON 的最新版本，因为开发者通常会在新版本中改进性能和修复性能问题。

### 2. 避免循环引用：

在你的数据模型中，尽量避免设计循环引用的结构。循环引用可能导致 JSON 序列化时的性能问题，并且也可能在其他地方引发意外的行为。如果可能的话，考虑重新设计数据模型以避免循环引用。

### 3. 使用@JSONField注解：

在 FastJSON 中，你可以使用 `@JSONField` 注解来指定字段的序列化和反序列化行为。通过 `serialzeFeatures` 参数，你可以配置 FastJSON 在序列化时跳过循环引用的检测。例如：

```java
public class YourClass {
    @JSONField(serialzeFeatures = SerializerFeature.DisableCircularReferenceDetect)
    private YourOtherClass reference;
    // other fields and methods
}
```

在这个例子中，`DisableCircularReferenceDetect` 参数告诉 FastJSON 不要进行循环引用的检测，这可能会提高性能。请注意，这种做法适用于你确定没有循环引用的情况下。

### 4. 自定义序列化：

如果你有特殊的需求，可以考虑自定义序列化器。实现 `ObjectSerializer` 接口并覆盖 `write` 方法，以自定义对象的序列化逻辑。这样你可以完全控制序列化过程，避免 FastJSON 内部的循环引用检测逻辑。自定义序列化器的性能可能会更高，因为你可以针对特定的需求进行优化。

```java
public class CustomObjectSerializer implements ObjectSerializer {
    @Override
    public void write(JSONSerializer serializer, Object object, Object fieldName, Type fieldType, int features) throws IOException {
        // 自定义对象的序列化逻辑
        // ...
    }
}
```

然后，在需要使用自定义序列化器的地方，使用 `@JSONField` 注解指定自定义的序列化器：

```java
public class YourClass {
    @JSONField(serializeUsing = CustomObjectSerializer.class)
    private YourOtherClass reference;
    // other fields and methods
}
```

请根据你的具体需求选择合适的方法。如果你确定没有循环引用，使用 `DisableCircularReferenceDetect` 参数可能是一个简单而有效的解决方案。

如果你需要更多的控制权，可以考虑自定义序列化器。

# 参考资料

https://www.cnblogs.com/candlia/p/11919878.html


* any list
{:toc}