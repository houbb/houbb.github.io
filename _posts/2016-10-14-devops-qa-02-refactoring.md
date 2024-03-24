---
layout: post
title: qa-02-Refactoring
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, ci, qa, sh]
published: true
---


## If else

你可能认为太多的 if-else 语句显得不够优雅，想要解决这个问题。但是，什么才是优雅呢？

并非一定要为了重构而替换 if-else，只有在必要的时候才进行。

以下是一些替代 if-else 的技巧。

### two branches

code like this.

```java
if(condition) {
    //do sth1
} else {
    //do sth2
}
```

- can be replaced by

```java
if(condition) {
    //do sth1
    return;
}
//do sth2
```

<label class="label label-warning">Notice</label>

有些人认为在函数中多次使用返回语句并不是一种好的做法，您可以在这里阅读更多信息：[一个返回语句](http://www.theserverside.com/tip/A-return-to-Good-Code)。

- or can replaced by

```java
condition? doSth() : doAnother();
```

<label class="label label-warning">Notice</label>

这并不是一种通用的方式。总的来说，当有必要时，可以随心所欲地使用 if-else。
 
### many branches

- EnumColor.java

```java
/**
 * Created by 侯彬彬 on 2016/6/2.
 */
public enum EnumColor {
    BLACK("black"),
    WHITE("white"),
    GRAY("gray");

    private String colorName;
    EnumColor(String colorName) {
        this.colorName = colorName;
    }

    public String getColorName() {
        return colorName;
    }
}
```

- ColorInfo.java    by if,else

```java
public class ColorInfo {
    public void showInfo(String colorName) {
        if(colorName.equals(EnumColor.BLACK.getColorName())) {
            System.out.println("I'm afraid of black...");
        } else if(colorName.equals(EnumColor.WHITE.getColorName())) {
            System.out.println("I like white very much");
        } else if(colorName.equals(EnumColor.GRAY.getColorName())) {
            System.out.println("Gray is black to white..");
        } else {
            System.out.println("Never seen color!");
        }
    }
}
```

<label class="label label-success">switch</label>

你可以使用 switch-case 来解决这个问题，这个例子中的 switch(String) 是依赖于 JDK 1.7。

```java
public class ColorInfoEnum {
    public void showInfo(String colorName) {
        switch (colorName) {
            case "black":
                System.out.println("I'm afraid of black...");
                break;
            case "white":
                System.out.println("I like white very much");
                break;
            case "gray":
                System.out.println("Gray is black to white..");
                break;
            default:
                System.out.println("Never seen color!");
        }
    }
}
```

<label class="label label-success">Map</label>

```java
public class ColorInfoMap {
    public static final String UNKNOWN_COLOR_INFO = "Never seen color!";
    public static final Map<String, String> map = new HashMap();

    static {
        map.put(EnumColor.BLACK.getColorName(), "I'm afraid of black...");
        map.put(EnumColor.GRAY.getColorName(), "Gray is black to white..");
        map.put(EnumColor.WHITE.getColorName(), "I like white very much");
    }

    public void showInfo(String colorName) {
        String infoResult = map.get(colorName);
        String info = infoResult == null ? UNKNOWN_COLOR_INFO : infoResult;
        System.out.println(info);
    }
}
```

<label class="label label-success">polymorphic</label>

```java
public class ColorInfoPloy {
    public void showInfo(Color color) {
        color.showInfo();
    }

    interface Color {
        void showInfo();
    }
    class BlackColor implements Color {
        @Override
        public void showInfo() {
            System.out.println("I'm afraid of black...");
        }
    }

    class WhiteColor implements Color {
        @Override
        public void showInfo() {
            System.out.println("I like white very much");
        }
    }

    class GrayColor implements Color {
        @Override
        public void showInfo() {
            System.out.println("Gray is black to white..");
        }
    }
}
```

> ColorInfoTest.java

```java
public class ColorInfoTest extends TestCase{
    @Test
    public void testShowInfo() {
        ColorInfo colorInfo = new ColorInfo();

        colorInfo.showInfo("white");
        colorInfo.showInfo("black");
        colorInfo.showInfo("gray");
        colorInfo.showInfo("blue");
    }


    @Test
    public void testShowInfoMap() {
        ColorInfoMap colorInfoMap = new ColorInfoMap();

        colorInfoMap.showInfo("white");
        colorInfoMap.showInfo("black");
        colorInfoMap.showInfo("gray");
        colorInfoMap.showInfo("blue");
    }

    /**
     * @version jdk1.7
     */
    @Test
    public void testShowInfoEnum() {
        ColorInfoEnum colorInfoEnum = new ColorInfoEnum();
        
        colorInfoEnum.showInfo("white");
        colorInfoEnum.showInfo("black");
        colorInfoEnum.showInfo("gray");
        colorInfoEnum.showInfo("blue");
    }

    @Test
    public void testShowInfoPoly() {
        ColorInfoPloy colorInfoPloy = new ColorInfoPloy();

        colorInfoPloy.showInfo(colorInfoPloy.new BlackColor());
        colorInfoPloy.showInfo(colorInfoPloy.new WhiteColor());
        colorInfoPloy.showInfo(colorInfoPloy.new GrayColor());
    }
}
```

# chat

## 简单谈一谈代码重构

代码重构是指对现有代码进行修改、调整，以改进其结构、设计和可读性，而不改变其外部行为。

重构的目标是提高代码质量、可维护性和可扩展性，减少bug和增加代码的可理解性。

以下是一些关于代码重构的重要方面：

1. **目的：** 代码重构的主要目的是改进代码质量，使其更易于理解、修改和维护。这可能包括消除重复代码、提高性能、改进算法等。

2. **时机：** 代码重构并非总是必要的，而是在特定的时机进行。常见的触发因素包括添加新功能时、修复bug时、代码审查时，或者在团队决定进行技术债务管理时。

3. **步骤：** 重构通常是一个渐进的过程，可以通过小步骤逐渐实施，每一步都确保代码仍然能够正常工作。这有助于降低引入错误的风险。

4. **代码评审：** 在进行代码重构之前，最好通过代码评审来确保团队对于重构的目的和计划有共识。这有助于避免不必要的争议，并提供有益的反馈。

5. **工具支持：** 有许多工具可以辅助代码重构，例如IDE中的重构工具或第三方工具。这些工具可以自动执行一些常见的重构操作，减轻了手动修改代码的负担。

6. **测试：** 重构时需要确保代码的行为不会发生意外变化。因此，在进行重构之前，最好有一套充分的测试覆盖，以确保修改不会引入新的bug。

7. **模式：** 有一些常见的代码重构模式，如提取方法、内联方法、重命名变量等。了解这些模式可以帮助程序员更有效地进行重构。

8. **文档更新：** 随着代码的修改，相关的文档也应该进行更新，以确保文档与代码保持一致。

9. **学习机会：** 通过参与代码重构，团队成员有机会学习和理解代码库的不同部分。这有助于知识传递和团队的整体技术提升。

总体而言，代码重构是软件开发中不可或缺的一部分，它有助于保持代码库的健康状态，促使团队更好地适应变化和不断提高代码质量。

* any list
{:toc}