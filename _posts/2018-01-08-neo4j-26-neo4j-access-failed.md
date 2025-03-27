---
layout: post
title:  Neo4j-25-neo4j bolt WSL 启动，页面可以访问，但是代码无法访问？
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# 场景

neo4j 我在 wls 部署了 neo4j 服务，配置如下: 

```
# Bolt connector
dbms.connector.bolt.enabled=true
#dbms.connector.bolt.tls_level=DISABLED
dbms.connector.bolt.listen_address=:17687
dbms.connector.bolt.advertised_address=:17687。
```

我在浏览器页面控台已经访问可以，但是下面的代码一直无法访问，为什么？package org.example;

```java
import org.neo4j.driver.*;
public class Main {


    public static void main(String[] args) {
        String uri = "bolt://localhost:17687"; // Neo4j数据库的URI
        String username = "neo4j";
        String password = "12345678";

        try (Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(username, password));
             Session session = driver.session()) {

            // 执行Cypher查询
            String cypherQuery = "MATCH (n) RETURN n LIMIT 10";
            Result result = session.run(cypherQuery);

            // 处理查询结果
            while (result.hasNext()) {
                Record record = result.next();
                // 处理每个记录...
                System.out.println(record);
            }
        } catch (Exception e) {
            // 处理异常...
            e.printStackTrace();
        }
    }

}  
```

异常如下：

```
org.neo4j.driver.exceptions.ServiceUnavailableException: Unable to connect to localhost:17687, ensure the database is running and that there is a working network connection to it.
	at org.neo4j.driver.internal.util.Futures.blockingGet(Futures.java:111)
	at org.neo4j.driver.internal.InternalSession.run(InternalSession.java:62)
	at org.neo4j.driver.internal.InternalSession.run(InternalSession.java:47)
	at org.neo4j.driver.internal.AbstractQueryRunner.run(AbstractQueryRunner.java:34)
	at org.neo4j.driver.internal.AbstractQueryRunner.run(AbstractQueryRunner.java:49)
	at org.example.Main.main(Main.java:17)
	Suppressed: org.neo4j.driver.internal.util.ErrorUtil$InternalExceptionCause
```



# 解决方案 1

```properties
dbms.connector.bolt.listen_address=:17687       # 监听地址未明确指定 IP
dbms.connector.bolt.advertised_address=:17687  # 对外宣告的地址未明确指定 IP
```

这可能导致 Neo4j 只绑定到 IPv6 地址，而 Java 客户端可能尝试通过 IPv4 连接。

**解决方案：**
- 修改配置为明确绑定到 `0.0.0.0`（IPv4 所有接口）：
  ```properties
  dbms.connector.bolt.listen_address=0.0.0.0:17687
  dbms.connector.bolt.advertised_address=你的服务器IP:17687  # 或保持为空，自动检测
  ```
- 重启 Neo4j 服务使配置生效。


发现不行

## 第二步

尝试开启防火墙


```
sudo ufw allow 17687/tcp
```

还是不行

# WSL 的网络呢?

查看了一下 WSL 的网络如下：

```
$ netstat | grep 17687
tcp6       0      0 ip6-localhost:34288     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:34298     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34298     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34300     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34266     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34232     ESTABLISHED
tcp6       0      0 ip6-localhost:34300     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34288     ESTABLISHED
tcp6       0      0 ip6-localhost:34282     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:34266     ip6-localhost:17687     ESTABLISHED
tcp6       1      0 localhost:39896         localhost:17687         CLOSE_WAIT
tcp6       0      0 ip6-localhost:34232     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34282     ESTABLISHED 
```

### 原因

WSL 中使用了 ipv6 的方式

代码改为：

```java
String uri = "bolt://[::1]:17687"; // Neo4j数据库的URI
```

搞定。


# 实战笔记



# chat

## 为什么？

你的代码无法连接 Neo4j 可能有以下几个原因，请逐步排查：

---

### 1. **Bolt 监听地址配置问题**
你的配置中存在一个关键细节：
```properties
dbms.connector.bolt.listen_address=:17687       # 监听地址未明确指定 IP
dbms.connector.bolt.advertised_address=:17687  # 对外宣告的地址未明确指定 IP
```
这可能导致 Neo4j 只绑定到 IPv6 地址，而 Java 客户端可能尝试通过 IPv4 连接。

**解决方案：**
- 修改配置为明确绑定到 `0.0.0.0`（IPv4 所有接口）：
  ```properties
  dbms.connector.bolt.listen_address=0.0.0.0:17687
  dbms.connector.bolt.advertised_address=你的服务器IP:17687  # 或保持为空，自动检测
  ```
- 重启 Neo4j 服务使配置生效。

---

### 2. **防火墙/端口未开放**
确保服务器防火墙允许 `17687` 端口的入站和出站连接：
- **Linux：**
  ```bash
  sudo ufw allow 17687/tcp
  ```
- **Windows：** 在防火墙高级设置中添加入站规则。

---

### 3. **TLS 加密配置冲突**
默认情况下，Neo4j Bolt 连接会尝试使用 TLS 加密，但你的配置中 `dbms.connector.bolt.tls_level=DISABLED` 被注释掉了，导致客户端和服务端的加密配置不一致。

**解决方案：**
- **取消注释并禁用 TLS：**
  ```properties
  dbms.connector.bolt.tls_level=DISABLED
  ```
  或者在 Java 代码中显式禁用加密：
  ```java
  import org.neo4j.driver.Config;

  Config config = Config.builder()
          .withoutEncryption()  // 明确禁用加密
          .build();

  Driver driver = GraphDatabase.driver(uri, AuthTokens.basic(username, password), config);
  ```

---

### 4. **使用正确的主机名或 IP**
如果 Neo4j 部署在远程服务器或容器中，`localhost` 可能指向客户端本机而非服务器。

**解决方案：**
- 将 URI 中的 `localhost` 替换为服务器的实际 IP 或主机名：
  ```java
  String uri = "bolt://服务器IP:17687";
  ```

---

### 5. **检查 Neo4j 日志**
查看 Neo4j 的 `logs/neo4j.log` 文件，搜索 `Bolt enabled` 和连接错误信息：
```log
INFO  Bolt enabled on 0.0.0.0:17687
```
如果未找到类似日志，说明 Bolt 服务未正确启动。

---

### 6. **驱动版本兼容性**
确保你使用的 Neo4j Java 驱动版本与服务器版本兼容。可以通过[官方文档](https://neo4j.com/docs/java-manual/current/)确认兼容性。

---

### 7. **验证认证信息**
确认用户名和密码是否正确，且未触发 Neo4j 的自动锁定机制（多次错误登录后会锁定账户）。

---

### 最终检查步骤：
1. 修改配置后重启 Neo4j。
2. 确保防火墙开放端口。
3. 在代码中禁用 TLS。
4. 使用服务器 IP 代替 `localhost`。
5. 检查日志确认 Bolt 服务已启动。

如果问题仍未解决，请提供 Neo4j 日志中的错误片段，以便进一步分析。


## 网络问题

查看了一下 WSL 的网络如下：

```
$ netstat | grep 17687
tcp6       0      0 ip6-localhost:34288     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:34298     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34298     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34300     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34266     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34232     ESTABLISHED
tcp6       0      0 ip6-localhost:34300     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34288     ESTABLISHED
tcp6       0      0 ip6-localhost:34282     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:34266     ip6-localhost:17687     ESTABLISHED
tcp6       1      0 localhost:39896         localhost:17687         CLOSE_WAIT
tcp6       0      0 ip6-localhost:34232     ip6-localhost:17687     ESTABLISHED
tcp6       0      0 ip6-localhost:17687     ip6-localhost:34282     ESTABLISHED  WSL中看了一下是这样的
```


### 解决

根据你提供的 `netstat` 输出，可以明确看出 **Neo4j 的 Bolt 服务正在监听 IPv6 地址（`tcp6`）**，而你的 Java 代码可能尝试通过 IPv4 地址（`localhost`）连接，导致协议不匹配而失败。

以下是具体分析和解决方案：

---

### 🔍 问题分析
1. **IPv6 vs IPv4 的冲突**：
   - 从 `netstat` 输出可见，Neo4j 的 Bolt 端口 `17687` 绑定在 `ip6-localhost`（即 IPv6 的 `::1`），而你的 Java 代码中使用的是 `localhost`（默认指向 IPv4 的 `127.0.0.1`）。
   - WSL 在某些情况下会优先使用 IPv6，但 Java 客户端可能未正确处理 IPv6 回环地址 `::1`。

2. **WSL 的特殊网络环境**：
   - 如果 Neo4j 运行在 WSL 中，而你的 Java 代码运行在 Windows 主机上，直接使用 `localhost` 可能无法正确映射到 WSL 的 IPv6 地址（需要额外配置端口转发）。

---

### 🛠️ 解决方案
#### 方法 1：强制 Neo4j 绑定 IPv4 地址（推荐）
修改 Neo4j 配置文件 `neo4j.conf`，明确指定监听 IPv4 地址：
```properties
# 修改监听地址为 IPv4 所有接口
dbms.connector.bolt.listen_address=0.0.0.0:17687

# 确保对外宣告地址正确（如果是远程访问，需替换为实际 IP）
dbms.connector.bolt.advertised_address=:17687
```
重启 Neo4j 服务后，检查 `netstat` 输出是否包含 `tcp`（IPv4）的监听：
```bash
$ netstat -tuln | grep 17687
tcp        0      0 0.0.0.0:17687           0.0.0.0:*               LISTEN
```

---

#### 方法 2：在 Java 代码中显式使用 IPv6 地址
将 URI 中的 `localhost` 替换为 IPv6 回环地址 `[::1]`：
```java
String uri = "bolt://[::1]:17687"; // 使用 IPv6 地址
```

---

#### 方法 3：配置 WSL 端口转发（适用于跨主机访问）
如果 Java 代码运行在 Windows 主机上，而 Neo4j 在 WSL 中，需配置端口转发：
1. **在 WSL 中获取 IP 地址**：
   ```bash
   $ hostname -I
   172.28.123.45  # 示例 IP
   ```
2. **修改 Java 代码中的 URI**：
   ```java
   String uri = "bolt://172.28.123.45:17687"; // 使用 WSL 的 IP
   ```
3. **确保 WSL 防火墙开放端口**：
   ```bash
   $ sudo ufw allow 17687/tcp
   ```

---

#### 方法 4：禁用 IPv6 回环优先（可选）
在 WSL 中修改系统配置，让 IPv4 优先于 IPv6：
```bash
# 编辑 sysctl.conf
$ sudo nano /etc/sysctl.conf

# 添加以下内容
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1

# 应用配置
$ sudo sysctl -p
```
重启 WSL 后，Neo4j 会强制使用 IPv4。

---

### 📝 其他注意事项
1. **检查 TLS 配置**：
   - 如果未禁用 TLS，需在代码中启用加密：
     ```java
     Config config = Config.builder().build(); // 默认启用加密
     ```
   - 如果已禁用 TLS，需在代码中显式关闭：
     ```java
     Config config = Config.builder().withoutEncryption().build();
     ```

2. **验证连通性**：
   - 在 WSL 中运行 `telnet` 测试：
     ```bash
     $ telnet 127.0.0.1 17687  # 测试 IPv4
     $ telnet ::1 17687        # 测试 IPv6
     ```

---

### 总结
优先选择 **方法 1**（绑定 Neo4j 到 IPv4），并确保代码中的 URI 和防火墙配置一致。如果问题依然存在，请检查 Neo4j 日志 (`neo4j.log`) 中的错误信息，例如：
```log
ERROR Failed to start Neo4j on Bolt connector [0.0.0.0:17687]
```
这可以帮助进一步定位问题。


# 参考资料

* any list
{:toc}

