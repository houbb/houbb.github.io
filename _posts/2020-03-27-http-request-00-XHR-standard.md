---
layout: post
title: http request-01-XMLHttpRequest XHR 标准
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

#1. 引言

本节内容不具规范性。

`XMLHttpRequest` 对象是一个用于获取资源的 API。

`XMLHttpRequest` 这个名称是历史遗留的，与其功能无关。

下面是一些简单的代码，用于处理从网络上获取的 XML 文档中的数据：

```javascript
function processData(data) {
  // 处理数据
}

function handler() {
  if (this.status == 200 &&
      this.responseXML != null &&
      this.responseXML.getElementById('test').textContent) {
    // 成功！
    processData(this.responseXML.getElementById('test').textContent);
  } else {
    // 出现错误
    …
  }
}

var client = new XMLHttpRequest();
client.onload = handler;
client.open("GET", "unicorn.xml");
client.send();
```

如果你只是想向服务器记录一条消息：

```javascript
function log(message) {
  var client = new XMLHttpRequest();
  client.open("POST", "/log");
  client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
  client.send(message);
}
```

或者如果你想检查服务器上文档的状态：

```javascript
function fetchStatus(address) {
  var client = new XMLHttpRequest();
  client.onload = function() {
    // 网络错误情况下，结果可能不可靠
    returnStatus(this.status);
  }
  client.open("HEAD", address);
  client.send();
}
```

## 1.1. 规范历史

`XMLHttpRequest` 对象最初是在 WHATWG 的 HTML 项目中定义的。

（基于多年前 Microsoft 的实现。）它在 2006 年转移到 W3C。

对 `XMLHttpRequest` 的扩展（例如进度事件和跨源请求）在一个单独的草案（`XMLHttpRequest Level 2`）中开发，直到 2011 年底，这两个草案被合并，`XMLHttpRequest` 从标准的角度再次成为一个单一实体。到 2012 年底，它又转回到 WHATWG。


# 2. 术语

本规范依赖于 Infra 标准。[INFRA](https://xhr.spec.whatwg.org/#biblio-infra)

本规范使用了以下领域的术语：DOM、DOM 解析与序列化、编码、Fetch、文件 API、HTML、URL、Web IDL 和 XML。

# 3. 接口 XMLHttpRequest

```webidl
[Exposed=(Window,DedicatedWorker,SharedWorker)]
interface XMLHttpRequestEventTarget : EventTarget {
  // 事件处理程序
  attribute EventHandler onloadstart;
  attribute EventHandler onprogress;
  attribute EventHandler onabort;
  attribute EventHandler onerror;
  attribute EventHandler onload;
  attribute EventHandler ontimeout;
  attribute EventHandler onloadend;
};

[Exposed=(Window,DedicatedWorker,SharedWorker)]
interface XMLHttpRequestUpload : XMLHttpRequestEventTarget {
};

enum XMLHttpRequestResponseType {
  "",
  "arraybuffer",
  "blob",
  "document",
  "json",
  "text"
};

[Exposed=(Window,DedicatedWorker,SharedWorker)]
interface XMLHttpRequest : XMLHttpRequestEventTarget {
  constructor();

  // 事件处理程序
  attribute EventHandler onreadystatechange;

  // 状态
  const unsigned short UNSENT = 0;
  const unsigned short OPENED = 1;
  const unsigned short HEADERS_RECEIVED = 2;
  const unsigned short LOADING = 3;
  const unsigned short DONE = 4;
  readonly attribute unsigned short readyState;

  // 请求
  undefined open(ByteString method, USVString url);
  undefined open(ByteString method, USVString url, boolean async, optional USVString? username = null, optional USVString? password = null);
  undefined setRequestHeader(ByteString name, ByteString value);
           attribute unsigned long timeout;
           attribute boolean withCredentials;
  [SameObject] readonly attribute XMLHttpRequestUpload upload;
  undefined send(optional (Document or XMLHttpRequestBodyInit)? body = null);
  undefined abort();

  // 响应
  readonly attribute USVString responseURL;
  readonly attribute unsigned short status;
  readonly attribute ByteString statusText;
  ByteString? getResponseHeader(ByteString name);
  ByteString getAllResponseHeaders();
  undefined overrideMimeType(DOMString mime);
           attribute XMLHttpRequestResponseType responseType;
  readonly attribute any response;
  readonly attribute USVString responseText;
  [Exposed=Window] readonly attribute Document? responseXML;
};
```

一个 `XMLHttpRequest` 对象具有以下关联：

- **上传对象**  
  一个 `XMLHttpRequestUpload` 对象。

- **状态**  
  可能的状态包括未发送（unsent）、已打开（opened）、已接收头部（headers received）、正在加载（loading）和完成（done）；初始状态为未发送（unsent）。

- **发送标志**  
  一个标志，初始为未设置。

- **超时**  
  一个无符号整数，初始值为 0。

- **跨源凭证**  
  一个布尔值，初始值为 false。

- **请求方法**  
  一个方法。

- **请求 URL**  
  一个 URL。

- **请求头部**  
  一个头部列表，初始为空。

- **请求体**  
  初始为 null。

- **同步标志**  
  一个标志，初始为未设置。

- **上传完成标志**  
  一个标志，初始为未设置。

- **上传监听标志**  
  一个标志，初始为未设置。

- **超时标志**  
  一个标志，初始为未设置。

- **响应**  
  初始为网络错误的响应。

- **接收字节**  
  一个字节序列，初始为空字节序列。

- **响应类型**  
  可能的值包括空字符串、"arraybuffer"、"blob"、"document"、"json" 和 "text"；初始为空字符串。

- **响应对象**  
  一个对象、失败或 null，初始为 null。

- **Fetch 控制器**  
  一个 Fetch 控制器，初始为新的 Fetch 控制器。`send()` 方法将其设置为有用的 Fetch 控制器，但为了简化，始终持有一个 Fetch 控制器。

- **重写 MIME 类型**  
  一个 MIME 类型或 null，初始为 null。当调用 `overrideMimeType()` 时可能会获得一个值。


## 3.1. 构造函数

```javascript
client = new XMLHttpRequest()
```
返回一个新的 `XMLHttpRequest` 对象。

`new XMLHttpRequest()` 构造函数的步骤是：

1. 将 `this` 的上传对象设置为一个新的 `XMLHttpRequestUpload` 对象。

## 3.2. 垃圾回收

如果 `XMLHttpRequest` 对象的状态是已打开且发送标志已设置、已接收头部或正在加载，并且它有一个或多个事件监听器注册，这些事件监听器的类型包括 `readystatechange`、`progress`、`abort`、`error`、`load`、`timeout` 和 `loadend`，则该对象不能被垃圾回收。

如果 `XMLHttpRequest` 对象在连接仍然打开的情况下被垃圾回收，用户代理必须终止 `XMLHttpRequest` 对象的 Fetch 控制器。

## 3.3. 事件处理程序

以下是必须作为属性由实现 `XMLHttpRequestEventTarget` 接口的对象支持的事件处理程序（及其对应的事件类型）：

| 事件处理程序 | 事件处理程序事件类型 |
|--------------|-----------------------|
| onloadstart   | loadstart             |
| onprogress    | progress              |
| onabort       | abort                 |
| onerror       | error                 |
| onload        | load                  |
| ontimeout     | timeout               |
| onloadend     | loadend               |

以下是 `XMLHttpRequest` 对象必须作为属性单独支持的事件处理程序（及其对应的事件类型）：

| 事件处理程序   | 事件处理程序事件类型     |
|----------------|---------------------------|
| onreadystatechange | readystatechange |

## 3.4. 状态

`client.readyState`
返回 `client` 的状态。

`readyState` 的 getter 步骤是根据下表中的第二列的值返回，与第一列中的值匹配的状态：

| 状态              | 数值 (numeric value) | 说明                                         |
|-------------------|-----------------------|----------------------------------------------|
| 未发送 (unsent)   | UNSENT (0)            | 对象已经被构造。                            |
| 已打开 (opened)   | OPENED (1)            | `open()` 方法已成功调用。在此状态下，可以使用 `setRequestHeader()` 设置请求头，并使用 `send()` 方法发起请求。 |
| 已接收头部 (headers received) | HEADERS_RECEIVED (2) | 所有重定向（如果有）已被跟随，并且响应的所有头部已被接收。 |
| 正在加载 (loading) | LOADING (3)           | 正在接收响应体。                           |
| 完成 (done)       | DONE (4)              | 数据传输已完成，或在传输过程中出现了错误（例如无限重定向）。 |


## 3.5. 请求

在 `XMLHttpRequestUpload` 对象上注册一个或多个事件监听器将导致发起 CORS 预检请求。（这是因为注册事件监听器会导致上传监听标志被设置，从而触发使用 CORS 预检标志。）

### 3.5.1. `open()` 方法

```javascript
client.open(method, url [, async = true [, username = null [, password = null]]])
```

设置请求方法、请求 URL 和同步标志。

如果 `method` 不是有效的方法或 `url` 无法解析，则抛出 `"SyntaxError"` DOMException。

如果 `method` 与 `CONNECT`、`TRACE` 或 `TRACK` 匹配（不区分大小写），则抛出 `"SecurityError"` DOMException。

如果 `async` 为 `false`，当前全局对象是 `Window` 对象，且 `timeout` 属性不是零或 `responseType` 属性不是空字符串，则抛出 `"InvalidAccessError"` DOMException。

在 Web 平台中，已经在逐步移除同步的 XMLHttpRequest，因为它对最终用户体验产生了不利影响。（这是一个需要多年时间的过程。）当当前全局对象是 `Window` 对象时，开发者不得将 `async` 参数设置为 `false`。用户代理强烈建议在开发者工具中对这种用法发出警告，并可能在发生这种情况时尝试抛出 `"InvalidAccessError"` DOMException。

`open(method, url)` 和 `open(method, url, async, username, password)` 方法的步骤如下：

1. 如果 `this` 的相关全局对象是 `Window` 对象且其关联的 Document 没有完全激活，则抛出 `"InvalidStateError"` DOMException。
   
2. 如果 `method` 不是一个方法，则抛出 `"SyntaxError"` DOMException。
   
3. 如果 `method` 是一个被禁止的方法，则抛出 `"SecurityError"` DOMException。

4. 规范化 `method`。

5. 将 `url` 编码解析为相对于 `this` 的相关设置对象的 URL。

6. 如果 `parsedURL` 解析失败，则抛出 `"SyntaxError"` DOMException。

7. 如果 `async` 参数被省略，则将 `async` 设置为 `true`，`username` 和 `password` 设置为 `null`。

   遗憾的是，遗留内容使得省略 `async` 参数与将其设置为 `undefined` 的处理方式不同。

8. 如果 `parsedURL` 的 host 不为 `null`，则：

   - 如果 `username` 参数不为 `null`，则将 `username` 设置为 `parsedURL` 和 `username`。
   - 如果 `password` 参数不为 `null`，则将 `password` 设置为 `parsedURL` 和 `password`。

9. 如果 `async` 为 `false`，当前全局对象是 `Window` 对象，且 `this` 的 `timeout` 不为 0 或 `responseType` 不为空字符串，则抛出 `"InvalidAccessError"` DOMException。

10. 终止 `this` 的 Fetch 控制器。

11. 此时可能会有一个正在进行的 Fetch 请求。

12. 将与对象相关的变量设置如下：

    - 取消 `this` 的 `send()` 标志。
    - 取消 `this` 的上传监听标志。
    - 将 `this` 的请求方法设置为 `method`。
    - 将 `this` 的请求 URL 设置为 `parsedURL`。
    - 如果 `async` 为 `false`，则设置 `this` 的同步标志；否则取消 `this` 的同步标志。
    - 清空 `this` 的请求头部。
    - 将 `this` 的响应设置为网络错误。
    - 将 `this` 的接收字节设置为空字节序列。
    - 将 `this` 的响应对象设置为 `null`。
    - 在这里不重写 MIME 类型，因为可以在 `open()` 方法之前调用 `overrideMimeType()` 方法。

13. 如果 `this` 的状态不是打开（opened），则：

    - 将 `this` 的状态设置为打开（opened）。
    - 触发一个名为 `readystatechange` 的事件。

`open()` 方法被定义为两个是由于编写 `XMLHttpRequest` 标准时所使用的编辑软件的限制。

### 3.5.2. `setRequestHeader()` 方法

```javascript
client.setRequestHeader(name, value)
```

将一个值附加到现有的请求头部或添加一个新的请求头部。

如果状态不是打开（opened）或 `send()` 标志被设置，则抛出 `"InvalidStateError"` DOMException。

如果 `name` 不是一个头部名称或 `value` 不是一个头部值，则抛出 `"SyntaxError"` DOMException。

`setRequestHeader(name, value)` 方法的步骤如下：

1. 如果 `this` 的状态不是打开（opened），则抛出 `"InvalidStateError"` DOMException。

2. 如果 `this` 的 `send()` 标志被设置，则抛出 `"InvalidStateError"` DOMException。

3. 规范化 `value`。

4. 如果 `name` 不是一个头部名称或 `value` 不是一个头部值，则抛出 `"SyntaxError"` DOMException。

   空字节序列表示空的头部值。

5. 如果 `(name, value)` 是一个被禁止的请求头部，则返回。

6. 将 `(name, value)` 合并到 `this` 的请求头部中。

以下是一个简单的代码示例，演示设置相同头部两次时发生的情况：

```javascript
// 以下脚本：
var client = new XMLHttpRequest();
client.open('GET', 'demo.cgi');
client.setRequestHeader('X-Test', 'one');
client.setRequestHeader('X-Test', 'two');
client.send();

// …结果是发送以下头部：
// X-Test: one, two
```

### 3.5.3. `timeout` 获取器和设置器

```javascript
client.timeout
```

可以设置为一个以毫秒为单位的时间。当设置为非零值时，将导致在给定时间后终止请求。当时间过去且请求尚未完成，且 `this` 的同步标志未设置时，将触发一个超时事件，否则（对于 `send()` 方法）将抛出 `"TimeoutError"` DOMException。

设置时：如果同步标志被设置且当前全局对象是 `Window` 对象，则抛出 `"InvalidAccessError"` DOMException。

`timeout` 获取器的步骤是返回 `this` 的 `timeout`。

`timeout` 设置器的步骤是：

1. 如果当前全局对象是 `Window` 对象且 `this` 的同步标志被设置，则抛出 `"InvalidAccessError"` DOMException。

2. 将 `this` 的 `timeout` 设置为给定值。

   这意味着在请求进行时可以设置 `timeout` 属性。如果发生这种情况，它仍将相对于请求开始时间进行测量。

### 3.5.4. `withCredentials` 获取器和设置器

```javascript
client.withCredentials
```

当凭证需要包含在跨源请求中时为 `true`。当它们需要排除在跨源请求中且在响应中忽略 cookies 时为 `false`。初始值为 `false`。

设置时：如果状态不是未发送（unsent）或已打开（opened），或 `send()` 标志被设置，则抛出 `"InvalidStateError"` DOMException。

`withCredentials` 获取器的步骤是返回 `this` 的跨源凭证。

`withCredentials` 设置器的步骤是：

1. 如果 `this` 的状态不是未发送（unsent）或已打开（opened），则抛出 `"InvalidStateError"` DOMException。

2. 如果 `this` 的 `send()` 标志被设置，则抛出 `"InvalidStateError"` DOMException。

3. 将 `this` 的跨源凭证设置为给定值。

### 3.5.5. `upload` 获取器

```javascript
client.upload
```

返回关联的 `XMLHttpRequestUpload` 对象。可以用于在数据传输到服务器时收集传输信息。

`upload` 获取器的步骤是返回 `this` 的上传对象。

### 3.5.6. `send()` 方法

```javascript
client.send([body = null])
```

初始化请求。`body` 参数提供请求体（如果有的话），在请求方法为 `GET` 或 `HEAD` 时被忽略。

如果状态不是打开（opened）或 `send()` 标志已设置，则抛出 `"InvalidStateError"` DOMException。

`send(body)` 方法的步骤如下：

1. **状态检查**

   如果 `this` 的状态不是打开（opened），则抛出 `"InvalidStateError"` DOMException。

   如果 `this` 的 `send()` 标志已设置，则抛出 `"InvalidStateError"` DOMException。

2. **处理请求体**

   如果 `this` 的请求方法是 `GET` 或 `HEAD`，则将 `body` 设置为 `null`。

   如果 `body` 不为 `null`，则：

   - 让 `extractedContentType` 为 `null`。

   - 如果 `body` 是一个 `Document`，则将 `this` 的请求体设置为 `body` 的序列化、转换和 UTF-8 编码版本。

   - 否则：

     - 让 `bodyWithType` 是安全地提取 `body` 的结果。

     - 将 `this` 的请求体设置为 `bodyWithType` 的体。

     - 将 `extractedContentType` 设置为 `bodyWithType` 的类型。

     - 让 `originalAuthorContentType` 是从 `this` 的作者请求头部中获取 `Content-Type` 的结果。

     - 如果 `originalAuthorContentType` 不为 `null`，则：

       - 如果 `body` 是一个 `Document` 或 `USVString`，则：

         - 让 `contentTypeRecord` 是解析 `originalAuthorContentType` 的结果。

         - 如果 `contentTypeRecord` 不失败，且 `contentTypeRecord` 的参数中 `"charset"` 存在，且 `"charset"` 不等于 `"UTF-8"`（不区分大小写），则：

           - 将 `contentTypeRecord` 的参数 `"charset"` 设置为 `"UTF-8"`。

           - 让 `newContentTypeSerialized` 是序列化 `contentTypeRecord` 的结果。

           - 在 `this` 的作者请求头部中设置 (`Content-Type`, `newContentTypeSerialized`)。

       - 否则：

         - 如果 `body` 是 HTML 文档，则在 `this` 的作者请求头部中设置 (`Content-Type`, `text/html;charset=UTF-8`)。

         - 否则，如果 `body` 是 XML 文档，则在 `this` 的作者请求头部中设置 (`Content-Type`, `application/xml;charset=UTF-8`)。

         - 否则，如果 `extractedContentType` 不为 `null`，则在 `this` 的作者请求头部中设置 (`Content-Type`, `extractedContentType`)。

3. **上传监听器标志**

   如果 `this` 的上传对象上注册了一个或多个事件监听器，则设置 `this` 的上传监听器标志。

4. **初始化请求**

   让 `req` 是一个新请求，初始化如下：

   - `method`：`this` 的请求方法。
   - `URL`：`this` 的请求 URL。
   - `header list`：`this` 的作者请求头部。
   - `unsafe-request flag`：设置。
   - `body`：`this` 的请求体。
   - `client`：`this` 的相关设置对象。
   - `mode`：`"cors"`。
   - `use-CORS-preflight flag`：如果 `this` 的上传监听器标志被设置，则设置。
   - `credentials mode`：如果 `this` 的跨源凭证为 `true`，则 `"include"`；否则 `"same-origin"`。
   - `use-URL-credentials flag`：如果 `this` 的请求 URL 包含凭证，则设置。
   - `initiator type`：`"xmlhttprequest"`。

   - 取消 `this` 的上传完成标志。

   - 取消 `this` 的超时标志。

   - 如果 `req` 的体为 `null`，则设置 `this` 的上传完成标志。

   - 设置 `this` 的 `send()` 标志。

5. **触发事件**

   如果 `this` 的同步标志未设置，则：

   - 触发一个名为 `loadstart` 的进度事件，附带 `0` 和 `0`。

   - 让 `requestBodyTransmitted` 为 `0`。

   - 让 `requestBodyLength` 为 `req` 的体的长度（如果 `req` 的体不为 `null`）；否则为 `0`。

   - 如果 `this` 的上传完成标志未设置且 `this` 的上传监听器标志被设置，则在 `this` 的上传对象上触发一个名为 `loadstart` 的进度事件，附带 `requestBodyTransmitted` 和 `requestBodyLength`。

   - 如果 `this` 的状态不是打开（opened）或 `this` 的 `send()` 标志未设置，则返回。

6. **处理请求体**

   让 `processRequestBodyChunkLength`（给定 `bytesLength`）为这些步骤：

   - 增加 `requestBodyTransmitted` 的 `bytesLength`。

   - 如果距离上次调用这些步骤的时间未大约 50 毫秒，则返回。

   - 如果 `this` 的上传监听器标志被设置，则在 `this` 的上传对象上触发一个名为 `progress` 的进度事件，附带 `requestBodyTransmitted` 和 `requestBodyLength`。

7. **处理请求体结束**

   让 `processRequestEndOfBody` 为这些步骤：

   - 设置 `this` 的上传完成标志。

   - 如果 `this` 的上传监听器标志未设置，则返回。

   - 在 `this` 的上传对象上触发一个名为 `progress` 的进度事件，附带 `requestBodyTransmitted` 和 `requestBodyLength`。

   - 在 `this` 的上传对象上触发一个名为 `load` 的进度事件，附带 `requestBodyTransmitted` 和 `requestBodyLength`。

   - 在 `this` 的上传对象上触发一个名为 `loadend` 的进度事件，附带 `requestBodyTransmitted` 和 `requestBodyLength`。

8. **处理响应**

   让 `processResponse`（给定 `response`）为这些步骤：

   - 设置 `this` 的响应为 `response`。

   - 处理 `this` 的错误。

   - 如果 `this` 的响应是网络错误，则返回。

   - 设置 `this` 的状态为接收到头部（headers received）。

   - 触发一个名为 `readystatechange` 的事件。

   - 如果 `this` 的状态不是接收到头部（headers received），则返回。

   - 如果 `this` 的响应体为 `null`，则运行处理响应结束的步骤并返回。

   - 让 `length` 为从 `this` 的响应的头部列表中提取长度的结果。

   - 如果 `length` 不是整数，则将其设置为 `0`。

   - 让 `processBodyChunk`（给定 `bytes`）为这些步骤：

     - 将 `bytes` 附加到 `this` 的接收字节中。

     - 如果距离上次调用这些步骤的时间未大约 50 毫秒，则返回。

     - 如果 `this` 的状态是接收到头部（headers received），则设置 `this` 的状态为加载中（loading）。

     - 触发一个名为 `readystatechange` 的事件。

     - 触发一个名为 `progress` 的进度事件，附带 `this` 的接收字节的长度和 `length`。

   - 让 `processEndOfBody` 为这些步骤：运行处理响应结束的步骤。

   - 让 `processBodyError` 为这些步骤：

     - 设置 `this` 的响应为网络错误。

     - 处理错误。

   - 按增量读取 `this` 的响应体，给定 `processBodyChunk`、`processEndOfBody`、`processBodyError` 和 `this` 的相关全局对象。

   - 设置 `this` 的 Fetch 控制器为使用 `processRequestBodyChunkLength` 设置为 `processRequestBodyChunkLength`，`processRequestEndOfBody` 设置为 `processRequestEndOfBody`，以及 `processResponse` 设置为 `processResponse` 的 `fetch` 结果。

   - 让 `now` 为当前时间。

   - 并行运行这些步骤：

     - 等待直到 `req` 的完成标志被设置，或者 `this` 的超时属性不为 `0` 且自 `now` 以来的 `timeout` 毫秒已过。

     - 如果 `req` 的完成标志未设置，则设置 `this` 的超时标志并终止 `this` 的 Fetch 控制器。

     - 否则，如果 `this` 的同步标志被设置：

       - 让 `processedResponse` 为 `false`。

       - 让 `processResponseConsumeBody`（给定 `response` 和 `nullOrFailure

OrBytes`）为这些步骤：

         - 如果 `nullOrFailureOrBytes` 不是失败，则设置 `this` 的响应为 `response`。

         - 如果 `nullOrFailureOrBytes` 是字节序列，则将 `nullOrFailureOrBytes` 附加到 `this` 的接收字节中。

         - 设置 `processedResponse` 为 `true`。

       - 设置 `this` 的 Fetch 控制器为使用 `processResponseConsumeBody` 设置为 `processResponseConsumeBody` 和 `useParallelQueue` 设置为 `true` 的 `fetch` 结果。

       - 让 `now` 为当前时间。

       - 暂停，直到 `processedResponse` 为 `true` 或 `this` 的超时属性不为 `0` 且自 `now` 以来的 `timeout` 毫秒已过。

       - 如果 `processedResponse` 为 `false`，则设置 `this` 的超时标志并终止 `this` 的 Fetch 控制器。

   - 记录 `this` 的 Fetch 控制器的时间。

   - 运行处理响应结束的步骤。

9. **处理响应结束**

   处理 XMLHttpRequest 对象 `xhr` 的响应结束的步骤：

   - 处理 `xhr` 的错误。

   - 如果 `xhr` 的响应是网络错误，则返回。

   - 让 `transmitted` 为 `xhr` 的接收字节的长度。

   - 让 `length` 为从 `this` 的响应的头部列表中提取长度的结果。

   - 如果 `length` 不是整数，则将其设置为 `0`。

   - 如果 `xhr` 的同步标志未设置，则在 `xhr` 上触发一个名为 `progress` 的进度事件，附带 `transmitted` 和 `length`。

   - 设置 `xhr` 的状态为完成（done）。

   - 取消 `xhr` 的 `send()` 标志。

   - 在 `xhr` 上触发一个名为 `readystatechange` 的事件。

   - 在 `xhr` 上触发一个名为 `load` 的进度事件，附带 `transmitted` 和 `length`。

   - 在 `xhr` 上触发一个名为 `loadend` 的进度事件，附带 `transmitted` 和 `length`。

10. **处理错误**

    处理 XMLHttpRequest 对象 `xhr` 的错误的步骤：

    - 如果 `xhr` 的 `send()` 标志未设置，则返回。

    - 如果 `xhr` 的超时标志已设置，则运行请求错误的步骤，事件为 `timeout`，并抛出 `"TimeoutError"` DOMException。

    - 否则，如果 `xhr` 的响应的中止标志已设置，则运行请求错误的步骤，事件为 `abort`，并抛出 `"AbortError"` DOMException。

    - 否则，如果 `xhr` 的响应是网络错误，则运行请求错误的步骤，事件为 `error`，并抛出 `"NetworkError"` DOMException。

    **请求错误步骤：**

    - 设置 `xhr` 的状态为完成（done）。

    - 取消 `xhr` 的 `send()` 标志。

    - 将 `xhr` 的响应设置为网络错误。

    - 如果 `xhr` 的同步标志被设置，则抛出异常。

    - 在 `xhr` 上触发一个名为 `readystatechange` 的事件。

    - 如果 `xhr` 的上传完成标志未设置，则：

      - 设置 `xhr` 的上传完成标志。

      - 如果 `xhr` 的上传监听器标志被设置，则：

        - 在 `xhr` 的上传对象上触发一个名为 `event` 的进度事件，附带 `0` 和 `0`。

        - 在 `xhr` 的上传对象上触发一个名为 `loadend` 的进度事件，附带 `0` 和 `0`。

        - 在 `xhr` 上触发一个名为 `event` 的进度事件，附带 `0` 和 `0`。

        - 在 `xhr` 上触发一个名为 `loadend` 的进度事件，附带 `0` 和 `0`。

### 3.5.7. `abort()` 方法

```javascript
client.abort()
```

取消任何网络活动。

`abort()` 方法的步骤如下：

1. **中止 Fetch 控制器**

   中止 `this` 的 Fetch 控制器。

2. **状态检查**

   如果 `this` 的状态是打开（opened），并且 `this` 的 `send()` 标志已设置、接收到头部（headers received），或正在加载中（loading），则：

   - 运行请求错误的步骤并中止请求。

3. **处理已完成状态**

   如果 `this` 的状态是完成（done），则：

   - 将 `this` 的状态设置为未发送（unsent）。

   - 将 `this` 的响应设置为网络错误（network error）。

4. **事件**

   - 不会触发 `readystatechange` 事件。

### 3.6. 响应

#### 3.6.1. `responseURL` 获取器

- **获取器步骤**: 如果 `this` 的响应的 URL 为 `null`，则返回空字符串；否则，返回其序列化形式，排除片段标志（exclude fragment flag）已设置。

#### 3.6.2. `status` 获取器

- **获取器步骤**: 返回 `this` 的响应的状态。

#### 3.6.3. `statusText` 获取器

- **获取器步骤**: 返回 `this` 的响应的状态消息。

#### 3.6.4. `getResponseHeader(name)` 方法

- **方法步骤**: 返回从 `this` 的响应的头部列表中获取指定 `name` 的结果。

  Fetch 标准会过滤 `this` 的响应的头部列表。[FETCH]

  **示例**:
  ```javascript
  var client = new XMLHttpRequest();
  client.open("GET", "unicorns-are-awesome.txt", true);
  client.send();
  client.onreadystatechange = function() {
    if (this.readyState == this.HEADERS_RECEIVED) {
      print(client.getResponseHeader("Content-Type"));
    }
  }
  ```
  `print()` 函数将处理类似的内容：
  ```
  text/plain; charset=UTF-8
  ```

#### 3.6.5. `getAllResponseHeaders()` 方法

- **方法步骤**:
  - 创建一个空的字节序列 `output`。
  - 使用 `sort` 和 `combine` 处理 `this` 的响应的头部列表得到 `initialHeaders`。
  - 按照字节的升序对 `initialHeaders` 进行排序，得到 `headers`。
  - 对于每个 `header`，将其名称、一个 0x3A 0x20 字节对、其值、以及 0x0D 0x0A 字节对追加到 `output`。
  - 返回 `output`。

  Fetch 标准会过滤 `this` 的响应的头部列表。[FETCH]

  **示例**:
  ```javascript
  var client = new XMLHttpRequest();
  client.open("GET", "narwhals-too.txt", true);
  client.send();
  client.onreadystatechange = function() {
    if (this.readyState == this.HEADERS_RECEIVED) {
      print(this.getAllResponseHeaders());
    }
  }
  ```
  `print()` 函数将处理类似的内容：
  ```
  connection: Keep-Alive
  content-type: text/plain; charset=utf-8
  date: Sun, 24 Oct 2004 04:58:38 GMT
  keep-alive: timeout=15, max=99
  server: Apache/1.3.31 (Unix)
  transfer-encoding: chunked
  ```

  ### 3.6.6. 响应体

#### 获取响应 MIME 类型

- **步骤**:
  1. 从 `xhr` 的响应头部列表中提取 MIME 类型，存储为 `mimeType`。
  2. 如果 `mimeType` 提取失败，则将 `mimeType` 设置为 `text/xml`。
  3. 返回 `mimeType`。

#### 获取最终 MIME 类型

- **步骤**:
  1. 如果 `xhr` 的覆盖 MIME 类型为 `null`，返回获取响应 MIME 类型的结果。
  2. 否则，返回 `xhr` 的覆盖 MIME 类型。

#### 获取最终编码

- **步骤**:
  1. 设置 `label` 为 `null`。
  2. 获取 `xhr` 的响应 MIME 类型，存储为 `responseMIME`。
  3. 如果 `responseMIME` 的参数 `"charset"` 存在，则将 `label` 设置为该参数。
  4. 如果 `xhr` 的覆盖 MIME 类型的参数 `"charset"` 存在，则将 `label` 设置为该参数。
  5. 如果 `label` 为 `null`，返回 `null`。
  6. 从 `label` 中获取编码，存储为 `encoding`。
  7. 如果编码获取失败，返回 `null`。
  8. 返回 `encoding`。

  **注意**: 上述步骤故意不使用获取最终 MIME 类型的步骤，以保持与 Web 兼容性。

#### 设置文档响应

- **步骤**:
  1. 如果 `xhr` 的响应体为 `null`，则返回。
  2. 获取 `xhr` 的最终 MIME 类型，存储为 `finalMIME`。
  3. 如果 `finalMIME` 不是 HTML MIME 类型或 XML MIME 类型，则返回。
  4. 如果 `xhr` 的响应类型为空字符串，且 `finalMIME` 为 HTML MIME 类型，则返回。
     - 限制为 `xhr` 的响应类型为 "document"，以避免破坏遗留内容。
  5. 如果 `finalMIME` 为 HTML MIME 类型:
     - 获取 `charset`，如果为 `null`，则预扫描 `xhr` 的接收字节的前 1024 字节，如果这一步没有失败，则将 `charset` 设置为结果。
     - 如果 `charset` 仍为 `null`，将 `charset` 设置为 UTF-8。
     - 使用 HTML 标准的 HTML 解析器（禁用脚本），以 `charset` 为已知确定编码，解析 `xhr` 的接收字节，得到 `document`。
     - 将 `document` 标记为 HTML 文档。
  6. 否则:
     - 使用 XML 解析器（禁用 XML 脚本支持）解析 `xhr` 的接收字节，得到 `document`。如果解析失败（如不支持的字符编码、命名空间格式错误等），则返回 `null`。
     - 不会加载引用的资源，也不会应用关联的 XSLT。
     - 如果 `charset` 为 `null`，将 `charset` 设置为 UTF-8。
     - 设置 `document` 的编码为 `charset`。
     - 设置 `document` 的内容类型为 `finalMIME`。
     - 设置 `document` 的 URL 为 `xhr` 的响应的 URL。
     - 设置 `document` 的来源为 `xhr` 的相关设置对象的来源。
     - 将 `xhr` 的响应对象设置为 `document`。

#### 获取文本响应

- **步骤**:
  1. 如果 `xhr` 的响应体为 `null`，则返回空字符串。
  2. 获取 `charset`。
  3. 如果 `xhr` 的响应类型为空字符串，且 `charset` 为 `null`，并且获取的最终 MIME 类型为 XML MIME 类型，则使用 XML 规范中的规则来确定编码。将 `charset` 设置为确定的编码。
     - 限制为 `xhr` 的响应类型为空字符串，以保持非遗留的响应类型值 "text" 简单。
  4. 如果 `charset` 为 `null`，则将 `charset` 设置为 UTF-8。
  5. 返回使用回退编码 `charset` 解码 `xhr` 的接收字节的结果。

  **建议**: 作者应始终使用 UTF-8 编码他们的资源。

  ### 3.6.7. `overrideMimeType()` 方法

- **功能**: 将响应的 `Content-Type` 头部的值视为 `mime`。它不会实际更改头部。

- **步骤**:
  1. 如果当前状态为加载中 (`loading`) 或完成 (`done`)，则抛出一个 "InvalidStateError" DOMException。
  2. 将 `this` 的覆盖 MIME 类型设置为解析 `mime` 的结果。
  3. 如果 `this` 的覆盖 MIME 类型解析失败，则将其设置为 `application/octet-stream`。

### 3.6.8. `responseType` 获取器和设置器

- **功能**: 返回或设置响应类型。

- **可用值**:
  - 为空字符串（默认）
  - `"arraybuffer"`
  - `"blob"`
  - `"document"`
  - `"json"`
  - `"text"`

- **设置步骤**:
  1. 如果当前全局对象不是 `Window` 对象且给定值为 `"document"`，则返回。
  2. 如果当前状态为加载中 (`loading`) 或完成 (`done`)，则抛出一个 "InvalidStateError" DOMException。
  3. 如果当前全局对象是 `Window` 对象且同步标志被设置，则抛出一个 "InvalidAccessError" DOMException。
  4. 将 `this` 的响应类型设置为给定值。

- **获取步骤**:
  1. 返回 `this` 的响应类型。

### 3.6.9. `response` 获取器

- **功能**: 返回响应体。

- **步骤**:
  1. 如果 `this` 的响应类型为空字符串或 `"text"`，则:
     - 如果状态不是加载中 (`loading`) 或完成 (`done`)，则返回空字符串。
     - 返回获取文本响应的结果。
  2. 如果状态不是完成 (`done`)，则返回 `null`。
  3. 如果 `this` 的响应对象为失败，返回 `null`。
  4. 如果 `this` 的响应对象非空，则返回它。
  5. 如果 `this` 的响应类型为 `"arraybuffer"`:
     - 将 `this` 的响应对象设置为表示接收字节的新 `ArrayBuffer` 对象。如果分配 `ArrayBuffer` 对象失败，则将 `this` 的响应对象设置为失败并返回 `null`。
  6. 如果 `this` 的响应类型为 `"blob"`:
     - 将 `this` 的响应对象设置为表示接收字节的新 `Blob` 对象，类型设置为获取最终 MIME 类型的结果。
  7. 如果 `this` 的响应类型为 `"document"`:
     - 设置 `this` 的文档响应。
  8. 否则:
     - 确保 `this` 的响应类型为 `"json"`。
     - 如果 `this` 的响应体为 `null`，则返回 `null`。
     - 将 `this` 的响应对象设置为解析自接收字节的 JSON 对象。如果解析 JSON 失败，则返回 `null`。
     - 返回 `this` 的响应对象。

### 3.6.10. `responseText` 获取器

- **功能**: 返回响应体的文本形式。

- **抛出异常**: 如果 `responseType` 不是空字符串或 `"text"`，则抛出一个 "InvalidStateError" DOMException。

- **步骤**:
  1. 如果 `this` 的响应类型不是空字符串或 `"text"`，则抛出一个 "InvalidStateError" DOMException。
  2. 如果状态不是加载中 (`loading`) 或完成 (`done`)，则返回空字符串。
  3. 返回获取文本响应的结果。

### 3.6.11. `responseXML` 获取器

- **功能**: 返回响应体作为文档对象。

- **抛出异常**: 如果 `responseType` 不是空字符串或 `"document"`，则抛出一个 "InvalidStateError" DOMException。

- **步骤**:
  1. 如果 `this` 的响应类型不是空字符串或 `"document"`，则抛出一个 "InvalidStateError" DOMException。
  2. 如果状态不是完成 (`done`)，则返回 `null`。
  3. 确保 `this` 的响应对象不是失败。
  4. 如果 `this` 的响应对象非空，则返回它。
  5. 设置 `this` 的文档响应。
  6. 返回 `this` 的响应对象。

### 3.7. 事件摘要

这部分是非规范性的，列出了在 `XMLHttpRequest` 或 `XMLHttpRequestUpload` 对象上调度的事件：

| 事件名       | 接口           | 触发条件                                           |
|--------------|----------------|----------------------------------------------------|
| `readystatechange` | `Event`        | `readyState` 属性值发生变化，但不包括变化到 `UNSENT`。 |
| `loadstart`   | `ProgressEvent` | 请求初始化。                                       |
| `progress`    | `ProgressEvent` | 传输数据时。                                       |
| `abort`       | `ProgressEvent` | 请求被中止，例如通过调用 `abort()` 方法。            |
| `error`       | `ProgressEvent` | 请求失败。                                         |
| `load`        | `ProgressEvent` | 请求成功。                                         |
| `timeout`     | `ProgressEvent` | 请求在指定时间内未完成。                          |
| `loadend`     | `ProgressEvent` | 请求完成（成功或失败）。                          |

### 4. `FormData` 接口

#### `FormDataEntryValue` 类型
`FormDataEntryValue` 可以是 `File` 对象或 `USVString` 字符串。

#### `FormData` 接口定义
- **构造函数**: `FormData(optional HTMLFormElement form, optional HTMLElement? submitter = null)`

  - **参数**:
    - `form` (可选): 表单元素。
    - `submitter` (可选): 提交表单的元素，通常是一个 `<button>` 或 `<input>`。

- **方法**:
  - `undefined append(USVString name, USVString value)`
  - `undefined append(USVString name, Blob blobValue, optional USVString filename)`
    - 添加一个新条目到 `FormData` 对象的条目列表。
  - `undefined delete(USVString name)`
    - 从 `FormData` 对象的条目列表中删除所有指定名称的条目。
  - `FormDataEntryValue? get(USVString name)`
    - 获取 `FormData` 对象中第一个匹配指定名称的条目的值。
  - `sequence<FormDataEntryValue> getAll(USVString name)`
    - 获取 `FormData` 对象中所有匹配指定名称的条目的值，按顺序返回。
  - `boolean has(USVString name)`
    - 判断 `FormData` 对象中是否存在指定名称的条目。
  - `undefined set(USVString name, USVString value)`
  - `undefined set(USVString name, Blob blobValue, optional USVString filename)`
    - 用新的条目替换 `FormData` 对象中所有指定名称的条目，或如果不存在则添加新的条目。
  - `iterable<USVString, FormDataEntryValue>`
    - 迭代 `FormData` 对象的条目列表，其中每个条目由名称和对应的值组成。

#### `FormData` 构造函数的步骤
1. 如果提供了 `form` 参数：
   - 如果提供了 `submitter` 参数：
     - 如果 `submitter` 不是提交按钮，抛出 `TypeError`。
     - 如果 `submitter` 的表单所有者与 `form` 不匹配，抛出 `NotFoundError` DOMException。
   - 构建表单和提交者的条目列表。
   - 如果条目列表为 `null`，抛出 `InvalidStateError` DOMException。
   - 将 `this` 的条目列表设置为构建的列表。

#### 方法详细步骤
- **`append(name, value)` 和 `append(name, blobValue, filename)`**:
  - 选择 `value` 或 `blobValue` 作为条目值。
  - 使用 `name`, `value`, 和可选的 `filename` 创建一个条目。
  - 将条目添加到 `this` 的条目列表中。

- **`delete(name)`**:
  - 从 `this` 的条目列表中删除所有指定名称的条目。

- **`get(name)`**:
  - 如果没有条目匹配指定名称，则返回 `null`。
  - 返回第一个匹配名称的条目的值。

- **`getAll(name)`**:
  - 如果没有条目匹配指定名称，则返回空列表。
  - 返回所有匹配名称的条目值，按顺序排列。

- **`has(name)`**:
  - 如果存在指定名称的条目，则返回 `true`；否则返回 `false`。

- **`set(name, value)` 和 `set(name, blobValue, filename)`**:
  - 选择 `value` 或 `blobValue` 作为条目值。
  - 使用 `name`, `value`, 和可选的 `filename` 创建一个条目。
  - 如果存在匹配名称的条目，则用新的条目替换第一个匹配的条目，并删除其他条目。
  - 如果没有匹配名称的条目，则将新的条目添加到列表中。

#### 迭代
- 迭代 `FormData` 对象的条目列表时，条目键是名称，值是条目值。

### 5. `ProgressEvent` 接口

#### `ProgressEvent` 接口定义
- **构造函数**: `ProgressEvent(DOMString type, optional ProgressEventInit eventInitDict = {})`

  - **参数**:
    - `type`: 事件类型。
    - `eventInitDict` (可选): 事件初始化参数。

- **属性**:
  - `readonly attribute boolean lengthComputable`
    - 指示是否能够计算进度的总长度。
  - `readonly attribute unsigned long long loaded`
    - 已加载的字节数。
  - `readonly attribute unsigned long long total`
    - 总字节数（如果可以计算长度的话）。

#### `ProgressEventInit` 字典
- **属性**:
  - `boolean lengthComputable = false`
    - 是否能够计算总长度。
  - `unsigned long long loaded = 0`
    - 已加载的字节数。
  - `unsigned long long total = 0`
    - 总字节数。

#### 事件触发步骤
要在目标上触发一个 `ProgressEvent` 类型的事件 `e`，给定 `transmitted` 和 `length`，步骤如下：
1. 在目标上触发事件 `e`，使用 `ProgressEvent` 接口。
2. 将 `loaded` 属性初始化为 `transmitted`。
3. 如果 `length` 不为 0，将 `lengthComputable` 属性初始化为 `true`，并将 `total` 属性初始化为 `length`。

#### 建议的事件类型名称
以下是使用 `ProgressEvent` 接口的事件类型名称和描述：
- **`loadstart`**: 进度开始。只触发一次，通常是第一个事件。
- **`progress`**: 进度进行中。可以触发一次或多次，在 `loadstart` 之后。
- **`error`**: 进度失败。可以触发零次或一次，与 `progress` 事件互斥。
- **`abort`**: 进度终止。
- **`timeout`**: 进度因时间过期而终止。
- **`load`**: 进度成功。
- **`loadend`**: 进度停止。只触发一次，在 `error`、`abort`、`timeout` 或 `load` 事件之后。

`error`、`abort`、`timeout` 和 `load` 事件类型互斥。

#### 安全考虑
对于跨域请求，必须使用某种选择机制，例如 `Fetch` 标准中定义的 CORS 协议，在触发 `ProgressEvent` 事件之前，这样可以避免泄露无法通过其他方式获取的信息（例如，资源的大小）。

#### 示例代码
以下示例展示了如何使用 `XMLHttpRequest`、`ProgressEvent` 和 HTML 的 `<progress>` 元素来显示资源获取的进度：

```html
<!DOCTYPE html>
<title>Waiting for Magical Unicorns</title>
<progress id="p"></progress>
<script>
  var progressBar = document.getElementById("p"),
      client = new XMLHttpRequest();

  client.open("GET", "magical-unicorns");
  
  client.onprogress = function(pe) {
    if (pe.lengthComputable) {
      progressBar.max = pe.total;
      progressBar.value = pe.loaded;
    }
  };

  client.onloadend = function(pe) {
    progressBar.value = pe.loaded;
  };

  client.send();
</script>
```

### 解释
- **`onprogress` 事件处理**: 当进度发生变化时，更新进度条的最大值和当前值。
- **`onloadend` 事件处理**: 当请求结束时，更新进度条的当前值。

完整的实现可能会处理更多场景，例如网络错误或用户终止请求。

# 参考资料

https://xhr.spec.whatwg.org/

* any list
{:toc}