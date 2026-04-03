---
layout: post 
title: 代码知识库之 git history-09-git 命令 java 实现
date: 2026-04-03 21:01:55 +0800
categories: [AI]
tags: [ai, git, harness, coe-graph]
published: true
---

# chat

## 背景

```
给出一段 java 代码，建议使用 java 稳定推荐的 git 开源包。

给出 pom 依赖。

给出一个代码仓库，上面3个命令，获取近一年的提交数据的数据构建，面向对象的写法，给出核心代码
```

## 设计

以下是基于 JGit 的完整 Java 实现，包含 Maven 依赖和核心代码。

---

## 一、Maven 依赖（pom.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.git.history</groupId>
    <artifactId>git-history-analyzer</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- JGit 核心库（当前最新稳定版本） -->
        <dependency>
            <groupId>org.eclipse.jgit</groupId>
            <artifactId>org.eclipse.jgit</artifactId>
            <version>7.4.0.202509020913-r</version>
        </dependency>

        <!-- SLF4J 日志接口（JGit 依赖） -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>2.0.9</version>
        </dependency>

        <!-- Lombok（可选，用于简化 POJO） -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.30</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 二、数据模型（POJO 类）

### 2.1 `CommitInfo.java`（提交元信息）

```java
package com.git.history.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommitInfo {
    /** 完整 commit SHA（40 字符） */
    private String hash;
    
    /** 作者名 */
    private String authorName;
    
    /** 作者邮箱 */
    private String authorEmail;
    
    /** 作者时间（Unix 时间戳，秒） */
    private Long authorTime;
    
    /** 提交消息第一行（subject） */
    private String subject;
    
    /** 变更的文件列表 */
    private List<FileChangeInfo> fileChanges;
}
```

### 2.2 `FileChangeInfo.java`（文件变更信息）

```java
package com.git.history.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileChangeInfo {
    /** 文件路径（相对于仓库根目录） */
    private String path;
    
    /** 变更类型：ADD, DELETE, MODIFY, RENAME */
    private ChangeType changeType;
    
    /** 变更前的文件路径（仅重命名时有效） */
    private String oldPath;
    
    /** 变更块的列表（diff hunks） */
    private List<DiffHunkInfo> hunks;
    
    public enum ChangeType {
        ADD,      // 新增文件
        DELETE,   // 删除文件
        MODIFY,   // 修改文件
        RENAME    // 重命名文件
    }
}
```

### 2.3 `DiffHunkInfo.java`（差异块信息）

```java
package com.git.history.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiffHunkInfo {
    /** 旧文件起始行号 */
    private int oldStartLine;
    
    /** 旧文件总行数 */
    private int oldLineCount;
    
    /** 新文件起始行号 */
    private int newStartLine;
    
    /** 新文件总行数 */
    private int newLineCount;
    
    /** 变更行的列表（每行内容，'-' 表示删除，'+' 表示新增） */
    private List<String> lines;
}
```

---

## 三、核心服务类

### 3.1 `GitHistoryAnalyzer.java`（主分析器）

```java
package com.git.history.service;

import com.git.history.model.CommitInfo;
import com.git.history.model.FileChangeInfo;
import com.git.history.model.DiffHunkInfo;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.diff.Edit;
import org.eclipse.jgit.diff.EditList;
import org.eclipse.jgit.diff.RawTextComparator;
import org.eclipse.jgit.errors.MissingObjectException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.patch.FileHeader;
import org.eclipse.jgit.patch.HunkHeader;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.revwalk.filter.CommitTimeRevFilter;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.eclipse.jgit.treewalk.EmptyTreeIterator;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Slf4j
public class GitHistoryAnalyzer implements AutoCloseable {
    
    private final Repository repository;
    private final Git git;
    private final RevWalk revWalk;
    
    /**
     * 构造函数，打开本地 Git 仓库
     *
     * @param repoPath .git 目录的路径或工作目录路径
     * @throws IOException 如果无法打开仓库
     */
    public GitHistoryAnalyzer(String repoPath) throws IOException {
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        // 如果传入的是 .git 目录，直接设置；否则尝试查找
        File gitDir = new File(repoPath);
        if (gitDir.isDirectory() && gitDir.getName().equals(".git")) {
            builder.setGitDir(gitDir);
        } else {
            builder.setWorkTree(gitDir).findGitDir();
        }
        
        this.repository = builder
                .readEnvironment()
                .build();
        this.git = new Git(repository);
        this.revWalk = new RevWalk(repository);
    }
    
    /**
     * 获取近一年内的所有提交（按时间正序）
     *
     * @return 提交 SHA 列表
     * @throws GitAPIException Git 操作异常
     */
    public List<String> getCommitsSinceOneYear() throws GitAPIException {
        // 计算一年前的日期
        Date since = Date.from(Instant.now().minus(365, ChronoUnit.DAYS));
        log.info("获取 {} 之后的提交记录", since);
        
        List<String> commitHashes = new ArrayList<>();
        // 使用 LogCommand，添加时间过滤器（按正序输出）
        Iterable<RevCommit> commits = git.log()
                .setRevFilter(CommitTimeRevFilter.after(since))
                .call();
        
        // 转换为正序（git.log() 默认按时间倒序）
        List<RevCommit> revCommitList = new ArrayList<>();
        for (RevCommit commit : commits) {
            revCommitList.add(commit);
        }
        // 反转得到正序
        for (int i = revCommitList.size() - 1; i >= 0; i--) {
            commitHashes.add(revCommitList.get(i).getName());
        }
        
        log.info("共获取 {} 个提交", commitHashes.size());
        return commitHashes;
    }
    
    /**
     * 获取单个提交的元信息
     *
     * @param commitHash 提交 SHA
     * @return CommitInfo 对象
     * @throws IOException IO 异常
     */
    public CommitInfo getCommitMeta(String commitHash) throws IOException {
        ObjectId objectId = repository.resolve(commitHash);
        if (objectId == null) {
            throw new IllegalArgumentException("无效的 commit hash: " + commitHash);
        }
        
        RevCommit commit = revWalk.parseCommit(objectId);
        revWalk.parseBody(commit);
        
        return CommitInfo.builder()
                .hash(commit.getName())
                .authorName(commit.getAuthorIdent().getName())
                .authorEmail(commit.getAuthorIdent().getEmailAddress())
                .authorTime(commit.getAuthorIdent().getWhen().getTime() / 1000L)
                .subject(commit.getShortMessage())
                .build();
    }
    
    /**
     * 获取单个提交的 Diff 信息（不含元信息）
     *
     * @param commitHash 提交 SHA
     * @return 文件变更列表
     * @throws IOException IO 异常
     */
    public List<FileChangeInfo> getCommitDiff(String commitHash) throws IOException {
        ObjectId objectId = repository.resolve(commitHash);
        if (objectId == null) {
            throw new IllegalArgumentException("无效的 commit hash: " + commitHash);
        }
        
        RevCommit commit = revWalk.parseCommit(objectId);
        revWalk.parseBody(commit);
        
        // 获取父提交
        RevCommit parent = null;
        if (commit.getParentCount() > 0) {
            parent = revWalk.parseCommit(commit.getParent(0).getId());
        }
        
        return computeDiff(parent, commit);
    }
    
    /**
     * 计算两个提交之间的差异
     *
     * @param oldCommit 旧提交（可为 null，表示空树）
     * @param newCommit 新提交
     * @return 文件变更列表
     * @throws IOException IO 异常
     */
    private List<FileChangeInfo> computeDiff(RevCommit oldCommit, RevCommit newCommit) throws IOException {
        List<FileChangeInfo> fileChanges = new ArrayList<>();
        
        try (DiffFormatter diffFormatter = new DiffFormatter(new ByteArrayOutputStream())) {
            diffFormatter.setRepository(repository);
            // 关闭上下文行数（相当于 --unified=0），只显示变更行
            diffFormatter.setContext(0);
            diffFormatter.setDiffComparator(RawTextComparator.DEFAULT);
            diffFormatter.setDetectRenames(true);
            
            List<DiffEntry> diffs;
            try (ObjectReader reader = repository.newObjectReader()) {
                if (oldCommit == null) {
                    // 初始提交：对比空树
                    CanonicalTreeParser newTreeParser = new CanonicalTreeParser();
                    newTreeParser.reset(reader, newCommit.getTree());
                    diffs = diffFormatter.scan(new EmptyTreeIterator(), newTreeParser);
                } else {
                    CanonicalTreeParser oldTreeParser = new CanonicalTreeParser();
                    CanonicalTreeParser newTreeParser = new CanonicalTreeParser();
                    oldTreeParser.reset(reader, oldCommit.getTree());
                    newTreeParser.reset(reader, newCommit.getTree());
                    diffs = diffFormatter.scan(oldTreeParser, newTreeParser);
                }
            }
            
            for (DiffEntry diff : diffs) {
                FileChangeInfo changeInfo = parseDiffEntry(diff, diffFormatter);
                fileChanges.add(changeInfo);
            }
        }
        
        return fileChanges;
    }
    
    /**
     * 解析单个 DiffEntry 为 FileChangeInfo
     *
     * @param diffEntry      DiffEntry 对象
     * @param diffFormatter  DiffFormatter（用于获取 FileHeader）
     * @return FileChangeInfo
     * @throws IOException IO 异常
     */
    private FileChangeInfo parseDiffEntry(DiffEntry diffEntry, DiffFormatter diffFormatter) throws IOException {
        FileChangeInfo.ChangeType changeType;
        String path = diffEntry.getNewPath();
        String oldPath = null;
        
        switch (diffEntry.getChangeType()) {
            case ADD:
                changeType = FileChangeInfo.ChangeType.ADD;
                break;
            case DELETE:
                changeType = FileChangeInfo.ChangeType.DELETE;
                path = diffEntry.getOldPath();
                break;
            case RENAME:
                changeType = FileChangeInfo.ChangeType.RENAME;
                oldPath = diffEntry.getOldPath();
                break;
            default:
                changeType = FileChangeInfo.ChangeType.MODIFY;
                break;
        }
        
        // 获取 FileHeader 以提取 hunk 信息
        FileHeader fileHeader = diffFormatter.toFileHeader(diffEntry);
        List<DiffHunkInfo> hunks = parseHunks(fileHeader);
        
        return FileChangeInfo.builder()
                .path(path)
                .oldPath(oldPath)
                .changeType(changeType)
                .hunks(hunks)
                .build();
    }
    
    /**
     * 解析 FileHeader 中的 Hunk 信息
     *
     * @param fileHeader FileHeader 对象
     * @return Hunk 列表
     */
    private List<DiffHunkInfo> parseHunks(FileHeader fileHeader) {
        List<DiffHunkInfo> hunks = new ArrayList<>();
        
        for (HunkHeader hunkHeader : fileHeader.getHunks()) {
            // 获取旧文件的行号范围
            int oldStart = hunkHeader.getOldStart();
            int oldLines = hunkHeader.getOldLines();
            // 获取新文件的行号范围
            int newStart = hunkHeader.getNewStart();
            int newLines = hunkHeader.getNewLines();
            
            // 获取 hunk 中的具体变更行
            List<String> lines = new ArrayList<>();
            for (Edit edit : hunkHeader.toEditList()) {
                // Edit 包含变更的详细信息
                // 实际行内容需要从原始文件读取，这里简化处理
                lines.add(formatEditInfo(edit));
            }
            
            DiffHunkInfo hunk = DiffHunkInfo.builder()
                    .oldStartLine(oldStart)
                    .oldLineCount(oldLines)
                    .newStartLine(newStart)
                    .newLineCount(newLines)
                    .lines(lines)
                    .build();
            hunks.add(hunk);
        }
        
        return hunks;
    }
    
    /**
     * 格式化 Edit 信息（用于展示）
     *
     * @param edit Edit 对象
     * @return 格式化的字符串
     */
    private String formatEditInfo(Edit edit) {
        switch (edit.getType()) {
            case INSERT:
                return String.format("+ insert at line %d", edit.getBeginB());
            case DELETE:
                return String.format("- delete at line %d", edit.getBeginA());
            case REPLACE:
                return String.format("~ replace lines %d-%d with lines %d-%d",
                        edit.getBeginA(), edit.getEndA() - 1,
                        edit.getBeginB(), edit.getEndB() - 1);
            default:
                return "  unchanged";
        }
    }
    
    /**
     * 关闭资源
     */
    @Override
    public void close() {
        if (revWalk != null) {
            revWalk.close();
        }
        if (git != null) {
            git.close();
        }
        if (repository != null) {
            repository.close();
        }
    }
}
```

---

## 四、使用示例

### `Main.java`（入口示例）

```java
package com.git.history;

import com.git.history.model.CommitInfo;
import com.git.history.model.FileChangeInfo;
import com.git.history.service.GitHistoryAnalyzer;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class Main {
    public static void main(String[] args) {
        // 仓库路径（可以是 .git 目录或工作目录）
        String repoPath = "/path/to/your/repo";
        
        try (GitHistoryAnalyzer analyzer = new GitHistoryAnalyzer(repoPath)) {
            // 1. 获取近一年所有提交 hash
            List<String> commitHashes = analyzer.getCommitsSinceOneYear();
            log.info("找到 {} 个提交", commitHashes.size());
            
            // 2. 遍历每个提交
            for (int i = 0; i < commitHashes.size(); i++) {
                String hash = commitHashes.get(i);
                log.info("处理第 {}/{} 个提交: {}", i + 1, commitHashes.size(), hash);
                
                // 获取提交元信息
                CommitInfo meta = analyzer.getCommitMeta(hash);
                log.info("作者: {}, 时间: {}, 消息: {}",
                        meta.getAuthorName(),
                        meta.getAuthorTime(),
                        meta.getSubject());
                
                // 获取 diff 信息
                List<FileChangeInfo> changes = analyzer.getCommitDiff(hash);
                for (FileChangeInfo change : changes) {
                    log.info("  文件: {}, 变更类型: {}",
                            change.getPath(),
                            change.getChangeType());
                    log.info("  Hunk 数量: {}", change.getHunks().size());
                }
            }
            
        } catch (Exception e) {
            log.error("解析失败", e);
        }
    }
}
```

---

## 五、代码结构总结

```
src/main/java/com/git/history/
├── model/
│   ├── CommitInfo.java          // 提交元信息 POJO
│   ├── FileChangeInfo.java      // 文件变更信息 POJO
│   └── DiffHunkInfo.java        // Diff Hunk 信息 POJO
├── service/
│   └── GitHistoryAnalyzer.java  // 核心分析服务（主要逻辑）
└── Main.java                    // 使用示例入口
```

---

## 六、关键技术点说明

| 功能 | JGit API | 说明 |
|------|----------|------|
| 获取提交列表 | `git.log().setRevFilter(CommitTimeRevFilter.after(since)).call()` | 使用 `CommitTimeRevFilter` 按时间过滤，相当于 `--since="1 year ago"` |
| 获取提交元信息 | `RevCommit.getAuthorIdent().getName()` / `.getEmailAddress()` / `.getWhen()` / `.getShortMessage()` | 对应命令2的 `%an`, `%ae`, `%at`, `%s` |
| 获取纯净 diff | `DiffFormatter` + `setContext(0)` + `setDetectRenames(true)` | `setContext(0)` 相当于 `--unified=0` |
| 处理初始提交 | `new EmptyTreeIterator()` | 父提交为空时，对比空树 |
| 提取 Hunk 信息 | `FileHeader.getHunks()` → `HunkHeader.getOldStart()`, `.getNewStart()` 等 | 提取行号范围 |
| 检测重命名 | `DiffFormatter.setDetectRenames(true)` | 自动检测文件重命名，`DiffEntry.getChangeType()` 返回 `RENAME` |


# 参考资料

* any list
{:toc}