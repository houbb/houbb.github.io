---
layout: post
title: IM 即时通讯系统 SSO 系列-09-用户密码的完整生命周期
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# 邮箱验证

我们接下来的重点如何管理用户的密码？

如何保证安全、同时实现忘记密码、修改密码等常用的操作。

# 整体流程

我们针对密码的创建、修改、忘记密码、验证密码等流程，进行实现。

## 建表语句

```sql
-- 创建用户密码表
CREATE TABLE user_password (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户 ID',
    password VARCHAR(255) NOT NULL COMMENT '用户密码，加密存储',
    salt VARCHAR(255) NOT NULL COMMENT '密码盐，用于加密密码',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户密码表';
CREATE unique INDEX uk_user_password_uid ON user_password(user_id);

CREATE TABLE user_password_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT COMMENT '用户 ID',
    password VARCHAR(255) NOT NULL COMMENT '用户密码，加密存储',
    salt VARCHAR(255) NULL COMMENT '密码盐',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户密码历史表';
CREATE INDEX ix_user_password_history_uid ON user_password_history(user_id);

CREATE TABLE user_password_verify_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户 ID',
    password VARCHAR(255) NOT NULL COMMENT '用户密码，加密存储',
    verify_status varchar(8) NOT NULL COMMENT '验证状态 S:成功;F:失败',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户验证历史表';
CREATE INDEX ix_user_password_verify_history_uid ON user_password_verify_history(user_id);

CREATE TABLE user_forget_password_email_verify (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    token VARCHAR(64) NOT NULL COMMENT '访问令牌',
    user_id BIGINT NOT NULL COMMENT '用户 ID',
    email varchar(256) NOT NULL COMMENT '用户邮箱',
    expire_time DATETIME NOT NULL COMMENT '过期时间',
    verify_time DATETIME NULL COMMENT '验证时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户忘记密码邮箱验证表';
CREATE unique INDEX uk_user_forget_password_email_verify_token ON user_email_verify(email);
```

## 实体

创建对应的实体类 + mapper

接下来，我们把对用户密码的管理放在 UserPasswordController 中管理，服务层实现放在 UserPasswordService，涉及到的底层表用对应的 mapper 实现。

首先是密码的创建流程，给出对应的实现

## 密码创建

### 流程

入参：

userId, password, passwordConfirm

流程：

a. 验证两次密码相同
b. 验证用户状态为激活
c. 为用户生成唯一的 uuid salt，将 md5(password+salt) 哈希后存入到 user_password，同时记录 user_password_history

### 核心实现

```java
    @Transactional(rollbackFor = Exception.class)
    public void createPassword(Long userId, String password, String passwordConfirm) {
        // 1.验证两次密码相同
        ArgUtil.notEmpty(password, "password");
        ArgUtil.notEmpty(passwordConfirm, "passwordConfirm");
        if (!password.equals(passwordConfirm)) {
            throw new BizException(SsoRespCode.USER_PASSWORD_NOT_MATCH);
        }

        // 2.验证用户状态为激活
        User user = userService.selectById(userId);
        if (!UserStatus.ACTIVATED.name().equals(user.getUserStatus())) {
            throw new BizException(SsoRespCode.USER_STATUS_INVALID);
        }

        // 3.生成salt并加密存储
        String salt = UUID.randomUUID().toString();
        String encryptedPassword = md5(password + salt);
        
        UserPassword userPassword = new UserPassword();
        userPassword.setUserId(userId);
        userPassword.setPassword(encryptedPassword);
        userPassword.setSalt(salt);
        userPassword.setCreateTime(new Date());
        userPasswordMapper.insert(userPassword);

        // 记录密码历史
        UserPasswordHistory history = new UserPasswordHistory();
        history.setUserId(userId);
        history.setPassword(encryptedPassword);
        history.setSalt(salt);
        history.setCreateTime(new Date());
        userPasswordHistoryMapper.insert(history);
    }
```

### 测试验证

```
curl -X POST "http://localhost:8080/api/user-password/create" -H "accept: */*" -H "Content-Type: application/json" -d "{ \"password\": \"password123\", \"passwordConfirm\": \"password123\", \"userId\": 1}"
```

数据库信息

```
 select * from user_password \G;
*************************** 1. row ***************************
         id: 4
    user_id: 1
   password: 4b6e35b353bd5826e62f77b538df0dec
       salt: 4e566dd4-3659-48ab-8204-d072b6b825b5
create_time: 2025-03-10 16:23:59
update_time: NULL
1 row in set (0.00 sec)
```

## 密码更新

逻辑类似，不是插入，而是更新。

不再赘述。

## 密码验证

### 核心流程

接下来是密码的流程

入参：userId, password

流程：

a. 验证用户状态为激活
b. 通过和创建相同的密码加密哈希方式，验证 password 哈希后是否和 user_password 中信息一致。一致为 S，其他都是 F
c. 存储每一次的验证记录到 user_password_verify_history

### 核心实现

```java
public String verifyPassword(Long userId, String password) {
    // 验证用户状态
    User user = userService.selectById(userId);
    if (!UserStatus.ACTIVATED.name().equals(user.getUserStatus())) {
        saveVerifyHistory(userId, "F", "用户状态未激活");
        return "F";
    }

    // 获取存储的密码哈希
    UserPassword userPassword = userPasswordMapper.selectByUserId(userId);
    String salt = userPassword.getSalt();
    String expectPassword = md5(password+salt);
    String storedHash = userPassword.getPassword();
    // 验证密码哈希
    boolean matches = expectPassword.equals(storedHash);
    String result = matches ? "S" : "F";
    // 保存验证记录
    saveVerifyHistory(userId, expectPassword, result);
    return result;
}
```

### 测试验证

```
curl -X POST "http://localhost:8080/api/user-password/verify" -H "accept: */*" -H "Content-Type: application/json" -d "{ \"password\": \"password12443\", \"userId\": 1}"
```

数据库信息

```
mysql> select * from user_password_verify_history order by id desc limit 1 \G;
*************************** 1. row ***************************
           id: 2
      user_id: 1
     password: 5f787e3e91df9f6124b1cc2b6a261e4d
verify_status: F
  create_time: 2025-03-10 16:30:40
  update_time: 2025-03-10 16:30:40
1 row in set (0.00 sec)
```


## 忘记密码令牌邮件发送

### 核心流程

接下来是忘记密码令牌邮件发送的流程

入参：userId, email

流程：

a. 验证用户状态为激活, 验证 userId, email 对应关系正确性。不通过直接终止，通过继续
b. 给用户发送忘记密码邮件，同时信息存入到 user_forget_password_email_verify，有效期为 10min 

### 核心实现

```java
@Transactional
    public void sendPasswordResetToken(UserPasswordForgetTokenSendDTO dto) {
        // 验证用户状态和邮箱
        User user = userService.selectById(dto.getUserId());
        if (user == null || !user.getUserStatus().equals(UserStatus.ACTIVATED.name())) {
            throw new BizException(SsoRespCode.USER_STATUS_INVALID);
        }
        if (!user.getEmail().equals(dto.getEmail())) {
            throw new BizException(SsoRespCode.USER_EMAIL_NOT_MATCH);
        }

        // 生成验证令牌
        String token = UUID.randomUUID().toString();
        Date now = new Date();
        
        // 存储验证记录
        UserForgetPasswordEmailVerify emailVerify = new UserForgetPasswordEmailVerify();
        emailVerify.setUserId(dto.getUserId());
        emailVerify.setEmail(dto.getEmail());
        emailVerify.setToken(token);
        emailVerify.setCreateTime(now);
        emailVerify.setUpdateTime(now);
        emailVerify.setExpireTime(DateUtil.addMinute(now, 10));

        userForgetPasswordEmailVerifyMapper.insert(emailVerify);

        // 发送密码重置邮件
        String resetLink = "http://localhost:8080/api/user-password/forgetTokenVerify?token=" + token;
        emailService.sendEmail(
            dto.getEmail(),
            "密码重置请求",
            "请点击以下链接重置密码：" + resetLink
        );
    }
```

### 测试验证

```
curl -X POST "http://localhost:8080/api/user-password/forgetTokenSend" -H "accept: */*" -H "Content-Type: application/json" -d "{ \"email\": \"xxx@qq.com\", \"userId\": 1}"
```

验证：邮箱收到邮件

数据库：

```
mysql> select * from user_forget_password_email_verify order by id desc limit 1 \G;
*************************** 1. row ***************************
         id: 1
      token: f5250cdd-9c2c-49c7-8b8d-9864368d4118
    user_id: 1
      email: xxx@qq.com
expire_time: 2025-03-10 16:41:58
verify_time: NULL
create_time: 2025-03-11 00:31:57
update_time: 2025-03-11 00:31:57
```


## 忘记密码令牌验证

### 核心流程

接下来是忘记密码令牌验证的流程，在userPasswordService.forgetTokenVerify的基础上进行补全，

入参：token

a. 根据 token 查询user_forget_password_email_verify 信息，保证信息存在，且不过期。
b. 验证用户状态为激活
c. 验证通过后允许用户进行密码设置的操作。 

### 核心实现

```java
@Transactional
    public void forgetTokenVerify(String token) {
        // 根据token查询验证记录
        UserForgetPasswordEmailVerify verifyRecord = userForgetPasswordEmailVerifyMapper.selectByToken(token);
        if (verifyRecord == null) {
            throw new BizException(SsoRespCode.USER_PASSWORD_RESET_TOKEN_INVALID);
        }
        
        // 检查有效期
        final Date now = new Date();
        if (now.after(verifyRecord.getExpireTime())) {
            throw new BizException(SsoRespCode.USER_PASSWORD_RESET_TOKEN_EXPIRED);
        }
        
        // 验证用户状态
        User user = userService.selectById(verifyRecord.getUserId());
        if (!UserStatus.ACTIVATED.name().equals(user.getUserStatus())) {
            throw new BizException(SsoRespCode.USER_STATUS_INVALID);
        }

        userForgetPasswordEmailVerifyMapper.updateVerifyTimeByToken(token, now);
        
        // TODO: 生成临时操作凭证（示例实现）
        // 新建、忘记密码、修改密码 可以采用类似的方法，后续统一实现。
    }
```

### 测试验证

邮箱点击链接

```
mysql> SELECT * FROM user_forget_password_email_verify \G;
*************************** 1. row ***************************
         id: 1
      token: f5250cdd-9c2c-49c7-8b8d-9864368d4118
    user_id: 1
      email: xxx@qq.com
expire_time: 2025-03-10 16:41:58
verify_time: 2025-03-10 16:40:24
create_time: 2025-03-11 00:31:57
update_time: 2025-03-11 00:40:28
1 row in set (0.00 sec)
```

# 小结

这里只是简单的实现了一下对应的密码操作，不过缺少了一个东西。

那就是邮箱激活、修改密码、忘记密码之后对应的密码联动操作。

这里可以放在下一节来实现，一般需要前后端配合流转。


# chat

补充一些基本知识：

## 详细介绍一下用户密码的管理要如何设计？

用户密码管理是系统安全的重要组成部分，合理的密码管理设计可以有效保护用户账户安全，防止密码泄露和恶意攻击。

以下从密码创建、存储、更新、找回、验证等多个方面详细介绍用户密码管理的设计要点。

### 1. 密码创建
- **密码复杂度要求**
    - **长度**：规定密码的最小长度，一般建议至少 8 位，以增加密码的组合可能性。
    - **字符类型**：要求密码包含多种字符类型，如大写字母、小写字母、数字和特殊字符。例如，要求密码中至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符。
    - **避免常见密码**：检查用户输入的密码是否为常见的弱密码，如“123456”、“password”等，若为常见弱密码则提示用户重新输入。
- **密码确认**：让用户再次输入密码进行确认，确保两次输入的密码一致，避免因输入错误导致密码设置失败。

### 2. 密码存储
- **哈希算法**：使用安全的哈希算法对用户密码进行加密存储，常见的哈希算法有 bcrypt、scrypt、Argon2 等。这些算法具有较高的计算复杂度和抗碰撞性，能够有效防止密码被暴力破解。
- **加盐处理**：为每个用户的密码添加唯一的盐值（salt），然后再进行哈希运算。盐值是一个随机字符串，它会与用户密码结合，使得相同的密码在不同用户处生成的哈希值不同，增加了密码的安全性。

以下是使用 Java 实现 bcrypt 加密存储密码的示例代码：
```java
import org.mindrot.jbcrypt.BCrypt;

public class PasswordManager {
    // 生成哈希密码
    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    // 验证密码
    public static boolean verifyPassword(String password, String hashedPassword) {
        return BCrypt.checkpw(password, hashedPassword);
    }
}
```

### 3. 密码更新
- **旧密码验证**：在用户更新密码时，要求用户输入当前密码进行验证，确保是用户本人在操作。
- **新密码复杂度检查**：对用户输入的新密码进行复杂度检查，确保新密码符合系统的密码复杂度要求。
- **密码历史记录**：记录用户的密码历史，避免用户使用最近使用过的密码，防止密码被轻易找回。

### 4. 密码找回
- **邮箱验证**：用户可以通过注册时使用的邮箱找回密码。系统会向用户的邮箱发送一封包含重置密码链接的邮件，用户点击链接后可以设置新的密码。
- **短信验证码**：对于支持短信验证的系统，可以向用户的手机发送验证码，用户输入正确的验证码后可以重置密码。
- **安全问题**：设置一些安全问题，如“您的出生地是哪里？”，用户在注册时设置答案，当需要找回密码时，回答正确的安全问题即可重置密码。

### 5. 密码验证
- **登录验证**：在用户登录时，将用户输入的密码进行哈希运算，然后与数据库中存储的哈希密码进行比较。若两者相同，则验证通过；否则，提示用户密码错误。
- **重试限制**：为了防止暴力破解，设置密码验证的重试次数限制。当用户连续输入错误密码达到一定次数时，暂时锁定用户账户，一段时间后才能再次尝试登录。

### 6. 密码安全策略
- **定期更换密码**：要求用户定期更换密码，如每 90 天更换一次，以减少密码泄露的风险。
- **密码过期提醒**：在用户密码即将过期时，通过邮件或系统通知提醒用户及时更换密码。
- **密码审计**：定期对用户密码进行审计，检查是否存在弱密码或异常的密码使用情况，及时采取措施进行处理。

### 7. 安全审计与监控
- **日志记录**：记录用户的密码操作日志，如密码创建、更新、找回等，以便在出现安全问题时进行审计和追溯。
- **异常检测**：通过监控用户的密码操作行为，如频繁的密码重置请求、异地登录等，及时发现异常情况并采取相应的措施，如发送安全提醒、暂时锁定账户等。

综上所述，用户密码管理设计需要综合考虑密码的创建、存储、更新、找回、验证等多个方面，采用安全的技术手段和合理的安全策略，以确保用户密码的安全性和系统的安全性。











# 参考资料

* any list
{:toc}