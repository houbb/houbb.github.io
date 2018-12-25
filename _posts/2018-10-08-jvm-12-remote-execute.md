---
layout: post
title:  JVM-12-远程执行代码
date:  2018-10-08 16:04:16 +0800
categories: [JVM]
tags: [java, log, jvm, sf]
published: true
excerpt: JVM 远程执行代码
---

# 整体思路

如果远程系统需要执行一段代码，但是我们现在又没有入口。

可以通过这种方式。

实际上对于日志信息，可能某个调用信息没有打印，也可以通过这个方式。

# 代码实现

## 核心代码

- ByteUtils.java

```java
package org.jvm;
/**
 * Bytes数组处理工具
 */
public class ByteUtils {
	public static int bytes2Int(byte[] b, int start, int len) {
		int sum = 0;
		int end = start + len;
		for(int i = start; i < end; i++){
			int n = ((int) b[i]) & 0xff;
			n <<= (--len) * 8;
			sum = n + sum;
		}
		return sum;
	}
	
	public static byte[] int2Bytes(int value, int len) {
		byte[] b = new byte[len];
		for(int i = 0; i < len; i++){
			b[len - i - 1] = (byte) ((value >> 8 * i) & 0xff);
		}
		return b;
	}
	
	public static String bytes2String(byte[] b, int start, int len) {
		return new String(b, start, len);
	}
 
	public static byte[] string2Bytes(String str) {
		return str.getBytes();
	}
 
	public static byte[] bytesReplace(byte[] originalBytes, int offset, int len,
			byte[] replaceBytes) {
		byte[] newBytes = new byte[originalBytes.length + (replaceBytes.length - len)];
		System.arraycopy(originalBytes, 0, newBytes, 0, offset);
		System.arraycopy(replaceBytes, 0, newBytes, offset, replaceBytes.length);
		System.arraycopy(originalBytes, offset + len, newBytes, offset + replaceBytes.length, originalBytes.length - offset - len);
		return newBytes;
	}
}
```

- ClassModifier.java

```java
package org.jvm;
/**
 * 修改Class文件，暂时只提供修改常量池常量的功能
 */
public class ClassModifier {
	private static final int CONSTANT_POOL_COUNT_INDEX = 8;
	private static final int CONSTANT_Utf8_info = 1;
	private static final int[] CONSTANT_ITEM_LENGTH = {-1,-1,-1,5,5,9,9,3,3,5,5,5,5};
	private static final int u1 = 1;
	private static final int u2 = 2;
	private byte[] classByte;
	
	public ClassModifier(byte[] classByte){
		this.classByte = classByte;
	}
	
	public byte[] modifyUTF8Constant(String oldStr, String newStr){
		int cpc = getConstantPoolCount();
		int offset = CONSTANT_POOL_COUNT_INDEX + u2;
		for(int i = 0; i < cpc; i++){
			int tag = ByteUtils.bytes2Int(classByte,offset, u1);
			if(tag == CONSTANT_Utf8_info){
				int len = ByteUtils.bytes2Int(classByte, offset + u1, u2);
				offset += (u1 + u2);
				String str = ByteUtils.bytes2String(classByte, offset, len);
				if(str.equalsIgnoreCase(oldStr)){
					byte[] strBytes = ByteUtils.string2Bytes(newStr);
					byte[] strLen = ByteUtils.int2Bytes(newStr.length(),u2);
					classByte = ByteUtils.bytesReplace(classByte, offset - u2, u2, strLen);
					classByte = ByteUtils.bytesReplace(classByte, offset, len, strBytes);
					return classByte;
				}else{
					offset += len;
				}
			}else{
				offset += CONSTANT_ITEM_LENGTH[tag];
			}
		}
		return classByte;
	}
	
	public int getConstantPoolCount(){
		return ByteUtils.bytes2Int(classByte, CONSTANT_POOL_COUNT_INDEX, u2);
	}
}
```

- HackSystem.java

```java
package org.jvm;
 
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.PrintStream;
 
/**
 * 为JavaClass劫持java.lang.System提供支持
 * 除了out和err外，其余的都直接转发给System处理
 */
public class HackSystem {
	public final static InputStream in = System.in;
	private static ByteArrayOutputStream buffer = new ByteArrayOutputStream();
	public final static PrintStream out = new PrintStream(buffer);
	public final static PrintStream err = out;
	
	public static String getBufferString(){
		return buffer.toString();
	}
	
	public static void clearBuffer(){
		buffer.reset();
	}
	public static void setSecurityManager(final SecurityManager s){
		System.setSecurityManager(s);
	}
	public static SecurityManager getSecurityManager(){
		return System.getSecurityManager();
	}
	public static long currentTimeMills(){
		return System.currentTimeMillis();
	}
	public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length){
		System.arraycopy(src, srcPos, dest, destPos, length);
	}
	public static int identityHashCode(Object x){
		return System.identityHashCode(x);
	}
}
```

- HotSwapClassLoader.java

```java
package org.jvm;
/**
 * 为了多次载入执行类而加入的加载器
 * 把defineClass方法开放出来，只有外部显式调用的时候才会使用到loadByte方法
 * 由虚拟机调用时，仍然按照原有的双亲委派规则使用loadClass方法进行类加载
 */
public class HotSwapClassLoader extends ClassLoader{
 
	public HotSwapClassLoader() {
		super(HotSwapClassLoader.class.getClassLoader());
	}
	public Class<?> loadByte(byte[] classByte){
		return defineClass(null,classByte,0,classByte.length);
	}
}
```

- JavaClassExecuter.java

```java
public class JavaClassExecuter {
 
    @SuppressWarnings({ "unused", "rawtypes", "unchecked" })
    public static String execute(byte[] classByte){
        HackSystem.clearBuffer();
        
        ClassModifier cm=new ClassModifier(classByte);
        byte[] modiBytes=cm.modifyUTF8Constant("java/lang/System", "test/HackSystem");
        
        HotSwapClassLoader loader=new HotSwapClassLoader();
   
        Class clazz=loader.loadByte(modiBytes);
        
        try{      
            Method method=clazz.getMethod("main", new Class[]{String[].class});
            method.invoke(null, new String[]{null});      
        }catch(Throwable e){
            e.printStackTrace(HackSystem.out);
        }
        
        return HackSystem.getBufferString();
    }
}
```

## 测试类

```java

package org.jvm;

/**
 * 测试类，在此类中打印想要在页面看到的内容，System.out输出的内容会存在HackSystem的字节数组输出流中
 */
public class TestClass {
    public static void main(String[] args) {
        System.out.println("-----this is test class out println----");
    }
}
```

## 3、jsp页面

- index.jsp


```jsp
<%@ page import="java.lang.*" %>
<%@ page import="java.io.*" %>
<%@ page import="org.jvm.*" %>
<%
InputStream inputStream=new FileInputStream("/opt/TestClass.class");
            byte[] b=new byte[inputStream.available()];
            inputStream.read(b);
            inputStream.close();
            out.println(JavaClassExecuter.executer(b));
%>
```

## 替换步骤

1、将 ByteUtils ClassModifier HackSystem HotSwapClassloader JavaClassExecuter TestClass 这六个.java文件上传到服务器通过javac进行编译成.class 文件

2、将编译好的TestClass放在/opt目录中

3、在tomcat的项目位置的WEB-INF/classes/中新建org/jvm文件夹，再将编译好的 ByteUtils ClassModifier HackSystem HotSwapClassloader JavaClassExecuter 放在WEB-INF/classes/org/jvm中

4、将 index.jsp 放在项目中能访问到的位置，如项目的根路径中

5、在浏览器中访问jsp页面即可。

# 参考资料

《深入理解 jvm》

[java 手动实现远程执行功能（深入理解java虚拟机）](https://www.cnblogs.com/luobiao320/p/7651486.html)

[己动手实现远程执行功能(深入理解java虚拟机)](https://blog.csdn.net/gooaaee/article/details/81029461)

* any list
{:toc}