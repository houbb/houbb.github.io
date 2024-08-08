---
layout: post
title: alibaba druid-05-配置最佳实践
date: 2024-03-27 21:01:55 +0800
categories: [Database]
tags: [database, jdbc, sh]
published: true
---

# 配置信息

## maven 引入

```xml
<dependency>
   <groupId>com.alibaba</groupId>
   <artifactId>druid-spring-boot-starter</artifactId>
   <version>${alibaba-druid.version}</version>
</dependency>
```

# 配置属性

## 推荐配置

```xml
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource"
        init-method="init" destroy-method="close">
        <!-- 基本属性 url、user、password -->
        <property name="url" value="${jdbc_url}" />
        <property name="username" value="${jdbc_user}" />
        <property name="password" value="${jdbc_password}" />

        <!-- 配置初始化大小、最小、最大 -->
        <property name="initialSize" value="5" />
        <property name="minIdle" value="5" />
        <property name="maxActive" value="10" />
        <!-- 配置从连接池获取连接等待超时的时间 -->
        <property name="maxWait" value="10000" />

        <!-- 配置间隔多久启动一次DestroyThread，对连接池内的连接才进行一次检测，单位是毫秒。
            检测时:1.如果连接空闲并且超过minIdle以外的连接，如果空闲时间超过minEvictableIdleTimeMillis设置的值则直接物理关闭。2.在minIdle以内的不处理。
        -->
        <property name="timeBetweenEvictionRunsMillis" value="600000" />
        <!-- 配置一个连接在池中最大空闲时间，单位是毫秒 -->
        <property name="minEvictableIdleTimeMillis" value="300000" />
        <!-- 设置从连接池获取连接时是否检查连接有效性，true时，每次都检查;false时，不检查 -->
        <property name="testOnBorrow" value="false" />
        <!-- 设置往连接池归还连接时是否检查连接有效性，true时，每次都检查;false时，不检查 -->
        <property name="testOnReturn" value="false" />
        <!-- 设置从连接池获取连接时是否检查连接有效性，true时，如果连接空闲时间超过minEvictableIdleTimeMillis进行检查，否则不检查;false时，不检查 -->
        <property name="testWhileIdle" value="true" />
        <!-- 检验连接是否有效的查询语句。如果数据库Driver支持ping()方法，则优先使用ping()方法进行检查，否则使用validationQuery查询进行检查。(Oracle jdbc Driver目前不支持ping方法) -->
        <property name="validationQuery" value="select 1 from dual" />
        <!-- 单位：秒，检测连接是否有效的超时时间。底层调用jdbc Statement对象的void setQueryTimeout(int seconds)方法 -->
        <!-- <property name="validationQueryTimeout" value="1" />  -->

        <!-- 打开后，增强timeBetweenEvictionRunsMillis的周期性连接检查，minIdle内的空闲连接，每次检查强制验证连接有效性. 参考：https://github.com/alibaba/druid/wiki/KeepAlive_cn -->
        <property name="keepAlive" value="true" />  

        <!-- 连接泄露检查，打开removeAbandoned功能 , 连接从连接池借出后，长时间不归还，将触发强制回连接。回收周期随timeBetweenEvictionRunsMillis进行，如果连接为从连接池借出状态，并且未执行任何sql，并且从借出时间起已超过removeAbandonedTimeout时间，则强制归还连接到连接池中。 -->
        <property name="removeAbandoned" value="true" /> 
        <!-- 超时时间，秒 -->
        <property name="removeAbandonedTimeout" value="80"/>
        <!-- 关闭abanded连接时输出错误日志，这样出现连接泄露时可以通过错误日志定位忘记关闭连接的位置 -->
        <property name="logAbandoned" value="true" />

        <!-- 根据自身业务及事务大小来设置 -->
        <property name="connectionProperties"
            value="oracle.net.CONNECT_TIMEOUT=2000;oracle.jdbc.ReadTimeout=10000"></property>

        <!-- 打开PSCache，并且指定每个连接上PSCache的大小，Oracle等支持游标的数据库，打开此开关，会以数量级提升性能，具体查阅PSCache相关资料 -->
        <property name="poolPreparedStatements" value="true" />
        <property name="maxPoolPreparedStatementPerConnectionSize"
            value="20" />   

        <!-- 配置监控统计拦截的filters -->
        <!-- <property name="filters" value="stat,slf4j" /> -->

        <property name="proxyFilters">
            <list>
                <ref bean="log-filter" />
                <ref bean="stat-filter" />
            </list>
        </property>
        <!-- 配置监控统计日志的输出间隔，单位毫秒，每次输出所有统计数据会重置，酌情开启 -->
        <property name="timeBetweenLogStatsMillis" value="120000" />
    </bean>
```

## 解释


```yaml
spring:
  datasource:
    url: jdbc:h2:mem:recommend
    username: sa
    password:
    ##
    # 设置数据源类型为 DruidDataSource
    ##
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      ##
      # 配置初始化大小、最小、最大连接池数量
      # - min-idle：池中维护的最小空闲连接数，默认为 0 个
      # - max-active：池中最大连接数，包括闲置和使用中的连接，默认为 8 个；推荐配置：20，多数场景下 20 已完全够用，当然这个参数跟使用场景相关性很大，一般配置成正常连接数的 3~5 倍。
      ##
      initial-size: 5
      min-idle: 10
      max-active: 20
      ##
      # 参数表示是否对空闲连接保活，布尔类型。
      #
      # 那么需要保活连接，是不是将 keepAlive 配置成 true 就完事了呢？
      # 虽然 true 的确是开启了保活机制，但是应该保活多少个，心跳检查的规则是什么，这些都需要正确配置，否则还是可能事与愿违。
      # 这里需要了解几个相关的参数：minIdle 最小连接池数量，连接保活的数量，空闲连接超时踢除过程会保留的连接数（前提是当前连接数大于等于 minIdle），其实 keepAlive 也仅维护已存在的连接，而不会去新建连接，即使连接数小于 minIdle；
      # minEvictableIdleTimeMillis 单位毫秒，连接保持空闲而不被驱逐的最小时间，保活心跳只对存活时间超过这个值的连接进行；
      # maxEvictableIdleTimeMillis 单位毫秒，连接保持空闲的最长时间，如果连接执行过任何操作后计时器就会被重置（包括心跳保活动作）；
      # timeBetweenEvictionRunsMillis 单位毫秒，Destroy 线程检测连接的间隔时间，会在检测过程中触发心跳。保活检查的详细流程可参见源码 com.alibaba.druid.pool.DruidDataSource.DestroyTask，其中心跳检查会根据配置使用 ping 或 validationQuery 配置的检查语句。
      #
      # 推荐配置：如果网络状况不佳，程序启动慢或者经常出现突发流量，则推荐配置为 true；
      ##
      keep-alive: true
      # 配置一个连接在池中最小生存的时间，单位是毫秒
      min-evictable-idle-time-millis: 600000
      max-evictable-idle-time-millis: 900000
      # 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
      time-between-eviction-runs-millis: 2000
      ##
      # 配置获取连接等待超时的时间
      #
      # 推荐配置:
      # - 内网（网络状况好）800；
      # - 网络状况不是特别好的情况下推荐大于等于 1200，因为 tcp 建连重试一般是 1 秒；
      ##
      max-wait: 800
      ##
      # 可以配置 connectTimeout 和 socketTimeout，它们的单位都是毫秒，这两个参数在应对网络异常方面非常重要。
      # - connectTimeout 配置建立 TCP 连接的超时时间；
      # - socketTimeout 配置发送请求后等待响应的超时时间；
      # 这两个参数也可以通过在 jdbc url 中添加 connectTimeout=xxx&socketTimeout=xxx 的方式配置，试过在 connectinoProperties 中和 jdbc url两个地方都配置，发现优先使用 connectionProperties 中的配置。
      # 如果不设置这两项超时时间，服务会有非常高的风险。现实案例是在网络异常后发现应用无法连接到 DB，但是重启后却能正常的访问 DB。因为在网络异常下 socket 没有办法检测到网络错误，这时连接其实已经变为“死连接”，如果没有设置 socket 网络超时，连接就会一直等待 DB 返回结果，造成新的请求都无法获取到连接。
      #
      # 推荐配置：socketTimeout=3000;connectTimeout=1200
      ##
      connect-properties: socketTimeout=3000;connectTimeout=1200
      ##
      # 用于检测连接是否有效的 SQL 语句
      ##
      validation-query: select 1
      ##
      # 申请连接的时候检测，如果空闲时间大于 timeBetweenEvictionRunsMillis，执行 validationQuery 检测连接是否有效
      ##
      test-while-idle: true
      ##
      # 申请连接时执行 validationQuery 检测连接是否有效，做了这个配置会降低性能
      ##
      test-on-borrow: false
      ##
      # 归还连接时执行 validationQuery 检测连接是否有效，做了这个配置会降低性能
      ##
      test-on-return: false
      ##
      # 通过限制达到一定使用次数后断开重连，使得多个服务器间负载更均衡
      ##
      phy-max-use-count: 1000
```

# chat

## mysql 最佳配置

以下是 Alibaba Druid 连接 MySQL 数据库的最佳实践配置，以 YAML 格式呈现，并附带每个配置属性的解释和原因：

```yaml
druid:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mydatabase?useSSL=false&serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8
    username: myuser
    password: mypassword

    # 初始化时连接池的大小
    initial-size: 5
    # 连接池的最小空闲连接数
    min-idle: 5
    # 连接池的最大活跃连接数
    max-active: 20
    # 获取连接时最大等待时间
    max-wait: 60000

    # 用于检测空闲连接的 SQL 查询语句
    validation-query: SELECT 1
    # 是否在获取连接时验证连接
    test-on-borrow: true
    # 是否在归还连接时验证连接
    test-on-return: false
    # 是否在连接空闲时验证连接
    test-while-idle: true

    # 配置间隔多久进行一次检测，检测需要关闭的空闲连接，单位是毫秒
    time-between-eviction-runs-millis: 60000
    # 配置连接在池中最小生存的时间，单位是毫秒
    min-evictable-idle-time-millis: 300000
    # 配置连接在池中最大生存的时间，单位是毫秒
    max-evictable-idle-time-millis: 900000

    # 打开PSCache，并且指定每个连接上PSCache的大小
    pool-prepared-statements: true
    max-pool-prepared-statement-per-connection-size: 20

    # 配置监控统计拦截的filters，stat表示统计功能，wall表示防火墙
    filters: stat,wall,log4j
    # 合并多个DruidDataSource的监控数据
    use-global-data-source-stat: true
    # SQL执行时是否打印日志
    log-slow-sql: true
    # SQL执行超过多长时间就认为是慢SQL，单位毫秒
    slow-sql-millis: 2000
    # SQL日志是否需要格式化
    connection-properties: druid.stat.slowSqlMillis=2000;druid.stat.logSlowSql=true
```

### 解释与原因

1. **driver-class-name**: `com.mysql.cj.jdbc.Driver`  
   - 使用 MySQL 官方驱动，推荐使用 `com.mysql.cj.jdbc.Driver`，这是 MySQL Connector/J 8.0 版本之后的标准驱动类。

2. **url**: `jdbc:mysql://localhost:3306/mydatabase?useSSL=false&serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8`  
   - `useSSL=false`：禁用 SSL 连接，除非有特别的安全需求。  
   - `serverTimezone=UTC`：确保时区正确设置，避免由于时区问题引起的时间转换错误。  
   - `useUnicode=true` 和 `characterEncoding=UTF-8`：确保支持 UTF-8 字符集，避免字符集转换问题。

3. **initial-size**: `5`  
   - 初始化时创建 5 个连接，这样在应用启动时可以更快响应请求。

4. **min-idle**: `5`  
   - 保持 5 个最小空闲连接，确保在连接池空闲时仍有足够的连接来响应请求。

5. **max-active**: `20`  
   - 最大活动连接数设置为 20，这个数值可以根据应用的负载情况调整，以平衡性能与资源消耗。

6. **max-wait**: `60000`  
   - 获取连接的最大等待时间为 60 秒，如果超过这个时间仍无法获取连接，则抛出异常，避免无限制等待。

7. **validation-query**: `SELECT 1`  
   - 用于检测数据库连接是否有效。`SELECT 1` 是一个非常轻量级的查询。

8. **test-on-borrow**: `true`  
   - 在每次从连接池获取连接时验证连接的有效性，保证返回的连接是可用的。

9. **test-on-return**: `false`  
   - 归还连接时不进行验证，可以减少不必要的性能开销。

10. **test-while-idle**: `true`  
    - 在连接空闲时进行验证，避免长时间空闲连接失效。

11. **time-between-eviction-runs-millis**: `60000`  
    - 每 60 秒检查一次连接池中的空闲连接，并进行空闲连接的清理工作。

12. **min-evictable-idle-time-millis**: `300000`  
    - 连接在池中最小生存时间为 5 分钟，如果超过这个时间且连接空闲，则可以被清除。

13. **max-evictable-idle-time-millis**: `900000`  
    - 连接在池中最大生存时间为 15 分钟，超过这个时间无论是否空闲都可以被清除。

14. **pool-prepared-statements**: `true`  
    - 启用 PSCache（PreparedStatement Cache），提高预编译 SQL 的执行效率。

15. **max-pool-prepared-statement-per-connection-size**: `20`  
    - 每个连接最多缓存 20 个 PreparedStatement，合理的缓存大小可以减少重复解析和编译 SQL 的开销。

16. **filters**: `stat,wall,log4j`  
    - 启用 Druid 的监控、SQL 防火墙和日志功能，`stat` 用于统计监控，`wall` 用于防止 SQL 注入，`log4j` 用于记录 SQL 日志。

17. **use-global-data-source-stat**: `true`  
    - 启用全局数据源的统计信息合并，方便统一管理和监控。

18. **log-slow-sql**: `true`  
    - 启用慢 SQL 日志记录，便于发现和优化执行较慢的 SQL 语句。

19. **slow-sql-millis**: `2000`  
    - 将 SQL 执行时间超过 2 秒定义为慢 SQL，适当调整这个值可以更好地捕捉性能瓶颈。

20. **connection-properties**: `druid.stat.slowSqlMillis=2000;druid.stat.logSlowSql=true`  
    - 额外的连接属性，用于配置 Druid 的慢 SQL 日志输出，进一步增强监控能力。

此配置主要是为了在性能和稳定性之间取得平衡，同时提供足够的监控和日志功能，便于后续维护和优化。


# 参考资料

https://www.cnblogs.com/yeahwell/p/9252931.html

https://www.cnblogs.com/wuyun-blog/p/5679073.html

https://y0ngb1n.github.io/a/best-practice-samples-datasource-alibaba-druid.html


* any list
{:toc}
