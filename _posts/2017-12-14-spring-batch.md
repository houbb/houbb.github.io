---
layout: post
title:  Spring Batch
date:  2017-12-14 21:14:02 +0800
categories: [Spring]
tags: [spring]
published: true
---


# Spring Batch

[Spring Batch](https://projects.spring.io/spring-batch/) provides reusable functions that are essential in processing large volumes of records, including logging/tracing, 
transaction management, job processing statistics, job restart, skip, and resource management. 
It also provides more advanced technical services and features that will enable extremely high-volume 
and high performance batch jobs through optimization and partitioning techniques.
 
 
初步感觉是为做**一系列的事情**提供了一个完善的管理框架。


 
# Quick Start
 
> [完整代码](https://github.com/houbb/spring-data/tree/master/spring-batch-hw)

本案例演示如何执行一个步骤，然后执行另一个步骤。

## 目录结构

```
├── pom.xml
├── spring-batch-hw.iml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── ryo
    │   │           └── spring
    │   │               └── batch
    │   │                   └── hw
    │   │                       ├── HelloTasklet.java
    │   │                       ├── Main.java
    │   │                       └── WorldTasklet.java
    │   └── resources
    │       ├── application.xml
    │       └── spring-batch.xml
```


## 文件内容

- pom.xml

引入必须的 jar

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>spring-data</artifactId>
        <groupId>com.ryo</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>spring-batch-hw</artifactId>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.spring.platform</groupId>
                <artifactId>platform-bom</artifactId>
                <version>1.1.2.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>


    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.batch</groupId>
            <artifactId>spring-batch-core</artifactId>
        </dependency>
        
        <dependency>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </dependency>
    </dependencies>

</project>
```


- HelloTasklet.java

打印 "hello"


```java
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;

public class HelloTasklet implements Tasklet {

    @Override
    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
        System.out.println("hello");
        return RepeatStatus.FINISHED;
    }
}
```

- WorldTasklet.java

打印 "hello"


```java
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;

public class WorldTasklet implements Tasklet {

    @Override
    public RepeatStatus execute(StepContribution stepContribution, ChunkContext chunkContext) throws Exception {
        System.out.println("world");
        return RepeatStatus.FINISHED;
    }
}
```

- Main.java

```java

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Main {


    public static void main(String[] args) throws JobParametersInvalidException,
            JobExecutionAlreadyRunningException,
            JobRestartException,
            JobInstanceAlreadyCompleteException {
        ApplicationContext context = new ClassPathXmlApplicationContext(
                "spring-batch.xml");
        JobLauncher launcher = (JobLauncher) context.getBean("jobLauncher");
        Job job = (Job) context.getBean("helloWorldJob");

            /* 运行Job */
        JobExecution result = launcher.run(job, new JobParameters());
            /* 处理结束，控制台打印处理结果 */
        System.out.println(result.toString());
    }
}
```

- spring-batch.xml

```xml
<beans:beans xmlns="http://www.springframework.org/schema/batch"
             xmlns:beans="http://www.springframework.org/schema/beans"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="
   http://www.springframework.org/schema/beans
   http://www.springframework.org/schema/beans/spring-beans.xsd
   http://www.springframework.org/schema/batch
   http://www.springframework.org/schema/batch/spring-batch.xsd">

    <beans:import resource="application.xml"/>

    <job id="helloWorldJob">
        <step id="step_hello" next="step_world">
            <tasklet ref="hello" transaction-manager="transactionManager"/>
        </step>
        <step id="step_world">
            <tasklet ref="world" transaction-manager="transactionManager"/>
        </step>
    </job>

</beans:beans>
```

- application.xml 
 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
http://www.springframework.org/schema/beans/spring-beans-3.0.xsd"
       default-autowire="byName">

    <bean id="jobLauncher" class="org.springframework.batch.core.launch.support.SimpleJobLauncher">
        <property name="jobRepository" ref="jobRepository"/>
    </bean>

    <bean id="jobRepository" class="org.springframework.batch.core.repository.support.MapJobRepositoryFactoryBean">
    </bean>

    <bean id="transactionManager"
          class="org.springframework.batch.support.transaction.ResourcelessTransactionManager"/>

    <bean id="hello" class="com.ryo.spring.batch.hw.HelloTasklet">
    </bean>

    <bean id="world" class="com.ryo.spring.batch.hw.WorldTasklet">
    </bean>


</beans>
```


## Run & Result

运行 `Main.main()`

```
信息: Executing step: [step_hello]
hello
Dec 14, 2017 10:50:07 PM org.springframework.batch.core.job.SimpleStepHandler handleStep
信息: Executing step: [step_world]
world
Dec 14, 2017 10:50:07 PM org.springframework.batch.core.launch.support.SimpleJobLauncher run
JobExecution: id=0, version=2, startTime=Thu Dec 14 22:50:07 CST 2017, endTime=Thu Dec 14 22:50:07 CST 2017, 
lastUpdated=Thu Dec 14 22:50:07 CST 2017, status=COMPLETED, exitStatus=exitCode=COMPLETED;exitDescription=, 
job=[JobInstance: id=0, version=0, Job=[helloWorldJob]], jobParameters=[{}]
信息: Job: [FlowJob: [name=helloWorldJob]] completed with the following parameters: [{}] and the following status: [COMPLETED]
```

* any list
{:toc}

