---
layout: post
title:  Neo4j APOC-01-图数据库 apoc 插件安装 neo4j on windows10 install plugins apoc 
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# 如何安装 APOC 插件

安装 Neo4j 的 APOC 插件的步骤相对简单，具体取决于你使用的是哪种 Neo4j 版本（例如 Neo4j Desktop、Neo4j Aura 或 Neo4j 服务器）。

以下是不同环境下安装 APOC 插件的步骤：

## 1. **Neo4j Desktop 安装 APOC 插件**

Neo4j Desktop 是一个桌面版的 Neo4j 安装工具，安装和管理 APOC 插件非常简单。

#### 步骤：
1. 打开 **Neo4j Desktop** 应用。
2. 在左侧的 **Projects** 面板中，选择你要使用的 **Database**，然后点击该数据库旁边的 **Settings** 按钮（齿轮图标）。
3. 在弹出的设置页面中，找到 **Plugins** 选项卡。
4. 在插件列表中，找到 **APOC** 插件。如果没有显示，请确保 Neo4j Desktop 已连接到互联网。
5. 点击 **Install** 按钮安装 APOC 插件。安装完成后，它将自动启用。
6. 安装完成后，你可以在 **Database** 面板中看到 **APOC** 插件已启用。

## 3. **Neo4j 服务器版安装 APOC 插件**

对于自托管的 Neo4j 服务器，安装 APOC 插件需要手动操作。

你需要将 APOC 插件文件放入 Neo4j 的插件目录，并修改配置文件来启用它。

#### 步骤：

1. **下载 APOC 插件**：
   - 访问 APOC 的 [GitHub 发布页面](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases)，选择与 Neo4j 版本兼容的 APOC 插件版本（例如，如果使用 Neo4j 4.x 版本，请下载适用于 Neo4j 4.x 的 APOC 插件）。
   - 下载插件文件（`.jar` 文件）。

2. **将 APOC 插件复制到 Neo4j 插件目录**：
   - 将下载的 `apoc-x.x.x-all.jar` 文件复制到 Neo4j 的 `plugins` 目录。默认路径：
     - 对于 Linux/macOS：`/var/lib/neo4j/plugins/`
     - 对于 Windows：`C:\Program Files\Neo4j\neo4j-community-x.x.x\plugins\`

3. **修改 Neo4j 配置文件**：
   - 打开 Neo4j 的配置文件 `neo4j.conf`。这个文件通常位于 `conf` 目录中，路径类似于：
     - 对于 Linux/macOS：`/etc/neo4j/neo4j.conf` 或 `/var/lib/neo4j/conf/neo4j.conf`
     - 对于 Windows：`C:\Program Files\Neo4j\neo4j-community-x.x.x\conf\neo4j.conf`
   
   - 在配置文件中添加以下行，启用 APOC 插件：
     ```properties
     dbms.security.procedures.unrestricted=apoc.*
     dbms.security.procedures.allowlist=apoc.*
     ```

4. **重启 Neo4j**：
   - 保存配置文件并重启 Neo4j 服务器。你可以通过命令行重启 Neo4j：
     - 对于 Linux/macOS：
       ```bash
       sudo systemctl restart neo4j
       ```
     - 对于 Windows，使用 **Neo4j Desktop** 或服务管理工具进行重启。

5. **验证安装**：
   - 你可以通过执行以下 Cypher 查询来验证 APOC 插件是否安装成功：
     ```cypher
     RETURN apoc.version()
     ```
   - 如果安装成功，它会返回 APOC 的版本号。

# 参考资料

https://www.cnblogs.com/liaozk/p/17138133.html

https://www.w3cschool.cn/neo4j/neo4j_cql_introduction.html

* any list
{:toc}


