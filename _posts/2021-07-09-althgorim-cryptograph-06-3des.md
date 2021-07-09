---
layout: post
title: 3DES 加密算法入门及算法原理
date:  2020-6-17 09:20:31 +0800
categories: [Algorithm]
tags: [algorithm, secret, sh]
published: true
---

# 3DES

3DES（或称为Triple DES）是三重数据加密算法（TDEA，Triple Data Encryption Algorithm）块密码的通称。

它相当于是对每个数据块应用三次DES加密算法。

由于计算机运算能力的增强，原版DES密码的密钥长度变得容易被暴力破解；

3DES 即是设计用来提供一种相对简单的方法，即**通过增加DES的密钥长度来避免类似的攻击，而不是设计一种全新的块密码算法**。

# 算法介绍

3DES又称Triple DES，是DES加密算法的一种模式，它使用2条不同的56位的密钥对数据进行三次加密。

数据加密标准（DES）是美国的一种由来已久的加密标准，它使用对称密钥加密法，并于1981年被ANSI组织规范为ANSI X.3.92。

DES使用56位密钥和密码块的方法，而在密码块的方法中，文本被分成64位大小的文本块然后再进行加密。比起最初的DES，3DES更为安全。

3DES（即Triple DES）是DES向AES过渡的加密算法（1999年，NIST将3-DES指定为过渡的加密标准），加密算法。

其具体实现如下：设Ek()和Dk()代表DES算法的加密和解密过程，K代表DES算法使用的密钥，P代表明文，C代表密文，这样：

3DES加密过程为：C=Ek3(Dk2(Ek1(P)))

3DES解密过程为：P=Dk1(EK2(Dk3(C)))

# 3DES加密过程

该算法的加解密过程分别是对明文/密文数据进行三次DES加密或解密，得到相应的密文或明文。

假设EK（）和DK（）分别表示DES的加密和解密函数，P表示明文，C表示密文，那么加解密的公式如下：

加密：C = EK3（ DK2（ EK1（P）） ），即对明文数据进行，加密 --> 解密 --> 加密的过程，最后得到密文数据；

解密：P = DK1（ EK2（ DK3（C）） ），即对密文数据进行，解密 --> 加密 --> 解密的过程，最后得到明文数据；

其中：K1表示3DES中第一个8字节密钥，K2表示第二个8字节密钥，K3表示第三个8字节密钥，K1、K2、K3决定了算法的安全性，若三个密钥互不相同，本质上就相当于用一个长为168位的密钥进行加密。

多年来，它在对付强力攻击时是比较安全的。若数据对安全性要求不那么高，K1可以等于K3。

在这种情况下，密钥的有效长度为112位，即K1对应KL（左8字节），K2对应KR（右8字节），K3对应KL（左8字节）。

![DES 加密算法](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy82NTM0NDQ4LWUxMTkzYTRhNzBiZTlmMjcuanBn?x-oss-process=image/format,png)

当三重密钥均相同时，前两步相互抵消，相当于仅实现了一次加密，因此可实现对普通 DES 加密算法的兼容。

![兼容](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy82NTM0NDQ4LTE4YWExMDljNTBmOGQzYjguanBn?x-oss-process=image/format,png)

## 补位

由于DES加解密算法是每8个字节作为一个加解密数据块，因此在实现该算法时，需要对数据进行分块和补位（即最后不足8字节时，要补足8字节）。

Java本身提供的API中NoPadding，Zeros填充和PKCS5Padding。

假设我们要对9个字节长度的数据进行加密，则其对应的填充说明如下：

（1）NoPadding：API或算法本身不对数据进行处理，加密数据由加密双方约定填补算法。

例如若对字符串数据进行加解密，可以补充 `\0` 或者空格，然后trim；

（2）ZerosPadding：无数据的字节全部被填充为0；

第一块：F0 F1 F2 F3 F4 F5 F6 F7

第二块：F8 0 0 0 0 0 0 0

（3）PKCS5Padding：每个被填充的字节都记录了被填充的长度；

①加密前：数据字节长度对8取余，余数为m，若m>0,则补足8-m个字节，字节数值为8-m，即差几个字节就补几个字节，字节数值即为补充的字节数，若为0则补充8个字节的8。

②解密后：取最后一个字节，值为m，则从数据尾部删除m个字节，剩余数据即为加密前的原文。

③加密字符串为为AAA，则补位为AAA55555;加密字符串为BBBBBB，则补位为BBBBBB22；加密字符串为CCCCCCCC，则补位为CCCCCCCC88888888。

（4）PKCS7Padding：

PKCS7Padding 的填充方式和PKCS5Padding 填充方式一样。只是加密块的字节数不同。PKCS5Padding明确定义了加密块是8字节，PKCS7Padding加密快可以是1-255之间。

# 3DES 解密

3DES解密过程，与加密过程相反，即逆序使用密钥。是以密钥3、密钥2、密钥1的顺序执行 解密->加密->解密。

![3DES 解密](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy82NTM0NDQ4LTBlN2I1ZmZkNDkwNDhkNDMucG5n?x-oss-process=image/format,png)

# 入门体验

## java 实现

```java
package com.github.houbb.secret.core.util;

import com.github.houbb.heaven.constant.CharsetConst;
import com.github.houbb.secret.api.exception.SecretRuntimeException;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;

/**
 * 3DES 工具类
 *
 * @author binbin.hou
 * @since 0.0.7
 */
public final class TripleDesUtil {

    private TripleDesUtil() {
    }

    /**
     * 算法名称
     *
     * @since 0.0.7
     */
    private static final String ALGORITHM = "DESede";

    /**
     * 加密函数
     *
     * @param keyBytes 加密密钥，长度为24字节
     * @param plainBytes 被加密的数据缓冲区（源）
     * @return 结果
     * @since 0.0.7
     */
    public static byte[] encrypt(byte[] keyBytes, byte[] plainBytes) {
        try {
            // 生成密钥
            SecretKey deskey = new SecretKeySpec(keyBytes, ALGORITHM);
            // 加密
            Cipher c1 = Cipher.getInstance(ALGORITHM);
            c1.init(Cipher.ENCRYPT_MODE, deskey);
            return c1.doFinal(plainBytes);
        } catch (Exception e1) {
            throw new SecurityException(e1);
        }
    }

    /**
     * 加密函数
     *
     * @param keyBytes 加密密钥，长度为24字节
     * @param plainText 被加密的数据缓冲区（源）
     * @return 结果
     * @since 0.0.7
     */
    public static byte[] encrypt(byte[] keyBytes, String plainText) {
        return encrypt(keyBytes, plainText.getBytes());
    }

    /**
     * 解密函数
     * @param keyBytes 加密密钥，长度为24字节
     * @param secretBytes 加密后的缓冲区
     * @return 结果
     * @since 0.0.7
     */
    public static byte[] decrypt(byte[] keyBytes, byte[] secretBytes) {
        try {
            // 生成密钥
            SecretKey deskey = new SecretKeySpec(keyBytes, ALGORITHM);
            // 解密
            Cipher c1 = Cipher.getInstance(ALGORITHM);
            c1.init(Cipher.DECRYPT_MODE, deskey);
            return c1.doFinal(secretBytes);
        } catch (Exception e1) {
            throw new SecretRuntimeException(e1);
        }
    }

    /**
     * 解密函数
     * @param keyBytes 加密密钥，长度为24字节
     * @param secretBytes 加密后的缓冲区
     * @param charsetName 编码名称
     *
     * @return 结果
     * @since 0.0.7
     */
    public static String decryptToString(byte[] keyBytes, byte[] secretBytes, String charsetName) {
        try {
            byte[] bytes = decrypt(keyBytes, secretBytes);

            return new String(bytes, charsetName);
        } catch (UnsupportedEncodingException e) {
            throw new SecretRuntimeException(e);
        }
    }

    /**
     * 解密函数
     * @param keyBytes 加密密钥，长度为24字节
     * @param secretBytes 加密后的缓冲区
     *
     * @return 结果
     * @since 0.0.7
     */
    public static String decryptToString(byte[] keyBytes, byte[] secretBytes) {
        return decryptToString(keyBytes, secretBytes, CharsetConst.UTF8);
    }


    
}
```

## 测试

```java
public static void main(String[] args) {
    String text = "我爱中华！";
    String password = "123456781234567812345678";
    byte[] bytes = encrypt(password.getBytes(), text);
    System.out.println(HexUtil.byteToHexString(bytes));
    String plainText = decryptToString(password.getBytes(), bytes);
    System.out.println(plainText);
}
```

日志信息：

```
A60CBC97EEFF2958DF4384215E0838C0
我爱中华！
``` 

# 参考资料

[3DES](https://baike.baidu.com/item/3DES/6368161)

[3DESC 加密算法](https://www.cnblogs.com/love201314/p/12060735.html)

[3DES 加密算法原理](https://blog.csdn.net/a745233700/article/details/102316398)

* any list
{:toc}