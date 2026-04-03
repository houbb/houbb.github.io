---
layout: post 
title: 代码知识库之 git history-05-memgraph 图数据库
date: 2026-04-03 21:01:55 +0800
categories: [AI]
tags: [ai, git, harness, coe-graph]
published: true
---

# chat

## 背景

```
现在。站在批量定时解析的角度。希望实体可以是 gitHistory 开头

给出整个流程中，涉及到的图数据库中需要的实体、实体的关系。每个实体的属性、索引。
```

## 设计

## 图数据库实体与关系设计（GitHistory 前缀，含冗余字段）

所有实体标签以 `GitHistory` 开头，关系类型以大写字母+下划线命名。  
**冗余字段**（标注 🔴）用于加速常见查询，避免多跳遍历。

---

### 一、实体（节点）

#### 1. `GitHistoryCommit`（提交节点）

| 属性 | 类型 | 说明 | 索引 |
|------|------|------|------|
| `hash` | string | 完整 commit SHA（40 字符） | **唯一索引** |
| `shortHash` | string | 前 7 位 SHA | 普通索引 |
| `message` | string | 原始提交信息 | 无 |
| `authorName` | string | 作者名 | 普通索引 |
| `authorEmail` | string | 作者邮箱 | 无 |
| `authorTime` | datetime | ISO 8601 格式 | **范围索引** |
| `committerName` | string | 提交者名 | 无 |
| `committerTime` | datetime | 提交时间 | 无 |
| `isMerge` | boolean | 是否为合并提交 | 普通索引 |
| `parentHashes` | list[string] | 父提交的 hash 列表 | 无 |
| `branch` | string | 所在分支（默认 `main`） | 普通索引 |
| `summary` | string | LLM 生成的 1-2 句摘要 | 无（向量存 Milvus） |
| 🔴 `repoId` | string | 所属仓库的唯一标识（如 `org/repo`） | **普通索引**（高频过滤） |

**冗余说明**：`repoId` 使得多仓库场景下可以直接按仓库过滤，无需通过额外的 `GitHistoryRepo` 节点关联。

---

#### 2. `GitHistoryFile`（文件节点）

| 属性 | 类型 | 说明 | 索引 |
|------|------|------|------|
| `path` | string | 文件在当前仓库中的绝对路径 | **唯一索引**（与 `repoId` 联合） |
| `previousPath` | string | 若文件被重命名，记录上一次的路径 | 普通索引 |
| `language` | string | 编程语言（如 `python`, `java`） | 普通索引 |
| `size` | integer | 文件大小（字节），最后一次解析时的值 | 无 |
| 🔴 `lastCommitHash` | string | 最后一次修改该文件的 commit hash | 普通索引（用于快速获取最新版本） |
| 🔴 `repoId` | string | 所属仓库标识（与 `GitHistoryCommit.repoId` 一致） | 普通索引 |

**冗余说明**：  
- `lastCommitHash` 避免查询“哪个 commit 最后改了该文件”时需要遍历所有 `COMMIT_MODIFIES_FILE` 关系再排序。  
- `repoId` 便于跨仓库隔离，且与 commit 的 `repoId` 保持一致。

---

#### 3. `GitHistoryDiffHunk`（差异块节点）

| 属性 | 类型 | 说明 | 索引 |
|------|------|------|------|
| `id` | string | 唯一 ID（如 `{commitHash}:{filePath}:{startLine}`） | **唯一索引** |
| `oldStartLine` | integer | 变更前起始行号 | 无 |
| `oldLineCount` | integer | 变更前总行数 | 无 |
| `newStartLine` | integer | 变更后起始行号 | 无 |
| `newLineCount` | integer | 变更后总行数 | 无 |
| `oldCode` | string | 变更前的代码片段（截断至 500 字符） | 无 |
| `newCode` | string | 变更后的代码片段（截断至 500 字符） | 无 |
| `changeType` | string | 枚举：`add`, `delete`, `modify` | 普通索引 |
| 🔴 `commitHash` | string | 所属 commit 的 hash（冗余） | 普通索引 |
| 🔴 `filePath` | string | 所属文件路径（冗余） | 普通索引 |

**冗余说明**：`commitHash` 和 `filePath` 使得查询“某 commit 下的所有 diff hunk”或“某文件的所有 diff hunk”时不需要通过关系边，直接属性过滤即可。

---

#### 4. `GitHistoryFunction`（函数/方法节点）

| 属性 | 类型 | 说明 | 索引 |
|------|------|------|------|
| `id` | string | 唯一 ID（如 `{filePath}:{name}:{startLine}`） | **唯一索引** |
| `name` | string | 函数名（匿名函数生成 `__anonymous__{hash}`） | 普通索引 |
| `signature` | string | 函数签名（尽力提取） | 无 |
| `startLine` | integer | 函数起始行号 | 无 |
| `endLine` | integer | 函数结束行号 | 无 |
| `language` | string | 编程语言 | 普通索引 |
| `bodyHash` | string | 函数体内容的哈希（用于检测相同代码） | 普通索引 |
| 🔴 `fileId` | string | 所属文件的 ID（即 `GitHistoryFile.id`，值为 `{repoId}:{path}`） | **普通索引** |
| 🔴 `filePath` | string | 所属文件路径（冗余，便于展示） | 普通索引 |
| 🔴 `repoId` | string | 所属仓库标识 | 普通索引 |

**冗余说明**：  
- `fileId` 直接指向文件节点，避免通过 `FUNCTION_LOCATED_IN_FILE` 关系查询。  
- `filePath` 和 `repoId` 用于快速过滤和展示，减少关联查询。

---

### 二、关系（边）

| 关系类型 | 起始节点 | 结束节点 | 属性 | 说明 |
|----------|----------|----------|------|------|
| `COMMIT_CONTAINS_DIFFHUNK` | `GitHistoryCommit` | `GitHistoryDiffHunk` | `order` (integer) | 提交包含 diff 块 |
| `DIFFHUNK_CHANGES_FUNCTION` | `GitHistoryDiffHunk` | `GitHistoryFunction` | `impactType` (string: `added`, `removed`, `modified`) | diff 块影响了哪个函数 |
| `COMMIT_MODIFIES_FILE` | `GitHistoryCommit` | `GitHistoryFile` | 无 | 提交修改了该文件 |
| `FUNCTION_LOCATED_IN_FILE` | `GitHistoryFunction` | `GitHistoryFile` | 无 | 函数定义在文件中（冗余字段已提供快速访问，但保留关系用于图遍历） |
| `FUNCTION_CALLS_FUNCTION` | `GitHistoryFunction` | `GitHistoryFunction` | `callSite` (string) | 函数调用关系（静态分析） |
| `COMMIT_INTRODUCES_FUNCTION` | `GitHistoryCommit` | `GitHistoryFunction` | `firstAppearance` (boolean) | 提交首次引入该函数（可选） |

**注意**：即使添加了冗余字段，关系边依然保留，因为图遍历和路径查询（如“从 commit 到 function 的路径”）仍依赖关系。冗余字段仅用于单节点属性过滤或直接获取关联信息，避免多跳。

---

### 三、索引汇总（Neo4j Cypher）

```cypher
// GitHistoryCommit 索引
CREATE CONSTRAINT FOR (c:GitHistoryCommit) REQUIRE c.hash IS UNIQUE;
CREATE INDEX FOR (c:GitHistoryCommit) ON (c.shortHash);
CREATE INDEX FOR (c:GitHistoryCommit) ON (c.authorTime);
CREATE INDEX FOR (c:GitHistoryCommit) ON (c.branch);
CREATE INDEX FOR (c:GitHistoryCommit) ON (c.repoId);          // 🔴 冗余字段索引

// GitHistoryFile 索引
CREATE CONSTRAINT FOR (f:GitHistoryFile) REQUIRE (f.repoId, f.path) IS UNIQUE;
CREATE INDEX FOR (f:GitHistoryFile) ON (f.previousPath);
CREATE INDEX FOR (f:GitHistoryFile) ON (f.language);
CREATE INDEX FOR (f:GitHistoryFile) ON (f.lastCommitHash);   // 🔴 冗余字段索引
CREATE INDEX FOR (f:GitHistoryFile) ON (f.repoId);

// GitHistoryDiffHunk 索引
CREATE CONSTRAINT FOR (d:GitHistoryDiffHunk) REQUIRE d.id IS UNIQUE;
CREATE INDEX FOR (d:GitHistoryDiffHunk) ON (d.changeType);
CREATE INDEX FOR (d:GitHistoryDiffHunk) ON (d.commitHash);    // 🔴 冗余字段索引
CREATE INDEX FOR (d:GitHistoryDiffHunk) ON (d.filePath);

// GitHistoryFunction 索引
CREATE CONSTRAINT FOR (fn:GitHistoryFunction) REQUIRE fn.id IS UNIQUE;
CREATE INDEX FOR (fn:GitHistoryFunction) ON (fn.name);
CREATE INDEX FOR (fn:GitHistoryFunction) ON (fn.bodyHash);
CREATE INDEX FOR (fn:GitHistoryFunction) ON (fn.fileId);      // 🔴 冗余字段索引
CREATE INDEX FOR (fn:GitHistoryFunction) ON (fn.filePath);
CREATE INDEX FOR (fn:GitHistoryFunction) ON (fn.repoId);

// 关系索引（可选，加速特定路径）
CREATE INDEX FOR ()-[r:COMMIT_CONTAINS_DIFFHUNK]-() ON (r.order);
CREATE INDEX FOR ()-[r:DIFFHUNK_CHANGES_FUNCTION]-() ON (r.impactType);
```

---

### 四、冗余字段维护策略

| 实体 | 冗余字段 | 维护时机 | 更新方式 |
|------|----------|----------|----------|
| `GitHistoryCommit.repoId` | 仓库标识 | 插入 commit 时 | 由解析脚本根据配置的仓库名直接写入，不随历史改变 |
| `GitHistoryFile.lastCommitHash` | 最后一次修改的 commit | 每次处理新 commit 时 | 若该 commit 修改了某文件，则更新该文件的 `lastCommitHash` 为当前 commit.hash（按时间顺序，保留最新） |
| `GitHistoryFile.repoId` | 仓库标识 | 插入文件节点时 | 与 commit.repoId 保持一致 |
| `GitHistoryDiffHunk.commitHash` | 所属 commit | 创建 diff hunk 时 | 直接写入当前正在处理的 commit.hash |
| `GitHistoryDiffHunk.filePath` | 所属文件路径 | 创建 diff hunk 时 | 从 diff 上下文中获取文件路径 |
| `GitHistoryFunction.fileId` | 所属文件 ID | 创建函数节点时 | 由文件路径生成 ID（格式 `{repoId}:{path}`），若文件节点已存在则直接使用 |
| `GitHistoryFunction.filePath` | 所属文件路径 | 创建函数节点时 | 直接写入 |
| `GitHistoryFunction.repoId` | 仓库标识 | 创建函数节点时 | 从所属文件继承 |

**一致性保证**：  
- 全量构建时，按拓扑顺序处理 commit，确保 `lastCommitHash` 最终指向时间最近的提交。  
- 增量更新时，对于旧文件的 `lastCommitHash` 若新提交的时间更新，则覆盖。  
- 若文件被删除后重建，`lastCommitHash` 会指向重建时的最新提交。

---

### 五、查询示例（利用冗余字段）

1. **查询某仓库下所有 commit**  
   ```cypher
   MATCH (c:GitHistoryCommit {repoId: "myorg/myrepo"}) RETURN c
   ```

2. **获取文件的最新修改 commit 信息**（无需关系）  
   ```cypher
   MATCH (f:GitHistoryFile {path: "src/main.py"})
   MATCH (c:GitHistoryCommit {hash: f.lastCommitHash})
   RETURN f, c
   ```

3. **查找某个函数所在文件的路径**（直接读属性）  
   ```cypher
   MATCH (fn:GitHistoryFunction {id: "myorg/myrepo:src/auth.py:login"})
   RETURN fn.filePath, fn.fileId
   ```

4. **查询某 commit 的所有 diff hunk**（利用冗余 `commitHash`）  
   ```cypher
   MATCH (d:GitHistoryDiffHunk {commitHash: "abc123"}) RETURN d
   ```

---

### 六、设计总结

- **命名统一**：`GitHistory` 前缀，冗余字段用普通属性存储，无需特殊前缀。  
- **冗余字段选择**：覆盖最常见的查询模式（按仓库过滤、按文件查最新提交、按 commit 查 diff、按函数查文件），避免多跳。  
- **索引覆盖**：对所有冗余字段建立索引，保证查询性能。  
- **维护成本**：增量更新时需同步更新冗余字段，但换来查询效率的大幅提升，适合读多写少的场景。  

此设计可直接用于批量解析脚本的图入库逻辑。

# 参考资料

* any list
{:toc}