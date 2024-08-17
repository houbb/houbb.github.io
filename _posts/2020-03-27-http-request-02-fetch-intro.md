---
layout: post
title: Ajax 的替代方案-fetch
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

# fetch

跨网络异步获取资源的功能以前是使用XMLHttpRequest对象实现的，Fetch API提供了更好的替代方案，可以很容易的被其他技术使用（如Servise Workers）

fetch，说白了，就是XMLHttpRequest的一种替代方案。

如果有人问你，除了Ajax获取后台数据之外，还有没有其他的替代方案？

你就可以回答，除了XMLHttpRequest对象来获取后台的数据之外，还可以使用一种更优的解决方案fetch。

fetch的支持性还不是很好，但是在谷歌浏览器中已经支持了fetch

# 返回 promise

Fetch API提供了一个全局的fetch()方法，该方法会返回一个Promise

当fetch请求接收到一个代表错误的状态码时（如404、500），返回的Promise不会被标记为reject，而是被标记为resolve，但是会将response的ok属性设置为false。

只有当网络错误或请求被阻止时才会被标记为reject状态

```js
fetch('https://127.0.0.1/125.jpg').then(function(res){
  if(res.ok) {
    return res.blob();
  }else {
    console.log('服务器响应出错了'); // 资源404、服务器500等
  }
}).catch(function(err){
  console.log('Network response was not ok.'); // 网络出错
})
```

# fetch() 方法的两个参数

fetch()方法接收两个参数：第一个参数表示要获取的资源路径；第二个参数表示请求的配置项（可选）

```js
fetch('https://127.0.0.1/api/articles/1/3').then(function(res){
  if(res.ok) {
    return res.json();
  }
})

// 定义第二个参数
fetch('https://127.0.0.1/api/articles/1/3', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    token:'token'
  },
  cache: 'default',
  mode: 'cors',
}).then(function(res){
  if(res.ok) {
    return res.json();
  }
})
```

# 设置请求的头信息

在POST提交的过程中，一般是表单提交，可是，经过查询，发现默认的提交方式是：

`Content-Type:text/plain;charset=UTF-8`，这个显然是不合理的,改为 `application/x-www-form-urlencoded`

```js
fetch('https://www.baidu.com/search/error.html', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded' // 指定提交方式为表单提交
    }),
    body: new URLSearchParams([["foo", 1],["bar", 2]]).toString()
  })
  .then((res)=>{
    return res.text()
  })
  .then((res)=>{
    console.log(res)
  })
```

# 默认不使用 cookie

默认情况下, fetch 不会从服务端发送或接收任何 cookies，要发送 cookies，必须设置 credentials 选项

```js
fetch('http://127.0.0.1/search/name', {
  method: 'GET',
  credentials: 'include' // 强制加入凭据头
})
.then((res)=>{
  return res.text()
})
```

# GET请求及传参

GET请求中如果需要传递参数怎么办？

这个时候，只能把参数写在URL上来进行传递了。

```js
fetch('http://127.0.0.1/search?a=1&b=2', { // 在URL中写上传递的参数
    method: 'GET'
  })
  .then((res)=>{
    return res.text()
  })
```

# POST 请求及传参

POST请求的参数，放在第二个参数的body属性中

```js
fetch('http://127.0.0.1/searchs', { 
     method: 'POST',
    body: new URLSearchParams([["foo", 1],["bar", 2]]).toString() // 这里是请求对象
  })
  .then((res)=>{
    return res.text()
  })
```

POST提交改为application/x-www-form-urlencoded

```js
fetch('http://127.0.0.1/searchs', { 
  method: 'POST',
  headers: new Headers({
    'Content-Type': 'application/x-www-form-urlencoded' // 指定提交方式为表单提交
  }),
  body: new URLSearchParams([["foo", 1],["bar", 2]]).toString() // 这里是请求对象
})
.then((res)=>{
  return res.text()
})
```

# chat

## 给出 js fetch 的官方学习资料网址

以下是一些官方和权威的学习资料网址，可以帮助你深入了解 `fetch` API：

1. **MDN Web Docs - Fetch API**  
   [MDN Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)  
   - MDN 的 Fetch API 文档是最权威和详细的资源，涵盖了 API 的使用方法、参数、返回值、示例代码等。

2. **WhatWG - Fetch Standard**  
   [Fetch Standard](https://fetch.spec.whatwg.org/)  
   - WhatWG 是 `fetch` 标准的制定组织，该页面提供了 Fetch API 的规范文档，包括 API 的详细定义和实现细节。

3. **Google Developers - Fetch API Overview**  
   [Google Developers - Fetch API](https://developers.google.com/web/updates/2015/03/introduction-to-fetch)  
   - Google Developers 的页面提供了对 `fetch` API 的概述，并包括一些使用示例和性能考量。

4. **W3C - Fetch Living Standard**  
   [W3C Fetch Standard](https://www.w3.org/TR/fetch/)  
   - W3C 的 Fetch 标准页面提供了 Fetch API 的规范文档，适用于对 `fetch` API 的正式标准有深入了解的需求。

这些资源可以帮助你理解 `fetch` API 的设计理念、使用方法和规范细节。

## 详细介绍一下 js fetch

`fetch` 是 JavaScript 原生提供的一个用于进行 HTTP 请求的 API，用于替代传统的 `XMLHttpRequest` (XHR) 和第三方库（如 Axios）。`fetch` API 提供了更简洁、现代化的接口，使得处理网络请求更加直观和符合现代 JavaScript 编程风格。

### 基本用法

`fetch` 通过返回一个 `Promise` 来处理异步操作。最简单的用法如下：

```javascript
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // 或者 .text()，.blob()，.arrayBuffer()，.formData()
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
```

### 参数说明

`fetch` 的第一个参数是请求的 URL，第二个参数是一个可选的配置对象，用来定制请求的方式、头信息、请求体等。

```javascript
fetch(url, {
  method: 'POST', // 请求方法：GET, POST, PUT, DELETE等
  headers: {
    'Content-Type': 'application/json', // 请求头信息
    'Authorization': 'Bearer token', // 其他自定义头信息
  },
  body: JSON.stringify({
    key1: 'value1',
    key2: 'value2',
  }), // 请求体，仅在 POST 或 PUT 请求时使用
  credentials: 'include', // 控制是否发送cookies: 'omit', 'same-origin', 'include'
  cache: 'no-cache', // 控制缓存行为
  redirect: 'follow', // 控制重定向行为：follow, error, manual
})
```

### 响应处理

`fetch` API 的响应对象 (`Response`) 提供了多种方法来处理不同类型的响应数据：

- `response.json()`: 解析响应为 JSON 对象。
- `response.text()`: 解析响应为字符串。
- `response.blob()`: 解析响应为 Blob（用于处理二进制数据，如文件）。
- `response.arrayBuffer()`: 解析响应为 ArrayBuffer。
- `response.formData()`: 解析响应为 FormData 对象。

### 特性

1. **Promise-based**: `fetch` 使用 `Promise` 处理异步操作，简化了回调地狱的问题，并且易于链式调用。

2. **现代 API**: `fetch` 支持 `async`/`await` 语法，使得异步请求处理更加直观：

   ```javascript
   async function getData() {
     try {
       const response = await fetch('https://api.example.com/data');
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       const data = await response.json();
       console.log(data);
     } catch (error) {
       console.error('There was a problem with the fetch operation:', error);
     }
   }
   ```

3. **请求头和响应头**: 可以方便地设置请求头和读取响应头。

4. **请求方法支持**: `fetch` 支持所有常见的 HTTP 请求方法：`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, 等。

5. **CORS**: `fetch` 默认遵循跨域资源共享 (CORS) 的规定，确保请求安全性。

6. **无内置超时处理**: `fetch` 没有内置超时处理，开发者需要自行实现超时逻辑：

   ```javascript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 5000);

   fetch('https://api.example.com/data', { signal: controller.signal })
     .then(response => response.json())
     .then(data => console.log(data))
     .catch(error => console.error('Request timed out', error))
     .finally(() => clearTimeout(timeoutId));
   ```

### 缺点

1. **错误处理**: `fetch` 仅在网络故障或请求被取消时抛出错误。如果服务器返回 4xx 或 5xx 错误代码，`fetch` 不会抛出异常，开发者需要手动检查 `response.ok` 来判断请求是否成功。

2. **不支持进度监听**: `fetch` 不支持上传或下载进度的监听，这在处理大文件上传或下载时可能会有些不便。

3. **浏览器兼容性**: 尽管大多数现代浏览器都支持 `fetch`，但对于较旧的浏览器（如 IE），需要使用 polyfill 来提供兼容性支持。

### 总结

`fetch` 是一个功能强大且灵活的 API，适用于现代 Web 开发。

然而，由于它没有内置的超时处理、进度监听和自动错误处理等功能，可能在某些场景下不如第三方库（如 Axios）方便。

在选择使用 `fetch` 还是其他库时，应该根据具体项目需求进行权衡。

## 为什么需要 js fetch，解决了 ajax 的什么问题？

`fetch` API 是为了解决传统的 `XMLHttpRequest` (XHR) 在使用过程中存在的一些问题和局限性。

`fetch` 提供了一个更现代化和简洁的方式来进行网络请求。

以下是 `fetch` 解决的一些 AJAX 的问题：

### 1. **更简洁的 API 设计**

- **XHR**: 使用 `XMLHttpRequest` 进行网络请求时，需要编写相对复杂和冗长的代码来处理各种情况。

设置请求方法、URL、请求头、监听状态变化等都需要多个步骤。

  ```javascript
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.example.com/data', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log(JSON.parse(xhr.responseText));
    } else if (xhr.readyState === 4) {
      console.error('Request failed');
    }
  };
  xhr.send();
  ```

- **Fetch**: `fetch` 通过一个简单的函数调用来实现相同的功能，并且支持 `Promise`，代码更简洁和易读。

  ```javascript
  fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Request failed', error));
  ```

### 2. **基于 Promise 的设计**

- **XHR**: `XMLHttpRequest` 的回调方式容易导致“回调地狱”（回调嵌套过多，代码难以维护）。虽然可以使用 `Promise` 包装 XHR，但这是额外的工作量。

- **Fetch**: `fetch` 天生支持 `Promise`，使得处理异步操作更为自然和直观。它支持链式调用，可以很好地处理成功和错误的情况。结合 `async`/`await`，代码结构更加清晰。

  ```javascript
  async function getData() {
    try {
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Request failed', error);
    }
  }
  ```

### 3. **更好的流媒体支持**

- **XHR**: 对于处理流媒体或分块传输的数据，`XMLHttpRequest` 的处理方式较为复杂，需要手动操作数据块。

- **Fetch**: `fetch` API 更好地支持 `ReadableStream` 和流媒体。你可以直接处理流媒体响应，逐块读取数据，这在处理大型文件或长连接时非常有用。

  ```javascript
  fetch('https://example.com/stream')
    .then(response => {
      const reader = response.body.getReader();
      return reader.read();
    })
    .then(({ done, value }) => {
      if (!done) {
        console.log('Received chunk', value);
      }
    });
  ```

### 4. **内置的 JSON 处理**

- **XHR**: 使用 `XMLHttpRequest` 时，处理 JSON 数据需要手动解析。

  ```javascript
  const data = JSON.parse(xhr.responseText);
  ```

- **Fetch**: `fetch` 提供了 `response.json()` 方法，直接解析 JSON 数据，简化了代码。

  ```javascript
  fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data));
  ```

### 5. **默认行为更直观**

- **XHR**: 默认情况下，`XMLHttpRequest` 是异步的，但你必须显式地处理许多常见情况，比如跨域请求、超时等。

- **Fetch**: `fetch` 的默认行为更符合现代 Web 开发需求，如遵循 CORS 标准、默认不发送 cookies 等。你可以通过选项轻松配置这些行为。

### 6. **更好的错误处理**

- **XHR**: `XMLHttpRequest` 只有在网络错误或请求被阻止时会触发 `onerror`，但它无法区分不同类型的错误，也无法轻松处理 HTTP 状态码。

- **Fetch**: `fetch` 通过 `Promise` 进行错误处理，允许你更细粒度地控制请求的成功与失败。你可以轻松检查 HTTP 状态码并作出相应处理。

  ```javascript
  fetch('https://api.example.com/data')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => console.error('Fetch error:', error));
  ```

### 总结

`fetch` 通过更简洁的 API、原生的 `Promise` 支持、内置的 JSON 处理、更好的流媒体支持，以及更直观的默认行为，解决了 `XMLHttpRequest` 在使用上的诸多不便，适合现代 JavaScript 开发需求。

## fetch 的使用场景，有哪些优缺点？

### 使用场景

`fetch` API 在以下场景中非常适用：

1. **简单的 HTTP 请求**：
   - 当需要向服务器发送简单的 `GET`、`POST`、`PUT`、`DELETE` 请求时，`fetch` 是非常适合的选择。它简洁的语法使得处理这些请求变得直观。

2. **处理 JSON 数据**：
   - `fetch` 内置了 `response.json()` 方法，特别适合从 API 获取 JSON 数据，并将其解析为 JavaScript 对象。

3. **支持异步编程**：
   - 由于 `fetch` 基于 `Promise`，它适用于所有需要异步操作的场景，特别是在需要链式处理多个异步操作时，如连续的 API 请求。

4. **流媒体或大文件处理**：
   - `fetch` 可以用于处理流媒体响应或大文件下载，通过 `ReadableStream` 逐块处理数据而不是一次性加载全部内容，减少内存占用。

5. **跨域请求**：
   - `fetch` 默认遵循 CORS (Cross-Origin Resource Sharing) 规范，使其在处理跨域请求时更加安全和方便。

6. **与现代浏览器兼容**：
   - `fetch` 在现代浏览器中得到广泛支持，对于不需要支持老旧浏览器的应用，`fetch` 是一个理想选择。

### 优点

1. **简洁和现代化**：
   - `fetch` 的 API 设计简洁，代码更易读、维护性更高，符合现代 JavaScript 开发习惯。

2. **Promise-based**：
   - `fetch` 使用 `Promise`，支持 `async`/`await`，更容易处理异步代码，避免了回调地狱。

3. **更好的错误处理**：
   - 可以通过 `then` 和 `catch` 来细粒度地处理请求结果和错误。

4. **流式处理**：
   - 支持 `ReadableStream`，适合处理流媒体和大文件，能够逐步读取数据。

5. **灵活的配置**：
   - `fetch` 允许通过选项灵活配置请求方法、头信息、请求体、缓存行为、跨域策略等，满足不同的需求。

6. **内置 JSON 支持**：
   - 提供了 `response.json()` 等方法，简化了从服务器获取 JSON 数据并解析的流程。

### 缺点

1. **不支持进度监听**：
   - `fetch` 不支持上传或下载的进度监听，这在处理大文件上传或下载时可能不够理想。如果需要进度反馈，可能需要回到 `XMLHttpRequest` 或使用第三方库。

2. **没有内置超时处理**：
   - `fetch` 没有直接支持请求超时，开发者需要手动实现超时逻辑。这对于处理可能耗时过长的请求时增加了代码复杂性。

3. **不自动抛出 HTTP 错误**：
   - 当服务器返回 4xx 或 5xx 状态码时，`fetch` 不会自动抛出错误，开发者需要手动检查 `response.ok` 属性并抛出错误。这与很多开发者的预期不同。

4. **浏览器兼容性问题**：
   - 尽管大多数现代浏览器都支持 `fetch`，但是在较旧的浏览器（如 IE）中不支持，需要使用 polyfill 来保证兼容性。

5. **跨域请求中的复杂性**：
   - 在处理跨域请求时，`fetch` 严格遵循 CORS 规范，有时会导致与服务器的交互变得复杂。如果后端没有正确配置 CORS，会导致请求失败。

### 总结

`fetch` 是一个功能强大且现代化的 API，适用于大多数网络请求场景。

它的简洁性和与现代异步编程模式的兼容性使其在新项目中非常受欢迎。

然而，对于某些高级需求，如进度监听或老旧浏览器支持，可能仍需考虑使用 `XMLHttpRequest` 或第三方库。

## fetch 使用时的最佳实践？

使用 `fetch` API 时，遵循一些最佳实践可以帮助你编写更加健壮、可维护的代码。

以下是一些关键的最佳实践：

### 1. **处理 HTTP 状态码**
`fetch` 不会自动抛出 HTTP 错误（例如 404 或 500），需要手动检查 `response.ok` 来判断请求是否成功：

```javascript
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));
```

### 2. **设置超时**
`fetch` 没有内置超时机制。你可以使用 `AbortController` 来实现超时控制：

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

fetch('https://api.example.com/data', { signal: controller.signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.error('Fetch request timed out');
    } else {
      console.error('Fetch error:', error);
    }
  })
  .finally(() => clearTimeout(timeoutId));
```

### 3. **使用 `async`/`await`**
为了更直观地处理异步代码，使用 `async`/`await` 来替代 `then` 和 `catch`：

```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // 重新抛出错误以便上层处理
  }
}
```

### 4. **设置适当的请求头**
根据请求的内容类型，设置合适的请求头，特别是在 POST 或 PUT 请求中：

```javascript
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here',
  },
  body: JSON.stringify({ key: 'value' }),
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### 5. **处理不同类型的响应数据**
根据返回的数据类型使用适当的方法解析响应（JSON、文本、二进制等）：

```javascript
fetch('https://api.example.com/data')
  .then(response => {
    const contentType = response.headers.get('content-type');
    if (contentType.includes('application/json')) {
      return response.json();
    } else if (contentType.includes('text/plain')) {
      return response.text();
    } else if (contentType.includes('application/octet-stream')) {
      return response.blob();
    }
    throw new Error('Unsupported content type');
  })
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));
```

### 6. **使用 `Cache-Control` 头管理缓存**
对于需要控制缓存行为的请求，使用适当的 `Cache-Control` 头：

```javascript
fetch('https://api.example.com/data', {
  cache: 'no-cache', // 强制不使用缓存
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### 7. **处理跨域请求**
`fetch` 默认遵循 CORS 规范，确保在发起跨域请求时正确设置 `credentials` 选项（如发送 cookies）：

```javascript
fetch('https://api.example.com/data', {
  credentials: 'include', // 发送跨域请求时包含凭证
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### 8. **错误重试**
在请求失败时，特别是在网络不稳定或服务暂时不可用的情况下，进行重试操作：

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        throw error; // 最后一次失败后抛出错误
      }
      console.warn(`Retry ${i + 1}/${retries}`);
    }
  }
}
```

### 9. **使用 Polyfill 确保兼容性**
在需要支持老旧浏览器（如 IE）的项目中，使用 `fetch` polyfill 以确保兼容性：

```javascript
import 'whatwg-fetch'; // 安装并引入 fetch 的 polyfill
```

### 10. **响应和请求的流式处理**
当需要逐步处理响应或发送数据时，使用 `ReadableStream` 和 `WritableStream` 进行流式处理：

```javascript
fetch('https://api.example.com/stream')
  .then(response => {
    const reader = response.body.getReader();
    return new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    });
  })
  .then(stream => new Response(stream))
  .then(response => response.blob())
  .then(blob => console.log(blob));
```

### 总结

遵循这些最佳实践可以帮助你在使用 `fetch` 时避免常见陷阱，并确保你的代码在不同场景下的可靠性和可维护性。

## 如果让你深入学习 fetch, 你会问哪10个问题？为什么

如果要深入学习 `fetch`，以下是我会考虑的 10 个关键问题，以及它们背后的原因：

## 1. **`fetch` 如何处理 HTTP 状态码，特别是错误状态码？**
   - **原因**: 了解 `fetch` 如何处理 HTTP 状态码有助于更好地管理错误处理流程，避免潜在的错误被忽略。

`fetch` API 处理 HTTP 状态码的方式与传统的 `XMLHttpRequest` 有所不同。`fetch` 在收到 HTTP 响应时，不会自动抛出错误，即使状态码表示请求失败（如 404 或 500）。相反，它会返回一个 `Promise`，该 `Promise` 总是被标记为已解决（resolved），无论 HTTP 状态码是什么。这意味着你需要手动检查响应的状态码，以判断请求是否成功。

### 基本处理方式

以下是使用 `fetch` 时处理 HTTP 状态码的基本方法：

```javascript
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      // 如果 HTTP 状态码不在 200-299 范围内，认为请求失败
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // 如果请求成功，解析 JSON 数据
  })
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));
```

### `response.ok` 属性

`response.ok` 是一个布尔值，当 HTTP 状态码在 200 到 299 之间时，它的值为 `true`，表示请求成功；否则为 `false`。

- `response.status`: 返回 HTTP 状态码，如 200, 404, 500 等。
- `response.statusText`: 返回与状态码对应的文本描述，如 "OK", "Not Found", "Internal Server Error" 等。

### 常见的状态码处理

- **200 (OK)**: 请求成功并返回预期的数据。通常，使用 `response.json()` 或其他适当的方法解析响应体。
  
- **404 (Not Found)**: 请求的资源未找到。这通常表示客户端错误（例如，URL 错误）。
  
- **500 (Internal Server Error)**: 服务器在处理请求时发生错误。通常，这是服务器端的问题。
  
- **401 (Unauthorized) / 403 (Forbidden)**: 客户端未通过认证或没有权限访问资源。在这种情况下，可能需要重定向用户进行登录或显示错误消息。

### 示例：详细的错误处理

下面是一个处理不同状态码的示例：

```javascript
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new Error('Resource not found (404)');
        case 500:
          throw new Error('Server error (500)');
        case 401:
          throw new Error('Unauthorized (401)');
        case 403:
          throw new Error('Forbidden (403)');
        default:
          throw new Error(`Unexpected HTTP status: ${response.status}`);
      }
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => {
    // 处理错误，例如显示通知、日志记录等
    console.error('Fetch error:', error.message);
  });
```

### 总结

`fetch` 不会自动处理 HTTP 错误状态码，因此需要手动检查 `response.ok` 或 `response.status` 来判断请求是否成功。

这种方式提供了更大的灵活性，使得开发者可以根据具体的 HTTP 状态码定制错误处理逻辑。

## 2. **如何实现 `fetch` 请求的超时控制？**
   - **原因**: `fetch` 没有内置的超时机制，理解如何实现这一点对于避免长时间等待和增强用户体验非常重要。

`fetch` API 没有内置的超时机制，因此你需要手动实现超时控制。通常，通过结合 `AbortController` 和 `setTimeout` 来实现这一功能。

### 使用 `AbortController` 实现超时控制

`AbortController` 是一个用于中止 Web 请求的 API，你可以使用它来控制 `fetch` 请求的超时。下面是实现步骤：

1. 创建一个 `AbortController` 实例。
2. 将 `AbortController` 的 `signal` 属性传递给 `fetch` 请求。
3. 使用 `setTimeout` 设置一个定时器，定时器到期后调用 `AbortController` 的 `abort` 方法来中止请求。
4. 处理中止请求时抛出的 `AbortError`。

### 实现示例

下面是一个具体的实现示例，其中设定 `fetch` 请求的超时时间为 5 秒：

```javascript
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController(); // 创建 AbortController 实例
  const { signal } = controller;

  // 设置定时器，到期后中止请求
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // 使用 fetch 发起请求
  return fetch(url, { ...options, signal })
    .then(response => {
      clearTimeout(timeoutId); // 请求成功，清除定时器
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // 返回解析后的 JSON 数据
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out'); // 捕获超时错误
      }
      throw error; // 处理其他类型的错误
    });
}

// 使用示例
fetchWithTimeout('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error.message));
```

### 关键点解释

- **`AbortController`**: 用于中止 `fetch` 请求。当超时时间到达时，调用 `abort()` 方法会中止正在进行的请求，并触发一个 `AbortError`。
  
- **`setTimeout`**: 用于设置超时。当定时器到期时，中止请求。

- **`signal`**: `AbortController` 的 `signal` 属性是 `fetch` 请求的一个选项，用于跟踪是否应该中止请求。

- **错误处理**: 捕获 `AbortError` 以处理超时，同时处理其他可能的错误。

### 使用场景

这种超时控制适用于所有需要在特定时间内完成的 `fetch` 请求，特别是在网络不稳定或后台服务响应速度不确定的情况下。这种方法可以提高用户体验，避免长时间的无响应状态。

### 总结

通过 `AbortController` 和 `setTimeout`，你可以为 `fetch` 请求添加超时控制，这在需要快速反馈或处理慢速网络连接时非常有用。这个方法灵活且易于实现，适合在实际开发中广泛应用。

## 3. **`fetch` 在处理跨域请求时有哪些限制和注意事项？**
   - **原因**: 跨域请求是 Web 开发中的一个常见问题，理解 `fetch` 在 CORS（跨域资源共享）方面的行为能够帮助处理复杂的跨域场景。

`fetch` API 在处理跨域请求时遵循严格的 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)（跨域资源共享）策略。CORS 是浏览器的一种安全功能，用于限制来自不同域的网页之间的请求。以下是 `fetch` 在处理跨域请求时的主要限制和注意事项：

### 1. **同源策略的限制**
   - **同源策略**：浏览器默认禁止从一个域（例如 `http://example.com`）访问另一个域（例如 `http://api.example.com`）的资源。这是为了防止 CSRF（跨站请求伪造）攻击。
   - **CORS 例外**：通过设置服务器端的 HTTP 头，可以允许跨域请求，但需要服务器明确允许。

### 2. **CORS 请求的类型**
   - **简单请求**：
     - 满足以下条件的请求被视为“简单请求”：
       - 使用的 HTTP 方法为 `GET`、`POST` 或 `HEAD`。
       - HTTP 头仅包括 `Accept`、`Accept-Language`、`Content-Language`、`Content-Type`（且值为 `text/plain`、`multipart/form-data` 或 `application/x-www-form-urlencoded`）。
     - 服务器需要返回 `Access-Control-Allow-Origin` 头来指定允许访问的来源。
   
   - **预检请求（Preflight Request）**：
     - 当请求不符合简单请求的条件时，浏览器会在发送实际请求前发送一个 `OPTIONS` 请求，称为“预检请求”。
     - 预检请求用于检查服务器是否允许特定的跨域请求。
     - 服务器需在预检响应中包含 `Access-Control-Allow-Methods`、`Access-Control-Allow-Headers` 等头。

### 3. **凭证请求（Cookies 和 HTTP 认证信息）**
   - **默认不发送凭证**：`fetch` 默认不会发送 cookies、HTTP 认证头或客户端 TLS 证书。
   - **`credentials` 选项**：
     - 如果需要发送凭证，可以设置 `credentials` 选项：
       ```javascript
       fetch('https://api.example.com/data', {
         credentials: 'include', // 发送凭证（cookies、HTTP 认证信息）
       });
       ```
     - 服务器需要设置 `Access-Control-Allow-Credentials: true`，并且 `Access-Control-Allow-Origin` 不能为通配符 `*`，必须是具体的域名。

### 4. **处理跨域错误**
   - **错误隐蔽**：如果跨域请求因 CORS 问题而失败，`fetch` 不会抛出一个带有明确错误信息的异常，而是会返回一个 `TypeError`，且没有任何指示是由于 CORS 限制导致的。
   - **调试困难**：由于错误信息较少，调试跨域问题可能会变得困难。通常需要通过检查浏览器的开发者工具网络请求部分来获取更多信息。

### 5. **限制头的设置**
   - **受限的请求头**：浏览器出于安全考虑，限制了某些头（如 `Referer`、`Host`、`User-Agent` 等）在跨域请求中的设置。这些头只能由浏览器自动管理。

### 6. **跨域重定向**
   - **重定向策略**：当跨域请求返回 3xx 重定向时，`fetch` 会根据请求的 `redirect` 属性来处理。
   - **`manual` 重定向**：如果使用 `redirect: 'manual'`，`fetch` 将不会跟随重定向，这在某些情况下可能会阻止跨域资源获取。

### 7. **开发环境与生产环境的差异**
   - **CORS 配置差异**：在开发环境中，通常使用代理服务器来绕过 CORS 限制，而在生产环境中，需要配置服务器的 CORS 头以确保跨域请求能够正常工作。

### 8. **使用 `Access-Control-Allow-Origin`**
   - **服务器端控制**：跨域请求的允许是由服务器控制的，服务器必须在响应头中明确设置 `Access-Control-Allow-Origin` 来指定允许的域名。
   - **通配符问题**：对于涉及凭证的请求，不能使用通配符 `*` 来允许所有来源，必须明确列出允许的域名。

### 总结

`fetch` 处理跨域请求时受到 CORS 策略的严格限制，这是一种浏览器的安全措施。

理解这些限制以及如何通过服务器配置正确的 CORS 头来允许跨域访问，对于确保 Web 应用程序的安全性和功能性至关重要。开发者需要特别注意跨域请求的凭证处理、预检请求的响应配置以及调试跨域问题时可能遇到的困难。

## 4. **`fetch` 的 `ReadableStream` 和 `WritableStream` 是如何工作的？**
   - **原因**: 流式处理在大文件上传/下载和实时数据传输中很有用，理解这些概念能扩展 `fetch` 的应用范围。

`ReadableStream` 和 `WritableStream` 是 JavaScript 中用于处理流式数据的接口，它们使得可以处理数据的部分读取或写入，而不是等待整个数据集的传输完成。结合 `fetch` API，这些流接口提供了更高效的方式来处理大数据传输或实时数据流。

### 1. **`ReadableStream` 与 `fetch`**

`ReadableStream` 允许你在数据从网络到达时逐步读取，而不是等待整个响应下载完毕。这在处理大文件、视频流或其他需要实时处理的场景中非常有用。

#### 使用 `ReadableStream` 处理 `fetch` 响应

```javascript
fetch('https://example.com/large-file')
  .then(response => {
    const reader = response.body.getReader(); // 获取 ReadableStream 默认的 reader
    const decoder = new TextDecoder('utf-8'); // 用于解码二进制数据
    let receivedLength = 0; // 已接收的数据长度

    return reader.read().then(function processText({ done, value }) {
      if (done) {
        console.log('Stream complete');
        return;
      }

      receivedLength += value.length;
      console.log(`Received ${receivedLength} bytes so far`);

      // 处理数据
      const chunk = decoder.decode(value, { stream: true });
      console.log('Received chunk: ', chunk);

      // 继续读取下一个数据块
      return reader.read().then(processText);
    });
  })
  .catch(error => console.error('Fetch error:', error));
```

#### 关键点

- **`response.body`**: `fetch` 返回的 `Response` 对象包含一个 `body` 属性，这是一个 `ReadableStream`。
- **`getReader()`**: 获取 `ReadableStream` 的默认读取器，用于逐步读取数据。
- **`reader.read()`**: 返回一个包含 `done` 和 `value` 的 Promise 对象，`done` 表示流是否已完成，`value` 是读取到的数据块。
- **`TextDecoder`**: 用于将二进制数据解码为字符串（文本）。

### 2. **`WritableStream` 与 `fetch`**

`WritableStream` 允许你在数据传输过程中逐步写入数据。这在上传大文件或实时发送数据流时非常有用。

#### 使用 `WritableStream` 上传数据

虽然 `fetch` API 没有直接支持 `WritableStream` 的方式（不像 `ReadableStream`），但你可以通过自定义 `ReadableStream` 来实现上传流：

```javascript
const stream = new ReadableStream({
  start(controller) {
    // 假设我们有一个生成二进制数据的生成器
    function pushData() {
      const chunk = generateChunk(); // 生成一个数据块
      if (chunk) {
        controller.enqueue(chunk); // 推入数据块
        pushData(); // 继续生成下一个数据块
      } else {
        controller.close(); // 结束流
      }
    }
    pushData();
  }
});

fetch('https://example.com/upload', {
  method: 'POST',
  body: stream
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));
```

#### 关键点

- **`ReadableStream` 自定义实现**: 通过创建一个自定义的 `ReadableStream` 来逐步生成上传数据。
- **`controller.enqueue()`**: 将生成的数据块推入流中，以便上传。
- **`controller.close()`**: 在数据传输完毕后关闭流。

### 3. **流的优势**

- **实时处理**: 使用流可以在数据到达时立即处理，而不必等待整个数据集下载完成。这对于大文件、长视频或实时数据流非常有用。
- **减少内存占用**: 流式处理减少了内存的占用，因为它只需在处理数据块时保留少量数据，而不必将整个响应保存在内存中。
- **提高响应速度**: 在数据传输尚未完成时，可以逐步显示内容或处理部分数据，从而改善用户体验。

### 4. **典型应用场景**

- **视频或音频流**: 在播放视频或音频时，使用 `ReadableStream` 来逐步读取和播放数据，减少初始加载时间。
- **大文件下载**: 在下载大文件时，逐步读取数据块并将其保存到磁盘，以减少内存使用。
- **实时数据处理**: 实时处理传感器数据、聊天消息或其他流数据，立即作出响应。

### 总结

`ReadableStream` 和 `WritableStream` 为 `fetch` 提供了强大的流式处理功能，使得开发者能够更高效地处理大数据传输或实时数据流。通过这些流接口，你可以实现实时处理、减少内存占用、提高响应速度等多种优化，适用于各种需要流式数据处理的场景。

## 5. **如何通过 `fetch` API 实现请求的重试机制？**
   - **原因**: 在网络不稳定或服务偶尔不可用的情况下，自动重试可以显著提高应用的健壮性和用户体验。

通过 `fetch` API 实现请求的重试机制，可以提高网络请求的可靠性，特别是在网络不稳定或服务偶尔不可用的情况下。实现重试机制的方法有多种，下面介绍一个常见的实现方法，支持可配置的重试次数、延迟时间和指数退避策略。

### 1. **基本重试机制**
以下是一个简单的重试机制示例，它在请求失败时最多重试 3 次：

```javascript
function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        // 如果响应不成功，抛出错误以触发重试
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // 如果请求成功，解析 JSON 数据
    })
    .catch(error => {
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        return new Promise(resolve => setTimeout(resolve, delay)) // 等待一段时间后重试
          .then(() => fetchWithRetry(url, options, retries - 1, delay));
      }
      throw error; // 如果没有重试机会了，抛出最终的错误
    });
}

// 使用示例
fetchWithRetry('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error.message));
```

### 2. **指数退避策略**
指数退避是一种常见的重试策略，每次重试时延迟时间按指数增加。这样可以防止在网络拥塞时导致过多的请求。

```javascript
function fetchWithExponentialBackoff(url, options = {}, retries = 3, delay = 1000) {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        const nextDelay = delay * 2; // 指数增加延迟时间
        return new Promise(resolve => setTimeout(resolve, delay))
          .then(() => fetchWithExponentialBackoff(url, options, retries - 1, nextDelay));
      }
      throw error;
    });
}

// 使用示例
fetchWithExponentialBackoff('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error.message));
```

### 3. **根据错误类型决定是否重试**
有时你可能希望只在特定的错误类型（如网络错误或超时）下重试请求，而对其他错误类型（如 4xx 客户端错误）立即终止。

```javascript
function shouldRetry(error) {
  // 判断是否应该重试：网络错误或超时可以重试
  return error.name === 'FetchError' || error.message === 'Request timed out';
}

function fetchWithConditionalRetry(url, options = {}, retries = 3, delay = 1000) {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      if (retries > 0 && shouldRetry(error)) {
        console.log(`Retrying... (${retries} attempts left)`);
        return new Promise(resolve => setTimeout(resolve, delay))
          .then(() => fetchWithConditionalRetry(url, options, retries - 1, delay));
      }
      throw error;
    });
}

// 使用示例
fetchWithConditionalRetry('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error.message));
```

### 4. **自定义重试策略**
你可以进一步自定义重试策略，比如结合指数退避和抖动（在延迟时间内添加随机性）以防止请求在固定时间间隔内同时发生。

```javascript
function fetchWithJitterRetry(url, options = {}, retries = 3, delay = 1000) {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      if (retries > 0 && shouldRetry(error)) {
        const jitter = Math.random() * delay; // 增加抖动
        const nextDelay = delay * 2 + jitter; // 指数退避和抖动
        console.log(`Retrying... (${retries} attempts left, delay: ${nextDelay.toFixed(0)} ms)`);
        return new Promise(resolve => setTimeout(resolve, nextDelay))
          .then(() => fetchWithJitterRetry(url, options, retries - 1, nextDelay));
      }
      throw error;
    });
}

// 使用示例
fetchWithJitterRetry('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error.message));
```

### 总结

通过上述方法，你可以为 `fetch` API 实现灵活的重试机制，提升请求的鲁棒性。

在实际开发中，可以根据具体需求选择适合的重试策略，包括重试次数、延迟时间、是否使用指数退避、是否基于错误类型重试等。

## 6. **如何使用 `fetch` 处理二进制数据，如图像或文件？**
   - **原因**: 处理二进制数据是 Web 开发中常见的需求，了解如何通过 `fetch` 进行处理对于丰富应用功能至关重要。

使用 `fetch` 处理二进制数据（如图像或文件）时，你需要处理二进制流，并且根据数据的类型（例如 Blob 或 ArrayBuffer）选择适当的处理方法。以下是如何使用 `fetch` API 处理二进制数据的具体示例：

### 1. **下载和处理二进制数据**

当你从服务器下载二进制数据时，可以使用 `response.blob()` 或 `response.arrayBuffer()` 方法来处理响应。下面是两个示例，分别展示了如何处理 Blob 和 ArrayBuffer 数据：

#### 处理 Blob 数据

Blob 适用于处理图像、音频或视频文件等类型的二进制数据。

```javascript
fetch('https://example.com/image.jpg')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.blob(); // 将响应体转换为 Blob
  })
  .then(blob => {
    // 例如，将 Blob 显示为图像
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob); // 创建一个 URL 对象
    document.body.appendChild(img); // 将图像添加到页面
  })
  .catch(error => console.error('Fetch error:', error));
```

#### 处理 ArrayBuffer 数据

ArrayBuffer 适用于处理原始二进制数据，例如文件内容或自定义二进制协议的数据。

```javascript
fetch('https://example.com/some-binary-data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.arrayBuffer(); // 将响应体转换为 ArrayBuffer
  })
  .then(arrayBuffer => {
    // 例如，将 ArrayBuffer 转换为 Uint8Array 进行处理
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log(uint8Array); // 处理二进制数据
  })
  .catch(error => console.error('Fetch error:', error));
```

### 2. **上传二进制数据**

要上传二进制数据（如图像文件或其他文件），你可以使用 `FormData` 对象将文件附加到请求中，并将其作为 `fetch` 的 `body` 发送。

```javascript
const formData = new FormData();
const fileInput = document.querySelector('input[type="file"]'); // 文件输入元素
formData.append('file', fileInput.files[0]); // 添加文件到 FormData

fetch('https://example.com/upload', {
  method: 'POST',
  body: formData, // 将 FormData 作为请求体
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.json(); // 解析 JSON 响应
  })
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));
```

### 3. **上传二进制数据（不使用 FormData）**

你也可以直接使用 Blob 或 ArrayBuffer 作为 `fetch` 请求体进行上传：

```javascript
// 创建一个 Blob 对象
const blob = new Blob(['Hello, world!'], { type: 'text/plain' });

fetch('https://example.com/upload', {
  method: 'POST',
  body: blob, // 将 Blob 作为请求体
  headers: {
    'Content-Type': 'text/plain', // 设置正确的 Content-Type
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.json(); // 解析 JSON 响应
  })
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));
```

### 4. **处理响应流**

有时，你需要逐步处理流数据，如大文件下载或实时数据流。可以使用 `ReadableStream` 来处理流数据。

```javascript
fetch('https://example.com/large-file')
  .then(response => {
    const reader = response.body.getReader(); // 获取 ReadableStream 默认的 reader
    const decoder = new TextDecoder('utf-8'); // 用于解码二进制数据

    return reader.read().then(function processText({ done, value }) {
      if (done) {
        console.log('Stream complete');
        return;
      }

      // 处理数据块
      const chunk = decoder.decode(value, { stream: true });
      console.log('Received chunk: ', chunk);

      // 继续读取下一个数据块
      return reader.read().then(processText);
    });
  })
  .catch(error => console.error('Fetch error:', error));
```

### 总结

- **下载二进制数据**: 使用 `response.blob()` 或 `response.arrayBuffer()` 处理二进制数据。
- **上传二进制数据**: 使用 `FormData` 对象或直接使用 Blob / ArrayBuffer 作为 `fetch` 请求体。
- **处理流数据**: 使用 `ReadableStream` 逐步处理大文件或实时数据流。

这些方法可以帮助你高效地处理二进制数据，适用于各种需要上传或下载二进制内容的场景。

## 7. **`fetch` 和 `XMLHttpRequest` 在性能上有什么差异？**
   - **原因**: 了解两者在性能上的差异可以帮助决定在特定场景中使用哪个 API 更合适，尤其是在处理大量并发请求时。

`fetch` 和 `XMLHttpRequest`（XHR）是用于处理 HTTP 请求的两种不同 API。尽管它们都可以完成类似的任务，但在性能和功能上存在一些差异。以下是 `fetch` 和 `XMLHttpRequest` 在性能和其他方面的主要差异：

### 1. **性能差异**

#### 1.1 请求和响应流处理

- **`fetch`**: 支持 `ReadableStream`，允许逐步处理响应数据，这使得在处理大文件或实时数据流时更加高效。可以逐步读取数据而不需要等待整个响应下载完成。
- **`XMLHttpRequest`**: 不支持流式读取响应数据。你通常需要等待整个响应体下载完成才能开始处理数据，这在处理大文件时可能导致性能瓶颈和较高的内存消耗。

#### 1.2 代码简洁性

- **`fetch`**: 具有更简洁的 API 和 Promise-based 的处理方式，这使得处理异步操作和链式调用更为直观和易于管理。
- **`XMLHttpRequest`**: 基于回调的 API 使得代码更复杂，尤其是在处理多层嵌套的回调时，这可能导致“回调地狱”。

### 2. **功能差异**

#### 2.1 默认支持

- **`fetch`**: 默认返回一个 Promise，这使得链式调用和错误处理更容易。支持各种响应类型（如 JSON、文本、Blob、ArrayBuffer）。
- **`XMLHttpRequest`**: 不支持 Promise，需要使用回调函数处理响应。处理不同响应类型需要手动转换和处理。

#### 2.2 CORS 支持

- **`fetch`**: 内置支持 CORS，允许你在发送跨域请求时更灵活地配置选项，如 `credentials`（处理 Cookies 和认证信息）。
- **`XMLHttpRequest`**: 也支持 CORS，但需要手动处理一些跨域请求的细节，配置选项和错误处理可能更繁琐。

#### 2.3 请求和响应配置

- **`fetch`**: 提供更灵活的请求和响应配置选项，如 `mode`、`credentials`、`cache`、`redirect` 等，能够更精细地控制请求行为。
- **`XMLHttpRequest`**: 配置选项较为有限，特别是在处理请求超时和取消请求方面。

### 3. **错误处理**

- **`fetch`**: 仅在网络错误或无法完成请求时会拒绝 Promise。HTTP 错误状态码（如 404 或 500）不会被认为是错误，需要通过检查响应的 `ok` 属性或状态码来处理。
- **`XMLHttpRequest`**: 支持 `onerror` 事件来处理请求失败情况，同时可以通过 `status` 属性检查响应状态码来处理错误。

### 4. **进度监控**

- **`fetch`**: 不支持直接的进度监控。如果需要监控下载进度或上传进度，通常需要结合使用 `ReadableStream` 来实现。
- **`XMLHttpRequest`**: 支持通过 `onprogress` 事件来监控上传和下载的进度。

### 5. **取消请求**

- **`fetch`**: 通过 `AbortController` 可以取消请求。这提供了一种优雅的方式来中止请求并处理取消逻辑。
- **`XMLHttpRequest`**: 通过调用 `abort()` 方法可以取消请求，但取消请求后的处理逻辑可能不如 `fetch` 中使用 `AbortController` 那样直观。

### 总结

- **性能**: `fetch` 在处理流式数据和大文件时通常比 `XMLHttpRequest` 更高效，因为它支持 `ReadableStream`，允许逐步处理数据。
- **功能**: `fetch` 提供了更现代和灵活的 API，支持 Promise、CORS 配置和更多的请求配置选项，而 `XMLHttpRequest` 的 API 更为传统且回调导向。
- **错误处理和进度监控**: `XMLHttpRequest` 在这些方面提供了更直接的支持，而 `fetch` 需要额外的处理来实现类似功能。

在现代 Web 开发中，`fetch` API 被广泛推荐，因为它提供了更清晰的语法、功能更强大并且与 Promise 兼容，使得异步操作和错误处理更为简洁。

## 8. **`fetch` API 如何与 Service Workers 协同工作？**
   - **原因**: Service Workers 在 PWA（渐进式 Web 应用）中非常重要，理解它们与 `fetch` 的协同作用有助于优化离线体验和缓存策略。

`fetch` API 与 Service Workers 协同工作是现代 Web 开发中的一个重要组成部分，它允许你在网络请求和响应之间插入自定义的逻辑，比如缓存策略、请求拦截和离线支持。以下是 `fetch` API 与 Service Workers 的协作方式以及常见的使用场景和示例：

### 1. **Service Worker 概述**

Service Worker 是一种在后台运行的脚本，可以拦截和处理网络请求，管理缓存，提供离线体验等。它允许你在不依赖网络的情况下，处理网络请求和缓存。

### 2. **拦截和处理网络请求**

Service Worker 可以拦截由 `fetch` API 发出的网络请求，并对其进行自定义处理。你可以使用 `event.respondWith()` 方法来提供自定义响应。

#### 示例：使用 Service Worker 缓存静态资源

```javascript
// service-worker.js

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('my-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // 如果有缓存的响应，直接返回
      }
      return fetch(event.request); // 否则发起网络请求
    })
  );
});
```

在上面的示例中：
- **`install` 事件**: 当 Service Worker 安装时，将一些静态资源缓存到缓存存储中。
- **`fetch` 事件**: 拦截网络请求，如果请求在缓存中有匹配的响应，则返回缓存的响应；否则，发起实际的网络请求。

### 3. **使用 `fetch` API 与 Service Worker 协同工作**

在 Service Worker 中使用 `fetch` API 处理请求时，可以进行更多高级操作，如动态缓存、策略应用等。

#### 示例：动态缓存

```javascript
// service-worker.js

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // 克隆响应，因为响应流只能被读取一次
      const responseClone = response.clone();
      
      // 打开缓存并将响应存储到缓存中
      caches.open('my-dynamic-cache-v1').then(cache => {
        cache.put(event.request, responseClone);
      });
      
      return response;
    }).catch(() => {
      // 如果网络请求失败，则从缓存中返回响应
      return caches.match(event.request);
    })
  );
});
```

在这个示例中：
- **动态缓存**: 对于每个 `fetch` 请求，尝试从网络获取数据，并将响应缓存到动态缓存中。如果网络请求失败，则从缓存中返回响应。

### 4. **使用 `fetch` API 和 `postMessage` 与主线程通信**

Service Worker 可以通过 `postMessage` API 与主线程通信，进行更多的自定义操作。

#### 示例：从主线程发送消息到 Service Worker

```javascript
// main.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(registration => {
    // 向 Service Worker 发送消息
    navigator.serviceWorker.ready.then(registration => {
      registration.active.postMessage({ command: 'updateData' });
    });
  }).catch(error => console.error('Service Worker registration failed:', error));
}
```

#### 示例：在 Service Worker 中接收消息

```javascript
// service-worker.js

self.addEventListener('message', event => {
  if (event.data.command === 'updateData') {
    // 处理来自主线程的消息
    console.log('Received command:', event.data.command);
    // 执行相应的操作，例如更新缓存或通知用户
  }
});
```

### 5. **缓存策略**

Service Worker 可以实现不同的缓存策略，例如：
- **Cache First**: 首先检查缓存，如果有则返回缓存数据，否则从网络获取。
- **Network First**: 首先从网络获取数据，如果失败则从缓存中返回。
- **Cache Only**: 只从缓存中获取数据。
- **Network Only**: 只从网络中获取数据。

#### 示例：Cache First 策略

```javascript
// service-worker.js

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        return caches.open('my-cache-v1').then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
```

### 6. **离线支持**

通过 Service Worker 的缓存机制，可以提供离线支持。当用户离线时，缓存的资源可以用来提供应用的离线体验。

### 总结

- **拦截和处理请求**: Service Worker 可以拦截并处理由 `fetch` API 发出的请求，进行缓存、离线支持等。
- **缓存策略**: Service Worker 支持不同的缓存策略，可以根据需要自定义缓存行为。
- **与主线程通信**: 使用 `postMessage` API 进行主线程与 Service Worker 之间的通信。

通过合理使用 `fetch` 和 Service Worker，你可以实现高效的网络请求处理、优化性能、提供离线体验，并支持自定义的缓存策略。

## 9. **`fetch` 在服务器端（如 Node.js）中的表现如何？**
   - **原因**: 随着全栈 JavaScript 开发的普及，理解 `fetch` 在服务器端的表现和使用模式，可以更好地构建统一的前后端架构。

在服务器端环境如 Node.js 中，`fetch` API 不是原生支持的，因为 `fetch` 是浏览器端的 API。然而，你可以使用第三方库来在 Node.js 中模拟或实现类似 `fetch` 的功能。以下是有关在 Node.js 中使用 `fetch` 的几个要点：

### 1. **使用 `node-fetch`**

`node-fetch` 是一个流行的库，提供了与浏览器 `fetch` API 相似的功能，允许你在 Node.js 中使用类似的语法来执行 HTTP 请求。

#### 安装

```bash
npm install node-fetch
```

#### 使用示例

```javascript
const fetch = require('node-fetch');

// 发起 GET 请求
fetch('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));
```

### 2. **功能支持**

`node-fetch` 实现了大多数浏览器 `fetch` API 的功能，包括：
- **请求方法**（GET、POST、PUT、DELETE 等）
- **请求头和主体**
- **响应处理**（如 `response.json()`、`response.text()` 等）
- **流处理**（`response.body`）

但是，`node-fetch` 并不支持某些浏览器特有的功能，如：
- **服务工作者**（Service Workers）
- **浏览器特有的 HTTP 缓存**

### 3. **与原生 HTTP 模块的比较**

在 Node.js 中，你还可以使用原生的 `http` 或 `https` 模块来处理 HTTP 请求。与 `node-fetch` 相比，原生模块提供了更细粒度的控制，但使用起来更复杂。

#### 使用 `http` 模块的示例

```javascript
const http = require('http');

const options = {
  hostname: 'jsonplaceholder.typicode.com',
  port: 80,
  path: '/posts/1',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});

req.on('error', error => {
  console.error('Request error:', error);
});

req.end();
```

### 4. **其他库**

除了 `node-fetch`，还有其他库可以在 Node.js 中实现类似的功能，例如：
- **`axios`**: 一个功能丰富的 HTTP 客户端，支持 Promise、请求和响应拦截器、自动转换 JSON 数据等。

#### 使用 `axios` 的示例

```javascript
const axios = require('axios');

axios.get('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => console.log(response.data))
  .catch(error => console.error('Axios error:', error));
```

### 5. **性能和异步处理**

在 Node.js 中，`node-fetch` 和其他类似库（如 `axios`）都基于 Promise 进行异步处理，这与浏览器中的 `fetch` API 类似。它们都支持 async/await 语法，使得异步代码的编写更加简洁。

#### 使用 async/await 的示例

```javascript
const fetch = require('node-fetch');

async function fetchData() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

fetchData();
```

### 总结

- **`node-fetch`**: 提供了类似于浏览器的 `fetch` API 的功能，适用于 Node.js 环境中进行 HTTP 请求。
- **原生模块**: `http` 和 `https` 模块提供了更底层的控制，但使用起来更复杂。
- **其他库**: 如 `axios` 提供了更丰富的功能和更高层次的抽象。
- **性能**: `node-fetch` 和 `axios` 的异步处理机制与浏览器中的 `fetch` API 类似，都支持 Promise 和 async/await 语法。

## 10. **未来 `fetch` API 的发展方向是什么？有哪些新特性正在被讨论或实现？**
   - **原因**: 了解未来的发展方向有助于提前适应可能的变更，确保代码在长期内的可维护性和兼容性。

`fetch` API 是现代 Web 开发中重要的工具，其设计目标是提供一个更简洁和灵活的接口来进行网络请求。未来 `fetch` API 的发展方向主要集中在增强功能、提高性能、改进安全性和提升开发者体验上。以下是一些正在讨论或实现的新特性和发展方向：

### 1. **AbortController 和 AbortSignal**

已经在 `fetch` 中实现：
- **AbortController**: 提供了一个机制来取消请求，通过 `AbortSignal` 进行请求的取消和中断。
- **使用示例**:
  ```javascript
  const controller = new AbortController();
  const signal = controller.signal;

  fetch('https://example.com', { signal })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Fetch error:', error);
      }
    });

  // 取消请求
  controller.abort();
  ```

### 2. **Streaming API**

- **ReadableStream** 和 **WritableStream** 已经在 `fetch` 中实现，使得可以逐步读取和处理响应体数据。
- **正在讨论的改进**: 更高效的流处理和 API 扩展，以支持更复杂的数据处理需求。

### 3. **Abortable Streams**

- **目标**: 提供一种更直观的方式来中断和处理流式数据的请求，例如取消流式下载。
- **潜在特性**: 可能包括与 `AbortController` 更紧密集成的流处理功能，使得流可以在任意点被取消。

### 4. **Request and Response Compression**

- **目标**: 内置支持请求和响应的压缩处理（如 gzip 或 Brotli），减少带宽消耗和提高性能。
- **目前**: 虽然 `fetch` API 本身不直接支持压缩处理，但可以通过服务器端配置或中间件来实现。

### 5. **Cookie and Credentials Management**

- **目标**: 增强对 cookies 和跨站请求伪造（CSRF）保护的管理，使得 `fetch` 请求可以更安全地处理敏感信息。
- **当前**: 通过 `credentials` 选项可以设置为 `include` 或 `same-origin`，未来可能会有更细粒度的配置选项。

### 6. **Cache-Control Enhancements**

- **目标**: 提供更高级的缓存控制功能，使得开发者可以更细致地管理缓存行为。
- **可能的改进**: 增强对 HTTP 缓存头的支持，如 `Cache-Control`、`ETag` 和 `Last-Modified`。

### 7. **`fetch` API and HTTP/2/3**

- **目标**: 更好地支持 HTTP/2 和 HTTP/3 的特性，如多路复用和更高效的传输。
- **目前**: `fetch` API 的现有实现已经能够利用 HTTP/2，但未来可能会有更多专门优化 HTTP/3 的功能。

### 8. **Error Handling Improvements**

- **目标**: 改进错误处理机制，使得开发者能够更清晰地捕捉和处理网络请求中的各种错误。
- **可能的特性**: 更明确的错误分类和更多的错误信息提供。

### 9. **FormData Enhancements**

- **目标**: 增强对 `FormData` 对象的支持，以便于构建复杂的表单请求和处理文件上传。
- **可能的改进**: 更好的支持和扩展用于动态表单和复杂请求的功能。

### 10. **Resource Timing and Performance Measurement**

- **目标**: 提供内置支持来测量和优化网络请求的性能。
- **可能的特性**: 允许开发者获取请求的性能指标和资源加载时间，帮助优化应用性能。

### 总结

- **现有功能**: 如 `AbortController`、流处理和基本的缓存控制已在 `fetch` API 中实现。
- **正在讨论和改进的方向**: 包括更好的流处理、压缩支持、增强的错误处理、改进的性能测量等。
- **未来**: `fetch` API 将继续向更高效、更安全和更灵活的方向发展，以适应不断变化的 Web 开发需求。

### 总结

这些问题涵盖了 `fetch` 的核心功能、潜在问题、性能考量，以及它与其他 Web API 的集成。

这些问题的答案可以帮助你深入理解 `fetch`，从而在不同的应用场景中做出更明智的决策。

# 参考资料

[JS代替ajax向服务端请求的新方案：fetch](https://www.jianshu.com/p/bad1b614eb81)

[文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) 

[fetch github](https://github.com/github/fetch) 

* any list
{:toc}