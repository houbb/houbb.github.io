---
layout: post
title: 蓝鲸用户管理是蓝鲸智云提供的企业组织架构和用户管理解决方案，为企业统一登录提供认证源服务。
date:  2019-4-1 19:24:57 +0800
categories: [Monitor]
tags: [monitor, apm, api, monitor, devops, sf]
published: true
---


# 蓝鲸用户管理

蓝鲸用户管理是蓝鲸智云提供的企业组织架构和用户管理解决方案，为企业统一登录提供认证源服务。

## 总览

- [架构设计](docs/architecture.md)
- [代码目录](docs/develop_guide.md)

## 功能

- 支持多层级的组织架构管理
- 支持通过多种方式同步数据：OpenLDAP、Microsoft Active Directory(MAD)、Excel 表格等
- 支持用户密码周期管理、密码强度校验、用户登录试错限制、邮件发送随机密码等安全措施

详细介绍请参考[功能说明](https://bk.tencent.com/docs/document/6.0/146/6638)

## 快速开始

- [本地开发部署指引](/docs/develop_guide.md)

## 路线图

- [版本日志](https://github.com/TencentBlueKing/bk-user/releases)

## 支持

- [产品白皮书](https://bkdocs-1252002024.file.myqcloud.com/ZH/6.0/%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86/%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86.pdf)
- [蓝鲸论坛](https://bk.tencent.com/s-mart/community)

## 蓝鲸社区
- [BK-CI](https://github.com/Tencent/bk-ci)：蓝鲸持续集成平台是一个开源的持续集成和持续交付系统，可以轻松将你的研发流程呈现到你面前。
- [BK-BCS](https://github.com/Tencent/bk-bcs)：蓝鲸容器管理平台是以容器技术为基础，为微服务业务提供编排管理的基础服务平台。
- [BK-CMDB](https://github.com/Tencent/bk-cmdb)：蓝鲸配置平台（蓝鲸CMDB）是一个面向资产及应用的企业级配置管理平台。
- [BK-PaaS](https://github.com/Tencent/bk-PaaS)：蓝鲸PaaS平台是一个开放式的开发平台，让开发者可以方便快捷地创建、开发、部署和管理SaaS应用。
- [BK-SOPS](https://github.com/Tencent/bk-sops)：标准运维（SOPS）是通过可视化的图形界面进行任务流程编排和执行的系统，是蓝鲸体系中一款轻量级的调度编排类SaaS产品。

## 贡献
对于项目感兴趣，想一起贡献并完善项目请参阅 [Contributing Guide](docs/contributing.md)。

[腾讯开源激励计划](https://opensource.tencent.com/contribution) 鼓励开发者的参与和贡献，期待你的加入。

## 协议

基于 MIT 协议， 详细请参考[LICENSE](LICENSE)

# 开发指引

## 文件目录释义

```text
bk-user
├── docs  # 文档
└── src
    ├── bk-login  # 统一登录代码目录（包含前端代码）
    ├── bk-user   # 用户管理后端代码目录
    └── pages     # 用户管理前端代码目录
```

## 前置准备

在开始开发前，请确保您使用的 python 版本为 3.10（下面文档以3.10.12举例，推荐使用 `pyenv` 来管理您本地的 Python 版本）：


``` bash
pyenv install 3.10.12
```

准备 Python 虚拟环境（一项目一环境，互相隔离，推荐 `pyenv` 或者 `poetry` 等虚拟环境管理工具）：

``` bash
virtualenv -p ~/.pyenv/versions/3.10.12/bin/python3 bk-login-venv
virtualenv -p ~/.pyenv/versions/3.10.12/bin/python3 bk-user-venv
```

此外，您还需要为整个项目安装并初始化 `pre-commit`：

``` bash
pip install pre-commit && pre-commit install
```

目前我们使用了两个工具: `ruff`、`mypy`，它们能保证您的每一次提交都符合预定的开发规范。
最后进入项目目录，将 `idp_plugin` 软链接到相应的代码目录：

``` bash
ln -s $(pwd)/src/idp-plugins/idp_plugins $(pwd)/src/bk-login/bklogin
ln -s $(pwd)/src/idp-plugins/idp_plugins $(pwd)/src/bk-user/bkuser
```

## 统一登录

### 环境配置

进入 `src/bk-login` 并进入虚拟环境

``` bash
cd src/bk-login
```

安装项目所需的包

``` bash
poetry install
```

在 `bklogin` 目录下添加 `.env` 文件，并在文件里定义环境变量，具体必填环境变量可参考以下

``` bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_NAME=bk_login_db

BK_APP_CODE=bk_login
# 通过蓝鲸开发者中心获取
BK_APP_SECRET=xxx
# 使用 `from cryptography.fernet import Fernet; Fernet.generate_key()` 生成随机秘钥
BKKRILL_ENCRYPT_SECRET_KEY=xxx
# 通过蓝鲸开发者中心获取（与用户管理侧配置相同）
BK_USER_APP_SECRET=xxx
BK_DOMAIN=example.com
BK_LOGIN_ADDR=login.example.com:8000
```

您可能还需要定义其他的环境变量，详见 `bklogin/settings.py`

### 数据库迁移

``` bash
python manage.py migrate
```

### 启动 Web 服务

``` bash
./bin/start.sh
```

或者

``` bash
python manage.py runserver login.example.com:8000
```

### 检测服务连通状态

``` bash
curl login.example.com:8000/ping # pong
```

## 用户管理

### 环境配置

进入 `src/bk-login` 并进入虚拟环境
``` bash
cd src/bk-user
```

安装项目所需的包

``` bash
poetry install
```

在 `bklogin` 目录下添加 `.env` 文件，并在文件里定义环境变量，具体必填环境变量可参考以下

``` bash
BK_APP_CODE=bk_user
# 通过蓝鲸开发者中心获取
BK_APP_SECRET=xxx
# 使用 `from cryptography.fernet import Fernet; Fernet.generate_key()` 生成随机秘钥
BKKRILL_ENCRYPT_SECRET_KEY=xxx
BK_DOMAIN=example.com
BK_USER_URL=http://user.example.com:8000
BK_COMPONENT_API_URL=http://bkapi.example.com
BK_API_URL_TMPL=http://bkapi.example.com/api/{api_name}/

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_NAME=bk_user_db

CELERY_BROKER_URL="" # 该字段为空时则使用 Redis 作为 celery broker
CELERY_WORKER_CONCURRENCY=2

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_MAX_CONNECTIONS=100
REDIS_DB=0

INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=admin_pwd
```

您可能还需要定义其他的环境变量，详见 `bkuser/settings.py`

### 数据库迁移

``` bash
python manage.py migrate
```

### 启动 Web 服务

``` bash
./bin/start.sh
```

或者

``` bash
python manage.py runserver user.example.com:8000
```

### 检测服务连通状态

``` bash
curl user.example.com:8000/ping # pong
```

### 启动 Celery Worker

``` bash
./bin/start_celery.sh
```

### 启动 Celery Beat

``` bash
./bin/start_celery_beat.sh
```

# 参考资料

https://github.com/TencentBlueKing/bk-user

* any list
{:toc}