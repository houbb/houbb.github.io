---
layout: post
title: 文本差异对比与增量存储的一点思考
date: 2025-10-31 20:40:12 +0800
categories: [Tool]
tags: [tool, compare]
published: true
---


# 背景

这几天一直在对比 json、text，对的眼花缭乱。

于是就想着写两个页面小工具。

> [json 对比](https://houbb.github.io/tools/tools/json-differ-compare.html)

> [纯文本的行、词、char 对比](https://houbb.github.io/tools/tools/text-differ-compare.html)

# 一点延伸

又想到，如果我想存储文章的每一个版本。

其实每次都是全量并不是好的方法，因为有时候可能改动不多。

那么，有没有类似于 base+differ 的方式，来存储每个版本的信息呢？

# 思路

通过 differ 工具，直接存储对应的信息。

# chat

## java 的对比实现

触及了**版本控制系统（如 Git）核心原理**的那一层：

> “只存储差异（增量），再通过差异恢复完整版本”。

答案是 ✅ **完全可以做到**。

下面我给你一个系统化拆解，让你明白怎么在你自己的系统里实现文本的“多版本差异存储 + 还原”。

---

## 🧩 一、核心思想

我们可以把文本多版本控制抽象为：

```
Version 1 (Full text)
+ Diff(1→2)
+ Diff(2→3)
...
=>
Reconstruct Version N
```

即：

* 初始版本：存完整内容（baseline）
* 后续版本：存增量（diff patch）
* 读取版本：依次 apply 这些 diff，恢复出目标文本。

---

## ⚙️ 二、用 diff-match-patch 实现增量存储

以 `google-diff-match-patch` 为例（JS/Java 都有实现）。

### 1️⃣ 保存

当有新版本文本：

```java
diff_match_patch dmp = new diff_match_patch();
LinkedList<Diff> diffs = dmp.diff_main(oldText, newText);
dmp.diff_cleanupSemantic(diffs);

// 生成可逆补丁
LinkedList<Patch> patches = dmp.patch_make(oldText, diffs);

// 序列化存储
String patchText = dmp.patch_toText(patches);
saveToDB(patchText);
```

### 2️⃣ 还原

当需要恢复新版本：

```java
diff_match_patch dmp = new diff_match_patch();
LinkedList<Patch> patches = (LinkedList<Patch>) dmp.patch_fromText(patchText);
Object[] result = dmp.patch_apply(patches, oldText);

String restored = (String) result[0];
```

💡 `patch_apply` 会返回 `[新文本, 应用成功数组]`
这样你可以从任意历史版本一步步 apply 上去。

---

## 🧱 三、数据结构设计示例

| 字段             | 含义          |
| -------------- | ----------- |
| `id`           | 版本号         |
| `base_id`      | 基础版本号       |
| `diff_patch`   | 差异内容（text）  |
| `full_text`    | （可选，仅基准版本存） |
| `created_time` | 时间戳         |
| `author`       | 修改者         |

💡 存储策略可以是：

* 第一个版本：存全文（baseline）
* 后续版本：只存 `diff_patch`
* 每隔 N 个版本（比如 10 个），再存一个 **checkpoint（快照）**，以避免恢复时要 apply 太多 patch。

---

## 📦 四、恢复逻辑

示意代码：

```java
String reconstruct(String baseText, List<String> patchList) {
    diff_match_patch dmp = new diff_match_patch();
    String current = baseText;
    for (String patchText : patchList) {
        LinkedList<Patch> patches = (LinkedList<Patch>) dmp.patch_fromText(patchText);
        Object[] res = dmp.patch_apply(patches, current);
        current = (String) res[0];
    }
    return current;
}
```

---

## 🚀 五、性能优化与实践经验

| 优化点       | 说明                                                                |
| --------- | ----------------------------------------------------------------- |
| **快照间隔**  | 每隔 N 个版本保存一个完整副本，避免 apply 太多 patch。                               |
| **压缩存储**  | patchText 通常可用 gzip 压缩，节省 70%~90% 空间。                             |
| **多线程还原** | 如果要还原多个版本，可并行从最近的快照开始。                                            |
| **差异粒度**  | 对于长文本（如 Markdown），建议按 “行” diff，而不是 “字符” diff。                     |
| **一致性校验** | 存储前对比 `hash(oldText)` 与 `hash(apply(oldText, diff))`，防止 patch 失效。 |

---

## 🧠 六、Git / 文本版本系统是怎么做的

| 系统                   | 差异方式                                  | 还原方式        | 特点        |
| -------------------- | ------------------------------------- | ----------- | --------- |
| Git                  | 行级 diff (delta compression, packfile) | 反向或正向 apply | 超高效、支持压缩链 |
| Google Docs          | operational transform (OT)            | 实时协同 + 合并   | 复杂但支持多人并发 |
| CRDT (Notion, Figma) | state-based merge                     | 冲突自动化合并     | 适合实时编辑    |
| 你要的这种                | patch-based                           | 按版本 apply   | 简单易实现     |

---

## ✅ 总结

| 功能             | 是否支持 |
| -------------- | ---- |
| 存储增量而非全文       | ✅    |
| 还原任意版本         | ✅    |
| 支持压缩、快照优化      | ✅    |
| 可实现类似 Git 文本追溯 | ✅    |

* any list
{:toc}