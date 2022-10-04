---
layout: post
title:  图片压缩免费开源工具 image compress tool 
date:  2022-10-04 09:22:02 +0800
categories: [Tool]
tags: [image, tool, sh]
published: true
---

# 为什么需要图片压缩？

有时候图片较大，一个是浪费流量，更重要的是用户体验会比较差。

这个时候对图片进行压缩，就变得很有必要。

# 不错的网站

> [Smart WebP, PNG and JPEG compression](https://tinypng.com/)


# 开源工具

## java

> [压缩文件，压缩图片，压缩Bitmap，Compress, CompressImage, CompressFile, CompressBitmap：](https://github.com/nanchen2251/CompressHelper)

```java
File newFile = new CompressHelper.Builder(this)
                    .setMaxWidth(720)  // 默认最大宽度为720
                    .setMaxHeight(960) // 默认最大高度为960
                    .setQuality(80)    // 默认压缩质量为80
		    .setFileName(yourFileName) // 设置你需要修改的文件名
                    .setCompressFormat(CompressFormat.JPEG) // 设置默认压缩为jpg格式
                    .setDestinationDirectoryPath(Environment.getExternalStoragePublicDirectory(
                            Environment.DIRECTORY_PICTURES).getAbsolutePath())
                    .build()
                    .compressToFile(oldFile);
```



## js

> [JavaScript image compressor.](https://fengyuanchen.github.io/compressorjs/)



# 参考资料

https://www.huxu.org.cn/marketing/57608.html

[网站访问量统计工具,Google 统计](https://www.zhangshilong.cn/work/356304.html)

[自己建网站怎么添加 Google Analytics 统计代码查看每日流量](https://blog.naibabiji.com/tutorial/google-analytics.html)

[一文读懂独立站谷歌SEO优化流程](https://zhuanlan.zhihu.com/p/507769599)

[为网站开启Google Analytics](https://zhuanlan.zhihu.com/p/507279404)

* any list
{:toc}