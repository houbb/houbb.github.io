---
layout: post
title: 权限体系之-13-passport 登录安全密码泄露检测？Have I Been Pwned (HIBP)
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# 检查是否使用已泄露密码

“检查是否使用已泄露密码”（即：禁止用户注册/改密码时使用已经在黑网上出现过的密码）是 2025 年最划算的安全措施之一。  
它能直接挡掉 30%~60% 的凭证填充（Credential Stuffing）攻击，成本几乎为零。

### 1. 最推荐的开源/免费方案：Have I Been Pwned (HIBP)

官网：https://haveibeenpwned.com  
作者：Troy Hunt（全球最权威的密码泄露库）

| 项目                  | 数据情况（截至 2025-11）                          | 开源/免费情况                               |
|-----------------------|--------------------------------------------------|--------------------------------------------|
| 总密码数量            | 约 12.9 亿条真实泄露密码（去重后）                | 完全免费提供查询                           |
| 总哈希数量            | 860,268,781 条 SHA1 哈希（包含所有历史泄露）      | 提供可下载的有序 SHA1 列表（匿名下载）      |
| 更新频率              | 几乎每周都有新泄露加入                            | 实时更新                                   |
| Pwned Passwords API   | https://api.pwnedpasswords.com/range/{prefix}    | 免费、无需 API Key、支持 k-Anonymity       |

### 2. 具体怎么安全、快速地检查（推荐 k-Anonymity 方式）

不要直接把用户明文密码发给 HIBP！用下面这种方式，既安全又快：

步骤：
1. 前端或后端把用户输入的密码做 SHA1 哈希（大写）
2. 取哈希的前5个字符作为 prefix（如 A3B2F）
3. 调用：`GET https://api.pwnedpasswords.com/range/A3B2F`
4. API 返回这一段所有前5位相同的哈希后缀 + 出现次数
5. 在返回列表里查找完整哈希是否出现

代码示例（Node.js）：
```js
const crypto = require('crypto');
const fetch = require('node-fetch');

async function isPasswordPwned(password) {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.substr(0, 5);
  const suffix = sha1.substr(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();

  // 每行格式：suffix:count
  for (const line of text.split('\n')) {
    if (line.trim() === '') continue;
    const [hashSuffix, count] = line.split(':');
    if (hashSuffix === suffix) {
      return { pwned: true, count: parseInt(count) };
    }
  }
  return { pwned: false, count: 0 };
}

// 使用示例
const result = await isPasswordPwned('123456');
console.log(result); // { pwned: true, count: 29583142 }
```

### 3. 推荐的拦截阈值（各大厂真实标准）

| 泄露次数          | 建议策略（2025 年主流做法）                          |
|-------------------|----------------------------------------------------|
| ≥ 1 次            | 注册时直接拒绝，改密码时强烈警告                     |
| ≥ 100 次          | 强制拒绝（GitHub、Dropbox、国内所有银行都是这个标准） |
| ≥ 10,000 次       | 直接拦截 + 强制用户必须加长或改用 passphrase        |

常见提示文案：
- “这个密码已经在 2,958 万个被黑账号中使用过，请换一个更强的密码”
- “检测到您使用的密码曾在 XX 泄露事件中出现，为了您的账户安全，请更换”

### 4. 如果你想本地部署（完全离线检查）

HIBP 官方提供两种免费下载方式：

| 方式                          | 大小     | 下载地址                                                                 | 适合场景                     |
|-------------------------------|----------|--------------------------------------------------------------------------|------------------------------|
| 有序的 SHA1 列表（推荐）      | ~20 GB   | https://haveibeenpwned.com/Passwords                                      | 服务器本地二分查找或放 Redis |
| NTLM 完整 torrent（含明文）   | ~1 TB    | 官方不再推荐（法律风险高）                                               | 基本没人敢用                 |

实际落地方式（20GB 版本）：
```bash
# 下载（只需要一次）
wget -c https://downloads.haveibeenpwned.com/passwords/hibp-sha1-ordered-by-hash-v9.txt

# 导入到 Redis（只需要几分钟）
# 或者用 RocksDB、SQLite FTS 等本地查询
```

### 5. 其他可用的开源/免费泄露库（备选）

| 来源                     | 数据量               | 特点                              |
|--------------------------|----------------------|-----------------------------------|
| Dehashed（付费为主）     | 更大、更实时         | 需要付费，国内基本打不开          |
| Firefox Monitor API      | 直接封装了 HIBP      | 免费，调用方式更简单              |
| weakpass.com             | 几十 GB 密码字典     | 包含大量中文弱密码，可本地导入    |
| cit0day/infinity 历史泄露 | 几百 GB              | 灰色渠道，不推荐                  |

### 总结：最推荐的落地方案（2025 年性价比最高）

1. 注册和改密码接口里加上 HIBP k-Anonymity 检查（5 行代码）
2. 泄露次数 ≥ 100 次就直接拒绝
3. 提示用户“该密码已在 X 次数据泄露中出现”
4. 有服务器资源的，直接下载官方 20GB 有序列表做本地查询（延迟 < 1ms）

GitHub、Microsoft、Apple、阿里、腾讯、所有银行、所有持牌支付机构，现在全部都是这么干的。  
一句话：不做泄露密码检查 = 白送黑客 50% 的成功率。




* any list
{:toc}