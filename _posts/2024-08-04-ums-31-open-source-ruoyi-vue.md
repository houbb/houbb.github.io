---
layout: post
title: UMS 用户权限管理-31-若依（RuoYi-Vue）
date: 2024-08-04 21:01:55 +0800
categories: [Basic]
tags: [basic, user, ums, priviliage, sh]
published: true
---


# ruoyi-vue 本地启动测试

直接点击下载 [RuoYi-Vue](https://github.com/yangzongzhuan/RuoYi-Vue)

## 依赖服务

redis

mysql

node

## 后端

1）安装依赖

```sh
mvn clean install -DskipTests=true
```

2）执行 mysql 脚本

登录 mysql

```
create database ruoyi;
use ruoyi;
```

执行 sql 下的 `quartz.sql` 和 `ry_20250417.sql`

全部表如下：

```
> show tables;
+--------------------------+
| Tables_in_ruoyi          |
+--------------------------+
| gen_table                |
| gen_table_column         |
| qrtz_blob_triggers       |
| qrtz_calendars           |
| qrtz_cron_triggers       |
| qrtz_fired_triggers      |
| qrtz_job_details         |
| qrtz_locks               |
| qrtz_paused_trigger_grps |
| qrtz_scheduler_state     |
| qrtz_simple_triggers     |
| qrtz_simprop_triggers    |
| qrtz_triggers            |
| sys_config               |
| sys_dept                 |
| sys_dict_data            |
| sys_dict_type            |
| sys_job                  |
| sys_job_log              |
| sys_logininfor           |
| sys_menu                 |
| sys_notice               |
| sys_oper_log             |
| sys_post                 |
| sys_role                 |
| sys_role_dept            |
| sys_role_menu            |
| sys_user                 |
| sys_user_post            |
| sys_user_role            |
+--------------------------+
```

3）修改配置

`application-druid.yml` 调整一下数据库链接+账户密码

```yaml
spring:
    datasource:
        type: com.alibaba.druid.pool.DruidDataSource
        driverClassName: com.mysql.cj.jdbc.Driver
        druid:
            # 主库数据源
            master:
                url: jdbc:mysql://localhost:3306/ruoyi?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
                username: root
                password: PASSWORD
```

4) 启动

运行 `RuoYiApplication#main()`  方法


启动成功日志：

```
13:02:15.675 [restartedMain] INFO  c.r.RuoYiApplication - [logStarted,61] - Started RuoYiApplication in 18.323 seconds (JVM running for 19.665)
(♥◠‿◠)ﾉﾞ  若依启动成功   ლ(´ڡ`ლ)ﾞ  
 .-------.       ____     __        
 |  _ _   \      \   \   /  /    
 | ( ' )  |       \  _. /  '       
 |(_ o _) /        _( )_ .'         
 | (_,_).' __  ___(_ o _)'          
 |  |\ \  |  ||   |(_,_)'         
 |  | \ `'   /|   `-'  /           
 |  |  \    /  \      /           
 ''-'   `'-'    `-..-'    
```

## 前端

```
cd ruoyi-ui
npm install --registry=https://registry.npm.taobao.org
npm run dev
```

注意：npm install 可能会很慢，根据本地网络自主选择。

安装完成提示：

```
own up to 100x even if nothing is polyfilled. Some versions have web compatibility issues. Please, upgrade your dependencies to the actual version of core-js.

added 1609 packages in 60s

167 packages are looking for funding
  run `npm fund` for details
```

## 验证

打开浏览器，输入：http://localhost:80 （默认账户 admin/admin123）
若能正确展示登录页面，并能成功登录，菜单及页面展示正常，则表明环境搭建成功
注意：执行npm命令需要配置node环境




----------------------------------------------------------------------------------------------------

# 平台简介

基于SpringBoot开发的轻量级Java快速开发框架

一直想做一款后台管理系统，看了很多优秀的开源项目但是发现没有合适的。于是利用空闲休息时间开始自己写了一套后台系统。

如此有了若依。她可以用于所有的Web应用程序，如网站管理后台，网站会员中心，CMS，CRM，OA。所有前端后台代码封装过后十分精简易上手，出错概率低。同时支持移动客户端访问。系统会陆续更新一些实用功能。

性别男，若依是给女儿取的名字（寓意：你若不离不弃，我必生死相依）

若依是一套全部开源的快速开发平台，毫无保留给个人及企业免费使用。

* 前端基于 [Hplus(H+)](https://gitee.com/hplus_admin/hplus) 后台主题 UI 框架。

* 前后端分离版本，请移步[RuoYi-Vue](https://gitee.com/y_project/RuoYi-Vue)，微服务版本，请移步[RuoYi-Cloud](https://gitee.com/y_project/RuoYi-Cloud)

* 阿里云折扣场：[点我进入](http://aly.ruoyi.vip)，腾讯云秒杀场：[点我进入](http://txy.ruoyi.vip)&nbsp;&nbsp;

## 内置功能

1.  用户管理：用户是系统操作者，该功能主要完成系统用户配置。
2.  部门管理：配置系统组织机构（公司、部门、小组），树结构展现支持数据权限。
3.  岗位管理：配置系统用户所属担任职务。
4.  菜单管理：配置系统菜单，操作权限，按钮权限标识等。
5.  角色管理：角色菜单权限分配、设置角色按机构进行数据范围权限划分。
6.  字典管理：对系统中经常使用的一些较为固定的数据进行维护。
7.  参数管理：对系统动态配置常用参数。
8.  通知公告：系统通知公告信息发布维护。
9.  操作日志：系统正常操作日志记录和查询；系统异常信息日志记录和查询。
10. 登录日志：系统登录日志记录查询包含登录异常。
11. 在线用户：当前系统中活跃用户状态监控。
12. 定时任务：在线（添加、修改、删除)任务调度包含执行结果日志。
13. 代码生成：前后端代码的生成（java、html、xml、sql）支持CRUD下载 。
14. 系统接口：根据业务代码自动生成相关的api接口文档。
15. 服务监控：监视当前系统CPU、内存、磁盘、堆栈等相关信息。
16. 缓存监控：对系统的缓存查询，删除、清空等操作。
17. 在线构建器：拖动表单元素生成相应的HTML代码。
18. 连接池监视：监视当前系统数据库连接池状态，可进行分析SQL找出系统性能瓶颈。

## 在线体验

- admin/admin123  
- 陆陆续续收到一些打赏，为了更好的体验已用于演示服务器升级。谢谢各位小伙伴。

演示地址：http://ruoyi.vip  
文档地址：http://doc.ruoyi.vip

## 演示图

| ![Image 1](https://oscimg.oschina.net/oscnet/up-42e518aa72a24d228427a1261cb3679f395.png) | ![Image 2](https://oscimg.oschina.net/oscnet/up-7f20dd0edba25e5187c5c4dd3ec7d3d9797.png) |
| -------------------------------------------- | -------------------------------------------- |
| ![Image 3](https://oscimg.oschina.net/oscnet/up-2dae3d87f6a8ca05057db059cd9a411d51d.png) | ![Image 4](https://oscimg.oschina.net/oscnet/up-ea4d98423471e55fba784694e45d12bd4bb.png) |
| ![Image 5](https://oscimg.oschina.net/oscnet/up-7f6c6e9f5873efca09bd2870ee8468b8fce.png) | ![Image 6](https://oscimg.oschina.net/oscnet/up-c708b65f2c382a03f69fe1efa8d341e6cff.png) |
| ![Image 7](https://oscimg.oschina.net/oscnet/up-9ab586c47dd5c7b92bca0d727962c90e3b8.png) | ![Image 8](https://oscimg.oschina.net/oscnet/up-ef954122a2080e02013112db21754b955c6.png) |
| ![Image 9](https://oscimg.oschina.net/oscnet/up-088edb4d531e122415a1e2342bccb1a9691.png) | ![Image 10](https://oscimg.oschina.net/oscnet/up-f886fe19bd820c0efae82f680223cac196c.png) |
| ![Image 11](https://oscimg.oschina.net/oscnet/up-c7a2eb71fa65d6e660294b4bccca613d638.png) | ![Image 12](https://oscimg.oschina.net/oscnet/up-e60137fb0787defe613bd83331dc4755a70.png) |
| ![Image 13](https://oscimg.oschina.net/oscnet/up-7c51c1b5758f0a0f92ed3c60469b7526f9f.png) | ![Image 14](https://oscimg.oschina.net/oscnet/up-15181aed45bb2461aa97b594cbf2f86ea5f.png) |
| ![Image 15](https://oscimg.oschina.net/oscnet/up-83326ad52ea63f67233d126226738054d98.png) | ![Image 16](https://oscimg.oschina.net/oscnet/up-3bd6d31e913b70df00107db51d64ef81df7.png) |
| ![Image 17](https://oscimg.oschina.net/oscnet/up-70a2225836bc82042a6785edf6299e2586a.png) | ![Image 18](https://oscimg.oschina.net/oscnet/up-0184d6ab01fdc6667a14327fcaf8b46345d.png) |
| ![Image 19](https://oscimg.oschina.net/oscnet/up-64d8086dc2c02c8f71170290482f7640098.png) | ![Image 20](https://oscimg.oschina.net/oscnet/up-5e4daac0bb59612c5038448acbcef235e3a.png) |

# vue3-前端

## 平台简介

* 本仓库为前端技术栈 [Vue3](https://v3.cn.vuejs.org) + [Element Plus](https://element-plus.org/zh-CN) + [Vite](https://cn.vitejs.dev) 版本。
* 配套后端代码仓库地址[RuoYi-Vue](https://gitee.com/y_project/RuoYi-Vue) 或 [RuoYi-Vue-fast](https://gitcode.com/yangzongzhuan/RuoYi-Vue-fast) 版本。
* 前端技术栈（[Vue2](https://cn.vuejs.org) + [Element](https://github.com/ElemeFE/element) + [Vue CLI](https://cli.vuejs.org/zh)），请移步[RuoYi-Vue](https://gitee.com/y_project/RuoYi-Vue/tree/master/ruoyi-ui)。
* 阿里云折扣场：[点我进入](http://aly.ruoyi.vip)，腾讯云秒杀场：[点我进入](http://txy.ruoyi.vip)&nbsp;&nbsp;

## 前端运行

```bash
# 克隆项目
git clone https://github.com/yangzongzhuan/RuoYi-Vue3.git

# 进入项目目录
cd RuoYi-Vue3

# 安装依赖
yarn --registry=https://registry.npmmirror.com

# 启动服务
yarn dev

# 构建测试环境 yarn build:stage
# 构建生产环境 yarn build:prod
# 前端访问地址 http://localhost:80
```

## 内置功能

1.  用户管理：用户是系统操作者，该功能主要完成系统用户配置。
2.  部门管理：配置系统组织机构（公司、部门、小组），树结构展现支持数据权限。
3.  岗位管理：配置系统用户所属担任职务。
4.  菜单管理：配置系统菜单，操作权限，按钮权限标识等。
5.  角色管理：角色菜单权限分配、设置角色按机构进行数据范围权限划分。
6.  字典管理：对系统中经常使用的一些较为固定的数据进行维护。
7.  参数管理：对系统动态配置常用参数。
8.  通知公告：系统通知公告信息发布维护。
9.  操作日志：系统正常操作日志记录和查询；系统异常信息日志记录和查询。
10. 登录日志：系统登录日志记录查询包含登录异常。
11. 在线用户：当前系统中活跃用户状态监控。
12. 定时任务：在线（添加、修改、删除)任务调度包含执行结果日志。
13. 代码生成：前后端代码的生成（java、html、xml、sql）支持CRUD下载 。
14. 系统接口：根据业务代码自动生成相关的api接口文档。
15. 服务监控：监视当前系统CPU、内存、磁盘、堆栈等相关信息。
16. 缓存监控：对系统的缓存信息查询，命令统计等。
17. 在线构建器：拖动表单元素生成相应的HTML代码。
18. 连接池监视：监视当前系统数据库连接池状态，可进行分析SQL找出系统性能瓶颈。


# ruoyi-开源系列概览

RuoYi-Cloud: 基于Spring Boot、Spring Cloud & Alibaba的分布式微服务架构权限管理系统

RuoYi-Cloud-Oracle: 基于Spring Boot、Spring Cloud & Alibaba的分布式微服务架构权限管理系统

RuoYi-App: RuoYi APP 移动端框架，基于uniapp+uniui封装的一套基础模版，支持H5、APP、微信小程序、支付宝小程序等，实现了与RuoYi-Vue、RuoYi-Cloud后台完美对接。

RuoYi-fast: 基于SpringBoot的权限管理系统 易读易懂、界面简洁美观。 核心技术采用Spring、MyBatis、Shiro没有任何其它重度依赖。直接运行即可用

RuoYi: 基于SpringBoot的权限管理系统 易读易懂、界面简洁美观。 核心技术采用Spring、MyBatis、Shiro没有任何其它重度依赖。直接运行即可用

RuoYi-Vue-fast: 基于SpringBoot，Spring Security，JWT，Vue & Element 的前后端分离权限管理系统

RuoYi-Vue: 基于SpringBoot，Spring Security，JWT，Vue & Element 的前后端分离权限管理系统，同时提供了 Vue3 的版本

RuoYi-Vue-Oracle: 基于SpringBoot，Spring Security，JWT，Vue & Element 的前后端分离权限管理系统

RuoYi-Oracle: 基于SpringBoot的权限管理系统 易读易懂、界面简洁美观。 核心技术采用Spring、MyBatis、Shiro没有任何其它重度依赖。直接运行即可用

RuoYi-Cloud-Vue3: 基于Spring Boot、Spring Cloud & Alibaba、Vue3 & Vite、Element Plus的分布式前后端分离微服务架构权限管理系统

RuoYi-Vue3: 基于SpringBoot，Spring Security，JWT，Vue3 & Vite、Element Plus 的前后端分离权限管理系统




# 参考资料

* any list
{:toc}