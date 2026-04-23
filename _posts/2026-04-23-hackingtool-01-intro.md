---
layout: post 
title: hackingtool 面向安全研究人员与渗透测试人员的一体化黑客工具集
date: 2026-04-23 21:01:55 +0800
categories: [Ai]
tags: [hack, safe, ai]
published: true
---

# hackingtool

## 安装

### 一行安装（推荐）

```bash
curl -sSL https://raw.githubusercontent.com/Z4nzu/hackingtool/master/install.sh | sudo bash
```

自动完成依赖安装、克隆仓库、虚拟环境、启动器配置。

---

### 手动安装

```bash
git clone https://github.com/Z4nzu/hackingtool.git
cd hackingtool
sudo python3 install.py
```

运行：`hackingtool`

---

### Docker

```bash
# 构建
docker build -t hackingtool .

# 运行
docker run -it --rm hackingtool

# 推荐（Compose）
docker compose up -d
docker exec -it hackingtool bash

# 开发模式
docker compose --profile dev up
docker exec -it hackingtool-dev bash

# 停止
docker compose down
docker compose down -v
```

---

### 依赖

| 依赖     | 版本    | 用途        |
| ------ | ----- | --------- |
| Python | 3.10+ | 核心        |
| Go     | 1.21+ | 多个扫描/探测工具 |
| Ruby   | 任意    | 部分工具      |
| Docker | 任意    | 可选组件      |

```bash
pip install -r requirements.txt
```

---

## 支持

如果该项目对你有帮助，可以考虑请作者喝杯咖啡 ☕

---

## 社交

关注作者获取更新。


# 参考资料

* any list
{:toc}