# String  为什么是 final



# 常量池的概念



为什么这样设计 ? 优缺点???




[知乎](https://www.zhihu.com/question/31345592)


作者：Jaskey Lam
链接：https://www.zhihu.com/question/31345592/answer/51549787
来源：知乎
著作权归作者所有，转载请联系作者获得授权。

String基本约定中最重要的一条是immutable。

的确声明String为final 和immutable是没有必然关系，但是假如String没有声明为final, 那么你的StringChilld就有可能是被复写为mutable的，这样就打破了成为共识的基本约定。

举个例子：一个方法可能本来接受String类型并返回其大写方式
public static String uppperString(String s){
        return s.toUpperCase();
}

你传入String 的s="test", 他不会修改字符串池中"test", 而是直接新建立一个实例"TEST"返回。但如果你的StringChild的toUpperCase()被你重写（override）为mutable的方式，然后你调用这个方法的时候传入的是StringChild实例， 那么整体(依赖于(过)方法uppperString的所有类)的行为就有可能出现错乱。

要知道，String是几乎每个类都会使用的类，特别是作为Hashmap之类的集合的key值时候，mutable的String有非常大的风险。而且一旦发生，非常难发现。

声明String为final一劳永逸。



# String 跟多细致的内容




