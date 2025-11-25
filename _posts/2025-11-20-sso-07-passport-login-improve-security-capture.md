---
layout: post
title: 权限体系之-07-passport 登录登出提升安全之登录滑块
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# Passport 登录滑块验证安全方案（产品级设计）

好的——把“滑块挑战（challenge）我把设计里所有相关点都改成基于关系库实现，并补充了会用到的并发/幂等/过期清理策略、性能注意项与实现建议（都不含具体代码）。

下面是完整、可落地的设计更新。

---

# 要点总结（一句话）

滑块挑战与校验数据全部写入 MySQL（新增 `passport_slider_challenge` 表），后端用事务与原子更新保证“一次一用”，通过 `expire_time` + 定期清理任务代替 Redis TTL（可选）；

同时保留 `passport_slider_verify_log` 日志表用于审计。

---

# 一、总体流程（MySQL 版）

1. 前端请求 `/passport/captcha/slider/init`
2. 后端生成挑战（图片/正确 X、token 等）并写入 `passport_slider_challenge` 表，返回 `captcha_token + 图片` 给前端。
3. 前端渲染、用户滑动后提交轨迹到 `/passport/captcha/slider/verify`。
4. 后端在单个事务内读取 challenge（by token）并做校验：误差、时间、轨迹质量等；若校验通过则 **原子标记为已使用**（更新 consumed_flag / status）；同时写 `passport_slider_verify_log`。
5. 若验证成功，允许继续后续登录流程；失败则更新失败计数并记录日志。
6. 后端定期（例如每 5 分钟）异步任务：删除或归档 `expire_time` 早于当前时间且未消费的 challenge 行，或把其状态置为过期。

关键点：**一切校验与“销毁/标记已用”动作都要在数据库事务/原子操作中完成**，防止重放或并发竞态。

---

# 二、数据库表设计（必须包含你要求的基础字段）

## 1) 滑块挑战表（用于存放挑战，替代 Redis）

表名：`passport_slider_challenge`

```sql
CREATE TABLE passport_slider_challenge (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  captcha_token VARCHAR(64) NOT NULL UNIQUE COMMENT '挑战 token (外部返回给前端)',
  correct_x INT NOT NULL COMMENT '服务端正确 X',
  correct_y INT NOT NULL DEFAULT 0 COMMENT '服务端正确 Y（如需要）',
  background_image MEDIUMBLOB NULL COMMENT '背景图二进制或 base64（可选，若图片走 CDN 可不放）',
  slider_image MEDIUMBLOB NULL COMMENT '滑块图像二进制（可选）',
  biz_scene VARCHAR(32) NOT NULL DEFAULT 'LOGIN' COMMENT '业务场景',
  expire_time DATETIME(3) NOT NULL COMMENT '过期时间',
  consumed_flag TINYINT(4) NOT NULL DEFAULT 0 COMMENT '是否已消费（0未消费 1已消费）',
  client_ip VARCHAR(64) NULL,
  create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  creator_id BIGINT NULL,
  updater_id BIGINT NULL,
  status TINYINT(4) NOT NULL DEFAULT 1,
  delete_flag TINYINT(4) NOT NULL DEFAULT 0,
  INDEX idx_token (captcha_token),
  INDEX idx_expire (expire_time),
  INDEX idx_consume (consumed_flag)
);
```

说明：

* `captcha_token` 唯一且短期有效（例如 2 分钟）。
* `consume_flag` 或者 `status` 用于标记一次性使用，校验时需以事务保证从 0 -> 1 原子更新成功才判定为成功。
* 图片字段可选：若系统走静态图 CDN/文件存储，表里只需保存路径或 id。

---

## 2) 滑块验证日志表（审计）

表名：`passport_slider_verify_log`（保留并略微补充）

```sql
CREATE TABLE passport_slider_verify_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  captcha_token VARCHAR(64) NOT NULL,
  client_ip VARCHAR(64) NOT NULL,
  user_agent VARCHAR(255) NULL,
  slider_x INT NULL,
  correct_x INT NULL,
  deviation INT NULL,
  verify_result TINYINT NOT NULL COMMENT '1成功 0失败',
  spend_time INT NULL COMMENT '滑动耗时ms',
  track_points INT NULL COMMENT '轨迹点数量',
  biz_scene VARCHAR(32) NOT NULL,
  fail_reason VARCHAR(255) NULL,
  status TINYINT(4) NOT NULL DEFAULT 1,
  create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  creator_id BIGINT NULL,
  updater_id BIGINT NULL,
  delete_flag TINYINT(4) NOT NULL DEFAULT 0,
  INDEX idx_user (user_id),
  INDEX idx_result (verify_result),
  INDEX idx_ip (client_ip)
);
```

---

# 三、后端校验 + 幂等性与并发控制（核心设计，不是代码）

## 1) 原子消费（一次一用）

* 在单个数据库事务内完成以下操作：

  1. `SELECT ... FOR UPDATE`（或使用乐观锁/WHERE consumed_flag = 0 AND captcha_token = ? 的 UPDATE 返回受影响行数）读取 challenge 行并上锁（或进行原子更新）。
  2. 检验 `expire_time`、`consumed_flag` 是否允许校验。
  3. 对轨迹、时间、误差等做业务校验。
  4. 如果校验通过，执行 `UPDATE passport_slider_challenge SET consumed_flag = 1, update_time = now() WHERE id = ? AND consumed_flag = 0`，并检查受影响行数是否为 1（保证原子性）。
  5. 无论成功与否，都写入 `passport_slider_verify_log`（可在同一事务或另一个事务里写日志；为保证可观测性，建议尽量在同一事务后异步写入日志或事务内写入以防丢失）。
* 若在更新时发现 `consumed_flag` 已被改为 1，则视为重放或并发，直接拒绝。

## 2) 防止重放攻击

* 校验成功后立即把 `captcha_token` 标记为已消费（上面一步），后续重复提交因 `consumed_flag` 被置位而被拒绝。
* 若对安全非常敏感，可在 `passport_slider_challenge` 中加入 `used_by_session_id` 或 `used_by_user_id` 字段记录消费者。

## 3) 并发场景与锁策略

* 推荐使用 **乐观更新 + WHERE consumed_flag = 0** 的单语句 UPDATE 判断受影响行数，避免长事务锁表。流程更稳健：

  * 先读取行（非锁），做判断（例如 expire_time），再执行 `UPDATE ... SET consumed_flag=1 WHERE captcha_token=? AND consumed_flag=0 AND expire_time >= now()`；若影响 1 行则继续校验（或先校验再 update，取决实现）；常见做法是把校验也放在事务里并用 FOR UPDATE。
* 如果系统压力大且并发高，避免使用 `SELECT FOR UPDATE` 长时间锁行，改用短事务的 compare-and-swap 模式。

---

# 四、过期清理与归档策略（替代 Redis TTL）--可选

MySQL 无 TTL，因此需要后台任务清理：

* 定时任务（Cron / Spring `@Scheduled`）每 1~5 分钟：

  * `DELETE FROM passport_slider_challenge WHERE expire_time < now() AND consumed_flag = 0`（或将其改状态为 `EXPIRED` 归档到历史表）
  * 若担心直接删除，可先移动到归档表（`passport_slider_challenge_history`）再删除
* 对 `passport_slider_verify_log` 做周期归档与分区（按月分区）以便查询性能。

---

# 五、性能与扩展注意事项

* 索引：确保对 `captcha_token`、`expire_time`、`consumed_flag` 索引合理组合（如复合索引）以提高查询/删除速度。
* 图片存储：尽量不要把图片二进制频繁读写 DB（若并发高），可把图片上传到文件存储或 CDN，表里只保存路径/ID。
* 按量级考虑：如果并发很高（比如每秒数千/万次），MySQL 可能成为瓶颈。此时的演进路径：

  1. 用 MySQL 做主存储 + 本地内存/短期缓存（仅缓存 token 校验状态）
  2. 或将挑战数据迁回 Redis（混合架构）——但你当前要求全 MySQL，则应做写入/清理优化与分表分区。
* 分区：对 `passport_slider_challenge` 按日期分区（按日或按小时）可以让过期清理更高效。

---

# 六、API 与 Controller 拆分（同前，强调 MySQL 行为）

* `SliderCaptchaController`（用户侧）

  * `POST /passport/captcha/slider/init` → 生成 token，写 `passport_slider_challenge`，返回 token + 图
  * `POST /passport/captcha/slider/verify` → 提交轨迹；后端在事务中做一次性消费、验证，写 `passport_slider_verify_log`
* `SliderCaptchaAdminController`（管理侧）

  * `GET /admin/passport/slider/log/page` → 查询 `passport_slider_verify_log`
  * `GET /admin/passport/slider/challenge/list` → 查询 `passport_slider_challenge`（管理查看未消费、过期、统计）

---

# 七、管理/用户视角功能调整（MySQL 存储无差异）

* **管理员**

  * 查看挑战库存（例如：未消费挑战数、过期数）
  * 配置滑块策略（误差阈值、最短滑动时间、最大失败次数）
  * 查询错误 IP / 设备、聚合失败趋势
* **普通用户**

  * 无需特别视角（滑块验证为登录的客户端体验），但用户操作失败日志会出现在 `passport_slider_verify_log`，用于自助与客服排查

---

# 八、开发规范（沿用你给的约束）

* 尽量参考 1-2 个旧代码风格（例如你现有的验证码模块或 token 模块），复用工具类（时间工具、IP 工具、DB util）。
* 后端：高内聚、适当内耦合；**禁止使用 lombok + beanCopy**。
* mybatis XML：对 `<` `>` 等比较符号做转义处理；时间比较在 SQL 中用 `expire_time >= #{now}` 可行，但注意参数格式与预编译，避免注入。
* 前端：Vue3 组件化，滑块组件可复用、遵循现有风格。

---

# 九、安全与一致性补充要点

* **校验时间窗口**：挑战生成时记录 `create_time` 与 `expire_time`，后端拒绝过期 token。
* **防止机器人重放**：一次性消费 + 鼓励在数据库写入 `client_fingerprint`（设备指纹）与 `client_ip` 以便联动风控。
* **日志完整性**：`passport_slider_verify_log` 必须尽量写入（若事务失败，考虑异步补写策略并上报失败率）。
* **失败阈值**：设置 IP 或 Token 失败阈值，超过阈值后对 IP 限流或黑名单。

---

# 十、清理/运维建议

* 编写 DB 维护脚本（归档/压缩历史表）并和监控告警联动（例如 `passport_slider_challenge` 行数异常增长触警）。
* 定期检查未消费挑战增长是否异常（可能是前端未正确回收或攻击）。
* 对 `passport_slider_challenge` 建议按时间分区并定期 DROP 过期分区以优化删除性能。

---

# 十一、为什么用 MySQL 也能做到稳定？

* MySQL 能保证强一致性（事务），适合“一次性消费”场景：通过事务可确保 challenge 被准确标记为已消费，防止重放。
* 代价是性能与运维成本（必须做好索引、分区、归档、批量删除）。在并发不是极端高的场景下，MySQL 完全能提供稳定和可审计的实现。

# 已有的方案

有的，而且还不少 —— 如果你的目标是 **不想自己造轮子，直接稳定落地滑块验证码**，下面这几款在 Java / SpringBoot 场景里都算“比较成熟”的方案，我帮你按「靠谱程度 + 易用性」排个序。

---

## ✅ 强烈推荐方案（生产可控 + 可私有部署）

### 1. Anji Captcha（安吉滑块） ⭐⭐⭐⭐⭐

最接近你需求的：**Java + SpringBoot + 数据库存储可控 + 企业级使用多**

* GitHub：anji-plus/captcha
* 特点：

  * 专门为后端系统设计的滑块验证码
  * 原生支持 Spring Boot Starter
  * 支持：滑块 + 图片验证码 + 点选验证码
  * 支持 MySQL / Redis 存储（你可以只用 MySQL）
  * 支持轨迹校验、防机器刷、异常识别
* Maven 引入：

```xml
<dependency>
    <groupId>com.anji-plus</groupId>
    <artifactId>captcha-spring-boot-starter</artifactId>
    <version>1.3.0</version>
</dependency>
```

适合场景：

* 自建 Passport / SSO
* 要可控、可审计、可二次开发的企业系统

✅ 综合评价：

> 企业级、可控、安全、易扩展，几乎是 Java 滑块验证码的“标准答案”。

---

### 2. Tianai Captcha（天爱安全验证码） ⭐⭐⭐⭐☆

另一款国产开源滑块方案，技术成熟度也不错。

* GitHub：tianai-captcha
* 特点：

  * 专注滑块验证码
  * 支持行为轨迹分析
  * 提供 SpringBoot Starter
  * 代码成熟，社区活跃

Maven 示例：

```xml
<dependency>
  <groupId>com.tianai.captcha</groupId>
  <artifactId>tianai-captcha-springboot-starter</artifactId>
  <version>1.4.2</version>
</dependency>
```

适合：

* 不想绑定商业服务
* 希望有一定防刷能力，但不想过度复杂

---

## ✅ 商业成熟方案（更强风控能力）

如果你愿意接入第三方平台：

### 3. 极验 Geetest

国内非常成熟，滑块验证码鼻祖之一

* 安全策略强
* 反外挂能力强
* 但：需要注册 + 商业收费（免费额度有限）

---

### 4. 腾讯云 TCaptcha

腾讯的人机验证方案：

* 稳定性强
* 微信生态友好
* 对接相对规范

---

## ❌ 不太建议的

| 类型                 | 原因            |
| ------------------ | ------------- |
| 自己写 Canvas + JS 滑块 | 容易被脚本模拟，安全等级低 |
| GitHub 上无人维护项目     | 后期升级难，风险高     |
| 只前端校验的方案           | 形同虚设，极易绕过     |

---

## 推荐结论（结合你的系统场景）

你当前场景是：

* Passport 登录系统
* SpringBoot
* 要可管控、可审计、支持 MySQL
* 不想重新实现

✅ 最优方案建议：

| 场景              | 推荐                   |
| --------------- | -------------------- |
| 私有部署 + 可控 + 可扩展 | **Anji Captcha**     |
| 轻量但稳定           | Tianai Captcha       |
| 高安全 + 商业级       | Geetest / 腾讯 CAPTCHA |

👉 综合结论：

> 如果是你的 Passport 系统，我会强烈建议：
> **直接选 Anji Captcha 做底座，然后按你现有规范进行二次封装。**

---

## 建议架构融合方式

不是完全“裸用”，而是这种模式：

```
Passport登录
   ↓
滑块验证组件（Anji）
   ↓
包装成你的 SliderService
   ↓
写入 passport_slider_* 表
   ↓
统一认证链路
```

也就是说：

* 滑块逻辑用成熟组件
* 安全策略、日志、风控用你自己的系统控制




* any list
{:toc}