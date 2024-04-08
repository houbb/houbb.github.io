---
layout: post
title: 工作流引擎-01-Activiti
date:  2020-5-26 16:05:35 +0800
categories: [Engine]
tags: [engine, workflow-engine, workflow, flow]
published: true
---

# 什么是Activiti

在解释activiti之前我们看一下什么是工作流。

## workflow-工作流

工作流(Workflow)，就是“业务过程的部分或整体在计算机应用环境下的自动化”，它主要解决的是“使在多个参与者之间按照某种预定义的规则传递文档、信息或任务的过程自动进行，从而实现某个预期的业务目标，或者促使此目标的实现”。

我的理解是，工作流将一套大的业务逻辑分解成业务逻辑段， 并统一控制这些业务逻辑段的执行条件，执行顺序以及相互通信。 

实现业务逻辑的分解和解耦。

## Activiti

Activiti 是领先的轻量级、以 Java 为中心的开源 BPMN 引擎，支持现实世界的流程自动化需求。 

Activiti Cloud 现在是新一代的业务自动化平台，提供一组旨在在分布式基础架构上运行的云原生构建块。

BPMN即业务流程建模与标注（Business Process Model and Notation，BPMN) ，描述流程的基本符号，包括这些图元如何组合成一个业务流程图（Business Process Diagram）。

# 快速开始

## 开始方式

可以基于云，也可以基于 java api 进行实现。

我们这里进行 java 的入门学习，[java core api](https://activiti.gitbook.io/activiti-7-developers-guide/getting-started/getting-started-activiti-core)。

## Activiti Core Runtime API 入门

创建新 API 的目的很明确，旨在满足以下要求：

- 为我们的云方法提供清晰的路径

- 隔离内部和外部 API 以提供向前的向后兼容性

- 通过遵循单一职责方法提供模块化的未来路径

- 减少旧版本 API 的混乱

- 将安全和身份管理作为一等公民

- 减少常见用例的价值实现时间，在这些用例中您希望依赖流行框架提供的约定

- 提供底层服务的替代实现

- 使社区能够在尊重既定合同的同时进行创新

我们尚未弃用旧 API，因此您仍然可以自由使用它，但我们强烈建议使用新 API 以获得长期支持。

此 API 处于测试阶段，这意味着我们可能会在 GA 发布之前对其进行更改和完善。我们将感谢我们从社区用户那里获得的所有反馈，如果您想参与该项目，请与我们联系。

是时候让我们接触几个示例项目了。

## 任务运行时 API

如果您正在构建业务应用程序，为您组织中的用户和组创建任务可能会很方便。

TaskRuntime API 可以帮助您。

你可以从 GitHub 克隆这个例子：https://github.com/Activiti/activiti-examples

本节的代码可以在 activiti-api-basic-task-example maven 模块中找到。

如果您在 Spring Boot 2 应用程序中运行，您只需要添加 activiti-spring-boot-starter 依赖项和一个 DB 驱动程序，您可以使用 H2 进行内存存储。

[https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/pom.xml#L45](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/pom.xml#L45)

## maven 引入

```xml
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
```

我们建议使用我们的 BOM

https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/pom.xml#L30

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.activiti.dependencies</groupId>
            <artifactId>activiti-dependencies</artifactId>
            <version>7.1.0.M5</version>
            <scope>import</scope>
            <type>pom</type>
        </dependency>
    </dependencies>
</dependencyManagement>
```

现在让我们切换到我们的 DemoApplication.class：

https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/src/main/java/org/activiti/examples/DemoApplication.java#L25

## TaskRuntime

然后你就可以使用 TaskRuntime：

```java
@Autowired
private TaskRuntime taskRuntime;
```

例如，您可以通过执行以下操作来创建任务：

https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/src/main/java/org/activiti/examples/DemoApplication.java#L45

```java
taskRuntime.create(
            TaskPayloadBuilder.create()
                .withName("First Team Task")
                .withDescription("This is something really important")
                .withGroup("activitiTeam")
                .withPriority(10)
           .build());
```

此任务仅对属于 activitiTeam 的用户和所有者（当前登录的用户）可见。

您可能已经注意到，您可以使用 TaskPayloadBuilder 以流畅的方式参数化将要发送到 TaskRuntime 的信息。

为了处理安全性、角色和组，我们依赖 Spring Security 模块。 

因为我们在 Spring Boot 应用程序中，所以我们可以使用 UserDetailsService 来配置可用用户及其各自的组和角色。 

我们目前正在 `@Configuration` 类中执行此操作：

[https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/src/main/java/org/activiti/examples/DemoApplicationConfiguration.java#L26](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/src/main/java/org/activiti/examples/DemoApplicationConfiguration.java#L26)

这里需要注意的重要一点是，为了作为用户与 TaskRuntime API 交互，您需要具有角色：ACTIVITI_USER (Granted Authority: ROLE_ACTIVITI_USER) 。

在与 REST 端点交互时，授权机制将设置当前登录的用户，但为了示例，我们使用了一个实用程序类（[SecurityUtil.java#L26](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/src/main/java/org/activiti/examples/SecurityUtil.java#L26)) 允许我们在上下文中设置手动选择的用户。 

请注意，除非您正在尝试并且想在不通过 REST 端点的情况下更改用户，否则您永远不应该这样做。 

查看“网络”示例以查看更多根本不需要此实用程序类的真实场景。

示例中要强调的最后一件事是任务事件侦听器的注册：

[DemoApplication.java#L89](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-task-example/src/main/java/org/activiti/examples/DemoApplication.java#L89)

```java
@Bean
public TaskRuntimeEventListener taskAssignedListener() {
  return taskAssigned
           -> logger.info(
                 ">>> Task Assigned: '"
                + taskAssigned.getEntity().getName()
                +"' We can send a notification to the assignee: "
                + taskAssigned.getEntity().getAssignee());
}
```

您可以根据需要注册任意数量的 TaskRuntimeEventListener。 

这将使您的应用程序能够在服务触发运行时事件时收到通知。

# 进程运行时 API

以类似的方式，如果您想开始使用 ProcessRuntime API，您需要包含与以前相同的依赖项。 

我们的目标是在未来提供更多的灵活性和独立的运行时，但现在同一个 Spring Boot Starter 提供 TaskRuntime 和 ProcessRuntime API。

本节的代码可以在“activiti-api-basic-process-example”maven 模块中找到。

## 接口

```java
public interface ProcessRuntime {
  ProcessRuntimeConfiguration configuration();
  ProcessDefinition processDefinition(String processDefinitionId);
  Page processDefinitions(Pageable pageable);
  Page processDefinitions(Pageable pageable,
              GetProcessDefinitionsPayload payload);
  ProcessInstance start(StartProcessPayload payload);
  Page processInstances(Pageable pageable);
  Page processInstances(Pageable pageable,
              GetProcessInstancesPayload payload);
  ProcessInstance processInstance(String processInstanceId);
  ProcessInstance suspend(SuspendProcessPayload payload);
  ProcessInstance resume(ResumeProcessPayload payload);
  ProcessInstance delete(DeleteProcessPayload payload);
  void signal(SignalPayload payload);
  ...
}
```

与 TaskRuntime API 类似，为了与 ProcessRuntime API 交互，当前登录的用户需要具有“ACTIVITI_USER”角色。

## 自动装配

首先，让我们自动装配我们的 ProcessRuntime：

[DemoApplication.java#L32](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-process-example/src/main/java/org/activiti/examples/DemoApplication.java#L32)

```java
@Autowired
private ProcessRuntime processRuntime;

@Autowired
private SecurityUtil securityUtil;
```

和以前一样，我们需要我们的 SecurityUtil 助手来定义我们正在与我们的 API 交互的用户。

现在我们可以开始与 ProcessRuntime 交互：

[DemoApplication.java#L47](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-process-example/src/main/java/org/activiti/examples/DemoApplication.java#L47)

```java
Page processDefinitionPage = processRuntime
                                .processDefinitions(Pageable.of(0, 10));
logger.info("> Available Process definitions: " +
                  processDefinitionPage.getTotalItems());
for (ProcessDefinition pd : processDefinitionPage.getContent()) {
  logger.info("\t > Process definition: " + pd);
}
```

流程定义需要放在 /src/main/resources/processes/ 中。

对于本示例，我们定义了以下流程：

我们正在使用 Spring 调度功能每秒启动一个进程，从数组中获取随机值以进行处理：

[DemoApplication.java#L67](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-process-example/src/main/java/org/activiti/examples/DemoApplication.java#L67)

```java
@Scheduled(initialDelay = 1000, fixedDelay = 1000)
public void processText() {
  securityUtil.logInAs("system");
  String content = pickRandomString();
  SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yy HH:mm:ss");
  logger.info("> Processing content: " + content
                    + " at " + formatter.format(new Date()));
  ProcessInstance processInstance = processRuntime
                  .start(ProcessPayloadBuilder
                       .start()
                       .withProcessDefinitionKey("categorizeProcess")
                       .withProcessInstanceName("Processing Content: " + content)
                       .withVariable("content", content)
                       .build());
  logger.info(">>> Created Process Instance: " + processInstance);
}
```

和以前一样，我们使用 ProcessPayloadBuilder 以流畅的方式参数化我们想要启动哪个流程以及使用哪些流程变量。

现在，如果我们回顾流程定义，您会发现 3 个服务任务。 

为了提供这些服务任务的实现，您需要定义连接器：

[DemoApplication.java#L81](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-process-example/src/main/java/org/activiti/examples/DemoApplication.java#L81)

```java
@Bean
public Connector processTextConnector() {
  return integrationContext -> {
      Map inBoundVariables = integrationContext.getInBoundVariables();
      String contentToProcess = (String) inBoundVariables.get("content")
     // Logic Here to decide if content is approved or not
     if (contentToProcess.contains("activiti")) {
        logger.info("> Approving content: " + contentToProcess);
        integrationContext.addOutBoundVariable("approved",true);
     } else {
        logger.info("> Discarding content: " + contentToProcess);
        integrationContext.addOutBoundVariable("approved",false);
     }
    return integrationContext;
  };
}
```

这些连接器使用 Bean 名称自动连接到 ProcessRuntime，在本例中为“processTextConnector”。 

这个 bean 名称是从我们流程定义中的 serviceTask 元素的 implementation 属性中提取的：

[categorize-content.bpmn20.xml#L22](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-process-example/src/main/resources/processes/categorize-content.bpmn20.xml#L22)

```xml
<bpmn:serviceTask id="Task_1ylvdew" name="Process Content" implementation="processTextConnector">
```

这个新的连接器接口是 JavaDelegates 的自然演变，新版本的 Activiti Core 将尝试通过将它们包装在连接器实现中来重用你的 JavaDelegates：

```java
public interface Connector {
  IntegrationContext execute(IntegrationContext integrationContext);
}
```

连接器接收带有流程变量的 IntegrationContext 并返回修改后的 IntegrationContext 以及需要映射回流程变量的结果。

在前面的示例中，连接器实现正在接收“内容”变量并根据内容处理逻辑添加“已批准”变量。

在这些连接器中，您可能会包含系统到系统调用，例如 REST 调用和基于消息的交互。 这些交互往往变得越来越复杂，因此我们将在未来的教程中看到如何从 ProcessRuntime（云连接器）上下文之外运行中提取这些连接器，以解耦此类外部交互的责任。 ProcessRuntime 范围。

检查 maven 模块 activiti-api-spring-integration-example 以获得更高级的示例，使用 Spring Integrations 基于文件轮询器启动进程。


# 完整示例

您可以找到同时使用 ProcessRuntime 和 TaskRuntime API 来自动化以下过程的示例：

本节的代码可以在“activiti-api-basic-full-example”maven 模块中找到。

作为 ProcessRuntime only 示例，这也对一些输入内容进行了分类，但在这种情况下，流程依赖于人类演员来决定是否批准内容。 

我们有一个计划任务，它每 5 秒创建一次新的流程实例，还有一个模拟用户检查是否有可用的任务可以处理。

[DemoApplication.java#L63](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-full-example/src/main/java/org/activiti/examples/DemoApplication.java#L63) 

和

[DemoApplication.java#L85](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-full-example/src/main/java/org/activiti/examples/DemoApplication.java#L85)

UserTask 是为一组潜在所有者创建的，在本例中为“activitiTeam”组。 

但在这种情况下，我们不会像第一个示例中那样手动创建任务。 

流程实例在每次启动流程时为我们创建任务。

[categorize-human-content.bpmn20.xml#L38](https://github.com/Activiti/activiti-examples/blob/master/activiti-api-basic-full-example/src/main/resources/processes/categorize-human-content.bpmn20.xml#L38)

```xml
<bpmn:userTask id="Task_1ylvdew" name="Process Content">
  <bpmn:incoming>SequenceFlow_09xowo4</bpmn:incoming>
  <bpmn:outgoing>SequenceFlow_1jzbgkj</bpmn:outgoing>
  <bpmn:potentialOwner>
    <bpmn:resourceAssignmentExpression>
      <bpmn:formalExpression>activitiTeam</bpmn:formalExpression>
    </bpmn:resourceAssignmentExpression>
  </bpmn:potentialOwner>
</bpmn:userTask>
```

属于该组的用户将能够声明并处理该任务。

我们鼓励您运行这些示例并对其进行试验，如果您有疑问或发现问题，请与我们联系。

# 概括

在本教程中，我们已经看到了如何开始使用来自新 Activiti Core Beta 项目的新 ProcessRuntime 和 TaskRuntime API。

我们建议您查看 Activiti 示例存储库，以获取更多示例：https://github.com/Activiti/activiti-examples

帮助我们编写更多这些示例可能是一个非常好的初始社区贡献。 如果您有兴趣，请与我们联系，我们非常乐意为您提供指导。

如果您对这些示例和教程有任何疑问或反馈，请随时通过 Gitter 与我们联系：

https://gitter.im/Activiti/Activiti7?utm_source=share-link&utm_medium=link&utm_campaign=share-link。

更多的博客文章将介绍运行时管理 API 以及如何调整这些示例以在我们新的 Activiti Cloud 方法中执行。

# 基本表

activiti5.13使用了23张表支持整个工作流框架，底层使用mybatis操作数据库。这些数据库表为

1) ACT_RE_*: 'RE'表示repository。 这个前缀的表包含了流程定义相关的静态资源（图片，规则等）。

2) ACT_RU_*: 'RU'表示runtime。 运行时表，包含流程实例，任务，变量，异步任务等运行中的数据。流程结束时这些记录会被删除。

3) ACT_ID_*: 'ID'表示identity。 这些表包含用户和组的信息。

4) ACT_HI_*: 'HI'表示history。 这些表包含历史数据，比如历史流程实例，变量，任务等。

5) ACT_GE_*: 通用数据，bytearray表保存文件等字节流对象。

# 基本流程

工作流进行的基本过程如下:

```
定义流程(框架外) -> 部署流程定义 -> 启动流程实例, 框架移动到任务1 -> 拾取组任务 -> 办理个人任务, 框架移动到任务2 -> 拾取组任务 -> 办理个人任务...
```

组任务是多个用户都可以完成的任务。

没有组任务直接办理个人任务; 有组任务需先通过拾取将组任务变成个人任务, 然后再办理。

个人任务/组任务在表中的区别

个人任务: 表act_ru_task的ASSIGNEE段即指定的办理人

组任务: 表act_ru_task的ASSIGNEE段为null, 相关信息在表act_ru_identitylink中, 组任务1见userid段;  

组任务2见groupid段, 当然还需查询act_id_xxx表才能精确到人.


# 参考资料

[Activiti](https://blog.csdn.net/carolzhang8406/article/details/79450818)

https://activiti.gitbook.io/activiti-7-developers-guide/getting-started

* any list
{:toc}