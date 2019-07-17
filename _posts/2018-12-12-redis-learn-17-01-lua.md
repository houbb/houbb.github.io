---
layout: post
title: Redis Learn-17-01-Lua 脚本 Eval
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, lua, sh]
published: true
---

# 支持情况

Available since 2.6.0.

Time complexity（复杂度）: Depends on the script that is executed.

# Introduction to EVAL

EVAL and EVALSHA are used to evaluate scripts using the Lua interpreter（解释器） built into Redis starting from version 2.6.0.

## 参数介绍

The first argument of EVAL is a Lua 5.1 script. 

The script does not need to define a Lua function (and should not). 

It is just a Lua program that will run in the context of the Redis server.

The second argument of EVAL is the number of arguments that follows the script (starting from the third argument) that represent Redis key names. 

The arguments can be accessed by Lua using the KEYS global variable in the form of a one-based array (so KEYS[1], KEYS[2], ...).

All the additional arguments should not represent（重复） key names and can be accessed by Lua using the ARGV global variable, very similarly to what happens with keys (so ARGV[1], ARGV[2], ...).

## 例子

The following example should clarify（解释说明） what stated above:

```
> eval "return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}" 2 key1 key2 first second
1) "key1"
2) "key2"
3) "first"
4) "second"
```

### 注意

Note: as you can see Lua arrays are returned as Redis multi bulk replies（多批量回复）, that is a Redis return type that your client library will likely convert into an Array type in your programming language.

It is possible to call Redis commands from a Lua script using two different Lua functions:

# 调用方式

## 两种方式的异同

It is possible to call Redis commands from a Lua script using two different Lua functions:

```
redis.call()
redis.pcall()
```

redis.call() is similar to redis.pcall(), the only difference is that if a Redis command call will result in an error.

redis.call() will raise a Lua error that in turn will force EVAL to return an error to the command caller, 
while redis.pcall() will trap the error and return a Lua table representing the error.

- trap the error

个人理解是捕获这个异常（为异常设置一个陷阱），然后返回一个 lua 的 table 来展示异常。

## 参数

The arguments of the redis.call() and redis.pcall() functions are all the arguments of a well formed（形成） Redis command:

```
> eval "return redis.call('set','foo','bar')" 0
OK
```

The above script sets the key foo to the string bar. 

However it violates（违反） the EVAL command semantics（语义） as all the keys that the script uses should be passed using the KEYS array:

```
> eval "return redis.call('set',KEYS[1],'bar')" 1 foo
OK
```

All Redis commands must be analyzed before execution to determine（确定） which keys the command will operate on. 

In order for this to be true for EVAL, keys must be passed explicitly. （显式传递）

This is useful in many ways, but especially to make sure Redis Cluster can forward your request to the appropriate cluster node.

Note this rule is not enforced in order to provide the user with opportunities（机会） to abuse the Redis single instance configuration, at the cost of writing scripts not compatible with Redis Cluster.

# Conversion between Lua and Redis data types

## 类型转换

Lua scripts can return a value that is converted from the Lua type to the Redis protocol using a set of conversion rules.

Redis return values are converted into Lua data types when Lua calls a Redis command using call() or pcall(). 

Similarly, Lua data types are converted into the Redis protocol when calling a Redis command and when a Lua script returns a value, so that scripts can control what EVAL will return to the client.

This conversion between data types is designed in a way that if a Redis type is converted into a Lua type, and then the result is converted back into a Redis type, the result is the same as the initial value.

In other words there is a one-to-one（一一对应） conversion between Lua and Redis types. 

- 个人理解

其实和 jdbc 与数据库的类型转换类似，不同设计之间的语言都需要一种转换方式，这种方式必须在一定的规则之下，是固定的。

不然会引起混乱。

## 转换规则

The following table shows you all the conversions rules:

### Redis to Lua conversion table.

```
Redis integer reply -> Lua number
Redis bulk reply -> Lua string
Redis multi bulk reply -> Lua table (may have other Redis data types nested)
Redis status reply -> Lua table with a single ok field containing the status
Redis error reply -> Lua table with a single err field containing the error
Redis Nil bulk reply and Nil multi bulk reply -> Lua false boolean type
```

### Lua to Redis conversion table.

```
Lua number -> Redis integer reply (the number is converted into an integer)
Lua string -> Redis bulk reply
Lua table (array) -> Redis multi bulk reply (truncated to the first nil inside the Lua array if any)
Lua table with a single ok field -> Redis status reply
Lua table with a single err field -> Redis error reply
Lua boolean false -> Redis Nil bulk reply.
```

There is an additional Lua-to-Redis conversion rule that has no corresponding（一致性） Redis to Lua conversion rule:

```
Lua boolean true -> Redis integer reply with value of 1.
```

### 注意点

Also there are two important rules to note:

1）Lua has a single numerical type, Lua numbers. 

There is no distinction between integers and floats. 

So we always convert Lua numbers into integer replies, removing the decimal part of the number if any. 

If you want to return a float from Lua you should return it as a string, exactly like Redis itself does (see for instance the ZSCORE command).

2）There is no simple way to have nils inside Lua arrays, this is a result of Lua table semantics, so when Redis converts a Lua array into Redis protocol the conversion is stopped if a nil is encountered.

ps: 这两点应该都是 lua 脚本本身的特性决定的。

## 转换例子

- 确切的返回值

```
> eval "return 10" 0
(integer) 10

> eval "return {1,2,{3,'Hello World!'}}" 0
1) (integer) 1
2) (integer) 2
3) 1) (integer) 3
   2) "Hello World!"

> eval "return redis.call('get','foo')" 0
"bar"
```

The last example shows how it is possible to receive the exact return value of redis.call() or redis.pcall() from Lua that would be returned if the command was called directly.


- float 与数组空值的处理

In the following example we can see how floats and arrays with nils are handled:

```
> eval "return {1,2,3.3333,'foo',nil,'bar'}" 0
1) (integer) 1
2) (integer) 2
3) (integer) 3
4) "foo"
```

As you can see 3.333 is converted into 3, and the bar string is never returned as there is a nil before.

ps: 这里处理数组，如果遇到 nil，后面的信息直接就停止解析了。(when Redis converts a Lua array into Redis protocol the conversion is stopped if a nil is encountered.)

## Helper functions to return Redis types

There are two helper functions to return Redis types from Lua.

`redis.error_reply(error_string)` returns an error reply. 

This function simply returns a single field table with the err field set to the specified string for you.

`redis.status_reply(status_string)` returns a status reply. 

This function simply returns a single field table with the ok field set to the specified string for you.

### 使用帮助类和直接返回的等价性

There is no difference between using the helper functions or directly returning the table with the specified format, so the following two forms are equivalent:

```
return {err="My Error"}
return redis.error_reply("My Error")
```

# Atomicity of scripts

Redis uses the same Lua interpreter to run all the commands. 

Also Redis guarantees（担保） that a script is executed in an atomic way: no other script or Redis command will be executed while a script is being executed. 

This semantic is similar to the one of `MULTI/EXEC`. 

From the point of view of all the other clients the effects of a script are either still not visible or already completed.

However this also means that executing slow scripts is not a good idea. 

It is not hard to create fast scripts, as the script overhead is very low, but if you are going to use slow scripts you should be aware that while the script is running no other client can execute commands.

## 优点

执行时，redis 保证原子性。

## 注意

正因为保证原子性（执行时，不会有其他命令被同时执行），加上 redis 本身是单线程的。

换句话说，执行脚本的时候，其他命令都会被阻塞，所以作者说不要执行慢脚本。

# Error handling

As already stated, calls to redis.call() resulting in a Redis command error will stop the execution of the script and return an error, in a way that makes it obvious（明显地） that the error was generated by a script:

```
> del foo
(integer) 1
> lpush foo a
(integer) 1
> eval "return redis.call('get','foo')" 0
(error) ERR Error running script (call to f_6b1bf486c81ceb7edf3c093f4c48582e38c0e791): ERR Operation against a key holding the wrong kind of value
```

Using redis.pcall() no error is raised, but an error object is returned in the format specified above (as a Lua table with an err field). 

The script can pass the exact error to the user by returning the error object returned by redis.pcall().

# Bandwidth（带宽） and EVALSHA

The EVAL command forces you to send the script body again and again. 

Redis does not need to recompile the script every time as it uses an internal caching mechanism, however paying the cost of the additional bandwidth may not be optimal in many contexts.

## 一些缺陷

On the other hand, defining commands using a special command or via `redis.conf` would be a problem for a few reasons:

1）Different instances may have different implementations of a command.

2）Deployment is hard if we have to make sure all instances contain a given command, especially in a distributed environment.

3）Reading application code, the complete semantics might not be clear since the application calls commands defined server side.

## EVALSHA

In order to avoid these problems while avoiding the bandwidth penalty, Redis implements the `EVALSHA` command.

EVALSHA works exactly like EVAL, but instead of having a script as the first argument it has the SHA1 digest of a script. 

ps: SHA 是指 SHA1 hash 算法

### 执行行为

The behavior is the following:

1）If the server still remembers a script with a matching SHA1 digest, the script is executed.

2）If the server does not remember a script with this SHA1 digest, a special error is returned telling the client to use EVAL instead.

## 例子

```
> set foo bar
OK
> eval "return redis.call('get','foo')" 0
"bar"
> evalsha 6b1bf486c81ceb7edf3c093f4c48582e38c0e791 0
"bar"
> evalsha ffffffffffffffffffffffffffffffffffffffff 0
(error) `NOSCRIPT` No matching script. Please use [EVAL](/commands/eval).
```

The client library implementation can always optimistically（乐观地） send EVALSHA under the hood even when the client actually calls EVAL, in the hope the script was already seen by the server. 

If the `NOSCRIPT` error is returned EVAL will be used instead.

Passing keys and arguments as additional EVAL arguments is also very useful in this context as the script string remains constant and can be efficiently cached by Redis.


# Script cache semantics

Executed scripts are guaranteed（保证） to be in the script cache of a given execution of a Redis instance forever. 

This means that if an EVAL is performed against a Redis instance all the subsequent（随后） EVALSHA calls will succeed.

## 原因解释

The reason why scripts can be cached for long time is that it is unlikely for a well written application to have enough different scripts to cause memory problems. 

Every script is conceptually（概念） like the implementation of a new command, and even a large application will likely have just a few hundred of them. 

Even if the application is modified many times and scripts will change, the memory used is negligible（微不足道）.

- 个人感受

这种针对脚本只会有几百个的假设，可见作者一直是一个乐观务实的人。

乐观使得程序简单，没有过度设计，性能也很快。

## 如何刷新脚本缓存

The only way to flush the script cache is by explicitly calling the `SCRIPT FLUSH` command, which will completely flush the scripts cache removing all the scripts executed so far.

This is usually needed only when the instance is going to be instantiated for another customer or application in a cloud environment.

Also, as already mentioned, restarting a Redis instance flushes the script cache, which is not persistent. 

However from the point of view of the client there are only two ways to make sure a Redis instance was not restarted between two different commands.

1）The connection we have with the server is persistent and was never closed so far.

2）The client explicitly checks the runid field in the `INFO` command in order to make sure the server was not restarted and is still the same process.

Practically speaking, for the client it is much better to simply assume that in the context of a given connection, cached scripts are guaranteed to be there unless an administrator explicitly called the SCRIPT FLUSH command.

The fact that the user can count on Redis not removing scripts is semantically（语义） useful in the context of pipelining.

For instance an application with a persistent connection to Redis can be sure that if a script was sent once it is still in memory, so EVALSHA can be used against those scripts in a pipeline without the chance of an error being generated due to an unknown script (we'll see this problem in detail later).

## SCRIPT LOAD

A common pattern is to call `SCRIPT LOAD` to load all the scripts that will appear in a pipeline, 
then use `EVALSHA` directly inside the pipeline without any need to check for errors resulting from the script hash not being recognized.

# 脚本命令

Redis offers a SCRIPT command that can be used in order to control the scripting subsystem. 

SCRIPT currently accepts three different commands:

## SCRIPT FLUSH

This command is the only way to force Redis to flush the scripts cache. 

It is most useful in a cloud environment where the same instance can be reassigned to a different user. 

It is also useful for testing client libraries' implementations of the scripting feature.

## SCRIPT EXISTS sha1 sha2 ... shaN

Given a list of SHA1 digests as arguments this command returns an array of 1 or 0, where 1 means the specific SHA1 is recognized as a script already present in the scripting cache, while 0 means that a script with this SHA1 was never seen before (or at least never seen after the latest SCRIPT FLUSH command).

## SCRIPT LOAD script

This command registers the specified script in the Redis script cache. The command is useful in all the contexts where we want to make sure that EVALSHA will not fail (for instance during a pipeline or MULTI/EXEC operation), without the need to actually execute the script.

## SCRIPT KILL

This command is the only way to interrupt a long-running script that reaches the configured maximum execution time for scripts. 

The SCRIPT KILL command can only be used with scripts that did not modify the dataset during their execution (since stopping a read-only script does not violate the scripting engine's guaranteed atomicity). 

See the next sections for more information about long running scripts.

# Scripts as pure functions

- 注意

starting with Redis 5, scripts are always replicated as effects and not sending the script verbatim（逐字）. 

So the following section is mostly applicable to Redis version 4 or older.

A very important part of scripting is writing scripts that are pure functions. 

## 传播方式及其优缺点

Scripts executed in a Redis instance are, by default, propagated（传播） to replicas（副本） and to the AOF file by sending the script itself -- not the resulting commands.

The reason is that sending a script to another Redis instance is often much faster than sending the multiple commands the script generates, so if the client is sending many scripts to the master, converting the scripts into individual commands for the replica / AOF would result in too much bandwidth for the replication link or the Append Only File (and also too much CPU since dispatching a command received via network is a lot more work for Redis compared to dispatching a command invoked by Lua scripts).

Normally replicating scripts instead of the effects of the scripts makes sense, however not in all the cases. 

So starting with Redis 3.2, the scripting engine is able to, alternatively（可选的）, replicate the sequence of write commands resulting from the script execution, instead of replication the script itself. 

See the next section for more information. 

# 备份整个脚本

In this section we'll assume that scripts are replicated by sending the whole script. 

Let's call this replication mode whole scripts replication.

The main drawback（缺陷） with the whole scripts replication approach is that scripts are required to have the following property:

1）The script must always evaluates the same Redis write commands with the same arguments given the same input data set. 

Operations performed by the script cannot depend on any hidden (non-explicit) information or state that may change as script execution proceeds or between different executions of the script, nor can it depend on any external input from I/O devices.

Things like using the system time, calling Redis random commands like RANDOMKEY, or using Lua random number generator, could result into scripts that will not always evaluate in the same way.

2）Lua does not export commands to access the system time or other external state.

Redis will block the script with an error if a script calls a Redis command able to alter the data set after a Redis random command like RANDOMKEY, SRANDMEMBER, TIME. 

This means that if a script is read-only and does not modify the data set it is free to call those commands. 

Note that a random command does not necessarily mean a command that uses random numbers: any non-deterministic（非确定性） command is considered a random command (the best example in this regard is the TIME command).

3）In Redis version 4, commands that may return elements **in random order（乱序）**, like SMEMBERS (because Redis Sets are unordered) have a different behavior when called from Lua, and undergo a silent lexicographical（词典） sorting filter before returning data to Lua scripts. 

So `redis.call("smembers",KEYS[1])` will always return the Set elements in the same order, while the same command invoked from normal clients may return different results even if the key contains exactly the same elements.

However starting with Redis 5 there is no longer such ordering step, because Redis 5 replicates scripts in a way that no longer needs non-deterministic commands to be converted into deterministic ones. 

In general, even when developing for Redis 4, never assume that certain commands in Lua will be ordered, but instead rely on the documentation of the original command you call to see the properties it provides.

- 个人感受

确定的参数，却返回无序的结果。

这是一种比较严重的问题。

因为编程，就是在这个不确定的世界追求一部分的确定性。

4）Lua pseudo（伪） random number generation functions math.random and math.randomseed are modified in order to always have the same seed every time a new script is executed. 

This means that calling math.random will always generate the same sequence of numbers every time a script is executed if math.randomseed is not used.

## 随机函数问题

However the user is still able to write commands with random behavior using the following simple trick. 

Imagine I want to write a Redis script that will populate a list with N random integers.

### 默认情况

I can start with this small Ruby program:

```ruby
require 'rubygems'
require 'redis'

r = Redis.new

RandomPushScript = <<EOF
    local i = tonumber(ARGV[1])
    local res
    while (i > 0) do
        res = redis.call('lpush',KEYS[1],math.random())
        i = i-1
    end
    return res
EOF

r.del(:mylist)
puts r.eval(RandomPushScript,[:mylist],[10,rand(2**32)])
```

Every time this script executed the resulting list will have exactly the following elements:

```
> lrange mylist 0 -1
 1) "0.74509509873814"
 2) "0.87390407681181"
 3) "0.36876626981831"
 4) "0.6921941534114"
 5) "0.7857992587545"
 6) "0.57730350670279"
 7) "0.87046522734243"
 8) "0.09637165539729"
 9) "0.74990198051087"
10) "0.17082803611217"
```

### 如何使得结果变化？

In order to make it a pure function, but still be sure that every invocation of the script will result in different random elements, we can simply add an additional argument to the script that will be used in order to seed the Lua pseudo-random number generator. 

The new script is as follows:

```ruby
RandomPushScript = <<EOF
    local i = tonumber(ARGV[1])
    local res
    math.randomseed(tonumber(ARGV[2]))
    while (i > 0) do
        res = redis.call('lpush',KEYS[1],math.random())
        i = i-1
    end
    return res
EOF

r.del(:mylist)
puts r.eval(RandomPushScript,1,:mylist,10,rand(2**32))
```

What we are doing here is sending the seed of the PRNG as one of the arguments. 

This way the script output will be the same given the same arguments, but we are changing one of the arguments in every invocation, generating the random seed client-side. 

The seed will be propagated（传播） as one of the arguments both in the replication link and in the Append Only File, guaranteeing（担保） that the same changes will be generated when the AOF is reloaded or when the replica processes the script.

Note: an important part of this behavior is that the PRNG that Redis implements as `math.random` and `math.randomseed` is guaranteed to have the same output regardless of the architecture of the system running Redis. 32-bit, 64-bit, big-endian and little-endian systems will all produce the same output.

# Replicating commands instead of scripts

## script effects replication

Note: starting with Redis 5, the replication method described in this section (scripts effects replication) is the default and does not need to be explicitly enabled.

Starting with Redis 3.2, it is possible to select an alternative replication method. 

Instead of replication whole scripts, we can just replicate single write commands generated by the script. 

We call this **script effects replication.**

- 个人理解

比起备份所有的脚本，不如直接备份脚本产生影响的脚本来的更加高效。

## 适用场景

This is useful in several ways depending on the use case:

1）When the script is slow to compute, but the effects can be summarized by a few write commands, it is a shame to re-compute the script on the replicas or when reloading the AOF. In this case to replicate just the effect of the script is much better.

2）When script effects replication is enabled, the controls about non deterministic functions are disabled. 

You can, for example, use the TIME or SRANDMEMBER commands inside your scripts freely at any place.

3）The Lua PRNG in this mode is seeded randomly at every call.

## 如何开启

In order to enable script effects replication, you need to issue the following Lua command before any write operated by the script:

```
redis.replicate_commands()
```

The function returns true if the script effects replication was enabled, otherwise if the function was called after the script already called some write command, it returns false, and normal whole script replication is used.

ps: 如果开启了，则直接使用 `script effects replication`。或者直接使用整个脚本备份。

# Selective replication of commands

When script effects replication is selected (see the previous section), it is possible to have more control in the way commands are replicated to replicas and AOF. 

This is a very advanced feature since a misuse（滥用） can do damage by breaking the contract that the master, replicas, and AOF, all must contain the same logical content.

## 应用场景

However this is a useful feature since, sometimes, we need to execute certain commands only in the master in order to create, for example, intermediate（中间） values.

Think at a Lua script where we perform an intersection between two sets. 

Pick five random elements, and create a new set with this five random elements. 

Finally we delete the temporary key representing the intersection between the two original sets. 

What we want to replicate is only the creation of the new set with the five elements. 

It's not useful to also replicate the commands creating the temporary key.

## 命令简介

For this reason, Redis 3.2 introduces a new command that only works when script effects replication is enabled, and is able to control the scripting replication engine. 

The command is called `redis.set_repl()` and fails raising an error if called when script effects replication is disabled.

The command can be called with four different arguments:

```
redis.set_repl(redis.REPL_ALL) -- Replicate to AOF and replicas.
redis.set_repl(redis.REPL_AOF) -- Replicate only to AOF.
redis.set_repl(redis.REPL_REPLICA) -- Replicate only to replicas (Redis >= 5)
redis.set_repl(redis.REPL_SLAVE) -- Used for backward compatibility, the same as REPL_REPLICA.
redis.set_repl(redis.REPL_NONE) -- Don't replicate at all.
```

By default the scripting engine is always set to `REPL_ALL`. 

By calling this function the user can switch on/off AOF and or replicas propagation, and turn them back later at her/his wish.

## 使用例子

A simple example follows:

```
redis.replicate_commands() -- Enable effects replication.
redis.call('set','A','1')
redis.set_repl(redis.REPL_NONE)
redis.call('set','B','2')
redis.set_repl(redis.REPL_ALL)
redis.call('set','C','3')
```

After running the above script, the result is that only keys A and C will be created on replicas and AOF.

ps: 因为默认就是 `REPL_ALL`。

# Global variables protection

Redis scripts are not allowed to create global variables, in order to avoid leaking data into the Lua state. 

If a script needs to maintain state between calls (a pretty uncommon need) it should use Redis keys instead.

When global variable access is attempted（尝试） the script is terminated and EVAL returns with an error:

```
redis 127.0.0.1:6379> eval 'a=10' 0
(error) ERR Error running script (call to f_933044db579a2f8fd45d8065f04a8d0249383e57): user_script:1: Script attempted to create global variable 'a'
```

Accessing a non existing global variable generates a similar error.

Using Lua debugging functionality or other approaches like altering the meta table used to implement global protections in order to circumvent（规避） globals protection is not hard. 

However it is difficult to do it accidentally（偶然）. 

If the user messes（混乱） with the Lua global state, the consistency（一致性） of AOF and replication is not guaranteed: don't do it.

Note for Lua newbies（新手）: in order to avoid using global variables in your scripts simply declare every variable you are going to use using the local keyword.

# Using SELECT inside scripts

It is possible to call `SELECT` inside Lua scripts like with normal clients, However one subtle（微妙） aspect of the behavior changes between Redis 2.8.11 and Redis 2.8.12. 

Before the 2.8.12 release the database selected by the Lua script was transferred to the calling script as current database. 

Starting from Redis 2.8.12 the database selected by the Lua script only affects the execution of the script itself, but does not modify the database selected by the client calling the script.

The semantic（语义） change between patch（补丁） level releases was needed since the old behavior was inherently incompatible with the Redis replication layer and was the cause of bugs.


# Available libraries

The Redis Lua interpreter loads the following Lua libraries:

```
base lib.
table lib.
string lib.
math lib.
struct lib.
cjson lib.
cmsgpack lib.
bitop lib.
redis.sha1hex function.
redis.breakpoint and redis.debug function in the context of the Redis Lua debugger.
```

Every Redis instance is guaranteed to have all the above libraries so you can be sure that the environment for your Redis scripts is always the same.

## 数据结构

struct, CJSON and cmsgpack are external libraries, all the other libraries are standard Lua libraries.

struct is a library for packing/unpacking structures within Lua.

```
Valid formats:
> - big endian
< - little endian
![num] - alignment
x - pading
b/B - signed/unsigned byte
h/H - signed/unsigned short
l/L - signed/unsigned long
T   - size_t
i/In - signed/unsigned integer with size `n' (default is size of int)
cn - sequence of `n' chars (from/to a string); when packing, n==0 means
     the whole string; when unpacking, n==0 means use the previous
     read number as the string length
s - zero-terminated string
f - float
d - double
' ' - ignored
```

### 例子

Example:

```
127.0.0.1:6379> eval 'return struct.pack("HH", 1, 2)' 0
"\x01\x00\x02\x00"
127.0.0.1:6379> eval 'return {struct.unpack("HH", ARGV[1])}' 0 "\x01\x00\x02\x00"
1) (integer) 1
2) (integer) 2
3) (integer) 5
127.0.0.1:6379> eval 'return struct.size("HH")' 0
(integer) 4
```

## CJSON

The CJSON library provides extremely fast JSON manipulation within Lua.

Example:

```
redis 127.0.0.1:6379> eval 'return cjson.encode({["foo"]= "bar"})' 0
"{\"foo\":\"bar\"}"
redis 127.0.0.1:6379> eval 'return cjson.decode(ARGV[1])["foo"]' 0 "{\"foo\":\"bar\"}"
"bar"
```

## cmsgpack

The cmsgpack library provides simple and fast MessagePack manipulation within Lua.

- Example:

```
127.0.0.1:6379> eval 'return cmsgpack.pack({"foo", "bar", "baz"})' 0
"\x93\xa3foo\xa3bar\xa3baz"
127.0.0.1:6379> eval 'return cmsgpack.unpack(ARGV[1])' 0 "\x93\xa3foo\xa3bar\xa3baz"
1) "foo"
2) "bar"
3) "baz"
```

## bitop

The Lua Bit Operations Module adds bitwise operations on numbers. 

It is available for scripting in Redis since version 2.8.18.

Example:

```
127.0.0.1:6379> eval 'return bit.tobit(1)' 0
(integer) 1
127.0.0.1:6379> eval 'return bit.bor(1,2,4,8,16,32,64,128)' 0
(integer) 255
127.0.0.1:6379> eval 'return bit.tohex(422342)' 0
"000671c6"
```

It supports several other functions: bit.tobit, bit.tohex, bit.bnot, bit.band, bit.bor, bit.bxor, bit.lshift, bit.rshift, bit.arshift, bit.rol, bit.ror, bit.bswap. 

All available functions are documented in the Lua BitOp documentation

## redis.sha1hex

Perform the SHA1 of the input string.

Example:

```
127.0.0.1:6379> eval 'return redis.sha1hex(ARGV[1])' 0 "foo"
"0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33"
```

# Emitting（播散） Redis logs from scripts

It is possible to write to the Redis log file from Lua scripts using the redis.log function.

```
redis.log(loglevel,message)
```

## 日志级别

loglevel is one of:

```
redis.LOG_DEBUG
redis.LOG_VERBOSE
redis.LOG_NOTICE
redis.LOG_WARNING
```

They correspond directly to the normal Redis log levels. 

Only logs emitted by scripting using a log level that is equal or greater than the currently configured Redis instance log level will be emitted.

The message argument is simply a string. 

## 例子

Example:

```
redis.log(redis.LOG_WARNING,"Something is wrong with this script.")
```

结果

```
[32343] 22 Mar 15:21:39 # Something is wrong with this script.
```

# Sandbox and maximum execution time

## 执行沙盒

Scripts should never try to access the external system, like the file system or any other system call. 

A script should only operate on Redis data and passed arguments.

## 最大执行时间

Scripts are also subject to a maximum execution time (five seconds by default). 

This default timeout is huge since a script should usually run in under a millisecond. 

The limit is mostly to handle accidental infinite loops created during development.

It is possible to modify the maximum time a script can be executed with millisecond precision, 
either via `redis.conf` or using the `CONFIG GET/CONFIG SET` command. 

The configuration parameter affecting max execution time is called lua-time-limit.

When a script reaches the timeout it is not automatically terminated by Redis since this violates the contract Redis has with the scripting engine to ensure that scripts are atomic. 

Interrupting a script means potentially（可能） leaving the dataset with half-written data. 

## 执行超时会发生什么

For this reasons when a script executes for more than the specified time the following happens:

1）Redis logs that a script is running too long.

2）It starts accepting commands again from other clients, but will reply with a BUSY error to all the clients sending normal commands. The only allowed commands in this status are SCRIPT KILL and SHUTDOWN NOSAVE.

3）It is possible to terminate a script that executes only read-only commands using the SCRIPT KILL command. This does not violate the scripting semantic as no data was yet written to the dataset by the script.

4）If the script already called write commands the only allowed command becomes SHUTDOWN NOSAVE that stops the server without saving the current data set on disk (basically the server is aborted).

# EVALSHA in the context of pipelining

Care should be taken when executing EVALSHA in the context of a pipelined request, since even in a pipeline the order of execution of commands must be guaranteed. 

If EVALSHA will return a NOSCRIPT error the command can not be reissued（补偿） later otherwise the order of execution is violated.

The client library implementation should take one of the following approaches:

1）Always use plain EVAL when in the context of a pipeline.

2）Accumulate all the commands to send into the pipeline, then check for EVAL commands and use the SCRIPT EXISTS command to check if all the scripts are already defined. If not, add SCRIPT LOAD commands on top of the pipeline as required, and use EVALSHA for all the EVAL calls.

# Debugging Lua scripts

Starting with Redis 3.2, Redis has support for native Lua debugging. 

The Redis Lua debugger is a remote debugger consisting of a server, which is Redis itself, and a client, which is by default redis-cli.

The Lua debugger is described in the Lua scripts debugging section of the Redis documentation.

# 拓展阅读

[Lua 脚本](https://houbb.github.io/2018/09/09/lang-lua)

# 参考资料

[Eval 命令](hhttps://redis.io/commands/eval)

* any list
{:toc}