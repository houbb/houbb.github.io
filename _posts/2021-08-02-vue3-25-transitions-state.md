---
layout: post
title: VUE3-25-状态过渡
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, hello-world, vue-learn, sh]
published: true
---

# 状态过渡

Vue 的过渡系统提供了非常多简单的方法设置进入、离开和列表的动效。那么对于数据元素本身的动效呢，比如：

- 数字和运算

- 颜色的显示

- SVG 节点的位置

- 元素的大小和其他的 property

这些数据要么本身就以数值形式存储，要么可以转换为数值。

有了这些数值后，我们就可以结合 Vue 的响应性和组件系统，使用第三方库来实现切换元素的过渡状态。

# 状态动画与侦听器

通过侦听器我们能监听到任何数值 property 的数值更新。

可能听起来很抽象，所以让我们先来看看使用 GreenSock 一个例子：

```xml
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.2.4/gsap.min.js"></script>

<div id="animated-number-demo">
  <input v-model.number="number" type="number" step="20" />
  <p>${ animatedNumber }</p>
</div>
```

```js
const Demo = {
  data() {
    return {
      number: 0,
      tweenedNumber: 0
    }
  },
  computed: {
    animatedNumber() {
      return this.tweenedNumber.toFixed(0)
    }
  },
  watch: {
    number(newValue) {
      gsap.to(this.$data, { duration: 0.5, tweenedNumber: newValue })
    }
  }
}

Vue.createApp(Demo).mount('#animated-number-demo')
```

# 动态状态过渡

就像 Vue 的过渡组件一样，数据背后状态过渡会实时更新，这对于原型设计十分有用。

当你修改一些变量，即使是一个简单的 SVG 多边形也可实现很多难以想象的效果。

```xml
<div id="demo">
  <svg width="200" height="200">
    <polygon :points="points"></polygon>
    <circle cx="100" cy="100" r="90"></circle>
  </svg>
  <label>Sides: ${sides}  </label>
  <input type="range" min="3" max="500" v-model.number="sides" />
  <label>Minimum Radius: ${minRadius} %</label>
  <input type="range" min="0" max="90" v-model.number="minRadius" />
  <label>Update Interval:  ${updateInterval} milliseconds</label>
  <input type="range" min="10" max="2000" v-model.number="updateInterval" />
</div>
```

```css
body {
  margin: 30px;
}

svg {
  display: block;
}

polygon {
  fill: #41b883;
}

circle {
  fill: transparent;
  stroke: #35495e;
}

input[type="range"] {
  display: block;
  width: 100%;
  margin-bottom: 15px;
}
```

```js
const defaultSides = 10;
const stats = Array.apply(null, { length: defaultSides }).map(() => 100);

const Demo = {
  data() {
    return {
      stats: stats,
      points: generatePoints(stats),
      sides: defaultSides,
      minRadius: 50,
      interval: null,
      updateInterval: 500
    };
  },
  watch: {
    sides(newSides, oldSides) {
      var sidesDifference = newSides - oldSides;
      if (sidesDifference > 0) {
        for (var i = 1; i <= sidesDifference; i++) {
          this.stats.push(this.newRandomValue());
        }
      } else {
        var absoluteSidesDifference = Math.abs(sidesDifference);
        for (var i = 1; i <= absoluteSidesDifference; i++) {
          this.stats.shift();
        }
      }
    },
    stats(newStats) {
      gsap.to(this.$data, this.updateInterval / 1000, {
        points: generatePoints(newStats)
      });
    },
    updateInterval() {
      this.resetInterval();
    }
  },
  mounted() {
    this.resetInterval();
  },
  methods: {
    randomizeStats() {
      var vm = this;
      this.stats = this.stats.map(() => vm.newRandomValue());
    },
    newRandomValue() {
      return Math.ceil(this.minRadius + Math.random() * (100 - this.minRadius));
    },
    resetInterval() {
      var vm = this;
      clearInterval(this.interval);
      this.randomizeStats();
      this.interval = setInterval(() => {
        vm.randomizeStats();
      }, this.updateInterval);
    }
  }
};

Vue.createApp(Demo).mount("#demo");

function valueToPoint(value, index, total) {
  var x = 0;
  var y = -value * 0.9;
  var angle = ((Math.PI * 2) / total) * index;
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  var tx = x * cos - y * sin + 100;
  var ty = x * sin + y * cos + 100;
  return { x: tx, y: ty };
}

function generatePoints(stats) {
  var total = stats.length;
  return stats
    .map(function (stat, index) {
      var point = valueToPoint(stat, index, total);
      return point.x + "," + point.y;
    })
    .join(" ");
}
```

# 把过渡放到组件里

管理太多的状态过渡会很快的增加组件实例复杂性，幸好很多的动画可以提取到专用的子组件。

我们来将之前的示例改写一下：

```xml
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.2.4/gsap.min.js"></script>

<div id="app">
  <input v-model.number="firstNumber" type="number" step="20" /> +
  <input v-model.number="secondNumber" type="number" step="20" /> = ${result}
  <p>
    <animated-integer :value="firstNumber"></animated-integer> +
    <animated-integer :value="secondNumber"></animated-integer> =
    <animated-integer :value="result"></animated-integer>
  </p>
</div>
```

```js
const app = Vue.createApp({
  data() {
    return {
      firstNumber: 20,
      secondNumber: 40
    }
  },
  computed: {
    result() {
      return this.firstNumber + this.secondNumber
    }
  }
})

app.component('animated-integer', {
  template: '<span>{{ fullValue }}</span>',
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      tweeningValue: 0
    }
  },
  computed: {
    fullValue() {
      return Math.floor(this.tweeningValue)
    }
  },
  methods: {
    tween(newValue, oldValue) {
      gsap.to(this.$data, {
        duration: 0.5,
        tweeningValue: newValue,
        ease: 'sine'
      })
    }
  },
  watch: {
    value(newValue, oldValue) {
      this.tween(newValue, oldValue)
    }
  },
  mounted() {
    this.tween(this.value, 0)
  }
})

app.mount('#app')
```

我们能在组件中结合使用这一节讲到各种过渡策略和 Vue 内建的过渡系统。总之，对于完成各种过渡动效几乎没有阻碍。

你可以看到我们如何使用它进行数据可视化，物理效果，角色动画和交互，天空是极限。

# 赋予设计以生命

只要一个动画，就可以带来生命。

不幸的是，当设计师创建图标、logo 和吉祥物的时候，他们交付的通常都是图片或静态的 SVG。

所以，虽然 GitHub 的章鱼猫、Twitter 的小鸟以及其它许多 logo 类似于生灵，它们看上去实际上并不是活着的。

Vue 可以帮到你。因为 SVG 的本质是数据，我们只需要这些动物兴奋、思考或警戒的样例。然后 Vue 就可以辅助完成这几种状态之间的过渡动画，来制作你的欢迎页面、加载指示、以及更加带有情感的提示。

Sarah Drasner 展示了下面这个 demo，这个 demo 结合了时间和交互相关的状态改变：

# 参考资料

https://vue3js.cn/docs/zh/guide/transitions-state.html

* any list
{:toc}