# 序列化

我们有时候将一个 java 对象变成字节流的形式传出去或者从一个字节流中恢复成一个 java 对象,例如,要将 java 对象存储到硬盘或者传送给网络上的其他计算机,这个过程我们可 以自己写代码去把一个 java 对象变成某个格式的字节流再传输,但是,jre 本身就提供了这 种支持,我们可以调用 OutputStream 的 writeObject 方法来做,如果要让 java 帮我们做, 要被传输的对象必须实现 serializable 接口,这样,javac 编译时就会进行特殊处理,编译 的类才可以被 writeObject 方法操作,这就是所谓的序列化。需要被序列化的类必须实现 Serializable 接口,该接口是一个 mini 接口,其中没有需要实现的方法, implementsSerializable 只是为了标注该对象是可被序列化的。
例如,在 web 开发中,如果对象被保存在了 Session 中,tomcat 在重启时要把 Session 对 象序列化到硬盘,这个对象就必须实现 Serializable 接口。如果对象要经过分布式系统进行 网络传输或通过 rmi 等远程调用,这就需要在网络上传输对象,被传输的对象就必须实现 Serializable 接口。


dubbo  调用

