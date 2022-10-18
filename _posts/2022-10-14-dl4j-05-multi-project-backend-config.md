---
layout: post
title: DeepLearning4j-05-Multi Project backend config 后端配置
date:  2022-10-14 09:22:02 +0800
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

# 后端

Eclipse Deeplearning4j 的硬件设置，包括 GPU 和 CUDA。

ND4J 在所谓的后端或线性代数库上工作，例如 Native nd4j-native 和 nd4j-cuda-10.2 (GPU)，您可以通过将正确的依赖项粘贴到项目的 POM.xml 文件中来选择它们。

## 用于 GPU 和 CPU 的 ND4J 后端

通过更改 ND4J 的 POM.xml 文件中的依赖关系，您可以为后端线性代数运算选择 GPU 或本机 CPU。 

您的选择将影响您的应用程序中使用的 ND4J 和 DL4J。

如果您安装了 CUDA v9.2+ 和 NVIDIA 兼容的硬件，那么您的依赖声明将如下所示：

```xml
<dependency>
 <groupId>org.nd4j</groupId>
 <artifactId>nd4j-cuda-11.2</artifactId>
 <version>1.0.0-M1.1</version>
</dependency>
```

截至目前，CUDA 版本的 artifactId 可以是 nd4j-cuda-11.0、nd4j-cuda-11.2 之一。 

通常，给定版本支持最后 2 个 cuda 版本。

您还可以通过 Maven Central 搜索或在发行说明中找到可用的 CUDA 版本。

否则，您将需要使用 ND4J 的本机实现作为 CPU 后端：

```xml
<dependency>
 <groupId>org.nd4j</groupId>
 <artifactId>nd4j-native</artifactId>
 <version>1.0.0-M1.1</version>
</dependency>
```

## 为多个操作系统构建

如果您在多个操作系统/系统架构上开发项目，您可以将 -platform 添加到 artifactId 的末尾，这将为大多数主要系统下载二进制文件。

```xml
<dependency>
 ...
 <artifactId>nd4j-native-platform</artifactId>
 ...
</dependency>
```

## 捆绑多个后端

为了在运行时启用不同的后端，您可以通过环境变量设置环境的优先级

```
BACKEND_PRIORITY_CPU=SOME_NUM
BACKEND_PRIORITY_GPU=SOME_NUM
```

相对于优先级，它将允许您动态设置后端类型。

# CPU

## 什么是 AVX，它为什么重要？

AVX（高级矢量扩展）是一组用于加速数值计算的 CPU 指令。有关更多详细信息，请参阅维基百科。

请注意，AVX 仅适用于 x86 设备的 nd4j-native (CPU) 后端，不适用于 GPU 和 ARM/PPC 设备。

为什么 AVX 很重要：性能。您想使用系统支持的最高级别 AVX 编译的 ND4J 版本。

对不同 CPU 的 AVX 支持 - 摘要：

大多数现代 x86 CPU：支持 AVX2

部分高端服务器CPU：可能支持AVX512

旧 CPU（2012 年之前）和低功耗 x86（Atom、Celeron）：不支持 AVX（通常）

请注意，支持更高版本 AVX 的 CPU 也包括所有早期版本。这意味着可以在支持 AVX512 的系统上运行通用 x86 或 AVX2 二进制文件。但是，无法在不支持这些指令的 CPU 上运行为更高版本（例如 
avx512）构建的二进制文件。

在版本 1.0.0-beta6 及更高版本中，如果 AVX 未进行最佳配置，您可能会收到如下警告：

```
*********************************** CPU Feature Check Warning ***********************************
Warning: Initializing ND4J with Generic x86 binary on a CPU with AVX/AVX2 support
Using ND4J with AVX/AVX2 will improve performance. See deeplearning4j.org/cpu for more details
Or set environment variable ND4J_IGNORE_AVX=true to suppress this warning
************************************************************************************************
```

## 配置 mkl 使用

在 intel 平台上使用 nd4j-native 后端时，我们的 openblas 绑定提供了同时使用 mkl 的能力。

为了使用 mkl，在启动时或在使用 Nd4j.create() 初始化 Nd4j 之前，将系统属性设置如下：

```java
System.setProperty("org.bytedeco.openblas.load", "mkl");
```

## 在 ND4J/DL4J 中配置 AVX

如前所述，为了获得最佳性能，您应该使用与您的 CPU 支持的 AVX 级别相匹配的 ND4J 版本。

ND4J 默认配置（当仅包括 nd4j-native 或 nd4j-native-platform 依赖项而没有 maven 分类器配置时）对于 nd4j/nd4j-platform 依赖项是“通用 x86”（无 AVX）。
要配置 AVX2 和 AVX512，您需要为适当的架构指定分类器。

为 x86 架构提供了以下二进制文件（nd4j-native 分类器）：

通用 x86（无 AVX）：linux-x86_64、windows-x86_64、macosx-x86_64

AVX2：linux-x86_64-avx2、windows-x86_64-avx2、macosx-x86_64-avx2

AVX512：linux-x86_64-avx512

从 1.0.0-M1 开始，以下组合也可以使用 onednn：

通用 x86（无 AVX）：linux-x86_64-onednn、windows-x86_64-onednn、macosx-x86_64-onednn

AVX2：linux-x86_64-onednn-avx2、windows-x86_64-onednn-avx2、macosx-x86_64-onednn-avx2

AVX512：linux-x86_64-onednn-avx512

- 示例：在 Windows 上配置 AVX2 (Maven pom.xml)

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-native</artifactId>
    <version>${nd4j.version}</version>
</dependency>

<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-native</artifactId>
    <version>${nd4j.version}</version>
    <classifier>windows-x86_64-avx2</classifier>
</dependency>
```

- Example: Configuring AVX512 on Linux (Maven pom.xml)

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-native</artifactId>
    <version>${nd4j.version}</version>
</dependency>

<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-native</artifactId>
    <version>${nd4j.version}</version>
    <classifier>linux-x86_64-avx512</classifier>
</dependency>
```

- Example: Configuring AVX512 on Linux with onednn(Maven pom.xml)

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-native</artifactId>
    <version>${nd4j.version}</version>
</dependency>

<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-native</artifactId>
    <version>${nd4j.version}</version>
    <classifier>linux-x86_64-onednn-avx512</classifier>
</dependency>
```

请注意，您需要 nd4j-native 依赖项 - 有和没有分类器。

在上面的示例中，假设 Maven 属性 nd4j.version 设置为适当的 ND4J 版本，例如 1.0.0-M1.1

# Cudnn

## 将 Deeplearning4j 与 cuDNN 结合使用

有两种方法可以将 cudnn 与 deeplearning4j 一起使用。 

一种是下面描述的旧方法，它内置在 java 级别的各种 deeplearning4j 层中。

另一种是使用在 c++ 级别链接到 cudnn 的新 nd4j cuda 绑定。 

两者都将在下面进行描述。 新方法先，旧方法后。

## Cudnn 设置

cuDNN 的实际库未捆绑，因此请务必从 NVIDIA 下载并安装适合您平台的软件包：

英伟达 cuDNN

请注意，支持多种 cuDNN 和 CUDA 组合。 Deeplearning4j 的 cuda 支持基于 javacpp 的 cuda 绑定。读取版本的方式是：cuda 版本 - cudnn 版本 - javacpp 版本。例如，如果 cuda 版本设置为 11.2，您可以期望我们支持 cudnn 8.1。

要安装，只需将库解压缩到本机库使用的系统路径中的目录即可。最简单的方法是将它与来自 CUDA 的其他库放在默认目录中（Linux 上的 /usr/local/cuda/lib64/、Mac OS X 上的 /usr/local/cuda/lib/ 和 C:\Program Files\ NVIDIA GPU Computing Toolkit\CUDA\v10.0\bin\、C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1\bin\ 或 C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10。 2\bin\ 在 Windows 上）。

或者，对于最新支持的 cuda 版本，cuDNN 与 JavaCPP Presets for CUDA 的“redist”包捆绑在一起。

同意许可后，我们可以添加以下依赖项，而不是安装 CUDA 和 cuDNN：

```xml
<dependency>
     <groupId>org.bytedeco</groupId>
     <artifactId>cuda-platform-redist</artifactId>
     <version>$CUDA_VERSION-$CUDNN_VERSIUON-$JAVACPP_VERSION</version>
</dependency>
```

## 通过 nd4j 使用 cuDNN

与我们的 avx 绑定类似，nd4j 利用我们的 c++ 库 libnd4j 来运行数学运算。 

为了使用 cudnn，您需要做的就是更改 cuda 后端依赖项：

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-cuda-11.4</artifactId>
    <version>1.0.0-M2.1</version>
</dependency>
```

or 

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-cuda-11.4</artifactId>
    <version>1.0.0-M2.1</version>
</dependency>
```

TO

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-cuda-11.6</artifactId>
    <version>1.0.0-M2.1</version>
</dependency>
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-cuda-11.6</artifactId>
    <version>1.0.0-M2.1</version>
    <classifier>linux-x86_64-cudnn</classifier>
</dependency>
```

of for cuda 11.0:

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-cuda-11.4</artifactId>
    <version>1.0.0-M2.1</version>
</dependency>
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-cuda-11.4</artifactId>
    <version>1.0.0-M2.1</version>
    <classifier>linux-x86_64-cudnn</classifier>
</dependency>
```

For jetson nano cuda 10.2:

```xml
<dependency>
  <groupId>org.nd4j</groupId>
  <artifactId>nd4j-cuda-10.2</artifactId>
  <version>1.0.0-M2.1</version>
</dependency>

<dependency>
  <groupId>org.nd4j</groupId>
  <artifactId>nd4j-cuda-10.2</artifactId>
  <version>1.0.0-M2.1</version>
  <version>linux-arm64</version>
</dependency>
```

对于 windows（注意：我们所做的只是将 linux 更改为 windows，相同的 cuda 版本适用于 linux 和 windows）：

```xml
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-cuda-11.6</artifactId>
    <version>1.0.0-M2.1</version>
</dependency>
<dependency>
    <groupId>org.nd4j</groupId>
    <artifactId>nd4j-cuda-11.6</artifactId>
    <version>1.0.0-M2.1</version>
    <classifier>windows-x86_64-cudnn</classifier>
</dependency>
```

请注意，我们只是添加了一个额外的依赖项。 我们使用附加分类器的原因是引入对基于 cudnn 的例程的可选依赖。 

默认不使用 cudnn，而是为 cudnn 中实现的各种操作（如 conv2d 和 lstm）内置独立例程。

对于 nd4j-cuda-11.2-platform 等 -platform 依赖项的用户，仍然需要此分类器。 

-platform 依赖项尝试为每个平台设置合理的默认值，但让用户可以选择包含他们想要的任何内容。 

如果您需要优化，请熟悉这一点。

# 参考资料

https://deeplearning4j.konduit.ai/multi-project/explanation/configuration/backends

* any list
{:toc}