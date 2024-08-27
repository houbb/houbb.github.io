---
layout: post
title: 文件存储服务系统（File Storage Service System）-01-设计与实现
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, file]
published: true
---


# 文件服务系列

[文件存储服务系统（File Storage Service System）-00-文件服务器是什么？为什么需要？](https://houbb.github.io/2016/12/31/file-system-00-overview)

[文件存储服务系统（File Storage Service System）-01-常见的文件协议介绍](https://houbb.github.io/2016/12/31/file-system-01-protocol-overview)

[文件系统 FTP Ubuntu 安装入门介绍](https://houbb.github.io/2016/12/31/file-system-02-protocol-ftp-intro)

[文件存储服务系统（File Storage Service System）-02-SFTP 协议介绍](https://houbb.github.io/2016/12/31/file-system-02-protocol-sftp-intro)

[分布式文件服务系统（Distributed File System, DFS）-00-分布式文件服务系统是什么？](https://houbb.github.io/2016/12/31/file-system-distributed-00-overview)

[分布式存储系统-01-minio 入门介绍](https://houbb.github.io/2016/12/31/file-system-distributed-01-minio-overview)

[分布式存储系统-02-开源的分布式文件系统 Fastdfs 安装入门介绍](https://houbb.github.io/2016/12/31/file-system-distributed-02-fastdfs-intro)

[分布式存储系统-03-ceph 一个可扩展的分布式存储系统介绍](https://houbb.github.io/2016/12/31/file-system-distributed-03-ceph-intro)

[分布式存储系统-04-GlusterFS 是一个基于对象的开源分布式文件系统，适用于云存储和媒体流等场景](https://houbb.github.io/2016/12/31/file-system-distributed-04-glusterfs-intro)

[分布式存储系统-05-Lustre 是一个高性能的分布式文件系统，主要用于大型超级计算机集群](https://houbb.github.io/2016/12/31/file-system-distributed-05-lustre-intro)

[分布式存储系统-06-MooseFS 是一个开源的分布式文件系统，设计用于提供高可靠性和扩展性](https://houbb.github.io/2016/12/31/file-system-distributed-06-moosefs-intro)

[分布式存储系统-07-OpenAFS 是 Andrew File System 的开源实现，是一个分布式网络文件系统](https://houbb.github.io/2016/12/31/file-system-distributed-07-openafs-intro)

[分布式存储系统-08-OrangeFS 是 PVFS 的下一代版本，是一个面向高性能计算的开源并行文件系统](https://houbb.github.io/2016/12/31/file-system-distributed-08-orangefs-intro)

# 功能

文件服务器的核心功能就两个：「文件上传」和「文件下载」！其中上传可能需要支持断点续传、分片上传。

而下载可能需要进行下载保护，例如非指定客户端无法下载。

除了这两个核心功能，一般都会有一个额外功能，就是「转换」！转换包括：

图片规格转换：一张图片需要切分多个不同的尺寸
添加水印：图片或视频需要添加水印
格式转换：
文件格式转换：office转pdf，pdf转word，pdf转图片，office转图片等
视频格式转换：mp4转m3u8，码率转换等

除了上面的业务功能外，还包括如下非功能性约束：

安全性：是否需要认证后才能上传或下载
伸缩性：是否支持扩容，提高访问量
可用性：作为基础服务，可用性不低于4个9
可配置性：对于转换方式、上传下载方式等内容需要提供可配置能力
扩展性：能方便的进行功能扩展，例如对转换方式的扩展

# 初步流程

上传流程

![upload](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/062f987f9ce5456288a098cfee6868e2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

下载流程

![download](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3bc39a51bd9246869e6d3a42615cad94~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

# 初步模块划分

根据功能，可划分如下功能模块：

上传模块（核心模块）：处理文件上传
下载模块（核心模块）：处理文件下载
转换模块：处理文件类型转换
配置模块：对文件服务进行配置
安全模块：对文件服务进行安全保护

# 架构设计

首先通过分层架构对模块进行一个大致的划分，按照领域设计的分层方式：

应用层：配置模块，安全模块

领域层：上传模块，下载模块，转换模块

![架构设计](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/343b0857b4aa4d6aa663594282bfbedc~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

从上面的流程可以看到「上传模块」对「转换模块」有一定的依赖，像下面这样：

上传依赖转换

但是，「上传模块」是核心模块，而「转换模块」是非核心模块。

核心模块的功能相对稳定，非核心模块的功能相对不稳定。

**让稳定的模块去依赖不稳定的模块，会导致稳定的模块也不稳定，所以需要对依赖进行「倒置」**。

![翻转](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e528b37b04304153af0e710df09428c2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

「依赖倒置」解决了模块依赖问题。但是转换是个很耗时的过程，例如用户上传视频，在不转换的情况下，只要上传完成就可以得到响应，但是如果转换的话，可能就需要双倍甚至三四倍的时间才能得到反馈，体验非常的不好。

且一般上传和观看的时效性并不需要即时性，所以转换应该是个异步的过程。

异步执行的方式很多，比如基于事件，自定义线程等。这里通过事件的方式来进行处理。（领域事件可参考领域设计：领域事件）

![转换](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d78e35966cd44031bffd96d5626e42ff~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

文件上传会创建UploadEvent，UploadListener监听UploadEvent事件，当监听到了UploadEvent，则执行转换。

转换流程异步化后，如何告知客户端转换结果呢？

有几种方案：

上传完成后，文件服务返回一个token，后续业务系统通过token来获取转换后的URL。此方案需要业务系统请求两次。
文件服务转换完成后入库，业务系统从数据库获取。此方案也需要业务系统请求两次，且对不同的业务需要有不同的实现。
文件服务转换完成后回调业务系统。此方案可能需要实现不同的业务回调接口。
文件服务器返回一个事先生成的URL，在文件转换完成时返回特定状态码，在转换完成后，返回文件。对于某些场景无法事先生成URL，例如office转图片，一个文档会转成多张图片，转换前无法得知图片URL

目前主流做法是第一种，不过为保证文件服务器的适用性，需要能支持多种方案。故对转换后的通知也基于事件进行处理，转换后创建对应事件，关注该事件的对象来做出对应的处理。一个可能处理流程如下：

上传完成后，文件服务器返回原始文件地址以及token。业务系统在redis针对此token创建监听
文件服务器在转换完成后创建转换事件，转换事件监听对象监听到此事件后，向redis发送通知
业务系统接收到通知，更新URL

另外对于下载来说，实际直接通过Nginx这样的web服务器就可以了，所以下载模块可以直接独立。
对于配置模块来说，配置可以分为两种：

文件服务自身需要的配置信息。例如：上传文件目录。这属于「静态配置」
各个调用系统需要的各自的配置。例如：某些系统需要切100*100的图，而有些系统需要切200*200的图。这属于「动态配置」

「静态配置」可以使用属性文件进行配置即可。

「动态配置」需要根据不同的系统进行相应的配置，故针对图片和视频等资源配置，创建对应的配置类，根据参数通过Respository动态构建。
整体结构如下：

![struct](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2bb90c7494146a8a798e827198fef33~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

# 流程调整

基于上面的设计，流程需要进行相应的调整。

上传流程

![上传流程](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d47ba94874640c3872cb61a6e2841f2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

下载流程不变，多了一个获取转换后文件链接的流程：

![下载流程](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef7830be2e614aedbf8b1a8ba9fa780a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

# 模块调整

相应的模块也有调整，新增了一个消息模块，用于处理消息的发送与监听。

这个消息属于领域事件，所以也放在领域层。

![模块调整](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52dea0bc7f284548bfce77e2631775e8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

# 架构验证

业务流程验证

## 上传流程：

客户端上传文件
通过「安全模块」验证。如果验证失败，返回验证失败信息
如果验证成功，通过「上传模块」上传文件
「上传模块」构建「上传事件」，添加到消息总线中
上传完成，返回用户消息。消息包含原始文件URL，如果需要转换的话，则包含转换对应的token
「转换模块」监听到「上传事件」，根据「配置模块」的配置，进行转换
「转换模块」构建转换消息，添加到消息总线中
对应「监听模块」监听到转换消息，进行后续处理。例如信息入库或通知业务系统

## 下载流程：

客户端下载文件
通过「安全模块」验证。如果验证失败，返回验证失败信息
如果验证成功，通过「下载模块」下载文件

## 获取真实链接流程：

客户端携带token获取真实链接

「下载模块」根据token查询文件是否转换成功

如果转换成功，则返回转换后的URL

否则返回未转换成功状态码

# 非功能性约束验证

安全性：由「安全模块」保障

伸缩性：对于下载来说，可通过CDN处理。对于上传来说，文件服务本身没有状态，可方便扩容

可用性：支持多点部署，常用故障转移手段都可使用

可配置性：由「配置模块」保障

扩展性：基于事件的处理方式，通过添加事件响应对象来进行功能扩展

例如，现在要新增一个「秒传功能」，即对于服务器已经存在的文件，不再进行上传操作，直接返回文件URL！那么需要做如下扩展：

新增存储逻辑，用于保存文件地址与文件hash的关系

新增一个检查文件hash的接口，如果hash已存在，返回文件URL，否则返回false

添加一个UploadEvent同步监听事件，当文件上传成功后，对文件取hash，将数据保存到上面创建的表中

# 技术选型

公司核心技术语言为Java，故优先选择使用Java语言开发

框架基于SpringBoot，基于如下考虑：

SpringBoot是目前JavaEE开发事实上的标准框架

可独立部署，亦可以升级到基于SpringCloud的微服务，方便向微服务架构迁移

配置信息决定不使用数据库，而使用属性文件配置，基于如下考量：

静态配置配置后基本不需要修改

动态配置修改几率也不大，如果需要调整，SpringBoot本身支持实时刷新配置

微服务部署，可结合分布式配置服务器实现动态配置

不需要部署数据库，不需要设计表结构，节省部署与设计时间。但是考虑到扩展性，配置逻辑需要抽象，以支持其他持久化方式

转换结果信息使用文件形式存储，基于如下考量：

结果信息是一次读取内容，且频率不高

本身就是文件服务，使用文件存储也合理

不需要部署数据库，不需要设计表结构，节省部署与设计时间

# 实现

![实现](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c8797ba242248c8af42040f22ab0351~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

# 事件实现

事件串联了整个上传流程：

文件上传，触发UploadEvent

UploadListener监听到UploadEvent，委托各个Converter进行文件处理

转换完成后触发ConvertEvent

ConvertListener监听到ConvertEvent后，进行转换后的信息处理

由于目前大部分是内部事件，故使用Spring事件来处理，代码逻辑如下：

```java
// 配置线程池，Spring默认线程池没有设置大小，如果出现阻塞，可能会出现OOM@Bean("eventThread")
 public TaskExecutor taskExecutor() {
 ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
 // 设置核心线程数，转换是个很耗时的过程，所以直接排队执行
 executor.setCorePoolSize(1);
 // 设置最大线程数
 executor.setMaxPoolSize(1);
 // 设置队列容量
 executor.setQueueCapacity(100);
 // 设置线程活跃时间（秒）
 executor.setKeepAliveSeconds(60);
 // 设置默认线程名称
 executor.setThreadNamePrefix("eventThread-");
 // 设置拒绝策略
 executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
 // 等待所有任务结束后再关闭线程池
 executor.setWaitForTasksToCompleteOnShutdown(true);
 return executor;
 }
/**
 * 内部消息总线
 */@Service@EnableAsyncpublic class EventBus implements ApplicationEventPublisherAware {
 private ApplicationEventPublisher publisher;
 @Override
 public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
 this.publisher = applicationEventPublisher;
 }
 public void add(ApplicationEvent event) {
 publisher.publishEvent(event);
 }
}
// 事件类public class UploadEvent extends ApplicationEvent {
 public UploadEvent(Object source) {
 super(source);
 }
}
public class ConvertEvent extends ApplicationEvent {
 public ConvertEvent(Object source) {
 super(source);
 }
}
// 监听类@Componentpublic class UploadListener {
 @EventListener
 @Async("eventThread") // 使用自定义的线程池
 public void process(UploadEvent event) {
 }
}
@Componentpublic class ConvertListener {
 @EventListener
 @Async("eventThread")
 public void process(ConvertEvent event) {
 }
}
```

# 配置管理实现

为了提高文件服务器的灵活性，对于转换逻辑可进行配置。

如果没有进行相应的配置，则不会进行对应的处理。

下面的四个类是对各个文件类型的配置：

ImageConfig：切图大小
OfficeConfig：转换类型，是否获取页码
PdfConfig：转换类型，是否获取页码
VideoConfig：转换类型，是否获取长度，是否取帧

对应的Respository是对其保存与恢复的仓储类：

ImageConfigRespository
OfficeConfigRespository
PdfConfigRespository
VideoConfigRespository

此处基于属性配置来实现（原因请见「技术选型」）！以VideoConfigRespository为例：

```java
@Configuration@ConfigurationProperties(prefix = "fileupload.config")
public class VideoConfigRespository {
 private List<VideoConfig> videoConfigList;
 /**
 * 根据分组(系统)找到对应的视频配置
 *
 * @param group
 * @return
 */
 public List<VideoConfig> find(String group) {
 if (videoConfigList == null) {
 return new ArrayList<>();
 } else {
 return videoConfigList.stream().filter(it -> it.getGroup().equals(group)).collect(Collectors.toList());
 }
 }
 public List<VideoConfig> getVideoConfigList() {
 return videoConfigList;
 }
 public void setVideoConfigList(List<VideoConfig> videoConfigList) {
 this.videoConfigList = videoConfigList;
 }
}
```

通过Spring的ConfigurationProperties注解，将属性文件中的属性配置到videoConfigList中。

```
# 视频配置
fileupload.config.videoConfigList[0].group=GROUP1 
# 默认配置
fileupload.config.videoConfigList[1].group=GROUP2
fileupload.config.videoConfigList[1].type=webm 
 # 转换为webm
fileupload.config.videoConfigList[1].frameSecondList[0]=3 # 取第3秒的图片
```

# 转换结果实现

转换结果通过ConvertResult和ConvertFileInfo表示：

ConvertResult中包含了源文件信息，以及多个转换结果。ConvertFileInfo表示一个转换结果

ConvertResult是Entity而ConvertFileInfo是VO

ConvertResult与ConvertFileInfo是一对多的关系

两者构成聚合，其中ConvertResult是聚合根(关于聚合与聚合根请参考领域设计：聚合与聚合根)

ConvertResultRespository是这个聚合的仓储，用于保存与恢复此聚合。

此处没有使用数据库，而是直接使用的文本形式保存（原因见「技术选型」）。

```java
@Componentpublic class ConvertResultRespository {
 ......
 /**
 * 保存转换结果
 *
 * @param result
 * @return
 */
 public void save(ConvertResult result) {
 Path savePath = Paths.get(tokenPath, result.getToken());
 try {
 if(!Files.exists(savePath.getParent())) {
 Files.createDirectories(savePath.getParent());
 }
 Files.write(savePath, gson.toJson(result).getBytes(UTF8_CHARSET));
 } catch (IOException e) {
 logger.error("save ConvertResult[{}} error!", result, e);
 }
 }
 /**
 * 查找转换结果
 *
 * @param token
 * @return
 */
 public ConvertResult find(String token) {
 Path findPath = Paths.get(tokenPath, token);
 try {
 if (Files.exists(findPath)) {
 String result = new String(Files.readAllBytes(findPath), UTF8_CHARSET);
 return gson.fromJson(result, ConvertResult.class);
 }
 } catch (IOException e) {
 logger.error("find ConvertResult by token[{}} error!", token, e);
 }
 return null;
 }
}
```

# 转换服务实现

转换服务根据配置委托对应的工具类来进行相应的操作（代码略）：

使用ffmpeg转换视频
使用pdfbox转换pdf
使用libreoffice转换office

## 安全实现

安全通过Spring拦截器实现
按需求增加对应拦截即可

## 使用

提供两个接口：

```java
/**
* 获取转换后的信息
*/@ResponseBody@GetMapping(value = "/realUrl/{token}")
public ResponseEntity realUrl(@PathVariable String token) {
 .....
}
/**
* 上传文件
*/@ResponseBody@PostMapping(value = {"/partupload/{group}"})
public ResponseEntity upload(HttpServletRequest request, @PathVariable String group) {
 .....
}
```

通过upload接口上传文件，支持分片上传


上传完成后，会返回上传结果，结构如下：

```json
{
"code": 1,
"message": "maps.mp4",
"token": "key_286400710002612",
"group": "GROUP1",
"fileType": "VIDEO",
"filePath": "www.abc.com/15561725229…"
}
```


其中的filePath是原始文件路径


通过token，使用realUrl接口可以获取转换后的文件信息，结构如下：

```json
{
"token": "key_282816586380196",
"group": "SHILU",
"fileType": "IMAGE",
"filePath": "www.abc.com/SHILU/1/155…",
"convertFileInfoList": [
{
"fileLength": 0,
"fileType": "IMAGE",
"filePath": null,
"imgPaths": [
"www.abc.com/SHILU/1/155…"
]
}
]
}
```

## 配置

```properties
## 对外提供服务的域名
fileupload.server.name=http://www.abc.com## libreoffice home路径
office.home=/snap/libreoffice/115/lib/libreoffice
# 文件上传保存路径
fileupload.upload.root=/home/files
# 文件服务器动态配置# 图片配置，切100*200的图fileupload.config.imageConfigList[0].group=group1
fileupload.config.imageConfigList[0].width=100
fileupload.config.imageConfigList[0].height=200
# 视频配置
# 默认配置，转换m3u8
fileupload.config.videoConfigList[0].group=group1
# 转换webm，切第3秒的图
fileupload.config.videoConfigList[1].group=group2
fileupload.config.videoConfigList[1].type=webm
fileupload.config.videoConfigList[1].frameSecondList[0]=3
# office配置，默认转png
fileupload.config.officeConfigList[0].group=group1
# 转PDF
fileupload.config.officeConfigList[0].type=PDF
# pdf配置，转png
fileupload.config.pdfConfigList[0].group=group1
# 上传文件大小，当前端不支持分片上传时设置
spring.servlet.multipart.max-file-size=1024MB
spring.servlet.multipart.max-request-size=1024MB
```

# 总结

本文给出了一个文件服务相对完整的架构设计与实现过程。

整个架构设计流程如下：

- 梳理业务功能

- 梳理用例流程

- 基于业务功能，进行初步的模块划分

- 结合用例流程进行架构设计，期间可能反过来对模块及流程进行调整

- 对架构进行验证

- 业务流程验证：将用例套用到架构中进行验证

- 非功能性约束验证：模拟非功能性约束场景进行验证

- 技术选型（架构设计是与技术无关的）

- 遵循架构设计实现代码，测试（可能调整架构）

- 完整流程验证，使用说明

整个过程对各个约束做出了对应的决策，并进行了验证。

代码结构与架构设计完全匹配。从架构设计图依图索骥即可理解代码逻辑。

# 参考资料

https://juejin.cn/post/6897893111859511304

* any list
{:toc}