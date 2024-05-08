---
layout: post
title: VUE3-19-动态组件 & 异步组件
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, hello-world, vue-learn, sh]
published: true
---

# 在动态组件上使用 keep-alive

我们之前曾经在一个多标签的界面中使用 is attribute 来切换不同的组件：

```xml
<component :is="currentTabComponent"></component>
```

当在这些组件之间切换的时候，你有时会想保持这些组件的状态，以避免反复重渲染导致的性能问题。

例如我们来展开说一说这个多标签界面：

```xml
<div id="dynamic-component-demo" class="demo">
  <button
     v-for="tab in tabs"
     :key="tab"
     :class="['tab-button', { active: currentTab === tab }]"
     @click="currentTab = tab"
   >
    ${ tab }
  </button>

  <component :is="currentTabComponent" class="tab"></component>
</div>
```

```js
const app = Vue.createApp({
  data() {
    return {
      currentTab: 'Home',
      tabs: ['Home', 'Posts', 'Archive']
    }
  },
  computed: {
    currentTabComponent() {
      return 'tab-' + this.currentTab.toLowerCase()
    }
  }
})

app.component('tab-home', {
  template: `<div class="demo-tab">Home component</div>`
})
app.component('tab-posts', {
  template: `<div class="dynamic-component-demo-posts-tab">
    <ul class="dynamic-component-demo-posts-sidebar">
      <li
        v-for="post in posts"
        :key="post.id"
        :class="{
          'dynamic-component-demo-active': post === selectedPost
        }"
        @click="selectedPost = post"
      >
        {{ post.title }}
      </li>
    </ul>
    <div class="dynamic-component-demo-post-container">
      <div v-if="selectedPost" class="dynamic-component-demo-post">
        <h3>{{ selectedPost.title }}</h3>
        <div v-html="selectedPost.content"></div>
      </div>
      <strong v-else>
        Click on a blog title to the left to view it.
      </strong>
    </div>
  </div>`,
    data() {
    return {
      posts: [
        {
          id: 1,
          title: 'Cat Ipsum',
          content:
            '<p>Dont wait for the storm to pass, dance in the rain kick up litter decide to want nothing to do with my owner today demand to be let outside at once, and expect owner to wait for me as i think about it cat cat moo moo lick ears lick paws so make meme, make cute face but lick the other cats. Kitty poochy chase imaginary bugs, but stand in front of the computer screen. Sweet beast cat dog hate mouse eat string barf pillow no baths hate everything stare at guinea pigs. My left donut is missing, as is my right loved it, hated it, loved it, hated it scoot butt on the rug cat not kitten around</p>'
        },
        {
          id: 2,
          title: 'Hipster Ipsum',
          content:
            '<p>Bushwick blue bottle scenester helvetica ugh, meh four loko. Put a bird on it lumbersexual franzen shabby chic, street art knausgaard trust fund shaman scenester live-edge mixtape taxidermy viral yuccie succulents. Keytar poke bicycle rights, crucifix street art neutra air plant PBR&B hoodie plaid venmo. Tilde swag art party fanny pack vinyl letterpress venmo jean shorts offal mumblecore. Vice blog gentrify mlkshk tattooed occupy snackwave, hoodie craft beer next level migas 8-bit chartreuse. Trust fund food truck drinking vinegar gochujang.</p>'
        },
        {
          id: 3,
          title: 'Cupcake Ipsum',
          content:
            '<p>Icing dessert soufflé lollipop chocolate bar sweet tart cake chupa chups. Soufflé marzipan jelly beans croissant toffee marzipan cupcake icing fruitcake. Muffin cake pudding soufflé wafer jelly bear claw sesame snaps marshmallow. Marzipan soufflé croissant lemon drops gingerbread sugar plum lemon drops apple pie gummies. Sweet roll donut oat cake toffee cake. Liquorice candy macaroon toffee cookie marzipan.</p>'
        }
      ],
      selectedPost: null
    }
  }
})
app.component('tab-archive', {
  template: `<div class="demo-tab">Archive component</div>`
})

app.mount('#dynamic-component-demo')
```

你会注意到，如果你选择了一篇文章，切换到 Archive 标签，然后再切换回 Posts，是不会继续展示你之前选择的文章的。

这是因为你每次切换新标签的时候，Vue 都创建了一个新的 currentTabComponent 实例。

重新创建动态组件的行为通常是非常有用的，但是在这个案例中，我们更希望那些标签的组件实例能够被在它们第一次被创建的时候缓存下来。

为了解决这个问题，我们可以用一个 `<keep-alive>` 元素将其动态组件包裹起来。

```xml
<!-- 失活的组件将会被缓存！-->
<keep-alive>
  <component :is="currentTabComponent"></component>
</keep-alive>
```

来看看修改后的结果：

```xml
<div id="dynamic-component-demo" class="demo">
  <button
     v-for="tab in tabs"
     :key="tab"
     :class="['tab-button', { active: currentTab === tab }]"
     @click="currentTab = tab"
   >
    {{ tab }}
  </button>

<!-- Inactive components will be cached! -->
<keep-alive>
  <component :is="currentTabComponent">     </component>
</keep-alive>
</div>
```

```js
const app = Vue.createApp({
  data() {
    return {
      currentTab: 'Home',
      tabs: ['Home', 'Posts', 'Archive']
    }
  },
  computed: {
    currentTabComponent() {
      return 'tab-' + this.currentTab.toLowerCase()
    }
  }
})

app.component('tab-home', {
  template: `<div class="demo-tab">Home component</div>`
})
app.component('tab-posts', {
  template: `<div class="dynamic-component-demo-posts-tab">
    <ul class="dynamic-component-demo-posts-sidebar">
      <li
        v-for="post in posts"
        :key="post.id"
        :class="{
          'dynamic-component-demo-active': post === selectedPost
        }"
        @click="selectedPost = post"
      >
        {{ post.title }}
      </li>
    </ul>
    <div class="dynamic-component-demo-post-container">
      <div v-if="selectedPost" class="dynamic-component-demo-post">
        <h3>{{ selectedPost.title }}</h3>
        <div v-html="selectedPost.content"></div>
      </div>
      <strong v-else>
        Click on a blog title to the left to view it.
      </strong>
    </div>
  </div>`,
    data() {
    return {
      posts: [
        {
          id: 1,
          title: 'Cat Ipsum',
          content:
            '<p>Dont wait for the storm to pass, dance in the rain kick up litter decide to want nothing to do with my owner today demand to be let outside at once, and expect owner to wait for me as i think about it cat cat moo moo lick ears lick paws so make meme, make cute face but lick the other cats. Kitty poochy chase imaginary bugs, but stand in front of the computer screen. Sweet beast cat dog hate mouse eat string barf pillow no baths hate everything stare at guinea pigs. My left donut is missing, as is my right loved it, hated it, loved it, hated it scoot butt on the rug cat not kitten around</p>'
        },
        {
          id: 2,
          title: 'Hipster Ipsum',
          content:
            '<p>Bushwick blue bottle scenester helvetica ugh, meh four loko. Put a bird on it lumbersexual franzen shabby chic, street art knausgaard trust fund shaman scenester live-edge mixtape taxidermy viral yuccie succulents. Keytar poke bicycle rights, crucifix street art neutra air plant PBR&B hoodie plaid venmo. Tilde swag art party fanny pack vinyl letterpress venmo jean shorts offal mumblecore. Vice blog gentrify mlkshk tattooed occupy snackwave, hoodie craft beer next level migas 8-bit chartreuse. Trust fund food truck drinking vinegar gochujang.</p>'
        },
        {
          id: 3,
          title: 'Cupcake Ipsum',
          content:
            '<p>Icing dessert soufflé lollipop chocolate bar sweet tart cake chupa chups. Soufflé marzipan jelly beans croissant toffee marzipan cupcake icing fruitcake. Muffin cake pudding soufflé wafer jelly bear claw sesame snaps marshmallow. Marzipan soufflé croissant lemon drops gingerbread sugar plum lemon drops apple pie gummies. Sweet roll donut oat cake toffee cake. Liquorice candy macaroon toffee cookie marzipan.</p>'
        }
      ],
      selectedPost: null
    }
  }
})
app.component('tab-archive', {
  template: `<div class="demo-tab">Archive component</div>`
})

app.mount('#dynamic-component-demo')
```

现在这个 Posts 标签保持了它的状态 (被选中的文章) 甚至当它未被渲染时也是如此。你可以在这个示例查阅到完整的代码。

你可以在 API 参考文档查阅更多关于 `<keep-alive>` 的细节。

# 异步组件

在大型应用中，我们可能需要将应用分割成小一些的代码块，并且只在需要的时候才从服务器加载一个模块。

为了简化，Vue 有一个 defineAsyncComponent 方法：

```js
const app = Vue.createApp({})

const AsyncComp = Vue.defineAsyncComponent(
  () =>
    new Promise((resolve, reject) => {
      resolve({
        template: '<div>I am async!</div>'
      })
    })
)

app.component('async-example', AsyncComp)
```

如你所见，此方法接受返回 Promise 的工厂函数。

从服务器检索组件定义后，应调用 Promise 的 resolve 回调。

你也可以调用 reject(reason)，以指示加载失败。

你也可以在工厂函数中返回一个 Promise，所以把 webpack 2 和 ES2015 语法加在一起，我们可以这样使用动态导入：

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
)

app.component('async-component', AsyncComp)
```

当在本地注册组件时，你也可以使用 defineAsyncComponent

```js
import { createApp, defineAsyncComponent } from 'vue'

createApp({
  // ...
  components: {
    AsyncComponent: defineAsyncComponent(() =>
      import('./components/AsyncComponent.vue')
    )
  }
})
```

## 与 Suspense 一起使用

异步组件在默认情况下是可挂起的。

这意味着如果它在父链中有一个 `<Suspense>`，它将被视为该 `<Suspense>` 的异步依赖。

在这种情况下，加载状态将由 `<Suspense>` 控制，组件自身的加载、错误、延迟和超时选项将被忽略。

异步组件可以选择退出 Suspense 控制，并通过在其选项中指定 suspensable:false，让组件始终控制自己的加载状态。

你可以在中查看可用选项的列表 API 参考

# 参考资料

https://vue3js.cn/docs/zh/guide/component-dynamic-async.html

* any list
{:toc}