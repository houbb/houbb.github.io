---
layout: post
title:  NodeJs-06 Event Loop
date:  2018-04-27 18:07:14 +0800
categories: [NodeJs]
tags: [js, nodejs]
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

# TODO...

* any list
{:toc}