---
layout: post
title: ETL-21-apache SeaTunnel coding guide 编码指导
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 编码指南

本指南记录了当前Apache SeaTunnel模块的概述，并介绍了如何向Apache SeaTunnel提交高质量拉取请求的最佳实践。

# 模块概述

模块名称	介绍
seatunnel-api	SeaTunnel连接器V2 API模块
seatunnel-apis	SeaTunnel连接器V1 API模块
seatunnel-common	SeaTunnel通用模块
seatunnel-connectors	SeaTunnel连接器V1模块，目前连接器V1处于稳定状态，社区将继续维护它，但不会进行重大特性更新
seatunnel-connectors-v2	SeaTunnel连接器V2模块，目前连接器V2正在开发中，社区将重点关注它
seatunnel-core/seatunnel-spark	SeaTunnel连接器V1在Spark引擎上的核心启动模块
seatunnel-core/seatunnel-flink	SeaTunnel连接器V1在Flink引擎上的核心启动模块
seatunnel-core/seatunnel-flink-sql	SeaTunnel连接器V1在Flink-SQL引擎上的核心启动模块
seatunnel-core/seatunnel-spark-starter	SeaTunnel连接器V2在Spark引擎上的核心启动模块
seatunnel-core/seatunnel-flink-starter	SeaTunnel连接器V2在Flink引擎上的核心启动模块
seatunnel-core/seatunnel-starter	SeaTunnel连接器V2在SeaTunnel引擎上的核心启动模块
seatunnel-e2e	SeaTunnel端到端测试模块
seatunnel-examples	SeaTunnel本地示例模块，开发者可以使用它进行单元测试和集成测试
seatunnel-engine	SeaTunnel引擎模块，seatunnel-engine是由SeaTunnel社区开发的一个专注于数据同步的新计算引擎。
seatunnel-formats	SeaTunnel格式模块，用于提供格式化数据的能力
seatunnel-plugin-discovery	SeaTunnel插件发现模块，用于从类路径加载SPI插件的能力
seatunnel-transforms-v2	SeaTunnel转换V2模块，目前转换V2正在开发中，社区将重点关注它
seatunnel-translation	SeaTunnel翻译模块，用于适配Connector V2和其他计算引擎，如Spark Flink等...

# 如何提交高质量的拉取请求

1. 使用lombok插件中的注解（@Data @Getter @Setter @NonNull等...）创建实体类，以减少代码量。在编码过程中，最好优先使用lombok插件的实践。

2. 如果需要在类中使用log4j来打印日志，请最好使用lombok插件中的注解@Slf4j。

3. SeaTunnel使用问题来跟踪逻辑问题，包括错误和改进，使用GitHub的拉取请求来管理特定代码更改的审查和合并。因此，创建清晰的问题或拉取请求有助于社区更好地理解开发者的意图。创建问题或拉取请求的最佳实践如下所示：

   ```
   [目的][模块名称] [子模块名称] 描述
   ```

   拉取请求的目的包括：Hotfix、Feature、Improve、Docs、WIP。注意，如果您的拉取请求的目的是WIP，则需要使用GitHub的草稿拉取请求。

   问题的目的包括：Feature、Bug、Docs、Discuss。

   模块名称：当前拉取请求或问题涉及的模块名称，例如：Core、Connector-V2、Connector-V1等。

   子模块名称：当前拉取请求或问题涉及的子模块名称，例如：File、Redis、Hbase等。

   描述：高度概括当前拉取请求和问题要做的事情，尽量让名称表达含义。

   提示：有关更多详细信息，可以参考问题指南和拉取请求指南。

4. 代码段不重复。如果一个代码段被多次使用，多次定义它并不是一个好选择，将其作为公共段使其他模块可以使用是最佳实践。

5. 在抛出异常时，抛出异常与提示消息一起，异常的范围应该较小。抛出过于广泛的异常会促使包含安全漏洞的复杂错误处理代码。例如，如果您的连接器在读取数据时遇到IOException，一个合理的方法是：

   ```java
   try {
       // 读取逻辑
   } catch (IOException e) {
       throw SeaTunnelORCFormatException("This orc file is corrupted, please check it", e);
   }
   ```

6. Apache项目对许可要求非常严格，因此Apache项目中的每个文件在提交拉取请求之前都应包含许可证声明。

   ```java
   /*
    * Licensed to the Apache Software Foundation (ASF) under one or more
    * contributor license agreements.  See the NOTICE file distributed with
    * this work for additional information regarding copyright ownership.
    * The ASF licenses this file to You under the Apache License, Version 2.0
    * (the "License"); you may not use this file except in compliance with
    * the License.  You may obtain a copy of the License at
    *
    *    http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
   ```

7. Apache SeaTunnel使用Spotless进行代码风格和格式检查。您可以运行以下命令，Spotless将自动为您修复代码风格和格式错误：

   ```bash
   ./mvnw spotless:apply
   ```

8. 在提交拉取请求之前，请确保在添加代码后项目能够正确编译。您可以使用以下命令打包整个项目：

   ```bash
   # 多线程编译
   ./mvnw -T 1C clean package
   # 单线程编译
   ./mvnw clean package
   ```

9. 在提交拉取请求之前，在本地进行全面的单元测试和集成测试，以更好地验证代码功能。最佳实践是使用seatunnel-examples模块的自测试功能，以确保多引擎正常运行且结果正确。

10. 如果提交的拉取请求涉及需要更新文档的功能，请始终记得更新文档。

11. 提交连接器类型的拉取请求时，可以编写端到端测试以确保代码的稳健性和稳定性。端到端测试应包括完整的数据类型，并且尽量减少初始化Docker镜像，将源和接收器的测试用例写在一起以减少资源损失，同时使用异步功能确保测试的稳定性。可以在MongodbIT.java中找到一个很好的例子。

12. 类中的属性权限的优先级设置为private，并将可变性设置为final，在遇到特殊情况时可以合理更改。

13. 类中的属性和方法参数最好使用基本类型（int、boolean、double、float...），不建议使用包装类型（Integer、Boolean、Double、Float...），如果遇到特殊情况可以合理更改。

14. 在开发接收器连接器时，需要注意接收器将被序列化，如果某些属性无法序列化，封装属性为类并使用单例模式。

15. 如果代码流中存在多个if判断过程，请尽量简化流程为多个if而不是if-else-if。

16. 拉取请求具有单一职责的特征，不允许在拉取请求中包含与功能无关的代码。一旦出现这种情况，请在提交拉取请求之前处理自己的分支，否则Apache SeaTunnel社区将积极关闭拉取请求。

17. 贡献者应对自己的拉取请求负责。如果您的拉取请求包含新功能或修改旧功能，请添加测试用例或端到端测试以证明拉取请求的合理性和功能完整性是一个良好的

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/contribution/coding-guide

* any list
{:toc}