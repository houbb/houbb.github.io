---
layout: post
title: Spring Web MVC-05-Handler Methods
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: false
---

# Handler Methods

@RequestMapping 处理程序方法具有灵活的签名，可以从一系列受支持的控制器方法参数和返回值中进行选择。


# Method Arguments

下表描述了受支持的控制器方法参数。 

任何参数均不支持反应性类型。

支持JDK 8的java.util.Optional作为方法参数，并与具有必需属性（例如，@RequestParam，@RequestHeader等）的注释结合在一起，等效于required = false。

```
Controller method argument	Description
WebRequest, NativeWebRequest

Generic access to request parameters and request and session attributes, without direct use of the Servlet API.

javax.servlet.ServletRequest, javax.servlet.ServletResponse

Choose any specific request or response type — for example, ServletRequest, HttpServletRequest, or Spring’s MultipartRequest, MultipartHttpServletRequest.

javax.servlet.http.HttpSession

Enforces the presence of a session. As a consequence, such an argument is never null. Note that session access is not thread-safe. Consider setting the RequestMappingHandlerAdapter instance’s synchronizeOnSession flag to true if multiple requests are allowed to concurrently access a session.

javax.servlet.http.PushBuilder

Servlet 4.0 push builder API for programmatic HTTP/2 resource pushes. Note that, per the Servlet specification, the injected PushBuilder instance can be null if the client does not support that HTTP/2 feature.

java.security.Principal

Currently authenticated user — possibly a specific Principal implementation class if known.

HttpMethod

The HTTP method of the request.

java.util.Locale

The current request locale, determined by the most specific LocaleResolver available (in effect, the configured LocaleResolver or LocaleContextResolver).

java.util.TimeZone + java.time.ZoneId

The time zone associated with the current request, as determined by a LocaleContextResolver.

java.io.InputStream, java.io.Reader

For access to the raw request body as exposed by the Servlet API.

java.io.OutputStream, java.io.Writer

For access to the raw response body as exposed by the Servlet API.

@PathVariable

For access to URI template variables. See URI patterns.

@MatrixVariable

For access to name-value pairs in URI path segments. See Matrix Variables.

@RequestParam

For access to the Servlet request parameters, including multipart files. Parameter values are converted to the declared method argument type. See @RequestParam as well as Multipart.

Note that use of @RequestParam is optional for simple parameter values. See “Any other argument”, at the end of this table.

@RequestHeader

For access to request headers. Header values are converted to the declared method argument type. See @RequestHeader.

@CookieValue

For access to cookies. Cookies values are converted to the declared method argument type. See @CookieValue.

@RequestBody

For access to the HTTP request body. Body content is converted to the declared method argument type by using HttpMessageConverter implementations. See @RequestBody.

HttpEntity<B>

For access to request headers and body. The body is converted with an HttpMessageConverter. See HttpEntity.

@RequestPart

For access to a part in a multipart/form-data request, converting the part’s body with an HttpMessageConverter. See Multipart.

java.util.Map, org.springframework.ui.Model, org.springframework.ui.ModelMap

For access to the model that is used in HTML controllers and exposed to templates as part of view rendering.

RedirectAttributes

Specify attributes to use in case of a redirect (that is, to be appended to the query string) and flash attributes to be stored temporarily until the request after redirect. See Redirect Attributes and Flash Attributes.

@ModelAttribute

For access to an existing attribute in the model (instantiated if not present) with data binding and validation applied. See @ModelAttribute as well as Model and DataBinder.

Note that use of @ModelAttribute is optional (for example, to set its attributes). See “Any other argument” at the end of this table.

Errors, BindingResult

For access to errors from validation and data binding for a command object (that is, a @ModelAttribute argument) or errors from the validation of a @RequestBody or @RequestPart arguments. You must declare an Errors, or BindingResult argument immediately after the validated method argument.

SessionStatus + class-level @SessionAttributes

For marking form processing complete, which triggers cleanup of session attributes declared through a class-level @SessionAttributes annotation. See @SessionAttributes for more details.

UriComponentsBuilder

For preparing a URL relative to the current request’s host, port, scheme, context path, and the literal part of the servlet mapping. See URI Links.

@SessionAttribute

For access to any session attribute, in contrast to model attributes stored in the session as a result of a class-level @SessionAttributes declaration. See @SessionAttribute for more details.

@RequestAttribute

For access to request attributes. See @RequestAttribute for more details.

Any other argument

If a method argument is not matched to any of the earlier values in this table and it is a simple type (as determined by BeanUtils#isSimpleProperty, it is a resolved as a @RequestParam. Otherwise, it is resolved as a @ModelAttribute.
```

# 参考资料

[mvc-ann-methods](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-ann-methods)

* any list
{:toc}