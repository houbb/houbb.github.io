---
layout: post
title: Ajax 的替代方案-axios.js 
date:  2020-3-27 17:53:59 +0800
categories: [HTML]
tags: [html, js, sh]
published: true
---

# http 请求系列

[http request-01-XMLHttpRequest XHR 简单介绍](https://houbb.github.io/2020/03/27/http-request-00-XHR-intro)

[http request-01-XMLHttpRequest XHR 标准](https://houbb.github.io/2020/03/27/http-request-00-XHR-standard)

[Ajax 详解-01-AJAX（Asynchronous JavaScript and XML）入门介绍](https://houbb.github.io/2020/03/27/http-request-01-ajax-intro)

[Ajax XHR 的替代方案-fetch](https://houbb.github.io/2020/03/27/http-request-02-fetch-intro)

[Ajax XHR 的替代方案-fetch 标准](https://houbb.github.io/2020/03/27/http-request-02-fetch-standard)

[Ajax 的替代方案-axios.js](https://houbb.github.io/2020/03/27/http-request-03-axios-intro)

[http 请求-04-promise 对象 + async/await](https://houbb.github.io/2020/03/27/http-request-04-promise-intro)

# Axios

Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。

## Features

- 从浏览器中创建 XMLHttpRequests

- 从 node.js 创建 http 请求

- 支持 Promise API

- 拦截请求和响应

- 转换请求数据和响应数据

- 取消请求

- 自动转换 JSON 数据

- 客户端支持防御 XSRF

## 入门例子

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>axios 实例</title>
<style type="text/css">
</style>
</head>
<body>
<script src="https://cdn.bootcss.com/axios/0.18.0/axios.min.js"></script>
<script type="text/javascript">
    //get请求第一种写法
    axios({
            method: 'get',
            url: 'https://ipinfo.io',
            params: {
              ID: 12345  //参数
            }
        })
        .then(function(response) {
            console.log(response.data);
        });

    //get请求第二种写法
    var result = axios({
            method: 'get',
            url: 'https://ipinfo.io',
            params: {
              ID: 12345
            }            
        });   
    result.then(function(response) {
        console.log(response.data);
    });

    //post请求
    axios({
            method: 'post',
            url: 'https://ipinfo.io',
            data: {
              ID: 12345  //参数
            }
        })
        .then(function(response) {
            console.log(response.data);
        });
</script>
</body>
</html>
```

# chat

## 详细介绍一下 axios

**Axios** 是一个基于 Promise 的 HTTP 客户端，适用于浏览器和 Node.js 环境。

它提供了一种简洁、灵活且功能丰富的方式来发起网络请求，并且在处理异步操作时非常方便。

Axios 是现代前端开发中广泛使用的工具之一，特别适合处理复杂的 HTTP 请求和响应场景。

### **Axios 的主要特性**

1. **基于 Promise 的 API**
   - Axios 使用 Promise API 来处理异步请求，使代码更具可读性和可维护性。通过 `.then()` 和 `.catch()` 方法，可以轻松处理请求的成功和失败情况。

2. **自动转换 JSON 数据**
   - Axios 自动将请求和响应的数据转换为 JSON 格式，无需手动解析或序列化。这对于与 RESTful API 交互特别有用，因为大多数 API 都使用 JSON 格式。

3. **支持请求和响应拦截器**
   - 请求拦截器允许在请求发送之前对其进行修改（例如添加认证 token），而响应拦截器则可以在响应数据被处理之前对其进行修改或统一错误处理。

4. **支持取消请求**
   - 通过 `CancelToken`，Axios 允许开发者取消未完成的请求，特别适合用户快速连续发起多个请求的场景，如搜索建议或自动完成功能。

5. **支持超时设置**
   - Axios 允许为每个请求设置超时时间，避免长时间等待无响应的请求。超时后，Axios 会自动取消请求，并触发错误处理逻辑。

6. **自动处理请求的并发**
   - Axios 提供了 `axios.all()` 方法，可以同时发送多个请求，并在所有请求完成后执行某些操作，这对于处理并发请求非常有用。

7. **支持跨站请求**
   - Axios 支持跨域请求，并自动处理 CORS（跨域资源共享）相关的复杂性。它可以与浏览器的 `withCredentials` 选项一起使用，以便在需要时发送跨域 cookies。

8. **丰富的配置选项**
   - Axios 允许全局设置默认配置，如请求头、基础 URL、超时时间等。此外，开发者还可以为每个请求单独设置这些选项。

9. **浏览器与 Node.js 兼容**
   - Axios 可以在浏览器和 Node.js 中无缝使用，使得前后端代码更容易共享和复用。它在浏览器中使用 XMLHttpRequest，在 Node.js 中则使用 HTTP 模块。

### **Axios 的安装与使用**

#### **安装**
Axios 可以通过 npm 或 yarn 安装，也可以通过 CDN 直接在网页中引入。

- **通过 npm 安装**:
  ```bash
  npm install axios
  ```

- **通过 yarn 安装**:
  ```bash
  yarn add axios
  ```

- **通过 CDN 引入**:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  ```

#### **基本使用示例**

**GET 请求**:
```javascript
axios.get('https://api.example.com/data')
  .then(response => {
    console.log(response.data); // 处理响应数据
  })
  .catch(error => {
    console.error('Error:', error); // 处理错误
  });
```

**POST 请求**:
```javascript
axios.post('https://api.example.com/data', {
  name: 'John',
  age: 30
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**并发请求**:
```javascript
axios.all([
  axios.get('https://api.example.com/data1'),
  axios.get('https://api.example.com/data2')
])
.then(axios.spread((response1, response2) => {
  console.log('Data1:', response1.data);
  console.log('Data2:', response2.data);
}))
.catch(error => {
  console.error('Error:', error);
});
```

### **高级功能**

1. **请求拦截器和响应拦截器**
   - **请求拦截器**：在请求发送之前对请求进行处理，例如添加认证 token。
   - **响应拦截器**：在响应到达后但在被 `then` 或 `catch` 处理之前，对响应进行预处理或错误处理。

```javascript
// 添加请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => {
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response.status === 401) {
    // 处理未经授权的错误
  }
  return Promise.reject(error);
});
```

2. **取消请求**
   - 在处理如搜索建议等场景时，可能需要取消之前的请求以避免不必要的资源消耗。

```javascript
const CancelToken = axios.CancelToken;
let cancel;

axios.get('/user/12345', {
  cancelToken: new CancelToken(function executor(c) {
    cancel = c;
  })
});

// 取消请求
cancel('Request canceled.');
```

3. **设置默认配置**
   - 可以为所有请求设置全局默认配置，或者为每个实例单独设置。

```javascript
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.timeout = 1000;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

4. **处理超时**
   - 设置请求的超时时间，如果超过该时间则会触发错误。

```javascript
axios.get('/longRequest', { timeout: 5000 })
  .then(response => console.log(response))
  .catch(error => console.error('Request timed out:', error));
```

### **总结**
Axios 是一个功能强大且易于使用的 HTTP 客户端，特别适合现代 Web 应用程序中需要处理复杂的异步请求的场景。

它不仅简化了传统 AJAX 的使用，还提供了丰富的功能和灵活的配置选项，帮助开发者更高效地构建和维护 Web 应用程序。

## 为什么需要 axios

`axios` 是一个基于 `Promise` 的 HTTP 客户端，常用于现代前端开发中与后端进行数据交互。以下是使用 `axios` 的几个主要原因：

1. **简洁的 API**: `axios` 提供了更为直观和简洁的 API，使得发起 HTTP 请求（如 GET、POST、PUT、DELETE）变得更容易理解和使用。相比原生的 `XMLHttpRequest` 或 `fetch`，`axios` 的代码通常更为简洁。

2. **更好的浏览器兼容性**: 虽然 `fetch` 也提供了现代浏览器的原生支持，但 `axios` 可以更好地兼容一些旧版本的浏览器，尤其是在处理跨域请求和响应数据时。

3. **自动转换 JSON 数据**: `axios` 自动将响应数据解析为 JSON，这在处理 API 请求时非常方便。`fetch` 需要手动调用 `.json()` 方法来解析响应数据，而 `axios` 自动处理这一部分。

4. **请求和响应的拦截器**: `axios` 提供了请求和响应的拦截器功能，允许在请求发送前或收到响应后进行处理。这对于统一添加认证头、错误处理、日志记录等场景非常有用。

5. **取消请求**: `axios` 提供了取消请求的功能，通过 `CancelToken` 可以轻松地中止一个正在进行的请求，这是 `fetch` 不直接支持的功能。

6. **并发请求处理**: `axios` 提供了诸如 `axios.all` 等方法，方便处理多个并发请求，并且可以在所有请求完成后执行操作。

7. **支持 Node.js**: `axios` 不仅在浏览器中工作良好，在 Node.js 环境中同样表现出色，因此可以在同一个代码库中统一使用 `axios` 进行 HTTP 请求。

总结来说，`axios` 通过提供更强大的功能和更友好的 API，简化了前端开发中与服务器进行数据通信的工作。

## axios 有哪些优缺点？适用场景？

Axios 是一个基于 Promise 的 HTTP 客户端，适用于浏览器和 Node.js，它具有以下优点和特性：

1. **Promise API 支持**：Axios 支持 Promise，使得异步请求更加简洁和易于管理 。
2. **同构性**：Axios 可以在浏览器和 Node.js 中使用相同的代码，这使得它在前端和后端开发中都非常有用 。
3. **请求和响应拦截器**：Axios 允许拦截请求和响应，这可以用于统一处理请求头、身份验证、错误处理等 。
4. **数据转换**：Axios 可以自动转换请求和响应数据，例如 JSON 数据的序列化和反序列化 。
5. **取消请求**：Axios 提供了取消请求的功能，这在处理复杂的异步操作时非常有用 。
6. **超时和配置**：Axios 支持设置请求超时，并允许自定义配置，如请求头、数据类型等 。

然而，Axios 也有一些潜在的缺点：

1. **依赖 Promise**：由于 Axios 完全依赖于 Promise，那些不熟悉 Promise 或者需要支持不兼容 Promise 的环境的开发者可能会遇到一些困难。
2. **缺少浏览器兼容性**：虽然 Axios 可以在大多数现代浏览器中使用，但在一些非常旧的浏览器中可能需要 polyfills。
3. **API 复杂性**：尽管 Axios 的 API 设计得很直观，但对于初学者来说，其丰富的配置选项可能会有一定的学习曲线。

Axios 的适用场景包括但不限于：

- 需要进行 HTTP 请求的任何前端项目，尤其是在使用现代 JavaScript 框架如 Vue.js 或 React 时 。
- 在 Node.js 环境中进行 HTTP 请求，尤其是在构建 API 或服务时 。
- 需要进行请求和响应拦截的复杂应用，以便于统一处理认证、错误处理等 。

总的来说，Axios 是一个功能强大、灵活且易于使用的 HTTP 客户端，适用于现代 Web 开发中的多种场景。

## 还有哪些类似于 axios 的库？

除了 Axios，还有其他几个库可以用于处理 HTTP 请求，具有不同的特点和优势：

1. **Fetch API**：Fetch 是一个原生 JavaScript API，用于在浏览器中进行网络请求。它支持 Promise，使得异步代码更清晰，且由于是浏览器内置的，无需额外依赖。但是，Fetch 需要手动处理 HTTP 错误，并且不支持请求/响应拦截器 。

2. **Redaxios**：Redaxios 是一个基于 Fetch API 构建的轻量级 HTTP 客户端库，提供了与 Axios 相似的 API 和功能。它的优势在于体积更小（仅 2KB），且可以利用现代浏览器的性能和功能。Redaxios 也可以通过 `axios-adapter-redaxios` 适配器与 Axios 无缝集成 。

3. **Ken-Axios**：Ken-Axios 是一个轻量级的 Axios 替代品，它基于 Axios 构建，但进行了代码优化和模块化设计，提供了 TypeScript 支持和插件系统。Ken-Axios 旨在提供高性能和易用性，同时保持与 Axios 类似的 API 设计，便于现有用户迁移和上手 。

4. **Alova**：Alova 是一个现代化的请求策略库，相比 Axios，它提供了与 UI 框架更深度的融合，自动管理请求相关数据，并且具有开箱即用的高性能功能，如内存缓存和请求共享。Alova 的体积轻量，压缩状态下只有 4kb+，并且为 TypeScript 用户提供了直观的类型支持 。

开发者可以根据项目需求、对现代浏览器的支持、性能要求以及个人偏好来选择合适的 HTTP 请求库。

## 详细介绍一下 Promise

# 参考资料

[axios.js 实例 -----$.ajax的替代方案](https://www.cnblogs.com/xutongbao/p/9924828.html)

* any list
{:toc}