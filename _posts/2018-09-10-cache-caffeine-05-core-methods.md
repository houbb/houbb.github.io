---
layout: post
title: Caffeine-05-Caffeine cache 核心方法
date:  2018-09-10 07:44:19 +0800
categories: [Cache]
tags: [cache, middleware, in-memory cache, sh]
published: true
---

# chat

Caffeine Cache 作为高性能 Java 本地缓存库，提供了四类核心缓存实例，每种类型对应不同的加载策略和方法。

以下是其核心方法分类说明：

---

### ⚙️ 1. 手动加载缓存（`Cache`）
通过 `Caffeine.newBuilder().build()` 创建，需显式管理缓存条目。
- `getIfPresent(K key)`：若缓存存在 key，返回值；否则返回 `null`。
- `get(K key, Function<? super K, V> loader)`：若 key 不存在，通过 `loader` 函数计算值并缓存，原子操作避免竞争。
- `put(K key, V value)`：添加或覆盖键值对。
- `invalidate(K key)`：移除指定 key 的缓存项。
- `invalidateAll()`：清空所有缓存。
- `asMap()`：返回 `ConcurrentMap` 视图，支持标准 Map 操作（如 `putIfAbsent()`）。

---

### 🔄 2. 同步加载缓存（`LoadingCache`）
通过 `build(CacheLoader)` 创建，自动加载缺失值。
- `get(K key)`：若 key 不存在，调用 `CacheLoader.load()` 加载值（如从数据库）并缓存。
- `getAll(Iterable<? extends K> keys)`：批量获取值，缺失时调用 `loadAll()`（未实现则遍历 `load()`）。
- `refresh(K key)`：异步刷新值（不阻塞当前请求，旧值仍可用）。

---

### ⏳ 3. 异步缓存（`AsyncCache`）
通过 `buildAsync()` 创建，返回 `CompletableFuture` 支持非阻塞操作。
- `getIfPresent(K key)`：返回 `CompletableFuture<V>`，若 key 不存在返回 `null`。
- `get(K key, Function<? super K, V> loader)`：异步执行 `loader` 函数计算值并缓存。
- `put(K key, CompletableFuture<V> value)`：缓存 `Future` 类型值。
- `synchronous()`：转为同步 `Cache` 视图。

---

### ⚡️ 4. 异步加载缓存（`AsyncLoadingCache`）
通过 `buildAsync(CacheLoader)` 创建，结合自动加载与异步特性。
- `get(K key)`：返回 `CompletableFuture<V>`，自动异步调用 `CacheLoader.load()`。
- `getAll(Iterable<? extends K> keys)`：批量返回 `CompletableFuture<Map>`。
- `synchronous()`：转为同步 `LoadingCache` 视图。

---

### 📊 公共方法与工具
- `estimatedSize()`：返回缓存条目数的估计值（非精确）。
- `stats()`：返回 `CacheStats` 对象，含命中率、加载次数等统计信息。
- `policy()`：提供策略查询（如淘汰策略 `eviction()`）。

---

### 💎 核心方法总结表
| 缓存类型          | 核心方法                            | 功能描述                                                                 |
|------------------------|----------------------------------------|-----------------------------------------------------------------------------|
| `Cache`            | `getIfPresent(key)`                    | 直接查询缓存，不存在返回 `null`                                             |
|                        | `get(key, loader)`                     | 不存在时通过函数计算并原子写入                                              |
|                        | `put(key, value)`                      | 显式添加或覆盖缓存                                                          |
| `LoadingCache`     | `get(key)`                             | 自动同步加载缺失值（阻塞直到加载完成）                                      |
|                        | `getAll(keys)`                         | 批量加载缺失值                                                              |
| `AsyncCache`       | `get(key, loader)`                     | 异步执行函数计算值（非阻塞）                                                |
|                        | `getIfPresent(key)`                    | 返回 `Future`，缓存不存在时为 `null`                                        |
| `AsyncLoadingCache`| `get(key)`                             | 自动异步加载缺失值（返回 `Future`）                                         |

---

### 💡 使用建议
- 突发流量场景：优先选用 `AsyncCache` 或 `AsyncLoadingCache`，避免线程阻塞。
- 数据库集成：`LoadingCache` 的 `get()` 适合封装数据库查询逻辑。
- 批量操作：`getAll()` 可减少加载次数，需实现 `CacheLoader.loadAll()` 优化。

> 完整方法列表详见 [Caffeine GitHub Wiki](https://github.com/ben-manes/caffeine/wiki) 或 Spring Boot 集成示例。


# 参考资料

https://arxiv.org/pdf/1512.00727.pdf

* any list
{:toc}