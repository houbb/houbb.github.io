---
layout: post
title: Dolt —— 数据版 Git 入门介绍
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, speech, sh]
published: true
---


# Dolt —— 数据版 Git

**Dolt 是 Git for Data！**

Dolt 是一个 **SQL 数据库**，你可以像使用 Git 仓库一样对它进行：

* fork
* clone
* branch
* merge
* push
* pull

你可以像连接任何 **MySQL 数据库** 一样连接 Dolt，用于读取或修改 **schema 和数据**。

版本控制功能通过 **SQL 系统表、函数和存储过程** 暴露。

你也可以使用 **类似 Git 的命令行接口** 来：

* 导入 CSV 文件
* 提交（commit）修改
* 推送到远程仓库
* 合并团队成员的修改

所有你熟悉的 Git 命令，在 Dolt 中的行为 **完全相同**。

> Git 对文件进行版本控制
> Dolt 对表进行版本控制

**就像 Git 和 MySQL 生了一个孩子。** ([GitHub][1])

---

# 相关产品

我们还构建了：

### DoltHub

一个用于 **共享 Dolt 数据库的平台**。
我们 **免费托管公共数据**。

### DoltLab

如果你想 **自托管 DoltHub**，可以使用 DoltLab。

### Hosted Dolt

如果你希望我们 **托管 Dolt 服务器**，可以使用 Hosted Dolt。

### Doltgres

如果你更喜欢 **PostgreSQL 而不是 MySQL**，可以尝试 **Doltgres**（当前为 Beta 版本）。

---

# 视频介绍

（项目 README 中包含视频介绍）

---

# Dolt 用来做什么？

Dolt 是一个 **通用工具**，拥有很多应用场景。

例如：

### MySQL 副本（Replica）

Dolt 可以通过 **标准 MySQL binlog replication**
作为现有 MySQL 数据库的副本。

这样：

* 每一次写入都会变成 **一个 Dolt commit**
* 你可以获得 **数据库版本控制能力**
* 同时保持现有 MySQL 运行

---

# Dolt CLI

`dolt` 命令行工具和 `git` **几乎完全一致**，并增加了一些数据库相关命令。

常见命令：

```
revert        撤销某个 commit 引入的更改
clone         从远程数据仓库克隆
fetch         从远程更新数据库
pull          获取并合并远程仓库
push          推送到远程仓库
config        配置 Dolt
remote        管理远程仓库
backup        管理服务器备份
login         登录远程 Dolt 主机
creds         管理凭证
ls            列出工作区中的表
schema        查看或导入表 schema
table         复制 / 重命名 / 删除 / 导出表
tag           创建 / 列出 / 删除 tag
blame         查看每一行最后由谁修改
constraints   处理约束
migrate       执行数据库格式迁移
read-tables   在指定 commit 读取表
gc            清理未引用数据
filter-branch 修改 commit 历史
merge-base    查找两个 commit 的共同祖先
version       显示 CLI 版本
dump          导出所有表
```

---

# 安装

Dolt 是一个 **单个约 103MB 的程序**。

```
du -h /Users/timsehn/go/bin/dolt
103M
```

安装非常简单：

下载并放入 `PATH` 即可。

---

## 从最新 Release 安装

在 Linux 或 Mac 上运行：

```bash
sudo bash -c 'curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash'
```

该脚本会：

* 下载最新版本
* 安装到 `/usr/local/bin/`

如果没有 root 权限，可以：

1. 手动下载二进制文件
2. 解压
3. 放到 `PATH` 目录

---

## Linux

### Arch Linux

```
pacman -S dolt
```

---

## Mac

### Homebrew

```
brew install dolt
```

### MacPorts

```
sudo port install dolt
```

---

## Windows

下载 `.msi` 安装包并运行。

### Chocolatey

```
choco install dolt
```

---

## Docker

官方 Docker 镜像：

* `dolthub/dolt`
  （CLI 模式）

* `dolthub/dolt-sql-server`
  （服务器模式）

---

# 从源码编译

需要：

* Go
* C 编译器（cgo 依赖）

步骤：

```
git clone repo
cd go
go install ./cmd/dolt
```

生成的二进制：

```
$GOPATH/bin
```

测试：

```
~/go/bin/dolt version
```

---

# 配置

运行：

```
dolt
```

如果安装成功，会显示可用命令。

配置用户名和邮箱：

```
dolt config --global --add user.email YOU@DOMAIN.COM
dolt config --global --add user.name "YOUR NAME"
```

和 Git 的配置方式完全相同。

---

# 快速开始

## 创建数据库目录

```
cd ~
mkdir dolt
cd dolt
```

Dolt 的数据库会存储在这个目录下。

例如：

```
~/dolt/getting_started
```

---

## 启动 MySQL 兼容数据库服务器

```
dolt sql-server
```

默认端口：

```
3306
```

---

## 使用 MySQL 客户端连接

```
mysql --host 127.0.0.1 --port 3306 -uroot
```

连接后：

```
mysql>
```

---

## Dolt 支持的数据库特性

* 外键
* 二级索引
* Trigger
* Check constraint
* 存储过程
* 多表 JOIN

最多支持 **12 表 JOIN**。

因此 Dolt 是一个 **完整的现代 SQL 关系数据库**。

---

# 创建 Dolt commit

示例：

```
call dolt_add('teams','employees','employees_teams');
```

然后：

```
call dolt_commit('-m','Created initial schema');
```

每次 commit 都会生成 **hash**。

---

# 查看数据库 diff

在 commit 前可以查看修改：

```
select * from dolt_status;
```

也可以查看某个表的 diff：

```
dolt_diff_<tablename>
```

---

# Dolt 的优势

使用 Dolt 可以让数据库操作更安全：

* 可以回滚修改
* 可以恢复历史状态
* 可以撤销 commit

例如：

```
dolt_revert()
```

甚至：

如果你误执行：

```
drop database
```

也可以通过：

```
dolt_undrop()
```

恢复数据库。

---

# 可视化 SQL 工具

如果不喜欢命令行，可以使用 GUI 工具，例如：

**TablePlus**

连接方式：

* 类型：MySQL
* 数据库：getting_started
* 用户：root

即可获得数据库 GUI。

---

# 在分支上修改

使用：

```
dolt_checkout()
```

创建分支：

```
-b
```

和 Git 一样。

---

# 进一步阅读

可以查看：

* 官方文档
* 官方博客
* Roadmap

---

# 安全策略

Dolt 的安全策略维护在仓库中。

发现安全问题时：

不要在公开 Issue 中报告
请按照披露流程处理。

---

# 致谢

Dolt 大量借鉴了 **Noms 项目** 的开源代码与思想。

我们非常感谢 Noms 团队。

---

# 许可证

Dolt 使用：

**Apache License 2.0**

详见 LICENSE 文件。

# 参考资料

* any list
{:toc}