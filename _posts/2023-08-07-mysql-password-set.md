---
layout: post
title: mysql reset password 重置密码 You must reset your password using ALTER USER statement before executing this statement
date:  2023-08-06 +0800
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


# 参考资料

https://blog.csdn.net/jianyan__/article/details/108291379

https://stackoverflow.com/questions/33467337/reset-mysql-root-password-using-alter-user-statement-after-install-on-mac

[解决You must reset your password using ALTER USER statement before executing this statement.错误](https://blog.csdn.net/qq_42618394/article/details/103181778)

https://blog.csdn.net/qq_32077121/article/details/118578343

* any list
{:toc}