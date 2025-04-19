---
layout: post
title: UMS 用户权限管理-30-站在巨人的肩膀上 已有的开源项目
date: 2024-08-04 21:01:55 +0800
categories: [Basic]
tags: [basic, user, ums, priviliage, sh]
published: true
---

# chat

## 一些开源项目

根据资料，以下是一些符合要求的开源用户管理和部门管理系统，均采用Java后端和Vue前端技术栈，且功能相对简单易用：

---

### 1. **若依（RuoYi-Vue）**  
**技术栈**：Spring Boot + Vue + MyBatis  
**功能特性**：  
- 用户管理、角色管理、部门管理、菜单权限（RBAC）、数据权限  
- 支持代码生成、定时任务、系统监控（在线用户/服务状态/缓存）  
- 多数据源和分布式事务支持  
**特点**：  
- 企业级快速开发框架，文档完善且社区活跃  
- 提供前后端分离版本，适合中大型项目扩展  
**源码地址**：  
- 后端：[https://gitee.com/y_project/RuoYi-Vue ](https://gitee.com/y_project/RuoYi-Vue ) 
- 前端：[https://gitee.com/y_project/RuoYi-Vue-UI ](https://gitee.com/y_project/RuoYi-Vue-UI ) 
**引用**：

---

### 2. **狸花猫（RBAC权限管理系统）**  
**技术栈**：Spring Boot + Vue + MySQL  
**功能特性**：  
- 用户管理、部门管理（支持多层级）、岗位管理、角色权限控制  
- 日志服务、在线监控、缓存管理、通知公告  
**特点**：  
- 轻量级设计，适合中小型系统快速搭建  
- 使用Vditor Markdown编辑器，界面简洁  
**源码地址**：一飞开源平台（需注册获取）  https://gitee.com/yukino_git/lihua
**引用**：

---

### 3. **JeeSite**  
**技术栈**：Spring Boot + Vue + MyBatis  
**功能特性**：  
- 用户管理、部门管理、角色权限、数据字典  
- 代码生成工具、国际化支持、多租户SaaS架构  
**特点**：  
- 提供低代码开发能力，简化CRUD操作  
- 前端基于Vue和Element UI，适合快速开发  
**源码地址**：  
- 后端：[https://gitee.com/thinkgem/jeesite4 ](https://gitee.com/thinkgem/jeesite4 ) 
- 前端：[https://gitee.com/thinkgem/jeesite-vue ](https://gitee.com/thinkgem/jeesite-vue ) 
**引用**：

---

### 4. **Albedo**  
**技术栈**：Spring Boot + Vue + MyBatis  
**功能特性**：  
- 组织机构管理（部门/用户/角色）、权限授权、数据权限  
- 代码生成、接口限流、动态路由  
**特点**：  
- 支持AOP权限注解和匿名接口配置  
- 提供在线表单设计工具，快速生成Vue代码  
**源码地址**：GitHub（具体链接需检索）  
**引用**：

https://gitee.com/somowhere/albedo

---

### 5. **SpringBlade**  
**技术栈**：Spring Boot + Vue + MyBatis-Plus  
**功能特性**：  
- 用户管理、部门管理、菜单权限、操作日志  
- 微服务架构支持（Spring Cloud Alibaba）  
**特点**：  
- 集成Sentinel流量控制、Nacos配置中心  
- 适合需要微服务扩展的中型项目  
**源码地址**：[https://gitee.com/smallc/SpringBlade ](https://gitee.com/smallc/SpringBlade ) 
**引用**：

---

### 6. **机关智慧后勤管理系统**  
**技术栈**：Spring Boot + Vue + MySQL  
**功能特性**：  
- 部门管理、用户权限、后勤资源调度  
- B/S架构，前后端分离设计  
**特点**：  
- 专注于政府/事业单位场景，功能模块清晰  
- 使用Element UI，界面友好  
**引用**：

---

### 7. **商城管理系统（多个版本）**  
**技术栈**：Spring Boot + Vue + MyBatis-Plus  
**功能特性**：  
- 用户管理、角色权限、部门管理（部分版本）  
- 商品管理、订单管理、支付集成  
**推荐版本**：  
- **mall项目**：[https://github.com/macrozheng/mall ](https://github.com/macrozheng/mall ) 
- **新蜂商城**：[https://github.com/newbee-ltd ](https://github.com/newbee-ltd ) 
**特点**：  
- 功能模块化，可裁剪部分复杂业务（如支付/秒杀）  
- 适合需要结合电商场景的管理系统  
**引用**：

---

### 评估建议  
1. **功能复杂度**：  
   - 若依、JeeSite、SpringBlade功能较全面，适合企业级需求。  
   - 狸花猫、Albedo更轻量，适合基础权限管理场景。  
2. **文档完整性**：  
   - 若依、JeeSite、mall项目文档最为完善，提供详细部署指南和社区支持。  
   - 小型项目（如Albedo）可能依赖开发者自行探索代码结构。  
3. **技术适配性**：  
   - 需检查项目依赖的Java版本（如SpringBoot 2.x/3.x）和Vue版本（Vue2/Vue3）。  

---

### 总结  

若需简单易用，**狸花猫**或**Albedo**是理想选择；若需扩展性，推荐**若依**或**JeeSite**。

所有项目均可在GitHub/Gitee搜索名称获取源码，建议优先选择Star数高、近期更新的项目以确保维护性。



# 参考资料

* any list
{:toc}