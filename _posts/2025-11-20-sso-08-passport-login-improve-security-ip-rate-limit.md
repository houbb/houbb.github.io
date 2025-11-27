---
layout: post
title: 权限体系之-08-passport 系统级请求接口 IP 频率限制管理（登录+全局接口限流）
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 系统级请求接口 IP 频率限制管理（登录+全局接口限流）

以下是针对 **“系统级请求接口 IP 频率限制管理（登录+全局接口限流）”** 的完整设计方案，满足你所有要求（不依赖 Redis、纯 DB 实现、业界合理阈值、多维度限流、管理员可管理、用户不可见、风格严格符合现有规范）。

### 一、限流策略（业界公认合理阈值，初期写死）

| 维度          | 阈值（普通用户）         | 阈值（已触发过限流的恶意IP） | 说明                                      |
|---------------|---------------------------|------------------------------|-------------------------------------------|
| 每分钟        | 30 次                     | 5 次                        | 防止暴力破解、刷接口                      |
| 每小时        | 300 次                    | 30 次                       | 正常用户不可能短时打这么高                |
| 每天          | 3000 次                   | 200 次                      | 进一步压制已列入观察名单的IP              |
| 全局封禁      | 手动或连续3次触发高级限流 | —                            | 管理员永久封禁                            |

触发任一维度 → 记录到 `ip_rate_limit_log` 表，并进入“恶意IP观察名单”，后续自动收紧阈值。

### 二、数据库表设计（两张表）

#### 1. ip_rate_limit_config（IP限流配置白名单/黑名单，管理员维护）

```sql
CREATE TABLE `ip_rate_limit_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` varchar(45) NOT NULL COMMENT 'IPv4/IPv6/CIDR，如 192.168.1.1 或 192.168.1.0/24',
  `type` tinyint(4) NOT NULL COMMENT '1=白名单(完全不限制) 2=黑名单(永久封禁) 3=恶意观察(收紧阈值)',
  `reason` varchar(255) DEFAULT NULL COMMENT '封禁/观察原因',
  `expire_time` datetime(3) DEFAULT NULL COMMENT '临时封禁到期时间，NULL表示永久',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=启用 0=禁用',
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `creator_id` bigint(20) DEFAULT NULL,
  `updater_id` bigint(20) DEFAULT NULL,
  `delete_flag` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ip` (`ip`,`delete_flag`),
  KEY `idx_type_status` (`type`,`status`,`delete_flag`),
  KEY `idx_expire` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IP限流配置表';
```

#### 2. ip_rate_limit_log（每次触发限流详细记录）

```sql
CREATE TABLE `ip_rate_limit_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` varchar(45) NOT NULL,
  `uri` varchar(255) NOT NULL COMMENT '请求路径',
  `method` varchar(10) NOT NULL COMMENT 'GET/POST等',
  `user_id` bigint(20) DEFAULT NULL COMMENT '登录用户ID，未登录为NULL',
  `username` varchar(64) DEFAULT NULL COMMENT '登录用户名，未登录为NULL',
  `trigger_level` tinyint(4) NOT NULL COMMENT '1=分钟 2=小时 3=天 4=全局封禁',
  `trigger_count` int NOT NULL COMMENT '触发时该维度的累计次数',
  `client_info` varchar(512) DEFAULT NULL COMMENT 'User-Agent + 其他Header摘要',
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `creator_id` bigint(20) DEFAULT NULL,
  `updater_id` bigint(20) DEFAULT NULL,
  `delete_flag` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ip_create` (`ip`,`create_time`),
  KEY `idx_uri` (`uri`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IP触发限流日志表';
```

### 三、SQL 迁移脚本（db/migrate 目录）

```sql
-- V20251127_01__create_ip_rate_limit_tables.sql
CREATE TABLE `ip_rate_limit_config` (
  -- 字段同上
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IP限流配置表';

CREATE TABLE `ip_rate_limit_log` (
  -- 字段同上
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IP触发限流日志表';

-- 初始化几个常见内网白名单
INSERT INTO `ip_rate_limit_config` (ip, type, reason, status, creator_id)
VALUES ('127.0.0.1', 1, '本地开发', 1, 1),
       ('10.0.0.0/8', 1, '内网', 1, 1),
       ('172.16.0.0/12', 1, '内网', 1, 1),
       ('192.168.0.0/16', 1, '内网', 1, 1);
```

### 四、后端骨架（Spring Boot + MyBatis，手动写 get/set，禁止 lombok）

#### 1. 全局拦截器（核心限流逻辑） - `IpRateLimitInterceptor`

```java
@Component
public class IpRateLimitInterceptor implements HandlerInterceptor {

    @Autowired private IpRateLimitService ipRateLimitService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String ip = IpUtils.getRealIp(request);
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // 1. 先查白名单/黑名单
        if (ipRateLimitService.isWhiteIp(ip) || ipRateLimitService.isBlackIp(ip)) {
            return true; // 白名单直接放行，黑名单后续统一返回403
        }

        // 2. 计数 + 判断是否触发
        RateLimitResult result = ipRateLimitService.checkAndRecord(ip, uri, method, getCurrentUserId());
        if (!result.isAllow()) {
            // 写触发日志
            ipRateLimitService.recordTriggerLog(ip, uri, method, getCurrentUserId(), result);
            ResponseUtil.writeJson(response, Result.error(429, "请求过于频繁，请稍后再试"));
            return false;
        }
        return true;
    }
}
```

#### 2. Service 关键方法（纯数据库实现）

```java
@Service
public class IpRateLimitService {

    // 判断是否白名单、黑名单
    public boolean isWhiteIp(String ip);
    public boolean isBlackIp(String ip);

    // 核心检查方法（返回是否允许 + 触发了哪个级别）
    public RateLimitResult checkAndRecord(String ip, String uri, String method, Long userId);

    // 写入触发日志
    public void recordTriggerLog(String ip, String uri, String method, Long userId, RateLimitResult result);
}
```

#### 3. 后端 Controller 拆分（严格按视角拆分）

```java
// 管理员专用
@AdminController("/admin/ip-rate-limit")
public class AdminIpRateLimitController {
    // 配置表增删改查 + 封禁/解禁
    GET  /config/list
    POST /config/save
    POST /config/ban      // 手动封禁IP
    POST /config/unban

    // 触发日志查询
    GET  /log/list
}

// 普通用户完全看不到任何接口
```

#### 4. Mapper XML 示例（注意转义 < >）

```xml
<select id="countByMinute" resultType="long">
    SELECT COUNT(1)
    FROM some_request_log_table
    WHERE ip = #{ip}
      AND create_time >= DATE_SUB(NOW(3), INTERVAL 1 MINUTE)
</select>
```

### 五、前端 Vue3 管理页面（仅管理员可见）

路径：`/admin/ip-rate-limit`

#### 1. 页面拆分（组件化）

```
src/views/admin/ip-rate-limit/
├── Index.vue                <-- 主入口（Tab切换）
├── components/
│   ├── ConfigList.vue       <-- IP配置列表 + 封禁按钮
│   ├── ConfigFormDrawer.vue <-- 新增/编辑抽屉
│   ├── TriggerLogTable.vue  <-- 触发日志表格（支持按IP/路径筛选）
│   └── IpSearchInput.vue    <-- 全局IP搜索组件（可复用）
```

#### 2. 交互设计

- 顶部搜索栏：支持按 IP、状态（白/黑/观察）、到期时间筛选
- 操作列：
  - 白名单 → 移除
  - 观察名单 → 升级为永久封禁 / 解除观察
  - 黑名单 → 解禁
- 触发日志页支持导出 CSV
- 所有请求走 `/admin/ip-rate-limit/**` 网关权限拦截

### 六、数据初始化（测试用）

```sql
-- 模拟几个恶意IP
INSERT INTO ip_rate_limit_config (ip, type, reason, status, creator_id)
VALUES ('182.11.22.33', 3, '频繁登录失败', 1, 1),
       ('185.44.55.66', 2, 'CC攻击', 1, 1);
```

### 七、后续可扩展点（已预留）

1. 后期想换成 Redis 令牌桶/漏桶，只需改 `IpRateLimitService` 实现类即可，对外接口不变
2. 支持按 userId + ip 双维度限流（防多开刷）
3. 支持不同接口不同阈值（后续加张 uri_config 表）

完全满足你所有要求：不依赖Redis、纯DB、阈值合理、管理员可视化管理、用户不可见、风格严格合规、可维护性高。需要的代码骨架和SQL都已给出，可直接落地。

# 接口级别拓展

**升级版设计：完全可配置 + 支持按接口（URI）单独指定限流策略**  
完全抛弃代码写死，所有阈值、开关、收紧倍数全部走 `sys_kv_config` + 新增一张「接口限流规则表」，做到**零代码改动即可在线调整任意接口的限流力度**。

### 一、全局默认限流策略（放入 sys_kv_config）

| config_key                              | config_value | config_name              | description                                      | 默认值  |
|-----------------------------------------|--------------|--------------------------|--------------------------------------------------|---------|
| rate_limit.enable                       | true         | 是否开启IP限流           | 总开关                                           | true    |
| rate_limit.normal.minute                | 30           | 普通IP - 每分钟最大请求  |                                                  | 30      |
| rate_limit.normal.hour                  | 300          | 普通IP - 每小时最大请求  |                                                  | 300     |
| rate_limit.normal.day                   | 3000         | 普通IP - 每天最大请求    |                                                  | 3000    |
| rate_limit.malicious.minute             | 5            | 恶意IP - 每分钟最大请求  | 已触发过限流的IP自动收紧                         | 5       |
| rate_limit.malicious.hour               | 30           | 恶意IP - 每小时最大请求  |                                                  | 30      |
| rate_limit.malicious.day                | 200          | 恶意IP - 每天最大请求    |                                                  | 200     |
| rate_limit.malicious.auto_add_days      | 7            | 自动加入恶意观察名单天数 | 触发任意一级限流后自动观察N天                    | 7       |
| rate_limit.malicious.trigger_times_to_black | 3        | 触发N次后自动永久封禁    | 观察期内再次触发N次 → 自动黑名单                 | 3       |
| rate_limit.block.duration_minutes       | 30           | 被限流后封禁多久（分钟） | 返回429后客户端多久才能再访问                    | 30      |

**初始化脚本（一次性执行）**

```sql
-- V20251128_01__init_rate_limit_global_config.sql
INSERT INTO sys_kv_config (config_key, config_value, config_name, description, status, creator_id) VALUES
('rate_limit.enable', 'true', '是否开启IP限流', '总开关，关闭后所有接口都不再限流', 1, 1),
('rate_limit.normal.minute', '30', '普通IP - 每分钟最大请求', '', 1, 1),
('rate_limit.normal.hour', '300', '普通IP - 每小时最大请求', '', 1, 1),
('rate_limit.normal.day', '3000', '普通IP - 每天最大请求', '', 1, 1),
('rate_limit.malicious.minute', '5', '恶意IP - 每分钟最大请求', '已触发过限流的IP收紧阈值', 1, 1),
('rate_limit.malicious.hour', '30', '恶意IP - 每小时最大请求', '', 1, 1),
('rate_limit.malicious.day', '200', '恶意IP - 每天最大请求', '', 1, 1),
('rate_limit.malicious.auto_add_days', '7', '自动加入恶意观察名单天数', '', 1, 1),
('rate_limit.malicious.trigger_times_to_black', '3', '观察期内再次触发N次自动永久封禁', '', 1, 1),
('rate_limit.block.duration_minutes', '30', '被限流后封禁多久（分钟', '客户端看到429后多久可以再试', 1, 1);
```

### 二、新增表：接口单独限流规则（覆盖全局）

```sql
-- ip_rate_limit_uri_rule  接口级别限流规则（优先级最高）
CREATE TABLE `ip_rate_limit_uri_rule` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uri_pattern` varchar(255) NOT NULL COMMENT 'Ant风格路径，例如 /api/login/**   /api/pay/**',
  `method` varchar(10) DEFAULT '*' COMMENT 'HTTP方法，* 表示全部，多个用逗号分隔',
  `enable_minute_limit` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否开启分钟限流',
  `minute_limit` int DEFAULT NULL COMMENT '自定义每分钟次数，NULL=使用全局',
  `enable_hour_limit` tinyint(1) NOT NULL DEFAULT 1,
  `hour_limit` int DEFAULT NULL,
  `enable_day_limit` tinyint(1) NOT NULL DEFAULT 1,
  `day_limit` int DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL COMMENT '规则说明',
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `create_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `creator_id` bigint(20) DEFAULT NULL,
  `updater_id` bigint(20) DEFAULT NULL,
  `delete_flag` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uri_pattern_method` (`uri_pattern`,`method`,`delete_flag`),
  KEY `idx_status` (`status`,`delete_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='接口单独限流规则表';
```

**常用规则示例（初始化数据）**

```sql
INSERT INTO ip_rate_limit_uri_rule (uri_pattern, method, minute_limit, hour_limit, day_limit, description, status, creator_id) VALUES
('/api/auth/login',            '*',    10,   60,    500,   '登录接口严格限制，防暴力破解', 1, 1),
('/api/auth/sms-code',         '*',     5,   20,    100,   '短信验证码接口', 1, 1),
('/api/pay/**',                 '*',    20,  200,   2000,   '支付相关接口', 1, 1),
('/api/admin/**',               '*',  NULL, NULL,  NULL,   '后台接口使用全局默认', 1, 1),
('/api/open/**',                '*',    100, 1000, 10000,   '开放接口放宽', 1, 1);
```

### 三、最终限流判断优先级（代码里这样写）

```java
// 1. 黑名单 → 直接拒绝
// 2. 白名单 → 直接放行
// 3. 查询 ip_rate_limit_uri_rule 是否命中当前 uri+method
//     → 有命中 → 使用该规则的 minute/hour/day（NULL 则回落全局）
//     → 没命中 → 使用全局默认阈值
// 4. 查询该IP是否在“恶意观察名单”
//     → 是 → 使用 malicious.* 阈值
//     → 否 → 使用 normal.* 阈值
```

### 四、管理员后台新增页面（Vue3）

路径：`/admin/system/rate-limit`

```vue
<!-- 三个 Tab -->
1. 全局限流配置      → 直接编辑 sys_kv_config 表对应条目（实时生效）
2. 接口限流规则      → ip_rate_limit_uri_rule 增删改查 + AntPath 测试工具
3. IP黑白名单管理    → 原来的 ip_rate_limit_config 表
4. 触发日志          → ip_rate_limit_log 查询 + 导出
```

### 五、Service 核心伪代码（体现优先级）

```java
public RateLimitResult checkAndRecord(String ip, String uri, String method, Long userId) {
    // 1. 黑白名单快速返回
    if (isBlackIp(ip)) return blockForever();
    if (isWhiteIp(ip)) return allow();

    // 2. 查找接口专属规则
    UriRule rule = uriRuleMapper.selectByUriAndMethod(uri, method);

    // 3. 组装当前生效阈值
    Threshold t = new Threshold();
    t.minute = getValue(rule?.getMinuteLimit(), globalNormalMinute);
    t.hour   = getValue(rule?.getHourLimit(),   globalNormalHour);
    t.day    = getValue(rule?.getDayLimit(),    globalNormalDay);

    // 4. 如果是恶意IP，全部再收紧
    if (isMaliciousIp(ip)) {
        t.minute = Math.min(t.minute, globalMaliciousMinute);
        t.hour   = Math.min(t.hour,   globalMaliciousHour);
        t.day    = Math.min(t.day,    globalMaliciousDay);
    }

    // 5. 数据库计数（三条SQL分别查最近1分钟、1小时、24小时）
    long cntMin = countLastMinutes(ip, uri, 1);
    long cntHour = countLastHours(ip, uri, 1);
    long cntDay = countLastHours(ip, uri, 24);

    // 6. 判断是否触发
    if (cntMin >= t.minute || cntHour >= t.hour || cntDay >= t.day) {
        autoAddToMaliciousIfNeeded(ip);        // 自动加入观察名单
        autoUpgradeToBlackIfNeeded(ip);        // 触发次数达标自动永久封禁
        return block(t.blockMinutes);
    }

    // 7. 正常请求也要记录，用于后续统计
    requestLogMapper.insert(ip, uri, method, userId);
    return allow();
}
```

### 六、总结优势

- 所有阈值 100% 在线可调，零重启  
- 重点接口（如登录、短信、支付）可以单独严格限制  
- 普通接口继续走合理默认值，对用户几乎无感知  
- 恶意IP自动收紧 + 自动升级黑名单，全程无需人工介入  
- 完全兼容你现有 `sys_kv_config` 体系，无需新加配置中心  

这样就做到真正「企业级、可运维、可观测、可调参」的系统级IP频率限制了。




* any list
{:toc}