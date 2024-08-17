---
layout: post
title: http 请求-04-promise 对象 + async/await 入门介绍
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

# chat

## 详细介绍一下 Promise

Promise 是 JavaScript 中用于异步编程的一种对象。它代表了一个可能现在还没有结果，但将来会有结果的值。

Promise 的主要目的是提供一个更合理、更可控的方式来处理异步操作，比如网络请求、文件读写等。

以下是 Promise 的一些关键点：

1. **状态**：Promise 有三种状态：
   - **Pending（等待）**：初始状态，既不是成功，也不是失败状态。
   - **Fulfilled（已成功）**：意味着操作成功完成。
   - **Rejected（已失败）**：意味着操作失败。

2. **创建**：使用 `new Promise` 构造函数创建一个新的 Promise 对象。构造函数接受一个执行器函数（executor function），它将在 Promise 创建后立即执行。

   ```javascript
   const myPromise = new Promise((resolve, reject) => {
     // 异步操作
   });
   ```

3. **执行器函数**：这是一个自动执行的函数，接受两个参数 `resolve` 和 `reject`：
   - `resolve`：当异步操作成功时调用，将 Promise 状态转变为 Fulfilled。
   - `reject`：当异步操作失败时调用，将 Promise 状态转变为 Rejected。

4. **链式调用**：Promise 可以通过 `.then()` 和 `.catch()` 方法进行链式调用。`.then()` 用于指定当 Promise 成功时的回调函数，而 `.catch()` 用于指定当 Promise 失败时的回调函数。

   ```javascript
   myPromise
     .then((result) => {
       // 处理结果
     })
     .catch((error) => {
       // 处理错误
     });
   ```

5. **错误处理**：如果 Promise 被拒绝，错误会传递到最近的 `.catch()` 调用。如果在 Promise 链中没有 `.catch()`，错误将被忽略。

6. **Promise.all()**：这是一个静态方法，接受一组 Promise 对象作为输入，并返回一个新的 Promise 对象。这个新的 Promise 在所有输入的 Promise 都成功完成时才会成功，如果任何一个输入的 Promise 失败，则立即失败。

7. **Promise.race()**：这也是一个静态方法，同样接受一组 Promise 对象。它返回一个新的 Promise，这个 Promise 将在输入的 Promise 中任何一个首先解决或拒绝时解决或拒绝。

8. **finally()**：无论 Promise 是解决还是拒绝，`.finally()` 方法都会被调用。它通常用于执行一些清理工作。

9. **Async/Await**：基于 Promise 的 `async` 和 `await` 关键字提供了一种更简洁和直观的方式来编写异步代码，使得异步代码看起来和同步代码类似。

   ```javascript
   async function asyncFunction() {
     try {
       const result = await myPromise; // 等待 Promise 解决
       console.log(result);
     } catch (error) {
       console.error(error);
     }
   }
   ```

Promise 是 JavaScript 异步编程的核心，它们使得处理异步操作变得更加简单和可靠。

## 为什么需要 Promise ？解决了什么问题

Promise 出现之前，JavaScript 中处理异步操作主要依赖回调函数（Callback）。

然而，回调函数存在一些问题，这些问题被称为 "回调地狱"（Callback Hell）或 "回调嵌套"，Promise 就是为了解决这些问题而设计的。以下是 Promise 解决的主要问题：

1. **回调地狱**：当多个异步操作需要按顺序执行时，嵌套的回调函数会导致代码难以阅读和维护。

   ```javascript
   getData(function(a) {
     getMoreData(a, function(b) {
       getEvenMoreData(b, function(c) {
         // ...
       });
     });
   });
   ```

   Promise 允许你以链式的方式书写异步操作，使代码更加清晰：

   ```javascript
   getData()
     .then(a => getMoreData(a))
     .then(b => getEvenMoreData(b))
     .then(c => {
       // 处理结果
     });
   ```

2. **错误处理**：在回调函数中，错误处理通常需要在每个回调中单独处理。Promise 的 `.catch()` 方法提供了统一的错误处理机制。

   ```javascript
   // 使用回调时的错误处理
   getData(function(err, data) {
     if (err) {
       // 错误处理
     } else {
       // 处理数据
     }
   });

   // 使用 Promise 的错误处理
   getData()
     .then(data => {
       // 处理数据
     })
     .catch(err => {
       // 统一错误处理
     });
   ```

3. **代码组织**：Promise 提供了一种更好的方式组织异步代码，使得逻辑更加清晰，也更容易复用。

4. **状态管理**：Promise 明确了异步操作的三种状态（Pending、Fulfilled、Rejected），这使得状态管理更加明确和容易。

5. **并发执行**：Promise 的 `Promise.all()` 方法可以轻松处理多个并发的异步操作，并在所有操作都完成后执行特定的回调。

6. **顺序执行**：Promise 允许你按顺序执行异步操作，而不需要在每个步骤中手动传递回调函数。

7. **更好的控制流程**：使用 `async` 和 `await`，你可以以一种更接近同步代码的方式来编写异步逻辑，这使得代码更加直观和易于理解。

8. **避免阻塞**：在某些情况下，回调函数可能会导致程序阻塞，尤其是在错误处理不当的情况下。Promise 提供了一种更流畅的方式来避免这种情况。

总的来说，Promise 提供了一种更加强大、灵活和可读性更强的方式来处理 JavaScript 中的异步操作，极大地改善了开发体验。

## Promise 与 async/await 有什么不同，它们在实际开发中应该如何选择使用？

Promise 和 async/await 都是处理 JavaScript 中异步操作的方式，但它们之间存在一些关键的区别。以下是它们的主要不同点以及在实际开发中的使用选择建议：

### Promise
- **定义**：Promise 是一种对象，代表了一个异步操作的最终完成或失败。
- **语法**：使用 `.then()` 和 `.catch()` 方法来指定操作成功或失败时的回调函数。
- **链式调用**：可以进行链式调用，但深层嵌套的 `.then()` 可能导致所谓的 "回调地狱"。
- **错误处理**：需要在每个 Promise 链中明确处理错误，否则未捕获的错误可能会被忽略。

### async/await
- **定义**：`async` 和 `await` 是建立在 Promise 之上的语法糖，使得异步代码看起来和写起来更像同步代码。
- **语法**：`async` 关键字用于声明一个函数或块是异步的，`await` 关键字用于等待一个 Promise 解决。
- **可读性**：使得异步代码更易于阅读和理解，因为它减少了回调和 Promise 链的复杂性。
- **错误处理**：可以使用传统的 `try/catch` 语句来处理错误，这使得错误处理更直观和一致。

### 在实际开发中的选择使用

1. **可读性和简洁性**：
   - 如果你倾向于写更简洁、更易读的代码，**推荐使用 async/await**。它让异步代码的流程看起来更直观。

2. **错误处理**：
   - 如果你需要更直观的错误处理方式，**推荐使用 async/await**，因为它允许使用 `try/catch` 块。

3. **代码复杂性**：
   - 对于复杂的异步逻辑，特别是涉及多个并行或依赖的异步操作，**使用 Promise** 可能更灵活，尤其是结合 `Promise.all()`、`Promise.race()` 等方法。

4. **库和框架的兼容性**：
   - 如果你正在使用的库或框架主要返回 Promise，可能需要**使用 Promise** 来与它们交互，尽管 async/await 也可以与 Promise 一起使用。

5. **团队习惯和代码风格**：
   - 考虑团队的熟悉度和代码风格。如果团队更熟悉 Promise，或者项目中已经广泛使用了 Promise，那么**继续使用 Promise** 可能是更好的选择。

6. **逐步迁移**：
   - 如果你正在维护一个已经使用 Promise 的大型项目，可能需要逐步迁移到 async/await，以保持代码的一致性。

7. **环境支持**：
   - 虽然现代浏览器和 Node.js 都支持 async/await，但如果你的目标环境需要支持较旧的 JavaScript 引擎，可能需要考虑 Promise 的兼容性。

总的来说，async/await 通常被认为是更现代、更易于使用的方式，但在某些情况下，Promise 可能更适合。在实际开发中，理解两者的优缺点，并根据具体需求和上下文选择最合适的工具。

## 分别给出二者具体的例子

### Promise 示例

假设我们有一个函数 `getData`，它返回一个 Promise，这个 Promise 在异步操作完成后解析一些数据。

```javascript
function getData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("这是数据");
    }, 1000);
  });
}

// 使用 Promise 进行异步操作
getData()
  .then(data => {
    console.log(data); // "这是数据"
    return "更多数据";
  })
  .then(data => {
    console.log(data); // "更多数据"
  })
  .catch(error => {
    console.error(error);
  });
```

### async/await 示例

使用 `async/await`，我们可以重写上述的异步操作，使其看起来更像是同步代码。

```javascript
// 声明一个异步函数
async function fetchData() {
  try {
    // 等待 Promise 解决
    const data = await getData();
    console.log(data); // "这是数据"
    
    // 可以继续进行其他异步操作
    const moreData = await getData();
    console.log(moreData); // "这是数据"
  } catch (error) {
    // 捕获异步操作中的错误
    console.error(error);
  }
}

// 调用异步函数
fetchData();
```

### 错误处理的对比

使用 Promise 时，如果 `getData` 函数中的异步操作失败，你需要在 `.then()` 链的最后使用 `.catch()` 来捕获错误：

```javascript
getData()
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    // 处理错误
    console.error(error);
  });
```

使用 async/await，错误处理使用传统的 `try/catch` 语句，这使得错误处理看起来更自然：

```javascript
async function fetchData() {
  try {
    const data = await getData();
    console.log(data);
  } catch (error) {
    // 处理错误
    console.error(error);
  }
}
```

### 并发执行的对比

使用 Promise，你可以使用 `Promise.all()` 来并发执行多个异步操作：

```javascript
Promise.all([getData(), getData()])
  .then(([data1, data2]) => {
    console.log(data1, data2); // 两个 Promise 都解决后的数据
  });
```

使用 async/await，你可以使用 `Promise.all` 结合 `await` 来达到同样的效果：

```javascript
async function fetchAllData() {
  try {
    // 等待所有 Promise 都解决
    const [data1, data2] = await Promise.all([getData(), getData()]);
    console.log(data1, data2);
  } catch (error) {
    console.error(error);
  }
}
```

在实际开发中，选择使用 Promise 或 async/await 通常取决于个人偏好、代码可读性和项目需求。

## 在 JavaScript 中，除了 Promise 和 async/await，还有哪些处理异步操作的方法？

在 JavaScript 中，除了 Promise 和 async/await，还有其他几种处理异步操作的方法：

1. **回调函数（Callbacks）**:
   - 这是最传统的异步处理方式。例如，许多 Node.js 的 API 使用回调函数来处理异步操作。
   - 缺点是可能导致“回调地狱”，当多个异步操作嵌套时，代码可读性差。

   ```javascript
   function asyncOperation(callback) {
     setTimeout(() => {
       callback('结果');
     }, 1000);
   }

   asyncOperation(result => {
     console.log(result);
   });
   ```

2. **事件发射器（Event Emitters）**:
   - 主要用于 Node.js 中，基于事件的异步编程模型。
   - 使用 `.on()`、`.emit()` 和 `.off()` 方法来注册事件监听器、触发事件和移除事件监听器。

   ```javascript
   const EventEmitter = require('events');
   const emitter = new EventEmitter();

   emitter.on('message', data => {
     console.log(data);
   });

   // 触发 'message' 事件
   emitter.emit('message', 'Hello, World!');
   ```

3. **观察者模式（Observers）**:
   - 这是一种设计模式，允许对象订阅和接收通知，当某个事件或状态发生变化时。

4. **生成器函数（Generators）**:
   - 使用 `function*` 和 `yield` 关键字，可以暂停和恢复函数的执行。
   - 与 Promise 结合使用，可以优雅地处理异步流。

   ```javascript
   function* generator() {
     const result = yield Promise.resolve('Hello');
     console.log(result);
   }

   const gen = generator();
   gen.next().value.then(data => gen.next(data));
   ```

5. **async 迭代器（Async Iterators）**:
   - 允许异步迭代，使用 `async function*` 创建迭代器，并使用 `for await...of` 进行迭代。

   ```javascript
   async function* asyncGenerator() {
     yield Promise.resolve(1);
     yield Promise.resolve(2);
   }

   async function iterateAsync() {
     for await (const value of asyncGenerator()) {
       console.log(value);
     }
   }
   ```

6. **RxJS 和其他响应式编程库**:
   - 这些库提供了更复杂的响应式编程模型，用于处理异步数据流。

7. **Thunk 函数**:
   - 在函数式编程中，Thunk 函数是一种延迟计算的技术，常用于处理高阶函数。

8. **Node.js Streams**:
   - 用于处理流式数据，例如文件读写、网络传输等。

9. **CSP（Communicating Sequential Processes）**:
   - 一个并发编程模型，通过通道（channels）来传递消息。

10. **Worker 线程（Web Workers）**:
    - 在浏览器中，Web Workers 允许在后台线程运行脚本，不干扰用户界面的响应。

每种方法都有其适用场景，开发者可以根据具体需求和上下文选择最合适的异步处理方式。

随着 JavaScript 的发展，Promise 和 async/await 成为了主流的异步编程解决方案，但了解其他方法可以帮助我们更好地解决特定的问题。


# 参考资料


* any list
{:toc}