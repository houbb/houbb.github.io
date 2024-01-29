---
layout: post
title: sensitive-word-admin 敏感词控台 v1.2.0 版本开源
date: 2024-01-29 21:01:55 +0800
categories: [Web]
tags: [web, java, sh]
published: true
---

# 开源目的

丰富 [sensitive-word](https://github.com/houbb/sensitive-word) 的生态。

提供最基本的操作例子，便于在此基础上丰富实现自己的敏感词控台。

避免重复开发的成本，让更多的精力专注于业务。

## 拓展阅读

> [sensitive-word-admin 敏感词控台 v1.2.0 版本开源](https://mp.weixin.qq.com/s/7wSy0PuJLTudEo9gTY5s5w)

> [sensitive-word 基于 DFA 算法实现的高性能敏感词工具介绍](https://mp.weixin.qq.com/s/OKLCWlOTv_PSi9MIfDpoMw)

![view](https://picx.zhimg.com/80/v2-3922ed7f7907a79dc562106a26db0341_720w.jpeg)

# v1.2.0 版本特性

优化对应的组件依赖，[sensitive-word](https://github.com/houbb/sensitive-word) 同步升级到最新版本。

修复已知问题。

模板已包含敏感词基础的操作，后续将持续优化。

# 核心 api

提供了核心的 api，可以让用户自行调用。在这个基础上封装自己的脱敏服务。

## 接口列表

| api | 入参 | 出参 | 说明 |
|:----|:----|:----|:------|
| /api/sensitiveWord/contains | string | boolean | 是否包含敏感词 |
| /api/sensitiveWord/findAll | string | `List<String>` | 获取所有的敏感词 |
| /api/sensitiveWord/findFist | string | string | 获取第一个的敏感词 |
| /api/sensitiveWord/replace | string | string | 获取替换后的结果 |
| /api/sensitiveWord/tags | string | `Set<String>` | 获取敏感词的标签列表 |

# 核心实现

## spring 配置

```java
@Configuration
public class SensitiveWordConfig {

    @Autowired
    private MyDdWordAllow myDdWordAllow;

    @Autowired
    private MyDdWordDeny myDdWordDeny;

    /**
     * 初始化引导类
     * @return 初始化引导类
     * @since 1.0.0
     */
    @Bean
    public SensitiveWordBs sensitiveWordBs() {
        return SensitiveWordBs.newInstance()
                .wordAllow(WordAllows.chains(WordAllows.defaults(), myDdWordAllow))
                .wordDeny(WordDenys.chains(WordDenys.defaults(), myDdWordDeny))
                .ignoreRepeat(false)
                // 各种其他配置
                .init();
    }

}
```

最核心的代码部分，引入初默认配置之外的数据库的 MyDdWordAllow + MyDdWordDeny，通过数据库层面的

## refresh

每次敏感词变更，会触发对应的敏感词 refresh 操作。

所以不用重启，就可以实现敏感词的实时刷新。

后续会做进一步的优化，让敏感词精确到单个词，刷新性能更好。

# 开源地址

> [https://github.com/houbb/sensitive-word-admin](https://github.com/houbb/sensitive-word-admin)

# 后续 ROAD-MAP

- [ ] 登录/登出
- [ ] 页面操作的权限管理
- [ ] 调用方系统 token 注册管理
- [ ] 敏感词的数据大盘
- [ ] 调用信息数据大盘
- [ ] 操作审计日志

# 参考资料

https://github.com/houbb/sensitive-word-admin

* any list
{:toc}