---
layout: post
title: IM 即时通讯系统-53-im system server
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---


# IM

https://github.com/lining90567/leo-im-server

# 林语

<p align="center">客户端地址：https://github.com/DWHengr/linyu-client</p>

<p align="center">管理端地址：https://github.com/DWHengr/linyu-admin-web</p>

# 简绍

`林语`是基于`tauri`开发的桌面聊天软件，前端框架使用`react`，后端框架使用`springboot`进行开发
，管理端使用`vue3`进行开发。其中使用http和websocket实现消息发送和推送，使用webrtc实现音视频聊天。

# 目前功能

## 客户端功能

好友相关、朋友圈、音视频聊天、语音消息、文本消息、文件消息、图片消息、截图、群聊等。

## 管理端功能

信息统计、用户管理、在线聊天、系统通知管理、第三方会话管理等。

# 项目相关

## java环境

开发使用的java版本为`1.8`，springboot版本为`2.6.7`。

## mysql安装

mysql使用的版本为`8.0.37`，执行项目下`linyu.sql`内容来初始化数据库。

## minio安装

minio使用的版本为`RELEASE.2024-05-10T01-41-38Z`。

## redis安装

Redis使用的版本为`5.0.14.1`

## RocketMQ安装

RocketMQ使用的版本为`5.3.0`

## faster-whisper-server安装

#### 1.下载模型（whisper国内模型无法自动下载，需要手动下载）

https://huggingface.co/Systran/faster-whisper-small

#### 2.上传到服务器（将模型上传到服务器，目录可以任意）

#### 3.使用docker部署（挂载刚才上传的模型目录）

docker run -d --publish 8000:8000 --volume /model:/model fedirz/faster-whisper-server:latest-cpu

#### 4.api调用示例

curl http://127.0.0.1:8000/v1/audio/transcriptions -F "file=@1.wav" -F"model=/model/faster-whisper-small/"

## 配置修改

修改`application.yml`内，mysql、minio、redis、faster-whisper-server相关地址。

# 客户端截图

## 登录

![1](https://github.com/user-attachments/assets/0cccc2d1-79c8-43fd-844f-9254edbe6e7e)

## 聊天

![2](https://github.com/user-attachments/assets/0d3d85be-1342-4bd2-b4f1-614c93a8a0a5)

## 群聊

![3](https://github.com/user-attachments/assets/6aa0a021-92b7-46fe-8aea-5487d97362a7)

## 通讯列表

![4](https://github.com/user-attachments/assets/b1f4ff7b-8ecc-4baa-b38d-bbf7099dec19)

## 朋友圈

![5](https://github.com/user-attachments/assets/b30432b9-904a-432c-bb85-03f8560ddc3b)

## 通知

![6](https://github.com/user-attachments/assets/b7eb922d-9aec-4607-b004-6921e178facb)

## 系统设置

![7](https://github.com/user-attachments/assets/714144de-92bc-42f4-89bb-2a2696884693)

## 其他

![8](https://github.com/user-attachments/assets/43555b11-0a8b-4850-b6fa-0d4d099bc34a)

# 管理端截图

## 登录

![9](https://github.com/user-attachments/assets/2fead35c-1176-4031-8c5d-d94d42af7bdb)

## 首页

![10](https://github.com/user-attachments/assets/cbca1555-53a0-4107-90ea-25e7f9f441e4)

## 在线聊天

![11](https://github.com/user-attachments/assets/acb99729-48d4-47cf-b837-9fcac7221c5d)

## 用户管理

![12](https://github.com/user-attachments/assets/afa3b6de-54f9-4927-9fd5-f5e97dcb8884)

## 系统通知管理

![13](https://github.com/user-attachments/assets/fff0cb8e-0339-4df7-9935-bc552b788e9e)

## 第三方会话管理

![14](https://github.com/user-attachments/assets/38de0173-b2d0-4afb-bba0-dab06aaad920)

# Docker部署

## 服务部署

基于`docker-compose`进行部署。将项目下的`/deploy/compose`目录，拷贝到目标服务器上，注意修改目录下`.env`
和`broker.conf`内的配置。修改完成后运行`docker-compose up -d`命令。

## 数据库初始化

连接数据库上面部署的数据库，执行初始化sql语句`linyu.sql`（位于项目目录下）。

## whisper模型上传

语音转文字基于`faster-whisper`
实现，需要上传whisper模型，将faster-whisper-small（下载地址 `https://huggingface.co/Systran/faster-whisper-small`
）模型上传到目标服务器`/linyu/whisper/model/`目录下。

# 结语

![admire](https://github.com/user-attachments/assets/7e77ac87-a913-4f87-8783-a1d313297a05)


# 参考资料

* any list
{:toc}