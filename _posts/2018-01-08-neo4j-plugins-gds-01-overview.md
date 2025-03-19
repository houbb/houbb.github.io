---
layout: post
title:  Neo4j GDS-01-graph-data-science 图数据科学 插件库概览
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---


# neo4j apoc 系列

[Neo4j APOC-01-图数据库 apoc 插件介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-01-intro)

[Neo4j APOC-01-图数据库 apoc 插件安装 neo4j on windows10](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-02-windows10-install-plugins)

[Neo4j APOC-03-图数据库 apoc 实战使用使用](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-03-basic-usage)

[Neo4j APOC-04-图数据库 apoc 实战使用使用 apoc.path.spanningTree 最小生成树](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-04-minist-tree)

[Neo4j APOC-05-图数据库 apoc 实战使用使用 labelFilter](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-05-label-filter)

# Neo4j 图数据科学

本仓库托管 **Neo4j 图数据科学（GDS）** 库的开源项目。

该库作为 Neo4j 图数据库的插件，集成了图算法、图转换和机器学习管道功能，通过 Cypher 过程在数据库内部操作。

> **注**  
> Neo4j 图数据科学库是 Neo4j 图算法库的继任者。

---

## 📥 下载与安装

最新版本可通过 [Neo4j 图数据科学下载页面](https://neo4j.com/graph-data-science-software/) 获取。

安装步骤如下：

1. 将下载的 JAR 文件放入 Neo4j 数据库的 `plugins` 目录
2. 重启数据库

**Neo4j Desktop 用户**：可直接在项目管理界面添加插件。

### 兼容性对照表

| GDS 版本 | Neo4j 版本 | Java 版本       |
|----------|------------|-----------------|
| 2.13     | 5.26       | Java 21 / Java 17 |

> **注意**  
> 预览版需手动安装，不会自动出现在 Neo4j Desktop 中。

---

## 🔓 OpenGDS

Neo4j 官方构建的 GDS 包含闭源组件，而本仓库代码可独立构建为 **OpenGDS**。

两者区别如下：

| 版本   | 协议                  | 功能完整性       |
|--------|-----------------------|------------------|
| GDS    | 商业许可              | 包含闭源组件     |
| OpenGDS| GPL v3.0              | 完全开源         |

---

## ⚙️ 使用 Pregel API

通过 Pregel API 开发自定义算法（[文档参考](https://neo4j.com/docs/graph-data-science/current/algorithms/pregel-api/#algorithms-pregel-api-example)），建议从 [pregel-bootstrap 项目](https://github.com/neo4j/graph-data-science/tree/2.7/examples/pregel-bootstrap) 开始。

```gradle
// 在 build.gradle 中调整 GDS 版本
dependencies {
    implementation 'org.neo4j.gds:algo:2.13.3'
}
```

> **注意**  
> `master` 分支依赖未发布的库版本，需手动配置。

---

## 🐍 Python 客户端

库提供 `graphdatascience` 客户端，支持纯 Python 操作（需 GDS 2.0+）：

```python
from graphdatascience import GraphDataScience

gds = GraphDataScience("neo4j://localhost:7687", auth=("neo4j", "password"))
gds.run_cypher("CALL gds.pageRank.stream(...)")
```

源码地址：[graph-data-science-client](https://github.com/neo4j/graph-data-science-client)

---

## 🛠️ OpenGDS 开发指南

### Maven 依赖配置

#### 核心模块
```xml
<dependency>
  <groupId>org.neo4j.gds</groupId>
  <artifactId>core</artifactId>
  <version>2.13.3</version>
</dependency>
```

#### 算法模块
```xml
<!-- 基础框架 -->
<dependency>
  <groupId>org.neo4j.gds</groupId>
  <artifactId>algo-common</artifactId>
  <version>2.13.3</version>
</dependency>

<!-- 正式算法 -->
<dependency>
  <groupId>org.neo4j.gds</groupId>
  <artifactId>algo</artifactId>
  <version>2.13.3</version>
</dependency>

<!-- 实验性算法 -->
<dependency>
  <groupId>org.neo4j.gds</groupId>
  <artifactId>alpha-algo</artifactId>
  <version>2.13.3</version>
</dependency>
```

---

## 🔧 构建指南

### 环境准备

1. 安装 SDKMAN：
```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
```

2. 安装 JDK：
```bash
sdk install java 11.0.19-tem  # JDK 11
sdk install java 17.0.7-tem   # JDK 17
```

### 构建命令

```bash
# 运行测试
./gradlew check

# 打包（输出至 build/distributions/）
./gradlew :open-packaging:shadowCopy

# 指定 Neo4j 5.x + JDK 17
./gradlew -Pneo4jVersion=5.1.0 build
```

> **文档预览**  
> 最新文档：[https://neo4j.com/docs/graph-data-science/preview/](https://neo4j.com/docs/graph-data-science/preview/)

---

## 🤝 贡献指南

欢迎通过 [GitHub Issues](https://github.com/neo4j/graph-data-science/issues) 提交问题，贡献流程详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## ⚖️ 许可协议

**OpenGDS** 采用 [GNU GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.html) 协议，所有内容版权归 **Neo4j Sweden AB** 所有。

---

调整后的版本通过以下优化提升可读性：
1. 使用清晰的标题层级（`#`、`##`、`###`）
2. 代码块标注语言类型（如 `xml`、`bash`）
3. 表格对齐与简洁化
4. 重要内容用粗体/斜体/引用块突出
5. 链接嵌入文字中避免长 URL
6. 添加图标符号增强视觉引导（如 📥、⚙️、🐍 等）


--------------- 

# chat

## 详细介绍一下 neo4j GDS 插件库



# 参考资料

https://github.com/neo4j/graph-data-science


* any list
{:toc}


