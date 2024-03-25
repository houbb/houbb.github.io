---
layout: post
title:  Quartz 16-quartz spring 整合使用
date:  2017-12-19 14:43:25 +0800
categories: [Schedule]
tags: [java, quartz, job, schedule, spring, sh]
published: true
---

# 序言

有时候我们希望将 quartz 与 spring 进行整合使用。

# 准备工作

## 整体结构

```
│  pom.xml
│
├─src
│  └─main
│      ├─java
│      │  └─com
│      │      └─github
│      │          └─houbb
│      │              └─quartz
│      │                  └─spring
│      │                      │  CronTest.java
│      │                      │  SimpleTest.java
│      │                      │
│      │                      ├─job
│      │                      │      MyJob.java
│      │
│      └─resources
│              applicationContext-cron.xml
│              applicationContext-simple.xml
```

## maven 依赖

主要新增了 spring 的相关依赖：

```xml
<properties>
    <quartz.version>2.3.0</quartz.version>
    <slf4j-api.version>1.6.4</slf4j-api.version>
    <logback-classic.version>0.9.28</logback-classic.version>
    <jcl-over-slf4j.version>1.6.4</jcl-over-slf4j.version>
    <spring.version>4.0.5.RELEASE</spring.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.quartz-scheduler</groupId>
        <artifactId>quartz</artifactId>
        <version>${quartz.version}</version>
    </dependency>
    <dependency>
        <groupId>org.quartz-scheduler</groupId>
        <artifactId>quartz-jobs</artifactId>
        <version>${quartz.version}</version>
    </dependency>
    <!-- 日志框架API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>${slf4j-api.version}</version>
    </dependency>
    <!-- 日志实现提供者 -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>${logback-classic.version}</version>
        <exclusions>
            <exclusion>
                <groupId>commons-logging</groupId>
                <artifactId>commons-logging</artifactId>
            </exclusion>
        </exclusions>
        <scope>runtime</scope>
    </dependency>
    <!-- 拦截 apache commons logging -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>jcl-over-slf4j</artifactId>
        <version>${jcl-over-slf4j.version}</version>
        <scope>runtime</scope>
    </dependency>
    <!--spring-->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context-support</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-tx</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

## 定义任务实现

- Job.java

```java
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class MyJob implements Job  {
    public void execute(JobExecutionContext context) throws JobExecutionException {
        System.out.println("========================================= my job");
    }
}
```

# 简单的触发器定义

## xml 配置

- applicationContext-simple.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.0.xsd">

    <!--
        Spring整合Quartz进行配置遵循下面的步骤：
        1：定义工作任务的Job
        2：定义触发器Trigger，并将触发器与工作任务绑定
        3：定义调度器，并将Trigger注册到Scheduler
     -->
    <!-- 1：定义任务的bean ，这里使用JobDetailFactoryBean,也可以使用MethodInvokingJobDetailFactoryBean ，配置类似-->
    <bean name="hwJob" class="org.springframework.scheduling.quartz.JobDetailFactoryBean">
        <!-- 指定job的名称 -->
        <property name="name" value="hw_job"/>
        <!-- 指定job的分组 -->
        <property name="group" value="hw_group"/>
        <!-- 指定具体的job类 -->
        <property name="jobClass" value="com.github.houbb.quartz.spring.job.MyJob"/>
        <!-- 必须设置为true，如果为false，当没有活动的触发器与之关联时会在调度器中会删除该任务  -->
        <property name="durability" value="true"/>
        <!-- 指定spring容器的key，如果不设定在job中的jobmap中是获取不到spring容器的 -->
        <property name="applicationContextJobDataKey" value="applicationContext"/>
    </bean>
    <!-- 2.1：定义触发器的bean，定义一个Simple的Trigger，一个触发器只能和一个任务进行绑定 -->
    <bean name="simpleTrigger" class="org.springframework.scheduling.quartz.SimpleTriggerFactoryBean">
<!--        指定Trigger的名称-->
        <property name="name" value="hw_trigger"/>
<!--        指定Trigger的名称-->
        <property name="group" value="hw_trigger_group"/>
<!--        指定Tirgger绑定的Job-->
        <property name="jobDetail" ref="hwJob"/>
<!--        指定Trigger的延迟时间 1s后运行-->
        <property name="startDelay" value="1000"/>
<!--        指定Trigger的重复间隔  5s-->
        <property name="repeatInterval" value="5000"/>
<!--        指定Trigger的重复次数-->
        <property name="repeatCount" value="5"/>
    </bean>

    <!-- 3.定义调度器，并将Trigger注册到调度器中 -->
    <bean id="scheduler" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
        <property name="triggers">
            <list>
                 <ref bean="simpleTrigger"/>
            </list>
        </property>
    </bean>

</beans>
```

## 测试代码

```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class SimpleTest {

    public static void main(String[] args) {
        ApplicationContext ac = new ClassPathXmlApplicationContext("applicationContext-simple.xml");
    }

}
```

## 日志

主要日志如下：

```
18:06:54.767 [scheduler_QuartzSchedulerThread] DEBUG o.quartz.core.QuartzSchedulerThread - batch acquisition of 1 triggers
18:06:54.767 [scheduler_Worker-1] DEBUG org.quartz.core.JobRunShell - Calling execute on job hw_group.hw_job
========================================= my job
```


# Cron 触发器实现

## xml 配置

- applicationContext-cron.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.0.xsd">

    <!--
        Spring整合Quartz进行配置遵循下面的步骤：
        1：定义工作任务的Job
        2：定义触发器Trigger，并将触发器与工作任务绑定
        3：定义调度器，并将Trigger注册到Scheduler
     -->
    <!-- 1：定义任务的bean ，这里使用JobDetailFactoryBean,也可以使用MethodInvokingJobDetailFactoryBean ，配置类似-->
    <bean name="hwJob" class="org.springframework.scheduling.quartz.JobDetailFactoryBean">
        <!-- 指定job的名称 -->
        <property name="name" value="hw_job"/>
        <!-- 指定job的分组 -->
        <property name="group" value="hw_group"/>
        <!-- 指定具体的job类 -->
        <property name="jobClass" value="com.github.houbb.quartz.spring.job.MyJob"/>
        <!-- 必须设置为true，如果为false，当没有活动的触发器与之关联时会在调度器中会删除该任务  -->
        <property name="durability" value="true"/>
        <!-- 指定spring容器的key，如果不设定在job中的jobmap中是获取不到spring容器的 -->
        <property name="applicationContextJobDataKey" value="applicationContext"/>
    </bean>

    <!-- 2.2：定义触发器的bean，定义一个Cron的Trigger，一个触发器只能和一个任务进行绑定 -->
    <bean id="cronTrigger" class="org.springframework.scheduling.quartz.CronTriggerFactoryBean">
        <!-- 指定Trigger的名称 -->
        <property name="name" value="hw_trigger"/>
        <!-- 指定Trigger的名称 -->
        <property name="group" value="hw_trigger_group"/>
        <!-- 指定Tirgger绑定的Job -->
        <property name="jobDetail" ref="hwJob"/>
        <!-- 指定Cron 的表达式 ，当前是每隔1s运行一次 -->
        <property name="cronExpression" value="0/1 * * * * ?" />
    </bean>


    <!-- 3.定义调度器，并将Trigger注册到调度器中 -->
    <bean id="scheduler" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
        <property name="triggers">
            <list>
                <ref bean="cronTrigger"/>
            </list>
        </property>
    </bean>

</beans>
```

## 测试代码

```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class CronTest {

    public static void main(String[] args) {
        ApplicationContext ac = new ClassPathXmlApplicationContext("applicationContext-cron.xml");
    }

}
```

## 日志

主要日志如下，每 S 都会执行一次。

```
18:09:36.001 [scheduler_QuartzSchedulerThread] DEBUG o.quartz.core.QuartzSchedulerThread - batch acquisition of 1 triggers
18:09:37.000 [scheduler_Worker-6] DEBUG org.quartz.core.JobRunShell - Calling execute on job hw_group.hw_job
========================================= my job
```

# spring 整合的另一种方式

## Job 的实现方式

上面我们展示了继承 Job 接口的实现方式，实际上也可以不继承接口。

这样我们的任务实现更加灵活。

```java
public class AnotherJob  {

    public void run() {
        System.out.println("========================================= my job");
    }

}
```

## xml 配置

这里我们需要在配置中指定对应的执行方法：

- applicationContext-simple-invoke.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.0.xsd">

    <!-- 要执行任务的任务类。 -->
    <bean id="testQuartz" class="com.github.houbb.quartz.spring.job.AnotherJob">
    </bean>

    <!-- 将需要执行的定时任务注入JOB中。 -->
    <bean id="testJob" class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
        <property name="targetObject" ref="testQuartz"/>
        <!-- 任务类中需要执行的方法 -->
        <property name="targetMethod" value="run"/>
        <!-- 上一次未执行完成的，要等待有再执行。 -->
        <property name="concurrent" value="false"/>
    </bean>

    <!-- 基本的定时器，会绑定具体的任务。 -->
    <bean id="testTrigger" class="org.springframework.scheduling.quartz.SimpleTriggerFactoryBean">
        <property name="jobDetail" ref="testJob"/>
        <property name="startDelay" value="3000"/>
        <property name="repeatInterval" value="2000"/>
    </bean>

    <bean id="schedulerFactoryBean" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
        <property name="triggers">
            <list>
                <ref bean="testTrigger"/>
            </list>
        </property>
    </bean>

</beans>
```

## 测试代码

```java
public class SimpleInvokeTest {

    public static void main(String[] args) {
        ApplicationContext ac = new ClassPathXmlApplicationContext(
                "applicationContext-simple-invoke.xml");
    }

}
```

## 日志

主要日志如下：

```
20:18:46.637 [schedulerFactoryBean_QuartzSchedulerThread] DEBUG o.quartz.core.QuartzSchedulerThread - batch acquisition of 1 triggers
20:18:48.636 [schedulerFactoryBean_QuartzSchedulerThread] DEBUG o.quartz.core.QuartzSchedulerThread - batch acquisition of 0 triggers
20:18:48.636 [schedulerFactoryBean_Worker-4] DEBUG org.quartz.core.JobRunShell - Calling execute on job DEFAULT.testJob
========================================= my job
20:18:48.637 [schedulerFactoryBean_QuartzSchedulerThread] DEBUG o.quartz.core.QuartzSchedulerThread - batch acquisition of 1 triggers
20:18:50.636 [schedulerFactoryBean_QuartzSchedulerThread] DEBUG o.quartz.core.QuartzSchedulerThread - batch acquisition of 0 triggers
20:18:50.636 [schedulerFactoryBean_Worker-5] DEBUG org.quartz.core.JobRunShell - Calling execute on job DEFAULT.testJob
========================================= my job
```

# 小结

这里基于 RAM 的执行方式就和 spring 整合完成了，但是我们希望更加灵活的话，可以参考前面的与 jdbc 的整合。

下一节将实现 spring+jdbc+quartz 的实现例子。

# 导航目录

> [导航目录](https://blog.csdn.net/ryo1060732496/article/details/79794802)

# 参考资料

[quartz-scheduler-2.3.0](http://www.quartz-scheduler.org/documentation/quartz-2.3.0/)

[精进 Quartz—Quartz大致介绍（一）](https://blog.csdn.net/u010648555/article/details/54863144)

[Quartz 集成Spring的2种方法](https://www.jianshu.com/p/9835b86e188e)

* any list
{:toc}