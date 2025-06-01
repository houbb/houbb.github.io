---
layout: post
title: 工作流引擎-15-开源审批流项目之 RuoYi-Vue-Plus 进行二次开发扩展Flowable工作流功能，支持在线表单设计和丰富的工作流程设计能力
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [engine, workflow-engine, workflow, bpm, flow]
published: true
---

## 平台简介

本项目基于 [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus) 进行二次开发，采用 `Flowable` 扩展工作流应用场景，支持在线表单设计和丰富的工作流程设计能力。

- 本项目主要针对`Flowable`工作流场景开发，脚手架功能同步更新 [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus) 项目。
- 采用`MIT开源协议`，完全免费给个人及企业使用。

- 项目处于开发阶段，工作流流程还存在不足。因此，目前仅推荐用于学习、毕业设计等个人使用。

## 参考文档
- 项目文档：[RuoYi-Flowable-Plus开发文档](http://rfp-doc.konbai.work)
- 项目文档(备用)：[RuoYi-Flowable-Plus开发文档](http://159.75.158.189:81/)
- 脚手架文档：[RuoYi-Vue-Plus文档](https://gitee.com/dromara/RuoYi-Vue-Plus/wikis/pages)

## 项目地址

- Gitee：<https://gitee.com/KonBAI-Q/ruoyi-flowable-plus>
- GitHub：<https://github.com/KonBAI-Q/RuoYi-Flowable-Plus>

## 在线演示

演示服务不限制CURD操作，希望大家按需使用，不要恶意添加脏数据或对服务器进行攻击等操作。（将不定期清理数据）

[RuoYi-Flowable-Plus 在线演示](http://159.75.158.189/)

|                 | 账号  | 密码      |
|---------------- | ----- | -------- |
| 超管账户         | admin | admin123 |
| 监控中心（未运行） | ruoyi | 123456   |
| 任务调度中心      | admin | 123456   |
| 数据监控中心      | ruoyi | 123456   |

## 特别鸣谢

- [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus) 

- [RuoYi-flowable](https://gitee.com/tony2y/RuoYi-flowable) 

- [bpmn-process-designer](https://gitee.com/MiyueSC/bpmn-process-designer)

## 友情链接

- [玩转RuoYi-Cloud-Plus - Flowable基础](https://blog.csdn.net/zhaozhiqiang1981/article/details/129240406)：文档包含Flowable基础知识、项目使用说明、源码解析等。（新人必看）

- [基于若依的Flowable工作流实战](https://space.bilibili.com/400188320/channel/collectiondetail?sid=1002899)：Flowable视频学习专栏，项目基本覆盖了Flowable的方方面面，也拓展了很多为了达到生产级别项目而附加的表结构，工具类等知识点！

## 推荐图书

- 大家在使用本项目时，推荐结合贺波老师的书[《深入Flowable流程引擎：核心原理与高阶实战》](https://item.jd.com/14804836.html)学习。这本书得到了Flowable创始人Tijs Rademakers亲笔作序推荐，对系统学习和深入掌握Flowable的用法非常有帮助。

![深入Flowable流程引擎：核心原理与高阶实战](https://foruda.gitee.com/images/1727508315476163030/4e083d99_5096840.jpeg)

- 大家在使用本项目时，推荐结合贺波老师的书[《深入Activiti流程引擎：核心原理与高阶实战》](https://item.m.jd.com/product/13928958.html?gx=RnAomTM2bmCImZxDqYAkVCoIHuIYVqc)，这本书对系统学习和深入掌握Activiti/Flowable的用法非常有帮助。

![深入Activiti流程引擎：核心原理与高阶实战](https://foruda.gitee.com/images/1727508299212519153/0791b5ac_5096840.jpeg)

## 演示图例
<table style="width:100%; text-align:center">
<tbody>
<tr>
  <td>
    <span>登录页面</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/164043_74b57010_5096840.png" alt="登录页面"/>
  </td>
  <td>
    <span>用户管理</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/164236_2de3b8da_5096840.png" alt="用户管理"/>
  </td>
</tr>
<tr>
  <td>
    <span>流程分类</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/164839_ca79b066_5096840.png" alt="流程分类"/>
  </td>
  <td>
    <span>流程表单</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/165118_688209fd_5096840.png" alt="流程表单"/>
  </td>
</tr>
<tr>
  <td>
    <span>流程定义</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/165916_825a85c8_5096840.png" alt="流程定义"/>
  </td>
  <td>
    <span>流程发起</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/171409_ffb0faf3_5096840.png" alt="流程发起"/>
  </td>
</tr>
<tr>
  <td>
    <span>表单设计</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/172933_7222c0f2_5096840.png" alt="表单设计"/>
  </td>
  <td>
    <span>流程设计</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/165827_44fa412b_5096840.png" alt="流程设计"/>
  </td>
</tr>
<tr>
  <td>
    <span>发起流程</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/171651_4639254b_5096840.png" alt="发起流程"/>
  </td>
  <td>
    <span>待办任务</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/171916_7ba22063_5096840.png" alt="代办任务"/>
  </td>
</tr>
<tr>
  <td>
    <span>任务办理</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/172204_04753399_5096840.png" alt="任务办理"/>
  </td>
  <td>
    <span>流转记录</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/172350_179e8341_5096840.png" alt="流转记录"/>
  </td>
</tr>
<tr>
  <td>
    <span>流程跟踪</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/172547_fe7414d4_5096840.png" alt="流程跟踪"/>
  </td>
  <td>
    <span>流程完结</span>
    <img src="https://images.gitee.com/uploads/images/2022/0424/173159_8cc57e74_5096840.png" alt="流程完结"/>
  </td>
</tr>
</tbody>
</table>

# 参考资料

https://github.com/KonBAI-Q/RuoYi-Flowable-Plus

* any list
{:toc}