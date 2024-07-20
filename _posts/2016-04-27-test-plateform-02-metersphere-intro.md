---
layout: post
title: test framework-01-MeterSphere  一站式开源持续测试平台，为软件质量保驾护航
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, framework, open-source, plateform, test]
published: true
---

# MeterSphere

MeterSphere 一站式开源持续测试平台，为软件质量保驾护航。

搞测试，就选 MeterSphere！

MeterSphere 是一站式开源持续测试平台, 涵盖测试跟踪、接口测试、UI 测试和性能测试等功能，全面兼容 JMeter、Selenium 等主流开源标准，有效助力开发和测试团队充分利用云弹性进行高度可扩展的自动化测试，加速高质量的软件交付，推动中国测试行业整体效率的提升。

![MeterSphere](https://camo.githubusercontent.com/1164d8fe7a0798154961194aad0cb129f170f0c984adf1c7a242ec0034931550/68747470733a2f2f6d657465727370686572652e6f73732d636e2d68616e677a686f752e616c6979756e63732e636f6d2f696d672f6d732d6172636869746563747572652e706e67)

## MeterSphere 的功能

测试跟踪: 对接主流项目管理平台，测试过程全链路跟踪管理；列表脑图模式自由切换，用例编写更简单、测试报告更清晰；
接口测试: 比 JMeter 易用，比 Postman 强大； API 管理、Mock 服务、场景编排、多协议支持，你想要的全都有；
UI 测试: 基于 Selenium 浏览器自动化，高度可复用的测试脚本； 无需复杂的代码编写，人人都可开展的低代码自动化测试；
性能测试: 兼容 JMeter 的同时补足其分布式、监控与报告以及管理短板; 轻松帮助团队实现高并发、分布式的性能压测，完成压测任务的统一调度与管理。

## MeterSphere 的优势

开源：基于开源、兼容开源；按月发布新版本、日均下载安装超过100次、被大量客户验证；
一站式：一个产品全面涵盖测试跟踪、接口测试、UI测试、性能测试等功能并形成联动；
全生命周期：一个产品全满足从测试计划、测试执行到测试报告分析的全生命周期需求；
持续测试：无缝对接 Bug 管理工具和持续集成工具等，能将测试融入持续交付和 DevOps 体系；
团队协作：支持团队协作和资产沉淀，无论团队规模如何，总有适合的落地方式。

## UI

![页面效果](https://camo.githubusercontent.com/d5b8f034509d2255415debd38ab99832c38530e2d772a568730ceee52c639a5f/68747470733a2f2f7777772e66697432636c6f75642e636f6d2f6d657465727370686572652f696d616765732f6d732d64617368626f6172642e6a706567)

## 技术栈

后端: Spring Boot
前端: Vue.js
中间件: MySQL, Kafka, MinIO
基础设施: Docker, Kubernetes
测试引擎: JMeter

# 快速开始

## 一键安装

仅需两步快速安装 MeterSphere：

准备一台不小于 8 G内存的 64位 Linux 主机；

以 root 用户执行如下命令一键安装 MeterSphere。

```
curl -sSL https://resource.fit2cloud.com/metersphere/metersphere/releases/latest/download/quick_start.sh | bash
```
# window10 安装笔记

> [Windows 单机部署](https://metersphere.io/docs/v2.x/installation/offline_installation_windows/)

## 依赖

windows10 WSL

Ubuntu 

docker

这个可以看其他的文章。

## 下载

在 [https://github.com/metersphere/metersphere/releases](https://github.com/metersphere/metersphere/releases) 下载安装包

# 小结

直接使用这种成熟的开源工具，不过一般需要针对权限这一部分进行二次开发。

# chat

## 介绍一下测试平台 MeterSphere

MeterSphere 是一个开源的持续测试平台，提供完整的测试管理、自动化测试、性能测试和测试报告功能。

它旨在为开发团队提供一站式的测试解决方案，提高测试效率和软件质量。

### 主要功能

1. **测试管理**
   - **用例管理**：支持测试用例的创建、编辑、组织和管理，支持用例复用和批量操作。
   - **计划管理**：支持测试计划的制定和管理，确保测试按计划进行。
   - **执行管理**：支持测试执行的管理，包括手动执行和自动化执行。
   - **缺陷管理**：集成缺陷跟踪工具，支持缺陷报告、分配、跟踪和修复。

2. **自动化测试**
   - **接口测试**：支持HTTP、HTTPS、WebSocket等多种协议的接口测试。
   - **UI测试**：支持Web应用和移动应用的UI自动化测试。
   - **脚本支持**：支持多种脚本语言（如Groovy、JavaScript），便于编写和维护测试脚本。

3. **性能测试**
   - **负载测试**：支持大规模负载测试，模拟大量用户访问，评估系统性能。
   - **压力测试**：模拟高负载和极端条件下的系统性能测试，评估系统稳定性。
   - **性能监控**：实时监控测试过程中的系统性能指标，及时发现性能瓶颈。

4. **测试报告**
   - **实时报告**：生成实时测试报告，包括测试结果、覆盖率、执行时间和缺陷情况。
   - **数据分析**：提供数据分析和可视化工具，帮助理解测试数据，发现趋势和问题。
   - **定制报告**：支持自定义报告格式和内容，满足不同团队和项目的需求。

5. **持续集成与持续交付（CI/CD）**
   - **CI/CD 集成**：无缝集成常见的CI/CD工具（如Jenkins、GitLab CI），实现自动化测试和持续交付。
   - **流水线管理**：支持复杂的流水线配置，自动化构建、测试和部署流程。

### 技术架构

- **前端**：基于React和Ant Design构建，提供友好的用户界面和交互体验。
- **后端**：基于Spring Boot，提供强大的业务逻辑处理和API服务。
- **数据库**：支持MySQL、PostgreSQL等多种关系型数据库，存储测试数据和结果。
- **消息队列**：使用RabbitMQ实现异步任务处理，提高系统性能和响应速度。

### 优势

- **开源免费**：MeterSphere 是开源项目，可以免费使用和二次开发，满足不同团队的定制化需求。
- **一站式解决方案**：集成测试管理、自动化测试、性能测试和测试报告功能，提供一站式测试解决方案。
- **扩展性强**：支持插件和扩展机制，便于集成其他工具和系统，满足多样化的测试需求。
- **社区支持**：拥有活跃的用户社区和开发者团队，提供丰富的插件、扩展和技术支持。

### 官方网址和资源

- **官网**：[MeterSphere](https://metersphere.io/)
- **GitHub**：[MeterSphere GitHub](https://github.com/metersphere/metersphere)
- **文档**：[MeterSphere 文档](https://metersphere.io/docs/)

MeterSphere 提供了一个功能全面且灵活的测试平台，适用于各种类型的测试需求，是开发团队提升测试效率和质量的理想选择。

## 还有哪些类似的测试平台？

类似于 MeterSphere 的功能全面且灵活的测试平台还有很多，它们提供了广泛的测试管理、自动化测试、性能测试和报告生成等功能。以下是一些类似的测试平台：

### 1. **TestRail**
- **简介**：TestRail 是一个全面的测试管理工具，支持测试用例管理、测试执行、缺陷跟踪和报告生成。
- **主要功能**：测试用例管理、测试计划和执行、缺陷管理、报告和分析。
- **网址**：[TestRail](https://www.gurock.com/testrail/)

### 2. **Katalon Studio**
- **简介**：Katalon Studio 是一个综合性的测试自动化工具，支持Web、API、移动和桌面应用的测试。
- **主要功能**：测试用例管理、自动化测试、API测试、结果断言、报告生成。
- **网址**：[Katalon Studio](https://www.katalon.com/)

### 3. **PractiTest**
- **简介**：PractiTest 是一个全面的测试管理平台，支持测试用例管理、执行、缺陷跟踪和报告。
- **主要功能**：测试用例和测试计划管理、自动化测试集成、缺陷跟踪、报告和仪表板。
- **网址**：[PractiTest](https://www.practitest.com/)

### 4. **Xray for Jira**
- **简介**：Xray 是一个Jira插件，专注于测试管理，支持测试用例管理、执行、缺陷跟踪和报告生成。
- **主要功能**：测试用例管理、测试计划和执行、集成Jira缺陷管理、生成报告。
- **网址**：[Xray](https://www.getxray.app/)

### 5. **Qase**
- **简介**：Qase 是一个现代的测试管理平台，提供测试用例管理、测试执行、缺陷跟踪和报告生成。
- **主要功能**：测试用例管理、测试计划和执行、缺陷管理、报告和数据分析。
- **网址**：[Qase](https://qase.io/)

这个商业项目文档可以参考：

> [参考文档](https://docs.qase.io/general/get-started-with-the-qase-platform/requirements-traceability-report)

### 6. **TestLink**（开源-python）
- **简介**：TestLink 是一个开源的测试管理工具，支持测试用例管理、测试计划和执行、缺陷跟踪和报告。
- **主要功能**：测试用例管理、测试计划和执行、缺陷管理、生成报告。
- **网址**：[TestLink](https://testlink.org/)

### 7. **RMM (Robot Framework)**（开源-自动化测试）
- **简介**：Robot Framework 是一个通用的测试自动化框架，支持关键字驱动的测试方法。
- **主要功能**：自动化测试、测试用例管理、API测试、性能测试、报告生成。
- **网址**：[Robot Framework](https://robotframework.org/)

### 8. **Apache JMeter**（性能压测工具）
- **简介**：JMeter 是一个开源的性能测试工具，支持负载测试、性能测试和功能测试。
- **主要功能**：负载测试、性能测试、自动化测试、结果报告和分析。
- **网址**：[JMeter](https://jmeter.apache.org/)

### 9. **SoapUI**（WSDL / SOAP 的测试工具）
- **简介**：SoapUI 是一个开源的API测试工具，专注于SOAP和REST API的功能测试、性能测试和安全测试。
- **主要功能**：API功能测试、性能测试、安全测试、测试报告生成。
- **网址**：[SoapUI](https://www.soapui.org/)

### 10. **Taurus**
- **简介**：Taurus 是一个开源的测试工具，简化了性能测试的配置和执行。
- **主要功能**：性能测试、负载测试、集成多种测试工具、生成测试报告。
- **网址**：[Taurus](https://gettaurus.org/)

隐藏性能测试和功能测试的复杂性，提供了一个自动化友好的便捷封装。

Taurus 依赖于 JMeter、Gatling、Locust.io 和 Selenium WebDriver 作为其底层工具。免费且开源，遵循 Apache 2.0 许可证。

这些测试平台提供了全面的功能，支持测试用例管理、自动化测试、性能测试和报告生成。

选择适合的测试平台可以帮助团队更高效地管理和执行测试，提升软件质量。

# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}