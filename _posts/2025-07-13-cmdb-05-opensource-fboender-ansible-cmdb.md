---
layout: post
title: cmdb-05-开源项目 fboender/ansible-cmdb
date: 2025-7-13 14:12:33 +0800
categories: [CMDB]
tags: [cmdb, sh]
published: true
---


### Ansible 配置管理数据库

### 介绍

Ansible-cmdb 将 Ansible 的事实收集输出转换为静态 HTML 概览页面（以及其他内容），包含系统配置信息。

它支持多种输出格式（html、csv、sql 等），并可以通过自定义数据扩展 Ansible 收集的信息。

对于每个主机，它还显示了该主机的分组、主机变量、自定义变量和机器本地事实。

![](https://raw.githubusercontent.com/fboender/ansible-cmdb/master/contrib/screenshot-overview.png)

![](https://raw.githubusercontent.com/fboender/ansible-cmdb/master/contrib/screenshot-detail.png)

[HTML 示例](https://rawgit.com/fboender/ansible-cmdb/master/example/html_fancy.html) 输出。

---

### 特性

（并非所有模板都支持所有特性）

* 多种格式 / 模板：

  * 华丽 HTML (`--template html_fancy`)，如上图所示。
  * 华丽 HTML 分割 (`--template html_fancy_split`)，每个主机的详细信息在一个独立的文件中（适用于大量主机）。
  * CSV (`--template csv`)，值得信赖且灵活的逗号分隔格式。
  * JSON (`--template json`)，所有事实的 JSON 格式转储。
  * Markdown (`--template markdown`)，适合复制粘贴到 Wiki 等地方。
  * Markdown 分割 (`--template markdown_split`)，每个主机的详细信息在一个独立的文件中（适用于大量主机）。
  * SQL (`--template sql`)，将主机事实导入（My）SQL 数据库。
  * 普通文本表格 (`--template txt_table`)，适合控制台大师。
  * 当然，还有你愿意制作的任何自定义模板。
* 主机概览和详细的主机信息。
* 主机和组变量。
* 收集的主机事实和手动自定义事实。
* 为现有主机添加和扩展事实，并手动添加全新的主机。
* 自定义列。

---

### 开始使用

以下是如何使用 Ansible-cmdb 的简要步骤，帮助你了解其工作原理：

1. 从 [源代码或发行包](https://github.com/fboender/ansible-cmdb/releases) 安装 Ansible-cmdb，或者通过 pip 安装：`pip install ansible-cmdb`。

2. 通过 ansible 获取主机的事实：

   ```bash
   $ mkdir out
   $ ansible -m setup --tree out/ all
   ```

3. 使用 Ansible-cmdb 生成 CMDB HTML：

   ```bash
   $ ansible-cmdb out/ > overview.html
   ```

4. 在浏览器中打开 `overview.html`。

就这么简单！请阅读完整的使用文档，因为生成的 HTML 文件使用时有一些注意事项。

---

### 文档

所有文档可以在 [readthedocs.io](http://ansible-cmdb.readthedocs.io/en/latest/) 上查看。

* [完整文档](http://ansible-cmdb.readthedocs.io/en/latest/)
* [要求与安装](http://ansible-cmdb.readthedocs.io/en/latest/installation/)
* [使用方法](http://ansible-cmdb.readthedocs.io/en/latest/usage/)
* [贡献与开发](http://ansible-cmdb.readthedocs.io/en/latest/dev/)

---

### 许可证

Ansible-cmdb 采用 GPLv3 许可证：

```
该程序是自由软件：你可以根据自由软件基金会发布的 GNU 通用公共许可证的条款重新分发和/或修改它，许可证版本 3，或（根据你的选择）任何更高版本。

该程序是根据希望它会有用的原则分发的，但没有任何担保；甚至没有关于适销性或特定用途适用性的暗示担保。详情请见 GNU 通用公共许可证。

你应该已经收到了该程序的 GNU 通用公共许可证副本。如果没有，请访问 <http://www.gnu.org/licenses/>。

有关完整许可证，请参见 LICENSE 文件。
```

# 参考资料

https://github.com/fboender/ansible-cmdb/blob/master/README.md

* any list
{:toc}