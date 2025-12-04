---
layout: post
title: 权限体系之-33-sso 平台如何同时兼容 mysql 与 LDAP?
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## 如何兼容？

下面我会在**你现有的 user 表结构 + 现有 login(String email, String password, …)** 的基础上，给出一套**最小改造、兼容 LDAP + 本地 MySQL 的详细设计**。

📌 **重点：你不需要大改现有 login 代码，只需要把 “查用户 + 校验密码” 抽成可插拔的策略即可。**
📌 **LDAP 用户不走数据库密码校验 → 走 LDAP 服务器校验，成功后自动插入/更新 user 表。**

---

# ⭐ 一、总体设计目标（不破坏现有 MySQL 流程）

我们将把：

```
查用户 + 校验密码
```

抽象成 **LoginStrategy**，通过配置选择：

* 本地 MySQL 策略（默认）
* LDAP 策略
* （未来可扩展：AD / OAuth / 企业微信等）

**原 login() 方法不改流程，只修改中间一步：`authenticate()`**

---

# ⭐ 二、要加的字段（为 LDAP 用户扩展字段）

你现有 user 表已经够用了，只需要加：

| 字段                          | 说明                                             |
| --------------------------- | ---------------------------------------------- |
| identity_source varchar(20) | local / ldap                                   |
| external_id varchar(200)    | LDAP DN，例如：`uid=alice,ou=People,dc=xxx,dc=com` |
| last_sync_time datetime(3)  | LDAP 同步时间                                      |

最小改造 SQL：

```sql
ALTER TABLE user ADD COLUMN identity_source varchar(20) DEFAULT 'local' COMMENT '用户来源：local/ldap';
ALTER TABLE user ADD COLUMN external_id varchar(200) DEFAULT NULL COMMENT '外部身份源ID，比如LDAP DN';
ALTER TABLE user ADD COLUMN last_sync_time datetime(3) DEFAULT NULL COMMENT '外部同步时间';
```

---

# ⭐ 三、对现有 login() 的重构方向（**只改一处**）

你现在的流程是：

```
user = findByEmail()
→ 如果没有，报错
→ 验证密码（本地）
→ 业务校验
→ 返回 token
```

我们将改成：

```
LoginAuthResult auth = loginStrategy.authenticate(email, password, totpCode)
```

### LoginStrategy 返回一个结果类：

```
class LoginAuthResult {
   boolean success;
   UserEntity user;
   boolean needCreateOrUpdateLocalUser; // LDAP 登录成功但本地无用户
   UserProfile ldapProfile; // LDAP 返回的邮件/手机/昵称等
}
```

---

# ⭐ 四、策略类设计（核心设计思想）

## 1）本地 MySQL 策略（LocalLoginStrategy）

完全复用你原来的逻辑：

* findByEmail
* 校验用户冻结
* 校验密码（根据 encrypt_strategy）
* 校验 TOTP（复用之前逻辑）
* 返回 user

### 变化的只有一点：

它不直接抛 BizException，而是返回结构体：

```
LoginAuthResult.success = true/false
LoginAuthResult.user = user
```

---

## 2）LDAP 策略（LdapLoginStrategy）

流程：

```
1. 用 LDAP 服务器验证 email+password
2. 成功 → fetch LDAP attributes
3. 本地查用户（根据 email）
4. 如果不存在 → result.needCreateOrUpdateLocalUser = true
5. 如果存在 → result.needCreateOrUpdateLocalUser = true（需要更新 email/nickname/phone）
6. 返回 user（本地）或 LDAPProfile（未创建）
```

LDAP 登录 **不走本地密码对比**。

LDAP 成功后 → 必须执行“自动同步”：

* 新建用户（password 随机字符串 or 空字符串）
* 或更新已有用户（禁止覆盖 password）

---

# ⭐ 五、login() 方法的新版本流程图（你最关心）

只需要改成这样：

```
@Override
public LoginResponse login(String email, String password, String totpCode) {

    // a. 读取策略类名称（来自系统配置）
    LoginStrategy strategy = loginStrategyFactory.get();

    // b. 执行认证逻辑（本地 or LDAP）
    LoginAuthResult result = strategy.authenticate(email, password, totpCode);

    if (!result.success) {
        throw new BizException(...); // 按 result 的错误码
    }

    // c. 自动同步逻辑（仅 LDAP 有）
    UserEntity user = syncUserIfNeeded(result);

    // d. 继续执行你原本的逻辑 ↓↓↓

    userLoginFreezeRecordService.resetLoginFailCount(user.getId());

    // 生成 token
    String token = TokenUtils.generateToken(user.getId(), email);

    // 更新 last login
    user.setUpdateTime(new Date());
    user.setLoginFailCount(0);
    userMapper.update(user);

    // 获取角色
    List<RoleEntity> userRoles = roleMapper.findByUserId(user.getId());

    // 返回
    return buildResponse(token, userRoles, user);
}
```

---

# ⭐ 六、syncUserIfNeeded 详细设计（重点）

```
UserEntity syncUserIfNeeded(LoginAuthResult result) {

    if (result.identitySource != LDAP) {
        return result.user;   // 本地用户直接返回
    }

    // LDAP 用户
    if (result.needCreateOrUpdateLocalUser) {
         return ldapUserSyncService.sync(result.ldapProfile);
    }

    return result.user;
}
```

### ① 新增用户（LDAP 首次登录）

创建用户：

* username = email 前缀（或 LDAP uid）
* email = LDAP mail
* phone = LDAP mobile
* nickname = LDAP cn
* external_id = LDAP DN
* identity_source = ldap
* password = "LDAP_USER"（只是 placeholder）
* salt = ""（无意义）
* encrypt_strategy = "LDAP"（新加一个枚举）
* status = 1
* create_time, update_time 自动填充

### ② 更新用户（每次登录覆盖信息）

* email
* phone
* nickname
* real_name
* external_id
* last_sync_time = now()

不覆盖：

* password
* salt
* encrypt_strategy
* 用户角色（保持不变）

---

# ⭐ 七、系统配置（切换策略）

表：`system_config`

| key                   | value                                   |
| --------------------- | --------------------------------------- |
| login.strategy.class  | com.company.auth.LocalLoginStrategy（默认） |
| ldap.url              | ...                                     |
| ldap.base             | ...                                     |
| ldap.userField        | mail                                    |
| ldap.mapping.nickname | cn                                      |
| ldap.mapping.mobile   | mobile                                  |

登录时：

```
strategyClass = configService.get("login.strategy.class")
```

反射 / Spring BeanFactory 实例化即可。

---

# ⭐ 八、对 TOTP 的兼容逻辑（你代码里已有）

LDAP 登录也可以继续用 TOTP（可选）
逻辑：

```
LDAP 登录成功 → 得到用户本地记录 → 检查是否启用 TOTP
启用了 → 校验 TOTP
```

---

# ⭐ 九、LDAP 用户密码不应该存在本地

你原有 user 表必须满足：

* password 字段必填（NOT NULL）

因此对于 LDAP 用户：

```
password = RANDOM_STRING(32)
salt = ""
encrypt_strategy = "NONE"
```

并且在本地登录策略中：

```
if identity_source = ldap → 禁止走本地密码校验
```

（否则 LDAP 用户拿本地数据库里的 password 无意义）

---

# ⭐ 十、最终改造量总结（不动逻辑，最大复用）

你只需要修改 3 个地方：

---

### ✔ **① 把“查用户+校验密码”抽出成 LoginStrategy**

本地策略复制你的旧逻辑
LDAP 策略实现 LDAP 登录逻辑

login() 方法不直接查 DB，也不直接 verifyPassword。

---

### ✔ **② login() 方法新增一步：同步用户（仅 LDAP）**

```
syncUserIfNeeded(result)
```

---

### ✔ **③ user 表新增 3 个字段**

```
identity_source
external_id
last_sync_time
```

* any list
{:toc}