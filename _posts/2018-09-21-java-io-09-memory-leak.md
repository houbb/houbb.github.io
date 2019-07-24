---
layout: post
title:  Java IO-09-文件内存泄漏 memory leak 
date:  2018-09-21 17:36:38 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
---

# 什么是内存泄露

定义：当生命周期长的实例 L 不合理地持有一个生命周期短的实例 S，导致 S 实例无法被正常回收

## 代码例子

```java
public class AppSettings {
    private Context mAppContext;
    private static AppSettings sInstance = new AppSettings();

    //some other codes
    public static AppSettings getInstance() {
      return sInstance;
    }

    public final void setup(Context context) {
        mAppContext = context;
    }
}
```

### 解释

上面的代码可能会发生内存泄露

我们调用 `1AppSettings.getInstance.setup()` 传入一个Activity实例

当上述的 Activity 退出时，由于被 AppSettings 中属性 mAppContext 持有，进而导致内存泄露。

### 为什么上面的情况就会发生内存泄露

以 JAVA 为例，GC 回收对象采用GC Roots强引用可到达机制。

Activity实例被AppSettings.sInstance持有

AppSettings.sInstance由于是静态，被AppSettings类持有

AppSettings类被加载它的类加载器持有

而类加载器就是GC Roots的一种由于上述关系导致Activity实例无法被回收销毁。

ps: 内存泄漏，其实就是本来应该被回收的对象，因为被更长生命周期的对象持有，而无法回收的情况。

# 验证是否引起内存泄露

因此，想要证明未关闭的文件流是否导致内存泄露，需要查看文件流是否是GC Roots强引用可到达。

## 示例代码1（辅助验证GC 发生）

```java
import java.io.BufferedReader;
import java.io.Reader;


class MyBufferedReader(`in`: Reader?) : BufferedReader(`in`) {
    protected fun finalize() {
        println("MyBufferedReader get collected")
    }
}
```

## 示例代码2

```java
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        findViewById<View>(R.id.textview).setOnClickListener {
            testInputStream()
        }
    }

    private fun testInputStream() {
      //需进入设置手动开启应用权限，未处理运行时权限问题
        val `is` = FileInputStream("/sdcard/a.txt")
        val buf = MyBufferedReader(InputStreamReader(`is`))

        var line = buf.readLine()
        val sb = StringBuilder()

        while (line != null) {
            sb.append(line).append("\n")
            line = buf.readLine()
        }

        val fileAsString = sb.toString()
        Log.i("MainActivity", "testInputStream.Contents : $fileAsString")
    }
}
```

## 操作步骤

这里我们这样操作

点击textview视图，触发多次testInputStream

过几秒后，我们执行 `heap dump`。

我们使用 MAT 对上一步的dump文件进行分析(需进行格式转换)

## 分析结果

分析上图，我们发现

FileInputStream 只被 FinalizerReference 这个类(GC Root)持有

上述持有的原因是，FileInputStream重写了finalize，会被加入到FinalizerReference的析构处理集合

上述引用会随着Finalizer守护线程处理后解除，即FileInputStream实例彻底销毁。

所以，我们再来操作一波，验证上面的结论。

然后利用工具执行强制 GC 回收

过几秒后，我们执行heap dump。

我们使用 MAT 对上一步的dump文件进行分析(需进行格式转换)

堆分析文件，查找MyBufferedReader或者FileInputStream或者InputStreamReader 没有发现这些实例，说明已经GC回收

出于谨慎考虑，我们按照包名查找java.io在排除无关实例外，依旧无法找到testInputStream中的实例。再次证明已经被GC回收

因而我们可以确定，正常的使用流，不会导致内存泄露的产生。

当然，如果你刻意显式持有Stream实例，那就另当别论了。

# 为什么需要关闭流

## 看图

![file-descriptor_table.jpg](https://asset.droidyue.com/image/2019_05/file-descriptor_table.jpg)

如上图从左至右有三张表

file descriptor table 归属于单个进程

global file table(又称open file table) 归属于系统全局

inode table 归属于系统全局

## 从一次文件打开说起

当我们尝试打开文件 /path/myfile.txt

1. 从 inode table 中查找到对应的文件节点 

2. 根据用户代码的一些参数（比如读写权限等）在 open file table 中创建 open file 节点 

3. 将上一步的 open file 节点信息保存，在 file descriptor table 中创建 file descriptor 

4. 返回上一步的 file descriptor 的索引位置，供应用读写等使用。

## file descriptor 和流有什么关系

当我们这样 `FileInputStream("/sdcard/a.txt")` 会获取一个 file descriptor。

出于稳定系统性能和避免因为过多打开文件导致CPU和RAM占用居高的考虑，每个进程都会有可用的file descriptor 限制。

所以如果不释放file descriptor，会导致应用后续依赖file descriptor的行为(socket连接，读写文件等)无法进行，甚至是导致进程崩溃。

当我们调 用FileInputStream.close 后，会释放掉这个 file descriptor。

因此到这里我们可以说，不关闭流不是内存泄露问题，是资源泄露问题(file descriptor 属于资源)。

# 不手动关闭会怎样

不手动关闭的真的会发生上面的问题么？ 

其实也不完全是。

因为对于这些流的处理，源代码中通常会做一个兜底处理。

## 以 FileInputStream 为例

```java
/**
 * Ensures that the <code>close</code> method of this file input stream is
 * called when there are no more references to it.
 *
 * @exception  IOException  if an I/O error occurs.
 * @see        java.io.FileInputStream#close()
 */
protected void finalize() throws IOException {
    // Android-added: CloseGuard support.
    if (guard != null) {
        guard.warnIfOpen();
    }

    if ((fd != null) &&  (fd != FileDescriptor.in)) {
        // Android-removed: Obsoleted comment about shared FileDescriptor handling.
        close();
    }
}
```

是的，在finalize方法中有调用close来释放file descriptor.

但是finalize方法执行速度不确定，不可靠

所以，我们不能依赖于这种形式，还是要手动调用close来释放file descriptor。

ps: 也就是说不会造成内存泄漏。实际导致的是资源泄漏，因为 finalize 回收的线程优先级非常低。


# 关闭流实践

## 手动关闭

```java
private String readFirstLine() throws FileNotFoundException {
    BufferedReader reader = new BufferedReader(new FileReader("test.file"));
    try {
        return reader.readLine();
    } catch (IOException e) {
        e.printStackTrace();
    } finally {
        try {
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    return null;
}
```

## TWR

Java 7 之后，可以使用 try-with-resource 方式处理

```java
String readFirstLineFromFile(String path) throws IOException {
    try (BufferedReader br = new BufferedReader(new FileReader(path))) {
        return br.readLine();
    }
}
```

# 个人收获

## 知识在于存疑

对于最常见的文件不关闭会内存泄漏，99% 的程序员都知道。

但是为什么会内存泄漏，估计知道的人少之又少。

## jvm

jvm 的相关命令，一直停留于表面。

没有真正的去使用。

## 文件系统

操作系统的文件系统，如果没有系统学习，很多东西都是不知道的。

# 参考资料

[未关闭的文件流会引起内存泄露么？](https://droidyue.com/blog/2019/06/09/will-unclosed-stream-objects-cause-memory-leaks/)

* any list
{:toc}