---
layout: post
title: 你连对外接口签名都不会知道？有时间还是要学习学习。
date:  2020-6-17 09:20:31 +0800
categories: [Tool]
tags: [java, open-source, github, tool, sh]
published: true
---

# 背景

周三，18:00。

小明扭了扭微微发酸的脖子，揉了揉盯着屏幕有些干涩的眼睛。

终于忙完了，临近下班，整个人心也变得放松起来。

“对接方需要我们提供新的服务，下周二上线，需求我发你了，很简单的。”

产品经理发过来一条消息，打破了这份美好。

![computer-1185626_1280.jpg](https://upload-images.jianshu.io/upload_images/5874675-da180915bc327eb6.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

“我可去他的吧，每次需求都是快下班就来了。”小明不免心里嘀咕了起来，不过手上可没停。

“好的，我先看下需求。”

回复完后，点开了需求文档，确实很简单。

```
为外部对接方提供一个新增商户的接口。

保持和内部控台新增商户一致。
```

确实不太难，小明想了想，内部控台新增商户虽然不是自己做的，但是接口应该可以直接复用，代码应该也能复用。

不过自己以前没做过外部对接，不知道有没有其他的坑。

下周二上线，那么下周一就需要让提测，让测试介入进来。

小明点开了日历，今天周三，自己接口文档编写，详细设计，编码和自测的时间只剩两天。

本来应该是充足的，不过平时还会有各种工作琐事需要处理，会降低整体的工作效率。

还是先问同事要下以前的代码和文档吧。

看着时间已经超过了下班时间，小明叹了一口气。

# 接口文档

## 文档编写

周四，9:30。

小明来到公司就开始着手处理接口文档的编写，有以前的文档基础，写起来还是很快的。

不过对外的接口还是有些不同，小明按照自己的理解加上了 traceId，requestTime 等字段，便于问题的排查和定位。

于是基本的接口就写好了：

请求参数：

| 序号 | 参数 | 描述 | 是否必填 | 说明 |
|:---|:---|:---|:---|:---|
| 1 | traceId | 唯一标识 |是 | 用于唯一定位一笔请求，32 位字符串 |
| 2 | requestTime | 请求参数 | 是 | 请求时间，yyyyMMddHHmmssSSS 17 位时间戳 |
| 3 | username | 用户名 | 是 | 最长 64 位字符串 |
| 4 | password | 密码 | 是 | 最长 128 位字符串, md5 加密 |
| 5 | address | 地址 | 否 | 最长 128 位字符串 |

响应参数：

| 序号 | 参数 | 描述 | 是否必填 | 说明 |
|:---|:---|:---|:---|:---|
| 1 | respCode | 响应编码 | 是 | 000000 表示成功，其他见响应编码枚举 |
| 2 | respDesc | 响应描述 | 是 | 请求时间，yyyyMMddHHmmssSSS 17 位时间戳 |
| 3 | userId | 用户标识 | 是 | 32 位字符串，成功创建后用户的唯一标识 |

小明详细的写下了整个接口的请求方式，注意事项，以及对应的各种枚举值等。

并且把基本的详细设计文档也整理了一下。

1762 个字，小明看了看总字数，苦涩的笑了笑。

这份文档，显然没有需求文档那么简洁。

一抬头，已经 11:30 了，好家伙，时间过得真快。

于是预订了下午 14:00 的会议室，准备和产品经理，测试，项目经理过一下文档。

## 文档评审

会议室 14:00。

小明按时来到会议室，提前插好投影仪，等着大家的到来。

“我昨天提的需求简单吧。”，未见其人先问其声，产品经理刚到门口就笑着走了进来。

“是的，还好。”

接着，项目经理和测试也一起走了进来。

“快点过需求文档吧”，项目经理说道。

小明清了清嗓子，讲了下整体的项目背景。并且把自己的详细设计和接口文档过了一遍。

过的时候，产品经理低头在做其他的事情，这些细节并不需要关心。

测试听的比较认真，不停的提出自己的疑问，后面需要自己进行验证。

“还有其他问题吗？”，小明自己一个人不停说了半个多小时，觉得有些枯燥。

“我没什么问题了”，测试说，“我最关心的就是什么时候可以提测？”

“下周一吧”，小明顿了顿，“我估计要会后才能开始编码。”

“那还好”，测试回道，并表示自己没有其他疑问。

“你这个文档写的挺详细的”，项目经理略带赞许的目光看了下小明，“不过有一个问题，你这个接口连签名都没有。”

“签名，什么签名？”，小明有点懵。

“你连对外接口签名都不会知道？有时间还是要学习学习。”，项目经理显然有些失望。

“好了，不说这些了。”，产品经理这时加入了谈话，“这么简单的需求下周二上没问题吧？”

“应该没问题，只要按时提测就行”，测试看向了小明。

“应该没问题”，小明脑子里还在想接口签名的事情，“我回去看下接口签名，调整下接口。”

# 接口签名

## 签名作用

小明去查了查，发现对外的接口，安全性肯定是需要考虑的。

为了保证数据的安全性，防止信息被篡改，签名是比较常见的一种方式。

![签名](https://img2018.cnblogs.com/blog/640632/201906/640632-20190620215259099-35639341.png)

## 签名实现

实现的方式有很多种，比较常用的方式：

（1）将所有参数，除去 checkValue 本身，按参数名字母升序排序。

（2）排序后的参数，按照参数和值的方式拼接为字符串

（3）对拼接完的字符串，使用双方约定好的 key 进行 md5 加密，得到 checkValue 值

（4）将对应的值设置到 checkValue 属性上

当然，在签名的实现上可能会有差异，但是双方保持一致即可。

## 签名校验

知道如何进行加签，校验也是类似的。

重复上面的 （1）（2）（3）步，得到对应的 checkValue。

然后和对方传递的值进行对比，如果一致，说明签名验证通过。

## 接口的调整

在了解了签名的必要性之后，小明在接口文档中新增了 checkValue 这个属性值。

并且和测试进行了私下的沟通，到这里，文档才算初步结束。

看着时间已经超过了下班时间，小明叹了一口气。

# 代码实现

## v1 版本

周五，10:00。

小明来到公司就开始进行编码，其他的东西处理的差不多之后，就剩下一个签名的实现问题。

一开始也没多想，直接实现如下：

```java
/**
 * 手动构建验签结果
 * @return 结果
 * @since 0.0.2
 */
public String buildCheckValue() {
    StringBuilder stringBuilder = new StringBuilder();
    stringBuilder.append(name);
    stringBuilder.append(password);
    // 其他一堆属性
    return Md5Util.md5(stringBuilder.toString());
}
```

当然，作为一个拿来主义者，小明意识到一个问题。

其他项目中肯定有类似的工具类，自己不应该重复造轮子。

## v2 版本

从其他应用拷贝了一份工具类过来，大概实现如下：

```java
import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.heaven.util.lang.reflect.ClassUtil;
import com.github.houbb.heaven.util.lang.reflect.ReflectFieldUtil;
import com.github.houbb.heaven.util.secrect.Md5Util;

import java.lang.reflect.Field;
import java.util.*;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class CheckValueUtils {

    private CheckValueUtils(){}

    public static String buildCheckValue(Object object) {
        Class<?> clazz = object.getClass();

        // 获取所有字段的 fieldMap
        Map<String, Field> fieldMap = ClassUtil.getAllFieldMap(clazz);

        // 移除 checkValue 名称的
        fieldMap.remove("checkValue");

        // 对字段按名称排序
        Set<String> fieldNameSet = fieldMap.keySet();
        List<String> fieldNameList = new ArrayList<>(fieldNameSet);
        Collections.sort(fieldNameList);

        // 反射获取所有字符串的值
        StringBuilder stringBuilder = new StringBuilder();
        for(String fieldName : fieldNameList) {
            Object value = ReflectFieldUtil.getValue(fieldName, object);
            // 反射获取值
            String valueStr = StringUtil.objectToString(value, "");

            // 拼接
            stringBuilder.append(fieldName).append("=").append(valueStr);
        }


        //md5 加签
        return Md5Util.md5(stringBuilder.toString());
    }
}
```

总的来说还是很好用的，而且自己的时间也不多，就直接拿来使用就好。

全部搞定之后，就是自测工作，经过了一次踩坑之后，小明算是把整个接口自测通过了。

“这样，提测时间也来得及了。”

看着时间已经超过了下班时间，小明叹了一口气。

![paper-3261159_960_720.jpg](https://upload-images.jianshu.io/upload_images/5874675-418c89cd943f6a58.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 更优雅的加签实现

一般来说，故事到这里就结束了。

不过小明的一个想法，让这个故事继续走了下去。

## 工具方法的不足

原有的方法基本可以满足大部分的需求，不过想要做调整就会变得比较麻烦。

比如，想某些非常大的字段不参加加签，加签字段的名字不叫 checkValue，而是改成 `sign`，调整一下字段排序的方式等等。

这些都会导致原有的工具方法不可用，需要重新复制，修改。

那能不能实现一个更加灵活的加签工具呢？

答案是肯定的，小明周末花了 2 天的时间，实现了一个加签工具。

## 快速开始

### maven 引入

```xml
<plugin>
    <groupId>com.github.houbb</groupId>
    <artifactId>checksum</artifactId>
    <version>0.0.6</version>
</plugin>
```

### pojo 对象

- User.java

```java
public class User {

    @CheckField
    private String name;

    private String password;

    @CheckField(required = false)
    private String address;

    @CheckValue
    private String checksum;

    //Getter & Setter
    //toString()
}
```

其中涉及到两个核心的注解：

`@CheckField` 表示参与加签的字段信息，默认都是参与加签的。指定 `required=false` 跳过加签。

`@CheckValue` 表示加签结果存放的字段，该字段类型需要为 String 类型。

后期将会添加一个 String 与不同类型的转换实现，拓展应用场景。

### 获取签名

所有的工具类方法见 `ChecksumHelper`，且下面的几个方法都支持指定秘钥。

```java
User user = User.buildUser();

final String checksum = ChecksumHelper.checkValue(user);
```

该方法会把 User 对象中指定 `@CheckField` 的字段全部进行处理，

通过指定排序后进行拼接，然后结合指定加密策略构建最后的验签结果。

### 填充签名

```java
User user = User.buildUser();

ChecksumHelper.fill(user);
```

可以把对应的 checkValue 值默认填充到 `@CheckValue` 指定的字段上。

### 验证签名

```java
User user = User.buildUser();

boolean isValid = ChecksumHelper.isValid(user);
```

会对当前的 user 对象进行加签运算，并且将加签的结果和 user 本身的签名进行对比。

# 引导类

## ChecksumBs 引导类

为了满足更加灵活的场景，我们引入了基于 fluent-api 的 ChecksumBs 引导类。

上面的配置默认等价于：

```java
final String checksum = ChecksumBs
        .newInstance()
        .target(user)
        .charset("UTF-8")
        .checkSum(new DefaultChecksum())
        .sort(Sorts.quick())
        .hash(Hashes.md5())
        .times(1)
        .salt(null)
        .checkFieldListCache(new CheckFieldListCache())
        .checkValueCache(new CheckValueCache())
        .checkValue();
```

## 配置说明

上面所有的配置都是可以灵活替换的，所有的实现都支持用户自定义。

| 属性 | 说明 |
|:--|:--|
| target | 待加签对象 |
| charset | 编码 |
| checkSum | 具体加签实现 |
| sort | 字段排序策略 |
| hash | 字符串加密 HASH 策略 |
| salt | 加密对应的盐值 |
| times | 加密的次数 |
| checkFieldListCache | 待加签字段的缓存实现 |
| checkValueCache | 签名字段的缓存实现 |

# 性能

## 背景

每次我们说到反射第一反应是方便，第二反应就是性能。

有时候往往因为关心性能，而选择手动一次次的复制，黏贴。

## 性能

详情见 [BenchmarkTest.java](https://github.com/houbb/checksum/blob/release_0.0.2/src/test/java/com/github/houbb/checksum/benchmark/BenchmarkTest.java)

![benchmark](https://github.com/houbb/checksum/blob/release_0.0.2/compare.png?raw=true)

本次进行 100w 次测试验证，耗时如下。

手动处理耗时：2505ms

注解处理耗时：2927ms

# 源码地址

当然，看到这里你如果还不尽兴，那么可以看一下源码。

上述源码已全部开源：

> [https://github.com/houbb/checksum](https://github.com/houbb/checksum)

# 小结

签名在对外接口的通讯中，可以保证信息不被篡改。

希望这个工具可以帮到你，让你按时下班。

我是老马，期待与你的下次重逢。

* any list
{:toc}