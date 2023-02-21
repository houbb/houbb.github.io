---
layout: post
title:  JWT-04-核心源码分析
date:  2018-3-25 13:51:45 +0800
categories: [Web]
tags: [web, auth, source-code, sh]
published: true
---

# 常见使用核心方法

一般为 jwt 的生成和验证。

## 生成

```java
//签发时间
String jwtSalt = "$123456$";
Date issuanceTime = new Date();
// 生成过期时间，可以动态指定。一般为 1H。
Date expireTime = getExpireDate();

Map<String, Object> map = new HashMap<>();
map.put("alg", "HS256");
map.put("typ", "JWT");

//额外信息
String operatorId = resp.getOperatorId();
String token = JWT.create()
        .withHeader(map)
        .withClaim(JwtConst.OPERATOR_ID_KEY, operatorId)
        .withIssuedAt(issuanceTime)
        .withExpiresAt(expireTime)
        .sign(Algorithm.HMAC256(jwtSalt));
```

最核心的为 token 的生成。

## 验证

```java
String jwtSalt = "$123456$";

// 解码
JWTVerifier jwtVerifier = JWT.require(Algorithm.HMAC256(jwtSalt)).build();

String jwtToken = dto.getToken();
DecodedJWT decodedJwt = jwtVerifier.verify(jwtToken);
this.expiredCheck(decodedJwt);

// 用户信息
Map<String, Claim> claimMap = decodedJwt.getClaims();
final String operatorId = claimMap.get(JwtConst.OPERATOR_ID_KEY).asString();
```

有效期检验：

```java
private void expiredCheck(DecodedJWT decodedJWT) {
    Date expireDate = decodedJWT.getExpiresAt();
    Date now = new Date();

    if(expireDate.before(now)) {
        log.warn("用户 token 已经过期。");
        throw new BizException(RespCode.TOKEN_HAS_EXPIRED);
    }
}
```


# JWT

## create

```java
public abstract class JWT {
    public JWT() {
    }

    public static DecodedJWT decode(String token) throws JWTDecodeException {
        return new JWTDecoder(token);
    }

    public static Verification require(Algorithm algorithm) {
        return JWTVerifier.init(algorithm);
    }

    public static JWTCreator.Builder create() {
        return JWTCreator.init();
    }
}
```

## JWTCreator.init

```java
static Builder init() {
    return new Builder();
}
```

初始化一个 builder。

builder 中是为了让属性的设置更加优雅，不涉及到太多的处理逻辑。

### Builder

内部属性：

```java
public static class Builder {
    private final Map<String, Object> payloadClaims = new HashMap();
    private Map<String, Object> headerClaims = new HashMap();

    Builder() {
    }
```

比如我们上面的几个 withXXX 方法

```java
.withHeader(map)
.withClaim(JwtConst.OPERATOR_ID_KEY, operatorId)
.withIssuedAt(issuanceTime)
.withExpiresAt(expireTime)
```

对应的实现：

```java
public Builder withHeader(Map<String, Object> headerClaims) {
    this.headerClaims = new HashMap(headerClaims);
    return this;
}
```

withHeader 就是直接把 map 属性设置进来。

```java
public Builder withExpiresAt(Date expiresAt) {
    this.addClaim("exp", expiresAt);
    return this;
}
```

这个是在 claim 中加入一个属性。

```java
private void addClaim(String name, Object value) {
    if (value == null) {
        this.payloadClaims.remove(name);
    } else {
        this.payloadClaims.put(name, value);
    }
}
```

是通过值 value 是否为 null 分别处理的。

### sign

```java
public String sign(Algorithm algorithm) throws IllegalArgumentException, JWTCreationException {
    if (algorithm == null) {
        throw new IllegalArgumentException("The Algorithm cannot be null.");
    } else {
        // 这里会默认在 header 中放入 2 个属性。
        this.headerClaims.put("alg", algorithm.getName());
        this.headerClaims.put("typ", "JWT");

        String signingKeyId = algorithm.getSigningKeyId();

        if (signingKeyId != null) {
            this.withKeyId(signingKeyId);
        }

        // 调用 JWTCreator 中的 sign 方法，把当前的配置属性传递过去。
        return (new JWTCreator(algorithm, this.headerClaims, this.payloadClaims)).sign();
    }
}
```

# JWTCreator

## 内部属性：

```java
public final class JWTCreator {
    // 算法
    private final Algorithm algorithm;

    // 头 json
    private final String headerJson;

    // 负载 json
    private final String payloadJson;
```

## 构造器

```java
private JWTCreator(Algorithm algorithm, Map<String, Object> headerClaims, Map<String, Object> payloadClaims) throws JWTCreationException {
    this.algorithm = algorithm;

    try {
        ObjectMapper mapper = new ObjectMapper();
        SimpleModule module = new SimpleModule();

        // 序列化
        module.addSerializer(ClaimsHolder.class, new PayloadSerializer());
        mapper.registerModule(module);

        // 配置
        mapper.configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true);


        this.headerJson = mapper.writeValueAsString(headerClaims);
        this.payloadJson = mapper.writeValueAsString(new ClaimsHolder(payloadClaims));
    } catch (JsonProcessingException var6) {
        throw new JWTCreationException("Some of the Claims couldn't be converted to a valid JSON format.", var6);
    }
}
```

## sign

```java
private String sign() throws SignatureGenerationException {
    //base64 encode
    String header = Base64.encodeBase64URLSafeString(this.headerJson.getBytes(StandardCharsets.UTF_8));
    String payload = Base64.encodeBase64URLSafeString(this.payloadJson.getBytes(StandardCharsets.UTF_8));

    // 内容格式化
    String content = String.format("%s.%s", header, payload);

    // 算法签名
    byte[] signatureBytes = this.algorithm.sign(content.getBytes(StandardCharsets.UTF_8));

    String signature = Base64.encodeBase64URLSafeString(signatureBytes);

    // 返回结果
    return String.format("%s.%s", content, signature);
}
```

# Algorithm 算法

签名部分，最核心的还是算法部分 `Algorithm algorithm`。

## 内部变量

```java
public abstract class Algorithm {
    private final String name;
    private final String description;
```

内置了很多静态方法，可以方便地创建对应的 Algorithm。

## 核心方法

```java
public static Algorithm none() {
    return new NoneAlgorithm();
}

protected Algorithm(String name, String description) {
    this.name = name;
    this.description = description;
}

public String getSigningKeyId() {
    return null;
}

public String getName() {
    return this.name;
}

String getDescription() {
    return this.description;
}

public String toString() {
    return this.description;
}
```

## RSA256

```java
public static Algorithm RSA256(RSAKeyProvider keyProvider) throws IllegalArgumentException {
    return new RSAAlgorithm("RS256", "SHA256withRSA", keyProvider);
}
public static Algorithm RSA256(RSAPublicKey publicKey, RSAPrivateKey privateKey) throws IllegalArgumentException {
    return RSA256(RSAAlgorithm.providerForKeys(publicKey, privateKey));
}
/** @deprecated */
@Deprecated
public static Algorithm RSA256(RSAKey key) throws IllegalArgumentException {
    RSAPublicKey publicKey = key instanceof RSAPublicKey ? (RSAPublicKey)key : null;
    RSAPrivateKey privateKey = key instanceof RSAPrivateKey ? (RSAPrivateKey)key : null;
    return RSA256(publicKey, privateKey);
}
```

## RSA384

```java
public static Algorithm RSA384(RSAKeyProvider keyProvider) throws IllegalArgumentException {
    return new RSAAlgorithm("RS384", "SHA384withRSA", keyProvider);
}

public static Algorithm RSA384(RSAPublicKey publicKey, RSAPrivateKey privateKey) throws IllegalArgumentException {
    return RSA384(RSAAlgorithm.providerForKeys(publicKey, privateKey));
}

/** @deprecated */
@Deprecated
public static Algorithm RSA384(RSAKey key) throws IllegalArgumentException {
    RSAPublicKey publicKey = key instanceof RSAPublicKey ? (RSAPublicKey)key : null;
    RSAPrivateKey privateKey = key instanceof RSAPrivateKey ? (RSAPrivateKey)key : null;
    return RSA384(publicKey, privateKey);
}
```

## RSA512

```java
public static Algorithm RSA512(RSAKeyProvider keyProvider) throws IllegalArgumentException {
    return new RSAAlgorithm("RS512", "SHA512withRSA", keyProvider);
}

public static Algorithm RSA512(RSAPublicKey publicKey, RSAPrivateKey privateKey) throws IllegalArgumentException {
    return RSA512(RSAAlgorithm.providerForKeys(publicKey, privateKey));
}

/** @deprecated */
@Deprecated
public static Algorithm RSA512(RSAKey key) throws IllegalArgumentException {
    RSAPublicKey publicKey = key instanceof RSAPublicKey ? (RSAPublicKey)key : null;
    RSAPrivateKey privateKey = key instanceof RSAPrivateKey ? (RSAPrivateKey)key : null;
    return RSA512(publicKey, privateKey);
}
```

## HCM

```java
public static Algorithm HMAC256(String secret) throws IllegalArgumentException, UnsupportedEncodingException {
    return new HMACAlgorithm("HS256", "HmacSHA256", secret);
}
public static Algorithm HMAC384(String secret) throws IllegalArgumentException, UnsupportedEncodingException {
    return new HMACAlgorithm("HS384", "HmacSHA384", secret);
}
public static Algorithm HMAC512(String secret) throws IllegalArgumentException, UnsupportedEncodingException {
    return new HMACAlgorithm("HS512", "HmacSHA512", secret);
}
public static Algorithm HMAC256(byte[] secret) throws IllegalArgumentException {
    return new HMACAlgorithm("HS256", "HmacSHA256", secret);
}
public static Algorithm HMAC384(byte[] secret) throws IllegalArgumentException {
    return new HMACAlgorithm("HS384", "HmacSHA384", secret);
}
public static Algorithm HMAC512(byte[] secret) throws IllegalArgumentException {
    return new HMACAlgorithm("HS512", "HmacSHA512", secret);
}
```

## ECD

```java
    public static Algorithm ECDSA256(ECDSAKeyProvider keyProvider) throws IllegalArgumentException {
        return new ECDSAAlgorithm("ES256", "SHA256withECDSA", 32, keyProvider);
    }

    public static Algorithm ECDSA256(ECPublicKey publicKey, ECPrivateKey privateKey) throws IllegalArgumentException {
        return ECDSA256(ECDSAAlgorithm.providerForKeys(publicKey, privateKey));
    }

    /** @deprecated */
    @Deprecated
    public static Algorithm ECDSA256(ECKey key) throws IllegalArgumentException {
        ECPublicKey publicKey = key instanceof ECPublicKey ? (ECPublicKey)key : null;
        ECPrivateKey privateKey = key instanceof ECPrivateKey ? (ECPrivateKey)key : null;
        return ECDSA256(publicKey, privateKey);
    }

    public static Algorithm ECDSA384(ECDSAKeyProvider keyProvider) throws IllegalArgumentException {
        return new ECDSAAlgorithm("ES384", "SHA384withECDSA", 48, keyProvider);
    }

    public static Algorithm ECDSA384(ECPublicKey publicKey, ECPrivateKey privateKey) throws IllegalArgumentException {
        return ECDSA384(ECDSAAlgorithm.providerForKeys(publicKey, privateKey));
    }

    /** @deprecated */
    @Deprecated
    public static Algorithm ECDSA384(ECKey key) throws IllegalArgumentException {
        ECPublicKey publicKey = key instanceof ECPublicKey ? (ECPublicKey)key : null;
        ECPrivateKey privateKey = key instanceof ECPrivateKey ? (ECPrivateKey)key : null;
        return ECDSA384(publicKey, privateKey);
    }

    public static Algorithm ECDSA512(ECDSAKeyProvider keyProvider) throws IllegalArgumentException {
        return new ECDSAAlgorithm("ES512", "SHA512withECDSA", 66, keyProvider);
    }

    public static Algorithm ECDSA512(ECPublicKey publicKey, ECPrivateKey privateKey) throws IllegalArgumentException {
        return ECDSA512(ECDSAAlgorithm.providerForKeys(publicKey, privateKey));
    }

    /** @deprecated */
    @Deprecated
    public static Algorithm ECDSA512(ECKey key) throws IllegalArgumentException {
        ECPublicKey publicKey = key instanceof ECPublicKey ? (ECPublicKey)key : null;
        ECPrivateKey privateKey = key instanceof ECPrivateKey ? (ECPrivateKey)key : null;
        return ECDSA512(publicKey, privateKey);
    }
```

## 抽象方法

预留了两个抽象方法，用于子类统一实现。

```java
// 验证
public abstract void verify(DecodedJWT var1) throws SignatureVerificationException;

// 签名
public abstract byte[] sign(byte[] var1) throws SignatureGenerationException;
```

## 算法具体实现

算法实现一般涉及到密码学+数学等，此处暂时不做展开。


# 解码器

## 说明

刚才很大的篇幅涉及的都是 JWT 的加密部分。

现在我们来看一下验证器部分：

```java
JWTVerifier jwtVerifier = JWT.require(Algorithm.HMAC256(jwtSalt)).build();

DecodedJWT decodedJwt = jwtVerifier.verify(jwtToken);
```

通过指定具体的算法+salt，然后对解密的信息进行解密。

## JWTVerifier

require 对应的是 JWTVerifier 类的初始化。

### 内部变量

```java
public final class JWTVerifier {
    private final Algorithm algorithm;
    final Map<String, Object> claims;
    private final Clock clock;
```

### 构造器

```java
JWTVerifier(Algorithm algorithm, Map<String, Object> claims, Clock clock) {
    this.algorithm = algorithm;
    this.claims = Collections.unmodifiableMap(claims);
    this.clock = clock;
}
```

### verify

最核心的验证方法。

```java
public DecodedJWT verify(String token) throws JWTVerificationException {
    DecodedJWT jwt = JWT.decode(token);
    this.verifyAlgorithm(jwt, this.algorithm);
    this.algorithm.verify(jwt);
    this.verifyClaims(jwt, this.claims);
    return jwt;
}
```

核心实现验证分成几步：

1）解码

2）verifyAlgorithm 算法验证

3）verifyClaims

#### JWTDecoder

`JWT.decode(token)` 解码方法：

```java
public static DecodedJWT decode(String token) throws JWTDecodeException {
    return new JWTDecoder(token);
}
```

JWTDecoder 实现：

```java
final class JWTDecoder implements DecodedJWT {
    private final String[] parts;
    private final Header header;
    private final Payload payload;

    JWTDecoder(String jwt) throws JWTDecodeException {
        this.parts = TokenUtils.splitToken(jwt);
        JWTParser converter = new JWTParser();

        String headerJson;
        String payloadJson;
        try {
            headerJson = StringUtils.newStringUtf8(Base64.decodeBase64(this.parts[0]));
            payloadJson = StringUtils.newStringUtf8(Base64.decodeBase64(this.parts[1]));
        } catch (NullPointerException var6) {
            throw new JWTDecodeException("The UTF-8 Charset isn't initialized.", var6);
        }

        // 通过 JWTParser 把对应的信息转义回原来的 header+payload
        this.header = converter.parseHeader(headerJson);
        this.payload = converter.parsePayload(payloadJson);
    }
```

#### verifyAlgorithm

需要保证加密的内容，和指定的算法一致。

```java
private void verifyAlgorithm(DecodedJWT jwt, Algorithm expectedAlgorithm) throws AlgorithmMismatchException {
    if (!expectedAlgorithm.getName().equals(jwt.getAlgorithm())) {
        throw new AlgorithmMismatchException("The provided Algorithm doesn't match the one defined in the JWT's Header.");
    }
}
```

#### verifyClaims

验证其中 claims 的合法性。

```java
private void verifyClaims(DecodedJWT jwt, Map<String, Object> claims) throws TokenExpiredException, InvalidClaimException {
    Iterator i$ = claims.entrySet().iterator();
    while(i$.hasNext()) {
        Map.Entry<String, Object> entry = (Map.Entry)i$.next();
        switch ((String)entry.getKey()) {
            case "aud":
                this.assertValidAudienceClaim(jwt.getAudience(), (List)entry.getValue());
                break;
            case "exp":
                this.assertValidDateClaim(jwt.getExpiresAt(), (Long)entry.getValue(), true);
                break;
            case "iat":
                this.assertValidDateClaim(jwt.getIssuedAt(), (Long)entry.getValue(), false);
                break;
            case "nbf":
                this.assertValidDateClaim(jwt.getNotBefore(), (Long)entry.getValue(), false);
                break;
            case "iss":
                this.assertValidStringClaim((String)entry.getKey(), jwt.getIssuer(), (String)entry.getValue());
                break;
            case "jti":
                this.assertValidStringClaim((String)entry.getKey(), jwt.getId(), (String)entry.getValue());
                break;
            case "sub":
                this.assertValidStringClaim((String)entry.getKey(), jwt.getSubject(), (String)entry.getValue());
                break;
            default:
                this.assertValidClaim(jwt.getClaim((String)entry.getKey()), (String)entry.getKey(), entry.getValue());
        }
    }
}
```

### init

```java
static Verification init(Algorithm algorithm) throws IllegalArgumentException {
    return new BaseVerification(algorithm);
}
```

#### 实现

最基本的验证类

```java
public static class BaseVerification implements Verification {
        private final Algorithm algorithm;
        private final Map<String, Object> claims;
        private long defaultLeeway;

        BaseVerification(Algorithm algorithm) throws IllegalArgumentException {
            if (algorithm == null) {
                throw new IllegalArgumentException("The Algorithm cannot be null.");
            } else {
                this.algorithm = algorithm;
                this.claims = new HashMap();
                this.defaultLeeway = 0L;
            }
        }

        // 属性方法
```

# 参考资料

jwt 3.x 源码

* any list
{:toc}

