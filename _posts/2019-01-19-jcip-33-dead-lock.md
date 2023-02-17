---
layout: post
title:  JCIP-33-Dead Lock-死锁
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, sh]
published: true
---

# 导读

- 是什么？

- 产生的条件？

- 常见的场景？

- 如何发现和分析？如何避免？

- 总结和分析

![思维导图](https://p1.pstatp.com/origin/pgc-image/03688b9d708042058b9bf035f4b96055)

# 死锁

## 是什么

线程死锁是指由于两个或者多个线程互相持有对方所需要的资源，导致这些线程处于等待状态，无法前往执行。

当线程进入对象的synchronized代码块时，便占有了资源，直到它退出该代码块或者调用wait方法，才释放资源，在此期间，其他线程将不能进入该代码块。

当线程互相持有对方所需要的资源时，会互相等待对方释放资源，如果线程都不主动释放所占有的资源，将产生死锁。

## 发生的必要条件

当然死锁的产生是必须要满足一些特定条件的： 

1.互斥条件：进程对于所分配到的资源具有排它性，即一个资源只能被一个进程占用，直到被该进程释放
 
2.请求和保持条件：一个进程因请求被占用资源而发生阻塞时，对已获得的资源保持不放。
 
3.不剥夺条件：任何一个资源在没被该进程释放之前，任何其他进程都无法对他剥夺占用
 
4.循环等待条件：当发生死锁时，所等待的进程必定会形成一个环路（类似于死循环），造成永久阻塞。

![死锁](https://p1.pstatp.com/origin/pgc-image/26e267aeb4c3430ca036c1ea3cd84eda)

# 死锁的预防

前面介绍了死锁发生时的四个必要条件，只要破坏这四个必要条件中的任意一个条件，死锁就不会发生。这就为我们解决死锁问题提供了可能。一般地，解决死锁的方法分为死锁的预防，避免，检测与恢复三种（注意：死锁的检测与恢复是一个方法）。我们将在下面分别加以介绍。

死锁的预防是保证系统不进入死锁状态的一种策略。它的基本思想是要求进程申请资源时遵循某种协议，从而打破产生死锁的四个必要条件中的一个或几个，保证系统不会进入死锁状态。

## 1. 打破互斥条件。

即允许进程同时访问某些资源。但是，有的资源是不允许被同时访问的，像打印机等等，这是由资源本身的属性所决定的。

所以，这种办法并无实用价值。

## 2. 打破不可抢占条件。

即允许进程强行从占有者那里夺取某些资源。

就是说，当一个进程已占有了某些资源，它又申请新的资源，但不能立即被满足时，它必须释放所占有的全部资源，以后再重新申请。

它所释放的资源可以分配给其它进程。这就相当于该进程占有的资源被隐蔽地强占了。

这种预防死锁的方法实现起来困难，会降低系统性能。    

## 3. 打破占有且申请条件。

可以实行资源预先分配策略。即进程在运行前一次性地向系统申请它所需要的全部资源。

如果某个进程所需的全部资源得不到满足，则不分配任何资源，此进程暂不运行。

只有当系统能够满足当前进程的全部资源需求时，才一次性地将所申请的资源全部分配给该进程。

由于运行的进程已占有了它所需的全部资源，所以不会发生占有资源又申请资源的现象，因此不会发生死锁。

但是，这种策略也有如下缺点：

（1）在许多情况下，一个进程在执行之前不可能知道它所需要的全部资源。这是由于进程在执行时是动态的，不可预测的；

（2）资源利用率低。无论所分资源何时用到，一个进程只有在占有所需的全部资源后才能执行。即使有些资源最后才被该进程用到一次，但该进程在生存期间却一直占有它们，造成长期占着不用的状况。这显然是一种极大的资源浪费；

（3）降低了进程的并发性。因为资源有限，又加上存在浪费，能分配到所需全部资源的进程个数就必然少了。    

## 4. 打破循环等待条件，实行资源有序分配策略。

采用这种策略，即把资源事先分类编号，按号分配，使进程在申请，占用资源时不会形成环路。

所有进程对资源的请求必须严格按资源序号递增的顺序提出。

进程占用了小号资源，才能申请大号资源，就不会产生环路，从而预防了死锁。

这种策略与前面的策略相比，资源的利用率和系统吞吐量都有很大提高，但是也存在以下缺点：

（1）限制了进程对资源的请求，同时给系统中所有资源合理编号也是件困难事，并增加了系统开销；

（2）为了遵循按编号申请的次序，暂不使用的资源也需要提前申请，从而增加了进程对资源的占用时间。

# 死锁的避免  
  
上面我们讲到的死锁预防是排除死锁的静态策略，它使产生死锁的四个必要条件不能同时具备，从而对进程申请资源的活动加以限制，
以保证死锁不会发生。

下面我们介绍排除死锁的动态策略--死锁的避免，它不限制进程有关申请资源的命令，
而是对进程所发出的每一个申请资源命令加以动态地检查，并根据检查结果决定是否进行资源分配。

就是说，在资源分配过程中若预测有发生死锁的可能性，则加以避免。这种方法的关键是确定资源分配的安全性。
  
## 1.安全序列
  
我们首先引入安全序列的定义：所谓系统是安全的，是指系统中的所有进程能够按照某一种次序分配资源，并且依次地运行完毕，这种进程序列{P1，P2，...，Pn}就是安全序列。如果存在这样一个安全序列，则系统是安全的；如果系统不存在这样一个安全序列，则系统是不安全的。
  
安全序列{P1，P2，...，Pn}是这样组成的：若对于每一个进程Pi，它需要的附加资源可以被系统中当前可用资源加上所有进程Pj当前占有资源之和所满足，则{P1，P2，...，Pn}为一个安全序列，这时系统处于安全状态，不会进入死锁状态。 　
  
虽然存在安全序列时一定不会有死锁发生，但是系统进入不安全状态（四个死锁的必要条件同时发生）也未必会产生死锁。

当然，产生死锁后，系统一定处于不安全状态。 
  
## 2.银行家算法
  
这是一个著名的避免死锁的算法，是由Dijstra首先提出来并加以解决的。　
  
- 背景知识 
  
一个银行家如何将一定数目的资金安全地借给若干个客户，使这些客户既能借到钱完成要干的事，同时银行家又能收回全部资金而不至于破产，这就是银行家问题。这个问题同操作系统中资源分配问题十分相似：银行家就像一个操作系统，客户就像运行的进程，银行家的资金就是系统的资源。
  
- 问题的描述
  
一个银行家拥有一定数量的资金，有若干个客户要贷款。每个客户须在一开始就声明他所需贷款的总额。

若该客户贷款总额不超过银行家的资金总数，银行家可以接收客户的要求。客

户贷款是以每次一个资金单位（如1万RMB等）的方式进行的，客户在借满所需的全部单位款额之前可能会等待，
但银行家须保证这种等待是有限的，可完成的。
  
例如：有三个客户C1，C2，C3，向银行家借款，该银行家的资金总额为10个资金单位，其中C1客户要借9各资金单位，
C2客户要借3个资金单位，C3客户要借8个资金单位，总计20个资金单位。

某一时刻的状态如图所示。

![银行家算法](https://images.gitee.com/uploads/images/2020/1018/183926_72d54508_508704.png)

对于a图的状态，按照安全序列的要求，我们选的第一个客户应满足该客户所需的贷款小于等于银行家当前所剩余的钱款，可以看出只有C2客户能被满足：C2客户需1个资金单位，小银行家手中的2个资金单位，于是银行家把1个资金单位借给C2客户，使之完成工作并归还所借的3个资金单位的钱，进入b图。同理，银行家把4个资金单位借给C3客户，使其完成工作，在c图中，只剩一个客户C1，它需7个资金单位，这时银行家有8个资金单位，所以C1也能顺利借到钱并完成工作。最后（见图d）银行家收回全部10个资金单位，保证不赔本。那麽客户序列{C1，C2，C3}就是个安全序列，按照这个序列贷款，银行家才是安全的。否则的话，若在图b状态时，银行家把手中的4个资金单位借给了C1，则出现不安全状态：这时C1，C3均不能完成工作，而银行家手中又没有钱了，系统陷入僵持局面，银行家也不能收回投资。

综上所述，银行家算法是从当前状态出发，逐个按安全序列检查各客户谁能完成其工作，然后假定其完成工作且归还全部贷款，再进而检查下一个能完成工作的客户，......。如果所有客户都能完成工作，则找到一个安全序列，银行家才是安全的。

从上面分析看出，银行家算法允许死锁必要条件中的互斥条件，占有且申请条件，不可抢占条件的存在，这样，它与预防死锁的几种方法相比较，限制条件少了，资源利用程度提高了。

这是该算法的优点。其缺点是：

〈1〉这个算法要求客户数保持固定不变，这在多道程序系统中是难以做到的。   

〈2〉这个算法保证所有客户在有限的时间内得到满足，但实时客户要求快速响应，所以要考虑这个因素。  

〈3〉由于要寻找一个安全序列，实际上增加了系统的开销。

# 死锁的检测与恢复  
   
一般来说，由于操作系统有并发，共享以及随机性等特点，通过预防和避免的手段达到排除死锁的目的是很困难的。这需要较大的系统开销，而且不能充分利用资源。为此，一种简便的方法是系统为进程分配资源时，不采取任何限制性措施，但是提供了检测和解脱死锁的手段：能发现死锁并从死锁状态中恢复出来。因此，在实际的操作系统中往往采用死锁的检测与恢复方法来排除死锁。
  
死锁检测与恢复是指系统设有专门的机构，当死锁发生时，该机构能够检测到死锁发生的位置和原因，并能通过外力破坏死锁发生的必要条件，从而使得并发进程从死锁状态中恢复出来。
  
## 死锁的检测
  
   
图中所示为一个小的死锁的例子。这时进程P1占有资源R1而申请资源R2，进程P2占有资源R2而申请资源R1，按循环等待条件，进程和资源形成了环路，所以系统是死锁状态。进程P1，P2是参与死锁的进程。
  
下面我们再来看一看死锁检测算法。算法使用的数据结构是如下这些：      
  
占有矩阵A：n*m阶，其中n表示并发进程的个数，m表示系统的各类资源的个数，这个矩阵记录了每一个进程当前占有各个资源类中资源的个数。
  
申请矩阵R：n*m阶，其中n表示并发进程的个数，m表示系统的各类资源的个数，这个矩阵记录了每一个进程当前要完成工作需要申请的各个资源类中资源的个数。
  
空闲向量T：记录当前m个资源类中空闲资源的个数。
  
完成向量F：布尔型向量值为真（true）或假（false），记录当前n个并发进程能否进行完。为真即能进行完，为假则不能进行完。
  
临时向量W：开始时W：=T。
  
算法步骤：
  
```
（1）W：=T，
  
对于所有的i=1，2，...，n，
  
如果A[i]=0，则F[i]：=true；否则，F[i]：=false
  
（2）找满足下面条件的下标i：
  
F[i]：=false并且R[i]〈=W
  
如果不存在满足上面的条件i，则转到步骤（4）。
  
（3）W：=W+A[i]
  
F[i]：=true
  
转到步骤（2）
  
（4）如果存在i，F[i]：=false，则系统处于死锁状态，且Pi进程参与了死锁。什麽时候进行死锁的检测取决于死锁发生的频率。如果死锁发生的频率高，那麽死锁检测的频率也要相应提高，这样一方面可以提高系统资源的利用率，一方面可以避免更多的进程卷入死锁。如果进程申请资源不能满足就立刻进行检测，那麽每当死锁形成时即能被发现，这和死锁避免的算法相近，只是系统的开销较大。为了减小死锁检测带来的系统开销，一般采取每隔一段时间进行一次死锁检测，或者在CPU的利用率降低到某一数值时，进行死锁的检测。 
```

## 死锁的恢复  
  
一旦在死锁检测时发现了死锁，就要消除死锁，使系统从死锁状态中恢复过来。  
  
（1）最简单，最常用的方法就是进行系统的重新启动，不过这种方法代价很大，它意味着在这之前所有的进程已经完成的计算工作都将付之东流，包括参与死锁的那些进程，以及未参与死锁的进程。
  
（2）撤消进程，剥夺资源。终止参与死锁的进程，收回它们占有的资源，从而解除死锁。这时又分两种情况：一次性撤消参与死锁的全部进程，剥夺全部资源；或者逐步撤消参与死锁的进程，逐步收回死锁进程占有的资源。

一般来说，选择逐步撤消的进程时要按照一定的原则进行，目的是撤消那些代价最小的进程，比如按进程的优先级确定进程的代价；考虑进程运行时的代价和与此进程相关的外部作业的代价等因素。 
  
此外，还有进程回退策略，即让参与死锁的进程回退到没有发生死锁前某一点处，并由此点处继续执行，以求再次执行时不再发生死锁。虽然这是个较理想的办法，但是操作起来系统开销极大，要有堆栈这样的机构记录进程的每一步变化，以便今后的回退，有时这是无法做到的。

# 死锁的场景

## 获取锁的顺序导致的死锁

```java
public class DeadLockDemo extends Thread {

    private final String firstLock;

    private final String secondLock;

    public DeadLockDemo(String t1, String t2) {
        this.firstLock = t1;
        this.secondLock = t2;
    }

    @Override
    public void run() {
        synchronized (firstLock) {
            // 成功占有 firstLock
            System.out.println(Thread.currentThread().getName() + " success locked " + firstLock);
            // 休眠一段时间
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // 尝试占有 secondLock，如果不能占有，该线程会一直等到
            synchronized (secondLock) {
                System.out.println(Thread.currentThread().getName() + " success locked " + secondLock);
            }
        }
    }

    
}
```

- main()

```java
public static void main(String[] args) {
    final String resource1 = "resource1";
    final String resource2 = "resource2";

    // 两个线程获取锁的顺序相反
    new DeadLockDemo(resource1, resource2).start();
    new DeadLockDemo(resource2, resource1).start();
}
```

日志信息

```
Thread-0 success locked resource1
Thread-1 success locked resource2
```

然后进入死锁状态。


## 递归死锁

所谓递归函数就是自调用函数，在函数体内直接或间接的调用自己，即函数的嵌套是函数本身。 

递归方式有两种:直接递归和间接递归，直接递归就是在函数中出现调用函数本身。间接递归，指函数中调用了其他函数，而该其他函数又调用了本函数。
那什么时候使用递归呢？

一般来说当你要在某段代码逻辑中使用循环迭代的时候但是迭代的次数在迭代之前无法知晓的情况下使用递归。

打个比方你要在一个文件夹中查找某个文件，而这个文件夹底下有N多子文件夹和文件，当你在不知道有多少层文件夹和文件的情况下你就得用到递归了。

递归的优点就是让代码显得很简洁，同时有些应用场景不得不使用递归比如前面说的找文件。

递归是个好东西但是在某些时候也会给你带来一些麻烦。

比如在多线程的环境下使用递归，遇到了多线程那么就不得不面对同步的问题。

而递归程序遇到同步的时候很容易出问题。

```java
public class Test {  
    public void recursive(){  
        this.businessLogic();  
    }  
    public synchronized void businessLogic(){  
        System.out.println("处理业务逻辑");  
        this.recursive();  
    }  
}  
```

多线程的递归就是指递归链中的某个方法由另外一个线程来操作，以下代码的意思都是这个意思即调用recursive()和businessLogic()并非一个线程

(如果是在一个线程中就不存在死锁问题，例如上面的recursive变成private就不存在问题。)

以上这段代码就是个能形成死锁的代码，事实上这个“synchronized”放在“businessLogic()”和“recursive()”都会形成死锁，并且是多线程的情况下就会锁住！

他的逻辑顺序是先执行recursive()方法然后接下来执行businessLogic()方法同时将businessLogic()方法锁住，
接下来程序进入businessLogic()方法内部执行完打印语句后开始执行recursive()，
进入recursive()后准备执行businessLogic()，等等问题来了！

之前执行的businessLogic()的锁还没有放开这次又执行到这里了，当然是过不去的了，形成了死锁！

从这个例子我们总结出来一个规律就是在递归的时候在递归链上面的方法上加锁肯定会出现死锁（所谓递归链就是指recursive()链向businessLogic()，businessLogic()又链回recursive()），

解决这个问题的方法就是避免在递归链上加锁，

请看以下的例子

```java
public class Test {  
    public void recursive(){  
        this.businessLogic();  
    }  
    public  void businessLogic(){  
        System.out.println("处理业务逻辑");  
        this.saveToDB();  
        this.recursive();  
    }  
    public synchronized void saveToDB(){  
        System.out.println("保存到数据库");  
    }  
}  
```

saveToDB()不在这条递归链上面自然不会出现死锁，所以说在递归中加锁是件很危险的事情，实在逃不过要加锁就加在最小的粒度的程序代码上以减小死锁的概率。

## 动态顺序死锁

```java
// 转账
public static void transferMoney(Account fromAccount,
                                 Account toAccount,
                                 DollarAmount amount)
        throws InsufficientFundsException {

    // 锁定汇账账户
    synchronized (fromAccount) {
        // 锁定来账账户
        synchronized (toAccount) {

            // 判余额是否大于0
            if (fromAccount.getBalance().compareTo(amount) < 0) {
                throw new InsufficientFundsException();
            } else {

                // 汇账账户减钱
                fromAccount.debit(amount);

                // 来账账户增钱
                toAccount.credit(amount);
            }
        }
    }
}
``` 

上面的代码看起来是没有问题的：锁定两个账户来判断余额是否充足才进行转账！

但是，同样有可能会发生死锁：

如果两个线程同时调用transferMoney()

线程A从X账户向Y账户转账

线程B从账户Y向账户X转账

那么就会发生死锁。

## 协作对象之间发生死锁

```java
public class CooperatingDeadlock {
    // Warning: deadlock-prone!
    class Taxi {
        @GuardedBy("this") private Point location, destination;
        private final Dispatcher dispatcher;

        public Taxi(Dispatcher dispatcher) {
            this.dispatcher = dispatcher;
        }

        public synchronized Point getLocation() {
            return location;
        }

        // setLocation 需要Taxi内置锁
        public synchronized void setLocation(Point location) {
            this.location = location;
            if (location.equals(destination))
                // 调用notifyAvailable()需要Dispatcher内置锁
                dispatcher.notifyAvailable(this);
        }

        public synchronized Point getDestination() {
            return destination;
        }

        public synchronized void setDestination(Point destination) {
            this.destination = destination;
        }
    }

    class Dispatcher {
        @GuardedBy("this") private final Set<Taxi> taxis;
        @GuardedBy("this") private final Set<Taxi> availableTaxis;

        public Dispatcher() {
            taxis = new HashSet<Taxi>();
            availableTaxis = new HashSet<Taxi>();
        }

        public synchronized void notifyAvailable(Taxi taxi) {
            availableTaxis.add(taxi);
        }

        // 调用getImage()需要Dispatcher内置锁
        public synchronized Image getImage() {
            Image image = new Image();
            for (Taxi t : taxis)
                // 调用getLocation()需要Taxi内置锁
                image.drawMarker(t.getLocation());
            return image;
        }
    }

    class Image {
        public void drawMarker(Point p) {
        }
    }
}
```

上面的getImage()和setLocation(Point location)都需要获取两个锁的

并且在操作途中是没有释放锁的
这就是隐式获取两个锁(对象之间协作)..

这种方式也很容易就造成死锁.....

# 避免死锁：

在有些情况下死锁是可以避免的。本文将展示三种用于避免死锁的技术：

1. 加锁顺序

2. 加锁时限

3. 死锁检测

4. 开放调用(针对对象之间协作造成的死锁)

## 加锁顺序

当多个线程需要相同的一些锁，但是按照不同的顺序加锁，死锁就很容易发生。
   
如果能确保所有的线程都是按照相同的顺序获得锁，那么死锁就不会发生。

看下面这个例子：

```
Thread 1:
  lock A 
  lock B

Thread 2:
   wait for A
   lock C (when A locked)

Thread 3:
   wait for A
   wait for B
   wait for C
```

如果一个线程（比如线程3）需要一些锁，那么它必须按照确定的顺序获取锁。它只有获得了从顺序上排在前面的锁之后，才能获取后面的锁。

例如，线程2和线程3只有在获取了锁A之后才能尝试获取锁C(译者注：获取锁A是获取锁C的必要条件)。因为线程1已经拥有了锁A，所以线程2和3需要一直等到锁A被释放。然后在它们尝试对B或C加锁之前，必须成功地对A加了锁。

按照顺序加锁是一种有效的死锁预防机制。

但是，这种方式需要你事先知道所有可能会用到的锁(译者注：并对这些锁做适当的排序)，但总有些时候是无法预知的。


## 加锁时限

另外一个可以避免死锁的方法是在尝试获取锁的时候加一个超时时间，这也就意味着在尝试获取锁的过程中若超过了这个时限该线程则放弃对该锁请求。若一个线程没有在给定的时限内成功获得所有需要的锁，则会进行回退并释放所有已经获得的锁，然后等待一段随机的时间再重试。这段随机的等待时间让其它线程有机会尝试获取相同的这些锁，并且让该应用在没有获得锁的时候可以继续运行(译者注：加锁超时后可以先继续运行干点其它事情，再回头来重复之前加锁的逻辑)。
   
以下是一个例子，展示了两个线程以不同的顺序尝试获取相同的两个锁，在发生超时后回退并重试的场景：

```
Thread 1 locks A
Thread 2 locks B

Thread 1 attempts to lock B but is blocked
Thread 2 attempts to lock A but is blocked

Thread 1's lock attempt on B times out
Thread 1 backs up and releases A as well
Thread 1 waits randomly (e.g. 257 millis) before retrying.

Thread 2's lock attempt on A times out
Thread 2 backs up and releases B as well
Thread 2 waits randomly (e.g. 43 millis) before retrying.
```

在上面的例子中，线程2比线程1早200毫秒进行重试加锁，因此它可以先成功地获取到两个锁。这时，线程1尝试获取锁A并且处于等待状态。当线程2结束时，线程1也可以顺利的获得这两个锁（除非线程2或者其它线程在线程1成功获得两个锁之前又获得其中的一些锁）。

需要注意的是，由于存在锁的超时，所以我们不能认为这种场景就一定是出现了死锁。也可能是因为获得了锁的线程（导致其它线程超时）需要很长的时间去完成它的任务。

此外，如果有非常多的线程同一时间去竞争同一批资源，就算有超时和回退机制，还是可能会导致这些线程重复地尝试但却始终得不到锁。如果只有两个线程，并且重试的超时时间设定为0到500毫秒之间，这种现象可能不会发生，但是如果是10个或20个线程情况就不同了。因为这些线程等待相等的重试时间的概率就高的多（或者非常接近以至于会出现问题）。
(译者注：超时和重试机制是为了避免在同一时间出现的竞争，但是当线程很多时，其中两个或多个线程的超时时间一样或者接近的可能性就会很大，因此就算出现竞争而导致超时后，由于超时时间一样，它们又会同时开始重试，导致新一轮的竞争，带来了新的问题。)

这种机制存在一个问题，在Java中不能对synchronized同步块设置超时时间。你需要创建一个自定义锁，或使用Java5中java.util.concurrent包下的工具。写一个自定义锁类不复杂，但超出了本文的内容。后续的Java并发系列会涵盖自定义锁的内容。

## 死锁检测

死锁检测是一个更好的死锁预防机制，它主要是针对那些不可能实现按序加锁并且锁超时也不可行的场景。
   
每当一个线程获得了锁，会在线程和锁相关的数据结构中（map、graph等等）将其记下。

除此之外，每当有线程请求锁，也需要记录在这个数据结构中。
   
当一个线程请求锁失败时，这个线程可以遍历锁的关系图看看是否有死锁发生。

例如，线程A请求锁7，但是锁7这个时候被线程B持有，这时线程A就可以检查一下线程B是否已经请求了线程A当前所持有的锁。

如果线程B确实有这样的请求，那么就是发生了死锁（线程A拥有锁1，请求锁7；线程B拥有锁7，请求锁1）。
   
当然，死锁一般要比两个线程互相持有对方的锁这种情况要复杂的多。

线程A等待线程B，线程B等待线程C，线程C等待线程D，线程D又在等待线程A。

线程A为了检测死锁，它需要递进地检测所有被B请求的锁。

从线程B所请求的锁开始，线程A找到了线程C，然后又找到了线程D，发现线程D请求的锁被线程A自己持有着。这是它就知道发生了死锁。
   
下面是一幅关于四个线程（A,B,C和D）之间锁占有和请求的关系图。像这样的数据结构就可以被用来检测死锁。
   
![死锁检测](https://images2015.cnblogs.com/blog/1030509/201705/1030509-20170524152748060-151429778.png)

那么当检测出死锁时，这些线程该做些什么呢？

一个可行的做法是释放所有锁，回退，并且等待一段随机的时间后重试。这个和简单的加锁超时类似，不一样的是只有死锁已经发生了才回退，而不会是因为加锁的请求超时了。虽然有回退和等待，但是如果有大量的线程竞争同一批锁，它们还是会重复地死锁（编者注：原因同超时类似，不能从根本上减轻竞争）。

一个更好的方案是给这些线程设置优先级，让一个（或几个）线程回退，剩下的线程就像没发生死锁一样继续保持着它们需要的锁。如果赋予这些线程的优先级是固定不变的，同一批线程总是会拥有更高的优先级。为避免这个问题，可以在死锁发生的时候设置随机的优先级。

## 开放调用避免死锁

在协作对象之间发生死锁的例子中，主要是因为在调用某个方法时就需要持有锁，并且在方法内部也调用了其他带锁的方法！
   
如果在调用某个方法时不需要持有锁，那么这种调用被称为开放调用！

我们可以这样来改造：
   
同步代码块最好仅被用于保护那些涉及共享状态的操作！

```java
class CooperatingNoDeadlock {
    @ThreadSafe
    class Taxi {
        @GuardedBy("this") private Point location, destination;
        private final Dispatcher dispatcher;

        public Taxi(Dispatcher dispatcher) {
            this.dispatcher = dispatcher;
        }

        public synchronized Point getLocation() {
            return location;
        }

        public synchronized void setLocation(Point location) {
            boolean reachedDestination;

            // 加Taxi内置锁
            synchronized (this) {
                this.location = location;
                reachedDestination = location.equals(destination);
            }
            // 执行同步代码块后完毕，释放锁

            if (reachedDestination)
                // 加Dispatcher内置锁
                dispatcher.notifyAvailable(this);
        }

        public synchronized Point getDestination() {
            return destination;
        }

        public synchronized void setDestination(Point destination) {
            this.destination = destination;
        }
    }

    @ThreadSafe
    class Dispatcher {
        @GuardedBy("this") private final Set<Taxi> taxis;
        @GuardedBy("this") private final Set<Taxi> availableTaxis;

        public Dispatcher() {
            taxis = new HashSet<Taxi>();
            availableTaxis = new HashSet<Taxi>();
        }

        public synchronized void notifyAvailable(Taxi taxi) {
            availableTaxis.add(taxi);
        }

        public Image getImage() {
            Set<Taxi> copy;

            // Dispatcher内置锁
            synchronized (this) {
                copy = new HashSet<Taxi>(taxis);
            }
            // 执行同步代码块后完毕，释放锁

            Image image = new Image();
            for (Taxi t : copy)
                // 加Taix内置锁
                image.drawMarker(t.getLocation());
            return image;
        }
    }

    class Image {
        public void drawMarker(Point p) {
        }
    }

}
```

# 小结


我们对死锁是什么？常见的场景等做了解答。

结合实际工作中，如何分析发现，以及如何解决提供了理论和实际的方案。

**理解发生的原因，才能更好地解决问题。**

关于死锁检测，是个不错的思路。是否可以针对这个专门写一套框架？提供优雅的解决方案。小伙伴们有没有想尝试一下的？

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 拓展阅读

[Lock](https://houbb.github.io/2017/08/25/lock)

# 参考资料

《Java并发编程实战》

[什么是死锁以及避免死锁](https://www.cnblogs.com/hadoop-dev/p/6899171.html)

[多线程之死锁就是这么简单](https://www.jianshu.com/p/68c0fef7b63e)

[死锁产生的原因和解锁的方法](https://www.cnblogs.com/Jessy/p/3540724.html)

[死锁问题](https://blog.csdn.net/weixin_40087851/article/details/81591903)

[死锁的四个必要条件和解决办法](https://blog.csdn.net/guaiguaihenguai/article/details/80303835)

[么是死锁及死锁的必要条件和解决方法](https://blog.csdn.net/caozhao3344/article/details/77199552)

- 数据库相关

[死锁产生的原因及其解决办法](https://www.cnblogs.com/Jessy/p/3540724.html)

* any list
{:toc}