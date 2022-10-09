---
layout: post
title: 和你一起走进对称加密算法的世界
date:  2020-6-17 09:20:31 +0800
categories: [Algorithm]
tags: [algorithm, secret, sh]
published: true
---

# 密码的世界

如果你是黑帮老大，平时和手下沟通，如何保证自己的信息安全呢？

在神探夏洛克的第一季中，就讲述了一个如何侦破黑帮的加密交流的故事。

![神探夏洛克](https://images.gitee.com/uploads/images/2021/0710/192758_95ec6e5b_508704.jpeg "密码.jpg")

这种密码利用的是密码字典。

密码本身可以是一本书，比如常见的《圣经》、《杀死一只知更鸟》，或者纽约地图？

这种加密方式的优点就是如果不知道字典本身，基本无法破解。使用起来也非常简单，甚至你可以定期和手下更换字典。

谈到密码，另一个不得不提的故事就是二战时期的密码破译问题。

二战时期，德国发明的 ENIGMA 加密机器，让通讯加密从人工手写时代跨越到了机器操作时代，也让人工破译有些无能为力。

为了破译德国的这套加密机器，从剑桥找来了三位优秀的数学家：杰弗里期、威尔仕曼、阿兰.图灵。

说到图灵，我想大家一定都知道，如果不知道，建议收藏本篇文章，了解之后再继续阅读。

常言道，唯有魔法可以打败魔法。那可以让奇异博……啊，不好意思，还是让图灵来吧。

![模仿游戏](https://images.gitee.com/uploads/images/2021/0710/194626_c077874c_508704.jpeg "模仿游戏.jpg")

图灵认为运用数学上的 crib 方法来破解 ENIGMA 是可行的，在后期破译了大部分的德军情报信息。

以后的时代，我们**用机器去打败机器**。

# 加密的可逆性

加密算法我们整体可以分为：可逆加密和不可逆加密；可逆加密又可以分为：对称加密和非对称加密。

当然一般的通讯中，我们都是需要进行解密的。

本文主要介绍近代最有名的四大加密算法：DES 3DES AES 和 SM4。

# DES 算法

## 简介

DES 全称为 Data Encryption Standard，即数据加密标准，是一种使用密钥加密的块算法，1977年被美国联邦政府的国家标准局确定为联邦资料处理标准（FIPS），并授权在非密级政府通信中使用，随后该算法在国际上广泛流传开来。

## 设计原则

DES设计中使用了分组密码设计的两个原则：混淆（confusion）和扩散(diffusion)，其目的是抗击敌手对密码系统的统计分析。

混淆是使密文的统计特性与密钥的取值之间的关系尽可能复杂化，以使密钥和明文以及密文之间的依赖性对密码分析者来说是无法利用的。

扩散的作用就是将每一位明文的影响尽可能迅速地作用到较多的输出密文位中，以便在大量的密文中消除明文的统计结构，并且使每一位密钥的影响尽可能迅速地扩展到较多的密文位中，以防对密钥进行逐段破译。

ps: 基本近代的加密算法应该遵循这两个准则，否则就会被统计攻击。

## 入门使用

这里提供了最简单的 DES 实现例子。

```java
import javax.crypto.*;
import javax.crypto.spec.DESKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;

/**
 * DES 工具类
 *
 * @author binbin.hou
 * @since 0.0.6
 */
public final class DesUtil {

    private DesUtil() {
    }

    /**
     * des
     *
     * @since 0.0.6
     */
    private static final String DES = "DES";

    /**
     * 加密
     *
     * @param plainText 待加密内容
     * @param password  密码
     * @return 加密结果
     * @since 0.0.6
     */
    public static byte[] encrypt(String plainText, String password) {
        byte[] bytes = plainText.getBytes();
        return encrypt(bytes, password);
    }

    /**
     * 加密
     *
     * @param plainText 待加密内容
     * @param password  密码
     * @return 加密结果
     * @since 0.0.6
     */
    public static byte[] encrypt(byte[] plainText, String password) {
        try {
            SecureRandom random = new SecureRandom();
            DESKeySpec desKey = new DESKeySpec(password.getBytes());
            // 创建一个密匙工厂，然后用它把DESKeySpec转换成
            SecretKeyFactory keyFactory = SecretKeyFactory.getInstance(DES);
            SecretKey secretKey = keyFactory.generateSecret(desKey);
            // Cipher对象实际完成加密操作
            Cipher cipher = Cipher.getInstance(DES);
            // 用密匙初始化Cipher对象
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, random);
            // 现在，获取数据并加密
            // 正式执行加密操作
            return cipher.doFinal(plainText);
        } catch (Exception e) {
            throw new SecretRuntimeException(e);
        }
    }

    /**
     * 解密
     *
     * @param src      byte[]
     * @param password String
     * @return 解密结果
     * @since 0.0.6
     */
    public static byte[] decrypt(byte[] src, String password) {
        try {
            // DES算法要求有一个可信任的随机数源
            SecureRandom random = new SecureRandom();
            // 创建一个DESKeySpec对象
            DESKeySpec desKey = new DESKeySpec(password.getBytes());
            // 创建一个密匙工厂
            SecretKeyFactory keyFactory = SecretKeyFactory.getInstance(DES);
            // 将DESKeySpec对象转换成SecretKey对象
            SecretKey secretKey = keyFactory.generateSecret(desKey);
            // Cipher对象实际完成解密操作
            Cipher cipher = Cipher.getInstance(DES);
            // 用密匙初始化Cipher对象
            cipher.init(Cipher.DECRYPT_MODE, secretKey, random);
            // 真正开始解密操作
            return cipher.doFinal(src);
        } catch (InvalidKeyException | NoSuchAlgorithmException | InvalidKeySpecException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException e) {
            throw new SecretRuntimeException(e);
        }
    }

    /**
     * 解密
     *
     * @param src      byte[]
     * @param password String
     * @return 解密结果
     * @since 0.0.6
     */
    public static String decryptToString(byte[] src, String password,
                                         String charset) {
        try {
            byte[] bytes = decrypt(src, password);

            return new String(bytes, charset);
        } catch (UnsupportedEncodingException e) {
            throw new SecretRuntimeException(e);
        }
    }

    /**
     * 解密
     *
     * @param src      byte[]
     * @param password String
     * @return 解密结果
     * @since 0.0.6
     */
    public static String decryptToString(byte[] src, String password) {
        return decryptToString(src, password, "UTF-8");
    }

}
```

## 测试代码

测试代码如下：

```java
public static void main(String[] args) {
    // 待加密内容
    String str = "测试内容";
    // 密码，长度要是8的倍数
    String password = "01234567";
    byte[] result = DesUtil.encrypt(str, password);
    System.out.println("加密后：" + HexUtil.byteToHexString(result));
    // 直接将如上内容解密
    String decryResult = DesUtil.decryptToString(result, password);
    System.out.println("解密后：" + decryResult);
}
```

日志如下：

```
加密后：77C25C0143F544CFFF102E43BDE1ABE1
解密后：测试内容
```

## 拓展阅读

具体算法原理建议阅读：

> DES 加密算法入门及算法原理：[https://houbb.github.io/2020/06/17/althgorim-cryptograph-05-des](https://houbb.github.io/2020/06/17/althgorim-cryptograph-05-des)

# 3DES

## 算法介绍

3DES（或称为Triple DES）是三重数据加密算法（TDEA，Triple Data Encryption Algorithm）块密码的通称。

它相当于是对每个数据块应用三次 DES 加密算法。

由于计算机运算能力的增强，原版DES密码的密钥长度变得容易被暴力破解；

3DES 即是设计用来提供一种相对简单的方法，即**通过增加DES的密钥长度来避免类似的攻击，而不是设计一种全新的块密码算法**。

## java 入门

3DES 的工具类实现如下：

```java
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

## 拓展阅读

具体算法原理建议阅读：

> 3DES 加密算法入门及算法原理：[https://houbb.github.io/2020/06/17/althgorim-cryptograph-06-3des](https://houbb.github.io/2020/06/17/althgorim-cryptograph-06-3des)

# AES 算法

## 算法简介

密码学中的高级加密标准（Advanced Encryption Standard，AES），又称Rijndael加密法，是美国联邦政府采用的一种区块加密标准。

2006年，高级加密标准已然成为对称密钥加密中最流行的算法之一。

这种算法比 3DES 的安全性更高。

## java 入门

java 的工具类实现如下。

```java
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.io.UnsupportedEncodingException;
import java.security.SecureRandom;

/**
 * 3DES 工具类
 *
 * @author binbin.hou
 * @since 0.0.7
 */
public final class AesUtil {

    private AesUtil() {
    }

    /**
     * 算法名称
     *
     * @since 0.0.7
     */
    private static final String ALGORITHM = "AES";

    /**
     * 根据密钥对指定的明文plainText进行加密.
     *
     * @param plainBytes 明文
     * @param keyBytes   密码
     * @return 加密后的密文.
     * @since 0.0.8
     */
    public static byte[] encrypt(byte[] plainBytes, byte[] keyBytes) {
        try {
            SecretKey secretKey = getSecretKey(keyBytes);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return cipher.doFinal(plainBytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 根据密钥对指定的密文 cipherBytes 进行解密.
     *
     * @param cipherBytes 加密密文
     * @param keyBytes    秘钥
     * @return 解密后的明文.
     * @since 0.0.8
     */
    public static byte[] decrypt(byte[] cipherBytes, byte[] keyBytes) {
        try {
            SecretKey secretKey = getSecretKey(keyBytes);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return cipher.doFinal(cipherBytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 获取加密 key
     *
     * @param keySeed seed
     * @return 结果
     * @since 0.0.8
     */
    private static SecretKey getSecretKey(byte[] keySeed) {
        try {
            // 避免 linux 系统出现随机的问题
            SecureRandom secureRandom = SecureRandom.getInstance("SHA1PRNG");
            secureRandom.setSeed(keySeed);
            KeyGenerator generator = KeyGenerator.getInstance("AES");
            generator.init(secureRandom);
            return generator.generateKey();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
}
```

## 测试代码

```java
public static void main(String[] args) throws UnsupportedEncodingException {
    String text = "我爱中华！";
    // 密钥, 256位32个字节
    String password = "uBdUx82vPHkDKb284d7NkjFoNcKWBuka";
    byte[] bytes = encrypt(text.getBytes(), password.getBytes());
    String text2 = new String(decrypt(bytes, password.getBytes()), "UTF-8");
    System.out.println(text2);
}
```

输出：我爱中华！

## 拓展阅读

具体算法原理建议阅读：

> AES 加密算法入门及算法原理：[https://houbb.github.io/2020/06/17/althgorim-cryptograph-07-aes](https://houbb.github.io/2020/06/17/althgorim-cryptograph-07-aes)

# SM4 算法

## 算法简介

SM4是一种分组密码算法，其分组长度为128位（即16字节，4字），密钥长度也为128位（即16字节，4字）。

其加解密过程采用了32轮迭代机制（与DES、AES类似），每一轮需要一个轮密钥（与DES、AES类似）。

SM4 算法，又称国密算法。因为这是属于中国人自己的加密算法，国内的金融等领域都会使用。

## java 入门

### maven 依赖

```xml
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcprov-jdk15on</artifactId>
    <version>1.59</version>
</dependency>
```

### 工具封装

```java
import com.github.houbb.secret.api.exception.SecretRuntimeException;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.pqc.math.linearalgebra.ByteUtils;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.security.Security;
import java.util.Arrays;

/**
 * Sm4 国密算法
 *
 * @author binbin.hou
 * @since 0.0.5
 */
public final class Sm4Util {

    private Sm4Util() {
    }

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    private static final String ENCODING = "UTF-8";

    private static final String ALGORITHM_NAME = "SM4";

    /**
     * PKCS5Padding  NoPadding 补位规则，PKCS5Padding缺位补0，NoPadding不补
     */
    private static final String ALGORITHM_NAME_ECB_PADDING = "SM4/ECB/PKCS5Padding";

    /**
     * ECB加密模式，无向量
     * @param algorithmName 算法名称
     * @param mode          模式
     * @param key           key
     * @return 结果
     */
    private static Cipher generateEcbCipher(String algorithmName, int mode, byte[] key) throws Exception {
        Cipher cipher = Cipher.getInstance(algorithmName, BouncyCastleProvider.PROVIDER_NAME);
        Key sm4Key = new SecretKeySpec(key, ALGORITHM_NAME);
        cipher.init(mode, sm4Key);
        return cipher;
    }

    /**
     * sm4加密
     * 加密模式：ECB 密文长度不固定，会随着被加密字符串长度的变化而变化
     *
     * @param hexKey   16进制密钥（忽略大小写）
     * @param plainText 待加密字符串
     * @return 返回16进制的加密字符串
     * @since 0.0.5
     */
    public static String encryptEcb(String hexKey, String plainText) {
        try {
            String cipherText = "";
            // 16进制字符串-->byte[]
            byte[] keyData = ByteUtils.fromHexString(hexKey);
            // String-->byte[]
            //当加密数据为16进制字符串时使用这行
            byte[] srcData = plainText.getBytes(ENCODING);
            // 加密后的数组
            byte[] cipherArray = encryptEcbPadding(keyData, srcData);
            // byte[]-->hexString
            cipherText = ByteUtils.toHexString(cipherArray);
            return cipherText;
        } catch (Exception exception) {
            throw new SecretRuntimeException(exception);
        }
    }

    /**
     * 加密模式之Ecb
     *
     * @param key 秘钥
     * @param data 待加密的数据
     * @return 字节数组
     * @since 0.0.5
     */
    public static byte[] encryptEcbPadding(byte[] key, byte[] data) {
        try {
            //声称Ecb暗号,通过第二个参数判断加密还是解密
            Cipher cipher = generateEcbCipher(ALGORITHM_NAME_ECB_PADDING, Cipher.ENCRYPT_MODE, key);
            return cipher.doFinal(data);
        } catch (Exception exception) {
            throw new SecretRuntimeException(exception);
        }
    }

    //解密****************************************

    /**
     * sm4解密
     *
     * 解密模式：采用ECB
     * @param hexKey     16进制密钥
     * @param cipherText 16进制的加密字符串（忽略大小写）
     * @return 解密后的字符串
     * @since 0.0.5
     */
    public static String decryptEcb(String hexKey, String cipherText) {
        try {
            // 用于接收解密后的字符串
            String decryptStr = "";
            // hexString-->byte[]
            byte[] keyData = ByteUtils.fromHexString(hexKey);
            // hexString-->byte[]
            byte[] cipherData = ByteUtils.fromHexString(cipherText);
            // 解密
            byte[] srcData = decryptEcbPadding(keyData, cipherData);
            // byte[]-->String
            decryptStr = new String(srcData, ENCODING);
            return decryptStr;
        } catch (Exception exception) {
            throw new SecretRuntimeException(exception);
        }
    }

    /**
     * 解密
     *
     * @param key 秘钥
     * @param cipherText 密文
     * @return 结果
     * @since 0.0.5
     */
    public static byte[] decryptEcbPadding(byte[] key, byte[] cipherText) {
        try {
            //生成Ecb暗号,通过第二个参数判断加密还是解密
            Cipher cipher = generateEcbCipher(ALGORITHM_NAME_ECB_PADDING, Cipher.DECRYPT_MODE, key);
            return cipher.doFinal(cipherText);
        } catch (Exception exception) {
            throw new SecretRuntimeException(exception);
        }
    }

    /**
     * 验证数据
     * @param hexKey key
     * @param cipherText 密文
     * @param plainText 明文
     * @return 结果
     * @since 0.0.5
     */
    public static boolean verifyEcb(String hexKey, String cipherText, String plainText) {
        try {
            // 用于接收校验结果
            boolean flag = false;
            // hexString-->byte[]
            byte[] keyData = ByteUtils.fromHexString(hexKey);
            // 将16进制字符串转换成数组
            byte[] cipherData = ByteUtils.fromHexString(cipherText);
            // 解密
            byte[] decryptData = decryptEcbPadding(keyData, cipherData);
            // 将原字符串转换成byte[]
            byte[] srcData = plainText.getBytes(ENCODING);
            // 判断2个数组是否一致
            flag = Arrays.equals(decryptData, srcData);
            return flag;
        } catch (Exception exception) {
            throw new SecretRuntimeException(exception);
        }
    }

}
```

## 测试代码

```java
System.out.println("开始****************************");
String plainText = "96C63180C2806ED1F47B859DE501215B";
System.out.println("加密前：" + plainText);
//自定义的32位16进制秘钥
String key = "86C63180C2806ED1F47B859DE501215B";
String cipher = encryptEcb(key, plainText);//sm4加密
System.out.println("加密后：" + cipher);
//校验加密前后是否为同一数据
System.out.println("校验：" + verifyEcb(key, cipher, plainText));
plainText = decryptEcb(key, cipher);//解密
System.out.println("解密后：" + plainText);
System.out.println("结束****************************");
```

对应日志：

```
开始****************************
加密前：96C63180C2806ED1F47B859DE501215B
加密后：063c352bcec7d360da455ebaab2595347d0aa493d2a80a72396771b5585a49f81642326904c036af50b50f92e86cb274
校验：true
解密后：96C63180C2806ED1F47B859DE501215B
结束****************************
```

## 拓展阅读

具体算法原理建议阅读：

> SM4 加密算法入门及算法原理：[https://houbb.github.io/2020/06/17/althgorim-cryptograph-04-sm4](https://houbb.github.io/2020/06/17/althgorim-cryptograph-04-sm4)

# 第五大加密算法

当然，四大加密算法有 5 个，这不是常识吗？

安德鲁：为什么，我怎么不知道？

![4 大算法有 5 个?](https://images.gitee.com/uploads/images/2021/0710/201602_b9d1777f_508704.jpeg "拉低智商.jpg")

我们最后再聊一聊另一个常见的算法 Base64。

## 算法介绍

严格地说，Base64 并不是用于加密的，更多的用于编码，解码。

Base64是一种能将任意Binary资料用64种字元组合成字串的方法，而这个Binary资料和字串资料彼此之间是可以互相转换的，十分方便。

在实际应用上，Base64除了能将Binary资料可视化之外，也常用来表示字串加密过后的内容。

## java 工具类

```java
import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.secret.api.exception.SecretRuntimeException;

import java.io.UnsupportedEncodingException;

/**
 * Base64 工具类
 *
 * 转码类
 * @author binbin.hou
 * @since 0.0.4
 */
public final class Base64Util {

    private Base64Util() {
    }

    private static final char[] ALPHABET_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".toCharArray();

    private static final byte[] CODES = new byte[256];

    static {
        for (int i = 0; i < 256; i++) {
            CODES[i] = -1;
        }
        for (int i = 'A'; i <= 'Z'; i++) {
            CODES[i] = (byte) (i - 'A');
        }
        for (int i = 'a'; i <= 'z'; i++) {
            CODES[i] = (byte) (26 + i - 'a');
        }
        for (int i = '0'; i <= '9'; i++) {
            CODES[i] = (byte) (52 + i - '0');
        }
        CODES['+'] = 62;
        CODES['/'] = 63;
    }

    /**
     * 将原始数据编码为 base64 编码
     *
     * @param data 数据
     * @since 0.0.4
     */
    public static char[] encode(byte[] data) {
        char[] out = new char[((data.length + 2) / 3) * 4];

        for (int i = 0, index = 0; i < data.length; i += 3, index += 4) {
            boolean quad = false;
            boolean trip = false;
            int val = (0xFF & (int) data[i]);
            val <<= 8;
            if ((i + 1) < data.length) {
                val |= (0xFF & (int) data[i + 1]);
                trip = true;
            }
            val <<= 8;
            if ((i + 2) < data.length) {
                val |= (0xFF & (int) data[i + 2]);
                quad = true;
            }
            out[index + 3] = ALPHABET_CHARS[(quad ? (val & 0x3F) : 64)];
            val >>= 6;
            out[index + 2] = ALPHABET_CHARS[(trip ? (val & 0x3F) : 64)];
            val >>= 6;
            out[index + 1] = ALPHABET_CHARS[val & 0x3F];
            val >>= 6;
            out[index + 0] = ALPHABET_CHARS[val & 0x3F];
        }
        return out;
    }

    /**
     * 将 base64 编码的数据解码成原始数据
     *
     * @param data 数组
     * @since 0.0.4
     */
    public static byte[] decode(char[] data) {
        int len = ((data.length + 3) / 4) * 3;
        if (data.length > 0 && data[data.length - 1] == '=') {
            --len;
        }
        if (data.length > 1 && data[data.length - 2] == '=') {
            --len;
        }
        byte[] out = new byte[len];
        int shift = 0;
        int accum = 0;
        int index = 0;
        for (char datum : data) {
            int value = CODES[datum & 0xFF];
            if (value >= 0) {
                accum <<= 6;
                shift += 6;
                accum |= value;
                if (shift >= 8) {
                    shift -= 8;
                    out[index++] = (byte) ((accum >> shift) & 0xff);
                }
            }
        }

        if (index != out.length) {
            throw new SecretRuntimeException("miscalculated data length!");
        }
        return out;
    }

    /**
     * 编码
     * @param text 文本
     * @return 结果
     * @since 0.0.4
     */
    public static char[] encode(String text) {
        if(StringUtil.isEmpty(text)) {
            return new char[]{};
        }
        byte[] data = text.getBytes();

        return encode(data);
    }

    /**
     * 编码为字符串
     *
     * @param text 文本
     * @return 结果
     * @since 0.0.4
     */
    public static String encodeToString(String text) {
        if(StringUtil.isEmpty(text)) {
            return text;
        }
        char[] chars = encode(text);

        return new String(chars);
    }

    /**
     * 将 base64 编码的数据解码成原始数据
     *
     * @param text 解码
     * @since 0.0.4
     */
    public static byte[] decode(String text) {
        if(StringUtil.isEmpty(text)) {
            return new byte[]{};
        }

        char[] chars = text.toCharArray();
        return decode(chars);
    }

    /**
     * 将 base64 编码的数据解码成原始数据
     *
     * @param text 解码
     * @param charset 编码
     * @since 0.0.4
     */
    public static String decodeToString(String text, String charset) {
        try {
            byte[] bytes = decode(text);

            return new String(bytes, charset);
        } catch (UnsupportedEncodingException e) {
            throw new SecretRuntimeException(e);
        }
    }

}
```

## 测试

```java
public static void main(String[] args) {
    String text = "我爱中国!";
    String base64 = encodeToString(text);
    System.out.println(base64);
    String decode64 = decodeToString(base64, "UTF-8");
    System.out.println(decode64);
}
```

输出如下：

```
5oiR54ix5Lit5Zu9IQ==
我爱中国!
```

## 拓展阅读

具体算法原理建议阅读：

> BASE64 加密算法入门及算法原理：[https://houbb.github.io/2020/06/17/althgorim-cryptograph-03-base64](https://houbb.github.io/2020/06/17/althgorim-cryptograph-03-base64)

# 小结

信息时代，一直在追求 2 个指标：速度与安全（不是激情）。

安全算法也永远随着时代的进步而不断演变，是一场永不停息的攻防之战。

针对本文的所有算法，我都做了统一的编码实现汇总，便于大家使用。感兴趣的可以关注【老马啸西风】，后台回复【加密】即可获取。

另外，有时间我们可以聊一聊不可逆加密，以及非对称加密。

我是老马，期待与你的下次重逢。


* any list
{:toc}