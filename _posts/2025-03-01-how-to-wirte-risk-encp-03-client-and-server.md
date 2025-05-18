---
layout: post
title: 【藏经阁】加密机服务完整解决方案，包含客户端+服务端
date: 2025-3-1 23:38:19 +0800
categories: [Team]
tags: [team, doc, sh]
published: true
---

# 前言

你是否存在这样的苦恼，数据需要安全存储，但是每个系统大家自己写，很浪费时间。

[encryption-local](https://github.com/houbb/encryption-local) 一个离线版本的金融敏感信息加解密工具，用于数据库敏感信息存储。

离线版本的加解密好处是非常的方便。不过缺点也比较明显，那就是在真正追求安全的公司，研发是不能够拥有直接加解密的能力的。

所以最好是有一个单独的加密机服务，对公司内部提供统一的加解密能力。

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

# 项目简介

[encryption](https://github.com/houbb/encryption) 加密机接口定义+本地客户端。

和 [encryption-server](https://github.com/houbb/encryption-server) 加密机服务端配套使用。

## 特性

- 加密机标准的 API 定义

- 加密机 http 客户端

- 支持 姓名/手机号/银行卡/身份证/邮箱/地址/密码 等常见的的加解密策略

- 支持通用加密策略

# 快速开始 

## 核心方法

加密方法

| 方法                 | 说明     | 备注 |
|:-------------------|:-------|:---|
| encryptName        | 姓名加密   |    |
| encryptPassword    | 密码加密   |    |
| encryptAddress     | 地址加密   |    |
| encryptBankCardNum | 银行卡号加密 |    |
| encryptEmail       | 邮箱加密   |    |
| encryptIdCard      | 身份证加密  |    |
| encryptPhone       | 手机号加密  |    |
| encryptCommon      | 通用加密   |    |

解密方法

| 方法                 | 说明     | 备注 |
|:-------------------|:-------|:---|
| decryptName        | 姓名解密   |    |
| decryptPassword    | 密码解密   |    |
| decryptAddress     | 地址解密   |    |
| decryptBankCardNum | 银行卡号解密 |    |
| decryptEmail       | 邮箱解密   |    |
| decryptIdCard      | 身份证解密  |    |
| decryptPhone       | 手机号解密  |    |
| decryptCommon      | 通用解密   |    |

## 基本方法例子

### 初始化客户端

```java
EncryptionClient encryptionClient = EncryptionClientBs.newInstance()
        .systemId("client-test")
        .encryptionClient();

return encryptionClient;
```

### 姓名

```java
EncryptionClient encryptionClient = getEncryptionClient();

final String plainText = "张三丰";
EncryptNameResponse encryptNameResponse = encryptionClient.encryptName(plainText);
Assert.assertEquals("张*丰", encryptNameResponse.getNameMask());

// 解密
String cipher = encryptNameResponse.getNameCipher();
DecryptNameResponse decryptNameResponse = encryptionClient.decryptName(cipher);
Assert.assertEquals(plainText, decryptNameResponse.getName());
```

### 手机号

```java
EncryptionClient encryptionClient = getEncryptionClient();

final String plainText = "13012345678";
EncryptPhoneResponse encryptPhoneResponse = encryptionClient.encryptPhone(plainText);
Assert.assertEquals("130****5678", encryptPhoneResponse.getPhoneMask());

// 解密
String cipher = encryptPhoneResponse.getPhoneCipher();
DecryptPhoneResponse decryptPhoneResponse = encryptionClient.decryptPhone(cipher);
Assert.assertEquals(plainText, decryptPhoneResponse.getPhone());
```

### 邮箱

```java
EncryptionClient encryptionClient = getEncryptionClient();

final String plainText = "13012345678@lm.com";
EncryptEmailResponse encryptEmailResponse = encryptionClient.encryptEmail(plainText);
Assert.assertEquals("130********@lm.com", encryptEmailResponse.getEmailMask());

// 解密
String cipher = encryptEmailResponse.getEmailCipher();
DecryptEmailResponse decryptEmailResponse = encryptionClient.decryptEmail(cipher);
Assert.assertEquals(plainText, decryptEmailResponse.getEmail());
```
        
### 身份证

```java
EncryptionClient encryptionClient = getEncryptionClient();

final String plainText = "330781198509072752";
EncryptIdCardResponse encryptIdCardResponse = encryptionClient.encryptIdCard(plainText);
Assert.assertEquals("330781*********752", encryptIdCardResponse.getIdCardMask());

// 解密
String cipher = encryptIdCardResponse.getIdCardCipher();
DecryptIdCardResponse decryptIdCardResponse = encryptionClient.decryptIdCard(cipher);
Assert.assertEquals(plainText, decryptIdCardResponse.getIdCard());
```
        
### 银行卡号

```java
EncryptionClient encryptionClient = getEncryptionClient();

final String plainText = "9996666888866668888";
EncryptBankCardNumResponse encryptBankCardNumResponse = encryptionClient.encryptBankCardNum(plainText);
Assert.assertEquals("999666*********8888", encryptBankCardNumResponse.getBankCardNumMask());

// 解密
String cipher = encryptBankCardNumResponse.getBankCardNumCipher();
DecryptBankCardNumResponse decryptBankCardNumResponse = encryptionClient.decryptBankCardNum(cipher);
Assert.assertEquals(plainText, decryptBankCardNumResponse.getBankCardNum());
```

### 密码

```java
EncryptionClient encryptionClient = getEncryptionClient();

final String plainText = "123456";
EncryptPasswordResponse response = encryptionClient.encryptPassword(plainText);
Assert.assertEquals("EncryptPasswordResponse{passwordCipher='D80D4580CA9A6E4EF2CA13EF9975348A', passwordMask='******', passwordHash='E10ADC3949BA59ABBE56E057F20F883E'}", response.toString());

// 解密
String cipher = response.getPasswordCipher();
DecryptPasswordResponse decryptResponse = encryptionClient.decryptPassword(cipher);
Assert.assertEquals(plainText, decryptResponse.getPassword());
```

### 地址

```java
EncryptionClient encryptionClient = getEncryptionClient();

final String plainText = "地球村中国上海外滩88号";
EncryptAddressResponse response = encryptionClient.encryptAddress(plainText);
Assert.assertEquals("EncryptAddressResponse{addressCipher='5883ED53C3552103DCED5702F04A2919C901D3BD77E8F69B3EF71EC0B3A53D479251FF49F0271C38E902DF828D233010', addressMask='地球村中国上**滩88号', addressHash='FE33D5C0BCE5EA5FE6E7B300F5421218'}", response.toString());

// 解密
String cipher = response.getAddressCipher();
DecryptAddressResponse decryptResponse = encryptionClient.decryptAddress(cipher);
Assert.assertEquals(plainText, decryptResponse.getAddress());
```

### 通用

```java
EncryptionClient encryptionClient = getEncryptionClient();

final String plainText = "地球村中国上海外滩88号";
CommonEncryptResponse response = encryptionClient.encryptCommon(plainText, EncryptEnum.ADDRESS);
Assert.assertEquals("CommonEncryptResponse{cipher='5883ED53C3552103DCED5702F04A2919C901D3BD77E8F69B3EF71EC0B3A53D479251FF49F0271C38E902DF828D233010', mask='地球村中国上**滩88号', hash='FE33D5C0BCE5EA5FE6E7B300F5421218'}", response.toString());

// 解密
String cipher = response.getCipher();
CommonDecryptResponse decryptResponse = encryptionClient.decryptCommon(cipher, EncryptEnum.ADDRESS);
Assert.assertEquals(plainText, decryptResponse.getPlainText());
```

# 服务端

[encryption-server](https://github.com/houbb/encryption-server) 加密机服务+和[encryption](https://github.com/houbb/encryption) 加密机本地客户端配套使用。

## 创作目的

实现一款开箱即用的加密机服务。

## 特性

- 身份证加解密

- 地址加解密

- 姓名加解密

- 邮箱加解密

- 手机号加解密

- 银行卡加解密

- 密码加解密

# 快速开始

## 执行脚本

执行 `mysql-5.7.sql`

`Datasource` 类中修改对应的 mysql 账密和链接信息

## maven 引入

```
mvn clean install
```

## 运行

直接运行 BootApplication#main() 方法

# 源码获取

阅读原文即可获取全部源码。

> [【藏经阁】加密机服务完整解决方案，包含客户端+服务端](https://mp.weixin.qq.com/s/2LQuKvll9EIn6pyFjhwacw)

# 小结

安全是每一家公司不可忽略的部分，再加上合规监管的要求，一定要重视用户的数据安全和隐私。

希望这个项目可以帮助到你。

我是老马，期待与你的下次重逢~

# 参考资料

* any list
{:toc}