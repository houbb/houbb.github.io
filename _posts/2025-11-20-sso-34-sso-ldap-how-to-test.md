---
layout: post
title: 权限体系之-34-sso 平台如何测试？
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## 如何兼容？

下面我给你一个 **个人开发者也能轻松测试 LDAP/AD 的方案**，即使你用的是 **普通 Windows / 没有企业域控制器**，也完全可以本地自建一个**可用的 LDAP 测试环境**。

---

# ✅ 个人开发者如何测试 LDAP（不需要企业域）

你只需要：

### **方案 A：用 Docker 启一个 OpenLDAP（最推荐）**

适合：Windows / Mac / Linux，都能用
好处：
✔ 完全模拟企业 LDAP
✔ 包含用户、组织结构
✔ 可以自定义账号密码
✔ 可以快速重置、删除

---

# 🔥 最快方案：本地 Docker 启动 OpenLDAP + phpldapadmin

### **1）启动容器（复制即可用）**

如果你本机有 Docker（Windows 用 WSL2），直接执行：

```bash
docker run -d \
  --name openldap \
  -p 389:389 -p 636:636 \
  -e LDAP_ORGANISATION="TestOrg" \
  -e LDAP_DOMAIN="example.com" \
  -e LDAP_ADMIN_PASSWORD="admin" \
  osixia/openldap:latest
```

再启动一个可视化管理界面：

```bash
docker run -d \
  --name phpldapadmin \
  -p 8080:80 \
  --link openldap:ldap-host \
  -e PHPLDAPADMIN_LDAP_HOSTS=ldap-host \
  osixia/phpldapadmin:latest
```

### **2）访问管理界面**

浏览器打开：
👉 [http://localhost:8080/](http://localhost:8080/)

登录：

* **Login DN**：`cn=admin,dc=example,dc=com`
* **Password**：`admin`

### **3）创建测试用户**

在 phpldapadmin 中：

```
dc=example,dc=com
   └── ou=people
          └── user1
              - uid: user1
              - cn: User One
              - sn: One
              - mail: user1@example.com
              - userPassword: 123456
```

这样你就有一个标准的 LDAP 账户：

* **用户名（DN）**：`uid=user1,ou=people,dc=example,dc=com`
* **密码**：`123456`

---

# 🔧 在你的 Passport 系统里如何配置测试 LDAP？

示例配置（YAML / properties 都可）：

```yaml
auth:
  strategy-class: com.demo.auth.LdapAuthStrategy
  
ldap:
  url: ldap://localhost:389
  base-dn: dc=example,dc=com
  user-dn-pattern: uid={0},ou=people,dc=example,dc=com
  manager-dn: cn=admin,dc=example,dc=com
  manager-password: admin
```

你的 AuthStrategy 里用 `user-dn-pattern` 拼成用户 DN，然后 Bind 验证即可。

---

# 🧪 登录测试流程（你自己可全流程测试）

1. 打开你的系统登录页
2. 填写：

   * email/username → user1
   * password → 123456
3. 系统内部执行：

```
LDAP Bind → 成功 →
同步到 user 表（如果不存在则 insert） →
正常 JWT 登录流程
```

你可以用 phpldapadmin 修改用户数据，测试同步逻辑是否正确。

---

# 🈚 不想装 Docker？也有替代方案

## **方案 B：Windows 本地安装 OpenLDAP（不推荐，但可行）**

手动安装，配置麻烦，不建议你浪费时间。

---

## **方案 C：使用云 LDAP 服务（收费 / 不推荐）**

例如：

* JumpCloud Directory（免费 10 用户）
* CloudLDAP

适合你要测试公网访问或手机等外部系统场景。

---

## **方案 D：使用 Spring 自带的 Embedded LDAP（纯测试）**

Spring Boot 可以直接启动一个内置 LDAP：

```java
@Import(EmbeddedLdapServerContextSourceFactoryBean.class)
```

但数据非常有限，仅适合接口测试，不适合真实模拟企业环境。

---

# 🥇 最推荐给你的方案

> **方案 A：Docker + OpenLDAP + phpldapadmin**

理由：

* 5 分钟搞定
* 随便玩，不会影响系统
* 可批量创建 10+ 个测试用户
* 拿来调试 LDAP 同步、本地 user 表同步、登录认证策略最香

你开发 Passport 集成 LDAP，这个环境基本够用。



* any list
{:toc}