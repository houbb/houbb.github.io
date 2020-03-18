---
layout: post
title:  Java NIO-10-大文件读取
date:  2018-09-22 12:20:47 +0800
categories: [Java]
tags: [java, io, linux, zero-copy, sf]
published: true
---

# 背景

直接将文件全部加载到内存，就时候是行不通的。

比如一个文件特别大，直接占用了 2G 的内存，或者相对较大，500M 但是读取不频繁，用户不希望占用太多的内存。

那该怎么办呢?


# RandomAccessFile-获取指定范围的字符串

```java
/**
 * 获取对应的字符串
 * @param filePath 文件
 * @param startIndex 开始下标
 * @param endIndex 结束下标
 * @return 结果字符串
 * @since 0.0.1
 */
public String getString(final String filePath,
                         final int startIndex,
                         final int endIndex) {
    try {
        final int size = endIndex-startIndex;
        MappedByteBuffer inputBuffer = new RandomAccessFile(filePath, "r")
                .getChannel().map(FileChannel.MapMode.READ_ONLY,
                        startIndex, size);
        byte[] bs = new byte[inputBuffer.capacity()];
        for (int offset = 0; offset < inputBuffer.capacity(); offset ++) {
            bs[offset] = inputBuffer.get(offset);
        }
        return new String(bs);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

# 按照行读取

```java
String path = "你要读的文件的路径";
RandomAccessFile br = new RandomAccessFile(path, "rw");// 这里rw看你了。要是之都就只写r
String str = null, app = null;
int i = 0;
while ((str = br.readLine()) != null) {
    i++;
    app = app + str;
    if (i >= 100) {// 假设读取100行
        i = 0;
        // 这里你先对这100行操作，然后继续读
        app = null;
    }
}
br.close();
```

## 中文乱码问题

中文会被默认转换为 `ISO-8859-1`，所以对于中文需要处理。

比如我读取的文本为 GBK 编码格式

```java
RandomAccessFile raf = new RandomAccessFile(new File(p),"r");
String s ;
while((s = raf.readLine())!=null){
    String result = new String(s.getBytes("ISO-8859-1") , "GBK");
    System.out.println(result);
}
```

# 大文件读取

```java
// 当逐行读写大于2G的文本文件时推荐使用以下代码
void largeFileIO(String inputFile, String outputFile) {
    try {
        BufferedInputStream bis = new BufferedInputStream(new FileInputStream(new File(inputFile)));
        BufferedReader in = new BufferedReader(new InputStreamReader(bis, "utf-8"), 10 * 1024 * 1024);// 10M缓存
        FileWriter fw = new FileWriter(outputFile);
        while (in.ready()) {
            String line = in.readLine();
            fw.append(line + " ");
        }
        in.close();
        fw.flush();
        fw.close();
    } catch (IOException ex) {
        ex.printStackTrace();
    }
}
```

# 参考资料

[Java读写大文本文件（2GB以上）](https://www.cnblogs.com/duanxz/p/4874712.html)

* any list
{:toc}