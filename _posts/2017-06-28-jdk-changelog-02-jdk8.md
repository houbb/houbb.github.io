---
layout: post
title: jdk 变更日志-01-JDK 8u381 Release Notes
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---


# Java SE 8u381 打包补丁发布（BPR）- Bug修复与更新

以下部分总结了所有Java SE 8u381 BPR中所做的更改。Bug修复和其他任何更改按日期顺序列出，最新的BPR首先列出。请注意，前一个BPR中的Bug修复也包含在当前BPR中。

## Java SE 8u381 b33 中的更改

### Bug修复

| BugId                 | 类别         | 子类别       | 概述                                                  |
|-----------------------|--------------|--------------|--------------------------------------------------------|
| JDK-6176679           | client-libs  | java.awt     | 将动画gif图像复制到系统剪贴板时应用程序冻结            |
| JDK-8286481           | client-libs  | java.awt     | 在Windows上存储透明图像在剪贴板中时，将异常打印到stdout |
| JDK-8314188 (非公开)   | install      | install      | [macOS] 安装完成确认消息未显示                          |

## Java SE 8u381 b32 中的更改

### Bug修复

| BugId                 | 类别         | 子类别       | 概述                                                  |
|-----------------------|--------------|--------------|--------------------------------------------------------|
| JDK-8306899 (非公开)   | install      | install      | JRE 8u371 MSI 无法安装并行JREs                          |
| JDK-8311244 (非公开)   | hotspot      | gc           | 更新到JDK8u371后，在g1CollectedHeap.cpp:5923处频繁崩溃  |

## Java™ SE Development Kit 8, Update 381 (JDK 8u381)
发布日期：2023年7月18日

此更新发布的完整版本字符串为8u381-b09（其中"b"代表"build"）。版本号为8u381。

## IANA TZ Data 2023c

JDK 8u381 包含IANA时区数据2023c，与上一次更新相比，包含以下更改：

- 埃及现在再次使用夏令时，从4月到10月。
- 今年摩洛哥4月23日，而不是4月30日进入夏令时。
- 巴勒斯坦今年推迟开始夏令时。
- 从2024年起，格陵兰岛大部分地区仍使用夏令时。
- America/Yellowknife 现在链接到 America/Edmonton。
- tzselect 现在可以使用当前时间来帮助推断时区。
- 代码现在默认为C99或更高版本。
- 修复使用C23属性。
- 此版本的代码和数据与2023a相同。
  
更多信息，请参阅JRE软件中的时区数据版本。

## 安全基线

发布JDK 8u381时，Java Runtime Environment（JRE）的安全基线如下表所示：

| JRE Family Version | JRE Security Baseline (Full Version String) |
|--------------------|-----------------------------------------------|
| 8                  | 8u381-b09                                     |

## 保持JDK更新

Oracle建议每次关键补丁更新时更新JDK。为了确定发布是否是最新版本，可以使用安全基线页面确定每个发布系列的最新版本。

关键补丁更新，其中包含安全漏洞修复，提前一年在关键补丁更新、安全警报和公告中宣布。不建议在计划于2023年10月17日进行的下一个关键补丁更新后使用此JDK（版本8u381）。

管理大量桌面JRE更新/安装的Java SE订阅客户应考虑使用Java Advanced Management Console（AMC）。

对于无法访问Oracle服务器的系统，第二机制将在2023-11-17过期此JRE（版本8u381）。在满足任一条件后（新版本变得可用或到达到期日期），JRE将向用户提供额外的警告和提醒以更新到新版本。更多信息，请参阅Java平台标准版部署指南中的23.1.2 JRE到期日期。

# 新功能

## core-libs/java.lang
### ➜ 允许额外字符以支持GB18030-2022 (JDK-8301400)
中国国家标准化管理委员会(CESI)最近发布了GB18030-2022。这是GB18030标准的更新版本，将GB18030与Unicode版本11.0同步。此增强功能的目的是将Unicode 11.0中的35个代码点（U+9FCD - U+9FEF）整合到Java SE 8中，以使实现符合其实现级别1的要求。

## core-libs/java.nio.charsets
### ➜ 支持GB18030-2022 (JDK-8307229)
中国国家标准化管理委员会(CESI)最近发布了GB18030-2022，这是GB18030标准的更新版本，将GB18030与Unicode版本11.0同步。此新标准的字符集实现现已替代之前的2000标准。但是，这个新标准与之前的实现有一些不兼容的变化。对于需要使用旧映射的人，引入了一个新的系统属性`jdk.charset.GB18030`。通过将其值设置为2000，将使用基于2000标准的旧JDK版本的GB18030字符集映射。

## core-libs/java.lang
### ➜ 允许额外字符以支持GB18030-2022 (Level 2) (JDK-8305681)
中国国家标准化管理委员会(CESI)最近发布了GB18030-2022。这是GB18030标准的更新版本，将GB18030与Unicode版本11.0同步。此增强功能的目的是将Unicode 11.0中的108个代码点从CJK统一表意字符扩展E块整合到Java SE 8中，以使实现符合其实现级别2的要求。

## security-libs/javax.crypto
### ➜ JDK现在接受PKCS#1格式的RSA密钥 (JDK-8023980)
JDK提供者，如来自SunRsaSign提供者的RSA KeyFactory.impl，现在可以接受PKCS#1格式的RSA私钥和公钥。RSA私钥或公钥对象应具有PKCS#1格式和与ASN.1语法匹配的编码，用于PKCS#1 RSA私钥和公钥。

# 已知问题

## install
### ➜ 如果系统用户使用共享文件，则在Windows上升级JDK存在问题 (JDK-8310932 (非公开))
从2023年7月开始，JDK的默认行为是安装到同一个共享的jdk-(family)目录中。如果JDK文件被“系统用户”锁定，可能会导致FilesInUse问题。我们建议在升级之前关闭使用JDK作为“系统用户”的任何应用程序。

## hotspot/gc
### ➜ 升级到JDK 8u371或JDK 8u381后，JVM在内部错误(g1CollectedHeap.cpp:5923)下崩溃 (JDK-8311244 (非公开))
存在应用程序崩溃的可能性，错误如下：

```
# Internal Error (g1CollectedHeap.cpp:5923), pid=xxxxx, tid=xxxxxx
# guarantee(!dcqs.completed_buffers_exist_dirty()) failed: must be
```

这影响使用G1 GC在所有支持的平台上的JDK 8u371和JDK 8u381运行时。现在，在My Oracle Support上可用的JDK 8u381 b32 Bundle Patch Release中已经纠正了此故障。

## install
### ➜ 8u371 32位升级后没有默认Java (JDK-8306784 (非公开))
当已经安装了8u371（或更高版本）64位JRE时，从8u361（或更早版本）32位JRE升级到8u371（或更高版本）32位JRE将导致java.exe命令找不到。例如：

1. 安装32位8u361
2. 安装64位8u371（或更高版本）
3. 安装32位8u371（或更高版本）

现在从所有地方都无法工作java.exe。它只会直接从bin目录工作。

除非您指定JRE的\bin目录的完整路径，否则java.exe不会工作。

有2种解决方法：

- 解决方法1：卸载并重新安装64位8u371（或更高版本）
- 解决方法2：在JRE的\bin目录中指定java.exe的完整路径，例如：C:\Program Files\Java\jre-1.8\bin\java.exe

# 其他注释

## hotspot/runtime
### ➜ 在8u381中的Cgroup v2支持和改进 (JDK-8307634)
JDK 8u381包括多项增强和修复，以改进容器的cgroup v1和v2支持。这些改进包括准确检测容器的资源限制、正确报告收集的容器指标、打印额外的容器信息以及在容器化环境中改进应用程序稳定性。

其中一些值得注意的稳定性增强是：

- JDK-8292083：在容器化环境中运行的Java应用程序可能会遇到内存不足错误，并有被OOM killer杀死的风险，当容器配置的内存限制高于主机系统上可用的物理内存时。JDK 8u381解决了这个稳定性问题。在之前的版本中，可以通过使用-XX:-UseContainerSupport、-XX:MaxRAM=<物理内存>或通过设置容器的内存限制来避免此情况，该限制低于物理内存。

- JDK-8286030：此版本解决了当相同的/tmp目录在多个容器之间共享时，Java应

用程序可能遇到致命错误的问题。在早期版本中，可以通过将/tmp挂载到不同的位置以避免此崩溃。或者，可以使用'-XX:-UsePerfData' JVM选项来防止在不同容器中运行的JVM写入性能数据到共享的/tmp文件夹，从而避免此问题。

## install/install
### ➜ 从8u371开始，新的RPM包将使旧的JDK 8包作废并禁止降级 (JDK-8307400)
向JDK 8 RPM包添加了一个"Obsoletes"标签，以允许从旧的JDK 8 RPM包进行自动升级。

- jdk-1.8包作废了jdk1.8包。
- jre-1.8包作废了jre1.8包。
- jdk-1.8-headful包作废了jdk1.8包。
- jre-1.8-headful包作废了jre1.8包。

没有向jdk-1.8-headless包添加"Obsoletes"标签，以防止从完整到无头JDK的降级。

这些更改允许从8u151更新开始的JDK 8 RPM包的自动升级，当时首次引入了jdk1.8和jre1.8包名称。旧的JDK 8更新将无法自动升级到8u381和更高版本。

由于"Obsoletes"标签的限制，不支持从8u381降级到旧版本。

## install/install
### ➜ Linux上的缺失的/usr/java/default符号链接已恢复 (JDK-8306690)
在Linux平台上，由RPM安装程序创建的/usr/java/default符号链接不会再出现。如果不存在，安装程序将创建/usr/java/default符号链接，目标是/usr/java/latest符号链接。

## install/install
### ➜ JDK RPM的安装会损坏Alternatives (JDK-8308244)
JDK RPM安装程序将从旧的Oracle JDK RPM安装程序注册的"java"和"javac"组中删除不正确构造的条目，然后注册新的"java"和"javac"条目。

不正确构造的"java"组条目包含应该属于"javac"组的命令。

不正确构造的"javac"组条目包含应该属于"java"组的命令。

所有属于Oracle JDK RPM包的不正确构造的条目都将从替代品中删除，以避免损坏替代品的内部数据。

删除对于已安装了多个未更新到最新版本的JDK版本的用户可能有潜在的副作用。从已移除的"java"或"javac"组中的命令现在对系统Java开关不可用，这可能会在没有警告的情况下更改当前系统Java。例如，如果有一个来自11+版本的过时的JDK RPM，例如11.0.17，其中有一个不正确构造的单一"java"组安装，并且安装了带有此补丁的8u381 RPM，则将从11.0.17 RPM中的"java"组中删除条目，从而将当前系统Java从11.0.17更改为8u381。副作用仅在安装具有修复的较低JDK系列（例如8u381）并且在系统上安装了较高系列（例如11.0.17）的过时JDK时才会发生。在这种情况下，8u381将替换较旧的11.0.17作为最新版本。用户的补救措施是安装最新的JDK 11。

## security-libs/java.security
### ➜ 添加了TWCA根CA证书 (JDK-8305975)
以下根证书已添加到cacerts信任存储：

+ TWCA

  + twcaglobalrootca
    DN: CN=TWCA Global Root CA, OU=Root CA, O=TAIWAN-CA, C=TW

## security-libs/java.security
### ➜ 添加了4个GTS根CA证书 (JDK-8307134)
以下根证书已添加到cacerts信任存储：

+ Google Trust Services LLC

 + gtsrootcar1
  DN: CN=GTS Root R1, O=Google Trust Services LLC, C=US

+ Google Trust Services LLC
 + gtsrootcar2
  DN: CN=GTS Root R2, O=Google Trust Services LLC, C=US

+ Google Trust Services LLC
 + gtsrootecccar3
  DN: CN=GTS Root R3, O=Google Trust Services LLC, C=US

+ Google Trust Services LLC
 + gtsrootecccar4
  DN: CN=GTS Root R4, O=Google Trust Services LLC, C=US

## security-libs/java.security
### ➜ 添加了微软公司的2个TLS根CA证书 (JDK-8304760)
以下根证书已添加到cacerts信任存储：

+ Microsoft Corporation

  + microsoftecc2017
    DN: CN=Microsoft ECC Root Certificate Authority 2017, O=Microsoft Corporation, C=US

+ Microsoft Corporation
  + microsoftrsa2017
    DN: CN=Microsoft RSA Root Certificate Authority 2017, O=Microsoft Corporation, C=US

## core-libs/java.lang
### ➜ 系统属性java.specification.maintenance.version设置为5 (JDK-8303028)
此JDK实现了Java SE 8规范（JSR 337）的维护发布5。这由系统属性java.specification.maintenance.version的值为"5"表示。

## hotspot/runtime
### ➜ CDS存档的ASLR支持 (JDK-8294323 (非公开))
从2023年7月开始，在启用了ASLR（地址空间布局随机化）的操作系统上，CDS存档将被放置在操作系统选择的随机地址。

这种更改可能会有轻微的性能影响：(a)启动时间可能会增加，因为JVM需要

修补CDS存档内的指针；(b)内存使用可能会增加，因为CDS存档使用的内存现在不再跨进程共享。我们预计影响将很小，因为这种增加应该只是整体应用使用量的一小部分。

如果您必须禁用CDS的ASLR，您可以使用JVM标志-XX:+UnlockDiagnosticVMOptions -XX:ArchiveRelocationMode=0。不建议使用这些标志。

## security-libs/java.security
### ➜ 如果默认的java.security文件加载失败，则抛出错误 (JDK-8155246)
当默认的conf/security/java.security安全配置文件加载失败时，已进行了行为更改。在这种情况下，JDK现在会抛出一个InternalError。

这种情况永远不应发生。默认的安全文件应始终存在。在此更改之前，加载了静态安全配置。

## security-libs/java.security
### ➜ 新的系统属性来控制签名文件的最大大小 (JDK-8300596 (非公开))
已添加了一个新的系统属性，jdk.jar.maxSignatureFileSize，允许应用程序控制签名JAR中签名文件的最大大小。系统属性的值是以字节为单位的期望大小。默认值为8000000字节。


* any list
{:toc}