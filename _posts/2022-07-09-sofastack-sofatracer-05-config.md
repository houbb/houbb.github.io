---
layout: post
title: SOFATracer 介绍-05-config 配置项
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, tracer, sh]
published: true
---

# SOFATracer 配置项

应用在引入 SOFATracer 后，可以在 Spring Boot 的配置文件 application.properties 中添加相关配置项来定制 SOFATracer 的相关行为。

SOFATracer 的日志输出目录，可以在 application.properties 中配置 logging.path 的路径，那么其日志输出路径为 ${logging.path}/tracelog；如果没有配置 logging.path，那么 SOFATracer 的默认输出路径为 ${user.home}/logs/tracelog。

# 非SpringBoot 工程配置

在非 SpringBoot 工程中，可以通过在 classpath 下新建一个 sofa.tracer.properties 配置文件，配置项如下：

| SOFATracer 配置项	| 说明	|  默认值  |
|:---|:---|:---|
| disable_middleware_digest_log |	是否关闭中间件组件摘要日志打印 |		false   |
| disable_digest_log	| 关闭摘要日志打印。	|	false   |
| tracer_global_rolling_policy	| SOFATracer 日志的滚动策略	.yyyy-MM-dd：按照天滚动；.yyyy-MM-dd_HH：按照小时滚动。|	默认不配置按照天滚动 |
| tracer_global_log_reserve_day	| SOFATracer 日志的保留天数	|	默认保留 7 天   |
| stat_log_interval	| 统计日志的时间间隔，单位：秒|	默认 60 秒统计日志输出一次  |
| tracer_penetrate_attribute_max_length	| 透传数据能够允许存放的最大长度|	默认值 1024 |
| tracer_async_appender_allow_discard	| 是否允许丢失日志 |	false   |
| tracer_async_appender_is_out_discard_number | 	丢失日志数	|0   |
| spring.application.name	| 应用名| 	``  |
| tracer_sampler_strategy_name_key| 	采样策略名| 	``  |
| tracer_sampler_strategy_custom_rule_class_name	| 采样规则 spi 实现的类的全限定名	| ``  |
| tracer_sampler_strategy_percentage_key| 	采样比率	|     |
| com.alipay.sofa.tracer.jsonOutput	| 是否以json格式输出日志 | 	true，如果期望较少日志空间占用，可以使用非 json 格式输出（日志顺序与JSON 格式顺序一致） |


# 参考资料

https://www.sofastack.tech/projects/sofa-tracer/configuration/

* any list
{:toc}