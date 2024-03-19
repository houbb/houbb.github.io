---
layout: post
title: Docker learn-23-仓库进阶
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# 仓库进阶

[推送到中央仓库](https://houbb.github.io/2019/12/18/docker-learn-22-image-push-to-hub)

[搭建私有仓库](https://houbb.github.io/2019/12/18/docker-learn-23-private-registry)

# 再看 Docker hub

## 设计篇

docker-registry是Docker的镜像存储服务端。或者这么说，Docker干的事情就是把整个应用、操作系统、配置打包成一个静态的镜像，这个镜像可以快速的启动和停止。

但这种能力对单个人是没有多大意义的，我们需要有个地方把镜像存下来，然后用一个url分享给其他人。

如果是你，你会怎么设计？

开一个公共的FTP让大家存镜像然后分享？

这是个好主意，不过Docker的镜像有这么一个设定，就是一个镜像是由多层组成的，如果每次传输全量文件，对客户端、服务端、用户启动都造成时间和流量的浪费。

### 需求一

远程存储服务，上传和下载需要智能的识别对面有没有这层，如果两边的层的uuid一致，已经有的话，就不传了。

简单的根据名字上传下载，对日常使用来说还不够方便，我们还需要一个Web界面，以支持登录、搜索、区分公共的镜像和私有的镜像等需求，这是用户的需求，不是客户端程序的需求。

### 需求二：Web界面，支持搜索

每个镜像层一般都有几十兆到几百兆的大小，可以想象，当很多用户都往一个地方上传时，单个服务器的存储容量是绝对支撑不住的，需要可以水平扩展的集群，但Web界面不能分开，客户端程序也不应该很麻烦的自己找去哪里下载。

### 需求三：支持水平扩展的集群存储

Docker Hub和docker-registry的分工如下：

Docker Hub负责管理集中的信息访问，包括：

1. 用户账户

2. 镜像的效验码

3. 公共和私人镜像仓库的区分

## Docker Hub有几个组件：

Web UI

Meta-data 元数据存储（附注、星级、公共库清单）

访问认证

token管理

## dokcer-registry有如下几个特性：

存储镜像、以及镜像层的家族谱系

没有用户账户数据

不知道用户的账户和安全性

把安全和认证委托给docker-hub来做，用token来保证传递安全

不需要重新发明轮子，支持多种存储后端

没有本地数据库

## 最后分析一下这个架构的优点

### 解耦合

Docker Hub是web-UI、用户认证、镜像元数据的集合，在这个方面，不同的组织有不同的做法，所以需要独立出来。

docker-registry是所有组织可以复用的部分，单纯用于镜像存储服务。

### 不重复造轮子

docker-registry自己去实现一套对象存储了吗？没有，因为在对象存储这个领域，已经有很多优秀的实现。

所以docker-registry是一个HTTP接口的服务，仅仅是在对象存储上包了一层镜像的家族谱系，而且底层支持多种对象存储。

### 水平扩展性

在简单使用场景下，docker-registry也支持本地文件系统存储，可以说是all-in-one的设计，开箱即用。

而当把这个场景扩展，用于大规模企业级的应用时，Docker Hub和docker-registry是1：n的关系，registry本身是一个无状态的服务，可以非常容易的水平扩展。

这也是设计者的狡猾之处，他把有状态的部分都抽离了，把存储这个最大的状态机制做成可以放在其他的对象存储上，这样在大规模使用场景下就不会有性能的问题，也不会有单点问题。

任何一个registry挂掉都是可以忍受的，可以被轻易的恢复而没有副作用。

# 仓库服务

## 这是什么

Registry 是一个无状态，高度可扩展的服务器端应用程序，它存储并允许您分发Docker映像。 

该注册表是开放源代码的，根据许可的Apache许可。

## 为什么使用它

如果要执行以下操作，则应使用 Registry：

1. 严格控制图像的存储位置

2. 完全拥有您的图像分发管道

3. 将图像存储和分发紧密集成到您的内部开发工作流程中

## 内部架构

![image](https://user-images.githubusercontent.com/18375710/71792801-13d11d80-3075-11ea-9928-dc71b04a951b.png)

# 仓库简介

Registry 是一个存储和内容交付系统，其中包含命名的Docker映像，这些映像具有不同的标记版本。

## 标签

- 例子

The image `distribution/registry`, with tags 2.0 and 2.1.

## 交互

用户通过使用docker push和pull命令与 Registry 进行交互。

Example: `docker pull registry-1.docker.io/distribution/registry:2.1`.

## 存储

存储本身委托给驱动程序。 

默认的存储驱动程序是本地posix文件系统，适用于开发或小型部署。 

还支持其他基于云的存储驱动程序，例如S3，Microsoft Azure，OpenStack Swift和Aliyun OSS。 

希望使用其他存储后端的人们可以通过编写自己的驱动程序来实现Storage API。

由于保护对托管映像的访问至关重要，因此 Registry 本身支持TLS和基本身份验证。

Registry GitHub存储库包含有关高级身份验证和授权方法的其他信息。 

预期只有非常大的部署或公共部署才能以这种方式扩展注册表。

最后， Registry 附带了一个强大的通知系统，可以响应活动而调用webhooks，并且可以进行大量日志记录和报告，这对于希望收集度量标准的大型安装非常有用。

## 了解镜像命名

典型docker命令中使用的映像名称反映了它们的来源：

docker pull ubuntu指示docker从官方Docker Hub提取名为ubuntu的映像。 

这只是较长的 `docker pull docker.io/library/ubuntu` 命令的快捷方式

`docker pull myregistrydomain:port/foo/bar` 指示docker联系位于 `myregistrydomain:port` 的Registry以查找映像 foo/bar 您可以在官方Docker引擎文档中找到有关处理图像的各种Docker命令的更多信息。

## 用例

运行您自己的 Registry 是与CI/CD系统集成并对其进行补充的绝佳解决方案。 

在典型的工作流程中，对源版本控制系统的提交会触发CI系统上的构建，如果构建成功，则会将新映像推送到 Registry。 

然后，来自 Registry 的通知将触发在暂存环境上的部署，或通知其他系统新映像可用。

如果要在大型计算机群集上快速部署新映像，它也是必不可少的组件。

最后，这是在隔离的网络中分发图像的最佳方法。

## 要求

您绝对需要熟悉Docker，尤其是在推送和拉取映像方面。 

您必须了解守护程序和cli之间的区别，并且至少要掌握有关联网的基本概念。

同样，虽然启动注册表非常容易，但在生产环境中对其进行操作就需要操作技能，就像其他任何服务一样。 

您应该熟悉系统可用性和可伸缩性，日志记录和日志处理，系统监视以及安全性101。

对http和整个网络通信的深入了解以及对golang的熟悉对于高级操作或黑客入侵当然也很有用。

# 仓库 API

[HTTP API V2](https://docs.docker.com/registry/spec/api/?spm=a2c4g.11186623.2.7.77394c07yPxaHK)

[Docker Registry Token Authentication](https://docs.docker.com/registry/spec/auth/?spm=a2c4g.11186623.2.8.77394c07yPxaHK)

这里主要是通过 HTTP/HTTPS 对镜像进行管理，基于 [JWT 进行相关鉴权操作](https://houbb.github.io/2018/03/25/jwt)

## API清单

| Method	| Path	| Entity	| Description | 
|:--|:--|:--|:--|
| GET	    | /v2/	| Base	    | Check that the endpoint implements Docker Registry API V2. |
| GET	    | `/v2/<image>/tags/list`	| Tags	| Fetch the tags under the repository identified by name.| 
| GET	    | `/v2/<image>/manifests/<referevce>`	| Manifest	| Fetch the manifest identified by nameand referencewhere referencecan be a tag or digest. A HEADrequest can also be issued to this endpoint to obtain resource information without receiving all data. |
| PUT	    | `/v2/<image>/manifests/<referevce>` |	Manifest	| Put the manifest identified by nameand referencewhere referencecan be a tag or digest. |
| DELETE	| `/v2/<image>/manifests/<reference>` | Manifest	| Delete the manifest identified by nameand reference. Note that a manifest can only be deleted by digest. |
| GET	| `/v2/<image>/blobs/<digest>`	| Blob	| Retrieve the blob from the registry identified bydigest. A HEADrequest can also be issued to this endpoint to obtain resource information without receiving all data.|
| DELETE	| `/v2/<image>/blobs/<digest>`	| Blob	| Delete the blob identified by nameand digest |
| POST	| `/v2/<image>/blobs/uploads/`	| Initiate Blob Upload	| Initiate a resumable blob upload. If successful, an upload location will be provided to complete the upload. Optionally, if thedigest parameter is present, the request body will be used to complete the upload in a single request.|
| GET	| `/v2/<image>/blobs/uploads/<uuid>`	| Blob Upload	| Retrieve status of upload identified byuuid. The primary purpose of this endpoint is to resolve the current status of a resumable upload. |
| PATCH	| `/v2/<image>/blobs/uploads/<uuid>`	| Blob Upload	| Upload a chunk of data for the specified upload.|
| PUT	| `/v2/<image>/blobs/uploads/<uuid>`	| Blob Upload	| Complete the upload specified by uuid, optionally appending the body as the final chunk.|
| DELETE	| `/v2/<image>/blobs/uploads/<uuid>`	| Blob Upload	| Cancel outstanding upload processes, releasing associated resources. If this is not called, the unfinished uploads will eventually timeout.|
| GET	| /v2/_catalog | 	Catalog	| Retrieve a sorted, json list of repositories available in the registry.|

## 名词解释

### repository name(存储库名词)

存储库指在库中存储的镜像。

```
/project/redis:latest
```

- 语法：

经典存储库名称由2级路径构成，每级路径小于30个字符，V2的api不强制要求这样的格式。

每级路径名至少有一个小写字母或者数字，使用句号，破折号和下划线分割。

更严格来说，它必须符合正则表达式：`[a-z0-9]+[._-][a-z0-9]+)`，多级路径用`/`分隔，存储库名称总长度（包括/）不能超过256个字符。

### digest(摘要)

摘要是镜像每个层的唯一标示。

虽然算法允许使用任意算法，但是为了兼容性应该使用sha256。

例如sha256:6c3c624b58dbbcd3c0dd82b4c53f04194d1247c6eebdaab7c610cf7d66709b3b

```py
import hashlib
C = 'a small string'
B = hashlib.sha256(C)
D = 'sha256:' + B.hexdigest()
```

## 镜像pull过程

镜像由一个json清单和层叠文件组成，pull镜像的过程就是检索这两个组件的过程。

拉去镜像的第一步就是获取清单，清单由下面几个字段组成: registry:5000/v2/redis/manifests/latest(获取redis:latest清单文件)

| 字段	    | 描述 |
|:--|:--|
| name	    | 镜像名称 |
| tag	        | 镜像当前版本的tag |
| fsLayers	| 层描述列表(包括摘要) |
| signature	| 一个JWS签名，用来验证清单内容 |

当获取清单之后，客户端需要验证前面(signature)，以确保名称和fsLayers层是有效的。

确认后，客户端可以使用digest去下载各个fs层。在V2api中，层存储在blobs中已digest作为键值.

1、 首先拉取镜像清单(pulling an Image Manifest)

```  
$ HEAD /v2/<image/manifests/<reference>#检查镜像清单是否存在
$ GET /v2/<image>/manifests/<reference>#拉取镜像清单
```

提示：reference可是是tag或者是digest
  
2、 开始拉取每个层(pulling a Layer)

```
$ GET /v2/<image>/blobs/<digest>
```

提示：digest是镜像每个fsLayer层的唯一标识。存在于清单的fsLayers里面。

## Push 镜像过程

推送镜像和拉取镜像过程相反,先推各个层到registry仓库，然后上传清单.

### Pushing a Layer(上传层)

上传层分为2步,第一步使用post请求在registry仓库启动上传服务,
返回一个url，这个url用来上传数据和检查状态。

- 首先Existing Layers(检查层是否存在)

```
$ HEAD /v2/image/blobs/<digest>
```

若返回200 OK 则表示存在，不用上传

- 开始上传服务(Starting An Upload)

```
$POST /v2/image/blobs/uploads/
```

如果post请求返回202 accepted，一个url会在location字段返回.

```
202 Accepted
Location: /v2/\<image>/blobs/uploads/\<uuid>
Range: bytes=0-<offset>
Content-Length: 0
Docker-Upload-UUID: <uuid> # 可以用来查看上传状态和实现断点续传
```

- 开始上传层(Uploging the Layer)

1、上传进度(Upload Progress)

```
$ GET /v2/<image>/blobs/uploads/<uuid>
```

返回：

```
204 No Content
Location: /v2/<name>/blobs/uploads/<uuid>
Range: bytes=0-<offset>
Docker-Upload-UUID: <uuid>
```

2、整块上传(Monolithic Upload)

```
> PUT /v2/<name>/blobs/uploads/<uuid>?digest=\<digest>

> Content-Length: \<size of layer>

> Content-Type: application/octet-stream
```

3、分块上传(Chunked Upload)

```      
> PATCH /v2/\<name>/blobs/uploads/\<uuid>

> Content-Length: \<size of chunk>

> Content-Range: \<start of range>-\<end of range>

> Content-Type: application/octet-stream
<Layer Chunk Binary Data>
```

如果服务器不接受这个块，则返回:

```
416 Requested Range Not Satisfiable
Location: /v2/<name>/blobs/uploads/<uuid>
Range: 0-<last valid range>
Content-Length: 0
Docker-Upload-UUID: <uuid>
```

成功则返回：

```         
202 Accepted
Location: /v2/<name>/blobs/uploads/<uuid>
Range: bytes=0-<offset>
Content-Length: 0
Docker-Upload-UUID: <uuid>
```

- 上传完成(Completed Upload)

分块上传在最后一块上传完毕后，需要提交一个上传完成的请求

```
> PUT /v2/<name>/blob/uploads/<uuid>?digest=<digest>
> Content-Length: <size of chunk>
> Content-Range: <start of range>-<end of range>
> Content-Type: application/octet-stream
<Last Layer Chunk Binary Data>
```

返回

```
201 Created
Location: /v2/<name>/blobs/<digest>
Content-Length: 0
Docker-Content-Digest: <digest>
```

- 取消上传(Canceling an Upload)

这个请求执行后UUID将失效，当上传超时或者没有完成，客户端都应该发送这个请求。

```
DELETE /v2/image/blobs/uploads/<uuid>
```

- 交叉上传(Cross Repository Blob Mount)

可以把客户端有访问权限的已有存储库中的层挂载到当前存储库中

```
POST /v2/<name>/blobs/uploads/?mount=<digest>&from=<repository name>
Content-Length: 0
```

成功返回：

```
201 Created
Location: /v2/<name>/blobs/<digest>
Content-Length: 0
Docker-Content-Digest: <digest>
```

失败返回：

```
202 Accepted
Location: /v2/<name>/blobs/uploads/<uuid>
Range: bytes=0-<offset>
Content-Length: 0
Docker-Upload-UUID: <uuid>
```

### 删除层(Deleting a Layer)

```
DELETE /v2/<image>/blobs/<digest>
```

成功返回:

```
202 Accepted
Content-Length: None
```

失败返回404错误

### 上传镜像清单(Pushing an Image Manifest)

我们上传完镜像层之后，就开始上传镜像清单

```
 PUT /v2/<name>/manifests/<reference>
 Content-Type: <manifest media type>
 {
 "name": <name>,
 "tag": <tag>,
 "fsLayers": [
   {
      "blobSum": <digest>
   },
   ...
 ]
 ],
 "history": <v1 images>,
 "signature": <JWS>,
 ...
 }
```

如果清单中有层(`"blobSum":<digest>`)是未知的，则返回

```json
{
  "errors:" [{
          "code": "BLOB_UNKNOWN",
          "message": "blob unknown to registry",
          "detail": {
              "digest": <digest>
          }
      },
      ...
   ]
 }
```

# 检索功能

## 列出所有存储库(Listing Repositories)

```
GET /v2/_catalog
```

返回

```
 200 OK
 Content-Type: application/json
 {
   "repositories": [
     <name>,
     ...
   ]
 }
```

## 列出部分存储库(Pagination)

```
GET /v2/_catalog?n=<integer>
```

Note： integer表示要列出库的个数

返回：

```
 200 OK
 Content-Type: application/json
 Link: <<url>?n=<n from the request>&last=<last repository in response>>; rel="next"
 {
   "repositories": [
     <name>,
     ...
   ]
 }
```

## 列出镜像所有tags(Listing Image Tags)

```
GET /v2/image/tags/list
```

返回

```
 200 OK
 Content-Type: application/json
 {
     "name": <name>,
     "tags": [
         <tag>,
         ...
     ]
 }
```

## 列出镜像部分tags(Pagination)

```
GET /v2/image/tags/list?n=<integer>
```

返回

```
 200 OK
 Content-Type: application/json
 Link: <<url>?n=<n from the request>&last=<last tag value from previous response>>; rel="next"
 {
   "name": <name>,
   "tags": [
     <tag>,
     ...
   ]
 }
```

## 删除镜像(Deleting an Image)

```
DELETE /v2/image/manifests/<reference>
```

返回

```
202 Accepted
Content-Length: None
```

失败返回404错误

注意：默认情况下，registry不允许删除镜像操作，需要在启动registry时指定环境变量REGISTRY_STORAGE_DELETE_ENABLED=true,或者修改其配置文件即可。reference必须是digest,否则删除将失败。

在registry2.3或更高版本删除清单时，必须在HEAD或GET获取清单以获取要删除的正确digest携带以下头：

```
Accept: application/vnd.docker.distribution.manifest.v2+json
```

# 个人收获

docker 仓库本身的设计是非常巧妙的，值得我们学习和借鉴。

这些 API 不建议去记忆，直接查阅使用即可。

# 参考资料

《Docker 进阶与实战》

[Docker registry](https://docs.docker.com/registry/)

## 其他

[DockerHub 使用简介](https://www.cnblogs.com/rgqancy/p/9627207.html)

[从Docker Hub和docker-registry的关系与区别](https://blog.csdn.net/huakai_sun/article/details/79897085)

[docker registry v2 api](https://www.jianshu.com/p/6a7b80122602)

[docker registry v2 API的使用](https://blog.csdn.net/kan2016/article/details/86105354)

[Docker registry V2 推送镜像、拉取镜像、搜索镜像、删除镜像和垃圾回收](https://blog.csdn.net/nklinsirui/article/details/80705306)

* any list
{:toc}
