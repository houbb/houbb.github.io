---
layout: post
title: AES 加密算法入门及算法原理
date:  2020-6-17 09:20:31 +0800
categories: [Algorithm]
tags: [algorithm, secret, sh]
published: true
---

# AES

密码学中的高级加密标准（Advanced Encryption Standard，AES），又称Rijndael加密法，是美国联邦政府采用的一种区块加密标准。

这个标准用来替代原先的DES（Data Encryption Standard），已经被多方分析且广为全世界所使用。

经过五年的甄选流程，高级加密标准由美国国家标准与技术研究院（NIST）于2001年11月26日发布于FIPS PUB 197，并在2002年5月26日成为有效的标准。

2006年，高级加密标准已然成为对称密钥加密中最流行的算法之一。

该算法为比利时密码学家Joan Daemen和Vincent Rijmen所设计，结合两位作者的名字，以Rijdael之名命之，投稿高级加密标准的甄选流程。（Rijdael的发音近于 "Rhine doll"。）

# 快速入门


## java 实现

```java
package com.github.houbb.secret.core.util;

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

# 算法基础

严格地说，AES和Rijndael加密法并不完全一样（虽然在实际应用中二者可以互换），因为Rijndael加密法可以支持更大范围的区块和密钥长度：AES的区块长度固定为128位，密钥长度则可以是128，192或256位；而Rijndael使用的密钥和区块长度可以是32位的整数倍，以128位为下限，256位为上限。加密过程中使用的密钥是由Rijndael密钥生成方案产生。

大多数AES计算是在一个特别的有限域完成的。

AES加密过程是在一个4×4的字节矩阵上运作，这个矩阵又称为“体（state）”，其初值就是一个明文区块（矩阵中一个元素大小就是明文区块中的一个Byte）。（Rijndael加密法因支持更大的区块，其矩阵行数可视情况增加）加密时，各轮AES加密循环（除最后一轮外）均包含4个步骤：

## AddRoundKey

—矩阵中的每一个字节都与该次回合金钥（round key）做XOR运算；每个子密钥由密钥生成方案产生。

AddRoundKey步骤，回合密钥将会与原矩阵合并。在每次的加密循环中，都会由主密钥产生一把回合密钥（通过Rijndael密钥生成方案产生），这把密钥大小会跟原矩阵一样，以与原矩阵中每个对应的字节作异或（⊕）加法。

## SubBytes

通过一个非线性的替换函数，用查找表的方式把每个字节替换成对应的字节。

在SubBytes步骤中，矩阵中的各字节通过一个8位的S-box进行转换。这个步骤提供了加密法非线性的变换能力。 

S-box与GF（2）上的乘法反元素有关，已知具有良好的非线性特性。为了避免简单代数性质的攻击，S-box结合了乘法反元素及一个可逆的仿射变换矩阵建构而成。

此外在建构S-box时，刻意避开了固定点与反固定点，即以S-box替换字节的结果会相当于错排的结果。

## ShiftRows

—将矩阵中的每个横列进行循环式移位。

ShiftRows描述矩阵的行操作。

在此步骤中，每一行都向左循环位移某个偏移量。在AES中（区块大小128位），第一行维持不变，第二行里的每个字节都向左循环移动一格。同理，第三行及第四行向左循环位移的偏移量就分别是2和3。128位和192比特的区块在此步骤的循环位移的模式相同。经过ShiftRows之后，矩阵中每一竖列，都是由输入矩阵中的每个不同列中的元素组成。

Rijndael算法的版本中，偏移量和AES有少许不同；对于长度256比特的区块，第一行仍然维持不变，第二行、第三行、第四行的偏移量分别是1字节、3字节、4位组。除此之外，ShiftRows操作步骤在Rijndael和AES中完全相同。

## MixColumns

—为了充分混合矩阵中各个直行的操作。这个步骤使用线性转换来混合每内联的四个字节。

最后一个加密循环中省略MixColumns步骤，而以另一个AddRoundKey取代。

# AES加密模式

对称/分组密码一般分为流加密(如OFB、CFB等)和块加密(如ECB、CBC等)。

对于流加密，需要将分组密码转化为流模式工作。

对于块加密(或称分组加密)，如果要加密超过块大小的数据，就需要涉及填充和链加密模式。

## ECB(Electronic Code Book电子密码本)模式

ECB模式是最早采用和最简单的模式，它将加密的数据分成若干组，每组的大小跟加密密钥长度相同，然后每组都用相同的密钥进行加密。

优点:

1.简单；　2.有利于并行计算；　3.误差不会被传送；　

缺点:　

1.不能隐藏明文的模式；　2.可能对明文进行主动攻击；　因此，此模式适于加密小消息。


## CBC(Cipher Block Chaining，加密块链)模式

优点：

1.不容易主动攻击,安全性好于ECB,适合传输长度长的报文,是SSL、IPSec的标准。　

缺点：　

1.不利于并行计算；　2.误差传递；　3.需要初始化向量IV

## CFB(Cipher FeedBack Mode，加密反馈)模式

优点：

1.隐藏了明文模式;　2.分组密码转化为流模式;　3.可以及时加密传送小于分组的数据;　

缺点:　1.不利于并行计算;　2.误差传送：一个明文单元损坏影响多个单元;　3.唯一的IV;

## OFB(Output FeedBack，输出反馈)模式

优点:

1.隐藏了明文模式;　2.分组密码转化为流模式;　3.可以及时加密传送小于分组的数据;　

缺点:　1.不利于并行计算;　2.对明文的主动攻击是可能的;　3.误差传送：一个明文单元损坏影响多个单元。

## CTR(Counter，计数)模式

计数模式（CTR模式）加密是对一系列输入数据块(称为计数)进行加密，产生一系列的输出块，输出块与明文异或得到密文。

对于最后的数据块，可能是长u位的局部数据块，这u位就将用于异或操作，而剩下的b-u位将被丢弃（b表示块的长度）。

CTR解密类似。这一系列的计数必须互不相同的。

假定计数表示为T1, T2, …, Tn。

CTR模式可定义如下

CTR加密公式如下：
Cj = Pj XOR Ek(Tj)
C*n = P*n XOR MSBu(Ek(Tn)) j =1，2… n-1;
CTR解密公式如下：
Pj = Cj XOR Ek(Tj)
P*n = C*n XOR MSBu(Ek(Tn)) j =1，2 … n-1;

### 加密方式

加密方式：密码算法产生一个16 字节的伪随机码块流，伪随机码块与输入的明文进行异或运算后产生密文输出。

密文与同样的伪随机码进行异或运算后可以重产生明文。

CTR 模式被广泛用于 ATM 网络安全和 IPSec应用中，相对于其它模式而言，

CTR模式具有如下特点：

■ 硬件效率：允许同时处理多块明文 / 密文。

■ 软件效率：允许并行计算，可以很好地利用 CPU 流水等并行技术。

■ 预处理：算法和加密盒的输出不依靠明文和密文的输入，因此如果有足够的保证安全的存储器，加密算法将仅仅是一系列异或运算，这将极大地提高吞吐量。

■ 随机访问：第 i 块密文的解密不依赖于第 i-1 块密文，提供很高的随机访问能力

■ 可证明的安全性：能够证明 CTR 至少和其他模式一样安全（CBC, CFB, OFB, ...）

■ 简单性：与其它模式不同，CTR模式仅要求实现加密算法，但不要求实现解密算法。对于 AES 等加/解密本质上不同的算法来说，这种简化是巨大的。

■ 无填充，可以高效地作为流式加密使用。

■ 错误不传播：密文传输中每个比特位被错误反转, 仅只影响该密文所在区块的解密. 在CTR模式下, 经过k+1步的自同步后, 后续密文皆可以正确解密.(k表示区块长度128)

■ 必须配合消息验证码(MAC)使用.

■ 不能进行完整性校验: 密文传输过程中丢失比特位将导致后续比特位无法正确解密.


# 参考资料

[高级加密标准](https://baike.baidu.com/item/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86/468774?fromtitle=aes&fromid=5903)

[AES加密算法的详细介绍与实现](https://blog.csdn.net/qq_28205153/article/details/55798628)

[密码学基础：AES加密算法](https://zhuanlan.zhihu.com/p/78913397)

[第二篇：对称加密及AES加密算法](https://www.jianshu.com/p/3840b344b27c)

https://www.cnblogs.com/mx-lqk/p/10285379.html

[使用java实现AES加密](https://www.cnblogs.com/codegeekgao/p/8336118.html)

[Java使用AES-256加密](https://www.cnblogs.com/xxoome/p/13927481.html)

[JAVA AES加密与解密](https://blog.csdn.net/u011781521/article/details/77932321)

* any list
{:toc}