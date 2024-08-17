---
layout: post
title: http request-01-XMLHttpRequest XHR 简单介绍
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

# chat

## XHR 的官方学习资料 给出网址

以下是一些官方学习 `XMLHttpRequest` (XHR) 的资源网址：

1. **MDN Web Docs - XMLHttpRequest**
   - [MDN XMLHttpRequest Documentation](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
   - 这是最权威和详细的 XHR 文档，提供了关于如何使用 `XMLHttpRequest` 的全面介绍，包括属性、方法、事件和示例代码。

2. **WhatWG - XMLHttpRequest Standard**
   - [WhatWG XMLHttpRequest Standard](https://xhr.spec.whatwg.org/)
   - WhatWG 的标准文档详细描述了 `XMLHttpRequest` 的规范和实现细节，是了解其正式标准的良好资源。

3. **W3C - XMLHttpRequest Level 2 Specification**
   - [W3C XMLHttpRequest Level 2](https://www.w3.org/TR/XMLHttpRequest2/)
   - W3C 的规范文档提供了 `XMLHttpRequest` Level 2 的详细描述，包括新增的功能和改进。

这些资源将帮助你深入理解 `XMLHttpRequest` 的功能、用法和规范。

## 详细介绍一下 XHR

`XMLHttpRequest`（XHR）是一个用于在客户端和服务器之间进行异步 HTTP 请求的 API，广泛用于动态更新网页内容，而无需重新加载整个页面。

尽管它最初是为了处理 XML 数据而设计的，但它现在支持多种数据格式，并已成为 Web 开发中重要的工具。

### 1. **基本概念**

`XMLHttpRequest` 提供了在客户端（如浏览器）与服务器之间进行异步通信的能力，使得网页可以在不重新加载页面的情况下更新内容。

它的主要用途包括动态加载数据、提交表单以及与服务器进行实时交互。

### 2. **核心方法和属性**

#### 2.1 创建请求

```javascript
const xhr = new XMLHttpRequest();
```

#### 2.2 配置请求

- **open(method, url, async, user, password)**: 初始化请求。
  - `method`: HTTP 方法（如 `GET`、`POST`）。
  - `url`: 请求的 URL。
  - `async`: 是否异步（`true` 或 `false`）。
  - `user` 和 `password`: 可选的身份验证信息。

```javascript
xhr.open('GET', 'https://example.com/data', true);
```

#### 2.3 发送请求

- **send(body)**: 发送请求。`body` 参数用于发送数据（对于 `GET` 请求，通常为空）。

```javascript
xhr.send();
```

#### 2.4 事件处理

- **onload**: 请求成功完成时触发。
- **onerror**: 请求失败时触发。
- **onprogress**: 请求进度更新时触发（适用于进度监控）。
- **onabort**: 请求被取消时触发。
- **onreadystatechange**: 请求状态改变时触发。

```javascript
xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 300) {
    console.log(xhr.responseText);
  } else {
    console.error('Request failed with status:', xhr.status);
  }
};

xhr.onerror = function() {
  console.error('Request error');
};
```

#### 2.5 重要属性

- **readyState**: 请求的当前状态（0: UNSENT, 1: OPENED, 2: HEADERS_RECEIVED, 3: LOADING, 4: DONE）。
- **status**: HTTP 响应状态码（如 200、404、500）。
- **statusText**: 响应状态文本。
- **responseText**: 响应的文本内容。
- **responseXML**: 响应的 XML 文档（如果 `Content-Type` 是 `application/xml` 或 `text/xml`）。
- **response**: 根据响应类型（如 `ArrayBuffer`、`Blob`）返回的响应数据。

### 3. **使用示例**

#### 3.1 简单 GET 请求

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts/1', true);
xhr.onload = function() {
  if (xhr.status === 200) {
    console.log('Response:', xhr.responseText);
  } else {
    console.error('Error:', xhr.status, xhr.statusText);
  }
};
xhr.send();
```

#### 3.2 POST 请求

```javascript
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://jsonplaceholder.typicode.com/posts', true);
xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
xhr.onload = function() {
  if (xhr.status === 201) {
    console.log('Created:', xhr.responseText);
  } else {
    console.error('Error:', xhr.status, xhr.statusText);
  }
};
const data = JSON.stringify({ title: 'foo', body: 'bar', userId: 1 });
xhr.send(data);
```

#### 3.3 进度监控

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts/1', true);
xhr.onprogress = function(event) {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    console.log('Progress:', percentComplete.toFixed(2) + '%');
  }
};
xhr.onload = function() {
  if (xhr.status === 200) {
    console.log('Response:', xhr.responseText);
  } else {
    console.error('Error:', xhr.status, xhr.statusText);
  }
};
xhr.send();
```

### 4. **优缺点**

#### 4.1 优点

- **广泛支持**: 兼容大多数浏览器，包括较早版本。
- **灵活性**: 支持多种 HTTP 方法和请求体格式。
- **进度监控**: 能够监控请求的进度和状态变化。

#### 4.2 缺点

- **复杂性**: 处理异步操作和错误处理可能比较复杂，特别是嵌套的回调函数（“回调地狱”）。
- **现代替代品**: 比如 `fetch` API 提供了更简洁的语法和更强大的功能，例如流处理和更好的错误处理。

### 5. **现代替代**

`XMLHttpRequest` 的一些功能和用途已经被更现代的 `fetch` API 所取代。`fetch` 提供了更简洁的语法、支持 Promise 和流处理，使得异步操作和错误处理更为直观。

### 总结

`XMLHttpRequest` 是一种强大的 API，能够进行异步 HTTP 请求并处理响应。

尽管现代开发中 `fetch` API 提供了更先进的功能，但 `XMLHttpRequest` 仍然在许多现有应用中得到广泛使用。

理解它的工作原理和用法对于处理遗留系统和兼容性问题依然很重要。

## XHR 为什么需要？解决了什么问题

`XMLHttpRequest` (XHR) 是一种用于在浏览器和服务器之间进行异步通信的 API。它在 Web 开发中解决了多个关键问题，特别是在用户体验和动态网页更新方面。

以下是 `XMLHttpRequest` 需要的原因及其解决的问题：

### 1. **页面异步更新**

#### 问题
- **传统的网页请求**: 每次需要从服务器获取新数据或提交数据时，整个页面必须重新加载。这种方式会导致用户体验不流畅，页面刷新较慢。

#### 解决方案
- **XHR 的异步请求**: 允许网页在不重新加载整个页面的情况下，从服务器获取数据并更新部分页面内容。这使得网页可以实现局部更新，而不是每次都刷新整个页面，从而提高了用户体验和响应速度。

### 2. **提高用户体验**

#### 问题
- **页面停顿**: 在传统的同步请求中，用户必须等待整个请求和响应过程完成，这可能导致页面停顿或冻结。

#### 解决方案
- **异步处理**: `XMLHttpRequest` 通过异步处理请求，允许浏览器在发出请求时继续执行其他操作，不会阻塞用户界面的交互。这样，用户可以继续与网页进行交互，而不会受到请求等待的影响。

### 3. **动态内容加载**

#### 问题
- **静态网页内容**: 在没有异步请求的情况下，网页内容通常是静态的，所有内容都在页面加载时获取。

#### 解决方案
- **动态内容加载**: 通过 `XMLHttpRequest`，网页可以在运行时动态加载数据，并根据需要更新内容。比如，用户滚动到页面底部时自动加载更多数据（如无限滚动），或者基于用户输入实时更新搜索结果。

### 4. **后台数据处理**

#### 问题
- **用户交互时的数据提交**: 用户在填写表单时，数据提交通常会导致页面重新加载，影响用户体验。

#### 解决方案
- **表单提交**: 使用 `XMLHttpRequest` 可以在不刷新页面的情况下提交表单数据。这使得用户可以在不离开当前页面的情况下完成数据提交和处理。

### 5. **局部更新和请求管理**

#### 问题
- **整体更新难度**: 如果需要对部分页面内容进行更新，传统方法通常需要复杂的页面重载和数据处理。

#### 解决方案
- **局部更新**: `XMLHttpRequest` 允许通过指定的 URL 和请求方法，只更新页面的某一部分内容。这简化了局部更新的实现，并减少了对服务器的负担。

### 6. **进度监控**

#### 问题
- **缺乏反馈**: 在传统请求中，用户无法获得请求进度的信息（如正在下载的进度）。

#### 解决方案
- **进度事件**: `XMLHttpRequest` 提供了 `onprogress` 事件，使得开发者可以实时监控请求的进度，并向用户提供反馈，例如显示下载进度条。

### 7. **与其他技术的兼容性**

#### 问题
- **旧版浏览器支持**: 在 `fetch` API 出现之前，许多旧版浏览器不支持现代的 HTTP 请求 API。

#### 解决方案
- **兼容性**: `XMLHttpRequest` 作为较早的标准，得到了广泛的浏览器支持，包括旧版浏览器。这使得它在需要兼容旧版浏览器的应用中仍然非常重要。

### 总结

`XMLHttpRequest` 解决了多个 Web 开发中的关键问题，包括异步更新页面内容、提高用户体验、动态加载数据、后台数据处理、局部更新、进度监控等。

尽管现代的 `fetch` API 提供了更现代化和简化的接口，但 `XMLHttpRequest` 仍然是 Web 开发中不可或缺的工具，特别是在处理兼容性和特定需求时。

## XHR 的适用场景，优缺点

`XMLHttpRequest`（XHR）在 Web 开发中有一些特定的适用场景，以及它的优点和缺点。

以下是一些实际应用场景和它们的优缺点，用更接地气的方式来解释：

### 适用场景

1. **动态内容更新**
   - **场景**: 当你希望在用户与网页交互时，动态更新页面的一部分内容，例如加载评论、文章或产品列表，而不需要重新加载整个页面。
   - **例子**: 社交媒体平台上的帖子加载，电商网站上的产品筛选。

2. **异步表单提交**
   - **场景**: 当用户填写表单并提交数据时，你希望在后台处理这些数据，而不刷新整个页面。
   - **例子**: 用户在评论框中输入内容并提交，数据直接上传到服务器，页面不会重载。

3. **局部数据刷新**
   - **场景**: 需要刷新网页的某个部分的数据，而不是整个页面。例如，实时更新价格或天气信息。
   - **例子**: 监控仪表板上更新服务器状态，新闻网站上实时更新新闻头条。

4. **进度反馈**
   - **场景**: 需要监控和展示文件上传或下载的进度，让用户知道操作的进展。
   - **例子**: 文件上传表单，下载大文件时显示进度条。

5. **旧版浏览器兼容**
   - **场景**: 如果你的应用需要支持旧版浏览器，它可能不支持现代的 `fetch` API，但支持 `XMLHttpRequest`。
   - **例子**: 针对使用老旧设备或浏览器的用户群体的应用。

### 优点

1. **广泛支持**
   - **优点**: 几乎所有的浏览器都支持 `XMLHttpRequest`，包括许多旧版浏览器。
   - **实际感受**: 你不需要担心用户的浏览器是否支持，因为它几乎能在所有环境中工作。

2. **灵活性**
   - **优点**: 支持多种 HTTP 方法（GET、POST、PUT、DELETE 等），并且能够处理不同格式的响应数据。
   - **实际感受**: 可以用来做各种各样的请求，比如从服务器获取 JSON 数据或发送表单数据。

3. **进度监控**
   - **优点**: 提供 `onprogress` 事件，可以监控请求的进度。
   - **实际感受**: 你可以给用户提供下载或上传的实时进度，提升用户体验。

### 缺点

1. **复杂性**
   - **缺点**: 处理异步请求和响应可能会很复杂，尤其是在嵌套回调函数（“回调地狱”）的情况下。
   - **实际感受**: 编写代码时可能会变得混乱，不容易维护。

2. **没有内建的 Promise 支持**
   - **缺点**: 不像 `fetch` API，`XMLHttpRequest` 默认不支持 Promise，处理异步操作时需要使用回调函数。
   - **实际感受**: 需要额外的工作来处理异步操作，代码可能不够简洁。

3. **较少的功能扩展**
   - **缺点**: 与现代 API 比如 `fetch` 相比，`XMLHttpRequest` 在流处理和功能扩展方面有所限制。
   - **实际感受**: 如果需要更高级的功能，比如流式处理大文件，`XMLHttpRequest` 可能无法满足需求。

### 总结

`XMLHttpRequest` 是一个强大的工具，用于在网页中实现异步通信和动态内容更新。它特别适用于需要兼容旧版浏览器的场景，提供了广泛的支持和灵活性。

然而，它也有一些缺点，如代码复杂性和缺乏现代 API 的便利功能。

在现代开发中，`fetch` API 提供了更简洁的接口和更多的功能，但了解 `XMLHttpRequest` 的工作原理仍然很重要，特别是在处理兼容性问题时。

## XHR 的使用最佳实践

使用 `XMLHttpRequest` (XHR) 时，遵循一些最佳实践可以帮助你写出更高效、可靠和可维护的代码。以下是一些实际的最佳实践：

### 1. **使用异步请求**

- **实践**: 总是将 `XMLHttpRequest` 的 `async` 参数设置为 `true`，以便异步处理请求。
- **理由**: 异步请求不会阻塞用户界面，提高了用户体验。

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://example.com/data', true);
xhr.send();
```

### 2. **处理请求状态变化**

- **实践**: 使用 `onreadystatechange` 事件来处理请求的不同状态。确保检查 `readyState` 和 `status` 属性来确定请求是否成功完成。
- **理由**: `readyState` 提供了请求的当前状态，`status` 表示 HTTP 响应状态码，帮助你正确处理响应或错误。

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://example.com/data', true);
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) { // DONE
    if (xhr.status === 200) {
      console.log('Response:', xhr.responseText);
    } else {
      console.error('Error:', xhr.status, xhr.statusText);
    }
  }
};
xhr.send();
```

### 3. **设置适当的请求头**

- **实践**: 根据需要设置请求头（例如 `Content-Type`）。如果你发送 JSON 数据，确保设置 `Content-Type` 为 `application/json`。
- **理由**: 请求头可以影响服务器如何处理请求体，确保请求和响应数据格式的正确性。

```javascript
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://example.com/data', true);
xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
const data = JSON.stringify({ key: 'value' });
xhr.send(data);
```

### 4. **处理错误和超时**

- **实践**: 使用 `onerror` 事件处理网络错误，使用 `ontimeout` 处理超时情况。设置超时时间以防止请求挂起过久。
- **理由**: 错误处理可以提供更好的用户反馈和恢复机制，而超时处理可以避免长时间等待无响应的请求。

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://example.com/data', true);
xhr.timeout = 5000; // 设置超时时间为 5000 毫秒

xhr.ontimeout = function() {
  console.error('Request timed out');
};

xhr.onerror = function() {
  console.error('Request error');
};

xhr.onload = function() {
  if (xhr.status === 200) {
    console.log('Response:', xhr.responseText);
  }
};

xhr.send();
```

### 5. **监控进度**

- **实践**: 使用 `onprogress` 事件来监控请求的进度，尤其是处理大文件上传或下载时。
- **理由**: 进度反馈可以改善用户体验，让用户了解操作的进展。

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://example.com/largefile', true);
xhr.onprogress = function(event) {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    console.log('Progress:', percentComplete.toFixed(2) + '%');
  }
};
xhr.onload = function() {
  if (xhr.status === 200) {
    console.log('File downloaded successfully');
  }
};
xhr.send();
```

### 6. **避免回调地狱**

- **实践**: 使用清晰的回调结构或考虑使用 `Promises`（如果需要兼容性，可以用 `Promise` 封装 XHR）。虽然 XHR 本身不支持 `Promise`，但你可以创建自己的封装。
- **理由**: 清晰的回调结构或使用 `Promise` 可以提高代码的可读性和可维护性。

```javascript
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`Request failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = function() {
      reject(new Error('Network error'));
    };
    xhr.send();
  });
}

// 使用
fetchData('https://example.com/data')
  .then(response => console.log('Response:', response))
  .catch(error => console.error('Error:', error));
```

### 7. **处理不同数据格式**

- **实践**: 根据服务器响应的 `Content-Type` 处理数据。例如，如果响应是 JSON 格式，则调用 `responseText` 并使用 `JSON.parse` 解析。
- **理由**: 正确处理不同的数据格式确保数据解析的准确性。

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://example.com/data', true);
xhr.onload = function() {
  if (xhr.status === 200) {
    const contentType = xhr.getResponseHeader('Content-Type');
    if (contentType.includes('application/json')) {
      const data = JSON.parse(xhr.responseText);
      console.log('JSON data:', data);
    } else {
      console.log('Response:', xhr.responseText);
    }
  }
};
xhr.send();
```

### 8. **保持代码简洁**

- **实践**: 尽量保持 XHR 请求代码简洁，避免过多的嵌套和复杂逻辑。封装常用逻辑为函数可以提高可重用性。
- **理由**: 简洁的代码更易于维护和理解。

```javascript
function createRequest(method, url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback(null, xhr.responseText);
    } else {
      callback(new Error(`Request failed with status ${xhr.status}`));
    }
  };
  xhr.onerror = function() {
    callback(new Error('Network error'));
  };
  xhr.send();
}

// 使用
createRequest('GET', 'https://example.com/data', (error, response) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Response:', response);
  }
});
```

### 总结

遵循这些最佳实践可以帮助你在使用 `XMLHttpRequest` 时编写更高效、可靠和易于维护的代码。

虽然 `fetch` API 提供了更现代的接口，但了解和掌握 `XMLHttpRequest` 仍然在许多情况下很重要，尤其是在处理兼容性问题时。



# 参考资料

* any list
{:toc}