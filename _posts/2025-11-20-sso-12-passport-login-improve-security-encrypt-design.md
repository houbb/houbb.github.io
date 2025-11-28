---
layout: post
title: 权限体系之-12-passport 登录安全之加密策略 慢的艺术
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---




# 旧的数据

以前的用户表，基于 password+salt md5，不够安全。

表结构如下。

```
mysql> desc user;
+------------------+--------------+------+-----+----------------------+--------------------------------+
| Field            | Type         | Null | Key | Default              | Extra                          |
+------------------+--------------+------+-----+----------------------+--------------------------------+
| id               | bigint(20)   | NO   | PRI | NULL                 | auto_increment                 |
| username         | varchar(50)  | NO   | UNI | NULL                 |                                |
| password         | varchar(100) | NO   |     | NULL                 |                                |
| salt             | varchar(50)  | NO   |     | NULL                 |                                |
| email            | varchar(100) | NO   | UNI | NULL                 |                                |
| phone            | varchar(20)  | YES  |     | NULL                 |                                |
| nickname         | varchar(50)  | YES  |     | NULL                 |                                |
| avatar           | varchar(200) | YES  |     | NULL                 |                                |
| status           | tinyint(4)   | YES  |     | 1                    |                                |
| login_fail_count | int(11)      | NO   |     | 0                    |                                |
| last_fail_time   | datetime(3)  | YES  |     | NULL                 |                                |
| is_frozen        | tinyint(4)   | NO   |     | 0                    |                                |
| frozen_until     | datetime(3)  | YES  |     | NULL                 |                                |
| creator_id       | bigint(20)   | YES  |     | NULL                 |                                |
| create_time      | datetime(3)  | NO   | MUL | CURRENT_TIMESTAMP(3) |                                |
| update_time      | datetime(3)  | NO   |     | CURRENT_TIMESTAMP(3) | on update CURRENT_TIMESTAMP(3) |
| updater_id       | bigint(20)   | YES  |     | NULL                 |                                |
| delete_flag      | tinyint(4)   | NO   | MUL | 0                    |                                |
| real_name        | varchar(50)  | YES  |     |                      |                                |
+------------------+--------------+------+-----+----------------------+--------------------------------+
19 rows in set (0.01 sec)
```

现在想改为 Argon2 这种安全的算法。给出最稳定的版本，最好是 jdk8 的。

从 maven 依赖+对应的加密 service 接口+方法实现。

影响范围：

1）登录密码验证

2）注册/忘记密码时的修改密码

3）管理员新建用户/修改用户时需要确认是否影响到密码加密

给出合适的Argon2 配置

# JDK8 下用 Argon2（稳定可落地，兼顾安全与工程化）的方案

包括 Maven 依赖、推荐参数、Java Service 接口 + 参考实现（可直接粘到 SpringBoot 服务里）、以及迁移策略（含 db/migrate 脚本与流程）。我也会指出常见坑（native lib / 内存 / OOM）以及如何平滑迁移旧的 `password+salt MD5` 数据（按你的影响范围：登录验证 / 修改密码 / 管理员建用户）。

重要参考（便于核验）：

* argon2-jvm 最新 Maven 包（可用于 JDK8）：de.mkammerer:argon2-jvm:2.12。([repo1.maven.org][1])
* 官方/源码与使用说明（argon2-jvm repo）。([GitHub][2])
* Java 中 Argon2 样例与最佳实践参考文章（参数说明等）。([Baeldung on Kotlin][3])
* 注意：部分生产环境曾遇到 argon2-jvm 的 native memory / OOM 问题，部署时需注意 native 内存与容器限制（K8s）。([だいたいよくわからないブログ][4])

---

# 1）工程依赖（Maven — JDK8 可用）

推荐使用 `argon2-jvm`（包含 native binding，性能最好）。`2.12` 是最近稳定版本（2025-03-04 发布）。

在 `pom.xml` 加：

```xml
<dependency>
  <groupId>de.mkammerer</groupId>
  <artifactId>argon2-jvm</artifactId>
  <version>2.12</version>
</dependency>
```

> 说明：若你在某些环境（容器）不想携带 native libs，也可以选 `argon2-jvm-nolibs`，但会影响性能/实现方式（通常不推荐用于生产）。([Maven Repository][5])

---

# 2）推荐 Argon2 参数（JDK8 + 企业可落地）

这里给出一个「安全与性能折中」的推荐配置（适用于中等负载的认证服务）：

* 模式：`Argon2id`（兼顾抵抗侧信道与 GPU）
* memory（内存）：`65536 KB`（64 MB）
* iterations / time：`3`
* parallelism（并行度）：`1`或`2`（如果认证服务单实例 CPU 少，取 1）
* salt 长度：`16 bytes`（库会自动处理）
* 输出哈希长度：`32 bytes`（默认即可，编码保存为 string）

为什么：64MB/3/1 在多数普通云/虚拟机上能把单次耗时控制在 300-700ms 的区间（具体和机器有关）；同时对 GPU/ASIC 抗性很好（内存瓶颈）。可根据你真实机器做压测微调（降低 memory 或 iterations）。

---

# 3）数据库调整（最小改动 & 向后兼容）

现有 `user.password` 是 `varchar(100)`，Argon2 标准编码字符串格式大约 90~140 字节（取决参数）。建议把 `password` 扩到 `varchar(255)`，并新增一列 `password_algo` 或 `password_version` 标识当前加密方案（便于平滑迁移）。

**建议 migration 脚本（放 `db/migrate/Vx_x_x__alter_user_password.sql`）**：

```sql
-- V1_0_1__alter_user_password_to_support_argon2.sql
ALTER TABLE `user`
  MODIFY COLUMN `password` VARCHAR(255) NOT NULL;

-- 新增算法标识（0: legacy-md5, 1: argon2）
ALTER TABLE `user`
  ADD COLUMN `password_algo` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0=md5+salt(old),1=argon2';

-- （可选）为快速查找未迁移用户加索引
CREATE INDEX idx_password_algo ON `user` (`password_algo`);
```

说明：

* `password_algo` 初始值 `0`（表示旧 MD5+salt），迁移成功后设为 `1`。
* 不用覆盖原 `salt` 字段；Argon2 内置 salt（可以保留 `salt` 字段作兼容，但不再使用）。

---

# 4）Service 接口设计（后端：高内聚、避免 lombok/beanCopy）

先给一个接口定义（Java）：

```java
package com.company.auth;

public interface PasswordService {
    /**
     * Hash plain password (for register / admin create / reset)
     * return encoded hash string which contains params and salt ($argon2id$...)
     */
    String hashPassword(char[] plainPassword);

    /**
     * Verify raw password against stored encoded hash (Argon2 format)
     */
    boolean verifyPassword(char[] plainPassword, String encodedHash);

    /**
     * Verify legacy md5+salt password (old storage).
     * If matches, return true and caller should re-hash with Argon2 and update DB.
     */
    boolean verifyLegacyMd5(String rawPassword, String salt, String storedMd5Hex);

    /**
     * Re-hash (wrap): hash plain password + optional pepper
     */
    String rehashPassword(char[] plainPassword);
}
```

---

# 5）参考实现（基于 argon2-jvm）

> 注意：不要把密码以 `String` 长期保存在内存，尽量用 `char[]`，并在使用后清零。

```java
package com.company.auth;

import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;

public class Argon2PasswordService implements PasswordService {

    // 推荐把这些从环境变量或配置中心注入，不要硬编码
    private final int memoryCostKb = 65536; // 64 MB
    private final int iterations = 3;
    private final int parallelism = 1;
    private final int hashLength = 32;
    // pepper: 全局服务端密钥，放在安全 vault 或 env
    private final String pepper;

    // Argon2 实例
    private final Argon2 argon2;

    public Argon2PasswordService(String pepper) {
        this.pepper = pepper;
        // create() 默认使用 argon2id
        this.argon2 = Argon2Factory.create();
    }

    @Override
    public String hashPassword(char[] plainPassword) {
        try {
            char[] pwdWithPepper = mergeWithPepper(plainPassword, pepper);
            // argon2-jvm hash 方法需要 byte[]，传字符串也行：它会转换
            String hash = argon2.hash(iterations, memoryCostKb, parallelism, new String(pwdWithPepper).getBytes(StandardCharsets.UTF_8), hashLength);
            // 清理敏感数据
            wipe(pwdWithPepper);
            return hash;
        } finally {
            wipe(plainPassword);
        }
    }

    @Override
    public boolean verifyPassword(char[] plainPassword, String encodedHash) {
        try {
            char[] pwdWithPepper = mergeWithPepper(plainPassword, pepper);
            boolean res = argon2.verify(encodedHash, new String(pwdWithPepper).getBytes(StandardCharsets.UTF_8));
            wipe(pwdWithPepper);
            return res;
        } finally {
            wipe(plainPassword);
        }
    }

    @Override
    public boolean verifyLegacyMd5(String rawPassword, String salt, String storedMd5Hex) {
        if (rawPassword == null || salt == null) return false;
        try {
            // old: password+salt md5 hex
            byte[] bytes = (rawPassword + salt).getBytes(StandardCharsets.UTF_8);
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(bytes);
            String hex = toHex(digest);
            return hex.equalsIgnoreCase(storedMd5Hex);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String rehashPassword(char[] plainPassword) {
        return hashPassword(plainPassword);
    }

    // 辅助方法
    private char[] mergeWithPepper(char[] pwd, String pepper) {
        if (pepper == null || pepper.isEmpty()) {
            return Arrays.copyOf(pwd, pwd.length);
        }
        char[] result = new char[pwd.length + pepper.length()];
        System.arraycopy(pwd, 0, result, 0, pwd.length);
        pepper.getChars(0, pepper.length(), result, pwd.length);
        return result;
    }

    private void wipe(char[] arr) {
        if (arr == null) return;
        Arrays.fill(arr, '\0');
    }

    private String toHex(byte[] bs) {
        StringBuilder sb = new StringBuilder(bs.length*2);
        for (byte b : bs) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }
}
```

**几点实现说明：**

* 使用 `Argon2Factory.create()`（默认 `argon2id`）。([GitHub][2])
* `argon2.hash(...)` 返回的是标准编码的字符串（包含 `$argon2id$v=...$m=...` 等参数），可直接存 DB `password` 字段。验证时用 `argon2.verify(encoded, rawBytes)`。([Baeldung on Kotlin][3])
* 我把 `pepper`（全局服务器端秘钥）拼接到密码上再哈希，这是额外防线（若 DB 泄露，攻击者没有 pepper，离线破解难度又增一层）。**pepper** 必须放在安全 vault/配置中心，不要放在代码或 DB。
* `verifyLegacyMd5(...)` 用于登录时先用旧逻辑校验旧记录，校验成功后：立即 `rehashPassword`（Argon2）并写回 `password` 字段，同时把 `password_algo` 设置为 `1`，并可以删除旧的 `salt`（或保留以备对账）。这样做到“登录即迁移”（lazy migration）。

---

# 6）登录流程（带平滑迁移）

1. 用户提交 username + password
2. 服务查 `user` 表取 `password_algo`：

   * 如果 `password_algo == 1`（argon2）：

     * 调用 `passwordService.verifyPassword(...)`，通过则登录成功。
   * 如果 `password_algo == 0`（legacy MD5+salt）：

     * 调用 `passwordService.verifyLegacyMd5(...)`，若匹配：

       * 生成 Argon2 hash `String newHash = passwordService.rehashPassword(plainPassword)`
       * 在 DB 中事务更新：`password = newHash`, `password_algo = 1`（同时可以清空 `salt`，或保留作审计）
       * 登录成功
     * 若不匹配：登录失败
3. 注意：验证过程需要防止计时攻击（argon2.verify 本身设计为抗 timing，但对 legacy 部分你也可以使用 constant time compare）。

这种“登录即迁移”不会影响用户体验，只在首次登录那次额外消耗一次 Argon2（但你要保证 auth-service 有能力承受峰值）。

---

# 7）注册 / 重置 / 管理员新建用户 的处理

* **注册**：调用 `hashPassword()` 并写入 `password`，`password_algo=1`。不要再写 salt。
* **忘记密码/重置**：收到新密码后直接 `hashPassword()` 写入；若管理端生成临时密码，同样用 Argon2 存储，或要求用户首次登录强制修改。
* **管理员创建用户**：若管理员在 UI 输入明文密码，服务端按注册逻辑（Argon2）处理；若管理员从脚本批量导入历史 md5，需要把 `password_algo` 置 0（legacy），并在用户下次登录时迁移。

---

# 8）并发 / 资源与部署建议（避免“伤己”过重）

Argon2 会占用 **本地 native memory + CPU**（memoryCost）。生产部署注意：

* **认证服务独立化**：把 auth 服务独立成一组 pod/实例（不同于业务 API），便于单独调整资源与横向扩容。
* **控制并发QPS**：在网关或 auth-service 层做并发限制（限速/队列），避免瞬时并发洪峰把内存耗尽。
* **容器内存限制**：如果在 k8s，请保证容器的 `memory` 限额能覆盖 Argon2 的 native 分配；否则会遇到 OOM（已有社区报告）。([だいたいよくわからないブログ][4])
* **监控**：监控 `auth-service` 的内存 & native memory & CPU，预置熔断策略。
* **参数回退**：在遭遇压力时，可通过配置中心临时降低 memory 或 iterations（注意这会降低安全性，视作应急手段）。

---

# 9）关于 pepper、salt、hash 存储建议（安全层级）

* Argon2 内含 salt（自动生成），因此你不需要再单独存 `salt`（但保留旧字段以兼容旧逻辑）。
* **Pepper**：服务器端的全局秘密，**必须**放在 Vault/Secrets Manager（例如 AWS Secrets Manager / HashiCorp Vault / K8S Secret），并对访问做最小权限控制。Pepper 增加：若 DB 泄露但没有 pepper，离线破解难度增加。
* **Hash 存储**：把完整的 `$argon2id$v=...$...$HASH` 存 `user.password`。同时存 `password_algo` 明确标注算法。

---

# 10）迁移与回滚策略（平稳上线流程）

1. **准备**：

   * 加入 migration 脚本（扩表、增加 `password_algo`），部署 DB change。
   * 部署新的 `PasswordService` 依赖（argon2 lib）到认证服务，但仍支持 legacy 验证。
2. **灰度**：

   * 对一小部分流量（测试用户）开启 Argon2（例如注册导向新逻辑）。
   * 监控 auth 服务资源（内存/CPU/错误率/延时）。
3. **全量迁移策略（lazy）**：

   * 用户下次登录时自动迁移（verify legacy -> rehash -> update password_algo）。
   * 管理页面可以展示未迁移用户并支持批量触发邮件/人工重设（可选）。
4. **回滚**：

   * 若出现严重问题，可在配置中心临时降低 Argon2 参数（memory/iterations），或者回退到之前的 jar（具备兼容性）。但回退后已经迁移的密码可能无法用旧逻辑验证（因为旧逻辑是 MD5），所以回滚策略要谨慎：建议先稳定后才回退；真正回滚前要通知安全团队。

---

# 11）示例 SQL migration 文件（放 db/migrate）

**VXXX__alter_user_password_to_varchar255_and_algo.sql**

```sql
ALTER TABLE `user`
  MODIFY COLUMN `password` VARCHAR(255) NOT NULL,
  ADD COLUMN `password_algo` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0=legacy-md5,1=argon2';

CREATE INDEX idx_password_algo ON `user` (`password_algo`);
```

```sql
INSERT INTO system_config (key_name, key_value, create_time, update_time)
VALUES ('auth.argon2.memory_kb','65536', now(), now()),
       ('auth.argon2.iterations','3', now(), now()),
       ('auth.argon2.parallelism','1', now(), now());
```

---

# 12）常见问题 & 注意事项（实务经验）

* **Native 内存 OOM**：argon2-jvm 使用 JNA 调用 native C 库，会分配 native memory；容器化时要给容器足够的 memory，并监控 native 分配（社区有出现过 OOM 的案例）。([だいたいよくわからないブログ][4])
* **性能测试必须在真实硬件/容器上走一遍**：不同云机/VM/容器对内存管理不同，建议在预生产做压测，调优 `memory/iterations`。
* **不要把 pepper 写到代码/数据库**。
* **不要在前端做任何密码哈希/加盐工作**（前端仅做复杂度提示/强度条，所有实际哈希都放后端）。
* **别忘了登录限流与失败策略**（配合慢哈希才是完整防护）。

---

# 13）结论（给你一句话决策）

* **立刻把注册/重置/管理员创建全部切到 Argon2id（参数按上面建议）**；
* **保留登录时的 lazy-migration：如果用户是旧 MD5，则在 login 成功时 rehash 并更新 DB**；
* **把 password 字段改为 varchar(255)，新增 password_algo**；
* **部署时把 auth 服务独立并监控内存/CPU，做压力测试**。

---

如果你需要，我可以立刻继续做两件事（任选一项或两项）：

1. 把上面的 Java 参考实现改成 **Spring Boot Bean + 完整 Controller/Service 层集成示例**（含事务、DAO update 逻辑和并发保护）。
2. 给一个 **auth-service 性能压测脚本（JMeter/locust）**，并按不同 Argon2 参数给出预估 QPS / 单次耗时表格。

你想先要哪一个？

[1]: https://repo1.maven.org/maven2/de/mkammerer/argon2-jvm/2.12/?utm_source=chatgpt.com "de/mkammerer/argon2-jvm/2.12"
[2]: https://github.com/phxql/argon2-jvm?utm_source=chatgpt.com "Argon2 Binding for the JVM"
[3]: https://www.baeldung.com/java-argon2-hashing?utm_source=chatgpt.com "Hashing With Argon2 in Java"
[4]: https://matsu-chara.hatenablog.com/entry/2025/01/11/110000?utm_source=chatgpt.com "Argon2とJVMとK8Sの組み合わせでおきたOoM について"
[5]: https://mvnrepository.com/artifact/de.mkammerer/argon2-jvm-nolibs/2.11?utm_source=chatgpt.com "de.mkammerer » argon2-jvm-nolibs » 2.11"

* any list
{:toc}