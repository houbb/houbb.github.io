---
layout: post
title: Refactoring
date:  2016-6-2 13:21:08 +0800
categories: [Java]
tags: [refactoring]
published: false
---
* any list
{:toc}

## If else

You may think too many if else is not elegant, want to solve it. But what is elegant?

It's not necessary to replace if else just for refactoring. Do when it's necessary.

> Here are some skills to instead of if else.

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

Some people think it's not a good way to return times during our function, read it here [one return](http://www.theserverside.com/tip/A-return-to-Good-Code) 

- or can replaced by

```java
condition? doSth() : doAnother();
```

<label class="label label-warning">Notice</label>

This is not a generic way. In a word, use if else as you like when it'e necessary.
 
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

You can use switch case to solve it, this example switch(String) is depended on jdk1.7.

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

