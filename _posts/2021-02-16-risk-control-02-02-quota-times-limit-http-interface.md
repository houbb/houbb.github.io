---
layout: post
title:  风控限额限次系统设计-02-HTTP 接口设计
date:  2021-2-14 16:52:15 +0800
categories: [BIZ]
tags: [biz, risk, sh]
published: true
---

# 说明

所有的业务系统中。

都需要哦对交易中的用户的交易金额+交易次数进行限制。

本质：一定的时间维度，对指定的用户的指定类别的信息进行统计。如果超过一定的次数，则进行拦截（处罚）。

# 基本的交易限额限次

## 基本流程

所有的交易分为事前+事后。

发起交易之前，首先调用风控系统判断是否存在风险。

交易完成之后，把交易最后的结果要通知风控。（需要统计成功的交易时，需要状态）

![风控](https://img-blog.csdnimg.cn/b862816fe83b4980b19efd516c9ad64f.png#pic_center)

## 事前请求响应的状态

调用风控的时候，会有 3 个结果：

1. 成功

2. 失败

3. 超时


## 接口设计

### 事前

- beforeRisk

```
appId: 唯一应用标识
traceId: 唯一跟踪号
requestTime: 请求时间
checksum: 签名      （每一个应用，都有 appSecret。通过这个统一处理）

orderId: 业务订单号
transAmt: 交易金额
transType: 交易类别
prodId: 产品号
merId: 商户号
transTime: 交易时间 yyyyMMddHHmmssSSS
transDate: 交易日期 yyyyMMdd
```

要求：orderId + appId 唯一。

### 事后

- afterRisk

```
appId: 唯一应用标识
traceId: 唯一跟踪号
requestTime: 请求时间
checksum: 签名      （每一个应用，都有 appSecret。通过这个统一处理）

orderId: 业务订单号
transStatus: 交易状态
```


# chat

## 接口设计

针对交易限额限次需求，设计以下HTTP接口方案，包含事前请求和事后通知接口，确保安全性、幂等性和唯一性约束：

---

### **1. 事前请求接口**
**功能**：提交交易信息，进行额度/次数校验  
**URL**：`POST /api/transaction/pre-event`  
**Content-Type**：`application/json`  
**请求体**：
```json
{
  "appId": "APP123456",
  "traceId": "TRACE-20250602120000-001",
  "requestTime": 1717315200000, // Unix毫秒时间戳
  "checksum": "a1b2c3d4e5f6...", // 签名值
  "orderId": "ORDER-20250602-001",
  "transAmt": 150.00,
  "transType": "PAYMENT",
  "prodId": "PROD-1001",
  "merId": "MERCHANT-01",
  "transTime": "20250602120000123", // yyyyMMddHHmmssSSS
  "transDate": "20250602", // yyyyMMdd
  "extraMap": {
    "userIp": "192.168.1.1",
    "deviceId": "DEV-001"
  }
}
```

**签名生成规则**：  
1. 排除`checksum`字段，将其他字段按字典序排序  
2. 拼接键值对：`key1=value1&key2=value2...`  
3. 末尾追加`appSecret`：`拼接串 + appSecret`  
4. 计算SHA256：`checksum = SHA256(拼接串).toLowerCase()`

**响应**：  
```json
// 成功 (HTTP 200)
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "limitCheckPass": true // 是否通过限额检查
  }
}

// 失败示例 (HTTP 200)
{
  "code": 1001, // 错误码
  "msg": "DUPLICATE_ORDER" // 重复订单/额度不足/签名无效等
}
```

---

### **2. 事后通知接口**
**功能**：上报交易最终状态  
**URL**：`POST /api/transaction/post-event`  
**Content-Type**：`application/json`  
**请求体**：
```json
{
  "appId": "APP123456",
  "traceId": "TRACE-20250602120500-001",
  "requestTime": 1717315500000,
  "checksum": "d5e6f7a8b9c0...", 
  "orderId": "ORDER-20250602-001",
  "transStatus": "SUCCESS" // SUCCESS/FAIL
}
```

**签名生成**：同事前接口规则（排除`checksum`后排序签名）  

**响应**：
```json
// 成功 (HTTP 200)
{
  "code": 0,
  "msg": "STATUS_UPDATED"
}

// 失败示例 (HTTP 200)
{
  "code": 2001,
  "msg": "ORDER_NOT_FOUND" // 订单不存在/状态已更新
}
```

---

### **关键设计说明**
1. **唯一性约束**  
   - 数据库对 `(appId + orderId)` 建立唯一索引，确保事前请求幂等
   - 重复请求返回 `DUPLICATE_ORDER` 错误码

2. **安全机制**  
   - **签名校验**：服务端按相同规则生成签名并比对
   - **时效控制**：校验 `requestTime` 与服务器时间差（建议±5分钟）
   - **防重放攻击**：缓存 `traceId` 短期有效（如10分钟）

3. **数据存储设计**
   ```sql
   CREATE TABLE transaction_records (
     id BIGINT AUTO_INCREMENT PRIMARY KEY,
     app_id VARCHAR(32) NOT NULL,
     order_id VARCHAR(64) NOT NULL,
     trace_id VARCHAR(64) NOT NULL,
     trans_amt DECIMAL(18,2) NOT NULL,
     trans_type VARCHAR(20) NOT NULL,
     prod_id VARCHAR(32),
     mer_id VARCHAR(32) NOT NULL,
     trans_time CHAR(17) NOT NULL, /* yyyyMMddHHmmssSSS */
     trans_date CHAR(8) NOT NULL,  /* yyyyMMdd */
     extra_map JSON,
     trans_status ENUM('PENDING','SUCCESS','FAIL') DEFAULT 'PENDING',
     UNIQUE KEY udx_app_order (app_id, order_id)
   );
   ```

4. **状态机流转**  
   ```mermaid
   stateDiagram
     [*] --> PENDING : 事前请求
     PENDING --> SUCCESS : 事后通知(SUCCESS)
     PENDING --> FAIL : 事后通知(FAIL)
     SUCCESS --> [*]
     FAIL --> [*]
   ```

5. **错误码规范**
   | 错误码 | 含义                  |
   |--------|-----------------------|
   | 0      | 成功                  |
   | 1001   | 重复订单              |
   | 1002   | 限额不足              |
   | 1003   | 签名验证失败          |
   | 1004   | 请求过期              |
   | 2001   | 订单不存在            |
   | 2002   | 状态已更新（无需重复）|

---

### **调用示例流程**
1. **事前请求**  
   - 商户系统生成唯一`orderId`，计算签名  
   - 调用 `/pre-event` 获取额度检查结果  
   - 若通过则执行实际交易

2. **事后通知**  
   - 交易完成后（无论成功/失败）  
   - 携带最终状态调用 `/post-event`  
   - 服务端更新状态并释放/占用额度

此设计保证接口的幂等性、安全性，并通过唯一约束和状态机确保数据一致性。

## 表结构的拓展

如果让你来设计限额限次，你会设计哪些表？为什么






# 参考资料

[多线程使用redis进行累加结果不对，不能保证原子性解决方案](https://blog.csdn.net/cucgyfjklx/article/details/124338511)

[redis 对单个key进行大数据量incr](https://blog.csdn.net/qq_44112474/article/details/115543832)

* any list
{:toc}
