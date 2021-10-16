---
layout: post
title: RSA 非对称加密算法原理详解及 java 实现 02 一点额外的思考
date:  2020-6-17 09:20:31 +0800
categories: [Algorithm]
tags: [algorithm, secret, sh]
published: true
---

# RSA加密简介

RSA加密是一种非对称加密。可以在不直接传递密钥的情况下，完成解密。

这能够确保信息的安全性，避免了直接传递密钥所造成的被破解的风险。

是由一对密钥来进行加解密的过程，分别称为公钥和私钥。

两者之间有数学相关，该加密算法的原理就是对一极大整数做因数分解的困难性来保证安全性。

通常个人保存私钥，公钥是公开的（可能同时多人持有）。

# RSA加密、签名区别

加密和签名都是为了安全性考虑，但略有不同。

常有人问加密和签名是用私钥还是公钥？

其实都是对加密和签名的作用有所混淆。

简单的说，**加密是为了防止信息被泄露，而签名是为了防止信息被篡改。**

这里举2个例子说明。

## 加密

第一个场景：战场上，B要给A传递一条消息，内容为某一指令。

RSA的加密过程如下：

（1）A生成一对密钥（公钥和私钥），私钥不公开，A自己保留。公钥为公开的，任何人可以获取。

（2）A传递自己的公钥给B，B用A的公钥对消息进行加密。

（3）A接收到B加密的消息，利用A自己的私钥对消息进行解密。

在这个过程中，只有2次传递过程，第一次是A传递公钥给B，第二次是B传递加密消息给A，即使都被敌方截获，也没有危险性，因为只有A的私钥才能对消息进行解密，防止了消息内容的泄露。

### 签名

第二个场景：A收到B发的消息后，需要进行回复“收到”。

RSA签名的过程如下：

（1）A生成一对密钥（公钥和私钥），私钥不公开，A自己保留。公钥为公开的，任何人可以获取。

（2）A用自己的私钥对消息加签，形成签名，并将加签的消息和消息本身一起传递给B。

（3）B收到消息后，在获取A的公钥进行验签，如果验签出来的内容与消息本身一致，证明消息是A回复的。

在这个过程中，只有2次传递过程，第一次是A传递加签的消息和消息本身给B，第二次是B获取A的公钥，即使都被敌方截获，也没有危险性，因为只有A的私钥才能对消息进行签名，即使知道了消息内容，也无法伪造带签名的回复给B，防止了消息内容的篡改。

但是，综合两个场景你会发现，第一个场景虽然被截获的消息没有泄露，但是可以利用截获的公钥，将假指令进行加密，然后传递给A。第二个场景虽然截获的消息不能被篡改，但是消息的内容可以利用公钥验签来获得，并不能防止泄露。所以在实际应用中，要根据情况使用，也可以同时使用加密和签名，比如A和B都有一套自己的公钥和私钥，当A要给B发送消息时，先用B的公钥对消息加密，再对加密的消息使用A的私钥加签名，达到既不泄露也不被篡改，更能保证消息的安全性。

总结：公钥加密、私钥解密、私钥签名、公钥验签。

# 代码

```java
import java.io.ByteArrayOutputStream;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import javax.crypto.Cipher;
import org.apache.commons.codec.binary.Base64;

public class TestRSA {

    /**
     * RSA最大加密明文大小
     */
    private static final int MAX_ENCRYPT_BLOCK = 117;

    /**
     * RSA最大解密密文大小
     */
    private static final int MAX_DECRYPT_BLOCK = 128;

    /**
     * 获取密钥对
     *
     * @return 密钥对
     */
    public static KeyPair getKeyPair() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(1024);
        return generator.generateKeyPair();
    }

    /**
     * 获取私钥
     *
     * @param privateKey 私钥字符串
     * @return
     */
    public static PrivateKey getPrivateKey(String privateKey) throws Exception {
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        byte[] decodedKey = Base64.decodeBase64(privateKey.getBytes());
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decodedKey);
        return keyFactory.generatePrivate(keySpec);
    }

    /**
     * 获取公钥
     *
     * @param publicKey 公钥字符串
     * @return
     */
    public static PublicKey getPublicKey(String publicKey) throws Exception {
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        byte[] decodedKey = Base64.decodeBase64(publicKey.getBytes());
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);
        return keyFactory.generatePublic(keySpec);
    }

    /**
     * RSA加密
     *
     * @param data 待加密数据
     * @param publicKey 公钥
     * @return
     */
    public static String encrypt(String data, PublicKey publicKey) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        int inputLen = data.getBytes().length;
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int offset = 0;
        byte[] cache;
        int i = 0;
        // 对数据分段加密
        while (inputLen - offset > 0) {
            if (inputLen - offset > MAX_ENCRYPT_BLOCK) {
                cache = cipher.doFinal(data.getBytes(), offset, MAX_ENCRYPT_BLOCK);
            } else {
                cache = cipher.doFinal(data.getBytes(), offset, inputLen - offset);
            }
            out.write(cache, 0, cache.length);
            i++;
            offset = i * MAX_ENCRYPT_BLOCK;
        }
        byte[] encryptedData = out.toByteArray();
        out.close();
        // 获取加密内容使用base64进行编码,并以UTF-8为标准转化成字符串
        // 加密后的字符串
        return new String(Base64.encodeBase64String(encryptedData));
    }

    /**
     * RSA解密
     *
     * @param data 待解密数据
     * @param privateKey 私钥
     * @return
     */
    public static String decrypt(String data, PrivateKey privateKey) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] dataBytes = Base64.decodeBase64(data);
        int inputLen = dataBytes.length;
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int offset = 0;
        byte[] cache;
        int i = 0;
        // 对数据分段解密
        while (inputLen - offset > 0) {
            if (inputLen - offset > MAX_DECRYPT_BLOCK) {
                cache = cipher.doFinal(dataBytes, offset, MAX_DECRYPT_BLOCK);
            } else {
                cache = cipher.doFinal(dataBytes, offset, inputLen - offset);
            }
            out.write(cache, 0, cache.length);
            i++;
            offset = i * MAX_DECRYPT_BLOCK;
        }
        byte[] decryptedData = out.toByteArray();
        out.close();
        // 解密后的内容
        return new String(decryptedData, "UTF-8");
    }

    /**
     * 签名
     *
     * @param data 待签名数据
     * @param privateKey 私钥
     * @return 签名
     */
    public static String sign(String data, PrivateKey privateKey) throws Exception {
        byte[] keyBytes = privateKey.getEncoded();
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey key = keyFactory.generatePrivate(keySpec);
        Signature signature = Signature.getInstance("MD5withRSA");
        signature.initSign(key);
        signature.update(data.getBytes());
        return new String(Base64.encodeBase64(signature.sign()));
    }

    /**
     * 验签
     *
     * @param srcData 原始字符串
     * @param publicKey 公钥
     * @param sign 签名
     * @return 是否验签通过
     */
    public static boolean verify(String srcData, PublicKey publicKey, String sign) throws Exception {
        byte[] keyBytes = publicKey.getEncoded();
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PublicKey key = keyFactory.generatePublic(keySpec);
        Signature signature = Signature.getInstance("MD5withRSA");
        signature.initVerify(key);
        signature.update(srcData.getBytes());
        return signature.verify(Base64.decodeBase64(sign.getBytes()));
    }

    public static void main(String[] args) {
        try {
            // 生成密钥对
            KeyPair keyPair = getKeyPair();
            String privateKey = new String(Base64.encodeBase64(keyPair.getPrivate().getEncoded()));
            String publicKey = new String(Base64.encodeBase64(keyPair.getPublic().getEncoded()));
            System.out.println("私钥:" + privateKey);
            System.out.println("公钥:" + publicKey);
            // RSA加密
            String data = "待加密的文字内容";
            String encryptData = encrypt(data, getPublicKey(publicKey));
            System.out.println("加密后内容:" + encryptData);
            // RSA解密
            String decryptData = decrypt(encryptData, getPrivateKey(privateKey));
            System.out.println("解密后内容:" + decryptData);

            // RSA签名
            String sign = sign(data, getPrivateKey(privateKey));
            // RSA验签
            boolean result = verify(data, getPublicKey(publicKey), sign);
            System.out.print("验签结果:" + result);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.print("加解密异常");
        }
    }
}
```

## 为什么需要分块

PS:RSA加密对明文的长度有所限制，规定需加密的明文最大长度=密钥长度-11（单位是字节，即byte），所以在加密和解密的过程中需要分块进行。

而密钥默认是1024位，即1024位/8位-11=128-11=117字节。

所以默认加密前的明文最大长度117字节，解密密文最大长度为128字。那么为啥两者相差11字节呢？

是因为RSA加密使用到了填充模式（padding），即内容不足117字节时会自动填满，用到填充模式自然会占用一定的字节，而且这部分字节也是参与加密的。

密钥长度的设置就是上面例子的第32行。

可自行调整，当然非对称加密随着密钥变长，安全性上升的同时性能也会有所下降。

# 常规流程

## 公司

假设有 2 家公司，A和B。

约定根据 RSA 生成公私钥，其中秘钥的长度使用默认的 1024 位。

A/B 两家公司互相交换公钥，私钥各自保留。

## 接口约定

String traceId: 全局跟踪号

long requestTime: 请求时间戳 linux 时间

String sign: 请求签名

其他请求的参数 body：xxx

## 公司A-向B 发起请求

【公司 A】

（1）数据签名：保障该消息为公司A发送，不可抵赖。

1.1 获取待加签的数据，比如以请求参数中的指定（规则）参数进行拼接，然后拼接为 params

1.2 对拼接完成后的 params 进行 md5 哈希，保证数据较少，结果为 md5

1.3 使用公司 A 的秘钥进行签名，获取结果 sign。

（2）数据加密：保障数据安全性，只有B可以解密查看。

对整体的请求体 body 对象，使用公司B的公钥加密，作为最新的请求体 bodySecurity。

【公司 B】

（1）数据解密：使用 B-秘钥 对 body 进行解密。

得到解密后的请求体：body

（2）签名验证：保障数据为A公司发起，不可篡改。

根据请求体中的 body，使用和加签相同的算法，构建出对应的 md52

使用 A-公钥，对 md52 和 sign 进行非对称验签。 

## 公司A-接收B 发起的请求

类似。

# 小结

# 参考资料

[RSA加密、解密、签名、验签的原理及方法](https://www.cnblogs.com/pcheng/p/9629621.html)

[rsa加解密的内容超长的问题解决](https://www.cnblogs.com/jpfss/p/8528406.html)

* any list
{:toc}