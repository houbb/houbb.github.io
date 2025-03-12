---
layout: post
title: IM 即时通讯系统 SSO 系列-08-用户激活邮箱验证
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# 邮箱验证

我们接下来的重点就是结合邮箱，实现一个验证方式。

当然验证的方式可以有多种，目前比较推荐的还是邮箱验证。

## 整体流程

1）发送验证码到用户邮箱

2）用户点击后进行验证校验+处理，通过后更新对应的状态。

# 核心实现

## 建表语句

```sql
drop table if exists user_email_verify;
CREATE TABLE user_email_verify (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    token VARCHAR(64) NOT NULL COMMENT '访问令牌',
    email varchar(256) NOT NULL COMMENT '用户邮箱',
    expire_time DATETIME NOT NULL COMMENT '过期时间',
    verify_time DATETIME NULL COMMENT '验证时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户邮箱验证表';
CREATE unique INDEX uk_user_email_verify_token ON user_email_verify(email);
```

## 验证发送

```java
@Override
@Transactional(rollbackFor = Exception.class)
public void sendActivationEmail(Long userId) {
    User user = userMapper.selectById(userId);
    String activationToken = generateActivationToken(user);
    emailService.sendActivationEmail(user.getEmail(), activationToken);

    // 记录发送的令牌信息
    UserEmailVerify userEmailVerify = buildUserEmailVerify(user, activationToken);
    userEmailVerifyMapper.insert(userEmailVerify);

    // 状态设置为待激活
    handleStatusTransition(userId, UserStatus.ACCOUNT_CREATED, UserStatus.WAIT_ACTIVE);
}
```

## 验证令牌

这里需要做一些信息的校验。

```java
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void verifyActivationToken(String token) {
        ArgUtil.notEmpty(token, "token");

        final Date now = new Date();
        UserEmailVerify userEmailVerify = userEmailVerifyMapper.selectByToken(token);
        if(userEmailVerify == null) {
            throw new BizException(SsoRespCode.USER_EMAIL_VERIFY_NOT_FOUND);
        }
        if(userEmailVerify.getExpireTime().compareTo(now) < 0) {
            throw new BizException(SsoRespCode.USER_EMAIL_VERIFY_EXPIRED);
        }
        // 用户状态
        final Long userId = userEmailVerify.getUserId();
        User user = userMapper.selectById(userId);
        if(user == null) {
            throw new BizException(SsoRespCode.USER_NOT_FOUND);
        }
        if(!UserStatus.WAIT_ACTIVE.name().equalsIgnoreCase(user.getUserStatus())) {
            throw new BizException(SsoRespCode.USER_EMAIL_VERIFY_STATUS_ERROR);
        }

        // 更新
        userEmailVerifyMapper.updateVerifyTimeByToken(token, now);
        handleStatusTransition(userId, UserStatus.WAIT_ACTIVE, UserStatus.ACTIVATED);
    }
```

## 测试验证

直接通过 swagger 触发，然后邮箱点击，最后观察数据库信息。

验证信息

```
mysql> select * from user_email_verify \G;
*************************** 1. row ***************************
         id: 2
    user_id: 1
      token: 32bd8e75-bb65-4d99-849c-577707586e8b
      email: xxx@qq.com
expire_time: 2025-03-10 14:25:46
verify_time: 2025-03-10 14:17:06
create_time: 2025-03-10 22:15:45
update_time: 2025-03-10 22:17:19
1 row in set (0.00 sec)
```

# 小结

我们只需要关注一下状态的流转，做好对应的实现即可。

我们下一篇就看如何根据 email 实现对应的发送验证邮件+验证。

当然，这里也可以实现一些基于 sms 等更多方式的激活验证，后续有时间可以实现。

# chat

补充一些基本知识：

## 详细介绍一下 SMTP

SMTP（Simple Mail Transfer Protocol）即简单邮件传输协议，它是用于在互联网上进行电子邮件传输的标准协议。

以下将从多个方面对 SMTP 进行详细介绍：

### 基本概念
SMTP 是一种基于 TCP/IP 的应用层协议，主要负责将电子邮件从发件人的邮件客户端或邮件服务器发送到收件人的邮件服务器。

它定义了邮件服务器之间如何进行通信，以确保邮件能够准确、可靠地传输。

### 工作流程
SMTP 的工作流程通常包含以下几个主要步骤：
1. **连接建立**：发件人的邮件客户端或邮件服务器（发送方）与收件人的邮件服务器（接收方）建立 TCP 连接，默认端口是 25（明文传输）或 587（加密传输）。
2. **身份验证（可选）**：在发送邮件之前，发送方可能需要向接收方进行身份验证，以确保只有授权的用户或服务器可以发送邮件。
3. **邮件发送**：发送方通过 SMTP 命令向接收方发送邮件的相关信息，包括发件人地址、收件人地址、邮件主题、邮件内容等。
4. **接收确认**：接收方在接收到邮件后，会向发送方发送确认信息，表示邮件已成功接收。
5. **连接关闭**：邮件发送完成后，发送方和接收方关闭 TCP 连接。

### 主要命令
SMTP 协议定义了一系列的命令，用于在邮件传输过程中进行通信。以下是一些常见的 SMTP 命令：
- **HELO/EHLO**：用于发送方向接收方标识自己的身份。
- **MAIL FROM**：指定发件人的邮箱地址。
- **RCPT TO**：指定收件人的邮箱地址。
- **DATA**：表示接下来要发送邮件的具体内容。
- **QUIT**：用于关闭 SMTP 连接。

### 安全问题
- **明文传输风险**：传统的 SMTP 使用端口 25 进行明文传输，容易导致邮件内容和用户身份信息被窃取。
- **垃圾邮件问题**：由于 SMTP 协议的开放性，容易被不法分子利用来发送大量的垃圾邮件。

### 解决方案
- **加密传输**：使用 SSL/TLS 加密协议对 SMTP 连接进行加密，常见的端口有 465（SSL）和 587（TLS）。
- **身份验证**：要求发送方进行身份验证，确保只有授权的用户或服务器可以发送邮件。
- **反垃圾邮件机制**：采用垃圾邮件过滤技术，如黑白名单、内容过滤等，减少垃圾邮件的影响。

### 与其他协议的关系
- **POP3/IMAP**：SMTP 主要负责邮件的发送，而 POP3（Post Office Protocol 3）和 IMAP（Internet Message Access Protocol）则用于邮件的接收。用户通过 POP3 或 IMAP 协议从邮件服务器下载邮件到本地客户端。
- **MIME**：MIME（Multipurpose Internet Mail Extensions）是对 SMTP 协议的扩展，用于支持多种类型的邮件内容，如图片、音频、视频等。

通过以上介绍，你可以对 SMTP 协议有一个全面的了解，包括其工作原理、主要命令、安全问题及解决方案等。


## java 如何实现邮件发送？

在 Java 中实现邮件发送通常可以使用 JavaMail API 来完成，同时配合 JavaBeans Activation Framework (JAF) 处理邮件中的各种数据类型。

以下是详细的实现步骤和示例代码：

### 1. 添加依赖
如果你使用 Maven 项目，可以在 `pom.xml` 中添加以下依赖：
```xml
<dependencies>
    <!-- JavaMail API -->
    <dependency>
        <groupId>com.sun.mail</groupId>
        <artifactId>jakarta.mail</artifactId>
        <version>2.0.1</version>
    </dependency>
</dependencies>
```

### 2. 配置邮件会话
邮件会话（`Session`）是 JavaMail API 的核心，用于与邮件服务器进行通信。你需要配置邮件服务器的相关信息，如主机名、端口号、用户名和密码等。

### 3. 创建邮件消息
使用 `MimeMessage` 类创建邮件消息，设置邮件的发件人、收件人、主题和正文等信息。

### 4. 发送邮件
使用 `Transport` 类将邮件消息发送到邮件服务器。

### 示例代码
以下是一个简单的 Java 代码示例，用于发送纯文本邮件：
```java
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

public class EmailSender {
    public static void main(String[] args) {
        // 配置邮件服务器信息
        Properties properties = new Properties();
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.host", "smtp.example.com"); // 替换为实际的 SMTP 服务器地址
        properties.put("mail.smtp.port", "587"); // 替换为实际的 SMTP 服务器端口

        // 创建邮件会话
        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("your_email@example.com", "your_password"); // 替换为实际的邮箱地址和密码
            }
        });

        try {
            // 创建邮件消息
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("your_email@example.com")); // 替换为实际的发件人邮箱地址
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("recipient_email@example.com")); // 替换为实际的收件人邮箱地址
            message.setSubject("测试邮件");
            message.setText("这是一封测试邮件。");

            // 发送邮件
            Transport.send(message);

            System.out.println("邮件发送成功！");
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
```

### 发送 HTML 格式邮件
如果你想发送 HTML 格式的邮件，可以使用 `MimeMultipart` 和 `MimeBodyPart` 类来创建邮件内容：
```java
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;

import java.util.Properties;

public class HtmlEmailSender {
    public static void main(String[] args) {
        // 配置邮件服务器信息
        Properties properties = new Properties();
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.host", "smtp.example.com"); // 替换为实际的 SMTP 服务器地址
        properties.put("mail.smtp.port", "587"); // 替换为实际的 SMTP 服务器端口

        // 创建邮件会话
        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("your_email@example.com", "your_password"); // 替换为实际的邮箱地址和密码
            }
        });

        try {
            // 创建邮件消息
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("your_email@example.com")); // 替换为实际的发件人邮箱地址
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("recipient_email@example.com")); // 替换为实际的收件人邮箱地址
            message.setSubject("测试 HTML 邮件");

            // 创建 HTML 内容
            MimeBodyPart htmlPart = new MimeBodyPart();
            htmlPart.setContent("<html><body><h1>这是一封 HTML 格式的测试邮件。</h1></body></html>", "text/html; charset=utf-8");

            // 创建多部分消息
            Multipart multipart = new MimeMultipart();
            multipart.addBodyPart(htmlPart);

            // 设置邮件内容
            message.setContent(multipart);

            // 发送邮件
            Transport.send(message);

            System.out.println("HTML 邮件发送成功！");
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
```

### 注意事项
- 不同的邮件服务提供商（如 Gmail、QQ 邮箱等）的 SMTP 服务器地址和端口号可能不同，需要根据实际情况进行配置。
- 一些邮件服务提供商可能需要开启 SMTP 服务并获取授权码，而不是使用邮箱的登录密码。
- 在生产环境中，建议将邮件服务器的配置信息和用户认证信息存储在配置文件中，避免硬编码在代码中。



# 参考资料

* any list
{:toc}