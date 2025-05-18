---
layout: post
title: 【老马】金融敏感信息如何实现用户银行卡号(bankCardNo)加解密+脱敏？encryption-local 使用及源码介绍
date: 2025-3-1 23:38:19 +0800
categories: [Team]
tags: [team, doc, sh]
published: true
---

# 前言

你是否存在这样的苦恼，数据需要安全存储，但是每个系统大家自己写，很浪费时间。

[encryption-local](https://github.com/houbb/encryption-local) 一个离线版本的金融敏感信息加解密工具，用于数据库敏感信息存储。

本文介绍一下用户姓名的加解密+掩码源码解析。

# 快速开始 

## maven 引入 

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>encryption-local-core</artifactId>
    <version>1.2.0</version>
</dependency>
```

## 例子

```java
final String bankCardNoTest = "4427290920309717";
final String salt = "99886622";

CommonEncryptResponse response = EncryptionLocalUtil.bankCardNoEncrypt(bankCardNoTest, salt);
String cipher = response.getCipher();
String mask = response.getMask();
String hash = response.getHash();
Assert.assertEquals("288D5EC5432203677D3714E9A270F9998AC04BF65E5A36C6773187A4239D05EE", cipher);
Assert.assertEquals("442729******9717", mask);
Assert.assertEquals("DE550BAF362B3EF640FF5AEC7D6E2F38", hash);
// 解密
String plain = EncryptionLocalUtil.idCardDecrypt(cipher, salt);
Assert.assertEquals(bankCardNoTest, plain);
```

# 源码部分

这里主要重点分析一下掩码的源码部分，我们可以直接在 [encryption-local](https://github.com/houbb/encryption-local) 查看源码。

脱敏银行卡号（前6后4），不过不同的银行长度不同，要结合自己的业务。

```java
/**
 * 脱敏银行卡号（前6后4）
 * @param cardId 卡号
 * @return 脱敏结果
 */
public static String bankCardNum(final String cardId) {
    if(StringUtil.isEmpty(cardId)) {
        return cardId;
    }
    final int prefixLength = 6;
    int times = cardId.length() - 10;
    final String middle = StringUtil.repeat("*", times);
    return StringUtil.buildString(cardId, middle, prefixLength);
}
```

当然，我们完全可以根据这个进行自己的实现拓展。

# 拓展阅读

## 项目推荐

下面是一些日志、加解密、脱敏安全相关的库推荐：

| 项目                                                                    | 介绍                    |
|:----------------------------------------------------------------------|:----------------------|
| [sensitive-word](https://github.com/houbb/sensitive-word)             | 高性能敏感词核心库             |
| [sensitive-word-admin](https://github.com/houbb/sensitive-word-admin) | 敏感词控台，前后端分离           |
| [sensitive](https://github.com/houbb/sensitive)                       | 高性能日志脱敏组件             |
| [auto-log](https://github.com/houbb/auto-log)                         | 统一日志切面组件，支持全链路traceId |
| [encryption-local](https://github.com/houbb/encryption-local)         | 离线加密机组件               |
| [encryption](https://mp.weixin.qq.com/s/2LQuKvll9EIn6pyFjhwacw)         | 加密机标准API+本地客户端        |
| [encryption-server](https://mp.weixin.qq.com/s/2LQuKvll9EIn6pyFjhwacw)        | 加密机服务                 |

## 拓展阅读

[【老马】离线版金融敏感信息加解密组件开源项目encryption-local](https://mp.weixin.qq.com/s/ba99l_NUHW6Zv8BCBAqfzg)

[【藏经阁】加密机服务完整解决方案，包含客户端+服务端](https://mp.weixin.qq.com/s/2LQuKvll9EIn6pyFjhwacw)

# 小结

离线版本的加解密好处是非常的方便，如果需要的话建议直接使用，可以节约很多时间。

希望这个项目可以帮助到你。喜欢的话，可以给原作者一个 star 鼓励一下！

我是老马，期待与你的下次重逢~

# 参考资料

* any list
{:toc}