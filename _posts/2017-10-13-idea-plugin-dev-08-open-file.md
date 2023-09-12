---
layout: post
title:  Idea Plugin Dev-08- idea 插件开发有时候打开新建的文件不生效
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---


# 打开文件的正确方式

```java
private void openFile(String filePath) {
    try {
        // 使用本地文件系统查找文件
        VirtualFile virtualFile = LocalFileSystem.getInstance().refreshAndFindFileByPath(filePath);
        if (virtualFile != null) {
            // 避免缓存
            FileBasedIndex.getInstance().requestReindex(virtualFile);
            // 使用 OpenFileDescriptor 打开文件
            OpenFileDescriptor descriptor = new OpenFileDescriptor(project, virtualFile);
            descriptor.navigate(true);
        } else {
            // 文件不存在的处理逻辑
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```


# 参考资料

chat

* any list
{:toc}
