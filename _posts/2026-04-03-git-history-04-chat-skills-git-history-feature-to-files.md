---
layout: post 
title: 代码知识库之 git history-04-skills git-history-feature-to-files
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

分别给出这两个 skills，和后端接口的交互用 python 调用 后端的 http 接口。你重点给出两个 skills 技能 markdown 文档
```

## 名字

明白了，我只给出第一个技能（功能点 → 提交 → 文件/函数）的完整内容。以下是两个文件：

---

### 文件 1：`skills/git-history-feature-to-files/skill.md`

```markdown
---
name: git-history-feature-to-files
description: 根据自然语言功能描述或代码片段，检索 Git 历史中相关的提交，并列出这些提交修改过的文件及函数。
version: 1.0.0
author: system
command: python3 scripts/feature_to_files.py --query "$QUERY" --top_k ${TOP_K:-5} --include-source ${INCLUDE_SOURCE:-false}
input_schema:
  - name: query
    type: string
    required: true
    description: 功能描述或代码片段，例如“登录超时处理”
  - name: top_k
    type: integer
    required: false
    default: 5
    description: 返回的相关提交数量，最大 20
  - name: include_source
    type: boolean
    required: false
    default: false
    description: 是否同时返回函数的源码片段
output:
  type: json
  description: 包含相关提交、聚合的文件和函数列表的 JSON 对象
---

# Git History: Feature → Commits → Files/Functions

## 使用场景

当开发者需要了解某个功能（例如“用户登录”、“数据导出”）在代码库中的历史演变时，使用本技能。它可以回答：
- 这个功能第一次出现是哪个提交？
- 哪些文件/函数与该功能相关？
- 最近谁修改过这个功能相关的代码？

## 核心逻辑

1. 将输入的 `query` 发送给后端语义检索服务，获取最相似的 `top_k` 个提交。
2. 对每个提交，查询它修改过的文件和函数。
3. 聚合结果：同一文件/函数被多次修改时合并展示，并记录修改次数。
4. 若 `include_source` 为 true，额外获取每个函数的当前源码。
5. 输出 JSON 供 LLM 或用户分析。

## 使用示例

**输入**：
```json
{
  "query": "登录超时后自动刷新 token",
  "top_k": 5,
  "include_source": false
}
```

**输出**（节选）：
```json
{
  "query": "登录超时后自动刷新 token",
  "related_commits": [
    {
      "hash": "abc123",
      "summary": "fix: 登录超时后自动刷新 token",
      "score": 0.94,
      "files": [
        {"path": "src/auth/token.py", "functions": [{"id": "func_01", "name": "refresh_token"}]}
      ]
    }
  ],
  "aggregated_files": {
    "src/auth/token.py": {
      "modify_count": 2,
      "functions": ["refresh_token", "validate_token"]
    }
  },
  "aggregated_functions": {
    "func_01": {
      "name": "refresh_token",
      "file_path": "src/auth/token.py",
      "modify_count": 2,
      "source_code": null
    }
  }
}
```

## 注意事项

- 后端服务地址默认为 `http://localhost:8080`，可通过环境变量 `GIT_HISTORY_BACKEND` 覆盖。
- 若后端不可用，脚本会重试 3 次后返回错误信息，不会阻塞调用。
- 为提高稳定性，建议在后端服务中开启缓存（Redis），减少重复查询。

## 依赖

- Python 3.8+
- `httpx`、`tenacity` 库（已在脚本中导入，需提前安装）
```

---

### 文件 2：`skills/git-history-feature-to-files/scripts/feature_to_files.py`

```python
#!/usr/bin/env python3
"""
Git History Skill: Feature → Commits → Files/Functions
调用后端 HTTP 接口，根据功能描述检索相关提交及其修改的文件/函数。
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
    def _post(self, endpoint: str, json_data: Dict) -> Dict:
        resp = self.client.post(f"{self.base_url}{endpoint}", json=json_data)
        resp.raise_for_status()
        return resp.json()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=5))
    def _get(self, endpoint: str) -> Dict:
        resp = self.client.get(f"{self.base_url}{endpoint}")
        resp.raise_for_status()
        return resp.json()

    def semantic_search(self, query: str, top_k: int) -> List[Dict]:
        """返回 [{"commit_hash": str, "score": float, "summary": str}]"""
        result = self._post("/api/v1/semantic_search", {"query": query, "top_k": top_k})
        return result.get("results", [])

    def get_commit_files(self, commit_hash: str) -> Dict:
        """返回 {"files": [{"path": str, "functions": [{"id": str, "name": str}]}]}"""
        return self._get(f"/api/v1/commit/{commit_hash}/files")

    def get_function_source(self, function_id: str) -> Dict:
        """返回 {"source_code": str, "file_path": str, "line_range": [int,int]}"""
        return self._get(f"/api/v1/function/{function_id}/source")


def run(query: str, top_k: int = 5, include_source: bool = False) -> Dict[str, Any]:
    client = BackendClient(BACKEND_URL)

    # 1. 语义检索相关提交
    commits_info = client.semantic_search(query, top_k)

    result = {
        "query": query,
        "related_commits": [],
        "aggregated_files": {},
        "aggregated_functions": {}
    }

    for commit in commits_info:
        commit_hash = commit["commit_hash"]
        try:
            commit_detail = client.get_commit_files(commit_hash)
        except Exception as e:
            # 单个提交失败不影响整体
            result["related_commits"].append({
                "hash": commit_hash,
                "summary": commit.get("summary", ""),
                "score": commit.get("score", 0.0),
                "error": str(e)
            })
            continue

        files = commit_detail.get("files", [])
        commit_entry = {
            "hash": commit_hash,
            "summary": commit.get("summary", ""),
            "score": commit.get("score", 0.0),
            "files": files
        }
        result["related_commits"].append(commit_entry)

        # 聚合文件及函数
        for file in files:
            path = file["path"]
            if path not in result["aggregated_files"]:
                result["aggregated_files"][path] = {"modify_count": 0, "functions": []}
            result["aggregated_files"][path]["modify_count"] += 1

            for func in file.get("functions", []):
                func_id = func["id"]
                func_name = func["name"]
                if func_id not in result["aggregated_functions"]:
                    result["aggregated_functions"][func_id] = {
                        "name": func_name,
                        "file_path": path,
                        "modify_count": 0,
                        "source_code": None
                    }
                result["aggregated_functions"][func_id]["modify_count"] += 1

                if func_name not in result["aggregated_files"][path]["functions"]:
                    result["aggregated_files"][path]["functions"].append(func_name)

    # 2. 可选获取函数源码
    if include_source:
        for func_id in list(result["aggregated_functions"].keys()):
            try:
                source_info = client.get_function_source(func_id)
                result["aggregated_functions"][func_id]["source_code"] = source_info.get("source_code", "")
            except Exception as e:
                result["aggregated_functions"][func_id]["source_code"] = f"// Error: {e}"

    return result


def main():
    parser = argparse.ArgumentParser(description="根据功能描述检索 Git 历史中的提交和文件")
    parser.add_argument("--query", required=True, help="功能描述或代码片段")
    parser.add_argument("--top_k", type=int, default=5, help="返回的相关提交数量，默认5")
    parser.add_argument("--include-source", action="store_true", help="是否包含函数源码")
    args = parser.parse_args()

    try:
        output = run(query=args.query, top_k=args.top_k, include_source=args.include_source)
        print(json.dumps(output, indent=2, ensure_ascii=False))
        sys.exit(0)
    except Exception as e:
        error_output = {"error": str(e), "query": args.query}
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```



# 参考资料

* any list
{:toc}