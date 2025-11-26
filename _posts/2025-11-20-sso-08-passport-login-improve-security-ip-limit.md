---
layout: post
title: 权限体系之-08-passport 登录登出提升安全之 IP 登录次数限制
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 登录 IP 频率限制 实现（前后端骨架 + SQL 迁移脚本）

说明：以下内容包含：

1. db/migrate 下的 SQL 脚本（按版本依次增加）
2. SpringBoot 后端关键类骨架（Controller / Service / Mapper / PO / DTO / MyBatis XML）
3. Vue3 管理端页面骨架
4. 数据初始化（基础测试数据）

风格约束：禁止 lombok、禁止 beanCopy；mybatis XML 中对 <,> 等比较符号已注意转义。前端遵循 Vue3 组件化规范。

---

## 一、迁移脚本（放在 `db/migrate/`，版本号按顺序）

登录日志参考已有的表 sys_user_login_log

### create_ip_rate_limit_trigger_log.sql

```sql
-- db/migrate/create_ip_rate_limit_trigger_log.sql
CREATE TABLE ip_rate_limit_trigger_log (
  id BIGINT(20) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  client_ip VARCHAR(64) NOT NULL COMMENT '触发限流的 IP',
  rule_code VARCHAR(64) NOT NULL COMMENT '触发规则编码（如 MINUTE_20 HOUR_200 DAY_1000）',
  rule_desc VARCHAR(255) NULL COMMENT '规则描述',
  window_seconds INT NOT NULL COMMENT '窗口时长(秒)',
  threshold INT NOT NULL COMMENT '阈值',
  current_count INT NOT NULL COMMENT '触发时的计数',
  triggered_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  reason VARCHAR(255) NULL,
  ctx_json TEXT NULL COMMENT '触发上下文（可存一些额外信息：userAgent等）',
  status TINYINT(4) NOT NULL DEFAULT 1,
  create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  creator_id BIGINT(20) NULL,
  updater_id BIGINT(20) NULL,
  delete_flag TINYINT(4) NOT NULL DEFAULT 0,
  INDEX idx_client_ip (client_ip),
  INDEX idx_rule_code (rule_code),
  INDEX idx_triggered_at (triggered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### create_ip_block_list.sql

```sql
-- db/migrate/create_ip_block_list.sql
CREATE TABLE ip_block_list (
  id BIGINT(20) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  client_ip VARCHAR(64) NOT NULL UNIQUE COMMENT '被封禁/暂时限流的IP',
  block_until DATETIME(3) NULL COMMENT '封禁到期时间，NULL 表示长期',
  reason VARCHAR(255) NULL,
  created_by BIGINT(20) NULL,
  status TINYINT(4) NOT NULL DEFAULT 1,
  create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  creator_id BIGINT(20) NULL,
  updater_id BIGINT(20) NULL,
  delete_flag TINYINT(4) NOT NULL DEFAULT 0,
  INDEX idx_block_until (block_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### init_test_data.sql

```sql
INSERT INTO ip_rate_limit_trigger_log (client_ip, rule_code, rule_desc, window_seconds, threshold, current_count, reason, ctx_json, creator_id, updater_id)
VALUES
('198.51.100.5', 'MINUTE_20', '1分钟内超过20次失败', 60, 20, 21, '自动触发', '{"ua":"test-agent"}', 0, 0);

INSERT INTO ip_block_list (client_ip, block_until, reason, created_by)
VALUES
('198.51.100.5', DATE_ADD(NOW(), INTERVAL 1 HOUR), '自动短时封禁', 0);
```

---

## 二、后端结构（SpringBoot，包名：`com.example.security.ratelimit`）

建议模块与文件（示例骨架，真实工程请按你们现有风格放到相应位置，尽量复用已有工具类）：

```
src/main/java/com/example/security/ratelimit/
  controller/
    AdminRateLimitController.java
    RateLimitCallbackController.java  -- 与登录流程联动的入口
  service/
    RateLimitService.java
    RateLimitRecorderService.java
  mapper/
    IpLoginAttemptsMapper.java
    IpRateLimitTriggerLogMapper.java
    IpBlockListMapper.java
  model/
    IpLoginAttempt.java
    IpRateLimitTriggerLog.java
    IpBlockList.java
  dto/
    RateLimitCheckResult.java
  mybatis/
    mapper-xml files...
```

### 关键设计点

* `RateLimitService#isBlocked(String ip)`：用于登录前检查
* `RateLimitService#recordAttempt(String ip, boolean success, String userName, String userAgent)`：登录尝试后调用，写 `ip_login_attempts`，并计算是否触发限流。若触发则写 `ip_rate_limit_trigger_log` 并在必要时写入 `ip_block_list`。
* 触发策略写死在 service 中（分钟/小时/天阈值），后续可迁移到 DB 配置表。
* 统计计数实现：在 DB 中统计 `SELECT COUNT(*) FROM ip_login_attempts WHERE client_ip = ? AND create_time &gt;= ?`（注意 SQL 中 >= 符号要做转义或使用参数化），对于性能可在必要时加 summary counters 表。

---

## 三、后端示例代码骨架（关键类）

> 注意：示例为骨架，省略 import 语句与异常处理细节。请按项目规范补充单元测试、日志、异常治理。

### model/IpLoginAttempt.java

```java
### model/IpRateLimitTriggerLog.java

```java
package com.example.security.ratelimit.model;

import java.util.Date;

public class IpRateLimitTriggerLog {
    private Long id;
    private String clientIp;
    private String ruleCode;
    private String ruleDesc;
    private Integer windowSeconds;
    private Integer threshold;
    private Integer currentCount;
    private Date triggeredAt;
    private String reason;
    private String ctxJson;

    // base fields
    private Integer status;
    private Date createTime;
    private Date updateTime;
    private Long creatorId;
    private Long updaterId;
    private Integer deleteFlag;

    // getters/setters omitted for brevity (implement similarly)
}
```

### mapper/IpLoginAttemptsMapper.java (interface)

```java
package com.example.security.ratelimit.mapper;

import com.example.security.ratelimit.model.IpLoginAttempt;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface IpLoginAttemptsMapper {
    int insert(IpLoginAttempt record);
    int countAttemptsSince(String clientIp, java.util.Date since);
    List<IpLoginAttempt> selectRecentByIp(String clientIp, int limit);
}
```

### mapper XML（示例注意转义）

```xml
<!-- resources/mybatis/IpLoginAttemptsMapper.xml -->
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.security.ratelimit.mapper.IpLoginAttemptsMapper">
  <insert id="insert" parameterType="com.example.security.ratelimit.model.IpLoginAttempt">
    INSERT INTO ip_login_attempts (client_ip, user_name, event_type, creator_id, updater_id)
    VALUES (#{clientIp}, #{userName}, #{eventType}, #{creatorId}, #{updaterId})
  </insert>

  <select id="countAttemptsSince" resultType="int" parameterType="map">
    SELECT COUNT(1) FROM ip_login_attempts
    WHERE client_ip = #{clientIp}
      AND create_time &gt;= #{since}
  </select>

  <select id="selectRecentByIp" resultType="com.example.security.ratelimit.model.IpLoginAttempt">
    SELECT * FROM ip_login_attempts
    WHERE client_ip = #{clientIp}
    ORDER BY create_time DESC
    LIMIT #{limit}
  </select>
</mapper>
```

### service/RateLimitService.java

```java
package com.example.security.ratelimit.service;

import com.example.security.ratelimit.mapper.IpLoginAttemptsMapper;
import com.example.security.ratelimit.mapper.IpRateLimitTriggerLogMapper;
import com.example.security.ratelimit.mapper.IpBlockListMapper;
import com.example.security.ratelimit.model.IpLoginAttempt;
import com.example.security.ratelimit.model.IpRateLimitTriggerLog;
import com.example.security.ratelimit.dto.RateLimitCheckResult;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Date;
import java.util.Calendar;

@Service
public class RateLimitService {

    @Resource
    private IpLoginAttemptsMapper attemptsMapper;
    @Resource
    private IpRateLimitTriggerLogMapper triggerMapper;
    @Resource
    private IpBlockListMapper blockListMapper;

    /**
     * 检查 IP 是否被封禁 / 限流
     */
    public RateLimitCheckResult isBlocked(String clientIp){
        // 查询 ip_block_list
        // 若存在且 block_until > now 则返回 blocked
        // 否则返回 ok
        RateLimitCheckResult r = new RateLimitCheckResult();
        // 简化：实际实现需查询 block list
        r.setBlocked(false);
        return r;
    }

    /**
     * 记录一次登录尝试，并判断是否触发限流
     */
    public void recordAttempt(String clientIp, boolean success, String userName, String userAgent){
        IpLoginAttempt a = new IpLoginAttempt();
        a.setClientIp(clientIp);
        a.setUserName(userName);
        a.setEventType(success?2:3);
        a.setCreateTime(new Date());
        attemptsMapper.insert(a);

        if (!success){
            checkAndTrigger(clientIp, userAgent);
        }
    }

    private void checkAndTrigger(String clientIp, String userAgent){
        // 业界合理阈值示例（初期硬编码）：
        // 1分钟内失败 >= 20 次 -> 触发 MINUTE_20
        // 1小时内失败 >= 200 次 -> 触发 HOUR_200
        // 1天内失败 >= 1000 次 -> 触发 DAY_1000

        Date now = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(now);

        // 1 minute
        c.add(Calendar.SECOND, -60);
        int cnt1 = attemptsMapper.countAttemptsSince(clientIp, c.getTime());
        if (cnt1 >= 20){
            // 写触发日志
            IpRateLimitTriggerLog log = new IpRateLimitTriggerLog();
            log.setClientIp(clientIp);
            log.setRuleCode("MINUTE_20");
            log.setRuleDesc("1分钟内失败>=20次");
            log.setWindowSeconds(60);
            log.setThreshold(20);
            log.setCurrentCount(cnt1);
            log.setTriggeredAt(new Date());
            log.setReason("auto");
            log.setCtxJson("{\"ua\":\"" + (userAgent==null?"":userAgent) + "\"}");
            triggerMapper.insert(log);
            // 短时封禁：1小时
            // insert into block list
            blockListMapper.insertBlock(clientIp, 3600, "auto-minute-20");
            return;
        }

        // 1 hour
        c.setTime(now);
        c.add(Calendar.HOUR, -1);
        int cnt2 = attemptsMapper.countAttemptsSince(clientIp, c.getTime());
        if (cnt2 >= 200){
            IpRateLimitTriggerLog log = new IpRateLimitTriggerLog();
            log.setClientIp(clientIp);
            log.setRuleCode("HOUR_200");
            log.setRuleDesc("1小时内失败>=200次");
            log.setWindowSeconds(3600);
            log.setThreshold(200);
            log.setCurrentCount(cnt2);
            log.setTriggeredAt(new Date());
            log.setReason("auto");
            log.setCtxJson("{}");
            triggerMapper.insert(log);
            blockListMapper.insertBlock(clientIp, 24*3600, "auto-hour-200");
            return;
        }

        // 1 day
        c.setTime(now);
        c.add(Calendar.DATE, -1);
        int cnt3 = attemptsMapper.countAttemptsSince(clientIp, c.getTime());
        if (cnt3 >= 1000){
            IpRateLimitTriggerLog log = new IpRateLimitTriggerLog();
            log.setClientIp(clientIp);
            log.setRuleCode("DAY_1000");
            log.setRuleDesc("1天内失败>=1000次");
            log.setWindowSeconds(86400);
            log.setThreshold(1000);
            log.setCurrentCount(cnt3);
            log.setTriggeredAt(new Date());
            log.setReason("auto");
            log.setCtxJson("{}");
            triggerMapper.insert(log);
            blockListMapper.insertBlock(clientIp, null, "auto-day-1000");
        }
    }
}
```

### mapper/IpRateLimitTriggerLogMapper.java

```java
package com.example.security.ratelimit.mapper;

import com.example.security.ratelimit.model.IpRateLimitTriggerLog;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IpRateLimitTriggerLogMapper {
    int insert(IpRateLimitTriggerLog record);
    List<IpRateLimitTriggerLog> selectByIp(String clientIp);
}
```

### mapper/IpBlockListMapper.java

```java
package com.example.security.ratelimit.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface IpBlockListMapper {
    int insertBlock(String clientIp, Integer blockSeconds, String reason);
    boolean isBlocked(String clientIp);
}
```

### mapper XML 示例（trigger log）

```xml
<!-- resources/mybatis/IpRateLimitTriggerLogMapper.xml -->
<mapper namespace="com.example.security.ratelimit.mapper.IpRateLimitTriggerLogMapper">
  <insert id="insert" parameterType="com.example.security.ratelimit.model.IpRateLimitTriggerLog">
    INSERT INTO ip_rate_limit_trigger_log (client_ip, rule_code, rule_desc, window_seconds, threshold, current_count, reason, ctx_json, creator_id, updater_id)
    VALUES (#{clientIp}, #{ruleCode}, #{ruleDesc}, #{windowSeconds}, #{threshold}, #{currentCount}, #{reason}, #{ctxJson}, #{creatorId}, #{updaterId})
  </insert>

  <select id="selectByIp" resultType="com.example.security.ratelimit.model.IpRateLimitTriggerLog">
    SELECT * FROM ip_rate_limit_trigger_log WHERE client_ip = #{clientIp} ORDER BY triggered_at DESC
  </select>
</mapper>
```

---

## 四、登录流程中的接入点（伪代码）

在现有的 `UserController#login` 内，建议的接入点顺序：

1. 从请求中解析 clientIp、userAgent
2. `RateLimitCheckResult r = rateLimitService.isBlocked(clientIp)` → 若阻塞 `return 429` 或提示
3. 调用滑块/验证码校验（若启用）
4. 执行常规认证（密码/2FA）
5. 调用 `rateLimitService.recordAttempt(clientIp, success, userName, userAgent)` 记录本次尝试并触发限流检测

---

## 五、前端管理页面（Vue3 简化骨架）

路径：`/admin/security/ip-rate-limit`

组件结构：

```
src/views/admin/security/IpRateLimit.vue
src/components/admin/IpTriggerTable.vue
```

### IpRateLimit.vue (骨架)

```vue
<template>
  <div>
    <h2>IP 限流触发日志</h2>
    <ip-trigger-table />
  </div>
</template>

<script setup>
import IpTriggerTable from '@/components/admin/IpTriggerTable.vue'
</script>
```

### IpTriggerTable.vue

```vue
<template>
  <div>
    <el-input v-model="filters.clientIp" placeholder="IP 搜索" style="width:240px; margin-right:12px" />
    <el-button @click="fetchData">搜索</el-button>

    <el-table :data="rows" style="width:100%">
      <el-table-column prop="clientIp" label="IP" />
      <el-table-column prop="ruleCode" label="规则" />
      <el-table-column prop="currentCount" label="计数" />
      <el-table-column prop="triggeredAt" label="触发时间" />
      <el-table-column prop="reason" label="原因" />
    </el-table>
    <el-pagination @current-change="onPage" :current-page="page" :page-size="pageSize" :total="total" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const rows = ref([])
const filters = ref({ clientIp: '' })
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

function fetchData(){
  // 调用后台接口 /admin/api/ratelimit/triggers?page=...&clientIp=...
  // 这里留接口对接点，后端提供分页接口
}
function onPage(p){ page.value = p; fetchData(); }
</script>
```

---

## 六、管理功能点（高层）

* 列表查询：按 IP / 时间 / 规则 查询触发日志
* 统计面板：按规则、按 IP 排行、时间趋势
* 封禁管理：直接将 IP 写入 `ip_block_list`（手动解封/封禁）
* 导出 CSV

---

## 七、开发规范与注意事项

* 遵循禁止 lombok、禁止 beanCopy 的要求
* mybatis XML 中使用 `&gt;=` 等转义后比较日期
* SQL 统计在高并发环境下可能成为瓶颈，必要时考虑用聚合表或近实时缓存
* 所有写表操作保持幂等（插入以时间为主，不可重复插入触发日志）
* 日志表可按月分表或分区

---

## 八、后续优化建议（不必须立刻实现）

1. 使用缓存（如内存 LRU 或 Redis）缓存短期计数，缓解 DB 统计压力
2. 增加可配置的策略表（db）替代硬编码阈值
3. 引入 IP 黑名单/白名单服务，支持 ASN / 国家灰名单
4. 在登录前加 CAPTCHA 滑块联动，降低误杀









* any list
{:toc}