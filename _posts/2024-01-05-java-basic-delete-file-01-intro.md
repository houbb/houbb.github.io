---
layout: post
title: 删除 java 文件夹的几种方式汇总
date: 2024-01-05 21:01:55 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 背景

删除 java 的几种方式。

如果是一般的文件删除还算简单，但是如果是文件夹的删除怎么办？


# 一、删除文件或文件夹的四种基础方法

下面的四个方法都可以删除文件或文件夹，它们的共同点是：当文件夹中包含子文件的时候都会删除失败，也就是说这四个方法只能删除空文件夹。

 需要注意的是：传统IO中的File类和NIO中的Path类既可以代表文件，也可以代表文件夹。
 

File类的delete()
File类的deleteOnExit()
Files.delete(Path path)
Files.deleteIfExists(Path path);

| 它们之间的差异： 

| 成功的返回值 | 是否能判别文件夹不存在导致失败 | 是否能判别文件夹不为空导致失败 | 备注 | 备注 |
|:----|:----|:----|:----|:-------|
| File类的delete() | true  |  不能(返回false) | 不能(返回false) | 传统IO |
| File类的deleteOnExit() | void | 不能，但不存在就不会去执行删除 | 不能(返回void) | 传统IO，这是个坑，避免使用 |
| Files.delete(Path path) | void |  NoSuchFileException |  DirectoryNotEmptyException | NIO，笔者推荐使用 |
| Files.deleteIfExists(Path path); | true | false | DirectoryNotEmptyException | NIO |


```java
//false只能告诉你失败了 ，但是没有给出任何失败的原因
@Test
void testDeleteFileDir1()  {
   File file = new File("D:\data\test");
   boolean deleted = file.delete();
   System.out.println(deleted);
}

//void ,删除失败没有任何提示，应避免使用这个方法，就是个坑
@Test
void testDeleteFileDir2()  {
   File file = new File("D:\data\test1");
   file.deleteOnExit();
}

//如果文件不存在，抛出NoSuchFileException
//如果文件夹里面包含文件，抛出DirectoryNotEmptyException
@Test
void testDeleteFileDir3() throws IOException {
   Path path = Paths.get("D:\data\test1");
   Files.delete(path);   //返回值void
}

//如果文件不存在，返回false，表示删除失败(文件不存在)
//如果文件夹里面包含文件，抛出DirectoryNotEmptyException
@Test
void testDeleteFileDir4() throws IOException {
   Path path = Paths.get("D:\data\test1");
   boolean result = Files.deleteIfExists(path);
   System.out.println(result);
}
```

归根结底，建议大家使用java NIO的Files.delete(Path path)和Files.deleteIfExists(Path path);进行文件或文件夹的删除。

# 二、如何删除整个目录或者目录中的部分文件

上文已经说了，那四个API删除文件夹的时候，如果文件夹包含子文件，就会删除失败。

那么，如果我们确实想删除整个文件夹，该怎么办？

## 2.1. walkFileTree与FileVisitor

使用walkFileTree方法遍历整个文件目录树，使用FileVisitor处理遍历出来的每一项文件或文件夹

FileVisitor的visitFile方法用来处理遍历结果中的“文件”，所以我们可以在这个方法里面删除文件

FileVisitor的postVisitDirectory方法，注意方法中的“post”表示“后去做……”的意思，所以用来文件都处理完成之后再去处理文件夹，所以使用这个方法删除文件夹就可以有效避免文件夹内容不为空的异常，因为在去删除文件夹之前，该文件夹里面的文件已经被删除了。

```java
@Test
void testDeleteFileDir5() throws IOException {
   createMoreFiles();
   Path path = Paths.get("D:\data\test1\test2");

   Files.walkFileTree(path,
      new SimpleFileVisitor<Path>() {
         // 先去遍历删除文件
         @Override
         public FileVisitResult visitFile(Path file,
                                  BasicFileAttributes attrs) throws IOException {
            Files.delete(file);
            System.out.printf("文件被删除 : %s%n", file);
            return FileVisitResult.CONTINUE;
         }
         // 再去遍历删除目录
         @Override
         public FileVisitResult postVisitDirectory(Path dir,
                                         IOException exc) throws IOException {
            Files.delete(dir);
            System.out.printf("文件夹被删除: %s%n", dir);
            return FileVisitResult.CONTINUE;
         }

      }
   );

}
```

我们既然可以遍历出文件夹或者文件，我们就可以在处理的过程中进行过滤。比如：

1. 按文件名删除文件或文件夹，参数Path里面含有文件或文件夹名称

2. 按文件创建时间、修改时间、文件大小等信息去删除文件，参数BasicFileAttributes 里面包含了这些文件信息。

## 2.2.Files.walk

如果你对Stream流语法不太熟悉的话，这种方法稍微难理解一点，但是说实话也非常简单。

使用Files.walk遍历文件夹（包含子文件夹及子其文件），遍历结果是一个 `Stream<Path>`

对每一个遍历出来的结果进行处理，调用Files.delete就可以了。

```java
@Test
void testDeleteFileDir6() throws IOException {
   createMoreFiles();
   Path path = Paths.get("D:\data\test1\test2");

   try (Stream<Path> walk = Files.walk(path)) {
      walk.sorted(Comparator.reverseOrder())
         .forEach(DeleteFileDir::deleteDirectoryStream);
   }

}

private static void deleteDirectoryStream(Path path) {
   try {
      Files.delete(path);
      System.out.printf("删除文件成功：%s%n",path.toString());
   } catch (IOException e) {
      System.err.printf("无法删除的路径 %s%n%s", path, e);
   }
}
```

问题：怎么能做到先去删除文件，再去删除文件夹？ 

利用的是字符串的排序规则，从字符串排序规则上讲，“D:\data\test1\test2”一定排在“D:\data\test1\test2\test2.log”的前面。

所以我们使用“sorted(Comparator.reverseOrder())”把Stream顺序颠倒一下，就达到了先删除文件，再删除文件夹的目的。

## 2.3.传统IO-递归遍历删除文件夹

传统的通过递归去删除文件或文件夹的方法就比较经典了

```java
//传统IO递归删除
@Test
void testDeleteFileDir7() throws IOException {
   createMoreFiles();
   File file = new File("D:\data\test1\test2");
   deleteDirectoryLegacyIO(file);

}

private void deleteDirectoryLegacyIO(File file) {

   File[] list = file.listFiles();  //无法做到list多层文件夹数据
   if (list != null) {
      for (File temp : list) {     //先去递归删除子文件夹及子文件
         deleteDirectoryLegacyIO(temp);   //注意这里是递归调用
      }
   }

   if (file.delete()) {     //再删除自己本身的文件夹
      System.out.printf("删除成功 : %s%n", file);
   } else {
      System.err.printf("删除失败 : %s%n", file);
   }
}
```

需要注意的是：

1. listFiles()方法只能列出文件夹下面的一层文件或文件夹，不能列出子文件夹及其子文件。

2. 先去递归删除子文件夹，再去删除文件夹自己本身

# 参考资料


https://cloud.tencent.com/developer/article/1703463


* any list
{:toc}