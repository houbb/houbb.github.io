---
layout: post
title: Log4j2-30-sensitive 日志脱敏框架，支持注解和日志插件模式 
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, best-practise, log4j2]
published: true
---

# 项目介绍

日志脱敏是常见的安全需求。普通的基于工具类方法的方式，对代码的入侵性太强，编写起来又特别麻烦。

[sensitive](https://github.com/houbb/sensitive) 项目提供基于注解的方式，并且内置了常见的脱敏方式，便于开发。

支持 logback 和 log4j2 等常见的日志脱敏插件。

**日志插件解决正则匹配长文本可能出现的回溯问题，性能远超正则**。

## 日志脱敏

为了金融交易的安全性，国家强制规定对于以下信息是要日志脱敏的：

1. 用户名

2. 手机号

3. 邮箱

4. 银行卡号

5. 密码

6. 身份证号

## 持久化加密

存储的时候上面的信息都需要加密，密码为不可逆加密，其他为可逆加密。

类似的功能有很多。不在本系统的解决范围内。

# 特性

1. 基于注解的日志脱敏。

2. 可以自定义策略实现，策略生效条件。

3. 内置常见的十几种脱敏内置方案。

4. java 深拷贝，且原始对象不用实现任何接口。

[5. 支持用户自定义注解。](https://github.com/houbb/sensitive#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B3%A8%E8%A7%A3)

[6. 支持基于 FastJSON 直接生成脱敏后的 json](https://github.com/houbb/sensitive#%E7%94%9F%E6%88%90%E8%84%B1%E6%95%8F%E5%90%8E%E7%9A%84-json)

[7. 支持自定义哈希策略，更加方便定位日志问题](https://github.com/houbb/sensitive#%E9%85%8D%E7%BD%AE%E5%93%88%E5%B8%8C%E7%AD%96%E7%95%A5)

[8. 支持基于 log4j2 的统一脱敏策略](https://github.com/houbb/sensitive#log4j2-%E6%8F%92%E4%BB%B6%E7%BB%9F%E4%B8%80%E8%84%B1%E6%95%8F)

[9. 支持基于 logback 的统一脱敏策略](https://github.com/houbb/sensitive#logback-%E8%84%B1%E6%95%8F%E6%8F%92%E4%BB%B6)

## 变更日志

> [变更日志](https://github.com/houbb/sensitive/blob/master/CHANGE_LOG.md)

### v-1.6.0 新特性

- 添加 logback 脱敏插件

## 拓展阅读

[金融用户敏感数据如何优雅地实现脱敏？](https://mp.weixin.qq.com/s/ljChFiNLzV6GLaUDjehA0Q)

[日志脱敏之后，无法根据信息快速定位怎么办？](https://mp.weixin.qq.com/s/tZqOH_8QTKrD1oaclNoewg)

# 快速开始

## 环境准备

JDK 1.8+

Maven 3.x

## maven 导入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-core</artifactId>
    <version>1.7.0</version>
</dependency>
```

## 核心 api 简介

`SensitiveUtil` 工具类的核心方法列表如下：

| 序号 | 方法 | 参数 | 结果 | 说明 |
|:---|:---|:---|:---|:---|
| 1 | desCopy() | 目标对象 | 深度拷贝脱敏对象 | 适应性更强 |
| 2 | desJson() | 目标对象 | 脱敏对象 json | 性能较好 |
| 3 | desCopyCollection() | 目标对象集合 | 深度拷贝脱敏对象集合 | |
| 4 | desJsonCollection() | 目标对象集合 | 脱敏对象 json 集合 | |

## 定义对象

- UserAnnotationBean.java

通过注解，指定每一个字段的脱敏策略。

```java
public class UserAnnotationBean {

    @SensitiveStrategyChineseName
    private String username;

    @SensitiveStrategyPassword
    private String password;

    @SensitiveStrategyPassport
    private String passport;

    @SensitiveStrategyIdNo
    private String idNo;

    @SensitiveStrategyCardId
    private String bandCardId;

    @SensitiveStrategyPhone
    private String phone;

    @SensitiveStrategyEmail
    private String email;

    @SensitiveStrategyAddress
    private String address;

    @SensitiveStrategyBirthday
    private String birthday;

    @SensitiveStrategyGps
    private String gps;

    @SensitiveStrategyIp
    private String ip;

    @SensitiveStrategyMaskAll
    private String maskAll;

    @SensitiveStrategyMaskHalf
    private String maskHalf;

    @SensitiveStrategyMaskRange
    private String maskRange;

    //Getter & Setter
    //toString()
}
```

- 数据准备

构建一个最简单的测试对象：

```java
UserAnnotationBean bean  = new UserAnnotationBean();
bean.setUsername("张三");
bean.setPassword("123456");
bean.setPassport("CN1234567");
bean.setPhone("13066668888");
bean.setAddress("中国上海市浦东新区外滩18号");
bean.setEmail("whatanice@code.com");
bean.setBirthday("20220831");
bean.setGps("66.888888");
bean.setIp("127.0.0.1");
bean.setMaskAll("可恶啊我会被全部掩盖");
bean.setMaskHalf("还好我只会被掩盖一半");
bean.setMaskRange("我比较灵活指定掩盖范围");
bean.setBandCardId("666123456789066");
bean.setIdNo("360123202306018888");
```

- 测试代码

```
final String originalStr = "UserAnnotationBean{username='张三', password='123456', passport='CN1234567', idNo='360123202306018888', bandCardId='666123456789066', phone='13066668888', email='whatanice@code.com', address='中国上海市浦东新区外滩18号', birthday='20220831', gps='66.888888', ip='127.0.0.1', maskAll='可恶啊我会被全部掩盖', maskHalf='还好我只会被掩盖一半', maskRange='我比较灵活指定掩盖范围'}";
final String sensitiveStr = "UserAnnotationBean{username='张*', password='null', passport='CN*****67', idNo='3****************8', bandCardId='666123*******66', phone='1306****888', email='wh************.com', address='中国上海********8号', birthday='20*****1', gps='66*****88', ip='127***0.1', maskAll='**********', maskHalf='还好我只会*****', maskRange='我*********围'}";
final String expectSensitiveJson = "{\"address\":\"中国上海********8号\",\"bandCardId\":\"666123*******66\",\"birthday\":\"20*****1\",\"email\":\"wh************.com\",\"gps\":\"66*****88\",\"idNo\":\"3****************8\",\"ip\":\"127***0.1\",\"maskAll\":\"**********\",\"maskHalf\":\"还好我只会*****\",\"maskRange\":\"我*********围\",\"passport\":\"CN*****67\",\"phone\":\"1306****888\",\"username\":\"张*\"}";

UserAnnotationBean sensitiveUser = SensitiveUtil.desCopy(bean);
Assert.assertEquals(sensitiveStr, sensitiveUser.toString());
Assert.assertEquals(originalStr, bean.toString());

String sensitiveJson = SensitiveUtil.desJson(bean);
Assert.assertEquals(expectSensitiveJson, sensitiveJson);
```

我们可以直接利用 `sensitiveUser` 去打印日志信息，而这个对象对于代码其他流程不影响，我们依然可以使用原来的 `user` 对象。

当然，也可以使用 `sensitiveJson` 打印日志信息。

# @Sensitive 注解

## 说明

`@SensitiveStrategyChineseName` 这种注解是为了便于用户使用，本质上等价于 `@Sensitive(strategy = StrategyChineseName.class)`。

`@Sensitive` 注解可以指定对应的脱敏策略。

## 内置注解与映射

| 编号 | 注解                              | 等价 @Sensitive                                      | 备注       |
|:---|:--------------------------------|:---------------------------------------------------|:---------|
| 1  | `@SensitiveStrategyChineseName` | `@Sensitive(strategy = StrategyChineseName.class)` | 中文名称脱敏   |
| 2  | `@SensitiveStrategyPassword`    | `@Sensitive(strategy = StrategyPassword.class)`    | 密码脱敏     |
| 3  | `@SensitiveStrategyEmail`       | `@Sensitive(strategy = StrategyEmail.class)`       | email 脱敏 |
| 4  | `@SensitiveStrategyCardId`      | `@Sensitive(strategy = StrategyCardId.class)`      | 卡号脱敏     |
| 5  | `@SensitiveStrategyPhone`       | `@Sensitive(strategy = StrategyPhone.class)`       | 手机号脱敏    |
| 6  | `@SensitiveStrategyIdNo`        | `@Sensitive(strategy = StrategyIdNo.class)`        | 身份证脱敏    |
| 6  | `@SensitiveStrategyAddress`     | `@Sensitive(strategy = StrategyAddress.class)`     | 地址脱敏     |
| 7  | `@SensitiveStrategyGps`         | `@Sensitive(strategy = StrategyGps.class)`     | GPS 脱敏   |
| 8  | `@SensitiveStrategyIp`          | `@Sensitive(strategy = StrategyIp.class)`     | IP 脱敏    |
| 9  | `@SensitiveStrategyBirthday`    | `@Sensitive(strategy = StrategyBirthday.class)`     | 生日脱敏     |
| 10 | `@SensitiveStrategyPassport`    | `@Sensitive(strategy = StrategyPassport.class)`     | 护照脱敏     |
| 11 | `@SensitiveStrategyMaskAll`     | `@Sensitive(strategy = StrategyMaskAll.class)`     | 全部脱敏     |
| 12 | `@SensitiveStrategyMaskHalf`    | `@Sensitive(strategy = StrategyMaskHalf.class)`     | 一半脱敏     |
| 13 | `@SensitiveStrategyMaskRange`   | `@Sensitive(strategy = StrategyMaskRange.class)`     | 指定范围脱敏   |

## @Sensitive 定义

```java
@Inherited
@Documented
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Sensitive {

    /**
     * 注解生效的条件
     * @return 条件对应的实现类
     */
    Class<? extends ICondition> condition() default ConditionAlwaysTrue.class;

    /**
     * 执行的策略
     * @return 策略对应的类型
     */
    Class<? extends IStrategy> strategy();

}
```

## 与 @Sensitive 混合使用

如果你将新增的注解 `@SensitiveStrategyChineseName` 与 `@Sensitive` 同时在一个字段上使用。

为了简化逻辑，优先选择执行 `@Sensitive`，如果 `@Sensitive` 执行脱敏，
那么 `@SensitiveStrategyChineseName` 将不会生效。

如：

```java
/**
 * 测试字段
 * 1.当多种注解混合的时候，为了简化逻辑，优先选择 @Sensitive 注解。
 */
@SensitiveStrategyChineseName
@Sensitive(strategy = StrategyPassword.class)
private String testField;
```

# log4j2 插件统一脱敏

## 说明

上面的方法非常适用于新的项目，按照响应的规范进行推广。

但是很多金融公司都有很多历史遗留项目，或者使用不规范，比如使用 map 等，导致上面的方法在脱敏技改时需要耗费大量的时间，而且回溯成本很高。

有没有什么方法，可以直接在日志层统一处理呢？

## log4j2 Rewrite

我们可以基于 log4j2 RewritePolicy 统一使用脱敏策略。

说明：如果使用 slf4j 接口，实现为 log4j2 时也是支持的。

## 使用入门

### maven 引入

引入核心脱敏包。

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-log4j2</artifactId>
    <version>1.7.0</version>
</dependency>
```

其他的一般项目中也有，如 log4j2 包：

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>${log4j2.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>${log4j2.version}</version>
</dependency>
```

### log4j2.xml 配置

例子如下:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN" packages = "com.github.houbb.sensitive.log4j2.layout">

    <Properties>
        <Property name="DEFAULT_PATTERN">%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n</Property>
        <Property name="DEFAULT_CHARSET">UTF-8</Property>
    </Properties>

    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <SensitivePatternLayout/>
        </Console>
    </Appenders>

    <Loggers>
        <Root level="DEBUG">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>

</Configuration>
```

几个步骤：

1. 指定 package 为 `packages = "com.github.houbb.sensitive.log4j2.layout"`

2. 按照 log4j2 layout 规范，指定 Layout 策略为 `SensitivePatternLayout`

### 测试

正常的日志打印：

```java
private static final String TEST_LOG = "mobile:13088887777; bankCard:6217004470007335024, email:mahuateng@qq.com, amount:123.00, " +
        "IdNo:340110199801016666, name1:李明, name2:李晓明, name3:李泽明天, name4:山东小栗旬" +
        ", birthday:20220517, GPS:120.882222, IPV4:127.0.0.1, address:中国上海市徐汇区888号;";

logger.info(TEST_LOG);
```

自动脱敏效果如下：

```
01:37:28.010 [main] INFO  com.github.houbb.sensitive.test.log4j2.Log4j2AndSlf4jLayoutTest - mobile:130****7777|9FC4D36D63D2B6DC5AE1297544FBC5A2; bankCard:6217***********5024|444F49289B30944AB8C6C856AEA21180, email:mahu*****@qq.com|897915594C94D981BA86C9E83ADD449C, amount:123.00, IdNo:340110199801016666, name1:李明, name2:李晓明, name3:李泽明天, name4:山东小栗旬, birthday:20220517, GPS:120.882222, IPV4:127.0.0.1, address:中国上海市徐******|821A601949B1BD18DCBAAE27F2E27147;
```

ps: 这里是为了演示各种效果，实际默认对应为 1,2,3,4,9 这几种策略。 

## log4j2 配置定制化

为了满足各种用户的场景，在 V1.6.0 引入了 SensitivePatternLayout 策略的可配置化。

用户可以在应用 resources 下通过 `chars-scan-config.properties` 配置文件指定。

### 默认配置

log4j2 配置中，`SensitivePatternLayout` 配置默认为：

```properties
chars.scan.prefix=:：,，'"‘“=| +()（）
chars.scan.scanList=1,2,3,4,9
chars.scan.replaceList=1,2,3,4,9
chars.scan.defaultReplace=12
chars.scan.replaceHash=md5
chars.scan.whiteList=""
```

### 属性说明

SensitivePatternLayout 策略的属性说明。

| 属性 | 说明          | 默认值                | 备注                                       |
|:---|:------------|:-------------------|:-----------------------------------------|
|  prefix  | 需要脱敏信息的匹配前缀 | `:：,，'"‘“= +()（）` 和英文竖线 | 降低误判率                                    |
|  replaceHash  | 哈希策略模式      | `md5`              | 支持 md5/none 两种模式                         |
|  scanList  | 敏感扫描策略列表    | `1,2,3,4`          | 1~10 内置的10种敏感信息扫描策略，多个用逗号隔开              |
|  replaceList  | 敏感替换策略列表    | `1,2,3,4`          | 1~10 内置的10种敏感信息替换策略，多个用逗号隔开              |
|  defaultReplace  | 敏感替换默认策略    | `12`               | 1~13 内置的13种敏感信息替换策略，指定一个。当列表没有匹配时，默认使用这个 |
|  whiteList  | 白名单         | ``               | 希望跳过处理的白名单信息                             |

其中 1-13 的内置策略说明如下：

| 策略标识 | 说明                     |
|:-----|:-----------------------|
| 1    | 手机号                    |
| 2    | 身份证                    |
| 3    | 银行卡                    |
| 4    | 邮箱                     |
| 5    | 中国人名                   |
| 6    | 出生日期                   |
| 7    | GPS                    |
| 8    | IPV4                   |
| 9    | 地址                     |
| 10   | 护照                     |
| 11   | 匹配任意不掩盖                |
| 12   | 匹配任意半掩盖                |
| 13   | 匹配任意全掩盖                |
| m1   | 数字类合并操作(m1:1&2&3) 性能更好 |
| m3   | 拓展类合并操作(m3:4&5&9) 性能更好 |

### 不足之处

这里的策略自定义和 log4j2 的插件化比起来，确实算不上强大，但是可以满足 99% 的脱敏场景。

后续有时间考虑类似 log4j2 的 plugins 思想，实现更加灵活的自定义策略。

# logback 脱敏插件

## 说明

为了便于用户使用，v1.6.0 开始支持 logback 插件模式。

## 使用入门

### maven 引入

引入核心脱敏包。

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sensitive-logback</artifactId>
    <version>1.7.0</version>
</dependency>
```

引入 logback 依赖包

```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>${logback.version}</version>
</dependency>
```

### 指定 logback.xml 配置

```xml
<configuration>
    <!-- 基于 converter -->
    <conversionRule conversionWord="sensitive" converterClass="com.github.houbb.sensitive.logback.converter.SensitiveLogbackConverter" />
    <!-- 使用 converter -->
    <appender name="STDOUTConverter" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %sensitive%n</pattern>
        </encoder>
    </appender>

    <!-- 使用 layout -->
    <appender name="STDOUTLayout" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="com.github.houbb.sensitive.logback.layout.SensitiveLogbackLayout">
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </layout>
    </appender>

    <!-- 设置根日志级别为DEBUG，并将日志输出到控制台 -->
    <root level="DEBUG">
        <appender-ref ref="STDOUTConverter"/>
        <appender-ref ref="STDOUTLayout"/>
    </root>
</configuration>
```

这里共计支持 Converter 和 Layout 两种模式，任选一个即可。

建议使用 SensitiveLogbackConverter，脱敏日志内容。

## 日志效果

脱密效果和 log4j2 类似，如下：

```
01:42:32.579 [main] INFO  c.g.h.sensitive.test2.LogbackMain - mobile:130****7777|9FC4D36D63D2B6DC5AE1297544FBC5A2; bankCard:6217***********5024|444F49289B30944AB8C6C856AEA21180, email:mahu*****@qq.com|897915594C94D981BA86C9E83ADD449C, amount:123.00, " + "IdNo:340110199801016666, name1:李明, name2:李晓明, name3:李泽明天, name4:山东小栗旬" + ", birthday:20220517, GPS:120.882222, IPV4:127.0.0.1, address:中国上海市徐******|821A601949B1BD18DCBAAE27F2E27147;
```

## 配置属性

同 log4j2，此处不再赘述。

# 性能耗时

## 注解

100W 次耗时统计

| 方法      | 耗时(ms)  | 说明                         |
|:--------|:--------|:---------------------------|
| 原始工具类方法 | 122     | 性能最好，但是最麻烦。拓展性最差           |
| JSON.toJSONString(user) | 304     | 性能较好，拓展性不错。缺点是强依赖 fastjson |
| SensitiveUtil.desJson(user) | 1541    | 性能较差，拓展性最好，比较灵活            |

# 参考资料

https://github.com/houbb/sensitive/blob/master/README.md

* any list
{:toc}
