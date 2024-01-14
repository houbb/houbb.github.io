---
layout: post
title:  Apache Hadoop v3.3.6-20-KMS
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# **Hadoop KMS 概述**

Hadoop KMS 是基于 Hadoop 的 KeyProvider API 的加密密钥管理服务器。

它提供了客户端和服务器组件，它们通过使用 REST API 进行 HTTP 通信。

客户端是一个 KeyProvider 实现，通过使用 KMS HTTP REST API 与 KMS 交互。

KMS 及其客户端具有内置的安全性，并支持 HTTP SPNEGO Kerberos 身份验证和 HTTPS 安全传输。

KMS 是一个基于 Java Jetty 的 Web 应用程序。

**KMS 客户端配置**

KMS 客户端 KeyProvider 使用 `kms` 方案，嵌入的 URL 必须是 KMS 的 URL。例如，对于运行在 http://localhost:9600/kms 上的 KMS，KeyProvider URI 是 `kms://http@localhost:9600/kms`。对于运行在 https://localhost:9600/kms 上的 KMS，KeyProvider URI 是 `kms://https@localhost:9600/kms`。

以下是将 HDFS NameNode 配置为 KMS 客户端的 core-site.xml 示例：

```xml
<property>
  <name>hadoop.security.key.provider.path</name>
  <value>kms://http@localhost:9600/kms</value>
  <description>
    与加密区域中的读写操作相关的加密密钥交互时要使用的 KeyProvider。
  </description>
</property>
```

此配置指定了与 HDFS NameNode 交互时要使用的 KeyProvider，以便读写加密区域时使用的加密密钥。

# **KMS（Key Management Server）**

## **启动/停止 KMS**

要启动/停止 KMS，请使用 `hadoop --daemon start|stop kms`。例如：

```bash
hadoop-3.3.6 $ hadoop --daemon start kms
```

**注意:** 脚本 `kms.sh` 已被弃用。现在它只是 `hadoop kms` 的包装器。

## **KMS 配置**

在 `etc/hadoop/kms-site.xml` 配置文件中配置 KMS 后端 KeyProvider 属性：

```xml
<property>
   <name>hadoop.kms.key.provider.uri</name>
   <value>jceks://file@/${user.home}/kms.keystore</value>
</property>

<property>
  <name>hadoop.security.keystore.java-keystore-provider.password-file</name>
  <value>kms.keystore.password</value>
</property>
```

密码文件通过类路径查找在 Hadoop 配置目录中。

**注意:** 需要重新启动 KMS 才能使配置更改生效。

**注意:** KMS 服务器可以选择任何 KeyProvider 实现作为后备提供程序。此处的示例使用了一个 JavaKeyStoreProvider，仅应用于实验目的，绝不应在生产环境中使用。有关 JavaKeyStoreProvider 的详细用法和注意事项，请参阅 Credential Provider API 的 Keystore Passwords 部分。

## **KMS HTTP 配置**

KMS 预配置 HTTP 端口为 9600。

KMS 支持 `etc/hadoop/kms-site.xml` 中的以下 HTTP 配置属性。

**注意:** 需要重新启动 KMS 才能使配置更改生效。

## **KMS 缓存**

KMS 有两种缓存：CachingKeyProvider 用于缓存加密密钥，以及 KeyProvider 用于缓存 EEKs（加密区域键）。

### **CachingKeyProvider**

KMS 缓存加密密钥以避免对底层 KeyProvider 的过度访问。

该缓存默认启用（可以通过将 `hadoop.kms.cache.enable` 属性设置为 false 来禁用）。

此缓存仅与以下 3 个方法一起使用：`getCurrentKey()`、`getKeyVersion()` 和 `getMetadata()`。

- 对于 `getCurrentKey()` 方法，缓存条目最多保留 30000 毫秒，无论访问密钥的次数有多少（以避免将陈旧的密钥视为当前密钥）。
- 对于 `getKeyVersion()` 和 `getMetadata()` 方法，缓存条目保留默认的非活动超时时间为 600000 毫秒（10 分钟）。

当使用 `deleteKey()` 删除密钥或调用 `invalidateCache()` 时，缓存将被无效化。

可以通过在 `etc/hadoop/kms-site.xml` 配置文件中使用以下属性更改这些配置：

```xml
<property>
  <name>hadoop.kms.cache.enable</name>
  <value>true</value>
</property>

<property>
  <name>hadoop.kms.cache.timeout.ms</name>
  <value>600000</value>
</property>

<property>
  <name>hadoop.kms.current.key.cache.timeout.ms</name>
  <value>30000</value>
</property>
```

### **KeyProvider**

从架构上看，服务器端（例如 KMS）和客户端端（例如 NameNode）都具有用于 EEK（加密区域键）的缓存。以下是可在缓存上配置的内容：

- 缓存的大小。这是在每个密钥名称下可以缓存的最大 EEK 数量。
- 缓存的低水位标记。对于每个密钥名称，如果在调用 `get` 后，缓存的 EEK 数量小于 `(size * low watermark)`，那么将在该密钥名称下异步填充缓存。对于每个密钥名称，只有一个线程可以用于异步填充。
- 在所有密钥名称上，允许填充缓存中的队列的最大异步线程数。
- 缓存的到期时间，以毫秒为单位。在内部使用 Guava 缓存作为缓存实现。到期方法是 `expireAfterAccess`。

请注意，由于异步填充机制，可能在 `rollNewVersion()` 后，调用者仍然获得旧版本的 EEK。在最坏的情况下，调用者可能获得最多（服务器端缓存大小 + 客户端端缓存大小）个旧的 EEK，或者直到两个缓存都过期。这种行为是为了避免在缓存上锁定，是可以接受的，因为旧版本的 EEK 仍然可以用于解密。

以下是配置及其默认值：

- 服务器端可以通过 `etc/hadoop/kms-site.xml` 配置文件中的以下属性更改：

```xml
<property>
  <name>hadoop.security.kms.encrypted.key.cache.size</name>
  <value>500</value>
</property>

<property>
  <name>hadoop.security.kms.encrypted.key.cache.low.watermark</name>
  <value>0.3</value>
</property>

<property>
  <name>hadoop.security.kms.encrypted.key.cache.num.fill.threads</name>
  <value>2</value>
</property>

<property>
  <name>hadoop.security.kms.encrypted.key.cache.expiry</name>
  <value>43200000</value>
</property>
```

- 客户端端可以通过 `etc/hadoop/core-site.xml` 配置文件中的以下属性更改：

```xml
<property>
  <name>hadoop.security.kms.client.encrypted.key.cache.size</name>
  <value>500</value>
</property>

<property>
  <name>hadoop.security.kms.client.encrypted.key.cache.low-watermark</name>
  <value>0.3</value>
</property>

<property>
  <name>hadoop.security.kms.client.encrypted.key.cache.num.refill.threads</name>
  <value>2</value>
</property>

<property>
  <name>hadoop.security.kms.client.encrypted.key.cache.expiry</name>
  <value>43200000</value>
</property>
```

## **KMS 聚合审计日志**

对于对 GET_KEY_VERSION、GET_CURRENT_KEY、DECRYPT_EEK、GENERATE_EEK、REENCRYPT_EEK 操作的 API 访问，审计日志将被聚合。

条目按照（用户，密钥，操作）组合键进行分组，配置的聚合间隔后，用户对给定密钥的指定端点的访问次数将被刷新到审计日志中。

聚合间隔通过以下属性进行配置：

```xml
<property>
  <name>hadoop.kms.aggregation.delay.ms</name>
  <value>10000</value>
</property>
```

## **KMS 安全配置**

### **启用 Kerberos HTTP SPNEGO 认证**

1. 使用您的 KDC 服务器的信息配置 Kerberos `etc/krb5.conf` 文件。

2. 为 KMS 创建一个服务主体及其 keytab，它必须是一个 HTTP 服务主体。

3. 使用正确的安全值配置 KMS `etc/hadoop/kms-site.xml`，例如：

```xml
<property>
  <name>hadoop.security.authentication</name>
  <value>kerberos</value>
</property>

<property>
  <name>hadoop.security.authorization</name>
  <value>true</value>
</property>

<property>
  <name>hadoop.kms.authentication.type</name>
  <value>kerberos</value>
</property>

<property>
  <name>hadoop.kms.authentication.kerberos.keytab</name>
  <value>/etc/security/keytabs/kms.service.keytab</value>
</property>

<property>
  <name>hadoop.kms.authentication.kerberos.principal</name>
  <value>kms/_HOST@EXAMPLE.COM</value>
</property>
```

请确保替换上述示例中的实际值以匹配您的环境。这些配置用于启用 Kerberos 认证，并配置 KMS 使用 Kerberos 认证。

### **KMS 代理用户配置**

每个代理用户都必须在 `etc/hadoop/kms-site.xml` 中使用以下属性进行配置：

```xml
<property>
  <name>hadoop.kms.proxyuser.#USER#.users</name>
  <value>*</value>
</property>

<property>
  <name>hadoop.kms.proxyuser.#USER#.groups</name>
  <value>*</value>
</property>

<property>
  <name>hadoop.kms.proxyuser.#USER#.hosts</name>
  <value>*</value>
</property>
```

`#USER#` 是要配置的代理用户的用户名。

- `users` 属性指示可以冒充的用户。
- `groups` 属性指示被冒充的用户必须属于的组。
  
必须至少定义 `users` 或 `groups` 属性之一。如果两者都指定，则配置的代理用户将能够冒充 `users` 列表中的用户和 `groups` 列表中任何组中的用户。

`hosts` 属性指示代理用户可以从哪个主机发出模拟请求。

如果 `users`、`groups` 或 `hosts` 中有 `*`，则表示对于代理用户没有关于用户、组或主机的限制。

### **KMS 通过 HTTPS（SSL）**

在 `etc/hadoop/kms-site.xml` 中启用 SSL：

```xml
<property>
  <name>hadoop.kms.ssl.enabled</name>
  <value>true</value>
  <description>
    是否启用 SSL。默认值为 false，即禁用。
  </description>
</property>
```

使用正确的值配置 `etc/hadoop/ssl-server.xml`，例如：

```xml
<property>
  <name>ssl.server.keystore.location</name>
  <value>${user.home}/.keystore</value>
  <description>必须指定的密钥库。</description>
</property>

<property>
  <name>ssl.server.keystore.password</name>
  <value></value>
  <description>必须指定。</description>
</property>

<property>
  <name>ssl.server.keystore.keypassword</name>
  <value></value>
  <description>必须指定。</description>
</property>
```

SSL 密码可以通过凭据提供程序进行安全保护。参见 Credential Provider API。

您需要为 KMS 创建一个 SSL 证书。以 kms Unix 用户身份，使用 Java keytool 命令创建 SSL 证书：

```bash
$ keytool -genkey -alias jetty -keyalg RSA
```

您将在交互提示中被要求回答一系列问题。它将创建名为 `.keystore` 的密钥库文件，并位于用户的主目录中。

您为“密钥库密码”输入的密码必须与在配置目录中的 `ssl.server.keystore.password` 属性设置的值匹配。

对于“你的名字是什么？”（即“CN”），答案必须是运行 KMS 的机器的主机名。

**注意:** 需要重新启动 KMS 才能使配置更改生效。

**注意:** 一些旧的 SSL 客户端可能使用不受 KMS 服务器支持的弱密码。建议升级 SSL 客户端。

### **ACL（访问控制列表）**

KMS 支持 ACL（访问控制列表）以进行细粒度的权限控制。

在 KMS 中存在两个级别的 ACL：KMS ACL 和 Key ACL。KMS ACL 控制 KMS 操作级别的访问，并优先于 Key ACL。特别是，只有在 KMS ACL 级别授予权限后，才会执行针对 Key ACL 的权限检查。

KMS ACL 和 Key ACL 的配置和使用在以下各节中进行了描述。

### **KMS ACL**

KMS ACL 的配置定义在 KMS 的 `etc/hadoop/kms-acls.xml` 配置文件中。此文件在更改时进行热重载。

KMS 支持通过一组 ACL 配置属性实现对 KMS 操作的细粒度访问控制以及黑名单。

在授予访问权限之前，首先检查访问 KMS 的用户是否包含在请求操作的访问控制列表中，然后检查其是否在操作的黑名单中被排除。

```xml
<configuration>
  <property>
    <name>hadoop.kms.acl.CREATE</name>
    <value>*</value>
    <description>
          ACL for create-key operations.
          If the user is not in the GET ACL, the key material is not returned
          as part of the response.
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.CREATE</name>
    <value>hdfs,foo</value>
    <description>
          Blacklist for create-key operations.
          If the user is in the Blacklist, the key material is not returned
          as part of the response.
    </description>
  </property>

  <property>
    <name>hadoop.kms.acl.DELETE</name>
    <value>*</value>
    <description>
          ACL for delete-key operations.
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.DELETE</name>
    <value>hdfs,foo</value>
    <description>
          Blacklist for delete-key operations.
    </description>
  </property>

  <property>
    <name>hadoop.kms.acl.ROLLOVER</name>
    <value>*</value>
    <description>
          ACL for rollover-key operations.
          If the user is not in the GET ACL, the key material is not returned
          as part of the response.
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.ROLLOVER</name>
    <value>hdfs,foo</value>
    <description>
          Blacklist for rollover-key operations.
    </description>
  </property>

  <property>
    <name>hadoop.kms.acl.GET</name>
    <value>*</value>
    <description>
          ACL for get-key-version and get-current-key operations.
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.GET</name>
    <value>hdfs,foo</value>
    <description>
          ACL for get-key-version and get-current-key operations.
    </description>
  </property>

  <property>
    <name>hadoop.kms.acl.GET_KEYS</name>
    <value>*</value>
    <description>
         ACL for get-keys operation.
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.GET_KEYS</name>
    <value>hdfs,foo</value>
    <description>
          Blacklist for get-keys operation.
    </description>
  </property>

  <property>
    <name>hadoop.kms.acl.GET_METADATA</name>
    <value>*</value>
    <description>
        ACL for get-key-metadata and get-keys-metadata operations.
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.GET_METADATA</name>
    <value>hdfs,foo</value>
    <description>
         Blacklist for get-key-metadata and get-keys-metadata operations.
    </description>
  </property>

  <property>
    <name>hadoop.kms.acl.SET_KEY_MATERIAL</name>
    <value>*</value>
    <description>
            Complimentary ACL for CREATE and ROLLOVER operation to allow the client
            to provide the key material when creating or rolling a key.
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.SET_KEY_MATERIAL</name>
    <value>hdfs,foo</value>
    <description>
            Complimentary Blacklist for CREATE and ROLLOVER operation to allow the client
            to provide the key material when creating or rolling a key.
    </description>
  </property>

  <property>
    <name>hadoop.kms.acl.GENERATE_EEK</name>
    <value>*</value>
    <description>
          ACL for generateEncryptedKey
          CryptoExtension operations
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.GENERATE_EEK</name>
    <value>hdfs,foo</value>
    <description>
          Blacklist for generateEncryptedKey
          CryptoExtension operations
    </description>
  </property>

  <property>
    <name>hadoop.kms.acl.DECRYPT_EEK</name>
    <value>*</value>
    <description>
          ACL for decrypt EncryptedKey
          CryptoExtension operations
    </description>
  </property>

  <property>
    <name>hadoop.kms.blacklist.DECRYPT_EEK</name>
    <value>hdfs,foo</value>
    <description>
          Blacklist for decrypt EncryptedKey
          CryptoExtension operations
    </description>
  </property>
</configuration>
```

### **Key ACL（密钥访问控制列表）**

KMS 支持在密钥级别对所有非读操作进行访问控制。所有密钥访问操作被分类为：

- MANAGEMENT：createKey、deleteKey、rolloverNewVersion
- GENERATE_EEK：generateEncryptedKey、reencryptEncryptedKey、reencryptEncryptedKeys、warmUpEncryptedKeys
- DECRYPT_EEK：decryptEncryptedKey
- READ：getKeyVersion、getKeyVersions、getMetadata、getKeysMetadata、getCurrentKey
- ALL：上述所有操作

可以在 KMS 的 `etc/hadoop/kms-acls.xml` 中定义如下：

对于尚未明确配置密钥访问的所有密钥，可以为操作类型的子集配置默认密钥访问控制。

还可以为操作类型的子集配置“白名单”密钥 ACL。白名单密钥 ACL 在显式或默认的每个密钥 ACL 之外授予对密钥的访问权限。也就是说，如果没有显式设置每个密钥 ACL，则用户将在默认每个密钥 ACL 或白名单密钥 ACL 中被授予访问权限。如果显式设置了每个密钥 ACL，则用户将在每个密钥 ACL 或白名单密钥 ACL 中被授予访问权限。

如果未为特定密钥配置 ACL，且未配置默认 ACL 且未为请求的操作配置白名单密钥 ACL，则将拒绝访问。

**注意:** 默认和白名单密钥 ACL 不支持 ALL 操作限定符。

```xml
  <property>
    <name>key.acl.testKey1.MANAGEMENT</name>
    <value>*</value>
    <description>
      ACL for create-key, deleteKey and rolloverNewVersion operations.
    </description>
  </property>

  <property>
    <name>key.acl.testKey2.GENERATE_EEK</name>
    <value>*</value>
    <description>
      ACL for generateEncryptedKey operations.
    </description>
  </property>

  <property>
    <name>key.acl.testKey3.DECRYPT_EEK</name>
    <value>admink3</value>
    <description>
      ACL for decryptEncryptedKey operations.
    </description>
  </property>

  <property>
    <name>key.acl.testKey4.READ</name>
    <value>*</value>
    <description>
      ACL for getKeyVersion, getKeyVersions, getMetadata, getKeysMetadata,
      getCurrentKey operations
    </description>
  </property>

  <property>
    <name>key.acl.testKey5.ALL</name>
    <value>*</value>
    <description>
      ACL for ALL operations.
    </description>
  </property>

  <property>
    <name>whitelist.key.acl.MANAGEMENT</name>
    <value>admin1</value>
    <description>
      whitelist ACL for MANAGEMENT operations for all keys.
    </description>
  </property>

  <!--
  'testKey3' key ACL is defined. Since a 'whitelist'
  key is also defined for DECRYPT_EEK, in addition to
  admink3, admin1 can also perform DECRYPT_EEK operations
  on 'testKey3'
-->
  <property>
    <name>whitelist.key.acl.DECRYPT_EEK</name>
    <value>admin1</value>
    <description>
      whitelist ACL for DECRYPT_EEK operations for all keys.
    </description>
  </property>

  <property>
    <name>default.key.acl.MANAGEMENT</name>
    <value>user1,user2</value>
    <description>
      default ACL for MANAGEMENT operations for all keys that are not
      explicitly defined.
    </description>
  </property>

  <property>
    <name>default.key.acl.GENERATE_EEK</name>
    <value>user1,user2</value>
    <description>
      default ACL for GENERATE_EEK operations for all keys that are not
      explicitly defined.
    </description>
  </property>

  <property>
    <name>default.key.acl.DECRYPT_EEK</name>
    <value>user1,user2</value>
    <description>
      default ACL for DECRYPT_EEK operations for all keys that are not
      explicitly defined.
    </description>
  </property>

  <property>
    <name>default.key.acl.READ</name>
    <value>user1,user2</value>
    <description>
      default ACL for READ operations for all keys that are not
      explicitly defined.
    </description>
  </property>
```

## **KMS 委托令牌配置**

KMS 支持委托令牌以在没有 Kerberos 凭据的情况下对进程进行身份验证，从而进行与密钥提供者的身份验证。

KMS 委托令牌身份验证扩展了默认的 Hadoop 身份验证。与 Hadoop 身份验证一样，KMS 委托令牌不能使用委托令牌身份验证来获取或更新。

有关详细信息，请参见 Hadoop Auth 页面。

此外，可以使用以下属性配置 KMS 委托令牌密钥管理器：

```xml
  <property>
    <name>hadoop.kms.authentication.delegation-token.update-interval.sec</name>
    <value>86400</value>
    <description>
      How often the master key is rotated, in seconds. Default value 1 day.
    </description>
  </property>

  <property>
    <name>hadoop.kms.authentication.delegation-token.max-lifetime.sec</name>
    <value>604800</value>
    <description>
      Maximum lifetime of a delegation token, in seconds. Default value 7 days.
    </description>
  </property>

  <property>
    <name>hadoop.kms.authentication.delegation-token.renew-interval.sec</name>
    <value>86400</value>
    <description>
      Renewal interval of a delegation token, in seconds. Default value 1 day.
    </description>
  </property>

  <property>
    <name>hadoop.kms.authentication.delegation-token.removal-scan-interval.sec</name>
    <value>3600</value>
    <description>
      Scan interval to remove expired delegation tokens.
    </description>
  </property>
```

## **高可用性**

可以使用多个 KMS 实例提供高可用性和可扩展性。目前有两种支持多个 KMS 实例的方法：在负载均衡器/VIP后运行 KMS 实例，或者使用 LoadBalancingKMSClientProvider。

在这两种方法中，KMS 实例必须经过特殊配置，以正常运行作为单个逻辑服务，因为来自同一客户端的请求可能由不同的 KMS 实例处理。特别是，Kerberos 主体配置、HTTP 身份验证签名和委托令牌需要特别注意。

### **在负载均衡器或 VIP 后运行**

由于 KMS 客户端和服务器通过 HTTP 上的 REST API 进行通信，因此可以使用负载均衡器或 VIP 来分发传入的流量，以实现可扩展性和高可用性。在这种模式下，客户端不知道服务器端存在多个 KMS 实例。

### **使用 LoadBalancingKMSClientProvider**

与在负载均衡器或 VIP 后运行多个 KMS 实例的替代方法是使用 LoadBalancingKMSClientProvider。

使用这种方法，KMS 客户端（例如，HDFS NameNode）知道多个 KMS 实例，并以轮询方式将请求发送到它们。

当在 hadoop.security.key.provider.path 中指定多个 URI 时，LoadBalancingKMSClientProvider 会隐式使用。

以下是 core-site.xml 中的示例，配置了两个 KMS 实例，kms01.example.com 和 kms02.example.com。主机名之间用分号分隔，所有 KMS 实例必须在相同的端口上运行。

```xml
<property>
  <name>hadoop.security.key.provider.path</name>
  <value>kms://https@kms01.example.com;kms02.example.com:9600/kms</value>
  <description>
    与加密区域中的读写操作交互时要使用的 KeyProvider。
  </description>
</property>
```

如果对 KMS 实例的请求失败，客户端会重试下一个实例。只有在所有实例失败时，请求才被返回为失败。

### **HTTP Kerberos 主体配置**

当 KMS 实例在负载均衡器或 VIP 后面时，客户端将使用 VIP 的主机名。对于 Kerberos SPNEGO 身份验证，URL 的主机名用于构建服务器的 Kerberos 服务名称，即 HTTP/#HOSTNAME#。这意味着所有 KMS 实例都必须具有与负载均衡器或 VIP 主机名相对应的 Kerberos 服务名称。

为了能够直接访问特定的 KMS 实例，该 KMS 实例还必须具有其自己主机名的 Kerberos 服务名称。这对于监控和管理目的是必需的。

配置用于身份验证的 keytab 文件必须包含负载均衡器/VIP 主机名和实际 KMS 实例主机名的 Kerberos 服务主体凭据。配置中指定的主体名称必须为 '*'。例如：

```xml
<property>
  <name>hadoop.kms.authentication.kerberos.principal</name>
  <value>*</value>
</property>
```

**注意：** 如果使用 HTTPS，KMS 实例使用的 SSL 证书必须配置为支持多个主机名（有关如何执行此操作的详细信息，请参见 Java 7 keytool SAN 扩展支持）。

### **HTTP 身份验证签名**

KMS 使用 Hadoop Authentication 进行 HTTP 身份验证。Hadoop Authentication 在客户端成功身份验证后会发出已签名的 HTTP Cookie。此 HTTP Cookie 具有过期时间，之后将触发新的身份验证序列。这样做是为了避免在客户端的每个 HTTP 请求上触发身份验证。

KMS 实例必须验证其他 KMS 实例签名的 HTTP Cookie。为此，所有 KMS 实例必须共享签名密钥。

请参阅 SignerSecretProvider 配置以获取详细说明和配置示例。请注意，KMS 配置需要以 hadoop.kms.authentication 为前缀，如下例所示。

可以使用在 kms-site.xml 中配置的 Zookeeper 服务进行此秘密共享：

```xml
<property>
    <name>hadoop.kms.authentication.signer.secret.provider</name>
    <value>zookeeper</value>
    <description>
      Indicates how the secret to sign the authentication cookies will be
      stored. Options are 'random' (default), 'file' and 'zookeeper'.
      If using a setup with multiple KMS instances, 'zookeeper' should be used.
      If using file, signature.secret.file should be configured and point to the secret file.
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.signer.secret.provider.zookeeper.path</name>
    <value>/hadoop-kms/hadoop-auth-signature-secret</value>
    <description>
      The Zookeeper ZNode path where the KMS instances will store and retrieve
      the secret from. All KMS instances that need to coordinate should point to the same path.
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.signer.secret.provider.zookeeper.connection.string</name>
    <value>#HOSTNAME#:#PORT#,...</value>
    <description>
      The Zookeeper connection string, a list of hostnames and port comma
      separated.
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.signer.secret.provider.zookeeper.auth.type</name>
    <value>sasl</value>
    <description>
      The Zookeeper authentication type, 'none' (default) or 'sasl' (Kerberos).
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.signer.secret.provider.zookeeper.kerberos.keytab</name>
    <value>/etc/hadoop/conf/kms.keytab</value>
    <description>
      The absolute path for the Kerberos keytab with the credentials to
      connect to Zookeeper.
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.signer.secret.provider.zookeeper.kerberos.principal</name>
    <value>kms/#HOSTNAME#</value>
    <description>
      The Kerberos service principal used to connect to Zookeeper.
    </description>
  </property>
```

### **委托令牌**

与 HTTP 身份验证类似，KMS 也使用 Hadoop Authentication 进行委托令牌。在高可用 (HA) 情况下，每个 KMS 实例必须验证另一个 KMS 实例提供的委托令牌。

为此，所有 KMS 实例必须使用 ZKDelegationTokenSecretManager 从 ZooKeeper 检索 TokenIdentifiers 和 DelegationKeys。

在 `etc/hadoop/kms-site.xml` 中的示例配置：

```xml
<property>
    <name>hadoop.kms.authentication.zk-dt-secret-manager.enable</name>
    <value>true</value>
    <description>
      If true, Hadoop KMS uses ZKDelegationTokenSecretManager to persist
      TokenIdentifiers and DelegationKeys in ZooKeeper.
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.zk-dt-secret-manager.zkConnectionString</name>
    <value>#HOSTNAME#:#PORT#,...</value>
    <description>
      The ZooKeeper connection string, a comma-separated list of hostnames and port.
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.zk-dt-secret-manager.znodeWorkingPath</name>
    <value>/hadoop-kms/zkdtsm</value>
    <description>
      The ZooKeeper znode path where the KMS instances will store and retrieve
      the secret from. All the KMS instances that need to coordinate should point to the same path.
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.zk-dt-secret-manager.zkAuthType</name>
    <value>sasl</value>
    <description>
      The ZooKeeper authentication type, 'none' (default) or 'sasl' (Kerberos).
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.zk-dt-secret-manager.kerberos.keytab</name>
    <value>/etc/hadoop/conf/kms.keytab</value>
    <description>
      The absolute path for the Kerberos keytab with the credentials to
      connect to ZooKeeper. This parameter is effective only when
      hadoop.kms.authentication.zk-dt-secret-manager.zkAuthType is set to 'sasl'.
    </description>
  </property>
  <property>
    <name>hadoop.kms.authentication.zk-dt-secret-manager.kerberos.principal</name>
    <value>kms/#HOSTNAME#</value>
    <description>
      The Kerberos service principal used to connect to ZooKeeper.
      This parameter is effective only when
      hadoop.kms.authentication.zk-dt-secret-manager.zkAuthType is set to 'sasl'.
    </description>
  </property>
```

## **KMS HTTP REST API**

### **创建密钥**

**请求:**

```http
POST http://主机:端口/kms/v1/keys
Content-Type: application/json

{
  "name"        : "<key-name>",
  "cipher"      : "<cipher>",
  "length"      : <length>,        //整数
  "material"    : "<material>",    //base64
  "description" : "<description>"
}
```

**响应:**

```http
201 CREATED
LOCATION: http://主机:端口/kms/v1/key/<key-name>
Content-Type: application/json

{
  "name"        : "versionName",
  "material"    : "<material>"    //base64，如果没有 GET ACL 则不显示
}
```

### **密钥翻转**

**请求:**

```http
POST http://主机:端口/kms/v1/key/<key-name>
Content-Type: application/json

{
  "material"    : "<material>",
}
```

**响应:**

```http
200 OK
Content-Type: application/json

{
  "name"        : "versionName",
  "material"    : "<material>"    //base64，如果没有 GET ACL 则不显示
}
```

### **使密钥缓存无效**

**请求:**

```http
POST http://主机:端口/kms/v1/key/<key-name>/_invalidatecache
```

**响应:**

```http
200 OK
```

### **删除密钥**

**请求:**

```http
DELETE http://主机:端口/kms/v1/key/<key-name>
```

**响应:**

```http
200 OK
```

### **获取密钥元数据**

**请求:**

```http
GET http://主机:端口/kms/v1/key/<key-name>/_metadata
```

**响应:**

```http
200 OK
Content-Type: application/json

{
  "name"        : "<key-name>",
  "cipher"      : "<cipher>",
  "length"      : <length>,        //int
  "description" : "<description>",
  "created"     : <millis-epoc>,   //long
  "versions"    : <versions>       //int
}
```

### **获取当前密钥**

**请求:**

```http
GET http://主机:端口/kms/v1/key/<key-name>/_currentversion
```

**响应:**

```http
200 OK
Content-Type: application/json

{
  "name"        : "versionName",
  "material"    : "<material>"    //base64
}
```

### **生成当前KeyVersion的加密密钥**

**请求:**

```http
GET http://主机:端口/kms/v1/key/<key-name>/_eek?eek_op=generate&num_keys=<number-of-keys-to-generate>
```

**响应:**

```http
200 OK
Content-Type: application/json

[
  {
    "versionName"         : "<encryptionVersionName>",
    "iv"                  : "<iv>",          //base64
    "encryptedKeyVersion" : {
        "versionName"       : "EEK",
        "material"          : "<material>",    //base64
    }
  },
  {
    "versionName"         : "<encryptionVersionName>",
    "iv"                  : "<iv>",          //base64
    "encryptedKeyVersion" : {
        "versionName"       : "EEK",
        "material"          : "<material>",    //base64
    }
  },
  ...
]
```

### **解密加密的密钥**

**请求:**

```http
POST http://主机:端口/kms/v1/keyversion/<version-name>/_eek?eek_op=decrypt
Content-Type: application/json

{
  "name"        : "<key-name>",
  "iv"          : "<iv>",          //base64
  "material"    : "<material>"    //base64
}
```

**响应:**

```http
200 OK
Content-Type: application/json

{
  "name"        : "EK",
  "material"    : "<material>"    //base64
}
```

### **用最新的KeyVersion重新加密已加密的密钥**

**请求:**

```http
POST http://主机:端口/kms/v1/keyversion/<version-name>/_eek?eek_op=reencrypt
Content-Type: application/json

{
  "name"        : "<key-name>",
  "iv"          : "<iv>",          //base64
  "material"    : "<material>"    //base64
}
```

**响应:**

```http
200 OK
Content-Type: application/json

{
  "versionName"         : "<encryptionVersionName>",
  "iv"                  : "<iv>",            //base64
  "encryptedKeyVersion" : {
      "versionName"       : "EEK",
      "material"          : "<material>"    //base64
  }
}
```

### **使用最新的KeyVersion批量重新加密已加密的密钥**

**请求:**

```http
POST http://主机:端口/kms/v1/key/<key-name>/_reencryptbatch
Content-Type: application/json

[
  {
    "versionName"         : "<encryptionVersionName>",
    "iv"                  : "<iv>",            //base64
    "encryptedKeyVersion" : {
        "versionName"       : "EEK",
        "material"          : "<material>"    //base64
    }
  },
  {
    "versionName"         : "<encryptionVersionName>",
    "iv"                  : "<iv>",            //base64
    "encryptedKeyVersion" : {
        "versionName"       : "EEK",
        "material"          : "<material>"    //base64
    }
  },
  ...
]
```

**响应:**

```http
200 OK
Content-Type: application/json

[
  {
    "versionName"         : "<encryptionVersionName>",
    "iv"                  : "<iv>",            //base64
    "encryptedKeyVersion" : {
        "versionName"       : "EEK",
        "material"          : "<material>"    //base64
    }
  },
  {
    "versionName"         : "<encryptionVersionName>",
    "iv"                  : "<iv>",            //base64
    "encryptedKeyVersion" : {
        "versionName"       : "EEK",
        "material"          : "<material>"    //base64
    }
  },
  ...
]
```

### **获取密钥版本**

**请求:**

```http
GET http://主机:端口/kms/v1/keyversion/<version-name>
```

**响应:**

```http
200 OK
Content-Type: application/json

{
  "name"        : "<name>",
  "versionName" : "<version>",
  "material"    : "<material>"    //base64
}
```

### **获取密钥所有版本**

**请求:**

```http
GET http://主机:端口/kms/v1/key/<key-name>/_versions
```

**响应:**

```http
200 OK
Content-Type: application/json

[
  {
    "name"        : "<name>",
    "versionName" : "<version>",
    "material"    : "<material>"    //base64
  },
  {
    "name"        : "<name>",
    "versionName" : "<version>",
    "material"    : "<material>"    //base64
  },
  ...
]
```

### **获取所有密钥名称**

**请求:**

```http
GET http://主机:端口/kms/v1/keys/names
```

**响应:**

```http
200 OK
Content-Type: application/json

[
  "<key-name>",
  "<key-name>",
  ...
]
```

### **获取密钥元数据**

**请求:**

```http
GET http://主机:端口/kms/v1/keys/metadata?key=<key-name>&key=<key-name>,...
```

**响应:**

```http
200 OK
Content-Type: application/json

[
  {
    "name"        : "<key-name>",
    "cipher"      : "<cipher>",
    "length"      : <length>,        //int
    "description" : "<description>",
    "created"     : <millis-epoc>,   //long
    "versions"    : <versions>       //int
  },
  {
    "name"        : "<key-name>",
    "cipher"      : "<cipher>",
    "length"      : <length>,        //int
    "description" : "<description>",
    "created"     : <millis-epoc>,   //long
    "versions"    : <versions>       //int
  },
  ...
]
```

## **已弃用的环境变量**

以下环境变量已弃用。请设置相应的配置属性。

| 环境变量               | 配置属性                             | 配置文件              |
|----------------------|-----------------------------------|----------------------|
| KMS_TEMP             | hadoop.http.temp.dir               | kms-site.xml         |
| KMS_HTTP_PORT        | hadoop.kms.http.port               | kms-site.xml         |
| KMS_MAX_HTTP_HEADER_SIZE | hadoop.http.max.request.header.size 和 hadoop.http.max.response.header.size | kms-site.xml |
| KMS_MAX_THREADS       | hadoop.http.max.threads             | kms-site.xml         |
| KMS_SSL_ENABLED       | hadoop.kms.ssl.enabled             | kms-site.xml         |
| KMS_SSL_KEYSTORE_FILE | ssl.server.keystore.location       | ssl-server.xml       |
| KMS_SSL_KEYSTORE_PASS | ssl.server.keystore.password       | ssl-server.xml       |

默认 HTTP 服务

| 名称               | 描述                                   |
|-------------------|----------------------------------------|
| /conf             | 显示配置属性                             |
| /jmx              | Java JMX 管理界面                        |
| /logLevel         | 获取或设置每个类的日志级别                 |
| /logs             | 显示日志文件                              |
| /stacks           | 显示 JVM 堆栈                             |
| /static/index.html | 静态主页                                 |

要控制对 servlet /conf、/jmx、/logLevel、/logs 和 /stacks 的访问，请在 kms-site.xml 中配置以下属性：

```xml
  <property>
    <name>hadoop.security.authorization</name>
    <value>true</value>
    <description>Is service-level authorization enabled?</description>
  </property>

  <property>
    <name>hadoop.security.instrumentation.requires.admin</name>
    <value>true</value>
    <description>
      Indicates if administrator ACLs are required to access
      instrumentation servlets (JMX, METRICS, CONF, STACKS).
    </description>
  </property>

  <property>
    <name>hadoop.kms.http.administrators</name>
    <value></value>
    <description>ACL for the admins, this configuration is used to control
      who can access the default KMS servlets. The value should be a comma
      separated list of users and groups. The user list comes first and is
      separated by a space followed by the group list,
      e.g. "user1,user2 group1,group2". Both users and groups are optional,
      so "user1", " group1", "", "user1 group1", "user1,user2 group1,group2"
      are all valid (note the leading space in " group1"). '*' grants access
      to all users and groups, e.g. '*', '* ' and ' *' are all valid.
    </description>
  </property>
```

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-kms/index.html

* any list
{:toc}