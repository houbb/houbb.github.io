---
layout: post
title: 统一的 aop 拦截最佳实践
date:  2023-03-17 +0800
categories: [Java]
tags: [java, ai, sh]
published: true
---

# aop

远程的 aop 调用，有时候需要 aop 的统一拦截。


# 方法返回值

一般的 rpc 调用都会有统一的参数，比如 respCode, respMessage。

## V1-统一父类 BaseResp-错误

```java
@Around("@annotation(MyAop)")
public Object aop(ProceedingJoinPoint joinPoint,
                        MyAop myAop) throws Throwable {
    Object returnObj = null;
    try {
        // 记录请求的入参等

        returnObj = joinPoint.proceed();
        return returnObj;
    } catch (BizException e) {
        return returnObj;
    } catch (NetTimeoutException e){
        log.error("服务超时", e);
        return returnObj;
    } catch (Throwable e) {
        log.error("调用异常", e);
        return returnObj;
    } finally {
        // 最后的逻辑处理
    }
}
```

当出现异常的时候，我们容易想到统一处理 returnObj 为：

```java
BaseResp resp = new BaseResp();
resp.setRespCode("xxx");
resp.setRespDesc("yyy");
```

但是对于返回值，如果使用 BaseResp，会导致强转失败。

## V2-基于反射-异常丢失

第二种比较常见的方式，是基于反射。

比如一个公司内，所有的响应编码如果是统一的话：

```java
Class<?> returnType = ((MethodSignature) joinPoint.getSignature()).getReturnType();
// 如果原始返回 void
if(returnType == void.class) {
    return null;
}

Object returnObj = returnType.newInstance();
BeanUtils.setProperty(returnObj, LensConstants.RESP_CODE, respCode);
BeanUtils.setProperty(returnObj, LensConstants.RESP_DESC, respMessage);
return returnObj;
```

这里考虑了 void 类型的。

不过这个会有一定的问题，如果我们在方法中定义了异常抛出，会导致方法中业务异常被捕获。

所以结合个人情况，我不建议这么做。

## v3-抛出异常

我们作为调用者，直接抛出异常。如果作为服务端，可以考虑统一捕获异常。

```java
/**
     * 创建对象
     * @param joinPoint 切面
     * @param respCode 响应编码
     * @param respMessage 响应消息
     * @return 结果
     * @throws Throwable 异常
     * @since 224
     */
    private Object createResp(final ProceedingJoinPoint joinPoint,
                            String respCode,
                            String respMessage) throws Throwable{
//        Class<?> returnType = ((MethodSignature) joinPoint.getSignature()).getReturnType();
//        // 如果原始返回 void
//        if(returnType == void.class) {
//            return null;
//        }
//
//        Object returnObj = returnType.newInstance();
//        BeanUtils.setProperty(returnObj, LensConstants.RESP_CODE, respCode);
//        BeanUtils.setProperty(returnObj, LensConstants.RESP_DESC, respMessage);
//        return returnObj;
        // 避免方法中异常被捕获
        throw new BizException(respCode, respMessage);
    }
```

# 参考资料


* any list
{:toc}