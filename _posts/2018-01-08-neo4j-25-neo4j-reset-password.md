---
layout: post
title:  Neo4j-25-neo4j 如何重置密码？
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# 场景

neo4j 忘记密码，如何重置密码？

# 整体流程

1. 找到 Neo4j 的配置文件 `neo4j.conf`，通常位于安装目录下的 `conf` 文件夹中。
2. 将 `dbms.security.auth_enabled` 参数设置为 `false`，以禁用身份验证。
3. 重启 Neo4j 服务，使配置更改生效。
4. 使用命令行工具 `cypher-shell` 连接到系统，并执行以下命令来重置密码：
   ```
   ALTER USER neo4j SET PASSWORD '新密码';
   ```
   其中 `neo4j` 是默认的用户名，你可以根据实际情况进行修改。
5. 退出 `cypher-shell`，将 `dbms.security.auth_enabled` 参数重新设置为 `true`，然后再次重启 Neo4j 服务。


# 实战笔记

## 修改 conf

```
dbms.security.auth_enabled=false
```

# chat

## 忘记密码了，如何重置

以下是几种重新设置 Neo4j 密码的方法：

### 通过 Neo4j 自带的可视化界面修改密码
1. 打开浏览器，访问 Neo4j 的可视化界面，地址通常是 `http://localhost:7474/browser/`。
2. 登录到系统，使用当前的用户名和密码进行登录。
3. 在界面中输入以下命令来修改密码：
   ```
   :server change-password
   ```
   然后按照提示输入新的密码并确认。

### 使用命令行工具重置密码
1. 找到 Neo4j 的配置文件 `neo4j.conf`，通常位于安装目录下的 `conf` 文件夹中。
2. 将 `dbms.security.auth_enabled` 参数设置为 `false`，以禁用身份验证。
3. 重启 Neo4j 服务，使配置更改生效。
4. 使用命令行工具 `cypher-shell` 连接到系统，并执行以下命令来重置密码：
   ```
   ALTER USER neo4j SET PASSWORD '新密码';
   ```
   其中 `neo4j` 是默认的用户名，你可以根据实际情况进行修改。
5. 退出 `cypher-shell`，将 `dbms.security.auth_enabled` 参数重新设置为 `true`，然后再次重启 Neo4j 服务。

### 通过删除认证文件来重置密码
1. 找到 Neo4j 的数据目录，通常位于安装目录下的 `data/dbms` 文件夹中。
2. 删除该目录下的 `auth` 文件，这将清除现有的认证信息。
3. 重启 Neo4j 服务，此时你可以使用默认的用户名和密码（通常是 `neo4j`）登录，并按照提示设置新的密码。

在进行这些操作之前，建议先备份相关文件和数据，以防止意外情况导致数据丢失。如果在操作过程中遇到问题，可以参考 Neo4j 的官方文档或社区资源获取更多帮助。


# 参考资料

* any list
{:toc}

