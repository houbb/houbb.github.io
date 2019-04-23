---
layout: post
title:  Java NIO-02-Path/Files 
date:  2018-09-22 09:20:47 +0800
categories: [Java]
tags: [java, nio, java-base, sf]
published: true
---

# Path

我接触到 nio，最先的应用就是 Path 这个类。

最直观的感觉就是 api 设计的很优雅(相对于传统的 File)。

## Path 类

Java的path接口是作为Java NIO 2的一部分是Java6,7中NIO的升级增加部分。

Path在Java 7新增的。

相关接口位于java.nio.file包下，所以Javaz内Path接口的完整名称是 `java.nio.file.Path`.

path可以指向文件也可以指向目录。可以使相对路径也可以是绝对路径。

绝对路径包含了从根目录到该文件（目录）的完整路径。相对路径包含该文件（目录）相对于其他路径的路径。相对路径听起来可能有点让人头晕。但是别急，稍后我们会详细介绍。

### 创建 Path

```java
Path = path = Paths.get("c:\\data\\myfile.txt");
```

也可以通过 File 直接转换为 Path

```java
Path path = file.toPath();
```

### 文件路径

- 绝对路径

```java
Path path = Paths.get("/home/jakobjenkov/myfile.txt");
```

- 相对路径

创建一个相对路径可以通过调用 `Path.get(basePath, relativePath)`, 

下面是一个示例：

```java
Path file = Paths.get("d:\\data", "projects\\a-project\\myfile.txt");
```

- 当前路径

```java
Path currentDir = Paths.get(".");
```

- 父级路径

```java
Path parentDir = Paths.get("..");
```

# Files

这个类就是 File 相关的工具方法合集，和 Path 结合使用。

为我们操作带来了很多方便，所以了解即可。

## Files.exists()

Files.exits() 方法用来检查给定的Path在文件系统中是否存在。

```java
Path path = Paths.get("data/logging.properties");
boolean pathExists = Files.exists(path, new LinkOption[]{ LinkOption.NOFOLLOW_LINKS});
```

注意Files.exists()的的第二个参数。

他是一个数组，这个参数直接影响到Files.exists()如何确定一个路径是否存在。

在本例中，这个数组内包含了LinkOptions.NOFOLLOW_LINKS，表示检测时不包含符号链接文件。

## Files.createDirectory()

Files.createDirectory()会创建Path表示的路径，下面是一个示例：

```java
Path path = Paths.get("data/subdir");

try {
    Path newDir = Files.createDirectory(path);
} catch(FileAlreadyExistsException e){
    // the directory already exists.
} catch (IOException e) {
    //something else went wrong
    e.printStackTrace();
}
```

## Files.copy()

Files.copy()方法可以吧一个文件从一个地址复制到另一个位置。

例如：

```java
Path sourcePath      = Paths.get("data/logging.properties");
Path destinationPath = Paths.get("data/logging-copy.properties");

try {
    Files.copy(sourcePath, destinationPath);
} catch(FileAlreadyExistsException e) {
    //destination file already exists
} catch (IOException e) {
    //something else went wrong
    e.printStackTrace();
}
```

- 覆盖已经存在的文件

copy 操作可以强制覆盖已经存在的目标文件。

```java
Path sourcePath      = Paths.get("data/logging.properties");
Path destinationPath = Paths.get("data/logging-copy.properties");

try {
    Files.copy(sourcePath, destinationPath, StandardCopyOption.REPLACE_EXISTING);
} catch(FileAlreadyExistsException e) {
    //destination file already exists
} catch (IOException e) {
    //something else went wrong
    e.printStackTrace();
}
```

## Files.move()

Java NIO的Files类也包含了移动的文件的接口。

移动文件和重命名是一样的，但是还会改变文件的目录位置。

java.io.File类中的renameTo()方法与之功能是一样的。

```java
Path sourcePath      = Paths.get("data/logging-copy.properties");
Path destinationPath = Paths.get("data/subdir/logging-moved.properties");

try {
    Files.move(sourcePath, destinationPath,
            StandardCopyOption.REPLACE_EXISTING);
} catch (IOException e) {
    //moving file failed.
    e.printStackTrace();
}
```

## Files.delete()

Files.delete()方法可以删除一个文件或目录：

```java
Path path = Paths.get("data/subdir/logging-moved.properties");

try {
    Files.delete(path);
} catch (IOException e) {
    //deleting file failed
    e.printStackTrace();
}
```

## Files.walkFileTree()

Files.walkFileTree()方法具有递归遍历目录的功能。

walkFileTree接受一个Path和FileVisitor作为参数。

Path对象是需要遍历的目录，FileVistor则会在每次遍历中被调用。

ps: 这方法用来做文件遍历，是真心强大。

- 实现的示例代码

FileVisitor需要调用方自行实现，然后作为参数传入walkFileTree().FileVisitor的每个方法会在遍历过程中被调用多次。

如果不需要处理每个方法，那么可以继承他的默认实现类SimpleFileVisitor，它将所有的接口做了空实现。

```java
Files.walkFileTree(path, new FileVisitor<Path>() {
  @Override
  public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
    System.out.println("pre visit dir:" + dir);
    return FileVisitResult.CONTINUE;
  }

  @Override
  public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
    System.out.println("visit file: " + file);
    return FileVisitResult.CONTINUE;
  }

  @Override
  public FileVisitResult visitFileFailed(Path file, IOException exc) throws IOException {
    System.out.println("visit file failed: " + file);
    return FileVisitResult.CONTINUE;
  }

  @Override
  public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
    System.out.println("post visit directory: " + dir);
    return FileVisitResult.CONTINUE;
  }
});
```

### FileVisitResult

上述四个方法都返回一个 FileVisitResult 枚举对象。

具体的可选枚举项包括：

- CONTINUE

- TERMINATE

- SKIP_SIBLINGS

- SKIP_SUBTREE

返回这个枚举值可以让调用方决定文件遍历是否需要继续。 

CONTINE 表示文件遍历和正常情况下一样继续。

TERMINATE 表示文件访问需要终止。

SKIP_SIBLINGS 表示文件访问继续，但是不需要访问其他同级文件或目录。

SKIP_SUBTREE 表示继续访问，但是不需要访问该目录下的子目录。这个枚举值仅在preVisitDirectory()中返回才有效。如果在另外几个方法中返回，那么会被理解为CONTINE。

### Searching For Files

简单的例子，当然一般我们使用通配符，实用性更强。

```java
Path rootPath = Paths.get("data");
String fileToFind = File.separator + "README.txt";

try {
  Files.walkFileTree(rootPath, new SimpleFileVisitor<Path>() {

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
      String fileString = file.toAbsolutePath().toString();
      //System.out.println("pathString = " + fileString);

      if(fileString.endsWith(fileToFind)){
        System.out.println("file found at path: " + file.toAbsolutePath());
        return FileVisitResult.TERMINATE;
      }
      return FileVisitResult.CONTINUE;
    }
  });
} catch(IOException e){
    e.printStackTrace();
}
```

### 递归删除文件

Files.walkFileTree()也可以用来删除一个目录以及内部的所有文件和子目。

Files.delete()只用用于删除一个空目录。

我们通过遍历目录，然后在visitFile()接口中三次所有文件，最后在postVisitDirectory()内删除目录本身。

```java
Path rootPath = Paths.get("data/to-delete");

try {
  Files.walkFileTree(rootPath, new SimpleFileVisitor<Path>() {
    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
      System.out.println("delete file: " + file.toString());
      Files.delete(file);
      return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
      Files.delete(dir);
      System.out.println("delete dir: " + dir.toString());
      return FileVisitResult.CONTINUE;
    }
  });
} catch(IOException e){
  e.printStackTrace();
}
```

# 参考资料

## Path

http://wiki.jikexueyuan.com/project/java-nio-zh/java-nio-path.html

## Files

http://wiki.jikexueyuan.com/project/java-nio-zh/java-nio-files.html

* any list
{:toc}