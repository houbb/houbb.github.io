---
layout: post
title: UML-架构图
date:  2016-5-1 12:17:41 +0800
categories: [Design]
tags: [uml]
published: true
---

# UML

[UML](http://www.uml.org/) is the Unified Modeling Language.

> [UML zh_CN](www.uml.org.cn)

If you want to design your UML, [StarUML](http://staruml.io/) is an awesome choice.

- UseCase

![usecase](https://raw.githubusercontent.com/houbb/resource/master/img/tools/uml/2016-11-12-usecase.png)

- Class Relationship

![class relationship](https://raw.githubusercontent.com/houbb/resource/master/img/tools/uml/2016-11-12-class-relationship.png)


- Activity

![activity](https://raw.githubusercontent.com/houbb/resource/master/img/tools/uml/2016-11-12-ActivityDiagram.png)


- Sequence

![Sequence](https://raw.githubusercontent.com/houbb/resource/master/img/tools/uml/2016-11-12-sequence.png)


- State chart

![state chart](https://raw.githubusercontent.com/houbb/resource/master/img/tools/uml/2016-11-12-statechart.png)

- Component

![component](https://raw.githubusercontent.com/houbb/resource/master/img/tools/uml/2016-11-12-ComponentDiagram.png)

- Deployment

![deployment](https://raw.githubusercontent.com/houbb/resource/master/img/tools/uml/2016-11-12-DeploymentDiagram.png)

# Sequence

<uml>
    Download->Define:
    Define->Usage:
</uml>


The [js-sequence-diagrams](http://bramp.github.io/js-sequence-diagrams/) helps you turns text into UML sequence diagrams.

And the [flowchart](http://flowchart.js.org/)



- Download

```js-sequence-diagrams``` depends on [Raphaël](https://github.com/DmitryBaranovskiy/raphael) and [Underscore.js](http://underscorejs.org/)

- Define

```html
<uml>
    Title: UML Test
    A->B: Normal line
    B-->C: Dashed line
    C->>D: Open arrow
    D-->>A: Dashed open arrow
</uml>
```

- Usage

1、Import the js file

```html
<script src="raphael-min.js"></script>
<script src="underscore-min.js"></script>
<script src="sequence-diagram-min.js"></script>
```

2、Define this in jQuery:

```js
$("UML, uml").sequenceDiagram({theme: 'hand'});
```

and you can see:

<uml>
    Title: UML Test
    A->B: Normal line
    B-->C: Dashed line
    C->>D: Open arrow
    D-->>A: Dashed open arrow
</uml>

* any list
{:toc}