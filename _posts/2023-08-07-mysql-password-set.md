---
layout: post
title: mysql 添加账户密码+reset password 重置密码 You must reset your password using ALTER USER statement before executing this statement
date:  2023-08-07 +0800
categories: [Database]
tags: [database, mysql, sh]
published: true
---


# 问题

执行报错

```
You must reset your password using ALTER USER statement before executing this statement
```

# 解决

## 5.7.6 以前

MySQL版本5.7.6版本以前用户可以使用如下命令：

```
mysql> SET PASSWORD = PASSWORD('123456'); 
```

## 5.7.6 

MySQL版本5.7.6版本开始的用户可以使用如下命令：

```
mysql> ALTER USER USER() IDENTIFIED BY '123456';
```

执行以上语句报 `Your password does not satisfy the current policy requirements` 修改mysql密码出现的错误

5.7版本

```
set global validate_password_policy=0;
set global validate_password_length=1;
```

# mysql 添加一个新账户，设置密码

## 查看 mysql 版本

```
mysql> select @@version;
+-----------+
| @@version |
+-----------+
| 5.7.31    |
+-----------+
```

希望为有些场景单独创建一个新的账户。

执行这个查询语句后，MySQL 将返回一个包含版本信息的结果集。这个版本信息包括 MySQL 服务器的主版本号、次版本号以及补丁级别等详细信息。

如果你正在使用命令行界面，可以打开 MySQL 命令行客户端，然后输入上述查询语句。

如果你正在使用 MySQL 的图形化界面工具，通常也有一个执行 SQL 查询的界面，你可以在那里输入查询语句并查看结果。

请注意，我提供的信息是基于截至 2021 年的情况。如果你在之后的时间查询，可能会有更新，建议查阅 MySQL 官方文档以获取最新信息。

## 添加一个新账户

在 MySQL 中，要添加一个新用户，你需要执行以下步骤：

1. **登录到 MySQL 服务器：** 使用具有管理员权限的用户（例如，root 用户）登录到 MySQL 服务器。你可以使用以下命令登录：

   ```bash
   mysql -u root -p
   ```

   然后会提示你输入密码。

2. **创建新用户：** 一旦登录成功，你可以使用以下 SQL 查询语句来创建新用户。将 `<username>` 替换为你要创建的用户名，而 `<password>` 则替换为你想要设置的密码。

   ```sql
   CREATE USER '<username>'@'localhost' IDENTIFIED BY '<password>';
   ```

   注意，上述查询中的 `'localhost'` 表示新用户只能从本地连接。如果你希望允许从任意主机连接，可以将 `'localhost'` 替换为 `'%'`。



3. **授予权限：** 接下来，你需要为新用户授予适当的数据库权限。以下是一些示例权限授予语句：

   - 授予新用户对特定数据库的全部权限：

     ```sql
     GRANT ALL PRIVILEGES ON <database_name>.* TO '<username>'@'localhost';
     ```

   - 授予新用户对所有数据库的全部权限：

     ```sql
     GRANT ALL PRIVILEGES ON *.* TO '<username>'@'localhost';
     ```

   - 如果你只需要授予特定权限，可以根据需要分配权限，例如：

     ```sql
     GRANT SELECT, INSERT, UPDATE ON <database_name>.* TO '<username>'@'localhost';
     ```

4. **使更改生效：** 在授予权限后，你需要使更改生效：

   ```sql
   FLUSH PRIVILEGES;
   ```

5. **退出 MySQL 客户端：** 当你完成上述步骤后，可以使用以下命令退出 MySQL 客户端：

   ```sql
   EXIT;
   ```

请注意，创建用户和授予权限需要足够的管理员权限。在实际生产环境中，确保为用户分配最小必需的权限，以增加数据库的安全性。

同时，根据 MySQL 版本和配置的不同，上述步骤可能会有所变化。

### 实战

实战添加一个 flyway 账户。

```sql
-- 创建 flyway
CREATE USER 'flyway'@'localhost' IDENTIFIED BY '123456';


-- 添加所有权限
GRANT ALL PRIVILEGES ON *.* TO 'flyway'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;
```

退出后，重新使用新的密码登录即可。

---------------------------------------------------------------------------------------------------








# 参考资料

https://blog.csdn.net/jianyan__/article/details/108291379

https://stackoverflow.com/questions/33467337/reset-mysql-root-password-using-alter-user-statement-after-install-on-mac

[解决You must reset your password using ALTER USER statement before executing this statement.错误](https://blog.csdn.net/qq_42618394/article/details/103181778)

https://blog.csdn.net/qq_32077121/article/details/118578343

* any list
{:toc}