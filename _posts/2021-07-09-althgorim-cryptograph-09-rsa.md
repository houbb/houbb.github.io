---
layout: post
title: RSA 非对称加密算法原理详解及 java 实现
date:  2020-6-17 09:20:31 +0800
categories: [Algorithm]
tags: [algorithm, secret, sh]
published: true
---

# RSA 加密简介

RSA加密是一种非对称加密。

可以在不直接传递密钥的情况下，完成解密。

这能够确保信息的安全性，避免了直接传递密钥所造成的被破解的风险。

是由一对密钥来进行加解密的过程，分别称为公钥和私钥。

两者之间有数学相关，该加密算法的原理就是对一极大整数做因数分解的困难性来保证安全性。通常个人保存私钥，公钥是公开的（可能同时多人持有）。

# RSA加密、签名区别

加密和签名都是为了安全性考虑，但略有不同。常

有人问加密和签名是用私钥还是公钥？其实都是对加密和签名的作用有所混淆。

简单的说，**加密是为了防止信息被泄露，而签名是为了防止信息被篡改**。

这里举2个例子说明。

## 加密场景

第一个场景：战场上，B要给A传递一条消息，内容为某一指令。

RSA 的加密过程如下：

（1）A生成一对密钥（公钥和私钥），私钥不公开，A自己保留。公钥为公开的，任何人可以获取。

（2）A传递自己的公钥给B，B用A的公钥对消息进行加密。

（3）A接收到B加密的消息，利用A自己的私钥对消息进行解密。

在这个过程中，只有2次传递过程，第一次是A传递公钥给B，第二次是B传递加密消息给A，即使都被敌方截获，也没有危险性，因为只有A的私钥才能对消息进行解密，防止了消息内容的泄露。

第二个场景：A收到B发的消息后，需要进行回复“收到”。

## 签名场景

RSA 签名的过程如下：

（1）A生成一对密钥（公钥和私钥），私钥不公开，A自己保留。公钥为公开的，任何人可以获取。

（2）A用自己的私钥对消息加签，形成签名，并将加签的消息和消息本身一起传递给B。

（3）B收到消息后，在获取A的公钥进行验签，如果验签出来的内容与消息本身一致，证明消息是A回复的。

在这个过程中，只有2次传递过程，第一次是A传递加签的消息和消息本身给B，第二次是B获取A的公钥，即使都被敌方截获，也没有危险性，因为只有A的私钥才能对消息进行签名，即使知道了消息内容，也无法伪造带签名的回复给B，防止了消息内容的篡改。

但是，综合两个场景你会发现，第一个场景虽然被截获的消息没有泄露，但是可以利用截获的公钥，将假指令进行加密，然后传递给A。

第二个场景虽然截获的消息不能被篡改，但是消息的内容可以利用公钥验签来获得，并不能防止泄露。

所以在实际应用中，要根据情况使用，也可以同时使用加密和签名，比如A和B都有一套自己的公钥和私钥，当A要给B发送消息时，先用B的公钥对消息加密，再对加密的消息使用A的私钥加签名，达到既不泄露也不被篡改，更能保证消息的安全性。


# java 实现

## 工具类

```java
package com.github.houbb.secret.core.util;

import com.github.houbb.heaven.support.tuple.impl.Pair;
import com.github.houbb.secret.api.exception.SecretRuntimeException;

import javax.crypto.Cipher;
import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

/**
 * RSA 加密算法工具类
 *
 * @author binbin.hou
 * @since 0.0.9
 */
public final class RsaUtil {

    /**
     * 随机生成密钥对
     *
     * @since 0.0.9
     */
    public static Pair<String, String> genKeyPair() {
        try {
            // KeyPairGenerator类用于生成公钥和私钥对，基于RSA算法生成对象
            KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
            // 初始化密钥对生成器，密钥大小为96-1024位
            keyPairGen.initialize(1024, new SecureRandom());
            // 生成一个密钥对，保存在keyPair中
            KeyPair keyPair = keyPairGen.generateKeyPair();
            RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();   // 得到私钥
            RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();  // 得到公钥

            // 得到公钥字符串
            String publicKeyString = Base64Util.encodeToString(publicKey.getEncoded());
            // 得到私钥字符串
            String privateKeyString = Base64Util.encodeToString(privateKey.getEncoded());

            // 将公钥和私钥保存到Map
            return Pair.of(publicKeyString, privateKeyString);
        } catch (NoSuchAlgorithmException e) {
            throw new SecretRuntimeException(e);
        }
    }


    /**
     * RSA公钥加密
     *
     * @param plainText 待加密字符串
     * @param publicKey 公钥
     * @return 密文
     * @since 0.0.9
     */
    public static String encrypt(String plainText, String publicKey) {
        try {
            byte[] bytes = plainText.getBytes("UTF-8");
            return encrypt(bytes, publicKey);
        } catch (Exception e) {
            throw new SecretRuntimeException(e);
        }
    }

    /**
     * RSA公钥加密
     *
     * @param plainTextBytes 待加密字符串字节数组
     * @param publicKey 公钥
     * @return 密文
     * @since 0.0.9
     */
    public static String encrypt(byte[] plainTextBytes, String publicKey) {
        try {
            //base64编码的公钥
            byte[] decoded = Base64Util.decode(publicKey);
            RSAPublicKey pubKey = (RSAPublicKey) KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(decoded));
            //RSA加密
            Cipher cipher = Cipher.getInstance("RSA");
            cipher.init(Cipher.ENCRYPT_MODE, pubKey);
            byte[] doFinalBytes = cipher.doFinal(plainTextBytes);
            return Base64Util.encodeToString(doFinalBytes);
        } catch (Exception e) {
            throw new SecretRuntimeException(e);
        }
    }

    /**
     * RSA私钥解密
     *
     * @param str        加密字符串
     * @param privateKey 私钥
     * @return 铭文
     * @since 解密
     */
    public static String decrypt(String str, String privateKey) {
        try {
            //64位解码加密后的字符串
            byte[] inputByte = Base64Util.decode(str);
            //base64编码的私钥
            byte[] decoded = Base64Util.decode(privateKey);

            RSAPrivateKey priKey = (RSAPrivateKey) KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(decoded));
            //RSA解密
            Cipher cipher = Cipher.getInstance("RSA");
            cipher.init(Cipher.DECRYPT_MODE, priKey);
            return new String(cipher.doFinal(inputByte));
        } catch (Exception e) {
            throw new SecretRuntimeException(e);
        }
    }

}
```

## 测试代码

```java
public static void main(String[] args) {
    //加密字符串
    String message = "123456";
    Pair<String, String> keyPair = RsaUtil.genKeyPair();
    String publicKey = keyPair.getValueOne();
    String privateKey = keyPair.getValueTwo();
    System.out.println("随机生成的公钥为: " + publicKey);
    System.out.println("随机生成的私钥为: " + privateKey);
    String messageEn = RsaUtil.encrypt(message, publicKey);
    System.out.println(message + " 加密后的字符串为: " + messageEn);
    String messageDe = RsaUtil.decrypt(messageEn, privateKey);
    System.out.println("还原后的字符串为: " + messageDe);
}
```

日志如下：

```
随机生成的公钥为: MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCuOGUlqdhgu5RRFhZd1zRRJHcQblj8o57WcBObgSNMQ8LuAaoRT4OAyYOOAW6qAMaGy8RINr5GEOzESLmXW4lH9xEE856K3Z4FvfX02VvX4ll7jZBSjuGpEWoy/2wYn0Fk5hfvp21bvLK61enumsvbOturIIQQ1tdP5fPTYJa3dQIDAQAB
随机生成的私钥为: MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAK44ZSWp2GC7lFEWFl3XNFEkdxBuWPyjntZwE5uBI0xDwu4BqhFPg4DJg44BbqoAxobLxEg2vkYQ7MRIuZdbiUf3EQTznordngW99fTZW9fiWXuNkFKO4akRajL/bBifQWTmF++nbVu8srrV6e6ay9s626sghBDW10/l89Nglrd1AgMBAAECgYAiCvcIwwV68Wxr48r/Dzwz1tJFLarJwxcYg9HxAuzozBzc8QpQU584nSfNqc37/ibM1ChIjBnmCwyY1jUdtE9ApCfEs9P1t9x8Z7N0ZdEGu7S1rJg7FMs1LoRV+YzlG20r/Jho4rJo2oBtMTBxD+DOVc8RpanwCegOV7Y9H4awyQJBANMzpH1ODs6djItuBG9glSjuyxYfP65I1Gtw4Zkr6IYF1mmulxO6DpRuLbv4ka6WOISRHIFYKVSygDMHHLHzoWMCQQDTLKR6dY5p4AsV08gWZGZ+LPh8meatdIc1y885A7kboD26fpYgP6UElDMw8Hp2YyuEAbjeB8RobxduELhTe8dHAkAc3KXR6eTkH2uhcjtw7QX1PgzKzSJqstE0jYyG3hU8m3edoZpLu9VaO2RMl79w2F6I3zvCAUZEqNAUKRimyOB5AkEAu3L/NWywU676aA+rpqTMjefhUslSCFpNwyT89sElSS5+XNMM8+dK1buvjRuJuRjigbT9oqkGYSVriNnypLhU9QJAAQ3eadTGK3FKhBBIZESfiekMza9wX92suMdHHXU+emrmwjEHdkjC76xY993H7vtmkaDiPy7Di7rZc4M0EGTdkA==

123456 加密后的字符串为: FoOz4P39hQSaWVkl5w6+3s2Y5kzcNbW3ghxG7xCvVeK6dMaPC9qqhPunhneOaFAIb2PsD3jga7hNNwQFMRjClXVKSUVXb6/2M23oRSoxL0t1+2mWU7+WN3GIbcRFtRHjbWTZQEwY+y6citQvvqKB925ABctydaB32OmjuU8fAGM=
还原后的字符串为: 123456
```


# 传统加密算法

1976年以前，所有的加密方法都是同一种模式：

（1）甲方选择某一种加密规则，对信息进行加密；

（2）乙方使用同一种规则，对信息进行解密。

由于加密和解密使用同样规则（简称"密钥"），这被称为"对称加密算法"（Symmetric-key algorithm）。

这种加密模式有一个最大弱点：**甲方必须把加密规则告诉乙方，否则无法解密**。

保存和传递密钥，就成了最头疼的问题。

# 非对称加密算法

1976年，两位美国计算机学家Whitfield Diffie 和 Martin Hellman，提出了一种崭新构思，可以在不直接传递密钥的情况下，完成解密。这被称为"Diffie-Hellman密钥交换算法"。这个算法启发了其他科学家。人

们认识到，加密和解密可以使用不同的规则，只要这两种规则之间存在某种对应关系即可，这样就避免了直接传递密钥。

这种新的加密模式被称为"非对称加密算法"。

（1）乙方生成两把密钥（公钥和私钥）。公钥是公开的，任何人都可以获得，私钥则是保密的。

（2）甲方获取乙方的公钥，然后用它对信息加密。

（3）乙方得到加密后的信息，用私钥解密。

如果公钥加密的信息只有私钥解得开，那么只要私钥不泄漏，通信就是安全的。

1977年，三位数学家Rivest、Shamir 和 Adleman 设计了一种算法，可以实现非对称加密。这种算法用他们三个人的名字命名，叫做RSA算法。

从那时直到现在，RSA算法一直是最广为使用的"非对称加密算法"。毫不夸张地说，只要有计算机网络的地方，就有RSA算法。

这种算法非常可靠，密钥越长，它就越难破解。根据已经披露的文献，目前被破解的最长RSA密钥是768个二进制位。也就是说，长度超过768位的密钥，还无法破解（至少没人公开宣布）。因此可以认为，1024位的RSA密钥基本安全，2048位的密钥极其安全。

下面，我就进入正题，解释RSA算法的原理。文章共分成两部分，今天是第一部分，介绍要用到的四个数学概念。

你可以看到，RSA算法并不难，只需要一点数论知识就可以理解。

# 数学概念

## 互质

从小学开始，我们就了解了什么是质数。

互质是针对多个数字而言的，如果两个正整数，除了1以外，没有其他公因子，那么就称这两个数是互质关系（注意，这里并没有说这两个数一定是质数或有一个为质数。比如15跟4就是互质关系）。

以下有一些关于质数与互质的性质：

- 质数只能被1和它自身整除

- 任意两个质数都是互质关系

- 如果两个数之中，较大的那个数是质数，则两者构成互质关系

- 如果两个数之中，较小的那个数是质数，且较大数不为较小数的整数倍，则两者构成互质关系

- 1和任意一个自然数是都是互质关系

- p是大于1的整数，则p和p-1构成互质关系

- p是大于1的奇数，则p和p-2构成互质关系

## 欧拉函数

欧拉函数是求小于x并且和x互质的数的个数。

其通式为：`φ(x) = x(1-1/p1)(1-1/p2)(1-1/p3)(1-1/p4)…..(1-1/pn)`。

其中p1, p2……pn为x的所有质因数，x是不为0的整数。看到这里是不是有一些头疼，太理论的东西的确不够具象。

我们且不去理会后面公式计算与论证，因为已经超出本文的范围了。

就前一句来说说吧，欧拉函数是求小于x并且和x互质的数的个数。

这里我可以列举一个例子：

令x = 16，那么x的所有质因数为：φ(16) = 16 * (1 - 1/2) = 8

我们也可以枚举出所有比16小，且与16互质的数：1, 3, 5, 7, 9, 11, 13, 15

### 性质

现在也给出部分欧拉函数的性质：

- 若n是素数p的k次幂，φ(n) = p^k - p^(k-1) = (p - 1) * p^(k-1)，因为除了p的倍数外，其他数都跟n互质

- 欧拉函数是积性函数——若m,n互质，φ(mn) =  φ(m) * φ(n)

- 当n为奇数时，φ(2n) = φ(n)

- p是素数，φ(p) = p-1，φ(p)称为p的欧拉值

欧拉函数更多参考请见这里的链接。

### 证明

证明：

若n= ∏ p^α

则φ(n)=∏(p-1)p^(α-1)=n∏(1-1/p)

∵欧拉函数是积性函数

所以有：φ(x)=x(1-1/p1)(1-1/p2)(1-1/p3)(1-1/p4)…..(1-1/pn)

### java 实现

```java
int Euler(int n){
	int res = n,i;
 
	for(i=2;i * i <= n;i++)
	if(n%i == 0){
		n /=i ;
		res = res - res/i;
		while(n % i ==0)
			n/=i;
	}
 
	if (n > 1)   
        res = res - res/n; 
   	return res;
}
```

## 模反元素

定义：如果两个正整数a和n互质，那么一定可以找到整数b，使得 ab-1 被n整除，或者说ab被n除的余数是1。

关于模反元素的求解，使用的是朴素的解法。

如果读者想要更进一步了解的话，请自行搜索其他解法（比如：辗转相除法、欧几里德算法）。

# RSA 原理

在 RSA 原理之前，我想还是有必要了解一下非对称加密算法的加密跟解密过程。

## 流程图

下面就是一幅非称加密算法的流程图。

![流程图](https://img-blog.csdn.net/20160229125147957)

在此可以看到，非对称加密是通过两个密钥（公钥-私钥）来实现对数据的加密和解密的。

公钥用于加密，私钥用于解密。

对于非对称的加密和解密为什么可以使用不同的密钥来进行，这些都是数学上的问题了。

不同的非对称加密算法也会应用到不同的数学知识。

上面也对RSA中使用的数学问题做了一个小小的介绍。

现在就来看看RSA算法是怎么来对数据进行加密的吧，如下是一幅RSA加密算法流程及加密过程图。

## 加解密过程

![加解密过程](https://img-blog.csdn.net/20160229125349303)




# RSA 算法

## 密钥生成的步骤

我们通过一个例子，来理解RSA算法。

假设爱丽丝要与鲍勃进行加密通信，她该怎么生成公钥和私钥呢？

第一步，随机选择两个不相等的质数p和q。

爱丽丝选择了61和53。（实际应用中，这两个质数越大，就越难破解。）

第二步，计算p和q的乘积n。

爱丽丝就把61和53相乘。

n = 61×53 = 3233

n的长度就是密钥长度。3233写成二进制是110010100001，一共有12位，所以这个密钥就是12位。实际应用中，RSA密钥一般是1024位，重要场合则为2048位。

第三步，计算n的欧拉函数φ(n)。

n是质数，则 φ(n)=n-1
n = p1 × p2
φ(n) = φ(p1p2) = φ(p1)φ(p2)
=> φ(n) = (p-1)(q-1)

爱丽丝算出φ(3233)等于60×52，即3120。

第四步，随机选择一个整数e，条件是1< e < φ(n)，且e与φ(n) 互质。

爱丽丝就在1到3120之间，随机选择了17。（实际应用中，常常选择65537。）

第五步，计算e对于φ(n)的模反元素d。

所谓”模反元素”就是指有一个整数d，可以使得ed被φ(n)除的余数为1。

ed ≡ 1 (mod φ(n))

这个式子等价于

ed - 1 = kφ(n)

于是，找到模反元素d，实质上就是对下面这个二元一次方程求解。(-k = y)

ex + φ(n)y = 1

已知 e=17, φ(n)=3120，

17x + 3120y = 1

这个方程可以用“扩展欧几里得算法”(又叫辗转相除法)求解，此处省略具体过程。总之，爱丽丝算出一组整数解为 (x,y)=(2753,-15)，即 d=2753。

至此所有计算完成。

第六步，将n和e封装成公钥，n和d封装成私钥。

在爱丽丝的例子中，n=3233，e=17，d=2753，所以公钥就是 (3233,17)，私钥就是（3233, 2753）。

实际应用中，公钥和私钥的数据都采用ASN.1格式表达。



## RSA算法的可靠性

回顾上面的密钥生成步骤，一共出现六个数字：

```
p
q
n
φ(n)
e
d
```

这六个数字之中，公钥用到了两个（n和e），其余四个数字都是不公开的。

其中最关键的是d，因为n和d组成了私钥，一旦d泄漏，就等于私钥泄漏。

那么，有无可能在已知n和e的情况下，推导出d？

（1）ed≡1 (mod φ(n))。只有知道e和φ(n)，才能算出d。

（2）φ(n)=(p-1)(q-1)。只有知道p和q，才能算出φ(n)。

（3）n=pq。只有将n因数分解，才能算出p和q。

结论：如果n可以被因数分解，d就可以算出，也就意味着私钥被破解。

可是，大整数的因数分解，是一件非常困难的事情。

目前，除了暴力破解，还没有发现别的有效方法。

维基百科这样写道：

“对极大整数做因数分解的难度决定了RSA算法的可靠性。换言之，对一极大整数做因数分解愈困难，RSA算法愈可靠。
假如有人找到一种快速因数分解的算法，那么RSA的可靠性就会极度下降。但找到这样的算法的可能性是非常小的。今天只有短的RSA密钥才可能被暴力破解。到2008年为止，世界上还没有任何可靠的攻击RSA算法的方式。
只要密钥长度足够长，用RSA加密的信息实际上是不能被解破的。”

举例来说，你可以对3233进行因数分解（61×53），但是你没法对下面这个整数进行因数分解。

```
12301866845301177551304949 　　58384962720772853569595334 　　79219732245215172640050726 　　36575187452021997864693899 　　56474942774063845925192557 　　32630345373154826850791702 　　61221429134616704292143116 　　02221240479274737794080665 　　351419597459856902143413
```

它等于这样两个质数的乘积：

```
33478071698956898786044169
84821269081770479498371376
85689124313889828837938780
02287614711652531743087737
814467999489
　　　×
36746043666799590428244633
79962795263227915816434308
76426760322838157396665112
79233373417143396810270092
798736308917
```

事实上，这大概是人类已经分解的最大整数（232个十进制位，768个二进制位）。

比它更大的因数分解，还没有被报道过，因此目前被破解的最长RSA密钥就是768位。

## RSA算法的加密和解密

有了公钥和密钥，就能进行加密和解密了。

(1) 加密要用公钥(n,e)

假设鲍勃要向爱丽丝发送加密信息m，他就要用爱丽丝的公钥 (n,e) 对m进行加密。这里需要注意，m必须是整数（字符串可以取ascii值或unicode值），且m必须小于n。

所谓”加密”，就是算出下式的c：

me ≡ c (mod n)

爱丽丝的公钥是 (3233, 17)，鲍勃的m假设是65，那么可以算出下面的等式：

65^17 ≡ 2790 (mod 3233)
于是，c等于2790，鲍勃就把2790发给了爱丽丝。

(2) 解密要用私钥(n,d)

爱丽丝拿到鲍勃发来的2790以后，就用自己的私钥(3233, 2753) 进行解密。可以证明，下面的等式一定成立：

cd ≡ m (mod n)

也就是说，c的d次方除以n的余数为m。现在，c等于2790，私钥是(3233, 2753)，那么，爱丽丝算出

2790^2753 ≡ 65 (mod 3233)

因此，爱丽丝知道了鲍勃加密前的原文就是65。

至此，”加密–解密”的整个过程全部完成。

我们可以看到，如果不知道d，就没有办法从c求出m。而前面已经说过，要知道d就必须分解n，这是极难做到的，所以RSA算法保证了通信安全。

你可能会问，公钥(n,e) 只能加密小于n的整数m，那么如果要加密大于n的整数，该怎么办？

有两种解决方法：一种是把长信息分割成若干段短消息，每段分别加密；另一种是先选择一种”对称性加密算法”（比如DES），用这种算法的密钥加密信息，再用RSA公钥加密DES密钥。

# 算法优缺点

## 优点

不需要进行密钥传递，提高了安全性

可以进行数字签名认证

## 缺点

加密解密效率不高，一般只适用于处理小量数据（如：密钥）

容易遭受小指数攻击

# 小结

信息时代，一直在追求 2 个指标：速度与安全（不是激情）。

安全算法也永远随着时代的进步而不断演变，是一场永不停息的攻防之战。

针对本文的所有算法，我都做了统一的编码实现汇总，便于大家使用。感兴趣的可以关注【老马啸西风】，后台回复【加密】即可获取。

另外，有时间我们可以聊一聊不可逆加密，以及非对称加密。

我是老马，期待与你的下次重逢。


# 参考资料

https://baike.baidu.com/item/RSA%E7%AE%97%E6%B3%95/263310

[RSA 加密、解密、签名、验签的原理及方法](https://www.cnblogs.com/pcheng/p/9629621.html)

[RSA 加密算法原理](https://blog.csdn.net/a745233700/article/details/102341542)

https://www.bejson.com/enc/rsa/

[RSA 加密算法原理简述](https://blog.csdn.net/gulang03/article/details/81176133)

[RSA算法原理（一）](http://www.ruanyifeng.com/blog/2013/06/rsa_algorithm_part_one.html)

[RSA算法原理](https://zhuanlan.zhihu.com/p/48249182)

https://www.cnblogs.com/coolYuan/p/9168284.html

https://www.jianshu.com/p/ad3d1dea63af

https://www.zhihu.com/question/25038691

* any list
{:toc}