---
layout: post
title: 提升文件上传性能的 4 种方式，你会吗？
date: 2022-02-23 21:01:55 +0800 
categories: [File]
tags: [file, sh]
published: true
---

# 业务需求

产品经理：小明啊，我们需要做一个附件上传的需求，内容可能是图片、pdf 或者视频。

小明：可以实现的，不过要限制下文件大小。最好别超过 30MB，太大了上传比较慢，服务器压力也大。

产品经理：沟通下来，视频是一定要的。就限制 50MB 以下吧。

小明：可以。

![A FEW DAYS LATER](https://img-blog.csdnimg.cn/a9ca7e4cf921435f8f14feb432dac2b2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBA6ICB6ams5ZW46KW_6aOO,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center)

测试同学：这文件上传也太慢了吧，我试了一个 50mb 的文件，花了一分钟。

小明：whats up，这么慢。

产品经理：不行，你这太慢了， 想办法优化下。

# 优化之路

## 问题定位

整体的文件上传调用链路如下图：

![调用链路](https://img-blog.csdnimg.cn/d1be7cc71f9f48f099df3d81098d6237.png)

小明发现前端开始上传，到请求到后端就花费了近 30 秒，应该是浏览器解析文件导致的慢。

后端服务请求文件服务也比较慢。

## 解决方案

小明：文件服务有异步接口吗？

文件服务：暂时没有。

小明：这个上传确实很慢，有优化建议吗？

文件服务：没有，看了下就是这么慢。

小明：……

最后小明还是决定把后端的同步返回，调整为异步返回，降低用户的等待时间。

把后端的实现调整了一番适应业务，前端调用后获取异步返回标识，后端根据标识查询文件服务同步返回的结果。

缺点也很明显，**异步上传失败，用户是不知道的**。

不过碍于时间原因，也就是能权衡利弊，暂时上线了。

最近小明有些时间，于是就想着自己实现一个文件服务。

# 文件服务

碍于文件服务的功能非常原始，小明就想着自己实现一个，从以下几个方面优化：

（1）压缩

（2）异步

（3）秒传

（4）并发

（5）直连

## 压缩

日常开发中，尽可能和产品沟通清楚，让用户上传/下载压缩包文件。

因为**网络传输是非常耗时的**。

压缩文件还有一个好处就是节约存储空间，当然，一般我们不用考虑这个成本。

优点：实现简单，效果拔群。

缺点：需要结合业务，并且说服产品。如果产品希望图片预览，视频播放，压缩就不太适用。

## 异步

对于比较耗时的操作，我们会自然的想到异步执行，降低用户同步等待的时间。

服务端接收到文件内容后，返回一个请求标识，异步执行处理逻辑。

那如何获取执行结果呢？

一般有 2 种常见方案：

（1）提供结果查询接口

相对简单，但是可能会有无效查询。

（2）提供异步结果回调功能

实现比较麻烦，可以第一时间获取执行结果。

## 秒传

小伙伴们应该都用过云盘，云盘有时候上传文件，非常大的文件，却可以瞬间上传完成。

这是如何实现的呢？

每一个文件内容，都对应唯一的文件哈希值。

我们可以在上传之前，查询该哈希值是否存在，如果已经存在，则直接增加一个引用即可，跳过了文件传输的环节。

当然，这个只在你的用户文件数据量很大，且有一定重复率的时候优势才能体现出来。

伪代码如下：

```java
public FileUploadResponse uploadByHash(final String fileName,
                                       final String fileBase64) {
    FileUploadResponse response = new FileUploadResponse();

    //判断文件是否存在
    String fileHash = Md5Util.md5(fileBase64);
    FileInfoExistsResponse fileInfoExistsResponse = fileInfoExists(fileHash);
    if (!RespCodeConst.SUCCESS.equals(fileInfoExistsResponse.getRespCode())) {
        response.setRespCode(fileInfoExistsResponse.getRespCode());
        response.setRespMessage(fileInfoExistsResponse.getRespMessage());
        return response;
    }

    Boolean exists = fileInfoExistsResponse.getExists();
    FileUploadByHashRequest request = new FileUploadByHashRequest();
    request.setFileName(fileName);
    request.setFileHash(fileHash);
    request.setAsyncFlag(asyncFlag);
    // 文件不存在再上传内容
    if (!Boolean.TRUE.equals(exists)) {
        request.setFileBase64(fileBase64);
    }

    // 调用服务端
    return fillAndCallServer(request, "api/file/uploadByHash", FileUploadResponse.class);
}
```

## 并发

另一种方式就是对一个比较大的文件进行切分。

比如 100MB 的文件，切成 10 个子文件，然后并发上传。一个文件对应唯一的批次号。

下载的时候，根据批次号，并发下载文件，拼接成一个完整的文件。

伪代码如下：

```java
public FileUploadResponse concurrentUpload(final String fileName,
                                           final String fileBase64) {
    // 首先进行分段
    int limitSize = fileBase64.length() / 10;
    final List<String> segments = StringUtil.splitByLength(fileBase64, limitSize);

    // 并发上传
    int size = segments.size();
    final ConcurrentHashMap<Integer, String> map = new ConcurrentHashMap<>();
    final CountDownLatch lock = new CountDownLatch(size);

    for(int i = 0; i < segments.size(); i++) {
        final int index = i;
        Thread t = new Thread() {
            public void run() {
               // 并发上传
               // countDown
               lock.countDown();
            }
        };
        t.start();
    }

    // 等待完成
    lock.await();

    // 针对上传后的信息处理
}
```

## 直连

当然，还有一种策略就是客户端直接访问服务端，跳过后端服务。

![文件直连](https://img-blog.csdnimg.cn/bd26b1696674444dbd07187b60c56690.png)

当然，这个前提要求文件服务必须提供 HTTP 文件上传接口。

还需要考虑安全问题，最好是前端调用后端，获取授权 token，然后携带 token 进行文件上传。

# 拓展阅读

[提升文件上传性能的 4 种方式，你会吗？](https://mp.weixin.qq.com/s/i-9HfwOpY9tvLC26-Szh6w)

[异步查询转同步的 7 种实现方式](https://mp.weixin.qq.com/s/320vFxi3KVdqMjorhQ8p5A)

[java压缩归档算法框架工具 compress](https://mp.weixin.qq.com/s/cPYrtFgzBDKvW6v6nas8mA)

# 小结

文件上传是非常常见的业务需求，上传的性能问题是肯定要考虑和优化的一个问题。

上面的几种方法可以灵活的组合使用，结合自己的业务进行更好的实践。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。


# 参考资料

* any list
{:toc}