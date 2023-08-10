---
layout: post
title: database tool-02-flyway 命令行介绍
date:  2023-08-10 +0800
categories: [Database]
tags: [database, migrate, sh]
published: true
---

# Q: 介绍一下 flyway 的所有命令及其作用

当然，请见以下 Flyway 命令及其作用的清单：

1. **flyway info**：
   显示当前数据库的信息，包括当前的迁移版本、已应用的迁移数量等。

2. **flyway validate**：
   验证迁移脚本的合法性，检查迁移脚本是否存在语法错误或其他问题。

3. **flyway migrate**：
   执行数据库迁移，将未应用的迁移脚本应用到目标数据库，使数据库结构与目标版本一致。

4. **flyway clean**：
   删除所有已应用的迁移脚本，将数据库恢复到初始状态，适用于测试环境或重新构建数据库。

5. **flyway baseline**：
   创建初始基线版本，在现有数据库上启动迁移控制，对已经存在但未经版本控制的数据库很有用。

6. **flyway repair**：
   修复数据库的元数据与实际状态不一致问题，重新计算已应用的迁移版本。

7. **flyway undo**：
   撤销上一次应用的迁移，将数据库结构回滚到上一个版本。

8. **flyway history**：
   查看已应用的迁移历史记录，包括迁移版本、描述、状态等信息。

9. **Snapshot**

快照将 flyway.url 中指定的数据库模式捕获到文件中。

这可用于生成数据库当前状态的快照以与 check.deployedSnapshot 一起使用，或者拍摄构建数据库的快照以与 check.nextSnapshot 一起使用     

请注意，命令的具体用法和参数可能会随着 Flyway 版本的更新而有所变化。建议在使用命令之前查阅官方文档以获取最新信息。


# TODO:

更多详细的介绍




# 参考资料

https://documentation.red-gate.com/fd/commands-184127446.html

* any list
{:toc}d