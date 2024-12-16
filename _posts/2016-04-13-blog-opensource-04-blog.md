---
layout: post
title: blog opensource 开源博客-04-Blog 基于SpringBoot搭建的开源个人博客系统，模板引擎使用thymeleaf。项目后台部分采用前后端分离模式开发。前台使用 vue 和 element完成。 
date: 2016-04-13 23:20:27 +0800
categories: [UI]
tags: [hexo, blog, blog-engine, opensource]
published: true
---

# 开源地址

https://github.com/iszhouhua/blog


# 简介

基于[SpringBoot](https://github.com/spring-projects/spring-boot)

搭建的开源个人博客系统，前台界面基于Hexo主题[hexo-theme-gal](https://github.com/ZEROKISEKI/hexo-theme-gal)

进行修改，管理后台界面基于[vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)进行修改。

技术栈：SpringBoot、Thymeleaf、MySQL、MyBatis-Plus、Lombok、Gson、caffeine、validation、Bootstrap、jQuery、FontAwesome、Jsoup……

博客运行效果示例：[https://www.iszhouhua.com](https://www.iszhouhua.com)

## Docker

对于不想自己配置代码运行环境（Java和Node）的同学，可以使用此方式一键运行，部署属于自己的博客。

请先参照 [⚙️配置文件](src/main/resources/application.yml) 相关说明，配置好你自己的 `application.yml` 文件，然后使用以下命令启动 docker：

```shell
# 拉取镜像
docker pull iszhouhua/blog:latest
# 运行镜像
docker run -d --name blog -p 8080:8080 -v $(pwd)/logs:/app/logs -v $(pwd)/upload:/app/upload -v $(pwd)/application.yml:/config/application.yml iszhouhua/blog:latest
```

如果镜像拉取不下来，可以从阿里云镜像仓库中进行拉取，将`iszhouhua/blog`改为`registry.cn-shenzhen.aliyuncs.com/iszhouhua/blog`即可

注意：在 Windows 终端下需要将配置文件路径 `$(pwd)` 替换为绝对路径。

挂载目录的解释见[docker部署](#docker部署)

## 快速开始

1. 下载本项目，并使用IDE打开
2. 在mysql中新建数据库`blog`
   > 现在运行项目会自动运行SQL脚本建表和插入初始数据
3. 修改`application-dev.yml`中的数据库配置信息
4. 运行`BlogApplication.java`，启动项目
5. 浏览器访问`http://127.0.0.1:8080/`
   > 使用 Idea，Eclipse 等IDE运行需要安装Lombok插件，JDK版本要求1.8+


### 管理管理

管理后台采用前后端分离的方式实现，源码位于[vue](vue)文件夹下，如何运行方式见[vue/README.md](vue/README.md)

部署

### jar部署

配置好`application-prod.yml`中的配置信息，然后打包：

```bash
mvn clean package -Dmaven.test.skip=true
```

将打包好的`blog.jar`和`blog.sh`放到同一文件夹下，执行命令：

```bash
# 使脚本具有执行权限
chmod +x ./blog.sh
# 启动项目
./blog.sh start
# 或者直接使用sh命令运行脚本
sh blog.sh start
```

### tomcat部署

修改`application.yml`中`spring.profiles.active`为`prod`，并配置好`application-prod.yml`中的配置信息。

直接修改`pom.xml`中的打包方式为war后进行打包，或直接运行命令：

```bash
clean package war:war -Dmaven.test.skip=true
```

然后将打包好的`blog.war`丢进tomcat中运行即可！

### docker部署

配置好`application-prod.yml`中的配置信息，然后执行`build-docker.sh`：

```bash
# docker打包
sh build-docker.sh
# 新建挂载目录
mkdir logs upload
# 运行项目
docker run -d --name blog -p 8080:8080 -v $(pwd)/logs:/app/logs -v $(pwd)/upload:/app/upload -v $(pwd)/application.yml:/config/application.yml blog
```

- -v $(pwd)/application.yml:/config/application.yml: 挂载配置文件，`$(pwd)/application.yml`为你的配置文件所在目录
- -v $(pwd)/logs:/app/logs: 挂载日志文件，不关心日志可不进行挂载
- -v $(pwd)/upload:/app/upload 上传图片挂载，非本地存储无需挂载

> 注：build-docker.sh脚本会自动将vue代码也编译进docker镜像中，无需单独处理vue的内容

## 界面展示

![1557279251039](https://github.com/iszhouhua/blog/raw/master/images/20190508093436.png?raw=true)

![20190508095012](https://github.com/iszhouhua/blog/raw/master/images/20190508095012.png?raw=true)

![20190508095714](https://github.com/iszhouhua/blog/raw/master/images/20190508095714.png?raw=true)

![20190508101138](https://github.com/iszhouhua/blog/raw/master/images/20190508101138.png?raw=true)

![20190508101254](https://github.com/iszhouhua/blog/raw/master/images/20190508101254.png?raw=true)

![20190508101400](https://github.com/iszhouhua/blog/raw/master/images/20190508101400.png?raw=true)

![20190508101440](https://github.com/iszhouhua/blog/raw/master/images/20190508101440.png?raw=true)

![20190508101544](https://github.com/iszhouhua/blog/raw/master/images/20190508101544.png?raw=true)

![20190508101622](https://github.com/iszhouhua/blog/raw/master/images/20190508101622.png?raw=true)


# 参考资料

https://github.com/saysky/ForestBlog/blob/master/README.md

* any list
{:toc}