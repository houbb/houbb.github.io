---
layout: post 
title: 代码知识库之 git history-07-mivlus 向量数据库
date: 2026-04-03 21:01:55 +0800
categories: [AI]
tags: [ai, git, harness, coe-graph]
published: true
---

# chat

## 背景

```
类似的，给出向量数据库的表字段+索引。

我初步想的，大概需要 gitHistoryCommit（提交记录）;

gitHistoryFile（提交文件，冗余commitId）;   

gitHistoryMethod（提交函数，冗余 fileId）。

每个字段都要有 repoId，时间。其他的你看着设计。
```

## 设计

## 向量数据库（Milvus）完整表设计（Java SDK 2.6.13）

### 一、表清单与原因

| 表名 | 对应图实体 | 需要原因 |
|------|-----------|----------|
| `gitHistoryCommit` | `GitHistoryCommit` | 提交级语义检索，用于“自然语言 → 提交” |
| `gitHistoryFile` | `GitHistoryFile` | 文件级语义检索，用于“功能描述 → 文件” |
| `gitHistoryDiffHunk` | `GitHistoryDiffHunk` | 细粒度变更块检索，用于“类似修改模式”的匹配（例如查找相似的 bug 修复片段） |
| `gitHistoryMethod` | `GitHistoryFunction` | 函数级语义检索，用于代码片段相似匹配、推荐相似实现 |

**为什么需要 DiffHunk 表？**  
虽然 DiffHunk 是中间实体，但它的 `newCode` 和 `oldCode` 包含**变更的具体内容**，可以用于检索“历史上类似的修改”。例如：查找“所有增加空指针检查的 diff 块”，直接检索 diff hunk 比检索函数更精确。因此保留该表。

---

### 二、通用设计原则（Java SDK 2.6.13）

- **分区键**：所有表均以 `repoId` 作为分区键（`isPartitionKey(true)`），实现多仓库物理隔离。
- **标量索引**：对过滤字段（`repoId`、`commitHash`、`fileId`、`methodId`、时间戳等）创建 **INVERTED** 索引。
- **向量索引**：使用 **HNSW**，度量类型 **COSINE**，参数 `M=16`，`efConstruction=200`。
- **向量维度**：1536（适配 `text-embedding-3-small` 等模型）。
- **自动主键**：`id` 字段自增，类型 `Int64`。

---

### 三、Collection 1: `gitHistoryCommit`

#### 3.1 字段定义

| 字段名 | 类型 | 是否向量 | 说明 | 索引 |
|--------|------|----------|------|------|
| `id` | INT64 | 否 | 自增主键 | 主键 |
| `commitHash` | VARCHAR(40) | 否 | 完整 commit SHA | INVERTED |
| `repoId` | VARCHAR(128) | 否 | 仓库标识（分区键） | INVERTED |
| `authorTime` | INT64 | 否 | 提交时间戳（秒） | INVERTED |
| `summary` | VARCHAR(1024) | 否 | 提交摘要（message + 变更文件列表） | 无 |
| `embedding` | FLOAT_VECTOR(1536) | ✅ | 语义向量 | HNSW（COSINE） |

#### 3.2 Java 创建代码

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;

public class CreateCommitCollection {
    public static void create(MilvusClientV2 client, String collectionName) {
        // 1. 定义 Schema
        CreateCollectionReq.CollectionSchema schema = client.createSchema();
        schema.addField(DataType.Int64, "id", true, true);  // 主键，自增
        schema.addField(DataType.VarChar, "commitHash", 40, false);
        schema.addField(DataType.VarChar, "repoId", 128, false).setPartitionKey(true);
        schema.addField(DataType.Int64, "authorTime", false);
        schema.addField(DataType.VarChar, "summary", 1024, false);
        schema.addField(DataType.FloatVector, "embedding", 1536, false);

        // 2. 创建 Collection
        CreateCollectionReq createReq = CreateCollectionReq.builder()
                .collectionName(collectionName)
                .collectionSchema(schema)
                .build();
        client.createCollection(createReq);

        // 3. 创建标量索引
        client.createIndex(CreateIndexReq.builder()
                .collectionName(collectionName)
                .fieldName("commitHash")
                .indexType(IndexParam.IndexType.INVERTED)
                .build());
        client.createIndex(CreateIndexReq.builder()
                .collectionName(collectionName)
                .fieldName("repoId")
                .indexType(IndexParam.IndexType.INVERTED)
                .build());
        client.createIndex(CreateIndexReq.builder()
                .collectionName(collectionName)
                .fieldName("authorTime")
                .indexType(IndexParam.IndexType.INVERTED)
                .build());

        // 4. 创建向量索引
        IndexParam indexParam = IndexParam.builder()
                .fieldName("embedding")
                .indexType(IndexParam.IndexType.HNSW)
                .metricType(IndexParam.MetricType.COSINE)
                .extraParam("M", 16)
                .extraParam("efConstruction", 200)
                .build();
        client.createIndex(CreateIndexReq.builder()
                .collectionName(collectionName)
                .indexParam(indexParam)
                .build());
    }
}
```

---

### 四、Collection 2: `gitHistoryFile`

#### 4.1 字段定义

| 字段名 | 类型 | 是否向量 | 说明 | 索引 |
|--------|------|----------|------|------|
| `id` | INT64 | 否 | 自增主键 | 主键 |
| `fileId` | VARCHAR(512) | 否 | 文件唯一标识（`{repoId}:{path}`） | INVERTED |
| `filePath` | VARCHAR(1024) | 否 | 文件路径 | INVERTED |
| `repoId` | VARCHAR(128) | 否 | 仓库标识（分区键） | INVERTED |
| `lastCommitHash` | VARCHAR(40) | 否 | 最后修改的 commit hash | INVERTED |
| `language` | VARCHAR(32) | 否 | 编程语言 | INVERTED |
| `updateTime` | INT64 | 否 | 解析时间戳（秒） | INVERTED |
| `description` | VARCHAR(2048) | 否 | 文件描述（文件名+路径+主要类/函数摘要） | 无 |
| `embedding` | FLOAT_VECTOR(1536) | ✅ | 语义向量 | HNSW（COSINE） |

#### 4.2 Java 创建代码

```java
public class CreateFileCollection {
    public static void create(MilvusClientV2 client, String collectionName) {
        CreateCollectionReq.CollectionSchema schema = client.createSchema();
        schema.addField(DataType.Int64, "id", true, true);
        schema.addField(DataType.VarChar, "fileId", 512, false);
        schema.addField(DataType.VarChar, "filePath", 1024, false);
        schema.addField(DataType.VarChar, "repoId", 128, false).setPartitionKey(true);
        schema.addField(DataType.VarChar, "lastCommitHash", 40, false);
        schema.addField(DataType.VarChar, "language", 32, false);
        schema.addField(DataType.Int64, "updateTime", false);
        schema.addField(DataType.VarChar, "description", 2048, false);
        schema.addField(DataType.FloatVector, "embedding", 1536, false);

        client.createCollection(CreateCollectionReq.builder()
                .collectionName(collectionName)
                .collectionSchema(schema)
                .build());

        // 标量索引
        for (String field : Arrays.asList("fileId", "filePath", "repoId", "lastCommitHash", "language", "updateTime")) {
            client.createIndex(CreateIndexReq.builder()
                    .collectionName(collectionName)
                    .fieldName(field)
                    .indexType(IndexParam.IndexType.INVERTED)
                    .build());
        }

        // 向量索引
        IndexParam indexParam = IndexParam.builder()
                .fieldName("embedding")
                .indexType(IndexParam.IndexType.HNSW)
                .metricType(IndexParam.MetricType.COSINE)
                .extraParam("M", 16)
                .extraParam("efConstruction", 200)
                .build();
        client.createIndex(CreateIndexReq.builder()
                .collectionName(collectionName)
                .indexParam(indexParam)
                .build());
    }
}
```

---

### 五、Collection 3: `gitHistoryDiffHunk`

#### 5.1 字段定义

| 字段名 | 类型 | 是否向量 | 说明 | 索引 |
|--------|------|----------|------|------|
| `id` | INT64 | 否 | 自增主键 | 主键 |
| `diffId` | VARCHAR(512) | 否 | diff 块唯一标识（`{commitHash}:{filePath}:{startLine}`） | INVERTED |
| `commitHash` | VARCHAR(40) | 否 | 所属 commit hash | INVERTED |
| `filePath` | VARCHAR(1024) | 否 | 所属文件路径 | INVERTED |
| `repoId` | VARCHAR(128) | 否 | 仓库标识（分区键） | INVERTED |
| `changeType` | VARCHAR(16) | 否 | `add` / `delete` / `modify` | INVERTED |
| `commitTime` | INT64 | 否 | 所属 commit 的时间戳（冗余，便于时间过滤） | INVERTED |
| `newCode` | VARCHAR(4096) | 否 | 变更后的代码片段（可截断） | 无 |
| `embedding` | FLOAT_VECTOR(1536) | ✅ | 语义向量（基于 `newCode` + `changeType`） | HNSW（COSINE） |

#### 5.2 Java 创建代码

```java
public class CreateDiffHunkCollection {
    public static void create(MilvusClientV2 client, String collectionName) {
        CreateCollectionReq.CollectionSchema schema = client.createSchema();
        schema.addField(DataType.Int64, "id", true, true);
        schema.addField(DataType.VarChar, "diffId", 512, false);
        schema.addField(DataType.VarChar, "commitHash", 40, false);
        schema.addField(DataType.VarChar, "filePath", 1024, false);
        schema.addField(DataType.VarChar, "repoId", 128, false).setPartitionKey(true);
        schema.addField(DataType.VarChar, "changeType", 16, false);
        schema.addField(DataType.Int64, "commitTime", false);
        schema.addField(DataType.VarChar, "newCode", 4096, false);
        schema.addField(DataType.FloatVector, "embedding", 1536, false);

        client.createCollection(CreateCollectionReq.builder()
                .collectionName(collectionName)
                .collectionSchema(schema)
                .build());

        // 标量索引
        for (String field : Arrays.asList("diffId", "commitHash", "filePath", "repoId", "changeType", "commitTime")) {
            client.createIndex(CreateIndexReq.builder()
                    .collectionName(collectionName)
                    .fieldName(field)
                    .indexType(IndexParam.IndexType.INVERTED)
                    .build());
        }

        // 向量索引
        IndexParam indexParam = IndexParam.builder()
                .fieldName("embedding")
                .indexType(IndexParam.IndexType.HNSW)
                .metricType(IndexParam.MetricType.COSINE)
                .extraParam("M", 16)
                .extraParam("efConstruction", 200)
                .build();
        client.createIndex(CreateIndexReq.builder()
                .collectionName(collectionName)
                .indexParam(indexParam)
                .build());
    }
}
```

---

### 六、Collection 4: `gitHistoryMethod`

#### 6.1 字段定义

| 字段名 | 类型 | 是否向量 | 说明 | 索引 |
|--------|------|----------|------|------|
| `id` | INT64 | 否 | 自增主键 | 主键 |
| `methodId` | VARCHAR(512) | 否 | 函数唯一标识（`{fileId}:{name}:{startLine}`） | INVERTED |
| `methodName` | VARCHAR(256) | 否 | 函数名 | INVERTED |
| `fileId` | VARCHAR(512) | 否 | 所属文件 ID | INVERTED |
| `filePath` | VARCHAR(1024) | 否 | 所属文件路径 | INVERTED |
| `repoId` | VARCHAR(128) | 否 | 仓库标识（分区键） | INVERTED |
| `commitHash` | VARCHAR(40) | 否 | 最近修改该函数的 commit hash | INVERTED |
| `signature` | VARCHAR(1024) | 否 | 函数签名 | 无 |
| `bodySnippet` | VARCHAR(4096) | 否 | 函数体代码片段（截断） | 无 |
| `language` | VARCHAR(32) | 否 | 编程语言 | INVERTED |
| `updateTime` | INT64 | 否 | 解析时间戳 | INVERTED |
| `embedding` | FLOAT_VECTOR(1536) | ✅ | 语义向量（基于 `signature + bodySnippet`） | HNSW（COSINE） |

#### 6.2 Java 创建代码

```java
public class CreateMethodCollection {
    public static void create(MilvusClientV2 client, String collectionName) {
        CreateCollectionReq.CollectionSchema schema = client.createSchema();
        schema.addField(DataType.Int64, "id", true, true);
        schema.addField(DataType.VarChar, "methodId", 512, false);
        schema.addField(DataType.VarChar, "methodName", 256, false);
        schema.addField(DataType.VarChar, "fileId", 512, false);
        schema.addField(DataType.VarChar, "filePath", 1024, false);
        schema.addField(DataType.VarChar, "repoId", 128, false).setPartitionKey(true);
        schema.addField(DataType.VarChar, "commitHash", 40, false);
        schema.addField(DataType.VarChar, "signature", 1024, false);
        schema.addField(DataType.VarChar, "bodySnippet", 4096, false);
        schema.addField(DataType.VarChar, "language", 32, false);
        schema.addField(DataType.Int64, "updateTime", false);
        schema.addField(DataType.FloatVector, "embedding", 1536, false);

        client.createCollection(CreateCollectionReq.builder()
                .collectionName(collectionName)
                .collectionSchema(schema)
                .build());

        // 标量索引
        for (String field : Arrays.asList("methodId", "methodName", "fileId", "filePath", 
                                          "repoId", "commitHash", "language", "updateTime")) {
            client.createIndex(CreateIndexReq.builder()
                    .collectionName(collectionName)
                    .fieldName(field)
                    .indexType(IndexParam.IndexType.INVERTED)
                    .build());
        }

        // 向量索引
        IndexParam indexParam = IndexParam.builder()
                .fieldName("embedding")
                .indexType(IndexParam.IndexType.HNSW)
                .metricType(IndexParam.MetricType.COSINE)
                .extraParam("M", 16)
                .extraParam("efConstruction", 200)
                .build();
        client.createIndex(CreateIndexReq.builder()
                .collectionName(collectionName)
                .indexParam(indexParam)
                .build());
    }
}
```

---

### 七、向量生成策略汇总

| 表 | 输入内容 | 生成说明 |
|----|----------|----------|
| `gitHistoryCommit` | `summary` = `message` + `" modified: "` + 文件路径列表 | 调用 embedding 模型（如 OpenAI） |
| `gitHistoryFile` | `description` = `filePath` + `" language:"` + `language` + 可选的主要类/函数名列表 | 同上 |
| `gitHistoryDiffHunk` | `newCode` + `" type:"` + `changeType` | 截取前 4096 字符，避免超长 |
| `gitHistoryMethod` | `signature` + `"\n"` + `bodySnippet` | 截取前 4096 字符 |

---

### 八、Java 插入数据示例（以 `gitHistoryCommit` 为例）

```java
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.*;

public class InsertCommit {
    public static void insert(MilvusClientV2 client, String collectionName) {
        List<Map<String, Object>> rows = new ArrayList<>();
        Map<String, Object> row = new HashMap<>();
        row.put("commitHash", "abc123");
        row.put("repoId", "myorg/myrepo");
        row.put("authorTime", 1700000000L);
        row.put("summary", "fix: 登录超时处理，修改了 auth.py");
        row.put("embedding", generateEmbedding("fix: 登录超时处理，修改了 auth.py")); // 1536维向量
        rows.add(row);
        
        InsertReq insertReq = InsertReq.builder()
                .collectionName(collectionName)
                .data(rows)
                .build();
        client.insert(insertReq);
    }
}
```

---

### 九、总结

- **4 张表**覆盖提交、文件、diff 块、函数四个粒度，满足不同层次的语义检索需求。
- **冗余字段**：`repoId`（分区键）、`commitTime`（在 diff 表中）、`updateTime` 等，支持高效过滤。
- **索引完备**：标量字段使用 INVERTED 索引，向量字段使用 HNSW（COSINE）。
- **Java SDK 2.6.13** 兼容的 API 风格（使用 `MilvusClientV2`、`CreateCollectionReq` 等）。

此设计可直接用于批量解析脚本的向量入库逻辑。

# 参考资料

* any list
{:toc}