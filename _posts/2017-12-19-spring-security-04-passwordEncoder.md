---
layout: post
title:  Spring Security-04-密码加密详解及源码分析
date:  2017-12-19 22:29:09 +0800
categories: [Spring]
tags: [spring, spring-security, web-safe]
published: true
---


# 序言

前面我们学习了 [spring security 与 springmvc 的整合入门教程](https://www.toutiao.com/i6884852647480787459/)。

[spring secutity整合springboot入门](https://www.toutiao.com/item/6916894767628468747/)

[spring security 使用 maven 导入汇总](https://www.toutiao.com/item/6917240713151398403/)

这一节我们来学习一下 spring security 的密码加密策略。

# 密码发展历史

## 果奔时代

最初，密码以纯文本格式存储。假定密码是安全的，因为数据存储密码已保存在访问它所需的凭据中。

但是，恶意用户能够使用SQL注入之类的攻击找到方法来获取用户名和密码的大型“数据转储”。随着越来越多的用户凭证成为公共安全专家，我们意识到我们需要做更多的事情来保护用户的密码。

## 单向 Hash

然后鼓励开发人员在通过诸如SHA-256之类的单向哈希运行密码后存储密码。

由于散列是一种方式，并且计算给出的哈希密码很难计算，因此，找出系统中的每个密码都不值得。

为了击败这个新系统，恶意用户决定创建称为Rainbow Tables的查找表。他们不必每次都猜测每个密码，而是只计算一次密码并将其存储在查找表中。

## 我喂自己袋盐

为了减轻Rainbow Tables的有效性，鼓励开发人员使用加盐的密码。

不仅将密码用作哈希函数的输入，还将为每个用户的密码生成随机字节（称为salt）。盐和用户密码将通过散列函数运行，从而产生唯一的散列。

在现代，我们意识到加密哈希（例如SHA-256）不再安全。原因是使用现代硬件，我们可以每秒执行数十亿次哈希计算。这意味着我们可以轻松地分别破解每个密码。

## 你很强，我比你更强

现在鼓励开发人员利用自适应单向功能来存储密码。

具有自适应单向功能的密码验证有意占用大量资源（即CPU，内存等）。自适应单向功能允许配置“工作因数”，该因数会随着硬件的改进而增加。

这种权衡使攻击者难以破解密码，但代价却不高，它给您自己的系统增加了负担。 

Spring Security试图为“工作因素”提供一个良好的起点，但是鼓励用户为自己的系统自定义“工作因素”，因为不同系统之间的性能会有很大差异。

由于自适应单向功能有意占用大量资源，因此为每个请求验证用户名和密码都会大大降低应用程序的性能。 

## 一些最佳实践

Spring Security（或任何其他库）无法采取任何措施来加快密码的验证速度，因为**通过增加验证资源的强度来获得安全性**。

鼓励用户将长期凭证（即用户名和密码）交换为短期凭证（即会话，OAuth令牌等）。可以**快速验证短期凭证，而不会损失任何安全性**。

ps: 密码的发展史是一部攻防史。

# PasswordEncoder 详解

Spring Security的PasswordEncoder接口用于对密码进行单向转换，以使密码可以安全地存储。 

鉴于PasswordEncoder是一种单向转换，因此当密码转换需要采用两种方式（即存储用于向数据库进行身份验证的凭据）时，则不打算使用它。

通常，PasswordEncoder用于存储在身份验证时需要与用户提供的密码进行比较的密码。

## 接口

接口定义如下：

```java
public interface PasswordEncoder {

	// 密码加密
	String encode(CharSequence rawPassword);

	// 是否匹配
	boolean matches(CharSequence rawPassword, String encodedPassword);

	// 如果应该再次对编码后的密码进行编码以提高安全性，则返回true，否则返回false。 
    // 默认实现始终返回false。
	default boolean upgradeEncoding(String encodedPassword) {
		return false;
	}
}
```


## NoOpPasswordEncoder

在Spring Security 5.0之前，默认的PasswordEncoder是NoOpPasswordEncoder，它需要纯文本密码。

这个就是历史发展中最早的一个版本，当然安全性存在很大的问题。

```java
@Deprecated
public final class NoOpPasswordEncoder implements PasswordEncoder {

	public String encode(CharSequence rawPassword) {
		return rawPassword.toString();
	}

	public boolean matches(CharSequence rawPassword, String encodedPassword) {
		return rawPassword.toString().equals(encodedPassword);
	}

    //...
}
```

# DelegatingPasswordEncoder

## 历史包袱

你可能希望以 `BCryptPasswordEncoder` 作为默认策略，但是在这之前需要考虑几个现实问题：

- 历史数据的迁移成本

- Spring security 作为一个稳健的安全框架，不能随便修改自己的特性

于是，security 引入了 DelegatingPasswordEncoder，用来解决上面 2 个问题，也方便大家修改随时对密码加密。

## 加密工厂

我们可以使用 `PasswordEncoderFactories` 工厂类，方便的创建加密策略。

### 使用方式

```java
PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
```

### 支持类型

源码如下：

```java
public class PasswordEncoderFactories {

	// 创建策略
	@SuppressWarnings("deprecation")
	public static PasswordEncoder createDelegatingPasswordEncoder() {
		String encodingId = "bcrypt";
		Map<String, PasswordEncoder> encoders = new HashMap<>();
		encoders.put(encodingId, new BCryptPasswordEncoder());
		encoders.put("ldap", new org.springframework.security.crypto.password.LdapShaPasswordEncoder());
		encoders.put("MD4", new org.springframework.security.crypto.password.Md4PasswordEncoder());
		encoders.put("MD5", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("MD5"));
		encoders.put("noop", org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance());
		encoders.put("pbkdf2", new Pbkdf2PasswordEncoder());
		encoders.put("scrypt", new SCryptPasswordEncoder());
		encoders.put("SHA-1", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("SHA-1"));
		encoders.put("SHA-256", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("SHA-256"));
		encoders.put("sha256", new org.springframework.security.crypto.password.StandardPasswordEncoder());

		return new DelegatingPasswordEncoder(encodingId, encoders);
	}

	private PasswordEncoderFactories() {}
}
```

## 密码存储格式

密码的一般格式为：

```
{id}encodedPassword
```

这样的id是用于查找应使用哪个PasswordEncoder的标识符，而encodePassword是所选PasswordEncoder的原始编码密码。 

ID必须在密码的开头，以 `{` 开头，以 `}` 结尾。 

如果找不到该ID，则该ID将为null。 

例如，以下可能是使用不同ID编码的密码列表。 

所有原始密码均为 password。

```
{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG                    //BCryptPasswordEncoder
{noop}password      //NoOpPasswordEncoder
{pbkdf2}5d923b44a6d129f3ddf3e3c8d29412723dcbde72445e8ef6bf3b508fbf17fa4ed4d6b99ca763d8dc    //Pbkdf2PasswordEncoder
{scrypt}$e0801$8bWJaSu2IKSn9Z9kM+TPXfOc/9bdYSrN1oD9qfVThWEwdRTnO7re7Ei+fUZRJ68k9lTyuTeUp4of4g24hHnazw==$OAOec05+bXxvuu/1qZ6NUR+xQYvYv7BeL1QxwRpY5Pc=    //SCryptPasswordEncoder
{sha256}97cde38028ad898ebc02e690819fa220e88c62e0699403e94fff291cfffaf8410849f27605abcbc0        //StandardPasswordEncoder
```

## 自定义自适应编码器

```java
String idForEncode = "bcrypt";
Map encoders = new HashMap<>();
encoders.put(idForEncode, new BCryptPasswordEncoder());
encoders.put("noop", NoOpPasswordEncoder.getInstance());
encoders.put("pbkdf2", new Pbkdf2PasswordEncoder());
encoders.put("scrypt", new SCryptPasswordEncoder());
encoders.put("sha256", new StandardPasswordEncoder());

PasswordEncoder passwordEncoder = new DelegatingPasswordEncoder(idForEncode, encoders);
```

## 密码编码

传递给构造函数的idForEncode确定将使用哪个PasswordEncoder编码密码。 

在上面我们构造的DelegatingPasswordEncoder中，这意味着编码密码的结果将委托给BCryptPasswordEncoder并以{bcrypt}为前缀。

最终结果如下所示：

```
{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
```

## 密码匹配

匹配是基于{id}和id到构造函数中提供的PasswordEncoder的映射完成的。我们的“密码存储格式”示例提供了如何完成此操作的示例。

默认情况下，使用密码和未映射的ID（包括空ID）调用match（CharSequence，String）的结果将导致IllegalArgumentException。

可以使用 `DelegatingPasswordEncoder.setDefaultPasswordEncoderForMatches(PasswordEncoder)` 自定义此行为。

通过使用id，我们可以匹配任何密码编码，但是使用最现代的密码编码对密码进行编码。

这很重要，因为与加密不同，密码哈希被设计为没有简单的方法来恢复明文。由于无法恢复明文，因此很难迁移密码。

虽然用户迁移NoOpPasswordEncoder很简单，但我们默认选择包含它，以使入门体验更简单。

## 入门例子

### 默认

```java
UserDetails user = User.withDefaultPasswordEncoder()
                .username("user")
                .password("password")
                .roles("user")
                .build();
System.out.println(user.getPassword());
```

输出的日志如下：

```
{bcrypt}$2a$10$7S1zKlwLjL6yoh6fpB5qlen9CTrEXEaWy6OWkQwm4Y3KZuD87WQfW
```

接下来我们来看一下几个 PasswordEncoder 的使用和源码。


# BCryptPasswordEncoder 详解

BCryptPasswordEncoder 实现使用广泛支持的bcrypt算法对密码进行哈希处理。 

与其他自适应单向功能一样，应将其调整为大约1秒钟，以验证系统上的密码。 

BCryptPasswordEncoder的默认实现使用强度10，建议您在自己的系统上调整和测试强度参数，以使验证密码大约需要1秒钟。

## 使用方式

```java
// Create an encoder with strength 16
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(16);
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```

## 源码

### BCrypt 的介绍

该密码哈希系统尝试使用基于布鲁斯·施耐尔（Brece Schneier）的Blowfish密码的计算密集型哈希算法来阻止离线密码破解。

该算法的工作因子是参数化的，因此可以随着计算机速度的提高而增加。

### encode 源码

我们主要看一下 encode 方法：

```java
public String encode(CharSequence rawPassword) {
	String salt;
	if (strength > 0) {
		if (random != null) {
			salt = BCrypt.gensalt(strength, random);
		}
		else {
			salt = BCrypt.gensalt(strength);
		}
	}
	else {
		salt = BCrypt.gensalt();
	}
	return BCrypt.hashpw(rawPassword.toString(), salt);
}
```


这里主要有 2 个方法：

### gensalt 生成盐

```java
public static String gensalt(int log_rounds, SecureRandom random) {
	if (log_rounds < MIN_LOG_ROUNDS || log_rounds > MAX_LOG_ROUNDS) {
		throw new IllegalArgumentException("Bad number of rounds");
	}

	StringBuilder rs = new StringBuilder();
	byte rnd[] = new byte[BCRYPT_SALT_LEN];
	random.nextBytes(rnd);
	rs.append("$2a$");
	if (log_rounds < 10) {
		rs.append("0");
	}
	rs.append(log_rounds);
	rs.append("$");
	encode_base64(rnd, rnd.length, rs);
	return rs.toString();
}
```

可以发现，这里会默认吧 `$2a$` 作为前缀，所以黑客可以根据这个前缀判断出加密算法。

生成盐的好处就是每一次的加密结果都是不同的。

### hashpw 执行哈希

为了简化代码，我们移除一些校验。

```java
public static String hashpw(String password, String salt) throws IllegalArgumentException {
	BCrypt B;
	String real_salt;
	byte passwordb[], saltb[], hashed[];
	char minor = (char) 0;
	int rounds, off = 0;
	StringBuilder rs = new StringBuilder();
	int saltLength = salt.length();
	
	if (salt.charAt(2) == '$') {
		off = 3;
	}
	else {
		minor = salt.charAt(2);
		off = 4;
	}
	
	rounds = Integer.parseInt(salt.substring(off, off + 2));
	real_salt = salt.substring(off + 3, off + 25);
	try {
		passwordb = (password + (minor >= 'a' ? "\000" : "")).getBytes("UTF-8");
	}
	catch (UnsupportedEncodingException uee) {
		throw new AssertionError("UTF-8 is not supported");
	}
	saltb = decode_base64(real_salt, BCRYPT_SALT_LEN);
	B = new BCrypt();
	hashed = B.crypt_raw(passwordb, saltb, rounds);
	rs.append("$2");
	if (minor >= 'a') {
		rs.append(minor);
	}
	rs.append("$");
	if (rounds < 10) {
		rs.append("0");
	}
	rs.append(rounds);
	rs.append("$");
	encode_base64(saltb, saltb.length, rs);
	encode_base64(hashed, bf_crypt_ciphertext.length * 4 - 1, rs);
	return rs.toString();
}
```

crypt_raw 对应的方法实现如下：

```java
private byte[] crypt_raw(byte password[], byte salt[], int log_rounds) {
	int cdata[] = (int[]) bf_crypt_ciphertext.clone();
	int clen = cdata.length;
	byte ret[];
	long rounds = roundsForLogRounds(log_rounds);
	init_key();
	ekskey(salt, password);
	for (long i = 0; i < rounds; i++) {
		key(password);
		key(salt);
	}
	for (int i = 0; i < 64; i++) {
		for (int j = 0; j < (clen >> 1); j++) {
			encipher(cdata, j << 1);
		}
	}
	ret = new byte[clen * 4];
	for (int i = 0, j = 0; i < clen; i++) {
		ret[j++] = (byte) ((cdata[i] >> 24) & 0xff);
		ret[j++] = (byte) ((cdata[i] >> 16) & 0xff);
		ret[j++] = (byte) ((cdata[i] >> 8) & 0xff);
		ret[j++] = (byte) (cdata[i] & 0xff);
	}
	return ret;
}
```

### 自己的理解

使用每次随机的 salt，保证每次加密都不同，从而防止彩虹表的反向破解。

对应的 salt 信息会存储在密码之中，不需要我们关心，这是使用的便利性。

那如何破解高性能的计算机呢？

bcrypt还是适应性函数，它可以借由增加迭代之次数来抵御日益增进的电脑运算能力透过暴力法破解。

这种思想，感觉和比特币有异曲同工之妙。

# Argon2PasswordEncoder

Argon2PasswordEncoder实现使用Argon2算法对密码进行哈希处理。 

为了克服自定义硬件上的密码破解问题，Argon2是一种故意慢速的算法，需要大量内存。 

与其他自适应单向功能一样，应将其调整为大约1秒钟，以验证系统上的密码。 

Argon2PasswordEncoder的当前实现需要BouncyCastle。

## 使用方式

```java
// Create an encoder with all the defaults
Argon2PasswordEncoder encoder = new Argon2PasswordEncoder();
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```

# Pbkdf2PasswordEncoder

Pbkdf2PasswordEncoder实现使用PBKDF2算法对密码进行哈希处理。 

与其他自适应单向功能一样，应将其调整为大约1秒钟，以验证系统上的密码。 

当需要FIPS认证时，此算法是一个不错的选择。

## 使用方式

```java
// Create an encoder with all the defaults
Pbkdf2PasswordEncoder encoder = new Pbkdf2PasswordEncoder();
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```

# SCryptPasswordEncoder

SCryptPasswordEncoder实现使用scrypt算法对密码进行哈希处理，需要大量内存。 

与其他自适应单向功能一样，应将其调整为大约1秒钟，以验证系统上的密码。

```java
// Create an encoder with all the defaults
SCryptPasswordEncoder encoder = new SCryptPasswordEncoder();
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```

# 小结

密码的安全一直是一个处于不断攻防之中发展到今天，不过目前工作中大部分还是使用 salt + hash 的方式。

使我想到了另一种解决方案 [九章量子计算机到来的今天，如何实现验证码才能保证安全？](https://www.toutiao.com/item/6903528771559703044/)

二者的核心思想都是提高攻击者的成本，不过自适应的算法的成本还是很高的，需要结合自己的实际场景使用。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}