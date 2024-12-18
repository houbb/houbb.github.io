---
layout: post
title: 分布式存储系统-16-go-fastdfs 是一个简单的分布式文件系统(私有云存储)，具有无中心、高性能，高可靠，免维护等优点，支持断点续传，分块上传，小文件合并，自动同步，自动修复。
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---


# go-fastdfs

go-fastdfs 是一个简单的分布式文件系统(私有云存储)，具有无中心、高性能，高可靠，免维护等优点，支持断点续传，分块上传，小文件合并，自动同步，自动修复。

## 愿景：

为用户提供最简单、可靠、高效的分布式文件系统。

go-fastdfs是一个基于http协议的分布式文件系统，它基于大道至简的设计理念，一切从简设计，使得它的运维及扩展变得更加简单，它具有高性能、高可靠、无中心、免维护等优点。

### 大家担心的是这么简单的文件系统，靠不靠谱，可不可以用于生产环境？

答案是肯定的，正因为简单所以高效，因为简单所以稳定。

如果你担心功能，那就跑单元测试，如果担心性能，那就跑压力测试，项目都自带了，跑一跑更放心^_^。

注意：使用前请认真阅读[使用文档](https://sjqzhang.github.io/go-fastdfs/#character) 或 [视频教程](https://www.bilibili.com/video/av92526484)。

- 支持curl命令上传
- 支持浏览器上传
- 支持HTTP下载
- 支持多机自动同步
- 支持断点下载
- 支持配置自动生成
- 支持小文件自动合并(减少inode占用)
- 支持秒传
- 支持跨域访问
- 支持一键迁移（搬迁）
- 支持异地备份（特别是小文件1M以下）
- 支持并行体验
- 支持断点续传([tus](https://tus.io/))
- 支持docker部署
- 支持自监控告警
- 支持图片缩放
- 支持google认证码
- 支持自定义认证
- 支持集群文件信息查看
- 使用通用HTTP协议
- 无需专用客户端（支持wget,curl等工具）
- 类fastdfs
- 高性能 （使用leveldb作为kv库）
- 高可靠（设计极其简单，使用成熟组件）
- 无中心设计(所有节点都可以同时读写)

# 优点

- 无依赖(单一文件）
- 自动同步
- 失败自动修复
- 按天分目录方便维护
- 支持不同的场景
- 文件自动去重
- 支持目录自定义
- 支持保留原文件名
- 支持自动生成唯一文件名
- 支持浏览器上传
- 支持查看集群文件信息
- 支持集群监控邮件告警
- 支持小文件自动合并(减少inode占用)
- 支持秒传
- 支持图片缩放
- 支持google认证码
- 支持自定义认证
- 支持跨域访问
- 极低资源开销
- 支持断点续传([tus](https://tus.io/))
- 支持docker部署
- 支持一键迁移（从其他系统文件系统迁移过来）
- 支持异地备份（特别是小文件）
- 支持并行体验（与现有的文件系统并行体验，确认OK再一键迁移）
- 支持token下载　token=md5(file_md5+timestamp)
- 运维简单，只有一个角色（不像fastdfs有三个角色Tracker Server,Storage Server,Client），配置自动生成
- 每个节点对等（简化运维）
- 所有节点都可以同时读写

# 极速体验，只需一分钟

### 启动服务器（已编译，[下载](https://github.com/sjqzhang/fastdfs/releases)）

./fileserver #注意：线上使用请使用项目的[control](https://github.com/sjqzhang/go-fastdfs/blob/master/control)文件进行管理,直接运行，关闭终端会退出。

### 命令上传

```
curl -F file=@http-index-fs http://10.1.xx.60:8080/group1/upload
```

### WEB上传（浏览器打开）

http://yourserver ip:8080 注意：不要使用127.0.0.1上传

### [使用文档](https://sjqzhang.github.io/go-fastdfs/#character)

### [最佳实践（必读）](https://sjqzhang.gitee.io/go-fastdfs/QA.html)

### [视频教程](https://www.bilibili.com/video/av92526484)

# 参考资料

https://github.com/sjqzhang/go-fastdfs

* any list
{:toc}