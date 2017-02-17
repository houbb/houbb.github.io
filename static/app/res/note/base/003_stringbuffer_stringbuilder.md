# StringBuilder

```java
/**
* <p>Instances of <code>StringBuilder</code> are not safe for
* use by multiple threads. If such synchronization is required then it is
* recommended that {@link java.lang.StringBuffer} be used.
*/
public final class StringBuilder
    extends AbstractStringBuilder
    implements java.io.Serializable, CharSequence
{}
```

 





# StringBuffer

A thread-safe, mutable sequence of characters.

很多方法都添加了 ```synchronized``` KEY_WORD  

```java
/** 
* As of  release JDK 5, this class has been supplemented with an equivalent
* class designed for use by a single thread, {@link StringBuilder}.  The
* <tt>StringBuilder</tt> class should generally be used in preference to
* this one, as it supports all of the same operations but it is faster, as
* it performs no synchronization.
*/
public final class StringBuffer
    extends AbstractStringBuilder
    implements java.io.Serializable, CharSequence
{}
```

