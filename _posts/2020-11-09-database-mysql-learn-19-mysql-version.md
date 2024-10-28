---
layout: post
title:  mysql-19-mysql 版本兼容性报错 java.sql.SQLNonTransientConnectionException Could not create connection to database server
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, log, buffer, sf]
published: true
---

# 背景

mysql 服务端为 5.7x 版本，本地 springboot 2.x，默认引入 mysql 版本为 8.x。

应用执行报错：

```
java.sql.SQLNonTransientConnectionException Could not create connection to database server
```

# 解决方式

明确指定 mysql 的版本为低版本：

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.47</version>
</dependency>
```



# chat

## 解决方式

根据您提供的错误信息和搜索结果，解决 `java.sql.SQLNonTransientConnectionException: Could not create connection to database server` 错误的可能方法如下：

1. **关闭SSL连接**：由于MySQL 5.7和8.0在SSL/TLS协议上有所不同，您可以尝试在数据库连接URL中添加 `useSSL=false` 参数来关闭SSL连接。

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/your_database?useSSL=false&serverTimezone=UTC
   ```

2. **更新MySQL驱动版本**：确保您的Spring Boot项目中使用的MySQL驱动版本与您的MySQL服务器版本兼容。如果您的MySQL服务器是5.7版本，您可能需要将MySQL驱动版本降级以确保兼容性。

   ```xml
   <dependency>
       <groupId>mysql</groupId>
       <artifactId>mysql-connector-java</artifactId>
       <version>5.1.47</version> <!-- 确保版本与您的MySQL服务器版本兼容 -->
   </dependency>
   ```

3. **添加 `allowPublicKeyRetrieval` 参数**：如果您遇到 `Public Key Retrieval is not allowed` 的错误，可以在数据库连接URL中添加 `allowPublicKeyRetrieval=true` 参数。

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/your_database?allowPublicKeyRetrieval=true&useSSL=false
   ```

4. **检查数据库连接配置**：确保您的数据库URL、用户名和密码等配置正确无误。

5. **时区问题**：如果您的MySQL 8.0及以上版本和Spring Boot的默认时区不一致，可以在数据库连接URL中指定时区。

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/your_database?useSSL=false&serverTimezone=UTC
   ```

6. **检查防火墙和网络配置**：确保没有网络或防火墙设置阻止您的Spring Boot应用与MySQL服务器之间的连接。

请尝试上述方法之一或组合，以解决您遇到的连接问题。如果问题仍然存在，可能需要进一步检查具体的网络配置或数据库服务器设置。

## 为什么要降低 mysql 的版本？8.x 的客户端驱动不兼容 5.x 的服务端吗？

MySQL 8.x 的客户端驱动在大多数情况下是兼容 MySQL 5.x 的服务端的，但确实存在一些配置和兼容性问题，需要特别注意。以下是几个关键点：

1. **驱动类变更**：在 MySQL 8.x 中，驱动类由 `com.mysql.jdbc.Driver` 更改为 `com.mysql.cj.jdbc.Driver`。因此，如果你的应用是基于 Spring Boot 2.x，默认引入的 MySQL 驱动版本是 8.x，你需要确保在配置文件中使用正确的驱动类名 。

2. **SSL 连接问题**：MySQL 8.x 版本默认启用了 SSL，而 MySQL 5.7 版本默认情况下可能没有启用 SSL。因此，你可能需要在 JDBC URL 中显式关闭 SSL，例如通过添加 `useSSL=false` 参数 。

3. **时区问题**：MySQL 8.x 版本对时区的处理更为严格，可能会出现时区相关的错误。你需要在 JDBC URL 中指定时区，例如 `serverTimezone=UTC` 或者 `serverTimezone=Asia/Shanghai` 。

4. **密码认证插件**：MySQL 8.x 引入了新的密码认证插件 `caching_sha2_password`，这可能会导致使用旧版本客户端连接时出现问题。你可能需要在 MySQL 8.x 的服务器配置中指定使用 `mysql_native_password` 插件，或者在客户端连接字符串中指定 `allowPublicKeyRetrieval=true` 来解决这个问题 。

5. **兼容性选项**：MySQL 8.x 提供了一些兼容性选项，例如通过设置 `sql_mode` 来兼容旧版本的 SQL 语法。

6. **字符集变更**：MySQL 8.0 的默认字符集由 `latin1` 变更为 `utf8mb4`，这可能导致一些依赖于默认字符集的应用程序出现乱码问题 。

7. **JSON数据类型增强**：在 MySQL 8.0 版本中，对 JSON 数据类型的支持得到了加强，但是与 5.7 版本的兼容性不佳，可能会导致一些查询和操作 JSON 数据的语句失效 。

综上所述，虽然 MySQL 8.x 的客户端驱动通常兼容 MySQL 5.x 的服务端，但需要特别注意上述配置和兼容性问题。通过适当配置和调整，可以确保应用能够顺利连接到 MySQL 5.7 的服务端。


# 参考资料

[java.sql.SQLNonTransientConnectionException: Could not create connection to database server ](https://blog.51cto.com/u_12564104/5039094)

* any list
{:toc}

