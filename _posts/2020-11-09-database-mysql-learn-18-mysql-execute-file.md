---
layout: post
title:  mysql-18-mysql 如何命令行执行脚本文件？
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, log, buffer, sf]
published: true
---

# 背景

希望通过命令行执行脚本文件

# chat

## 如何通过 mysql 如何命令行执行脚本文件？

在 MySQL 中，你可以通过命令行执行脚本文件（例如 `.sql` 文件）使用以下命令：

1. 打开终端或命令提示符。

2. 使用以下命令登录到 MySQL 数据库：

   ```bash
   mysql -u 用户名 -p
   ```

   输入你的 MySQL 密码。

3. 一旦登录，你可以使用 `source` 命令来执行脚本文件：

   ```sql
   source /path/to/your/script.sql;
   ```

   替换 `/path/to/your/script.sql` 为你的实际脚本文件路径。

或者，你也可以在命令行中直接执行脚本，而不需要先登录到 MySQL：

```bash
mysql -u 用户名 -p 数据库名 < /path/to/your/script.sql
```

在这种情况下，你需要提供数据库名，并在执行时指定脚本文件的路径。

# 参考资料

[揭开 Buffer Pool 的面纱](https://xiaolincoding.com/mysql/buffer_pool/buffer_pool.html#%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E6%9C%89-buffer-pool)

* any list
{:toc}

