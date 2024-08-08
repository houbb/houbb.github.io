---
layout: post
title: alibaba druid-06-加解密
date: 2024-03-27 21:01:55 +0800
categories: [Database]
tags: [database, jdbc, sh]
published: true
---

# chat

## 详细介绍一下 druid password 的加解密

Druid 提供了对数据库连接密码的加密和解密功能，以提高安全性，防止数据库密码在配置文件中以明文形式暴露。

这种加密方式是通过 Druid 的内置功能实现的。

### 一、加密密码

Druid 使用 `DruidPasswordCallback` 进行密码的加密和解密。加密密码的步骤如下：

1. **生成密钥文件**

   首先，你需要生成一个用于加密和解密的密钥文件。这个文件会用来加密数据库密码。

   ```shell
   java -cp druid-x.x.x.jar com.alibaba.druid.filter.config.ConfigTools <your_password>
   ```

   运行上述命令后，输出结果会包括三个部分：
   
   - **privateKey**: 私钥
   - **publicKey**: 公钥
   - **password**: 加密后的密码
   
   例如：
   
   ```shell
   privateKey: MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAMl1ryLz9ZfLbUI...
   publicKey: MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL9sBkwHY...
   password: Dv7cWQk1jVc7K/zNFFN2asU5Cn...
   ```

2. **保存公钥和加密密码**

   - 将公钥保存到一个文件中，比如 `publicKey.txt`。
   - 在配置文件中使用加密后的密码。

### 二、配置 Druid 使用加密密码

1. **编写 `DruidPasswordCallback` 子类**

   你需要编写一个继承 `DruidPasswordCallback` 的类，用于加载密钥和解密密码。示例如下：

   ```java
   import com.alibaba.druid.util.DruidPasswordCallback;

   import javax.crypto.Cipher;
   import java.io.FileReader;
   import java.security.KeyFactory;
   import java.security.PrivateKey;
   import java.security.spec.PKCS8EncodedKeySpec;
   import java.util.Properties;
   import java.util.Base64;

   public class MyPasswordCallback extends DruidPasswordCallback {

       @Override
       public void setProperties(Properties properties) {
           super.setProperties(properties);
           String password = properties.getProperty("password");

           try {
               String publicKeyPath = "/path/to/publicKey.txt";
               String privateKey = getPrivateKey(publicKeyPath);
               password = decrypt(password, privateKey);
               setPassword(password.toCharArray());
           } catch (Exception e) {
               e.printStackTrace();
           }
       }

       private String getPrivateKey(String filename) throws Exception {
           FileReader reader = new FileReader(filename);
           char[] buffer = new char[4096];
           int read = reader.read(buffer);
           reader.close();
           return new String(buffer, 0, read);
       }

       private String decrypt(String encrypted, String privateKey) throws Exception {
           byte[] keyBytes = Base64.getDecoder().decode(privateKey);
           PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
           KeyFactory keyFactory = KeyFactory.getInstance("RSA");
           PrivateKey key = keyFactory.generatePrivate(spec);

           Cipher cipher = Cipher.getInstance("RSA");
           cipher.init(Cipher.DECRYPT_MODE, key);
           byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encrypted));
           return new String(decrypted);
       }
   }
   ```

   这里的 `MyPasswordCallback` 类用于从文件中读取私钥，并解密数据库密码。

2. **配置文件 `application.yml`**

   在 Druid 配置中添加以下内容：

   ```yaml
   druid:
     datasource:
       username: myuser
       password: Dv7cWQk1jVc7K/zNFFN2asU5Cn... # 加密后的密码
       filters: config
       connection-properties: config.decrypt=true;config.decrypt.key=/path/to/publicKey.txt
       password-callback-class-name: com.example.MyPasswordCallback
   ```

   这里需要注意：
   - `password` 属性中填写加密后的密码。
   - `filters` 中添加 `config`，用于启用配置解密功能。
   - `connection-properties` 中设置 `config.decrypt=true` 以启用密码解密，并指明密钥文件的位置。

### 三、解密密码

Druid 在运行时会根据你提供的 `DruidPasswordCallback` 类来解密数据库连接密码。

- **config.decrypt**: 如果设置为 `true`，Druid 将会自动调用 `DruidPasswordCallback` 对 `password` 进行解密。

- **password-callback-class-name**: 这里指向你实现的 `DruidPasswordCallback` 类，该类负责读取密钥并解密密码。

### 四、注意事项

1. **安全性**: 私钥文件的存储位置和权限必须严格控制，确保只有应用程序可以读取它，避免被不正当访问。

2. **密钥管理**: 公钥和私钥的管理应严格遵循安全管理规范，防止密钥泄漏。

3. **性能**: 解密过程会增加一定的启动时间，但对运行时性能影响较小。

通过这种加解密机制，Druid 可以在保护数据库密码安全的同时，确保应用能够顺利连接数据库。

# 参考资料

https://www.cnblogs.com/yeahwell/p/9252931.html

https://www.cnblogs.com/wuyun-blog/p/5679073.html

https://y0ngb1n.github.io/a/best-practice-samples-datasource-alibaba-druid.html


* any list
{:toc}
