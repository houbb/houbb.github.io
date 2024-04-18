---
layout: post
title: web safe framework-03-JAVA安全SDK及编码规范
date:  2016-4-26 12:53:12 +0800
categories: [System-Design]
tags: [junit, framework, open-source, test]
published: true
---

### 关于我们

Website：https://security.immomo.com <br>

WeChat:<br> 
<img src="https://momo-mmsrc.oss-cn-hangzhou.aliyuncs.com/img-1c96a083-7392-3b72-8aec-bad201a6abab.jpeg" width="200" hegiht="200" align=center /><br>

[成员介绍](https://dwz.cn/yIyclLxZ)

### 项目简介

本项目包含两部分：

[java安全编码规范](https://github.com/momosecurity/rhizobia_J/wiki/JAVA%E5%AE%89%E5%85%A8%E7%BC%96%E7%A0%81%E8%A7%84%E8%8C%83
)和JAVA安全SDK，SDK介绍详见下述。


### 项目结构
```
├── LICENSE
├── README.md
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── immomo
    │   │           └── rhizobia
    │   │               └── rhizobia_J
    │   │                   ├── base
    │   │                   │   ├── SqliSanitiser.java
    │   │                   │   └── WhiteChecker.java
    │   │                   ├── crypto
    │   │                   │   ├── AESUtils.java
    │   │                   │   ├── ECDSAUtils.java
    │   │                   │   └── RSAUtils.java
    │   │                   ├── csrf
    │   │                   │   └── CSRFTokenUtils.java
    │   │                   ├── deserialization
    │   │                   │   └── SecureObjectInputStream.java
    │   │                   ├── extra
    │   │                   │   ├── LICENSE
    │   │                   │   ├── LICENSE-CONTENT
    │   │                   │   ├── LICENSE-README
    │   │                   │   ├── codecs
    │   │                   │   │   ├── AbstractCharacterCodec.java
    │   │                   │   │   ├── AbstractCodec.java
    │   │                   │   │   ├── AbstractIntegerCodec.java
    │   │                   │   │   ├── AbstractPushbackSequence.java
    │   │                   │   │   ├── Codec.java
    │   │                   │   │   ├── DB2Codec.java
    │   │                   │   │   ├── HTMLEntityCodec.java
    │   │                   │   │   ├── HashTrie.java
    │   │                   │   │   ├── JavaScriptCodec.java
    │   │                   │   │   ├── MySQLCodec.java
    │   │                   │   │   ├── OracleCodec.java
    │   │                   │   │   ├── PushBackSequenceImpl.java
    │   │                   │   │   ├── PushbackSequence.java
    │   │                   │   │   ├── PushbackString.java
    │   │                   │   │   └── Trie.java
    │   │                   │   └── commons
    │   │                   │       ├── CollectionsUtil.java
    │   │                   │       ├── EncoderConstants.java
    │   │                   │       ├── NullSafe.java
    │   │                   │       ├── RandomCreater.java
    │   │                   │       └── StringUtilities.java
    │   │                   ├── sqli
    │   │                   │   ├── DB2Sanitiser.java
    │   │                   │   ├── MysqlSanitiser.java
    │   │                   │   └── OracleSanitiser.java
    │   │                   ├── ssrf
    │   │                   │   └── SSRFWhiteChecker.java
    │   │                   ├── urlredirection
    │   │                   │   └── UrlRedirectionWhiteChecher.java
    │   │                   ├── xss
    │   │                   │   └── XssSanitiser.java
    │   │                   └── xxe
    │   │                       └── XmlUtils.java
    │   └── resources
    │       └── log4j.properties
    └── test
        └── java
            └── com
                └── immomo
                    └── rhizobia
                        └── rhizobia_J
                            ├── AESUtilsTest.java
                            ├── CSRFTokenUtilsTest.java
                            ├── DB2SanitiserTest.java
                            ├── ECDSAUtilsTest.java
                            ├── MysqlSanitiserTest.java
                            ├── OracleSanitiserTest.java
                            ├── RSAUtilsTest.java
                            ├── SSRFWhiteCheckerTest.java
                            ├── SafeClass.java
                            ├── SecureObjectInputStreamTest.java
                            ├── TestBean.java
                            ├── UnsafeClass.java
                            ├── UrlRedirectionWhiteChecherTest.java
                            ├── XmlUtilsTest.java
                            └── XssEncoderTest.java
```

## 目录

* [1、引用java security library](#importjsl)
* [2、SQL注入防护](#sqlInjection)
* [3、xss防护](#xss)
* [4、url重定向防护](#urlredirection)
* [5、SSRF防护](#ssrf)
* [6、CSRF防护](#csrf)
* [7、readObject反序列化漏洞防护](#readobjectdeserialization)
* [8、xxe防护](#xxe)
* [9、AES加解密](#aes)
* [10、RSA加解密](#rsa)
* [11、ECDSA 加签验签](#ecdsa)

<h3 id="importjsl">1、引用java security library</h3>

#### 环境需求
* Java 8
* Maven 3

#### a、编译jar包：
```
    mvn -Dmaven.test.skip=true clean install
```

#### b、引入java security library:
在target目录中找到target/rhizobia_J-1.0.jar，导入工程中

> 需要在自己的maven工程pom.xml中加入如下依赖
```
    <dependency>
        <groupId>log4j</groupId>
        <artifactId>log4j</artifactId>
        <version>1.2.17</version>
    </dependency>
    <dependency>
        <groupId>commons-codec</groupId>
        <artifactId>commons-codec</artifactId>
        <version>1.11</version>
    </dependency>
```

<h3 id="sqlInjection">2、SQL注入防护</h3>

#### a、确认是连接的是哪种数据库，选择对应的数据库编码，目前支持数据库包括：MySQL Oracle DB2:
```Java
    import com.immomo.rhizobia.rhizobia_J.sqli.MysqlSanitiser;
    //import com.immomo.rhizobia.rhizobia_J.sqli.OracleSanitiser;
    //import com.immomo.rhizobia.rhizobia_J.sqli.DB2Sanitiser;
    
    MysqlSanitiser sqlTool = MysqlSanitiser.getInstance();
```

#### b、对sql语句中拼接的参数进行转义:
```Java
    String id = "1' or '1'='1' #";
    String idEncode = sqlTool.mysqlSanitise(id);
    String query = "SELECT NAME FROM users WHERE id = '" + idEncode + "'";
```
__使用order by、group by等需要转换列名时，需使用带boolean参数__
```Java
    //保证列名中的下划线不被转义
    String columnName = "user_name";
    String columnNameEncode = sqlTool.mysqlSanitise(columnName, true);
    query = "SELECT NAME FROM users order by " + columnNameEncode ;
```

#### c、转义前后对比:
```Java
    转义前：SELECT NAME FROM users WHERE id = '1' or '1'='1' #'
    转义后：SELECT NAME FROM users WHERE id = '1\' or \'1\'\=\'1\' \#'
```

#### d、表名列名转义前后对比:
```Java
    转义前：SELECT NAME FROM users order by user_name
    转义后：SELECT NAME FROM users order by user_name
    转义前：SELECT NAME FROM users order by user-name
    转义后：SELECT NAME FROM users order by user\-name
```

<h3 id="xss">3、xss防护</h3>

#### a、调用XssSanitiser单例:
```Java
    import com.immomo.rhizobia.rhizobia_J.xss.XssSanitiser;
    
    XssSanitiser xssFilter = XssSanitiser.getInstance();
```

#### b、如果输出到html body:
```Java
    String ret = xssFilter.encodeForHTML(oriString);
```
过滤前后对比:
```Java
    过滤前：<script> alert('xss') </script>
    过滤后：&lt;script&gt;alert&#x28;&#x27;xss&#x27;&#x29;&lt;&#x2f;script&gt;
```

#### c、如果输出到html标签的属性(多了对空字符的过滤):
```Java
    String ret = xssFilter.encodeForHTMLAttribute(oriString);
```
过滤前后对比:
```Java
    过滤前：<script> alert('xss') </script>
    过滤后：&lt;script&gt;&#x20;alert&#x28;&#x27;xss&#x27;&#x29;&#x20;&lt;&#x2f;script&gt;
```

#### d、如果输出到JavaScript代码块中:
```Java
    String ret = xssFilter.encodeForJavaScript(oriString);
```
过滤前后对比:
```Java
    过滤前：alert('xss');
    过滤后：alert\x28\x27xss\x27\x29\x3B
```

<h3 id="urlredirection">4、url重定向防护</h3>

#### a、调用UrlRedirectionWhiteChecher单例:
```Java
    import com.immomo.rhizobia.rhizobia_J.urlredirection.UrlRedirectionWhiteChecher;
    
    UrlRedirectionWhiteChecher urlChecker = UrlRedirectionWhiteChecher.getInstance();
```

#### b、自定义白名单:
```Java
    List<String> whitelist = new ArrayList<String>();
    String white1=".trust1.com";
    String white2=".trust2.com";
    
    //setWhiteList会先清空原有白名单列表
    //在原有基础上新增白名单，使用addWhiteList(whitelist)
    urlChecker.setWhiteList(whitelist);

```

#### c、校验url:
```Java
    try{
        boolean isWhite = urlChecker.verifyURL(url.trim());
    } catch (Exception e) {
        ...
    }
```

<h3 id="ssrf">5、SSRF防护</h3>

#### a、调用SSRFWhiteChecker单例，与前面url重定向类似:
```Java
    import com.immomo.rhizobia.rhizobia_J.ssrf.SSRFWhiteChecker;
    
    SSRFWhiteChecker ssrfChecker = SSRFWhiteChecker.getInstance();
```

#### b、自定义白名单:
```Java
    List<String> whitelist = new ArrayList<String>();
    String white1=".trust1.com";
    String white2=".trust2.com";
    
    //setWhiteList会先清空原有白名单列表
    //在原有基础上新增白名单，使用addWhiteList(whitelist)
    ssrfChecker.setWhiteList(whitelist);

```

#### c、校验url:
```Java
    try{
        boolean isWhite = ssrfChecker.verifyURL(url.trim());
    } catch (Exception e) {
        ...
    }
```

<h3 id="csrf">6、CSRF防护</h3>

#### a、随机算出csrf token，并且每次生成随机值都不一样（实测结果连续生成1000亿次无重复）:
```Java
    import com.immomo.rhizobia.rhizobia_J.csrf.CSRFTokenUtils;

    CSRFTokenUtils csrfInstance = CSRFTokenUtils.getInstance();
    String token = csrfInstance.resetCsrfToken(32);
```
#### b、后端保存生成的token，以待校验（可以采用数据库、分布存储等任意存储手段）

#### c、前端页面加上hidden字段
**form中加入csrf token的hidden字段：**
```Jsp
    <input name="${(_csrf.parameterName)!}" value="${(_csrf.token)!}" type="hidden">
```

**ajax中加入csrf头**
```Jsp
    xhr.setRequestHeader("${_csrf.headerName}", "${_csrf.token}");
```

#### d、当前端向后端发送请求时，请求header中携带token，后端收到后与之前存储的token进行校验


<h3 id="readobjectdeserialization">7、readObject反序列化漏洞防护</h3>

#### a、选择适当的构造函数初始化，自定义白名单:

**使用SecureObjectInputStream中适当的构造函数，增加自定义的白名单**
```Java
    import com.immomo.rhizobia.rhizobia_J.deserialization.SecureObjectInputStream;

    SecureObjectInputStream(InputStream in, String[] classlist)
    SecureObjectInputStream(InputStream in, List<String> classlist)
```

#### b、使用安全的类SecureObjectInputStream，恢复非白名单中类的对象时会抛出异常:

```Java
    List<String> classlist = new ArrayList<String>();
    classlist.add(SafeClass.class.toString());
    
    try{   
        //考虑如果白名单为空时会影响正常判断逻辑，所以此处会抛出异常
        SecureObjectInputStream ois = new SecureObjectInputStream(fis, classlist);
        
        //使用安全的SecureObjectInputStream恢复对象时会抛出exception
        UnsafeClass objectFromDisk = (UnsafeClass)ois.readObject();
    } catch (Exception e) {
        ...
    }
```

<h3 id="xxe">8、xxe防护</h3>

### 8.1、解析xml内容为Document

#### a、初始化时注意xml编码格式:
```Java
    import com.immomo.rhizobia.rhizobia_J.xxe.XmlUtils;
    //如果xml格式包含外部实体，会抛异常
    try{
        Document doc =  XmlUtils.getInstance().newDocument(xmlFile, "utf-8");
    } catch (Exception e) {
        ...
    }
```

#### b、使用生成的Document对象:
```Java
    Node notifyNode = doc.getFirstChild();
    NodeList list = notifyNode.getChildNodes();
    for (int i = 0, length = list.getLength(); i < length; i++) {
        Node n = list.item(i);
        String nodeName = n.getNodeName();
        String nodeContent = n.getTextContent();
        System.out.println(nodeName.toString() + "    " + nodeContent.toString());
    }
```

### 8.2、解析xml内容为Bean 

#### a、自定义TestBean，然后调用converyToJavaBean解析:
```Java
    import com.immomo.rhizobia.rhizobia_J.xxe.XmlUtils;

    //如果xml格式包含外部实体，会抛异常
    XmlUtils xmlParser =  XmlUtils.getInstance();
    try {
        TestBean testbean = (TestBean)xmlParser.converyToJavaBean(xmlFile, TestBean.class);
    } catch (Exception e) {
        ...
    }
```

#### b、使用生成的bean对象:
```Java
    testbean.getTo()
    testbean.getFrom()
    testbean.getHeading()
    testbean.getBody()
```

<h3 id="aes">9、AES加解密</h3>

```
知识点1：oracle官方已经在如下版本去除了aes-256的限制，6u181，7u171，8u161，9 b148，openjdk7u
                 https://bugs.java.com/bugdatabase/view_bug.do?bug_id=JDK-8170157
 
知识点2：之所以AES、RSA没有封装base64或16进制编码处理，是因为在使用base64编码后的内容中，可能存在'+'字符，
              '+'字符返回给前端后再返回给后端时，如果不经过处理，会变为' '空格字符，
               所以请用户自行选择base64编码或16进制编码
               并在对加密内容进行base64编码时，请注意'+'字符
```

#### a、调用AESUtils:

```Java
    import com.immomo.rhizobia.rhizobia_J.crypto.AESUtils;
    
    AESUtils aesInstance = AESUtils.getInstance(String aesKey, String secretKey, String aesMode);
    /**
    参数说明：
        aesKey:     用于生成密钥的原始字符串，推荐使用session/id，具有唯一性
        secretKey:  加解密双方约定的secret
        aesMode:    值为null时，默认采用"AES/CBC/PKCS5Padding"
    */
    AESUtils aesInstance = AESUtils.getInstance("843739488","TcmEqGzSpH5S2VgoUix7HJ9cwqCofoUD",null);
```

#### b、加密

```Java
    String orginText = "10000";
    
    byte[] ciphertext = aesInstance.Encrypt(orginText);
    //由于返回是byte流，所以如果需要base64编码或转换成Hex，需另做处理
    String encryptRet = new BASE64Encoder().encode(ciphertext);
```

#### c、解密

```Java
    //同样，如果加密内容用base64编码或转换成Hex，解密时需另做处理
    byte[] encrypted = new BASE64Decoder().decodeBuffer(encryptRet);
    String DeString = aesInstance.Decrypt(encrypted);
```

<h3 id="rsa">10、RSA加解密 加签验签</h3>

```
知识点1：RSA加解密时，明文是有长度限制的，明文字符串限制长度 = 密钥长度(byte) - padding占用大小(byte)
         padding大小如下：
              RSA/ECB/PKCS1Padding or RSA             :   11
              RSA/ECB/OAEPWithSHA-1AndMGF1Padding     :   42
              RSA/ECB/OAEPWithSHA-256AndMGF1Padding   :   66
    
         例如：RSA密钥长度为1024(bit)/8 = 128(byte)，keyPairGenerator.initialize(1024)，
              在RSA/ECB/OAEPWithSHA-1AndMGF1Padding模式下，
              被加密的明文字符串长度不能超过 128-42 = 86
              
知识点2：同前一节aes的知识点2

知识点3：源码所用的signature类中，已经封装了摘要算法，所以可以不必再生成摘要，当然自已多生成摘要也没有问题

```

>[感谢LeadroyaL的issue](https://github.com/momosecurity/rhizobia_J/issues/1)


### 10.1、加解密

#### a、创建RSAUtils单例

1) 如密钥在文件中:

```Java
    import com.immomo.rhizobia.rhizobia_J.crypto.RSAUtils;
    
    /**
    参数说明：目前证书支持 PEM 格式
        priKeyPath:  openssl生成的私钥地址
        pubKeyPath:  openssl生成的公钥地址
    */
    String priKeyPath = "/tmp/pri.key";
    String pubKeyPath = "/tmp/pub.key";
    RSAUtils rsaInstance = RSAUtils.getInstance(priKeyPath, pubKeyPath);
```

2) 由于文件头尾格式有多种，根据需要调用set方法修改头尾后生成公私钥
   
```
   RSAUtils rsaInstance = RSAUtils.getInstance();
   rsaInstance.setPemPriHead("-----BEGIN PRIVATE KEY-----\n");
   rsaInstance.setPemPriEnd("-----END PRIVATE KEY-----");
   rsaInstance.setPemPubHead("-----BEGIN PUBLIC KEY-----\n");
   rsaInstance.setPemPubEnd("-----END PUBLIC KEY-----");
   rsaInstance.setPrivateKey(rsaInstance.getPrivateKey(priKeyPath));
   rsaInstance.setPublicKey(rsaInstance.getPublicKey(pubKeyPath));
```

3) 如果已有公私钥，也可直接用已有密钥生成单例

```
    //如下为生成公私钥的例子，用户可任意选用其他方法生成公私钥
    KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
    keyPairGenerator.initialize(512);
    KeyPair keyPair = keyPairGenerator.generateKeyPair();
    PublicKey rsaPublicKey = (PublicKey) keyPair.getPublic();
    PrivateKey rsaPrivateKey = (PrivateKey) keyPair.getPrivate();
    
    //生成单例
    RSAUtils rsaInstance = RSAUtils.getInstance(rsaPrivateKey, rsaPublicKey);
 ```

#### b、加密

```Java
    String plaintext = "123";

    //如知识点1，如果明文长度超过最大长度，可以用rsaInstance.encryptWithouLimit
    //或者自行将明文字符串拆分成对应的限制长度的块
    byte[] ciphertext = rsaInstance.encrypt(plaintext);
    
    //与aes一样返回是byte流，所以如果需要base64编码或转换成Hex，需另做处理
    String encryptRet = new BASE64Encoder().encode(ciphertext);
```

#### c、解密

```Java
    //同样，如果加密内容用base64编码或转换成Hex，解密时需另做处理
    byte[] encrypted = new BASE64Decoder().decodeBuffer(encryptRet);

    //如知识点1，如果使用了encryptWithouLimit加密，对应使用rsaInstance.decryptWithoutLimit进行解密
    String plaintext = rsaInstance.decrypt(ciphertext);
```

### 10.2、加签验签(更推荐使用ECDSA来实现加签验签，[参考](https://blog.cloudflare.com/ecdsa-the-digital-signature-algorithm-of-a-better-internet/))

#### a、加签

```Java
    //原文
    String plaintext = "123";

    byte[] sigintext = rsaInstance.sign(plaintext);
    //与aes一样返回是byte流，所以如果需要base64编码或转换成Hex，需另做处理
    String signtRet = new BASE64Encoder().encode(sigintext);
```

#### b、验签

```Java
    //同样，如果加密内容用base64编码或转换成Hex，解密时需另做处理
    byte[] verified = new BASE64Decoder().decodeBuffer(signtRet);
    boolean ifPass = rsaInstance.verify(verified, plaintext);
```

<h3 id="ecdsa">11、ECDSA 加签验签</h3>

#### a、创建ECDSAUtils单例

与前面一节RSA类似，也有三种获取单例的方法

```Java
    import com.immomo.rhizobia.rhizobia_J.crypto.ECDSAUtils;

    String priKeyPath = "/tmp/ECDSAPrivateKey.key";
    String pubKeyPath = "/tmp/ECDSAPublicKey.key";
    ECDSAUtils ecInstance = ECDSAUtils.getInstance(priKeyPath, pubKeyPath);

    //ECDSAUtils.getInstance()或ECDSAUtils.getInstance(ecPrivateKey, ecPublicKey)参照前面RSA章节
```

#### b、加签

```Java
    String plaintext = "123";

    byte[] sigintext = ecInstance.sign(plaintext);
    //与aes一样返回是byte流，所以如果需要base64编码或转换成Hex，需另做处理
    String signtRet = new BASE64Encoder().encode(sigintext);

```

#### c、验签
```Java
    //同样，如果加密内容用base64编码或转换成Hex，解密时需另做处理
    byte[] verified = new BASE64Decoder().decodeBuffer(signtRet);
    boolean ifPass = ecInstance.verify(verified, plaintext);
```

# 参考资料

https://github.com/momosecurity/rhizobia_J

* any list
{:toc}