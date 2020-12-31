---
layout: post
title: Shiro-08-Cryptography 编码加密
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 编码/加密

在涉及到密码存储问题上，应该加密/生成密码摘要存储，而不是存储明文密码。比如之前
的 600w csdn 账号泄露对用户可能造成很大损失， 因此应加密/生成不可逆的摘要方式存储。


## 编码/解码

Shiro 提供了 base64 和 16 进制字符串编码/解码的 API 支持， 方便一些编码解码操作。 

Shiro 内部的一些数据的存储/表示都使用了 base64 和 16 进制字符串。

```java
String str = "hello";
String base64Encoded = Base64.encodeToString(str.getBytes());
String str2 = Base64.decodeToString(base64Encoded);
Assert.assertEquals(str, str2);
```

通过如上方式可以进行 base64 编码/解码操作，更多 API 请参考其 Javadoc。

```java
String str = "hello";
String base64Encoded = Hex.encodeToString(str.getBytes());
String str2 = new String(Hex.decode(base64Encoded.getBytes()));
Assert.assertEquals(str, str2);
```

通过如上方式可以进行 16 进制字符串编码/解码操作，更多 API 请参考其 Javadoc。

还有一个可能经常用到的类 CodecSupport，提供了 `toBytes(str, "utf-8") / toString(bytes,"utf-8")` 用于在 byte 数组/String 之间转换。

# 散列算法

散列算法一般用于生成数据的摘要信息，是一种不可逆的算法，一般适合存储密码之类的数据，常见的散列算法如 MD5、SHA 等。

一般进行散列时最好提供一个 salt（盐），比如加密密码“admin”，产生的散列值是“21232f297a57a5a743894a0e4a801fc3”，可以到一些 md5 解密网站很容易的通过散列值得到密码“admin”，即如果直接对密码进行散列相对来说破解更容易， 此时我们可以加一些只有系统知道的干扰数据， 如用户名和 ID （即盐）；这样散列的对象是“密码+用户名+ID”，这样生成的散列值相对来说更难破解。

```java
String str = "hello";
String salt = "123";
String md5 = new Md5Hash(str, salt).toString();//还可以转换为 toBase64()/toHex()
```

如上代码通过盐“123”MD5 散列“hello”。

另外散列时还可以指定散列次数，如 2 次表示：md5(md5(str))：“new Md5Hash(str, salt, 2).toString()”。

```java
String str = "hello";
String salt = "123";
String sha1 = new Sha256Hash(str, salt).toString();
```

使用 SHA256 算法生成相应的散列数据，另外还有如 SHA1、SHA512 算法。

## 通用的散列支持

```java
String str = "hello";
String salt = "123";
//内部使用 MessageDigest
String simpleHash = new SimpleHash("SHA-1", str, salt).toString();
```

通过调用 SimpleHash 时指定散列算法，其内部使用了 Java 的 MessageDigest 实现。

为了方便使用，Shiro 提供了 HashService，默认提供了 DefaultHashService 实现。

```java
DefaultHashService hashService = new DefaultHashService(); 
hashService.setHashAlgorithmName("SHA-512"); //默认算法 SHA-512
hashService.setPrivateSalt(new SimpleByteSource("123")); //私盐，默认无
hashService.setGeneratePublicSalt(true);//是否生成公盐，默认 false
hashService.setRandomNumberGenerator(new SecureRandomNumberGenerator());//用于生成公盐。默认就这个
hashService.setHashIterations(1); //生成 Hash 值的迭代次数

HashRequest request = new HashRequest.Builder()
.setAlgorithmName("MD5").setSource(ByteSource.Util.bytes("hello"))
.setSalt(ByteSource.Util.bytes("123")).setIterations(2).build();
String hex = hashService.computeHash(request).toHex();
```

1、首先创建一个 DefaultHashService，默认使用 SHA-512 算法；

2、可以通过 hashAlgorithmName 属性修改算法；

3、可以通过 privateSalt 设置一个私盐，其在散列时自动与用户传入的公盐混合产生一个新
盐；

4、可以通过 generatePublicSalt 属性在用户没有传入公盐的情况下是否生成公盐；

5、可以设置 randomNumberGenerator 用于生成公盐；

6、可以设置 hashIterations 属性来修改默认加密迭代次数；

7、需要构建一个 HashRequest，传入算法、数据、公盐、迭代次数。

SecureRandomNumberGenerator 用于生成一个随机数：

```java
SecureRandomNumberGenerator randomNumberGenerator = new SecureRandomNumberGenerator();
randomNumberGenerator.setSeed("123".getBytes());
String hex = randomNumberGenerator.nextBytes().toHex();
```

# 加密/解密

Shiro 还提供对称式加密/解密算法的支持，如 AES、Blowfish 等；当前还没有提供对非对称加密/解密算法支持，未来版本可能提供。

## AES 算法

```java
AesCipherService aesCipherService = new AesCipherService();
aesCipherService.setKeySize(128); //设置 key 长度
//生成 key
Key key = aesCipherService.generateNewKey();
String text = "hello";
//加密
String encrptText =
aesCipherService.encrypt(text.getBytes(), key.getEncoded()).toHex();
//解密
String text2 =
new String(aesCipherService.decrypt(Hex.decode(encrptText), key.getEncoded()).getBytes());
Assert.assertEquals(text, text2);
```

# PasswordService/CredentialsMatcher

## 接口

Shiro 提供了 PasswordService 及 CredentialsMatcher 用于提供加密密码及验证密码服务。

- PasswordService

```java
public interface PasswordService {
//输入明文密码得到密文密码
String encryptPassword(Object plaintextPassword) throws IllegalArgumentException;
}
```

- CredentialsMatcher

```java
public interface CredentialsMatcher {
//匹配用户输入的 token 的凭证（未加密）与系统提供的凭证（已加密）
boolean doCredentialsMatch(AuthenticationToken token, AuthenticationInfo info);
}
```

## 自定义

Shiro 默认提供了 PasswordService 实现 DefaultPasswordService；CredentialsMatcher 实现 PasswordMatcher 及 HashedCredentialsMatcher（更强大）。

DefaultPasswordService  配合 PasswordMatcher 实现简单的密码加密与验证服务

### 1、定义 Realm

```java
public class MyRealm extends AuthorizingRealm {

private PasswordService passwordService;

public void setPasswordService(PasswordService passwordService) {
    this.passwordService = passwordService;
}

//省略 doGetAuthorizationInfo，具体看代码
@Override
protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws
    AuthenticationException {
        return new SimpleAuthenticationInfo("ryo", passwordService.encryptPassword("123"), getName());
    }
}
```

为了方便，直接注入一个 passwordService 来加密密码，实际使用时需要在 Service 层使用 passwordService 加密密码并存到数据库。

### ini 配置

- shiro-passwordservice.ini

```ini
[main]
passwordService=org.apache.shiro.authc.credential.DefaultPasswordService
hashService=org.apache.shiro.crypto.hash.DefaultHashService
passwordService.hashService=$hashService
hashFormat=org.apache.shiro.crypto.hash.format.Shiro1CryptFormat
passwordService.hashFormat=$hashFormat
hashFormatFactory=org.apache.shiro.crypto.hash.format.DefaultHashFormatFactory
passwordService.hashFormatFactory=$hashFormatFactory
passwordMatcher=org.apache.shiro.authc.credential.PasswordMatcher
passwordMatcher.passwordService=$passwordService
myRealm=com.github.zhangkaitao.shiro.chapter5.hash.realm.MyRealm
myRealm.passwordService=$passwordService
myRealm.credentialsMatcher=$passwordMatcher
securityManager.realms=$myRealm
```

2.1、passwordService 使用 DefaultPasswordService，如果有必要也可以自定义；

2.2、hashService 定义散列密码使用的 HashService，默认使用 DefaultHashService（默认SHA-256 算法）；

2.3、hashFormat 用于对散列出的值进行格式化，默认使用 Shiro1CryptFormat，另外提供了Base64Format 和 HexFormat，对于有 salt 的密码请自定义实现 ParsableHashFormat 然后把salt 格式化到散列值中；

2.4、 hashFormatFactory 用于根据散列值得到散列的密码和 salt； 因为如果使用如 SHA 算法，那么会生成一个 salt，此 salt 需要保存到散列后的值中以便之后与传入的密码比较时使用；默认使用 DefaultHashFormatFactory；

2.5、passwordMatcher 使用 PasswordMatcher，其是一个 CredentialsMatcher 实现；

2.6、将 credentialsMatcher 赋值给 myRealm，myRealm 间接继承了 AuthenticatingRealm，其在调用 getAuthenticationInfo 方法获取到 AuthenticationInfo 信 息 后 ， 会使用 credentialsMatcher 来验证凭据是否匹配，如果不匹配将抛出 IncorrectCredentialsException 异常。

如上方式的缺点是：salt 保存在散列值中；没有实现如密码重试次数限制。

## HashedCredentialsMatcher 实 实 现 密码验证 服务

Shiro 提供了 CredentialsMatcher 的散列实现 HashedCredentialsMatcher， 和之前的 PasswordMatcher 不同的是， 它只用于密码验证， 且可以提供自己的盐， 而不是随机生成盐，
且生成密码散列值的算法需要自己写，因为能提供自己的盐。

### 1、 生成密码散列值

此处我们使用 MD5 算法，“密码+盐（用户名+随机数）”的方式生成散列值：

```java
String algorithmName = "md5";
String username = "liu";
String password = "123";
String salt1 = username;
String salt2 = new SecureRandomNumberGenerator().nextBytes().toHex();
int hashIterations = 2;
SimpleHash hash = new SimpleHash(algorithmName, password, salt1 + salt2, hashIterations);
```

如果要写用户模块，需要在新增用户/重置密码时使用如上算法保存密码，将生成的密码及salt2 存入数据库（因为我们的散列算法是：md5(md5(密码+username+salt2))）。

### 2、生成 Realm

```java
protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
    String username = "liu"; //用户名及 salt1
    String password = "202cb962ac59075b964b07152d234b70"; //加密后的密码
    String salt2 = "202cb962ac59075b964b07152d234b70";
    SimpleAuthenticationInfo ai = new SimpleAuthenticationInfo(username, password, getName());
    ai.setCredentialsSalt(ByteSource.Util.bytes(username+salt2)); //盐是用户名+随机数
    return ai;
}
```

此 处 就 是 把 步 骤 1 中 生 成 的 相 应 数 据 组 装 为 SimpleAuthenticationInfo ， 通 过 SimpleAuthenticationInfo 的 credentialsSalt 设置盐，HashedCredentialsMatcher 会自动识别这个盐。

如果使用 JdbcRealm， 需要修改获取用户信息 （包括盐） 的 sql： “select password, password_salt from users where username = ?”，而我们的盐是由 username+password_salt 组成，所以需要 通过如下 ini 配置（shiro-jdbc-hashedCredentialsMatcher.ini）修改：

```ini
jdbcRealm.saltStyle=COLUMN
jdbcRealm.authenticationQuery=select password, concat(username,password_salt) from users where username = ?
jdbcRealm.credentialsMatcher=$credentialsMatcher
```

1、saltStyle 表示使用密码+盐的机制，authenticationQuery 第一列是密码，第二列是盐；

2、通过 authenticationQuery 指定密码及盐查询 SQL；此处还要注意 Shiro 默认使用了 apache commons BeanUtils，默认是不进行 Enum 类型转型的 ， 此 时 需 要 自 己 注 册 一 个 Enum 转 换 器
“ BeanUtilsBean.getInstance().getConvertUtils().register(new  EnumConverter(), JdbcRealm.SaltStyle.class); ” 

### 3、ini 配置（shiro-hashedCredentialsMatcher.ini）

```ini
[main]
credentialsMatcher=org.apache.shiro.authc.credential.HashedCredentialsMatcher
credentialsMatcher.hashAlgorithmName=md5
credentialsMatcher.hashIterations=2
credentialsMatcher.storedCredentialsHexEncoded=true
myRealm=com.github.zhangkaitao.shiro.chapter5.hash.realm.MyRealm2
myRealm.credentialsMatcher=$credentialsMatcher
securityManager.realms=$myRealm
```


1、通过 credentialsMatcher.hashAlgorithmName=md5 指定散列算法为 md5，需要和生成密 码时的一样；

2、credentialsMatcher.hashIterations=2，散列迭代次数，需要和生成密码时的意义；

3、credentialsMatcher.storedCredentialsHexEncoded=true 表示是否存储散列后的密码为 16 进制，需要和生成密码时的一样，默认是 base64；此处最需要注意的就是 HashedCredentialsMatcher 的算法需要和生成密码时的算法一样。 

另外 HashedCredentialsMatcher 会 自 动 根 据 AuthenticationInfo 的 类 型 是 否 是 SaltedAuthenticationInfo 来获取 credentialsSalt 盐。

## 密码 重试次 数限制

如在 1 个小时内密码最多重试 5 次，如果尝试次数超过 5 次就锁定 1 小时，1 小时后可再次重试，如果还是重试失败，可以锁定如 1 天，以此类推，防止密码被暴力破解。

我们通过继承 HashedCredentialsMatcher，且使用 Ehcache 记录重试次数和超时时间。

```java
public boolean doCredentialsMatch(AuthenticationToken token, AuthenticationInfo info) {
    String username = (String)token.getPrincipal();
    //retry count + 1
    Element element = passwordRetryCache.get(username);
    if(element == null) {
    element = new Element(username , new AtomicInteger(0));
    passwordRetryCache.put(element);
    }
    AtomicInteger retryCount = (AtomicInteger)element.getObjectValue();
    if(retryCount.incrementAndGet() > 5) {
    //if retry count > 5 throw
    throw new ExcessiveAttemptsException();
    }
    boolean matches = super.doCredentialsMatch(token, info);
    if(matches) {
    //clear retry count
    passwordRetryCache.remove(username);
    }
    return matches;
}
```

如上代码逻辑比较简单， 即如果密码输入正确清除 cache 中的记录； 否则 cache 中的重试次数+1，如果超出 5 次那么抛出异常表示超出重试次数了。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}