---
layout: post
title:  java SPI 07-自动生成文件
date:  2018-08-02 09:47:43 +0800
categories: [JVM]
tags: [java, jvm, source-code, dubbo, sf]
published: true
---


## 系列目录

[spi 01-spi 是什么？入门使用](https://houbb.github.io/2018/08/02/spi-01-intro)

[spi 02-spi 的实战解决 slf4j 包冲突问题](https://houbb.github.io/2018/08/02/spi-02-log-adaptor)

[spi 03-spi jdk 实现源码解析](https://houbb.github.io/2018/08/02/spi-03-java-source-code)

[spi 04-spi dubbo 实现源码解析](https://houbb.github.io/2018/08/02/spi-04-dubbo-spi)

[spi 05-dubbo adaptive extension 自适应拓展](https://houbb.github.io/2018/08/02/spi-05-dubbo-adaptive-extension)

[spi 06-自己从零手写实现 SPI 框架](https://houbb.github.io/2018/08/02/spi-06-hand-write)

[spi 07-自动生成 SPI 配置文件实现方式](https://houbb.github.io/2018/08/02/spi-07-auto-generate)

## 回顾

上一节我们自己动手实现了一个简单版本的 SPI。

这一节我们一起来实现一个类似于 google auto 的工具。

## 使用演示

### 类实现

- Say.java

定义接口

```java
@SPI
public interface Say {

    void say();

}
```

- SayBad.java

```java
@SPIAuto("bad")
public class SayBad implements Say {

    @Override
    public void say() {
        System.out.println("bad");
    }

}
```

- SayGood.java

```java
@SPIAuto("good")
public class SayGood implements Say {

    @Override
    public void say() {
        System.out.println("good");
    }
    
}
```

### 执行效果

执行 `mvn clean install` 之后。

在 `META-INF/services/` 文件夹下自动生成文件 `com.github.houbb.spi.bs.spi.Say`

内容如下：

```
good=com.github.houbb.spi.bs.spi.impl.SayGood
bad=com.github.houbb.spi.bs.spi.impl.SayBad
```

## 代码实现

本部分主要用到编译时注解，难度相对较高。

所有源码均已开源在 [lombok-ex](https://github.com/houbb/lombok-ex)

### 注解定义

```java
@Retention(RetentionPolicy.SOURCE)
@Target({ElementType.TYPE})
@Documented
public @interface SPIAuto {

    /**
     * 别称
     * @return 别称
     * @since 0.1.0
     */
    String value() default "";

    /**
     * 目标文件夹
     * @return 文件夹
     * @since 0.1.0
     */
    String dir() default "META-INF/services/";

}
```

其实这里 dir() 可以不做暴露，这里后期想做更加灵活的拓展，所以暂定为这样。

### 核心实现

```java
@SupportedAnnotationTypes("com.github.houbb.lombok.ex.annotation.SPIAuto")
@SupportedSourceVersion(SourceVersion.RELEASE_7)
public class SPIAutoProcessor extends BaseClassProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        java.util.List<LClass> classList = super.getClassList(roundEnv, getAnnotationClass());
        Map<String, Set<String>> spiClassMap = new HashMap<>();

        for (LClass lClass : classList) {
            String spiClassName = getSpiClassName(lClass);

            String fullName = lClass.classSymbol().fullname.toString();
            if(StringUtil.isEmpty(spiClassName)) {
                throw new LombokExException("@SPI class not found for class: "
                        + fullName);
            }
            Pair<String, String> aliasAndDirPair = getAliasAndDir(lClass);
            String newLine = aliasAndDirPair.getValueOne()+"="+fullName;

            // 完整的路径：文件夹+接口名
            String filePath = aliasAndDirPair.getValueTwo()+spiClassName;

            Set<String> lineSet = spiClassMap.get(filePath);
            if(lineSet == null) {
                lineSet = new HashSet<>();
            }
            lineSet.add(newLine);
            spiClassMap.put(filePath, lineSet);
        }

        // 生成文件
        generateNewFiles(spiClassMap);

        return true;
    }
}
```

整体流程：

（1）遍历所有类，找到带有 `SPIAuto` 注解的类

（2）根据类信息，注解信息，将所有类按照 SPI 接口分组，存储在 map 中

（3）根据 map 中的信息，生成对应的配置文件信息。

### 获取 SPI 接口方法名称

获取当前类的所有接口，并且找到第一个使用 `@SPI` 标注的接口返回。

```java
/**
 * 获取对应的 spi 类
 * @param lClass 类信息
 * @return 结果
 * @since 0.1.0
 */
private String getSpiClassName(final LClass lClass) {
    List<Type> typeList =  lClass.classSymbol().getInterfaces();
    if(null == typeList || typeList.isEmpty()) {
        return "";
    }
    // 获取注解对应的值
    SPIAuto auto = lClass.classSymbol().getAnnotation(SPIAuto.class);
    for(Type type : typeList) {
        Symbol.ClassSymbol tsym = (Symbol.ClassSymbol) type.tsym;
        //TOOD: 后期这里添加一下拓展。
        if(tsym.getAnnotation(SPI.class) != null) {
            return tsym.fullname.toString();
        }
    }
    return "";
}
```

### 获取注解信息

注解主要是为了更加灵活指定，相对比较简单，实现如下：

针对类的别名默认是类名首字母小写，类似于 spring。

```java
private Pair<String, String> getAliasAndDir(LClass lClass) {
    // 获取注解对应的值
    SPIAuto auto = lClass.classSymbol().getAnnotation(SPIAuto.class);
    //1. 别称
    String fullClassName = lClass.classSymbol().fullname.toString();
    String simpleClassName = fullClassName.substring(fullClassName.lastIndexOf("."));
    String alias = auto.value();
    if(StringUtil.isEmpty(alias)) {
        alias = StringUtil.firstToLowerCase(simpleClassName);
    }
    return Pair.of(alias, auto.dir());
}
```

### 生成文件

生成文件是实现最核心饿部分，主要参考 google 的 [auto](https://github.com/google/auto) 实现：

其实主要难点在于文件的路径获取，这一点在编译时注解中比较麻烦，所以导致代码写的比较冗余。

```java
/**
 * 创建新的文件
 * key: 文件路径
 * value: 对应的内容信息
 * @param spiClassMap 目标文件路径
 * @since 0.1.0
 */
private void generateNewFiles(Map<String, Set<String>> spiClassMap) {
    Filer filer = processingEnv.getFiler();
    for(Map.Entry<String, Set<String>> entry : spiClassMap.entrySet()) {
        String fullFilePath = entry.getKey();
        Set<String> newLines = entry.getValue();
        try {
            // would like to be able to print the full path
            // before we attempt to get the resource in case the behavior
            // of filer.getResource does change to match the spec, but there's
            // no good way to resolve CLASS_OUTPUT without first getting a resource.
            FileObject existingFile = filer.getResource(StandardLocation.CLASS_OUTPUT, "",fullFilePath);
            System.out.println("Looking for existing resource file at " + existingFile.toUri());
            Set<String> oldLines = readServiceFile(existingFile.openInputStream());
            System.out.println("Looking for existing resource file set " + oldLines);
            // 写入
            newLines.addAll(oldLines);
            writeServiceFile(newLines, existingFile.openOutputStream());
            return;
        } catch (IOException e) {
            // According to the javadoc, Filer.getResource throws an exception
            // if the file doesn't already exist.  In practice this doesn't
            // appear to be the case.  Filer.getResource will happily return a
            // FileObject that refers to a non-existent file but will throw
            // IOException if you try to open an input stream for it.
            // 文件不存在的情况下
            System.out.println("Resources file not exists.");
        }
        try {
            FileObject newFile = filer.createResource(StandardLocation.CLASS_OUTPUT, "",
                    fullFilePath);
            try(OutputStream outputStream = newFile.openOutputStream();) {
                writeServiceFile(newLines, outputStream);
                System.out.println("Write into file "+newFile.toUri());
            } catch (IOException e) {
                throw new LombokExException(e);
            }
        } catch (IOException e) {
            throw new LombokExException(e);
        }
    }
}
```

## 其他

整体思路就是这样，还有一些细节此处就不再展开了。

欢迎移步 github [lombok-ex](https://github.com/houbb/lombok-ex)。

如果对你有帮助，给个 star 鼓励一下作者~

## 进步一思考

生态作为框架的一部分，主要是为了给使用者提供便利。

实际上这个工具可以做的更加灵活，比如可以为 dubbo spi 自动生成 spi 配置文件。

# 参考资料

[AutoServiceProcessor](https://github.com/google/auto/blob/master/service/processor/src/main/java/com/google/auto/service/processor/AutoServiceProcessor.java)

* any list
{:toc}