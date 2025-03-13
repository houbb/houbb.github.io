---
layout: post
title: AI 开发 IM-01-backend 后端服务
date: 2025-3-13 20:44:06 +0800
categories: [IM]
tags: [im, opensource, ai, sh]
published: true
---

# 基本功能

## 建表

```sql
-- 用户表
CREATE TABLE `sys_user` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` varchar(50) DEFAULT NULL COMMENT '用户名',
    `password` varchar(100) NOT NULL COMMENT '密码',
    `salt` varchar(100) NOT NULL COMMENT '密码盐值',
    `email` varchar(100) NOT NULL COMMENT '邮箱',
    `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
    `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
    `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';


-- 验证码
CREATE TABLE verification_code (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT '验证码类型：REGISTER-注册，LOGIN-登录',
    create_time DATETIME NOT NULL,
    expire_time DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_email_code ON verification_code(email, code);
CREATE INDEX idx_create_time ON verification_code(create_time);
```

## 核心 UserService.java

```java
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private VerificationCodeService verificationCodeService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public ApiResponse<?> login(LoginRequest request) {
        SysUser user = userMapper.findByEmail(request.getEmail());
        if (user == null) {
            return ApiResponse.error("用户名或者密码错误");
        }

        if ("CODE".equals(request.getLoginType())) {
            // 验证码登录
            if (!verificationCodeService.verifyCode(request.getEmail(), request.getCode(), "LOGIN")) {
                return ApiResponse.error("用户名与验证码不匹配");
            }
        } else {
            String saltedPassword = request.getPassword() + user.getSalt();
            if (!passwordEncoder.matches(saltedPassword, user.getPassword())) {
                return ApiResponse.error("用户名或者密码错误");
            }
        }

        // 更新最后登录时间
        user.setLastLoginTime(LocalDateTime.now());
        userMapper.update(user);

        // 生成token
        String token = UUID.randomUUID().toString();
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", user);

        return ApiResponse.success(result);
    }

    @Override
    @Transactional
    public ApiResponse<?> register(RegisterRequest request) {
        if (userMapper.findByEmail(request.getEmail()) != null) {
            return ApiResponse.error("邮箱已被注册");
        }

        SysUser user = new SysUser();
        BeanUtils.copyProperties(request, user);

        // 生成随机盐值
        byte[] saltBytes = new byte[16];
        secureRandom.nextBytes(saltBytes);
        String salt = Base64.getEncoder().encodeToString(saltBytes);
        user.setSalt(salt);

        // 加密密码（密码+盐值）
        String saltedPassword = request.getPassword() + salt;
        user.setPassword(passwordEncoder.encode(saltedPassword));
        user.setStatus(1); // 1: 正常状态
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());

        userMapper.insert(user);

        return ApiResponse.success("注册成功");
    }

}
```

## 方法验证

```java
@Service
public class VerificationCodeServiceImpl implements VerificationCodeService {

    @Autowired
    private VerificationCodeMapper verificationCodeMapper;

    @Autowired
    private EmailService emailService;

    @Override
    public VerificationCode sendVerificationCode(String email, String type) {
        // 生成6位随机数字验证码
        String code = generateVerificationCode();
        
        // 创建验证码记录
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setCode(code);
        verificationCode.setEmail(email);
        verificationCode.setType(type);
        verificationCode.setCreateTime(LocalDateTime.now());
        verificationCode.setExpireTime(LocalDateTime.now().plusMinutes(10));
        verificationCode.setUsed(false);
        
        // 保存验证码
        verificationCodeMapper.insert(verificationCode);
        
        // 发送邮件
        String subject = "LOGIN".equals(type) ? "登录验证码" : "注册验证码";
        String content = String.format("您的%s验证码是：%s，有效期为10分钟。", "LOGIN".equals(type) ? "登录" : "注册", code);
        emailService.sendEmail(email, subject, content);
        
        return verificationCode;
    }

    @Override
    public boolean verifyCode(String email, String code, String type) {
        VerificationCode verificationCode = verificationCodeMapper.selectByEmailAndCode(email, code);
        
        if (verificationCode == null) {
            return false;
        }
        
        // 检查是否过期
        if (LocalDateTime.now().isAfter(verificationCode.getExpireTime())) {
            return false;
        }
        
        // 标记验证码已使用
        verificationCodeMapper.updateUsedStatus(verificationCode.getId());
        
        return true;
    }

    private String generateVerificationCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
}
```


# chat

## PasswordEncoder 类介绍

`PasswordEncoder` 是 Spring Security 提供的一个密码加密接口，用于对密码进行加密和验证。

它主要用于以下两个功能：

1. **密码加密**
```java
// 在注册时对密码进行加密
user.setPassword(passwordEncoder.encode(request.getPassword()));
```
`encode()` 方法将明文密码转换为加密后的密文。这个过程是单向的，不可逆的。

2. **密码验证**
```java
// 在登录时验证密码
if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
    return ApiResponse.error("密码错误");
}
```
`matches()` 方法用于比较用户输入的明文密码和数据库中存储的加密密码是否匹配。

### PasswordEncoder 的主要特点：

1. **安全性**：使用单向加密算法，即使数据库被攻破，攻击者也无法直接获取用户的原始密码。

2. **自动加盐**：大多数 PasswordEncoder 实现都会自动添加随机盐值，增加密码的安全性。

3. **常用实现类**：
   - `BCryptPasswordEncoder`：使用 BCrypt 强哈希算法
   - `Pbkdf2PasswordEncoder`：使用 PBKDF2 算法
   - `SCryptPasswordEncoder`：使用 SCrypt 算法
   - `StandardPasswordEncoder`：使用 SHA-256 算法

### 配置示例：

通常在 Spring Security 配置类中配置 PasswordEncoder：

```java
@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### 使用建议：

1. 推荐使用 `BCryptPasswordEncoder`，它提供了很好的安全性和性能平衡。
2. 不要自己实现密码加密算法，应该使用经过验证的实现。
3. 密码加密后的长度会增加，数据库字段设计时要预留足够空间。
4. 加密是不可逆的，如果用户忘记密码，只能重置不能找回。

在你的代码中，PasswordEncoder 被正确地用于用户注册、登录验证和密码重置这三个关键的安全场景，这是一个很好的安全实践。



# 参考资料

* any list
{:toc}