---
layout: post
title:  Java WatchService
date:  2018-04-12 08:51:46 +0800
categories: [Java]
tags: [java, file, watch]
published: true
---

# 问题引入

有时候，我们希望对某一个文件(文件夹)的变化做监听，自动实现起来未免会出现问题。

JDK 已经为我们提供了非常好用的方式 [WatchService](https://docs.oracle.com/javase/7/docs/api/java/nio/file/WatchService.html)

> [notification](https://docs.oracle.com/javase/tutorial/essential/io/notification.html)

# WatchService

- WatchFileService.java

备注：这段代码节选自网络

```java
import java.io.File;
import java.nio.file.*;
import java.util.LinkedList;

/**
 * 2018/4/12
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class WatchFileService {

    public static void main(String[] args)
            throws Exception {

        //可以换成你想要监听的文件夹
        String filePath = ("/Users/houbinbin/IT/fork/jdk/jdk-test/src/main/resources/file");

        // 获取文件系统的WatchService对象
        WatchService watchService = FileSystems.getDefault().newWatchService();
        Paths.get(filePath).register(watchService
                , StandardWatchEventKinds.ENTRY_CREATE
                , StandardWatchEventKinds.ENTRY_MODIFY
                , StandardWatchEventKinds.ENTRY_DELETE);
        // 如要监控子文件
        File file = new File(filePath);
        LinkedList<File> fList = new LinkedList<>();
        fList.addLast(file);
        while (fList.size() > 0) {
            File f = fList.removeFirst();
            if (f.listFiles() == null) {
                continue;
            }
            for (File file2 : f.listFiles()) {
                //下一级目录
                if (file2.isDirectory()) {
                    fList.addLast(file2);
                    //依次注册子目录
                    Paths.get(file2.getAbsolutePath()).register(watchService
                            , StandardWatchEventKinds.ENTRY_CREATE
                            , StandardWatchEventKinds.ENTRY_MODIFY
                            , StandardWatchEventKinds.ENTRY_DELETE);
                }
            }
        }

        while (true) {
            // 获取下一个文件改动事件
            WatchKey key = watchService.take();
            for (WatchEvent<?> event : key.pollEvents()) {
                System.out.println(event.context() + " --> " + event.kind());
                //TODO：在这里进行想要的操作
            }
            // 重设WatchKey
            boolean valid = key.reset();
            // 如果重设失败，退出监听
            if (!valid) {
                break;
            }
        }
    }

}
```


## 测试 & 结果

直接运行上述方法，在对应文件夹中做操作。

打印日志如下:

```
test.txt --> ENTRY_MODIFY
1.txt --> ENTRY_CREATE
```

* any list
{:toc}









 





