---
layout: post
title: docker install helm windows 实战
date: 2026-01-20 21:01:55 +0800
categories: [Docker]
tags: [ai, docker, sh]
published: true
---

# 业务背景

# 前置

windows 正确安装了 docker desktop

## 启用 k8s

选择右上角的 setting 按钮==> Kubernetes ==> Enable Kubernetes



# 旧代码备份

```java
    /**
     * 全量同步
     *
     * 扫描所有文件并上传
     *
     * @param rootPath 根目录
     * @return 同步结果
     */
    public SyncResult fullSync(Path rootPath) {
        log.info("╔════════════════════════════════════════════════════════════╗");
        log.info("║                    Full Sync Started                        ║");
        log.info("╚════════════════════════════════════════════════════════════╝");
        log.info("  Project ID: {}", projectId);
        log.info("  Root Path: {}", rootPath);
        log.info("  Server URL: {}", uploadService.getServerUrl());
        log.info("  Mock Mode: {}", uploadService.isMockMode());
        log.info("────────────────────────────────────────────────────────────────");

        long startTime = System.currentTimeMillis();

        // 扫描所有文件
        ScanResult scanResult = scanner.scan(rootPath);

        if (scanResult.getList().isEmpty()) {
            log.warn("No entities found during scan");
            return new SyncResult(0, false, "No entities found");
        }

        // 上传数据
        boolean uploadSuccess = uploadService.uploadScanResult(projectId, scanResult);

        long duration = System.currentTimeMillis() - startTime;

        log.info("────────────────────────────────────────────────────────────────");
        log.info("  Full Sync Complete:");
        log.info("    Files: {}", scanResult.getList().size());
        log.info("    Duration: {} ms", duration);
        log.info("    Status: {}", uploadSuccess ? "SUCCESS" : "FAILED");
        log.info("────────────────────────────────────────────────────────────────");

        return new SyncResult(
                scanResult.getList().size(),
                uploadSuccess,
                uploadSuccess ? "Full sync completed" : "Upload failed"
        );
    }
```

# 参考资料

https://milvus.io/docs/zh/install_standalone-docker.md

* any list
{:toc}