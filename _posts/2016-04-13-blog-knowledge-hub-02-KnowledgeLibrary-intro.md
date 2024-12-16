---
layout: post
title: blog 知识库-02-KnowledgeLibrary 知识库管理系统——大学时期比赛（中国软件杯）项目
date: 2016-04-13 23:20:27 +0800
categories: [UI]
tags: [hexo, blog, blog-engine, opensource]
published: true
---

## lib  知识库管理系统 

[KnowledgeLibrary](https://github.com/yuyufeng1994/KnowledgeLibrary)是我大三暑假（2016年）参加第五届中国软件杯项目的源码。

由三人团队完成（Yu yufeng\Zhou changqin\Liu chenzhe）

此作品获得了本科组*全国二等奖*

## SOKLIB知识库管理系统功能总览  

## 功能名称	
  
>文件集中上传：	系统支持单文件上传以及批量上传，系统支持zip、rar格式的压缩包导入。 亮点创新 
多格式文件在线预览	用户可以对所有公共文件进行浏览，支持office，pdf格式以及常见图片格式，音频格式，音频播放以流媒体服务搭载实现边下边播的用户体验。  
文档链接：	系统支持用户对喜爱的文档进行收藏及发送到常用文档。  
文档关联：	手动关联：用户可以手动对文件关联相关的文件。  
自动关联：  系统可以自动关联类似文档   
规则使用：	系统对用户上传的过大文件（视频）进行压缩来加快用户在线预览打开的速度，对文档自动提取简介和关键词。对视频、office等文件提取缩略图。  
系统中可增加词典，增强分词效果  
智能检索：	系统包含全文检索、多重条件检索、关键词检索。同时还支持对检索结果再次附加条件检索。  
用户管理：	普通用户可以对自己的文件夹、收藏夹管理。用户可以分享自己的文档到公共资源库中。  
管理员可以对系统中的用户管理、公共文件审核，系统分类的管理，一些数据的统计和日志记录的查看  
用户评论：	用户可以对文档进行评论  
文本处理：	能够支持中文，人名、组织机构名、时间、地名、目标类型、目标名称等实体识别，能对常见文本格式抽取。  
文档推荐：	系统使用协同过滤算法推荐用户可能会查看的文档  
知识图谱：	系统中的知识以树结构存放，可以通过知识图谱快速到达你要找的知识点。对于每个节点都有详细的介绍。  
智能提取：	系统结合PageRank、TF-IDF等算法组织知识点在我们的库中，用户可以通过半自动化的操作，去提取归纳知识，产生新的文档。  
信息统计：	系统对文档的数据进行统计分析，以图表的方式呈现。  
新建文档：	用户可以使用在线多功能编辑器新建文档  

## 使用技术

通过maven构建，使用git版本控制和团队合作，采用springmvc+mybatis框架，集成Lucene全文检索，openoffice转化office文档，ffmpeg处理视频文件，red5搭建流媒体服务，基于pageRank、TF-IDF算法提取处理知识点，webmagic爬取数据，itextpdf、poi处理office等。

## 一些效果图
![这里写图片描述](https://img-blog.csdn.net/2018032808312038?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083133507?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083140794?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083146834?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083153317?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083159259?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083206801?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083212647?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083219460?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/2018032808322799?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083234339?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/2018032808324141?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
![这里写图片描述](https://img-blog.csdn.net/20180328083247910?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4ODYwNjUz/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)


# 参考资料

https://github.com/yuyufeng1994/KnowledgeLibrary

* any list
{:toc}