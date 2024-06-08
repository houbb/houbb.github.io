---
layout: post
title:  从零手写实现 nginx-11-文件处理逻辑与 range 范围查询合并
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## 手写 nginx 系列

如果你对 nginx 原理感兴趣，可以阅读：

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

[从零手写实现 nginx-10-sendfile 零拷贝](https://houbb.github.io/2018/11/22/nginx-write-10-sendfile)

[从零手写实现 nginx-11-file+range 合并](https://houbb.github.io/2018/11/22/nginx-write-11-file-and-range-merge)

[从零手写实现 nginx-12-keep-alive 连接复用](https://houbb.github.io/2018/11/22/nginx-write-12-keepalive)

[从零手写实现 nginx-13-nginx.conf 配置文件介绍](https://houbb.github.io/2018/11/22/nginx-write-13-nginx-conf-intro)

[从零手写实现 nginx-14-nginx.conf 和 hocon 格式有关系吗？](https://houbb.github.io/2018/11/22/nginx-write-14-nginx-conf-hocon)

[从零手写实现 nginx-15-nginx.conf 如何通过 java 解析处理？](https://houbb.github.io/2018/11/22/nginx-write-15-nginx-conf-parser)

[从零手写实现 nginx-16-nginx 支持配置多个 server](https://houbb.github.io/2018/11/22/nginx-write-16-nginx-conf-multi-server)

[从零手写实现 nginx-17-nginx 默认配置优化](https://houbb.github.io/2018/11/22/nginx-write-17-nginx-conf-global-default)

[从零手写实现 nginx-18-nginx 请求头响应头的处理](https://houbb.github.io/2018/11/22/nginx-write-18-nginx-conf-header-oper)

# 背景

最初感觉范围处理和文件的处理不是相同的逻辑，所以做了拆分。

但是后来发现有很多公共的逻辑。

主要两种优化方式：

1. 把范围+文件合并到同一个文件中处理。添加各种判断代码

2. 采用模板方法，便于后续拓展修改。

这里主要尝试下第 2 种，便于后续的拓展。

# 代码的相似之处

首先，我们要找到二者的相同之处。

range 主要其实是开始位置和长度，和普通的处理存在差异。

## 基础文件实现

我们对常见的部分抽象出来，便于子类拓展

```java
/**
 * 文件
 *
 * @since 0.10.0
 * @author 老马笑西风
 */
public class AbstractNginxRequestDispatchFile extends AbstractNginxRequestDispatch {

    /**
     * 获取长度
     * @param context 上下文
     * @return 结果
     */
    protected long getActualLength(final NginxRequestDispatchContext context) {
        final File targetFile = context.getFile();
        return targetFile.length();
    }

    /**
     * 获取开始位置
     * @param context 上下文
     * @return 结果
     */
    protected long getActualStart(final NginxRequestDispatchContext context) {
        return 0L;
    }

    protected void fillContext(final NginxRequestDispatchContext context) {
        long actualLength = getActualLength(context);
        long actualStart = getActualStart(context);

        context.setActualStart(actualStart);
        context.setActualFileLength(actualLength);
    }

    /**
     * 填充响应头
     * @param context 上下文
     * @param response 响应
     * @since 0.10.0
     */
    protected void fillRespHeaders(final NginxRequestDispatchContext context,
                                   final HttpRequest request,
                                   final HttpResponse response) {
        final File targetFile = context.getFile();
        final long fileLength = context.getActualFileLength();

        // 文件比较大，直接下载处理
        if(fileLength > NginxConst.BIG_FILE_SIZE) {
            logger.warn("[Nginx] fileLength={} > BIG_FILE_SIZE={}", fileLength, NginxConst.BIG_FILE_SIZE);
            response.headers().set(HttpHeaderNames.CONTENT_DISPOSITION, "attachment; filename=\"" + targetFile.getName() + "\"");
        }

        // 如果请求中有KEEP ALIVE信息
        if (HttpUtil.isKeepAlive(request)) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
        }
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, InnerMimeUtil.getContentTypeWithCharset(targetFile, context.getNginxConfig().getCharset()));
        response.headers().set(HttpHeaderNames.CONTENT_LENGTH, fileLength);
    }

    protected HttpResponse buildHttpResponse(NginxRequestDispatchContext context) {
        HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
        return response;
    }



    /**
     * 是否需要压缩处理
     * @param context 上下文
     * @return 结果
     */
    protected boolean isZipEnable(NginxRequestDispatchContext context) {
        return InnerGzipUtil.isMatchGzip(context);
    }

    /**
     * gzip 的提前预处理
     * @param context  上下文
     * @param response 响应
     */
    protected void beforeZip(NginxRequestDispatchContext context, HttpResponse response) {
        File compressFile = InnerGzipUtil.prepareGzip(context, response);
        context.setFile(compressFile);
    }

    /**
     * gzip 的提前预处理
     * @param context  上下文
     * @param response 响应
     */
    protected void afterZip(NginxRequestDispatchContext context, HttpResponse response) {
        InnerGzipUtil.afterGzip(context, response);
    }

    protected boolean isZeroCopyEnable(NginxRequestDispatchContext context) {
        final NginxConfig nginxConfig = context.getNginxConfig();

        return EnableStatusEnum.isEnable(nginxConfig.getNginxSendFileConfig().getSendFile());
    }

    protected void writeAndFlushOnComplete(final ChannelHandlerContext ctx,
                                           final NginxRequestDispatchContext context) {
        // 传输完毕，发送最后一个空内容，标志传输结束
        ChannelFuture lastContentFuture = ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
        // 如果不支持keep-Alive，服务器端主动关闭请求
        if (!HttpUtil.isKeepAlive(context.getRequest())) {
            lastContentFuture.addListener(ChannelFutureListener.CLOSE);
        }
    }

    @Override
    public void doDispatch(NginxRequestDispatchContext context) {
        final FullHttpRequest request = context.getRequest();
        final File targetFile = context.getFile();
        final ChannelHandlerContext ctx = context.getCtx();

        logger.info("[Nginx] start dispatch, path={}", targetFile.getAbsolutePath());
        // 长度+开始等基本信息
        fillContext(context);

        // 响应
        HttpResponse response = buildHttpResponse(context);

        // 添加请求头
        fillRespHeaders(context, request, response);

        //gzip
        boolean zipFlag = isZipEnable(context);
        try {
            if(zipFlag) {
                beforeZip(context, response);
            }

            // 写基本信息
            ctx.write(response);

            // 零拷贝
            boolean isZeroCopyEnable = isZeroCopyEnable(context);
            if(isZeroCopyEnable) {
                //zero-copy
                dispatchByZeroCopy(context);
            } else {
                // 普通
                dispatchByRandomAccessFile(context);
            }
        } finally {
            // 最后处理
            if(zipFlag) {
                afterZip(context, response);
            }
        }
    }

    /**
     * Netty 之 FileRegion 文件传输: https://www.jianshu.com/p/447c2431ac32
     *
     * @param context 上下文
     */
    protected void dispatchByZeroCopy(NginxRequestDispatchContext context) {
        final ChannelHandlerContext ctx = context.getCtx();
        final File targetFile = context.getFile();

        // 分块传输文件内容
        final long actualStart = context.getActualStart();
        final long actualFileLength = context.getActualFileLength();

        try {
            RandomAccessFile randomAccessFile = new RandomAccessFile(targetFile, "r");
            FileChannel fileChannel = randomAccessFile.getChannel();

            // 使用DefaultFileRegion进行零拷贝传输
            DefaultFileRegion fileRegion = new DefaultFileRegion(fileChannel, actualStart, actualFileLength);
            ChannelFuture transferFuture = ctx.writeAndFlush(fileRegion);

            // 监听传输完成事件
            transferFuture.addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture future) {
                    try {
                        if (future.isSuccess()) {
                            writeAndFlushOnComplete(ctx, context);
                        } else {
                            // 处理传输失败
                            logger.error("[Nginx] file transfer failed", future.cause());
                            throw new Nginx4jException(future.cause());
                        }
                    } finally {
                        // 确保在所有操作完成之后再关闭文件通道和RandomAccessFile
                        try {
                            fileChannel.close();
                            randomAccessFile.close();
                        } catch (Exception e) {
                            logger.error("[Nginx] error closing file channel", e);
                        }
                    }
                }
            });

            // 记录传输进度（如果需要，可以通过监听器或其他方式实现）
            logger.info("[Nginx] file process >>>>>>>>>>> {}", actualFileLength);

        } catch (Exception e) {
            logger.error("[Nginx] file meet ex", e);
            throw new Nginx4jException(e);
        }
    }

    // 分块传输文件内容

    /**
     * 分块传输-普通方式
     * @param context 上下文
     */
    protected void dispatchByRandomAccessFile(NginxRequestDispatchContext context) {
        final ChannelHandlerContext ctx = context.getCtx();
        final File targetFile = context.getFile();

        // 分块传输文件内容
        long actualFileLength = context.getActualFileLength();
        // 分块传输文件内容
        final long actualStart = context.getActualStart();

        long totalRead = 0;

        try(RandomAccessFile randomAccessFile = new RandomAccessFile(targetFile, "r")) {
            // 开始位置
            randomAccessFile.seek(actualStart);

            ByteBuffer buffer = ByteBuffer.allocate(NginxConst.CHUNK_SIZE);
            while (totalRead <= actualFileLength) {
                int bytesRead = randomAccessFile.read(buffer.array());
                if (bytesRead == -1) { // 文件读取完毕
                    logger.info("[Nginx] file read done.");
                    break;
                }

                buffer.limit(bytesRead);

                // 写入分块数据
                ctx.write(new DefaultHttpContent(Unpooled.wrappedBuffer(buffer)));
                buffer.clear(); // 清空缓冲区以供下次使用

                // process 可以考虑加一个 listener
                totalRead += bytesRead;
                logger.info("[Nginx] file process >>>>>>>>>>> {}/{}", totalRead, actualFileLength);
            }

            // 最后的处理
            writeAndFlushOnComplete(ctx, context);
        } catch (Exception e) {
            logger.error("[Nginx] file meet ex", e);
            throw new Nginx4jException(e);
        }
    }

}
```

这样原来的普通文件类只需要直接继承。

范围类重置如下方法即可：

```java
/**
 * 文件范围查询
 *
 * @since 0.7.0
 * @author 老马啸西风
 */
public class NginxRequestDispatchFileRange extends AbstractNginxRequestDispatchFile {

    private static final Log logger = LogFactory.getLog(AbstractNginxRequestDispatchFullResp.class);

    @Override
    protected HttpResponse buildHttpResponse(NginxRequestDispatchContext context) {
        long start = context.getActualStart();

        // 构造HTTP响应
        HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1,
                start < 0 ? HttpResponseStatus.OK : HttpResponseStatus.PARTIAL_CONTENT);

        return response;
    }

    @Override
    protected void fillContext(NginxRequestDispatchContext context) {
        final long fileLength = context.getFile().length();
        final HttpRequest httpRequest = context.getRequest();

        // 解析Range头
        String rangeHeader = httpRequest.headers().get("Range");
        logger.info("[Nginx] fileRange start rangeHeader={}", rangeHeader);

        long[] range = parseRange(rangeHeader, fileLength);
        long start = range[0];
        long end = range[1];
        long actualLength = end - start + 1;

        context.setActualStart(start);
        context.setActualFileLength(actualLength);
    }

    protected long[] parseRange(String rangeHeader, long totalLength) {
        // 简单解析Range头，返回[start, end]
        // Range头格式为: "bytes=startIndex-endIndex"
        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            String range = rangeHeader.substring("bytes=".length());
            String[] parts = range.split("-");
            long start = parts[0].isEmpty() ? totalLength - 1 : Long.parseLong(parts[0]);
            long end = parts.length > 1 ? Long.parseLong(parts[1]) : totalLength - 1;
            return new long[]{start, end};
        }
        return new long[]{-1, -1}; // 表示无效的范围请求
    }

}
```

# 小结

模板方法对于代码的复用好处还是很大的，不然后续拓展特性，很多地方都需要修改多次。

下一节，我们考虑实现一下 HTTP keep-alive 的支持。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

* any list
{:toc}