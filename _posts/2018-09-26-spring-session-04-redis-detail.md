---
layout: post
title: Spring Session-04-深入源码，和你一起重新认识 spring session 
date:  2018-09-26 14:24:33 +0800
categories: [Spring]
tags: [web, spring, session, redis, sh]
published: true
---

# 序言

大家好，我是老马。

前面我们共同学习了 spring session 的入门使用：

[web 会话机制之 session cookie 详解](https://www.toutiao.com/item/6914651999556583948/)

[springboot整合redis实现分布式session](https://www.toutiao.com/i6905646805476753927/)

[spring session 结合拦截器实战](https://www.toutiao.com/item/6914623299200745992/)

大家对使用 spring session 一定不在话下。

但是每次夜深人静时，你是否会思考 spring session 背后的实现原理？

我们只是使用了一个注解，背后的一切又是怎样运转的呢？

接下来，就让我们从源码入手，重新认识一下 spring session。

# 使用 @EnableRedisHttpSession

在 Web 环境中，创建新 RedisIndexedSessionRepository 的最简单方法是使用 `@EnableRedisHttpSession`。 

这个注解看起来非常简单，实际上却默默地为我们做了很多事情：

（1）将 session 的信息持久化到 redis

（2）使用 spring 自己实现的 HTTP session 实现，替代原生的实现，对于开发者完全透明。

（3）针对 session 的过期的处理

（4）针对 session 续签的处理

（5）时间通知机制，确保资源的正确关闭和释放

## 注解定义

注解定义如下：

```java
@Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@Target({ java.lang.annotation.ElementType.TYPE })
@Documented
@Import(RedisHttpSessionConfiguration.class)
@Configuration
public @interface EnableRedisHttpSession {

    // 默认是 30min
	int maxInactiveIntervalInSeconds() default 1800;

    // 命名空间默认为空
	String redisNamespace() default "";

    // 只有当前 SessionRepository#save() 调用时，才刷新 redis
	RedisFlushMode redisFlushMode() default RedisFlushMode.ON_SAVE;
}
```

您可以使用以下属性来自定义配置：

maxInactiveIntervalInSeconds：会话过期前的时间，以秒为单位。

redisNamespace：允许为会话配置应用程序特定的名称空间。 Redis键和通道ID以 `<redisNamespace>` 前缀开头。

flushMode：允许指定何时将数据写入Redis。 默认设置仅在SessionRepository上调用save时。 FlushMode.IMMEDIATE的值会尽快写入Redis。

# RedisHttpSessionConfiguration.java

还有一个核心的配置，就是 `@Import(RedisHttpSessionConfiguration.class)`。

## 核心目的

完成核心目标（1）将 session 的信息持久化到 redis。

## 类定义

```java
@Configuration
@EnableScheduling
public class RedisHttpSessionConfiguration extends SpringHttpSessionConfiguration
		implements EmbeddedValueResolverAware, ImportAware {}
```

实现了两个接口，并且继承自 SpringHttpSessionConfiguration

## RedisTemplate 初始化

我们使用 spring session 的 redis 实现时，信息会被写入 redis。

所以肯定需要 redis 相关的操作 bean 定义。`RedisTemplate` 的 bean 定义如下：

```java
@Bean
public RedisTemplate<Object, Object> sessionRedisTemplate(
		RedisConnectionFactory connectionFactory) {
	RedisTemplate<Object, Object> template = new RedisTemplate<Object, Object>();
	template.setKeySerializer(new StringRedisSerializer());
	template.setHashKeySerializer(new StringRedisSerializer());
	if (this.defaultRedisSerializer != null) {
		template.setDefaultSerializer(this.defaultRedisSerializer);
	}
	template.setConnectionFactory(connectionFactory);
	return template;
}
```

这里的 RedisConnectionFactory 是怎么来的呢？

实际上是通过 spring-data-redis 自动配置得到的，因为我们只是在 springboot 应用中的 application.properties 中配置了 redis 的连接信息。

### RedisConnectionFactory

这个初始化在 RedisAutoConfiguration 类中：

```java
@Bean
@ConditionalOnMissingBean(RedisConnectionFactory.class)
public JedisConnectionFactory redisConnectionFactory()
		throws UnknownHostException {
	return applyProperties(createJedisConnectionFactory());
}
```

当没有定义 RedisConnectionFactory 类时，会根据配置文件初始化对应的 JedisConnectionFactory。

## RedisOperationsSessionRepository 定义

```java
@Bean
public RedisOperationsSessionRepository sessionRepository(
		@Qualifier("sessionRedisTemplate") RedisOperations<Object, Object> sessionRedisTemplate,
		ApplicationEventPublisher applicationEventPublisher) {
	RedisOperationsSessionRepository sessionRepository = new RedisOperationsSessionRepository(
			sessionRedisTemplate);
	sessionRepository.setApplicationEventPublisher(applicationEventPublisher);
	sessionRepository
			.setDefaultMaxInactiveInterval(this.maxInactiveIntervalInSeconds);
	if (this.defaultRedisSerializer != null) {
		sessionRepository.setDefaultSerializer(this.defaultRedisSerializer);
	}
	String redisNamespace = getRedisNamespace();
	if (StringUtils.hasText(redisNamespace)) {
		sessionRepository.setRedisKeyNamespace(redisNamespace);
	}
	sessionRepository.setRedisFlushMode(this.redisFlushMode);
	return sessionRepository;
}
```

这里根据配置初始化了对应的 RedisOperationsSessionRepository。

# SessionRepositoryFilter 拦截器

`@EnableRedisHttpSession` 做的最核心的一件事情实际上是重新实现了 HttpServletRequest 和 HttpServletResponse。

让我们完全可以像以前使用单机的 session 一样，来操作 spring session。

而想要实现这个，就需要看一下 SessionRepositoryFilter 拦截器实现。

完成核心目标（2）：**使用 spring 自己实现的 Http 实现，替代原生的实现**。对于开发者完全透明。

## SpringHttpSessionConfiguration

RedisHttpSessionConfiguration 继承自 SpringHttpSessionConfiguration，其中定义了 `SessionRepositoryFilter` 对象。

```java
@Bean
public <S extends ExpiringSession> SessionRepositoryFilter<? extends ExpiringSession> springSessionRepositoryFilter(
		SessionRepository<S> sessionRepository) {
	SessionRepositoryFilter<S> sessionRepositoryFilter = new SessionRepositoryFilter<S>(
			sessionRepository);
	sessionRepositoryFilter.setServletContext(this.servletContext);
	if (this.httpSessionStrategy instanceof MultiHttpSessionStrategy) {
		sessionRepositoryFilter.setHttpSessionStrategy(
				(MultiHttpSessionStrategy) this.httpSessionStrategy);
	}
	else {
		sessionRepositoryFilter.setHttpSessionStrategy(this.httpSessionStrategy);
	}
	return sessionRepositoryFilter;
}
```

这里根据 session 的类型，分别设置了 2 种不同的 httpSessionStrategy 策略。

## SessionRepositoryFilter 实现

其中 SessionRepositoryFilter 的实现如下：

```java
@Order(SessionRepositoryFilter.DEFAULT_ORDER)
public class SessionRepositoryFilter<S extends ExpiringSession>
		extends OncePerRequestFilter {}
```

这是 Filter 继承自 `OncePerRequestFilter`，保证每一个请求只执行一次。

### 构造器

这里就是上面可以指定 sessionRepository，初始化对应的 sessionRepository。

```java
public SessionRepositoryFilter(SessionRepository<S> sessionRepository) {
	if (sessionRepository == null) {
		throw new IllegalArgumentException("sessionRepository cannot be null");
	}
	this.sessionRepository = sessionRepository;
}
```

### 核心方法

这个类最核心的方法如下：

```java
@Override
protected void doFilterInternal(HttpServletRequest request,
		HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
    // 设置 request 中的属性        
	request.setAttribute(SESSION_REPOSITORY_ATTR, this.sessionRepository);

    // 构建 request/response 以及对应的策略
	SessionRepositoryRequestWrapper wrappedRequest = new SessionRepositoryRequestWrapper(
			request, response, this.servletContext);
	SessionRepositoryResponseWrapper wrappedResponse = new SessionRepositoryResponseWrapper(
			wrappedRequest, response);
	HttpServletRequest strategyRequest = this.httpSessionStrategy
			.wrapRequest(wrappedRequest, wrappedResponse);
	HttpServletResponse strategyResponse = this.httpSessionStrategy
			.wrapResponse(wrappedRequest, wrappedResponse);

	try {
        // 执行拦截器过滤
		filterChain.doFilter(strategyRequest, strategyResponse);
	}
	finally {
        // 提交 session
		wrappedRequest.commitSession();
	}
}
```

可以看的出来，这里的 request/response 实际上已经被 spring session 偷梁换柱了。

我们来看一下这两个是实现类。

## SessionRepositoryRequestWrapper

### 类定义

这个类继承自 HttpServletRequestWrapper 类，实现了 HttpServletRequest 接口。

```java
private final class SessionRepositoryRequestWrapper
			extends HttpServletRequestWrapper {
	private Boolean requestedSessionIdValid;
	private boolean requestedSessionInvalidated;
	private final HttpServletResponse response;
	private final ServletContext servletContext;

    private SessionRepositoryRequestWrapper(HttpServletRequest request,
			HttpServletResponse response, ServletContext servletContext) {
		super(request);
		this.response = response;
		this.servletContext = servletContext;
	}
}
```

### 核心方法

#### getSession(boolean)

```java
@Override
public HttpSessionWrapper getSession(boolean create) {
    // 获取当前 session，如果已经存在，则直接返回。
	HttpSessionWrapper currentSession = getCurrentSession();
	if (currentSession != null) {
		return currentSession;
	}

    // 获取当前的 sessionId
	String requestedSessionId = getRequestedSessionId();
	if (requestedSessionId != null
			&& getAttribute(INVALID_SESSION_ID_ATTR) == null) {
		S session = getSession(requestedSessionId);
		if (session != null) {
			this.requestedSessionIdValid = true;
			currentSession = new HttpSessionWrapper(session, getServletContext());
			currentSession.setNew(false);
			setCurrentSession(currentSession);
			return currentSession;
		}
		else {
			// This is an invalid session id. No need to ask again if
			// request.getSession is invoked for the duration of this request
			setAttribute(INVALID_SESSION_ID_ATTR, "true");
		}
	}

    // 如果不需要新建，直接返回 null
	if (!create) {
		return null;
	}

    // 创建 session
	S session = SessionRepositoryFilter.this.sessionRepository.createSession();
    // 更新最后的访问时间
	session.setLastAccessedTime(System.currentTimeMillis());
    // 创建 session，并且设置到当前的 session 中
	currentSession = new HttpSessionWrapper(session, getServletContext());
	setCurrentSession(currentSession);
	return currentSession;
}
```

#### getSession(requestedSessionId) 获取 session

对于传统的 HTTP Session，是根据 JSESSIONID 直接获取对应的 session。

这里是根据 requestedSessionId 获取的，实现如下：

```java
private S getSession(String sessionId) {
	S session = SessionRepositoryFilter.this.sessionRepository
			.getSession(sessionId);
	if (session == null) {
		return null;
	}
	session.setLastAccessedTime(System.currentTimeMillis());
	return session;
}
```

sessionRepository 如果是基于 redis 的话，就是从 redis 去获取对应的 session 信息。

### commitSession 对于 session 信息的持久化

对于 session 信息的持久化。

```java
private void commitSession() {
    // 获取当前的 session
	HttpSessionWrapper wrappedSession = getCurrentSession();
	if (wrappedSession == null) {

        // session 已经失效
		if (isInvalidateClientSession()) {
			SessionRepositoryFilter.this.httpSessionStrategy
					.onInvalidateSession(this, this.response);
		}
	}
	else {
		S session = wrappedSession.getSession();
        
        // 通过 session 进行持久化
		SessionRepositoryFilter.this.sessionRepository.save(session);

		if (!isRequestedSessionIdValid()
				|| !session.getId().equals(getRequestedSessionId())) {
			SessionRepositoryFilter.this.httpSessionStrategy.onNewSession(session,
					this, this.response);
		}
	}
}
```

Redis sessionRepository 对应的保存方法：

```java
public void save(RedisSession session) {
	session.saveDelta();
	if (session.isNew()) {
		String sessionCreatedKey = getSessionCreatedChannel(session.getId());
		this.sessionRedisOperations.convertAndSend(sessionCreatedKey, session.delta);
		session.setNew(false);
	}
}
```

# 过期 session 的清空问题

针对需要过期 session 的清空，也针对 redis 做了相应的优化。

## 测试

实际生成的信息如下：

```
127.0.0.1:6379> keys *
A) spring:session:sessions:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4
B) spring:session:sessions:expires:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4
C) spring:session:expirations:1610022960000
```

### A 类的数据分析

对于数据 1)

```
127.0.0.1:6379> get spring:session:sessions:expires:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4
""
```

其中 `spring:session:sessions:expires:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4` 的类型最简单，就是一个 string，对应的值是 ""

### B 类的数据分析

对于 key `spring:session:expirations:1610022960000` 这里实际上方的是某一分钟需要清空的数据 set

```
127.0.0.1:6379> SMEMBERS spring:session:expirations:1610022960000
1) "\xac\xed\x00\x05t\x00,expires:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4"
```

通过 spring session 的定时任务执行，通过访问 redis，保证需要过期的数据被 redis 清空。

直接通过 `expires:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4` 加上对应的前缀 `spring:session:sessions:` 就可以得到需要清空的 key。

对应代码：

```java
@Scheduled(cron = "${spring.session.cleanup.cron.expression:0 * * * * *}")
public void cleanupExpiredSessions() {
   this.expirationPolicy.cleanExpiredSessions();
}
```

这个任务调度，是 spring 的 `@EnableScheduling` 启用的任务调度触发的，此处不做展开。

### C 类的数据分析

对于 key `spring:session:sessions:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4` 的信息最丰富，存储了所有 session 的相关信息。

```
127.0.0.1:6379> hkeys spring:session:sessions:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4
sessionAttr:SESSION-KEY-00370850-f656-40cf-ac3b-59bedf31f94d
creationTime
maxInactiveInterval
lastAccessedTime
```

对应的值：

```
127.0.0.1:6379> hget spring:session:sessions:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4 sessionAttr:SESSION-KEY-4a03c06c-f4dd-4b48-9314-d4899b5a0ba6
"\xac\xed\x00\x05t\x00\x05guest"

127.0.0.1:6379> hget spring:session:sessions:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4 creationTime
"\xac\xed\x00\x05sr\x00\x0ejava.lang.Long;\x8b\xe4\x90\xcc\x8f#\xdf\x02\x00\x01J\x00\x05valuexr\x00\x10java.lang.Number\x86\xac\x95\x1d\x0b\x94\xe0\x8b\x02\x00\x00xp\x00\x00\x01v\xdc\x95\xc4\xd8"

127.0.0.1:6379> hget spring:session:sessions:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4 maxInactiveInterval
"\xac\xed\x00\x05sr\x00\x11java.lang.Integer\x12\xe2\xa0\xa4\xf7\x81\x878\x02\x00\x01I\x00\x05valuexr\x00\x10java.lang.Number\x86\xac\x95\x1d\x0b\x94\xe0\x8b\x02\x00\x00xp\x00\x00\a\b"

127.0.0.1:6379> hget spring:session:sessions:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4 lastAccessedTime
"\xac\xed\x00\x05sr\x00\x0ejava.lang.Long;\x8b\xe4\x90\xcc\x8f#\xdf\x02\x00\x01J\x00\x05valuexr\x00\x10java.lang.Number\x86\xac\x95\x1d\x0b\x94\xe0\x8b\x02\x00\x00xp\x00\x00\x01v\xdc\x95\xc4\xd8"
```

# 针对 session 的续签处理

session 中非常核心的是 lastAccessedTime，也就是我们常说的续签问题。

每次 session 的续签，需要将旧桶中的数据移除，放到新桶中。

## 源码

每次访问，都会更新对应的 lastAccessedTime

```java
Long originalExpiration = this.originalLastAccessTime == null ? null
					: this.originalLastAccessTime + TimeUnit.SECONDS
							.toMillis(getMaxInactiveIntervalInSeconds());
			RedisOperationsSessionRepository.this.expirationPolicy
					.onExpirationUpdated(originalExpiration, this);
```

## 场景

假设存在一个 sessionId=1 的会话，初始时间戳为 1420656360000

```
spring:session:expirations:1420656360000 -> [1]
spring:session:session:1 -> <session>
```

接下来迎来了并发访问，（用户可能在浏览器中多次点击）：

1. 线程 1 在第 2 分钟请求，产生了续签，session:1 应当从 1420656360000 这个桶移动到 142065642000 这个桶

2. 线程 2 在第 3 分钟请求，也产生了续签，session:1 本应当从 1420656360000 这个桶移动到 142065648000 这个桶

如果上两步按照次序执行，自然不会有问题。但第 3 分钟的请求可能已经执行完毕了，第 2 分钟才刚开始执行。

## 并发分析

像下面这样：

线程 2 从第一分钟的桶中移除 session:1，并移动到第三分钟的桶中

```
spring:session:expirations:1420656360000 -> []
spring:session:session:1 -> <session>
spring:session:expirations:1420656480000 -> [1]
```

线程 1 完成相同的操作，它也是基于第一分钟来做的，但会移动到第二分钟的桶中

```
spring:session:expirations:1420656360000 -> []
spring:session:session:1 -> <session>
spring:session:expirations:1420656420000 -> [1]
```

最后 redis 中键的情况变成了这样：

```
spring:session:expirations:1420656360000 -> []
spring:session:session:1 -> <session>
spring:session:expirations:1420656480000 -> [1]
spring:session:expirations:1420656420000 -> [1]
```

后台定时任务会在第 32 分钟扫描到 spring:session:expirations:1420656420000 桶中存在的 session，这意味着，本应该在第 33 分钟才会过期的 key，在第 32 分钟就会被删除！

## 解决方案

### 分布式锁

一种简单的方法是用户的每次 session 续期加上分布式锁，这显然不能被接受。来看看 Spring Session 是怎么巧妙地应对这个并发问题的。

### spring session 的解决方案

```java
public void cleanExpiredSessions() {
   long now = System.currentTimeMillis();
   long prevMin = roundDownMinute(now);

   // 获取到定时清空的型键
   String expirationKey = getExpirationKey(prevMin);
   // 取出当前这一分钟应当过期的 session
   Set<Object> sessionsToExpire = this.redis.boundSetOps(expirationKey).members();
   // 注意：这里删除的是定时清空型键，不是删除 session 本身！
   this.redis.delete(expirationKey);
   for (Object session : sessionsToExpire) {
      String sessionKey = getSessionKey((String) session);
      // 遍历一下对应的 expireKey 类型的键
      touch(sessionKey);
   }
}

/**
 * By trying to access the session we only trigger a deletion if it the TTL is
 * expired. This is done to handle
 * https://github.com/spring-projects/spring-session/issues/93
 *
 * @param key the key
 */
private void touch(String key) {
   // 并不是删除 key，而只是访问 key
   // 通过访问，让 redis 自己去删除。
   this.redis.hasKey(key);
}
```

### spring session 解决方案分析

这里面逻辑主要是拿到过期键的集合（实际上是 expireKey 类型的 key，但这里可以理解为 sessionId，expireKey 类型我下面会介绍），此时这个集合里面存在三种类型的 sessionId。

（1）已经被 redis 删除的过期键。redis 很靠谱的及时清理了过期的键。

（2）已经过期，但是还没来得及被 redis 清除的 key。

我们在 key 到期后只需要访问一下 key 就可以确保 redis 删除该过期键，所以 redis.hasKey(key); 该操作就是为了触发 redis 的自己删除。

（3）并发问题导致的多余数据，实际上并未过期。

如上所述，第 32 分钟的桶里面存在的 session:1 实际上并不应该被删除，使用 touch 的好处便是我只负责检测，删不删交给 redis 判断。

session:1 在第 32 分钟被 touch 了一次，并未被删除，在第 33 分钟时应当被 redis 删除，但可能存在延时，这个时候 touch 一次，确保删除。

# 过期通知事件

有了 redis 的清空 + 定时任务清空，可能觉得还是不够保险。

于是还有一个过期时间通知机制，这个可以让 redis 在清空 key 的时候，通知到监听者，便于进行相关的处理。

## SessionDeletedEvent 和 SessionExpiredEvent

SessionDeletedEvent和SessionExpiredEvent都是SessionDestroyedEvent的两种类型。

RedisIndexedSessionRepository支持在删除会话时触发SessionDeletedEvent或在会话过期时触发SessionExpiredEvent。 

这是确保正确清理与会话相关的资源所必需的。

## 例子

RedisHttpSessionConfiguration 中有一个配置可以定义，默认的实现是 `ConfigureNotifyKeyspaceEventsAction`。

例如，当与WebSockets集成时，SessionDestroyedEvent负责关闭任何活动的WebSocket连接。

可以通过SessionMessageListener来触发SessionDeletedEvent或SessionExpiredEvent，该监听器监听Redis Keyspace事件。 

为了使其正常工作，需要启用通用命令的Redis键空间事件和过期事件。 

以下示例显示了如何执行此操作：

```
redis-cli config set notify-keyspace-events Egx
```

如果使用 `@EnableRedisHttpSession`，则将自动完成SessionMessageListener的管理并启用必要的Redis Keyspace事件。 

ps: 这里实际上可能存在坑，如果大批量的删除 redis，触发了 Redis keyspace 通知时间，可能瞬间把网络大打爆。

但是，在安全的Redis环境中，禁用config命令。 这意味着Spring Session无法为您配置Redis Keyspace事件。 

## 如何禁用

要禁用自动配置，请将ConfigureRedisAction.NO_OP添加为Bean。

例如，通过Java配置，可以使用以下命令：

```java
@Bean
ConfigureRedisAction configureRedisAction() {
	return ConfigureRedisAction.NO_OP;
}
```

## 为什么要这样设计？

```
A) "spring:session:sessions:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4"

B) "spring:session:expirations:1523934840000"

C) "spring:session:sessions:expires:f925b626-1b6e-4f19-9cc6-dcbb18a8eec4"
```

存储 session 实际内容的 A 类型键和用于定时器确保删除的桶 B 类型键过期时间都是 30 分钟 (key 的 TTL 是 30 分钟)，注意一个细节，spring-session 中 A 类型键的过期时间是 35 分钟，比实际的 30 分钟多了 5 分钟，这意味着即便 session 已经过期，我们还是可以在 redis 中有 5 分钟间隔来操作过期的 session。

于此同时，spring-session 引入了 C 类型键来作为 session 的引用。

C 类型键的组成为 `spring:session:` + `sessions:expires` + sessionId，对应一个空值。

同时也是 B 类型键桶中存放的 session 引用，ttl 为 30 分钟。

具体作用便是在自身过期后触发 redis 的 keyspace notifications (http://redis.io/topics/notifications).

- 为什么引入 C 类型键？

keyspace notifications 只会告诉我们哪个键过期了，不会告诉我们内容是什么。 

关键就在于如果 session 过期后监听器可能想要访问 session 的具体内容，然而自身都过期了，还怎么获取内容。

所以，**C 类型键存在的意义便是解耦 session 的存储和 session 的过期，并且使得 server 获取到过期通知后可以访问到 session 真实的值。**

对于用户来说，C 类型键过期后，意味着登录失效，而对于服务端而言，真正的过期其实是 A 类型键过期，这中间会有 5 分钟的误差。


# 小结

如果是你实现一个 session 框架，你会如何设计？

存在哪些问题？

如何方便的整合？拓展？

## spring session 的优点

spring session 重写了 http session，使用起来可以保证和原生的 http session 一样，这一点非常的优秀。

而且持久化层可以非常方便的替换，可以换成 redis/monogodb/msyql，或者单机内存。这一点也非常值得学习。

对于 redis 的过期考虑还是非常细致的，这需要对于 redis 有一定理解，并且在性能和安全之间找到平衡。

## 一点建议

个人感觉 redis 的事件通知大部分场景都是不需要的，虽然有些场景会用到。

这让设计变得有些复杂，而且有时候使用不慎，会直接把网络打爆。

后续我们将参考 spring session，设计并且实现一个属于自己的 session。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[从 Spring-Session 源码看 Session 机制的实现细节](https://www.cnkirito.moe/spring-session-4/)

[Using RedisIndexedSessionRepository](https://docs.spring.io/spring-session/docs/2.4.1/reference/html5/#api-redisindexedsessionrepository)

* any list
{:toc}