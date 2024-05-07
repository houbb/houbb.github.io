---
layout: post
title:  NodeJs-06 Event Loop
date:  2018-04-27 18:07:14 +0800
categories: [NodeJs]
tags: [js, nodejs, nodejs-learn, js-learn]
published: true
---

# Event Loop

Event Loop 可以让 Node.js 实现非阻塞的 IO 操作，尽管 Node.js 本身是单线程的。

Node.js 通过将自身的操作卸载到操作系统中，现在的操作系统大多数是多核的，

可以再后台处理多个操作，并且当操作完成之后，会在合适的时间通知 Node.js，让 Node.js 拿到真正的执行结果。

# Event Loop 解释

Node.js 启动时，开始初始化 Event Loop，用来执行输入的脚本。可以调用异步 Api，定时 Timers 或者执行 `process.nextTick()`，

然后开始执行 Event Loop。

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

每个阶段都有个 FIFO 的队列用于执行回调。
每一个阶段都被指定一个特有的通道，通常，当 event loop 进入一个给定的阶段，
他将会执行这个阶段指定的任何操作。
接下来，执行 callback 在这个阶段的队列，知道这个队列已经空了或者已经执行了最大上限的回调。
当队列已经空了或者已经达到最大上限，event loop 当进入下一个阶段，依次进行。

由于这些操作中的任何一个都可以调度更多的操作，在轮询阶段处理的新事件被内核排队，轮询事件可以在轮询事件正在处理的情况下排队。
因此，长时间运行的回调可以允许轮询阶段运行的时间比计时器的阈值长得多。
有关更多细节，请参阅[计时器](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#timers)
和[poll](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#poll)部分


# 阶段 overview

## timers: 

this phase executes callbacks scheduled by `setTimeout()` and `setInterval()`.

## pending callbacks: 

executes I/O callbacks deferred to the next loop iteration.

## idle, prepare: 

only used internally.

## poll: 

retrieve new I/O events; execute I/O related callbacks (almost all with the exception of close callbacks, the ones scheduled by timers, and setImmediate()); node will block here when appropriate.

## check: 

`setImmediate()` callbacks are invoked here.

## close callbacks: 

some close callbacks, e.g. socket.on('close', ...).

在每次事件循环的运行之间，Node.js 都会检查是否有等待的异步 I/O 或者计时器，如果没有就直接关闭。

# 阶段详情

## timers

定时器指定了一个阈值，在这个阈值之后，一个提供的回调可能被执行，而不是一个人希望它被执行的确切时间。
计时器回调将在指定的时间结束后，尽早运行;但是，操作系统调度或其他回调的运行可能会延迟它们。

例如，假设您计划在100 ms阈值后执行一个超时，那么您的脚本开始异步读取一个需要95 ms的文件:

```js
const fs = require('fs');

function someAsyncOperation(callback) {
  // Assume this takes 95ms to complete
  fs.readFile('/path/to/file', callback);
}

const timeoutScheduled = Date.now();

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;

  console.log(`${delay}ms have passed since I was scheduled`);
}, 100);


// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
  const startCallback = Date.now();

  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    // do nothing
  }
});
```

当事件循环进入轮询阶段时，它有一个空队列(`fs.readFile()`尚未完成)，因此它将等待剩余的ms数，直到达到最快的计时器的阈值为止。
当它等待95 ms pass时，fs.readFile()读取该文件，它的回调需要10 ms完成，然后添加到poll队列并执行。
当回调结束时，队列中不再有回调函数，因此事件循环将会看到最快的计时器的阈值已经到达，然后返回计时器阶段以执行计时器的回调。
在这个示例中，您将看到计时器被调度的时间和被执行的回调之间的总延迟将是105ms。

## pending callbacks

这个阶段为一些系统操作执行回调，比如TCP错误的类型。
例如，如果TCP套接字在尝试连接时收到`ECONNREFUSED`，一些 `*nix` 系统要等待报告错误。这将在pending callbacks阶段中排队执行。

## poll

poll 阶段有两个主要功能:

- 计算I/O应该阻塞和轮询的时间。

- 在轮询队列中处理事件。

当事件循环进入轮询阶段，没有定时器安排时，将会发生以下两种情况:

(1) 如果poll队列不是空的，事件循环将通过它的回调队列进行迭代，直到队列已经耗尽，或者达到系统依赖的硬限制(hard limit)为止。

(2) 如果轮询队列是空的，则会发生以下两种情况:

- 如果脚本是由 `setImmediate()` 调度的，事件循环将结束轮询阶段，并继续执行检查阶段以执行那些预定的脚本。

- 如果脚本没有被 `setImmediate()` 调度，则事件循环将等待将回调添加到队列中，然后立即执行它们。

一旦轮询队列为空，事件循环将检查其时间阈值已达到的计时器。如果有一个或多个计时器准备就绪，事件循环将返回到计时器阶段，以执行这些计时器的回调。

## check

这个阶段允许一个人在轮训阶段(poll phase)完成后立即执行回调。
如果轮询阶段变为空闲状态，并且脚本已经与 `setImmediate()` 一起排队，则事件循环可能会继续到检查阶段，而不是等待。

`setImmediate()` 实际上是一个特殊的计时器，它运行在事件循环的一个单独的阶段。它使用一个libuv API，在轮询阶段完成之后，调度回调执行。

一般来说,执行代码,事件循环最终会达到调查阶段,在该状态中将等待传入连接,请求,等等。
但是,如果一个回调将 `setImmediate()` 和调查阶段变为空闲时,它将结束,继续检查阶段而不是等待调查事件。

## close callbacks

如果一个套接字或句柄被突然关闭(例如，socket.destroy())，“关闭”事件将在此阶段发出。否则，它将通过 `process.nextTick()` 发出。

# setImmediate() vs setTimeout()

- `setImmediate()` is designed to execute a script once the current poll phase completes.

- `setTimeout()` schedules a script to be run after a minimum threshold in ms has elapsed.

执行计时器的顺序将根据调用它们的上下文而变化。
如果两个都是从主模块中调用，那么时间将受到进程性能的约束(这可能会受到运行在机器上的其他应用程序的影响)。

## 执行顺序-不在 IO 循环

例如，如果我们运行的脚本不是在I/O循环中(即主模块)，那么执行两个定时器的顺序是不确定的，因为它受过程性能的约束:

- code

```js
// timeout_vs_immediate.js
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});
```

- 测试 & 结果

```
$ node timeout_vs_immediate.js
timeout
immediate

$ node timeout_vs_immediate.js
immediate
timeout
```

## 执行顺序-在 IO 循环

如果二者都在 IO 循环中，**immediate callback 永远首先被执行**。(这也正是优点)

```js
// timeout_vs_immediate.js
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
```

- 测试 & 结果

```
$ node timeout_vs_immediate.js
immediate
timeout

$ node timeout_vs_immediate.js
immediate
timeout
```

# process.nextTick()

## 理解

您可能已经注意到，尽管它是异步API的一部分，但在图中没有显示 `process.nextTick()`。
这是因为 `process.nextTick()` 在技术上不是事件循环的一部分。
相反，不管事件循环的当前阶段如何，nextTickQueue 将在当前操作完成后进行处理。

回头看我们的图表，任何时候调用 `process.nextTick()` 在给定的阶段，所有回调都传递给 `process.nextTick()` 将在事件循环继续之前得到解决。
这可能会造成一些糟糕的情况，因为它允许您通过递归 `process.nextTick()` 调用来“饿死”您的I/O，从而阻止事件循环到达 poll 阶段。

## Why would that be allowed?

为什么会有这样的东西包含在Node.js中?

它的一部分是设计理念，API应该始终是异步的，即使在不需要的地方也是如此。以这个代码片段为例:

```js
function apiCall(arg, callback) {
  if (typeof arg !== 'string')
    return process.nextTick(callback,
                            new TypeError('argument should be string'));
}
```

该代码段执行一个参数检查，如果它不正确，它将把错误传递给回调。
最近更新的API允许将参数传递给 `process.nextTick()`，允许它在回调后传递的任何参数作为回调的参数，这样就不必嵌套函数了。

我们所做的是将错误传递给用户，但只有在我们允许用户代码的其余部分执行之后。
通过使用 `process.nextTick()`，我们保证 apiCall()总是在用户代码的其余部分和事件循环允许进行之前运行它的回调。
为了实现这一点，JS调用堆栈允许unwind，然后立即执行所提供的回调，
允许一个人在没有到达RangeError的情况下对 `process.nextTick()`进行递归调用。

## 潜在问题

这种理念(philosophy)会导致一些潜在的问题。以这个片段为例:

```js
let bar;

// this has an asynchronous signature, but calls callback synchronously
function someAsyncApiCall(callback) { callback(); }

// the callback is called before `someAsyncApiCall` completes.
someAsyncApiCall(() => {
  // since someAsyncApiCall has completed, bar hasn't been assigned any value
  console.log('bar', bar); // undefined
});

bar = 1;
```

用户定义了一些 `someAsyncApiCall()` 且此方法拥有异步的名称，但是它实际上是同步操作的。
当它被调用时，提供给someAsyncApiCall()的回调被调用在事件循环的同一阶段，因为someAsyncApiCall()实际上并没有异步地做任何事情。
因此，回调尝试引用bar，尽管它在范围内可能没有那个变量，因为脚本无法运行到完成。

通过将回调放在一个process.nextTick()中，脚本仍然具有运行到完成的能力，允许在调用回调之前对所有变量、函数等进行初始化。
它还具有不允许事件循环继续的优点。在允许事件循环继续之前，提醒用户注意错误可能是有用的。下面是使用process.nextTick()的前一个示例:

```js
let bar;

function someAsyncApiCall(callback) {
  process.nextTick(callback);
}

someAsyncApiCall(() => {
  console.log('bar', bar); // 1
});

bar = 1;
```

### 其他的例子

```js
const server = net.createServer(() => {}).listen(8080);

server.on('listening', () => {});
```

当仅通过一个端口时，端口立即被绑定。因此，可以立即调用“监听”回调。问题是，在那个时候没有设置 `.on('listening')` 回调。

为了解决这个问题，`listening` 事件将在nextTick()中排队，以允许脚本运行到完成。这允许用户设置他们想要的任何事件处理程序。

# process.nextTick() vs setImmediate()

- process.nextTick() fires immediately on the same phase

- setImmediate() fires on the following iteration or 'tick' of the event loop


本质上，名称应该被交换。nextTick() 比setImmediate()更容易触发，但这是过去的一个工件，不太可能发生变化。
做这个开关会在npm上破坏大量的软件包。每天都有更多的新模块被添加进来，这意味着我们每天都在等待，更多潜在的破坏发生。
虽然他们很困惑，但名字本身不会改变。

我们建议开发人员在**所有情况下使用setImmediate()**，因为它更容易推理(而且它会导致代码与更广泛的环境兼容，比如浏览器JS)。

# Why use process.nextTick()?

主要2个原因：

1. 允许用户处理错误，清除任何不必要的资源，或者在事件循环继续之前尝试再次请求。

2. 有时，有必要允许回调在调用堆栈解除后运行，但在事件循环继续之前。

## 符合用户期望的例子

```js
const server = net.createServer();
server.on('connection', (conn) => { });

server.listen(8080);
server.on('listening', () => { });
```

listen()是在事件循环的开头运行的，但是监听回调被放置在setImmediate()中。
除非通过了主机名，否则将立即绑定到端口。对于要进行的事件循环，它必须击中轮询阶段，这意味着有一个非零的机会，
连接可以被接收，允许连接事件在监听事件之前被触发。

## 另一个例子

另一个示例是运行一个函数构造函数，继承自 EventEmitter ，并希望在构造函数中调用事件:

```js
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);
  this.emit('event');
}
util.inherits(MyEmitter, EventEmitter);

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```

您不能立即从构造函数中发出事件，因为脚本不会处理到用户为该事件分配回调的位置。
因此，在构造函数本身中，您可以使用process.nextTick()来设置一个回调以在构造函数完成后发出事件，它提供了预期的结果:

```js
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);

  // use nextTick to emit the event once a handler is assigned
  process.nextTick(() => {
    this.emit('event');
  });
}
util.inherits(MyEmitter, EventEmitter);

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```

* any list
{:toc}