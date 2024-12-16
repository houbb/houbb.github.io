---
layout: post
title: blog opensource 开源博客-01-ForestBlog 
date: 2016-04-13 23:20:27 +0800
categories: [UI]
tags: [hexo, blog, blog-engine, opensource]
published: true
---

# 开源地址

https://github.com/saysky/ForestBlog

# ForestBlog

# 关于项目

该博客是基于SSM实现的个人博客系统，适合初学SSM和个人博客制作的同学学习。

博主已写了一篇该项目的毕业论文和录制了2个小时的代码讲解可以供大家学习，需要的可以联系博主，微信847064370。

主要涉及技术包括的包括 Maven、Spring、SpringMVC、MyBatis、JSP、MySQL等。 
详细介绍：[https://liuyanzhao.com/6347.html](https://liuyanzhao.com/6347.html) 
预览地址：[http://forestblog.liuyanzhao.com](http://forestblog.liuyanzhao.com) 

前台效果图 

![image](https://github.com/saysky/ForestBlog/blob/master/uploads/home.png)

后台效果图 

![image](https://github.com/saysky/ForestBlog/blob/master/uploads/home.png)

后台地址：/admin 或者 /login 

## 使用注意
#### 1.开发工具的选择
请使用 IntelliJ IDEA, 尽量不要用 Eclipse/MyEclipse，使用前者项目起不来我可以帮忙解决，后者直接忽视(理论上可以起)

#### 2.确保你安装了 Maven
从官网下载 Maven，并配置阿里云镜像，IDEA 或 Eclipse 里需要设置 Maven 的 settings.xml 。

#### 3.请安装 Lombok 插件
代码中多次使用 `@Data` 注解，请确保你的 IDE 安装了 `Lombok` 插件，否则找不到 getter/setter 方法。如果你的 lombok 无效，可能是 pom.xml 里的 lombok 版本和你安装的lombok 版本相差较大。
无论是 Eclipse 还是 IDEA 都需要安装 lombok。

#### 4.项目首页没有文件夹名称
确保 tomcat 配置中 `application context` 是 /，而不是 /ForestBlog。这是导致你们首页css样式全无的原因，因为引用css路径都是 /xxx/xxx.css
![image](https://github.com/saysky/ForestBlog/blob/master/uploads/tomcat.png)

#### 1、克隆项目  
克隆或者下载项目到本地，解压，主要分为三个部分：ForestBlog、uploads 和 forest_blog.sql 
ForestBlog: 完整项目源码, 可以使用 IDEA 导入或者打开，记得要导入里面那个 ForestBlog项目，即 pom.xml所在的父目录。  
uploads: 上传图片的目录，与源码分离开来，可以放到物理磁盘某一目录，如D盘某目录，后面会讲 
forest_blog.sql: 数据库文件，请先创建数据库，然后以运行sql文件方式导入 

#### 2.使用 IDEA 导入Maven项目
确保你安装了 Maven，导入项目时，选择已存在的项目，类型是 Maven 项目。
等待Maven下载完依赖，或者手动点击刷新，如果无法下载请检查 Maven 配置和切换网络，多次尝试。 
导入完成后，如果出现Java类里红色报错，多半是 Lombok 插件没有安装。


#### 3、 导入数据库   
新建数据库 `forest_blog`，导入数据库（即forest_blog.sql）。注意，数据库的编码和排序规则是utf-8和utf-8_general_ci  


#### 4、修改项目中的数据库连接信息   
修改 `db.properties` 文件，该文件很容易找到，在 src/main/resources 中
里面有 MySQL, 请确保已安装和启动 MySQL 
注意修改数据库地址、表名、用户名和密码。
否则项目无法启动

 
#### 5、配置 tomcat 和 uploads 目录   
该项目是 SSM 项目，没有启动类，需要通过 tomcat 来运行。无论是 Eclipse 还是 IDEA 都很容易。
这里主要说一下上传目录映射问题：
该项目中，文件上传是传到本地，且和项目文件夹不在一起，就是说是源码和上传目录是分离的。 
比如我们把 uploads 目录放到 E盘根目录(建议直接把我的那个uploads文件夹拷贝到D盘根目录)，比如有一张图片路径是 `D:/uploads/2017/10/avatar.jpg`, 我们想在项目中以 `http://loclahost:8080/uploads/2017/10/avatar.jpg ` 方式访问，需要以下两步：

1、 修改 UploadFileController.java 中上传路径，需要修改 rootPath 为你指定的 uploads 目录，如 `String rootPath ="D:/uploads/";` 
如果不修改，会出现无法上传失败；

2、为 tomcat 设置 uploads 映射。
-  IDEA 操作如下：
在 tomcat 配置中 Deployment 里面添加，如图
![image](uploads/tomcat.png)
![image](uploads/tomcat2.png)

- Eclispe 操作如下：
在 Server/server.xml 的 `</Host>` 前面添加
```
<Context path="/" docBase="项目路径，不需要改" debug="0" reloadable="true" />
<Context path="/uploads" docBase="D:/uploads/" debug="0" reloadable="true" />
```
- Linux 服务器环境部署

在 tomcat/conf/server.xml 的 Host 标签内添加如下代码 
```
<Context path="/" docBase="项目路径如 /www/server/tomcat/webapps/ForestBlog" debug="0" reloadable="true" />
<Context path="/uploads" docBase="/www/uploads" debug="0" reloadable="true" />
```

如果不修改，会出现uploads的图片无法加载，无法显示上传目录的图片

 
## 下载地址：

Github地址：https://github.com/saysky/ForestBlog

（如果可以帮忙点一次Star和Fork）


# 参考资料

https://github.com/saysky/ForestBlog/blob/master/README.md

* any list
{:toc}