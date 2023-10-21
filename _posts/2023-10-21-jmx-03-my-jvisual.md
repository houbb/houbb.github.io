---
layout: post
title: jmx-03-JMX获取jvm参数，cpu使用率，内存，线程，类等信息,实现一个简单的web版jvisualvm
date:  2021-10-21 13:41:43 +0800
categories: [Java]
tags: [java, jmx, monitor]
published: true
---


# 一 什么是JMX

JMX（英语：Java Management Extensions，即Java管理扩展）是Java平台上为应用程序、设备、系统等植入管理功能的框架。JMX可以跨越一系列异构操作系统平台、系统体系结构和网络传输协议，灵活的开发无缝集成的系统、网络和服务管理应用。

以上是维基百科的介绍

JMX即Java Management Extensions（Java管理扩展），是Java SE的一部分，在Java2的时候加入到Java SE平台中，但Java5才正式发布。

JMX提供了一个非常简单的途径去管理应用程序的资源，这里的所说的资源包括内存资源，磁盘资源等，而且因为JMX相关技术是动态的，所以可以在应用程序运行时监控和管理资源。

想必大家都听说过 jconsole或jvisualvm，它们就是用jmx实现的。

# 二 MBean

具体可参阅 [oracle官网](https://docs.oracle.com/javase/tutorial/jmx/mbeans/index.html)

MBean是类似于JavaBeans组件的托管Java对象，它遵循JMX规范中阐明的设计模式。

MBean可以代表设备，应用程序或任何需要管理的资源。MBean公开了一个包含以下内容的管理接口：

一组可读或可写的属性，或两者兼而有之。

一组可调用的操作。

自我描述。

在MBean实例的整个生命周期中，管理界面都不会更改。当某些预定义事件发生时，MBeans也可以发出通知。

JMX规范定义了五种类型的MBean：

- Standard MBeans

- Dynamic MBeans

- Open MBeans

- Model MBeans

- MXBeans


下面介绍了一种特殊的MBean类型，称为MXBeans。

一个的MXBean是一种MBean的只引用一组预定义的数据类型。

这样，您可以确保您的MBean可被任何客户端（包括远程客户端）使用，而无需客户端有权访问代表MBean类型的特定于模型的类。MXBean提供了一种方便的方法来将相关值捆绑在一起，而无需将客户端特别配置为处理捆绑。

以与标准MBean相同的方式，通过编写称为的Java接口SomethingMXBean和实现该接口的Java类来定义MXBean 。

但是，与标准MBean不同，MXBean不需要调用Java类Something。接口中的每个方法都定义MXBean中的属性或操作。注释@MXBean也可以用于注释Java接口，而不是要求接口名称后跟MXBean后缀。

软件包中的Java 2 Platform Standard Edition（J2SE）5.0软件中存在MXBean java.lang.management。

包里提供了许多MXBean的接口类，可以很方便的获取到JVM的内存、GC、线程、锁、class、甚至操作系统层面的各种信息,本文就简单的介绍 一种利用JMX对JAVA进程进行CPU、堆内存使用的监控。

咱们经常使用jsconsole中的（概述/内存/线程/类/vm概要）就是通过java.lang.management中的定义的MXBean 获取到的。·

# 三 获取MXBean

获取MXBean有本地调用和jmxrmi(远程调用)两种方式，通过ManagementFactory（java.lang.management.ManagementFactory）工厂类获取。

ManagementFactory类是用于获取Java平台的受管Bean的工厂类。 该类由静态方法组成，每个方法返回一个或多个表示Java虚拟机组件的管理接口的平台MXBeans 。

## 1 本地调用

本地调用自能获取当前程序所运行的jvm所加载的MXBean信息

```java
//获取内存
MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
//获取编译信息
CompilationMXBean compilationMXBean = ManagementFactory.getCompilationMXBean();
//获取系统信息
OperatingSystemMXBean operatingSystemMXBean = ManagementFactory.getOperatingSystemMXBean();
//获取运行时信息
RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
//获取线程信息
ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
//获取类加载信息
ClassLoadingMXBean classLoadingMXBean = ManagementFactory.getClassLoadingMXBean();
//获取内存池的管理(如堆，元空间)信息
List<MemoryPoolMXBean> memoryPoolMXBeans = ManagementFactory.getMemoryPoolMXBeans();
//获取gc信息
List<GarbageCollectorMXBean> garbageCollectors = ManagementFactory.getGarbageCollectorMXBeans();
```

## 2 jmxrmi远程调用

```java
//远程服务器地址
final String HOSTNAME = "172.36.0.231";
//远程服务器端口
final int PORT = 60001;
//1.构建JMX API连接器服务器的初始化地址
String serviceURL = "service:jmx:rmi:///jndi/rmi://" + HOSTNAME + ":" + PORT + "/jmxrmi";
JMXServiceURL jmxServiceURL = new JMXServiceURL(serviceURL);
//2.初始化客户端JMX API连接器,创建与给定地址的连接器服务器的连接。
JMXConnector jmxConnector = JMXConnectorFactory.connect(jmxServiceURL, null);
//3.启动管理bean服务器连接,获取远程MBean服务器的 MBeanServerConnection对象
//MBeanServerConnection 此接口表示与MBean服务器通信的方式，无论是本地还是远程。 代表本地MBean服务器的MBeanServer接口扩展了此接口。
MBeanServerConnection mBeanServerConnection = jmxConnector.getMBeanServerConnection();

//4.拿到MBeanServerConnection后就可以通过它来获取对应的MXBean

//获取内存
MemoryMXBean memoryMXBean = ManagementFactory.newPlatformMXBeanProxy
                (mBeanServerConnection, ManagementFactory.MEMORY_MXBEAN_NAME, MemoryMXBean.class);
//获取编译信息
CompilationMXBean compilationMXBean = ManagementFactory.newPlatformMXBeanProxy
                (mBeanServerConnection, ManagementFactory.COMPILATION_MXBEAN_NAME, CompilationMXBean.class);
//获取系统信息
OperatingSystemMXBean systemMXBean = ManagementFactory.newPlatformMXBeanProxy(
    mBeanServerConnection,
    ManagementFactory.OPERATING_SYSTEM_MXBEAN_NAME,
    com.sun.management.OperatingSystemMXBean.class
);
//获取运行时信息
RuntimeMXBean runtimeMXBean = ManagementFactory.newPlatformMXBeanProxy(
    mBeanServerConnection,
    ManagementFactory.RUNTIME_MXBEAN_NAME,
    RuntimeMXBean.class
);
//获取线程信息
ThreadMXBean threadMXBean = ManagementFactory.newPlatformMXBeanProxy(
    mBeanServerConnection,
    ManagementFactory.THREAD_MXBEAN_NAME,
    ThreadMXBean.class
);
//获取类加载信息
ClassLoadingMXBean classLoading = ManagementFactory.newPlatformMXBeanProxy(
    mBeanServerConnection,
    ManagementFactory.CLASS_LOADING_MXBEAN_NAME,
    ClassLoadingMXBean.class
);
//获取内存信息
List<MemoryPoolMXBean> memoryPool = ManagementFactory.getPlatformMXBeans(mBeanServerConnection, MemoryPoolMXBean.class);
//获取gc信息
List<GarbageCollectorMXBean> garbageCollectors = ManagementFactory.getPlatformMXBeans(mBeanServerConnection, GarbageCollectorMXBean.class);
```

# 四 MXBean使用

这个基本就是些api的调用,除了 获取cpu使用情况/gc垃圾回收活动情况需要少量计算，其他信息基本都可以拿到。

```java
package com.example.demo.jmx;

import java.lang.management.ClassLoadingMXBean;
import java.lang.management.CompilationMXBean;
import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryPoolMXBean;
import java.lang.management.MemoryUsage;
import com.sun.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class HeapMain {

    private static NumberFormat fmtI = new DecimalFormat("###,###", new DecimalFormatSymbols(Locale.ENGLISH));
    private static NumberFormat fmtD = new DecimalFormat("###,##0.000", new DecimalFormatSymbols(Locale.ENGLISH));

    public static void main(String[] args) throws InterruptedException {
        //运行时情况
        RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
        //操作系统情况
        com.sun.management.OperatingSystemMXBean  os = ManagementFactory.getPlatformMXBean(com.sun.management.OperatingSystemMXBean.class);
        //线程使用情况
        ThreadMXBean threads = ManagementFactory.getThreadMXBean();
        //堆内存使用情况
        MemoryUsage heapMemoryUsage = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
        //非堆内存使用情况
        MemoryUsage nonHeapMemoryUsage = ManagementFactory.getMemoryMXBean().getNonHeapMemoryUsage();
        //类加载情况
        ClassLoadingMXBean cl = ManagementFactory.getClassLoadingMXBean();
        //内存池对象
        List<MemoryPoolMXBean> pools = ManagementFactory.getMemoryPoolMXBeans();
        //编译器和编译情况
        CompilationMXBean cm = ManagementFactory.getCompilationMXBean();
        //获取GC对象
        List<GarbageCollectorMXBean> gcmList = ManagementFactory.getGarbageCollectorMXBeans();


        //运行时情况
        System.out.printf("jvm.name (JVM名称-版本号-供应商):%s | version: %s | vendor: %s  %n", runtime.getVmName(), runtime.getVmVersion(), runtime.getVmVendor());
        System.out.printf("jvm.spec.name (JVM规范名称-版本号-供应商):%s | version: %s | vendor: %s  %n", runtime.getSpecName(), runtime.getSpecVersion(), runtime.getSpecVendor());
        System.out.printf("jvm.java.version (JVM JAVA版本):%s%n", System.getProperty("java.version"));
        System.out.printf("jvm.start.time (Java虚拟机的启动时间):%s%n", toDuration(runtime.getStartTime()));
        System.out.printf("jvm.uptime (Java虚拟机的正常运行时间):%s%n", runtime.getInputArguments());
        System.out.printf("jvm.uptime (Java虚拟机的正常运行时间):%s%n", toDuration(runtime.getUptime()));
        System.out.printf("jvm.getInputArguments (JVM 启动参数):%s%n", runtime.getInputArguments());
        System.out.printf("jvm.getSystemProperties (获取系统属性):%s%n", runtime.getSystemProperties());
        //获取cpu使用情况/gc垃圾回收活动情况
        Thread thread = new Thread(() -> showCpu(runtime, os, gcmList));
        thread.start();
        System.out.println("------------------------------------------------------------------------------------------------------");

        //编译情况
        System.out.printf("compilation.name(编译器名称)：%s%n",cm.getName());
        System.out.printf("compilation.total.time(编译器耗时)：%d毫秒%n",cm.getTotalCompilationTime());
        boolean isSupport=cm.isCompilationTimeMonitoringSupported();
        if(isSupport){
            System.out.println("支持即时编译器编译监控");
        }else{
            System.out.println("不支持即时编译器编译监控");
        }
        System.out.printf("------------------------------------------------------------------------------------------------------");
        //JVM 线程情况
        System.out.printf("jvm.threads.total.count (总线程数(守护+非守护)):%d%n", threads.getThreadCount());
        System.out.printf("jvm.threads.daemon.count (守护进程线程数):%d%n", threads.getDaemonThreadCount());
        System.out.printf("jvm.threads.peak.count (峰值线程数):%d%n", threads.getPeakThreadCount());
        System.out.printf("jvm.threads.total.start.count(Java虚拟机启动后创建并启动的线程总数):%d%n", threads.getTotalStartedThreadCount());
        for(Long threadId : threads.getAllThreadIds()) {
            System.out.printf("threadId: %d | threadName: %s%n", threadId, threads.getThreadInfo(threadId).getThreadName());
        }
        System.out.println("------------------------------------------------------------------------------------------------------");
        //获取GC信息
        for (GarbageCollectorMXBean collectorMXBean : gcmList) {
            System.out.printf("collectorMXBean.getCollectionCount(%s 垃圾回收器执行次数):%d%n",collectorMXBean.getName(), collectorMXBean.getCollectionCount());
            System.out.printf("collectorMXBean.getCollectionTime(%s 垃圾回收器执行时间):%d%n",collectorMXBean.getName(), collectorMXBean.getCollectionTime());
        }
        System.out.println("------------------------------------------------------------------------------------------------------");
        //堆内存情况
        System.out.printf("jvm.heap.init (初始化堆内存):%s %n",  bytesToMB(heapMemoryUsage.getInit()));
        System.out.printf("jvm.heap.used (已使用堆内存):%s %n", bytesToMB(heapMemoryUsage.getUsed()));
        System.out.printf("jvm.heap.committed (可使用堆内存):%s %n", bytesToMB(heapMemoryUsage.getCommitted()));
        System.out.printf("jvm.heap.max (最大堆内存):%s %n", bytesToMB(heapMemoryUsage.getMax()));

        System.out.println("------------------------------------------------------------------------------------------------------");

        //非堆内存使用情况
        System.out.printf("jvm.noheap.init (初始化非堆内存):%s %n",  bytesToMB(nonHeapMemoryUsage.getInit()));
        System.out.printf("jvm.noheap.used (已使用非堆内存):%s %n",  bytesToMB(nonHeapMemoryUsage.getUsed()));
        System.out.printf("jvm.noheap.committed (可使用非堆内存):%s %n",  bytesToMB(nonHeapMemoryUsage.getCommitted()));
        System.out.printf("jvm.noheap.max (最大非堆内存):%s %n", bytesToMB(nonHeapMemoryUsage.getMax()));

        System.out.println("------------------------------------------------------------------------------------------------------");

        //系统概况
        System.out.printf("os.name(操作系统名称-版本号):%s %s %s %n", os.getName(), "version", os.getVersion());
        System.out.printf("os.arch(操作系统内核):%s%n", os.getArch());
        System.out.printf("os.cores(可用的处理器数量):%s %n", os.getAvailableProcessors());
        System.out.printf("os.loadAverage(系统负载平均值):%s %n", os.getSystemLoadAverage());

        System.out.println("------------------------------------------------------------------------------------------------------");

        //类加载情况
        System.out.printf("class.current.load.count(当前加载类数量):%s %n", cl.getLoadedClassCount());
        System.out.printf("class.unload.count(未加载类数量):%s %n", cl.getUnloadedClassCount());
        System.out.printf("class.total.load.count(总加载类数量):%s %n", cl.getTotalLoadedClassCount());

        System.out.println("------------------------------------------------------------------------------------------------------");

        for(MemoryPoolMXBean pool : pools) {
            final String kind = pool.getType().name();
            final MemoryUsage usage = pool.getUsage();
            System.out.println("内存模型： " + getKindName(kind) + ", 内存空间名称： " + getPoolName(pool.getName()) + ", jvm." + pool.getName() + ".init(初始化):" + bytesToMB(usage.getInit()));
            System.out.println("内存模型： " + getKindName(kind) + ", 内存空间名称： " + getPoolName(pool.getName()) + ", jvm." + pool.getName() + ".used(已使用): " + bytesToMB(usage.getUsed()));
            System.out.println("内存模型： " + getKindName(kind) + ", 内存空间名称： " + getPoolName(pool.getName()) + ", jvm." + pool.getName()+ ".committed(可使用):" + bytesToMB(usage.getCommitted()));
            System.out.println("内存模型： " + getKindName(kind) + ", 内存空间名称： " + getPoolName(pool.getName()) + ", jvm." + pool.getName() + ".max(最大):" + bytesToMB(usage.getMax()));
            System.out.println("------------------------------------------------------------------------------------------------------");
        }
        thread.join();
    }

    private static void showCpu(RuntimeMXBean runtime,OperatingSystemMXBean os,List<GarbageCollectorMXBean> gcmList) {
        //上一个cpu运行记录时间点
        long prevUpTime = runtime.getUptime();
        //当时cpu运行时间
        long upTime;
        //上一次cpu运行总时间
        long prevProcessCpuTime =  os.getProcessCpuTime();
        //当前cpu运行总时间
        long processCpuTime;
        //上一次gc运行总时间
        long prevProcessGcTime = getTotalGarbageCollectionTime(gcmList);
        //当前gc运行总时间
        long processGcTime;
        //可用内核数量
        int processorCount =os.getAvailableProcessors();
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        int i =10;
        while (i>0){
            processCpuTime = os.getProcessCpuTime();
            processGcTime = getTotalGarbageCollectionTime(gcmList);
            upTime = runtime.getUptime();
            long upTimeDiff = upTime - prevUpTime;
            //计算cpu使用率
            long processTimeDiff = processCpuTime - prevProcessCpuTime;
            //processTimeDiff 取到得是纳秒数  1ms = 1000000ns
            double cpuDetail = processTimeDiff * 100.0 /1000000/ processorCount / upTimeDiff;
            //计算gccpu使用率
            long processGcTimeDiff = processGcTime - prevProcessGcTime;
            double gcDetail = processGcTimeDiff * 100.0 /1000000/ processorCount / upTimeDiff;
            System.out.printf("cpu使用率：%s ,gc使用率：%s %n",cpuDetail,gcDetail);
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            prevProcessCpuTime = processCpuTime;
            prevUpTime = upTime;
            prevProcessGcTime =processGcTime;
            i--;
        }
    }

    /**
     * 垃圾回收期总耗时
     */
    protected static long getTotalGarbageCollectionTime(List<GarbageCollectorMXBean> gcmList) {
        long total = -1L;
        for (GarbageCollectorMXBean collectorMXBean : gcmList) {
            total+=collectorMXBean.getCollectionTime();
        }
        return total;
    }

    protected static String getKindName(String kind) {
        if("NON_HEAP".equals(kind)) {
            return "NON_HEAP(非堆内存)";
        }else {
            return "HEAP(堆内存)";
        }
    }

    protected static String getPoolName(String poolName) {
        switch (poolName) {
            case "Code Cache":
                return poolName +"(代码缓存区)";
            case "Metaspace":
                return poolName +"(元空间)";
            case "Compressed Class Space":
                return poolName +"(类指针压缩空间)";
            case "PS Eden Space":
                return poolName +"(伊甸园区)";
            case "PS Survivor Space":
                return poolName +"(幸存者区)";
            case "PS Old Gen":
                return poolName +"(老年代)";
            default:
                return poolName;
        }
    }


    protected static String bytesToMB(long bytes) {
        return fmtI.format((long)(bytes / 1024 / 1024)) + " MB";
    }

    protected static String printSizeInKb(double size) {
        return fmtI.format((long) (size / 1024)) + " kbytes";
    }

    protected static String toDuration(double uptime) {
        uptime /= 1000;
        if (uptime < 60) {
            return fmtD.format(uptime) + " seconds";
        }
        uptime /= 60;
        if (uptime < 60) {
            long minutes = (long) uptime;
            String s = fmtI.format(minutes) + (minutes > 1 ? " minutes" : " minute");
            return s;
        }
        uptime /= 60;
        if (uptime < 24) {
            long hours = (long) uptime;
            long minutes = (long) ((uptime - hours) * 60);
            String s = fmtI.format(hours) + (hours > 1 ? " hours" : " hour");
            if (minutes != 0) {
                s += " " + fmtI.format(minutes) + (minutes > 1 ? " minutes" : " minute");
            }
            return s;
        }
        uptime /= 24;
        long days = (long) uptime;
        long hours = (long) ((uptime - days) * 24);
        String s = fmtI.format(days) + (days > 1 ? " days" : " day");
        if (hours != 0) {
            s += " " + fmtI.format(hours) + (hours > 1 ? " hours" : " hour");
        }
        return s;
    }

}
```

# 五 自己来实现一个 jconsole或jvisualvm

掌握了api后，掌握一点前端技能，或者swing,JavaFXML可视化技能，基本就可以来自己实现一个 jconsole或jvisualvm。

下面是我用vue(近年来很火的前端框架)+echarts(前端可视化库)+springBoot实现的一个简陋的jvisualvm，感兴趣的可与去看看 源码

# TODO

对 jmx 进行封装，实现一个内存等基本信息的管理工具。

# 参考资料

https://blog.csdn.net/AndCo/article/details/107412285

https://github.com/AndsGo/JmsWeb

* any list
{:toc}