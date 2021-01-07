---
layout: post
title: Spring Session-03-源码详解
date:  2018-09-26 14:24:33 +0800
categories: [Spring]
tags: [web, spring, session, source-code, sh]
published: false
---

# EnableRedisHttpSession 注解

使用 spring session 最核心的注解就是 `@EnableRedisHttpSession`。

这个注解看起来非常简单，实际上却默默地为我们做了很多事情：

（1）使用 spring 自己实现的 Http 实现，替代原生的实现。对于开发者完全透明。

（2）将 session 的信息持久化到 redis

（3）针对 session 的持久化做了失效/安全性等多方面的考虑。

## 注解定义

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

RedisFlushMode 是一个枚举值，另外一个值是：IMMEDIATE。尽可能快的写入 redis。




# RedisHttpSessionConfiguration.java

还有一个核心的配置，就是 `@Import(RedisHttpSessionConfiguration.class)`。

## 核心目的

将 SessionRepositoryFilter 作为名为 bean 公开 springSessionRepositoryFilter。

为了使用它，必须将单个 RedisConnectionFactory 作为Bean公开。

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

所以肯定需要 redis 相关的操作 bean 定义。

`RedisTemplate` 的 bean 定义如下：

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

我们一般存储到 redis 中的信息如下：

```
1) "spring:session:expirations:1609932660000"
2) "spring:session:sessions:15b63b4b-cdcb-49f3-b491-b8a812a5bfbf"
3) "spring:session:sessions:expires:15b63b4b-cdcb-49f3-b491-b8a812a5bfbf"
```

实际上 spring-session 还额外做了很多事情，比如最后访问时间，多久失效等等。

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

让我们完全可以像以前使用单机的 session 一样，来操作 spring sessino。

而想要实现这个，就需要看一下 SessionRepositoryFilter 拦截器实现。

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

这是 Filter 继承自 OncePerRequestFilter，保证每一个请求只执行一次。

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

# SessionRepositoryRequestWrapper

## 类定义

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

## 核心方法

### getSession(boolean)

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

### getSession(requestedSessionId) 获取 session

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

### commitSession  对于 session 信息的持久化

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




# 参考资料

https://spring.io/projects/spring-session#overview

https://yq.aliyun.com/articles/371442

- 实现原理

[实现原理](https://blog.csdn.net/wojiaolinaaa/article/details/62424642)

[Spring Session 内部实现原理（源码分析）](https://www.jianshu.com/p/1001e9e2cfcf)

[从 Spring-Session 源码看 Session 机制的实现细节](https://www.cnkirito.moe/spring-session-4/)

* any list
{:toc}