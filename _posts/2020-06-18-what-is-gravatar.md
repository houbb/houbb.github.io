---
layout: post
title: Gravatar-重新定义头像
date:  2020-6-17 09:20:31 +0800
categories: [Tool]
tags: [tool, web, sh]
published: true
---

## Gravatar 是什么

“头像”是代表您在线的图像-与网站互动时，您的名字旁边会出现一幅小图片。

Gravatar是全球公认的头像。 

您上传它并仅创建一次个人资料，然后当您参与任何启用Gravatar的网站时，您的Gravatar图像将自动在该位置跟随您。

Gravatar是网站所有者，开发人员和用户的免费服务。 

它自动包含在每个WordPress.com帐户中，并由Automattic运行和支持。

## 开发人员资源

Gravatar API 不需要身份验证，并且都基于简单的HTTP GET请求。 

使用下面的链接查找有关构造请求URL的更多信息，不同的实现选项等。

### Gravatar URLS

了解有关如何生成请求 Gravatar 图片和个人资料数据所需的URL的信息。

### 创建 Hash

Gravatar上的所有URL均基于电子邮件地址的哈希值的使用。 

图像和配置文件都可以通过电子邮件的哈希值进行访问，并且被认为是识别系统内身份的主要方式。 

为了确保哈希的一致性和准确性，应采取以下步骤来创建哈希：

1. 修剪电子邮件地址中的前导和尾随空格

2. 强制所有字符为小写

3. md5哈希最后的字符串

例如，假设我们从" MyEmailAddress@example.com"开始（请注意我们的假设用户错误输入的尾随空格）。 

如果我们使用 md5 直接对该字符串进行编码，则会得到以下内容：

- 创建 hash 的算法

```java
import java.util.*;
import java.io.*;
import java.security.*;
public class MD5Util {
  public static String hex(byte[] array) {
      StringBuffer sb = new StringBuffer();
      for (int i = 0; i < array.length; ++i) {
      sb.append(Integer.toHexString((array[i]
          & 0xFF) | 0x100).substring(1,3));        
      }
      return sb.toString();
  }
  public static String md5Hex (String message) {
      try {
      MessageDigest md = 
          MessageDigest.getInstance("MD5");
      return hex (md.digest(message.getBytes("CP1252")));
      } catch (NoSuchAlgorithmException e) {
      } catch (UnsupportedEncodingException e) {
      }
      return null;
  }
}
```

直接计算即可：

```
String hash = MD5Util.md5Hex(email);
```

### 请求地址

- url 

```
https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50
```

- image

```
<img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50" />
```

- image url

```
https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50.jpg
```

### 其他特性

可以指定图片的大小，旋转，是否默认。

## 个人想法

根据 Hash 值生成一个独一无二的 Image 头像。

有些类似于 github 的默认头像。

将这个特性做成一个 jar 包，便于本地化。

## 参考资料

[java 实现](https://en.gravatar.com/site/implement/images/java/)

* any list
{:toc}