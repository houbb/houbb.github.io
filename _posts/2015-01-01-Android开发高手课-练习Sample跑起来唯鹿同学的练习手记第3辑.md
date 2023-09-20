---
layout: post
title:  Android开发高手课-练习Sample跑起来唯鹿同学的练习手记第3辑
date:   2015-01-01 23:20:27 +0800
categories: [Android开发高手课]
tags: [Android开发高手课, other]
published: true
---



练习Sample跑起来 唯鹿同学的练习手记 第3辑
没想到之前的写的练习心得得到了老师的认可，看来我要更加认真努力练习了。今天来练习第22、27、ASM这三课的Sample。

[**Chapter22**](https://github.com/AndroidAdvanceWithGeektime/Chapter22)
尝试使用Facebook ReDex库来优化我们的安装包。

**准备工作**

首先是下载ReDex：
git clone https://github.com/facebook/redex.git cd redex

接着是安装：

autoreconf -ivf && ./configure && make -j4 sudo make install

在安装时执行到这里，报出下图错误：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/d14a1f42a04143abb8ddffef94987cbd.jpg)

其实就是没有安装Boost，所以执行下面的命令安装它。
brew install boost jsoncpp

安装Boost完成后，再等待十几分钟时间安装ReDex。

下来就是编译我们的Sample，得到的安装包信息如下。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/1876b3ec9b394de5aa8c8a7075493a8f.jpg)

可以看到有三个Dex文件，APK大小为13.7MB。

**通过ReDex命令优化**

为了让我们可以更加清楚流程，你可以输出ReDex的日志。
export TRACE=2

去除Debuginfo的方法，需要在项目根目录执行：

redex --sign -s ReDexSample/keystore/debug.keystore -a androiddebugkey -p android -c redex-test/stripdebuginfo.config -P ReDexSample/proguard-rules.pro -o redex-test/strip_output.apk ReDexSample/build/outputs/apk/debug/ReDexSample-debug.apk

上面这段很长的命令，其实可以拆解为几部分：

* --sign
签名信息
* -s
（keystore）签名文件路径
* -a
（keyalias）签名的别名
* -p
（keypass）签名的密码
* -c
指定ReDex的配置文件路径
* -P
ProGuard规则文件路径
* -o
输出的文件路径
* 最后是要处理APK文件的路径

但在使用时，我遇到了下图的问题：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/4c96270fe42b42e58cb20b7e3968ff22.jpg)

这里是找不到

Zipalign
，所以需要我们配置Android SDK的根目录路径，添加在原命令前面：
ANDROID_SDK=/path/to/android/sdk redex [... arguments ...]

结果如下：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/7c65faceb56a45ae992ecdf13a78f780.jpg)

实际的优化效果是，原Debug包为14.21MB，去除Debuginfo的方法后为12.91MB，效果还是不错的。**去除的内容就是一些调试信息及堆栈行号。**

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/2590c429a5914b35b62d6f2c2ab6f7c9.jpg)

不过老师在Sample的proguard-rules.pro中添加了

-keepattributes SourceFile,LineNumberTable
保留了行号信息。

所以处理后的包安装后进入首页，还是可以看到堆栈信息的行号。

**Dex重分包的方法**
redex --sign -s ReDexSample/keystore/debug.keystore -a androiddebugkey -p android -c redex-test/interdex.config -P ReDexSample/proguard-rules.pro -o redex-test/interdex_output.apk ReDexSample/build/outputs/apk/debug/ReDexSample-debug.apk

和之前的命令一样，只是

-c
使用的配置文件为interdex.config。

输出信息：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/142fad992b454ab284c1423748687455.jpg)

优化效果为，原Debug包为14.21MB、3个Dex，优化后为13.34MB、2个Dex。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/8f31255fd544446cb740a9fe730ecb4d.jpg)

根据老师的介绍，**如果你的应用有4个以上的Dex，这个体积优化至少有10%**。 看来效果还是很棒棒的。至于其他问题，比如在Windows环境使用ReDex，可以参看ReDex的[使用文档](https://fbredex.com/docs/installation)。

[**Chapter27**](https://github.com/AndroidAdvanceWithGeektime/Chapter27)
利用AspectJ实现插桩的例子。

效果和[Chapter07](https://github.com/AndroidAdvanceWithGeektime/Chapter07)是一样的，只是Chapter07使用的是ASM方式实现的，这次是AspectJ实现。ASM与AspectJ都是Java字节码处理框架，相比较来说AspectJ使用更加简单，同样的功能实现只需下面这点代码，但是ASM比AspectJ更加高效和灵活。

AspectJ实现代码：
@Aspect public class TraceTagAspectj { @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2) @Before("execution(/* /*/*(..))") public void before(JoinPoint joinPoint) { Trace.beginSection(joinPoint.getSignature().toString()); } //*/* /* hook method when it's called out. /*/ @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2) @After("execution(/* /*/*(..))") public void after() { Trace.endSection(); }

简单介绍下上面代码的意思：

* @Aspect
：在编译时AspectJ会查找被

@Aspect
注解的类，然后执行我们的AOP实现。
* @Before
：可以简单理解为方法执行前。
* @After
：可以简单理解为方法执行后。
* execution
：方法执行。
* /* /*/*(..)
：第一个星号代表任意返回类型，第二个星号代表任意类，第三个代表任意方法，括号内为方法参数无限制。星号和括号内都是可以替换为具体值，比如String TestClass.test(String)。

知道了相关注解的含义，那么实现的代码含义就是，**所有方法在执行前后插入相应指定操作**。

效果对比如下：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/aab13e2c406e4a6bb4dc42fb674aa32f.jpg)- ![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/81fb14f3014a40f5aefd8fd473335451.jpg)

下来实现给MainActivity的

onResume
方法增加try catch。
@Aspect public class TryCatchAspect { @Pointcut("execution(/* com.sample.systrace.MainActivity.onResume())") // <- 指定类与方法 public void methodTryCatch() { } @Around("methodTryCatch()") public void aroundTryJoinPoint(ProceedingJoinPoint joinPoint) throws Throwable { // try catch try { joinPoint.proceed(); // <- 调用原方法 } catch (Exception e) { e.printStackTrace(); } } }

上面用到了两个新注解：

* @Around
：用于替换以前的代码，使用joinPoint.proceed()可以调用原方法。
* @Pointcut
：指定一个切入点。

实现就是指定一个切入点，利用替换原方法的思路包裹一层try catch。

效果对比如下：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/322d9309387b4b429ba7ef28e0f1a090.jpg)- ![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/912c6f75876644bc8e4c2acd9f57d61d.jpg)

当然AspectJ还有很多用法，Sample中包含有《AspectJ程序设计指南》，便于我们具体了解和学习AspectJ。

[**Chapter-ASM**](https://github.com/AndroidAdvanceWithGeektime/Chapter-ASM)
Sample利用ASM实现了统计方法耗时和替换项目中所有的new Thread。

* 运行项目首先要注掉ASMSample build.gradle的

apply plugin: 'com.geektime.asm-plugin'
和根目录build.gradle的

classpath ("com.geektime.asm:asm-gradle-plugin:1.0") { changing = true }
。
* 运行

gradle task ":asm-gradle-plugin:buildAndPublishToLocalMaven"
编译plugin插件，编译的插件在本地

.m2\repository
目录下
* 打开第一步注掉的内容就可以运行了。

实现的大致过程是，先利用Transform遍历所有文件，再通过ASM的

visitMethod
遍历所有方法，最后通过AdviceAdapter实现最终的修改字节码。具体实现可以看代码和[《练习Sample跑起来 | ASM插桩强化练习》](https://time.geekbang.org/column/article/83148)。

效果对比：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/3fbf87fa0a3b4e4fb14b38683a9c3c36.jpg)- ![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/d0fc2987c4204705b012376124cd873a.jpg)

下面是两个练习：

1.给某个方法增加try catch

这里我就给MainActivity的

mm
方法进行try catch。实现很简单，直接修改ASMCode的TraceMethodAdapter。
public static class TraceMethodAdapter extends AdviceAdapter { private final String methodName; private final String className; private final Label tryStart = new Label(); private final Label tryEnd = new Label(); private final Label catchStart = new Label(); private final Label catchEnd = new Label(); protected TraceMethodAdapter(int api, MethodVisitor mv, int access, String name, String desc, String className) { super(api, mv, access, name, desc); this.className = className; this.methodName = name; } @Override protected void onMethodEnter() { if (className.equals("com/sample/asm/MainActivity") && methodName.equals("mm")) { mv.visitTryCatchBlock(tryStart, tryEnd, catchStart, "java/lang/Exception"); mv.visitLabel(tryStart); } } @Override protected void onMethodExit(int opcode) { if (className.equals("com/sample/asm/MainActivity") && methodName.equals("mm")) { mv.visitLabel(tryEnd); mv.visitJumpInsn(GOTO, catchEnd); mv.visitLabel(catchStart); mv.visitMethodInsn(Opcodes.INVOKEVIRTUAL, "java/lang/RuntimeException", "printStackTrace", "()V", false); mv.visitInsn(Opcodes.RETURN); mv.visitLabel(catchEnd); } }

visitTryCatchBlock
方法：前三个参数均是Label实例，其中一、二表示try块的范围，三则是catch块的开始位置，第四个参数是异常类型。其他的方法及参数就不细说了，具体你可以参考[ASM文档](https://asm.ow2.io/asm4-guide.pdf)。

实现类似AspectJ，在方法执行开始及结束时插入我们的代码。

效果我就不截图了，代码如下：
public void mm() { try { A a = new A(new B(2)); } catch (Exception e) { e.printStackTrace(); } }

2.查看代码中谁获取了IMEI

这个就更简单了，直接寻找谁使用了TelephonyManager的

getDeviceId
方法，并且在Sample中有答案。
public class IMEIMethodAdapter extends AdviceAdapter { private final String methodName; private final String className; protected IMEIMethodAdapter(int api, MethodVisitor mv, int access, String name, String desc, String className) { super(api, mv, access, name, desc); this.className = className; this.methodName = name; } @Override public void visitMethodInsn(int opcode, String owner, String name, String desc, boolean itf) { super.visitMethodInsn(opcode, owner, name, desc, itf); if (owner.equals("android/telephony/TelephonyManager") && name.equals("getDeviceId") && desc.equals("()Ljava/lang/String;")) { Log.e("asmcode", "get imei className:%s, method:%s, name:%s", className, methodName, name); } } }

Build后输出如下：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/assets/de36da54fe434da3a157d51c91d48e51.jpg)

总体来说ASM的上手难度还是高于AspectJ，需要我们了解编译后的字节码，这里所使用的功能也只是冰山一角。课代表鹏飞同学推荐的ASM Bytecode Outline插件是个好帮手！最后我将我练习的代码也上传到了[GitHub](https://github.com/simplezhli/Chapter-ASM)，里面还包括一份中文版的ASM文档，有兴趣的同学可以下载看看。

参考

* [练习Sample跑起来 | ASM插桩强化练](http://time.geekbang.org/column/article/83148)
* [ASM文档](http://asm.ow2.io/asm4-guide.pdf)




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Android%e5%bc%80%e5%8f%91%e9%ab%98%e6%89%8b%e8%af%be/%e7%bb%83%e4%b9%a0Sample%e8%b7%91%e8%b5%b7%e6%9d%a5%20%e5%94%af%e9%b9%bf%e5%90%8c%e5%ad%a6%e7%9a%84%e7%bb%83%e4%b9%a0%e6%89%8b%e8%ae%b0%20%e7%ac%ac3%e8%be%91.md

* any list
{:toc}
