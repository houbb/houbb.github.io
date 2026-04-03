---
layout: post 
title: 代码知识库之 git history-05-skills 文件 → 提交（功能意图聚类）
date: 2026-04-03 21:01:55 +0800
categories: [AI]
tags: [ai, git, harness, coe-graph]
published: true
---

# chat

## 背景

```
现在我们来按照目前的 skills 技能 markdown 保证来写两个技能：

1）一个功能涉及到历史的哪些文件（文件函数）。功能点-》提交==》文件  

2）一个文件被哪些提交（功能代你）修改？    

分别给出这两个 skills，和后端接口的交互用 python 调用 后端的 http 接口。

技能2
```

## 名字


## 第二个技能：文件 → 提交（功能意图聚类）

### 文件 1：`skills/git-history-file-to-commits/skill.md`

```markdown
---
name: git-history-file-to-commits
description: 查询指定文件被哪些提交修改过，并对这些提交的意图（功能、修复、重构等）进行自动聚类。
version: 1.0.0
author: system
command: python3 scripts/file_to_commits.py --file-path "$FILE_PATH" --limit ${LIMIT:-20} --cluster-intents ${CLUSTER_INTENTS:-true} --include-functions ${INCLUDE_FUNCTIONS:-true}
input_schema:
  - name: file_path
    type: string
    required: true
    description: 文件在仓库中的路径，例如 "src/auth/login.py"
  - name: limit
    type: integer
    required: false
    default: 20
    description: 最多返回多少条提交，最大 100
  - name: cluster_intents
    type: boolean
    required: false
    default: true
    description: 是否对提交意图进行聚类
  - name: include_functions
    type: boolean
    required: false
    default: true
    description: 是否同时返回每个提交修改了该文件中的哪些函数
output:
  type: json
  description: 包含提交列表、意图聚类结果以及修改的函数清单
---

# Git History: File → Commits (with Intent Clustering)

## 使用场景

当开发者需要了解某个文件的变更历史时，使用本技能。它可以回答：
- 这个文件为什么频繁变动？
- 谁在什么时候改过这个文件？目的是什么？
- 该文件的修改主要分为哪几类（新功能、修复、重构）？
- 最近一次重大变更是什么？

## 核心逻辑

1. 调用后端接口 `/api/v1/file/{file_path}/commits`，获取修改过该文件的所有提交（按时间倒序）。
2. 若 `include_functions` 为 true，对每个提交调用 `/api/v1/commit/{hash}/functions`，并过滤出属于当前文件的函数。
3. 若 `cluster_intents` 为 true，调用 `/api/v1/commit/cluster`，将提交列表按 commit message 的主题聚类。
4. 返回结构化的 JSON 供 LLM 或用户分析。

## 使用示例

**输入**：
```json
{
  "file_path": "src/auth/login.py",
  "limit": 20,
  "cluster_intents": true,
  "include_functions": true
}
```

**输出**（节选）：
```json
{
  "file_path": "src/auth/login.py",
  "total_commits": 8,
  "commits": [
    {
      "hash": "def456",
      "message": "feat: 支持 OAuth 2.0 登录",
      "author": "alice",
      "time": "2025-02-10T10:00:00Z",
      "modified_functions": [
        {"id": "func_oauth", "name": "authenticate_oauth", "signature": "def authenticate_oauth(token: str) -> User"}
      ]
    },
    {
      "hash": "abc123",
      "message": "fix: 登录超时后自动刷新 token",
      "author": "bob",
      "time": "2025-01-20T14:30:00Z",
      "modified_functions": [
        {"id": "func_login", "name": "login", "signature": "def login(username: str, password: str) -> Optional[User]"}
      ]
    }
  ],
  "intent_clusters": [
    {
      "label": "新功能",
      "commits": ["def456", "789ghi"]
    },
    {
      "label": "Bug修复",
      "commits": ["abc123", "jkl012"]
    }
  ]
}
```

## 注意事项

- 后端服务地址默认为 `http://localhost:8080`，可通过环境变量 `GIT_HISTORY_BACKEND` 覆盖。
- 若文件已被重命名，后端应自动通过 `previous_path` 链回溯历史路径，确保查询完整。
- 聚类功能基于 commit message 的简单 NLP（TF-IDF + K-means），若后端未实现，脚本会跳过聚类并返回 `clustering_skipped` 标记。

## 依赖

- Python 3.8+
- `httpx`、`tenacity` 库（已在脚本中导入，需提前安装）
```

---

### 文件 2：`skills/git-history-file-to-commits/scripts/file_to_commits.py`

```python
#!/usr/bin/env python3
"""
Git History Skill: File → Commits (with Intent Clustering)
调用后端 HTTP 接口，查询修改过指定文件的所有提交，并进行意图聚类。
"""

import argparse
import json
import os
import sys
from typing import Dict, Any, List

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

# ---------- 配置 ----------
DEFAULT_BACKEND = "http://localhost:8080"
BACKEND_URL = os.environ.get("GIT_HISTORY_BACKEND", DEFAULT_BACKEND)
TIMEOUT = 30.0

# ---------- 后端接口调用（带重试） ----------
class BackendClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.client = httpx.Client(timeout=TIMEOUT)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=5))
    def _get(self, endpoint: str) -> Dict:
        resp = self.client.get(f"{self.base_url}{endpoint}")
        resp.raise_for_status()
        return resp.json()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=5))
    def _post(self, endpoint: str, json_data: Dict) -> Dict:
        resp = self.client.post(f"{self.base_url}{endpoint}", json=json_data)
        resp.raise_for_status()
        return resp.json()

    def get_file_commits(self, file_path: str, limit: int) -> Dict:
        """返回 {"commits": [{"hash": str, "message": str, "author": str, "time": str}]}"""
        return self._get(f"/api/v1/file/{file_path}/commits?limit={limit}")

    def get_commit_functions(self, commit_hash: str) -> Dict:
        """返回 {"functions": [{"function_id": str, "name": str, "file_path": str, "signature": str}]}"""
        return self._get(f"/api/v1/commit/{commit_hash}/functions")

    def cluster_commits(self, commits: List[Dict]) -> Dict:
        """返回 {"clusters": [{"label": str, "commits": [str]}]}"""
        payload = {"commits": [{"hash": c["hash"], "message": c["message"]} for c in commits]}
        return self._post("/api/v1/commit/cluster", payload)


def run(file_path: str, limit: int = 20, cluster_intents: bool = True, include_functions: bool = True) -> Dict[str, Any]:
    client = BackendClient(BACKEND_URL)

    # 1. 获取修改该文件的所有提交
    try:
        commits_data = client.get_file_commits(file_path, limit)
    except Exception as e:
        return {"error": f"Failed to fetch commits for file {file_path}: {e}", "file_path": file_path}

    commits = commits_data.get("commits", [])
    result = {
        "file_path": file_path,
        "total_commits": len(commits),
        "commits": commits
    }

    # 2. 若需要获取函数信息，逐个提交查询并过滤
    if include_functions and commits:
        for commit in result["commits"]:
            commit_hash = commit["hash"]
            try:
                func_data = client.get_commit_functions(commit_hash)
                all_functions = func_data.get("functions", [])
                # 只保留属于当前文件的函数
                file_functions = [
                    {
                        "id": f["function_id"],
                        "name": f["name"],
                        "signature": f.get("signature", "")
                    }
                    for f in all_functions
                    if f.get("file_path") == file_path
                ]
                commit["modified_functions"] = file_functions
            except Exception as e:
                commit["modified_functions"] = []
                commit["functions_error"] = str(e)

    # 3. 意图聚类
    if cluster_intents and len(commits) > 1:
        try:
            cluster_result = client.cluster_commits(commits)
            result["intent_clusters"] = cluster_result.get("clusters", [])
        except Exception as e:
            result["intent_clusters"] = []
            result["clustering_error"] = str(e)
    elif cluster_intents:
        result["intent_clusters"] = []
        result["clustering_skipped"] = "Not enough commits to cluster (<=1)"

    return result


def main():
    parser = argparse.ArgumentParser(description="查询文件被哪些提交修改，并进行意图聚类")
    parser.add_argument("--file-path", required=True, help="文件在仓库中的路径")
    parser.add_argument("--limit", type=int, default=20, help="最多返回的提交数量，默认20")
    parser.add_argument("--cluster-intents", action="store_true", default=True, help="是否对提交意图进行聚类")
    parser.add_argument("--no-cluster-intents", dest="cluster_intents", action="store_false", help="禁用聚类")
    parser.add_argument("--include-functions", action="store_true", default=True, help="是否包含修改的函数信息")
    parser.add_argument("--no-include-functions", dest="include_functions", action="store_false", help="不包含函数信息")
    args = parser.parse_args()

    try:
        output = run(
            file_path=args.file_path,
            limit=args.limit,
            cluster_intents=args.cluster_intents,
            include_functions=args.include_functions
        )
        print(json.dumps(output, indent=2, ensure_ascii=False))
        sys.exit(0)
    except Exception as e:
        error_output = {"error": str(e), "file_path": args.file_path}
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```


# 参考资料

* any list
{:toc}