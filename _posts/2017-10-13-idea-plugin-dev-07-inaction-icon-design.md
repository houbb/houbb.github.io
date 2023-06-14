---
layout: post
title:  Idea Plugin Dev-07-添加设计对应的 icon
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---


# 记录一下svg图标的白嫖过程：

svg素材库： https://www.freepik.com/

该素材库下载 png 图片免费，但是下载 svg 是收费的，所以第一步，先下载png，一般都是512px

png -> svg
接下来需要一个转换器 https://www.pngtosvg.com/ 将png转为svg

编辑svg
最后一步，编辑svg，在线工具： https://c.runoob.com/more/svgeditor/

# idea 插件中引入

在 IntelliJ IDEA 插件开发中，可以自定义图标以用于自定义组件、操作、工具窗口等。以下是一种常见的方法来自定义图标：

1. 准备图标文件：
   首先，需要准备一个图标文件，可以是 PNG、SVG 或其他支持的图像格式。确保图标的尺寸和外观符合你的需求。

2. 将图标文件添加到项目中：
   将准备好的图标文件添加到插件项目的合适位置。通常，可以将图标文件放置在 `resources` 目录下或插件模块的源代码目录中。

3. 在代码中引用图标：

   在代码中引用自定义图标时，可以使用 `IconLoader` 类来加载图标文件。
   
   例如：
   ```java
   import com.intellij.openapi.util.IconLoader;
   import javax.swing.Icon;

   // 加载图标文件
   Icon icon = IconLoader.getIcon("/path/to/icon.png");

   // 将图标应用于组件
   myComponent.setIcon(icon);
   ```

4. 使用图标：
   将加载的图标应用于需要显示图标的组件或操作中。根据需要，可以将图标应用于按钮、菜单项、工具窗口等。

注意事项：
- 图标文件的路径可以是相对于插件项目的根目录或插件模块的源代码目录，也可以是资源文件夹下的相对路径。
- 在使用自定义图标时，请确保图标文件在插件构建过程中包含在插件 JAR 文件中。可以通过在插件的 `build.gradle` 文件中指定资源文件夹的方式来确保图标文件被正确打包。

通过自定义图标，可以为插件的不同部分提供个性化和专业化的外观，增强用户体验并使插件更加可识别和易于使用。

## 实战

- toolWindows 添加

```java
toolWindow.setIcon(IconUtils.getIcon());
```

这里没法指定大小，所以建议使用 16*16 的 icon 即可。

- JDialog 添加

```java
JDialog dialog = new JDialog();
dialog.setIconImage(IconUtils.getImage());
```

对应的工具类为：

```java
public class IconUtils {

    public static Icon getIcon() {
        // 加载图标文件
        return IconLoader.getIcon("/icon.png");
    }

    public static Image getImage() {
        ImageIcon img = new ImageIcon(IconUtils.class.getResource("/icon.png"));
        return img.getImage();
    }

}
```

# 参考资料

https://blog.csdn.net/wl1411956542/article/details/130241033

* any list
{:toc}
