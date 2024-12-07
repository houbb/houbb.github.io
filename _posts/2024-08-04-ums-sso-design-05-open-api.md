---
layout: post
title: UMS sso-05-内网权限 sso open-api 需要提供哪些接口？
date: 2024-08-04 21:01:55 +0800
categories: [Basic]
tags: [sso, user, ums, priviliage, sh]
published: true
---


# 前言

大家好，我是老马。

今天我们来一起讨论下 sso 系统应该设计哪些核心的接口能力？

# 项目

前后端合一:

[privilege-admin 权限管理](https://github.com/houbb/privilege-admin)

前后端分离：

> [ums-server](https://github.com/houbb/ums-server)

> [ums-server-h5](https://github.com/houbb/ums-server-h5)

# 需求

提供核心的接口能力。

保证对所有的接入方进行本身的权限验证。

# 核心能力

## 登录

- **接口路径**: `POST /api/login`

- **请求参数**:
  ```json
  {
    "username": "user@example.com",
    "password": "hashed_password",
    "captcha": "captcha_token",  // 如果需要验证码
    "verification_code": "123456"  // 二次验证时（如短信/邮件验证码）
  }
  ```

- **响应示例**:

  ```json
  {
    "status": "success",
    "token": "jwt_token_or_session_token",
    "message": "登录成功"
  }
  ```

## 登出

**功能**: 提供用户注销会话、清除认证信息的接口。

**接口设计**:

- **接口路径**: `POST /api/logout`

- **请求参数**:

  ```json
  {
    "token": "jwt_token_or_session_token"  // 要注销的会话令牌
  }
  ```

- **响应示例**:

  ```json
  {
    "status": "success",
    "message": "登出成功"
  }
  ```

## token 验证

**功能**: 提供验证认证令牌有效性的接口，确保令牌未过期且未撤销。

**接口设计**:

- **接口路径**: `POST /api/token/validate`

- **请求参数**:
  ```json
  {
    "token": "jwt_token_or_session_token"
  }
  ```

- **响应示例**:

  ```json
  {
    "status": "valid",
    "message": "令牌有效"
  }
  ```

## 用户信息获取

**功能**: 提供已认证用户的基本信息。

**接口设计**:

- **接口路径**: `GET /api/user/info`

- **请求参数**:

  ```json
  {
    "token": "jwt_token_or_session_token"
  }
  ```

- **响应示例**:

  ```json
  {
    "user_id": 123456,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "phone_number": "1234567890",
    "status": "active"
  }
  ```




# chat

## 不同登录方式的兼容

如果您的 SSO 系统需要支持多种登录方式（如账号密码登录、OTP（一次性密码）、
多因子验证（如 Google 动态码），
接口设计需要能够灵活地处理这些不同的认证方式。

以下是针对多种登录方式的接口设计方案：

### 1. **账号密码登录接口**

**功能**: 用户通过用户名和密码进行登录。

**接口设计**:
- **接口路径**: `POST /api/login/password`
- **请求参数**:
  ```json
  {
    "username": "user@example.com",
    "password": "hashed_password"
  }
  ```
- **响应示例**:
  ```json
  {
    "status": "success",
    "message": "登录成功",
    "token": "jwt_token_or_session_token",
    "requires_otp": true  // 如果需要 OTP 进一步验证
  }
  ```

### 2. **OTP 验证接口**

**功能**: 用户通过短信、邮箱等方式接收 OTP，并验证 OTP 是否正确。

**接口设计**:
- **接口路径**: `POST /api/otp/send`
- **请求参数**:
  ```json
  {
    "username": "user@example.com",
    "otp_method": "sms"  // 也可以是 "email"
  }
  ```
- **响应示例**:
  ```json
  {
    "status": "success",
    "message": "OTP 已发送"
  }
  ```

---

- **接口路径**: `POST /api/otp/verify`
- **请求参数**:
  ```json
  {
    "username": "user@example.com",
    "otp": "123456"
  }
  ```
- **响应示例**:
  ```json
  {
    "status": "success",
    "message": "OTP 验证通过",
    "token": "jwt_token_or_session_token"
  }
  ```

### 3. **Google 动态码（TOTP）验证接口**

**功能**: 用户通过 Google Authenticator 或其他支持 TOTP（基于时间的一次性密码）的应用来获取动态验证码进行验证。

**接口设计**:
- **接口路径**: `POST /api/mfa/enable`
- **请求参数**:
  ```json
  {
    "username": "user@example.com"
  }
  ```
- **响应示例**:
  ```json
  {
    "status": "success",
    "message": "多因子验证已启用",
    "secret": "base32_encoded_secret",  // 提供给用户用于 Google Authenticator 扫描的密钥
    "qr_code_url": "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=otpauth://totp/MyApp:user@example.com?secret=base32_encoded_secret"
  }
  ```

---

- **接口路径**: `POST /api/mfa/verify`
- **请求参数**:
  ```json
  {
    "username": "user@example.com",
    "totp": "123456"  // 用户通过 Google Authenticator 获取的验证码
  }
  ```
- **响应示例**:
  ```json
  {
    "status": "success",
    "message": "多因子验证通过",
    "token": "jwt_token_or_session_token"
  }
  ```

### 4. **统一登录接口（支持多种认证方式）**

**功能**: 提供一个统一的入口，根据不同的认证方式选择相应的验证流程，支持账号密码、OTP、Google 动态码等。

**接口设计**:
- **接口路径**: `POST /api/login`
- **请求参数**:
  ```json
  {
    "username": "user@example.com",
    "password": "hashed_password",
    "otp": "123456",  // 如果是 OTP 登录
    "totp": "123456",  // 如果是多因子验证
    "auth_method": "password"  // 认证方式：password, otp, mfa
  }
  ```
- **响应示例**:
  ```json
  {
    "status": "success",
    "message": "登录成功",
    "token": "jwt_token_or_session_token",
    "requires_otp": false,
    "requires_mfa": false  // 如果已经登录不再需要 OTP 或 MFA
  }
  ```

### 5. **登出接口**

**功能**: 提供登出功能，注销会话。

**接口设计**:
- **接口路径**: `POST /api/logout`
- **请求参数**:
  ```json
  {
    "token": "jwt_token_or_session_token"
  }
  ```
- **响应示例**:
  ```json
  {
    "status": "success",
    "message": "登出成功"
  }
  ```

### 总结

通过上面的设计，您的 SSO 系统支持不同的认证方式，可以灵活应对多种登录场景。以下是各方式的简要说明：

- **账号密码登录**: 用户直接通过用户名和密码登录，适用于基础认证。
- **OTP 验证**: 用户登录后，可以选择通过短信、邮件等方式接收一次性密码，增强安全性。
- **多因子验证（Google 动态码）**: 增加额外的安全性，要求用户通过 Google Authenticator 等工具生成动态验证码进行二次验证。

# 参考资料

* any list
{:toc}  